// Hylden på /saadan-kan-jeg-hjaelpe/ (BYG-1220): kun det, der er til salg, kommer frem.
// Trinnene er ordnet efter, hvor meget lederen binder sig, ikke efter beløb. Et trin uden kort til salg vises ikke.
// Data: ydelser.json. De strukturerede data (ld.js) bruger samme liste, så de aldrig nævner noget, siden ikke viser.
// BYG-1221: «Bestil på faktura» åbner en mail til sitets ene adresse med emne og felter udfyldt. Ingen formular.
// Offentlige købere betaler sjældent med kort; EAN-nummeret bruges til den elektroniske faktura.
const FELTER = ["Antal:", "Organisation:", "CVR:", "EAN-nummer:", "Rekvisitions- eller ordrenummer:", "Kontaktperson (navn, mail og telefon):"];
function fakturaLink(email, titel) {
  const emne = `Bestilling på faktura: ${titel}`;
  const tekst = [`Vi vil gerne bestille: ${titel}`, "", ...FELTER].join("\r\n");
  return `mailto:${email}?subject=${encodeURIComponent(emne)}&body=${encodeURIComponent(tekst)}`;
}

function byg({ trin, kort }, email = require("./site.json").email) {
  const medHandling = (k) => (k.handling && k.handling.faktura ? { ...k, handling: { ...k.handling, url: fakturaLink(email, k.titel) } } : k);
  const tilSalg = kort.filter((k) => k.tilSalg === true).map(medHandling);
  const synlige = trin.map((t) => ({ ...t, kort: tilSalg.filter((k) => k.trin === t.id) })).filter((t) => t.kort.length > 0);
  return {
    trin: synlige,
    // Prisrækkerne til salg, i sidens rækkefølge.
    priser: synlige.flatMap((t) => t.kort.flatMap((k) => k.priser)),
    // Forsidens henvisning til det første trin vises først, når der er noget til salg i det.
    proevSelv: synlige.some((t) => t.id === "proev-selv"),
  };
}

module.exports = { ...byg(require("./ydelser.json")), byg, fakturaLink, FELTER };
