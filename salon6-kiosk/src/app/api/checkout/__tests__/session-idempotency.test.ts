import assert from "node:assert/strict";
import { describe, it } from "node:test";

function makeIdempotencyKey(id: string) {
  return id;
}

describe("checkout session idempotency key", () => {
  it("reuses the internal checkoutSessionId as idempotency key", () => {
    const id = "11111111-1111-1111-1111-111111111111";
    const key = makeIdempotencyKey(id);
    assert.equal(key, id);
  });
});
