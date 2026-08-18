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
const AUTO = [
  'commits',
  'pullRequests',
  'repositories',
  'inkandartCommits',
  'inkandartPullRequests',
  'copyrightYear',
  'yearsExperience',
  'yearsExperienceDa',
];

// Counts over a thousand read better separated. Years never do — 2026 as
// "2,026" got into 46 footers before neverSeparate existed.
const sep = (key, n) =>
  n >= 1000 && !metrics.neverSeparate.includes(key) ? n.toLocaleString('en-GB') : String(n);

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

// Two values here are not measured, they are arithmetic on today's date, and
// both were previously typed by hand.
//
// copyrightYear sat in metrics.json as a literal 2026 that nothing
// recomputed. It was correct, and would have become wrong in every footer on
// the site at midnight on 1 January with no gate noticing — the same failure
// as the availability date, just eleven weeks further out.
//
// yearsExperience is worse, because the site had four answers to one
// question: "18 years" in 21 places, "18+ years" in 17, "20+ års erfaring" on
// the Danish page and "20+ years of experience" on book-session. Steven
// started in 2006, so the true figure is a subtraction. Writing 20 by hand
// would only have moved the wrongness to next January.
//
// METRICS_YEAR overrides the year so the behaviour on a future 1 January can
// be tested today rather than believed.
const YEAR = Number(process.env.METRICS_YEAR) || new Date().getUTCFullYear();
metrics.values.copyrightYear = YEAR;
metrics.values.yearsExperience = YEAR - metrics.careerStart;
metrics.values.yearsExperienceDa = YEAR - metrics.careerStart;
const files = await collectFiles();

const plan = [];
for (const key of AUTO) {
  const from = metrics.rendered[key];
  const to = metrics.templates[key].replace('{}', sep(key, metrics.values[key]));
  if (from !== to) plan.push({ key, from, to });
}

// When nothing needs replacing, the old version stopped here and reported
// success. That was a check of metrics.json against itself: it never looked
// at a page. So the site could drift arbitrarily far from `rendered` and this
// would keep saying "HTML matcher metrics.json" — which it had not verified.
//
// It hid a real one. Giving eight tool pages a footer took copyrightYear from
// 46 occurrences to 54 while expectedHits still said 46, and nothing noticed,
// because a count is only taken when a value changes. The first time it would
// have mattered was 1 January, when every footer on the site needed rewriting
// and this script would have refused the whole batch over the mismatch.
if (plan.length === 0) {
  const stale = [];
  for (const key of AUTO) {
    let found = 0;
    for (const f of files) found += (await readFile(join(ROOT, f), 'utf8')).split(metrics.rendered[key]).length - 1;
    if (found !== metrics.expectedHits[key]) stale.push({ key, found });
  }
  if (stale.length) {
    console.error('update-metrics: FEJL — metrics.json beskriver ikke siden længere:');
    for (const s of stale) {
      console.error(
        `  ${s.key}: fandt ${s.found} forekomst(er), expectedHits siger ${metrics.expectedHits[s.key]}` +
          ` — søgte efter "${String(metrics.rendered[s.key]).slice(0, 60)}"`
      );
    }
    console.error('\n  Tallene er ikke forkerte endnu. Men næste gang en værdi ændrer sig,');
    console.error('  afviser scriptet hele batchen — og det sker typisk 1. januar.');
    process.exit(1);
  }
  console.log(`update-metrics: intet at opdatere — ${AUTO.length} tal verificeret mod ${files.length} filer`);
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

// Two ways this goes wrong, both stopped before anything is written. Matching
// nothing means the site no longer says what metrics.json thinks it says.
// Matching more than expected means the search string was not unique —
// replacing a bare "48" once rewrote 196 unrelated numbers across 25 files,
// including dates and colour values, because 48 is just a number that turns up
// in a lot of places.
const wrong = plan.filter((p) => perMetric[p.key] !== metrics.expectedHits[p.key]);
if (wrong.length) {
  console.error('update-metrics: FEJL — uventet antal forekomster, intet skrevet:');
  for (const w of wrong) {
    console.error(
      `  ${w.key}: fandt ${perMetric[w.key]}, forventede ${metrics.expectedHits[w.key]}` +
        ` — søgte efter "${String(w.from).slice(0, 60)}"`
    );
  }
  console.error('  Ret rendered/expectedHits i scripts/metrics.json, eller gør strengen entydig.');
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
