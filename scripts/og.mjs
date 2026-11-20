#!/usr/bin/env node
// Delebilleder (og:image) til alle sider, lavet ud fra sidernes egne overskrifter.
//
// Hvorfor: QA 19/11 2026 fandt, at delebillederne viste overskrifter fra før
// tekstrevisionen, og at reservebilledet havde det gamle design. Billederne
// laves nu her, og src/_data/og.json husker, hvilken overskrift hvert billede
// er lavet ud fra. tests/og.unit.mjs fejler, hvis en overskrift ændres uden
// at billedet laves om. Kør da: npm run og
//
// Scriptet bygger sitet, læser eyebrow og h1 fra hver side i _site, tegner
// billedet i Chromium (Playwright, som prøverne allerede bruger) og bygger
// igen, så layoutet peger på de nye filer. Det kører ikke i Cloudflare Pages'
// byg; billederne ligger i repoet som almindelige filer.
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import { chromium } from "@playwright/test";

const BRED = 1200, HØJ = 630;
const STANDARD_EYEBROW = "AI, magt og ledelse";
const FOD = "AI flytter magt. Tag ledelsen.";
// Fast liste: én fil pr. side i sitemap. Navnet følger adressen (se ogFil i tests/og.unit.mjs).
const SIDER = ["/", "/saadan-kan-jeg-hjaelpe/", "/oplaeg/", "/spoergsmaal/", "/om-mig/", "/kontakt/", "/privatliv/", "/analyser/", "/analyser/gevinsten-staar-i-budgettet/"];
export const ogFil = (url) => `/assets/img/og-${url === "/" ? "forside" : url.replace(/^\/|\/$/g, "").replace(/\//g, "-")}.jpg`;

const tekst = (s) => s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
const html = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

// «ogLinje» i en sides front matter: en ekstra linje under overskriften. Den skal stå ordret på siden (prøves i tests/og.unit.mjs).
const linjer = {};
for (const f of readdirSync("src", { recursive: true })) {
  if (!f.endsWith(".njk")) continue;
  const fm = readFileSync(`src/${f}`, "utf8").match(/^---\n([\s\S]*?)\n---/);
  const perma = fm && fm[1].match(/^permalink:\s*(\S+)/m);
  const linje = fm && fm[1].match(/^ogLinje:\s*"(.*)"$/m);
  if (perma && linje) linjer[perma[1]] = linje[1];
}

function læs(url) {
  const h = readFileSync(`_site${url}index.html`, "utf8");
  const helt = h.match(/<div class="hero">([\s\S]*?)<\/h1>/)[0];
  const eyebrow = helt.match(/<span class="eyebrow">([\s\S]*?)<\/span>/);
  return { overskrift: tekst(helt.match(/<h1>([\s\S]*?)<\/h1>/)[1]), eyebrow: eyebrow ? tekst(eyebrow[1]) : STANDARD_EYEBROW, linje: linjer[url] || null };
}

const font = (f) => pathToFileURL(resolve("src/assets/fonts", f)).href;
const side = ({ overskrift, eyebrow, linje }) => `<!doctype html><html lang="da"><head><meta charset="utf-8"><style>
@font-face{font-family:Inter;src:url(${font("inter-latin-wght-normal.woff2")}) format("woff2");font-weight:100 900}
@font-face{font-family:Inter;src:url(${font("inter-latin-ext-wght-normal.woff2")}) format("woff2");font-weight:100 900;unicode-range:U+0100-024F}
*{box-sizing:border-box;margin:0}
body{width:${BRED}px;height:${HØJ}px;background:#fff;color:#0f1b2d;font-family:Inter,sans-serif;font-feature-settings:"cv11","ss01";padding:64px 80px 56px;display:flex;flex-direction:column;border-left:14px solid #1d4ed8}
.top{display:flex;justify-content:space-between;align-items:center;gap:40px}
.brand{font-weight:700;font-size:30px;letter-spacing:-.02em}.brand b{color:#1d4ed8}
.eb{font-size:19px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#1d4ed8;text-align:right}
.midt{flex:1;display:flex;flex-direction:column;justify-content:center;gap:22px}
h1{font-weight:700;letter-spacing:-.035em;line-height:1.06;max-width:960px}
.linje{font-size:30px;line-height:1.3;color:#4b5870;font-weight:500;max-width:960px}
.fod{display:flex;justify-content:space-between;border-top:3px solid #1d4ed8;padding-top:22px;font-size:22px;color:#4b5870}
</style></head><body>
<div class="top"><div class="brand">Steven <b>Wensley</b></div><div class="eb">${html(eyebrow)}</div></div>
<div class="midt"><h1 id="h">${html(overskrift)}</h1>${linje ? `<p class="linje">${html(linje)}</p>` : ""}</div>
<div class="fod"><span>${FOD}</span><span>stevenwensley.com</span></div>
</body></html>`;

// Første byg uden nøglefilskontrollen: nye sider har endnu ikke deres billede.
execSync("node -e \"require('fs').rmSync('_site',{recursive:true,force:true})\" && npx @11ty/eleventy --quiet", { stdio: "inherit" });
const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: BRED, height: HØJ }, deviceScaleFactor: 1 });
const manifest = { _kommentar: "Lavet af scripts/og.mjs (npm run og). Hver side har sit eget delebillede; «overskrift», «eyebrow» og «linje» er de tekster, billedet er lavet ud fra, og «sha256» er billedfilens fingeraftryk. tests/og.unit.mjs holder dem op mod siderne. Ret ikke i hånden.", reserve: null, sider: {} };

async function tegn(data, fil) {
  await p.setContent(side(data), { waitUntil: "load" });
  await p.evaluate(() => document.fonts.ready);
  // Største skriftstørrelse, hvor overskriften kan stå på højst tre linjer.
  await p.evaluate((harLinje) => {
    const h = document.getElementById("h");
    for (let s = harLinje ? 76 : 92; s >= 44; s -= 2) {
      h.style.fontSize = s + "px";
      if (h.getBoundingClientRect().height <= s * 1.06 * (harLinje ? 2 : 3) + 2 && document.body.scrollHeight <= innerHeight) break;
    }
  }, !!data.linje);
  const buf = await p.screenshot({ type: "jpeg", quality: 88 });
  writeFileSync(`src${fil}`, buf);
  return { fil, ...data, sha256: createHash("sha256").update(buf).digest("hex") };
}

for (const url of SIDER) {
  manifest.sider[url] = await tegn(læs(url), ogFil(url));
  console.log("OG:", url, "→", manifest.sider[url].fil);
}
// Reservebilledet (404 og den gamle adresse /og-image.png): forsidens tekst.
manifest.reserve = await tegn(læs("/"), "/assets/img/og.jpg");
await browser.close();
writeFileSync("src/_data/og.json", JSON.stringify(manifest, null, 2) + "\n");
execSync("node scripts/build-publish.mjs", { stdio: "inherit" });
