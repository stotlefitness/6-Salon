## Salon 6 Kiosk/Admin

Next.js App Router + Supabase + Stripe. Two surfaces: kiosk (iPad, public) and admin (internal).

### Stack
- Next.js (TypeScript, Tailwind, ESLint, App Router)
- Supabase (Postgres/Auth/Storage)
- Stripe (Checkout + webhooks)
- Zod for request validation

### App structure
- `src/app/(kiosk)/kiosk/**` – kiosk flows: check-in, book, checkout.
- `src/app/(admin)/**` – admin dashboard, bookings, reports, catalog, stylists.
- `src/app/api/**` – server routes for kiosk/admin and Stripe webhook.
- `src/lib/**` – shared clients (`supabase-server`, `supabase-browser`, `stripe`, `auth`), validation schemas.
- `db/` – `schema.sql` (source of truth) and `seed.sql`.
- `scripts/` – `migrate.mjs` and `seed.mjs` stubs; wire to Supabase CLI later.

### Environments

| Env        | Next.js URL                               | Supabase project | Stripe mode | Branch  |
| ---------- | ----------------------------------------- | ---------------- | ----------- | ------- |
| Local      | http://localhost:3000                     | staging or local | Test        | feature |
| Staging    | https://salon6-kiosk-staging.vercel.app   | salon6-staging   | Test        | staging |
| Production | https://salon6-kiosk.vercel.app           | salon6-prod      | Live        | main    |

### Environment variables

Anything used in the browser must start with `NEXT_PUBLIC_`. Keep secrets out of React/client code.

- Core / Supabase  
  - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (client + server)  
  - `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET`, `DATABASE_URL` (server only)
- Stripe  
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (client + server)  
  - `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` (server only; webhook secret differs per env)
- App URLs / misc  
  - `NEXT_PUBLIC_APP_URL` (per env base URL)  
  - `KIOSK_LOCATION_ID` (optional: seed a primary location)  
  - `NODE_ENV` (managed by Vercel)

Set these in Vercel Project Settings (Production vs Preview scopes) and locally in `.env.local` (not committed).

### Setup
1) Install deps  
```bash
npm install
```

2) Environment  
Create `.env.local` (and `.env.test` for tests) with:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_123
STRIPE_SECRET_KEY=sk_test_123
STRIPE_WEBHOOK_SECRET=whsec_123
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3) Supabase  
Initialize once per dev machine:  
```bash
npx supabase init
```
Migrations will be driven from `db/schema.sql`.

### Supabase migrations
- Author schema changes in `db/schema.sql`, then generate a migration:  
  ```bash
  supabase db diff -f 2025XXXXXX_add_change
  ```
  This writes to `supabase/migrations/`.
- Apply to the linked (staging/dev) project:  
  ```bash
  supabase db push
  ```
- Commit the migration file with the feature. Production gets migrations via CI (see below).

### Deployment (Vercel)
- Project: `salon6-kiosk`, connected to GitHub `stotlefitness/6-Salon`.
- Build: default `next build`; output `.next`; Node 20.x (Vercel default is OK).
- Env scopes: Preview → staging Supabase + Stripe Test; Production → prod Supabase + Stripe Live.
- `NEXT_PUBLIC_APP_URL` should match the Vercel URL per env.

### Stripe webhooks
- Endpoint: `/api/stripe/webhook` (validates with `STRIPE_WEBHOOK_SECRET`).
- Local:  
  ```bash
  stripe listen --forward-to localhost:3000/api/stripe/webhook
  ```
  Use the printed `whsec_...` in `.env.local`.
- Staging: point Stripe Test webhook to `https://salon6-kiosk-staging.vercel.app/api/stripe/webhook`.
- Prod: point Stripe Live webhook to `https://salon6-kiosk.vercel.app/api/stripe/webhook` with a separate signing secret.

### Stripe Checkout (server-side only)
- Create a checkout session via `POST /api/checkout/session` with `{ checkoutSessionId: <uuid> }` (internal ID in `checkout_sessions`).
- Line items must be stored in `checkout_line_items`; the API builds dynamic `price_data` for Stripe.
- Webhook (`/api/stripe/webhook`) is the source of truth for payment status; duplicate events are ignored via `stripe_events`.

### Scripts
- `npm run dev` – start Next.js
- `node scripts/migrate.mjs` – apply pending migrations to the linked Supabase project
- `node scripts/seed.mjs` – seed the linked Supabase project
- `npm run lint` – ESLint

### Seeded check-in personas (local QA)
Run `npm run db:seed` (applies `supabase/seed.sql` via Supabase CLI). Then open `http://localhost:3000/kiosk/check-in` and try these phones/last names:

| Scenario | Phone | Last name | Expected |
| --- | --- | --- | --- |
| Two bookings today (select one) | `(555) 010-0100` | `Morgan` | MULTIPLE → selection screen (10:00 + 13:00) |
| Already checked in | `2485550000` | `Lee` | CHECKED_IN without mutating timestamps |
| No booking today (has tomorrow) | `(248) 555-1234` | `Valdez` | NO_BOOKING_TODAY messaging |
| No booking today (had yesterday) | `248-555-9999` | `Green` | NO_BOOKING_TODAY messaging |
| Late-night boundary | `313 555 1212` | `Night` | Booking at ~23:30 local shows as today |
| Case-insensitive last name + dotted phone | `248.555.7777` | `VALDEZ` | Should match Dana Valdez and return NO_BOOKING_TODAY |

Admin dashboard (`/admin`) reflects status changes (scheduled → checked_in) for today’s window.

### Admin authentication setup (local)

The admin dashboard requires authentication. To set up a dev staff user:

1. **Create a Supabase auth user** via the Supabase dashboard (Authentication → Users → Add user) or via SQL:
   ```sql
   -- Replace with your email and a secure password hash
   -- You can generate a password hash using: SELECT crypt('your-password', gen_salt('bf'));
   INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
   VALUES (
     gen_random_uuid(),
     'admin@example.com',
     crypt('your-password', gen_salt('bf')),
     now(),
     now(),
     now()
   );
   ```

2. **Link the auth user to a staff_users record**:
   ```sql
   -- Replace 'your-user-id' with the auth.users.id from step 1
   INSERT INTO staff_users (user_id, salon_id, role, display_name)
   VALUES (
     'your-user-id',
     '00000000-0000-0000-0000-000000000001', -- Birmingham salon
     'owner',
     'Dev Admin'
   );
   ```

3. **Sign in** at `http://localhost:3001/login` with the email/password from step 1.

### Deployment checklist / rollback
1) Add schema changes → generate migration → commit.
2) Merge to `main` → CI runs Supabase migrations against prod.
3) Vercel deploys `main` to production (env vars already set).
4) Verify webhook delivery and basic flows (kiosk check-in, checkout).

Rollback: use Vercel rollback for the app; use Supabase point-in-time recovery or manual rollback migration for data.

### Notes
- Node 20.9+ is recommended (Next.js 16 requires it).
- Keep secrets out of git; only example values should be committed.
