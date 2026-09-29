// @ts-check
const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';

// The paid NIS2 board receipt, in a browser, end to end: the offer, the trip
// to Stripe and back, the download, and the check page.
//
// The static server that runs these tests has no /api/, so every call to
// /api/receipt/* is answered here by the real Cloudflare route handlers from
// functions/, running in this process. Only Stripe itself is replaced, by the
// same stand-in the unit tests use. What is under test is therefore the code
// that ships, on both sides of the network.

const load = async () => {
  const [config, issue, verify, stripe] = await Promise.all([
    import('../functions/api/receipt/config.js'),
    import('../functions/api/receipt/issue.js'),
    import('../functions/api/receipt/verify.js'),
    import('./helpers/fake-stripe.mjs'),
  ]);
  return { config, issue, verify, stripe };
};

// Routes /api/receipt/* to the handlers, with `env` as Cloudflare would pass
// it and Stripe answered by `fake`.
async function serveApi(page, env, fake) {
  const { config, issue, verify } = await load();
  await page.route('**/api/receipt/**', async (route) => {
    const req = route.request();
    const request = new Request(req.url(), { method: req.method(), body: req.method() === 'POST' ? req.postData() : undefined });
    const path = new URL(req.url()).pathname;
    const real = globalThis.fetch;
    globalThis.fetch = fake.fetchImpl;
    let res;
    try {
      if (path === '/api/receipt/config') res = config.onRequestGet({ env });
      else if (path === '/api/receipt/issue') res = await issue.onRequestPost({ request, env });
      else if (path === '/api/receipt/verify') res = await verify.onRequestGet({ request, env });
      else res = new Response('', { status: 404 });
    } finally {
      globalThis.fetch = real;
    }
    await route.fulfill({ status: res.status, headers: Object.fromEntries(res.headers), body: Buffer.from(await res.arrayBuffer()) });
  });
}

// Answers every question by clicking, the way a visitor does, then finishes.
async function takeAssessment(page) {
  const sections = page.locator('#assessment-form .domain-section');
  const n = await sections.count();
  for (let d = 0; d < n; d++) {
    const questions = sections.nth(d).locator('.question');
    const q = await questions.count();
    for (let i = 0; i < q; i++) await questions.nth(i).locator('.option').nth((d + i) % 4).click();
    await page.locator('#btn-next').click();
  }
  await expect(page.locator('#results .overall-score')).toBeVisible();
  return (await page.locator('#results .overall-score').textContent()).trim();
}

// Page errors from the page's own code. The CDN libraries (Chart.js, GSAP,
// Lenis) are covered by the smoke tests and are unreachable in some sandboxes.
const ownErrors = (page) => {
  const errors = [];
  page.on('pageerror', (e) => { if (!/\b(Chart|gsap|Lenis|ScrollTrigger)\b/.test(e.message)) errors.push(e.message); });
  return errors;
};

