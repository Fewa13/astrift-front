// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
export type CoverMaterial='wood'|'glass'|'steel'|'wall';
export type CoverSpec={id:string;map:string;x:number;z:number;w:number;h:number;d:number;color:number;material:CoverMaterial;hp:number};
export const COVER_SPECS:CoverSpec[]=[
  {id:'crossroads:wood',map:'crossroads',x:-17,z:-12,w:4,h:1.5,d:1.1,color:0x9a6744,material:'wood',hp:75},
  {id:'crossroads:glass',map:'crossroads',x:17,z:18,w:4,h:2.1,d:.22,color:0x73dff0,material:'glass',hp:30},
  {id:'crossroads:steel',map:'crossroads',x:-18,z:18,w:4.5,h:1.7,d:.65,color:0x788c97,material:'steel',hp:220},
  {id:'crossroads:wall',map:'crossroads',x:20,z:-19,w:5,h:2,d:.8,color:0x8c8990,material:'wall',hp:145},
  {id:'depot:wood',map:'depot',x:-15,z:11,w:3.8,h:1.5,d:1.2,color:0xa87942,material:'wood',hp:75},
  {id:'depot:glass',map:'depot',x:15,z:12,w:4,h:2,d:.22,color:0x76d0d5,material:'glass',hp:30},
  {id:'depot:steel',map:'depot',x:-15,z:-4,w:4.5,h:1.7,d:.65,color:0x818d8b,material:'steel',hp:220},
  {id:'depot:wall',map:'depot',x:16,z:-29,w:5,h:2,d:.8,color:0x9d9280,material:'wall',hp:145},
  {id:'arcade:wood',map:'arcade',x:-7,z:-8,w:3.7,h:1.4,d:1,color:0xa2755b,material:'wood',hp:75},
  {id:'arcade:glass',map:'arcade',x:7,z:16,w:4,h:2.1,d:.22,color:0x9ce7ee,material:'glass',hp:30},
  {id:'arcade:steel',map:'arcade',x:-19,z:5,w:4.5,h:1.7,d:.65,color:0x76818b,material:'steel',hp:220},
  {id:'arcade:wall',map:'arcade',x:19,z:-5,w:5,h:2,d:.8,color:0x91849d,material:'wall',hp:145}
];
