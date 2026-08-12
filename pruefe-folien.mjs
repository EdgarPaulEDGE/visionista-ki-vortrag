/**
 * Misst jede Folie im Browser und meldet, was über den Rand läuft.
 *
 * Reveal schneidet zu hohe Folien kommentarlos ab: kein Fehler, keine
 * Scrollleiste, der Inhalt ist einfach unsichtbar. Eine Einblendung, die
 * unterhalb des Rands liegt, sieht im Vortrag aus wie ein toter Klick.
 *
 * Drei Fallen, an denen frühere Fassungen dieser Prüfung gescheitert sind:
 *
 * 1. NICHT display:block erzwingen, um an eine versteckte Folie zu kommen.
 *    Reveal positioniert die aktive Folie anders als eine, die man von Hand
 *    sichtbar schaltet. Auf der Schlussfolie ergab dasselbe Element einmal
 *    +13,7px und einmal -62,1px: einmal grün, einmal oben abgeschnitten.
 *    Deshalb navigiert diese Prüfung zu jeder Folie und misst sie dort.
 *
 * 2. Genau in Foliengröße messen (1920x1080). Bei abweichender
 *    Fenstergröße brechen Zeilen anders um.
 *
 * 3. Beide Ränder prüfen, und jedes Element, nicht nur direkte Kinder.
 *    Eine Fußzeile, die zwei Pixel rausrutscht, verschwindet sonst im
 *    scrollHeight der Bühne.
 *
 * Aufruf: node pruefe-folien.mjs [http://localhost:8140]
 */
import puppeteer from "puppeteer";

const adresse = process.argv[2] || "http://localhost:8140";
const HOEHE = 1080;

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

const browser = await puppeteer.launch();
const seite = await browser.newPage();
await seite.setViewport({ width: 1920, height: 1080 });
await seite.goto(`${adresse}/?nofrag`, { waitUntil: "networkidle0" });
await seite.evaluate(() => document.fonts.ready);
await new Promise((r) => setTimeout(r, 1800));

const wegpunkte = await seite.evaluate(() => {
  const liste = [];
  document.querySelectorAll(".reveal .slides > section").forEach((s, h) => {
    const unter = s.querySelectorAll("section");
    if (unter.length) unter.forEach((_, v) => liste.push([h, v]));
    else liste.push([h, 0]);
  });
  return liste;
});

const ueberlauf = [];
const leer = [];
const kollision = [];

for (const [h, v] of wegpunkte) {
  await seite.evaluate((h, v) => Reveal.slide(h, v), h, v);
  await new Promise((r) => setTimeout(r, 240));

  const fund = await seite.evaluate(
    (HOEHE, STRICHFLAECHE) => {
      const s =
        document.querySelector("section.present section.present") ||
        document.querySelector("section.present");
      const buehne = s && s.querySelector(".buehne");
      if (!buehne) return null;

      const id = s.dataset.slideId || "(ohne Kennung)";
      const bt = buehne.getBoundingClientRect();
      const zoom = bt.height / HOEHE;
      const ergebnis = { id, raus: null, tot: [], deckung: [] };

      buehne.querySelectorAll("*").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.height < 1) return;
        const o = (r.top - bt.top) / zoom;
        const u = (r.bottom - bt.top) / zoom;
        const raus = Math.max(u - HOEHE, -o);
        if (raus > 0.5 && (!ergebnis.raus || raus > ergebnis.raus.px)) {
          ergebnis.raus = {
            px: Math.round(raus),
            wo: o < 0 ? "oben" : "unten",
            text: (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 46),
          };
        }
      });

      s.querySelectorAll(".fragment").forEach((f) => {
        const r = f.getBoundingClientRect();
        if ((r.top - bt.top) / zoom > HOEHE - 20) {
          ergebnis.tot.push((f.textContent || "").trim().replace(/\s+/g, " ").slice(0, 50));
        }
      });

      // Liegt eine Zeichnung auf echtem Text? Strichfläche gegen die
      // Zeilenkästen der Textknoten. Elementkästen taugen nicht: ein kurzer
      // Absatz spannt die volle Spalte und meldet unsichtbare Kollisionen.
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
                ergebnis.deckung.push({
                  zeichnung: name,
                  text: n.textContent.trim().replace(/\s+/g, " ").slice(0, 40),
                });
              }
            }
          }
        }
      }
      return ergebnis;
    },
    HOEHE,
    STRICHFLAECHE
  );

  if (!fund) continue;
  if (fund.raus) ueberlauf.push({ id: fund.id, ...fund.raus });
  fund.tot.forEach((t) => leer.push({ id: fund.id, text: t }));
  fund.deckung.forEach((d) => kollision.push({ id: fund.id, ...d }));
}

await browser.close();

console.log(`Geprüft: ${wegpunkte.length} Folien`);

if (leer.length) {
  console.error("\nEINBLENDUNGEN UNTERHALB DES RANDS (wirken wie ein toter Klick):");
  leer.forEach((f) => console.error(`  ${f.id}: "${f.text}"`));
}
if (ueberlauf.length) {
  console.error("\nINHALT AUSSERHALB DER FOLIE (wird kommentarlos abgeschnitten):");
  ueberlauf.forEach((f) =>
    console.error(`  ${f.id}: ${f.px}px über den ${f.wo}en Rand  "${f.text}"`)
  );
}
if (kollision.length) {
  console.error("\nZEICHNUNG LIEGT AUF TEXT:");
  const gesehen = new Set();
  kollision.forEach((f) => {
    const schluessel = f.id + f.text;
    if (gesehen.has(schluessel)) return;
    gesehen.add(schluessel);
    console.error(`  ${f.id}: ${f.zeichnung} über "${f.text}"`);
  });
}
if (leer.length || ueberlauf.length || kollision.length) process.exit(1);

console.log("Sauber: kein Überlauf, keine tote Einblendung, keine Zeichnung auf Text.");
