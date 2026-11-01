// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
export const ANCIENT_MAP_LEVELS:Record<string,number>={tribe:1,forest:30,city:70,blight:90,sanctum:120,starfall:150,frostcourt:180,skyreach:220};
export type AncientVisit={id:string;map:string;expires:number};
export class AncientVisits{
 constructor(private sql:SqlStorage){
  sql.exec('CREATE TABLE IF NOT EXISTS ancient_visit_passes(name TEXT PRIMARY KEY,id TEXT NOT NULL,map TEXT NOT NULL,expires INTEGER NOT NULL)');
  sql.exec('CREATE TABLE IF NOT EXISTS ancient_ticket_maps(ticket TEXT PRIMARY KEY,map TEXT NOT NULL,pass TEXT NOT NULL)');
 }
 grant(name:string,map:string,now=Date.now()){
  const id=crypto.randomUUID();this.sql.exec('INSERT INTO ancient_visit_passes VALUES(?,?,?,?) ON CONFLICT(name) DO UPDATE SET id=excluded.id,map=excluded.map,expires=excluded.expires',name,id,map,now+60000);return id;
 }
 pass(name:string,map:string,now=Date.now()) {return this.sql.exec<AncientVisit>('SELECT id,map,expires FROM ancient_visit_passes WHERE name=? AND map=? AND expires>?',name,map,now).toArray()[0]}
 allowed(name:string,map:string,level:number){return Object.hasOwn(ANCIENT_MAP_LEVELS,map)&&(level>=ANCIENT_MAP_LEVELS[map]||!!this.pass(name,map))}
 renew(name:string,id:string,now=Date.now()){this.sql.exec('UPDATE ancient_visit_passes SET expires=? WHERE name=? AND id=?',now+30000,name,id)}
 revoke(name:string,id?:string){if(id)this.sql.exec('DELETE FROM ancient_visit_passes WHERE name=? AND id=?',name,id);else this.sql.exec('DELETE FROM ancient_visit_passes WHERE name=?',name)}
 bind(ticket:string,map:string,pass=''){this.sql.exec('DELETE FROM ancient_ticket_maps WHERE ticket NOT IN (SELECT ticket FROM ancient_tickets)');this.sql.exec('INSERT INTO ancient_ticket_maps VALUES(?,?,?)',ticket,map,pass)}
 binding(ticket:string){return this.sql.exec<{map:string;pass:string}>('SELECT map,pass FROM ancient_ticket_maps WHERE ticket=?',ticket).toArray()[0]}
 consume(ticket:string){this.sql.exec('DELETE FROM ancient_ticket_maps WHERE ticket=?',ticket)}
}
