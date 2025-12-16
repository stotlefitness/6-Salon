import { NextResponse } from "next/server";

export async function GET() {
  // TODO: return bookings with statuses for admin dashboard.
  return NextResponse.json({ status: "placeholder", scope: "admin-bookings" });
}


