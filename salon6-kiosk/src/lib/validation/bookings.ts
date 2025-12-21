import { z } from "zod";

export const PHONE_MIN_DIGITS = 10;
export const DEFAULT_TIMEZONE = "America/Detroit";

export const checkInSchema = z.object({
  salonId: z.string().uuid(),
  phone: z.string().min(PHONE_MIN_DIGITS, "Phone is required"),
  lastName: z.string().min(1, "Last name is required"),
});

export const confirmCheckInSchema = z.object({
  salonId: z.string().uuid(),
  bookingId: z.string().uuid(),
});

export const bookingRequestSchema = z.object({
  serviceId: z.string(),
  stylistId: z.string().optional(),
  noPreference: z.boolean().optional(),
  startAt: z.string(), // ISO datetime
  durationMinutes: z.number().int().positive(),
  customer: z.object({
    firstName: z.string(),
    lastName: z.string(),
    phone: z.string(),
    email: z.string().email().optional(),
  }),
});

export type CheckInPayload = z.infer<typeof checkInSchema>;
export type ConfirmCheckInPayload = z.infer<typeof confirmCheckInSchema>;
export type BookingRequestPayload = z.infer<typeof bookingRequestSchema>;

export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length < PHONE_MIN_DIGITS) {
    throw new Error("Phone number too short");
  }
  if (digits.length === 10) {
    return `+1${digits}`;
  }
  if (digits.length === 11 && digits.startsWith("1")) {
    return `+${digits}`;
  }
  return `+${digits}`;
}

export function normalizeLastName(raw: string): string {
  return raw.trim().toLowerCase();
}

function parseOffsetMinutes(timeZone: string, at: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "shortOffset",
  }).formatToParts(at);

  const offsetPart = parts.find((p) => p.type === "timeZoneName")?.value;
  const match =
    offsetPart?.match(/GMT([+-]\d{1,2})(?::(\d{2}))?/) ??
    offsetPart?.match(/UTC([+-]\d{1,2})(?::(\d{2}))?/);

  if (!match) return 0;
  const hours = Number(match[1]);
  const minutes = match[2] ? Number(match[2]) : 0;
  return hours * 60 + (hours >= 0 ? minutes : -minutes);
}

export function getTodayRange(
  timeZone: string = DEFAULT_TIMEZONE,
  reference: Date = new Date()
) {
  const now = reference;
  const dateParts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .formatToParts(now)
    .reduce<Record<string, string>>((acc, part) => {
      if (part.type !== "literal") acc[part.type] = part.value;
      return acc;
    }, {});

  const year = Number(dateParts.year);
  const month = Number(dateParts.month) - 1; // zero-based
  const day = Number(dateParts.day);

  const offsetMinutes = parseOffsetMinutes(timeZone, now);
  const startUtc = Date.UTC(year, month, day, 0, 0, 0) - offsetMinutes * 60 * 1000;
  const endUtc =
    Date.UTC(year, month, day, 23, 59, 59, 999) - offsetMinutes * 60 * 1000;

  return {
    start: new Date(startUtc),
    end: new Date(endUtc),
  };
}

