import { NextResponse } from "next/server";
import {
  DEFAULT_TIMEZONE,
  checkInSchema,
  getTodayRange,
  normalizeLastName,
  normalizePhone,
} from "@/lib/validation/bookings";
import { createSupabaseServiceRoleClient } from "@/lib/supabase-server";
import {
  BOOKING_SELECT_COLUMNS,
  BookingRow,
  enrichBookings,
  kioskError,
  transitionToCheckedIn,
} from "./helpers";

const GENERIC_FRONT_DESK = "Something went wrong. Please see the front desk.";
const NO_CUSTOMER_MSG =
  "We couldn't find your profile. Please see the front desk.";
const NO_BOOKING_TODAY_MSG =
  "We couldn't find a booking for today. Please see the front desk.";

export async function POST(request: Request) {
  const supabase = createSupabaseServiceRoleClient();

  const rawBody = await request.json().catch(() => null);
  const parsed = checkInSchema.safeParse(rawBody);

  if (!parsed.success) {
    return kioskError(GENERIC_FRONT_DESK, 400);
  }

  const { salonId } = parsed.data;
  let normalizedPhone: string;
  let normalizedLastName: string;
  try {
    normalizedPhone = normalizePhone(parsed.data.phone);
    normalizedLastName = normalizeLastName(parsed.data.lastName);
  } catch {
    return kioskError(GENERIC_FRONT_DESK, 400);
  }

  const { data: customers, error: customerError } = await supabase
    .from("customers")
    .select("id, first_name, last_name")
    .eq("salon_id", salonId)
    .eq("phone_normalized", normalizedPhone)
    .ilike("last_name", normalizedLastName);

  if (customerError) {
    return kioskError();
  }

  if (!customers || customers.length === 0) {
    return NextResponse.json({
      status: "NO_CUSTOMER",
      message: NO_CUSTOMER_MSG,
    });
  }

  if (customers.length > 1) {
    return NextResponse.json({
      status: "NO_CUSTOMER",
      message: NO_CUSTOMER_MSG,
    });
  }

  const customer = customers[0];
  // Anchor “today” to the salon timezone to avoid UTC boundary surprises.
  const { start, end } = getTodayRange(DEFAULT_TIMEZONE);

  const { data: bookings, error: bookingsError } = await supabase
    .from("bookings")
    .select(BOOKING_SELECT_COLUMNS)
    .eq("salon_id", salonId)
    .eq("customer_id", customer.id)
    .gte("start_time", start.toISOString())
    .lte("start_time", end.toISOString())
    .not("status", "in", "{completed,cancelled,no_show}")
    .in("status", ["scheduled", "checked_in"]);

  if (bookingsError) {
    return kioskError();
  }

  if (!bookings || bookings.length === 0) {
    return NextResponse.json({
      status: "NO_BOOKING_TODAY",
      message: NO_BOOKING_TODAY_MSG,
    });
  }

  const enriched = await enrichBookings(bookings as BookingRow[], supabase);

  if (bookings.length > 1) {
    return NextResponse.json({ status: "MULTIPLE", bookings: enriched });
  }

  const booking = bookings[0] as BookingRow;
  if (booking.status === "checked_in") {
    return NextResponse.json({
      status: "CHECKED_IN",
      booking: enriched[0],
    });
  }

  const { booking: updated, error: updateError } = await transitionToCheckedIn(
    booking.id,
    supabase
  );

  if (updateError) {
    return kioskError();
  }

  if (!updated) {
    return kioskError();
  }

  const [enrichedBooking] = await enrichBookings(
    [updated as BookingRow],
    supabase
  );

  return NextResponse.json({
    status: "CHECKED_IN",
    booking: enrichedBooking,
  });
}

