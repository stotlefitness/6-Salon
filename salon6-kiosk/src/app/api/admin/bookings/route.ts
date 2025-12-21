import { NextResponse } from "next/server";
import { requireStaffSession } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { DEFAULT_TIMEZONE, getTodayRange } from "@/lib/validation/bookings";

export async function GET(request: Request) {
  const staff = await requireStaffSession();
  const supabase = await createSupabaseServerClient();
  const url = new URL(request.url);
  const range = url.searchParams.get("range") ?? "today";
  // Keep “today” scoped to the salon timezone to avoid UTC boundary issues.
  const { start, end } = getTodayRange(DEFAULT_TIMEZONE);

  let query = supabase
    .from("bookings")
    .select(
      "id, salon_id, customer_id, stylist_id, service_id, start_time, end_time, status, checked_in_at"
    )
    .eq("salon_id", staff.salonId)
    .order("start_time", { ascending: true });

  if (range === "today") {
    query = query
      .gte("start_time", start.toISOString())
      .lte("start_time", end.toISOString());
  }

  if (staff.role === "stylist") {
    query = query.eq("stylist_id", staff.staffId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json(
      { error: "Failed to load bookings" },
      { status: 500 }
    );
  }

  const counts = (data ?? []).reduce<Record<string, number>>((acc, row) => {
    acc[row.status] = (acc[row.status] || 0) + 1;
    return acc;
  }, {});

  return NextResponse.json({ bookings: data, counts });
}

