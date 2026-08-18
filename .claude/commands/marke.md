---
description: Marken-Reveal live erzeugen. Eingabe: Name, Betriebsart, Ort.
---

Erzeuge den Marken-Reveal für die visionista-Präsentation.

Die drei Zurufe aus dem Publikum stehen in: **$ARGUMENTS**
Reihenfolge egal, erkenne selbst was Name, Betriebsart und Ort ist.
Fehlt etwas, erfinde nichts, sondern frage in einem kurzen Satz nach.

## Konsistenz ist der ganze Witz

Die vier Bilder müssen wie EINE Marke aussehen: gleiches Logo, gleiche
Farben, gleiche Schriftanmutung. Deshalb zweistufig, niemals alle vier
auf einmal:

**Stufe 1, das Logo zuerst.** Wähle selbst eine Palette aus genau drei
Farben, die zur Betriebsart passt, und schreibe die Hex-Werte wörtlich
in den Prompt („STRICT palette, use exactly these colours and no
others: …"). Modell `nano_banana_pro`, `resolution: "2k"`,
`aspect_ratio: "1:1"`. Inhalt: ein schlichtes Linien-Emblem passend zur
Betriebsart, Wortmarke in eleganter Serife, Ort in gesperrten Versalien,
flächiger Vektorstil auf Cremeweiß. Deutscher Text, „No watermark."

**Stufe 2, erst wenn das Logo fertig ist.** Die drei Folgebilder
bekommen den Logo-Job als Referenz:
`medias: [{"value": "<logo-job-id>", "role": "image"}]`,
und im Prompt steht „using EXACTLY the logo from the reference image,
reproduced faithfully". Dieselben Hex-Werte wiederholen. Alle drei
parallel abschicken, je `resolution: "2k"`:

1. Markenboard, `16:9` — Referenzlogo oben links, Farbfelder mit den
   Hex-Codes, zwei Schriftmuster, drei kleine Anwendungen mit demselben
   Logo. Deutsche Labels: „Farben", „Schrift", „Anwendung".
2. Instagram-Beitrag, `4:5` — warmes Foto passend zum Betrieb, das Logo
   sichtbar auf einem Objekt (Tasse, Schürze, Tüte). Eine kleine
   handgeschriebene Karte mit einem kurzen deutschen Satz, den DU
   wörtlich vorgibst. KEIN Instagram-Interface, keine Likes, keine
   Caption-Zeile: dort erfindet das Modell kaputtes Englisch.
3. Ladenschild, `3:4` — an einer Fassade, die zum Ort passt, das
   Referenzlogo originalgetreu auf dem Schild, fotorealistisch,
   warmes Licht.

## Warten und abliefern

- Auf Jobs warten mit `jobs_wait`. Wirft es Validierungsfehler
  („expected array, received string"), stattdessen je Job einzeln
  `job_display` mit `id` aufrufen und bei `in_progress` kurz warten.
- Die vier Ergebnisse (rawUrl) nach `assets/live/` laden, exakt als
  `logo.png`, `farben.png`, `post.png`, `schild.png`. Folie 29 schaut
  alle vier Sekunden nach und bedient sich selbst, die Namen müssen
  genau stimmen.
- Prüfen, dass alle vier Dateien da sind, und nur Namen und
  Dateigrößen melden, maximal zwei Zeilen. Auf der Bühne wird
  nicht gelesen.

## Zustellung: lokal oder live

- Läuft die Präsentation LOKAL (`npm run serve`, der Plan für die Bühne):
  Dateien einfach in `assets/live/` legen, fertig. NICHTS committen,
  NICHTS pushen, die .gitignore hält sie absichtlich aus dem Repo.
- Läuft die Präsentation über die LIVE-URL (visionista.edge-digital.ai):
  die vier rawUrls an die GitHub-Action übergeben:
  `gh workflow run marke-live.yml -f logo=<url> -f farben=<url> -f post=<url> -f schild=<url>`
  Die Action lädt und committet sie, Pages deployt. Rechne mit zwei bis
  vier Minuten Deploy plus CDN, das ist der langsamere und wackligere
  Weg. NACH DEM VORTRAG aufräumen: die vier PNGs wieder aus dem Repo
  entfernen, sonst zeigt die öffentliche Seite dauerhaft den Testlauf.

Braucht insgesamt etwa drei Minuten. Schlägt ein Folgebild fehl: die
übrigen trotzdem abliefern und in einem Satz sagen, welches fehlt,
die Folie dimmt leere Felder von selbst.
