import assert from "node:assert/strict";
import { describe, it } from "node:test";

type Session = { id: string; status: string; stripe_payment_intent_id?: string | null };
type Event = { event_id: string; type: string; checkout_session_id: string; payment_intent?: string | null };

function processEvent(
  sessions: Record<string, Session>,
  seenEvents: Set<string>,
  event: Event
) {
  if (seenEvents.has(event.event_id)) return;
  seenEvents.add(event.event_id);

  const session = sessions[event.checkout_session_id];
  if (!session) return;

  if (event.type === "checkout.session.completed") {
    if (session.status !== "completed") {
      session.status = "completed";
      session.stripe_payment_intent_id = event.payment_intent ?? null;
    }
  }

  if (event.type === "checkout.session.expired") {
    if (session.status !== "cancelled") {
      session.status = "cancelled";
    }
  }
}

describe("webhook idempotency", () => {
  it("ignores duplicate events", () => {
    const sessions: Record<string, Session> = {
      s1: { id: "s1", status: "pending" },
    };
    const seen = new Set<string>();
    const evt: Event = {
      event_id: "evt_1",
      type: "checkout.session.completed",
      checkout_session_id: "s1",
      payment_intent: "pi_1",
    };

    processEvent(sessions, seen, evt);
    processEvent(sessions, seen, evt); // duplicate

    assert.equal(sessions.s1.status, "completed");
    assert.equal(sessions.s1.stripe_payment_intent_id, "pi_1");
    assert.equal(seen.size, 1);
  });
});
