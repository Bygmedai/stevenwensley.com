// stevenwensley.com med det nye design i produktion (S647, 14/11 2026). Kræver et build (_site).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const SITE = "_site";
const URL = "https://stevenwensley.com";
const read = (p) => readFileSync(join(SITE, p), "utf8");
const HOVED = ["index.html", "saadan-kan-jeg-hjaelpe/index.html", "oplaeg/index.html", "spoergsmaal/index.html", "om-mig/index.html", "kontakt/index.html"];
const SIDER = [...HOVED, "privatliv/index.html"];
const sti = (side) => "/" + side.replace("index.html", "");

for (const side of SIDER) {
  test(`${side}: én h1, dansk, knap til kontakt og rigtigt CVR`, () => {
    const h = read(side);
    assert.equal((h.match(/<h1[\s>]/g) || []).length, 1);
    assert.match(h, /<html lang="da">/);
    assert.match(h, /<a class="btn sm" href="\/kontakt\/">Book 30 minutter<\/a>/);
    assert.match(h, /CVR 37244449/);
  });
}

test("alle interne links og billeder peger på noget, der findes", () => {
  const døde = [];
  for (const side of [...SIDER, "404.html"]) {
    for (const [, url] of read(side).matchAll(/(?:href|src)="(\/[^"#?]*)"/g)) {
      const mål = url.endsWith("/") ? join(SITE, url, "index.html") : join(SITE, url);
      if (!existsSync(mål)) døde.push(`${side} → ${url}`);
    }
  }
  assert.deepEqual(døde, []);
});

test("produktion: ingen noindex, canonical og eget delebillede, og alle sider i sitemap", () => {
  const sm = read("sitemap.xml");
  const billeder = new Set();
  for (const side of SIDER) {
    const h = read(side);
    assert.doesNotMatch(h, /<meta name="robots"/, side);
    assert.ok(h.includes(`<link rel="canonical" href="${URL}${sti(side)}">`), side);
    assert.ok(h.includes(`<meta property="og:url" content="${URL}${sti(side)}">`), side);
    const og = h.match(/<meta property="og:image" content="https:\/\/stevenwensley\.com(\/[^"]+)">/);
    assert.ok(og && existsSync(join(SITE, og[1])), `${side}: delebillede`);
    if (HOVED.includes(side)) billeder.add(og[1]);
    assert.ok(sm.includes(`<loc>${URL}${sti(side)}</loc>`), `${side} i sitemap`);
  }
  assert.equal(billeder.size, HOVED.length, "hver hovedside har sit eget delebillede");
  assert.equal((sm.match(/<loc>/g) || []).length, SIDER.length);
  assert.match(read("404.html"), /<meta name="robots" content="noindex, nofollow">/);
});

test("det gamle er væk: ingen compliance, ingen vibekodning, intet engelsk, intet gammelt design", () => {
  for (const side of SIDER) {
    const tekst = read(side).replace(/<[^>]+>/g, " ");
    assert.doesNotMatch(tekst, /NIS2|ISO 42001|AI Act|DORA|Lovable|vibe|Playbook|governance/i, side);
    assert.doesNotMatch(tekst, /Preview af design|ikke publiceret/, side);
    assert.doesNotMatch(read(side), /sw\.css|dm-serif/, side);
  }
  for (const gammel of ["about.html", "services.html", "nis2-gap-assessment.html", "lovable-til-drift.html", "insights", "ny", "om", "assets/css/sw.css"]) {
    assert.equal(existsSync(join(SITE, gammel)), false, gammel);
  }
});

test("AI-illustrationerne er mærket, og portrætterne er fotos", () => {
  assert.match(read("index.html"), /Illustration lavet med AI/);
  assert.match(read("index.html"), /steven-skjorte\.jpg/);
  assert.match(read("oplaeg/index.html"), /Illustration lavet med AI/);
  assert.match(read("om-mig/index.html"), /steven-roede-briller\.jpg/);
});

test("gamle adresser 301'er til levende sider, og ingen regel peger på en død side", () => {
  const r = read("_redirects");
  for (const gammel of ["/about", "/services-da", "/nis2-gap-assessment", "/lovable-til-drift", "/for-brokers", "/insights/*", "/en", "/om", "/om/", "/ny", "/ny/*"]) {
    assert.match(r, new RegExp(`^${gammel.replace(/[*/.]/g, (c) => "\\" + c)}\\s+\\S+\\s+301`, "m"), gammel);
  }
  assert.match(r, /^\/ny\/\*\s+\/:splat\s+301$/m);
  assert.match(r, /^\/om\/\s+\/om-mig\/\s+301$/m);
  for (const [, dest] of r.matchAll(/^\S+\s+(\/[^\s#]*)\S*\s+301/gm)) {
    if (dest.includes(":")) continue; // /:splat peger på den tilsvarende side på roden
    const mål = dest.endsWith("/") ? join(SITE, dest, "index.html") : join(SITE, dest);
    assert.ok(existsSync(mål), `redirect til ${dest} findes ikke`);
  }
  // Ingen regel peger længere på den gamle Om-side eller på et anker, der ikke findes på forsiden.
  assert.doesNotMatch(r, /\s\/om\/\s+301|\s\/#ydelser\s+301/);
  assert.match(read("saadan-kan-jeg-hjaelpe/index.html"), /id="ydelser"/);
});

test("ingen serverfunktioner og ingen scripts i siderne", () => {
  assert.equal(existsSync("functions"), false);
  for (const side of [...SIDER, "404.html"]) assert.doesNotMatch(read(side), /<script/i, side);
});

test("oplæg har prisen ekskl. moms, og de gamle priser er væk", () => {
  const oplaeg = read("oplaeg/index.html").replace(/<[^>]+>/g, " ");
  assert.match(oplaeg, /Fra 12\.000 kr\. ekskl\. moms/);
  for (const side of SIDER) assert.doesNotMatch(read(side), /6\.500|45\.000/, side);
});

test("historikeren og digteren er foldet ud: hvorfor, ikke kun hvem", () => {
  const forside = read("index.html").replace(/<[^>]+>/g, " ");
  for (const ord of ["Historikeren", "Digteren", "Programlederen", "Kildekritik"]) assert.ok(forside.includes(ord), ord);
  const om = read("om-mig/index.html");
  assert.match(om, /href="https:\/\/tkbars\.dk\/om\/"/);
  assert.match(om.replace(/<[^>]+>/g, " "), /kilde uden afsender/);
  assert.doesNotMatch(om, /ser det, andre overser/);
});

test("privatliv: samme løfter som før, og måling uden cookies er nævnt", () => {
  const t = read("privatliv/index.html").replace(/<[^>]+>/g, " ");
  for (const s of ["Så lidt som muligt.", "ingen formularer, ingen konti og ingen cookies", "Cloudflare Web Analytics", "Datatilsynet"]) assert.ok(t.includes(s), s);
});
