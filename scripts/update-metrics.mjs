#!/usr/bin/env node
// Propagates the factory metrics into every page that quotes them.
//
// Why this exists
// ---------------
// The commit and pull-request counts appear on eight pages — in body copy,
// meta descriptions, JSON-LD and a stat block. They were measured once, by
// hand, and then quietly went stale: by 18 August the site claimed 4,751
// commits where the real figure was 5,722. A number that is maintained by
// remembering to maintain it is a number that will be wrong.
//
// Why not read GitHub from the browser
// ------------------------------------
// The factory repositories are private, so any live call needs a token, and a
// token in client-side JavaScript is a published token. A proxy would work but
// buys nothing: nobody needs a commit count accurate to the second, and a
// figure fetched at runtime is invisible to search engines, disappears when
// GitHub is down, and leaves no record of what the page claimed last week.
//
// So the numbers are refreshed at build time, committed, and served as static
// HTML. That keeps them indexable, keeps the page working when GitHub is not,
// and — the part that matters for this site — leaves every change to a public
// claim in the git history where it can be inspected.
//
// How it works
// ------------
// scripts/metrics.json holds both the measured values and `rendered`: the
// literal strings currently present in the HTML. This script replaces the
// rendered strings with the formatted values, then writes the new strings back
// into `rendered`. That makes it idempotent — a second run finds nothing to do
// — and self-describing: the file always states what the site currently says.
//
// It refuses to write a metric it cannot find anywhere, because silently
// changing nothing is how a maintenance script rots without anyone noticing.
//
// Usage:  node scripts/update-metrics.mjs [--check]
//         --check reports what would change and exits non-zero if anything
//         would, without writing. Used by CI.

import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const METRICS = join(ROOT, 'scripts/metrics.json');

// Metrics that are safe to propagate automatically. `solutions` is deliberately
// absent: it is a judgement about what counts as a client-facing delivery, not
// something the API can answer.
const AUTO = ['commits', 'pullRequests', 'repositories'];

const fmt = (n) => n.toLocaleString('en-GB'); // 5722 -> "5,722"

const SKIP_DIRS = new Set(['node_modules', '_site', 'src', 'tests', 'scripts', '.git', '.github']);

async function collectFiles(dir = ROOT, rel = '') {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.') || SKIP_DIRS.has(e.name)) continue;
    const abs = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await collectFiles(abs, rel + e.name + '/')));
    else if (['.html', '.txt', '.xml'].includes(extname(e.name))) out.push(rel + e.name);
  }
  return out;
}

const check = process.argv.includes('--check');
const metrics = JSON.parse(await readFile(METRICS, 'utf8'));
const files = await collectFiles();

const plan = [];
for (const key of AUTO) {
  const from = metrics.rendered[key];
  const to = key === 'repositories' ? String(metrics.values[key]) : fmt(metrics.values[key]);
  if (from !== to) plan.push({ key, from, to });
}

if (plan.length === 0) {
  console.log('update-metrics: intet at opdatere — HTML matcher metrics.json');
  process.exit(0);
}

let totalHits = 0;
const perMetric = Object.fromEntries(plan.map((p) => [p.key, 0]));
const touched = new Map();

for (const f of files) {
  const abs = join(ROOT, f);
  const original = await readFile(abs, 'utf8');
  let text = original;
  for (const { key, from, to } of plan) {
    const hits = text.split(from).length - 1;
    if (hits === 0) continue;
    perMetric[key] += hits;
    totalHits += hits;
    text = text.split(from).join(to);
  }
  if (text !== original) touched.set(f, text);
}

// A metric that matches nothing means the site no longer says what
// metrics.json thinks it says. Stop rather than drift further apart.
const missing = plan.filter((p) => perMetric[p.key] === 0);
if (missing.length) {
  console.error('update-metrics: FEJL — disse værdier findes ikke i nogen fil:');
  for (const m of missing) console.error(`  ${m.key}: forventede at finde "${m.from}"`);
  console.error('  Ret "rendered" i scripts/metrics.json til det siden faktisk siger.');
  process.exit(1);
}

for (const { key, from, to } of plan) {
  console.log(`update-metrics: ${key}  ${from} → ${to}  (${perMetric[key]} steder)`);
}
console.log(`update-metrics: ${totalHits} erstatninger i ${touched.size} filer`);

if (check) {
  console.error('\nupdate-metrics: FEJL — siden er ikke ajour med metrics.json.');
  console.error('  Kør: node scripts/update-metrics.mjs  og commit resultatet.');
  process.exit(1);
}

for (const [f, text] of touched) await writeFile(join(ROOT, f), text, 'utf8');

for (const { key, to } of plan) metrics.rendered[key] = to;
await writeFile(METRICS, JSON.stringify(metrics, null, 2) + '\n', 'utf8');
console.log('update-metrics: metrics.json opdateret — næste kørsel er en no-op');
