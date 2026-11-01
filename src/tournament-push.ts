// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {generateRequestDetails} from 'web-push';
import type {PushSubscription} from 'web-push';

export type PushEnv=Env & {TOURNAMENT_PUSH_PUBLIC_KEY?:string;TOURNAMENT_PUSH_PRIVATE_KEY?:string};
export function validSubscription(value:unknown):value is PushSubscription{
  if(!value||typeof value!=='object')return false;
  const sub=value as Partial<PushSubscription>;
  if(typeof sub.endpoint!=='string'||sub.endpoint.length>2048||!sub.keys||typeof sub.keys.p256dh!=='string'||typeof sub.keys.auth!=='string')return false;
  try{
    const url=new URL(sub.endpoint);
    if(url.protocol!=='https:'||url.port||url.username||url.password||url.hash)return false;
    const host=url.hostname;
    if(!(host==='fcm.googleapis.com'||host==='updates.push.services.mozilla.com'||host==='web.push.apple.com'||host.endsWith('.notify.windows.com')))return false;
    if(!/^[A-Za-z0-9_-]+={0,2}$/.test(sub.keys.p256dh)||!/^[A-Za-z0-9_-]+={0,2}$/.test(sub.keys.auth))return false;
    const publicKey=atob(sub.keys.p256dh.replace(/-/g,'+').replace(/_/g,'/')),auth=atob(sub.keys.auth.replace(/-/g,'+').replace(/_/g,'/'));
    return publicKey.length===65&&publicKey.charCodeAt(0)===4&&auth.length===16;
  }catch{return false}
}
export async function sendTournamentPush(env:PushEnv,subscription:PushSubscription,payload:string){
  if(!env.TOURNAMENT_PUSH_PUBLIC_KEY||!env.TOURNAMENT_PUSH_PRIVATE_KEY)throw Error('Push keys unavailable');
  const request=generateRequestDetails(subscription,payload,{TTL:3600,urgency:'high',vapidDetails:{subject:'https://astrift-front.pages.dev',publicKey:env.TOURNAMENT_PUSH_PUBLIC_KEY,privateKey:env.TOURNAMENT_PUSH_PRIVATE_KEY}});
  const response=await fetch(request.endpoint,{method:'POST',headers:request.headers,body:new Uint8Array(request.body),redirect:'error',signal:AbortSignal.timeout(10_000)});
  await response.body?.cancel();
  return response.status;
}
