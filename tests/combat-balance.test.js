import assert from "node:assert/strict";
import test from "node:test";
import {botWeaponDamage} from "../public/combat-balance.js";

test("regular AI guns use their own hit-zone damage", () => {
  const gun = {damage:{head:120,body:72,arm:38}};
  assert.equal(botWeaponDamage(gun,"head",8),120);
  assert.equal(botWeaponDamage(gun,"body",8),72);
  assert.equal(botWeaponDamage(gun,"leg",8),38);
});

test("AI shotgun damage uses pellets and falls with distance", () => {
  const gun = {damage:{head:22,body:18,arm:12},pellets:8,range:42};
  const near = botWeaponDamage(gun,"body",3);
  const far = botWeaponDamage(gun,"body",35);
  assert.equal(near,86);
  assert.ok(far < near);
  assert.ok(far > 0);
});

test("AI rockets use their direct blast damage", () => {
  assert.equal(botWeaponDamage({blastRadius:7,directDamage:125,damage:{}}, "explosion", 5),125);
});
