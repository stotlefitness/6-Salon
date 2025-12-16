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
```

3) Supabase  
Initialize once per dev machine:  
```bash
npx supabase init
```
Migrations will be driven from `db/schema.sql`.

### Scripts
- `npm run dev` – start Next.js
- `node scripts/migrate.mjs` – preview schema apply (TODO: wire to Supabase CLI)
- `node scripts/seed.mjs` – preview seed (TODO)
- `npm run lint` – ESLint

### Notes
- Node 20.9+ is recommended (Next.js 16 requires it).
- Keep secrets out of git; only example values should be committed.
