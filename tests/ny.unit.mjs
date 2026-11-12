// Design B v2 "Nordisk lys" (BYG-991): preview-siderne under /ny/. Kræver et build (_site).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const SITE = "_site";
const read = (p) => readFileSync(join(SITE, p), "utf8");
const NY = ["ny/index.html", "ny/saadan-kan-jeg-hjaelpe/index.html", "ny/spoergsmaal/index.html", "ny/om-mig/index.html", "ny/kontakt/index.html"];

for (const side of NY) {
  test(`${side}: noindex, dansk, én h1, tokens.css og .sw-scope`, () => {
    const h = read(side);
    assert.match(h, /<html lang="da">/);
    assert.match(h, /<meta name="robots" content="noindex, nofollow">/);
    assert.equal((h.match(/<h1[\s>]/g) || []).length, 1);
    assert.match(h, /href="\/assets\/css\/tokens\.css"/);
    assert.match(h, /<body class="sw">/);
    assert.doesNotMatch(h, /<script/i);
    assert.doesNotMatch(h, /fonts\.googleapis|fonts\.gstatic/);
  });
}

test("alle interne links og billeder på /ny/ peger på noget, der findes", () => {
  const døde = [];
  for (const side of NY) {
    for (const [, url] of read(side).matchAll(/(?:href|src)="(\/[^"#?]*)"/g)) {
      const mål = url.endsWith("/") ? join(SITE, url, "index.html") : join(SITE, url);
      if (!existsSync(mål)) døde.push(`${side} → ${url}`);
    }
  }
  assert.deepEqual(døde, []);
});

test("accent #1d4ed8 i .sw, Inter selvhostet", () => {
  const css = read("assets/css/tokens.css");
  assert.match(css, /\.sw\{--acc:#1d4ed8/);
  assert.match(css, /url\(\/assets\/fonts\/inter-latin-wght-normal\.woff2\)/);
});

test("forsiden: situationer og første skridt før 'Det usagte'", () => {
  const t = read("ny/index.html");
  const sit = t.indexOf("Tre situationer"), start = t.indexOf("Hvordan vi kommer i gang"), usagt = t.indexOf("Tre spørgsmål, ledelsen sjældent kan svare på");
  assert.ok(sit > 0 && start > sit && usagt > start);
});

test("de nye sider er ude af sitemap, og de gamle sider er urørte", () => {
  assert.doesNotMatch(read("sitemap.xml"), /\/ny\//);
  for (const f of ["index.html", "om/index.html", "oplaeg/index.html", "kontakt/index.html", "privatliv/index.html"]) assert.ok(existsSync(join(SITE, f)), f);
});

test("QA #109: kort-overskrifter er h2, FAQ er lukket, ét mål for «Book 30 minutter»", () => {
  const h = read("ny/saadan-kan-jeg-hjaelpe/index.html");
  for (const t of ["Forstå", "Beslut", "Følg med"]) assert.match(h, new RegExp(`<h2>${t}</h2>`), t);
  assert.doesNotMatch(read("ny/spoergsmaal/index.html"), /<details[^>]*\sopen/);
  for (const side of NY) {
    for (const [, href] of read(side).matchAll(/<a[^>]*href="([^"]*)"[^>]*>Book 30 minutter<\/a>/g)) assert.equal(href, "/ny/kontakt/", side);
  }
});

test("mobilmenu uden JS: details/summary med alle sider", () => {
  const h = read("ny/index.html");
  assert.match(h, /<details class="mnav"><summary/);
  for (const u of ["/ny/", "/ny/saadan-kan-jeg-hjaelpe/", "/ny/spoergsmaal/", "/ny/om-mig/", "/ny/kontakt/"]) assert.ok(h.includes(`href="${u}"`), u);
});

test("ankre har scroll-margin-top under sticky header", () => {
  assert.match(read("assets/css/tokens.css"), /\[id\]\{scroll-margin-top:\d+px\}/);
});
