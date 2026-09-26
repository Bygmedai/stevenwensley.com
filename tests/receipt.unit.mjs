// The paid NIS2 receipt, server side: payment gate, one-receipt-per-payment,
// verification, and the PDF itself. Run with: npm run test:unit
//
// Named .unit.mjs, not .test.mjs: Playwright collects *.test.* files too, and
// these run under node:test, not in a browser.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { build } from 'esbuild';

import { issueReceipt, verifyReceipt, offer, RECEIPT_RE, questionSet } from '../functions/_lib/receipt-service.js';
import { buildReceipt } from '../functions/_lib/receipt.js';
import { unprintable, wrap, textWidth } from '../functions/_lib/pdf.js';
import { onRequestPost as issueRoute } from '../functions/api/receipt/issue.js';
import { onRequestGet as configRoute } from '../functions/api/receipt/config.js';
import { onRequestGet as verifyRoute } from '../functions/api/receipt/verify.js';
import { ENV, SESSION, fakeStripe } from './helpers/fake-stripe.mjs';

const NIS2 = createRequire(import.meta.url)('../js/nis2-model.js');
const N = NIS2.questionCount;

const answersOf = (fill) => Array.from({ length: N }, (_, i) => fill(i)).join('');
const A = answersOf((i) => String(i % 4));
const B = answersOf(() => '3');

const rejects = async (p, code) => {
  await assert.rejects(p, (e) => { assert.equal(e.code, code); return true; });
};

// ── The gate ──

test('no key, no receipt — and no paid button', async () => {
  await rejects(issueReceipt({}, { sessionId: SESSION, answers: A }), 'not_configured');
  assert.equal(offer({}).available, false);
  assert.equal(offer({ STRIPE_SECRET_KEY: 'sk' }).available, false, 'key without a payment link');
  assert.equal(offer({ RECEIPT_PAYMENT_LINK: ENV.RECEIPT_PAYMENT_LINK }).available, false, 'link without a key');
  assert.equal(offer({ ...ENV, RECEIPT_PAYMENT_LINK: 'https://evil.example/pay' }).available, false, 'only Stripe payment links');
  assert.equal(offer(ENV).available, true);
});

test('a malformed session id never reaches Stripe', async () => {
  const s = fakeStripe();
  for (const bad of [undefined, '', 'cs_test_', 'pi_123', 'cs_test_abc/../x', 'cs_test_' + 'a'.repeat(300)]) {
    await rejects(issueReceipt(ENV, { sessionId: bad, answers: A }, { fetchImpl: s.fetchImpl }), 'bad_session');
  }
  assert.deepEqual(s.calls, []);
});

test('unknown, unpaid and wrong-amount sessions are refused, and nothing is written', async () => {
  const unknown = fakeStripe();
  await rejects(issueReceipt(ENV, { sessionId: 'cs_test_zzzzzzzzzzzz', answers: A }, { fetchImpl: unknown.fetchImpl }), 'not_found');

  const unpaid = fakeStripe({ paid: false });
  await rejects(issueReceipt(ENV, { sessionId: SESSION, answers: A }, { fetchImpl: unpaid.fetchImpl }), 'not_paid');

  // A 1-krone test link must not unlock the 1.497 kr product.
  const cheap = fakeStripe({ amount: 100 });
  await rejects(issueReceipt(ENV, { sessionId: SESSION, answers: A }, { fetchImpl: cheap.fetchImpl }), 'wrong_amount');
  const eur = fakeStripe({ currency: 'eur' });
  await rejects(issueReceipt(ENV, { sessionId: SESSION, answers: A }, { fetchImpl: eur.fetchImpl }), 'wrong_amount');

  for (const s of [unpaid, cheap, eur]) assert.ok(!s.calls.some((c) => c.startsWith('POST')), 'no metadata written');
});

test('the amount follows RECEIPT_AMOUNT, so the price can change without code', async () => {
  const s = fakeStripe({ amount: 199500 });
  const r = await issueReceipt({ ...ENV, RECEIPT_AMOUNT: '199500' }, { sessionId: SESSION, answers: A }, { fetchImpl: s.fetchImpl });
  assert.match(r.receiptId, RECEIPT_RE);
});

test('answers must fit the question set', async () => {
  const s = fakeStripe();
  for (const bad of [undefined, '', A.slice(1), A + '0', A.replace(/^./, '4'), A.replace(/^./, 'x')]) {
    await rejects(issueReceipt(ENV, { sessionId: SESSION, answers: bad }, { fetchImpl: s.fetchImpl }), 'bad_answers');
  }
  await rejects(issueReceipt(ENV, { sessionId: SESSION, answers: '-'.repeat(N) }, { fetchImpl: s.fetchImpl }), 'no_answers');
  assert.ok(!s.calls.some((c) => c.startsWith('POST')));
});

// ── One payment, one receipt ──

