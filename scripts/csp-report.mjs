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
// A violation fires when the browser evaluates the policy, before the
// request goes out — so this reports correctly even on a machine that
// cannot reach the third-party origins at all.
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
// Usage:  node scripts/csp-report.mjs [--enforce] [--page /path]
//         --enforce  serves the policy as Content-Security-Policy instead of
//                    report-only, to see what a flip would actually do.
//
// Exits non-zero if any page reports a violation.

import { readFile, readdir, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SITE = join(ROOT, '_site');
const PORT = 8123;

const enforce = process.argv.includes('--enforce');
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

for (const u of urls) {
  const page = await browser.newPage();
  // Fail third-party requests immediately instead of waiting for them. The
  // browser checks the policy in the renderer before a request is dispatched,
  // so a violation still fires — but a machine with no route to jsdelivr no
  // longer spends fifteen seconds per page discovering that. The CSP_OVERRIDE
  // run proves this does not swallow the violations it is meant to catch.
  await page.route('**/*', (route) => {
    const url = route.request().url();
    return url.startsWith(`http://localhost:${PORT}`) ? route.continue() : route.abort();
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
  }
  await page.close();
}

await browser.close();
server.close();

console.log(`csp-report: ${urls.length} sider indlæst i ${enforce ? 'ENFORCE' : 'report-only'}-tilstand`);
console.log(`csp-report: ${clean} rene, ${urls.length - clean} med overtrædelser\n`);

if (!findings.size) {
  console.log('csp-report: ingen overtrædelser — politikken kan sættes til at håndhæve.');
  process.exit(0);
}

for (const [key, pages] of [...findings].sort((a, b) => b[1].size - a[1].size)) {
  const list = [...pages].sort();
  console.log(`  ${key}`);
  console.log(`    på ${list.length} side(r): ${list.slice(0, 4).join(', ')}${list.length > 4 ? ` … +${list.length - 4}` : ''}\n`);
}

console.error('csp-report: politikken er IKKE klar til at håndhæve. Ret ovenstående først.');
process.exit(1);
