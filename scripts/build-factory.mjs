#!/usr/bin/env node
// Renders /factory-now from the factory's own measurements.
//
// Why this exists
// ---------------
// The site quotes the factory's commit and pull-request counts on eight pages.
// Since August they have been measured daily from the GitHub API rather than
// typed — and from 17 to 25 September they silently stopped being measured
// while every run reported success. The figures looked exactly as current on
// the 25th as on the 16th.
//
// This page shows the measurements themselves: every published reading, when
// it was taken, and the gaps where none was. A stale pipeline is visible here
// as a stale date and a dashed line, not hidden behind a number that looks
// the same either way.
//
// What it draws, and from where
// -----------------------------
// Only scripts/metrics-history.json — one point per published measurement,
// each of which is also a commit to scripts/metrics.json in this public
// repository. Nothing is interpolated, projected or smoothed. The chart plots
// what was added since measuring began, from zero, because a cumulative count
// of 5,722 on an axis starting at zero makes five weeks of work look flat,
// and an axis starting at 5,700 makes it look like a rocket. Both lie; the
// increase from zero does not.
//
// The page is rendered here, at build time, into the region between
// <!-- factory:begin --> and <!-- factory:end -->. It works without
// JavaScript and is indexable. The one script on it turns "16 September" into
// "10 days ago" for a reader, because a date alone does not tell anyone
// whether it is old.
//
// Usage:  node scripts/build-factory.mjs [--check]

import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readHistory, problems } from './history.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const PAGE = join(ROOT, 'factory-now.html');
const CHECK = process.argv.includes('--check');
const BEGIN = '<!-- factory:begin -->';
const END = '<!-- factory:end -->';

const metrics = JSON.parse(await readFile(join(ROOT, 'scripts/metrics.json'), 'utf8'));
const history = await readHistory();
const pts = history.points;

// ---- the two sources must agree before anything is drawn --------------------

const bad = problems(history);
const last = pts.at(-1);
if (last) {
  if (last.date !== metrics.measuredAt)
    bad.push(`seneste måling i historikken er ${last.date}, metrics.json siger ${metrics.measuredAt}`);
  for (const k of ['commits', 'pullRequests', 'repositories'])
    if (last[k] !== metrics.values[k])
      bad.push(`${k}: historikken slutter på ${last[k]}, metrics.json siger ${metrics.values[k]}`);
}
if (bad.length) {
  console.error('build-factory: FEJL — målehistorikken kan ikke tegnes:');
  for (const b of bad) console.error(`  ${b}`);
  process.exit(1);
}

// ---- helpers -----------------------------------------------------------------

const DAY = 86_400_000;
const t = (d) => Date.parse(d + 'T00:00:00Z');
const days = (a, b) => Math.round((t(b) - t(a)) / DAY);
const n = (x) => x.toLocaleString('en-GB');
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const long = (d) => { const [y, m, dd] = d.split('-').map(Number); return `${dd} ${MONTHS[m - 1]} ${y}`; };
const short = (d) => { const [, m, dd] = d.split('-').map(Number); return `${dd} ${MONTHS[m - 1].slice(0, 3)}`; };
// A gap wider than this is drawn dashed and named. The refresh runs daily;
// four days allows for a weekend and a slow merge without crying wolf.
const GAP_DAYS = 4;

const first = pts[0];

// ---- headline figures --------------------------------------------------------

const figures = `
      <div class="fn-figures">
        <div class="fn-figure"><div class="fn-num">${n(metrics.values.commits)}</div><div class="fn-label">commits</div></div>
        <div class="fn-figure"><div class="fn-num">${n(metrics.values.pullRequests)}</div><div class="fn-label">pull requests</div></div>
        <div class="fn-figure"><div class="fn-num">${n(metrics.values.repositories)}</div><div class="fn-label">repositories in active development</div></div>
        <div class="fn-figure"><div class="fn-num">${n(metrics.values.solutions)}</div><div class="fn-label">client-facing solutions</div></div>
      </div>
      <p class="fn-stamp">Measured <time datetime="${last.date}" data-measured>${long(last.date)}</time> from the GitHub API, ${metrics.window.label}. <span class="fn-age" data-age></span></p>`;

// ---- pace --------------------------------------------------------------------

// Over the last 30 days, from the earliest measurement inside that window.
// Omitted rather than shown when the span is too short to mean anything.
const windowStart = pts.find((p) => days(p.date, last.date) <= 30) ?? first;
const span = days(windowStart.date, last.date);
const pace =
  span >= 7
    ? `
      <p class="fn-pace">Over the ${span} days from ${long(windowStart.date)} to ${long(last.date)}: <strong>${Math.round((last.commits - windowStart.commits) / span)} commits</strong> and <strong>${Math.round((last.pullRequests - windowStart.pullRequests) / span)} pull requests</strong> a day, on average.</p>`
    : '';

// ---- chart -------------------------------------------------------------------

