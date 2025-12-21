-- Option 1 – Kiosk Lite + Stripe core tables.
-- Phorest remains system of record for scheduling; this app is front-door + checkout only.

-- Enums (idempotent)
do $$
begin
  if not exists (select 1 from pg_type where typname = 'booking_request_status') then
    create type booking_request_status as enum ('pending', 'scheduled', 'cancelled');
  end if;

  if not exists (select 1 from pg_type where typname = 'checkout_session_status') then
    create type checkout_session_status as enum ('pending', 'completed', 'cancelled', 'failed');
  end if;

  if not exists (select 1 from pg_type where typname = 'checkout_line_item_type') then
    create type checkout_line_item_type as enum ('service', 'product', 'tip');
  end if;
end $$;

-- visits: one per booking when checked in (tracks physical presence)
create table if not exists visits (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid not null references salons(id) on delete cascade,
  booking_id uuid not null references bookings(id) on delete cascade,
  checked_in_at timestamptz not null default now(),
  completed_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint visits_booking_id_unique unique (booking_id)
);
create index if not exists idx_visits_salon_checked_in_at on visits (salon_id, checked_in_at);

-- booking_requests: kiosk “book a visit” submissions (staff schedules in Phorest)
create table if not exists booking_requests (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid not null references salons(id) on delete cascade,
  customer_id uuid references customers(id) on delete set null,
  service_id uuid not null references services(id),
  preferred_stylist_id uuid references stylists(id) on delete set null,
  preferred_start_time timestamptz,
  duration_minutes integer not null check (duration_minutes > 0),
  status booking_request_status not null default 'pending',
  notes text,
  phorest_appointment_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_booking_requests_salon_status_created on booking_requests (salon_id, status, created_at);
create index if not exists idx_booking_requests_customer on booking_requests (customer_id);

-- checkout_sessions: Stripe checkout envelope (replaces legacy payments pattern)
create table if not exists checkout_sessions (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid not null references salons(id) on delete cascade,
  customer_id uuid not null references customers(id) on delete cascade,
  booking_id uuid references bookings(id) on delete set null,
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text,
  status checkout_session_status not null default 'pending',
  subtotal_cents integer not null default 0 check (subtotal_cents >= 0),
  tax_cents integer not null default 0 check (tax_cents >= 0),
  tip_cents integer not null default 0 check (tip_cents >= 0),
  total_cents integer not null default 0 check (total_cents >= 0),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_checkout_sessions_salon_status_created on checkout_sessions (salon_id, status, created_at);
create index if not exists idx_checkout_sessions_customer on checkout_sessions (customer_id);
create index if not exists idx_checkout_sessions_booking on checkout_sessions (booking_id);

-- checkout_line_items: items within a checkout_session (services, products, tips)
create table if not exists checkout_line_items (
  id uuid primary key default gen_random_uuid(),
  checkout_session_id uuid not null references checkout_sessions(id) on delete cascade,
  item_type checkout_line_item_type not null,
  service_id uuid references services(id) on delete set null,
  product_id uuid references products(id) on delete set null,
  quantity integer not null default 1 check (quantity > 0),
  unit_price_cents integer not null check (unit_price_cents >= 0),
  total_price_cents integer not null check (total_price_cents >= 0),
  description text,
  created_at timestamptz not null default now()
);
create index if not exists idx_checkout_line_items_session on checkout_line_items (checkout_session_id);
create index if not exists idx_checkout_line_items_service on checkout_line_items (service_id);
create index if not exists idx_checkout_line_items_product on checkout_line_items (product_id);

-- RLS enable
alter table if exists visits enable row level security;
alter table if exists booking_requests enable row level security;
alter table if exists checkout_sessions enable row level security;
alter table if exists checkout_line_items enable row level security;

-- RLS: service role full access
create policy if not exists "service role full access visits" on visits
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy if not exists "service role full access booking_requests" on booking_requests
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy if not exists "service role full access checkout_sessions" on checkout_sessions
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy if not exists "service role full access checkout_line_items" on checkout_line_items
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- RLS: staff scoped to their salon via staff_users.salon_id
create policy if not exists "staff view visits in salon" on visits
  for select using (exists (
    select 1 from staff_users su
    join bookings b on b.id = visits.booking_id
    where su.user_id = auth.uid() and su.salon_id = b.salon_id
  ));
create policy if not exists "staff manage visits in salon" on visits
  for all using (exists (
    select 1 from staff_users su
    join bookings b on b.id = visits.booking_id
    where su.user_id = auth.uid() and su.salon_id = b.salon_id
  )) with check (exists (
    select 1 from staff_users su
    join bookings b on b.id = visits.booking_id
    where su.user_id = auth.uid() and su.salon_id = b.salon_id
  ));

create policy if not exists "staff view booking_requests in salon" on booking_requests
  for select using (exists (
    select 1 from staff_users su
    where su.user_id = auth.uid() and su.salon_id = booking_requests.salon_id
  ));
create policy if not exists "staff manage booking_requests in salon" on booking_requests
  for all using (exists (
    select 1 from staff_users su
    where su.user_id = auth.uid() and su.salon_id = booking_requests.salon_id
  )) with check (exists (
    select 1 from staff_users su
    where su.user_id = auth.uid() and su.salon_id = booking_requests.salon_id
  ));

create policy if not exists "staff view checkout_sessions in salon" on checkout_sessions
  for select using (exists (
    select 1 from staff_users su
    where su.user_id = auth.uid() and su.salon_id = checkout_sessions.salon_id
  ));
create policy if not exists "staff manage checkout_sessions in salon" on checkout_sessions
  for all using (exists (
    select 1 from staff_users su
    where su.user_id = auth.uid() and su.salon_id = checkout_sessions.salon_id
  )) with check (exists (
    select 1 from staff_users su
    where su.user_id = auth.uid() and su.salon_id = checkout_sessions.salon_id
  ));

create policy if not exists "staff view checkout_line_items in salon" on checkout_line_items
  for select using (exists (
    select 1 from staff_users su
    join checkout_sessions cs on cs.id = checkout_line_items.checkout_session_id
    where su.user_id = auth.uid() and su.salon_id = cs.salon_id
  ));
create policy if not exists "staff manage checkout_line_items in salon" on checkout_line_items
  for all using (exists (
    select 1 from staff_users su
    join checkout_sessions cs on cs.id = checkout_line_items.checkout_session_id
    where su.user_id = auth.uid() and su.salon_id = cs.salon_id
  )) with check (exists (
    select 1 from staff_users su
    join checkout_sessions cs on cs.id = checkout_line_items.checkout_session_id
    where su.user_id = auth.uid() and su.salon_id = cs.salon_id
  ));

-- Notes:
-- - products table already exists with salon_id and is_active; no change here.
-- - checkout_sessions replaces the legacy payments pattern for Stripe Checkout.
-- - booking_requests do not auto-create Phorest appointments; staff sets phorest_appointment_id after scheduling externally.
-- - visits are tied to bookings (one visit per booking) for checked-in tracking.
