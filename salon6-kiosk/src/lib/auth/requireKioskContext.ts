import { timingSafeEqual } from "crypto";

export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized kiosk") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export type KioskContext = {
  salonId: string;
};

function safeCompare(a: string, b: string) {
  if (a.length !== b.length) return false;
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  return timingSafeEqual(aBuf, bBuf);
}

export function requireKioskContext(req: Request): KioskContext {
  const tokenHeader =
    req.headers.get("x-kiosk-token") ||
    req.headers.get("x-kiosk-auth") ||
    req.headers.get("authorization");

  const expectedToken = process.env.KIOSK_TOKEN ?? "";
  const rotatedToken = process.env.KIOSK_TOKEN_2 ?? "";
  const salonId =
    process.env.KIOSK_SALON_ID ||
    process.env.KIOSK_LOCATION_ID ||
    process.env.NEXT_PUBLIC_KIOSK_SALON_ID ||
    process.env.NEXT_PUBLIC_KIOSK_LOCATION_ID ||
    "";

  if (!expectedToken || !salonId) {
    throw new UnauthorizedError("Kiosk not configured");
  }

  const cleanedHeader = tokenHeader?.replace(/^Bearer\s+/i, "").trim() ?? "";

  const valid =
    (expectedToken && safeCompare(cleanedHeader, expectedToken)) ||
    (rotatedToken && safeCompare(cleanedHeader, rotatedToken));

  if (!valid) {
    throw new UnauthorizedError("Unauthorized kiosk");
  }

  return { salonId };
}
