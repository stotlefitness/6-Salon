import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";
import type * as ModuleType from "../requireKioskContext";
import { createRequire } from "module";
const req = createRequire(import.meta.url);

const MODULE_PATH = "../requireKioskContext";

function loadModule(): typeof ModuleType {
  delete req.cache[req.resolve(MODULE_PATH)];
  return req(MODULE_PATH) as typeof ModuleType;
}

describe("requireKioskContext", () => {
  const envBackup = { ...process.env };

  beforeEach(() => {
    process.env = { ...envBackup };
    process.env.KIOSK_TOKEN = "secret1";
    process.env.KIOSK_TOKEN_2 = "secret2";
    process.env.KIOSK_SALON_ID = "salon-123";
  });

  it("throws on missing token", () => {
    const { requireKioskContext, UnauthorizedError } = loadModule();
    const req = new Request("http://localhost");
    assert.throws(() => requireKioskContext(req), UnauthorizedError);
  });

  it("throws on wrong token", () => {
    const { requireKioskContext, UnauthorizedError } = loadModule();
    const req = new Request("http://localhost", {
      headers: { "x-kiosk-token": "wrong" },
    });
    assert.throws(() => requireKioskContext(req), UnauthorizedError);
  });

  it("accepts primary token", () => {
    const { requireKioskContext } = loadModule();
    const req = new Request("http://localhost", {
      headers: { "x-kiosk-token": "secret1" },
    });
    const ctx = requireKioskContext(req);
    assert.equal(ctx.salonId, "salon-123");
  });

  it("accepts rotated token", () => {
    const { requireKioskContext } = loadModule();
    const req = new Request("http://localhost", {
      headers: { "x-kiosk-token": "secret2" },
    });
    const ctx = requireKioskContext(req);
    assert.equal(ctx.salonId, "salon-123");
  });
});
