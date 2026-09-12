// Shared Stripe Checkout session check for Agentkvittering.
//
// Same gate as BygMedAI M1: the browser comes back with
// session_id={CHECKOUT_SESSION_ID}, the server asks Stripe whether that
// session is paid, and nothing is unlocked until payment_status=paid.
// The amount check stops a 1-kr test Payment Link from opening the SKU.

export const EXPECTED_AMOUNT = 149700; // 1.497 kr in øre
export const EXPECTED_CURRENCY = 'dkk';
export const SESSION_ID_RE = /^cs_(test_|live_)[A-Za-z0-9]+$/;

/**
 * @param {string | null | undefined} sessionId
 * @param {{ STRIPE_SECRET_KEY?: string, STRIPE_EXPECTED_AMOUNT?: string, STRIPE_EXPECTED_CURRENCY?: string }} env
 * @param {typeof fetch} [fetchImpl]
 */
export async function verifyStripeSession(sessionId, env, fetchImpl = fetch) {
  if (!sessionId || !SESSION_ID_RE.test(sessionId)) {
    return { ok: false, status: 400, error: 'ugyldig_session' };
  }

  const key = env && env.STRIPE_SECRET_KEY;
  if (!key) {
    return { ok: false, status: 503, error: 'stripe_ikke_konfigureret' };
  }

  let res;
  try {
    res = await fetchImpl(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, {
      headers: { Authorization: `Bearer ${key}` },
    });
  } catch {
    return { ok: false, status: 502, error: 'stripe_fejl' };
  }

  if (res.status === 404) {
    return { ok: false, status: 404, error: 'session_ikke_fundet' };
  }
  if (!res.ok) {
    return { ok: false, status: 502, error: 'stripe_fejl' };
  }

  let session;
  try {
    session = await res.json();
  } catch {
    return { ok: false, status: 502, error: 'stripe_fejl' };
  }

  if (session.payment_status !== 'paid') {
    return {
      ok: false,
      status: 402,
      error: 'ikke_betalt',
      payment_status: session.payment_status || 'unknown',
    };
  }

  const expectedAmount = Number(env.STRIPE_EXPECTED_AMOUNT || EXPECTED_AMOUNT);
  const expectedCurrency = String(env.STRIPE_EXPECTED_CURRENCY || EXPECTED_CURRENCY).toLowerCase();
  const currency = String(session.currency || '').toLowerCase();

  if (session.amount_total !== expectedAmount || currency !== expectedCurrency) {
    return {
      ok: false,
      status: 409,
      error: 'forkert_beloeb',
      amount_total: session.amount_total,
      currency,
    };
  }

  return {
    ok: true,
    status: 200,
    paid: true,
    session_id: session.id,
    amount_total: session.amount_total,
    currency,
    created: session.created,
  };
}
