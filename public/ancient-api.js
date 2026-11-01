// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {showNetworkFailure,apiURL,diagnosticFetch} from './network-diagnostics.js?v=20261027-backend-fallback-1';
export function createAncientAPI({fallback,session,fetchImpl=diagnosticFetch,readTimeout=8000,writeTimeout=15000,setTimer=setTimeout,clearTimer=clearTimeout}){
 return async function request(path,body){
  if(path!=='ancient/profile')return fallback(path,body);
  const read=body?.action==='profile',attempts=read?2:1;
  for(let attempt=0;attempt<attempts;attempt++){
   const controller=new AbortController();let timer,timedOut=false;
   try{
    const timeout=new Promise((_,reject)=>{timer=setTimer(()=>{timedOut=true;controller.abort();reject(Error('ANCIENT_REQUEST_TIMEOUT'))},read?readTimeout:writeTimeout)});
    return await Promise.race([timeout,(async()=>{const response=await fetchImpl(apiURL('/api/'+path),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...body,device:session()?.device||body?.device}),cache:'no-store',signal:controller.signal});let result;try{result=await response.json()}catch{throw Error('服务器响应无效')}if(response.status===401)return fallback(path,body);if(!response.ok||!result?.ok)throw Error(result?.error||'请求失败');return result;})()]);
   }catch(error){
    if(read&&attempt+1<attempts&&(timedOut||error instanceof TypeError))continue;
    if(timedOut){showNetworkFailure('/api/'+path,Error('ANCIENT_REQUEST_TIMEOUT'));throw Error('ANCIENT_REQUEST_TIMEOUT')}if(error instanceof TypeError)showNetworkFailure('/api/'+path,error);throw error;
   }finally{clearTimer(timer)}
  }
 };
}
