// Salgsplanen 19/11 2026: analysen på /analyser/ og Gevinstgennemgangen. Kræver et build (_site).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const SITE = "_site";
const read = (p) => readFileSync(join(SITE, p), "utf8");
const g = JSON.parse(readFileSync("src/_data/gevinstgab.json", "utf8"));
const ANALYSE = "analyser/gevinsten-staar-i-budgettet/index.html";
const SIDER = ["analyser/index.html", ANALYSE];
const tekst = (h) => h.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<[^>]+>/g, " ").replace(/&laquo;|«/g, "«").replace(/\s+/g, " ");

for (const side of SIDER) {
  test(`${side}: dansk, én h1, ingen scripts ud over datablokke, i sitemap`, () => {
    const h = read(side);
    assert.match(h, /<html lang="da">/);
    assert.equal((h.match(/<h1[\s>]/g) || []).length, 1);
    assert.doesNotMatch(h.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, ""), /<script/i);
    assert.doesNotMatch(h, /<meta name="robots"/);
    assert.ok(read("sitemap.xml").includes(`<loc>https://stevenwensley.com/${side.replace("index.html", "")}</loc>`), side);
  });
}

test("analysen bygger på hele udgave 004 og siger, hvilken udgave det er", () => {
  assert.equal(g.udgivelse, "rel-ai-overblikket-004");
  assert.equal(g.poster.length, 14);
  assert.equal(new Set(g.poster).size, 14);
  const sum = g.typer.reduce((s, t) => s + t.antal, 0);
  assert.equal(sum, g.poster.length, "typerne skal tilsammen give alle oplysninger");
  assert.equal(g.typer.find((t) => t.type === "Opgjort effekt").antal, 0);
  for (const k of g.kommuner) for (const p of k.poster) assert.ok(g.poster.includes(p), p);
  for (const c of Object.values(g.citater)) assert.ok(g.poster.includes(c.post), c.post);
  const h = read(ANALYSE);
  assert.ok(h.includes(`href="${g.udgivelseUrl}"`));
  assert.match(tekst(h), /Ingen af de 14 oplysninger er en opgjort effekt\./);
});

test("hvert citat står ordret, og hver kommune har kilde og link til overblikket", () => {
  const h = read(ANALYSE), t = tekst(h);
  for (const [navn, c] of Object.entries({ ...g.citater, oekonomiaftale: g.oekonomiaftale })) assert.ok(t.includes(`«${c.tekst}»`), navn);
  for (const k of g.kommuner) {
    assert.ok(t.includes(k.navn), k.navn);
    assert.ok(h.includes(`href="${k.kildeUrl}"`), k.navn);
    assert.ok(h.includes(`href="${k.overblikUrl}"`), k.navn);
  }
  for (const r of g.typer) assert.ok(t.includes(`${r.type} ${r.antal}`), r.type);
});

test("ingen tal fra høsten, der ikke er i en udgave", () => {
  // 153 myndigheder, 72 med en gevinst og 7 med målt effekt er høstens tal (19/11). De må først bruges, når de er i en udgave.
  const t = tekst(read(ANALYSE));
  for (const tal of [/\b153\b/, /\b72 af\b/, /\b7 har målt\b/, /\b98 kommuner\b/]) assert.doesNotMatch(t, tal);
});

test("Gevinstgennemgangen: på Sådan kan jeg hjælpe, linket fra forsiden og analysen", () => {
  const s = read("saadan-kan-jeg-hjaelpe/index.html");
  assert.match(s, /id="gevinstgennemgang"/);
  assert.match(s, /<h2>Gevinstgennemgangen<\/h2>/);
  assert.ok(tekst(s).includes("En halv dag fra 18.000 kr. ekskl. moms"));
  assert.match(read("index.html"), /href="\/saadan-kan-jeg-hjaelpe\/#gevinstgennemgang"/);
  assert.match(read(ANALYSE), /href="\/saadan-kan-jeg-hjaelpe\/#gevinstgennemgang"/);
  assert.match(s, /href="\/analyser\/gevinsten-staar-i-budgettet\/"/);
});

test("analyserne kan findes: fodmenu på alle sider og en Article-blok", () => {
  for (const side of ["index.html", "om-mig/index.html", ...SIDER]) assert.match(read(side), /<a href="\/analyser\/">Analyser<\/a>/, side);
  const blokke = [...read(ANALYSE).matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
  const art = blokke.find((b) => b["@type"] === "Article");
  assert.ok(art);
  assert.equal(art.headline, "Gevinsten står i budgettet. Målingen mangler.");
  assert.equal(art.url, "https://stevenwensley.com/analyser/gevinsten-staar-i-budgettet/");
  assert.equal(art.datePublished, "2026-11-19");
});

test("alle interne links på de nye sider peger på noget, der findes", () => {
  const døde = [];
  for (const side of SIDER) {
    for (const [, url] of read(side).matchAll(/(?:href|src)="(\/[^"#?]*)"/g)) {
      const mål = url.endsWith("/") ? join(SITE, url, "index.html") : join(SITE, url);
      if (!existsSync(mål)) døde.push(`${side} → ${url}`);
    }
  }
  assert.deepEqual(døde, []);
});
