// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {ANCIENT_KINDS} from './ancient-rules';
import {BESTIARY} from './ancient-bestiary';
import {FOREST_KINDS} from './ancient-forest';
import {CITY_KINDS} from './ancient-city';
import {BLIGHT_KINDS} from './ancient-blight';
import {SANCTUM_KINDS} from './ancient-sanctum';
import {SKYREACH_KINDS} from './ancient-skyreach';
import {FROSTCOURT_KINDS} from './ancient-frostcourt';
import {STARFALL_KINDS} from './ancient-starfall';
export const RESEARCH_MAPS:Record<string,[string,string]>={tribe:['部落','The Tribe'],forest:['森林','The Forest'],city:['失落王城','Lost Royal City'],blight:['蚀影荒原','Shadowblight Wastes'],sanctum:['净界圣域','Sanctum of the Veil'],starfall:['沉星遗境','Sunken Star Ruins'],frostcourt:['霜烬王庭','Frostfire Court'],skyreach:['寂雷天穹','Silent Storm Skyreach']};
const TIPS:Record<string,[string,string]>={
 shield:['正面骨盾会抵挡攻击，从侧后方寻找空隙。','Its frontal shield resists attacks. Move around to its flank.'],
 charge:['注意压低身体的蓄势动作，横移躲开冲撞。','Watch its lowered charging stance; sidestep the rush.'],
 pounce:['起跳前会压低身位，别沿直线后退。','It crouches before leaping. Dodge sideways, not straight backward.'],
 totem:['不要一直站在图腾附近，优先处理支援者。','Leave the totem area and focus the support caster.'],
 javelin:['抬臂后会投矛，横移并利用地形遮挡。','Its raised arm telegraphs a javelin. Strafe or use cover.'],
 hook:['挥动锁链时留出侧向闪避空间，避免被拖入近战。','Leave room to sidestep the chain and avoid being pulled into melee.'],
 bloom:['花冠张开时准备远程攻击，保持移动。','The opening flower signals a ranged attack. Keep moving.'],
 chief:['图腾抬起后再侧移，离开砸地范围再反击。','When the totem rises, move out of the slam and then retaliate.'],
 lord:['观察大范围攻击预兆，不要同时承受近战与范围攻击。','Read its wide-area tells. Do not take melee and area attacks together.'],
 rootwarden:['注意根系与砸地预兆，绕开封路区域。','Watch the roots and ground-slam tells; avoid sealed paths.'],
 starbound_heart:['射线、环形潮汐与封印阵都有蓄势，寻找攻击范围之外的空隙。','Its ray, tidal ring and seal arrays have windups. Find the gaps outside the attack zones.']
};
export type ResearchEntry={kind:string;name:string;en:string;map:string;boss:boolean;tip:[string,string];kills:number;observations:number;dodges:number;claimed:number;stage:number;requirements:number[]};
export const RESEARCH_CATALOG=Object.entries({grox:{name:'穴居兽',en:'Grox',boss:false},hunter:{name:'碎牙猎手',en:'Fangbreaker Hunter',boss:false},chief:{name:'碎骨酋长',en:'Bonebreaker Chieftain',boss:true},lord:{name:'远古大酋长·戈拉什',en:'Ancient Warchief Gorash',boss:true},...ANCIENT_KINDS}).filter(([kind])=>kind!=='noble_echo').map(([kind,d])=>{
 const map=BESTIARY[kind]?.map||(SKYREACH_KINDS[kind]?'skyreach':FROSTCOURT_KINDS[kind]?'frostcourt':STARFALL_KINDS[kind]?'starfall':SANCTUM_KINDS[kind]?'sanctum':BLIGHT_KINDS[kind]?'blight':CITY_KINDS[kind]?'city':FOREST_KINDS[kind]?'forest':'tribe');
 const boss=!!d.boss,behavior=BESTIARY[kind]?.behavior||kind;
 const tip=TIPS[behavior]||TIPS[kind]||(boss?TIPS.lord:kind==='hunter'?TIPS.javelin:['看清攻击前的抬手动作，保持距离并抓住攻击后的空档。','Read the attack windup, control your distance and punish its recovery.']);
 return {kind,name:d.name,en:d.en,map,boss,tip:tip as [string,string],requirements:boss?[1,3,8]:[1,10,30]};
});
export class AncientResearch{
 constructor(private sql:SqlStorage){sql.exec('CREATE TABLE IF NOT EXISTS ancient_research(name TEXT NOT NULL,kind TEXT NOT NULL,kills INTEGER NOT NULL DEFAULT 0,observations INTEGER NOT NULL DEFAULT 0,dodges INTEGER NOT NULL DEFAULT 0,claimed INTEGER NOT NULL DEFAULT 0,PRIMARY KEY(name,kind))');sql.exec('CREATE TABLE IF NOT EXISTS ancient_research_pending(name TEXT NOT NULL,event TEXT NOT NULL,kind TEXT NOT NULL,x REAL,z REAL,hp REAL,ends REAL,PRIMARY KEY(name,event))');}
 kill(name:string,kind:string){if(!RESEARCH_CATALOG.some(d=>d.kind===kind))return;this.sql.exec('INSERT INTO ancient_research(name,kind,kills) VALUES(?,?,1) ON CONFLICT(name,kind) DO UPDATE SET kills=MIN(1000000,kills+1)',name,kind);}
 observe(name:string,monsters:Iterable<{id:string;kind:string;x:number;z:number;bossCast?:{started:number;hitAt:number};attackWindup?:{started:number;hitAt:number}}>,a:{x:number;z:number;hp:number},now:number){
  if(a.hp<=0){this.sql.exec('DELETE FROM ancient_research_pending WHERE name=?',name);return;}
  const pending=this.sql.exec<{event:string;kind:string;x:number;z:number;hp:number;ends:number}>('SELECT * FROM ancient_research_pending WHERE name=?',name).toArray();
  for(const v of pending)if(v.ends<=now){if(a.hp>=v.hp&&Math.hypot(a.x-v.x,a.z-v.z)>=2)this.sql.exec('UPDATE ancient_research SET dodges=MIN(1000000,dodges+1) WHERE name=? AND kind=?',name,v.kind);this.sql.exec('DELETE FROM ancient_research_pending WHERE name=? AND event=?',name,v.event);}
  let count=pending.filter(v=>v.ends>now).length;
  for(const m of monsters){const cast=m.bossCast||m.attackWindup;if(count>=8||!cast||cast.hitAt<=now||Math.hypot(a.x-m.x,a.z-m.z)>25||!RESEARCH_CATALOG.some(d=>d.kind===m.kind))continue;const event=m.id+':'+cast.started;if(pending.some(p=>p.event===event))continue;this.sql.exec('INSERT OR IGNORE INTO ancient_research_pending VALUES(?,?,?,?,?,?,?)',name,event,m.kind,a.x,a.z,a.hp,cast.hitAt+300);this.sql.exec('INSERT INTO ancient_research(name,kind,observations) VALUES(?,?,1) ON CONFLICT(name,kind) DO UPDATE SET observations=MIN(1000000,observations+1)',name,m.kind);count++;}
 }
 list(name:string):ResearchEntry[]{const rows=this.sql.exec<{kind:string;kills:number;observations:number;dodges:number;claimed:number}>('SELECT kind,kills,observations,dodges,claimed FROM ancient_research WHERE name=?',name).toArray();return RESEARCH_CATALOG.map(d=>{const r=rows.find(r=>r.kind===d.kind)||{kills:0,observations:0,dodges:0,claimed:0};const stage=d.requirements.filter(n=>r.kills>=n).length;return {...d,...r,stage};});}
 claim(name:string,kind:string){const entry=this.list(name).find(d=>d.kind===kind);if(!entry||entry.stage<=entry.claimed)return null;const stage=entry.claimed+1,reward={coins:[25,75,150][stage-1]*(entry.boss?3:1),cores:stage-1};this.sql.exec('UPDATE ancient_research SET claimed=? WHERE name=? AND kind=?',stage,name,kind);return reward;}
}
