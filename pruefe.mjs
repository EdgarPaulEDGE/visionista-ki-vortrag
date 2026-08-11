/**
 * Bauprüfung: liest index.html, sammelt alle lokalen Verweise (src/href)
 * und meldet, welche Dateien fehlen. Kein Kompilat.
 * Der globale Commit-Hook ruft "npm run build", deshalb muss dieses Skript existieren.
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const wurzel = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(resolve(wurzel, "index.html"), "utf8");

// src="..." und href="..." einsammeln, ohne externe URLs und Anker
const verweise = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
  .map((m) => m[1])
  .filter((v) => !/^(https?:|data:|mailto:|#|\/\/)/.test(v))
  .map((v) => v.split("?")[0])
  .filter((v, i, a) => a.indexOf(v) === i);

// url(...) aus dem eingebetteten CSS, vor allem die Schriften
const cssVerweise = [...html.matchAll(/url\('([^']+)'\)/g)]
  .map((m) => m[1])
  .filter((v) => !/^(https?:|data:)/.test(v))
  .filter((v, i, a) => a.indexOf(v) === i);

const alle = [...new Set([...verweise, ...cssVerweise])];
const fehlend = alle.filter((v) => !existsSync(resolve(wurzel, v)));

console.log(`Geprüft: ${alle.length} lokale Verweise`);
if (fehlend.length) {
  console.error("\nFEHLENDE DATEIEN:");
  fehlend.forEach((f) => console.error("  " + f));
  process.exit(1);
}
console.log("Alle verlinkten Dateien vorhanden.");
