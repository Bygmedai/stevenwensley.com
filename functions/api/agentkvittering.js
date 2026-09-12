// GET /api/agentkvittering?session_id=cs_...
//
// Cloudflare Pages Function. Verifies a Stripe Checkout session and returns
// JSON. The PDF itself is built in the browser from the scan snapshot after
// this gate returns paid — see js/agentkvittering.js.
//
// Required env (Cloudflare Pages ? Settings ? Environment variables):
//   STRIPE_SECRET_KEY          sk_test_… or sk_live_…
// Optional:
//   STRIPE_EXPECTED_AMOUNT     default 149700 (1.497 kr)
//   STRIPE_EXPECTED_CURRENCY   default dkk

import { verifyStripeSession } from '../_lib/verify-stripe-session.js';

const NO_STORE = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
};

function json(status, body) {
  return new Response(JSON.stringify(body), { status, headers: NO_STORE });
}

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const sessionId = url.searchParams.get('session_id');
  const result = await verifyStripeSession(sessionId, context.env);

  if (!result.ok) {
    return json(result.status, {
      paid: false,
      error: result.error,
      payment_status: result.payment_status,
    });
  }

  return json(200, {
    paid: true,
    session_id: result.session_id,
    amount_total: result.amount_total,
    currency: result.currency,
    created: result.created,
  });
}
