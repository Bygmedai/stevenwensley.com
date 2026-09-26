# NIS2-kvitteringen — sådan tændes den

Koden er færdig og ligger på sitet. Indtil de to værdier herunder står i
Cloudflare, er købsknappen **usynlig**, og NIS2-siden ser ud præcis som før.
Der er intet at slå fra, hvis du vil vente.

Tre steder, i denne rækkefølge. Start i Stripes **testtilstand** og gentag i
live, når testen er gået igennem.

## 1. Stripe — produkt og betalingslink

1. **Produkter → Tilføj produkt.** Navn: *NIS2 board receipt*. Engangspris:
   **1.497,00 DKK**.
2. **Betalingslinks → Nyt** → vælg produktet.
   - *Efter betaling* → **Omdiriger kunden til dit websted**:

     ```
     https://stevenwensley.com/nis2-gap-assessment?session_id={CHECKOUT_SESSION_ID}
     ```

     `{CHECKOUT_SESSION_ID}` skrives præcis sådan — Stripe udfylder det.
   - Slå **Indsaml kundens navn** til (valgfrit, men så står navnet på
     kvitteringen; ellers kun e-mail).
3. Kopiér linket (`https://buy.stripe.com/…`).

## 2. Stripe — en nøgle der kun kan det nødvendige

**Udviklere → API-nøgler → Opret begrænset nøgle.** Navn:
*stevenwensley-receipt*. Giv kun:

| Ressource         | Adgang |
|-------------------|--------|
| Checkout Sessions | Læs    |
| PaymentIntents    | Skriv  |

Alt andet: Ingen. Kopiér nøglen (`rk_…`). **Send den aldrig til nogen** —
heller ikke til en agent. Den skal kun sættes ind i Cloudflare.

## 3. Cloudflare — to værdier

**Workers & Pages → stevenwensley-com → Settings → Variables and Secrets**,
under *Production* (og *Preview* med testnøglen, hvis du vil teste på en
preview):

| Navn                   | Værdi                    | Type       |
|------------------------|--------------------------|------------|
| `STRIPE_SECRET_KEY`    | nøglen fra trin 2        | **Secret** |
| `RECEIPT_PAYMENT_LINK` | linket fra trin 1        | Text       |

Så **Deployments → seneste → Retry deployment**, så værdierne træder i kraft.

## Tjek at det virker

1. Tag testen på `/nis2-gap-assessment`. Under resultatet står nu
   *The board receipt* med købsknappen.
2. Betal (i testtilstand med kortet `4242 4242 4242 4242`, en fremtidig dato,
   en vilkårlig CVC).
3. Du lander på siden igen med dine svar; tryk *Download your receipt*.
4. Slå kvitteringsnummeret op på `/verify-receipt`.

## Hvis du vil ændre prisen

Ret prisen i Stripe og sæt `RECEIPT_AMOUNT` i Cloudflare til beløbet i øre
(fx `199500` for 1.995 kr). Serveren afviser betalinger, der ikke har præcis
det beløb — så et gammelt link til en anden pris kan aldrig udløse en kvittering.

## Moms

Beløbet er det kunden betaler, alt inklusive. Om 1.497 kr er med eller uden
moms, og om Stripe skal lægge moms på, afhænger af din momsregistrering — det
er et spørgsmål til revisor, ikke til koden.
