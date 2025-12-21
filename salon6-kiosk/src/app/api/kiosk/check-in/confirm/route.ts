import { NextResponse } from "next/server";
import {
  DEFAULT_TIMEZONE,
  confirmCheckInSchema,
  getTodayRange,
} from "@/lib/validation/bookings";
import { createSupabaseServiceRoleClient } from "@/lib/supabase-server";
import {
  BOOKING_SELECT_COLUMNS,
  BookingRow,
  enrichBookings,
  kioskError,
  transitionToCheckedIn,
} from "../helpers";

const GENERIC_FRONT_DESK = "Something went wrong. Please see the front desk.";

export async function POST(request: Request) {
  const supabase = createSupabaseServiceRoleClient();
  const rawBody = await request.json().catch(() => null);
  const parsed = confirmCheckInSchema.safeParse(rawBody);

  if (!parsed.success) {
    return kioskError(GENERIC_FRONT_DESK, 400);
  }

  const { salonId, bookingId } = parsed.data;

  // Keep “today” bound to the salon timezone to avoid UTC rollover issues.
  const { start, end } = getTodayRange(DEFAULT_TIMEZONE);
  const { data: booking, error } = await supabase
    .from("bookings")
    .select(`${BOOKING_SELECT_COLUMNS}, salon_id, customer_id`)
    .eq("id", bookingId)
    .eq("salon_id", salonId)
    .not("status", "in", "{completed,cancelled,no_show}")
    .in("status", ["scheduled", "checked_in"])
    .gte("start_time", start.toISOString())
    .lte("start_time", end.toISOString())
    .single();

  if (error || !booking) {
    return kioskError(GENERIC_FRONT_DESK, 404);
  }

  const bookingRow = booking as BookingRow;

  if (bookingRow.status === "checked_in") {
    const [enriched] = await enrichBookings([bookingRow], supabase);
    return NextResponse.json({
      status: "CHECKED_IN",
      booking: enriched,
    });
  }

  const { booking: updatedBooking, error: updateError } =
    await transitionToCheckedIn(booking.id, supabase);

  if (updateError) {
    return kioskError();
  }

  if (!updatedBooking) {
    return kioskError();
  }

  return NextResponse.json({
    status: "CHECKED_IN",
    booking: (await enrichBookings([updatedBooking], supabase))[0],
  });
}


