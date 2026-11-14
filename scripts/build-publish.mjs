#!/usr/bin/env node
// Bygger stevenwensley.com til ./_site (Cloudflare Pages' publish-mappe).
// Efter oprydningen 4/11 2026 (S639) er Eleventy eneste kilde: src → _site.
// Navnet er bevaret, så Cloudflare Pages' build-kommando virker uændret.
import { execSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";

rmSync("_site", { recursive: true, force: true });
execSync("npx @11ty/eleventy", { stdio: "inherit" });
const krævet = ["index.html", "saadan-kan-jeg-hjaelpe/index.html", "oplaeg/index.html", "spoergsmaal/index.html", "om-mig/index.html", "kontakt/index.html", "privatliv/index.html", "404.html", "_redirects", "_headers", "CNAME", "sitemap.xml",
  // Design B v2 (BYG-991) i produktion fra 14/11 2026: selvhostet Inter, tokens.css og et delebillede pr. side.
  "assets/css/tokens.css", "assets/fonts/inter-latin-wght-normal.woff2", "assets/fonts/inter-latin-ext-wght-normal.woff2", "assets/fonts/OFL-Inter.txt",
  "assets/img/og-forside.jpg", "assets/img/og-saadan-kan-jeg-hjaelpe.jpg", "assets/img/og-oplaeg.jpg", "assets/img/og-spoergsmaal.jpg", "assets/img/og-om-mig.jpg", "assets/img/og-kontakt.jpg"];
const mangler = krævet.filter((f) => !existsSync(`_site/${f}`));
if (mangler.length) { console.error("Mangler i _site:", mangler.join(", ")); process.exit(1); }
console.log(`OK: ${krævet.length} nøglefiler i _site`);
