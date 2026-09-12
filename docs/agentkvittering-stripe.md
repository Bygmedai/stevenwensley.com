# Agentkvittering — Stripe-opsætning til Steven

SKU #2. 1.497 kr pr. kørsel. Gratis trafiklys på skærmen. Betalt PDF er
kvitteringen til mappen — ikke et dashboard.

Koden er sat op. Indtil Payment Link og `STRIPE_SECRET_KEY` er sat, viser
knappen prisen, men download låses ikke op.

## Hvad koden allerede gør

1. NIS2-scanningen (`/nis2-gap-assessment`) forbliver gratis på skærmen.
2. Primær CTA efter resultat: **Hent Agentkvittering som PDF — 1.497 kr**.
3. Køberen sendes til et Stripe Payment Link (pladsholder i
   `js/agentkvittering.js` ? `STRIPE_PAYMENT_LINK`).
4. Stripe skal sende tilbage til

   `https://stevenwensley.com/nis2-gap-assessment?session_id={CHECKOUT_SESSION_ID}`

   `{CHECKOUT_SESSION_ID}` er Stripes egen pladsholder — den må stå ordret.
5. Cloudflare Pages Function `GET /api/agentkvittering?session_id=` henter
   sessionen med `STRIPE_SECRET_KEY` og slipper kun igennem når
   `payment_status=paid` **og** beløbet er 1.497 kr DKK (149700 øre).
6. Browseren bygger PDF'en fra scanningen (jsPDF). Scanneren gemmer intet
   på serveren; snapshot ligger i `sessionStorage` i samme fane.

Samme mønster som BygMedAI M1: success-URL med session-id, server tjekker
Stripe, derefter filen.

## Stripe Dashboard — tjekliste

Gør dette i den Stripe-konto der skal tage imod pengene (test først, så live).

### 1. Produkt og pris

- [ ] Products ? Add product
- [ ] Navn: `Agentkvittering`
- [ ] Beskrivelse: `PDF-kvittering for én NIS2-scanning. Trafiklys på skærmen er gratis. Filen er evidens til mappen.`
- [ ] Pris: **1497.00 DKK**, one-time, not recurring
- [ ] Gem `price_…`-id'et (kun til din egen reference)

### 2. Payment Link

- [ ] Payment Links ? New
- [ ] Vælg prisen 1.497 kr DKK
- [ ] Quantity: 1, ikke justerbar
- [ ] After payment ? **Don't show confirmation page** ? redirect til:

  `https://stevenwensley.com/nis2-gap-assessment?session_id={CHECKOUT_SESSION_ID}`

- [ ] Valgfrit cancel / back: `https://stevenwensley.com/nis2-gap-assessment?cancelled=1`
- [ ] Collect name + email (så du har en køber at skrive til)
- [ ] Ingen abonnement, ingen trial
- [ ] Opret linket. Kopiér URL'en (`https://buy.stripe.com/…`)

### 3. Sæt linket ind i sitet

- [ ] I `js/agentkvittering.js`: erstat

  `https://buy.stripe.com/test_REPLACE_AGENTKVITTERING`

  med det rigtige Payment Link (test-link på preview, live-link i production).

- [ ] Commit og deploy. Uden dette trin peger knappen på en pladsholder.

### 4. Hemmelighed på Cloudflare Pages

Projekt: `stevenwensley-com` (se `docs/cloudflare-migration.md`).

- [ ] Pages ? projektet ? Settings ? Environment variables
- [ ] `STRIPE_SECRET_KEY` = `sk_test_…` på Preview, `sk_live_…` på Production
- [ ] Encrypt / secret. Commit ALDRIG nøglen.
- [ ] Valgfrit, kun hvis prisen afviger i test:

  - `STRIPE_EXPECTED_AMOUNT` = `149700`
  - `STRIPE_EXPECTED_CURRENCY` = `dkk`

- [ ] Redeploy efter nye env-vars — Pages Functions læser dem ved deploy.

### 5. Verifikation (5 minutter)

- [ ] Preview-deploy: kør NIS2-scanningen til resultat
- [ ] Gratis trafiklys vises uden betaling
- [ ] Primær knap er Agentkvittering, ikke «book gratis møde»
- [ ] Test-kort `4242…` ? tilbage på siden med `?session_id=cs_test_…`
- [ ] Status: betaling bekræftet, PDF downloader
- [ ] Åbn PDF: dokument-id, versionsstempel, tidspunkt, fund, «hvad kræver et menneske», Stripe-session
- [ ] Kald ` /api/agentkvittering?session_id=cs_test_falsk` ? ikke 200/paid
- [ ] Uden `STRIPE_SECRET_KEY` ? 503 `stripe_ikke_konfigureret`

### 6. Live

- [ ] Gentag Payment Link i live-mode
- [ ] Sæt live-URL i `js/agentkvittering.js`
- [ ] Sæt `sk_live_…` på Production
- [ ] Én rigtig 1.497 kr-test (refunder i Stripe) før I linker til den udefra

## Hvad du ikke skal slå til

- Ingen webhook er påkrævet til v1. Success-URL + session-opslag er gaten.
- Ingen Customer Portal, intet abonnement, intet dashboard-produkt.
- GitHub Pages som rollback har ingen Functions: `/api/agentkvittering`
  404'er, og siden siger det tydeligt. Live skal blive på Cloudflare Pages.

## Filkort

| Sti | Rolle |
|---|---|
| `nis2-gap-assessment.html` | Gratis resultat + dansk CTA + return-håndtering |
| `js/agentkvittering.js` | Snapshot, Payment Link, PDF (kvitteringsudseende) |
| `functions/api/agentkvittering.js` | Pages Function, Stripe-gate |
| `functions/_lib/verify-stripe-session.js` | `payment_status=paid` + beløbstjek |
