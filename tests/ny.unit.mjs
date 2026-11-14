// Design B v2 "Nordisk lys" (BYG-991), i produktion fra 14/11 2026 (S647). Kræver et build (_site).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const SITE = "_site";
const read = (p) => readFileSync(join(SITE, p), "utf8");
const NY = ["index.html", "saadan-kan-jeg-hjaelpe/index.html", "spoergsmaal/index.html", "om-mig/index.html", "kontakt/index.html", "oplaeg/index.html"];

for (const side of NY) {
  test(`${side}: dansk, én h1, tokens.css og .sw-scope, ingen noindex`, () => {
    const h = read(side);
    assert.match(h, /<html lang="da">/);
    assert.doesNotMatch(h, /<meta name="robots"/);
    assert.equal((h.match(/<h1[\s>]/g) || []).length, 1);
    assert.match(h, /href="\/assets\/css\/tokens\.css"/);
    assert.match(h, /<body class="sw">/);
    assert.doesNotMatch(h, /<script/i);
    assert.doesNotMatch(h, /fonts\.googleapis|fonts\.gstatic/);
  });
}

test("alle interne links og billeder peger på noget, der findes", () => {
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
  const t = read("index.html");
  const sit = t.indexOf("Tre situationer"), start = t.indexOf("Hvordan vi kommer i gang"), usagt = t.indexOf("Tre spørgsmål, ledelsen sjældent kan svare på");
  assert.ok(sit > 0 && start > sit && usagt > start);
});

