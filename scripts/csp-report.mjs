#!/usr/bin/env node
// Loads every published page in a headless browser with the site's own CSP
// applied, and reports what the policy would block.
//
// Why this exists
// ---------------
// _headers ships Content-Security-Policy-Report-Only. Report-only means the
// browser enforces nothing and logs violations instead, so the policy can be
// proven before it is allowed to break anything. But "prove it" was left as
// a manual pass through the pages, which is the kind of step that never
// happens. This is that step, mechanised.
//
// It reads the policy out of _headers rather than restating it, so there is
// one definition and no way for the test to pass against a policy the site
// does not actually serve.
//
// Third-party scripts are loaded and RUN. The first version aborted every
// third-party request for speed, on the reasoning that a violation for a
// disallowed origin fires before the request goes out. That part was true. But
// it made the scan blind to everything a library does once it runs — an eval,
// an injected inline script, a fetch to an origin not on the list — because
// the library never ran. It was found when this scan, asked whether Babel
// needed 'unsafe-eval', could not have answered either way.
//
// So by default the libraries come from the network, as in production. On a
// machine without that network, CSP_CACHE_DIR serves them from local files
// instead (named by the first 16 hex characters of the URL's SHA-256); and a
// library that could not be fetched either way is counted and reported, loudly,
// rather than silently leaving the page half-checked. --offline restores the
// old abort-everything behaviour, and says on every run what it cannot see.
//
// What this does NOT cover
// ------------------------
// Page load only. Every page is opened and given a moment to settle; nothing
// is clicked. So a resource fetched in response to an interaction is invisible
// here — the Calendly embed on book-session, and jsPDF pulling what it needs
// when someone exports a report from a tool page, are both loaded that way.
//
// That is why a clean run is not on its own a reason to switch the policy from
// report-only to enforcing. The site's own rule is that a change to a user
// flow is not done until the whole flow has been tested end to end, and this
// tests the first step of it. Exercise the export and the booking widget
// against --enforce before flipping the header.
//
// Usage:  node scripts/csp-report.mjs [--enforce] [--offline] [--page /path]
//         --enforce  serves the policy as Content-Security-Policy instead of
//                    report-only, to see what a flip would actually do.
//         --offline  aborts third-party requests: origin checks only, no
//                    library behaviour. Printed as a warning on every run.
//         CSP_CACHE_DIR=<dir>  serves third-party files from <dir>.
//
// Exit codes: 0 clean with every library running · 1 violations found ·
// 2 no violations, but some third-party script never ran, so the result is
// incomplete and must not be read as clean.

import { readFile, readdir, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SITE = join(ROOT, '_site');
const PORT = 8123;

const enforce = process.argv.includes('--enforce');
const offline = process.argv.includes('--offline');
const cacheDir = process.env.CSP_CACHE_DIR || null;
const cacheKey = (url) => createHash('sha256').update(url).digest('hex').slice(0, 16);
const onlyIdx = process.argv.indexOf('--page');
const only = onlyIdx !== -1 ? process.argv[onlyIdx + 1] : null;

// One definition. Restating the policy here would let this pass against a
// policy the site never serves.
const headers = await readFile(join(ROOT, '_headers'), 'utf8');
const fromFile = headers.match(/Content-Security-Policy-Report-Only:\s*(.+)/)?.[1]?.trim();
if (!fromFile) {
  console.error('csp-report: FEJL — fandt ingen Content-Security-Policy-Report-Only i _headers.');
  process.exit(1);
}

// CSP_OVERRIDE exists to prove this harness detects anything at all. A run
// that reports zero violations is only meaningful if a run against a policy
// that must fail reports some — otherwise "clean" and "broken detector" look
// identical. Try: CSP_OVERRIDE="default-src 'none'" node scripts/csp-report.mjs --page /
const policy = process.env.CSP_OVERRIDE || fromFile;
if (process.env.CSP_OVERRIDE) console.log('csp-report: BRUGER CSP_OVERRIDE — ikke politikken fra _headers\n');

try {
  await stat(SITE);
} catch {
  console.error('csp-report: FEJL — _site findes ikke. Kør: node scripts/build-publish.mjs');
  process.exit(1);
}

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
};

// Production resolves /workshop to workshop.html. Serving it any other way
// would test a page shape the site never returns.
const resolve = async (urlPath) => {
  const clean = decodeURIComponent(urlPath.split('?')[0]).replace(/^\/+/, '');
  for (const c of [clean, `${clean}.html`, join(clean, 'index.html'), 'index.html'].filter(Boolean)) {
    if (!c || c.includes('..')) continue;
    try {
      const s = await stat(join(SITE, c));
      if (s.isFile()) return join(SITE, c);
    } catch {
      /* next candidate */
    }
  }
  return null;
};

const server = createServer(async (req, res) => {
  const file = await resolve(req.url === '/' ? 'index.html' : req.url);
  if (!file) {
    res.writeHead(404).end('not found');
    return;
  }
  res.setHeader(enforce ? 'Content-Security-Policy' : 'Content-Security-Policy-Report-Only', policy);
  res.setHeader('Content-Type', TYPES[extname(file)] ?? 'application/octet-stream');
  res.end(await readFile(file));
});
await new Promise((r) => server.listen(PORT, r));

