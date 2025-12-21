# Today board (visits + requests + payments) – v1 plan

## Goals
- Single admin view showing: today’s visits/check-ins, open booking requests, and latest Stripe payments.
- Keep it read-heavy with small controls (e.g., mark visit completed, advance request status) without adding new backend endpoints yet.

## Data sources (existing)
- `visits`: visit_source, phorest_appointment_id, customer_id, checked_in_at, completed_at.
- `booking_requests`: status, preferred_window, staff_note, phorest_appointment_id.
- `checkout_sessions`: status, total_cents, last_stripe_event_id/type/at; join `stripe_events` for recent failures.

## Query strategy
- Server component fetch with `createSupabaseServerClient` scoped to `staff.salonId`.
- Queries:
  - Visits today: `visits` where `salon_id = salonId` and `checked_in_at >= today`.
  - Requests: `booking_requests` where `salon_id = salonId` and `status IN ('new','in_progress')`.
  - Payments: `checkout_sessions` where `salon_id = salonId` and `created_at >= today` order by `created_at desc`.
- Keep queries separate to avoid complex joins; normalize amounts client-side.

## UI sketch
- Header: date, salon badge, refresh button.
- Three columns (stack on mobile):
  - Visits: list cards with name (from customer lookup if available), visit_source badge, checked_in_at, complete button (optional later).
  - Requests: reuse `RequestsClient` card style; show preferred_window + quick status selector.
  - Payments: rows with amount, status badge, stripe session id tail, last_stripe_event_type.
- Empty states per column; global error banner.

## Interactions (v1)
- Refresh button triggers refetch (client fetch to `/api/admin/today` or revalidatePath).
- Reuse existing PATCH `/api/booking-requests/:id` for request status updates.
- Future: add `/api/admin/visits/:id` to mark complete; optional Stripe retry button.

## Edge/guardrails
- Respect RLS via staff session (no service role on client).
- Avoid live subscriptions initially; poll/refresh is acceptable for v1.
- Amount formatting: `Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })`.

