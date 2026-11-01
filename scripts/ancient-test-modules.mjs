// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {build} from 'esbuild';
export * as quests from '../public/ancient-quests.js';
export * as skills from '../public/ancient-skills.js';
const output=await build({entryPoints:[new URL('../src/ancient-skill-combat.ts',import.meta.url).pathname],bundle:true,write:false,format:'esm',platform:'node'});
export const combat=await import('data:text/javascript;base64,'+Buffer.from(output.outputFiles[0].text).toString('base64'));
