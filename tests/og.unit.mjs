// Delebilleder (og:image) og små SEO-regler. Kræver et build (_site).
// Billederne laves af scripts/og.mjs ud fra sidernes overskrifter; src/_data/og.json husker teksterne.
// Fejler en prøve her efter en ændret overskrift, så kør: npm run og
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";

const SITE = "_site";
const URL = "https://stevenwensley.com";
const og = JSON.parse(readFileSync("src/_data/og.json", "utf8"));
const read = (p) => readFileSync(join(SITE, p), "utf8");
const tekst = (s) => s.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&shy;|\u00ad/g, "").replace(/\s+/g, " ").trim();
const ogFil = (url) => `/assets/img/og-${url === "/" ? "forside" : url.replace(/^\/|\/$/g, "").replace(/\//g, "-")}.jpg`;
const sider = [...read("sitemap.xml").matchAll(/<loc>https:\/\/stevenwensley\.com(\/[^<]*)<\/loc>/g)].map((m) => m[1]);
const html = (url) => read(`${url.slice(1)}index.html`);
const ogBillede = (h) => (h.match(/<meta property="og:image" content="https:\/\/stevenwensley\.com(\/[^"]+)">/) || [])[1];

// Bredde og højde fra en JPEG's SOF-markør.
function jpegMål(buf) {
  for (let i = 2; i < buf.length; ) {
    const m = buf[i + 1], len = buf.readUInt16BE(i + 2);
    if (m >= 0xc0 && m <= 0xc3) return [buf.readUInt16BE(i + 7), buf.readUInt16BE(i + 5)];
    i += 2 + len;
  }
}
const sha = (fil) => createHash("sha256").update(readFileSync(join(SITE, fil))).digest("hex");

test("hver side i sitemap har sit eget delebillede, og ingen deler billede", () => {
  assert.ok(sider.length >= 9);
  assert.deepEqual(Object.keys(og.sider).sort(), [...sider].sort(), "og.json og sitemap har de samme sider");
  const set = new Set();
  for (const url of sider) {
    const fil = ogBillede(html(url));
    assert.equal(fil, ogFil(url), `${url}: billedet hører til siden`);
    assert.equal(og.sider[url].fil, fil, url);
    set.add(fil);
  }
  assert.equal(set.size, sider.length);
});

test("billederne findes, er 1200 × 630 og er dem, scriptet lavede", () => {
  for (const e of [...Object.values(og.sider), og.reserve]) {
    assert.ok(existsSync(join(SITE, e.fil)), e.fil);
    assert.deepEqual(jpegMål(readFileSync(join(SITE, e.fil))), [1200, 630], e.fil);
    assert.equal(sha(e.fil), e.sha256, `${e.fil} er ændret uden npm run og`);
  }
  for (const url of [...sider, "/404.html"]) {
    const h = url === "/404.html" ? read("404.html") : html(url);
    assert.match(h, /<meta property="og:image:width" content="1200">/, url);
    assert.match(h, /<meta property="og:image:height" content="630">/, url);
  }
});

test("billedets tekst er sidens nuværende overskrift og eyebrow", () => {
  for (const url of sider) {
    const h = html(url), e = og.sider[url];
    const helt = h.match(/<div class="hero">([\s\S]*?)<\/h1>/)[0];
    assert.equal(e.overskrift, tekst(helt.match(/<h1>([\s\S]*?)<\/h1>/)[1]), `${url}: overskriften er ændret – kør npm run og`);
    const eb = helt.match(/<span class="eyebrow">([\s\S]*?)<\/span>/);
    assert.equal(e.eyebrow, eb ? tekst(eb[1]) : "AI, magt og ledelse", `${url}: eyebrow`);
    if (e.linje) assert.ok(tekst(h).includes(e.linje), `${url}: linjen «${e.linje}» står ikke på siden`);
  }
  // Revision 2: linjen er analysens første sætning (AN-03 = første sætning i AN-06).
  assert.equal(og.sider["/analyser/gevinsten-staar-i-budgettet/"].linje, "Tre kommuners budgetmateriale regner med gevinster fra AI.");
});

test("reservebilledet er forsidens, og det gamle budskab er væk", () => {
  assert.equal(og.reserve.fil, "/assets/img/og.jpg");
  assert.equal(og.reserve.overskrift, og.sider["/"].overskrift);
  assert.equal(ogBillede(read("404.html")), "/assets/img/og.jpg");
  assert.doesNotMatch(JSON.stringify(og), /magtproblem|IT-mand bagefter|governance/i);
});

test("analysen er en artikel, resten er website", () => {
  for (const url of sider) {
    const type = url.startsWith("/analyser/") && url !== "/analyser/" ? "article" : "website";
    assert.match(html(url), new RegExp(`<meta property="og:type" content="${type}">`), url);
  }
});

test("404 har noindex og ingen canonical; de andre sider har canonical", () => {
  const h = read("404.html");
  assert.match(h, /<meta name="robots" content="noindex, nofollow">/);
  assert.doesNotMatch(h, /rel="canonical"/);
  for (const url of sider) assert.ok(html(url).includes(`<link rel="canonical" href="${URL}${url}">`), url);
});

test("telefonnummeret knækker ikke: hårde mellemrum", () => {
  for (const url of [...sider, "/404.html"]) {
    // De strukturerede data (JSON-LD) beholder nummeret som data; kun den synlige tekst skal have hårde mellemrum.
    const h = (url === "/404.html" ? read("404.html") : html(url)).replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, "");
    assert.match(h, /\+45&nbsp;53&nbsp;88&nbsp;60&nbsp;61/, url);
    assert.doesNotMatch(h, />[^<]*\+45 53 88 60 61/, url);
  }
  // Revision 2: knapperne er korte; adresse og nummer står fuldt ud i kontaktkortet.
  const k = read("kontakt/index.html");
  assert.match(k, /<a class="btn" href="mailto:steven@bygmedai\.dk">Skriv til mig<\/a><a class="btn ghost" href="tel:\+4553886061">Ring til mig<\/a>/);
  assert.match(k, /<dt>Mail<\/dt><dd><a href="mailto:steven@bygmedai\.dk">steven@bygmedai\.dk<\/a><\/dd>/);
  assert.match(k, /<dt>Telefon<\/dt><dd><a href="tel:\+4553886061">\+45&nbsp;53&nbsp;88&nbsp;60&nbsp;61<\/a><\/dd>/);
});
