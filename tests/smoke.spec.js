// @ts-check
// Smoke-test af stevenwensley.com efter oprydningen (S639). Kører mod en lokal server.
const { test, expect } = require('@playwright/test');
const BASE = process.env.BASE_URL || 'http://localhost:8080';
const PAGES = ['/', '/oplaeg/', '/om/', '/kontakt/', '/privatliv/'];

for (const p of PAGES) {
  test(`${p} indlæses uden JS-fejl, med h1, menu og fod`, async ({ page }) => {
    const fejl = [];
    page.on('pageerror', (e) => fejl.push(e.message));
    const res = await page.goto(BASE + p);
    expect(res && res.status()).toBe(200);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('nav[aria-label="Hovedmenu"] a[href="/kontakt/"]')).toBeVisible();
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

test('helte-billedet og portrættet indlæses', async ({ page }) => {
  await page.goto(BASE + '/');
  for (const sel of ['figure img', '.portrait img']) {
    const ok = await page.locator(sel).first().evaluate((img) => img.complete && img.naturalWidth > 0);
    expect(ok, sel).toBe(true);
  }
});
