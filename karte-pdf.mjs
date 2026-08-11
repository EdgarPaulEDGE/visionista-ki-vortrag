/**
 * Druckt karte.html als A4-PDF. Zwei Seiten: Vorder- und Rückseite der A5-Karte.
 * Nutzt das Puppeteer, das mit decktape mitkommt.
 */
import puppeteer from 'puppeteer';
const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.goto('http://localhost:8140/karte.html', {waitUntil:'networkidle0'});
await page.evaluate(() => document.fonts.ready);
await new Promise(r => setTimeout(r, 1200));
await page.pdf({path:'karte-zum-mitnehmen.pdf', width:'210mm', height:'148mm', printBackground:true,
                margin:{top:0,right:0,bottom:0,left:0}});
await browser.close();
console.log('karte-zum-mitnehmen.pdf erzeugt');
