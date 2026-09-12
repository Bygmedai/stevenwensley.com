// @ts-check
const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';

async function completeScan(page) {
  await page.waitForFunction(() => typeof window.Agentkvittering !== 'undefined' && typeof window.showResults === 'function');
  await page.evaluate(() => {
    document.querySelectorAll('.question').forEach((q, i) => {
      const opts = q.querySelectorAll('.option');
      const pick = opts[i % 4] || opts[0];
      if (pick) pick.click();
    });
    window.showResults();
  });
}

test.describe('Agentkvittering on NIS2 gap assessment', () => {
  test('free on-screen result stays; paid PDF is the primary CTA', async ({ page }) => {
    await page.goto(`${BASE_URL}/nis2-gap-assessment`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#cta-section')).toBeHidden();
    await expect(page.locator('#assessment-form')).toBeVisible();

    await completeScan(page);

    await expect(page.locator('#results')).toBeVisible();
    await expect(page.locator('#results')).toContainText('Scanning gennemført — gratis trafiklys');
    await expect(page.locator('#results .overall-score')).toBeVisible();
    await expect(page.locator('#cta-section')).toBeVisible();
    await expect(page.locator('#cta-pay')).toBeVisible();
    await expect(page.locator('#cta-pay')).toHaveText(/Hent Agentkvittering som PDF — 1\.497 kr/);
    await expect(page.locator('#cta-download-kvittering')).toBeHidden();
    await expect(page.locator('.cta-secondary a')).toHaveAttribute('href', '/book-session');
    await expect(page.locator('.cta-secondary a')).toHaveText(/Book et møde/);
    await expect(page.locator('#cta-section')).not.toContainText('Book a Free Session');
    await expect(page.locator('#results')).not.toContainText('Export as PDF');
  });

  test('placeholder Payment Link does not navigate away; documents the Stripe gap', async ({ page }) => {
    await page.goto(`${BASE_URL}/nis2-gap-assessment`, { waitUntil: 'domcontentloaded' });
    await completeScan(page);
    await page.locator('#cta-pay').click();
    await expect(page).toHaveURL(/nis2-gap-assessment/);
    await expect(page.locator('#kvittering-status')).toBeVisible();
    await expect(page.locator('#kvittering-status')).toContainText('pladsholder');
    await expect(page.locator('#kvittering-status')).toContainText('session_id={CHECKOUT_SESSION_ID}');
  });

  test('Stripe session gate unlocks the PDF download when paid', async ({ page }) => {
    await page.route('**/api/agentkvittering**', async (route) => {
      const url = new URL(route.request().url());
      const sessionId = url.searchParams.get('session_id');
      if (sessionId === 'cs_test_paid123') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            paid: true,
            session_id: 'cs_test_paid123',
            amount_total: 149700,
            currency: 'dkk',
            created: 1700000000,
          }),
        });
        return;
      }
      await route.fulfill({
        status: 402,
        contentType: 'application/json',
        body: JSON.stringify({ paid: false, error: 'ikke_betalt' }),
      });
    });

    await page.goto(`${BASE_URL}/nis2-gap-assessment`, { waitUntil: 'domcontentloaded' });
    await completeScan(page);

    const downloadPromise = page.waitForEvent('download');
    await page.goto(`${BASE_URL}/nis2-gap-assessment?session_id=cs_test_paid123`, {
      waitUntil: 'domcontentloaded',
    });
    await expect(page.locator('#kvittering-status')).toContainText('Betaling bekræftet');
    await expect(page.locator('#cta-download-kvittering')).toBeVisible();
    await expect(page.locator('#cta-pay')).toBeHidden();
    await expect(page.locator('#results')).toBeVisible();
    await page.waitForFunction(() => window.jspdf && window.jspdf.jsPDF);

    await page.locator('#cta-download-kvittering').click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/Agentkvittering-NIS2-/);
  });

  test('unpaid session_id does not unlock the file', async ({ page }) => {
    await page.route('**/api/agentkvittering**', async (route) => {
      await route.fulfill({
        status: 402,
        contentType: 'application/json',
        body: JSON.stringify({ paid: false, error: 'ikke_betalt', payment_status: 'unpaid' }),
      });
    });

    await page.goto(`${BASE_URL}/nis2-gap-assessment`, { waitUntil: 'domcontentloaded' });
    await completeScan(page);
    await page.goto(`${BASE_URL}/nis2-gap-assessment?session_id=cs_test_unpaid999`, {
      waitUntil: 'domcontentloaded',
    });
    await expect(page.locator('#kvittering-status')).toContainText('ikke betalt');
    await expect(page.locator('#cta-download-kvittering')).toBeHidden();
    await expect(page.locator('#cta-pay')).toBeVisible();
  });
});
