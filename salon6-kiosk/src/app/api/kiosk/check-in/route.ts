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
  } catch (err) {
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
  const { start, end } = getTodayRange(DEFAULT_TIMEZONE);

  const { data: bookings, error: bookingsError } = await supabase
    .from("bookings")
    .select(BOOKING_SELECT_COLUMNS)
    .eq("salon_id", salonId)
    .eq("customer_id", customer.id)
    .gte("start_time", start.toISOString())
    .lte("start_time", end.toISOString())
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

  const { data: updatedRows, error: updateError } = await supabase
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

  const updated = updatedRows?.[0] as BookingRow | undefined;

  if (!updated) {
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

  const [enrichedBooking] = await enrichBookings(
    [updated as BookingRow],
    supabase
  );

  return NextResponse.json({
    status: "CHECKED_IN",
    booking: enrichedBooking,
  });
}