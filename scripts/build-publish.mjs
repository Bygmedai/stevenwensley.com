#!/usr/bin/env node
// Assembles the publishable site into ./_site/.
//
// Why this exists
// ---------------
// Eleventy owns only /src/insights/ (see eleventy.config.js). The other 44
// root .html pages, /og/, /img/, /templates/ and the PDFs are hand-maintained
// at the repository root. The root is therefore both the source tree AND the
// web root — which is fine on GitHub Pages, because Jekyll silently hides
// underscore-prefixed and dotfile paths, and because /src/ escapes only by
// accident (Jekyll honours `permalink:` in frontmatter).
//
// Cloudflare Pages runs no Jekyll. Deploying the repository root there serves
// the source tree, the CI workflows, the tooling config and the dotfiles
// verbatim. Measured on the first preview deploy: /.github/workflows/test.yml,
// /CNAME, /.gitignore, /.htmlvalidate.json and /_v.mjs all answered 200 where
// the live site answers 404.
//
// This script builds an explicit publish directory instead. Nothing in the
// repository layout changes, so:
//   - GitHub Pages keeps serving from the root and remains a working rollback
//   - all five CI gates keep running against the root, untouched
//   - no URL moves
//
// It is deliberately an allow-by-default / deny-by-list copier rather than an
// allowlist: a new page dropped at the root must publish without anyone
// remembering to edit this file. Adding a new *tool* at the root is the rarer
// event, and it fails loudly below.
//
// Usage:  node scripts/build-publish.mjs
// Output: ./_site  (git-ignored)

import { cp, mkdir, rm, readdir, stat, access } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const OUT = join(ROOT, '_site');

// Directories never published — source, tests, tooling, VCS, CI.
const DENY_DIRS = new Set([
  'src',
  'tests',
  'scripts',
  'node_modules',
  '_site',
  'test-results',
  'playwright-report',
]);

// Root-level files never published — build config, tooling, repo metadata.
// CNAME stays in the repository (GitHub Pages needs it) but must not ship.
const DENY_FILES = new Set([
  'package.json',
  'package-lock.json',
  'eleventy.config.js',
  'playwright.config.js',
  'CNAME',
  '_v.mjs',
]);

// Anything matching these is denied at any depth.
const denyByName = (name) =>
  name.startsWith('.') ||        // .github, .gitignore, .htmlvalidate.json, .lighthouseci
  name.endsWith('.md');          // README.md, MIGRATION.md, ARCHITECTURE.md

// Files that must exist in the output or the build is wrong. A typo in the
// deny list should stop the deploy, not ship a site with a hole in it.
const REQUIRED = [
  'index.html',
  '404.html',
  '_headers',
  'robots.txt',
  'sitemap.xml',
  'feed.xml',
  'llms.txt',
  'insights/five-signs-not-ready.html',
  'og/index.png',
];

// The inverse assertion. A deny list without a test rots: someone adds a tool
// at the root, nobody remembers this file, and it ships. These paths are the
// ones that measurably differed between GitHub Pages and the first Cloudflare
// preview — if any of them reappears in the output, fail the build.
const FORBIDDEN = [
  'src',
  'src/insights/five-signs-not-ready.html',
  'tests',
  'scripts',
  '.github',
  '.github/workflows/test.yml',
  '.gitignore',
  '.htmlvalidate.json',
  'package.json',
  'package-lock.json',
  'eleventy.config.js',
  'playwright.config.js',
  'CNAME',
  '_v.mjs',
  'README.md',
  'MIGRATION.md',
  'ARCHITECTURE.md',
];

const kept = [];
const skipped = [];

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const abs = join(dir, e.name);
    const rel = relative(ROOT, abs);
    const isRoot = !rel.includes(sep);

    if (e.isDirectory()) {
      if (denyByName(e.name) || (isRoot && DENY_DIRS.has(e.name))) {
        skipped.push(rel + '/');
        continue;
      }
      await walk(abs);
      continue;
    }

    if (denyByName(e.name) || (isRoot && DENY_FILES.has(e.name))) {
      skipped.push(rel);
      continue;
    }

    await mkdir(join(OUT, relative(ROOT, dir)), { recursive: true });
    await cp(abs, join(OUT, rel));
    kept.push(rel);
  }
}

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });
await walk(ROOT);

let bytes = 0;
for (const f of kept) bytes += (await stat(join(OUT, f))).size;

console.log(`build-publish: ${kept.length} filer publiceret (${(bytes / 1e6).toFixed(2)} MB)`);
console.log(`build-publish: ${skipped.length} poster udeladt`);
for (const s of skipped.sort()) console.log(`  udeladt  ${s}`);

const exists = async (p) => {
  try {
    await access(join(OUT, p));
    return true;
  } catch {
    return false;
  }
};

const missing = [];
for (const r of REQUIRED) if (!(await exists(r))) missing.push(r);

const leaked = [];
for (const f of FORBIDDEN) if (await exists(f)) leaked.push(f);

if (missing.length || leaked.length) {
  if (missing.length) {
    console.error('\nbuild-publish: FEJL — disse filer mangler i _site/:');
    for (const m of missing) console.error(`  ${m}`);
  }
  if (leaked.length) {
    console.error('\nbuild-publish: FEJL — disse burde aldrig ligge i _site/:');
    for (const l of leaked) console.error(`  ${l}`);
  }
  process.exit(1);
}

console.log('build-publish: kontrolfiler til stede, ingen kilde eller vaerktoej laekket');
