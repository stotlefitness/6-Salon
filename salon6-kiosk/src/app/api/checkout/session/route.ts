import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServiceRoleClient } from "@/lib/supabase-server";
import { getStripeClient } from "@/lib/stripe";
import { requireStaffSession } from "@/lib/auth";

const recentCalls = new Map<string, number>();
const RATE_LIMIT_WINDOW_MS = 2000; // simple double-click guard

const payloadSchema = z.object({
  checkoutSessionId: z.string().uuid(),
});

export async function POST(request: Request) {
  const supabase = createSupabaseServiceRoleClient();
  const stripe = getStripeClient();

  const staff = await requireStaffSession();
  const now = Date.now();
  const lastCall = recentCalls.get(staff.userId) ?? 0;
  if (now - lastCall < RATE_LIMIT_WINDOW_MS) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  recentCalls.set(staff.userId, now);

  const raw = await request.json().catch(() => null);
  const parsed = payloadSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { checkoutSessionId } = parsed.data;

  // DB-level guard: claim the right to create a Stripe session only if not yet created
  const { data: claimed, error: claimError } = await supabase
    .from("checkout_sessions")
    .update({ status: "creating", updated_at: new Date().toISOString() })
    .eq("id", checkoutSessionId)
    .eq("salon_id", staff.salonId)
    .is("stripe_checkout_session_id", null)
    .select("*")
    .single();

  const alreadyCreated =
    claimError?.code === "PGRST116" || (claimError && claimError.details?.includes("Results contain 0 rows"));

  let session = claimed;

  if (alreadyCreated || !session) {
    const { data: existingSession, error: sessionError } = await supabase
      .from("checkout_sessions")
      .select("*")
      .eq("id", checkoutSessionId)
      .eq("salon_id", staff.salonId)
      .single();
    if (sessionError || !existingSession) {
      return NextResponse.json({ error: "Checkout session not found" }, { status: 404 });
    }
    session = existingSession;
  }

  if (sessionError || !session) {
    return NextResponse.json({ error: "Checkout session not found" }, { status: 404 });
  }

  if (session.stripe_checkout_session_id) {
    const existing = await stripe.checkout.sessions.retrieve(session.stripe_checkout_session_id);
    if (existing?.status !== "expired" && existing?.url) {
      return NextResponse.json({ url: existing.url });
    }
    // expired or unusable: proceed to create a new session
  }

  const { data: items, error: itemsError } = await supabase
    .from("checkout_line_items")
    .select("*")
    .eq("checkout_session_id", checkoutSessionId);

  if (itemsError || !items || items.length === 0) {
    return NextResponse.json({ error: "No line items for checkout session" }, { status: 400 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const lineItems = items.map((item) => {
    const name =
      item.description ||
      (item.item_type === "service"
        ? "Service"
        : item.item_type === "product"
        ? "Product"
        : "Tip");

    return {
      price_data: {
        currency: "usd",
        product_data: { name },
        unit_amount: item.unit_price_cents,
      },
      quantity: item.quantity,
    };
  });

  try {
    const stripeSession = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        line_items: lineItems,
        success_url: `${appUrl}/kiosk/checkout?status=success`,
        cancel_url: `${appUrl}/kiosk/checkout?status=cancelled`,
        metadata: {
          checkout_session_id: checkoutSessionId,
          salon_id: session.salon_id,
          customer_id: session.customer_id,
        },
      },
      { idempotencyKey: checkoutSessionId }
    );

    // Persist Stripe session id
    await supabase
      .from("checkout_sessions")
      .update({
        stripe_checkout_session_id: stripeSession.id,
        status: "pending",
        last_stripe_event_id: null,
        last_stripe_event_type: null,
        last_stripe_event_at: null,
      })
      .eq("id", checkoutSessionId);

    return NextResponse.json({ url: stripeSession.url });
  } catch {
    return NextResponse.json(
      { error: "Failed to create Stripe session" },
      { status: 500 }
    );
  }
}
