import { NextResponse } from "next/server";
import { requireStaffSession } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function GET() {
  const staff = await requireStaffSession();

  if (staff.role !== "owner" && staff.role !== "manager") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = await createSupabaseServerClient();
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const { data, error } = await supabase
    .from("bookings")
    .select("status")
    .eq("salon_id", staff.salonId)
    .gte("start_time", startOfDay.toISOString())
    .lte("start_time", endOfDay.toISOString());

  if (error) {
    return NextResponse.json(
      { error: "Failed to load reports" },
      { status: 500 }
    );
  }

  const summary = data?.reduce<Record<string, number>>((acc, row) => {
    acc[row.status] = (acc[row.status] || 0) + 1;
    return acc;
  }, {}) ?? {};

  return NextResponse.json({
    range: {
      start: startOfDay.toISOString(),
      end: endOfDay.toISOString(),
    },
    totals: summary,
  });
}