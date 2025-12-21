## Pre-prod DB checks

- Duplicate booking guard:
  ```sql
  select booking_id, count(*)
  from public.visits
  where booking_id is not null
  group by booking_id
  having count(*) > 1;
  ```

- Confirm partial unique index exists:
  ```sql
  select indexdef
  from pg_indexes
  where tablename='visits'
    and indexname like '%booking_id%';
  ```

- Confirm checkout line item constraints exist (FK, quantity > 0, unit_price_cents >= 0):
  ```sql
  \d public.checkout_line_items
  -- or inspect pg_constraint for quantity/unit_price checks
  ```

## Stripe verification

- Local webhook:
  ```bash
  stripe listen --forward-to localhost:3000/api/stripe/webhook
  ```

- Trigger events:
  ```bash
  stripe trigger checkout.session.expired
  stripe trigger checkout.session.completed
  stripe trigger checkout.session.async_payment_failed
  stripe trigger checkout.session.async_payment_succeeded
  ```

- Confirm webhook updates:
  - `checkout_sessions.status` transitions correctly (pending → completed/expired/failed)
  - `stripe_events` records event IDs (dedupe works)
  - `checkout_sessions.last_stripe_event_*` columns update

## Idempotency & concurrency checks

- Call `/api/checkout/session` twice rapidly for the same checkout_session_id:
  - Expect the same Stripe URL unless the prior session expired.

- Force a Stripe session to expire, then call `/api/checkout/session`:
  - Expect a brand-new Stripe session and updated `stripe_checkout_session_id`.

- Attempt cross-salon access:
  - Staff in Salon A must not be able to create/resolve checkout sessions belonging to Salon B.

## Ops note

- Stripe event pruning suggestion:
  ```sql
  delete from public.stripe_events
  where created_at < now() - interval '90 days';
  ```

## Webhook auth sanity

- Webhook must **not** require staff auth/cookies.
- Only Stripe signature verification + metadata-based scoping should guard the route.
## Pre-prod DB checks

- Duplicate booking guard:
  ```sql
  select booking_id, count(*)
  from public.visits
  where booking_id is not null
  group by booking_id
  having count(*) > 1;
  ```

- Confirm partial unique index exists:
  ```sql
  select indexdef
  from pg_indexes
  where tablename='visits'
    and indexname like '%booking_id%';
  ```

- Confirm checkout line item constraints exist (FK, quantity > 0, unit_price_cents >= 0):
  ```sql
  \d public.checkout_line_items
  -- or inspect pg_constraint for quantity/unit_price checks
  ```

## Stripe verification

- Local webhook:
  ```bash
  stripe listen --forward-to localhost:3000/api/stripe/webhook
  ```

- Trigger events:
  ```bash
  stripe trigger checkout.session.expired
  stripe trigger checkout.session.completed
  stripe trigger checkout.session.async_payment_failed
  stripe trigger checkout.session.async_payment_succeeded
  ```

- Confirm webhook updates:
  - `checkout_sessions.status` transitions correctly (pending → completed/expired/failed)
  - `stripe_events` records event IDs (dedupe works)
  - `checkout_sessions.last_stripe_event_*` columns update

## Idempotency & concurrency checks

- Call `/api/checkout/session` twice rapidly for the same checkout_session_id:
  - Expect the same Stripe URL unless the prior session expired.

- Force a Stripe session to expire, then call `/api/checkout/session`:
  - Expect a brand-new Stripe session and updated `stripe_checkout_session_id`.

- Attempt cross-salon access:
  - Staff in Salon A must not be able to create/resolve checkout sessions belonging to Salon B.

## Ops note

- Stripe event pruning suggestion:
  ```sql
  delete from public.stripe_events
  where created_at < now() - interval '90 days';
  ```

## Webhook auth sanity

- Webhook must **not** require staff auth/cookies.
- Only Stripe signature verification + metadata-based scoping should guard the route.
## Pre-prod DB checks

