#!/usr/bin/env node
// Minimal static server that resolves URLs the way this site is actually served.
//
// Why not http-server
// -------------------
// The site links to its pages without the .html extension, and both GitHub
// Pages and Cloudflare Pages resolve /insights to insights.html. http-server
// resolves it to the insights/ directory instead, finds no index.html there,
// and returns 404 — so the link checker reported eight broken URLs that answer
// 200 on both real servers. Verified: /insights and /templates return byte
// identical content to /insights.html and /templates.html on the live site and
// on the Pages deployment.
//
// Testing against a server with different resolution rules than production is
// testing the wrong thing. This one applies production's order:
//
//   0. a rule in _redirects, if one matches the path exactly
//   1. exact path, if it is a file
//   2. path + ".html"
//   3. path + "/index.html"
//   4. 404.html, with status 404
//
// Directory listings are never produced, because neither real server produces
// them.
//
// _redirects is Cloudflare's file (one rule per line: source, destination,
// status) and Cloudflare evaluates it before static assets. It is read here
// for the same reason the resolution order is copied: when /index-da moved to
// the root, the acceptance criterion was "answers 301", and a server that
// could not answer 301 would have left that to be assumed. Only exact-path
// rules are supported — that is all the file uses. A rule with a splat or a
// placeholder stops the server at startup instead of being silently ignored.
//
// Usage: node scripts/serve-static.mjs [root] [port]

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, normalize, extname } from 'node:path';

const ROOT = process.argv[2] || '.';
const PORT = Number(process.argv[3] || 8080);

const REDIRECTS = new Map();
for (const raw of (await readFile(join(ROOT, '_redirects'), 'utf8').catch(() => '')).split('\n')) {
  const line = raw.replace(/#.*$/, '').trim();
  if (!line) continue;
  const [from, to, status = '302'] = line.split(/\s+/);
  if (!from || !to || /[*:]/.test(from)) {
    console.error(`serve-static: _redirects-regel ikke understøttet her: "${raw}"`);
    process.exit(1);
  }
  REDIRECTS.set(from, { to, status: Number(status) });
}

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};

const isFile = async (p) => {
  try {
    return (await stat(p)).isFile();
  } catch {
    return false;
  }
};

async function resolve(pathname) {
  // normalize() collapses any ../ before it can escape ROOT
  const rel = normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, '');
  const base = join(ROOT, rel);
  for (const candidate of [base, `${base}.html`, join(base, 'index.html')]) {
    if (await isFile(candidate)) return candidate;
  }
  return null;
}

createServer(async (req, res) => {
  const { pathname } = new URL(req.url, 'http://localhost');

  const rule = REDIRECTS.get(pathname);
  if (rule) {
    res.writeHead(rule.status, { location: rule.to });
    res.end();
    return;
  }

  // Cloudflare Pages 308-redirects /about/ to /about when the directory has no
  // index. Mirroring that matters for more than fidelity: without it the link
  // checker treats /about/ as a live base and resolves the page's own relative
  // links against it — /about/notes, /about/services — then descends into those
  // and never stops. Measured 458 phantom failures before this rule, and 40,483
  // before the 404 page's links were made root-relative.
  if (pathname.length > 1 && pathname.endsWith('/')) {
    const trimmed = pathname.replace(/\/+$/, '');
    if (!(await resolve(pathname)) && (await resolve(trimmed))) {
      res.writeHead(308, { location: trimmed });
      res.end();
      return;
    }
  }

  const file = await resolve(pathname);

  if (!file) {
    const notFound = join(ROOT, '404.html');
    if (await isFile(notFound)) {
      res.writeHead(404, { 'content-type': TYPES['.html'] });
      res.end(await readFile(notFound));
    } else {
      res.writeHead(404, { 'content-type': TYPES['.txt'] });
      res.end('Not found\n');
    }
    return;
  }

  res.writeHead(200, {
    'content-type': TYPES[extname(file).toLowerCase()] || 'application/octet-stream',
  });
  res.end(await readFile(file));
}).listen(PORT, () => {
  console.log(`serve-static: ${ROOT} paa http://localhost:${PORT} (${REDIRECTS.size} redirect-regler)`);
});
