// Strukturerede data (schema.org) til søgemaskiner. Kræver et build (_site).
// QA 19/11 2026: ingen side fortalte søgemaskinerne, at sitet er en person, der sælger rådgivning.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

const SITE = "_site";
const read = (p) => readFileSync(join(SITE, p), "utf8");
const blokke = (h) => [...h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
const tekst = (h) => h.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
const SIDER = ["index.html", "saadan-kan-jeg-hjaelpe/index.html", "oplaeg/index.html", "spoergsmaal/index.html", "om-mig/index.html", "kontakt/index.html", "privatliv/index.html"];

test("hver side har én Person med sitets egne kontaktoplysninger", () => {
  const site = JSON.parse(readFileSync("src/_data/site.json", "utf8"));
  for (const side of SIDER) {
    const personer = blokke(read(side)).filter((b) => b["@type"] === "Person");
    assert.equal(personer.length, 1, side);
    const p = personer[0];
    assert.equal(p.name, site.navn, side);
    assert.equal(p.email, `mailto:${site.email}`, side);
    assert.equal(p.telephone, site.telefon, side);
    assert.equal(p.worksFor.identifier.value, site.cvr, side);
    assert.deepEqual(p.sameAs, [site.linkedin], side);
  }
});

test("ydelserne står kun på Sådan kan jeg hjælpe, og hver pris står ordret på siden", () => {
  // BYG-1220: kun prisrækkerne til salg (hylde.js) står på siden og i de strukturerede data.
  const { priser: ydelser } = require("../src/_data/hylde.js");
  const h = read("saadan-kan-jeg-hjaelpe/index.html");
  const [service] = blokke(h).filter((b) => b["@type"] === "ProfessionalService");
  assert.ok(service, "ingen ProfessionalService");
  const synlig = tekst(h);
  const fmt = (n) => n.toLocaleString("da-DK");
  assert.equal(service.hasOfferCatalog.itemListElement.length, ydelser.length);
  for (const [i, y] of ydelser.entries()) {
    assert.ok(synlig.includes(y.tekst), `«${y.tekst}» står ikke på siden`);
    assert.ok(y.tekst.includes(`${fmt(y.pris)} kr.`), `${y.navn}: teksten og prisen ${y.pris} er skilt ad`);
    const ps = service.hasOfferCatalog.itemListElement[i].priceSpecification;
    assert.equal(y.fra ? ps.minPrice : ps.price, y.pris, y.navn);
    assert.equal(ps.priceCurrency, "DKK");
    assert.equal(ps.valueAddedTaxIncluded, false);
  }
  assert.ok(synlig.includes("Alle priser er ekskl. moms."));
  for (const side of SIDER.filter((s) => !s.startsWith("saadan"))) {
    assert.equal(blokke(read(side)).filter((b) => b["@type"] === "ProfessionalService").length, 0, side);
  }
});

test("blokkene kan ikke lukke script-tagget for tidligt", () => {
  for (const side of SIDER) {
    for (const m of read(side).matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) assert.doesNotMatch(m[1], /<\//, side);
  }
});
