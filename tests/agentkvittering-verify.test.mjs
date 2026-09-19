import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import {
  EXPECTED_AMOUNT,
  EXPECTED_CURRENCY,
  SESSION_ID_RE,
  verifyStripeSession,
} from '../functions/_lib/verify-stripe-session.js';
import { onRequestGet } from '../functions/api/agentkvittering.js';

const require = createRequire(import.meta.url);
const Agentkvittering = require('../js/agentkvittering.js');

const SAMPLE_DOMAINS = [
  {
    id: 'governance',
    name: 'Governance',
    ref: 'Art. 20',
    subtitle: 'Board',
    questions: [
      { text: 'Policy?', options: ['None', 'Draft', 'Approved', 'Integrated'] },
      { text: 'Training?', options: ['None', 'General', 'Planned', 'Done'] },
    ],
  },
  {
    id: 'incident',
    name: 'Incident',
    ref: 'Art. 23',
    subtitle: 'Reporting',
    questions: [{ text: 'Plan?', options: ['None', 'Informal', 'Documented', 'Tested'] }],
  },
];

function fetchMock(handler) {
  return async (url, init) => handler(String(url), init || {});
}

describe('Stripe session id', () => {
  it('accepts test and live Checkout ids only', () => {
    assert.equal(SESSION_ID_RE.test('cs_test_abc123'), true);
    assert.equal(SESSION_ID_RE.test('cs_live_xyz789'), true);
    assert.equal(SESSION_ID_RE.test('pi_abc'), false);
    assert.equal(SESSION_ID_RE.test('https://api.stripe.com/v1/checkout/sessions/cs_test_x'), false);
    assert.equal(SESSION_ID_RE.test('../cs_test_x'), false);
  });
});

describe('verifyStripeSession', () => {
  it('rejects a missing or malformed session id', async () => {
    const missing = await verifyStripeSession('', { STRIPE_SECRET_KEY: 'sk_test_x' });
    assert.equal(missing.status, 400);
    assert.equal(missing.error, 'ugyldig_session');
  });

  it('returns 503 when the secret is not configured', async () => {
    const result = await verifyStripeSession('cs_test_abc', {});
    assert.equal(result.status, 503);
    assert.equal(result.error, 'stripe_ikke_konfigureret');
  });

  it('unlocks only when payment_status is paid and the amount is 1.497 kr', async () => {
    const fetchImpl = fetchMock(async (url, init) => {
      assert.match(url, /\/v1\/checkout\/sessions\/cs_test_paid$/);
      assert.match(init.headers.Authorization, /^Bearer sk_test_/);
      return {
        ok: true,
        status: 200,
        json: async () => ({
          id: 'cs_test_paid',
          payment_status: 'paid',
          amount_total: EXPECTED_AMOUNT,
          currency: EXPECTED_CURRENCY,
          created: 1700000000,
        }),
      };
    });

    const result = await verifyStripeSession('cs_test_paid', { STRIPE_SECRET_KEY: 'sk_test_x' }, fetchImpl);
    assert.equal(result.ok, true);
    assert.equal(result.paid, true);
    assert.equal(result.amount_total, 149700);
    assert.equal(result.currency, 'dkk');
  });

  it('rejects unpaid sessions', async () => {
    const fetchImpl = fetchMock(async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        id: 'cs_test_unpaid',
        payment_status: 'unpaid',
        amount_total: EXPECTED_AMOUNT,
        currency: 'dkk',
      }),
    }));
    const result = await verifyStripeSession('cs_test_unpaid', { STRIPE_SECRET_KEY: 'sk_test_x' }, fetchImpl);
    assert.equal(result.status, 402);
    assert.equal(result.error, 'ikke_betalt');
  });

  it('rejects a paid session with the wrong amount', async () => {
    const fetchImpl = fetchMock(async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        id: 'cs_test_cheap',
        payment_status: 'paid',
        amount_total: 100,
        currency: 'dkk',
      }),
    }));
    const result = await verifyStripeSession('cs_test_cheap', { STRIPE_SECRET_KEY: 'sk_test_x' }, fetchImpl);
    assert.equal(result.status, 409);
    assert.equal(result.error, 'forkert_beloeb');
  });
});

