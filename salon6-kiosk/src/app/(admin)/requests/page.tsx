import { requireStaffSession } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import RequestsClient from "./requestsClient";

export default async function RequestsPage() {
  const staff = await requireStaffSession();
  const supabase = await createSupabaseServerClient();
  const fetchedAt = new Date().toISOString();

  const { data, error } = await supabase
    .from("booking_requests")
    .select(
      "id, name, phone, email, preferred_window, service_interest, notes, staff_note, phorest_appointment_id, status, request_source, created_at, updated_at"
    )
    .eq("salon_id", staff.salonId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (
    <RequestsClient
      salonId={staff.salonId}
      initialRequests={data ?? []}
      staffRole={staff.role}
      initialFetchedAt={fetchedAt}
    />
  );
}

