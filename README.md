# stevenwensley.com

Stevens personlige site: rådgiver for ledelsen om AI, magt og ansvar. Projekter og fabrikken bor på [bygmedai.dk](https://bygmedai.dk).

- Kilde: `src/` (Eleventy, Nunjucks). Output: `_site/` (Cloudflare Pages).
- Delebilleder (og:image): `npm run og` laver dem ud fra sidernes overskrifter; `tests/og.unit.mjs` fejler, hvis en overskrift ændres uden nye billeder.
- Byg: `node scripts/build-publish.mjs`. Test: `node --test tests/*.unit.mjs` og `npx playwright test`.
- Design B «Nordisk lys», blå accent, Inter (selvhostet). Kun dansk.
- AI-illustrationer mærkes «Illustration lavet med AI». Steven vises kun på rigtige fotos.
- Orientering for kodesessioner: `CLAUDE.md`.
- Alle gamle adresser 301'er via `src/_redirects`.