test.describe('NIS2 board receipt', () => {
  test('until Stripe is set up, the page is exactly the free tool', async ({ page }) => {
    const errors = ownErrors(page);
    const { stripe } = await load();
    await serveApi(page, {}, stripe.fakeStripe());
    await page.goto(`${BASE_URL}/nis2-gap-assessment`);
    await takeAssessment(page);
    await expect(page.locator('#receipt-offer')).toBeHidden();
    await expect(page.getByRole('button', { name: 'Export as PDF' })).toBeVisible();
    await expect(page.getByRole('link', { name: /Book a call/ })).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('buy, return from Stripe, download, and check the receipt', async ({ page }) => {
    const errors = ownErrors(page);
    const { stripe } = await load();
    const fake = stripe.fakeStripe();
    await serveApi(page, stripe.ENV, fake);

    await page.goto(`${BASE_URL}/nis2-gap-assessment`);
    const score = await takeAssessment(page);
    const offer = page.locator('#receipt-offer');
    await expect(offer).toBeVisible();
    await expect(page.locator('#receipt-buy')).toHaveText('Buy the board receipt — DKK 1,497');
    await expect(page.locator('#receipt-download')).toBeHidden();
    // The free export stays.
    await expect(page.getByRole('button', { name: 'Export as PDF' })).toBeVisible();

    // To Stripe. The test stops the navigation at Stripe's door.
    let checkout = '';
    await page.route('https://buy.stripe.com/**', (route) => { checkout = route.request().url(); return route.fulfill({ body: '<title>Stripe</title>' }); });
    await page.locator('#receipt-buy').click();
    await expect.poll(() => checkout).toBe(stripe.ENV.RECEIPT_PAYMENT_LINK);

    // Back from Stripe, on a fresh page load.
    await page.goto(`${BASE_URL}/nis2-gap-assessment?session_id=${stripe.SESSION}`);
    await expect(page.locator('#receipt-paid')).toContainText('Payment received');
    await expect(page.locator('#results .overall-score')).toHaveText(score);
    expect(new URL(page.url()).searchParams.has('session_id'), 'session id removed from the address bar').toBe(false);

    const [download] = await Promise.all([page.waitForEvent('download'), page.locator('#receipt-download').click()]);
    const id = download.suggestedFilename().replace(/\.pdf$/, '');
    expect(id).toMatch(/^NIS2-[0-9A-Z]{4}-[0-9A-Z]{4}$/);
    const bytes = require('node:fs').readFileSync(await download.path());
    expect(bytes.subarray(0, 8).toString()).toBe('%PDF-1.4');
    expect(bytes.toString('latin1')).toContain(`(${score})`);
    await expect(page.locator('#receipt-status')).toContainText(`Receipt ${id}`);
    expect(fake.pi.metadata.receipt_id).toBe(id);

    // Downloading again gives the same receipt.
    const [again] = await Promise.all([page.waitForEvent('download'), page.locator('#receipt-download').click()]);
    expect(again.suggestedFilename()).toBe(`${id}.pdf`);
    await expect(page.locator('#receipt-status')).toContainText('This is that receipt');
    await expect(page.locator('#receipt-buy')).toHaveText('Buy another receipt — DKK 1,497');

    // And the check page confirms it.
    await page.locator('#receipt-status a[href^="/verify-receipt"]').click();
    await expect(page.locator('.vr-card h2')).toHaveText(id);
    await expect(page.locator('.vr-card')).toContainText(`Overall result${score}`);
    await expect(page.locator('.vr-card')).not.toContainText('Søren');
    expect(errors).toEqual([]);
  });

  test('a paid flag forged in the browser unlocks nothing', async ({ page }) => {
    const { stripe } = await load();
    const fake = stripe.fakeStripe();
    await serveApi(page, stripe.ENV, fake);
    await page.goto(`${BASE_URL}/nis2-gap-assessment`);
    await page.evaluate(() => localStorage.setItem('ssw.nis2.session', 'cs_test_forgedforgedforged'));
    await page.reload();
    await takeAssessment(page);

    let downloaded = false;
    page.on('download', () => { downloaded = true; });
    await page.locator('#receipt-download').click();
    await expect(page.locator('#receipt-status')).toContainText('Stripe does not know this payment');
    expect(downloaded).toBe(false);
    expect(fake.pi.metadata).toEqual({});
  });

  test('the check page says plainly when a number was not issued', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const errors = ownErrors(page);
    const { stripe } = await load();
    await serveApi(page, stripe.ENV, stripe.fakeStripe());
    await page.goto(`${BASE_URL}/verify-receipt?id=nis2-aaaa-bbbb`);
    await expect(page.locator('#vr-id')).toHaveValue('NIS2-AAAA-BBBB');
    await expect(page.locator('#vr-out')).toContainText('No receipt has that number');
    await page.locator('#vr-id').fill('hello');
    await page.getByRole('button', { name: 'Check' }).click();
    await expect(page.locator('#vr-out')).toContainText('That is not a receipt number');
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    expect(errors).toEqual([]);
  });
});
