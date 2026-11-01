// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import {ancientMapHeight,FOREST_ALTARS} from '../public/ancient-rules.js';
const near=(a,b)=>assert(Math.abs(a-b)<1e-8);
for(const [z,r]of [[440,12],[945,21]]){near(ancientMapHeight('tribe',0,z),.3);near(ancientMapHeight('tribe',r-1.5,z),.25);near(ancientMapHeight('tribe',r-.5,z),.2);near(ancientMapHeight('tribe',r+1,z),0);near(ancientMapHeight('tribe',0,z,0),.3)}
for(const a of FOREST_ALTARS){near(ancientMapHeight('forest',a.x,a.z),10.19);near(ancientMapHeight('forest',a.x+12,a.z),10.07);near(ancientMapHeight('forest',a.x+14,a.z),10);near(ancientMapHeight('forest',a.x+16,a.z),10);near(ancientMapHeight('forest',a.x,a.z,10),10.19)}
console.log('PASS: tribe and forest altar centers, visible tiers, edge exits and shared player/monster ground heights.');
