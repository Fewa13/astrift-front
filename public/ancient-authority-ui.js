import {openSkillPreview} from './ancient-skill-preview.js';
import * as T from './three.module.js';
import {authorityTokens} from './ancient-authority-tokens.js';
import {AUTHORITY_MAPS,AUTHORITY_MAP_NAMES,AUTHORITY_JOBS,AUTHORITY_DESCRIPTIONS,authorityRequirements} from './ancient-authority.js';
import {PROFESSIONS} from './ancient-skills.js';
export function renderAuthorityPanel(host,{p,en,el,btn,action,request,join}){
 const L=(a,b)=>en()?b:a;const section=el('details','',host);section.className='ancientAscensionEntry';el('summary',L('权柄职业 · 时间与空间','Authority · Time and Space'),section);
 for(const [job,def]of Object.entries(AUTHORITY_JOBS)){const box=el('article','',section);box.className='weaponCard';el('h3',def.icon+' '+L(def.name,def.en),box);btn(L('3D 技能与外观预览','3D skills and appearance preview'),()=>openSkillPreview(job,{en}),box);const r=p.authority?.[job],req=authorityRequirements(p,job,PROFESSIONS);
 el('p',L('寻找每张官方主线地图中的独立信物，修炼圆满后挑战最终权柄试炼。','Find an independent token in every official story map, perfect your prerequisite profession, then challenge the final trial.'),box);
 el('span',L('信物','Tokens')+' · '+(r?.tokens.length||0)+' / '+AUTHORITY_MAPS.length,box);
 el('small',AUTHORITY_MAPS.map(map=>(r?.tokens.includes(map)?'◆ ':'◇ ')+L(...AUTHORITY_MAP_NAMES[map])).join(' · '),box);
 el('p',(req.trained?'✓ ':'◇ ')+L(PROFESSIONS[def.source].name+'全部技能及二、三、四次点亮被动达到12级',PROFESSIONS[def.source].en+': every active and ignited passive at level 12'),box);
 el('p',(req.holy?'✓ ':'◇ ')+L('其余全部普通职业达到圣级（已消耗职业保留圣级记录）','All ordinary professions Holy, including saved records of consumed professions'),box);
 for(const id of PROFESSIONS[job].skills)el('small',L(...AUTHORITY_DESCRIPTIONS[id]),box);
 if(r?.unlocked)el('strong',L('权柄已获得，可在其他职业中转职','Authority earned. Equip from Other professions.'),box);
 else if(!r?.submitted){const b=btn(L('提交全部信物 · 永久开启试炼','Submit all tokens · unlock trial permanently'),()=>action('authoritySubmit',{job}),box);b.disabled=!(req.tokens&&req.trained&&req.holy);}
 else{el('small',L('每天2次 · 连战同级、+5、+10、+20级BOSS · 禁用全部消耗品','Two attempts daily · Bosses at +0/+5/+10/+20 · No consumables'),box);const b=btn(L('进入最终试炼','Enter the final trial'),async()=>{b.disabled=true;try{const result=await request('authorityStart',{job});if(result.ok===false)throw Error(result.error);if(result.dungeonState?.run)await join(result.dungeonState.run.map);}catch(e){alert(e.message);}finally{b.disabled=false;}},box);b.disabled=p.profession!==def.source;}
 }
}
export function createAuthorityTokens({scene,camera,getMap,getProfile,getPlayer,send,en,clear}){
 const root=new T.Group();scene.add(root);let map='',items=[],near;const button=document.createElement('button');button.style.cssText='position:fixed;left:50%;bottom:26%;transform:translateX(-50%);z-index:22;background:#172638;color:#e1f9ff;border:1px solid #bba7e8;padding:12px;border-radius:8px';button.hidden=true;document.body.append(button);
 const geometry=new T.OctahedronGeometry(.38),ring=new T.TorusGeometry(.65,.045,5,32),mat=new T.MeshBasicMaterial({color:0xa9ede8}),space=new T.MeshBasicMaterial({color:0xc7a7ff});
 function interact(){if(!near)return false;send({type:'authorityToken',job:near.job});return true;}button.onclick=interact;
 return {interact,update(active,paused){if(map!==getMap()){map=getMap();root.clear();items=authorityTokens(map).map(t=>{const g=new T.Group(),m=t.job==='timelord'?mat:space;g.add(new T.Mesh(geometry,m));const r=new T.Mesh(ring,m);r.rotation.x=t.job==='timelord'?0:Math.PI/4;g.add(r);g.position.set(t.x,t.y+.85,t.z);root.add(g);return {...t,g};});}near=null;for(const t of items){t.g.visible=active&&!getProfile()?.authority?.[t.job]?.tokens.includes(map);if(t.g.visible){t.g.rotation.y+=.008;if(!paused&&getPlayer()?.hp>0&&Math.hypot(camera.position.x-t.x,camera.position.z-t.z)<2.8&&Math.abs(camera.position.y-t.y)<3&&clear(camera.position.x,camera.position.y,camera.position.z,t.x,t.y+.7,t.z))near=t;}}button.hidden=!near;if(near)button.textContent='F · '+(en()?AUTHORITY_JOBS[near.job].en+' Token':AUTHORITY_JOBS[near.job].name+'信物');}};
}