test("siderne står i sitemap, og /ny/ og det gamle design er væk", () => {
  const sm = read("sitemap.xml");
  for (const side of NY) assert.ok(sm.includes(`<loc>https://stevenwensley.com/${side.replace("index.html", "")}</loc>`), side);
  assert.doesNotMatch(sm, /\/ny\//);
  for (const f of ["ny", "om", "assets/css/sw.css"]) assert.equal(existsSync(join(SITE, f)), false, f);
  for (const side of [...NY, "privatliv/index.html", "404.html"]) assert.doesNotMatch(read(side), /href="\/ny\/|href="\/om\/"/, side);
});

test("QA #109: kort-overskrifter er h2, FAQ er lukket, ét mål for «Book 30 minutter»", () => {
  const h = read("saadan-kan-jeg-hjaelpe/index.html");
  for (const t of ["Forstå", "Beslut", "Følg med"]) assert.match(h, new RegExp(`<h2>${t}</h2>`), t);
  assert.doesNotMatch(read("spoergsmaal/index.html"), /<details[^>]*\sopen/);
  for (const side of NY) {
    for (const [, href] of read(side).matchAll(/<a[^>]*href="([^"]*)"[^>]*>Book 30 minutter<\/a>/g)) assert.equal(href, "/kontakt/", side);
  }
});

test("mobilmenu uden JS: details/summary med alle sider", () => {
  const h = read("index.html");
  assert.match(h, /<details class="mnav"><summary/);
  for (const u of ["/", "/saadan-kan-jeg-hjaelpe/", "/oplaeg/", "/spoergsmaal/", "/om-mig/", "/kontakt/"]) assert.ok(h.includes(`href="${u}"`), u);
});

test("ankre har scroll-margin-top under sticky header", () => {
  assert.match(read("assets/css/tokens.css"), /\[id\]\{scroll-margin-top:\d+px\}/);
});

test("ingen gule pladsholdere tilbage", () => {
  for (const side of NY) assert.doesNotMatch(read(side), /class="(ph|phbox)"|VERIFICÉR|STEVEN:/, side);
});

test("priserne står ordret som på den gamle forside, ekskl. moms", () => {
  const t = read("saadan-kan-jeg-hjaelpe/index.html").replace(/<[^>]+>/g, " ");
  for (const pris of ["Derefter 1.400 kr. i timen", "Halv dag fra 18.000 kr.", "Heldag fra 35.000 kr.", "Fire halve dage fra 75.000 kr.", "Fra 12.000 kr.", "Alle priser er ekskl. moms. Ved halve og hele dage er formøde og skriftlig opsamling med."]) assert.ok(t.includes(pris), pris);
  for (const side of NY) assert.doesNotMatch(read(side), /6\.500|45\.000|39\.500/, side);
});

test("portrætter, illustration, referencer og sprog efter beslutningerne", () => {
  assert.match(read("index.html"), /src="\/assets\/img\/steven-skjorte\.jpg"/);
  assert.match(read("index.html"), /Illustration lavet med AI/);
  assert.match(read("index.html"), /Referencer gives på forespørgsel\./);
  assert.match(read("om-mig/index.html"), /src="\/assets\/img\/steven-roede-briller\.jpg"/);
  const faq = read("spoergsmaal/index.html");
  assert.match(faq, /København/); assert.doesNotMatch(faq, /Skandinavien/);
  for (const side of NY) assert.doesNotMatch(read(side), /interim|Bestyrelsesbriefing/i, side);
  const k = read("kontakt/index.html");
  assert.match(k, /Den første samtale er gratis og tager 30 minutter\./);
  assert.match(k, /href="mailto:steven@bygmedai\.dk"/); assert.match(k, /href="tel:\+4553886061"/);
  assert.doesNotMatch(k, /<form|<iframe|<script/i);
});

// --- S647: de to sites siger det samme om de samme ting ---
const tekst = (h) => h.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
const mio = (v) => (Math.abs(v) / 1000).toFixed(2).replace(/0$/, "").replace(".", ",");

test("én mailadresse på hele sitet, den samme som på bygmedai.dk", () => {
  for (const side of [...NY, "privatliv/index.html"]) {
    const h = read(side);
    assert.doesNotMatch(h, /gmail\.com/, side);
    assert.match(h, /mailto:steven@bygmedai\.dk/, side);
  }
});

test("menuen bruger sidens eget navn, og oplæg står i menuen", () => {
  for (const side of NY) {
    const h = read(side);
    assert.doesNotMatch(h, /Sådan arbejder jeg/, side);
    assert.match(h, /<a href="\/saadan-kan-jeg-hjaelpe\/"[^>]*>Sådan kan jeg hjælpe<\/a>/, side);
    assert.match(h, /<a href="\/oplaeg\/"[^>]*>Oplæg<\/a>/, side);
  }
  assert.match(read("saadan-kan-jeg-hjaelpe/index.html"), /<h1>Sådan kan jeg hjælpe<\/h1>/);
});

test("oplæg: de tre oplæg, «Hvem ejer den tid» først, og prisen", () => {
  const o = tekst(read("oplaeg/index.html"));
  for (const t of ["Tre oplæg, der ikke handler om værktøjer.", "Hvem ejer den tid, AI frigør?", "AI er ikke et IT-problem. Det er et magtproblem.", "Ti måneder med AI-agenter. Det, ingen fortæller dig.", "Fra 12.000 kr. ekskl. moms."]) assert.ok(o.includes(t), t);
  assert.ok(o.indexOf("Hvem ejer den tid, AI frigør?") < o.indexOf("Det er et magtproblem."));
  assert.match(read("oplaeg/index.html"), /Illustration lavet med AI/);
  assert.match(read("saadan-kan-jeg-hjaelpe/index.html"), /href="\/oplaeg\/"/);
});

test("den offentlige leder er med i de tre situationer", () => {
  const t = tekst(read("index.html"));
  assert.ok(t.includes("Besparelsen står allerede i budgettet. Ingen har målt noget endnu."));
  assert.ok(t.includes("Bestyrelsen eller byrådet spørger"));
  assert.equal((read("index.html").match(/<p class="quote">/g) || []).length, 3);
});

test("eksemplet: figurens etiketter og netto svarer til tallene, og kilden står ved figuren", () => {
  const e = JSON.parse(readFileSync("src/_data/eksempel.json", "utf8"));
  assert.equal(e.investeringLabel, mio(e.investering));
  assert.equal(e.aar.length, 4);
  for (const a of e.aar) {
    assert.equal(a.effektiviseringLabel, mio(a.effektivisering), String(a.aar));
    assert.equal(a.netto, e.investering - a.effektivisering, String(a.aar));
    assert.equal(a.nettoLabel, (a.netto > 0 ? "+" : "−") + mio(a.netto), String(a.aar));
    assert.ok(a.effektivisering <= e.skalaMax);
  }
  const h = read("index.html");
  const svg = h.slice(h.indexOf("<svg"), h.indexOf("</svg>"));
  for (const a of e.aar) {
    assert.ok(svg.includes(`>${a.effektiviseringLabel}</text>`), a.effektiviseringLabel);
    assert.ok(svg.includes(`>${a.aar}</text>`) && svg.includes(`>${a.stillinger} stillinger</text>`), String(a.aar));
    assert.ok(h.includes(`<td>${a.nettoLabel}</td>`), a.nettoLabel);
  }
  assert.equal((svg.match(/class="fig-b"/g) || []).length, 4);
  assert.match(svg, /role="img"/);
  assert.ok(h.includes(`href="${e.kildeUrl}"`) && h.includes(`href="${e.overblikUrl}"`));
  assert.match(tekst(h), /Forslaget er taget med i budgetforliget for 2026\./);
});

test("eksemplet siger ikke mere, end budgettet dokumenterer, og er bundet til en udgivelse", () => {
  const e = JSON.parse(readFileSync("src/_data/eksempel.json", "utf8"));
  const t = tekst(read("index.html"));
  // Et budgetkrav er ikke en målt effekt, og forslaget rummer også en rammebesparelse.
  assert.ok(t.includes("Tallene er budgetkrav, ikke målt effekt."));
  assert.ok(t.includes(`administrativ rammebesparelse på ${e.rammebesparelse2026Label} i 2026`));
  assert.equal(e.rammebesparelse2026Label, `${e.rammebesparelse2026}.000 kr.`);
  assert.ok(t.includes("før effekten er målt"));
  assert.doesNotMatch(t, /ikke længere, om AI frigør tid|Gevinsten er skrevet ind/);
  // Figuren følger en bestemt udgivelse og bestemte poster i AI-overblikket.
  assert.match(e.udgivelse, /^rel-ai-overblikket-\d{3}$/);
  assert.ok(Array.isArray(e.rettelserKontrolleret));
  assert.ok(e.udgivelseUrl.endsWith(`/udgivelser/${e.udgivelse}.json`));
  assert.ok(Array.isArray(e.poster) && e.poster.length >= 3);
  for (const id of e.poster) assert.match(id, /^obs-hoeje-taastrup-/, id);
});

test("AI-overblikket står på Om mig, i foden og ved figuren, og krydslinks siger hvorfor", () => {
  assert.match(read("om-mig/index.html"), /<dt>AI-overblikket<\/dt>/);
  for (const side of [...NY, "privatliv/index.html"]) assert.match(read(side), /href="https:\/\/bygmedai\.dk\/indsigt\/offentlig-ai\/"[^>]*>AI-overblikket<\/a>/, side);
  assert.match(read("index.html"), /href="https:\/\/bygmedai\.dk\/indsigt\/offentlig-ai\/kommuner\/hoeje-taastrup\/"/);
  // Et link til bygmedai.dk siger, hvad læseren finder dér. Ingen side kalder længere Bygmedai en projektbutik.
  assert.match(read("saadan-kan-jeg-hjaelpe/index.html"), />Se tallene og kilderne<\/a>/);
  assert.match(read("kontakt/index.html"), />AI-overblikket: kommunernes tal med kilder<\/a>/);
  for (const side of [...NY, "privatliv/index.html"]) {
    const h = read(side);
    assert.doesNotMatch(h, /Gå til bygmedai\.dk|Projekter: bygmedai\.dk|min virksomhed for større AI-projekter/, side);
    for (const [, href] of h.matchAll(/href="(https:\/\/bygmedai\.dk\/[^"]*)"/g)) assert.ok(href.includes("/indsigt/offentlig-ai/") || href.includes("/fabrikken/"), `${side} → ${href}`);
  }
});
