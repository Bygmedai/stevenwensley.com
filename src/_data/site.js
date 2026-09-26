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
  // Used for nav rendering — order matters. The same seven links, in the
  // same order, as the hand-maintained pages: the articles carried the
  // site's first navigation (Insights / About / Services / Assessment) for a
  // month after every other page had moved on, with .html links that
  // redirect and an /#about anchor that no longer exists.
  navLinks: [
    { label: "The Factory", href: "/workshop", id: "workshop" },
    { label: "Playbooks", href: "/playbooks", id: "playbooks" },
    { label: "Services", href: "/services", id: "services" },
    { label: "Tools", href: "/tools", id: "tools" },
    { label: "Notes", href: "/notes", id: "notes" },
    { label: "About", href: "/about", id: "about" },
    { label: "Contact", href: "/#contact", id: "contact" },
  ],
};
