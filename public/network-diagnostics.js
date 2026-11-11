// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
// Static hosts have no API server; resolve requests without relying on a boot shim.
const BACKENDS=['https://play.astrift.com','https://astrift-front.fewa3729.workers.dev'];
function preferredBackend(){try{const value=sessionStorage.getItem('astrift.apiBackend.v1');return BACKENDS.includes(value)?value:null}catch{return null}}
function rememberBackend(origin){try{sessionStorage.setItem('astrift.apiBackend.v1',origin)}catch{}if(globalThis.window)window.__ASTRIFT_API_ORIGIN__=origin}
function trustedPage(){
 const origin=globalThis.location?.origin||'';
 return ['https://astrift.com','https://www.astrift.com',...BACKENDS,'https://astrift-front.surge.sh','https://astrift-front.web.app','https://astrift-front.firebaseapp.com','https://astrift.codeberg.page','https://astrift-2b44b8.gitlab.io','https://cadencepark-iusd.my.canva.site','https://www.canva.com'].includes(origin)||/^https:\/\/[0-9]{1,20}-atari-embeds\.googleusercontent\.com$/.test(origin)||/^https:\/\/[a-z0-9-]+\.canvacode\.com$/.test(origin)||origin==='null';
}
export function apiURL(path){
 const page=globalThis.location;
 const host=page?.hostname||'';
 const native=['play.astrift.com','astrift-front.fewa3729.workers.dev','localhost','127.0.0.1'].includes(host);
 const mirror=host.endsWith('.surge.sh')||host.endsWith('.web.app')||host.endsWith('.firebaseapp.com');
 const origin=mirror?'https://play.astrift.com':native?page.origin:(globalThis.window?.__ASTRIFT_API_ORIGIN__||'https://play.astrift.com');
 const preferred=trustedPage()?preferredBackend():null;
 if(preferred&&globalThis.window)window.__ASTRIFT_API_ORIGIN__=preferred;
 return (preferred||origin)+path;
}
export function networkReport(input,error){
 const page=globalThis.location,raw=input instanceof Request?input.url:String(input);let endpoint='';
 try{const url=new URL(raw,page?.href||'https://play.astrift.com');if(raw.startsWith('/api/')&&globalThis.window?.__ASTRIFT_API_ORIGIN__)url.host=new URL(window.__ASTRIFT_API_ORIGIN__).host;endpoint=url.origin+url.pathname}catch{endpoint='Unknown endpoint'}
 return ['ASTRIFT · 网络诊断 / Network diagnostics','时间 / Time: '+new Date().toISOString(),'页面来源 / Page origin: '+(page?.origin||'unknown'),'请求地址 / Endpoint: '+endpoint,'浏览器错误 / Browser error: '+String(error?.name||'Error')+': '+String(error?.message||'Unknown error').slice(0,300),'网络状态 / Browser network status: '+(globalThis.navigator?.onLine===false?'离线 / Offline':'在线（不代表服务器可达） / Online (server reachability unknown)'),'', '可能原因：网络或扩展拦截、DNS、连接故障、服务器不可用或 CORS。','Possible causes: network/extension filtering, DNS, connection failure, server outage or CORS.','浏览器没有向游戏公开具体原因，无法仅凭 Failed to fetch 确认。','The browser does not expose the underlying cause to the game. Failed to fetch alone cannot identify it.','本报告不包含账号、密码、验证码、登录令牌或请求内容。','No account details, passwords, verification codes, tokens or request bodies are included.'].join('\n');
}
export function showNetworkFailure(input,error){
 const report=networkReport(input,error);if(!globalThis.document?.body)return report;
 try{
  let panel=document.getElementById('astriftNetworkFailure');
  if(!panel){panel=document.createElement('section');panel.id='astriftNetworkFailure';panel.setAttribute('data-no-translate','');panel.style.cssText='position:fixed;z-index:2147483646;bottom:20px;left:50%;transform:translateX(-50%);width:min(540px,calc(100vw - 28px));max-height:70dvh;overflow:auto;background:#102330;color:#e7f5fa;border:1px solid #548895;border-radius:10px;padding:16px;font:14px system-ui;box-sizing:border-box;box-shadow:0 8px 40px #0009;pointer-events:auto';document.body.append(panel)}
  panel.replaceChildren();panel.hidden=false;
  const el=(tag,text)=>{const node=document.createElement(tag);node.textContent=text;panel.append(node);return node};
  el('strong','连接失败 / Connection failed');el('p','无法连接游戏服务器。 / Cannot reach the game server.');
  const details=el('details',''),summary=document.createElement('summary');summary.textContent='查看诊断 / View diagnostics';details.append(summary);const pre=document.createElement('pre');pre.textContent=report;pre.style.cssText='white-space:pre-wrap;overflow-wrap:anywhere;font:12px monospace;user-select:text';details.append(pre);
  const close=el('button','关闭 / Close');
  close.type='button';
  close.style.cssText='padding:10px 14px;margin-top:8px;background:#0a1721;color:#dff7ff;border:1px solid #548895;border-radius:4px;cursor:pointer;font:inherit';
  close.onclick=()=>{panel.hidden=true};

 }catch{/* Diagnostics must never replace the original request error. */}
 return report;
}
// A registration may have committed even when its response was lost.
// Authenticate against the same account backend before attempting another create.
async function recoverRegistration(target,init,body,fetchImpl){
 if(typeof body?.name!=='string'||typeof body?.password!=='string'||typeof body?.device!=='string')return null;
 const url=new URL(String(target));url.pathname='/api/account/login';url.search='';
 const controller=new AbortController(),abort=()=>controller.abort();
 if(init.signal?.aborted)throw new DOMException('Aborted','AbortError');
 init.signal?.addEventListener('abort',abort,{once:true});const timer=setTimeout(abort,7000);
 try{
  const response=await fetchImpl(url.href,{...init,method:'POST',headers:{...init.headers,'Content-Type':'application/json'},body:JSON.stringify({name:body.name,password:body.password,device:body.device}),signal:controller.signal,cache:'no-store'});
  let data;try{data=await response.clone().json()}catch{return null}
  if(response.ok&&data?.ok&&typeof data.token==='string'&&data.profile){rememberBackend(url.origin);return Response.json({...data,registrationRecovered:true},{status:response.status})}
  if([403,429].includes(response.status)&&data?.error)return response;
  return null;
 }catch(error){if(init.signal?.aborted)throw error;return null}
 finally{clearTimeout(timer);init.signal?.removeEventListener('abort',abort)}
}
export async function diagnosticFetch(input,init={},fetchImpl=(...args)=>fetch(...args)){
 const url=new URL(String(input),globalThis.location?.href||BACKENDS[0]);
 let body;try{body=JSON.parse(init.body||'{}')}catch{}
 // Auth connection recovery is bounded to our known backends. Other mutations
 // (purchases, mail, resets and the one-use admin challenge) are never replayed.
 const registration=url.pathname==='/api/account/register';
 const safe=['/api/account/register','/api/account/login','/api/account/check','/api/account/profile'].includes(url.pathname)||url.pathname==='/api/ancient/profile'&&body?.action==='profile'||url.pathname==='/api/admin'&&['auth1','state'].includes(body?.action);
 const retry=safe&&trustedPage()&&BACKENDS.includes(url.origin);
 const targets=retry?[url.href,...BACKENDS.filter(o=>o!==url.origin).map(o=>o+url.pathname+url.search)]:[input];
 let lastError;
 for(let i=0;i<targets.length;i++){
  if(registration&&retry&&i>0){const recovered=await recoverRegistration(targets[i],init,body,fetchImpl);if(recovered)return recovered}
  const controller=new AbortController(),abort=()=>controller.abort();let timer;
  if(init.signal?.aborted)throw new DOMException('Aborted','AbortError');
  init.signal?.addEventListener('abort',abort,{once:true});
  if(retry)timer=setTimeout(abort,url.pathname==='/api/ancient/profile'?3000:7000);
  try{
   const response=await fetchImpl(targets[i],retry?{...init,signal:controller.signal}:init);
   let invalid=false;
   if(retry&&typeof response.clone==='function'){
    try{const data=await response.clone().json();invalid=!data||typeof data!=='object'||(!('ok' in data)&&!('error' in data))}catch{invalid=true}
    if([502,503,504].includes(response.status))invalid=true;
   }
   if(invalid){lastError=Error('服务器响应无效');if(i+1<targets.length)continue;throw lastError}
   if(registration&&retry&&i>0&&typeof response.clone==='function'){let data;try{data=await response.clone().json()}catch{}if(data?.error==='账号名已被使用'){const recovered=await recoverRegistration(targets[i],init,body,fetchImpl);if(recovered)return recovered}}
   if(retry)rememberBackend(new URL(String(targets[i])).origin);
   return response;
  }catch(error){
   if(init.signal?.aborted||error?.name==='AbortError'&&!controller.signal.aborted)throw error;
   lastError=error?.name==='AbortError'?new TypeError('Server connection timed out'):error;
   if(i+1===targets.length){if(lastError?.name!=='AbortError')showNetworkFailure(targets[i],lastError);throw lastError}
  }finally{clearTimeout(timer);init.signal?.removeEventListener('abort',abort)}
 }
 throw lastError;
}
