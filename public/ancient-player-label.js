// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {PROFESSIONS} from './ancient-skills.js?v=20261021-skyreach-market-1';
import {holyName} from './ancient-ascension.js?v=20261014-new-professions-1';
const puzzleTitles=[
 ['解密之王','Puzzle King','#ffd36b'],
 ['解密大师','Puzzle Master','#d7e4ef'],
 ['解密高手','Puzzle Expert','#c49aff']
];
export const puzzleTitleName=(rank,english)=>puzzleTitles[rank-1]?.[english?1:0]||'';
export const puzzleTitleColor=title=>title?.worn&&title.expires>Date.now()?puzzleTitles[title.rank-1]?.[2]:undefined;
export function ancientPlayerLabel(player,english=false){
 const job=PROFESSIONS[player.profession],profession=job?(english?job.en:job.name):(english?'Unassigned':'未选择职业');
 const level=Number.isFinite(player.level)?Math.max(1,Math.floor(player.level)):1;
 const title=puzzleTitleColor(player.puzzleTitle)?puzzleTitleName(player.puzzleTitle.rank,english):'';
 return `${title?title+' · ':''}${player.name} · ${english?'Lv.':'等级 '}${level} · ${holyName(profession,english,!!player.holy)}${player.corrupted?(english?' · Corrupted':' · 魔化'):''}`;
}

// The preview and the in-world nameplate use the same canvas artwork.
export function drawPuzzleTitleFrame(ctx,rank){
 const colors=[
  ['#422619','#26162a','#9b561a','#ffe6a0'],
  ['#283848','#17212e','#526c88','#e8f5ff'],
  ['#292034','#1b1525','#67468c','#d8b5ff']
 ][rank-1];
 if(!colors)return;
 const [top,bottom,edge,light]=colors;
 const fill=ctx.createLinearGradient(0,0,0,96);
 fill.addColorStop(0,top);fill.addColorStop(1,bottom);
 const metal=ctx.createLinearGradient(0,0,512,96);
 for(const [at,color] of [[0,edge],[.22,light],[.44,edge],[.55,light],[.77,light],[1,edge]])metal.addColorStop(at,color);
 function outline(inset,cut){
  const left=inset,right=512-inset,top=inset,bottom=96-inset;
  ctx.beginPath();ctx.moveTo(left+cut,top);ctx.lineTo(right-cut,top);
  ctx.lineTo(right,top+cut);ctx.lineTo(right,bottom-cut);ctx.lineTo(right-cut,bottom);
  ctx.lineTo(left+cut,bottom);ctx.lineTo(left,bottom-cut);ctx.lineTo(left,top+cut);ctx.closePath();
 }
 function jewel(x,y,r){
  ctx.beginPath();ctx.moveTo(x,y-r);ctx.lineTo(x+r*.76,y);ctx.lineTo(x,y+r);ctx.lineTo(x-r*.76,y);ctx.closePath();
  ctx.fillStyle=metal;ctx.fill();ctx.strokeStyle=light;ctx.lineWidth=1;ctx.stroke();
 }
 ctx.save();
 outline(4,rank===1?17:12);ctx.fillStyle=fill;ctx.fill();ctx.strokeStyle=metal;ctx.lineWidth=rank===1?4:3;ctx.stroke();
 if(rank<=2){outline(10,10);ctx.lineWidth=1;ctx.stroke();}
 for(const x of [18,494])jewel(x,46,rank===1?11:7);
 if(rank===1){
  for(const side of [-1,1]){
   for(let i=0;i<3;i++){const x=256+side*(20+i*12);jewel(x,13,4-i*.7);}
   ctx.beginPath();ctx.moveTo(256+side*37,80);ctx.quadraticCurveTo(256+side*86,95,256+side*145,78);
   ctx.quadraticCurveTo(256+side*174,69,256+side*186,79);ctx.lineWidth=1.6;ctx.stroke();
  }
  jewel(256,11,8);jewel(256,82,7);
 }else if(rank===2){jewel(256,11,6);jewel(256,83,5);}
 ctx.restore();
}
