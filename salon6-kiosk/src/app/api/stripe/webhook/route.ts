import { NextResponse } from "next/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase-server";
import { getStripeClient } from "@/lib/stripe";

const logWebhook = (entry: Record<string, unknown>) => {
  console.log(
    JSON.stringify({
      ctx: "stripe_webhook",
      ...entry,
    })
  );
};

export const runtime = "nodejs";

function getWebhookSecret() {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("Missing STRIPE_WEBHOOK_SECRET");
  }
  return secret;
}

export async function POST(request: Request) {
  const sig = request.headers.get("stripe-signature");
  if (!sig) {
    logWebhook({ phase: "missing_signature" });
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  const body = await request.text();
  const stripe = getStripeClient();
  const webhookSecret = getWebhookSecret();

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch {
    logWebhook({ phase: "invalid_signature" });
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createSupabaseServiceRoleClient();

  // Idempotency: record event_id; if already processed, exit early
  const sessionObject = event.data?.object as
    | {
        id?: string;
        payment_intent?: string;
        metadata?: { checkout_session_id?: string; salon_id?: string };
      }
    | undefined;
  const checkoutSessionId = sessionObject?.id || null;
  const internalCheckoutId = sessionObject?.metadata?.checkout_session_id || null;
  const eventSalonId = sessionObject?.metadata?.salon_id || null;

  logWebhook({
    phase: "received",
    stripe_event_id: event.id,
    event_type: event.type,
    stripe_session_id: checkoutSessionId,
    internal_checkout_session_id: internalCheckoutId,
    deduped: false,
  });

  const { data: existingEvent } = await supabase
    .from("stripe_events")
    .select("event_id")
    .eq("event_id", event.id)
    .maybeSingle();

  if (existingEvent) {
    logWebhook({
      phase: "duplicate",
      stripe_event_id: event.id,
      event_type: event.type,
      stripe_session_id: checkoutSessionId,
      internal_checkout_session_id: internalCheckoutId,
      deduped: true,
    });
    return NextResponse.json({ received: true });
  }

  const { error: eventInsertError } = await supabase.from("stripe_events").insert({
    event_id: event.id,
    type: event.type,
    checkout_session_id: checkoutSessionId,
  });

  if (eventInsertError) {
    logWebhook({
      phase: "event_log_failed",
      stripe_event_id: event.id,
      error: eventInsertError.message,
    });
    return NextResponse.json({ error: "Failed to log event" }, { status: 500 });
  }

  // Resolve internal session either via metadata or stripe_checkout_session_id
  let sessionRow = null as { id: string; salon_id: string; status: string } | null;
  if (internalCheckoutId) {
    const { data } = await supabase
      .from("checkout_sessions")
      .select("id, salon_id, status")
      .eq("id", internalCheckoutId)
      .maybeSingle();
    sessionRow = data;
  } else if (checkoutSessionId) {
    const { data } = await supabase
      .from("checkout_sessions")
      .select("id, salon_id, status")
      .eq("stripe_checkout_session_id", checkoutSessionId)
      .maybeSingle();
    sessionRow = data;
  }

  if (!sessionRow) {
    logWebhook({
      phase: "session_not_found",
      stripe_event_id: event.id,
      stripe_session_id: checkoutSessionId,
      internal_checkout_session_id: internalCheckoutId,
    });
    return NextResponse.json({ received: true });
  }

  if (eventSalonId && sessionRow.salon_id !== eventSalonId) {
    logWebhook({
      phase: "salon_mismatch",
      stripe_event_id: event.id,
      checkout_session_id: sessionRow.id,
      event_salon_id: eventSalonId,
      session_salon_id: sessionRow.salon_id,
    });
    return NextResponse.json({ error: "salon mismatch" }, { status: 403 });
  }

  const allowTransition = (current: string, next: string) => {
    if (current === next) return false;
    const order = ["pending", "completed", "expired", "cancelled", "failed"];
    const currentIdx = order.indexOf(current);
    const nextIdx = order.indexOf(next);
    if (currentIdx === -1 || nextIdx === -1) return true;
    if (current === "completed" && next !== "completed") return false;
    return nextIdx >= currentIdx;
  };

  const updateStatus = async (newStatus: string, paymentIntentId?: string | null) => {
    if (!allowTransition(sessionRow!.status, newStatus)) return;
    const updates: Record<string, unknown> = {
      status: newStatus,
      last_stripe_event_id: event.id,
      last_stripe_event_type: event.type,
      last_stripe_event_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    if (paymentIntentId) {
      updates["stripe_payment_intent_id"] = paymentIntentId;
    }
    if (newStatus === "completed") {
      updates["completed_at"] = new Date().toISOString();
    }

    const { data } = await supabase
      .from("checkout_sessions")
      .update(updates)
      .eq("id", sessionRow!.id)
      .neq("status", newStatus)
      .select("status")
      .maybeSingle();

    if (data?.status) {
      sessionRow = { ...sessionRow!, status: data.status };
      logWebhook({
        phase: "status_update",
        stripe_event_id: event.id,
        checkout_session_id: sessionRow.id,
        resulting_status: data.status,
        event_type: event.type,
      });
    }
  };

  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const pi = sessionObject?.payment_intent ?? null;
      await updateStatus("completed", pi ? String(pi) : null);
      break;
    }
    case "checkout.session.expired":
      await updateStatus("expired", null);
      break;
    case "checkout.session.async_payment_failed":
      await updateStatus("failed", null);
      break;
    default:
      // ignore other events
      break;
  }

  return NextResponse.json({ received: true });
}