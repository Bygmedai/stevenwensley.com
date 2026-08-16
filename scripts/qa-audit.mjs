#!/usr/bin/env node
// One-off QA audit over the assembled publish directory (_site).
// Read-only. Prints findings grouped by severity. Not wired into CI.

import { readdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SITE = join(ROOT, '_site');
const ORIGIN = 'https://stevenwensley.com';

const findings = [];
const add = (sev, area, page, msg) => findings.push({ sev, area, page, msg });

async function walk(dir, out = []) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const abs = join(dir, e.name);
    if (e.isDirectory()) await walk(abs, out);
    else out.push(abs);
  }
  return out;
}

const allFiles = (await walk(SITE)).map((f) => relative(SITE, f).split('\\').join('/'));
const htmlFiles = allFiles.filter((f) => f.endsWith('.html'));

// ---------- helpers ----------
const attr = (tag, name) => {
  const m = tag.match(new RegExp(`${name}\\s*=\\s*"([^"]*)"`, 'i')) ||
            tag.match(new RegExp(`${name}\\s*=\\s*'([^']*)'`, 'i'));
  return m ? m[1] : null;
};
const metaBy = (html, key, val) => {
  const re = new RegExp(`<meta[^>]*${key}\\s*=\\s*["']${val}["'][^>]*>`, 'i');
  const m = html.match(re);
  return m ? attr(m[0], 'content') : null;
};

// Expected public URL for a file path, matching Cloudflare/GitHub behaviour.
const urlFor = (file) =>
  file === 'index.html' ? '/' : '/' + file.replace(/\.html$/, '');

const descs = new Map();
const titles = new Map();
const canonicals = new Map();

