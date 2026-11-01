// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {BEAD_LIMIT} from './ancient-collections.js?v=20261021-jade-wear-1';
// Older live world sessions may not recognize the newer bulk operation yet.
// Fall back ONLY on an unsupported-operation response, never on a network error.
export async function weaveCollections(request,name,onProfile=()=>{}){
 const call=async(action,data={})=>{const r=await request(action,data);if(!r||r.ok===false||r.error)throw Error(r?.error||'Collection request failed');if(r.profile)onProfile(r.profile);return r;};
 try{return await call('collectionAutoString');}
 catch(e){if(!['操作无效','Invalid action','Invalid operation','Invalid collection action'].includes(e.message))throw e;}
 let result=await call('tradeState');
 const profile=result.profile;if(!profile||!Array.isArray(profile.collections))throw Error('Collection request failed');
 const reserved=new Set((result.tradeState?.deal?.offers?.[name.toLowerCase()]?.items||[]).filter(i=>i.type==='collection').map(i=>i.id)),groups=new Map();
 for(const item of profile.collections)if(item.kind==='bead'&&item.parts.length===1&&!reserved.has(item.id)){const group=groups.get(item.size)||[];group.push(item.id);groups.set(item.size,group);}
 for(const [,ids]of [...groups].sort((a,b)=>a[0]-b[0])){
  let offset=0;while(ids.length-offset>=2){const remaining=ids.length-offset,count=remaining===BEAD_LIMIT+1?BEAD_LIMIT-1:Math.min(BEAD_LIMIT,remaining),batch=ids.slice(offset,offset+count);offset+=count;result=await call('collectionString',{ids:batch});}
 }
 return result;
}
