// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {retireFusionAdvancements} from './ancient-advancement-progress';
import type {AncientProfile} from './ancient-rules';
// Called in the world's synchronous storage transaction, before profiles or live runtimes are used.
export function migrateFusionAdvancementProfiles(sql:SqlStorage,now:number){
 sql.exec('CREATE TABLE IF NOT EXISTS ancient_fusion_rollback_backups(name TEXT PRIMARY KEY,profile TEXT NOT NULL,appliedAt INTEGER NOT NULL)');
 let migrated=0;
 for(const row of sql.exec<{name:string;data:string}>("SELECT name,data FROM ancient_profiles WHERE json_type(data,'$.advancements')='object'").toArray()){
  const p=JSON.parse(row.data) as AncientProfile;
  if(!retireFusionAdvancements(p))continue;
  sql.exec('INSERT OR IGNORE INTO ancient_fusion_rollback_backups VALUES(?,?,?)',row.name,row.data,now);
  sql.exec('UPDATE ancient_profiles SET data=? WHERE name=?',JSON.stringify(p),row.name);
  // Retire delayed damage and old branch state for offline players as well.
  const abilities=sql.exec<{data:string}>('SELECT data FROM ancient_abilities WHERE name=?',row.name).toArray()[0];
  if(abilities){
   const state=JSON.parse(abilities.data);
   const route=String(state.advancementIdentity||'').split('|')[1];
   if(['elemental-god','elemental-ward','riftlord','riftduelist','abyss-king','abyss-herald','time-sovereign','time-weaver'].includes(route)){
    sql.exec('UPDATE ancient_abilities SET data=? WHERE name=?',JSON.stringify({cooldowns:{},effects:{},mode:1,lastAux:0}),row.name);
   }
  }
  migrated++;
 }
 return migrated;
}
