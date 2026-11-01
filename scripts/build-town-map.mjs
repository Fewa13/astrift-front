// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {writeFileSync} from 'node:fs';
import {COMMUNITY_MODELS,cleanCommunityMap,communityBlocked,communityPlayerHeight} from '../public/ancient-community.js';
import {exportCommunityMap} from '../public/ancient-community-transfer.js';
const map={id:0,owner:'template',tier:3,name:'青石小镇',boundary:[{x:-40,z:-40},{x:40,z:-40},{x:40,z:40},{x:-40,z:40}],spawn:{x:0,z:-34},sky:'#a6c9da',skyArt:[],objects:[],spawns:[],revision:1};
function add(kind,x,z,scale=1,rotation=0,color='#b7ad95'){const id='kit-'+kind,m=COMMUNITY_MODELS.find(m=>m.id===id);if(!m)throw Error(id);const [w,h,d]=m.size;map.objects.push({id:'town_'+map.objects.length,model:id,x,y:0,z,w:w*scale,h:h*scale,d:d*scale,rotation,color,solid:true})}
// Facades open toward a broad crossing and pedestrian square. Furnished catalog buildings retain their interiors.
add('fountain',0,0,.8);
add('guildHall',0,28,.8,Math.PI);
add('tavern',-22,22,.85,-Math.PI/2);
add('inn',22,22,.8,Math.PI/2);
add('blacksmith',-23,-3,.8,-Math.PI/2);
add('bakery',23,-3,.8,Math.PI/2);
add('cottage',-24,-25,.85,0);
add('townhouse',23,-25,.75,0);
add('apothecary',-25,10,.65,-Math.PI/2);
add('generalStore',25,10,.65,Math.PI/2);
for(const x of [-7,7])for(const z of [-29,-17,13,23])add('streetLamp',x,z,.8);
for(const x of [-10,10]){add('parkBench',x,-7,1,x<0?-Math.PI/2:Math.PI/2);add('flowerBed',x,6,.85);add('marketStall',x,-18,.85,x<0?-Math.PI/2:Math.PI/2)}
add('well',-10,30,.85);add('cart',30,-13,.8);add('barrel',-30,-13,1);add('crateStack',-29,-9,.65);
for(const [x,z,kind]of [[-35,-32,'oak'],[35,-32,'maple'],[-35,32,'birch'],[35,32,'oak'],[-12,-30,'cherry'],[12,30,'cherry']])add(kind,x,z,.65);
for(const [x,z,w,d]of [[0,-23.5,6,29],[0,23.5,6,29],[-22,0,26,5],[22,0,26,5],[0,0,18,18]])map.objects.push({id:'town_'+map.objects.length,model:'box',x,y:0,z,w,h:.025,d,rotation:0,color:'#92958d',solid:true});
const checked=cleanCommunityMap(map,3,0,'template');writeFileSync('/Users/jingfeng/Documents/Astrift Maps/青石小镇.astrift-map.json',exportCommunityMap(checked)+'\n');console.log('Town map:',checked.objects.length,'models, 80 × 80 m, no monsters.');
