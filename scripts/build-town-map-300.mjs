// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {writeFileSync,mkdirSync} from 'node:fs';
import {COMMUNITY_MODELS,cleanCommunityMap,setCommunityMap,communityPlayerHeight,communityBlocked} from '../public/ancient-community.js';
import {communityModelBounds} from '../public/ancient-community-models.js';
import {applyBluestoneStory} from './bluestone-town-story.mjs';
import {exportCommunityMap} from '../public/ancient-community-transfer.js';
const out='/Users/jingfeng/Documents/Astrift Maps';mkdirSync(out,{recursive:true});
const map={id:0,owner:'template',tier:3,name:'青石小镇',boundary:[{x:-150,z:-150},{x:150,z:-150},{x:150,z:150},{x:-150,z:150}],spawn:{x:0,z:-126},sky:'#a6c9da',skyArt:[],objects:[],spawns:[],npcs:[],revision:1,code:''};
const buildings=[],paved=[];const all=new Map(COMMUNITY_MODELS.map(m=>[m.id,m]));
function add(kind,x,z,scale=1,rotation=0,color='#b7ad95'){const model='kit-'+kind,m=all.get(model);if(!m)throw Error(model);const [w,h,d]=m.size,o={id:'town_'+map.objects.length,model,x,y:0,z,w:w*scale,h:h*scale,d:d*scale,rotation,color,solid:true};map.objects.push(o);if(['homes','buildings'].includes(m.category))buildings.push(o);return o}
function box(x,z,w,d,color='#94988e'){const o={id:'town_'+map.objects.length,model:'box',x,y:0,z,w,h:.025,d,rotation:0,color,solid:true};map.objects.push(o);paved.push(o)}
function facing(x,z){const choices=[...[-72,0,72].map(r=>({distance:Math.abs(x-r),rotation:x<r?-Math.PI/2:Math.PI/2})),...[-72,0,72].map(r=>({distance:Math.abs(z-r),rotation:z<r?0:Math.PI}))];return choices.sort((a,b)=>a.distance-b.distance)[0].rotation}
// Non-overlapping paving cells keep crossings and the market square free of z-fighting.
const cuts=[-144,-110,-76,-68,-18,-6,6,18,68,76,110,144],inRoad=n=>Math.abs(n)<6||Math.abs(Math.abs(n)-72)<4;
for(let i=0;i<cuts.length-1;i++)for(let j=0;j<cuts.length-1;j++){const x=(cuts[i]+cuts[i+1])/2,z=(cuts[j]+cuts[j+1])/2,plaza=Math.abs(x)<18&&Math.abs(z)<18;if(inRoad(x)||inRoad(z)||plaza)box(x,z,cuts[i+1]-cuts[i],cuts[j+1]-cuts[j],plaza?'#b0a795':'#92998f')}
// Eight residential blocks, with distinct houses and open yards rather than a repeated facade.
const homes=['cottage','townhouse','farmhouse','logCabin','terraceHouse','villa','cottage','townhouse'];let index=0;
for(const bx of [-112,-38,38,112])for(const bz of [-112,-38,38,112]){if((Math.abs(bx)===112&&Math.abs(bz)===112)||(Math.abs(bx)===38&&Math.abs(bz)===38))continue;for(const dx of [-14,14])for(const dz of [-18,0,18]){const x=bx+dx,z=bz+dz;add(homes[index++%homes.length],x,z,.9,facing(x,z));add('indoorPlant',x+6.8,z+5,.8)}add('well',bx,bz,.7);add('parkBench',bx,bz-5,1);add('cherry',bx,bz+8,.65)}
const shops=[['tavern',-52,52],['inn',-24,52],['apothecary',-52,24],['generalStore',-24,24],['guildHall',38,49],['chapel',24,23],['libraryHall',52,24],['bakery',-52,-52],['blacksmith',-24,-52],['generalStore',-52,-24],['apothecary',-24,-24],['bathhouse',49,-51],['inn',24,-51],['tavern',25,-24],['warehouse',52,-24]];
for(const [kind,x,z]of shops)add(kind,x,z,.9,facing(x,z));
// Corner districts: archive garden, manor quarter, farmstead and working yard.
for(const [kind,x,z,scale,r]of [['libraryHall',-124,120,1,Math.PI],['chapel',-97,111,.9,0],['manor',112,116,1,Math.PI],['villa',95,92,.9,0],['gardenVilla',130,92,.7,0],['farmhouse',-126,-124,1,0],['stable',-98,-123,1,0],['windmill',-125,-96,.9,0],['greenhouse',-98,-97,.9,0],['warehouse',113,-125,1,Math.PI],['blacksmith',95,-97,1,Math.PI/2],['watermill',128,-97,.9,0]])add(kind,x,z,scale,r);
for(const z of [-140,140])add('gatehouse',0,z,1,z>0?Math.PI:0);
for(const x of [-140,140])for(const z of [-140,140])add('watchtower',x,z,.7);
// Walls leave the central gateways open.
for(const side of [-1,1]){for(let n=-132;n<=132;n+=12){if(Math.abs(n)>12)add('cityWall',n,side*145,1);add('cityWall',side*145,n,1,Math.PI/2)}}
add('fountain',0,0,1.2);
for(const x of [-12,12])for(const z of [-12,-4,4,12])add('marketStall',x,z,.9,x<0?-Math.PI/2:Math.PI/2);
for(const x of [-5.5,5.5])for(const z of [-14,14])add('parkBench',x,z,1,z>0?Math.PI:0);
for(const x of [-15,15])for(const z of [-17,17])add('flowerBed',x,z,.8);
for(const z of [-116,-92,-52,-28,28,52,92,116])for(const x of [-8.5,8.5])add('streetLamp',x,z,1);
for(const x of [-116,-92,-52,-28,28,52,92,116])for(const z of [-8.5,8.5])add('streetLamp',x,z,1);
for(const x of [-72,72])for(const z of [-126,-98,-48,-22,22,48,98,126])add('streetLamp',x+6,z,.85);
for(const z of [-72,72])for(const x of [-126,-98,-48,-22,22,48,98,126])add('streetLamp',x,z-6,.85);
// A green belt and small pocket gardens break up the street grid.
for(let n=-126;n<=126;n+=21)for(const side of [-1,1]){if(Math.abs(n)<12)continue;add(n%2?'oak':'maple',n,side*133,.65);add(n%2?'birch':'ginkgo',side*133,n,.65)}
for(const [x,z]of [[-60,10],[60,10],[-60,-10],[60,-10],[-10,60],[10,60],[-10,-60],[10,-60],[-86,12],[86,12]]){add('cherry',x,z,.7);add('flowerBed',x,z+4,.9);add('parkBench',x+4,z,1,Math.PI/2)}
for(const [x,z]of [[-60,60],[-60,-60],[60,-60],[122,-111],[-91,-113],[-118,104],[127,107]]){add('barrel',x,z,1);add('crateStack',x+2.5,z,.7);add('cart',x,z+3.5,.9)}
for(const [x,z]of [[-117,-111],[-110,-111],[-117,-105],[-110,-105]])add('flowerBed',x,z,1.2);
function npc(id,name,x,z,words,reply=['再会。','See you.'],trade=null){const lines=[{npc:words,player:reply,take:[],give:[]}];if(trade)lines.push({npc:trade.text,player:['交换。','Trade.'],take:trade.take,give:trade.give});map.npcs.push({id:'npc_'+id,name,x,y:0,z,rotation:facing(x,z),lines})}
npc('warden',['守门人·罗恩','Ronn · Gatekeeper'],8,-123,['穿过这条石路就是集市。左边能闻到面包香，往北能听见喷泉声。','Follow the stone street to the market. Fresh bread to the west, fountains to the north.'],['我去逛逛。','I will look around.']);
npc('clerk',['镇务官·艾拉','Ayla · Town clerk'],-8,-30,['欢迎。和我说句话，就送你一枚访客徽章。每个街区第一次到访还有小镇铜币。','Welcome. Have a word with me for a visitor badge. Your first visit to each district also earns town coins.'],['谢谢，我会慢慢逛。','Thank you. I will take my time.']);
npc('baker',['面包师·米洛','Milo · Baker'],-9,-12,['今早第一炉刚出炉，街口都能闻到麦香。','The first batch is fresh from the oven. You can smell it down the street.'],['让我看看。','Let me see.'],{text:['两枚铜币，换一个面包？','A loaf for two coins?'],take:[{item:'towncoin',quantity:2}],give:[{item:'bread',quantity:1}]});
npc('herbalist',['草药商·塞拉','Sera · Herbalist'],9,-4,['花圃里的香草晒好后，会送去南边的炼金店。','We dry the garden herbs for the apothecary to the south.'],['你这里卖什么？','What do you sell?'],{text:['三枚铜币一束，只在小镇内流通。','Three coins for a bundle. These goods stay in town.'],take:[{item:'towncoin',quantity:3}],give:[{item:'herbs',quantity:1}]});
npc('post',['绘图员·诺雅','Noya · Illustrator'],-9,4,['我画了小镇的喷泉和风车，想留一张作纪念吗？','I sketched our fountain and windmill. Would you like a keepsake?'],['我看看。','Show me.'],{text:['一枚铜币换一张明信片。','One coin for a postcard.'],take:[{item:'towncoin',quantity:1}],give:[{item:'postcard',quantity:1}]});
npc('fruit',['摊主·阿洛','Arlo · Stallkeeper'],9,12,['听说风车今天转得特别快，农庄那边可热闹了。','The windmill is busy today. There is plenty going on at the farm.']);
npc('smith',['铁匠·布兰','Bran · Smith'],-8,-52,['炉火要稳，锤子要准。铺子里的工作台和武器架，现在都有各自的位置。','Steady fire, steady hammer. Every bench and weapon rack has its place in the workshop.']);
npc('inn',['旅店老板·芬恩','Finn · Innkeeper'],-8,52,['楼上的窗正对街道，清晨会被运货的马车叫醒。','Our upstairs windows face the street. Delivery wagons are the morning alarm.']);
npc('guild',['公会接待·莉亚','Lia · Guild receptionist'],8,49,['这里是镇民歇脚的小镇，不必急着打怪。想走哪条街，就走哪条街。','This is a town for taking a breath. No rush to fight. Pick a street and explore.']);
npc('reader',['学者·伊文','Iven · Scholar'],-72,108,['北边的阅览室有满墙的书。最好的位置留在窗边。','The northern reading room has shelves of books. The best seat is by the window.']);
npc('gardener',['园丁·罗莎','Rosa · Gardener'],72,110,['我喜欢花园刚浇完水的气味。你看那些树，颜色各不相同。','I love the scent after watering. Every tree brings a different color.']);
npc('farmer',['农夫·托比','Toby · Farmer'],-72,-108,['面包房等着我们的面粉。先磨麦子，再去广场喝杯茶。','The bakery is waiting for our flour. Grain first, tea in the square later.']);
npc('miller',['磨坊主·奥文','Owen · Miller'],-108,-72,['有风就磨面，没风就修叶片，日子总有事做。','On windy days we mill. On calm days we mend the sails. Always something to do.']);
npc('porter',['搬运工·库克','Cooke · Porter'],108,-72,['仓库在南边。别把货箱堵在路中央，来往的车可不少。','The warehouse is south. Keep crates off the street; wagons need room.']);
npc('artisan',['工匠·梅芙','Maeve · Artisan'],72,-105,['东南工坊修车、打铁、整理货物，你能听到一整天的敲击声。','The southeast yard repairs wagons and works iron. You can hear hammers all day.']);
npc('watch',['巡街守卫·凯恩','Kane · Town guard'],0,110,['北城门在前面，城墙上能望见整片屋顶。','The north gate is ahead. From the walls, you can see a sea of rooftops.']);
npc('neighbor',['镇民·艾米','Emmy · Resident'],-72,32,['每到傍晚，大家就搬椅子出来聊天。小镇的消息比马车跑得快。','Every evening, neighbors bring out chairs. News travels faster than wagons here.']);
npc('musician',['乐手·卢卡','Luca · Musician'],72,-32,['酒馆没开场前，我会在广场找灵感。喷泉也有自己的节奏。','Before tavern hours, I find inspiration in the square. Even the fountain has a rhythm.']);
npc('tea',['茶客·伊娜','Ina · Tea lover'],-32,72,['先找一把椅子坐坐吧，不是每段旅程都要赶路。','Find a chair and take a breath. Not every journey needs a hurry.']);
npc('courier',['信使·佩尔','Pell · Courier'],32,-72,['今天的信送遍了整座小镇。最难找的不是房子，是在串门的人。','I have delivered letters across town. Houses are easy to find; visiting neighbors are not.']);
applyBluestoneStory(map);
setCommunityMap(map);for(const n of map.npcs)n.y=communityPlayerHeight('community:0',n.x,n.z,0,.5);
const checked=cleanCommunityMap(map,3,0,'template');
for(const b of buildings){const bounds=communityModelBounds(b.model,b.w,b.h,b.d,b.rotation);if(Math.max(Math.abs(b.x+bounds.minX),Math.abs(b.x+bounds.maxX),Math.abs(b.z+bounds.minZ),Math.abs(b.z+bounds.maxZ))>150)throw Error('Building extends outside boundary: '+b.id)}
writeFileSync(out+'/青石小镇-新版Code.txt',checked.code+'\n');
writeFileSync(out+'/青石小镇-300x300.astrift-map.json',exportCommunityMap(checked)+'\n');
console.log(`Town: 300×300 m, ${buildings.length} buildings, ${checked.objects.length} models, ${checked.npcs.length} bilingual NPCs, local trades and exploration code, no monsters.`);
