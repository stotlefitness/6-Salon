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

  const { start, end } = getTodayRange(DEFAULT_TIMEZONE);
  const { data: booking, error } = await supabase
    .from("bookings")
    .select(`${BOOKING_SELECT_COLUMNS}, salon_id, customer_id`)
    .eq("id", bookingId)
    .eq("salon_id", salonId)
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

  const { data: updated, error: updateError } = await supabase
    .from("bookings")
    .update({
      status: "checked_in",
      checked_in_at: new Date().toISOString(),
    })
    .eq("id", booking.id)
    .eq("status", "scheduled")
    .select(BOOKING_SELECT_COLUMNS);

  if (updateError) {
    return kioskError();
  }

  const updatedBooking = (updated?.[0] as BookingRow) ?? null;

  if (!updatedBooking) {
    const { data: latest, error: latestError } = await supabase
      .from("bookings")
      .select(BOOKING_SELECT_COLUMNS)
      .eq("id", booking.id)
      .single();

    if (!latestError && latest?.status === "checked_in") {
      const [alreadyCheckedIn] = await enrichBookings(
        [latest as BookingRow],
        supabase
      );
      return NextResponse.json({
        status: "CHECKED_IN",
        booking: alreadyCheckedIn,
      });
    }

    return kioskError();
  }

  return NextResponse.json({
    status: "CHECKED_IN",
    booking: (await enrichBookings([updatedBooking], supabase))[0],
  });
}
