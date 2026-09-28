#!/usr/bin/env node
// Draws the monthly-commits chart on /workshop from scripts/metrics-monthly.json.
//
// Why this exists
// ---------------
// The chart was drawn by hand on 18 August 2026 — seven bars, their heights
// and labels typed into the SVG — and then never touched. By late September
// the page beside it quoted a measurement from that morning while the chart
// still ended at "Aug*, counted to the 18th". A chart that cannot follow the
// data it claims to show is a number that looks the same whether it is
// current or not, which is the failure /factory-now was built to end.
//
// fetch-metrics.mjs now measures every calendar month on the same run that
// measures the totals; this script turns that file into the SVG and the
// footnote beneath it. The bars, labels, scale and milestone dots are the
// same geometry the hand drawing used, so the first run reproduced it
// exactly. Nothing else on the page is touched: the narrative under the
// chart is written by hand and stays that way.
//
// Ownership: the two marked regions in workshop.html belong to this script.
// update-metrics.mjs and check-no-stale-dates.mjs skip them.
//
// Usage:  node scripts/build-monthly.mjs [--check]

import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DATA = join(ROOT, 'scripts/metrics-monthly.json');
const PAGE = join(ROOT, 'workshop.html');
const CHECK = process.argv.includes('--check');

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const fmt = (n) => n.toLocaleString('en-GB');
const ordinal = (d) => d + (d % 10 === 1 && d !== 11 ? 'st' : d % 10 === 2 && d !== 12 ? 'nd' : d % 10 === 3 && d !== 13 ? 'rd' : 'th');
const longDate = (iso) => { const [y, m, d] = iso.split('-').map(Number); return `${d} ${MONTHS[m - 1]} ${y}`; };

// The milestones the notes under the chart refer to, by month.
const MILESTONES = { '2026-02': '1', '2026-03': '2', '2026-05': '3' };

const data = JSON.parse(await readFile(DATA, 'utf8'));
const months = data.months;

const problems = [];
if (!months.length) problems.push('ingen måneder');
months.forEach((m, i) => {
  if (!/^\d{4}-\d{2}$/.test(m.month)) problems.push(`ugyldig måned: ${m.month}`);
  if (!Number.isInteger(m.commits) || m.commits < 0) problems.push(`${m.month}: commits er ikke et tal`);
  if (i && !(months[i - 1].month < m.month)) problems.push(`${m.month}: ikke efter ${months[i - 1].month}`);
  if (i < months.length - 1 && !m.complete) problems.push(`${m.month}: kun den seneste måned må være ufuldstændig`);
  if (!m.complete && !Number.isInteger(m.throughDay)) problems.push(`${m.month}: ufuldstændig måned uden throughDay`);
});
if (problems.length) {
  console.error('build-monthly: FEJL i metrics-monthly.json —');
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}

// ── Geometry: the hand drawing's, kept so the first run changed nothing ──
const SLOT = 100, BAR_W = 72, BAR_X0 = 22, BASE = 210, H = 170, TOP_PAD = 20, W = TOP_PAD + SLOT * months.length;
const max = Math.max(...months.map((m) => m.commits));
const r1 = (n) => (Math.round(n * 10) / 10).toFixed(1);

const label = (m) => { const [y, mo] = m.month.split('-').map(Number); return MONTHS[mo - 1].slice(0, 3) + (m.complete ? '' : '*'); };
const aria = months.map((m) => { const [y, mo] = m.month.split('-').map(Number); return `${MONTHS[mo - 1]}${m.complete ? '' : ` to the ${ordinal(m.throughDay)}`} ${m.commits}`; }).join(', ');

