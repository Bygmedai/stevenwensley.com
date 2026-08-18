#!/usr/bin/env node
// Writes the canonical meta descriptions from scripts/meta-descriptions.json
// into the pages, and refuses to let one grow past the length Google shows.
//
// Why this exists
// ---------------
// Google truncates the snippet at roughly 155 characters — really by pixel
// width, but that is the number to work to. Twenty-nine descriptions were
// longer, and the measurement that mattered was not that they were long: it
// was what got cut. workshop.html lost "with receipts". index.html lost "I
// navigate organisations through the AI transition". regulatory-deadlines
// lost the line saying when it was last reviewed. The voice was living in
// the tail, and the tail is the part nobody sees.
//
// Fourteen more were short enough and read like product labels rather than
// like Steven — the opposite problem, and the worse one.
//
// Scope, deliberately narrow
// --------------------------
// Only <meta name="description">. The og:description and twitter:description
// on these pages are separately written, already short, and better than what
// they would be replaced with — hallucination-defence opens its card with
// "How do you QA an agent that always sounds authoritative?". Social copy is
// not search copy and this script has no opinion about it.
//
// The ten articles under /insights/ are Eleventy output. Their descriptions
// come from frontmatter in src/insights/. They are checked for length here
// and never written, the same arrangement as build-footer-nav.mjs.
//
// Usage:  node scripts/build-meta.mjs [--check]
//         --check exits non-zero if any page differs, without writing.

import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const CHECK = process.argv.includes('--check');

// The working limit. Not a law — Google measures width, not characters — but
// a description under this is one whose ending is never a guess.
const CUT = 155;

const wanted = JSON.parse(await readFile(join(ROOT, 'scripts/meta-descriptions.json'), 'utf8'));

// Entities are how the character count lies. "&#39;" is one apostrophe on
// screen and five characters in the file, so length has to be measured after
// decoding or a description that reads as 150 gets counted as 170.
const decode = (s) =>
  s
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');

// Only what would break the attribute or the parse. Leaving apostrophes and
// dashes as themselves keeps the file readable and the count honest.
const encode = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

const tooLong = Object.entries(wanted).filter(([, d]) => d.length > CUT);
if (tooLong.length) {
  console.error(`build-meta: FEJL — ${tooLong.length} beskrivelse(r) i meta-descriptions.json er over ${CUT} tegn:`);
  for (const [f, d] of tooLong) console.error(`  ${d.length}  ${f}`);
  process.exit(1);
}

const DESC = /<meta\s+name="description"\s+content="([^"]*)"\s*\/?>/i;

const rootPages = (await readdir(ROOT)).filter((f) => f.endsWith('.html'));

// A page nobody wrote a description for is the failure this catches: it ships
// with whatever it had, and nobody finds out until it is in a search result.
const unlisted = rootPages.filter((f) => !wanted[f]);
const ghosts = Object.keys(wanted).filter((f) => !rootPages.includes(f));

if (ghosts.length) {
  console.error('build-meta: FEJL — meta-descriptions.json nævner sider der ikke findes:');
  for (const f of ghosts) console.error(`  ${f}`);
  process.exit(1);
}
if (unlisted.length) {
  console.error(`build-meta: FEJL — ${unlisted.length} side(r) mangler i meta-descriptions.json:`);
  for (const f of unlisted) console.error(`  ${f}`);
  console.error('\n  Tilføj en beskrivelse på højst ' + CUT + ' tegn, eller siden går i søgeresultater');
  console.error('  med hvad den nu havde.');
  process.exit(1);
}

const changed = [];
const noTag = [];

for (const f of rootPages) {
  const abs = join(ROOT, f);
  const original = await readFile(abs, 'utf8');
  const m = original.match(DESC);
  if (!m) {
    noTag.push(f);
    continue;
  }
  if (decode(m[1]) === wanted[f]) continue;
  changed.push({ f, from: decode(m[1]).length, to: wanted[f].length });
  if (!CHECK) {
    await writeFile(abs, original.replace(DESC, `<meta name="description" content="${encode(wanted[f])}">`), 'utf8');
  }
}

if (noTag.length) {
  console.error('build-meta: FEJL — disse sider har ingen <meta name="description">:');
  for (const f of noTag) console.error(`  ${f}`);
  process.exit(1);
}

// Eleventy's output. Checked, never written — the source is the frontmatter.
const overLong = [];
for (const f of await readdir(join(ROOT, 'insights'))) {
  if (!f.endsWith('.html')) continue;
  const m = (await readFile(join(ROOT, 'insights', f), 'utf8')).match(DESC);
  if (!m) {
    overLong.push(`insights/${f}: ingen description`);
    continue;
  }
  const len = decode(m[1]).length;
  if (len > CUT) overLong.push(`insights/${f}: ${len} tegn`);
}
if (overLong.length) {
  console.error(`build-meta: FEJL — /insights/ har beskrivelser over ${CUT} tegn:`);
  for (const o of overLong) console.error(`  ${o}`);
  console.error('\n  Disse sider er Eleventy-output. Ret frontmatter i src/insights/');
  console.error('  og kør npm run build — ikke filerne i /insights/ direkte.');
  process.exit(1);
}

if (!changed.length) {
  console.log(`build-meta: alle ${rootPages.length} sider matcher meta-descriptions.json (max ${CUT} tegn)`);
  process.exit(0);
}

for (const c of changed) console.log(`build-meta: ${c.f}  ${c.from} → ${c.to} tegn`);

if (CHECK) {
  console.error(`\nbuild-meta: FEJL — ${changed.length} side(r) afviger fra meta-descriptions.json.`);
  console.error('  Kør: node scripts/build-meta.mjs  og commit resultatet.');
  process.exit(1);
}
console.log(`build-meta: ${changed.length} side(r) opdateret`);
