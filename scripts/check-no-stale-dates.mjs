#!/usr/bin/env node
// Fails if any page states availability, or freshness, as a fixed date.
//
// Why this exists
// ---------------
// index-da.html said "Ledig fra 15. juli 2026" in six places, including a
// green pulsing "available" badge, for a month after that date had passed. It
// also carried "Opdateret juni 2026" — a freshness stamp two months out of
// date, which is worse than no stamp at all, because it asserts currency it
// does not have. The page is indexable, sits in the sitemap, and is linked
// from the English front page, so a Danish recruiter reading it in August was
// shown a date in the past presented as future availability.
//
// Nobody wrote those lines carelessly. They were true when written. That is
// the whole problem with a date in copy: it is correct on the day it is
// typed and silently wrong every day after, and nothing in a build fails.
//
// The decision, from Steven on 18 August 2026: no availability date on the
// site at all. Just that he is available, and open to both full-time
// freelance work and smaller pieces when they fit the calendar. That decision
// is what this file enforces — a sentence with no date in it cannot go stale.
//
// Deliberately narrow. It does not object to dates in general: the regulatory
// deadline tracker is nothing but dates, articles carry publication dates,
// and the EU AI Act's dates are the point of several pages. It objects only
// to the two constructions that make a promise about *now*.
//
// Usage:  node scripts/check-no-stale-dates.mjs

import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

const MONTHS =
  '(januar|februar|marts|april|maj|juni|juli|august|september|oktober|november|december' +
  '|January|February|March|April|May|June|July|August|September|October|November|December)';

const BANNED = [
  {
    // "Ledig fra 15. juli 2026", "Available from July 2026".
    // Not [^<.] — a Danish date is written "15. juli 2026", so excluding the
    // full stop meant the pattern could never reach the year it was looking
    // for. The first version of this check passed against the exact string it
    // was written to catch.
    re: new RegExp(`(Ledig|Tilg[æa&][a-z;]*ngelig|Available)\\s+(fra|from)\\s+[^<]{0,30}(\\d{4}|${MONTHS})`, 'i'),
    why: 'ledighed angivet som en fast dato — skriv "Ledig nu" i stedet',
  },
  {
    // "Opdateret juni 2026", "Updated June 2026", "Reviewed August 2026"
    re: new RegExp(`(Opdateret|Senest\\s+opdateret|Updated|Reviewed|Last\\s+reviewed)\\s+${MONTHS}\\s+\\d{4}`, 'i'),
    why: 'friskheds-stempel med fast måned — det påstår aktualitet, det ikke kan holde',
  },
];

// Pages whose subject is dated by nature. The classifier cites which version
// of the AI Act it implements, and that stamp SHOULD be fixed — it refers to
// the regulation, not to the site.
const EXEMPT = new Set(['eu-ai-act-classifier.html', 'regulatory-deadlines.html']);

const files = [
  ...(await readdir(ROOT)).filter((f) => f.endsWith('.html')).map((f) => f),
  ...(await readdir(join(ROOT, 'insights'))).filter((f) => f.endsWith('.html')).map((f) => `insights/${f}`),
];

const hits = [];
for (const f of files) {
  if (EXEMPT.has(f)) continue;
  const text = await readFile(join(ROOT, f), 'utf8');
  for (const line of text.split('\n')) {
    for (const b of BANNED) {
      const m = line.match(b.re);
      if (m) hits.push({ f, found: m[0].replace(/\s+/g, ' ').trim(), why: b.why });
    }
  }
}

if (!hits.length) {
  console.log(`check-no-stale-dates: ${files.length - EXEMPT.size} sider — ingen ledigheds- eller friskheds-datoer`);
  process.exit(0);
}

console.error(`check-no-stale-dates: FEJL — ${hits.length} fund:`);
for (const h of hits) {
  console.error(`  ${h.f}`);
  console.error(`    "${h.found}"`);
  console.error(`    ${h.why}\n`);
}
process.exit(1);
