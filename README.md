# KI für Macherinnen

Vortrag beim Unternehmerinnen-Netzwerk **visionista** der Wirtschaftsförderung
Herzogtum Lauenburg, am 19. August 2026 bei der AWSH in Elmenhorst/Lanken.

**Live: https://visionista.edge-digital.ai/**

33 Folien, etwa 35 Minuten, mit drei Live-Teilen und drei Zugaben. Keine versteckten Unterfolien.
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
  beidseitig, mit den vier Fragen und sechs fertigen Sätzen

**Nebenakten**
- `schrift-varianten.html` — Entscheidungshilfe zur Headline-Schrift
- `messe.mjs` — misst Wortzahl, Lücken und schlechte Zeilenumbrüche je Folie
- `pruefe-folien.mjs` — sucht abgeschnittenen Inhalt und tote Klicks

## Lokal starten

```bash
npm run serve
```

`npm run build` ist kein Kompilat, sondern eine Bauprüfung: sie liest `index.html`,
sammelt alle lokalen Verweise und meldet fehlende Dateien.

## Gestaltung

Der Vortrag ist **zweifarbig**: Sand `#F1ECE2` und Burgund `#4C102E`.
Abstufungen entstehen über Deckkraft, nicht über weitere Farben. Betonte
Wörter tragen keine eigene Farbe, sondern mehr Gewicht.

Icons kommen von Lucide und liegen als SVG-Sprite direkt in der Datei.
Sie ersetzen keine Aussage, sie geben Listen eine Spalte, an der das Auge
entlangläuft. Alle Schriften liegen lokal in `assets/fonts/`, damit der
Vortrag ohne WLAN läuft.

Titel, Zahlen und Beschriftungen laufen in **Avenir Next LT**, der Hausschrift
von EDGE. Die visionista-Anmutung kommt über Farben, Logo und die gedruckte
Karte. Betonte Wörter stehen nicht mehr kursiv, sondern in Bold.

Zeilenumbrüche in Überschriften sind **von Hand gesetzt**, an Sinngrenzen, und
`text-wrap: balance` ist abgeschaltet. Eine Zeile endet nie auf einem Artikel,
einer Präposition oder einem Hilfsverb. `node messe.mjs` meldet jede Stelle, an
der der Browser trotzdem selbst umbricht, dazu die Wortzahl je Folie und die
größten Lücken.

Die Fotos stammen von Franzi Schädel Fotografie und aus dem Bildarchiv der WFL.
