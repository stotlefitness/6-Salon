-- Add salons + staff auth context with salon-scoped data policies.

-- Create salons master table (idempotent) and seed Birmingham pilot.
create table if not exists salons (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  timezone text not null default 'America/Detroit',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into salons (id, name, timezone)
values ('00000000-0000-0000-0000-000000000001', '6 Salon - Birmingham', 'America/Detroit')
on conflict (id) do update set name = excluded.name, timezone = excluded.timezone;

-- Normalize booking_status enum to new lifecycle values.
do $$
begin
  if exists (select 1 from pg_type where typname = 'booking_status') then
    create type booking_status_new as enum ('scheduled', 'checked_in', 'in_service', 'completed', 'cancelled', 'no_show');

    if exists (select 1 from information_schema.tables where table_name = 'bookings') then
      execute $$
        alter table bookings
        alter column status type booking_status_new using (
          case status::text
            when 'pending' then 'scheduled'::booking_status_new
            when 'confirmed' then 'scheduled'::booking_status_new
            when 'checked_in' then 'checked_in'::booking_status_new
            when 'completed' then 'completed'::booking_status_new
            when 'cancelled' then 'cancelled'::booking_status_new
            when 'no_show' then 'no_show'::booking_status_new
            else 'scheduled'::booking_status_new
          end
        )
      $$;
    end if;

    drop type booking_status;
    alter type booking_status_new rename to booking_status;
  else
    create type booking_status as enum ('scheduled', 'checked_in', 'in_service', 'completed', 'cancelled', 'no_show');
  end if;
end $$;

-- Staff directory keyed by Supabase auth user.
create table if not exists staff_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references auth.users(id),
  salon_id uuid not null references salons(id) on delete cascade,
  display_name text not null default 'Staff',
  role text not null check (role in ('owner', 'manager', 'stylist', 'frontdesk')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table staff_users alter column display_name set default 'Staff';

-- Customers now belong to a salon + structured names.
alter table customers add column if not exists salon_id uuid;
alter table customers add column if not exists first_name text;
alter table customers add column if not exists last_name text;

update customers
set salon_id = coalesce(salon_id, '00000000-0000-0000-0000-000000000001');

update customers
set first_name = coalesce(
  nullif(first_name, ''),
  nullif(split_part(coalesce(full_name, ''), ' ', 1), ''),
  'Guest'
);

update customers
set last_name = coalesce(
  nullif(last_name, ''),
  nullif(regexp_replace(coalesce(full_name, ''), '^\S+\s*', ''), ''),
  first_name,
  'Guest'
);

update customers
set phone = coalesce(nullif(phone, ''), '+1-000-000-0000');

alter table customers alter column salon_id set not null;
alter table customers alter column first_name set not null;
alter table customers alter column last_name set not null;
alter table customers alter column phone set not null;
alter table customers alter column phone drop default;

alter table customers drop constraint if exists customers_email_key;
alter table customers drop constraint if exists customers_salon_id_fkey;
alter table customers add constraint customers_salon_id_fkey foreign key (salon_id) references salons(id) on delete cascade;
alter table customers drop column if exists full_name;
alter table customers drop column if exists notes;

insert into customers (id, salon_id, first_name, last_name, phone, email)
select '00000000-0000-0000-0000-00000000cst', '00000000-0000-0000-0000-000000000001', 'Walk-in', 'Guest', '+1-555-000-0000', null
where not exists (select 1 from customers);

-- Stylists tied to salons with structured names.
alter table stylists add column if not exists salon_id uuid;
alter table stylists add column if not exists first_name text;
alter table stylists add column if not exists last_name text;

update stylists
set salon_id = coalesce(salon_id, '00000000-0000-0000-0000-000000000001');

update stylists
set first_name = coalesce(
  nullif(first_name, ''),
  nullif(split_part(coalesce(display_name, ''), ' ', 1), ''),
  'Stylist'
);

update stylists
set last_name = coalesce(
  nullif(last_name, ''),
  nullif(regexp_replace(coalesce(display_name, ''), '^\S+\s*', ''), ''),
  'Team'
);

alter table stylists alter column salon_id set not null;
alter table stylists alter column first_name set not null;
alter table stylists alter column last_name set not null;
alter table stylists drop column if exists display_name;
alter table stylists drop constraint if exists stylists_salon_id_fkey;
alter table stylists add constraint stylists_salon_id_fkey foreign key (salon_id) references salons(id) on delete cascade;

-- Services & products scoped by salon.
alter table services add column if not exists salon_id uuid;
update services set salon_id = coalesce(salon_id, '00000000-0000-0000-0000-000000000001');
alter table services alter column salon_id set not null;
alter table services drop constraint if exists services_salon_id_fkey;
alter table services add constraint services_salon_id_fkey foreign key (salon_id) references salons(id) on delete cascade;

alter table products add column if not exists salon_id uuid;
update products set salon_id = coalesce(salon_id, '00000000-0000-0000-0000-000000000001');
alter table products alter column salon_id set not null;
alter table products drop constraint if exists products_salon_id_fkey;
alter table products add constraint products_salon_id_fkey foreign key (salon_id) references salons(id) on delete cascade;

-- Guarantee at least one service exists for FK backfill.
insert into services (id, salon_id, name, description, duration_minutes, price_cents, is_active)
select '00000000-0000-0000-0000-00000000srv', '00000000-0000-0000-0000-000000000001', 'Placeholder Service', 'Autogenerated to satisfy FK backfill.', 30, 0, true
where not exists (select 1 from services);

-- Bookings now reference salon + service + richer metadata.
alter table bookings add column if not exists salon_id uuid;
update bookings set salon_id = coalesce(salon_id, '00000000-0000-0000-0000-000000000001');

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_name = 'bookings' and column_name = 'scheduled_start'
  ) then
    execute 'alter table bookings rename column scheduled_start to start_time';
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_name = 'bookings' and column_name = 'scheduled_end'
  ) then
    execute 'alter table bookings rename column scheduled_end to end_time';
  end if;
