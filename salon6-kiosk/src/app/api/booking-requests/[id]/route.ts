import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireStaffSession } from "@/lib/auth";
import { createSupabaseServiceRoleClient } from "@/lib/supabase-server";

const StatusEnum = z.enum(["new", "in_progress", "scheduled_in_phorest", "closed"]);

export const UpdateSchema = z.object({
  status: StatusEnum.optional(),
  staffNote: z.string().optional().nullable(),
  phorestAppointmentId: z.string().optional().nullable(),
});

const logBookingRequest = (entry: Record<string, unknown>) => {
  console.log(
    JSON.stringify({
      ctx: "booking_requests",
      ...entry,
    })
  );
};

export async function PATCH(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const staff = await requireStaffSession();
  const supabase = createSupabaseServiceRoleClient();

  let body: unknown;
  try {
    body = await _req.json();
  } catch {
    body = null;
  }
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { id: requestId } = await context.params;

  const { data: existing, error: fetchError } = await supabase
    .from("booking_requests")
    .select("id, salon_id, status")
    .eq("id", requestId)
    .maybeSingle();

  if (fetchError || !existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!isSameSalon(existing.salon_id, staff.salonId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updates: Record<string, unknown> = {};
  if (parsed.data.status) updates.status = parsed.data.status;
  if (parsed.data.staffNote !== undefined) updates.staff_note = parsed.data.staffNote ?? null;
  if (parsed.data.phorestAppointmentId !== undefined)
    updates.phorest_appointment_id = parsed.data.phorestAppointmentId ?? null;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No changes supplied" }, { status: 400 });
  }

  const { data: updated, error: updateError } = await supabase
    .from("booking_requests")
    .update(updates)
    .eq("id", requestId)
    .eq("salon_id", staff.salonId)
    .select("id, status, staff_note, phorest_appointment_id, updated_at")
    .single();

  if (updateError || !updated) {
    logBookingRequest({
      event: "update",
      booking_request_id: requestId,
      salon_id: staff.salonId,
      from_status: existing.status,
      to_status: parsed.data.status ?? existing.status,
      result: "failure",
      reason: updateError?.message ?? "update_failed",
    });
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }

  logBookingRequest({
    event: "update",
    booking_request_id: requestId,
    salon_id: staff.salonId,
    from_status: existing.status,
    to_status: parsed.data.status ?? existing.status,
    result: "success",
  });

  return NextResponse.json({ bookingRequest: updated });
}

export function isSameSalon(existingSalonId: string, staffSalonId: string) {
  return existingSalonId === staffSalonId;
}

