## Booking Requests Hardening Plan (with kiosk auth test & types)

1) Kiosk auth hardening test
- Add `src/lib/auth/__tests__/requireKioskContext.test.ts`:
  - Missing token → throws UnauthorizedError (or recognizable auth error)
  - Wrong token → throws UnauthorizedError
  - Correct `KIOSK_TOKEN` → passes
  - Correct `KIOSK_TOKEN_2` → passes
- Per-test env setup/teardown; re-import module if needed to avoid cached env reads.
- If no UnauthorizedError exists, add a simple custom error class in `requireKioskContext` and have the route map it to 401.

2) RLS verification for booking_requests
- Ensure:
  - RLS enabled
  - SELECT/UPDATE policies for staff scoped by salon
  - No INSERT policy (service-role API inserts only)
- Manual query:
  ```sql
  select polname, permissive, cmd, roles
  from pg_policies
  where schemaname='public' and tablename='booking_requests'
  order by cmd, polname;
  ```

3) Supabase types
- Run `supabase gen types typescript ... > src/types/supabase.ts` to include booking_requests (commit the updated file).

4) Env/token rotation note
- Keep constant-time compare; accept `KIOSK_TOKEN` or `KIOSK_TOKEN_2`; ignore empty strings.

5) Re-run checks
- `npm run lint && npm run typecheck && npm run test:unit`

Acceptance criteria
- Kiosk POST works with only form fields; salon_id set server-side; phone normalized.
- Staff same-salon can patch; cross-salon is forbidden by route + RLS.
- Kiosk auth tests pass for missing/wrong/primary/secondary tokens.
- Types regenerated so downstream TS sees booking_requests.
