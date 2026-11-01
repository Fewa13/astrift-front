// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import type {AncientProfile} from './ancient-rules';
export type BossForm={kind:string;until:number};
export type BossCard={name:string;en:string;recipe:Record<string,number>;health:number;damage:number;speed:number;reduction:number;color:number};
export const BOSS_CARDS:Record<string,BossCard>={
 frost_crowned:{name:'霜烬裁令者变身卡',en:'Frostfire Arbiter Transformation Card',recipe:{edictCore:1,core:200},health:.65,damage:.5,speed:.1,reduction:.22,color:0x99e8ff},
 starbound_heart:{name:'沉星执核者变身卡',en:'Sunken Corekeeper Transformation Card',recipe:{starCore:1,core:180},health:.65,damage:.5,speed:.1,reduction:.22,color:0x8ceee1},
 blight_lord:{name:'蚀心领主变身卡',en:'Blightheart Lord Transformation Card',recipe:{blightHeart:1,core:180},health:.65,damage:.5,speed:.1,reduction:.22,color:0xc77aff},
 oathknight:{name:'失誓骑士变身卡',en:'Forsworn Knight Transformation Card',recipe:{royalSeal:1,core:100},health:.5,damage:.4,speed:.15,reduction:.2,color:0xffd287},
 emptyking:{name:'空冠之王变身卡',en:'Empty-Crowned King Transformation Card',recipe:{emptyCrown:1,core:150},health:.6,damage:.5,speed:.12,reduction:.2,color:0x9abbff},
 lord:{name:'戈拉什变身卡',en:'Gorash Transformation Card',recipe:{crown:1,core:20},health:.5,damage:.45,speed:.1,reduction:.15,color:0xffa548},
 rootwarden:{name:'古根守卫变身卡',en:'Rootwarden Transformation Card',recipe:{rootHeart:1,core:30},health:.65,damage:.3,speed:.1,reduction:.18,color:0x71ef90},
 crystal_metal:{name:'金曜巨人变身卡',en:'Aurum Titan Transformation Card',recipe:{metalCrystal:1,core:60},health:.5,damage:.4,speed:.1,reduction:.18,color:0xffda72},
 crystal_wood:{name:'苍木巨人变身卡',en:'Verdant Titan Transformation Card',recipe:{woodCrystal:1,core:60},health:.65,damage:.3,speed:.12,reduction:.15,color:0x49e5a0},
 crystal_water:{name:'沧澜巨人变身卡',en:'Tidal Titan Transformation Card',recipe:{waterCrystal:1,core:60},health:.5,damage:.3,speed:.18,reduction:.18,color:0x69d7ff},
 crystal_fire:{name:'熔焰巨人变身卡',en:'Ember Titan Transformation Card',recipe:{fireCrystal:1,core:60},health:.4,damage:.5,speed:.12,reduction:.12,color:0xff693e},
 crystal_earth:{name:'玄岩巨人变身卡',en:'Terra Titan Transformation Card',recipe:{earthCrystal:1,core:60},health:.75,damage:.25,speed:.08,reduction:.22,color:0xcba47a}
};
export function bossCardKey(kind:string){return 'bossCard:'+kind}
export function bossCardDefinition(kind:string){return Object.hasOwn(BOSS_CARDS,kind)?BOSS_CARDS[kind]:undefined}
export function activeBossForm(a:{skillRuntime?:{bossForm?:BossForm}},now=Date.now()){const f=a.skillRuntime?.bossForm;return f&&f.until>now&&bossCardDefinition(f.kind)?f:undefined}
export function bossFormStats(a:{skillRuntime?:{bossForm?:BossForm}},now=Date.now()){const f=activeBossForm(a,now);return f?bossCardDefinition(f.kind):undefined}
// Called only after a card is consumed and the new form's maximum HP is set.
// Reusing a card grants this bonus again; ticking/reconnecting never does.
export function healBossCard(a:{hp:number;maxHp?:number},untransformedMax:number){
 const max=a.maxHp||untransformedMax;
 a.hp=Math.min(max,a.hp+Math.max(0,max-untransformedMax));
}
export function bossCardDescription(kind:string,en=false){const d=bossCardDefinition(kind);if(!d)return '';const percent=(n:number)=>Math.round(n*100);return en?`60s · Max HP +${percent(d.health)}% · Damage +${percent(d.damage)}% · Speed +${percent(d.speed)}% · Incoming damage −${percent(d.reduction)}%. Consumed on use; forms do not stack; ends on death; offline time counts.`:`60秒 · 生命上限+${percent(d.health)}% · 伤害+${percent(d.damage)}% · 移速+${percent(d.speed)}% · 受到伤害减少${percent(d.reduction)}%。使用消耗一张；变身不叠加；死亡结束；离线仍计时。`}
export function craftBossCard(p:AncientProfile,kind:string){const d=bossCardDefinition(kind);if(!d)return '配方不存在';const key=bossCardKey(kind),count=p.materials[key]||0;if(!Number.isSafeInteger(count)||count>=999999)return '数量已达上限';if(Object.entries(d.recipe).some(([k,n])=>!Number.isSafeInteger(p.materials[k])||p.materials[k]<n))return '合成材料不足';for(const [k,n]of Object.entries(d.recipe))p.materials[k]-=n;p.materials[key]=count+1;return null}
export function useBossCard(p:AncientProfile,a:{hp:number;skillRuntime?:{bossForm?:BossForm;effects:Record<string,{until:number;level:number}>;mode:number;cooldowns:Record<string,number>;lastAux:number}},kind:string,now=Date.now()){
 const d=bossCardDefinition(kind),key=bossCardKey(kind);if(!d||(p.materials[key]||0)<1)return '物品不足';if(a.hp<=0)return '请在存活时使用变身卡';if((a.skillRuntime?.effects?.transform?.until||0)>now)return '变身期间不能使用变身卡';
 a.skillRuntime??={cooldowns:{},effects:{},mode:1,lastAux:0};a.skillRuntime.bossForm={kind,until:now+60000};a.skillRuntime.mode=1;p.materials[key]--;return null;
}
