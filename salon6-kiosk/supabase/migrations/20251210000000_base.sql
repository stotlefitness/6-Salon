-- Base schema migration for Salon6 Kiosk.
-- Generated from db/schema.sql. Keep db/schema.sql as the source of truth.

create extension if not exists "pgcrypto";

do $$
begin
  if not exists (select 1 from pg_type where typname = 'booking_status') then
    create type booking_status as enum ('scheduled', 'checked_in', 'in_service', 'completed', 'cancelled', 'no_show');
  end if;

  if not exists (
    select 1 from pg_enum
    where enumlabel = 'scheduled' and enumtypid = 'booking_status'::regtype
  ) then
    alter type booking_status add value 'scheduled';
  end if;

  if not exists (
    select 1 from pg_enum
    where enumlabel = 'checked_in' and enumtypid = 'booking_status'::regtype
  ) then
    alter type booking_status add value 'checked_in';
  end if;

  if not exists (
    select 1 from pg_enum
    where enumlabel = 'in_service' and enumtypid = 'booking_status'::regtype
  ) then
    alter type booking_status add value 'in_service';
  end if;

  if not exists (
    select 1 from pg_enum
    where enumlabel = 'completed' and enumtypid = 'booking_status'::regtype
  ) then
    alter type booking_status add value 'completed';
  end if;

  if not exists (
    select 1 from pg_enum
    where enumlabel = 'cancelled' and enumtypid = 'booking_status'::regtype
  ) then
    alter type booking_status add value 'cancelled';
  end if;

  if not exists (
    select 1 from pg_enum
    where enumlabel = 'no_show' and enumtypid = 'booking_status'::regtype
  ) then
    alter type booking_status add value 'no_show';
  end if;

  if not exists (select 1 from pg_type where typname = 'payment_status') then
    create type payment_status as enum ('pending', 'authorized', 'captured', 'refunded', 'failed');
  end if;

  if not exists (select 1 from pg_type where typname = 'payment_method') then
    create type payment_method as enum ('card', 'cash', 'gift_card', 'external');
  end if;
end $$;

create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text,
  email text unique,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists stylists (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  role text not null default 'stylist',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  duration_minutes integer not null check (duration_minutes > 0),
  price_cents integer not null check (price_cents >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price_cents integer not null check (price_cents >= 0),
  retail_sku text,
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete set null,
  stylist_id uuid references stylists(id) on delete set null,
  start_time timestamptz not null,
  end_time timestamptz,
  status booking_status not null default 'scheduled',
  checked_in_at timestamptz,
  notes text,
  total_amount_cents integer not null default 0 check (total_amount_cents >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists booking_services (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  service_id uuid not null references services(id),
  quantity integer not null default 1 check (quantity > 0),
  price_cents integer not null check (price_cents >= 0),
  created_at timestamptz not null default now()
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references bookings(id) on delete cascade,
  amount_cents integer not null check (amount_cents >= 0),
  method payment_method not null,
  status payment_status not null default 'pending',
  external_id text,
  created_at timestamptz not null default now()
);

create index if not exists idx_bookings_customer on bookings (customer_id);
create index if not exists idx_bookings_stylist on bookings (stylist_id);
create index if not exists idx_booking_services_booking on booking_services (booking_id);
create index if not exists idx_booking_services_service on booking_services (service_id);
create index if not exists idx_payments_booking on payments (booking_id);

alter table if exists customers enable row level security;
alter table if exists stylists enable row level security;
alter table if exists services enable row level security;
alter table if exists products enable row level security;
alter table if exists bookings enable row level security;
alter table if exists booking_services enable row level security;
alter table if exists payments enable row level security;

create policy if not exists "service role full access customers" on customers
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy if not exists "service role full access stylists" on stylists
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy if not exists "service role full access services" on services
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy if not exists "service role full access products" on products
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy if not exists "service role full access bookings" on bookings
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy if not exists "service role full access booking_services" on booking_services
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy if not exists "service role full access payments" on payments
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');





