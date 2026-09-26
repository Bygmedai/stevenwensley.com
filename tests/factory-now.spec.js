// @ts-check
const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';

// /factory-now draws its chart at build time, and every layout bug it has had
// so far was invisible to every check the repository ran — each was found by
// looking at a screenshot:
//
//   - one SVG scaled down to a phone shrank every label to about five pixels;
//   - a gap's name, placed above the line, landed on the "+1,220 commits" end
//     label when the latest stretch was itself a gap;
//   - moved to the foot of the band, the first gap's name sat where both
//     lines rise from zero, and they ran through the words.
//
// These tests turn "looks right" into geometry that can fail: every label is
// measured against every other label and against every line of the chart, on
// a desktop and on a phone, in the drawing that width actually shows.

const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 900 },
  { name: 'phone', width: 390, height: 844 },
];

for (const vp of VIEWPORTS) {
  test.describe(`/factory-now on a ${vp.name}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    test('shows exactly one chart, with readable labels that collide with nothing', async ({ page }) => {
      const errors = [];
      page.on('pageerror', (e) => errors.push(e.message));
      await page.goto(`${BASE_URL}/factory-now`, { waitUntil: 'domcontentloaded' });
      await page.evaluate(() => document.fonts && document.fonts.ready);

      const report = await page.evaluate(() => {
        const visible = [...document.querySelectorAll('.fn-svg')].filter((s) => getComputedStyle(s).display !== 'none');
        const svg = visible[0];
        const labels = [...svg.querySelectorAll('text')].map((t) => ({ s: t.textContent.trim(), r: t.getBoundingClientRect() }));

        const overlaps = [];
        for (let i = 0; i < labels.length; i++)
          for (let j = i + 1; j < labels.length; j++) {
            const [a, b] = [labels[i].r, labels[j].r];
            if (a.left < b.right - 0.5 && b.left < a.right - 0.5 && a.top < b.bottom - 0.5 && b.top < a.bottom - 0.5)
              overlaps.push(`"${labels[i].s}" × "${labels[j].s}"`);
          }

        // Walk every drawn line and see whether it passes through a label.
        // Gridlines are exempt: axis numbers sit on them by design.
        const ctm = svg.getScreenCTM();
        const crossings = new Set();
        for (const ln of svg.querySelectorAll('line.fn-line')) {
          const [x1, y1, x2, y2] = ['x1', 'y1', 'x2', 'y2'].map((k) => Number(ln.getAttribute(k)));
          for (let k = 0; k <= 60; k++) {
            const pt = svg.createSVGPoint();
            pt.x = x1 + ((x2 - x1) * k) / 60;
            pt.y = y1 + ((y2 - y1) * k) / 60;
            const sp = pt.matrixTransform(ctm);
            for (const l of labels) {
              const r = l.r;
              if (sp.x > r.left + 1 && sp.x < r.right - 1 && sp.y > r.top + 1 && sp.y < r.bottom - 1) crossings.add(`line through "${l.s}"`);
            }
          }
        }

        return {
          visibleCharts: visible.length,
          smallestLabel: Math.min(...labels.map((l) => l.r.height)),
          overlaps,
          crossings: [...crossings],
          horizontalScroll: document.documentElement.scrollWidth > innerWidth,
          age: document.querySelector('[data-age]')?.textContent ?? '',
        };
      });

      expect(errors, 'JavaScript errors').toEqual([]);
      expect(report.visibleCharts, 'exactly one chart drawing shown').toBe(1);
      expect(report.overlaps, 'labels overlapping labels').toEqual([]);
      expect(report.crossings, 'chart lines running through labels').toEqual([]);
      expect(report.smallestLabel, 'smallest label height in CSS px').toBeGreaterThanOrEqual(9.5);
      expect(report.horizontalScroll, 'page scrolls sideways').toBe(false);
      expect(report.age, 'the measurement age is filled in').toMatch(/^\((today|yesterday|\d+ days ago)\)$/);
    });
  });
}
