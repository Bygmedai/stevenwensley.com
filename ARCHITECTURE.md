# stevenwensley.com — site architecture

This document explains how the site is built. It is the canonical reference
for anyone (Steven, future contributors, Claude in a later session) who
needs to add a page, change shared chrome, or understand why a file lives
where it does.

## High-level

The site is a static, multi-language portfolio + lead-gen funnel for an AI
governance / programme management consultancy in Copenhagen. It is hosted
on **GitHub Pages** at the apex domain `stevenwensley.com` (via `CNAME`).

GitHub Pages serves the **repository root** as the document root. So
`/index.html`, `/services.html`, `/insights/foo.html` etc. are the actual
deployed URLs.

## Build pipeline

```
   /src/               ──[ npm run build ]──▶   /insights/*.html
   ├── _data/                                   (committed alongside source)
   ├── _includes/
   ├── _layouts/
   └── insights/*.html  (frontmatter + body)
```

Eleventy v3 (`eleventy.config.js`) reads from `/src/`, processes Nunjucks
templates, and writes the rendered HTML directly to the project root
(`output: "."`). The build output is **committed** so GitHub Pages can
serve it without an extra deploy step.

CI (`.github/workflows/test.yml` job `build-verify`) re-runs the build on
every push / PR and `git diff --exit-code` against the committed
`/insights/*.html`. If a contributor edits `/src/` but forgets to commit
the rebuild, CI fails.

### Why not output to `_site/` and deploy via GH Actions?

That's the standard 11ty deploy pattern, and it's the right long-term
target. We didn't do it in this PR because:

1. It requires Steven to switch the GitHub Pages source from
   "Deploy from branch (main)" to "GitHub Actions" in repo settings.
2. We wanted a strictly additive PR that did not change the deployment
   model — only the authoring model.

When ready to flip: drop `output: "_site"` in the config, add a deploy
workflow using `actions/deploy-pages@v4`, switch Pages settings, delete
committed `/insights/*.html` from main. See `MIGRATION.md` Phase 4.

## Directory map

```
/                              project root, served by GitHub Pages
├── /index.html                ← unmanaged (will migrate in later PR)
├── /services.html             ← unmanaged
├── /insights.html             ← unmanaged (hub page)
├── /privacy.html              ← unmanaged
├── /404.html                  ← unmanaged
├── /<tool>.html               ← React-based, will not be templated
├── /insights/*.html           ← BUILD OUTPUT from /src/insights/
├── /img/, /favicon.ico, ...   ← static assets, untouched by Eleventy
│
├── /src/                      ← Eleventy input (NOT served — input dir)
│   ├── _data/
│   │   └── site.js            ← site-wide vars: URL, GA4 ID, nav links
│   ├── _includes/
│   │   ├── head.njk           ← <head> block (meta, OG, JSON-LD)
│   │   ├── nav.njk            ← <nav> with skip-link target
│   │   ├── footer.njk         ← three-column footer
│   │   ├── skip-link.njk      ← skip-to-main-content style block
│   │   └── article-styles.css ← canonical article CSS (~512 lines)
│   ├── _layouts/
│   │   └── article.njk        ← layout for /insights/* articles
│   └── insights/
│       └── <slug>.html        ← frontmatter + body, one per article
│
├── /scripts/
│   └── extract-insights.py    ← one-shot: legacy /insights/*.html → /src/
│
├── /tests/                    ← Playwright smoke tests
├── /.github/workflows/test.yml ← CI: build-verify, html-validate, links, lighthouse, playwright
├── eleventy.config.js
└── package.json
```

## Article frontmatter contract

Every file under `/src/insights/<slug>.html` has YAML frontmatter that
drives `_layouts/article.njk`. All fields are documented inline at the top
of `article.njk`. Required:

- `layout: article.njk`
- `title`, `description`
- `slug`, `permalink: /insights/<slug>.html`
- `canonical`, `hreflang` (array)
- `datePublished`, `dateModified`
- `tag`, `displayDate`, `readTime`, `lead`
- `jsonLd` (raw object dumped into `<script type="application/ld+json">`)
- `related` (array of 2 link objects)
- `cta` (heading, body, buttons, divider) — different per article

Body (the article prose) lives below the `---` frontmatter terminator and
is straight HTML.

## Adding a new article

1. Create `/src/insights/<slug>.html` with frontmatter (copy from an
   existing article and edit).
2. Write body in HTML (`<p>`, `<h2>`, `<ul>` etc).
3. Run `npm run build`.
4. Commit both `/src/insights/<slug>.html` and the generated
   `/insights/<slug>.html`.
5. Add the article to `/sitemap.xml`. (Auto-generation from a 11ty
   collection is a follow-up.)

## Local development

```sh
npm install
npm run build         # one-shot build
npm run build:watch   # rebuild on /src/ changes
npm run serve         # 11ty dev server on :8080 with live reload
npm run verify        # build + diff against committed /insights/
```

## What is NOT yet templated

Everything outside `/insights/` is still hand-edited HTML at project root.
See `MIGRATION.md` for the planned phasing and rationale.
