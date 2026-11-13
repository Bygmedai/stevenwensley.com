// @ts-check
// Design B v2 "Nordisk lys" (BYG-991): preview-siderne under /ny/ ved 390/768/1440.
const { test, expect } = require('@playwright/test');
const BASE = process.env.BASE_URL || 'http://localhost:8080';
const PAGES = ['/ny/', '/ny/saadan-kan-jeg-hjaelpe/', '/ny/oplaeg/', '/ny/spoergsmaal/', '/ny/om-mig/', '/ny/kontakt/'];
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
  for (const t of ['Sådan kan jeg hjælpe', 'Oplæg', 'Spørgsmål', 'Om mig', 'Kontakt']) await expect(menu.getByRole('link', { name: t })).toBeVisible();
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

test('figuren på forsiden: fire søjler, læselig på mobil, tabel uden JS', async ({ browser }) => {
  for (const w of [390, 1280]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto(BASE + '/ny/');
    const svg = page.locator('figure.fig svg');
    await svg.scrollIntoViewIfNeeded();
    await expect(svg.locator('path.fig-b')).toHaveCount(4);
    const box = await svg.boundingBox();
    expect(box && box.width).toBeGreaterThanOrEqual(300);
    // Mindste tekst i figuren skal stadig være mindst 10 px på skærmen.
    const mindst = await svg.evaluate((el) => Math.min(...[...el.querySelectorAll('text')].map((t) => t.getBoundingClientRect().height)));
    expect(mindst).toBeGreaterThanOrEqual(10);
    await page.locator('details.fig-d summary').click();
    await expect(page.locator('details.fig-d table tbody tr')).toHaveCount(4);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(w);
    await ctx.close();
  }
});

test('menuen ved 800px: foldet menu, og knappen er på skærmen', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 800, height: 800 } });
  const page = await ctx.newPage();
  await page.goto(BASE + '/ny/');
  await expect(page.locator('nav.dnav')).toBeHidden();
  await expect(page.locator('details.mnav summary')).toBeVisible();
  const btn = await page.locator('header a.btn').boundingBox();
  expect(btn && btn.x + btn.width).toBeLessThanOrEqual(800);
  await ctx.close();
});
