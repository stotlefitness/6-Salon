import { NextResponse } from "next/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase-server";

export type BookingRow = {
  id: string;
  service_id: string;
  stylist_id: string | null;
  start_time: string;
  end_time: string | null;
  status: string;
  checked_in_at: string | null;
};

export const BOOKING_SELECT_COLUMNS =
  "id, service_id, stylist_id, start_time, end_time, status, checked_in_at";

export function kioskError(
  message = "Something went wrong. Please see the front desk.",
  status = 500
) {
  return NextResponse.json({ error: message }, { status });
}

export async function enrichBookings(
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

export async function transitionToCheckedIn(
  bookingId: string,
  supabase: ReturnType<typeof createSupabaseServiceRoleClient>
) {
  const { data: updatedRows, error: updateError } = await supabase
    .from("bookings")
    .update({
      status: "checked_in",
      checked_in_at: new Date().toISOString(),
    })
    .eq("id", bookingId)
    .eq("status", "scheduled")
    .select(BOOKING_SELECT_COLUMNS);

  if (updateError) {
    return { booking: null, error: updateError };
  }

  const updated = updatedRows?.[0] as BookingRow | undefined;
  if (updated) {
    return { booking: updated, error: null };
  }

  // Race case: someone else checked in first; return the checked-in row if present.
  const { data: latest, error: latestError } = await supabase
    .from("bookings")
    .select(BOOKING_SELECT_COLUMNS)
    .eq("id", bookingId)
    .single();

  if (!latestError && latest?.status === "checked_in") {
    return { booking: latest as BookingRow, error: null };
  }

  return { booking: null, error: latestError ?? null };
}


