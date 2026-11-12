// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {SKILLS} from './ancient-skills';
import {BOSS_CARDS,bossCardKey} from './ancient-boss-cards';
import type {AncientProfile} from './ancient-rules';
export function setTestSkillLevels(name:string,p:AncientProfile,value:unknown):string|null{
 if(name!=='admintest')return 'AdminTest only';
 if(!value||typeof value!=='object'||Array.isArray(value))return 'Invalid skill levels';
 const entries=Object.entries(value);
 if(!entries.length||entries.length>Object.keys(SKILLS).length)return 'Invalid skill levels';
 for(const [id,level]of entries)if(!Object.hasOwn(SKILLS,id)||typeof level!=='number'||!Number.isSafeInteger(level)||level<1)return 'Skill levels must be integers that can be represented exactly and are at least 1';
 p.skills={...p.skills,...Object.fromEntries(entries)};
 return null;
}
export function setTestPlayerLevel(name:string,p:AncientProfile,value:unknown):string|null{
 if(name!=='admintest')return 'AdminTest only';
 if(typeof value!=='number'||!Number.isSafeInteger(value)||value<1)return 'Player level must be a positive safe integer';
 p.level=value;p.xp=0;return null;
}
export function supplyTestBossCards(name:string,p:AncientProfile):string|null{
 if(name!=='admintest')return 'AdminTest only';
 for(const kind of Object.keys(BOSS_CARDS))p.materials[bossCardKey(kind)]=Math.max(999,p.materials[bossCardKey(kind)]||0);
 return null;
}
