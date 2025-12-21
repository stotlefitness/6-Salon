import { NextResponse } from "next/server";
import { requireStaffSession } from "@/lib/auth";
import { fetchTodaySummary } from "@/lib/todaySummary";

export async function GET() {
  try {
    const staff = await requireStaffSession();
    const summary = await fetchTodaySummary(staff.salonId);
    return NextResponse.json(summary);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

