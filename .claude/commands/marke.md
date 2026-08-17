---
description: Marken-Reveal live erzeugen. Eingabe: Name, Betriebsart, Ort.
---

Erzeuge den Marken-Reveal für die visionista-Präsentation.

Die drei Zurufe aus dem Publikum stehen in: **$ARGUMENTS**
Reihenfolge ist egal, erkenne selbst was Name, Betriebsart und Ort ist.
Fehlt etwas, erfinde nichts, sondern frage in einem kurzen Satz nach.

Feuere alle vier Bilder in EINEM `generate_image_batch`-Aufruf mit
`nano_banana_pro`, sonst dauert es viermal so lange:

1. Logo, `aspect_ratio: "1:1"` — warme, handgemachte Marke: schlichtes
   Linien-Zeichen passend zur Betriebsart, dazu der Schriftzug in einer
   eleganten Serifenschrift, darunter der Ort in gesperrten Versalien.
   Zwei gedeckte Farben plus ein Akzent, flächiger Vektorstil auf Cremeweiß.
2. Markenboard, `16:9` — Logo oben links, fünf Farbfelder mit Hex-Codes,
   zwei Schriftmuster, drei kleine Anwendungen. Beschriftung auf Deutsch:
   „Farben", „Schrift", „Anwendung".
3. Instagram-Beitrag, `4:5` — warmes, echtes Foto passend zum Betrieb,
   dazu eine kleine handgeschriebene Karte mit einem kurzen deutschen Satz.
4. Ladenschild, `3:4` — an einer Fassade, die zum Ort passt,
   fotorealistisch, warmes Licht.

Alle Prompts auf Englisch schreiben, aber **jeder sichtbare Text im Bild
auf Deutsch**. Am Ende jedes Prompts: „No watermark."

Danach:
- Mit `jobs_wait` auf alle vier warten.
- Die vier Ergebnisse nach `assets/live/` herunterladen, exakt als
  `logo.png`, `farben.png`, `post.png`, `schild.png`.
  Der Ordner ist der Briefkasten, aus dem sich Folie 29 alle vier
  Sekunden selbst bedient. Dateinamen müssen genau stimmen.
- Prüfen, dass alle vier Dateien angekommen sind, und **nur die Namen
  und Dateigrößen** melden, in maximal zwei Zeilen. Auf der Bühne wird
  nicht gelesen, sondern hingeschaut.

Wenn ein Bild fehlschlägt: die übrigen trotzdem ablegen und in einem
kurzen Satz sagen, welches fehlt. Die Folie zeigt die fehlenden Felder
dezent gedimmt, das ist eingeplant und fällt nicht auf.
