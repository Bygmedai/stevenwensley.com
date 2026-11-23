<!--
PR-formatet i BygmedAI-estaten. Fælles form, rullet ud efter Sirius' afgørelser 22/11 2026
(kanon: Bygmedai/bygmedai-11ty CLAUDE.md §7 og dets pull_request_template.md).
Én PR, ét formål, til at gennemgå på en halv time.
Fem afsnit, alle med. Et tomt afsnit er en påstand: «Ikke prøvet» tomt betyder, at alt er prøvet.
-->

## Sådan ser du det

<!-- Preview-adressen, som byggetjenesten skriver som kommentar i PR'en, og hvad Steven skal klikke
på, trin for trin. Ændrer du noget synligt: billede af før og efter, på telefon og på skærm, vedhæftet
her — nye reviewbilleder lægges ikke på main. Er der intet at se, så sig det, og sig, hvor resultatet
står i stedet (fx et CI-job). -->

## Hvad er bygget

**Ordre:** BYG-<nr>
<!-- ^ Linear-sagen, denne PR leverer på, som BYG-<nr>. Leverer PR'en på et GitHub-issue i stedet,
skriv «Closes #<nr>». Har ordren intet nummer, så SKRIV DET — «ingen sag, ordren kom som <hvor>» —
og slet ikke linjen. En PR uden en af de tre er ikke klar til gennemgang.
Kravet findes, fordi Linear-brættet ellers lyver om, hvad der bliver bygget: 32 % af de menneskeskabte
PR'er i ugen op til 23/11 2026 havde ingen sagsreference nogen af stederne. -->

<!-- Zone: rammer ændringen noget, der kræver Stevens udtrykkelige ja, før den flettes? Det gælder
kontrolporte (workflows og de scripts og prøver, en port kører), fælles layout og fælles skabeloner,
pakkefiler og afhængigheder, deploy, CNAME og DNS, migrationer og databaseskema, hemmeligheder og
miljøvariabler, og sletning af sider eller viderestillinger.
Gennemgang: én uafhængig gennemgang, ved Sirius, Haruki eller Steven; Steven fletter. En godkendelse
til fletning er ikke en gennemgang. Små, lokale tekst- og visningsrettelser kontrollerer Steven selv
på previewet; CI, deploy, sikkerhed, fælles skabeloner, migrationer og offentlig datalogik får en
faglig gennemgang af diffen.
Derefter: hvad der er bygget, i hvilke filer, og hvad PR'en udtrykkeligt ikke gør. -->

## Prøvet

<!-- «Prøvet» betyder, at du har set det. Kommandoer og tal. Skriv forudsigelsen som en liste før
kørslen, og noter ethvert delta. Har du ændret en prøve, så sig, om du har set den fejle. Sig, hvis
browseren eller værktøjet afviger fra CI's. En prøve, der springer over det, den skal prøve, er ikke
en prøve — vis det med én modprøve. -->

## Ikke prøvet

<!-- Det, du ikke har set. -->

## Tilbagerulning

<!-- Hvordan ændringen rulles tilbage, og hvad der ikke følger med (fx en indstilling uden for repoet,
eller en migration der ikke kan vendes). -->
