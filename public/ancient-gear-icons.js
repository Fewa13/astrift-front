// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
// Static vector illustrations: no textures, animation, WebGL or network requests.
import {gearDefinition} from './ancient-gear.js?v=20261021-skyreach-market-1';
const blades={
 stoneRough:'M29 45 26 18 32 9 38 22 35 45Z',stoneSharp:'M29 45 29 17 32 5 36 18 35 45Z',ironClub:'M28 44 25 18 27 10 37 10 39 18 36 44Z',ironBroken:'M28 44 28 23 32 27 35 20 38 25 36 44Z',
 ironSharp:'M29 44 28 17 32 4 36 17 35 44Z',purifyBroken:'M27 44 28 24 32 18 36 25 34 29 37 33 36 44Z',fangBlade:'M27 44 25 29 29 31 26 22 30 24 30 11 36 6 40 24 36 44Z',frostKnife:'M29 44 26 26 32 14 38 26 35 44Z',windBlade:'M28 44 Q22 24 39 8 Q33 28 37 43Z',
 purifyHoly:'M28 44 27 20 32 4 37 20 36 44Z',emberBlade:'M27 44 23 29 29 31 25 20 32 5 38 18 35 25 41 30 36 44Z',rootBlade:'M28 44 25 21 29 25 26 12 32 5 38 12 35 25 39 21 36 44Z',stormKnife:'M29 44 25 30 32 13 39 27 34 25 36 44Z',
 emperor:'M26 44 27 18 32 3 37 18 38 44Z',thunderVerdict:'M27 44 24 32 29 34 26 20 34 4 32 22 39 20 35 44Z',duskFang:'M28 44 Q19 26 35 5 Q30 21 41 26 L35 44Z',
 starRuin:'M26 44 24 19 29 22 32 3 35 22 40 19 38 44Z',abyssJudge:'M25 44 24 21 28 25 26 12 32 4 38 12 36 25 40 21 39 44Z',dawnGod:'M28 44 Q21 20 32 4 Q43 20 36 44Z',
 genesis:'M25 44 23 20 28 23 26 11 32 2 38 11 36 23 41 20 39 44Z',eclipse:'M27 44 Q15 19 35 3 Q29 18 42 23 Q31 30 36 44Z'
};
const helmets=['M17 42V27Q17 10 32 10Q47 10 47 27V42L39 47V32H25V47Z','M14 43V25L22 13 32 8 42 13 50 25V43L38 48V30H26V48Z','M13 43 15 23 10 15 23 18 32 7 41 18 54 15 49 23 51 43 39 49 38 30H26L25 49Z','M12 43 15 23 13 9 25 18 32 4 39 18 51 9 49 23 52 43 39 49 38 29H26L25 49Z','M12 43 13 24 5 9 20 18 23 6 32 15 41 6 44 18 59 9 51 24 52 43 39 51 38 29H26L25 51Z','M10 44 13 24 5 5 23 18 27 2 32 11 37 2 41 18 59 5 51 24 54 44 39 53 37 28H27L25 53Z'];
const armor=['M22 13 27 18H37L42 13 50 23 44 31 43 53H21L20 31 14 23Z','M21 12 27 18H37L43 12 55 22 47 34 44 54H20L17 34 9 22Z','M18 10 27 18H37L46 10 56 20 51 32 46 29 44 55H20L18 29 13 32 8 20Z','M17 7 27 18H37L47 7 58 21 50 36 46 30 43 55H21L18 30 14 36 6 21Z','M16 5 25 17 32 10 39 17 48 5 59 20 53 36 46 30 43 56H21L18 30 11 36 5 20Z','M13 3 25 17 32 7 39 17 51 3 60 20 53 39 45 31 43 57H21L19 31 11 39 4 20Z'];
const colors=['#c6bca0','#91cae0','#bc9df6','#f1ca68','#68e6e4','#ffdfa3','#8ebeff','#e9a0ff'];
export function gearIconMarkup(key,slot='weapon'){
 const d=gearDefinition(key),q=Math.max(1,d?.quality||1),s=d?.slot||slot,c=colors[q-1];let art='';
 if(s==='weapon'){const base=blades[key]||blades[key.includes('root')?'rootBlade':key.includes('crystal')?'emperor':key.includes('hollow_4')?'emperor':'fangBlade'];art=`<path d="${base}"/><path d="M21 44H43L40 48H24Z"/><path d="M29 48H35V59H29Z"/><path d="M27 60H37"/>`;}
 else if(s==='helmet')art=`<path d="${helmets[Math.min(q,6)-1]}"/><path d="M21 25 29 27M35 27 43 25M32 13V39" fill="none"/>`;
 else if(s==='armor')art=`<path d="${armor[Math.min(q,6)-1]}"/><path d="M23 28 32 33 41 28M22 40 32 45 42 40M32 20V51" fill="none"/>`;
 else {for(const side of [-1,1])for(let i=0;i<q+3;i++){const x=32+side*(8+i*3),top=12+i*2;art+=`<path d="M32 35Q${x} ${top} ${32+side*(25-i)} ${7+i*5}L${32+side*(21-i*2)} ${37+i*3}Q${x} 49 32 44Z"/>`;}art+='<path d="M32 23 37 35 32 49 27 35Z"/>';}
 // Each theme has a different crest and external silhouette additions.
 const theme=d?.set||(key.includes('hollow')?'hollow':key.includes('forge_')?'forge':'');
 if(d?.set==='thunder')art+='<path d="M49 5 43 17 49 16 44 28M15 5 21 17 15 16 20 28" fill="none"/>';
 else if(d?.set==='frost')art+='<path d="M6 17 11 8 16 17 11 26Z M48 17 53 8 58 17 53 26Z"/>';
 else if(d?.set==='blood')art+='<path d="M10 10Q0 30 11 28Q20 26 10 10Z M54 10Q44 30 55 28Q64 26 54 10Z"/>';
 else if(d?.set==='beast')art+='<path d="M8 29 4 7 15 20M56 29 60 7 49 20"/>';
 else if(d?.set==='arcane')art+='<circle cx="32" cy="31" r="26" fill="none" stroke-dasharray="4 3"/>';
 else if(theme)art+='<path d="M10 35 5 30 10 25 15 30Z M54 35 49 30 54 25 59 30Z"/>';
 if(q===7)art+='<circle cx="32" cy="28" r="25" fill="none"/><path d="M32 1 36 8 32 15 28 8Z M3 30H13 M51 30H61"/>';if(q===8)art+='<path d="M32 1 59 16V46L32 62 5 46V16Z" fill="none"/><path d="M32 2 37 12 32 22 27 12Z M2 32 10 26 18 32 10 38Z M46 32 54 26 62 32 54 38Z"/>';let h=0;for(const ch of key||s)h=(h*31+ch.charCodeAt(0))>>>0;
 for(let i=0;i<6;i++)if(h&(1<<i))art+=`<path d="M${25+i*2} ${35-i%2*3}l2 -3 2 3 -2 3Z"/>`;
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" aria-hidden="true" focusable="false"><g fill="${c}33" stroke="${c}" stroke-width="1.3" stroke-linejoin="round" stroke-linecap="round">${art}</g></svg>`;
}
export function appendGearIcon(parent,key,slot){const n=document.createElement('span');n.className='ancientGearIcon';n.innerHTML=gearIconMarkup(key,slot);parent.append(n);return n;}
