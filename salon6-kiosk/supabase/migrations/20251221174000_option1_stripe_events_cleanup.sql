-- Stripe events cleanup support

alter table public.stripe_events
  alter column created_at set not null,
  alter column created_at set default now();

create index if not exists stripe_events_created_at_idx
  on public.stripe_events (created_at);

-- Reminder: prune old events periodically, e.g. delete where created_at < now() - interval '90 days'.
