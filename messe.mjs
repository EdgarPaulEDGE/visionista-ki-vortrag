/* Misst je Folie: groesste Innenluecke, Wortzahl und automatische
   Umbrueche, die auf Artikel/Praeposition/Hilfsverb enden.
   Navigiert wie pruefe-folien.mjs, weil Reveal inaktive Folien versteckt,
   und wartet auf document.fonts.ready, sonst misst man die Ersatzschrift. */
import puppeteer from "puppeteer";
const BOESE=/^(der|die|das|den|dem|des|ein|eine|einen|einem|einer|eines|und|oder|in|im|an|am|auf|aus|bei|mit|nach|von|vor|zu|zur|zum|für|über|unter|durch|um|ist|sind|hat|haben|wird|werden|kann|können|muss|müssen|soll|sollen|wie|als|dass|es|sich|meine|meinem|seit|nur|noch|sehr|ganz|mehr|schon|auch|beim|ins|aufs|dann|wenn|weil|aber|aus|aller|jede|jeder|diese|dieser|diesem)$/i;
const b=await puppeteer.launch({args:["--no-sandbox"]});
const pg=await b.newPage(); await pg.setViewport({width:1920,height:1080});
await pg.goto("http://localhost:8140/?nofrag&v="+Date.now(),{waitUntil:"networkidle0"});
await pg.evaluate(()=>document.fonts.ready);
const n=await pg.evaluate(()=>Reveal.getHorizontalSlides().length);
const alle=[];
for(let i=0;i<n;i++){
  await pg.evaluate(k=>Reveal.slide(k,0),i);
  await new Promise(r=>setTimeout(r,110));
  alle.push({nr:i+1, ...await pg.evaluate(()=>{
    const s=document.querySelector(".reveal .slides section.present");
    const bu=s.querySelector(".buehne"); if(!bu) return {id:s.dataset.slideId,l:0,w:0,um:[]};
    const k=[...bu.children].filter(x=>x.getBoundingClientRect().height>0)
      .map(x=>({t:x.tagName.toLowerCase()+(x.className?"."+String(x.className).split(" ")[0]:""),
                o:x.getBoundingClientRect().top,u:x.getBoundingClientRect().bottom}));
    let max=0,wo="";
    for(let j=1;j<k.length;j++){const g=k[j].o-k[j-1].u; if(g>max){max=g;wo=k[j-1].t+" → "+k[j].t;}}
    const um=[];
    bu.querySelectorAll("h1,h2,h3,.takeaway,.prompt-gross,.lead,.klein,.zahl-txt,.gesagt,.satz-text").forEach(h=>{
      /* Auch Elemente mit Handumbruch pruefen: sie koennen ZUSAETZLICH
         automatisch umbrechen, und genau das faellt sonst nie auf. */
      const gesetzt=(h.innerHTML.match(/<br/g)||[]).length+1;
      const w=document.createTreeWalker(h,NodeFilter.SHOW_TEXT); const z=new Map(); let t;
      while(t=w.nextNode()){ let j=0;
        t.nodeValue.split(/(\s+)/).forEach(st=>{ if(st.trim()){
          const rg=document.createRange(); rg.setStart(t,j); rg.setEnd(t,j+st.length);
          const bb=rg.getBoundingClientRect();
          if(bb.height>4){const key=Math.round(bb.top/14);
            if(!z.has(key)) z.set(key,[]); z.get(key).push(st);} } j+=st.length; }); }
      if(z.size>gesetzt) um.push([...z.values()].map(x=>x.join(" ")));
    });
    return {id:s.dataset.slideId, l:Math.round(max), wo,
            w:bu.innerText.replace(/\s+/g," ").trim().split(" ").filter(Boolean).length, um};
  })});
}
await b.close();
const loch=alle.filter(x=>x.l>=130).sort((a,b)=>b.l-a.l);
console.log(`LUECKEN ab 130px: ${loch.length}`);
loch.forEach(x=>console.log(`  ${String(x.l).padStart(4)}px  ${String(x.nr).padStart(2)} ${String(x.id).padEnd(20)} ${x.wo}`));
const dick=alle.filter(x=>x.w>=42).sort((a,b)=>b.w-a.w);
console.log(`\nWORTREICH ab 42: ${dick.length}`);
dick.forEach(x=>console.log(`  ${String(x.w).padStart(3)}W  ${String(x.nr).padStart(2)} ${x.id}`));
let schlecht=0;
alle.forEach(x=>x.um.forEach(z=>{
  const enden=z.slice(0,-1).map(l=>l.trim().split(" ").pop().replace(/[.,:;!?„"\]]/g,""));
  const s2=enden.filter(w=>BOESE.test(w));
  if(s2.length){schlecht++; console.log(`\n ⚠ ${x.nr} ${x.id}: Zeile endet auf ${s2.join(", ")}`);
    z.forEach((l,k)=>console.log(`     ${k+1}| ${l}`));}
}));
console.log(`\nSchlechte Umbrueche: ${schlecht}`);
const ges=alle.reduce((s,x)=>s+x.w,0);
console.log(`Gesamt ${ges} Wörter, Schnitt ${Math.round(ges/alle.length)}`);