test('a paid session gets a receipt, written onto its payment', async () => {
  const s = fakeStripe();
  const r = await issueReceipt(ENV, { sessionId: SESSION, answers: A }, { fetchImpl: s.fetchImpl, now: () => new Date('2026-09-26T12:02:31.456Z') });
  assert.match(r.receiptId, RECEIPT_RE);
  assert.equal(r.issuedAt, '2026-09-26T12:02:31Z');
  assert.equal(r.answers, A);
  assert.equal(r.reused, false);
  assert.equal(r.issuedTo, 'Søren Ærø · soren@example.dk');
  assert.equal(r.questionSet, await questionSet());
  assert.deepEqual(
    Object.keys(s.pi.metadata).sort(),
    ['receipt_answers', 'receipt_fp', 'receipt_id', 'receipt_issued', 'receipt_qset', 'receipt_scores'],
  );
  assert.equal(s.pi.metadata.receipt_id, r.receiptId);
  // Stripe caps metadata values at 500 characters.
  for (const v of Object.values(s.pi.metadata)) assert.ok(v.length <= 500);
});

test('asking again — with other answers — returns the first receipt, unchanged', async () => {
  const s = fakeStripe();
  const first = await issueReceipt(ENV, { sessionId: SESSION, answers: A }, { fetchImpl: s.fetchImpl });
  const second = await issueReceipt(ENV, { sessionId: SESSION, answers: B }, { fetchImpl: s.fetchImpl });
  assert.equal(second.receiptId, first.receiptId);
  assert.equal(second.answers, A, 'the stored answers win');
  assert.equal(second.issuedAt, first.issuedAt);
  assert.equal(second.reused, true);
  assert.equal(s.calls.filter((c) => c.startsWith('POST')).length, 1, 'written once');
});

test('two downloads at the same moment still make one receipt', async () => {
  const s = fakeStripe({ delayMs: 20 });
  const [x, y] = await Promise.all([
    issueReceipt(ENV, { sessionId: SESSION, answers: A }, { fetchImpl: s.fetchImpl }),
    issueReceipt(ENV, { sessionId: SESSION, answers: B }, { fetchImpl: s.fetchImpl }),
  ]);
  assert.equal(x.receiptId, y.receiptId);
  assert.equal(x.answers, y.answers);
  assert.equal(s.pi.metadata.receipt_id, x.receiptId, 'the number on both PDFs is the one on the payment');
});

// ── Verification ──

test('a receipt can be looked up by its number, without who bought it', async () => {
  const s = fakeStripe();
  const r = await issueReceipt(ENV, { sessionId: SESSION, answers: A }, { fetchImpl: s.fetchImpl });
  const v = await verifyReceipt(ENV, r.receiptId.toLowerCase(), { fetchImpl: s.fetchImpl });
  const { overallPct, domainScores } = NIS2.score(NIS2.decodeAnswers(A));
  assert.equal(v.receiptId, r.receiptId);
  assert.equal(v.issuedAt, r.issuedAt);
  assert.equal(v.fingerprint, r.fingerprint);
  assert.equal(v.overallPct, overallPct);
  assert.deepEqual(v.domains.map((d) => d.pct), domainScores.map((d) => d.pct));
  const out = JSON.stringify(v);
  for (const secret of ['Søren', 'soren@example.dk', A, 'pi_123', SESSION]) assert.ok(!out.includes(secret), `leaks ${secret}`);
});

test('unknown and malformed receipt numbers', async () => {
  const s = fakeStripe();
  await rejects(verifyReceipt(ENV, 'NIS2-AAAA-BBBB', { fetchImpl: s.fetchImpl }), 'not_found');
  for (const bad of ['', 'NIS2-AAAA', "NIS2-AAAA-BBB'", "x' OR metadata['a']:'b", 'NIS2-IIII-OOOO']) {
    await rejects(verifyReceipt(ENV, bad, { fetchImpl: s.fetchImpl }), 'bad_receipt_id');
  }
  assert.ok(!s.calls.some((c) => c.includes('search') && c.includes("'")), 'no raw input reaches the search query');
});

// ── The PDF ──

test('every text the receipt can print is printable — no "R�D"', () => {
  const texts = [];
  for (const d of NIS2.domains) {
    texts.push(d.name, d.ref, d.subtitle);
    for (const q of d.questions) texts.push(q.text, ...q.options);
  }
  for (const pct of [0, 29, 30, 54, 55, 74, 75, 100]) texts.push(NIS2.maturity(pct));
  const all = NIS2.domains.map((d) => ({ pct: 0 }));
  for (const r of NIS2.recommendations(all)) texts.push(r.text, r.desc);
  const bad = texts.flatMap(unprintable);
  assert.deepEqual(bad, []);
});

function parsePdf(bytes) {
  const s = Buffer.from(bytes).toString('latin1');
  assert.ok(s.startsWith('%PDF-1.4\n') && s.endsWith('%%EOF\n'));
  assert.ok(/^[\x09\x0a\x0d\x20-\x7e]*$/.test(s), 'the file is plain ASCII');
  const xref = Number(/startxref\n(\d+)\n/.exec(s)[1]);
  assert.equal(s.slice(xref, xref + 4), 'xref');
  const offsets = [...s.slice(xref).matchAll(/^(\d{10}) 00000 n $/gm)].map((m) => Number(m[1]));
  offsets.forEach((o, i) => assert.equal(s.slice(o, o + `${i + 1} 0 obj`.length), `${i + 1} 0 obj`, `xref entry ${i + 1}`));
  for (const m of s.matchAll(/<< \/Length (\d+) >>\nstream\n/g)) {
    const start = m.index + m[0].length;
    assert.equal(s.slice(start + Number(m[1]), start + Number(m[1]) + 10), '\nendstream');
  }
  return s;
}

