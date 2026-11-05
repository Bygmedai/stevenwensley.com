#!/usr/bin/env node
// Bygger stevenwensley.com til ./_site (Cloudflare Pages' publish-mappe).
// Efter oprydningen 4/11 2026 (S639) er Eleventy eneste kilde: src → _site.
// Navnet er bevaret, så Cloudflare Pages' build-kommando virker uændret.
import { execSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";

rmSync("_site", { recursive: true, force: true });
execSync("npx @11ty/eleventy", { stdio: "inherit" });
const krævet = ["index.html", "oplaeg/index.html", "om/index.html", "kontakt/index.html", "privatliv/index.html", "404.html", "_redirects", "_headers", "CNAME"];
const mangler = krævet.filter((f) => !existsSync(`_site/${f}`));
if (mangler.length) { console.error("Mangler i _site:", mangler.join(", ")); process.exit(1); }
console.log(`OK: ${krævet.length} nøglefiler i _site`);
