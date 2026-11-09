// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';import {DatabaseSync} from 'node:sqlite';import {build} from 'esbuild';
const result=await build({entryPoints:['src/ancient-leaderboard.ts'],bundle:true,write:false,format:'esm',platform:'node'}),{ancientLevelLeaderboard}=await import('data:text/javascript;base64,'+Buffer.from(result.outputFiles[0].text).toString('base64'));
const db=new DatabaseSync(':memory:');db.exec('CREATE TABLE ancient_profiles(name TEXT PRIMARY KEY,data TEXT NOT NULL)');const sql={exec(q,...args){const rows=db.prepare(q).all(...args);return {one:()=>rows[0],toArray:()=>rows}}};assert.equal(ancientLevelLeaderboard(sql,1).total,0);for(let i=0;i<47;i++)db.prepare('INSERT INTO ancient_profiles VALUES(?,?)').run('Player'+String(i).padStart(2,'0'),JSON.stringify({level:Math.floor(i/2)+1,profession:'ice',coins:999,materials:{secret:123}}));db.prepare('INSERT INTO ancient_profiles VALUES(?,?)').run('AdminTest',JSON.stringify({level:999999}));
for(const name of ['maptest_e673e6','MAPTEST_E673E6'])db.prepare('INSERT INTO ancient_profiles VALUES(?,?)').run(name,JSON.stringify({level:999999}));
const first=ancientLevelLeaderboard(sql,1),second=ancientLevelLeaderboard(sql,2),last=ancientLevelLeaderboard(sql,3);assert.equal(first.total,47);assert.equal(first.players.length,20);assert.equal(second.players.length,20);assert.equal(last.players.length,7);assert.equal(first.players[0].level,24);assert.equal(first.players[19].rank,20);assert.equal(second.players[0].rank,21);assert.equal(last.players.at(-1).rank,47);assert.equal(new Set([...first.players,...second.players,...last.players].map(p=>p.name)).size,47);assert(first.players.every(p=>Object.keys(p).sort().join(',')==='level,name,profession,rank'));assert.equal(ancientLevelLeaderboard(sql,-5).page,1);assert.equal(ancientLevelLeaderboard(sql,'junk').page,1);assert.equal(ancientLevelLeaderboard(sql,99999).page,3);db.close();console.log('PASS: level ordering, deterministic ties, 20/20/7 pagination, rank continuity, offline entries, case-insensitive AdminTest/maptest exclusion, bounded page input, public fields only.');

const puzzleBundle=await build({entryPoints:['src/ancient-puzzle-ranking.ts'],bundle:true,write:false,format:'esm',platform:'node'});
const {initPuzzleRanking,creditPuzzleRooms,puzzleLeaderboard,settlePuzzleRanking,readPuzzleTitle}=await import('data:text/javascript;base64,'+Buffer.from(puzzleBundle.outputFiles[0].text).toString('base64'));
const puzzleDb=new DatabaseSync(':memory:');
const puzzleSql={exec(query,...args){return {toArray:()=>puzzleDb.prepare(query).all(...args)}}};
// Run writes eagerly, as Durable Object SQLite does.
const store={exec(query,...args){const rows=puzzleSql.exec(query,...args).toArray();return {toArray:()=>rows}}};
const midnight=Date.parse('2026-11-01T07:00:00Z');
const expires=Date.parse('2026-11-02T08:00:00Z');
initPuzzleRanking(store);
creditPuzzleRooms(store,'Alpha',4,midnight-3000);
creditPuzzleRooms(store,'Beta',3,midnight-2000);
creditPuzzleRooms(store,'Gamma',3,midnight-1000);
creditPuzzleRooms(store,'AdminTest',999,midnight-1000);
creditPuzzleRooms(store,'Gamma',4,midnight);
assert.deepEqual(puzzleLeaderboard(store,1,midnight).players.map(({name,rooms})=>[name,rooms]),[['Gamma',7],['Alpha',4],['Beta',3]]);
settlePuzzleRanking(store,midnight);
for(const [i,name] of ['Alpha','Beta','Gamma'].entries()){
 assert.deepEqual({...readPuzzleTitle(store,name,midnight)},{rank:i+1,expires,worn:false});
 assert.equal(readPuzzleTitle(store,name,expires),undefined);
}
store.exec('UPDATE ancient_puzzle_titles SET worn=1 WHERE name=?','Alpha');
settlePuzzleRanking(store,midnight+1);
assert.equal(readPuzzleTitle(store,'Alpha',midnight+1).worn,true);
settlePuzzleRanking(store,expires);
assert.equal(readPuzzleTitle(store,'Gamma',expires).rank,1);
puzzleDb.close();
console.log('PASS: cumulative puzzle progress, deterministic ties, midnight cutoff, idempotent titles, and Irvine DST expiration.');
