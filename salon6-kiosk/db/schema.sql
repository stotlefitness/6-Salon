-- Source of truth for database schema.
-- Supabase/Postgres - migrations should be generated from this file.

-- Extensions
create extension if not exists "pgcrypto";

-- Enums
do $$
begin
  if not exists (select 1 from pg_type where typname = 'booking_status') then
    create type booking_status as enum ('scheduled', 'checked_in', 'in_service', 'completed', 'cancelled', 'no_show');
  end if;

  if not exists (select 1 from pg_type where typname = 'payment_status') then
    create type payment_status as enum ('pending', 'authorized', 'captured', 'refunded', 'failed');
  end if;

  if not exists (select 1 from pg_type where typname = 'payment_method') then
    create type payment_method as enum ('card', 'cash', 'gift_card', 'external');
  end if;
end $$;

-- Core tables
create table if not exists salons (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  timezone text not null default 'America/Detroit',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists staff_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references auth.users(id),
  salon_id uuid not null references salons(id) on delete cascade,
  display_name text not null default 'Staff',
  role text not null check (role in ('owner', 'manager', 'stylist', 'frontdesk')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid not null references salons(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  phone text not null,
  phone_normalized text not null,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists stylists (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid not null references salons(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  role text not null default 'stylist',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid not null references salons(id) on delete cascade,
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
  salon_id uuid not null references salons(id) on delete cascade,
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
  salon_id uuid not null references salons(id) on delete cascade,
  customer_id uuid not null references customers(id) on delete cascade,
  stylist_id uuid references stylists(id) on delete set null,
  service_id uuid not null references services(id),
  start_time timestamptz not null,
  end_time timestamptz,
  status booking_status not null default 'scheduled',
  source text default 'kiosk',
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

-- Indexes
create index if not exists idx_customers_salon_phone_last_name on customers (salon_id, phone, lower(last_name));
create index if not exists idx_customers_salon_phone_normalized_last on customers (salon_id, phone_normalized, lower(last_name));
create index if not exists idx_bookings_customer on bookings (customer_id);
create index if not exists idx_bookings_salon_start on bookings (salon_id, start_time);
create index if not exists idx_bookings_salon_customer_start on bookings (salon_id, customer_id, start_time);
create index if not exists idx_bookings_stylist on bookings (stylist_id);
create index if not exists idx_booking_services_booking on booking_services (booking_id);
create index if not exists idx_booking_services_service on booking_services (service_id);
create index if not exists idx_payments_booking on payments (booking_id);

-- RLS
alter table if exists salons enable row level security;
alter table if exists staff_users enable row level security;
alter table if exists customers enable row level security;
alter table if exists stylists enable row level security;
alter table if exists services enable row level security;
alter table if exists products enable row level security;
alter table if exists bookings enable row level security;
alter table if exists booking_services enable row level security;
alter table if exists payments enable row level security;

-- Service role bypass for kiosk/internal jobs
create policy if not exists "service role full access salons" on salons
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy if not exists "service role full access staff_users" on staff_users
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
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

-- Staff scoped to their salon
create policy if not exists "staff view salons" on salons
  for select using (exists (
    select 1 from staff_users su
    where su.user_id = auth.uid()
      and su.salon_id = salons.id
  ));

create policy if not exists "staff view staff_users in salon" on staff_users
  for select using (exists (
    select 1 from staff_users su
    where su.user_id = auth.uid()
      and su.salon_id = staff_users.salon_id
  ));

create policy if not exists "staff manage salon customers" on customers
  for all using (exists (
    select 1 from staff_users su
    where su.user_id = auth.uid()
      and su.salon_id = customers.salon_id
  ))
  with check (exists (
    select 1 from staff_users su
    where su.user_id = auth.uid()
      and su.salon_id = customers.salon_id
  ));

create policy if not exists "staff view stylists in salon" on stylists
  for all using (exists (
    select 1 from staff_users su
    where su.user_id = auth.uid()
      and su.salon_id = stylists.salon_id
  ))
  with check (exists (
    select 1 from staff_users su
    where su.user_id = auth.uid()
      and su.salon_id = stylists.salon_id
  ));

create policy if not exists "staff view services in salon" on services
  for all using (exists (
    select 1 from staff_users su
    where su.user_id = auth.uid()
      and su.salon_id = services.salon_id
  ))
  with check (exists (
    select 1 from staff_users su
    where su.user_id = auth.uid()
      and su.salon_id = services.salon_id
  ));

create policy if not exists "staff view products in salon" on products
  for all using (exists (
    select 1 from staff_users su
    where su.user_id = auth.uid()
      and su.salon_id = products.salon_id
  ))
  with check (exists (
    select 1 from staff_users su
    where su.user_id = auth.uid()
      and su.salon_id = products.salon_id
  ));

create policy if not exists "staff manage bookings in salon" on bookings
  for all using (exists (
    select 1 from staff_users su
    where su.user_id = auth.uid()
      and su.salon_id = bookings.salon_id
  ))
  with check (exists (
    select 1 from staff_users su
    where su.user_id = auth.uid()
      and su.salon_id = bookings.salon_id
  ));

create policy if not exists "staff manage booking services" on booking_services
  for all using (exists (
    select 1 from staff_users su
    join bookings b on b.id = booking_services.booking_id
    where su.user_id = auth.uid()
      and su.salon_id = b.salon_id
  ))
  with check (exists (
    select 1 from staff_users su
    join bookings b on b.id = booking_services.booking_id
    where su.user_id = auth.uid()
      and su.salon_id = b.salon_id
  ));

create policy if not exists "staff view payments" on payments
  for select using (exists (
    select 1 from staff_users su
    join bookings b on b.id = payments.booking_id
    where su.user_id = auth.uid()
      and su.salon_id = b.salon_id
  ));





