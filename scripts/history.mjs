// The measurement history behind /factory-now: one point per published
// measurement of the factory. Shared by fetch-metrics.mjs (which appends),
// backfill-history.mjs (which built the first points from git) and
// build-factory.mjs (which draws them).
//
// Kept separate from metrics.json on purpose. metrics.json holds what the
// site says today; this file holds what it has said, and when. The chart
// reads only this file, so it can never show a point that was not measured.

import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
export const HISTORY = join(ROOT, 'scripts/metrics-history.json');

export const readHistory = async () => JSON.parse(await readFile(HISTORY, 'utf8'));

export const writeHistory = async (history) =>
  writeFile(HISTORY, JSON.stringify(history, null, 2) + '\n', 'utf8');

// A re-run on the same day replaces that day's point rather than adding a
// second one: the history is one point per date, never two readings of the
// same day drawn as if they were a trend.
export const withPoint = (history, point) => {
  const points = history.points.filter((p) => p.date !== point.date);
  points.push(point);
  points.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  return { ...history, points };
};

// What must be true of any history the site publishes. Returned as a list so
// a caller can print every problem at once.
export const problems = (history) => {
  const out = [];
  const pts = history.points ?? [];
  if (!pts.length) out.push('ingen målinger');
  for (let i = 1; i < pts.length; i++) {
    const [a, b] = [pts[i - 1], pts[i]];
    if (!(a.date < b.date)) out.push(`${b.date}: dato er ikke efter ${a.date}`);
    // Commits and pull requests are cumulative and only go up. A drop means
    // a measurement lost sight of some repositories — the same rule
    // fetch-metrics enforces before publishing.
    for (const k of ['commits', 'pullRequests']) {
      if (b[k] < a[k]) out.push(`${b.date}: ${k} faldt fra ${a[k]} til ${b[k]}`);
    }
  }
  for (const p of pts) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(p.date)) out.push(`ugyldig dato: ${p.date}`);
    for (const k of ['commits', 'pullRequests', 'repositories']) {
      if (!Number.isInteger(p[k]) || p[k] < 0) out.push(`${p.date}: ${k} er ikke et tal`);
    }
  }
  return out;
};
