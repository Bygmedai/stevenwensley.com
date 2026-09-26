#!/usr/bin/env node
// Measures the factory from the GitHub API and writes the result into
// scripts/metrics.json. Run by .github/workflows/metrics.yml on a schedule;
// scripts/update-metrics.mjs then propagates the numbers into the pages.
//
// Requires FACTORY_METRICS_TOKEN: a fine-grained personal access token with
// read-only access to the Bygmedai organisation, including private
// repositories. The name deliberately avoids the GITHUB_ prefix — GitHub
// reserves it and refuses to create a secret that uses it, so the obvious
// name for this variable is the one name it cannot have. The default GITHUB_TOKEN in Actions is scoped to one
// repository and cannot see the rest of the org, which is the whole point of
// the measurement — so without the secret this exits without changing
// anything rather than writing a wrong, smaller number.
//
// Method, kept identical to the original hand measurement so the figures stay
// comparable: GitHub's commit and issue search, scoped to org:Bygmedai, from
// the factory's start date. Commit search covers default branches only, which
// makes both counts lower bounds — stated as such on the site.
//
// `solutions` is never touched here. What counts as a client-facing delivery
// is a judgement, not a query.

import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const METRICS = join(ROOT, 'scripts/metrics.json');
const ORG = 'Bygmedai';
const token = process.env.FACTORY_METRICS_TOKEN;

if (!token) {
  console.log('fetch-metrics: FACTORY_METRICS_TOKEN mangler — springer over, intet ændret.');
  process.exit(0);
}

// METRICS_API_BASE exists so every branch below can be exercised against a
// local stand-in — a dead token, a token a week from expiry — without anyone
// handing a real token to a test.
const API = process.env.METRICS_API_BASE || 'https://api.github.com';

// GitHub states a token's expiry on every response it authenticates, in this
// header. Read once, from the first response that carries it.
let expiresHeader = null;

const api = async (path) => {
  const r = await fetch(API + path, {
    headers: {
      accept: 'application/vnd.github+json',
      authorization: `Bearer ${token}`,
      'user-agent': 'stevenwensley.com-metrics',
    },
  });
  expiresHeader ??= r.headers.get('github-authentication-token-expiration');
  // 401 means the token itself is refused — expired or revoked. That is the
  // one failure with a single, known remedy, so it gets said plainly. From 17
  // to 25 September it surfaced only as a stack trace in a log nobody opened.
  if (r.status === 401) {
    console.error('fetch-metrics: FEJL — GitHub afviser FACTORY_METRICS_TOKEN (401).');
    console.error('  Tokenet er udløbet eller tilbagekaldt. Tallene på sitet opdateres ikke,');
    console.error('  før det er fornyet: GitHub → Settings → Developer settings → Fine-grained');
    console.error('  tokens → Regenerate, og derefter repoets secret FACTORY_METRICS_TOKEN.');
    process.exit(1);
  }
  if (!r.ok) throw new Error(`${path} → ${r.status} ${r.statusText}`);
  return r.json();
};

// Whole days until expiry, or null when the token does not expire.
const daysLeft = (header, now = new Date()) => {
  if (!header) return null;
  // Documented format: "2026-10-18 12:00:00 UTC". Some responses omit " UTC".
  const at = new Date(header.replace(' UTC', 'Z').replace(' ', 'T'));
  if (Number.isNaN(at.getTime())) return null;
  return Math.floor((at - now) / 86_400_000);
};

const reportExpiry = async () => {
  const left = daysLeft(expiresHeader, process.env.METRICS_NOW ? new Date(process.env.METRICS_NOW) : new Date());
  if (left === null) return;
  console.log(`fetch-metrics: tokenet udløber om ${left} dag(e) (${expiresHeader})`);
  if (left <= 14) console.log(`::warning::FACTORY_METRICS_TOKEN udløber om ${left} dag(e).`);
  // The workflow turns this into a red run at seven days, after the refresh
  // has been proposed — see "Fail a week before the token expires".
  if (process.env.GITHUB_OUTPUT) {
    const { appendFile } = await import('node:fs/promises');
    await appendFile(process.env.GITHUB_OUTPUT, `token_days_left=${left}\n`);
  }
};

const q = (s) => encodeURIComponent(s);

const metrics = JSON.parse(await readFile(METRICS, 'utf8'));
const from = metrics.window.from;

// Ink & Art is the one client build the site names, so its figures sit beside
// the factory's and drift the same way.
const INKANDART = 'repo:Bygmedai/inkandart.dk repo:Bygmedai/inkandart-webshop';
const inkFrom = metrics.window.inkandartFrom;

const [commits, prs, repos, inkCommits, inkPrs] = await Promise.all([
  api(`/search/commits?q=${q(`org:${ORG} committer-date:>=${from}`)}&per_page=1`),
  api(`/search/issues?q=${q(`org:${ORG} is:pr created:>=${from}`)}&per_page=1`),
  // archived:false, not the bare org query. The site says "repositories in
  // active development", and 27 of the 48 repositories are archived — so the
  // total was the wrong number for that sentence.
  api(`/search/repositories?q=${q(`org:${ORG} archived:false`)}&per_page=1`),
  api(`/search/commits?q=${q(`${INKANDART} committer-date:>=${inkFrom}`)}&per_page=1`),
  api(`/search/issues?q=${q(`${INKANDART} is:pr created:>=${inkFrom}`)}&per_page=1`),
]);

// Before any exit below: an unchanged measurement is still a moment to warn.
await reportExpiry();

const next = {
  commits: commits.total_count,
  pullRequests: prs.total_count,
  repositories: repos.total_count,
  inkandartCommits: inkCommits.total_count,
  inkandartPullRequests: inkPrs.total_count,
  // Never measured: what counts as a client-facing delivery is a judgement.
  // Steven confirmed 15 on 18 August, having archived one.
  solutions: metrics.values.solutions,
  copyrightYear: metrics.values.copyrightYear,
};

// A measurement that goes backwards means the token lost visibility of some
// repositories, not that work was deleted. Publishing a lower number would
// quietly understate the site's central claim, so refuse instead.
for (const k of ['commits', 'pullRequests', 'inkandartCommits', 'inkandartPullRequests']) {
  if (next[k] < metrics.values[k]) {
    console.error(
      `fetch-metrics: FEJL — ${k} faldt fra ${metrics.values[k]} til ${next[k]}.\n` +
        '  Commits og pull requests går ikke ned af sig selv. Tjek at token\n' +
        '  stadig kan se alle repoer. (repositories er med vilje undtaget:\n' +
        '  det tal falder helt legitimt, når noget bliver arkiveret.)'
    );
    process.exit(1);
  }
}

const changed = Object.keys(next).some((k) => next[k] !== metrics.values[k]);
if (!changed) {
  console.log('fetch-metrics: tal uændrede siden', metrics.measuredAt);
  process.exit(0);
}

for (const k of Object.keys(next)) {
  if (next[k] !== metrics.values[k]) console.log(`fetch-metrics: ${k}  ${metrics.values[k]} → ${next[k]}`);
}

metrics.values = next;
metrics.measuredAt = new Date().toISOString().slice(0, 10);
await writeFile(METRICS, JSON.stringify(metrics, null, 2) + '\n', 'utf8');
console.log('fetch-metrics: metrics.json skrevet — kør update-metrics for at lægge tallene i siderne');
