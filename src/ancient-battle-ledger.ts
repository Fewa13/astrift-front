type Row={job:string;weapon:number;skill:number;summon:number;kills:number;deaths:number;hits:number};
const empty=(job:string):Row=>({job,weapon:0,skill:0,summon:0,kills:0,deaths:0,hits:0});
export class AncientBattleLedger{
 private pending=new Map<string,{name:string;row:Row}>();private at=0;
 constructor(private sql:SqlStorage){sql.exec('CREATE TABLE IF NOT EXISTS ancient_battle_ledger(name TEXT NOT NULL,job TEXT NOT NULL,weapon REAL NOT NULL DEFAULT 0,skill REAL NOT NULL DEFAULT 0,summon REAL NOT NULL DEFAULT 0,kills INTEGER NOT NULL DEFAULT 0,deaths INTEGER NOT NULL DEFAULT 0,hits INTEGER NOT NULL DEFAULT 0,PRIMARY KEY(name,job))');}
 hit(name:string,job:string,source:'weapon'|'skill'|'summon',damage:number,kill=false){if(!(damage>0)||!Number.isFinite(damage))return;const r=this.entry(name,job);r[source]+=damage;r.hits++;if(kill)r.kills++;}
 death(name:string,job:string){this.entry(name,job).deaths++;}
 private entry(name:string,job:string){const key=name+'|'+job;if(this.pending.size>256)this.flush(true);let v=this.pending.get(key);if(!v){v={name,row:empty(job)};this.pending.set(key,v)}return v.row;}
 flush(force=false,now=Date.now()){if(!force&&now-this.at<5000)return;for(const {name,row:r}of this.pending.values())this.sql.exec('INSERT INTO ancient_battle_ledger VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(name,job) DO UPDATE SET weapon=weapon+excluded.weapon,skill=skill+excluded.skill,summon=summon+excluded.summon,kills=kills+excluded.kills,deaths=deaths+excluded.deaths,hits=hits+excluded.hits',name,r.job,r.weapon,r.skill,r.summon,r.kills,r.deaths,r.hits);this.pending.clear();this.at=now;}
 read(name:string){this.flush(true);return this.sql.exec<Row>('SELECT job,weapon,skill,summon,kills,deaths,hits FROM ancient_battle_ledger WHERE name=? ORDER BY kills DESC',name).toArray();}
}
