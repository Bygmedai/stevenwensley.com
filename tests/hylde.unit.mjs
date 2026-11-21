// BYG-1220: ydelserne som trin på /saadan-kan-jeg-hjaelpe/. Kun det, der er til salg, kommer frem. Kræver et build (_site).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

const SITE = "_site";
const read = (p) => readFileSync(join(SITE, p), "utf8");
const tekst = (h) => h.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
const { trin, kort } = JSON.parse(readFileSync("src/_data/ydelser.json", "utf8"));
const hylde = require("../src/_data/hylde.js");
const SIDE = "saadan-kan-jeg-hjaelpe/index.html";
const alleSider = (d = SITE) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? alleSider(join(d, f)) : f.endsWith(".html") ? [join(d, f)] : []));

test("hvert kort hører til et trin, og et kort til salg har tekst, priser og én handling", () => {
  const ider = new Set(trin.map((t) => t.id));
  for (const k of kort) {
    assert.ok(ider.has(k.trin), `${k.id}: ukendt trin ${k.trin}`);
    assert.equal(typeof k.tilSalg, "boolean", k.id);
    if (!k.tilSalg) continue;
    assert.ok(k.tekst && k.priser.length > 0 && k.handling && k.handling.tekst && k.handling.url, `${k.id} er til salg, men mangler tekst, priser eller handling`);
  }
});

test("siden viser kun trin med kort til salg, i rækkefølgen fra listen", () => {
  const h = read(SIDE);
  const vist = [...h.matchAll(/<h3 class="eyebrow trin" id="([^"]+)">/g)].map((m) => m[1]);
  const forventet = trin.filter((t) => kort.some((k) => k.trin === t.id && k.tilSalg)).map((t) => t.id);
  assert.deepEqual(vist, forventet);
  assert.deepEqual(vist, hylde.trin.map((t) => t.id));
  // I dag: Gevinstarket er ikke til salg, så «Prøv selv» står ikke på siden (Haruki 21/11).
  assert.deepEqual(vist, ["afgraenset-opgave", "forloeb"]);
});

test("hvert kort til salg står med titel, pris og handling under sit trin", () => {
  const h = read(SIDE);
  for (const t of hylde.trin) {
    const start = h.indexOf(`id="${t.id}"`);
    const naeste = h.indexOf('<h3 class="eyebrow trin"', start + 1);
    const blok = h.slice(start, naeste === -1 ? h.indexOf("</section>", start) : naeste);
    for (const k of t.kort) {
      assert.ok(tekst(blok).includes(k.titel), `${k.titel} under ${t.overskrift}`);
      for (const p of k.priser) assert.ok(tekst(blok).includes(p.tekst), `${p.tekst} under ${t.overskrift}`);
      assert.ok(blok.includes(`<a class="btn ghost" href="${k.handling.url}">${k.handling.tekst}</a>`), `handlingen for ${k.titel}`);
    }
  }
});

test("det, der ikke er til salg, står ingen steder på sitet", () => {
  const skjult = kort.filter((k) => !k.tilSalg);
  assert.ok(skjult.length > 0);
  for (const fil of alleSider()) {
    const t = tekst(readFileSync(fil, "utf8"));
    for (const k of skjult) assert.ok(!t.includes(k.titel), `${k.titel} står på ${fil}`);
    // Harukis prisforslag til Gevinstarket og kursusdagen er ikke godkendt og må ikke komme ud.
    assert.doesNotMatch(t, /1\.500 kr\.|6\.500 kr\./, fil);
  }
  // Forsidens henvisning til «Prøv selv» følger samme felt.
  assert.equal(hylde.proevSelv, false);
  assert.doesNotMatch(read("index.html"), /#proev-selv/);
});