// One drawing, two font scales. The SVG scales with its container, so on a
// phone the hand drawing's 15px month labels became 7px — and every month
// added makes it worse. Under 600px the page shows a second copy of the
// same bars with labels twice the size; the CSS for the swap sits in
// workshop.html beside the chart's other styles.
const draw = (scale, cls) => {
  const bars = months.map((m, i) => {
    const h = (H * m.commits) / max;
    return `            <rect x="${BAR_X0 + SLOT * i}" y="${r1(BASE - h)}" width="${BAR_W}" height="${r1(h)}" rx="2"${m.complete ? '' : ' fill="#8f7a52"'}/>`;
  });
  const values = months.map((m, i) => {
    const h = (H * m.commits) / max;
    return `            <text x="${BAR_X0 + 36 + SLOT * i}" y="${r1(BASE - h - 9)}"${m.complete ? '' : ' fill="#9a9aaa"'}>${fmt(m.commits)}${m.complete ? '' : '*'}</text>`;
  });
  const names = months.map((m, i) => `            <text x="${BAR_X0 + 36 + SLOT * i}" y="${scale === 1 ? 234 : 240}">${label(m)}</text>`);
  const dots = months.flatMap((m, i) => (MILESTONES[m.month] ? [
    `            <circle cx="${BAR_X0 + 36 + SLOT * i}" cy="${scale === 1 ? 254 : 262}" r="${11 * (scale === 1 ? 1 : 1.6)}" fill="#0a0a0f" stroke="#c9a96e"/>`,
    `            <text x="${BAR_X0 + 36 + SLOT * i}" y="${scale === 1 ? 258.5 : 269}" fill="#c9a96e" font-size="${11 * scale}" font-weight="700" text-anchor="middle">${MILESTONES[m.month]}</text>`,
  ] : []));
  return `      <svg class="viz-svg ${cls}" viewBox="0 0 ${W} ${scale === 1 ? 275 : 290}" role="img" aria-label="Bar chart of monthly commits: ${aria}">
        <g font-family="'Space Grotesk',sans-serif">
          <!-- bars: scale ${fmt(max)} -> ${H}px, baseline y=${BASE}. Drawn by scripts/build-monthly.mjs from scripts/metrics-monthly.json -->
          <g fill="#c9a96e">
${bars.join('\n')}
          </g>
          <!-- value labels -->
          <g fill="#dfc08a" font-size="${17 * scale}" text-anchor="middle" font-weight="600">
${values.join('\n')}
          </g>
          <!-- month labels -->
          <g fill="#9a9aaa" font-size="${15 * scale}" text-anchor="middle">
${names.join('\n')}
          </g>
          <line x1="14" y1="${BASE}" x2="${W - 14}" y2="${BASE}" stroke="rgba(201,169,110,0.25)" stroke-width="1"/>
          <!-- milestone dots under the axis -->
          <g>
${dots.join('\n')}
          </g>
        </g>
      </svg>`;
};

const chart = `<!-- monthly-chart:begin -->
${draw(1, 'viz-svg-wide')}
${draw(2, 'viz-svg-narrow')}
      <!-- monthly-chart:end -->`;

const last = months[months.length - 1];
const partial = last.complete ? '' : `*${MONTHS[Number(last.month.split('-')[1]) - 1]} counted to the ${ordinal(last.throughDay)}. `;
const method = `<!-- monthly-method:begin -->
      <div class="viz-method">${partial}Monthly counts via the GitHub search API per calendar month, default branches only. Measured on ${longDate(data.measuredAt)}. Every completed month is counted again on every measurement and has to come back the same, or nothing is published &mdash; which is what &ldquo;reproducible&rdquo; is supposed to mean.</div>
      <!-- monthly-method:end -->`;

const page = await readFile(PAGE, 'utf8');
const CHART_RE = /<!-- monthly-chart:begin -->[\s\S]*?<!-- monthly-chart:end -->/;
const METHOD_RE = /<!-- monthly-method:begin -->[\s\S]*?<!-- monthly-method:end -->/;
if (!CHART_RE.test(page) || !METHOD_RE.test(page)) {
  console.error('build-monthly: FEJL — workshop.html mangler monthly-chart/monthly-method-markørerne');
  process.exit(1);
}
const next = page.replace(CHART_RE, chart).replace(METHOD_RE, method);
const summary = `${months.length} måneder, seneste ${last.month}${last.complete ? '' : ` til d. ${last.throughDay}`}, målt ${data.measuredAt}`;

if (next === page) {
  console.log(`build-monthly: workshop.html er ajour (${summary})`);
  process.exit(0);
}
if (CHECK) {
  console.error(`build-monthly: FEJL — workshop.html matcher ikke metrics-monthly.json (${summary}). Kør: node scripts/build-monthly.mjs`);
  process.exit(1);
}
await writeFile(PAGE, next, 'utf8');
console.log(`build-monthly: workshop.html opdateret (${summary})`);
