// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
export function ancientLevelLeaderboard(sql:SqlStorage,requested:unknown){
 const total=sql.exec<{total:number}>("SELECT COUNT(*) AS total FROM ancient_profiles WHERE lower(name) NOT IN ('admintest','maptest_e673e6')").one().total;
 const pages=Math.max(1,Math.ceil(total/20)),value=Number(requested),page=Math.min(pages,Math.max(1,Number.isFinite(value)?Math.floor(value):1));
 const rows=sql.exec<{name:string;level:number;profession:string}>("SELECT name,CAST(json_extract(data,'$.level') AS INTEGER) AS level,COALESCE(json_extract(data,'$.profession'),'') AS profession FROM ancient_profiles WHERE lower(name) NOT IN ('admintest','maptest_e673e6') ORDER BY level DESC, name COLLATE NOCASE ASC, name ASC LIMIT 20 OFFSET ?",(page-1)*20).toArray();
 return {page,pages,total,players:rows.map((p,i)=>({rank:(page-1)*20+i+1,...p}))};
}
