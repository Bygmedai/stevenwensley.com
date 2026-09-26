#!/usr/bin/env node
// Builds scripts/metrics-history.json from the git history of
// scripts/metrics.json. Run once, by hand, in a full clone — CI checks out
// one commit and has no history to read, which is why the result is
// committed and fetch-metrics.mjs appends to it from then on.
//
// Every version of metrics.json that reached this branch is a published
// measurement, dated by its own `measuredAt`. When a date has several
// versions — 18 August has four, because that day the repository count was
// corrected from 48 (every repository) to 21 (not archived) — the last one
// wins, so the history uses one definition throughout.
//
// Usage:  node scripts/backfill-history.mjs

import { execFileSync } from 'node:child_process';
import { withPoint, writeHistory, problems } from './history.mjs';

const git = (...args) => execFileSync('git', args, { encoding: 'utf8' });

const shas = git('log', '--format=%H', '--reverse', 'HEAD', '--', 'scripts/metrics.json').trim().split('\n');
if (git('rev-parse', '--is-shallow-repository').trim() === 'true') {
  console.warn('backfill-history: ADVARSEL — klonen er shallow; tidlige målinger kan mangle.');
}

let history = {
  _comment:
    'One point per published measurement of the factory. Appended by scripts/fetch-metrics.mjs; drawn by scripts/build-factory.mjs on /factory-now. The first points were built by scripts/backfill-history.mjs from the git history of scripts/metrics.json.',
  points: [],
};

for (const sha of shas) {
  const m = JSON.parse(git('show', `${sha}:scripts/metrics.json`));
  history = withPoint(history, {
    date: m.measuredAt,
    commits: m.values.commits,
    pullRequests: m.values.pullRequests,
    repositories: m.values.repositories,
  });
}

const bad = problems(history);
if (bad.length) {
  console.error('backfill-history: FEJL —');
  for (const b of bad) console.error(`  ${b}`);
  process.exit(1);
}

await writeHistory(history);
console.log(`backfill-history: ${history.points.length} målinger fra ${shas.length} versioner af metrics.json`);
for (const p of history.points) console.log(`  ${p.date}  ${p.commits} commits  ${p.pullRequests} PRs  ${p.repositories} repos`);