test('the receipt is a well-formed PDF carrying what was issued', () => {
  const bytes = buildReceipt({
    receiptId: 'NIS2-7K3Q-9XWD', issuedAt: '2026-09-26T12:02:31Z', issuedTo: 'Søren Ærø · Łukasz', answers: A,
    questionSet: 'v1234abcd', fingerprint: '4e1f 9a0c 77d2 b3e5 0c91 aa42 5d6e 08f3',
  });
  const s = parsePdf(bytes);
  const pages = Number(/\/Type \/Pages \/Kids \[[^\]]*\] \/Count (\d+)/.exec(s)[1]);
  assert.ok(pages >= 3 && pages <= 8, `${pages} pages`);
  assert.ok(s.includes('(S\\370ren \\306r\\370 \\267 Lukasz)'), 'Danish letters as WinAnsi bytes; Ł spelt L');
  assert.ok(s.includes('(NIS2-7K3Q-9XWD)'));
  assert.ok(s.includes('(26 September 2026, 14:02 Copenhagen time \\(12:02 UTC\\))'));
  assert.ok(s.includes(`(Page ${pages} of ${pages})`));
  const { overallPct } = NIS2.score(NIS2.decodeAnswers(A));
  assert.ok(s.includes(`(${overallPct}%)`));
});

test('lines wrap inside the margin', () => {
  const long = NIS2.domains.flatMap((d) => d.questions.map((q) => q.context)).join(' ');
  for (const line of wrap(long, 'regular', 10, 300)) assert.ok(textWidth(line, 'regular', 10) <= 300, line);
  for (const line of wrap('x'.repeat(400), 'bold', 10, 100)) assert.ok(textWidth(line, 'bold', 10) <= 100);
});

// ── The routes, as Cloudflare calls them ──

test('POST /api/receipt/issue returns the PDF with its number', async () => {
  const s = fakeStripe();
  const real = globalThis.fetch;
  globalThis.fetch = s.fetchImpl;
  try {
    const req = new Request('https://x/api/receipt/issue', { method: 'POST', body: JSON.stringify({ session_id: SESSION, answers: A }) });
    const res = await issueRoute({ request: req, env: ENV });
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('Content-Type'), 'application/pdf');
    assert.equal(res.headers.get('Cache-Control'), 'no-store');
    assert.match(res.headers.get('X-Receipt-Id'), RECEIPT_RE);
    assert.equal(res.headers.get('Content-Disposition'), `attachment; filename="${res.headers.get('X-Receipt-Id')}.pdf"`);
    parsePdf(new Uint8Array(await res.arrayBuffer()));

    const bad = await issueRoute({ request: new Request('https://x', { method: 'POST', body: '{' }), env: ENV });
    assert.equal(bad.status, 400);
    const big = await issueRoute({ request: new Request('https://x', { method: 'POST', body: 'x'.repeat(5000) }), env: ENV });
    assert.equal(big.status, 413);
    const unpaid = await issueRoute({ request: new Request('https://x', { method: 'POST', body: JSON.stringify({ session_id: 'cs_test_unknownunknown', answers: A }) }), env: ENV });
    assert.equal(unpaid.status, 404);
    assert.equal(unpaid.headers.get('Content-Type'), 'application/json; charset=utf-8');

    const v = await verifyRoute({ request: new Request(`https://x/api/receipt/verify?id=${res.headers.get('X-Receipt-Id')}`), env: ENV });
    assert.equal((await v.json()).receipt.receiptId, res.headers.get('X-Receipt-Id'));
  } finally {
    globalThis.fetch = real;
  }
});

test('GET /api/receipt/config reveals nothing until Stripe is set up', async () => {
  assert.deepEqual(await (await configRoute({ env: {} })).json(), { available: false });
  const on = await (await configRoute({ env: ENV })).json();
  assert.deepEqual(on, { available: true, paymentLink: ENV.RECEIPT_PAYMENT_LINK, amount: 149700, currency: 'dkk' });
  assert.ok(!JSON.stringify(on).includes('sk_'), 'never the key');
});

// Cloudflare bundles each route with esbuild before deploying it. The shared
// question file is a plain browser script with a CommonJS export, so prove
// here — not on the first deploy — that it bundles into an ES-module worker.
test('the routes bundle the way Cloudflare bundles them', async () => {
  for (const route of ['config', 'issue', 'verify']) {
    const out = await build({
      entryPoints: [`functions/api/receipt/${route}.js`], bundle: true, format: 'esm', platform: 'neutral',
      write: false, logLevel: 'silent', mainFields: ['module', 'main'],
    });
    const code = out.outputFiles[0].text;
    const mod = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
    assert.equal(typeof (mod.onRequestGet || mod.onRequestPost), 'function', route);
  }
});
