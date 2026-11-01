import assert from 'node:assert/strict';
import {loadSensitivity,saveSensitivity,lookMultiplier} from '../public/look-sensitivity.js';
const data=new Map();globalThis.localStorage={getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value)};
assert.equal(loadSensitivity(),1);assert.equal(saveSensitivity(2),2);assert.equal(loadSensitivity(),2);
assert.equal(loadSensitivity(true),2);data.clear();assert.equal(loadSensitivity(true),1.5);saveSensitivity(1);assert.equal(loadSensitivity(true),1.5);saveSensitivity(2.3,true);assert.equal(loadSensitivity(true),2.3);assert.equal(loadSensitivity(),1);
assert.equal(lookMultiplier(2,4,0),2);assert.equal(lookMultiplier(2,4,1),.5);assert.equal(lookMultiplier(1,4,1),.25);
assert.equal(saveSensitivity(100),5);assert.equal(saveSensitivity(-1),1);assert.equal(saveSensitivity('broken'),1);
console.log('PASS: sensitivity defaults to 1, bounded and persisted, desktop/touch share multiplier with ADS zoom scaling.');
