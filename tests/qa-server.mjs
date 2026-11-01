import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'../public');
const before=process.env.ASTRIFT_BASELINE||'/tmp/astrift-before-performance.js';
const server=http.createServer((req,res)=>{
  const url=new URL(req.url,'http://localhost');
  try{
    let body;
    if(url.pathname==='/game.js'){
      const baseline=url.searchParams.has('baseline');
      body=fs.readFileSync(baseline?before:path.join(root,'game.js'),'utf8').replace('https://esm.sh/three@0.180.0','/three.mjs');
      body+=`\nconst qa=document.createElement('aside');qa.style='position:fixed;z-index:999;top:150px;left:20px;background:#000d;color:white;padding:12px;font:14px monospace;max-width:600px';qa.innerHTML='<button id="qaRun">运行固定场景性能测试</button><button id="qaCheck">检查战斗和资源回收</button><pre id="qaResult">${baseline?'旧版':'优化版'} · 本地测试，不部署</pre>';document.body.append(qa);
      document.getElementById('qaRun').onclick=async()=>{
        canvas.requestPointerLock=()=>Promise.resolve();start(false);camera.position.set(0,1.7,38);yaw=0;pitch=0;camera.rotation.set(0,0,0);spawnShieldUntil=Infinity;updateBots=()=>{};
        bots.forEach((b,i)=>{b.position.set((i%5-2)*3,0,25-Math.floor(i/5)*4);b.rotation.set(0,0,0)});
        document.getElementById('qaResult').textContent='预热和采样中…';await new Promise(r=>setTimeout(r,2500));
        let frames=0;const from=performance.now();await new Promise(resolve=>{function tick(){frames++;if(performance.now()-from<2000)requestAnimationFrame(tick);else resolve()}requestAnimationFrame(tick)});
        const el=document.getElementById('weaponSlotsHud'),observer=new MutationObserver(()=>{});observer.observe(el,{childList:true,subtree:true});for(let i=0;i<100;i++)updateHud();const writes=observer.takeRecords().length;observer.disconnect();
        const ray=new THREE.Raycaster(new THREE.Vector3(0,1.7,10),new THREE.Vector3(0,0,-1),0,30),hit=ray.intersectObjects(obstacles,false)[0];
        const result={version:'${baseline?'旧版':'优化版'}',fps:Math.round(frames*1000/(performance.now()-from)),drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,pixelRatio:renderer.getPixelRatio(),shadows:renderer.shadowMap.enabled,unchangedHudWrites:writes,wallHitDistance:hit?.distance,geometry:renderer.info.memory.geometries};
        document.getElementById('qaResult').textContent=JSON.stringify(result,null,2);
      };
      document.getElementById('qaCheck').onclick=async()=>{
        const result=[];const oldTeam=playerTeam;playerTeam=0;hp=100;spawnShieldUntil=Infinity;paused=true;
        const red=bots.find(b=>b.userData.team===1);if(red){red.userData.hp=0;botDown(red);botDown(red);result.push('重复死亡仍只加一分: '+(score===1));}
        for(const [key,slots] of Object.entries(MODS)){for(const id of Object.keys(slots.瞄具)){builds[key].瞄具=id;selectWeapon(key,{equip:false});if(currentOpticId()!==id)throw Error('瞄具错位 '+id)}delete builds[key].瞄具;}result.push('全部瞄具可切换');
        ${baseline?'':`for(let round=0;round<4;round++){for(let i=0;i<100;i++){tracer(new THREE.Vector3(0,1,30),new THREE.Vector3(0,1,10));impactFX(new THREE.Vector3(0,1,20));}result.push('曳光峰值 '+effects.count);await new Promise(r=>setTimeout(r,1200));result.push('特效清理后几何体 '+renderer.info.memory.geometries+' / 活跃曳光 '+effects.count+' / 活跃火花 '+impactEffects.length);}`}
        clearActors();result.push('退出后无角色: '+(bots.length===0&&remotes.size===0));playerTeam=oldTeam;document.getElementById('qaResult').textContent=result.join('\\n');
      };`;
    }else if(url.pathname==='/three.mjs')body=fs.readFileSync(process.env.ASTRIFT_THREE_TEST||'/tmp/astrift-three-test.mjs');
    else{body=fs.readFileSync(path.join(root,url.pathname==='/'?'index.html':url.pathname.slice(1)));if(url.pathname==='/'&&url.searchParams.has('baseline'))body=body.toString().replace('/game.js?v=20260923-perf','/game.js?baseline=1');}
    res.setHeader('Content-Type',/\.(js|mjs)$/.test(url.pathname)?'text/javascript':url.pathname.endsWith('.css')?'text/css':'text/html');res.end(body);
  }catch(error){res.writeHead(500).end(String(error));}
});
server.listen(8790,'127.0.0.1',()=>console.log('Local-only QA: http://127.0.0.1:8790/ and /?baseline=1'));
