// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
// Do not force the first draw to synchronously wait for linked GPU programs.
export function createAncientRenderWarmup(renderer,{schedule=fn=>setTimeout(fn,0),mark=name=>globalThis.performance?.mark?.(name),warn=error=>console.warn('Ancient shader preparation:',error)}={}){
 let revision=0,pending='',finished=new Set();
 function reset(){revision++;pending='';finished.clear();}
 function ready(scene,camera,key){
  if(finished.has(key))return true;
  if(pending===key)return false;
  pending=key;const version=++revision;mark('ancient:warmup-start:'+key);
  // Yield once so the DOM can paint and a queued menu click can be handled first.
  schedule(()=>{if(version!==revision)return;Promise.resolve().then(()=>renderer.compileAsync?.(scene,camera)).catch(warn).finally(()=>{if(version!==revision)return;finished.add(key);if(finished.size>16)finished.delete(finished.values().next().value);pending='';mark('ancient:warmup-end:'+key);});});
  return false;
 }
 renderer.domElement?.addEventListener('webglcontextrestored',reset);
 return {ready,reset};
}
