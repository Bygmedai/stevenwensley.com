# Cloudflare-migration · stevenwensley.com

**Oprindelig plan:** Vilde, 15. august 2026
**Denne udgave:** Haruki, 16. august 2026 — efter Etape 1–3 er kørt og verificeret
**Status:** Etape 1, 2 og 3 færdige. Sitet ligger på Cloudflare Pages. Etape 4 venter
på syv stabile dage.

Dette dokument erstatter den oprindelige plan. Tre af dens antagelser holdt ikke,
og to gates manglede. Alt herunder er målt, ikke gættet — måledato står ved hvert punkt.

---

## 0 · Hvor vi står

| Etape | Indhold | Status |
|---|---|---|
| 1 | Pages-projekt + preview | **Færdig og verificeret** |
| — | Publiceringsmappe, så kilde og værktøj ikke udgives | **Færdig** (PR #47) |
| — | URL-formen afklaret og landet på live | **Færdig** (PR #49) |
| 2 | Zone til Cloudflare, records identiske | **Færdig** — nul afvigelser |
| 3 | Cutover: sitet til Pages | **Færdig og verificeret 16/8** |
| — | Mail: fra død M365-opsætning til en adresse der virker | **Færdig**, se §3.5 |
| 4 | Hærdning og oprydning | Efter 7 stabile dage — §4 |

**Projekt:** `stevenwensley-com` · account `e91b41e7…0544c2`
**Build command:** `node scripts/build-publish.mjs` · **output:** `_site`
**Live:** `stevenwensley.com` (apex, proxied) · `www` → apex via Single Redirect
**Registrar:** Porkbun. Nameservere: Cloudflare. Registrar er *ikke* flyttet.

---

## 1 · Tre rettelser til den oprindelige plan

### 1.1 «Ingen sider flytter. Ingen redirects nødvendige. Ingen SEO-risiko» — holdt ikke

Cloudflare Pages 308-redirecter `/workshop.html` til `/workshop`, og der er ingen
dokumenteret måde at slå det fra på Pages. Målt på det første preview-deploy: hver
eneste side redirectede.

Omfanget var 45 af 46 sitemap-URL'er, hver sides `canonical` og `og:url`, og 233
interne links på blot 12 sider.

**Løst i PR #49**, og løst *før* cutover frem for efter. Det afgørende var, at GitHub
Pages hele tiden har serveret begge former: 45/45 svarede 200 uden endelse. Så
ændringen kunne landes og bevises på live, mens sitet stadig lå hos GitHub. Verificeret
på live 15/8: 46/46 sider 200, `canonical` og `og:url` uden endelse, sitemap uden
endelse, og de gamle `.html`-adresser svarer stadig 200 — så ingen ekstern henvisning
knækkede.

**Konsekvens for cutover: ingen. URL-formen er allerede den rigtige.**

### 1.2 `_redirects` kan ikke lukke `/src/` — og eksponeringen voksede

`_redirects` på Pages understøtter kun 301, 302, 303, 307 og 308. 404 er eksplicit
ikke understøttet. Den oprindelige plans Etape 1 foreskrev en `_redirects`-fil med
statuskode 404 og listede `/src/… → 404` som det kritiske verifikationspunkt. Det
punkt kunne aldrig opfyldes.

Værre: Cloudflare Pages springer ikke punktum-mapper over. Målt mod live svarede seks
stier 404 på GitHub Pages og 200 på previewet — `/.github/workflows/test.yml`,
`/.github/dependabot.yml`, `/CNAME`, `/.gitignore`, `/.htmlvalidate.json` og `/_v.mjs`.
Cutover ville altså have **øget** eksponeringen, ikke reduceret den.

**Løst i PR #47.** `scripts/build-publish.mjs` samler en publiceringsmappe ud af roden
minus en eksplicit deny-liste. Repo-layoutet er urørt, så GitHub Pages fortsat serverer
fra roden og forbliver rollback. Scriptet fejler builden både hvis en påkrævet fil
mangler og hvis noget forbudt dukker op. `Publish Directory Verify` kører det i CI.

### 1.3 Platformsvalget står — men af en anden grund end den anførte

Planen valgte Pages frem for Workers Static Assets for ikke at tage to migrationer på
én gang. Det argument var rigtigt, men ufuldstændigt: Pages påtvang en tredje migration
— URL-formen — som Workers med `html_handling: "none"` ville have undgået.

Da URL-ændringen nu er landet og bevist på live, er den omkostning betalt. **Pages
forbliver valget**, og de tre øvrige sites i huset kører samme platform.

---

## 2 · Etape 2 — zone til Cloudflare, records identiske

**Formål:** flytte hvem der svarer på DNS-forespørgsler. Intet andet. Sitet bliver
liggende på GitHub Pages, mailen på Microsoft.

### Gate før alt andet: DNSSEC

En nameserver-flytning på et domæne med DNSSEC slået til bryder hele zonen — inklusive
MX — hvis DS-recorden ikke fjernes hos registraren først. Den oprindelige plan nævnte
det ikke.

Målt 15/8 mod `.com`-TLD-serverne direkte og mod to recursive resolvers:

```
a.gtld-servers.net   DS      -> (ingen)
8.8.8.8              DS      -> NoAnswer     DNSKEY -> NoAnswer
1.1.1.1              DS      -> NoAnswer     DNSKEY -> NoAnswer
```

**DNSSEC er ikke slået til. Målingen skal gentages umiddelbart før NS-flippet** — ikke
på baggrund af denne. Slår nogen DNSSEC til hos Porkbun i mellemtiden, ændrer
risikobilledet sig totalt.

**Cloudflare tilbyder DNSSEC under onboarding og igen bagefter. Sig nej i Etape 2 og 3.**
Skal den slås til senere: aktivér i Cloudflare → hent DS → udgiv DS hos Porkbun. Aldrig
omvendt.

### Paritetsliste — ni poster, målt 15/8

| # | Navn | Type | Værdi |
|---|---|---|---|
| 1 | `@` | A ×4 | 185.199.108.153 / .109.153 / .110.153 / .111.153 |
| 2 | `@` | AAAA ×4 | 2606:50c0:8000::153 / 8001 / 8002 / 8003 |
| 3 | `www` | CNAME | stevenwensley-a11y.github.io |
| 4 | `@` | MX (1) | stevenwensley-com.mail.protection.outlook.com |
| 5 | `@` | TXT | `v=spf1 include:spf.protection.outlook.com -all` |
| 6 | `autodiscover` | CNAME | autodiscover.outlook.com |
| 7 | `_sipfederationtls._tcp` | SRV | 100 1 5061 sipfed.online.lync.com |
| 8 | `_sip._tls` | SRV | 100 1 443 sipdir.online.lync.com |
| 9 | `*` | CNAME | uixie.porkbun.com |

Post 4–7 er mail. De rører vi ikke. Ingen CAA-record findes.

### Trin

1. Cloudflare → Add a domain → `stevenwensley.com` → Free plan
2. Lad Cloudflare scanne Porkbun
3. **Gate:** sammenlign record for record mod tabellen ovenfor. Tjek især MX-prioritet **1**,
   SPF-strengen ordret inkl. `-all`, og begge SRV-posters prioritet/vægt/port
4. **Alle proxy-toggles grå (DNS only).** Ingen orange sky i denne etape
5. Nej til DNSSEC
6. Porkbun → skift nameservere til Cloudflares to

### Verifikation

- `dig NS stevenwensley.com` returnerer Cloudflare-nameservere
- `curl -sSI https://stevenwensley.com` viser **stadig** `server: GitHub.com` og **intet** `cf-ray`
- MX returnerer outlook-værdien med prioritet 1
- TXT returnerer SPF ordret

**Mail-verifikationen bortfaldt — og det er selve fundet.** Planen forudsatte en
fungerende Microsoft 365-postkasse og byggede sin største risiko på den. Målt 15/8:
MX-målet `stevenwensley-com.mail.protection.outlook.com` gav **NXDOMAIN** fra fire
uafhængige resolvere, og Microsofts eget realm-opslag svarede `NameSpaceType: Unknown`
— der er ingen tenant. Sitet oplyste allerede en gmail-adresse på 12 sider.

**Der var altså ingen mail at miste.** Risikoen i planen var reel som ræsonnement og
tom som faktum. Se §3.5 for hvad der står i stedet.

**Faktisk gennemført:** zonen oprettet, ti kontrolopslag mod Porkbun, nul afvigelser.
To ting rettet under importen: Cloudflare importerede *alle* poster som proxied (sat
til DNS only, så cutover kun ændrede én ting ad gangen), og Cloudflares scan sprang
`autodiscover` over (lagt ind igen manuelt).

**Rollback:** nameservere tilbage til de fire Porkbun-servere. Porkbun-zonen ligger urørt.

---

## 3 · Etape 3 — cutover

Kører først når Etape 2 har stået stille i 48 timer med mail verificeret.

### Gate: `www` mister sin viderestilling

I dag 301'er `www.stevenwensley.com` til apex. **Det er GitHub Pages der gør det** —
ikke DNS. Cloudflare Pages kanoniserer ikke mellem sine egne custom domains: lægger man
både apex og `www` på projektet, serverer begge hostnavne sitet, og indholdet ligger
duplikeret på to værtsnavne.

Skal besluttes før cutover. To farbare veje:

- **Single Redirect-regel på zonen:** `www.stevenwensley.com/*` → `https://stevenwensley.com/$1`, 301.
  Renest, virker uafhængigt af Pages.
- Eller: læg **kun** apex som custom domain, og lad `www` være et rent redirect-hostnavn.

### Rækkefølge på apex

Den oprindelige plan sagde: tilføj custom domain, slet derefter GitHub-recordene. På et
apex med fire A og fire AAAA giver det et vindue hvor begge sæt ligger der samtidig.
Lad i stedet Cloudflares egen «opdatér DNS-record»-dialog gøre det i ét hug, og
verificér med `dig` umiddelbart efter.

### Trin

1. Pages → Custom domains → tilføj `stevenwensley.com` (og `www`, hvis den valgte
   løsning kræver det)
2. Lad Cloudflare opdatere apex-recordene i samme dialog
3. Orange sky (Proxied) på apex og `www`
4. SSL/TLS → **Full (strict)**
5. Redirect-reglen for `www` ind
6. **Rør ikke GitHub Pages-indstillingerne, og slet ikke `CNAME`-filen.** De er
   rollback i mindst 7 dage

### Verifikation

- `cf-ray` til stede, `server: GitHub.com` væk
- Gyldigt certifikat, ingen browseradvarsel
- `http://` → `https://`
- `www` redirecter til apex
- Alle 46 sider fra sitemap svarer 200
- `_headers` aktive: `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options`
- `/package.json`, `/.github/…`, `/CNAME`, `/_v.mjs`, `/src/…` svarer 404
- `robots.txt` uændret
- `sitemap.xml` nåbar fra Google Search Console og Bing

**Målt efter cutover 16/8:** `server: cloudflare` og `cf-ray` til stede, gyldigt
certifikat, `www` → apex, alle sider fra sitemap 200, kilde og værktøj 404.

En note om måleværktøjet, fordi den koster tid hvis man ikke kender den: sandkassens
TLS-proxy gensignerer certifikater og kan svare med forældede headers — den viste
`server: GitHub.com` længe efter flippet. Verifikationen blev derfor gentaget gennem
en rigtig browser. **Mål aldrig cutover gennem en proxy du ikke selv har set indeni.**

**Rollback (minutter):** A/AAAA og `www` CNAME tilbage til GitHub-værdierne fra
paritetslisten, grå sky.

---

## 3.5 · Mail — hvad der faktisk var der, og hvad der står nu

Målt 15.–16. august, ikke antaget:

| Spørgsmål | Måling |
|---|---|
| Svarede MX-målet? | **NXDOMAIN** fra 1.1.1.1, 8.8.8.8, 9.9.9.9 og Porkbuns egen zone |
| Fandtes der en M365-tenant? | Nej — `getuserrealm.srf` → `NameSpaceType: Unknown` |
| Havde Steven en adresse på domænet? | Nej. Domænet var købt gennem en broker; Porkbun-kontoen var ukendt for ham |
| Hvad stod der på sitet? | En gmail-adresse, på 12 sider |

Konklusionen er ubehagelig og nyttig: **mail på `stevenwensley.com` har aldrig virket.**
De fire «mailposter» i paritetslisten var en tom skal fra en tidligere ejer, og de
pegede alle sammen ingen steder hen.

### Hvad der står nu

Cloudflare Email Routing, gratis, oprettet 16/8:

| Post | Værdi |
|---|---|
| MX ×3 | `route1/2/3.mx.cloudflare.net` (63 / 9 / 22) |
| SPF | `v=spf1 include:_spf.mx.cloudflare.net include:_spf.google.com ~all` |
| DKIM | `cf2024-1._domainkey` |
| DMARC | `_dmarc` → `v=DMARC1; p=none; rua=mailto:…` |
| Regel | `steven@stevenwensley.com` → Stevens Gmail |

Slettet i samme omgang, fordi de var døde og aktivt skadelige: `autodiscover`, M365-MX,
M365-SPF, begge Teams/Lync-SRV — og **wildcarden** `*` → `uixie.porkbun.com`, som lod
`autodiscover`, `_sip._tls` og `_dmarc` besvare *alt* med en parkeringsside. Email
Routing nægtede i øvrigt at oprette sig, indtil den fremmede MX var væk.

**Verificeret end-to-end 16/8:** alle poster resolver ens fra tre resolvere, og en
testmail til `steven@stevenwensley.com` fremgår af Cloudflares Activity Log med
resultatet **Forwarded**.

### Den ene ting adressen ikke kan

Email Routing kan **modtage**, ikke **sende**. Gmails «send mail as» kræver SMTP-
legitimation for en fremmed adresse, og den findes ikke gratis her: Cloudflares Email
Sending kræver Workers Paid. Indtil der er reelt behov svares der fra Gmail som hidtil.
Skal det ændres, er valget en SMTP-relay (fx Brevos gratis niveau) eller en rigtig
postkasse hos en udbyder — en beslutning om penge, ikke om teknik.

`include:_spf.google.com` står allerede i SPF'en, så den dag afsendelse sættes op
gennem Google, er posten på plads.

---

## 4 · Etape 4 — hærdning og oprydning

Efter 7 stabile dage.

**Bot-håndhævelse.** Slå ikke «Block AI Scrapers and Crawlers» til: den blokerer bredt,
og `robots.txt` tillader *med vilje* trænings-crawlere, fordi vi gerne vil citeres af
assistenter. Brug WAF Custom Rules og blokér kun den liste `robots.txt` allerede
erklærer uønsket — `CCBot`, `Bytespider`, `Amazonbot`, `Meta-ExternalAgent`. Muren skal
håndhæve præcis det, seddelen på døren siger.

**Bot Fight Mode skal forblive slukket — og grunden er ikke botsene.** Den sætter en
`__cf_bm`-cookie på proxede zoner. Privatlivspolitikken blev i august gjort sand ved at
fjerne GA4; slår vi Bot Fight Mode til, har vi byttet Googles cookie ud med Cloudflares
og gjort den samme sætning falsk igen, tre uger senere, af en anden grund. Målt på vores
egne to proxede zoner (bygmedai.dk, tkbars.dk): ingen `set-cookie`. Vejen er ren så
længe knappen bliver liggende.

**DNS-hygiejne.**
- ~~DMARC~~ **gjort 16/8** — `p=none`. Mindst 4 uger, læs `rua`-rapporterne, stram
  derefter til `p=quarantine`. Aldrig direkte til `p=reject`
- ~~Slet wildcard-recorden `*` → `uixie.porkbun.com`~~ **gjort 16/8**
- ~~M365 DKIM~~ **bortfaldet** — der er ingen M365-tenant, se §3.5. DKIM leveres nu af
  Cloudflare (`cf2024-1._domainkey`)
- Overvej CAA. Tilføjes den, **skal** Cloudflares udstedere med
- Fjern den forældede URL-videresendelse hos Porkbun; den er uden virkning nu, men
  vildledende for den næste der kigger

**Repo.** Fjern `CNAME`-filen og deaktivér custom domain hos GitHub Pages — først nu.
Overvej `Cache-Control` i `_headers`: HTML kort, `/og/`, `/img/` og PDF'er langt.

**Uden for Cloudflare.** Porkbun-kontoen har ingen 2FA og dens mailadresse optræder i
et kendt læk. Registrar-kontoen kontrollerer både domænet og nu også mailen — den er
det svageste led i hele kæden. Slå 2FA til.

---

## 5 · Hvad der ikke ændrer sig

- **CI-gates.** Alle syv bliver i GitHub Actions. Cloudflare Pages erstatter ikke CI; den
  deployer efter. Bemærk at `test.yml` nu bruger `scripts/serve-static.mjs` i stedet for
  `http-server`, fordi sidstnævnte ikke opløser URL'er som produktion gør
- **Workflow.** Branch → PR → CI → merge. Det eneste nye er preview-linket i PR'en
- **Indhold og struktur.** Ingen sider flytter i cutover. URL-formen er allerede skiftet
  og bevist på live
- **Pris.** Cloudflare Free dækker alt herover

---

## 6 · Rollback

| Etape | Rollback | Tid |
|---|---|---|
| 1 | Slet Pages-projektet | sekunder |
| 2 | NS tilbage til de fire Porkbun-servere | NS-propagering |
| 3 | A/AAAA/CNAME tilbage til GitHub-værdier, grå sky | minutter |
| 4 | Slå den enkelte regel fra | sekunder |

Intet punkt efterlader os et sted hvor rollback kræver at noget genopbygges.

**Én undtagelse, som er værd at kende:** mailen kan ikke rulles tilbage, fordi der ikke
er noget at rulle tilbage *til*. De slettede M365-poster pegede på en tenant der ikke
findes. Rollback af Etape 3 rører kun A/AAAA og `www` — mailposterne bliver stående og
virker uafhængigt af hvor sitet ligger.
