// Site-wide data exposed to every template as `site.*`.
// Edit here once and every page picks it up on next build.

// The copyright year comes from scripts/metrics.json, which is where every
// other number on the site already lives. It used to be typed into
// footer.njk as a literal 2026, which meant the ten generated articles
// disagreed with the 44 hand-maintained pages the moment anything updated
// one and not the other — and on 1 January they would all have been wrong
// at once, with a build that still passed.
const metrics = require("../../scripts/metrics.json");

module.exports = {
  copyrightYear: metrics.values.copyrightYear,
  url: "https://stevenwensley.com",
  name: "Steven Seidenfaden Wensley",
  shortName: "Steven Wensley",
  tagline: "AI Governance & Transformation",
  description:
    "Senior programme manager for regulated environments. AI governance, NIS2, GxP. Copenhagen.",
  ogImage: "https://stevenwensley.com/og-image.png",
  author: {
    name: "Steven Seidenfaden Wensley",
    url: "https://stevenwensley.com",
    linkedin: "https://www.linkedin.com/in/stevenwensley/",
  },
  publisher: {
    name: "Steven Wensley",
    url: "https://stevenwensley.com",
  },
  locale: "en_GB",
  // Used for nav rendering — order matters
  navLinks: [
    { label: "Insights", href: "/insights.html", id: "insights" },
    { label: "About", href: "/#about", id: "about" },
    { label: "Services", href: "/services.html", id: "services" },
    { label: "Assessment", href: "/ai-governance-assessment.html", id: "assessment" },
    { label: "Contact", href: "/#contact", id: "contact" },
  ],
};
