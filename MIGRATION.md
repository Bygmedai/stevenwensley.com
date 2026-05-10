# Eleventy migration plan

Tracks what's been migrated to `/src/` (templated) vs. what's still
hand-edited HTML at project root. Each phase is a separate PR for
reviewability — see PR notes for scope of each.

## Status snapshot

| Page / set                      | Status            | PR        |
|---------------------------------|-------------------|-----------|
| `/insights/*.html` (10 articles)| ✅ Templated       | #2 (this) |
| `/insights.html` (hub)          | ⬜ Hand-edited     | Phase 2   |
| `/privacy.html`                 | ⬜ Hand-edited     | Phase 2   |
| `/404.html`                     | ⬜ Hand-edited     | Phase 2   |
| `/index.html` + `/index-da.html`| ⬜ Hand-edited     | Phase 3   |
| `/services.html` + DA           | ⬜ Hand-edited     | Phase 3   |
| `/nis2-gap-assessment.html`     | ⬜ Hand-edited     | Phase 3   |
| `/nis2-implementation-roadmap.html` | ⬜ Hand-edited | Phase 3   |
| `/templates.html`               | ⬜ Hand-edited     | Phase 3   |
| `/book-session.html`            | ⬜ Hand-edited     | Phase 3   |
| `/ai-governance-assessment.html` | 🟡 React tool — partial templating only | Phase 5 |
| `/ai-readiness-scan.html`       | 🟡 React tool      | Phase 5   |
| `/cost-of-inaction.html`        | 🟡 React tool      | Phase 5   |
| `/eu-ai-act-classifier.html`    | 🟡 React tool      | Phase 5   |
| `/roi-calculator.html`          | 🟡 React tool      | Phase 5   |
| Deploy via GH Actions (drop committed build artefacts) | ⬜ | Phase 4 |

## Phase 2 — auxiliary pages

Convert `/insights.html`, `/privacy.html`, `/404.html`. These are simple
content pages with low risk; they share most of the head/nav/footer
chrome but each has its own page-specific styles.

Plan:
- Promote `head.njk` content to handle non-article OG types
- Create `/src/_layouts/page.njk` for generic content pages
- Move each page to `/src/`
- Diff against current root files

## Phase 3 — landing + services

Convert `/index.html`, `/index-da.html`, `/services.html`,
`/services-da.html`. These have:
- Bilingual content via separate URLs (already split, easy)
- More complex layouts (hero, case studies, social proof, CTA blocks)
- Larger inlined CSS (~620 lines each, mostly shared with each other but
  different from the article CSS)

Plan:
- Extract a `/src/_includes/landing-styles.css`
- Create `/src/_layouts/landing.njk`
- Move bilingual data to `/src/_data/copy.<lang>.json`

Risk: high. Index page is the most-viewed; any visual regression is
painful. Recommend: 1 PR per page, with side-by-side screenshot diff in
Playwright as evidence.

## Phase 4 — deploy modernisation

Switch from "GitHub Pages serves committed root .html" to "GitHub Actions
builds and deploys via `actions/deploy-pages@v4`".

Plan:
1. Change `eleventy.config.js`: `output: "_site"`.
2. Add `.github/workflows/deploy.yml` with `actions/deploy-pages@v4`.
3. In GitHub repo settings → Pages → Source, switch to "GitHub Actions".
4. Remove all root `*.html` files that are now build output (keep
   un-templated ones until Phases 2/3 cover them).
5. Update `.gitignore` to exclude `_site/`.
6. Update `MIGRATION.md` and `ARCHITECTURE.md`.

Requires manual action by Steven (step 3 — repo settings change).

## Phase 5 — React-based tools (deferred / optional)

The five `<tool>.html` pages each load React 18 + Babel Standalone from
unpkg and render the entire UI in-browser. They have ~50–75 KB of inline
HTML/CSS/JS each.

Two options:

**5a. Light templating only.** Keep the React app inline as today; just
extract `<head>`, `<nav>`, `<footer>` into partials. Saves ~150 KB across
the 5 pages but doesn't fix the bigger issue (Babel-in-browser).

**5b. Rewrite as vanilla JS.** Eliminates ~600 KB of Babel runtime per
page; massive Lighthouse Performance gain. ~1–2 days work per tool.

QA report (PR #1) recommends 5b as "punkt 11". Either option is a
separate set of PRs and deserves its own scope discussion.

## Known broken links (carried over verbatim — to fix in a follow-up PR)

The article footer (`_includes/footer.njk`) currently links to
`/about.html` and `/contact.html`, which are 404s. These are preserved
exactly as the pre-Eleventy site had them so this PR's diff is purely
infrastructural.

Recommended targets in the follow-up:
- "About" → `/index.html#about` (anchor on home page)
- "Book a Call" + "Contact" → `/book-session.html` (existing page) or
  `/index.html#contact`

Same applies to the article CTA, where some articles link to
`https://calendly.com/steven-wensley/30min` — verify the Calendly URL
still resolves and decide whether to consolidate to `/book-session.html`.

## Why this phasing?

Each PR:
- Should be reviewable in < 30 minutes.
- Should be independently revertable.
- Should not change deployment behaviour mid-flight.

Articles were chosen for Phase 1 because they're the most uniform set
(10 near-identical structures), so the templating yield-per-line-of-code
is highest, and a regression on one article is trivial to spot.
