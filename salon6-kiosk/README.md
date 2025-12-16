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

### Scripts
- `npm run dev` – start Next.js
- `node scripts/migrate.mjs` – apply pending migrations to the linked Supabase project
- `node scripts/seed.mjs` – seed the linked Supabase project
- `npm run lint` – ESLint

### Check-in flow (local smoke test)
1) Seed the database: `npm run db:seed` (uses `supabase/seed.sql`).  
2) Start the app: `npm run dev`.  
3) Open `http://localhost:3000/kiosk/check-in`.  
4) Use the seeded booking: phone `(555) 010-0100`, last name `Morgan`.  
   - Single booking auto-checks in and returns to kiosk home after a few seconds.  
5) Multiple bookings (if added) will render selection cards and call `/api/kiosk/check-in/confirm`.  
6) Admin dashboard (`/admin`) reflects `checked_in` counts for the salon (RLS keeps data salon-scoped).

### Deployment checklist / rollback
1) Add schema changes → generate migration → commit.
2) Merge to `main` → CI runs Supabase migrations against prod.
3) Vercel deploys `main` to production (env vars already set).
4) Verify webhook delivery and basic flows (kiosk check-in, checkout).

Rollback: use Vercel rollback for the app; use Supabase point-in-time recovery or manual rollback migration for data.

### Notes
- Node 20.9+ is recommended (Next.js 16 requires it).
- Keep secrets out of git; only example values should be committed.
