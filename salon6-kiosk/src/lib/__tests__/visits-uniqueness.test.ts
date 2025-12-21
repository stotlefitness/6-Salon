import assert from "node:assert/strict";
import { describe, it } from "node:test";

type Visit = { id: string; booking_id: string | null };

function canInsertVisit(existing: Visit[], candidate: Visit): boolean {
  if (candidate.booking_id === null) return true;
  return !existing.some((v) => v.booking_id === candidate.booking_id && v.booking_id !== null);
}

describe("visits partial uniqueness", () => {
  it("allows multiple visits when booking_id is null", () => {
    const existing: Visit[] = [{ id: "v1", booking_id: null }];
    const next: Visit = { id: "v2", booking_id: null };
    assert.equal(canInsertVisit(existing, next), true);
  });

  it("rejects multiple visits for the same booking_id", () => {
    const existing: Visit[] = [{ id: "v1", booking_id: "b1" }];
    const next: Visit = { id: "v2", booking_id: "b1" };
    assert.equal(canInsertVisit(existing, next), false);
  });
});
