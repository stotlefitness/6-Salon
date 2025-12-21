import { createSupabaseServerClient } from "@/lib/supabase-server";

type VisitSummary = {
  id: string;
  name: string;
  status: "waiting" | "in_service" | "completed";
  source: string;
  checked_in_at: string;
  completed_at: string | null;
  created_at: string;
};

type BookingRequestSummary = {
  id: string;
  name: string;
  status: string;
  request_source: string;
  created_at: string;
  updated_at: string;
  preferred_window: string;
};

type PaymentSummary = {
  id: string;
  amount_cents: number;
  status: string;
  created_at: string;
  booking_id: string | null;
};

export type TodaySummary = {
  timezone: string;
  start: string;
  end: string;
  fetchedAt: string;
  visits: VisitSummary[];
  bookingRequests: BookingRequestSummary[];
  payments: {
    total_cents: number;
    count: number;
    rows: PaymentSummary[];
  };
};

const DEFAULT_TZ = "America/Detroit";

function getTodayRange(timeZone: string) {
  const now = new Date();
  const zonedNow = new Date(now.toLocaleString("en-US", { timeZone }));
  const offsetMs = now.getTime() - zonedNow.getTime();
  const startLocal = new Date(zonedNow);
  startLocal.setHours(0, 0, 0, 0);
  const endLocal = new Date(zonedNow);
  endLocal.setHours(23, 59, 59, 999);
  return {
    start: new Date(startLocal.getTime() + offsetMs).toISOString(),
    end: new Date(endLocal.getTime() + offsetMs).toISOString(),
  };
}

function deriveVisitStatus(params: {
  booking_status?: string | null;
  completed_at?: string | null;
}) {
  if (params.booking_status === "in_service") return "in_service";
  if (params.booking_status === "completed" || params.completed_at) return "completed";
  if (params.booking_status === "checked_in") return "waiting";
  return "waiting";
}

export async function fetchTodaySummary(salonId: string): Promise<TodaySummary> {
  const supabase = await createSupabaseServerClient();

  const { data: salon } = await supabase
    .from("salons")
    .select("timezone")
    .eq("id", salonId)
    .maybeSingle();

  const timezone = salon?.timezone || DEFAULT_TZ;
  const { start, end } = getTodayRange(timezone);
  const fetchedAt = new Date().toISOString();

  const { data: visitsData = [] } = await supabase
    .from("visits")
    .select(
      "id, booking_id, salon_id, checked_in_at, completed_at, visit_source, created_at, bookings(status, customer_id), customers(first_name, last_name)"
    )
    .eq("salon_id", salonId)
    .gte("created_at", start)
    .lte("created_at", end)
    .order("created_at", { ascending: false });

  const visits: VisitSummary[] = visitsData.map((v: any) => {
    const name =
      v.customers?.first_name || v.customers?.last_name
        ? `${v.customers?.first_name ?? ""} ${v.customers?.last_name ?? ""}`.trim()
        : "Guest";
    const status = deriveVisitStatus({
      booking_status: v.bookings?.status,
      completed_at: v.completed_at,
    });
    return {
      id: v.id,
      name,
      status,
      source: v.visit_source,
      checked_in_at: v.checked_in_at,
      completed_at: v.completed_at,
      created_at: v.created_at,
    };
  });

  const { data: requestsData = [] } = await supabase
    .from("booking_requests")
    .select(
      "id, name, status, request_source, created_at, updated_at, preferred_window, salon_id"
    )
    .eq("salon_id", salonId)
    .gte("created_at", start)
    .lte("created_at", end)
    .order("created_at", { ascending: false });

  const bookingRequests: BookingRequestSummary[] = requestsData.map((r: any) => ({
    id: r.id,
    name: r.name,
    status: r.status,
    request_source: r.request_source,
    created_at: r.created_at,
    updated_at: r.updated_at,
    preferred_window: r.preferred_window,
  }));

  const { data: paymentsData = [] } = await supabase
    .from("payments")
    .select("id, amount_cents, status, created_at, booking_id")
    .eq("status", "captured")
    .gte("created_at", start)
    .lte("created_at", end)
    .order("created_at", { ascending: false })
    .limit(10);

  const total_cents = paymentsData.reduce((sum: number, p: any) => sum + (p.amount_cents ?? 0), 0);

  return {
    timezone,
    start,
    end,
    fetchedAt,
    visits,
    bookingRequests,
    payments: {
      total_cents,
      count: paymentsData.length,
      rows: paymentsData as PaymentSummary[],
    },
  };
}

