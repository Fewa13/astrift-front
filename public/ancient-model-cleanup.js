// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
// Instance buffers belong to a mesh; geometry/material templates belong to caches.
export function releaseAncientInstances(root){root.traverse(o=>{if(o.isInstancedMesh)o.dispose();});root.removeFromParent();}
