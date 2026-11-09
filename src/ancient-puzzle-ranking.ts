// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {irvineDay,nextIrvineMidnight} from './ancient-joinlog';
export type PuzzleTitle={rank:number;expires:number;worn:boolean};
type Score={name:string;rooms:number;reached:number};
export function initPuzzleRanking(sql:SqlStorage){
 sql.exec('CREATE TABLE IF NOT EXISTS ancient_puzzle_daily(day TEXT NOT NULL,name TEXT NOT NULL,rooms INTEGER NOT NULL,reached INTEGER NOT NULL,PRIMARY KEY(day,name))');
 sql.exec('CREATE INDEX IF NOT EXISTS ancient_puzzle_daily_rank ON ancient_puzzle_daily(day,rooms DESC,reached,name)');
 sql.exec('CREATE TABLE IF NOT EXISTS ancient_puzzle_titles(name TEXT PRIMARY KEY,rank INTEGER NOT NULL,expires INTEGER NOT NULL,worn INTEGER NOT NULL DEFAULT 0)');
 sql.exec('CREATE TABLE IF NOT EXISTS ancient_puzzle_settled(day TEXT PRIMARY KEY)');
}
export function creditPuzzleRooms(sql:SqlStorage,name:string,rooms:number,now:number){
 if(rooms<=0||['admintest','maptest_e673e6'].includes(name.toLowerCase()))return;
 sql.exec('INSERT INTO ancient_puzzle_daily VALUES(?,?,?,?) ON CONFLICT(day,name) DO UPDATE SET rooms=rooms+excluded.rooms,reached=excluded.reached',irvineDay(now),name,rooms,now);
}
const standings=`SELECT name,SUM(rooms) AS rooms,MAX(reached) AS reached
 FROM ancient_puzzle_daily WHERE day<=? GROUP BY name`;
export function settlePuzzleRanking(sql:SqlStorage,now:number){
 const day=irvineDay(now),previous=new Date(Date.parse(day+'T00:00:00Z')-86400000).toISOString().slice(0,10);
 if(!sql.exec('INSERT OR IGNORE INTO ancient_puzzle_settled VALUES(?) RETURNING day',previous).toArray().length)return;
 const winners=sql.exec<Score>(`${standings} ORDER BY rooms DESC,reached,name LIMIT 3`,previous).toArray();
 const expires=nextIrvineMidnight(now);
 sql.exec('DELETE FROM ancient_puzzle_titles WHERE expires<=?',now);
 for(const [i,winner] of winners.entries())sql.exec('INSERT INTO ancient_puzzle_titles VALUES(?,?,?,0) ON CONFLICT(name) DO UPDATE SET rank=excluded.rank,expires=excluded.expires,worn=0',winner.name,i+1,expires);
}
export function readPuzzleTitle(sql:SqlStorage,name:string,now:number):PuzzleTitle|undefined{
 const title=sql.exec<{rank:number;expires:number;worn:number}>('SELECT rank,expires,worn FROM ancient_puzzle_titles WHERE name=? AND expires>?',name,now).toArray()[0];
 return title?{...title,worn:!!title.worn}:undefined;
}
export function puzzleLeaderboard(sql:SqlStorage,input:unknown,now:number){
 const day=irvineDay(now),total=sql.exec<{n:number}>('SELECT COUNT(DISTINCT name) AS n FROM ancient_puzzle_daily WHERE day<=?',day).toArray()[0].n;
 const pages=Math.max(1,Math.ceil(total/20)),page=Math.min(pages,Math.max(1,Math.trunc(Number(input)||1)));
 const players=sql.exec<Score>(`${standings} ORDER BY rooms DESC,reached,name LIMIT 20 OFFSET ?`,day,(page-1)*20).toArray()
  .map((row,i)=>({...row,rank:(page-1)*20+i+1}));
 return {day,total,page,pages,players};
}
