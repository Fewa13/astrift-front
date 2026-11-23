type Row={job:string;weapon:number;skill:number;summon:number;kills:number;deaths:number;hits:number};
type AttackRow={job:string;attack:string;damage:number;hits:number};
const empty=(job:string):Row=>({job,weapon:0,skill:0,summon:0,kills:0,deaths:0,hits:0});
export class AncientBattleLedger{
 private pending=new Map<string,{name:string;row:Row}>();private attacks=new Map<string,{name:string;row:AttackRow}>();private at=0;
 constructor(private sql:SqlStorage){sql.exec('CREATE TABLE IF NOT EXISTS ancient_battle_ledger(name TEXT NOT NULL,job TEXT NOT NULL,weapon REAL NOT NULL DEFAULT 0,skill REAL NOT NULL DEFAULT 0,summon REAL NOT NULL DEFAULT 0,kills INTEGER NOT NULL DEFAULT 0,deaths INTEGER NOT NULL DEFAULT 0,hits INTEGER NOT NULL DEFAULT 0,PRIMARY KEY(name,job))');sql.exec('CREATE TABLE IF NOT EXISTS ancient_battle_attacks(name TEXT NOT NULL,job TEXT NOT NULL,attack TEXT NOT NULL,damage REAL NOT NULL DEFAULT 0,hits INTEGER NOT NULL DEFAULT 0,PRIMARY KEY(name,job,attack))');}
 hit(name:string,job:string,source:'weapon'|'skill'|'summon',damage:number,kill=false,attack?:string){if(!(damage>0)||!Number.isFinite(damage))return;const r=this.entry(name,job);r[source]+=damage;r.hits++;if(kill)r.kills++;
  let id=source==='weapon'?'melee':attack||(source==='summon'?(job==='necromancer'?'unleashLegion':job==='summoner'?'summon':'other'):'other');
  if(id.startsWith('advancement:'))id=id.split(':').slice(0,3).join(':');
  if(id.length>100)id='other';if(this.attacks.size>=2048)this.flush(true);
  const key=JSON.stringify([name,job,id]);let v=this.attacks.get(key);if(!v){v={name,row:{job,attack:id,damage:0,hits:0}};this.attacks.set(key,v)}v.row.damage+=damage;v.row.hits++;
 }
 death(name:string,job:string){this.entry(name,job).deaths++;}
 private entry(name:string,job:string){const key=name+'|'+job;if(this.pending.size>256)this.flush(true);let v=this.pending.get(key);if(!v){v={name,row:empty(job)};this.pending.set(key,v)}return v.row;}
 flush(force=false,now=Date.now()){if(!force&&now-this.at<5000)return;for(const {name,row:r}of this.pending.values())this.sql.exec('INSERT INTO ancient_battle_ledger VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(name,job) DO UPDATE SET weapon=weapon+excluded.weapon,skill=skill+excluded.skill,summon=summon+excluded.summon,kills=kills+excluded.kills,deaths=deaths+excluded.deaths,hits=hits+excluded.hits',name,r.job,r.weapon,r.skill,r.summon,r.kills,r.deaths,r.hits);for(const {name,row:r}of this.attacks.values())this.sql.exec('INSERT INTO ancient_battle_attacks VALUES(?,?,?,?,?) ON CONFLICT(name,job,attack) DO UPDATE SET damage=damage+excluded.damage,hits=hits+excluded.hits',name,r.job,r.attack,r.damage,r.hits);this.pending.clear();this.attacks.clear();this.at=now;}
 read(name:string){this.flush(true);const attacks=this.sql.exec<AttackRow>('SELECT job,attack,damage,hits FROM ancient_battle_attacks WHERE name=? ORDER BY attack',name).toArray();return this.sql.exec<Row>('SELECT job,weapon,skill,summon,kills,deaths,hits FROM ancient_battle_ledger WHERE name=? ORDER BY kills DESC',name).toArray().map(row=>{const details=attacks.filter(a=>a.job===row.job),known=details.filter(a=>a.attack!=='melee').reduce((sum,a)=>sum+a.damage,0);return {...row,attacks:details,historicalSkill:Math.max(0,row.skill+row.summon-known)};});}
}
