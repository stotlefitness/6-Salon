import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { BodySchema, buildInsertPayload } from "../route";
import { UpdateSchema, isSameSalon } from "../[id]/route";

describe("booking-requests schemas", () => {
  it("accepts a minimal valid kiosk payload", () => {
    const result = BodySchema.safeParse({
      name: "Alex Guest",
      phone: "248-555-1212",
      preferredWindow: "Next week afternoons",
    });
    assert.equal(result.success, true);
  });

  it("rejects missing required fields", () => {
    const result = BodySchema.safeParse({
      phone: "248-555-1212",
      preferredWindow: "",
    });
    assert.equal(result.success, false);
  });

  it("builds insert payload with salon_id override and normalized phone", () => {
    const base = {
      name: "Taylor",
      phone: "(248) 555-0000",
      email: null,
      serviceInterest: null,
      preferredWindow: "Soon",
      notes: null,
    };
    const payload = buildInsertPayload(base, "salon-123");
    assert.equal(payload.salon_id, "salon-123");
    assert.equal(payload.phone, "+12485550000");
    assert.equal(payload.request_source, "kiosk");
    assert.equal(payload.status, "new");
  });

  it("accepts staff patch payload with status and staff note", () => {
    const result = UpdateSchema.safeParse({
      status: "in_progress",
      staffNote: "Called guest, scheduling in progress",
    });
    assert.equal(result.success, true);
  });

  it("rejects invalid status", () => {
    const result = UpdateSchema.safeParse({
      status: "not_a_status",
    });
    assert.equal(result.success, false);
  });

  it("forbids cross-salon updates", () => {
    assert.equal(isSameSalon("salon-a", "salon-b"), false);
  });

  it("allows same-salon updates", () => {
    assert.equal(isSameSalon("salon-a", "salon-a"), true);
  });
});
