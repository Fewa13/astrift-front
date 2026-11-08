// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
export function createPuzzleMap(canvas,name,en){
 const ctx=canvas.getContext('2d'),keys=new Set(),down=new Set(['w','a','s','d','arrowup','arrowleft','arrowdown','arrowright']);
 let state=null,pos={x:50,z:80},destination=null,frame=0,last=0;
 function locate(x,z){pos={x:Math.max(8,Math.min(92,x)),z:Math.max(20,Math.min(90,z))};}
 canvas.addEventListener('keydown',event=>{const key=event.key.toLowerCase();if(down.has(key)){event.preventDefault();keys.add(key);destination=null;}});
 canvas.addEventListener('keyup',event=>keys.delete(event.key.toLowerCase()));
 canvas.addEventListener('blur',()=>keys.clear());
 canvas.addEventListener('pointerdown',event=>{const rect=canvas.getBoundingClientRect();destination={x:100*(event.clientX-rect.left)/rect.width,z:100*(event.clientY-rect.top)/rect.height};canvas.focus();});
 function draw(time){
  frame=requestAnimationFrame(draw);
  const dt=Math.min(50,last?time-last:0);last=time;if(!state||!ctx)return;
  let dx=Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('a')||keys.has('arrowleft')),dz=Number(keys.has('s')||keys.has('arrowdown'))-Number(keys.has('w')||keys.has('arrowup'));
  if(destination){dx=destination.x-pos.x;dz=destination.z-pos.z;if(Math.hypot(dx,dz)<1||pos.x===8&&dx<0||pos.x===92&&dx>0||pos.z===20&&dz<0||pos.z===90&&dz>0)destination=null;}
  if(dx||dz){const length=Math.hypot(dx,dz),step=Math.min(.036*dt,destination?length:Infinity);locate(pos.x+step*dx/length,pos.z+step*dz/length);}
  const w=canvas.width,h=canvas.height,X=x=>x*w/100,Z=z=>z*h/100;
  ctx.fillStyle='#0b1622';ctx.fillRect(0,0,w,h);ctx.fillStyle='#18303c';ctx.fillRect(X(6),Z(13),X(88),Z(80));
  ctx.strokeStyle='#294d56';ctx.lineWidth=1;
  for(let x=8;x<=92;x+=7){ctx.beginPath();ctx.moveTo(X(x),Z(17));ctx.lineTo(X(x),Z(92));ctx.stroke();}
  for(let z=20;z<=90;z+=10){ctx.beginPath();ctx.moveTo(X(6),Z(z));ctx.lineTo(X(94),Z(z));ctx.stroke();}
  ctx.fillStyle='#749c98';ctx.fillRect(X(42),0,X(16),Z(13));ctx.fillStyle='#071924';ctx.fillRect(X(43),Z(2),X(14),Z(9));
  ctx.font='bold 13px system-ui';ctx.textAlign='center';ctx.fillStyle='#ccfff1';ctx.fillText(state.complete?(en()?'COMPLETE':'已全部通关'):'#'+state.floor,X(50),Z(8));
  for(let i=0;i<(state.dials?.length||0);i++){
   const x=X(14+72*(i+.5)/state.dials.length),z=Z(22),charge=state.timed?0:state.values[i]/state.dials[i].max;
   ctx.fillStyle='#132130';ctx.fillRect(x-22,z-12,44,29);ctx.strokeStyle='#639889';ctx.strokeRect(x-22,z-12,44,29);
   ctx.fillStyle='#72e5c3';ctx.fillRect(x-19,z+11,38*charge,3);ctx.fillText(String(i+1),x,z+6);
  }
  const players=state.players.filter(p=>p.name!==name()).concat({name:name(),...pos});
  for(const player of players){
   const x=X(player.x),z=Z(player.z),self=player.name===name();ctx.beginPath();ctx.arc(x,z,6,0,Math.PI*2);ctx.fillStyle=self?'#9cffd3':'#ffc986';ctx.fill();
   ctx.font='12px system-ui';ctx.fillStyle='#e9fff9';ctx.fillText(player.name,x,z-9,100);
  }
 }
 frame=requestAnimationFrame(draw);
 return {position:()=>({...pos}),sync(next){if(state?.floor!==next.floor){locate(50,80);destination=null;keys.clear();}state=next;},dispose(){cancelAnimationFrame(frame);}};
}
