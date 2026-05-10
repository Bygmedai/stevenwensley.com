# stevenwensley.com

Personal site for Steven Seidenfaden Wensley — AI governance and
programme management consulting in Copenhagen.

Static site, deployed via GitHub Pages (CNAME → `stevenwensley.com`).

## Quick start

```sh
npm install            # install Eleventy, Playwright, http-server
npm run build          # render /src/ → root
npm run serve          # dev server with live reload on :8080
npm test               # Playwright smoke tests (requires running build)
npm run verify         # build + diff against committed insights/
```

## Where the code lives

- `/src/` — Eleventy source (templates, partials, layouts, article frontmatter)
- `/insights/*.html` — committed build output (served by GH Pages)
- `/index.html`, `/services.html`, `/<tool>.html` — hand-edited HTML at root, **not yet templated**

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the full layout and build
pipeline. See [`MIGRATION.md`](./MIGRATION.md) for what's templated vs.
hand-edited and the planned phasing.

## CI

`.github/workflows/test.yml` runs on every push and PR:

- **`build-verify`** — re-runs `npm run build` and fails if committed
  `/insights/*.html` differ from the freshly built output
- **`html-validate`** — validates all rendered HTML (excluding `/src/`,
  which contains Nunjucks templates)
- **`broken-links`** — scans for 404s with linkinator
- **`lighthouse`** — audits 6 curated pages including one insights article
- **`playwright`** — smoke tests across all pages, plus responsive
  screenshots at 3 breakpoints

## Adding an article

1. Copy an existing `/src/insights/<slug>.html` and edit frontmatter +
   body.
2. Run `npm run build`.
3. Commit both `/src/insights/<slug>.html` and the generated
   `/insights/<slug>.html`.
4. Add the URL to `/sitemap.xml`.
