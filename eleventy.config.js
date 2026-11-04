// stevenwensley.com efter oprydningen 4/11 2026 (S639): src → _site.
module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/_headers": "_headers" });
  eleventyConfig.addPassthroughCopy({ "src/_redirects": "_redirects" });
  eleventyConfig.addPassthroughCopy({ "src/robots.txt": "robots.txt" });
  for (const f of ["CNAME", "BingSiteAuth.xml", "favicon.ico", "apple-touch-icon.png"]) eleventyConfig.addPassthroughCopy(f);
  eleventyConfig.setServerOptions({ port: 8080 });
  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    templateFormats: ["njk", "md"],
  };
};
