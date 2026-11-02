// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {communityId,communityHeight,communityBlocked,communityClear} from './ancient-community.js';
import {passageInside,leisureSolid,tribePassageLineClear} from './ancient-leisure.js';
import {SKYREACH_KINDS,skyreachHeight,skyreachSurface,skyreachBlocked,skyreachLineClear,skyreachMonsterDamage} from './ancient-skyreach.js';
import {FROSTCOURT_KINDS,frostcourtHeight,frostcourtSurface,frostcourtBlocked,frostcourtLineClear,frostcourtMonsterDamage} from './ancient-frostcourt.js';
import {STARFALL_KINDS,starfallHeight,starfallSurface,starfallBlocked,starfallLineClear,starfallMonsterDamage} from './ancient-starfall.js';
import {BESTIARY,bestiaryDamage} from './ancient-bestiary.js';
import {SANCTUM_KINDS,sanctumHeight,sanctumSurface,sanctumBlocked,sanctumLineClear,sanctumMonsterDamage} from './ancient-sanctum.js';
import {BLIGHT_KINDS,blightHeight,blightSurface,blightBlocked,blightLineClear,blightMonsterDamage} from './ancient-blight.js';
import {isDungeonMap,dungeonBlocked,dungeonLineClear} from './ancient-dungeon.js';
import {ancientMobDamage} from './ancient-mob-stats.js';
import {ancientBossDamage} from './ancient-boss-stats.js';
import {CITY_KINDS,cityBlocked,cityLineClear,cityMonsterDamage,cityHeight,citySurface} from './ancient-city.js';
import {forestBlocked,forestLineClear,forestMonsterDamage,FOREST_KINDS,forestHeight,forestSurface} from './ancient-forest.js';
import {ensureAncientGear,ancientBaseHealth} from './ancient-gear.js';
export {forestHeight,FOREST_TREES,FOREST_ALTARS,FOREST_KINDS,forestBlocked,forestInside} from './ancient-forest.js';
export {CITY_KINDS,cityHeight,citySurface} from './ancient-city.js';
export const ANCIENT_KINDS={...SKYREACH_KINDS,...FROSTCOURT_KINDS,...STARFALL_KINDS,...BESTIARY,...FOREST_KINDS,...CITY_KINDS,...BLIGHT_KINDS,...SANCTUM_KINDS};
export const TRIBE_LAYOUT=2;
export const TRIBE_LENGTH=600;
// Keep the spawn safe zone unchanged; shorten travel between intact landmarks.
export function tribeCompactZ(z:number){return z<=30?z:z<=200?30+(z-30)*120/170:z<=500?150+(z-200)*2/3:350+(z-500)*.5}
export function ancientMapHeight(map:string,x:number,z:number,feet?:number){return communityId(map)?communityHeight(map,x,z,feet):map==='skyreach'?skyreachSurface(x,z):map==='frostcourt'?frostcourtSurface(x,z):map==='starfall'?starfallSurface(x,z):map==='sanctum'?sanctumSurface(x,z):map==='blight'?blightSurface(x,z,feet):isDungeonMap(map)?0:map==='city'?(feet===undefined?cityHeight(x,z):citySurface(x,z,feet)):map==='forest'?forestSurface(x,z):feet===undefined?tribeAltarHeight(x,z):Math.max(tribeAltarHeight(x,z),tribeSurface(x,z,feet))}
export function tribeAltarHeight(x:number,z:number){let height=0;for(const [old,radius]of [[440,12],[945,21]])for(let i=0;i<3;i++)if(Math.hypot(x,z-tribeCompactZ(old))<=radius-i)height=Math.max(height,.2+i*.05);return height}
export type AncientWeapon={id:string;gun:string;quality:number;level:number;stars:number};
export type AncientProfile={tower?:import('./ancient-tower').TowerProgress;jadeEquipped?:Partial<Record<import('./ancient-jade-wear').JadeSlot,string>>;collections?:import('./ancient-collections').JadeCollectible[];branches?:Record<string,string>;branchGuides?:Record<string,boolean>;relic?:string;relics?:string[];relicChangedAt?:number;huntClears?:Record<string,number>;fishing?:Record<string,{count:number;bestKg:number}>;gearGoal?:string;trialBadge?:string;leisureFoodAt?:number;ascension?:import('./ancient-ascension').AscensionState;purificationUnlocked?:boolean;corruptedMap?:string;corrupted?:boolean;shopSkillBooksByKind?:{day:string;counts:Record<string,number>};shopBoosts?:{day:string;counts:Record<string,number>};shopSkillBooks?:{day:string;count:number};partyFractions?:Record<string,number>;level:number;xp:number;coins:number;potions:Record<string,number>;materials:Record<string,number>;weapons:AncientWeapon[];equipped:string;boosts?:Record<string,number>;profession?:string;skills?:Record<string,number>;quest?:{step:number;count:number;revision?:number};gearAffixVersion?:number;gear?:import('./ancient-gear').AncientGear[];gearEquipped?:Partial<Record<import('./ancient-gear').GearSlot,string>>};
export const ANCIENT_POTIONS:Record<string,{name:string;en:string;price:number;heal:number}>={
 minor:{name:'低级血瓶',en:'Minor Health Potion',price:1,heal:1000},
 medium:{name:'中级血瓶',en:'Medium Health Potion',price:10,heal:10000},
 major:{name:'高级血瓶',en:'Major Health Potion',price:100,heal:100000},
 superior:{name:'特级血瓶',en:'Superior Health Potion',price:500,heal:1000000},
 ultimate:{name:'终极血瓶',en:'Ultimate Health Potion',price:1000,heal:10000000}
};
export function ancientCoinReward(xp:number){return Number.isFinite(xp)&&xp>0?Math.round(.3*(xp/40)**.8*100)/100:0}
export function ancientAddCoins(balance:number,xp:number){return Math.round(balance*100+ancientCoinReward(xp)*100)/100}
// Applied once to kill XP, before contribution splitting and personal XP potions.
// Coins, quest XP and fixed crystal rewards retain their original amounts.
export function ancientKillExperience(baseXP:number,monsterLevel=0){const xp=Math.max(0,Math.floor(baseXP*120/100));return monsterLevel>150?Math.floor(xp*115/100):xp}
// Final base XP: the earlier +100% adjustment is already included here.
const ANCIENT_SMALL_XP=[[1,40],[5,200],[10,600],[15,1000],[20,1600],[25,2500]];
export function ancientMonsterXP(kind:string,level:number):number{
 const l=Math.max(1,Number.isFinite(level)?Math.floor(level):1);
 return Math.floor(ancientMonsterBaseXP(kind,l)*(l>100?(l/100)**3:1));
}
// Apply late-level growth once, including bestiary variants (not per recursion).
function ancientMonsterBaseXP(kind:string,level:number):number{
 const l=Math.max(1,Number.isFinite(level)?Math.floor(level):1);
 if(BESTIARY[kind])return Math.floor(ancientMonsterBaseXP(BESTIARY[kind].base,l)*BESTIARY[kind].xp);
 // Forest bosses should not grant almost a whole level per kill.
 if(kind==='rootwarden'||kind.startsWith('crystal_'))return Math.floor(xpRewardBase(l)*(kind==='rootwarden'?.18:.25));
 if(['mossling','thorn','sentinel'].includes(kind))return Math.max(1,Math.floor(xpRewardBase(l)/(36+.48*(l-30))));
 // All later maps use one ordinary-monster curve; boss rewards remain separate.
 // Lv30: 36 kills, then +0.48 equivalent kills per level (before XP boosts).
 if(l>=30&&kind!=='chief'&&kind!=='lord'&&!ANCIENT_KINDS[kind]?.boss)return Math.max(1,Math.floor(xpRewardBase(l)/(36+.48*(l-30))));
 // City rewards follow the level curve rather than the fifth-power forest curve.
 if(SKYREACH_KINDS[kind])return Math.floor(200*l*l*.4);
 if(FROSTCOURT_KINDS[kind])return Math.floor(200*l*l*(FROSTCOURT_KINDS[kind].boss?.4:.065));
 if(STARFALL_KINDS[kind])return Math.floor(200*l*l*(STARFALL_KINDS[kind].boss?.4:.065));
 if(SANCTUM_KINDS[kind])return Math.floor(200*l*l*(SANCTUM_KINDS[kind].boss?.4:.065));
 if(BLIGHT_KINDS[kind])return Math.floor(200*l*l*(BLIGHT_KINDS[kind].boss?.4:.065));
 if(CITY_KINDS[kind])return Math.floor(200*l*l*(CITY_KINDS[kind].boss?.35:.05));
 let small=2500*(l/25)**5;
 if(l<=25)for(let i=1;i<ANCIENT_SMALL_XP.length;i++){const [hi,value]=ANCIENT_SMALL_XP[i];if(l<=hi){const [lo,previous]=ANCIENT_SMALL_XP[i-1];small=previous+(value-previous)*(l-lo)/(hi-lo);break}}
 const boss=Math.max(small*1.8,30000*(l/30)**(Math.log(800000/30000)/Math.log(70/30)));
 // The tribe chief is a long elite fight; award four times its former XP.
 return Math.floor((kind==='chief'?Math.min(small*2.5,boss)*4:kind==='lord'||ANCIENT_KINDS[kind]?.boss?boss:small)+1e-7);
}
export function ancientStacks(count:number){const result:number[]=[];for(let n=count;n>0;n-=999)result.push(Math.min(n,999));return result}
export const QUALITY=['','普通','稀有','史诗','传说','神话'];
export function ancientMaxHealth(level:number){return ancientBaseHealth(level)}
export function ancientSyncHealth(player:{hp:number;maxHp?:number},level:number){const maxHp=ancientMaxHealth(level),previous=player.maxHp??100;player.maxHp=maxHp;if(player.hp>0)player.hp=Math.min(maxHp,Math.max(0,player.hp+maxHp-previous))}
export function ancientMonsterDamage(kind:string,level:number,skill='attack'){if(SKYREACH_KINDS[kind])return skyreachMonsterDamage(kind,level);if(FROSTCOURT_KINDS[kind])return frostcourtMonsterDamage(kind,level);if(STARFALL_KINDS[kind])return starfallMonsterDamage(kind,level);if(BESTIARY[kind])return bestiaryDamage(kind,level);if(SANCTUM_KINDS[kind])return sanctumMonsterDamage(kind,level);if(BLIGHT_KINDS[kind])return blightMonsterDamage(kind,level);if(CITY_KINDS[kind])return cityMonsterDamage(kind,level);if(FOREST_KINDS[kind])return forestMonsterDamage(kind,level,skill);const boss=ancientBossDamage(kind,level);if(boss)return Math.floor(boss*(skill==='roar'?.5:1));const mob=ancientMobDamage(kind,level);if(mob)return Math.floor(mob*(skill==='roar'?.5:1));const base=kind==='lord'?300:kind==='chief'?120:kind==='hunter'?25:20;return Math.floor(base*1.22**Math.max(0,level-1)*(skill==='roar'?.5:1))}
export function ancientMoveCredit(credit:number,elapsed:number){return Math.min(30,Math.max(0,credit)+Math.max(0,elapsed)*10)}
export function ancientMovementPath(ax:number,az:number,bx:number,bz:number,map='tribe',feet=0){const segment=(x:number,z:number,tx:number,tz:number)=>{const steps=Math.max(1,Math.ceil(Math.hypot(tx-x,tz-z)/.2));for(let i=1;i<=steps;i++)if(blocked(x+(tx-x)*i/steps,z+(tz-z)*i/steps,.6,map,feet))return false;return true};return segment(ax,az,bx,bz)||(segment(ax,az,bx,az)&&segment(bx,az,bx,bz))||(segment(ax,az,ax,bz)&&segment(ax,bz,bx,bz))}
export function ancientMoveCorrection(current:{x:number;y:number;z:number},ack:{x:number;y:number;z:number},sent:{x:number;y:number;z:number}){return {x:current.x+ack.x-sent.x,y:current.y+ack.y-sent.y,z:current.z+ack.z-sent.z}}
export function ancientAttackReady(attackAt:number,now:number){return now>=attackAt}
export function ancientAttackCooldown(kind:string){return kind==='grox'?1000:kind==='hunter'?1800:2800}
export function ancientSpread(gun:string,aiming:boolean,moving=false,airborne=false,kick=0){if(aiming)return .0012;const base=gun==='M9'?.08:gun==='H8'?.065:gun==='A8'?.09:gun==='MP9'||gun==='KX'?.07:.06;return base*.8*(moving?1.35:1)*(airborne?1.4:1)*(1+Math.min(.4,Math.max(0,kick)*3))}
export function ancientSpreadOffset(cone:number,radial=Math.random(),angular=Math.random()){const radius=Math.sqrt(radial)*cone,angle=angular*Math.PI*2;return {x:Math.cos(angle)*radius,y:Math.sin(angle)*radius}}
export const GUNS:Record<string,{head:number;body:number;arm:number;mag:number;interval:number;reload:number;auto:boolean;range:number;pellets?:number}>={
 R6:{head:30,body:18,arm:9,mag:10,interval:520,reload:2100,auto:false,range:78},
 V6:{head:45,body:30,arm:15,mag:30,interval:104,reload:1400,auto:true,range:72},
 MP9:{head:36,body:24,arm:14,mag:36,interval:72,reload:1700,auto:true,range:74},
 H8:{head:72,body:42,arm:22,mag:10,interval:218.75,reload:3000,auto:true,range:120},
 A8:{head:21,body:17,arm:11,mag:10,interval:280,reload:3400,auto:true,range:40,pellets:6},
 KX:{head:36,body:23,arm:13,mag:60,interval:105,reload:4200,auto:true,range:92},
 M9:{head:180,body:80,arm:50,mag:5,interval:1000,reload:2200,auto:false,range:120}
};
export const MATERIAL_NAMES:Record<string,string>={edictCore:'双相令核',forgeSigil:'熔誓炉印',starCore:'沉星核片','supply:purity':'净化印记',verdictShard:'裁决晶核',blightHeart:'蚀心碎片',royalSeal:'王城誓印',emptyCrown:'空冠碎片',core:'相位核心',wood:'古木',stone:'燧石',bone:'兽骨',fang:'穴居兽獠牙',spear:'碎牙矛尖',totem:'酋长图腾',crown:'戈拉什王印',mossHide:'苔甲皮',thornSeed:'棘枝种子',crystalShard:'晶壳碎片',rootHeart:'古根之心',metalCrystal:'金曜晶核',woodCrystal:'苍木晶核',waterCrystal:'沧澜晶核',fireCrystal:'熔焰晶核',earthCrystal:'玄岩晶核'};
export const RECIPES:Record<string,Record<string,number>>=Object.fromEntries(Object.entries({R6:6,V6:10,MP9:10,H8:12,A8:12,KX:16,M9:16}).map(([gun,count])=>[gun,{['fragment:'+gun]:count}]));
export function weaponLootInfo(key:string){const parts=key.split(':'),kind=parts[0],quality=Number(parts[1]),gun=kind==='fragment'?parts[1]:parts[2];if(!Object.hasOwn(GUNS,gun))return null;if(kind==='fragment'&&parts.length===2)return {kind,gun,quality:1};if((kind==='blueprint'||kind==='ascend')&&parts.length===3&&(quality===2||quality===3))return {kind,gun,quality};return null}
export function weaponLootName(key:string,english=false){const item=weaponLootInfo(key);if(!item)return null;const q=english?['','Common','Rare','Epic'][item.quality]:QUALITY[item.quality];return item.kind==='fragment'?(english?'Damaged Weapon Fragment · ':'破损枪械碎片 · ')+item.gun:item.kind==='blueprint'?(english?`[${q} Blueprint] ${item.gun}`:`[${q}图纸]${item.gun}`):(english?`[${q} Ascension] ${item.gun}`:`[${q}]枪械升阶 · ${item.gun}`)}
export function ancientWeaponLoot(kind:string,random:()=>number=Math.random):Record<string,number>{const guns=Object.keys(GUNS),pick=(list:string[])=>list[Math.min(list.length-1,Math.floor(random()*list.length))];if(kind==='chief'||kind==='rootwarden'){const quality=random()<(kind==='rootwarden'?.65:.25)?3:2;return {['blueprint:'+quality+':'+pick(guns)]:1}}if(kind==='lord'||kind.startsWith('crystal_')){const quality=random()<(kind==='lord'?.3:.6)?3:2;return {['ascend:'+quality+':'+pick(guns)]:1}}if(random()>=.08)return {};return {['fragment:'+pick(kind==='grox'?['R6','V6','MP9']:kind==='hunter'?['H8','A8','KX','M9']:guns)]:1}}
export function weaponDamage(w:AncientWeapon,zone:'head'|'body'|'arm'='body'){return Math.floor(GUNS[w.gun][zone]/2*w.quality**2*w.level**1.5*w.stars**1.2)}
export function upgradeCost(w:AncientWeapon){return w.quality*w.level**2*(w.stars+1)}
export function xpRewardBase(level:number){return 200*level**2}
// Progression only: keep combat and all reward amounts unchanged. Spread the
// increase evenly across Lv100–180 instead of inheriting the old Lv150 jump.
export function xpNeeded(level:number){
 const l=Math.max(1,Number.isFinite(level)?Math.floor(level):1);
 if(l<=100)return Math.floor(xpRewardBase(l));
 if(l>=180)return Math.ceil(xpRewardBase(l)*2*(1+(l-150)/40)**2*1.6);
 const reward=(n:number)=>ancientKillExperience(ancientMonsterXP('grox',n)),at100=xpRewardBase(100)/reward(100),at180=xpRewardBase(180)*2*(1+30/40)**2*1.6/reward(180),kills=at100+(at180-at100)*(l-100)/80;
 return Math.ceil(reward(l)*kills);
}
export function gainXP(p:AncientProfile,amount:number,applyBoost=true){const awarded=applyBoost&&(p.boosts?.experience||0)>Date.now()?Math.floor(amount*1.5):amount;p.xp+=awarded;while(p.xp>=xpNeeded(p.level)){p.xp-=xpNeeded(p.level);p.level++}return awarded}
export function newAncientProfile():AncientProfile{const weapon={id:crypto.randomUUID(),gun:'R6',quality:1,level:1,stars:1};const p:AncientProfile={level:1,xp:0,coins:0,potions:{},materials:{wood:20,stone:15,bone:10,core:0},weapons:[weapon],equipped:weapon.id};ensureAncientGear(p);return p}
export function ancientTarget<T extends {p:{name:string;hp:number;x:number;y:number;z:number}}>(monster:{hp:number;target:string;region:number;kind:string;x:number;y?:number;z:number;map?:string;contributions?:{name:string;damage:number}[]},players:T[]):T|undefined{
 if(monster.hp<=0)return;
 // Bosses retaliate only against attackers (and their summons), never passers-by.
 if(monster.kind==='chief'||monster.kind==='lord'||ANCIENT_KINDS[monster.kind]?.boss){
  const attackers=new Set((monster.contributions||[]).filter(v=>v.damage>0).map(v=>v.name));
  const eligible=players.filter(({p})=>p.hp>0&&attackers.has(p.name.startsWith('@pet:')?p.name.slice(5):p.name));
  return eligible.find(({p})=>p.name===monster.target)||eligible.sort((a,b)=>Math.hypot(a.p.x-monster.x,a.p.z-monster.z)-Math.hypot(b.p.x-monster.x,b.p.z-monster.z))[0];
 }
 // Detection limits apply only to acquisition, never to an existing pursuit.
 const locked=players.find(({p})=>p.name===monster.target&&p.hp>0);
 if(locked)return locked;
 if(communityId(monster.map)||isDungeonMap(monster.map)||monster.map==='forest'||monster.map==='city'||monster.map==='blight'||monster.map==='skyreach'||monster.map==='frostcourt'||monster.map==='starfall'||monster.map==='sanctum')return players.filter(({p})=>p.hp>0&&Math.hypot(p.x-monster.x,p.z-monster.z)<(ANCIENT_KINDS[monster.kind]?.boss?38:20)&&lineClear(monster.x,ancientMapHeight(monster.map!,monster.x,monster.z,monster.y)+1.5,monster.z,p.x,p.y,p.z,monster.map)).sort((a,b)=>Math.hypot(a.p.x-monster.x,a.p.z-monster.z)-Math.hypot(b.p.x-monster.x,b.p.z-monster.z))[0];
 const lo=monster.region===0?30:tribeCompactZ(monster.region===1?220:520),hi=tribeCompactZ(monster.region===0?200:monster.region===1?500:1000),radius=monster.kind==='lord'?45:monster.kind==='chief'?30:20;
 return players.filter(({p})=>p.hp>0&&p.z>=lo&&p.z<hi&&Math.hypot(p.x-monster.x,p.z-monster.z)<=radius&&lineClear(monster.x,1.5,monster.z,p.x,p.y,p.z)).sort((a,b)=>Math.hypot(a.p.x-monster.x,a.p.z-monster.z)-Math.hypot(b.p.x-monster.x,b.p.z-monster.z))[0];
}
export type AncientObstacle={x:number;z:number;w:number;d:number;h:number;bottom?:number;kind:string};
// The same deterministic footprint is used for rendering and server line of sight.
export function ancientObstacles():AncientObstacle[]{const out:AncientObstacle[]=[];for(let z=45;z<960;z+=47){const side=Math.floor(z/47)%2?1:-1;out.push({x:side*27,z,w:12,d:12,h:7,kind:'hut'});out.push({x:-side*29,z:z+19,w:7,d:6,h:3,kind:'rock'})}for(const z of [200,500])for(const x of [-28,28])out.push({x,z,w:24,d:3,h:10,kind:'gate'});return out.map(o=>({...o,z:tribeCompactZ(o.z)}))}
export const OBSTACLES=ancientObstacles();
// Shared footprints for visible solid decoration, used by players, monsters and LOS.
export const TRIBE_TREES=Array.from({length:127},(_,i)=>({x:(i%2?1:-1)*(34+(i*37%31)/10),z:i*3/380*1000}));
export const TRIBE_SOLIDS:AncientObstacle[]=TRIBE_TREES.map(t=>({...t,w:1.1,d:1.1,h:10,kind:'tree'}));
for(const z of [30,190,220,480,525,900])for(const side of [-1,1])TRIBE_SOLIDS.push({x:side*10,z:tribeCompactZ(z),w:.7,d:.7,h:6,kind:'post'});
for(let oldZ=34;oldZ<950;oldZ+=61){const z=tribeCompactZ(oldZ),x=oldZ%2?12:-12;TRIBE_SOLIDS.push({x,z,w:3.8,d:3.8,h:.5,kind:'firepit'});for(let j=0;j<3;j++)TRIBE_SOLIDS.push({x:x+4+j,z:z+3,w:1,d:1,h:2.8,kind:'shrine'},{x:x-4+j*1.2,z:z+3,w:1,d:1,h:.9,kind:'basket'});for(const dx of [5,9])TRIBE_SOLIDS.push({x:x+dx,z:z-4,w:.3,d:.3,h:2.9,kind:'rackPost'});TRIBE_SOLIDS.push({x:x+7,z:z-4,w:4.3,d:.3,h:2.95,bottom:2.65,kind:'rack'});}
for(const [oldZ,r]of [[440,12],[945,21]]){const z=tribeCompactZ(oldZ);for(let j=0;j<16;j++){const a=j/16*Math.PI*2;TRIBE_SOLIDS.push({x:Math.cos(a)*(r+3),z:z+Math.sin(a)*(r+3),w:1.3,d:1.3,h:6,kind:'pillar'});}TRIBE_SOLIDS.push({x:0,z:z+17,w:6,d:3,h:4,kind:'altar'});}
for(const z of [tribeCompactZ(440),tribeCompactZ(945)])for(const side of [-1,1])for(let j=0;j<5;j++)TRIBE_SOLIDS.push({x:side*(7+j*1.7+Math.sin(.3)*(4+j*.5)),z:z+10,w:1.2,d:1.2,h:3,kind:'rib'});
for(const t of TRIBE_TREES)t.z=tribeCompactZ(t.z);
for(const o of TRIBE_SOLIDS)if(o.kind==='tree')o.z=tribeCompactZ(o.z);
export const TRIBE_COLLIDERS=[...OBSTACLES,...TRIBE_SOLIDS];
export function tribeSafePosition(x:number,z:number,r=.6){if(!blocked(x,z,r))return {x,z};for(let distance=.5;distance<=12;distance+=.5)for(let i=0;i<24;i++){const angle=i*Math.PI/12,px=x+Math.cos(angle)*distance,pz=z+Math.sin(angle)*distance;if(!blocked(px,pz,r))return {x:px,z:pz}}return {x:0,z:10}}
const TRIBE_WALKABLE=new Set(['firepit','shrine','basket','rack','rackPost','post','pillar','altar']);
export function tribeSurface(x:number,z:number,feet:number){let height=0;for(const o of TRIBE_SOLIDS)if(TRIBE_WALKABLE.has(o.kind)&&o.h<=feet+.12&&Math.abs(x-o.x)<=o.w/2+.6&&Math.abs(z-o.z)<=o.d/2+.6)height=Math.max(height,o.h);return height}
export function blocked(x:number,z:number,r=.6,map='tribe',feet=NaN){if(communityId(map))return communityBlocked(map,x,z,r,Number.isFinite(feet)?feet:0);if(map==='skyreach')return skyreachBlocked(x,z,r,Number.isFinite(feet)?feet:skyreachHeight(x,z));if(map==='frostcourt')return frostcourtBlocked(x,z,r,Number.isFinite(feet)?feet:frostcourtHeight(x,z));if(map==='starfall')return starfallBlocked(x,z,r,Number.isFinite(feet)?feet:starfallHeight(x,z));if(map==='sanctum')return sanctumBlocked(x,z,r,Number.isFinite(feet)?feet:sanctumHeight(x,z));if(map==='blight')return blightBlocked(x,z,r,Number.isFinite(feet)?feet:blightHeight(x,z));feet=Number.isFinite(feet)?feet:0;if(isDungeonMap(map))return dungeonBlocked(x,z,r,map);if(map==='city')return cityBlocked(x,z,r,feet);if(map==='forest')return forestBlocked(x,z,r);return ((Math.abs(x)>39-r||z<3||z>TRIBE_LENGTH-3)&&!passageInside('tribe',x,z,r))||leisureSolid('tribe',x,z,r)||TRIBE_COLLIDERS.some(o=>feet<o.h-.05&&feet+1.7>(o.bottom||0)+.02&&Math.abs(x-o.x)<o.w/2+r&&Math.abs(z-o.z)<o.d/2+r)}
export function lineClear(ax:number,ay:number,az:number,bx:number,by:number,bz:number,map='tribe'){if(communityId(map))return communityClear(map,ax,ay,az,bx,by,bz);if(map==='skyreach')return skyreachLineClear(ax,ay,az,bx,by,bz);if(map==='frostcourt')return frostcourtLineClear(ax,ay,az,bx,by,bz);if(map==='starfall')return starfallLineClear(ax,ay,az,bx,by,bz);if(map==='sanctum')return sanctumLineClear(ax,ay,az,bx,by,bz);if(map==='blight')return blightLineClear(ax,ay,az,bx,by,bz);if(isDungeonMap(map))return dungeonLineClear(ax,ay,az,bx,by,bz,map);if(map==='city')return cityLineClear(ax,ay,az,bx,by,bz);if(map==='forest')return forestLineClear(ax,ay,az,bx,by,bz);return tribePassageLineClear(ax,az,bx,bz)&&!TRIBE_COLLIDERS.some(o=>{let lo=0,hi=1;for(const [a,b,min,max] of [[ax,bx,o.x-o.w/2,o.x+o.w/2],[ay,by,o.bottom||0,o.h],[az,bz,o.z-o.d/2,o.z+o.d/2]]){const d=b-a;if(Math.abs(d)<1e-8){if(a<min||a>max)return false}else{const t1=(min-a)/d,t2=(max-a)/d;lo=Math.max(lo,Math.min(t1,t2));hi=Math.min(hi,Math.max(t1,t2));if(lo>hi)return false}}return hi>=0&&lo<=1})}
