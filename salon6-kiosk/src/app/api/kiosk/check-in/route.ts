import { NextResponse } from "next/server";

export async function POST() {
  // TODO: lookup booking by phone + last name or code, then mark as checked in.
  return NextResponse.json({ status: "placeholder", action: "check-in" });
}


