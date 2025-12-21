-- Follow-up hardening: checkout_sessions metadata, last event trace, stripe idempotency guard, and visits empty-check (if text).

-- Add last Stripe event trace columns
alter table public.checkout_sessions
  add column if not exists last_stripe_event_id text,
  add column if not exists last_stripe_event_type text,
  add column if not exists last_stripe_event_at timestamptz;

-- Ensure stripe_checkout_session_id uniqueness (already set as unique; keep index)
create unique index if not exists checkout_sessions_stripe_session_id_unique
  on public.checkout_sessions (stripe_checkout_session_id)
  where stripe_checkout_session_id is not null;

-- If booking_id were text, guard against empty string (noop if uuid)
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'visits'
      and column_name = 'booking_id'
      and data_type = 'text'
  ) then
    alter table public.visits
      add constraint visits_booking_id_not_empty check (booking_id is null or booking_id <> '');
  end if;
end $$;

-- Sanity note (manual pre-check before applying this migration in prod):
-- select booking_id, count(*) from public.visits where booking_id is not null group by booking_id having count(*) > 1;

