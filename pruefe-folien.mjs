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

// Anteil der tatsächlich bezeichneten Fläche je Zeichnung. Die PNGs haben
// viel transparenten Rand, ihr Bildkasten sagt also nichts darüber aus,
// wo wirklich Striche liegen.
const STRICHFLAECHE = {
  abend: { l: 0.171, r: 0.828, o: 0.236, u: 0.762 },
  brief: { l: 0.259, r: 0.740, o: 0.238, u: 0.761 },
  dialog: { l: 0.171, r: 0.828, o: 0.246, u: 0.752 },
  handy: { l: 0.361, r: 0.658, o: 0.154, u: 0.845 },
  kalender: { l: 0.309, r: 0.690, o: 0.319, u: 0.680 },
  schloss: { l: 0.329, r: 0.768, o: 0.242, u: 0.750 },
  zettel: { l: 0.216, r: 0.782, o: 0.246, u: 0.752 },
};

const ergebnis = await seite.evaluate((HOEHE, STRICHFLAECHE) => {
  const ueberlauf = [];
  const leer = [];
  const kollision = [];

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
      const bt = buehne.getBoundingClientRect();
      const zoom = bt.height / HOEHE;

      // Jedes sichtbare Element prüfen, nicht nur die direkten Kinder:
      // eine Fußzeile, die zwei Pixel unter den Rand rutscht, wird sonst
      // vom scrollHeight der Bühne verschluckt. Der obere Rand zählt
      // genauso, dort schneidet Reveal ebenfalls ab.
      let schlimmster = null;
      buehne.querySelectorAll("*").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.height < 1) return;
        const oben = (r.top - bt.top) / zoom;
        const unten = (r.bottom - bt.top) / zoom;
        const raus = Math.max(unten - HOEHE, -oben);
        if (raus > 0.5 && (!schlimmster || raus > schlimmster.raus)) {
          schlimmster = {
            id,
            raus: Math.round(raus),
            wo: oben < 0 ? "oben" : "unten",
            text: (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 46),
          };
        }
      });
      if (schlimmster) ueberlauf.push(schlimmster);

      // Einblendungen, die ganz oder teilweise unter dem Rand liegen
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

      // Liegt eine Zeichnung auf echtem Text? Gemessen wird die Strichfläche
      // gegen die Zeilenkästen der Textknoten. Elementkästen taugen dafür
      // nicht: ein kurzer Absatz belegt die volle Spaltenbreite und meldet
      // dann Kollisionen, die man gar nicht sieht.
      const illu = s.querySelector(".illu.frei");
      if (illu) {
        const name = (illu.getAttribute("src").match(/illu\/(\w+)\.png/) || [])[1];
        const k = STRICHFLAECHE[name];
        if (k) {
          const b = illu.getBoundingClientRect();
          const ir = {
            left: b.left + b.width * k.l, right: b.left + b.width * k.r,
            top: b.top + b.height * k.o, bottom: b.top + b.height * k.u,
          };
          const lauf = document.createTreeWalker(buehne, NodeFilter.SHOW_TEXT);
          let n;
          while ((n = lauf.nextNode())) {
            if (!n.textContent.trim()) continue;
            const rg = document.createRange();
            rg.selectNodeContents(n);
            for (const r of rg.getClientRects()) {
              if (r.width < 2 || r.height < 2) continue;
              const x = Math.max(0, Math.min(ir.right, r.right) - Math.max(ir.left, r.left));
              const y = Math.max(0, Math.min(ir.bottom, r.bottom) - Math.max(ir.top, r.top));
              if (x > 3 && y > 3) {
                kollision.push({
                  id, zeichnung: name,
                  text: n.textContent.trim().replace(/\s+/g, " ").slice(0, 40),
                });
              }
            }
          }
        }
      }
    }

    merk.forEach(([el, d, v, o]) => {
      el.style.display = d;
      el.style.visibility = v;
      el.style.opacity = o;
    });
  });

  return { ueberlauf, leer, kollision,
           folien: document.querySelectorAll(".reveal .slides section:not(:has(section))").length };
}, HOEHE, STRICHFLAECHE);

await browser.close();

console.log(`Geprüft: ${ergebnis.folien} Folien`);

if (ergebnis.leer.length) {
  console.error("\nEINBLENDUNGEN UNTERHALB DES RANDS (wirken wie ein toter Klick):");
  ergebnis.leer.forEach((f) =>
    console.error(`  ${f.id}: beginnt bei ${f.oben}px  "${f.text}"`)
  );
}
if (ergebnis.ueberlauf.length) {
  console.error("\nINHALT AUSSERHALB DER FOLIE (wird kommentarlos abgeschnitten):");
  ergebnis.ueberlauf.forEach((f) =>
    console.error(`  ${f.id}: ${f.raus}px über den ${f.wo}en Rand  "${f.text}"`)
  );
}
if (ergebnis.kollision.length) {
  console.error("\nZEICHNUNG LIEGT AUF TEXT:");
  const gesehen = new Set();
  ergebnis.kollision.forEach((f) => {
    const schluessel = f.id + f.text;
    if (gesehen.has(schluessel)) return;
    gesehen.add(schluessel);
    console.error(`  ${f.id}: ${f.zeichnung} über "${f.text}"`);
  });
}
if (ergebnis.leer.length || ergebnis.ueberlauf.length || ergebnis.kollision.length) process.exit(1);

console.log("Sauber: kein Überlauf, keine tote Einblendung, keine Zeichnung auf Text.");
