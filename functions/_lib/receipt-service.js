// The paid receipt's server side: check the payment with Stripe, issue the
// receipt once, and look it up again later.
//
// Stripe is the only store. A receipt is written as metadata on the payment
// it was bought with, so there is no database to provision, back up or keep
// in step with the money: the record of what was sold lives on the sale.
// That gives two rules for free:
//
//   one payment, one receipt — a second request for the same payment gets
//   the receipt already written on it, never a new one with other answers;
//
//   a receipt can be checked — /verify-receipt finds the payment by its
//   receipt number and shows what was issued, and nothing that identifies
//   who paid.
//
// Environment (Cloudflare Pages → Settings → Environment variables):
//   STRIPE_SECRET_KEY       required. A restricted key is enough: Checkout
//                           Sessions read, PaymentIntents write.
//   RECEIPT_PAYMENT_LINK    required. https://buy.stripe.com/… — the paid
//                           button stays hidden until this and the key exist.
//   RECEIPT_AMOUNT          optional, in øre. Default 149700 (1.497 kr).
//   RECEIPT_CURRENCY        optional. Default dkk.

import NIS2 from '../../js/nis2-model.js';

export const DEFAULT_AMOUNT = 149700;
export const DEFAULT_CURRENCY = 'dkk';
export const SESSION_RE = /^cs_(test|live)_[A-Za-z0-9]{10,200}$/;
// Crockford base32 without I, L, O, U: nothing a reader can mistype.
const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
export const RECEIPT_RE = /^NIS2-[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{4}$/;

const STRIPE = 'https://api.stripe.com/v1';

export function offer(env) {
  const amount = Number(env.RECEIPT_AMOUNT || DEFAULT_AMOUNT);
  const currency = String(env.RECEIPT_CURRENCY || DEFAULT_CURRENCY).toLowerCase();
  const link = String(env.RECEIPT_PAYMENT_LINK || '');
  return {
    available: Boolean(env.STRIPE_SECRET_KEY) && /^https:\/\/buy\.stripe\.com\/[A-Za-z0-9_]+$/.test(link),
    paymentLink: link,
    amount,
    currency,
  };
}

const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
const sha256 = async (str) => hex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str)));

// Changes whenever a question, an option or a domain changes. Printed on the
// receipt and stored with it, so a receipt always says which questions it
// answered.
export const questionSet = async () => `v${(await sha256(JSON.stringify(NIS2.domains))).slice(0, 8)}`;

export async function fingerprint(qset, answers) {
  return (await sha256(`${qset}:${answers}`)).slice(0, 32).match(/.{4}/g).join(' ');
}

export function newReceiptId() {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  const chars = [...bytes].map((b) => ALPHABET[b % 32]).join('');
  return `NIS2-${chars.slice(0, 4)}-${chars.slice(4)}`;
}

// "43|33,33,50,…" — the overall and per-domain results at issue time. Stored
// rather than recomputed at verification, so a later edit to the questions
// can never change what a receipt already said.
export const encodeScores = ({ overallPct, domainScores }) => `${overallPct}|${domainScores.map((d) => d.pct).join(',')}`;
export function decodeScores(str) {
  const m = /^(\d{1,3})\|([\d,]+)$/.exec(str || '');
  if (!m) return null;
  return { overallPct: Number(m[1]), domainPcts: m[2].split(',').map(Number) };
}

class Failure extends Error {
  constructor(status, code) { super(code); this.status = status; this.code = code; }
}
export { Failure };

async function stripe(env, fetchImpl, path, form, idempotencyKey) {
  let res;
  try {
    res = await fetchImpl(`${STRIPE}${path}`, {
      method: form ? 'POST' : 'GET',
      headers: {
        Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
        ...(form ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}),
        ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
      },
      body: form ? new URLSearchParams(form).toString() : undefined,
    });
  } catch {
    throw new Failure(502, 'stripe_unreachable');
  }
  if (res.status === 404) throw new Failure(404, 'not_found');
  if ((res.status === 400 || res.status === 409) && idempotencyKey) {
    const body = await res.json().catch(() => ({}));
    if (body?.error?.type === 'idempotency_error') throw new Failure(409, 'already_issuing');
  }
  if (!res.ok) throw new Failure(502, 'stripe_error');
  try { return await res.json(); } catch { throw new Failure(502, 'stripe_error'); }
}

function stored(pi) {
  const md = (pi && pi.metadata) || {};
  if (!md.receipt_id) return null;
  return {
    receiptId: md.receipt_id,
    issuedAt: md.receipt_issued,
    answers: md.receipt_answers,
    questionSet: md.receipt_qset,
    fingerprint: md.receipt_fp,
    scores: decodeScores(md.receipt_scores),
  };
}

/**
 * Checks the Checkout Session and returns the receipt for it — the one already
 * written on the payment if there is one, otherwise a new one from `answers`.
 */
