// @ts-check
// Design B v2 "Nordisk lys" (BYG-991): preview-siderne under /ny/ ved 390/768/1440.
const { test, expect } = require('@playwright/test');
const BASE = process.env.BASE_URL || 'http://localhost:8080';
const PAGES = ['/ny/', '/ny/saadan-kan-jeg-hjaelpe/', '/ny/spoergsmaal/', '/ny/om-mig/'];
const WIDTHS = [390, 768, 1440];

for (const p of PAGES) {
  for (const w of WIDTHS) {
    test(`${p} @${w}px: ingen vandret scroll, én h1, noindex`, async ({ browser }) => {
      const ctx = await browser.newContext({ viewport: { width: w, height: 900 } });
      const page = await ctx.newPage();
      const fejl = [];
      page.on('pageerror', (e) => fejl.push(e.message));
      const res = await page.goto(BASE + p);
      expect(res && res.status()).toBe(200);
      await page.evaluate(() => document.fonts.ready);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(w);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
      await expect(page.locator('header a.btn')).toBeVisible();
      expect(await page.evaluate(() => getComputedStyle(document.body).fontFamily)).toMatch(/Inter/);
      expect(fejl).toEqual([]);
      await ctx.close();
    });
  }
  test(`${p}: alle interne links svarer 200`, async ({ page, request }) => {
    await page.goto(BASE + p);
    const hrefs = await page.$$eval('a[href^="/"]', (as) => [...new Set(as.map((a) => a.getAttribute('href').split('#')[0]))]);
    for (const h of hrefs) {
      const r = await request.get(BASE + h);
      expect(r.status(), h).toBe(200);
    }
  });
}

test('pladsholdere er gule og synlige', async ({ page }) => {
  await page.goto(BASE + '/ny/');
  const ph = page.locator('.ph').first();
  await expect(ph).toBeVisible();
  expect(await ph.evaluate((e) => getComputedStyle(e).backgroundColor)).toBe('rgb(255, 247, 214)');
});
