import { NextResponse } from "next/server";
import { checkInSchema, normalizeLastName, normalizePhone } from "@/lib/validation/bookings";
import { createSupabaseServiceRoleClient } from "@/lib/supabase-server";
import { findOrCreateCustomer, kioskError, recordVisit } from "./helpers";

const GENERIC_FRONT_DESK = "Something went wrong. Please see the front desk.";

export async function POST(request: Request) {
  const supabase = createSupabaseServiceRoleClient();

  const rawBody = await request.json().catch(() => null);
  const parsed = checkInSchema.safeParse(rawBody);

  if (!parsed.success) {
    return kioskError(GENERIC_FRONT_DESK, 400);
  }

  const { salonId, firstName, lastName, phone } = parsed.data;

  let normalizedPhone: string;
  let normalizedLastName: string;
  try {
    normalizedPhone = normalizePhone(phone);
    normalizedLastName = normalizeLastName(lastName);
  } catch {
    return kioskError(GENERIC_FRONT_DESK, 400);
  }

  const { customerId, error: customerError } = await findOrCreateCustomer({
    salonId,
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    normalizedLastName,
    normalizedPhone,
    supabase,
  });

  if (customerError) {
    return kioskError();
  }

  const { visit, error: visitError } = await recordVisit({
    salonId,
    customerId,
    supabase,
  });

  if (visitError || !visit) {
    return kioskError();
  }

  return NextResponse.json({
    success: true,
    visitId: visit.id,
    checkedInAt: visit.checked_in_at,
  });
}

