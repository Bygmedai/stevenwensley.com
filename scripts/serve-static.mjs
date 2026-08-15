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
//   1. exact path, if it is a file
//   2. path + ".html"
//   3. path + "/index.html"
//   4. 404.html, with status 404
//
// Directory listings are never produced, because neither real server produces
// them.
//
// Usage: node scripts/serve-static.mjs [root] [port]

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, normalize, extname } from 'node:path';

const ROOT = process.argv[2] || '.';
const PORT = Number(process.argv[3] || 8080);

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
  console.log(`serve-static: ${ROOT} paa http://localhost:${PORT}`);
});
