-- Booking requests: kiosk-lite Option 1

-- 1) Enums
do $$ begin
  create type public.booking_request_status as enum ('new','in_progress','scheduled_in_phorest','closed');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.booking_request_source as enum ('kiosk','web','staff_manual');
exception
  when duplicate_object then null;
end $$;

-- 2) Table
create table if not exists public.booking_requests (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid not null references public.salons(id) on delete cascade,
  name text not null,
  phone text not null,
  email text,
  service_interest text,
  preferred_window text not null,
  notes text,
  staff_note text,
  status public.booking_request_status not null default 'new',
  request_source public.booking_request_source not null default 'kiosk',
  phorest_appointment_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Backfill columns in case table already existed without them
alter table public.booking_requests add column if not exists phone text;
update public.booking_requests set phone = coalesce(phone, '') where phone is null;
alter table public.booking_requests alter column phone set not null;

-- 3) Indexes
create index if not exists booking_requests_salon_created_idx
  on public.booking_requests (salon_id, created_at desc);

create index if not exists booking_requests_salon_status_created_idx
  on public.booking_requests (salon_id, status, created_at desc);

create index if not exists booking_requests_phone_idx
  on public.booking_requests (phone);

-- 4) updated_at trigger (shared)
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists set_booking_requests_updated_at on public.booking_requests;
create trigger set_booking_requests_updated_at
before update on public.booking_requests
for each row execute function public.set_updated_at();

-- 5) RLS
alter table public.booking_requests enable row level security;

-- Clear old policies if present
drop policy if exists "booking_requests_staff_read" on public.booking_requests;
drop policy if exists "booking_requests_staff_update" on public.booking_requests;

-- Staff read: only their salon
create policy "booking_requests_staff_read"
on public.booking_requests
for select
to authenticated
using (
  exists (
    select 1
    from public.staff_users su
    where su.user_id = auth.uid()
      and su.salon_id = booking_requests.salon_id
  )
);

-- Staff update: only their salon
create policy "booking_requests_staff_update"
on public.booking_requests
for update
to authenticated
using (
  exists (
    select 1
    from public.staff_users su
    where su.user_id = auth.uid()
      and su.salon_id = booking_requests.salon_id
  )
)
with check (
  exists (
    select 1
    from public.staff_users su
    where su.user_id = auth.uid()
      and su.salon_id = booking_requests.salon_id
  )
);

-- Note: no insert policy; inserts should be done via service-role in API layer.