end $$;

alter table bookings add column if not exists service_id uuid;
update bookings
set service_id = coalesce(
  service_id,
  (select id from services order by created_at asc limit 1)
);

alter table bookings add column if not exists source text default 'kiosk';
alter table bookings add column if not exists checked_in_at timestamptz;

update bookings set start_time = coalesce(start_time, now());

alter table bookings alter column salon_id set not null;
alter table bookings alter column start_time set not null;
alter table bookings alter column service_id set not null;
update bookings set customer_id = coalesce(customer_id, (select id from customers limit 1));
alter table bookings alter column customer_id set not null;

alter table bookings drop constraint if exists bookings_salon_id_fkey;
alter table bookings add constraint bookings_salon_id_fkey foreign key (salon_id) references salons(id) on delete cascade;
alter table bookings drop constraint if exists bookings_customer_id_fkey;
alter table bookings add constraint bookings_customer_id_fkey foreign key (customer_id) references customers(id) on delete cascade;
alter table bookings drop constraint if exists bookings_service_id_fkey;
alter table bookings add constraint bookings_service_id_fkey foreign key (service_id) references services(id);

-- Indexes for salon-scoped queries.
create index if not exists idx_customers_salon_phone_last_name on customers (salon_id, phone, lower(last_name));
create index if not exists idx_bookings_salon_start on bookings (salon_id, start_time);
create index if not exists idx_bookings_salon_customer_start on bookings (salon_id, customer_id, start_time);

-- Enable RLS on new tables.
alter table if exists salons enable row level security;
alter table if exists staff_users enable row level security;

-- Service role bypass for Supabase functions / automation.
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

-- Staff scoped policies via auth.uid() -> staff_users.
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
