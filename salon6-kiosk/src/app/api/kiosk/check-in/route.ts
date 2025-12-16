import { NextResponse } from "next/server";
import {
  DEFAULT_TIMEZONE,
  checkInSchema,
  getTodayRange,
  normalizeLastName,
  normalizePhone,
} from "@/lib/validation/bookings";
import { createSupabaseServiceRoleClient } from "@/lib/supabase-server";

type BookingRow = {
  id: string;
  service_id: string;
  stylist_id: string | null;
  start_time: string;
  end_time: string | null;
  status: string;
  checked_in_at: string | null;
};

async function enrichBookings(
  bookings: BookingRow[],
  supabase: ReturnType<typeof createSupabaseServiceRoleClient>
) {
  const serviceIds = Array.from(
    new Set(bookings.map((b) => b.service_id).filter(Boolean))
  );
  const stylistIds = Array.from(
    new Set(bookings.map((b) => b.stylist_id).filter(Boolean)) as Set<string>
  );

  const [servicesRes, stylistsRes] = await Promise.all([
    serviceIds.length
      ? supabase.from("services").select("id, name").in("id", serviceIds)
      : Promise.resolve({ data: [], error: null }),
    stylistIds.length
      ? supabase
          .from("stylists")
          .select("id, first_name, last_name")
          .in("id", stylistIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  const servicesMap =
    servicesRes.data?.reduce<Record<string, string>>((acc, row) => {
      acc[row.id] = row.name;
      return acc;
    }, {}) ?? {};
  const stylistMap =
    stylistsRes.data?.reduce<Record<string, string>>((acc, row) => {
      acc[row.id] = `${row.first_name} ${row.last_name}`.trim();
      return acc;
    }, {}) ?? {};

  return bookings.map((b) => ({
    id: b.id,
    startTime: b.start_time,
    endTime: b.end_time,
    status: b.status,
    serviceName: servicesMap[b.service_id],
    stylistName: b.stylist_id ? stylistMap[b.stylist_id] : null,
    checkedInAt: b.checked_in_at,
  }));
}

export async function POST(request: Request) {
  const supabase = createSupabaseServiceRoleClient();

  const rawBody = await request.json().catch(() => null);
  const parsed = checkInSchema.safeParse(rawBody);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { salonId } = parsed.data;
  let normalizedPhone: string;
  let normalizedLastName: string;
  try {
    normalizedPhone = normalizePhone(parsed.data.phone);
    normalizedLastName = normalizeLastName(parsed.data.lastName);
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message ?? "Invalid phone" },
      { status: 400 }
    );
  }

  const { data: customers, error: customerError } = await supabase
    .from("customers")
    .select("id, first_name, last_name")
    .eq("salon_id", salonId)
    .eq("phone", normalizedPhone)
    .ilike("last_name", normalizedLastName);

  if (customerError) {
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
  }

  if (!customers || customers.length === 0) {
    return NextResponse.json({
      status: "NO_CUSTOMER",
      message: "We couldn't find a matching profile.",
    });
  }

  if (customers.length > 1) {
    return NextResponse.json({
      status: "NO_CUSTOMER",
      message: "Multiple matching customers found; please see the front desk.",
    });
  }

  const customer = customers[0];
  const { start, end } = getTodayRange(DEFAULT_TIMEZONE);

  const { data: bookings, error: bookingsError } = await supabase
    .from("bookings")
    .select(
      "id, service_id, stylist_id, start_time, end_time, status, checked_in_at"
    )
    .eq("salon_id", salonId)
    .eq("customer_id", customer.id)
    .gte("start_time", start.toISOString())
    .lte("start_time", end.toISOString())
    .in("status", ["scheduled", "checked_in"]);

  if (bookingsError) {
    return NextResponse.json(
      { error: "Could not load bookings" },
      { status: 500 }
    );
  }

  if (!bookings || bookings.length === 0) {
    return NextResponse.json({
      status: "NO_BOOKING_TODAY",
      message: "We don't see a booking for today.",
    });
  }

  const enriched = await enrichBookings(bookings as BookingRow[], supabase);

  if (bookings.length > 1) {
    return NextResponse.json({ status: "MULTIPLE", bookings: enriched });
  }

  const booking = bookings[0] as BookingRow;
  const { data: updated, error: updateError } = await supabase
    .from("bookings")
    .update({
      status: "checked_in",
      checked_in_at: new Date().toISOString(),
    })
    .eq("id", booking.id)
    .select(
      "id, service_id, stylist_id, start_time, end_time, status, checked_in_at"
    )
    .single();

  if (updateError || !updated) {
    return NextResponse.json(
      { error: "Failed to check in" },
      { status: 500 }
    );
  }

  const [enrichedBooking] = await enrichBookings([updated as BookingRow], supabase);

  return NextResponse.json({
    status: "CHECKED_IN",
    booking: enrichedBooking,
  });
}