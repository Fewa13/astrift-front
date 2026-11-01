// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {newAncientProfile} from '../public/ancient-rules.js';
import {PROFESSIONS} from '../public/ancient-skills.js';
import {ancientSkillDamage} from '../public/ancient-gear.js';
import {activeBranch,chooseBranch,PROFESSION_BRANCHES} from '../public/ancient-branches.js';
const output=await build({entryPoints:['src/ancient-skill-combat.ts','src/ancient-branch-combat.ts'],bundle:true,write:false,format:'esm',platform:'node',outdir:'/tmp/astrift-branch-tests'});
const modules=await Promise.all(output.outputFiles.map(f=>import('data:text/javascript;base64,'+Buffer.from(f.text).toString('base64'))));
const combat=modules[0],branch=modules[1],now=Date.now();
function profile(job,id){const p=newAncientProfile();Object.assign(p,{profession:job,level:30,branches:{[job]:id},branchGuides:{[job]:true}});p.skills=Object.fromEntries(PROFESSIONS[job].skills.map(id=>[id,3]));return p;}
const actor=p=>({name:'test',x:0,y:1.7,z:50,hp:10000,maxHp:10000,weapon:p.weapons[0]});
function context(){const hits=[],fx=[],monsters=Array.from({length:8},(_,i)=>({id:'m'+i,kind:'grox',hp:1e12,maxHp:1e12,x:i%3,z:55+Math.floor(i/3)*2}));return {map:'tribe',monsters,hits,fx,damage(m,n){assert(Number.isFinite(n)&&n>0);m.hp-=n;hits.push({id:m.id,n});return n;},fx(...args){fx.push(args);}};}
for(const job of Object.keys(PROFESSIONS)){assert.equal(PROFESSION_BRANCHES[job].length,2);for(const b of PROFESSION_BRANCHES[job]){assert(b.description.every(Boolean));const p=profile(job,b.id);p.branches={};p.level=29;assert(chooseBranch(p,job,b.id));p.level=30;p.branchGuides={};assert(chooseBranch(p,job,b.id));p.branchGuides[job]=true;assert.equal(chooseBranch(p,job,b.id),null);assert.equal(activeBranch(p),b.id);assert(chooseBranch(p,job,PROFESSION_BRANCHES[job][1].id));const saved=JSON.parse(JSON.stringify(p));saved.profession='other';assert.equal(activeBranch(saved),'');saved.profession=job;assert.equal(activeBranch(saved),b.id);}}
for(const job of Object.keys(PROFESSIONS))for(const b of PROFESSION_BRANCHES[job])for(const id of PROFESSIONS[job].skills){const p=profile(job,b.id),a=actor(p),c=context();assert.equal(combat.castAncientSkill(a,p,id,[0,-.1,Math.sqrt(.99)],c,now),null,job+'/'+b.id+'/'+id);for(let t=0;t<=5000;t+=250)combat.tickAncientSkills(a,p,c,.25,now+t);assert((a.skillRuntime.branch?.pulses.length||0)<=12);}
// Automatic ice sequence: no recast or manual detonation input.
{const p=profile('ice','frostprison'),a=actor(p),c=context(),m=c.monsters[0];for(let i=0;i<4;i++)branch.branchContext(a,p,'icebolt',c,now+i*100).damage(m,100);assert.equal(c.hits.length,9);assert.equal(m.slow,1);const before=c.hits.length;for(let i=0;i<4;i++)branch.branchContext(a,p,'icebolt',c,now+1000+i*100).damage(m,100);assert.equal(c.hits.length-before,4);a.hp=0;branch.tickBranch(a,p,c,now+1500);assert.equal(a.skillRuntime.branch,undefined);}
// Branches actually differ for both chain reach and concentrated delayed hits.
{const p=profile('lightning','heavenwrath'),a=actor(p),c=context();combat.castAncientSkill(a,p,'chain',[0,-.1,Math.sqrt(.99)],c,now);assert.equal(c.hits.length,2);combat.tickAncientSkills(a,p,c,.5,now+600);assert.equal(c.hits.length,4);p.branches.lightning='thunderfield';const c2=context();combat.castAncientSkill(actor(p),p,'chain',[0,-.1,Math.sqrt(.99)],c2,now);assert(c2.hits.length>4);}
// Delayed damage retains branch rules, while no-branch characters stay unchanged.
{const p=profile('lightning','heavenwrath'),a=actor(p),c=context();combat.castAncientSkill(a,p,'storm',[0,-.1,Math.sqrt(.99)],c,now);combat.tickAncientSkills(a,p,c,.1,now);const n=c.hits[0].n;delete p.branches;const c2=context(),a2=actor(p);combat.castAncientSkill(a2,p,'storm',[0,-.1,Math.sqrt(.99)],c2,now);combat.tickAncientSkills(a2,p,c2,.1,now);assert(Math.abs(n/c2.hits[0].n-1.25)<.00001);}
// Every sword skill gets the selected automatic follow-up, once per cast.
for(const key of ['swiftshade','heavenblade'])for(const id of PROFESSIONS.swordsman.skills){const p=profile('swordsman',key),a=actor(p),c=context();assert.equal(combat.castAncientSkill(a,p,id,[0,-.1,Math.sqrt(.99)],c,now),null);assert.equal(a.skillRuntime.branch.pulses.length,key==='swiftshade'?2:1,key+'/'+id);for(let t=0;t<=4000;t+=100)combat.tickAncientSkills(a,p,c,.1,now+t);assert.equal(a.skillRuntime.branch.pulses.length,0,'multi-hit skills must not requeue echoes');}
// Giant sword +30% is independent of branches and does not shorten its cooldown.
{const p=profile('swordsman','heavenblade');p.level=55;delete p.branches;const a=actor(p),c=context();combat.castAncientSkill(a,p,'phantomblade',[0,-.1,Math.sqrt(.99)],c,now);assert.equal(a.skillRuntime.cooldowns.phantomblade-now,24000);combat.tickAncientSkills(a,p,c,.5,now+500);assert(Math.abs(c.hits[0].n-ancientSkillDamage(p)*(6.5+.6*3)*1.3)<.001);}
// Selecting the weakening tool is not a free repeatable branch attack.
for(const key of ['beastlord','spiritpack']){const p=profile('summoner',key),a=actor(p),c=context();combat.castAncientSkill(a,p,'weaken',[0,-.1,Math.sqrt(.99)],c,now);assert.equal(a.skillRuntime.branch?.pulses.length||0,0);}
console.log('PASS: 8 professions / 16 branches; every skill; automatic effects; all four sword follow-ups once per cast; giant sword +30%, unchanged cooldown; no free weakening-mode attacks; bounded effects.');
