-- Option 1 walk-ins + Stripe hardening
-- Allow visits without bookings, add visit metadata, and add Stripe idempotency log.

-- 1) Enums
do $$
begin
  if not exists (select 1 from pg_type where typname = 'visit_source') then
    create type public.visit_source as enum ('kiosk_walkin', 'phorest_booking', 'staff_manual');
  end if;
end $$;

-- 2) visits adjustments: booking_id nullable, visit metadata, partial uniqueness
alter table public.visits
  alter column booking_id drop not null,
  add column if not exists visit_source public.visit_source not null default 'kiosk_walkin',
  add column if not exists phorest_appointment_id text,
  add column if not exists customer_id uuid;

-- Drop prior unique constraint/index if present (names may vary)
alter table public.visits drop constraint if exists visits_booking_id_unique;
alter table public.visits drop constraint if exists visits_booking_id_key;
drop index if exists public.visits_booking_id_key;

-- Enforce at most one visit per booking when booking_id is present
create unique index if not exists visits_booking_id_unique_not_null
  on public.visits (booking_id)
  where booking_id is not null;

-- Supporting indexes
create index if not exists visits_salon_checked_in_at_idx
  on public.visits (salon_id, checked_in_at desc);
create index if not exists visits_phorest_appointment_id_idx
  on public.visits (phorest_appointment_id)
  where phorest_appointment_id is not null;
create index if not exists visits_customer_id_idx
  on public.visits (customer_id)
  where customer_id is not null;

-- 3) Stripe idempotency log
create table if not exists public.stripe_events (
  id uuid primary key default gen_random_uuid(),
  event_id text not null unique,
  type text,
  checkout_session_id uuid references public.checkout_sessions(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists stripe_events_session_idx on public.stripe_events (checkout_session_id);

-- 4) RLS adjustments for visits (derive scope from visits.salon_id, not bookings)
alter table if exists public.visits enable row level security;
alter table if exists public.stripe_events enable row level security;

-- Drop old policies if they relied on bookings join
drop policy if exists "staff view visits in salon" on public.visits;
drop policy if exists "staff manage visits in salon" on public.visits;
drop policy if exists "service role full access visits" on public.visits;

-- Service role full access
create policy "service role full access visits" on public.visits
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- Staff scoped to visits.salon_id
create policy "staff view visits in salon" on public.visits
  for select using (exists (
    select 1 from public.staff_users su
    where su.user_id = auth.uid() and su.salon_id = public.visits.salon_id
  ));
create policy "staff manage visits in salon" on public.visits
  for all using (exists (
    select 1 from public.staff_users su
    where su.user_id = auth.uid() and su.salon_id = public.visits.salon_id
  )) with check (exists (
    select 1 from public.staff_users su
    where su.user_id = auth.uid() and su.salon_id = public.visits.salon_id
  ));

-- RLS for stripe_events (service role + staff per checkout_session.salon_id)
create policy "service role full access stripe_events" on public.stripe_events
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

create policy "staff view stripe_events via session" on public.stripe_events
  for select using (exists (
    select 1 from public.staff_users su
    join public.checkout_sessions cs on cs.id = public.stripe_events.checkout_session_id
    where su.user_id = auth.uid() and su.salon_id = cs.salon_id
  ));
