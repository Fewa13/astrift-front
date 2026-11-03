// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import type {CommunityModelPart} from './ancient-community-models';
export type ExpansionModel={id:string;kind:string;name:string;en:string;category:string;subcategory:string;size:[number,number,number];tier:2|3;family:string;variant:number};
type Family=[string,string,string,string,string,[number,number,number]];
const families:Family[]=[
 ['displayCounter','分格展示柜台','Partitioned display counter','furniture','display',[2.8,1.5,1.2]],
 ['instrumentCabinet','仪器陈列架','Instrument display rack','furniture','display',[2,2.2,.65]],
 ['guildNoticeboard','公会悬赏告示架','Guild bounty board','furniture','display',[2.4,2.5,.7]],
 ['trophyCabinet','战利品陈列柜','Trophy cabinet','furniture','display',[2.2,2.3,.7]],
 ['potionCart','药剂推车','Potion service trolley','furniture','workshop',[1.4,1.3,.9]],
 ['laboratoryBench','炼金实验台','Alchemy laboratory bench','furniture','workshop',[2.8,1.8,1.2]],
 ['hangingLamp','组合悬吊灯','Suspended lamp assembly','furniture','lighting',[1.8,1.5,1.8]],
 ['cookingStation','组合料理台','Cooking preparation station','furniture','kitchen',[2.8,2,1.2]],
 ['writingBureau','机关秘书书桌','Secretary writing bureau','furniture','tables',[2,1.8,.9]],
 ['aquarium','水景陈列缸','Aquatic display cabinet','furniture','display',[2.2,1.8,.85]],
 ['sewingStation','裁衣与织造工作台','Tailor workstation','furniture','workshop',[2.3,1.6,1.2]],
 ['weaponWorkbench','武具保养工作台','Weapon maintenance bench','furniture','workshop',[2.7,2,1.2]],
 ['astronomerRoom','星象师研究室','Astronomer study','roomSets','study',[9,3.2,8]],
 ['medicalWard','诊疗休息室','Medical treatment room','roomSets','care',[10,2.8,8]],
 ['classroom','讲堂与学习区','Classroom learning area','roomSets','study',[10,2.6,9]],
 ['archiveRoom','档案整理室','Archive sorting room','roomSets','study',[10,2.8,9]],
 ['musicRoom','乐师排练室','Musician rehearsal room','roomSets','leisure',[9,2.8,8]],
 ['teaRoom','品茶会客区','Tea reception room','roomSets','leisure',[9,2.6,8]],
 ['courtyardResidence','庭院连廊宅院','Courtyard residence','homes','courtyards',[22,6,20]],
 ['arcadeShop','廊街商铺','Arcaded street shop','buildings','shops',[18,6,16]],
 ['woodlandRetreat','林间连屋','Woodland retreat','homes','cottages',[20,6,18]],
 ['canalHouse','水岸连廊居所','Canal-side residence','homes','courtyards',[22,6,18]],
 ['craftsmenHall','匠人工坊会馆','Craftsmen workshop hall','buildings','shops',[24,6,20]],
 ['observatory','庭院观星馆','Courtyard observatory','buildings','civic',[22,8,22]],
 ['gardenGateway','庭园门廊组合','Garden gateway assembly','architecture','gardens',[10,4.6,8]],
 ['reservoir','蓄水与灌溉构筑','Reservoir and irrigation works','architecture','water',[12,2.8,10]],
 ['terrace','阶台与露台构筑','Terraced platform','architecture','terraces',[12,3.3,10]],
 ['ruinSanctuary','残垣圣所','Ruined sanctuary','architecture','ruins',[14,5.5,12]],
 ['rootGrove','古树根丛','Ancient root grove','nature','treeSpecies',[11,10,10]],
 ['rockGarden','山石庭景','Sculpted rock garden','rocks','gardens',[11,4.2,9]]
];
const layouts=[['双列','Twin rows'],['错列','Staggered'],['环形','Ring'],['中央','Central'],['转角','Corner'],['双翼','Twin wings'],['纵深','Long hall'],['四角','Four corners'],['围合','Enclosed court'],['错层','Stepped'],['多席','Gathering'],['双庭','Twin courts']];
const houseLayouts=[['单间前廊','Single wing'],['双联长廊','Twin connected wings'],['三联长廊','Triple connected wings'],['U形内庭','U-shaped courtyard'],['前后双厅','Front and rear halls'],['斜角双厅','Offset halls'],['纵深三厅','Three deep halls'],['L形院落','L-shaped court'],['双列庭院','Parallel courtyard'],['连排三厅','Three aligned halls'],['十字院落','Cross-shaped court'],['双庭五厅','Twin courts, five halls']];
export const COMMUNITY_EXPANSION:ExpansionModel[]=families.flatMap(([family,zh,en,category,subcategory,size])=>layouts.map(([suffix,english],variant)=>{if(['homes','buildings'].includes(category))[suffix,english]=houseLayouts[variant];if(category==='roomSets'){const n=3+variant%4,cn=['错列','双列','环形'][variant%3],kind=['Staggered','Twin-row','Ring'][variant%3];suffix=(variant>=8?'屏风 · ':'')+cn+n+'组';english=(variant>=8?'Screened ':'')+kind+' '+n+' stations'}return {id:`kit-x-${family}-${variant+1}`,kind:`x-${family}-${variant+1}`,family,variant,name:`${zh} · ${suffix}`,en:`${en} · ${english}`,category,subcategory,size:[...size] as [number,number,number],tier:variant<8?2:3}}));
const byKind=new Map(COMMUNITY_EXPANSION.map(m=>[m.kind,m]));
export function buildCommunityExpansion(kind:string,existing:(kind:string)=>CommunityModelPart[]):CommunityModelPart[]|null{
 const model=byKind.get(kind);if(!model)return null;const {family:f,variant:v}=model,[W,H,D]=model.size,out:CommunityModelPart[]=[];
 const wood='#78583f',dark='#303e43',metal='#647c80',trim='#c5a56d',stone='#8c9890',cream='#d9d4bc',cloth='#527e7b',leaf='#51795b',glass='#5d9f9b';
 const add=(shape:string,x:number,y:number,z:number,w:number,h:number,d:number,color=wood,ry=0)=>{out.push({shape,x,y,z,w,h,d,color,ry})},box=(x:number,y:number,z:number,w:number,h:number,d:number,color=wood,ry=0)=>add('box',x,y+h/2,z,w,h,d,color,ry),cyl=(x:number,y:number,z:number,r:number,h:number,color=metal)=>add('cylinder',x,y+h/2,z,r*2,h,r*2,color),ball=(x:number,y:number,z:number,r:number,color=cream)=>add('sphere',x,y,z,r*2,r*2,r*2,color),ring=(x:number,y:number,z:number,w:number,h:number,d:number,color=metal,ry=0)=>add('torus',x,y,z,w,h,d,color,ry);
 const append=(id:string,x:number,y:number,z:number,scale=1,ry=0)=>{const c=Math.cos(ry),s=Math.sin(ry);for(const p of existing(id))out.push({...p,x:x+(p.x*c-p.z*s)*scale,y:y+p.y*scale,z:z+(p.x*s+p.z*c)*scale,w:p.w*scale,h:p.h*scale,d:p.d*scale,ry:p.ry+ry})};
 const feet=(w:number,d:number,h:number)=>{for(const x of [-w*.4,w*.4])for(const z of [-d*.36,d*.36]){box(x,0,z,.085,h,.085);box(x,0,z,.12,.06,.12,metal)}};
 const bottle=(x:number,y:number,z:number,scale=1,n=0)=>{cyl(x,y,z,.055*scale,.17*scale,['#759c95','#b69d65','#837ba4'][n%3]);cyl(x,y+.17*scale,z,.027*scale,.07*scale,trim);cyl(x,y+.24*scale,z,.035*scale,.025*scale,wood)};
 const drawer=(x:number,y:number,z:number,w:number,h:number)=>{box(x,y,z,w,h,.05,wood);box(x,y+h*.48,z+.035,w*.2,.025,.035,trim)};
 const decorativePosts=(w:number,d:number,h:number)=>{for(const x of [-w/2,w/2])for(const z of [-d/2,d/2]){box(x,0,z,.18,h,.18,wood);box(x,h-.12,z,.26,.1,.26,trim)}};
 if(model.category==='furniture'){
  const offset=(v%3-1)*.08,levels=2+v%3,count=3+v%4,top=.78+(v%2)*.12;
  if(f==='hangingLamp'){
   const n=3+v%6;box(0,H-.1,0,W*.75,.08,.12,metal);for(let i=0;i<n;i++){const a=i*Math.PI*2/n,r=v===3?0:.35+v*.025,x=Math.cos(a)*r,z=Math.sin(a)*r,y=.1+(i%3)*.16;box(x,y+.3,z,.025,H-y-.4,.025,metal);cyl(x,y,z,.13,.23,cream);ring(x,y+.25,z,.3,.06,.3,trim);add('cone',x,y+.4,z,.4,.22,.4,metal)}if(v>=8)ring(0,H*.6,0,1.6,.08,1.6,trim);return out;
  }
  feet(W*.92,D*.9,top);box(0,top,0,W*.94,.09,D*.92,wood);box(0,.16,0,W*.86,.06,D*.82,dark);
  for(let i=0;i<count;i++)drawer(-W*.42+(i+.5)*W*.84/count,.35,D*.39,W*.8/count,.22);
  if(f==='displayCounter'||f==='trophyCabinet'||f==='instrumentCabinet'||f==='aquarium'){
   const tall=f==='trophyCabinet'||f==='instrumentCabinet',base=tall?.2:top+.09,upper=H-.12;for(const x of [-W*.46,W*.46])for(const z of [-D*.4,D*.4])box(x,base,z,.055,upper-base,.055,trim);box(0,upper,0,W*.96,.06,D*.88,dark);
   if(f==='aquarium'){box(0,base+.08,0,W*.84,.035,D*.75,'#7aa9a1');for(let i=0;i<count;i++){const x=-W*.32+i*W*.64/(count-1);box(x,base+.1,Math.sin(i+v)*D*.23,.035,.18+(i%3)*.07,.035,leaf);add('rock',x,base+.11,Math.cos(i)*D*.2,.15,.14,.12,stone);add('cone',x,base+.32,Math.sin(i)*.1,.14,.08,.07,trim,Math.PI/2)}for(const x of [-W*.44,W*.44])box(x,base,0,.018,upper-base,D*.8,glass);return out}
   for(let j=0;j<levels;j++){const y=base+.12+j*(upper-base-.24)/levels;box(0,y,0,W*.87,.035,D*.8,cream);for(let i=0;i<count;i++){const x=-W*.36+i*W*.72/(count-1),z=(j%2?.16:-.12)*D;if(f==='instrumentCabinet'){cyl(x,y+.04,z,.065,.11,dark);ring(x,y+.22,z,.18,.18,.035,trim);box(x,y+.04,z,.025,.22,.025,metal)}else if(f==='trophyCabinet'){cyl(x,y+.04,z,.07,.06,dark);cyl(x,y+.1,z,.025,.1,trim);add('cone',x,y+.26,z,.17,.15,.17,trim);for(const side of [-1,1])ring(x+side*.08,y+.25,z,.12,.12,.035,trim)}else bottle(x,y+.04,z,1,j+i)}}
  }else if(f==='guildNoticeboard'){
   box(0,top+.15,-D*.25,W*.9,H-top-.3,.1,dark);for(const x of [-W*.46,W*.46])box(x,top,-D*.25,.12,H-top,.16,wood);for(let i=0;i<count+2;i++){const x=-W*.34+(i%3)*W*.33,y=top+.25+Math.floor(i/3)*.43;box(x,y,-D*.18,.35,.32,.015,cream);box(x,y+.25,-D*.155,.025,.025,.025,trim);for(let j=0;j<3;j++)box(x,y+.08+j*.06,-D*.16,.22,.012,.012,metal)}if(v>=8)add('cone',0,H-.07,-D*.25,W*.6,.14,.25,trim);
  }else if(f==='potionCart'){
   for(const x of [-W*.4,W*.4])for(const z of [-D*.4,D*.4])ball(x,.09,z,.09,dark);for(let j=0;j<levels;j++){const y=.25+j*.3;box(0,y,0,W*.8,.035,D*.75,metal);for(let i=0;i<count;i++)bottle(-W*.3+i*W*.6/(count-1),y+.04,(i%2-.5)*D*.3,.65,i)}box(W*.44,.9,0,.06,.3,D*.7,metal);
  }else if(f==='laboratoryBench'){
   for(let i=0;i<count;i++){const x=-W*.35+i*W*.7/(count-1);bottle(x,top+.09,D*.19,1.3,i);box(x,top+.09,-D*.25,.03,.55+(i%2)*.12,.03,metal);ring(x,top+.6,-D*.25,.16,.16,.035,metal)}append('cauldron',W*.28,top+.09,-D*.05,.4);box(-W*.3,top+.09,0,.4,.04,.3,cream);for(let j=0;j<levels;j++)box(0,1.25+j*.16,-D*.39,W*.8,.04,.14,wood);
  }else if(f==='cookingStation'){
   box(-W*.32,top+.09,0,.65,.035,D*.65,'#b49269');for(let i=0;i<count;i++){cyl(W*.14+(i%2)*.35,top+.09,(Math.floor(i/2)-1)*.22,.09,.035,dark)}box(0,H-.22,-D*.3,W*.8,.13,.38,metal);for(let i=0;i<count;i++)cyl(-W*.32+i*W*.64/(count-1),top+.35,-D*.39,.065,.2,metal);
  }else if(f==='writingBureau'){
   for(let j=0;j<levels;j++)box(0,top+.22+j*.23,-D*.3,W*.86,.035,.24,wood);for(let i=0;i<count;i++){box(-W*.32+i*W*.64/(count-1),top+.3,-D*.3,.08,.24+(i%2)*.07,.16,['#6d7f7a','#967b65','#768091'][i%3])}append('books',-.25,top+.09,.12,.45);bottle(W*.3,top+.09,.1,.7);box(0,top+.1,.1,.6,.02,.25,cream);
  }else if(f==='sewingStation'){
   cyl(-W*.25,top+.09,0,.17,.08,dark);box(-W*.25,top+.1,0,.16,.28,.18,metal);box(-W*.08,top+.3,0,.35,.08,.1,metal);for(let i=0;i<count;i++){const x=W*.05+i*.13;ring(x,top+.12,-D*.25,.13,.13,.035,cloth);box(x,top+.09,-D*.25,.03,.2,.03,wood)}box(W*.22,top+.09,.15,W*.25,.025,D*.5,cloth);
  }else if(f==='weaponWorkbench'){
   box(0,top+.12,-D*.37,W*.86,.7,.08,dark);for(let i=0;i<count;i++){const x=-W*.3+i*W*.6/(count-1);box(x,top+.18,-D*.28,.06,.53,.045,metal);box(x,top+.25,-D*.25,.2,.05,.07,trim)}append('anvil',W*.23,top+.1,.08,.45);box(-W*.25,top+.1,0,.55,.025,.3,cream);for(let j=0;j<levels;j++)box(-W*.3+j*.18,top+.14,D*.2,.1,.04,.16,wood);
  }
  if(v>=4&&v<8){box(0,.25,-D*.35,W*.8,.05,.08,trim);for(const x of [-W*.3,W*.3])box(x,.16,-D*.35,.05,.22,.1,metal)}if(v%3===2){box(-W*.48,top,-D*.05,.07,.3,D*.9,trim);box(W*.48,top,-D*.05,.07,.3,D*.9,trim)}if(v>=8)for(const x of [-W*.39,W*.39]){ball(x,H-.08,-D*.4,.06,trim);box(x,top,-D*.4,.04,H-top-.08,.04,trim)}
  // Different top framing and shelf supports are structural, independent of color.
  for(let i=0;i<v%4;i++)box((i-(v%4-1)/2)*W*.22,.19,offset,W*.04,top-.22,D*.65,wood);return out;
 }
 if(model.category==='roomSets'){
  box(0,0,0,W,.035,D,'#635d50');const n=3+v%4,angle=v%3===2?Math.PI*2/n:0;
  const positions=Array.from({length:n},(_,i)=>{if(v%3===2)return {x:Math.sin(i*angle)*W*.3,z:Math.cos(i*angle)*D*.3,ry:i*angle+Math.PI};if(v%3===1)return {x:(i%2?1:-1)*W*.28,z:-D*.3+Math.floor(i/2)*D*.25,ry:i%2?-Math.PI/2:Math.PI/2};return {x:-W*.32+i*W*.64/Math.max(1,n-1),z:(i%2?1:-1)*D*.24,ry:i%2?Math.PI:0}});
  for(const [i,p]of positions.entries()){
   if(f==='medicalWard'){append('singleBed',p.x,.035,p.z,.78,p.ry);append('nightstand',p.x+.68,.035,p.z,.65);bottle(p.x+.68,.5,p.z,.8,i)}
   else if(f==='classroom'){append('writingDesk',p.x,.035,p.z,.7,p.ry);append('diningChair',p.x,.035,p.z+.65,.8,p.ry);append('books',p.x,.65,p.z,.4)}
   else if(f==='archiveRoom'){append('bookcase',p.x,.035,p.z,1,p.ry);append('chest',p.x+.65,.035,p.z,.6)}
   else if(f==='musicRoom'){append(['piano','harp','drums'][i%3],p.x,.035,p.z,.72,p.ry);append('stool',p.x,.035,p.z+.7,.8)}
   else if(f==='teaRoom'){append(i%2?'sofa':'armchair',p.x,.035,p.z,.7,p.ry);append('sideTable',p.x+.7,.035,p.z,.8)}
   else{append('writingDesk',p.x,.035,p.z,.75,p.ry);append('globe',p.x,.7,p.z,.6);append('officeChair',p.x,.035,p.z+.7,.75)}
  }
  if(f==='astronomerRoom'){append('globe',0,.035,0,1.4);ring(0,1.6,0,2.3,2.3,.08,trim);box(0,.035,0,.2,1.5,.2,wood)}else if(f==='teaRoom'){append('roundTable',0,.035,0,1.2);append('tableware',0,1.02,0,.7)}else if(f==='classroom'){box(0,.8,-D*.43,W*.5,1.3,.1,dark);for(let i=0;i<4;i++)box(-W*.17+i*.5,1.3,-D*.36,.3,.03,.02,cream)}else append('roundTable',0,.035,0,.9);
  for(let i=0;i<2+v%3;i++){const x=(i-(1+v%3)/2)*W*.28;append('indoorPlant',x,.035,D*.43,.65)}if(v>=8){append('grandClock',-W*.44,.035,0,.9);append('roomScreen',W*.35,.035,-D*.1,.7,Math.PI/2)}return out;
 }
 if(['homes','buildings'].includes(model.category)){
  // Connected, single-storey modules keep doorways and headroom unambiguous.
  const layouts=[[[0,0]],[[0,0],[-1,0]],[[0,0],[-1,0],[1,0]],[[0,-1],[-1,0],[1,0]],[[0,0],[0,-1]],[[0,0],[1,-1]],[[0,0],[0,-1],[0,1]],[[-1,0],[0,0],[0,-1]],[[-1,-1],[1,-1],[-1,0],[1,0]],[[-1,0],[0,0],[1,0]],[[0,-1],[-1,0],[1,0],[0,1]],[[-1,-1],[1,-1],[-1,0],[1,0],[0,1]]][v];
  const mw=W*.27,md=D*.26,stepX=mw+.5,stepZ=md+.55,wall=3.1,base=.15;
  const room=(x:number,z:number,index:number)=>{
   box(x,0,z,mw,.15,md,stone);const roofY=base+wall+.12;box(x,base+wall,z,mw+.35,.12,md+.35,dark);
   for(const side of [-1,1]){box(x,roofY,z+side*(md/2+.12),mw+.42,.09,.1,trim);box(x+side*(mw/2+.12),roofY,z,.1,.09,md+.42,trim);box(x,.12,z+side*md/2,mw,.13,.18,stone)}
   if(f==='observatory'){cyl(x,roofY,z,1.25,.7,stone);add('cone',x,roofY+1.28,z,2.9,1.2,2.9,dark);ring(x,roofY+.6,z,2.6,.1,2.6,trim)}else if(f==='canalHouse'){for(const side of [-1,1])box(x+side*mw*.46,roofY,z,.08,.55,md*.9,wood);box(x,roofY,z-md*.46,mw*.92,.55,.08,wood)}else{const rh=f==='woodlandRetreat'?1.5:f==='craftsmenHall'?1.25:.95;add('wedge',x,roofY+rh/2,z-md/4,mw+.55,rh,md/2+.12,dark);add('wedge',x,roofY+rh/2,z+md/4,mw+.55,rh,md/2+.12,dark,Math.PI);box(x,roofY+rh,z,mw+.65,.1,.12,trim)}
   const wx=x+mw*.3,wy=base+1.1,wz=z+md/2+.075;box(wx,wy,wz,mw*.22,.85,.035,glass);for(const side of [-1,1]){box(wx+side*mw*.12,wy-.04,wz+.025,.055,.94,.055,wood);box(wx,wy+(side<0?-.04:.85),wz+.025,mw*.25,.055,.055,wood)}box(wx,wy+.4,wz+.04,mw*.23,.04,.04,trim);
   if(f==='arcadeShop'){box(x,base+2.3,z+md*.57,mw*.8,.06,.8,cloth);for(const side of [-1,1])box(x+side*mw*.38,base,z+md*.65,.09,2.4,.09,wood)}
   // All four faces have walk-through openings; no invisible solid doorway panels.
   for(const side of [-1,1]){const len=(mw-1.9)/2;for(const end of [-1,1])box(x+end*(.95+len/2),base,z+side*md/2,len,wall,.12,cream);box(x,base+2.4,z+side*md/2,1.9,.7,.12,cream)}
   for(const side of [-1,1]){const len=(md-1.9)/2;for(const end of [-1,1])box(x+side*mw/2,base,z+end*(.95+len/2),.12,wall,len,cream);box(x+side*mw/2,base+2.4,z,.12,.7,1.9,cream)}
   for(const dx of [-mw/2,mw/2])for(const dz of [-md/2,md/2])box(x+dx,base,z+dz,.16,wall+.12,.16,wood);
   box(x,base+.02,z,mw*.65,.025,md*.5,cloth);
   if(f==='arcadeShop'){append('counter',x-mw*.27,base,z,.6,Math.PI/2);append('openShelf',x+mw*.3,base,z-md*.25,.75);append('crate',x+mw*.28,base,z+md*.25,.6)}
   else if(f==='craftsmenHall'){append(index%2?'loom':'workbench',x-mw*.25,base,z-md*.2,.7);append('anvil',x+mw*.25,base,z+md*.23,.7);append('weaponRack',x+mw*.3,base,z-md*.2,.65)}
   else if(f==='observatory'){append('globe',x-mw*.23,base,z-md*.18,.9);append('writingDesk',x+mw*.25,base,z+md*.25,.65);ring(x,base+wall+.5,z,2.2,.3,2.2,trim);cyl(x,base+wall+.2,z,.1,.5,metal)}
   else{append(index%2?'singleBed':'sofa',x-mw*.26,base,z-md*.3,.5);append('sideTable',x+mw*.28,base,z+md*.22,.7);box(x+mw*.28,base,z-md*.27,.85,1.4,.24,wood);for(let row=0;row<2;row++){box(x+mw*.28,base+.2+row*.5,z-md*.24,.72,.36,.05,dark);for(let book=0;book<4;book++)box(x+mw*.02+.1+book*.16,base+.2+row*.5,z-md*.21,.11,.24+(book%2)*.06,.12,['#6d827b','#9b8064','#797a92'][book%3])}}
   append('flowerVase',x-mw*.3,base,z+md*.28,.5);
  };
  for(const [i,p]of layouts.entries())room(p[0]*stepX,p[1]*stepZ,i);
  // Low connecting terraces bridge each module gap, with no collision across portals.
  for(let i=0;i<layouts.length;i++)for(let j=i+1;j<layouts.length;j++){const [ax,az]=layouts[i],[bx,bz]=layouts[j];if(Math.abs(ax-bx)+Math.abs(az-bz)!==1)continue;box((ax+bx)*stepX/2,0,(az+bz)*stepZ/2,ax!==bx?1.1:2,.15,az!==bz?1.1:2,stone)}
  if(f==='canalHouse'){box(0,0,D*.43,W*.8,.12,1.3,wood);for(let i=0;i<6;i++)box(-W*.35+i*W*.14,0,D*.46,.12,.75,.12,wood)}
  if(f==='woodlandRetreat'){for(const x of [-W*.42,W*.42])append('pine',x,0,D*.33,.35)}
  if(v>=8){for(const x of [-W*.4,W*.4]){append('streetLamp',x,0,D*.39,.8);append('flowerBed',x,0,-D*.4,.55)}box(0,0,D*.34,3,.15,2,stone)}return out;
 }
 if(f==='gardenGateway'){
  const spans=1+v%3,opening=2.2,width=spans*opening;for(let i=0;i<=spans;i++){const x=-width/2+i*opening;box(x,0,0,.28,3.2,.28,stone);box(x,3.1,0,.46,.12,.46,trim);ball(x,3.4,0,.18,cream)}for(let i=0;i<spans;i++){const x=-width/2+(i+.5)*opening;box(x,2.85,0,opening,.18,.34,wood);for(let j=0;j<4;j++)box(x-opening*.37+j*opening*.25,3.1,0,.06,.55,.08,leaf)}for(const z of [-D*.3,D*.3])for(const x of [-W*.32,W*.32]){append('flowerBed',x,0,z,.65);if(v%2)append('parkBench',x,0,z,.7,Math.PI/2)}for(let i=0;i<1+v%4;i++)box(-width*.35+i*width*.7/Math.max(1,v%4),3.5,-.15,.09,.12+.07*(v%4),.3,trim);if(v>=8)append('fountain',0,0,-D*.25,.4);return out;
 }
 if(f==='reservoir'){
  const basins=1+v%4,bw=W*.8/basins;for(let i=0;i<basins;i++){const x=-W*.4+(i+.5)*W*.8/basins,d=D*(.4+(i%2)*.1);box(x,0,0,bw-.12,.12,d,stone);for(const side of [-1,1]){box(x+side*(bw/2-.15),0,0,.16,.65,d,stone);box(x,0,side*d/2,bw,.65,.16,stone)}box(x,.15,0,bw-.4,.025,d-.3,glass);for(let j=0;j<2+v%3;j++)box(x,.73,-d*.3+j*d*.3,bw+.15,.1,.12,wood)}for(let i=0;i<2+v%4;i++){cyl(-W*.4+i*W*.8/(1+v%4),0,-D*.4,.13,1.4,metal);ring(-W*.4+i*W*.8/(1+v%4),1.4,-D*.4,.55,.55,.07,metal)}return out;
 }
 if(f==='terrace'){
  const levels=2+v%4,rise=.4,steps=levels*3;for(let i=0;i<levels;i++){const w=W*(.85-i*.13),d=D*(.8-i*.1);box(0,0,-i*.22,w,(i+1)*rise,d,stone);for(const x of [-w*.48,w*.48])box(x,(i+1)*rise,-d*.3,.18,.6+i*.1,.18,trim)}for(let i=0;i<steps;i++){box(0,0,D*.48-i*.23,2.2,(i+1)*levels*rise/steps,.25,stone);out.at(-1)!.stair=true}for(const x of [-W*.35,W*.35])append(v%2?'indoorPlant':'vase',x,levels*rise,0,.65);for(let i=0;i<1+v%3;i++)box(-W*.25+i*W*.5/Math.max(1,v%3),levels*rise,-D*.23,.35,.15,.35,trim);if(v>=8){box(0,levels*rise,-D*.27,3.5,.12,.6,wood);decorativePosts(3.7,1.5,2.3)}return out;
 }
 if(f==='ruinSanctuary'){
  box(0,0,0,W*.85,.12,D*.85,stone);const n=4+v%5;for(let i=0;i<n;i++){const a=i*Math.PI*2/n,r=W*.32,x=Math.cos(a)*r,z=Math.sin(a)*D*.31,h=1.5+(i+v)%4*.65;cyl(x,.12,z,.25,h,stone);box(x,h+.12,z,.8,.15,.8,trim);if(i%2===v%2)add('rock',x,h+.4,z,.5,.5,.4,stone)}box(0,.12,0,2.5,.35,2,stone);append('altarTable',0,.47,0,.7);for(let i=0;i<2+v%4;i++)add('rock',-W*.3+i*W*.16,.16,D*.32,.9,.3,.6,stone);return out;
 }
 if(f==='rootGrove'){
  const n=2+v%4;for(let i=0;i<n;i++){const a=i*Math.PI*2/n,x=Math.cos(a)*W*.23,z=Math.sin(a)*D*.23,h=H*(.5+(i%3)*.12);cyl(x,0,z,.28,h,wood);for(let j=0;j<5;j++){const t=j*Math.PI*2/5;add('rock',x+Math.cos(t)*.7,.25,z+Math.sin(t)*.7,1.4,.5,.45,wood,t)}for(let j=0;j<3;j++)add('rock',x+Math.sin(i+j)*.7,h-.2+j*.65,z+Math.cos(i-j)*.5,3.4-j*.45,1.3,3.2-j*.3,leaf)}for(let i=0;i<3+v%3;i++)add('rock',-W*.3+i*W*.15,.2,D*.32,.7,.4,.6,stone);return out;
 }
 if(f==='rockGarden'){
  const n=3+v%5;for(let i=0;i<n;i++){const a=i*Math.PI*2/n,r=W*.24,h=.6+(i+v)%5*.48;add('rock',Math.cos(a)*r,h/2,Math.sin(a)*D*.25,1.3,h,.9,stone,a);box(Math.cos(a)*r,0,Math.sin(a)*D*.25,1.6,.12,1.3,dark)}append(v%2?'pine':'willow',0,0,0,v%2?.3:.35);for(let i=0;i<4+v%3;i++){const a=i*Math.PI*2/(4+v%3);ball(Math.sin(a)*W*.4,.12,Math.cos(a)*D*.4,.12,cream)}return out;
 }
 throw Error('Missing expansion model '+kind);
}
