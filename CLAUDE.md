# stevenwensley.com — CLAUDE.md

> Orientering for `Bygmedai/stevenwensley.com`. Læs den først, hver session.

```yaml
meta:
  repo: Bygmedai/stevenwensley.com
  sprog: dansk
  ændring_kræver: [Stevens godkendelse]
  version: v1 (2026-11-15)
```

## 1. Hvad sitet er

Stevens eget site: rådgiver for ledelsen om AI, magt og ansvar. Her bor analyserne, oplæggene og figurerne. Data og metode bor på bygmedai.dk i AI-overblikket (`Bygmedai/bygmedai-11ty`); dette site genbruger udgivne tal derfra og udgiver ingen selv.

Sitet er Stevens stemme. Tekst, tone og billeder er hans afgørelse. Du ejer koden omkring dem.

## 2. Tal, der er lånt

Et tal på dette site, som kommer fra AI-overblikket, er en afskrift. Tre regler:

- **Tallet peger på sin udgivelse.** `src/_data/eksempel.json` har `udgivelse` (id), `udgivelseUrl`, `poster` (oplysningernes id'er) og `rettelserKontrolleret` (de rettelser, figuren er holdt op imod). Hver udgivelse kan hentes uændret på bygmedai.dk, og hver oplysning har sit eget anker på kommunesiden.
- **Rettes en oplysning i AI-overblikket, skal figuren her kontrolleres.** `docs/udgivelser/genbrug.json` i `bygmedai-11ty` fører listen over genbrugssteder, og en prøve dér fejler, indtil stedet er kontrolleret og ført ajour. Det er to repoer og to PR'er: ret her, og før listen ajour dér.
- **Intet tal uden kilde, og ingen opdigtede tal.** Et budgetkrav kaldes et budgetkrav, ikke en målt effekt.

## 3. Sådan arbejder du

```yaml
gren:        vilde/<emne> eller vilde/byg-<nummer>-<emne>; PR mod main
omfang:      én PR, ét formål
øverst:      «Sådan ser du det»: hvor ændringen kan ses, og hvad Steven skal klikke på
synligt:     billede af før og efter, på telefon og på skærm
pr_tekst:    hvad der er bygget, hvad der er prøvet, og hvad der ikke er
aldrig:      du godkender og fletter ikke selv. En fletning til main er en offentliggørelse.
```

Kræver Stevens ja i PR'en: tekst og billeder på siderne, nye afhængigheder, workflows, `src/_headers`, `src/_redirects`, CNAME og sletning af sider.

## 4. Kommandoer

```bash
npm ci
node scripts/build-publish.mjs        # byg til _site/ og kontrollér nøglefilerne
node --test tests/*.unit.mjs          # enhedsprøver på bygget
npx playwright test                   # røgprøver i browser
```

CI (`.github/workflows/test.yml`) kører de samme tre. `_site/` udgives af Cloudflare Pages.

Én ting fletter uden Steven: `dependabot-auto-merge.yml` godkender og fletter visse Dependabot-PR'er, når CI er grøn. Det er hans beslutning, ikke en præcedens for dig.

## 5. Stak og faste regler

```yaml
generator:  Eleventy + Nunjucks, src/ → _site/
design:     «Nordisk lys», blå accent (#1d4ed8); kun dansk
skrift:     Inter, selvhostet (src/assets/fonts/)
scripts:    ingen scripts og ingen serverfunktioner i siderne; menuen virker uden JavaScript
billeder:   AI-illustrationer mærkes «Illustration lavet med AI». Steven vises kun på rigtige fotos.
adresser:   alle gamle adresser viderestilles i src/_redirects; slet ingen uden Stevens ja
kontakt:    én mailadresse på hele sitet, den samme som på bygmedai.dk
links:      et link til bygmedai.dk går til AI-overblikket eller fabrikken og siger, hvad læseren finder dér
```

Reglerne har prøver i `tests/`. README.md har det korte overblik; koden på `main` viser den faktiske adfærd.
