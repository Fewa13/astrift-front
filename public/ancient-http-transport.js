// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
export class AncientHttpTransport {
 constructor(url,session,origin){
  this.readyState=0;
  this.connection='';
  this.pending=[];
  this.ack=0;
  this.session=session;
  this.origin=origin;
  this.controller=null;
  this.timer=0;
  const query=new URL(url).searchParams;
  this.map=query.get('map');
  this.version=query.get('clientVersion');
  queueMicrotask(()=>this.connect(query));
 }
 async request(body){
  this.controller=new AbortController();
  const timeout=setTimeout(()=>this.controller?.abort(),12000);
  try{
   const response=await fetch(this.origin+'/api/ancient/http',{
    method:'POST',headers:{'Content-Type':'application/json'},credentials:'omit',cache:'no-store',
    signal:this.controller.signal,body:JSON.stringify({...this.session(),...body})
   });
   const data=await response.json();
   if(!response.ok||!data.ok)throw Error(data.error||'World connection failed');
   return data;
  }finally{clearTimeout(timeout);this.controller=null;}
 }
 async connect(query){
  try{
   const result=await this.request({action:'connect',ticket:query.get('ticket'),map:this.map,resume:query.get('resume')==='1',clientVersion:this.version});
   if(this.readyState===3)return;
   this.connection=result.connection;
   this.readyState=1;
   this.onopen?.({});
   await this.poll();
  }catch(error){this.fail(error);}
 }
 send(text){
  if(this.readyState!==1)throw Error('Connection is closed');
  const message=JSON.parse(text);
  if(message.type==='move'){
   const index=this.pending.findIndex(item=>item.type==='move');
   if(index>=0)this.pending.splice(index,1);
  }
  if(message.type==='heartbeat'&&this.pending.some(item=>item.type==='heartbeat'))return;
  if(this.pending.length>=64){this.fail(Error('World command queue overflow'));return;}
  this.pending.push(message);
 }
 async poll(){
  if(this.readyState!==1)return;
  try{
   const result=await this.request({action:'exchange',connection:this.connection,ack:this.ack,messages:this.pending.splice(0,64)});
   if(this.readyState!==1)return;
   for(const message of result.messages){
    if(this.readyState!==1)return;
    if(message.seq<=this.ack)continue;
    this.onmessage?.({data:JSON.stringify(message.data)});
    this.ack=message.seq;
   }
   this.timer=setTimeout(()=>void this.poll(),150);
  }catch(error){this.fail(error);}
 }
 fail(error){
  if(this.readyState===3)return;
  this.close();
  this.onerror?.({error});
  this.onclose?.({code:1006});
 }
 close(){
  clearTimeout(this.timer);
  this.controller?.abort();
  if(this.readyState===1&&this.connection&&this.pending.some(message=>message.type==='leave')){
   void fetch(this.origin+'/api/ancient/http',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'omit',keepalive:true,
    body:JSON.stringify({...this.session(),action:'exchange',connection:this.connection,ack:this.ack,messages:[{type:'leave'}]})
   }).catch(()=>{});
  }
  this.readyState=3;
 }
}