// Drawn twice, at build time: once for a wide screen and once for a phone.
// One SVG scaled down to a phone shrinks its 12-unit labels to about five
// pixels — the first version did exactly that, and every date and axis value
// on a phone was unreadable. Scaling the text up instead makes it enormous on
// a desktop. Two drawings, each with text sized for where it is shown; CSS
// shows one and removes the other, from screen readers as well.
const GAPS = pts.slice(1).filter((p, i) => days(pts[i].date, p.date) > GAP_DAYS).length;

const drawChart = ({ id, W, H, L, R, T, B, font, endText, monthTicks }) => {
  const x0 = t(first.date), x1 = t(last.date) === x0 ? x0 + DAY : t(last.date);
  const X = (d) => L + ((t(d) - x0) / (x1 - x0)) * (W - L - R);
  const maxAdded = Math.max(1, last.commits - first.commits, last.pullRequests - first.pullRequests);
  // Round the axis up to a clean step so the gridlines read as numbers people use.
  const step = [50, 100, 200, 250, 500, 1000, 2000, 5000].find((s) => maxAdded / s <= 5) ?? 10000;
  const yMax = Math.ceil(maxAdded / step) * step;
  const Y = (v) => T + (1 - v / yMax) * (H - T - B);
  const fs = (k) => `font-size="${(font * k).toFixed(1)}"`;

  const grid = [];
  for (let v = 0; v <= yMax; v += step) {
    grid.push(`<line x1="${L}" y1="${Y(v).toFixed(1)}" x2="${W - R}" y2="${Y(v).toFixed(1)}" class="fn-grid"/>`);
    grid.push(`<text x="${L - 8}" y="${(Y(v) + font / 3).toFixed(1)}" text-anchor="end" class="fn-tick" ${fs(1)}>${n(v)}</text>`);
  }

  // X ticks: the first and last measurement, and the first of each month
  // between — on the narrow drawing only when it will not collide.
  const xTicks = [first.date];
  if (monthTicks) {
    for (let d = new Date(x0); d.getTime() < x1; d = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1))) {
      const iso = d.toISOString().slice(0, 10);
      if (iso.endsWith('-01') && days(first.date, iso) >= 5 && days(iso, last.date) >= 5) xTicks.push(iso);
    }
  }
  if (last.date !== first.date) xTicks.push(last.date);
  const xLabels = xTicks.map((d, i) => {
    const anchor = i === 0 ? 'start' : i === xTicks.length - 1 ? 'end' : 'middle';
    return `<text x="${X(d).toFixed(1)}" y="${H - B + font * 1.8}" text-anchor="${anchor}" class="fn-tick" ${fs(1)}>${short(d)}</text>`;
  });

  const series = (key, cls) => {
    const segs = [];
    for (let i = 1; i < pts.length; i++) {
      const [a, b] = [pts[i - 1], pts[i]];
      const gap = days(a.date, b.date) > GAP_DAYS;
      segs.push(
        `<line x1="${X(a.date).toFixed(1)}" y1="${Y(a[key] - first[key]).toFixed(1)}" x2="${X(b.date).toFixed(1)}" y2="${Y(b[key] - first[key]).toFixed(1)}" class="fn-line ${cls}${gap ? ' fn-gap' : ''}"/>`
      );
    }
    const dots = pts.map(
      (p, i) =>
        `<circle cx="${X(p.date).toFixed(1)}" cy="${Y(p[key] - first[key]).toFixed(1)}" r="${i === pts.length - 1 ? 5 : 3}" class="fn-dot ${cls}"><title>${long(p.date)}: ${n(p[key])} ${key === 'commits' ? 'commits' : 'pull requests'} (+${n(p[key] - first[key])} since ${short(first.date)})</title></circle>`
    );
    return segs.join('') + dots.join('');
  };

  // Each gap is a faint band the height of the plot, named inside it, on
  // whichever side of the lines has more room within the band.
  //
  // Two earlier placements failed, both caught only by looking. Above the
  // line: when the latest stretch was itself a gap, the name sat on top of
  // the "+1,220 commits" end label. At the foot of the band: fine for a late
  // gap, but the first gap is where both lines rise from zero, and they ran
  // straight through the words. The room is measured per band instead of
  // assumed, and tests/factory-now.spec.js checks every label against every
  // other label and every line.
  const gapBands = [];
  const gapLabels = [];
  for (let i = 1; i < pts.length; i++) {
    const [a, b] = [pts[i - 1], pts[i]];
    const g = days(a.date, b.date);
    if (g <= GAP_DAYS) continue;
    const xa = X(a.date), xb = X(b.date), mx = (xa + xb) / 2;
    gapBands.push(`<rect x="${xa.toFixed(1)}" y="${T}" width="${(xb - xa).toFixed(1)}" height="${H - T - B}" class="fn-gapband"/>`);
    // Where the lines are, anywhere across this band (SVG y grows downward).
    const ys = [a, b].flatMap((p) => [Y(p.commits - first.commits), Y(p.pullRequests - first.pullRequests)]);
    const roomAbove = Math.min(...ys) - T, roomBelow = H - B - Math.max(...ys);
    const above = roomAbove >= roomBelow;
    const oneLine = `no measurement · ${g} days`;
    const fits = xb - xa >= oneLine.length * font * 0.55;
    const lines = fits ? 1 : 2;
    // First baseline: just inside the top of the band, or high enough above
    // its foot for every line of the label to clear the axis.
    const y0 = above ? T + font * 1.3 : H - B - font * (0.7 + 1.1 * (lines - 1));
    gapLabels.push(
      fits
        ? `<text x="${mx.toFixed(1)}" y="${y0.toFixed(1)}" text-anchor="middle" class="fn-gaplabel" ${fs(0.92)}>${oneLine}</text>`
        : `<text x="${mx.toFixed(1)}" y="${y0.toFixed(1)}" text-anchor="middle" class="fn-gaplabel" ${fs(0.92)}><tspan x="${mx.toFixed(1)}">no data</tspan><tspan x="${mx.toFixed(1)}" dy="${(font * 1.1).toFixed(1)}">${g} days</tspan></text>`
    );
  }

  const endLabel = `<text x="${(X(last.date) - 8).toFixed(1)}" y="${(Y(last.commits - first.commits) - font).toFixed(1)}" text-anchor="end" class="fn-endlabel" ${fs(1.08)}>+${n(last.commits - first.commits)}${endText}</text>`;

  return `<svg viewBox="0 0 ${W} ${H}" class="fn-svg fn-svg-${id}" role="img" aria-labelledby="fn-${id}-title fn-${id}-desc">
            <title id="fn-${id}-title">Commits and pull requests added since ${long(first.date)}</title>
            <desc id="fn-${id}-desc">${pts.length} measurements from ${long(first.date)} to ${long(last.date)}. ${n(last.commits - first.commits)} commits and ${n(last.pullRequests - first.pullRequests)} pull requests added.${GAPS ? ` ${GAPS} gap${GAPS > 1 ? 's' : ''} of more than ${GAP_DAYS} days without a measurement, drawn dashed.` : ''}</desc>
            ${gapBands.join('')}
            ${grid.join('')}
            ${xLabels.join('')}
            ${series('pullRequests', 'fn-prs')}
            ${series('commits', 'fn-commits')}
            ${gapLabels.join('')}
            ${endLabel}
          </svg>`;
};