for (const file of htmlFiles) {
  const html = await readFile(join(SITE, file), 'utf8');
  const page = file;
  const noindex = /<meta[^>]*name\s*=\s*["']robots["'][^>]*noindex/i.test(html);

  // ---------- lang / charset / viewport ----------
  const htmlTag = html.match(/<html[^>]*>/i)?.[0] ?? '';
  const lang = attr(htmlTag, 'lang');
  if (!lang) add('HIGH', 'a11y', page, 'mangler lang-attribut på <html>');
  if (!/<meta[^>]*charset/i.test(html)) add('HIGH', 'std', page, 'mangler charset');
  if (!/<meta[^>]*name\s*=\s*["']viewport["']/i.test(html))
    add('HIGH', 'std', page, 'mangler viewport');

  // ---------- title ----------
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim();
  if (!title) add('HIGH', 'seo', page, 'mangler <title>');
  else {
    if (title.length > 65) add('LOW', 'seo', page, `title ${title.length} tegn (>65 afkortes i SERP): "${title}"`);
    if (title.length < 15) add('LOW', 'seo', page, `title kun ${title.length} tegn: "${title}"`);
    if (!noindex) {
      if (!titles.has(title)) titles.set(title, []);
      titles.get(title).push(page);
    }
  }

  // ---------- description ----------
  const desc = metaBy(html, 'name', 'description');
  if (!desc) { if (!noindex) add('HIGH', 'seo', page, 'mangler meta description'); }
  else {
    if (desc.length > 165) add('LOW', 'seo', page, `description ${desc.length} tegn (>165 afkortes)`);
    if (desc.length < 50) add('MED', 'seo', page, `description kun ${desc.length} tegn`);
    if (!noindex) {
      if (!descs.has(desc)) descs.set(desc, []);
      descs.get(desc).push(page);
    }
  }

  // ---------- canonical ----------
  const canonTag = html.match(/<link[^>]*rel\s*=\s*["']canonical["'][^>]*>/i)?.[0];
  const canon = canonTag ? attr(canonTag, 'href') : null;
  if (!canon) { if (!noindex) add('HIGH', 'seo', page, 'mangler canonical'); }
  else {
    if (!canon.startsWith('http')) add('HIGH', 'seo', page, `canonical er ikke absolut: ${canon}`);
    if (/\.html(\?|#|$)/.test(canon)) add('HIGH', 'seo', page, `canonical peger på .html-URL: ${canon}`);
    const expected = ORIGIN + urlFor(file);
    if (canon !== expected && !noindex)
      add('MED', 'seo', page, `canonical ${canon} matcher ikke sidens egen URL ${expected}`);
    if (!noindex) {
      if (!canonicals.has(canon)) canonicals.set(canon, []);
      canonicals.get(canon).push(page);
    }
  }

  // ---------- Open Graph / Twitter ----------
  for (const p of ['og:title', 'og:description', 'og:image', 'og:url', 'og:type']) {
    if (!metaBy(html, 'property', p) && !noindex) add('MED', 'social', page, `mangler ${p}`);
  }
  const ogImg = metaBy(html, 'property', 'og:image');
  if (ogImg) {
    if (!ogImg.startsWith('http')) add('HIGH', 'social', page, `og:image ikke absolut: ${ogImg}`);
    const local = ogImg.replace(ORIGIN + '/', '');
    if (ogImg.startsWith(ORIGIN) && !existsSync(join(SITE, local)))
      add('HIGH', 'social', page, `og:image findes ikke: ${local}`);
  }
  const ogUrl = metaBy(html, 'property', 'og:url');
  if (ogUrl && /\.html(\?|#|$)/.test(ogUrl)) add('MED', 'social', page, `og:url peger på .html: ${ogUrl}`);
  if (ogUrl && canon && ogUrl !== canon) add('LOW', 'social', page, `og:url (${ogUrl}) ≠ canonical (${canon})`);
  if (!metaBy(html, 'name', 'twitter:card') && !noindex)
    add('LOW', 'social', page, 'mangler twitter:card');

  // ---------- hreflang ----------
  const hreflangs = [...html.matchAll(/<link[^>]*rel\s*=\s*["']alternate["'][^>]*>/gi)]
    .map((m) => ({ lang: attr(m[0], 'hreflang'), href: attr(m[0], 'href') }))
    .filter((h) => h.lang);
  for (const h of hreflangs) {
    if (h.href && /\.html(\?|#|$)/.test(h.href))
      add('MED', 'seo', page, `hreflang ${h.lang} peger på .html: ${h.href}`);
    if (h.href?.startsWith(ORIGIN)) {
      const p = h.href.slice(ORIGIN.length);
      const f = p === '/' ? 'index.html' : p.replace(/^\//, '') + '.html';
      if (!existsSync(join(SITE, f)) && !existsSync(join(SITE, p.replace(/^\//, ''))))
        add('HIGH', 'seo', page, `hreflang ${h.lang} peger på side der ikke findes: ${h.href}`);
    }
  }

  // ---------- JSON-LD ----------
  for (const m of html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
    try { JSON.parse(m[1]); }
    catch (err) { add('HIGH', 'seo', page, `ugyldig JSON-LD: ${err.message}`); }
  }

  // ---------- headings ----------
  const h1s = [...html.matchAll(/<h1[\s>]/gi)].length;
  if (h1s === 0) add('MED', 'a11y', page, 'ingen <h1>');
  if (h1s > 1) add('LOW', 'a11y', page, `${h1s} × <h1>`);

  // ---------- images ----------
  for (const m of html.matchAll(/<img[^>]*>/gi)) {
    if (attr(m[0], 'alt') === null) add('MED', 'a11y', page, `<img> uden alt: ${m[0].slice(0, 90)}`);
    if (!attr(m[0], 'loading') && !/eager/.test(m[0])) add('LOW', 'perf', page, `<img> uden loading-attribut`);
  }

  // ---------- links ----------
  for (const m of html.matchAll(/<a[^>]*>/gi)) {
    const tag = m[0];
    const href = attr(tag, 'href');
    if (!href) continue;

    if (attr(tag, 'target') === '_blank') {
      const rel = (attr(tag, 'rel') || '').toLowerCase();
      if (!rel.includes('noopener')) add('MED', 'security', page, `target=_blank uden rel=noopener: ${href}`);
    }

    if (href.startsWith('http')) {
      if (href.startsWith('http://')) add('MED', 'security', page, `usikkert http:-link: ${href}`);
      continue;
    }
    if (href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#')) continue;

    if (!href.startsWith('/')) add('LOW', 'links', page, `relativt link (ikke root-relativt): ${href}`);

    if (/\.html(\?|#|$)/.test(href)) add('MED', 'links', page, `internt link med .html: ${href}`);

    // resolve
    const clean = href.split('#')[0].split('?')[0];
    if (!clean || clean === '/') continue;
    const p = clean.replace(/^\//, '');
    const candidates = [p, p + '.html', join(p, 'index.html')];
    if (!candidates.some((c) => existsSync(join(SITE, c))))
      add('HIGH', 'links', page, `dødt internt link: ${href}`);
  }

  // ---------- scripts ----------
  for (const m of html.matchAll(/<script[^>]*src\s*=\s*["']([^"']+)["'][^>]*>/gi)) {
    const src = m[1];
    if (src.startsWith('http')) {
      const host = new URL(src).host;
      const hasSri = /integrity\s*=/.test(m[0]);
      add(hasSri ? 'LOW' : 'MED', 'security', page,
        `eksternt script uden SRI: ${host}${hasSri ? ' (har integrity)' : ''}`);
    }
  }

  // ---------- forms ----------
  for (const m of html.matchAll(/<form[^>]*>/gi)) {
    const action = attr(m[0], 'action');
    if (action && action.startsWith('http') && !action.startsWith('https://'))
      add('HIGH', 'security', page, `form poster over usikker forbindelse: ${action}`);
    if (action && action.startsWith('http')) add('INFO', 'security', page, `form poster eksternt: ${action}`);
  }
}

// ---------- duplicates ----------
for (const [t, pages] of titles) if (pages.length > 1)
  add('MED', 'seo', pages.join(', '), `identisk <title> på ${pages.length} sider: "${t.slice(0, 70)}"`);
for (const [d, pages] of descs) if (pages.length > 1)
  add('MED', 'seo', pages.join(', '), `identisk description på ${pages.length} sider`);
for (const [c, pages] of canonicals) if (pages.length > 1)
  add('HIGH', 'seo', pages.join(', '), `${pages.length} sider deler canonical ${c}`);

// ---------- sitemap ----------
const sm = await readFile(join(SITE, 'sitemap.xml'), 'utf8');
const smUrls = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const smPaths = new Set(smUrls.map((u) => u.replace(ORIGIN, '')));

for (const u of smUrls) {
  if (/\.html(\?|#|$)/.test(u)) add('HIGH', 'seo', 'sitemap.xml', `sitemap indeholder .html-URL: ${u}`);
  const p = u.replace(ORIGIN, '').replace(/^\//, '');
  const f = p === '' ? 'index.html' : p + '.html';
  if (!existsSync(join(SITE, f))) add('HIGH', 'seo', 'sitemap.xml', `sitemap peger på side der ikke findes: ${u}`);
}

const indexable = [];
for (const file of htmlFiles) {
  const html = await readFile(join(SITE, file), 'utf8');
  if (/<meta[^>]*name\s*=\s*["']robots["'][^>]*noindex/i.test(html)) continue;
  if (file === '404.html') continue;
  indexable.push(urlFor(file));
}
for (const u of indexable) if (!smPaths.has(u))
  add('MED', 'seo', 'sitemap.xml', `indekserbar side mangler i sitemap: ${u}`);

// duplicate sitemap entries
const seen = new Set();
for (const u of smUrls) { if (seen.has(u)) add('MED', 'seo', 'sitemap.xml', `dublet i sitemap: ${u}`); seen.add(u); }

// ---------- robots / llms / feed ----------
const robots = await readFile(join(SITE, 'robots.txt'), 'utf8');
if (!robots.includes('Sitemap:')) add('HIGH', 'seo', 'robots.txt', 'mangler Sitemap-linje');
for (const m of robots.matchAll(/(?:Allow|Disallow):\s*(\/\S+)/g)) {
  const p = m[1].replace(/\*$/, '').replace(/\/$/, '').replace(/^\//, '');
  if (p && !existsSync(join(SITE, p)) && !existsSync(join(SITE, p + '.html')))
    add('LOW', 'seo', 'robots.txt', `regel peger på sti der ikke findes: ${m[1]}`);
}

const llms = await readFile(join(SITE, 'llms.txt'), 'utf8');
for (const m of llms.matchAll(/\((https:\/\/stevenwensley\.com[^)]*)\)/g)) {
  const u = m[1];
  if (/\.html(\?|#|$)/.test(u)) add('MED', 'seo', 'llms.txt', `.html-URL i llms.txt: ${u}`);
  const p = u.replace(ORIGIN, '').replace(/^\//, '').split('#')[0];
  const f = p === '' ? 'index.html' : p + '.html';
  if (!existsSync(join(SITE, f)) && !existsSync(join(SITE, p)))
    add('HIGH', 'seo', 'llms.txt', `dødt link i llms.txt: ${u}`);
}

const feed = await readFile(join(SITE, 'feed.xml'), 'utf8');
for (const m of feed.matchAll(/href\s*=\s*"(https:\/\/stevenwensley\.com[^"]*)"/g)) {
  const u = m[1];
  if (/\.html(\?|#|$)/.test(u)) add('MED', 'seo', 'feed.xml', `.html-URL i feed: ${u}`);
  const p = u.replace(ORIGIN, '').replace(/^\//, '').split('#')[0];
  const f = p === '' ? 'index.html' : p + '.html';
  if (!existsSync(join(SITE, f)) && !existsSync(join(SITE, p)))
    add('HIGH', 'seo', 'feed.xml', `dødt link i feed: ${u}`);
}

// ---------- secrets sweep ----------
const SECRET = [
  [/AKIA[0-9A-Z]{16}/, 'AWS access key'],
  [/sk-[A-Za-z0-9]{20,}/, 'OpenAI-nøgle'],
  [/sk-ant-[A-Za-z0-9_-]{20,}/, 'Anthropic-nøgle'],
  [/gh[pousr]_[A-Za-z0-9]{30,}/, 'GitHub-token'],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, 'privat nøgle'],
  [/xox[baprs]-[A-Za-z0-9-]{10,}/, 'Slack-token'],
];
for (const f of allFiles) {
  if (/\.(png|jpg|jpeg|gif|ico|pdf|webp|woff2?)$/i.test(f)) continue;
  const c = await readFile(join(SITE, f), 'utf8').catch(() => '');
  for (const [re, label] of SECRET) if (re.test(c)) add('HIGH', 'security', f, `muligt ${label}`);
}

// ---------- internal-leak sweep (governance doctrine) ----------
const LEAK = [/\bS\d{3}\b/, /\bBL-\d{3}\b/, /Haruki/i, /Sirius/i, /\bVilde\b/, /\bZarina\b/, /\bKrog\b/];
for (const file of htmlFiles) {
  const html = await readFile(join(SITE, file), 'utf8');
  if (/<meta[^>]*name\s*=\s*["']robots["'][^>]*noindex/i.test(html)) continue;
  for (const re of LEAK) {
    const m = html.match(re);
    if (m) add('HIGH', 'leak', file, `internt kodeord på indekserbar side: "${m[0]}"`);
  }
}

// ---------- output ----------
const order = { HIGH: 0, MED: 1, LOW: 2, INFO: 3 };
findings.sort((a, b) => order[a.sev] - order[b.sev] || a.area.localeCompare(b.area));

const counts = {};
for (const f of findings) counts[f.sev] = (counts[f.sev] || 0) + 1;

console.log(`\nQA-audit: ${htmlFiles.length} HTML-sider, ${allFiles.length} filer i _site/\n`);
console.log('Fund:', JSON.stringify(counts), '\n');

let lastSev = null;
for (const f of findings) {
  if (f.sev !== lastSev) { console.log(`\n─── ${f.sev} ───`); lastSev = f.sev; }
  console.log(`[${f.area}] ${f.page}\n    ${f.msg}`);
}
