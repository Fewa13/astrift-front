// Small reusable meshes; none participate in weapon hit tests or collision.
export function createObjectiveWorld(T,scene,BASES,HILLS){
  const group=new T.Group(),flags=[],rings=[];scene.add(group);group.visible=false;
  const colors=[0x55bfff,0xff526e];
  function ring(position,radius,color){const mesh=new T.Mesh(new T.TorusGeometry(radius,.10,5,40),new T.MeshBasicMaterial({color,transparent:true,opacity:.85,depthWrite:false}));mesh.rotation.x=Math.PI/2;mesh.position.set(position[0],.12,position[2]);group.add(mesh);return mesh;}
  for(let team=0;team<2;team++){
    const flag=new T.Group(),mat=new T.MeshBasicMaterial({color:colors[team],side:T.DoubleSide});
    const pole=new T.Mesh(new T.CylinderGeometry(.035,.035,2.6,5),new T.MeshBasicMaterial({color:0xe0e5ef}));pole.position.y=1.3;
    const cloth=new T.Mesh(new T.PlaneGeometry(1.05,.65),mat);cloth.position.set(.51,2.1,0);flag.add(pole,cloth);group.add(flag);flags.push(flag);rings.push(ring(BASES[team],3,colors[team]));
  }
  const hill=ring([0,0,0],1,0xffd16d);
  return {hide(){group.visible=false;},update(state,actorPosition,now){group.visible=true;const ctf=state.mode==='ctf';hill.visible=!ctf;flags.forEach((flag,i)=>{flag.visible=ctf;rings[i].visible=ctf;if(!ctf)return;const f=state.flags[i],p=f.carrier?actorPosition(f.carrier):null;flag.position.set(...(p||f.position));if(f.carrier)flag.position.y+=1.3;flag.rotation.y=now*.00065;});if(!ctf){const h=HILLS[state.hill];hill.position.set(h.position[0],.12,h.position[2]);hill.scale.set(h.radius,h.radius,h.radius);hill.material.color.set(state.contested?0xffe6a0:state.owner===0?colors[0]:state.owner===1?colors[1]:0xffd16d);hill.material.opacity=state.contested?.5+Math.sin(now*.01)*.3:.85;}}};
}

// One navigation grid shared by the AI. Routes are refreshed at most once per second per bot.
export function createObjectiveNavigator(blocked,large=false){
  const size=large?105:53,step=large?3:2,min=large?-156:-52,walk=new Uint8Array(size*size);
  for(let z=0;z<size;z++)for(let x=0;x<size;x++)walk[z*size+x]=!blocked(min+x*step,min+z*step);
  const coords=i=>[min+(i%size)*step,min+Math.floor(i/size)*step];
  // The cover never moves. Build navigable edges once instead of testing every
  // wall again for every node visited by every bot's periodic route refresh.
  const edges=new Uint8Array(walk.length);
  for(let z=0;z<size;z++)for(let x=0;x<size;x++){
    const i=z*size+x;if(!walk[i])continue;
    if(x+1<size&&walk[i+1]&&!blocked(min+x*step+step/2,min+z*step)){edges[i]|=1;edges[i+1]|=2;}
    if(z+1<size&&walk[i+size]&&!blocked(min+x*step,min+z*step+step/2)){edges[i]|=4;edges[i+size]|=8;}
  }
  const nearest=(x,z)=>{const gx=Math.max(0,Math.min(size-1,Math.round((x-min)/step))),gz=Math.max(0,Math.min(size-1,Math.round((z-min)/step)));for(let r=0;r<8;r++)for(let dz=-r;dz<=r;dz++)for(let dx=-r;dx<=r;dx++){const xx=gx+dx,zz=gz+dz;if(xx>=0&&zz>=0&&xx<size&&zz<size&&walk[zz*size+xx])return zz*size+xx;}return gz*size+gx;};
  function path(from,to){
    const start=nearest(from[0],from[2]),end=nearest(to[0],to[2]),prev=new Int32Array(walk.length).fill(-1),queue=new Int32Array(walk.length);let head=0,tail=1;queue[0]=start;prev[start]=start;
    while(head<tail&&prev[end]===-1){const i=queue[head++],mask=edges[i];for(const [bit,offset] of [[1,1],[2,-1],[4,size],[8,-size]]){if(!(mask&bit))continue;const n=i+offset;if(prev[n]!==-1)continue;prev[n]=i;queue[tail++]=n;}}
    if(prev[end]===-1)return [];
    const route=[];for(let i=end;i!==start;i=prev[i])route.push(coords(i));return route.reverse();
  }
  const routes=new Map();
  let routeFrame=-1,buildsThisFrame=0;
  return {clear(){routes.clear();},direction(id,from,to,now){let r=routes.get(id);const frame=Math.floor(now/16);if(frame!==routeFrame){routeFrame=frame;buildsThisFrame=0;}if((!r||now>=r.until||Math.hypot(to[0]-r.goal[0],to[2]-r.goal[2])>4)&&buildsThisFrame<2){buildsThisFrame++;r={route:path(from,to),until:now+1100+Math.random()*350,goal:to};routes.set(id,r);}if(!r){const dx=to[0]-from[0],dz=to[2]-from[2],length=Math.hypot(dx,dz);return length<.7?[0,0]:[dx/length,dz/length];}while(r.route.length&&Math.hypot(from[0]-r.route[0][0],from[2]-r.route[0][1])<1)r.route.shift();const dest=r.route[0]||[to[0],to[2]],dx=dest[0]-from[0],dz=dest[1]-from[2],length=Math.hypot(dx,dz);return length<.7?[0,0]:[dx/length,dz/length];}};
}
