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
    // En handling har en adresse, eller den er bestilling på faktura, som hylde.js laver adressen til (BYG-1221).
    assert.ok(k.tekst && k.priser.length > 0 && k.handling && k.handling.tekst && (k.handling.url || k.handling.faktura), `${k.id} er til salg, men mangler tekst, priser eller handling`);
  }
});

test("siden viser kun trin med kort til salg, i rækkefølgen fra listen", () => {
  const h = read(SIDE);
  const vist = [...h.matchAll(/<h3 class="eyebrow trin" id="([^"]+)">/g)].map((m) => m[1]);
  const forventet = trin.filter((t) => kort.some((k) => k.trin === t.id && k.tilSalg)).map((t) => t.id);
  assert.deepEqual(vist, forventet);
  assert.deepEqual(vist, hylde.trin.map((t) => t.id));
});

test("hvert kort til salg står med titel, pris og handling under sit trin", () => {
  const h = read(SIDE);
  for (const t of hylde.trin) {
    const start = h.indexOf(`id="${t.id}"`);
    const naeste = h.indexOf('<h3 class="eyebrow trin"', start + 1);
    // HTML'en skriver & som &amp; i adresser (maillinkene til bestilling på faktura har både emne og tekst).
    const blok = h.slice(start, naeste === -1 ? h.indexOf("</section>", start) : naeste).replace(/&amp;/g, "&");
    for (const k of t.kort) {
      assert.ok(tekst(blok).includes(k.titel), `${k.titel} under ${t.overskrift}`);
      for (const p of k.priser) assert.ok(tekst(blok).includes(p.tekst), `${p.tekst} under ${t.overskrift}`);
      assert.ok(blok.includes(`<a class="btn ghost" href="${k.handling.url}">${k.handling.tekst}</a>`), `handlingen for ${k.titel}`);
    }
  }
});

// Alt herunder udledes af salgsstatus (Sirius 21/11): sættes et færdigt kort til salg, skal prøverne bestå uden at blive rettet.
const beloeb = (s) => s.match(/\d{1,3}(?:\.\d{3})* kr\./g) || [];

test("det, der ikke er til salg, står ingen steder på sitet", () => {
  const skjult = kort.filter((k) => !k.tilSalg);
  const aktiveBeloeb = new Set(hylde.priser.flatMap((p) => beloeb(p.tekst)));
  // Prisforslagene i noterne til det, der ikke er til salg, er ikke godkendt og må ikke komme ud, medmindre beløbet hører til noget, der er.
  const forslag = [...new Set(skjult.flatMap((k) => [...beloeb(k._afventer || ""), ...k.priser.flatMap((p) => beloeb(p.tekst))]))].filter((b) => !aktiveBeloeb.has(b));
  for (const fil of alleSider()) {
    const t = tekst(readFileSync(fil, "utf8"));
    for (const k of skjult) {
      assert.ok(!t.includes(k.titel), `${k.titel} står på ${fil}`);
      for (const p of k.priser) assert.ok(!t.includes(p.tekst), `${p.tekst} står på ${fil}`);
    }
    for (const b of forslag) assert.ok(!t.includes(b), `prisforslaget ${b} står på ${fil}`);
  }
});

test("forsidens henvisning til «Prøv selv» følger salgsstatus", () => {
  const h = read("index.html");
  if (hylde.proevSelv) assert.match(h, /<a class="btn ghost" href="\/saadan-kan-jeg-hjaelpe\/#proev-selv">/);
  else assert.doesNotMatch(h, /#proev-selv/);
});

test("et færdigt kort, der sættes til salg, kommer frem med sit trin, sin pris og forsidens henvisning", () => {
  const data = JSON.parse(readFileSync("src/_data/ydelser.json", "utf8"));
  for (const k of data.kort.filter((x) => !x.tilSalg)) {
    Object.assign(k, { tilSalg: true, tekst: "Prøvetekst.", priser: [{ navn: k.titel, pris: 1, fra: true, tekst: "Fra 1 kr." }], handling: { tekst: "Lad os tale", url: "/kontakt/" } });
  }
  const h = hylde.byg(data);
  assert.deepEqual(h.trin.map((t) => t.id), data.trin.map((t) => t.id));
  assert.equal(h.proevSelv, true);
  assert.equal(h.priser.length, data.kort.flatMap((k) => k.priser).length);
});

// BYG-1221: «Bestil på faktura» åbner en mail til sitets ene adresse med emne og bestillingsfelter. Ingen formular.
const site = JSON.parse(readFileSync("src/_data/site.json", "utf8"));
const tjekBestilling = (href, titel) => {
  const u = new URL(href.replace(/&amp;/g, "&"));
  assert.equal(u.protocol, "mailto:", href);
  assert.equal(u.pathname, site.email, href);
  const emne = u.searchParams.get("subject") || "";
  assert.match(emne, /^Bestilling på faktura: ./, href);
  if (titel) assert.equal(emne, `Bestilling på faktura: ${titel}`);
  const tekst = u.searchParams.get("body") || "";
  for (const felt of hylde.FELTER) assert.ok(tekst.includes(felt), `${felt} mangler i ${emne}`);
  if (titel) assert.ok(tekst.includes(`Vi vil gerne bestille: ${titel}`), emne);
};

test("hvert køb med bestilling på faktura får et maillink til sitets adresse med emne og felter", () => {
  const medFaktura = kort.filter((k) => k.handling && k.handling.faktura);
  assert.ok(medFaktura.length > 0);
  // Prøves også for kort, der endnu ikke er til salg: sådan bliver linket, når de sættes til salg.
  for (const k of medFaktura) {
    const h = hylde.byg({ trin, kort: [{ ...k, tilSalg: true }] });
    const vist = h.trin.flatMap((t) => t.kort)[0];
    assert.equal(vist.handling.tekst, "Bestil på faktura");
    tjekBestilling(vist.handling.url, k.titel);
  }
});

test("hvert «Bestil på faktura»-link på sitet går til sitets adresse med emne og felter", () => {
  for (const fil of alleSider()) {
    const h = readFileSync(fil, "utf8");
    for (const [, href] of h.matchAll(/<a[^>]*href="([^"]+)"[^>]*>Bestil på faktura<\/a>/g)) tjekBestilling(href);
    assert.doesNotMatch(h, /<form[\s>]/i, fil);
  }
});

test("spørgsmål og svar siger, at offentlige kunder kan betale på faktura med EAN", () => {
  const t = tekst(read("spoergsmaal/index.html"));
  assert.match(t, /Kan vi betale på faktura\? Ja\. Offentlige kunder får en elektronisk faktura til deres EAN-nummer\./);
});
