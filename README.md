# KI für Macherinnen

Vortrag beim Unternehmerinnen-Netzwerk **visionista** der Wirtschaftsförderung
Herzogtum Lauenburg, am 19. August 2026 bei der AWSH in Elmenhorst/Lanken.

**Live: https://visionista.edge-digital.ai/**

32 Folien, etwa 35 Minuten, mit drei Live-Teilen und drei Zugaben.
Referenten: Edgar Paul-Ghazaryan und Emre Erdogan, EDGE Digital.

## Bedienung

| Taste | Wirkung |
|---|---|
| Pfeil rechts / links | Blättern |
| **Pfeil nach unten** | Rückfall-Folie (auf den Prompt-Folien 15, 18, 20, 21 und 30) |
| **S** | Redneransicht mit allen Notizen und Uhr |
| **F** | Vollbild |
| **O** | Übersicht über alle Folien |

`?nofrag` an die Adresse hängen zeigt alle Einblendungen sofort.

## Dateien

**Für den Vortrag**
- `index.html` — die Präsentation, eine Datei, läuft ohne Internet
- `visionista-ki-vortrag.pdf` — der Notnagel, falls vor Ort nichts anderes läuft
- `REGIE.md` — Zeitplan mit Marken, Rollenverteilung, Checkliste, Streichliste
- `FRAGEN.md` — die absehbaren Publikumsfragen mit kurzen Antworten

**Für die Teilnehmerinnen**
- `nachlesen.html` — [alles zum Nachlesen](https://visionista.edge-digital.ai/nachlesen.html),
  mobil lesbar. Der QR-Code auf Karte und Schlussfolie führt hierher, nicht auf
  die Folien: eine 16:9-Präsentation ist auf einem Handy unlesbar.
- `karte.html` und `karte-zum-mitnehmen.pdf` — Karte zum Mitnehmen, A5 quer,
  beidseitig, mit den vier Fragen und fünf fertigen Sätzen

**Nebenakten**
- `schrift-varianten.html` — Entscheidungshilfe zur Headline-Schrift

## Lokal starten

```bash
npm run serve
```

`npm run build` ist kein Kompilat, sondern eine Bauprüfung: sie liest `index.html`,
sammelt alle lokalen Verweise und meldet fehlende Dateien.

## Gestaltung

Die Farben und Schriften kommen von der visionista-Website: Sand `#F1ECE2`,
Burgund `#4C102E`, Bodoni Moda für Titel, Montserrat für Fließtext. Beide
Schriften liegen lokal in `assets/fonts/`, damit der Vortrag ohne WLAN läuft.

Bei Bodoni Moda ist die Achse für die optische Größe fest auf 11 gestellt
(`font-optical-sizing: none`). Ohne das dreht der Browser bei großen Schriftgraden
automatisch auf 96 hoch, und dann verschwinden die feinen Haarstriche auf einem
Beamer bei Tageslicht.

Die Fotos stammen von Franzi Schädel Fotografie und aus dem Bildarchiv der WFL.