const chart = `
      <figure class="fn-chart">
          ${drawChart({ id: 'wide', W: 760, H: 320, L: 60, R: 24, T: 28, B: 44, font: 12, endText: ' commits', monthTicks: true })}
          ${drawChart({ id: 'narrow', W: 360, H: 300, L: 44, R: 12, T: 26, B: 36, font: 12, endText: '', monthTicks: false })}
        <figcaption>
          <span class="fn-key fn-key-commits">Commits</span>
          <span class="fn-key fn-key-prs">Pull requests</span>
          <span class="fn-key-note">added since measuring began on ${long(first.date)} · every dot is a published measurement${GAPS ? ' · dashed where none was taken' : ''}</span>
        </figcaption>
      </figure>`;

// ---- every measurement, newest first -----------------------------------------

const rows = [...pts]
  .reverse()
  .map((p) => `<tr><td>${long(p.date)}</td><td>${n(p.commits)}</td><td>${n(p.pullRequests)}</td><td>${p.repositories}</td></tr>`)
  .join('\n            ');
const table = `
      <details class="fn-ledger">
        <summary>All ${pts.length} measurements</summary>
        <div class="fn-table-wrap">
          <table>
            <thead><tr><th scope="col">Measured</th><th scope="col">Commits</th><th scope="col">Pull requests</th><th scope="col">Repositories</th></tr></thead>
            <tbody>
            ${rows}
            </tbody>
          </table>
        </div>
      </details>`;

// ---- write -------------------------------------------------------------------

const region = `${BEGIN}${figures}${pace}${chart}${table}
      ${END}`;

const page = await readFile(PAGE, 'utf8');
const i = page.indexOf(BEGIN), j = page.indexOf(END);
if (i === -1 || j === -1 || j < i) {
  console.error('build-factory: FEJL — factory-now.html mangler factory:begin/factory:end-markørerne.');
  process.exit(1);
}
const next = page.slice(0, i) + region + page.slice(j + END.length);

if (next === page) {
  console.log(`build-factory: factory-now.html er ajour (${pts.length} målinger, seneste ${last.date})`);
  process.exit(0);
}
if (CHECK) {
  console.error('build-factory: FEJL — factory-now.html matcher ikke målehistorikken.');
  console.error('  Kør: node scripts/build-factory.mjs  og commit resultatet.');
  process.exit(1);
}
await writeFile(PAGE, next, 'utf8');
console.log(`build-factory: factory-now.html tegnet (${pts.length} målinger, seneste ${last.date})`);
