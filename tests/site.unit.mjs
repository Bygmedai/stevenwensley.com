// stevenwensley.com efter oprydningen 4/11 2026 (S639). Kræver et build (_site).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const SITE = "_site";
const read = (p) => readFileSync(join(SITE, p), "utf8");
const SIDER = ["index.html", "oplaeg/index.html", "om/index.html", "kontakt/index.html", "privatliv/index.html"];

for (const side of SIDER) {
  test(`${side}: én h1, dansk, menu med «Skriv til mig» og rigtigt CVR`, () => {
    const h = read(side);
    assert.equal((h.match(/<h1[\s>]/g) || []).length, 1);
    assert.match(h, /<html lang="da">/);
    assert.match(h, /href="\/kontakt\/"/);
    assert.match(h, /CVR 37244449/);
  });
}

test("alle interne links og billeder peger på noget, der findes", () => {
  const døde = [];
  for (const side of SIDER) {
    for (const [, url] of read(side).matchAll(/(?:href|src)="(\/[^"#?]*)"/g)) {
      const mål = url.endsWith("/") ? join(SITE, url, "index.html") : join(SITE, url);
      if (!existsSync(mål)) døde.push(`${side} → ${url}`);
    }
  }
  assert.deepEqual(døde, []);
});

test("det gamle er væk: ingen compliance, ingen vibekodning, intet engelsk", () => {
  for (const side of SIDER) {
    const tekst = read(side).replace(/<[^>]+>/g, " ");
    assert.doesNotMatch(tekst, /NIS2|ISO 42001|AI Act|DORA|Lovable|vibe|Playbook|governance/i, side);
  }
  for (const gammel of ["about.html", "services.html", "nis2-gap-assessment.html", "lovable-til-drift.html", "insights"]) {
    assert.equal(existsSync(join(SITE, gammel)), false, gammel);
  }
});

test("AI-illustrationen er mærket, og portrætterne er fotos", () => {
  assert.match(read("index.html"), /Illustration lavet med AI/);
  assert.match(read("index.html"), /steven-skjorte\.jpg/);
  assert.match(read("oplaeg/index.html"), /Illustration lavet med AI/);
});

test("gamle adresser 301'er til levende sider, og ingen regel peger på en død side", () => {
  const r = read("_redirects");
  for (const gammel of ["/about", "/services-da", "/nis2-gap-assessment", "/lovable-til-drift", "/for-brokers", "/insights/*", "/en"]) {
    assert.match(r, new RegExp(`^${gammel.replace(/[*/.]/g, (c) => "\\" + c)}\\s+\\S+\\s+301`, "m"), gammel);
  }
  for (const [, dest] of r.matchAll(/^\S+\s+(\/[^\s#]*)\S*\s+301/gm)) {
    const mål = dest.endsWith("/") ? join(SITE, dest, "index.html") : join(SITE, dest);
    assert.ok(existsSync(mål), `redirect til ${dest} findes ikke`);
  }
});

test("ingen serverfunktioner og ingen tredjeparts-scripts", () => {
  assert.equal(existsSync("functions"), false);
  for (const side of SIDER) assert.doesNotMatch(read(side), /<script/i, side);
});

test("fra-priserne står på forsiden og /oplaeg/, ekskl. moms, og de gamle priser er væk", () => {
  const forside = read("index.html").replace(/<[^>]+>/g, " ");
  for (const pris of ["1.400 kr. i timen", "fra 18.000 kr.", "fra 35.000 kr.", "fra 75.000 kr.", "Fra 12.000 kr."]) {
    assert.ok(forside.includes(pris), pris);
  }
  assert.match(forside, /ekskl\. moms/);
  const oplaeg = read("oplaeg/index.html").replace(/<[^>]+>/g, " ");
  assert.match(oplaeg, /Fra 12\.000 kr\. ekskl\. moms/);
  for (const side of SIDER) assert.doesNotMatch(read(side), /6\.500|45\.000/, side);
});

test("historikeren og digteren er foldet ud: hvorfor, ikke kun hvem", () => {
  const forside = read("index.html").replace(/<[^>]+>/g, " ");
  for (const ord of ["Historikeren", "Digteren", "Programlederen", "Kildekritik"]) assert.ok(forside.includes(ord), ord);
  const om = read("om/index.html");
  assert.match(om, /href="https:\/\/tkbars\.dk\/om\/"/);
  assert.match(om.replace(/<[^>]+>/g, " "), /kilde uden afsender/);
  assert.doesNotMatch(om, /ser det, andre overser/);
});
