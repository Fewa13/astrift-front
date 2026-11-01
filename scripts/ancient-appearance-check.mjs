// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {transform} from 'esbuild';
import * as THREE from 'three';
import {createWeaponViewModels} from '../public/weapon-viewmodel.js';
import {OPTIC_MODELS,rebuildWeaponOptic} from '../public/weapon-optics.js';
const models=createWeaponViewModels(THREE,new THREE.Group());
for(const key of ['revolver','redline','smg','hammer','autoShotgun','lmg','frost'])assert(models[key]?.userData.skinMaterials);
for(const id of Object.keys(OPTIC_MODELS)){const optic=new THREE.Group();rebuildWeaponOptic(THREE,optic,'redline',id);assert(optic.children.length>=3);const count=optic.children.length;rebuildWeaponOptic(THREE,optic,'redline',id);assert.equal(optic.children.length,count,'Rebuild does not accumulate geometry');}
const canvasContext=new Proxy({}, {get:(_,key)=>key==='createLinearGradient'||key==='createRadialGradient'?()=>({addColorStop(){}}):()=>{},set:()=>true});
let stored={kills:10000,claimed:['glacier',null,null],drawsUsed:0,drawOwned:[],shards:0,active:'glacier'};
const compiled=await transform(fs.readFileSync(new URL('../public/skin-system.js',import.meta.url),'utf8'),{loader:'js',format:'cjs'}),module={exports:{}};
vm.runInNewContext(compiled.code,{module,exports:module.exports,require:()=>THREE,localStorage:{getItem:()=>JSON.stringify(stored)},document:{createElement:()=>({width:512,height:256,getContext:()=>canvasContext})},Date,Map,Set,Math});
const skins=module.exports;skins.syncSkinProfile({},models);assert.equal(skins.activeSkin().id,'glacier');
for(const model of Object.values(models)){assert.equal(model.userData.skinMaterials.shell.color.getHex(),skins.activeSkin().shell);assert(model.userData.skinDetail.group.visible)}
stored={...stored,active:skins.SEASON_SKINS[0].id};skins.syncSkinProfile({},models);assert.equal(skins.activeSkin(),null,'Season cosmetics cannot bypass claims');
skins.syncSkinProfile({seasonClaims:[stored.active]},models);assert.equal(skins.activeSkin().id,stored.active,'Claimed season skin is shared');
stored={...stored,active:'weekly-tower-king'};skins.syncSkinProfile({timedSkins:[{skinId:stored.active,expiresAt:Date.now()-1000}]},models);assert.equal(skins.activeSkin(),null,'Expired timed reward cannot be equipped');
stored={...stored,active:null};skins.syncSkinProfile({},models);for(const model of Object.values(models))assert(!model.userData.skinDetail.group.visible);
const ancient=fs.readFileSync(new URL('../public/ancient-client.js',import.meta.url),'utf8'),main=fs.readFileSync(new URL('../public/game.js',import.meta.url),'utf8');
assert(main.includes("from './weapon-optics.js?v=20261009-7'"));assert(ancient.includes("from './weapon-optics.js?v=20261009-7'"));assert(!ancient.includes('ancientOptics'));assert(ancient.includes('syncSkinProfile(result.profile,models)'));assert(ancient.includes('skinAds*.38'));assert(ancient.includes('ancientHealthBar'));assert(ancient.includes('ancientRounds'));
console.log('PASS: all seven Main weapon models; shared optic geometries; idempotent rebuild; equipped skin materials and silhouettes; locked/expired checks; clean default; Main ADS skin proportions; separated HUD fields');
