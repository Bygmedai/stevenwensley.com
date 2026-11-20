// Strukturerede data (schema.org, JSON-LD) til søgemaskiner.
//
// Hvorfor: QA 19/11 2026 fandt, at ingen side fortalte søgemaskinerne, at
// sitet handler om en person, der sælger rådgivning. Blokkene her er data,
// ikke kode: browseren kører dem ikke, og CSP'en gælder kun scripts, der
// køres. Reglen «ingen scripts i siderne» står derfor ved magt; prøverne
// tillader kun blokke af typen application/ld+json.
//
// Alt herinde kommer fra site.json og ydelser.json, så de strukturerede
// data aldrig siger andet end siderne. Priserne holdes op mod den synlige
// tekst i tests/ld.unit.mjs.
const site = require("./site.json");
const { side, ydelser } = require("./ydelser.json");

const person = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": `${site.url}/#steven`,
  name: site.navn,
  url: `${site.url}/`,
  image: `${site.url}/assets/img/steven-skjorte.jpg`,
  jobTitle: "AI-rådgiver for ledergrupper",
  description: "Rådgivning, lederforløb og oplæg om at bruge AI, ændre arbejdet og tage ansvar for beslutningerne.",
  email: `mailto:${site.email}`,
  telephone: site.telefon,
  sameAs: [site.linkedin],
  alumniOf: { "@type": "CollegeOrUniversity", name: "Københavns Universitet" },
  knowsLanguage: "da",
  address: { "@type": "PostalAddress", addressLocality: "København", addressCountry: "DK" },
  worksFor: {
    "@type": "Organization",
    name: site.firma,
    identifier: { "@type": "PropertyValue", propertyID: "CVR", value: site.cvr },
  },
};

const tilbud = (y) => ({
  "@type": "Offer",
  itemOffered: { "@type": "Service", name: y.navn },
  priceSpecification: {
    "@type": y.enhed ? "UnitPriceSpecification" : "PriceSpecification",
    ...(y.fra ? { minPrice: y.pris } : { price: y.pris }),
    ...(y.enhed ? { unitText: y.enhed } : {}),
    priceCurrency: "DKK",
    valueAddedTaxIncluded: false,
  },
});

const raadgivning = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": `${site.url}/#raadgivning`,
  name: `${site.navn} · AI-rådgivning for ledergrupper`,
  url: `${site.url}${side}`,
  founder: { "@id": person["@id"] },
  email: site.email,
  telephone: site.telefon,
  address: person.address,
  areaServed: "DK",
  availableLanguage: "da",
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Det kan I hyre mig til",
    itemListElement: ydelser.map(tilbud),
  },
};

// En analyse: overskrift, beskrivelse, adresse og dato fra sidens front matter.
const artikel = (overskrift, beskrivelse, sti, dato) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  headline: overskrift,
  description: beskrivelse,
  url: `${site.url}${sti}`,
  datePublished: dato,
  inLanguage: "da",
  author: { "@id": person["@id"] },
  publisher: { "@id": person["@id"] },
});

module.exports = { person, raadgivning, side, artikel };
