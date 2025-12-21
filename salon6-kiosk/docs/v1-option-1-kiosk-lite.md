## Option 1 — Kiosk Lite + Stripe (v1)

### Positioning
- Phorest stays the source of truth for scheduling and client history.
- Our app is a thin front-door + checkout layer; no deep Phorest sync in v1 (manual/one-way export only).
- Single-location scope (Birmingham salon) and iPad kiosk only.

### Kiosk (public, iPad)
- “I’m here for my visit”: Check-in by phone + last name; handle multiple bookings, already-checked-in, and no-booking states.
- “I’d like to book a visit”: Capture booking requests (service, time preference, stylist preference/no preference, contact info). These remain “pending” until staff schedules in Phorest.
- “I’m ready to check out”: Select performed services + products, show totals, pay via Stripe on the iPad.
- “Shop haircare”: Browse products; add to checkout cart.

### Admin (staff-facing)
- Today board: Live view of today’s visits (scheduled, checked-in) with realtime updates.
- Booking Requests: Queue of kiosk-submitted requests awaiting staff action; staff schedules in Phorest.
- Payments/Checkout overview: Completed checkouts with payment status and Stripe references.

### Data & Payments
- Data stored in Supabase; Phorest remains system-of-record (manual reconciliation as needed).
- Booking requests do NOT auto-create Phorest appointments in v1.
- Stripe only for payments (no cash, gift cards, loyalty, or other tenders in v1).

### Explicitly NOT in v1 (to prevent scope creep)
- Full scheduler/calendar UI or real-time Phorest availability.
- Client history/notes editing, loyalty, memberships, or rewards.
- Staff scheduling/shift management.
- Inventory/stock management or supplier workflows.
- Multi-location support.
- Notifications (email/SMS/push) and marketing automations.
- Mobile apps beyond the iPad kiosk experience.

### Success Criteria for v1
- Guests can check in and see clear outcomes for all states (no customer, no booking, multiple bookings, already checked in).
- Guests can submit booking requests; staff can see and act on them in Admin; Phorest remains authoritative.
- Guests can complete checkout with services/products and pay via Stripe on the iPad.
- Admin can monitor today’s visits and recent payments in one place.
