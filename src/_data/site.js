// Site-wide data exposed to every template as `site.*`.
// Edit here once and every page picks it up on next build.

module.exports = {
  url: "https://stevenwensley.com",
  name: "Steven Seidenfaden Wensley",
  shortName: "Steven Wensley",
  tagline: "AI Governance & Transformation",
  description:
    "Senior programme manager for regulated environments. AI governance, NIS2, GxP. 20+ years. Copenhagen.",
  ga4Id: "G-17Y98NY34Y",
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
