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
    assert.doesNotMatch(h.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, ""), /<script/i);
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

test("forsiden: konflikterne før de tre spørgsmål, og procesafsnittet er væk", () => {
  // Tekstgrundlaget, revision 2 (Sirius 20/11 2026): F-17 til F-19 udgår som hel sektion.
  const t = read("index.html");
  const konflikt = t.indexOf("Her bliver AI en ledelsesopgave"), spm = t.indexOf("Tre spørgsmål, I skal tage stilling til");
  assert.ok(konflikt > 0 && spm > konflikt);
  assert.doesNotMatch(t, /Vi tager jeres arbejde med ind i rummet|Se former og priser/);
});

test("forsiden, revision 2: position, uafhængighed, analysen og bemærkningen ved figuren", () => {
  const h = read("index.html"), t = tekst(h);
  assert.match(h, /<h1>AI flytter magt\. Tag ledelsen\.<\/h1>/);
  assert.ok(t.includes("Første samtale: 30 minutter. Gratis."));
  assert.ok(t.includes("Jeg sælger ingen licenser og får ingen provision fra leverandører."));
  assert.match(h, /<a class="btn ghost" href="\/analyser\/gevinsten-staar-i-budgettet\/">Læs analysen<\/a>/);
  // Rammebesparelsen står direkte under figuren ved kilden, ikke i det lukkede felt og ikke i småt.
  const fig = h.slice(h.indexOf('<figure class="fig">'), h.indexOf("</figure>", h.indexOf('<figure class="fig">')));
  const note = fig.indexOf('<p class="fig-r">Forslaget omtaler også en administrativ rammebesparelse');
  assert.ok(note > fig.indexOf("</details>") && note < fig.indexOf('<p class="fig-k">'));
  assert.match(h, /<a href="https:\/\/www\.linkedin\.com\/in\/stevenwensley\/">Se anbefalingerne fra blandt andre NNIT, TCS og Nordea på LinkedIn\.<\/a>/);
});