- Duplicate booking guard:
  ```sql
  select booking_id, count(*)
  from public.visits
  where booking_id is not null
  group by booking_id
  having count(*) > 1;
  ```

- Confirm partial unique index exists:
  ```sql
  select indexdef
  from pg_indexes
  where tablename='visits'
    and indexname like '%booking_id%';
  ```

- Confirm checkout line item constraints exist (FK, quantity > 0, unit_price_cents >= 0):
  ```sql
  \d public.checkout_line_items
  -- or inspect pg_constraint for quantity/unit_price checks
  ```

## Stripe verification

- Local webhook:
  ```bash
  stripe listen --forward-to localhost:3000/api/stripe/webhook
  ```

- Trigger events:
  ```bash
  stripe trigger checkout.session.expired
  stripe trigger checkout.session.completed
  stripe trigger checkout.session.async_payment_failed
  stripe trigger checkout.session.async_payment_succeeded
  ```

- Confirm webhook updates:
  - `checkout_sessions.status` transitions correctly (pending → completed/expired/failed)
  - `stripe_events` records event IDs (dedupe works)
  - `checkout_sessions.last_stripe_event_*` columns update

## Idempotency & concurrency checks

- Call `/api/checkout/session` twice rapidly for the same checkout_session_id:
  - Expect the same Stripe URL unless the prior session expired.

- Force a Stripe session to expire, then call `/api/checkout/session`:
  - Expect a brand-new Stripe session and updated `stripe_checkout_session_id`.

- Attempt cross-salon access:
  - Staff in Salon A must not be able to create/resolve checkout sessions belonging to Salon B.

## Ops note

- Stripe event pruning suggestion:
  ```sql
  delete from public.stripe_events
  where created_at < now() - interval '90 days';
  ```

## Webhook auth sanity

- Webhook must **not** require staff auth/cookies.
- Only Stripe signature verification + metadata-based scoping should guard the route.
## Pre-prod DB checks

- Duplicate booking guard:
  ```sql
  select booking_id, count(*)
  from public.visits
  where booking_id is not null
  group by booking_id
  having count(*) > 1;
  ```

- Confirm partial unique index exists:
  ```sql
  select indexdef
  from pg_indexes
  where tablename='visits'
    and indexname like '%booking_id%';
  ```

- Confirm checkout line item constraints exist (FK, quantity > 0, unit_price_cents >= 0):
  ```sql
  \d public.checkout_line_items
  -- or inspect pg_constraint for quantity/unit_price checks
  ```

## Stripe verification

- Local webhook:
  ```bash
  stripe listen --forward-to localhost:3000/api/stripe/webhook
  ```

- Trigger events:
  ```bash
  stripe trigger checkout.session.expired
  stripe trigger checkout.session.completed
  stripe trigger checkout.session.async_payment_failed
  stripe trigger checkout.session.async_payment_succeeded
  ```

- Confirm webhook updates:
  - `checkout_sessions.status` transitions correctly (pending → completed/expired/failed)
  - `stripe_events` records event IDs (dedupe works)
  - `checkout_sessions.last_stripe_event_*` columns update

## Idempotency & concurrency checks

- Call `/api/checkout/session` twice rapidly for the same checkout_session_id:
  - Expect the same Stripe URL unless the prior session expired.

- Force a Stripe session to expire, then call `/api/checkout/session`:
  - Expect a brand-new Stripe session and updated `stripe_checkout_session_id`.

- Attempt cross-salon access:
  - Staff in Salon A must not be able to create/resolve checkout sessions belonging to Salon B.

## Ops note

- Stripe event pruning suggestion:
  ```sql
  delete from public.stripe_events
  where created_at < now() - interval '90 days';
  ```

## Webhook auth sanity

- Webhook must **not** require staff auth/cookies.
- Only Stripe signature verification + metadata-based scoping should guard the route.
