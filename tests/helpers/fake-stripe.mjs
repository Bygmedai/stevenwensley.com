// An in-memory stand-in for the three Stripe behaviours the receipt relies
// on: a Checkout Session expands to its PaymentIntent, a PaymentIntent's
// metadata is stored on update, and an Idempotency-Key reused with different
// parameters is refused (400 idempotency_error), as Stripe does. Shared by
// the unit tests and the browser test, so both exercise the same Stripe.

import assert from 'node:assert/strict';

export const SESSION = 'cs_test_a1B2c3D4e5F6g7H8';
export const ENV = { STRIPE_SECRET_KEY: 'sk_test_x', RECEIPT_PAYMENT_LINK: 'https://buy.stripe.com/test_abc123' };

export function fakeStripe({ paid = true, amount = 149700, currency = 'dkk', delayMs = 0 } = {}) {
  const pi = { id: 'pi_123', status: paid ? 'succeeded' : 'requires_payment_method', metadata: {} };
  const keys = new Map();
  const calls = [];
  const reply = (status, body) => new Response(JSON.stringify(body), { status });
  const fetchImpl = async (url, init = {}) => {
    const u = new URL(url);
    calls.push(`${init.method || 'GET'} ${u.pathname}`);
    assert.equal(init.headers.Authorization, 'Bearer sk_test_x');
    if (u.pathname === `/v1/checkout/sessions/${SESSION}`) {
      return reply(200, {
        id: SESSION, payment_status: paid ? 'paid' : 'unpaid', amount_total: amount, currency,
        customer_details: { name: 'Søren Ærø', email: 'soren@example.dk' },
        payment_intent: { ...pi, metadata: { ...pi.metadata } },
      });
    }
    if (u.pathname.startsWith('/v1/checkout/sessions/')) return reply(404, { error: { type: 'invalid_request_error' } });
    if (u.pathname === '/v1/payment_intents/pi_123' && init.method === 'POST') {
      const key = init.headers['Idempotency-Key'];
      if (keys.has(key) && keys.get(key) !== init.body) return reply(400, { error: { type: 'idempotency_error' } });
      keys.set(key, init.body);
      if (delayMs) await new Promise((r) => setTimeout(r, delayMs));
      for (const [k, v] of new URLSearchParams(init.body)) pi.metadata[k.slice(9, -1)] = v;
      return reply(200, pi);
    }
    if (u.pathname === '/v1/payment_intents/pi_123') return reply(200, pi);
    if (u.pathname === '/v1/payment_intents/search') {
      const want = /metadata\['receipt_id'\]:'([^']+)'/.exec(u.searchParams.get('query'))?.[1];
      return reply(200, { data: pi.metadata.receipt_id === want ? [pi] : [] });
    }
    return reply(500, {});
  };
  return { fetchImpl, pi, calls };
}