test("siderne står i sitemap, og /ny/ og det gamle design er væk", () => {
  const sm = read("sitemap.xml");
  for (const side of NY) assert.ok(sm.includes(`<loc>https://stevenwensley.com/${side.replace("index.html", "")}</loc>`), side);
  assert.doesNotMatch(sm, /\/ny\//);
  for (const f of ["ny", "om", "assets/css/sw.css"]) assert.equal(existsSync(join(SITE, f)), false, f);
  for (const side of [...NY, "privatliv/index.html", "404.html"]) assert.doesNotMatch(read(side), /href="\/ny\/|href="\/om\/"/, side);
});

test("QA #109: kort-overskrifter er h2, FAQ er lukket, ét mål for samtaleknapperne", () => {
  const h = read("saadan-kan-jeg-hjaelpe/index.html");
  for (const t of ["En opgave at begynde med", "Et ansvar, der kan bruges", "Noget at følge op på"]) assert.match(h, new RegExp(`<h2>${t}</h2>`), t);
  assert.doesNotMatch(read("spoergsmaal/index.html"), /<details[^>]*\sopen/);
  for (const side of NY) {
    // Revision 2: ingen kalender. Knapperne til en samtale går til kontaktsiden.
    for (const [, href] of read(side).matchAll(/<a[^>]*href="([^"]*)"[^>]*>(?:Tal med mig|Lad os tale|Tal om jeres budget)<\/a>/g)) assert.equal(href, "/kontakt/", side);
    // «Book 30 minutter» må kun stå på et link, der faktisk åbner kalenderen (Calendly, 20/11 2026).
    assert.doesNotMatch(read(side).replace(/<a [^>]*href="https:\/\/calendly\.com\/steven-bygmedai\/new-meeting"[^>]*>Book 30 minutter[^<]*<\/a>/g, ""), /Book 30 minutter|Book et oplæg|uforpligtende snak/, side);
  }
});

test("kalenderen: et link ud til Calendly, kun på Kontakt, og privatlivsteksten nævner den", () => {
  // Steven 20/11 2026, valg A: «Book 30 minutter» står kun på Kontakt; alle «Lad os tale» går dertil.
  const site = JSON.parse(readFileSync("src/_data/site.json", "utf8"));
  assert.equal(site.booking, "https://calendly.com/steven-bygmedai/new-meeting");
  const k = read("kontakt/index.html");
  assert.match(k, /<a class="btn" href="https:\/\/calendly\.com\/steven-bygmedai\/new-meeting">Book 30 minutter<\/a><a class="btn ghost" href="mailto:steven@bygmedai\.dk">Skriv til mig<\/a><a class="btn ghost" href="tel:\+4553886061">Ring til mig<\/a>/);
  assert.match(k, /<dt>Kalender<\/dt><dd><a href="https:\/\/calendly\.com\/steven-bygmedai\/new-meeting">Book 30 minutter hos Calendly<\/a><\/dd>/);
  assert.match(k, /Kalenderen ligger hos Calendly\. Dens knapper og mails er på engelsk\./);
  for (const side of [...NY, "privatliv/index.html", "404.html"]) {
    const h = read(side);
    if (side !== "kontakt/index.html") assert.doesNotMatch(h, /calendly\.com\/steven-bygmedai/, side);
    // Ingen indlejret kalender og intet script fra Calendly: CSP'en i src/_headers tillader det ikke.
    assert.doesNotMatch(h, /<iframe|<script[^>]+calendly|assets\.calendly\.com/i, side);
  }
  const p = read("privatliv/index.html");
  assert.match(p, /<h2>Når du booker en samtale<\/h2>/);
  assert.match(p, /href="https:\/\/calendly\.com\/legal\/privacy-notice"/);
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

test("priserne er uændrede, ekskl. moms", () => {
  const t = read("saadan-kan-jeg-hjaelpe/index.html").replace(/<[^>]+>/g, " ");
  for (const pris of ["Derefter 1.400 kr. i timen", "Halv dag fra 18.000 kr.", "Heldag fra 35.000 kr.", "Fire halve dage fra 75.000 kr.", "Fra 12.000 kr.", "Alle priser er ekskl. moms. Halve og hele dage omfatter formøde og skriftlig opsamling."]) assert.ok(t.includes(pris), pris);
  for (const side of NY) assert.doesNotMatch(read(side), /6\.500|45\.000|39\.500/, side);
});

test("portrætter, illustration, referencer og sprog efter beslutningerne", () => {
  assert.match(read("index.html"), /src="\/assets\/img\/steven-skjorte\.jpg"/);
  assert.match(read("index.html"), /Illustration lavet med AI/);
  // Situationerne på forsiden er Stevens egne beskrivelser: ingen citater, ingen kundeattribution, intet referenceløfte.
  assert.doesNotMatch(read("index.html"), /Referencer gives på forespørgsel|class="quote"|ikke kundecases/);
  // Salgsplanen 19/11 2026: de offentlige anbefalinger på LinkedIn vises som link; personlige referencer stadig på forespørgsel.
  // Revision 2: linjen står i toppen af Om mig og gentages ikke i erfaringslisten.
  const om = read("om-mig/index.html");
  assert.match(om, /Personlige referencer gives på forespørgsel\./);
  assert.match(om, /På <a href="https:\/\/www\.linkedin\.com\/in\/stevenwensley\/">LinkedIn<\/a> finder du skriftlige anbefalinger fra kolleger og kunder hos blandt andre NNIT, TCS og Nordea\./);
  assert.equal(om.split("NNIT, TCS og Nordea").length - 1, 1);
  assert.ok(om.indexOf("NNIT, TCS og Nordea") < om.indexOf("Tre fag. Samme utålmodighed."));
  assert.doesNotMatch(om, /<dt>Referencer<\/dt>/);
  assert.match(read("om-mig/index.html"), /src="\/assets\/img\/steven-roede-briller\.jpg"/);
  const faq = read("spoergsmaal/index.html");
  assert.match(faq, /København/); assert.doesNotMatch(faq, /Skandinavien/);
  for (const side of NY) assert.doesNotMatch(read(side), /interim|Bestyrelsesbriefing/i, side);
  const k = read("kontakt/index.html");
  assert.match(k, /Første samtale er gratis og tager 30 minutter\./);
  assert.match(k, /href="mailto:steven@bygmedai\.dk"/); assert.match(k, /href="tel:\+4553886061"/);
  assert.doesNotMatch(k.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, ""), /<form|<iframe|<script/i);
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
    assert.match(h, /<a href="\/saadan-kan-jeg-hjaelpe\/"[^>]*>Rådgivning<\/a>/, side);
    assert.match(h, /<a href="\/analyser\/"[^>]*>Analyser<\/a>/, side);
    assert.match(h, /<a href="\/oplaeg\/"[^>]*>Oplæg<\/a>/, side);
  }
  assert.match(read("saadan-kan-jeg-hjaelpe/index.html"), /<h1>Det skal virke, når mødet er slut\.<\/h1>/);
});

test("oplæg: de tre oplæg, «Hvem ejer den tid» først, og prisen", () => {
  const o = tekst(read("oplaeg/index.html"));
  for (const t of ["Lad os tale om det, AI gør ved jer.", "Hvem ejer den tid, AI frigør?", "AI flytter magt. Hvem får den?", "Du har fået agenter. Har du også lært at lede dem?", "Fra 12.000 kr. ekskl. moms."]) assert.ok(o.includes(t), t);
  assert.ok(o.indexOf("Hvem ejer den tid, AI frigør?") < o.indexOf("AI flytter magt. Hvem får den?"));
  // Revision 2: knapperne åbner mail med emnet Oplæg. De bestiller ingen dato.
  const knapper = [...read("oplaeg/index.html").matchAll(/<a class="btn" href="([^"]+)">Forespørg på et oplæg<\/a>/g)].map((m) => m[1]);
  assert.deepEqual(knapper, ["mailto:steven@bygmedai.dk?subject=Opl%C3%A6g", "mailto:steven@bygmedai.dk?subject=Opl%C3%A6g"]);
  assert.match(read("oplaeg/index.html"), /Illustration lavet med AI/);
  assert.match(read("saadan-kan-jeg-hjaelpe/index.html"), /href="\/oplaeg\/"/);
});

test("den offentlige leder er med i de tre situationer", () => {
  const t = tekst(read("index.html"));
  assert.ok(t.includes("Besparelsen står i budgettet. Nogen skal levere den."));
  for (const s of ["Licensen er købt. Forandringen mangler.", "Hvem bestemmer, hvad der er godt nok?"]) assert.ok(t.includes(s), s);
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
    assert.ok(svg.includes(`planlagt reduktion: ${a.stillinger} stillinger</title>`), String(a.aar));
    assert.ok(h.includes(`<td>${a.nettoLabel}</td>`), a.nettoLabel);
  }
  assert.equal((svg.match(/class="fig-b"/g) || []).length, 4);
  assert.match(svg, /role="img"/);
  assert.ok(h.includes(`href="${e.kildeUrl}"`) && h.includes(`href="${e.overblikUrl}"`));
  assert.ok(tekst(h).includes("Budgetforslag: investering og effektivisering, 2026–2029"));
  assert.ok(tekst(h).includes("Forventet effektivisering") && tekst(h).includes("Planlagt reduktion af stillinger"));
  // Bindingen til budgetforliget står ikke ved figuren, før den er læst og attesteret i AI-overblikket.
  assert.doesNotMatch(tekst(h), /budgetforlig/i);
});

test("eksemplet siger ikke mere, end budgettet dokumenterer, og er bundet til en udgivelse", () => {
  const e = JSON.parse(readFileSync("src/_data/eksempel.json", "utf8"));
  const t = tekst(read("index.html"));
  // Et forslag kaldes et forslag, og en forventet virkning kaldes forventet. Forslaget rummer også en rammebesparelse.
  assert.ok(t.includes("ØU10-forslag regner med"));
  assert.ok(t.includes("Den er ikke særskilt opgjort i tabellen."));
  assert.ok(t.includes(`administrativ rammebesparelse på ${e.rammebesparelse2026Label} i 2026`));
  assert.equal(e.rammebesparelse2026Label, `${e.rammebesparelse2026}.000 kr.`);
  // Påstande, de viste kilder ikke dokumenterer, og afsenderens forsvarsreplik står ikke på siden.
  assert.doesNotMatch(t, /før effekten er målt|før den er målt|Det er ikke en kritik|ikke længere, om AI frigør tid|Gevinsten er skrevet ind/);
  // Figuren følger en bestemt udgivelse og bestemte poster i AI-overblikket.
  assert.match(e.udgivelse, /^rel-ai-overblikket-\d{3}$/);
  assert.ok(Array.isArray(e.rettelserKontrolleret));
  assert.ok(e.udgivelseUrl.endsWith(`/udgivelser/${e.udgivelse}.json`));
  assert.ok(Array.isArray(e.poster) && e.poster.length >= 3);
  for (const id of e.poster) assert.match(id, /^obs-hoeje-taastrup-/, id);
});

test("AI-overblikket står på Om mig, i foden og ved figuren, og krydslinks siger, hvad læseren finder", () => {
  assert.match(read("om-mig/index.html"), /<dt>AI-overblikket<\/dt>/);
  for (const side of [...NY, "privatliv/index.html"]) assert.match(read(side), /href="https:\/\/bygmedai\.dk\/indsigt\/offentlig-ai\/"[^>]*>AI i det offentlige<\/a>/, side);
  assert.match(read("index.html"), /href="https:\/\/bygmedai\.dk\/indsigt\/offentlig-ai\/kommuner\/hoeje-taastrup\/"/);
  // Et link til bygmedai.dk siger, hvad læseren finder dér. Ingen side kalder længere Bygmedai en projektbutik.
  assert.match(read("kontakt/index.html"), /<dt>AI i det offentlige<\/dt><dd><a href="https:\/\/bygmedai\.dk\/indsigt\/offentlig-ai\/">Se AI-overblikket<\/a>/);
  assert.match(read("oplaeg/index.html"), /<a href="https:\/\/bygmedai\.dk\/indsigt\/offentlig-ai\/">Se kommunernes budgetter<\/a>/);
  for (const side of [...NY, "privatliv/index.html"]) {
    const h = read(side);
    assert.doesNotMatch(h, /Gå til bygmedai\.dk|Projekter: bygmedai\.dk|min virksomhed for større AI-projekter/, side);
    for (const [, href] of h.matchAll(/href="(https:\/\/bygmedai\.dk\/[^"]*)"/g)) assert.ok(href.includes("/indsigt/offentlig-ai/") || href.includes("/fabrikken/"), `${side} → ${href}`);
  }
});

// BYG-1219: toppen af forsiden siger, at rådgivningen bygger på AI-overblikket. Linjen har intet tal, før tallet står i en frossen udgave.
test("forsidens top har én linje om AI-overblikket, med link og uden tal", () => {
  const h = read("index.html");
  const top = h.slice(h.indexOf('<div class="hero">'), h.indexOf("</div></div>", h.indexOf('<div class="hero">')));
  const linjer = [...top.matchAll(/<p class="micro">([^]*?)<\/p>/g)].map((m) => m[1]).filter((x) => x.includes("AI-overblikket"));
  assert.equal(linjer.length, 1);
  assert.equal(linjer[0], 'Bygger på <a href="https://bygmedai.dk/indsigt/offentlig-ai/">AI-overblikket</a>: kommuner, regioner og staten, med kilden ved hvert tal.');
  assert.doesNotMatch(linjer[0].replace(/<[^>]+>/g, ""), /\d/);
});

// BYG-1217: månedsbriefet som et lille første skridt. Tilmelding med en mail til sitets ene adresse; ingen formular.
test("månedsbriefet: maillink med emne og tekst på forsiden og analyserne, og et afsnit i privatlivsteksten", () => {
  const site = JSON.parse(readFileSync(new URL("../src/_data/site.json", import.meta.url), "utf8"));
  for (const side of ["index.html", "analyser/index.html", "analyser/gevinsten-staar-i-budgettet/index.html"]) {
    const h = read(side);
    const m = [...h.matchAll(/<a href="([^"]+)">Få månedens ændringer i det offentliges AI på mail<\/a>/g)];
    assert.equal(m.length, 1, side);
    const u = new URL(m[0][1].replace(/&amp;/g, "&"));
    assert.equal(u.protocol, "mailto:", side);
    assert.equal(u.pathname, site.email, side);
    assert.equal(u.searchParams.get("subject"), "Tilmeld månedsbriefet", side);
    assert.equal(u.searchParams.get("body"), "Skriv mig på månedsbriefet.", side);
  }
  for (const side of [...NY, "analyser/index.html", "analyser/gevinsten-staar-i-budgettet/index.html", "privatliv/index.html"]) assert.doesNotMatch(read(side), /<form[\s>]/i, side);
  const p = read("privatliv/index.html").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  assert.match(p, /Månedsbriefet/);
  assert.match(p, /liste hos Resend/);
  // Resends sendeområde i EU flytter ikke data: Resend opbevarer data i USA.
  assert.match(p, /Resend opbevarer data i USA/);
  assert.doesNotMatch(p, /Resend \(i EU\)/);
  assert.match(p, /Svar «afmeld» på et brev, så sletter jeg dig\./);
  // Formålet og grundlaget: brevet kan indeholde tilbud, og grundlaget er samtykke (GDPR art. 13).
  assert.match(p, /kan indeholde tilbud om mine kurser og oplæg/);
  assert.match(p, /Grundlaget er dit samtykke/);
});
