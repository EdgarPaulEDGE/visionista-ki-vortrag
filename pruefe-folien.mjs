/**
 * Misst jede Folie im Browser und meldet, was über den Rand läuft.
 *
 * Reveal schneidet zu hohe Folien kommentarlos ab: kein Fehler, keine
 * Scrollleiste, der Inhalt ist einfach unsichtbar. Eine Einblendung, die
 * unterhalb des Rands liegt, sieht im Vortrag aus wie ein toter Klick.
 *
 * Wichtig, und genau daran ist eine frühere Fassung dieser Prüfung
 * gescheitert: Bei vertikalen Stapeln muss AUCH das Eltern-Section
 * sichtbar gemacht werden. Sonst misst man in einem display:none-Baum
 * und bekommt lauter Nullen zurück, also ein grünes Ergebnis für eine
 * Folie, die in Wahrheit überläuft.
 *
 * Aufruf: node pruefe-folien.mjs [http://localhost:8140]
 */
import puppeteer from "puppeteer";

const adresse = process.argv[2] || "http://localhost:8140";
const HOEHE = 1080;

const browser = await puppeteer.launch();
const seite = await browser.newPage();
await seite.setViewport({ width: 1600, height: 900 });
await seite.goto(`${adresse}/?nofrag`, { waitUntil: "networkidle0" });
await seite.evaluate(() => document.fonts.ready);
await new Promise((r) => setTimeout(r, 1500));

const ergebnis = await seite.evaluate((HOEHE) => {
  const ueberlauf = [];
  const leer = [];

  document.querySelectorAll(".reveal .slides section").forEach((s) => {
    if (s.querySelector("section")) return; // Eltern eines Stapels überspringen

    const eltern = s.parentElement.tagName === "SECTION" ? s.parentElement : null;
    const merk = [];
    [eltern, s].filter(Boolean).forEach((el) => {
      merk.push([el, el.style.display, el.style.visibility, el.style.opacity]);
      el.style.display = "block";
      el.style.visibility = "visible";
      el.style.opacity = "1";
    });

    const buehne = s.querySelector(".buehne");
    const id = s.dataset.slideId || "(ohne Kennung)";

    if (buehne) {
      const ueber = buehne.scrollHeight - HOEHE;
      if (ueber > 2) ueberlauf.push({ id, ueber });

      // Einblendungen, die ganz oder teilweise unter dem Rand liegen
      const bt = buehne.getBoundingClientRect();
      const zoom = bt.height / HOEHE;
      s.querySelectorAll(".fragment").forEach((f) => {
        const r = f.getBoundingClientRect();
        const oben = (r.top - bt.top) / zoom;
        if (oben > HOEHE - 20) {
          leer.push({
            id,
            oben: Math.round(oben),
            text: (f.textContent || "").trim().replace(/\s+/g, " ").slice(0, 50),
          });
        }
      });
    }

    merk.forEach(([el, d, v, o]) => {
      el.style.display = d;
      el.style.visibility = v;
      el.style.opacity = o;
    });
  });

  return { ueberlauf, leer, folien: document.querySelectorAll(".reveal .slides section:not(:has(section))").length };
}, HOEHE);

await browser.close();

console.log(`Geprüft: ${ergebnis.folien} Folien`);

if (ergebnis.leer.length) {
  console.error("\nEINBLENDUNGEN UNTERHALB DES RANDS (wirken wie ein toter Klick):");
  ergebnis.leer.forEach((f) =>
    console.error(`  ${f.id}: beginnt bei ${f.oben}px  "${f.text}"`)
  );
}
if (ergebnis.ueberlauf.length) {
  console.error("\nFOLIEN MIT ÜBERLAUF:");
  ergebnis.ueberlauf.forEach((f) => console.error(`  ${f.id}: ${f.ueber}px zu hoch`));
}
if (ergebnis.leer.length || ergebnis.ueberlauf.length) process.exit(1);

console.log("Keine Folie läuft über, keine Einblendung liegt im Nichts.");
