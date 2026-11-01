// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
export function createAncientConnection({session,map,origin,onSocket,onMessage,onStatus:statusSink,onDisconnect,onReady=()=>{},fetchImpl=fetch,socketFactory=url=>new WebSocket(url),setTimer=setTimeout,clearTimer=clearTimeout,now=Date.now,staleAfter=5500,disconnectAfter=8000,ackTimeout=6000,online=()=>typeof navigator==='undefined'||navigator.onLine!==false}){
 let enabled=false,generation=0,socket=null,request=null,retryTimer=0,watchdog=0,healthTimer=0,attempts=0,ready=false,welcomed=false,lastStateAt=0,lastServerTime=0;const outstanding=new Map();
 function onStatus(state,error,details={}){statusSink(state,error,{attempts,...details})}
 function setReady(value){if(ready===value)return;ready=value;onReady(value)}
 function clearHealth(){clearTimer(watchdog);clearTimer(healthTimer);watchdog=healthTimer=0;outstanding.clear();welcomed=false;setReady(false)}
 function stop(){enabled=false;generation++;clearTimer(retryTimer);retryTimer=0;clearHealth();request?.abort();request=null;const old=socket;socket=null;onSocket(null);if(old){old.onclose=old.onerror=old.onmessage=null;try{if(old.readyState===1)old.send(JSON.stringify({type:'leave'}))}catch{}try{old.close()}catch{}}onStatus('idle')}
 function schedule(){if(!enabled)return;clearTimer(retryTimer);if(!online()){onStatus('offline');return}const delay=Math.min(10000,2000*2**Math.min(attempts++,3));onStatus('retrying',undefined,{retryAt:now()+delay,busy:false});retryTimer=setTimer(()=>{retryTimer=0;void connect(true)},delay)}
 function dropped(ws){if(!enabled||socket!==ws)return;clearHealth();socket=null;onSocket(null);ws.onclose=ws.onerror=ws.onmessage=null;try{ws.close()}catch{}onDisconnect();schedule()}
 function guard(ws,ms){clearTimer(watchdog);watchdog=setTimer(()=>dropped(ws),ms)}
 function checkHealth(ws){if(!enabled||socket!==ws||!welcomed)return false;if(ws.readyState>1){dropped(ws);return false}const age=now()-lastStateAt,oldest=outstanding.values().next().value,ackAge=oldest===undefined?0:now()-oldest;
  if(age>=disconnectAfter||ackAge>=ackTimeout){dropped(ws);return false}
  if(age>=staleAfter||ackAge>=staleAfter){if(ready){setReady(false);onStatus('syncing',undefined,{reason:ackAge>=staleAfter?'movement':'world'})}return false}
  return true;
 }
 function monitor(ws){clearTimer(healthTimer);healthTimer=setTimer(()=>{healthTimer=0;checkHealth(ws);if(enabled&&socket===ws)monitor(ws)},1000)}
 async function connect(reconnect){
  const epoch=++generation,current=session();if(!enabled)return;if(!online()){onStatus('offline');return}if(!current){enabled=false;setReady(false);onStatus('auth');return}
  const controller=new AbortController();request=controller;const timeout=setTimer(()=>controller.abort(),12000);
  try{
   onStatus(reconnect?'retrying':'connecting',undefined,{busy:true});
   const response=await fetchImpl('/api/ancient/profile',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...current,action:'ticket',map:map()}),cache:'no-store',signal:controller.signal});
   if(epoch!==generation||!enabled)return;
   if(response.status===401||response.status===403){enabled=false;setReady(false);onStatus('auth');return}
   let data;try{data=await response.json()}catch{throw Error('Invalid server response')}
   if(!response.ok||!data?.ok||typeof data.ticket!=='string'){if(response.status===409){enabled=false;onStatus('error',data?.error);return}throw Error('Ticket request failed')}
   if(epoch!==generation||!enabled)return;
   const url=new URL('/api/ancient/connect',origin());url.protocol=url.protocol==='https:'?'wss:':'ws:';url.searchParams.set('ticket',data.ticket);url.searchParams.set('map',map());url.searchParams.set('resume',reconnect?'1':'0');
   const ws=socketFactory(url);socket=ws;welcomed=false;lastServerTime=0;outstanding.clear();onSocket(ws);guard(ws,12000);
   ws.onmessage=event=>{
    if(socket!==ws||epoch!==generation||!enabled)return;let data;try{data=JSON.parse(event.data)}catch{return}
    if(data.type==='sessionEnded'){stop();onDisconnect();onStatus('auth');return}
    const authoritative=data.type==='welcome'||data.type==='state';
    if(data.type==='state'&&Number.isFinite(data.time)&&lastServerTime&&data.time<=lastServerTime)return;
    try{onMessage(data,reconnect)}catch(error){console.error('Ancient world message could not be applied:',data.type,error instanceof Error?error.message:String(error));if(authoritative)dropped(ws);return}
    if(socket!==ws||!enabled)return;
    if(data.type==='welcome'){welcomed=true;attempts=0;outstanding.clear()}
    if(welcomed&&authoritative){lastStateAt=now();if(Number.isFinite(data.time))lastServerTime=data.time;const ack=data.you?.moveSeq;if(Number.isSafeInteger(ack))for(const seq of outstanding.keys())if(seq<=ack)outstanding.delete(seq);if(!checkHealth(ws))return;if(socket!==ws||!enabled)return;guard(ws,disconnectAfter);if(!ready){setReady(true);onStatus('ready')}monitor(ws)}
   };
   ws.onclose=()=>dropped(ws);ws.onerror=()=>dropped(ws);
  }catch{if(enabled&&epoch===generation)schedule()}
  finally{clearTimer(timeout);if(request===controller)request=null}
 }
 return {
  start(reconnect=false){stop();enabled=true;attempts=0;return connect(reconnect)},stop,
  isReady(){const oldest=outstanding.values().next().value;return (oldest===undefined||now()-oldest<staleAfter)&&enabled&&!!socket&&(socket.readyState===undefined||socket.readyState===1)&&ready&&now()-lastStateAt<staleAfter},
  sentMove(seq){if(welcomed&&Number.isSafeInteger(seq)&&!outstanding.has(seq)){outstanding.set(seq,now());while(outstanding.size>256)outstanding.delete(outstanding.keys().next().value)}},
  networkChanged(){if(!enabled)return;if(online()){this.retryNow();return}generation++;request?.abort();request=null;clearTimer(retryTimer);retryTimer=0;const old=socket;socket=null;clearHealth();onSocket(null);if(old){old.onclose=old.onerror=old.onmessage=null;try{old.close()}catch{}}onDisconnect();onStatus('offline')},
  retryNow(force=false){if(!enabled)return;if(force&&socket)dropped(socket);if(socket)checkHealth(socket);if(!socket&&!request){clearTimer(retryTimer);retryTimer=0;void connect(true)}}
 };
}
