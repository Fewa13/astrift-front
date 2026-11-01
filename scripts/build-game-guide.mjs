// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import fs from 'node:fs';import vm from 'node:vm';import {GUN_PRICES,AMMO_PRICES} from '../public/extraction-economy.js';
const source=fs.readFileSync(new URL('../public/game.js',import.meta.url),'utf8'),literal=source.match(/const WEAPONS=(\{[\s\S]*?\n\});/);if(!literal)throw Error('Game guide: weapon definitions moved; update extraction before building');
const weapons=vm.runInNewContext('('+literal[1]+')',{}, {timeout:1000});
const data=Object.entries(weapons).map(([id,w])=>({id,name:w.name,code:w.name.match(/[A-Z]+\d?\w*/)?.[0]||id,mag:w.mag,interval:w.interval,reload:w.reload,damage:w.damage,range:w.range,pellets:w.pellets||1,price:GUN_PRICES[id]??null,ammo:AMMO_PRICES[id]??null}));
fs.writeFileSync(new URL('../src/game-guide-fps.generated.ts',import.meta.url),'// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.\n// Generated from public/game.js and extraction-economy.js; do not edit.\nexport const GUIDE_FPS = '+JSON.stringify(data)+';\n');
