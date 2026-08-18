#!/usr/bin/env node
// Derives the deadline tracker's statuses from the dates on the page.
//
// Why this exists
// ---------------
// regulatory-deadlines.html is a tool whose entire job is telling a reader
// what is already in force and what is still coming. Until now every row
// carried a hand-written status. On 17 August the Article 50 row still said
// "Upcoming" for a date that had passed on 2 August, and the "Today" marker
// sat in the wrong place. A deadline tracker that is behind on deadlines is
// worse than no deadline tracker: it is confidently wrong about the one thing
// it exists to be right about.
//
// So the status is no longer written. It is computed from the date in the row,
// at build time, and asserted in CI. Nobody has to remember anything.
//
// What it does not touch
// ----------------------
// "Deferred" is a judgement, not a date: it means the date moved under the
// Digital Omnibus and may move again. A row marked deferred in the source
// keeps that status regardless of the calendar. Only live/upcoming flip.
//
// The small label under the date is the author's, not the script's. One row
// reads "Passed" rather than "In force" because it is a registration deadline
// that expired — a one-off event, not a continuing obligation. Flattening that
// to "In force" would be a small lie about what the row means. So the label is
// only rewritten when a row actually crosses from future to past; a row that
// was already correct keeps whatever wording was chosen for it.
//
// Usage:  node scripts/build-deadlines.mjs [--check]
//         --check exits non-zero if the committed file disagrees with the
//         computed statuses, without writing.

import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const FILE = join(ROOT, 'regulatory-deadlines.html');

// Today, or an override so the build is reproducible and testable.
// SOURCE_DATE_EPOCH is the reproducible-builds convention.
const today = process.env.DEADLINES_TODAY
  ? new Date(process.env.DEADLINES_TODAY)
  : new Date();

const MONTHS = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };

let html = await readFile(FILE, 'utf8');

// One row looks like:
//   <div class="tl-item" data-status="live">
//     <div class="tl-date">2 Aug 2026<small>In force</small></div>
//     ... <span class="badge badge-status st-live"><span class="sd"></span>Live</span>
const ROW = /<div class="tl-item" data-status="(\w+)">\s*\n\s*<div class="tl-date">(\d{1,2}) (\w{3}) (\d{4})<small>([^<]*)<\/small><\/div>/g;

const rows = [];
for (const m of html.matchAll(ROW)) {
  const [full, status, day, mon, year, smallLabel] = m;
  rows.push({
    full,
    status,
    smallLabel,
    date: new Date(Date.UTC(+year, MONTHS[mon], +day)),
    label: `${day} ${mon} ${year}`,
  });
}

if (rows.length === 0) {
  console.error('build-deadlines: FEJL — fandt ingen rækker. Er markup ændret?');
  process.exit(1);
}

const changes = [];
for (const r of rows) {
  if (r.status === 'deferred') continue; // judgement, not arithmetic

  const past = r.date <= today;
  const want = past ? 'live' : 'upcoming';
  const wantBadge = past ? 'Live' : 'Upcoming';

  // Already correct — leave the row, and its wording, exactly as written.
  if (r.status === want) continue;

  const wantSmall = past ? 'In force' : 'Upcoming';
  const before = r.full;
  const after = before
    .replace(`data-status="${r.status}"`, `data-status="${want}"`)
    .replace(`<small>${r.smallLabel}</small>`, `<small>${wantSmall}</small>`);
  html = html.replace(before, after);

  // The badge sits a couple of lines below, inside the same row block.
  const idx = html.indexOf(after);
  const tail = html.slice(idx, idx + 900);
  const fixedTail = tail.replace(
    /st-\w+"><span class="sd"><\/span>(Live|Upcoming)</,
    `st-${want}"><span class="sd"></span>${wantBadge}<`
  );
  html = html.slice(0, idx) + fixedTail + html.slice(idx + 900);

  changes.push(`${r.label}: ${r.status} → ${want}`);
}

// The Today marker belongs after the last past row.
const MARKER = '    <div class="today-marker" data-status="marker"><span class="lbl">Today</span><span class="line"></span></div>\n';
const hadMarker = html.includes(MARKER);
if (hadMarker) {
  html = html.replace(MARKER + '\n', '').replace(MARKER, '');
  const items = [...html.matchAll(/<div class="tl-item" data-status="(\w+)">[\s\S]*?\n    <\/div>\n/g)];
  let insertAt = null;
  for (const m of items) {
    const d = m[0].match(/<div class="tl-date">(\d{1,2}) (\w{3}) (\d{4})</);
    if (!d) continue;
    const when = new Date(Date.UTC(+d[3], MONTHS[d[2]], +d[1]));
    if (when <= today) insertAt = m.index + m[0].length;
  }
  if (insertAt !== null) html = html.slice(0, insertAt) + '\n' + MARKER + html.slice(insertAt);
}

const check = process.argv.includes('--check');
const original = await readFile(FILE, 'utf8');

if (html === original) {
  console.log(`build-deadlines: statusser er korrekte pr. ${today.toISOString().slice(0, 10)} (${rows.length} rækker)`);
  process.exit(0);
}

for (const c of changes) console.log(`build-deadlines: ${c}`);
if (changes.length === 0) console.log('build-deadlines: Today-markøren flyttes');

if (check) {
  console.error('\nbuild-deadlines: FEJL — trackerens statusser er forældede.');
  console.error('  Kør: node scripts/build-deadlines.mjs  og commit resultatet.');
  process.exit(1);
}

await writeFile(FILE, html, 'utf8');
console.log('build-deadlines: regulatory-deadlines.html opdateret');