const { chromium } = await import('@playwright/test');
const browser = await chromium.launch(
  process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}
);

const urls = only
  ? [only]
  : [
      ...(await readdir(SITE)).filter((f) => f.endsWith('.html')).map((f) => '/' + f.replace(/\.html$/, '')),
      ...(await readdir(join(SITE, 'insights')))
        .filter((f) => f.endsWith('.html'))
        .map((f) => '/insights/' + f.replace(/\.html$/, '')),
    ].sort();

const findings = new Map();
let clean = 0;
const unfetched = new Map();
// How many times, not just whether: two inline violations where one is expected
// is the difference between the page's own script and a library injecting one.
const occurrences = new Map();

for (const u of urls) {
  const page = await browser.newPage();
  // Third-party requests: run them (see the header). A script that cannot be
  // fetched is recorded, because a page whose libraries never ran has only
  // been half-checked, and a clean result must not hide that.
  await page.route('**/*', async (route) => {
    const req = route.request();
    const url = req.url();
    if (url.startsWith(`http://localhost:${PORT}`)) return route.continue();
    if (offline) return route.abort();
    if (cacheDir) {
      try {
        const body = await readFile(join(cacheDir, cacheKey(url)));
        return route.fulfill({ body, contentType: 'text/javascript', headers: { 'access-control-allow-origin': '*' } });
      } catch {
        /* not cached — fall through to the network */
      }
    }
    return route.continue();
  });
  page.on('requestfailed', (req) => {
    if (req.resourceType() === 'script' && !req.url().startsWith(`http://localhost:${PORT}`)) {
      if (!unfetched.has(req.url())) unfetched.set(req.url(), new Set());
      unfetched.get(req.url()).add(u);
    }
  });
  // The structured event, not console text: console formatting varies between
  // Chromium builds and would make this test's result depend on the browser
  // rather than on the policy.
  await page.addInitScript(() => {
    window.__csp = [];
    document.addEventListener('securitypolicyviolation', (e) =>
      window.__csp.push({
        directive: e.violatedDirective,
        blocked: (e.blockedURI || '(inline)').slice(0, 120),
      })
    );
  });
  // domcontentloaded, not load: a violation fires when the browser evaluates
  // the policy against a request, which happens as the document is parsed —
  // waiting for third-party subresources to settle adds minutes and tells us
  // nothing extra. On a machine with no route to those origins, 'load' never
  // arrives at all.
  await page.goto(`http://localhost:${PORT}${u}`, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(900);
  const v = await page.evaluate(() => window.__csp ?? []);
  if (!v.length) clean++;
  for (const x of v) {
    const key = `${x.directive}  ←  ${x.blocked}`;
    if (!findings.has(key)) findings.set(key, new Set());
    findings.get(key).add(u);
    occurrences.set(key, (occurrences.get(key) ?? 0) + 1);
  }
  await page.close();
}

await browser.close();
server.close();

console.log(`csp-report: ${urls.length} sider indlæst i ${enforce ? 'ENFORCE' : 'report-only'}-tilstand`);
if (offline) {
  console.log('csp-report: ADVARSEL — --offline: tredjepartsscripts er IKKE kørt. Kun domæner er');
  console.log('  kontrolleret, ikke hvad bibliotekerne gør (eval, injicerede scripts, fetch).\n');
} else if (unfetched.size) {
  console.log(`csp-report: ADVARSEL — ${unfetched.size} tredjepartsscript(s) kunne ikke hentes, så deres`);
  console.log('  adfærd er IKKE kontrolleret på de sider, der bruger dem:');
  for (const [url, pages] of unfetched) console.log(`    ${url.slice(0, 90)}  (${pages.size} side(r))`);
  console.log('  Kør med netværk, eller med CSP_CACHE_DIR, før resultatet bruges til noget.\n');
}
console.log(`csp-report: ${clean} rene, ${urls.length - clean} med overtrædelser\n`);

// The old message here said the policy "can be set to enforce". It never
// could say that: this scan loads pages and clicks nothing, which the header
// above already admits. A result is reported as exactly what it is.
if (!findings.size) {
  if (offline || unfetched.size) {
    console.log('csp-report: ingen overtrædelser fundet — men resultatet er UFULDSTÆNDIGT (se advarslen).');
    if (process.env.GITHUB_ACTIONS) console.log('::warning::csp-report: resultatet er ufuldstændigt — tredjepartsscripts kørte ikke.');
    // Not 0. An incomplete check that exits like a clean one is the exact
    // failure this change exists to remove.
    process.exit(2);
  } else {
    console.log('csp-report: ingen overtrædelser ved sideindlæsning, med alle biblioteker kørende.');
    console.log('  Før politikken håndhæves: test PDF-eksport og booking-widget mod --enforce.');
  }
  process.exit(0);
}

for (const [key, pages] of [...findings].sort((a, b) => b[1].size - a[1].size)) {
  const list = [...pages].sort();
  console.log(`  ${key}   ×${occurrences.get(key)}`);
  console.log(`    på ${list.length} side(r): ${list.slice(0, 4).join(', ')}${list.length > 4 ? ` … +${list.length - 4}` : ''}\n`);
}

console.error('csp-report: politikken er IKKE klar til at håndhæve. Ret ovenstående først.');
process.exit(1);
