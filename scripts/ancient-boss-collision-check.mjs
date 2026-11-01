// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import {BOSS_BODIES,BOSS_BODY_COLLISION_ENABLED,bossBodyPathBlocked as blocked} from '../public/ancient-boss-collision.js';
const ground=()=>0;
for(const [kind,b]of Object.entries(BOSS_BODIES)){
 const m={kind,x:0,z:0,hp:100},r=b.radius+.6;
 assert.equal(blocked(-r-1,0,0,0,0,[m],ground),BOSS_BODY_COLLISION_ENABLED,kind+' walking');
 assert.equal(blocked(-r-1,0,r+1,0,0,[m],ground),BOSS_BODY_COLLISION_ENABLED,kind+' swept dash');
 assert(!blocked(-r-1,r+1,r+1,r+1,0,[m],ground),kind+' around body');
 assert.equal(blocked(-r-1,0,0,0,2,[m],ground),BOSS_BODY_COLLISION_ENABLED,kind+' jumping into body');
 assert(!blocked(-r-1,0,r+1,0,b.height+.1,[m],ground),kind+' above body');
 assert(!blocked(.1,0,.5,0,0,[m],ground),kind+' overlap escape');
 assert.equal(blocked(.5,0,.1,0,0,[m],ground),BOSS_BODY_COLLISION_ENABLED,kind+' overlap deeper');
 assert(!blocked(-r-1,0,r+1,0,0,[{...m,hp:0}],ground),kind+' dead');
}
assert(!blocked(-2,0,2,0,0,[{kind:'grox',x:0,z:0,hp:100}],ground));
console.log('PASS: all 12 boss bodies; walking, swept dash, jump,绕行, height, overlap escape, death and ordinary monsters.');
