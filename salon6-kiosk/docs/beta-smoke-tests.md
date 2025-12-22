## Beta v1 Smoke Checklist (staging/prod)

Run these in the deployed environment before every pilot:

1. **Kiosk booking request**
   - Submit with valid token → success screen → auto-reset.
   - Submit with invalid token → friendly error (401 path).
   - Confirm entry appears in `Admin → Requests` with `status = new`.
2. **Admin triage**
   - Click “Start triage” → optimistic update holds.
   - Toggle status back/forth once → no double-submit issues.
   - Add `staff_note` → persists.
   - Set status to `scheduled_in_phorest` → Phorest ID unlocks → save ID successfully.
3. **Visits + Today board**
   - Create or check-in a visit (walk-in + booking if possible) → Today shows `waiting`.
   - Mark visit completed (real flow or manual `completed_at`) → Today shows `completed`.
4. **Payments**
   - Create checkout session → pay via Stripe test mode.
   - Webhook marks session `completed` → Today payments totals increment.
   - Auto polling/manual refresh shows updates without flicker or duplication.

If any step fails, capture:
- Route + HTTP status
- Console log line (see logging section) that correlates

## Logging references
- `ctx: stripe_webhook` – event type, Stripe IDs, resulting status.
- `ctx: checkout_session` – creation/reuse branch, errors.
- `ctx: booking_requests` – POST + PATCH success/failure with IDs.

## Kiosk token rotation (operational)

Rotate kiosk tokens weekly (calendar reminder) using dual tokens:

1. Generate new token → set as `NEXT_PUBLIC_KIOSK_TOKEN_2`.
2. Update kiosk device to use token 2.
3. Swap env vars (`KIOSK_TOKEN = KIOSK_TOKEN_2`, clear token 2) after devices confirmed.
4. Repeat for the next rotation.

Keep kiosk iPads locked down and on trusted networks during beta.***

