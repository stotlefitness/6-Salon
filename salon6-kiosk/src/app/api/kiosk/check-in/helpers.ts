import { NextResponse } from "next/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase-server";

type SupabaseClient = ReturnType<typeof createSupabaseServiceRoleClient>;

export function kioskError(
  message = "Something went wrong. Please see the front desk.",
  status = 500
) {
  return NextResponse.json({ error: message }, { status });
}

export async function findOrCreateCustomer(params: {
  salonId: string;
  firstName: string;
  lastName: string;
  normalizedLastName: string;
  normalizedPhone: string;
  supabase: SupabaseClient;
}) {
  const { salonId, firstName, lastName, normalizedLastName, normalizedPhone, supabase } =
    params;

  const { data: existing, error: lookupError } = await supabase
    .from("customers")
    .select("id, first_name, last_name")
    .eq("salon_id", salonId)
    .eq("phone_normalized", normalizedPhone)
    .ilike("last_name", normalizedLastName)
    .limit(1)
    .maybeSingle();

  if (lookupError) {
    return { customerId: null, error: lookupError };
  }

  if (existing?.id) {
    return { customerId: existing.id, error: null };
  }

  const { data: inserted, error: insertError } = await supabase
    .from("customers")
    .insert({
      salon_id: salonId,
      first_name: firstName,
      last_name: lastName,
      phone: normalizedPhone,
      phone_normalized: normalizedPhone,
    })
    .select("id")
    .single();

  if (insertError) {
    return { customerId: null, error: insertError };
  }

  return { customerId: inserted?.id ?? null, error: null };
}

export async function recordVisit(params: {
  salonId: string;
  customerId: string | null;
  supabase: SupabaseClient;
}) {
  const { salonId, customerId, supabase } = params;
  const payload = {
    salon_id: salonId,
    booking_id: null,
    visit_source: "kiosk_walkin",
    customer_id: customerId,
    checked_in_at: new Date().toISOString(),
  } as const;

  const { data, error } = await supabase
    .from("visits")
    .insert(payload)
    .select("id, checked_in_at")
    .single();

  if (error) {
    return { visit: null, error };
  }

  return { visit: data, error: null };
}



