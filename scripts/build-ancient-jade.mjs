// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {build} from 'esbuild';
// Reuse the game's existing Three instance, never bundle a second WebGL library.
const three={name:'reuse-astrift-three',setup(b){b.onResolve({filter:/^three$/},()=>({path:'./three.module.js',external:true}));}};
await build({entryPoints:{'ancient-jade-fusion':'src/ancient-jade-fusion.ts','ancient-jade-quality':'src/ancient-jade-quality.ts','ancient-collections':'src/ancient-collections.ts','ancient-collection-model':'src/jade/collection-model.js','ancient-stonework':'src/ancient-jade-stonework.ts','ancient-jade-workshop':'src/jade/workshop3d.js','ancient-jade-geometry':'src/jade/rock-geometry.js','ancient-jade-core':'src/jade/stone-core.js'},bundle:true,format:'esm',outdir:'public',plugins:[three],banner:{js:'// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.'}});
