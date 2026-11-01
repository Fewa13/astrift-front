import assert from 'node:assert/strict';
import {createMatch,tickMatch,dropFlag,BASES,HILLS,carrierFlag} from '../public/objective-rules.js';
let now=10000;
const p=(id,team,pos)=>({id,name:id,team,position:[...pos],hp:100,interacting:false});
const a=p('blue',0,BASES[0]),b=p('red',1,BASES[1]);
let m=createMatch('ctf',now);
function tick(ms=100){now+=ms;tickMatch(m,[a,b],now);}
function take(player,team){player.position=[...m.flags[team].position];player.interacting=true;tick();tick(650);player.interacting=false;}
take(a,1);assert.equal(carrierFlag(m,a.id).team,1);
take(b,0);a.position=[...BASES[0]];tick();assert.equal(m.scores[0],0,'own flag must be home');
b.hp=0;tick();assert.equal(m.flags[0].carrier,null);assert.equal(m.flags[0].home,false,'death drops flag');
take(a,0);assert.equal(m.flags[0].home,true,'teammate retrieves');a.position=[...BASES[0]];tick();assert.equal(m.scores[0],1);
take(a,1);a.hp=0;tick();assert.equal(m.flags[1].home,false);tick(20000);assert.equal(m.flags[1].home,true,'automatic return');
a.hp=100;for(let i=0;i<2;i++){take(a,1);a.position=[...BASES[0]];tick();}assert.equal(m.phase,'finished');assert.deepEqual(m.scores,[3,0]);
const frozen=[...m.scores];tick(5000);assert.deepEqual(m.scores,frozen,'no scoring after finish');
m=createMatch('ctf',now);a.position=[...BASES[1]];a.interacting=true;tick();a.interacting=false;tick();a.interacting=true;tick(500);assert.equal(m.flags[1].carrier,null,'hold must be continuous');tick(650);assert.equal(m.flags[1].carrier,a.id);dropFlag(m,a.id,now);assert.equal(m.flags[1].carrier,null,'disconnect drop');
m=createMatch('hardpoint',now);a.interacting=false;a.position=[...HILLS[0].position];b.hp=100;b.position=[...BASES[1]];tick(1000);assert.equal(m.scores[0],1);
b.position=[...HILLS[0].position];tick(1000);assert.equal(m.contested,true);assert.equal(m.scores[0],1,'contest pauses scoring');
b.hp=0;tick(1000);assert.equal(m.scores[0],2,'dead player cannot contest');a.position=[...BASES[0]];tick(1000);assert.equal(m.scores[0],2,'vacant hill does not score');
tick(60000);assert.equal(m.hill,1,'hill rotates');m.scores=[179,0];a.position=[...HILLS[1].position];tick(1000);assert.equal(m.phase,'finished');assert.equal(m.scores[0],180);
m=createMatch('hardpoint',now);tick(600000);assert.equal(m.phase,'finished');assert.equal(m.scores[0],0,'timer cannot award a late point');
console.log('PASS objectives: flag pickup/return/drop/capture gate, 3 captures, cancelled hold, contest/death/empty hill, hill rotation, score/time endings.');
