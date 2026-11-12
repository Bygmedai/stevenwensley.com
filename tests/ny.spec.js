// @ts-check
// Design B v2 "Nordisk lys" (BYG-991): preview-siderne under /ny/ ved 390/768/1440.
const { test, expect } = require('@playwright/test');
const BASE = process.env.BASE_URL || 'http://localhost:8080';
const PAGES = ['/ny/', '/ny/saadan-kan-jeg-hjaelpe/', '/ny/spoergsmaal/', '/ny/om-mig/', '/ny/kontakt/'];
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

test('ingen pladsholdere tilbage, og portrætter og illustration indlæses', async ({ page }) => {
  for (const p of PAGES) {
    await page.goto(BASE + p);
    await expect(page.locator('.ph, .phbox')).toHaveCount(0);
    for (const img of await page.locator('main img').all()) {
      await img.scrollIntoViewIfNeeded();
      expect(await img.evaluate((i) => i.complete && i.naturalWidth > 0), p).toBe(true);
    }
  }
});

test('mobilmenu ved 375px: menupunkter kan nås uden JS', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 375, height: 800 }, javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto(BASE + '/ny/');
  const menu = page.locator('details.mnav');
  await expect(menu.locator('summary')).toBeVisible();
  await expect(page.locator('nav.dnav')).toBeHidden();
  await menu.locator('summary').click();
  for (const t of ['Sådan arbejder jeg', 'Spørgsmål', 'Om mig', 'Kontakt']) await expect(menu.getByRole('link', { name: t })).toBeVisible();
  await menu.getByRole('link', { name: 'Om mig' }).click();
  await expect(page).toHaveURL(/\/ny\/om-mig\/$/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
  await ctx.close();
});

test('desktop: hovedmenu synlig, mobilmenu skjult', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(BASE + '/ny/');
  await expect(page.locator('nav.dnav a', { hasText: 'Om mig' })).toBeVisible();
  await expect(page.locator('details.mnav')).toBeHidden();
});

test('#kontakt lander under sticky header', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(BASE + '/ny/#kontakt');
  const top = await page.locator('#kontakt').evaluate((e) => e.getBoundingClientRect().top);
  const hdr = await page.locator('header').evaluate((e) => e.getBoundingClientRect().bottom);
  expect(top).toBeGreaterThanOrEqual(hdr - 1);
});
