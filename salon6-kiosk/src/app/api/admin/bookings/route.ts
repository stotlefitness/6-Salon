import { NextResponse } from "next/server";
import { requireStaffSession } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function GET() {
  const staff = await requireStaffSession();
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("bookings")
    .select(
      "id, salon_id, customer_id, stylist_id, service_id, start_time, end_time, status, checked_in_at"
    )
    .eq("salon_id", staff.salonId)
    .order("start_time", { ascending: true })
    .limit(25);

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

  return NextResponse.json({ bookings: data });
}