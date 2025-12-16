import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

export function getStripeClient() {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/bdc49661-e23b-4925-af4c-a5a6bbd1c932',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'src/lib/stripe.ts:getStripeClient',message:'entry getStripeClient',data:{hasKey:Boolean(stripeSecretKey)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H3'})}).catch(()=>{});
  // #endregion
  if (!stripeSecretKey) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/bdc49661-e23b-4925-af4c-a5a6bbd1c932',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'src/lib/stripe.ts:getStripeClient',message:'missing stripe secret',data:{hasKey:Boolean(stripeSecretKey)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H3'})}).catch(()=>{});
    // #endregion
    throw new Error("Stripe secret key is missing");
  }

  return new Stripe(stripeSecretKey, {
    apiVersion: "2025-11-17.clover",
  });
}



