import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DEFAULT_TIMEZONE,
  getTodayRange,
  normalizeLastName,
  normalizePhone,
} from "../bookings";

describe("normalizePhone", () => {
  it("normalizes different phone formats to +1 E.164 style", () => {
    const expected = "+12485551234";
    assert.equal(normalizePhone("(248) 555-1234"), expected);
    assert.equal(normalizePhone("248-555-1234"), expected);
    assert.equal(normalizePhone("12485551234"), "+12485551234");
    assert.equal(normalizePhone("248.555.1234"), expected);
    assert.equal(normalizePhone("+1 (248) 555 1234"), expected);
  });

  it("throws on too-short numbers", () => {
    assert.throws(() => normalizePhone("12345"), /too short/i);
  });
});

describe("normalizeLastName", () => {
  it("lowercases and trims whitespace", () => {
    assert.equal(normalizeLastName("  Valdez "), "valdez");
  });

  it("handles uppercase input", () => {
    assert.equal(normalizeLastName("VALDEZ"), "valdez");
  });
});

describe("getTodayRange", () => {
  it("anchors to the salon timezone day boundary, not UTC", () => {
    const reference = new Date("2024-12-31T23:30:00Z"); // 18:30 in Detroit (-05)
    const { start, end } = getTodayRange(DEFAULT_TIMEZONE, reference);

    assert.equal(start.toISOString(), "2024-12-31T05:00:00.000Z");
    assert.equal(end.toISOString(), "2025-01-01T04:59:59.999Z");
  });
});


