#!/usr/bin/env node
// Compiles the interactive tools' JSX once, at build time, instead of in every
// visitor's browser.
//
// Why this exists
// ---------------
// Five tool pages shipped @babel/standalone 8.0.4 — 2.46 MB of JavaScript,
// 565 KB compressed on the wire — so the browser could translate JSX into
// JavaScript before the tool worked. Every visitor paid for that on every
// visit: download it, parse all 2.46 MB, then compile ~900 lines of the page's
// own code, all before the first question appeared. A phone on a train
// felt it most, and the tools are the pages a stranger lands on from search.
//
// This is a performance change, not a security one. It was first proposed as
// both, on the belief that Babel needed 'unsafe-eval' in the CSP. Tested, it
// did not: Babel inserts its output as inline <script> elements, which
// 'unsafe-inline' covers. 'unsafe-eval' was dropped in the same change because
// nothing on the site needs it, but not because of this script.
//
// The comparison that prompted this: a competing consultant's site, built with
// Astro, ships zero bytes of JavaScript. Ours shipped 2.46 MB of compiler to
// render a form. (It was first reported as 3.1 MB — that was the size of the
// latest Babel, not of the pinned version these pages actually loaded.)
//
// How it works
// ------------
// The JSX lives in src/tools/<page>.jsx — the source people edit. This script
// transforms each one with esbuild into js/tools/<page>.js, which is committed
// and published; the page loads it with `defer`.
//
// `defer`, because it reproduces Babel's timing: Babel ran the compiled code on
// DOMContentLoaded, after every other script on the page. A deferred script
// runs after parsing, after the other scripts, in the same order.
//
// Each tool is wrapped in its own function scope (format: 'iife'), and that is
// a fix, not a style choice. Babel ran each tool as a classic script whose
// top-level names became globals — up to 92 of them per page. Lenis 1.1.18,
// the smooth-scroll library, leaks a global function named T. Three of the
// tools declare their translation table as `const T`. Under Babel the tool's
// T silently replaced Lenis's function; compiled without a wrapper, the
// declaration collided and three tools rendered nothing at all. Nothing
// outside a tool reads any of its names — checked against every other script
// and every on* attribute on the five pages — so the wrapper removes a
// collision and changes nothing else.
//
// React itself still loads from unpkg. That is 142 KB against Babel's 2.46 MB,
// and replacing it is a rewrite of the tools rather than a build step.
//
// Usage:  node scripts/build-tools.mjs [--check]
//         --check exits non-zero if any compiled file differs from a fresh
//         compile, or if Babel has crept back onto any page.

import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { transform } from 'esbuild';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SRC = join(ROOT, 'src/tools');
const OUT = join(ROOT, 'js/tools');
const CHECK = process.argv.includes('--check');

const HEADER = (name) =>
  `// GENERATED from src/tools/${name}.jsx by scripts/build-tools.mjs — do not edit.\n` +
  `// Edit the .jsx and run: node scripts/build-tools.mjs\n`;

const tools = (await readdir(SRC)).filter((f) => f.endsWith('.jsx')).map((f) => f.slice(0, -4)).sort();

const drift = [];
for (const name of tools) {
  const source = await readFile(join(SRC, `${name}.jsx`), 'utf8');
  const { code } = await transform(source, {
    loader: 'jsx',
    jsx: 'transform',
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment',
    // Safari 14 and every browser since. Babel's browser build targeted
    // whatever it ran on, so this is the conservative reading of "the same".
    target: 'es2019',
    // Own scope per tool. See the header: without it, `const T` collides with
    // the global function Lenis leaks, and under Babel it overwrote it.
    format: 'iife',
    sourcefile: `src/tools/${name}.jsx`,
  });
  const out = HEADER(name) + code;
  const target = join(OUT, `${name}.js`);
  let committed = null;
  try {
    committed = await readFile(target, 'utf8');
  } catch {
    /* not generated yet */
  }
  if (committed === out) continue;
  drift.push(name);
  if (!CHECK) {
    await mkdir(OUT, { recursive: true });
    await writeFile(target, out, 'utf8');
  }
}

// The inverse assertion, so the 2.46 MB cannot come back one page at a time:
// no published page may load Babel or carry JSX for the browser to compile,
// and every tool must be wired to its compiled file.
const pages = (await readdir(ROOT)).filter((f) => f.endsWith('.html'));
const regressions = [];
for (const f of pages) {
  const html = await readFile(join(ROOT, f), 'utf8');
  if (/@babel\/standalone/.test(html)) regressions.push(`${f}: loader @babel/standalone`);
  if (/type="text\/babel"/.test(html)) regressions.push(`${f}: har en <script type="text/babel">-blok`);
}
for (const name of tools) {
  const html = await readFile(join(ROOT, `${name}.html`), 'utf8').catch(() => null);
  if (html === null) regressions.push(`src/tools/${name}.jsx: ingen side ${name}.html`);
  else if (!html.includes(`<script src="/js/tools/${name}.js" defer></script>`))
    regressions.push(`${name}.html: indlæser ikke /js/tools/${name}.js med defer`);
}

if (regressions.length) {
  console.error('build-tools: FEJL —');
  for (const r of regressions) console.error(`  ${r}`);
  process.exit(1);
}

if (!drift.length) {
  console.log(`build-tools: ${tools.length} værktøjer kompileret og ajour — ingen side indlæser Babel`);
  process.exit(0);
}

for (const d of drift) console.log(`build-tools: ${CHECK ? 'afviger' : 'kompileret'}  js/tools/${d}.js`);
if (CHECK) {
  console.error('\nbuild-tools: FEJL — de kompilerede filer matcher ikke src/tools/.');
  console.error('  Kør: node scripts/build-tools.mjs  og commit resultatet.');
  process.exit(1);
}
