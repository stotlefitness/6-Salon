-- Seed/demo data for local development.
-- Insert baseline salon, services, stylists, customers, and sample bookings.

-- Stable Birmingham salon
insert into salons (id, name, timezone)
values ('00000000-0000-0000-0000-000000000001', '6 Salon - Birmingham', 'America/Detroit')
on conflict (id) do update set name = excluded.name, timezone = excluded.timezone;

-- Stylists
insert into stylists (id, salon_id, first_name, last_name, role, is_active)
values
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'Alex', 'Rivera', 'stylist', true),
  ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000001', 'Jamie', 'Chen', 'stylist', true)
on conflict (id) do nothing;

-- Services
insert into services (id, salon_id, name, description, duration_minutes, price_cents, is_active)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '00000000-0000-0000-0000-000000000001', 'Classic Cut', 'Standard cut and light styling', 45, 4500, true),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '00000000-0000-0000-0000-000000000001', 'Blowout', 'Wash and blowout with finish', 60, 6500, true),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '00000000-0000-0000-0000-000000000001', 'Color Refresh', 'Roots and gloss refresh', 90, 12000, true)
on conflict (id) do nothing;

-- Products
insert into products (id, salon_id, name, description, price_cents, retail_sku, stock_quantity, is_active)
values
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '00000000-0000-0000-0000-000000000001', 'Finishing Spray', 'Light hold finishing spray', 2200, 'FS-01', 24, true),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '00000000-0000-0000-0000-000000000001', 'Hydrating Serum', 'Leave-in hydrating serum', 3400, 'HS-02', 18, true)
on conflict (id) do nothing;

-- Customers
insert into customers (id, salon_id, first_name, last_name, phone, email)
values
  ('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '00000000-0000-0000-0000-000000000001', 'Taylor', 'Morgan', '+1 (555) 010-0100', 'taylor@example.com'),
  ('bbbbbbbb-cccc-dddd-eeee-ffffffffffff', '00000000-0000-0000-0000-000000000001', 'Riley', 'Patel', '+1 (555) 010-0101', 'riley@example.com')
on conflict (id) do nothing;

-- Bookings (one today for check-in flow)
insert into bookings (id, salon_id, customer_id, stylist_id, service_id, start_time, end_time, status, source, total_amount_cents)
values
  (
    '99999999-1111-2222-3333-444444444444',
    '00000000-0000-0000-0000-000000000001',
    'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
    '11111111-1111-1111-1111-111111111111',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    date_trunc('day', now()) + interval '10 hour',
    date_trunc('day', now()) + interval '11 hour',
    'scheduled',
    'kiosk',
    4500
  ),
  (
    '99999999-5555-6666-7777-888888888888',
    '00000000-0000-0000-0000-000000000001',
    'bbbbbbbb-cccc-dddd-eeee-ffffffffffff',
    '22222222-2222-2222-2222-222222222222',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    date_trunc('day', now()) + interval '15 hour',
    date_trunc('day', now()) + interval '16 hour 30 minutes',
    'scheduled',
    'admin',
    11000
  )
on conflict (id) do nothing;

-- Booking services
insert into booking_services (id, booking_id, service_id, quantity, price_cents)
values
  (
    '12121212-3434-5656-7878-909090909090',
    '99999999-1111-2222-3333-444444444444',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    1,
    4500
  ),
  (
    '21212121-4343-6565-8787-090909090909',
    '99999999-5555-6666-7777-888888888888',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    1,
    4500
  ),
  (
    '31313131-5353-7575-9797-010101010101',
    '99999999-5555-6666-7777-888888888888',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    1,
    6500
  )
on conflict (id) do nothing;

-- Payments (optional example)
insert into payments (id, booking_id, amount_cents, method, status, external_id)
values
  (
    'f0f0f0f0-0f0f-0f0f-0f0f-f0f0f0f0f0f0',
    '99999999-1111-2222-3333-444444444444',
    4500,
    'card',
    'captured',
    'pi_demo_001'
  )
on conflict (id) do nothing;
