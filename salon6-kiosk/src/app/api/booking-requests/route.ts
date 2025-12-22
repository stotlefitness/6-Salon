import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServiceRoleClient } from "@/lib/supabase-server";
import { normalizePhone } from "@/lib/validation/bookings";
import { requireKioskContext } from "@/lib/auth/requireKioskContext";

export const BodySchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(7),
  email: z.string().email().optional().nullable(),
  serviceInterest: z.string().optional().nullable(),
  preferredWindow: z.string().min(1),
  notes: z.string().optional().nullable(),
});

const logBookingRequest = (entry: Record<string, unknown>) => {
  console.log(
    JSON.stringify({
      ctx: "booking_requests",
      ...entry,
    })
  );
};

export async function POST(req: Request) {
  const parsed = BodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    logBookingRequest({ event: "create", result: "invalid_payload" });
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  let kiosk;
  try {
    kiosk = requireKioskContext(req);
  } catch (err) {
    const message = (err as Error).message || "Unauthorized";
    const status = message === "Unauthorized kiosk" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
  const supabase = createSupabaseServiceRoleClient();

  let payload;
  try {
    payload = buildInsertPayload(parsed.data, kiosk.salonId);
  } catch {
    logBookingRequest({
      event: "create",
      salon_id: kiosk.salonId,
      result: "invalid_phone",
    });
    return NextResponse.json({ error: "Invalid phone" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("booking_requests")
    .insert(payload)
    .select("id, status, created_at")
    .single();

  if (error || !data) {
    logBookingRequest({
      event: "create",
      salon_id: kiosk.salonId,
      result: "failure",
      reason: error?.message ?? "insert_failed",
    });
    return NextResponse.json({ error: "Failed to create request" }, { status: 500 });
  }

  logBookingRequest({
    event: "create",
    booking_request_id: data.id,
    salon_id: kiosk.salonId,
    status: data.status,
    result: "success",
  });

  return NextResponse.json({ bookingRequest: data }, { status: 201 });
}

export function buildInsertPayload(body: z.infer<typeof BodySchema>, salonId: string) {
  const phone = normalizePhone(body.phone);
  return {
    salon_id: salonId,
    name: body.name,
    phone,
    email: body.email ?? null,
    service_interest: body.serviceInterest ?? null,
    preferred_window: body.preferredWindow,
    notes: body.notes ?? null,
    request_source: "kiosk",
    status: "new",
  };
}

