// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
export function createAncientDeathUI({container,en,node,button,respawn,watch,leave}){
 let signature='',dead=false,respawnButton=null;
 const L=(a,b)=>en()?b:a;
 function clear(){dead=false;signature='';respawnButton=null;container.hidden=true;container.replaceChildren();}
 function update({you,players=[],dungeon},now=Date.now()){
  if(you.hp>0){if(dead)clear();return false;}
  const entered=!dead;dead=true;container.hidden=false;
  const alive=players.filter(p=>p.hp>0),key=JSON.stringify([en(),dungeon?.id||!!dungeon,dungeon?alive.map(p=>p.name).sort():[]]);
  if(key!==signature){signature=key;container.replaceChildren();respawnButton=null;node('strong',L('倒下了','You fell'),container);
   if(dungeon){node('small',alive.length?L('队友仍可继续挑战','Your teammates can continue'):L('本次挑战结束','Run ended'),container);for(const p of alive)button(L('观战 ','Watch ')+p.name,()=>watch(p.name),container);button(L('离开地穴','Leave Hollow'),leave,container);}
   else respawnButton=button(L('返回营地','Return to camp'),respawn,container);
  }
  if(respawnButton)respawnButton.disabled=now-you.deadAt<3000;
  return entered;
 }
 return {update,clear};
}
