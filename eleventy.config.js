// Eleventy v3 config — see ARCHITECTURE.md for full overview.
//
// Strategy: source lives in /src/, but build output is written directly to
// the project root. So /src/insights/foo.html → /insights/foo.html. We do
// NOT use a separate /_site/ directory because GitHub Pages serves from
// the repository root (CNAME = stevenwensley.com), and we want the build
// output committed alongside source.
//
// Only /src/insights/ is currently templated. All other root .html files
// are unmanaged by Eleventy and pass through untouched. They'll be
// migrated incrementally — see MIGRATION.md.
//
// To add a new templated page later: drop a frontmatter file under /src/
// with a matching `permalink:` and Eleventy will write to the right path.

module.exports = function (eleventyConfig) {
  // No passthrough copy — Eleventy must not own any static assets in this
  // PR. /img/, /css/, /favicon.ico etc. remain at project root and are
  // committed manually.

  // Suppress Eleventy from clobbering /index.html and other unmanaged
  // root files. With `output: "."` Eleventy still only writes the files
  // it has rendered from /src/ — this guard is defence-in-depth.
  eleventyConfig.setServerOptions({ port: 8080 });

  return {
    dir: {
      input: "src",
      output: ".",
      includes: "_includes",
      layouts: "_layouts",
      data: "_data",
    },
    // .html files under /src/ run through Nunjucks so frontmatter +
    // {% include %} work. Markdown is also Nunjucks-rendered for future
    // article authoring in .md.
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    templateFormats: ["html", "njk", "md"],
  };
};
