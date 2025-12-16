import { NextResponse } from "next/server";

export async function POST() {
  // TODO: verify Stripe signature and handle payment events.
  return NextResponse.json({ status: "placeholder", scope: "stripe-webhook" });
}


