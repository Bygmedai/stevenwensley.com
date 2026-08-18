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

const api = async (path) => {
  const r = await fetch('https://api.github.com' + path, {
    headers: {
      accept: 'application/vnd.github+json',
      authorization: `Bearer ${token}`,
      'user-agent': 'stevenwensley.com-metrics',
    },
  });
  if (!r.ok) throw new Error(`${path} → ${r.status} ${r.statusText}`);
  return r.json();
};

const q = (s) => encodeURIComponent(s);

const metrics = JSON.parse(await readFile(METRICS, 'utf8'));
const from = metrics.window.from;

const [commits, prs, repos] = await Promise.all([
  api(`/search/commits?q=${q(`org:${ORG} committer-date:>=${from}`)}&per_page=1`),
  api(`/search/issues?q=${q(`org:${ORG} is:pr created:>=${from}`)}&per_page=1`),
  api(`/search/repositories?q=${q(`org:${ORG}`)}&per_page=1`),
]);

const next = {
  commits: commits.total_count,
  pullRequests: prs.total_count,
  repositories: repos.total_count,
  solutions: metrics.values.solutions,
};

// A measurement that goes backwards means the token lost visibility of some
// repositories, not that work was deleted. Publishing a lower number would
// quietly understate the site's central claim, so refuse instead.
for (const k of ['commits', 'pullRequests']) {
  if (next[k] < metrics.values[k]) {
    console.error(
      `fetch-metrics: FEJL — ${k} faldt fra ${metrics.values[k]} til ${next[k]}.\n` +
        '  Det sker ikke af sig selv. Tjek at token stadig kan se alle repoer.'
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
