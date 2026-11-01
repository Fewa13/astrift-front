// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import {ancientBaseAttack} from '../public/ancient-gear.js';
import {ancientMobHP} from '../public/ancient-mob-stats.js';
import {ancientBossHP} from '../public/ancient-boss-stats.js';
import {ANCIENT_KINDS} from '../public/ancient-rules.js';
import {bestiaryHP} from '../public/ancient-bestiary.js';
import {sanctumMonsterHP} from '../public/ancient-sanctum.js';
import {blightMonsterHP} from '../public/ancient-blight.js';
for(const l of [1,5,19,20,30,50,70,79,80,100,120,150]){
 const a=ancientBaseAttack(l),normal=l<20?5.6:5*2.8*1.12,maximum=Math.floor(a*normal*(l>=80?2.5:1));
 for(const kind of ['grox','hunter',...Object.keys(ANCIENT_KINDS)]){
  if(kind==='noble_echo'||ANCIENT_KINDS[kind]?.boss)continue;
  const hp=bestiaryHP(kind,l)||sanctumMonsterHP(kind,l)||blightMonsterHP(kind,l)||ancientMobHP(kind,l);
  assert(hp>maximum,`${kind} Lv${l} withstands six-level single hit including own warrior buffs`);
 }
}
assert.equal(ancientMobHP('grox',1),200);assert.equal(ancientMobHP('hunter',10),Math.round(400*(8+4*9/69)*.95));
const mob=sanctumMonsterHP('seal_warden',150),boss=sanctumMonsterHP('immaculate_judge',150);
assert(boss>=mob*5.49);assert(ancientBossHP('emptyking',100)>ancientMobHP('city_guard',100)*5);
const giant=Math.floor(ancientBaseAttack(150)*10.1*2.5),warrior=Math.floor(ancientBaseAttack(150)*5*2.8*1.12*2.5);
console.log({level150Mob:mob,level150Boss:boss,holyGiant:giant,holyWarriorWithOwnBuffs:warrior,warriorRemainingPercent:100*(mob-warrior)/mob});
console.log('PASS: all real ordinary archetypes survive reference single hits, early HP unchanged, bosses remain substantially tougher.');
