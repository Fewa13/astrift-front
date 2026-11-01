// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
export type Mode = 'ctf' | 'hardpoint';
export type Position = [number, number, number];
export type Fighter = {id:string;name:string;team:number;position:Position;hp:number;interacting?:boolean};
export type Flag = {team:number;position:Position;carrier:string|null;home:boolean;returnAt:number};
export type Match = {mode:Mode;round:number;phase:'waiting'|'running'|'finished';startedAt:number;endsAt:number;nextAt:number;scores:number[];flags:Flag[];hill:number;hillEndsAt:number;owner:number;contested:boolean;lastTick:number;carryMs:number;holds:Record<string,{team:number;since:number}>;event:string;revision:number};
export const BASES:Position[] = [[0,0,43],[0,0,-43]];
export const HILLS = [{name:'中央街口',position:[0,0,0] as Position,radius:7},{name:'西侧通道',position:[-18,0,18] as Position,radius:5},{name:'东侧通道',position:[18,0,-18] as Position,radius:5}];
export const ROUND_MS=600000, HILL_MS=60000, HOLD_MS=600, RETURN_MS=20000;
export function createMatch(mode:Mode,now:number,round=1,waiting=false):Match {
  return {mode,round,phase:waiting?'waiting':'running',startedAt:now,endsAt:now+ROUND_MS,nextAt:0,scores:[0,0],flags:BASES.map((p,team)=>({team,position:[...p],carrier:null,home:true,returnAt:0})),hill:0,hillEndsAt:now+HILL_MS,owner:-1,contested:false,lastTick:now,carryMs:0,holds:{},event:'',revision:0};
}
export const near=(a:Position,b:Position,r:number)=>Math.hypot(a[0]-b[0],a[2]-b[2])<=r&&Math.abs(a[1]-b[1])<2.6;
export const carrierFlag=(m:Match,id:string)=>m.flags.find(f=>f.carrier===id);
function announce(m:Match,text:string){m.event=text;m.revision++;}
function returnFlag(f:Flag){f.carrier=null;f.home=true;f.returnAt=0;f.position=[...BASES[f.team]];}
export function dropFlag(m:Match,id:string,now:number){const f=carrierFlag(m,id);if(!f)return;f.carrier=null;f.home=false;f.returnAt=now+RETURN_MS;f.position[1]=0;delete m.holds[id];announce(m,'旗帜掉落 · 20 秒后自动归位');}
function finish(m:Match,now:number){m.phase='finished';m.nextAt=now+5000;m.holds={};m.owner=-1;m.contested=false;announce(m,m.scores[0]===m.scores[1]?'平局':m.scores[0]>m.scores[1]?'蓝队获胜':'红队获胜');}
// Called with feet positions. Only this shared engine changes objective scores.
export function tickMatch(m:Match,players:Fighter[],now:number){
  if(m.phase!=='running')return;
  const dt=Math.max(0,Math.min(1000,now-m.lastTick));m.lastTick=now;
  if(now>=m.endsAt){finish(m,now);return;}
  const alive=players.filter(p=>p.hp>0&&(p.team===0||p.team===1));
  if(m.mode==='ctf'){
    for(const f of m.flags){
      if(f.carrier){const p=alive.find(p=>p.id===f.carrier);if(!p)dropFlag(m,f.carrier,now);else f.position=[...p.position];}
      if(!f.home&&!f.carrier&&now>=f.returnAt){returnFlag(f);announce(m,'掉落旗帜已自动归位');}
    }
    for(const id of Object.keys(m.holds))if(!alive.some(p=>p.id===id&&p.interacting))delete m.holds[id];
    for(const p of alive){
      const carried=carrierFlag(m,p.id),own=m.flags[p.team];
      if(carried&&own.home&&near(p.position,BASES[p.team],3)){
        m.scores[p.team]++;returnFlag(carried);announce(m,`${p.name} 成功交旗 · ${p.team===0?'蓝':'红'}队 +1`);
        if(m.scores[p.team]>=3){finish(m,now);return;}
      }
      if(!p.interacting){delete m.holds[p.id];continue;}
      const f=m.flags.find(f=>!f.carrier&&(!f.home||f.team!==p.team)&&near(p.position,f.position,2.4));
      if(!f){delete m.holds[p.id];continue;}
      const hold=m.holds[p.id];if(!hold||hold.team!==f.team){m.holds[p.id]={team:f.team,since:now};continue;}
      if(now-hold.since<HOLD_MS)continue;
      delete m.holds[p.id];
      if(f.team===p.team){returnFlag(f);announce(m,`${p.name} 夺回己方旗帜`);}
      else if(!carrierFlag(m,p.id)){f.carrier=p.id;f.home=false;f.returnAt=0;f.position=[...p.position];announce(m,`${p.name} 拿到${f.team===0?'蓝':'红'}队旗帜`);}
    }
  }else{
    const index=Math.floor((now-m.startedAt)/HILL_MS)%HILLS.length;
    if(index!==m.hill){m.hill=index;m.carryMs=0;m.owner=-1;announce(m,`据点转移到${HILLS[index].name}`);}
    m.hillEndsAt=m.startedAt+(Math.floor((now-m.startedAt)/HILL_MS)+1)*HILL_MS;
    const hill=HILLS[m.hill],teams=new Set(alive.filter(p=>near(p.position,hill.position,hill.radius)).map(p=>p.team));
    const owner=teams.size===1?[...teams][0]:-1;
    if(owner!==m.owner)m.carryMs=0;
    m.owner=owner;m.contested=teams.size>1;
    if(owner>=0){m.carryMs+=dt;while(m.carryMs>=1000){m.scores[owner]++;m.carryMs-=1000;}if(m.scores[owner]>=180)finish(m,now);}
    else m.carryMs=0;
  }
}
export function botGoal(m:Match,p:Fighter,players:Fighter[],role:number):Position {
  if(m.mode==='hardpoint')return [...HILLS[m.hill].position];
  const own=m.flags[p.team],enemy=m.flags[1-p.team];
  if(own.carrier)return [...own.position];
  if(carrierFlag(m,p.id))return [...(own.home?BASES[p.team]:own.position)];
  if(!own.home)return [...own.position];
  if(enemy.carrier){const escort=players.find(a=>a.id===enemy.carrier);if(escort)return [...escort.position];}
  return [...(role%5===0?BASES[p.team]:enemy.position)];
}
