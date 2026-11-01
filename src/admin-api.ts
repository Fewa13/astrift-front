// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {adminRewardCatalog,cleanMailRewards} from './admin-rewards';
import {emailDigest} from './account-email';
import type {OfficialMail} from './official-mail';
export async function adminAPI(request:Request,env:Env){
 const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
 if(request.method!=='POST')return json({error:'仅支持POST'},405);
 if(!request.headers.get('Content-Type')?.startsWith('application/json')||Number(request.headers.get('Content-Length')||0)>64000)return json({error:'请求格式无效或过大'},400);
 let body:Record<string,any>;try{const raw=await request.text();if(raw.length>64000)throw Error();body=JSON.parse(raw);if(!body||Array.isArray(body)||typeof body!=='object')throw Error()}catch{return json({error:'请求格式无效'},400)}
 const registry=env.ACCOUNT_SESSIONS.getByName('global-v1'),ip=await emailDigest(request.headers.get('CF-Connecting-IP')||'unknown'),action=String(body.action||''),token=typeof body.adminToken==='string'?body.adminToken:'';
 if(action==='auth1'||action==='auth2'){if(typeof body.password!=='string'||body.password.length>128)return json({error:'密码格式无效'},400);const result=await registry.adminLogin(action==='auth1'?1:2,body.password,ip,String(body.challenge||''));return json(result,result.ok?200:401)}
 if(!await registry.adminValid(token,ip))return json({error:'管理员身份已失效，请重新验证两层密码'},401);
 if(action==='logout'){await registry.adminLogout(token);return json({ok:true})}
 if(action==='guideStatus')return json({ok:true,...await registry.gameGuideStatus()});
 if(action==='guideTest'){const result=await registry.gameGuide('admin-guide-probe',{operation:'ask',category:'skills',language:'zh',question:'如何升华圣级职业',skillLevel:1});return json({...result,diagnostics:await registry.gameGuideStatus()})}
 const world=env.ANCIENT_WORLDS.getByName('tribe-v1');
 if(action==='state'){const ancient=await world.adminPlayers(),names=new Set(ancient.map(p=>p.name));for(const name of await registry.knownAccounts())if(!names.has(name))ancient.push({name,level:0});return json({ok:true,players:ancient,rewards:adminRewardCatalog(),...await registry.adminState()})}

 if(action==='mapReviews')return json({ok:true,maps:await world.adminCommunityMaps()});
 if(action==='mapReview'){try{return json(await world.adminCommunityReview(Number(body.mapId),Number(body.revision),body.approve===true,String(body.reason||'')))}catch(e){return json({error:e instanceof Error?e.message:'Review failed'},409)}}
 const id=typeof body.id==='string'?body.id:'';if(!/^[0-9a-f-]{36}$/i.test(id))return json({error:'操作编号无效'},400);
 const target=String(body.target||'').trim().normalize('NFKC').toLowerCase(),validTarget=/^[-_\p{L}\p{N}]{2,14}$/u.test(target);
 if(action==='ban'||action==='unban'){
  if(!validTarget||!await env.PLAYER_ACCOUNTS.getByName('account:'+target).exists())return json({error:'账号不存在'},404);
  if(action==='unban'){await registry.adminUnban(id,target);return json({ok:true})}
  const factors:Record<string,number>={seconds:1,minutes:60,hours:3600,days:86400},permanent=body.unit==='permanent';
  const seconds=permanent?null:Number(body.duration)*factors[String(body.unit)];if(!permanent&&(!Number.isSafeInteger(seconds)||seconds!<=0||seconds!>3153600000))return json({error:'封禁时间无效（最多100年，可选永久）'},400);
  const reason=String(body.reason||'').trim().slice(0,500),ban=await registry.adminBan(id,target,seconds,reason);await world.disconnect(target);await registry.kickBannedRooms(target);return json({ok:true,ban});
 }
 if(action==='publish'){
  const mode=String(body.mode||'');if(!['announcement','game-mail','email'].includes(mode))return json({error:'发送类型无效'},400);
  const title=String(body.title||'').trim(),content=String(body.content||'').trim();if(!title||title.length>120||/[\r\n]/.test(title)||!content||content.length>10000)return json({error:'请填写标题（最多120字）和内容（最多10000字）'},400);
  const rewards=cleanMailRewards(body.rewards);if(!rewards||mode==='email'&&rewards.length)return json({error:'奖励无效；绑定邮箱单发不支持附件奖励'},400);
  let recipients:string[]=[];
  if(mode==='announcement'){recipients=Array.from(new Set([...(await world.adminPlayers()).map(p=>p.name),...await registry.knownAccounts()]))}
  else{if(!validTarget||!await env.PLAYER_ACCOUNTS.getByName('account:'+target).exists())return json({error:'账号不存在'},404);if(mode==='email'&&!await registry.accountEmail(target))return json({error:'该账号尚未绑定已验证邮箱'},400);recipients=[target]}
  if(recipients.length>1000)return json({error:'收件人数超过1000，暂不能一次发布'},400);
  const catalog=adminRewardCatalog(),signed=content+'\n\nSincerely,\nAstrift Front Team';
  const mail:OfficialMail={id:'admin-'+id,title,titleEn:title,body:signed,bodyEn:signed,channel:mode==='email'?'email':mode==='announcement'&&body.sendEmail===true?'both':'game',announcement:mode==='announcement',rewards:rewards.map(r=>({...r,name:catalog.find(c=>c.key===r.key)!.name,en:catalog.find(c=>c.key===r.key)!.en}))};
  try{const result=await registry.adminPublish(mail,recipients);return json({...result,recipients:recipients.length,queuedEmail:mail.channel!=='game'})}catch(error){return json({error:error instanceof Error?error.message:'发布失败'},400)}
 }
 return json({error:'管理操作不存在'},404);
}
