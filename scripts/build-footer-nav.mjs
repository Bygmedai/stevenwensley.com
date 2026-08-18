#!/usr/bin/env node
// Ensures every page carries the same footer navigation row.
//
// Why this exists
// ---------------
// Google knew 25 of the site's 54 pages. Part of that was a sitemap that had
// been hand-maintained and had drifted; the rest is the link graph. A crawler
// finds pages by following links, and the internal linking said /insights was
// a dead end: exactly one page in the whole site linked to it, and the ten
// articles behind it hung off that single thread. /glossary had one inbound
// link too.
//
// Measured before this script: eight pages had no footer at all — all of them
// tool pages, the ones most likely to be a stranger's first landing from a
// search result. Two more had a footer with no links in it. Six others had
// their own ad-hoc link sets. Twenty-nine shared a footer that was missing
// /insights and /glossary.
//
// So: one row, every page, containing every hub. Pages that carry extra footer
// content — book-session has contact details and credentials — keep it and
// gain the row above it.
//
// Usage:  node scripts/build-footer-nav.mjs [--check]
//         --check exits non-zero if any page is missing or differs from the
//         canonical row, without writing.

//
// The ten articles under /insights/ are Eleventy output, not source. This
// script never writes them — it would be overwritten by the next build. Their
// row comes from src/_includes/footer.njk, and this script checks it is there
// so the two definitions cannot drift apart unnoticed.

import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

// Every hub the site has. Contact is a fragment on the front page, so it goes
// last where a truncated read loses least.
const LINKS = [
  ['/', 'Home'],
  ['/workshop', 'The Factory'],
  ['/playbooks', 'Playbooks'],
  ['/services', 'Services'],
  ['/tools', 'Tools'],
  ['/insights', 'Insights'],
  ['/notes', 'Notes'],
  ['/glossary', 'Glossary'],
  ['/about', 'About'],
  ['/#contact', 'Contact'],
];

const MARK = 'data-footer-nav';
const ROW =
  `  <div ${MARK} style="margin-bottom: 0.5rem;">` +
  LINKS.map(([h, t]) => `<a href="${h}">${t}</a>`).join(' &middot; ') +
  '</div>\n';

// Eight pages had no <footer> at all — all of them tools, the pages a stranger
// is most likely to land on from a search result, and the ones from which
// there was no way onward. Most of them also have no footer styling, so the
// element they get is self-contained: it cannot inherit what is not there.
// The row is embedded verbatim — styling goes in a scoped rule beside it, not
// into the markup. Rewriting the row here would make the script rewrite its own
// output on the next run, and a formatter that is not idempotent is a formatter
// that shows up in every diff forever.
const STANDALONE = (rowHtml) =>
  '<footer style="padding:2rem 1.5rem;text-align:center;font-size:0.85rem;' +
  'color:#8e8e9e;border-top:1px solid rgba(201,169,110,0.12);margin-top:4rem;' +
  'font-family:\'Space Grotesk\',-apple-system,sans-serif;">\n' +
  '<style>[data-footer-nav] a{color:#9a9aaa;text-decoration:none}' +
  '[data-footer-nav] a:hover{color:#c9a96e}</style>\n' +
  rowHtml +
  '  &copy; 2026 Steven Seidenfaden Wensley. All rights reserved.\n' +
  '</footer>\n';

// Pages that are deliberately outside the site's navigation. The 404 page gets
// the row — someone who lands there needs it more than anyone — but templates
// is a gated lead magnet and index-da/services-da are the Danish mirror, which
// links within itself.
const SKIP = new Set(['index-da.html', 'services-da.html']);

const files = (await readdir(ROOT)).filter((f) => f.endsWith('.html') && !SKIP.has(f));

const added = [];
const replaced = [];
const missingFooter = [];

for (const f of files) {
  const abs = join(ROOT, f);
  const original = await readFile(abs, 'utf8');

  let text = original;
  const footer = original.match(/<footer[^>]*>/);

  if (!footer) {
    // Give the page a footer rather than reporting it as a dead end and
    // leaving it one.
    const close = text.lastIndexOf('</body>');
    if (close === -1) {
      missingFooter.push(f);
      continue;
    }
    text = text.slice(0, close) + STANDALONE(ROW) + text.slice(close);
    added.push(f);
    await writeFileIfWriting(abs, text);
    continue;
  }

  const existing = text.match(new RegExp(`  <div ${MARK}[\\s\\S]*?</div>\\n`));
  if (existing) {
    if (existing[0] === ROW) continue;
    text = text.replace(existing[0], ROW);
    replaced.push(f);
  } else {
    // Insert immediately after the opening <footer> tag, above whatever the
    // page already had there.
    text = text.replace(footer[0], footer[0] + '\n' + ROW);
    added.push(f);
  }
  if (text !== original) await writeFileIfWriting(abs, text);
}

async function writeFileIfWriting(abs, text) {
  if (!process.argv.includes('--check')) await writeFile(abs, text, 'utf8');
}

// The Eleventy-owned articles. Checked, never written. Their hrefs are
// absolute (the layout renders {{ site.url }}), so compare the path, not the
// whole string — the row's *content* is what has to match, not its spelling.
const generatedDrift = [];
for (const f of await readdir(join(ROOT, 'insights'))) {
  if (!f.endsWith('.html')) continue;
  const text = await readFile(join(ROOT, 'insights', f), 'utf8');
  const row = text.match(/<div data-footer-nav[\s\S]*?<\/div>/);
  if (!row) {
    generatedDrift.push(`insights/${f}: ingen data-footer-nav-række`);
    continue;
  }
  const missing = LINKS.map(([h]) => h).filter(
    (h) => !row[0].includes(`href="${h}"`) && !row[0].includes(`.com${h}"`)
  );
  if (missing.length) generatedDrift.push(`insights/${f}: mangler ${missing.join(', ')}`);
}

if (generatedDrift.length) {
  console.error('build-footer-nav: FEJL — /insights/ afviger fra den kanoniske række:');
  for (const d of generatedDrift) console.error(`  ${d}`);
  console.error('\n  Disse sider er Eleventy-output. Ret src/_includes/footer.njk');
  console.error('  og kør npm run build — ikke filerne i /insights/ direkte.');
  process.exit(1);
}

// A page with neither a footer nor a </body> is malformed in a way this script
// should not paper over.
if (missingFooter.length) {
  console.error('build-footer-nav: FEJL — disse sider har hverken <footer> eller </body>:');
  for (const f of missingFooter) console.error(`  ${f}`);
  process.exit(1);
}

const touched = added.length + replaced.length;
if (touched === 0) {
  console.log(`build-footer-nav: alle ${files.length} sider har den kanoniske footer-navigation`);
  process.exit(0);
}

for (const f of added) console.log(`build-footer-nav: tilføjet  ${f}`);
for (const f of replaced) console.log(`build-footer-nav: opdateret ${f}`);

if (process.argv.includes('--check')) {
  console.error(`\nbuild-footer-nav: FEJL — ${touched} side(r) mangler eller afviger.`);
  console.error('  Kør: node scripts/build-footer-nav.mjs  og commit resultatet.');
  process.exit(1);
}
console.log(`build-footer-nav: ${touched} side(r) opdateret`);