export async function issueReceipt(env, { sessionId, answers }, { fetchImpl = (...a) => fetch(...a), now = () => new Date(), sleep = (ms) => new Promise((r) => setTimeout(r, ms)) } = {}) {
  if (!env.STRIPE_SECRET_KEY) throw new Failure(503, 'not_configured');
  if (typeof sessionId !== 'string' || !SESSION_RE.test(sessionId)) throw new Failure(400, 'bad_session');

  const session = await stripe(env, fetchImpl, `/checkout/sessions/${encodeURIComponent(sessionId)}?expand[]=payment_intent`);
  if (session.payment_status !== 'paid') throw new Failure(402, 'not_paid');
  const { amount, currency } = offer(env);
  if (session.amount_total !== amount || String(session.currency).toLowerCase() !== currency) throw new Failure(409, 'wrong_amount');
  const pi = session.payment_intent;
  if (!pi || typeof pi !== 'object' || !pi.id) throw new Failure(409, 'no_payment_intent');

  const customer = session.customer_details || {};
  const issuedTo = [customer.name, customer.email].filter(Boolean).join(' · ');
  const qset = await questionSet();

  const existing = stored(pi);
  if (existing) {
    // Issued before. The answers on the payment win over whatever the
    // browser sends now — that is what makes it one receipt, not a fresh one
    // per retake.
    if (existing.questionSet !== qset) throw new Failure(409, 'question_set_changed');
    return { ...existing, issuedTo, reused: true };
  }

  if (!NIS2.decodeAnswers(answers)) throw new Failure(400, 'bad_answers');
  // Clicking through every domain without answering is allowed on screen;
  // a paid record of nothing is not.
  if (!/[0-3]/.test(answers)) throw new Failure(400, 'no_answers');
  const receipt = {
    receiptId: newReceiptId(),
    issuedAt: now().toISOString().replace(/\.\d{3}Z$/, 'Z'),
    answers,
    questionSet: qset,
    fingerprint: await fingerprint(qset, answers),
  };
  const scores = encodeScores(NIS2.score(NIS2.decodeAnswers(answers)));
  // Two tabs pressing download at the same moment would each find no
  // receipt and each write one; the second would silently replace the first,
  // and the first customer's PDF would carry a number that no longer checks
  // out. One idempotency key per payment makes Stripe accept the first write
  // and refuse any different second one, which then reads back the first.
  try {
    await stripe(env, fetchImpl, `/payment_intents/${encodeURIComponent(pi.id)}`, {
      'metadata[receipt_id]': receipt.receiptId,
      'metadata[receipt_issued]': receipt.issuedAt,
      'metadata[receipt_answers]': receipt.answers,
      'metadata[receipt_qset]': receipt.questionSet,
      'metadata[receipt_fp]': receipt.fingerprint,
      'metadata[receipt_scores]': scores,
    }, `nis2-receipt-${pi.id}`);
  } catch (e) {
    if (e.code !== 'already_issuing') throw e;
    // The first write may still be in flight: read back a few times before
    // giving up, rather than failing the second tab outright.
    for (let attempt = 1; attempt <= 5; attempt++) {
      const first = stored(await stripe(env, fetchImpl, `/payment_intents/${encodeURIComponent(pi.id)}`));
      if (first) return { ...first, issuedTo, reused: true };
      await sleep(200 * attempt);
    }
    throw new Failure(503, 'retry');
  }
  return { ...receipt, scores: decodeScores(scores), issuedTo, reused: false };
}

/**
 * Looks a receipt up by its number. Returns only what the receipt itself
 * prints about the result — never the name, e-mail or answers.
 */
export async function verifyReceipt(env, receiptId, { fetchImpl = (...a) => fetch(...a) } = {}) {
  if (!env.STRIPE_SECRET_KEY) throw new Failure(503, 'not_configured');
  const id = String(receiptId || '').trim().toUpperCase();
  if (!RECEIPT_RE.test(id)) throw new Failure(400, 'bad_receipt_id');

  const query = `metadata['receipt_id']:'${id}'`;
  const found = await stripe(env, fetchImpl, `/payment_intents/search?query=${encodeURIComponent(query)}&limit=2`);
  const hits = (found.data || []).filter((pi) => pi.status === 'succeeded' && stored(pi)?.receiptId === id);
  if (hits.length !== 1) throw new Failure(404, 'not_found');

  const r = stored(hits[0]);
  const scores = r.scores || { overallPct: null, domainPcts: [] };
  return {
    receiptId: r.receiptId,
    issuedAt: r.issuedAt,
    questionSet: r.questionSet,
    fingerprint: r.fingerprint,
    overallPct: scores.overallPct,
    domains: NIS2.domains.map((d, i) => ({ name: d.name, ref: d.ref, pct: scores.domainPcts[i] ?? null })),
  };
}

export function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}
