import { NextResponse } from "next/server";

export async function GET() {
  // TODO: return daily/weekly summaries for bookings and revenue split.
  return NextResponse.json({ status: "placeholder", scope: "admin-reports" });
}


