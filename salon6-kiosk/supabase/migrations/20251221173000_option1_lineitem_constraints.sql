-- Checkout line item constraints and cascade

alter table public.checkout_line_items
  alter column quantity set not null,
  alter column unit_price_cents set not null,
  add constraint checkout_line_items_quantity_positive check (quantity > 0),
  add constraint checkout_line_items_unit_price_nonnegative check (unit_price_cents >= 0);

-- FK already exists; ensure on delete cascade (re-create if needed)
do $$
begin
  if not exists (
    select 1
    from information_schema.constraint_column_usage ccu
    join information_schema.referential_constraints rc on rc.constraint_name = ccu.constraint_name
    where ccu.table_name = 'checkout_line_items'
      and ccu.column_name = 'checkout_session_id'
  ) then
    alter table public.checkout_line_items
      add constraint checkout_line_items_session_fkey
      foreign key (checkout_session_id) references public.checkout_sessions(id) on delete cascade;
  end if;
end $$;
