// @ts-check
// Smoke-test af stevenwensley.com med det nye design i produktion (S647). Kører mod en lokal server.
const { test, expect } = require('@playwright/test');
const BASE = process.env.BASE_URL || 'http://localhost:8080';
const PAGES = ['/', '/saadan-kan-jeg-hjaelpe/', '/oplaeg/', '/spoergsmaal/', '/om-mig/', '/kontakt/', '/privatliv/'];

for (const p of PAGES) {
  test(`${p} indlæses uden JS-fejl, med h1, menu og fod`, async ({ page }) => {
    const fejl = [];
    page.on('pageerror', (e) => fejl.push(e.message));
    const res = await page.goto(BASE + p);
    expect(res && res.status()).toBe(200);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('header a.btn[href="/kontakt/"]')).toBeVisible();
    await expect(page.locator('nav[aria-label="Hovedmenu"] a')).toHaveCount(4);
    await expect(page.locator('footer')).toContainText('CVR 37244449');
    expect(fejl).toEqual([]);
  });
  test(`${p} har ingen vandret scroll på mobil`, async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 375, height: 800 } });
    const page = await ctx.newPage();
    await page.goto(BASE + p);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
    await ctx.close();
  });
}

test('illustrationen og portrættet på forsiden indlæses, og 404 har vej hjem', async ({ page }) => {
  await page.goto(BASE + '/');
  for (const sel of ['figure.ill img', 'figure.pt img']) {
    const img = page.locator(sel).first();
    await img.scrollIntoViewIfNeeded();
    await expect.poll(() => img.evaluate((i) => i.complete && i.naturalWidth > 0), { message: sel }).toBe(true);
  }
  await page.goto(BASE + '/404.html');
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('main a[href="/"]')).toBeVisible();
});
