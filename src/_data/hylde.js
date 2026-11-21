// Hylden på /saadan-kan-jeg-hjaelpe/ (BYG-1220): kun det, der er til salg, kommer frem.
// Trinnene er ordnet efter, hvor meget lederen binder sig, ikke efter beløb. Et trin uden kort til salg vises ikke.
// Data: ydelser.json. De strukturerede data (ld.js) bruger samme liste, så de aldrig nævner noget, siden ikke viser.
function byg({ trin, kort }) {
  const tilSalg = kort.filter((k) => k.tilSalg === true);
  const synlige = trin.map((t) => ({ ...t, kort: tilSalg.filter((k) => k.trin === t.id) })).filter((t) => t.kort.length > 0);
  return {
    trin: synlige,
    // Prisrækkerne til salg, i sidens rækkefølge.
    priser: synlige.flatMap((t) => t.kort.flatMap((k) => k.priser)),
    // Forsidens henvisning til det første trin vises først, når der er noget til salg i det.
    proevSelv: synlige.some((t) => t.id === "proev-selv"),
  };
}

module.exports = { ...byg(require("./ydelser.json")), byg };
