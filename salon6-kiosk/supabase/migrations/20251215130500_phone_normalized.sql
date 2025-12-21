-- Normalize phone numbers for customer lookups and kiosk check-in.
-- Adds phone_normalized, backfills, and indexes for faster case-insensitive search.

create or replace function public.normalize_phone_sql(raw text)
returns text
language plpgsql
as $$
declare
  digits text;
begin
  digits := regexp_replace(coalesce(raw, ''), '\D', '', 'g');
  if length(digits) < 10 then
    raise exception 'phone number too short';
  end if;

  if length(digits) = 10 then
    return '+1' || digits;
  elsif length(digits) = 11 and digits like '1%' then
    return '+' || digits;
  else
    return '+' || digits;
  end if;
end;
$$;

alter table customers add column if not exists phone_normalized text;

update customers
set phone_normalized = normalize_phone_sql(phone)
where phone_normalized is null;

alter table customers alter column phone_normalized set not null;

create index if not exists idx_customers_salon_phone_normalized_last
  on customers (salon_id, phone_normalized, lower(last_name));