describe('GET /api/agentkvittering', () => {
  it('returns JSON paid:true after a verified session', async () => {
    const prev = globalThis.fetch;
    globalThis.fetch = fetchMock(async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        id: 'cs_test_paid',
        payment_status: 'paid',
        amount_total: 149700,
        currency: 'dkk',
        created: 1700000000,
      }),
    }));
    try {
      const res = await onRequestGet({
        request: new Request('https://stevenwensley.com/api/agentkvittering?session_id=cs_test_paid'),
        env: { STRIPE_SECRET_KEY: 'sk_test_x' },
      });
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.paid, true);
      assert.equal(body.session_id, 'cs_test_paid');
      assert.equal(res.headers.get('cache-control'), 'no-store');
    } finally {
      globalThis.fetch = prev;
    }
  });

  it('does not unlock without a secret', async () => {
    const res = await onRequestGet({
      request: new Request('https://stevenwensley.com/api/agentkvittering?session_id=cs_test_paid'),
      env: {},
    });
    assert.equal(res.status, 503);
    const body = await res.json();
    assert.equal(body.paid, false);
    assert.equal(body.error, 'stripe_ikke_konfigureret');
  });
});

describe('Agentkvittering document model', () => {
  it('prices the SKU at 1.497 kr and keeps the placeholder Payment Link obvious', () => {
    assert.equal(Agentkvittering.PRICE_LABEL, '1.497 kr');
    assert.equal(Agentkvittering.PRICE_ORE, 149700);
    assert.equal(Agentkvittering.isPlaceholderLink(), true);
    assert.match(Agentkvittering.STRIPE_PAYMENT_LINK, /REPLACE_AGENTKVITTERING/);
    assert.equal(Agentkvittering.VERSION, 'AK-NIS2-1.0');
  });

  it('builds a receipt model: reviewed domains, findings, human follow-up', () => {
    const answers = { '0-0': 0, '0-1': 3, '1-0': 1 };
    const model = Agentkvittering.buildModel(SAMPLE_DOMAINS, answers, {
      session_id: 'cs_test_paid',
      paid: true,
    });
    assert.equal(model.title, 'Agentkvittering');
    assert.match(model.subtitle, /ikke et dashboard/i);
    assert.equal(model.questionCount, 3);
    assert.equal(model.domainCount, 2);
    assert.equal(model.overallPct, Math.round((0 + 3 + 1) / 9 * 100));
    assert.equal(model.overallLight.key, 'gul');
    assert.equal(model.findings.length, 2);
    assert.ok(model.needsHuman.length >= 2);
    assert.ok(model.needsHuman.every((h) => h.why));
    assert.equal(model.payment.session_id, 'cs_test_paid');
    assert.match(model.documentId, /^AK-NIS2-\d{8}-[a-f0-9]{8}$/);
    assert.match(model.disclaimer, /ikke en erklæring om NIS2-overensstemmelse/i);
  });

  it('writes the snapshot onto globalThis.localStorage', () => {
    const mem = Object.create(null);
    const prev = globalThis.localStorage;
    globalThis.localStorage = {
      setItem(k, v) { mem[k] = String(v); },
      getItem(k) { return Object.prototype.hasOwnProperty.call(mem, k) ? mem[k] : null; },
    };
    try {
      Agentkvittering.saveSnapshot({ answers: { '0-0': 2 } });
      const loaded = Agentkvittering.loadSnapshot();
      assert.ok(loaded);
      assert.equal(loaded.answers['0-0'], 2);
    } finally {
      if (prev === undefined) delete globalThis.localStorage;
      else globalThis.localStorage = prev;
    }
  });

  it('still asks for a human when every answer is green', () => {
    const answers = { '0-0': 3, '0-1': 3, '1-0': 3 };
    const model = Agentkvittering.buildModel(SAMPLE_DOMAINS, answers, null);
    assert.equal(model.findings.length, 0);
    assert.equal(model.overallLight.key, 'gron');
    assert.equal(model.needsHuman.length, 1);
    assert.match(model.needsHuman[0].why, /selvvurdering/i);
  });
});

describe('publish and copy contracts', () => {
  it('keeps the Stripe checklist and the function out of the static leak path', async () => {
    const root = fileURLToPath(new URL('..', import.meta.url));
    const publish = await readFile(new URL('../scripts/build-publish.mjs', import.meta.url), 'utf8');
    assert.match(publish, /'functions'/);
    const html = await readFile(new URL('../nis2-gap-assessment.html', import.meta.url), 'utf8');
    assert.match(html, /Hent Agentkvittering som PDF/);
    assert.match(html, /1\.497 kr/);
    assert.match(html, /Book et m/);
    assert.match(html, /menneske med/);
    assert.doesNotMatch(html, /Book a Free Session/);
    assert.doesNotMatch(html, /Export as PDF/);
    assert.match(html, /\/js\/agentkvittering\.js/);
    const docs = await readFile(new URL('../docs/agentkvittering-stripe.md', import.meta.url), 'utf8');
    assert.match(docs, /session_id=\{CHECKOUT_SESSION_ID\}/);
    assert.match(docs, /STRIPE_SECRET_KEY/);
    assert.ok(root.endsWith('/') || root.length > 1);
  });
});
