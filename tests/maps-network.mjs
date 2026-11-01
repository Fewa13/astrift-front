import assert from 'node:assert/strict';

const base=(process.argv[2]||'http://127.0.0.1:8789').replace(/^http/,'ws');
const codes=['A1B2C3','D4E5F6','G7H8J9','K1L2M3'];
async function join(mode,code,id,map,reconnect=false){
  const ws=new WebSocket(`${base}/api/${mode}/${code}`);
  const welcomeType=mode==='ctf'?'objectiveWelcome':mode==='duel'?'duelWelcome':'welcome';
  const welcome=new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>reject(new Error(`${mode} welcome timeout`)),12000);
    ws.addEventListener('message',event=>{const data=JSON.parse(event.data);if(data.type===welcomeType){clearTimeout(timer);resolve(data)}});
    ws.addEventListener('error',reject,{once:true});
  });
  await new Promise((resolve,reject)=>{ws.addEventListener('open',resolve,{once:true});ws.addEventListener('error',reject,{once:true})});
  ws.send(JSON.stringify({type:'join',id,name:id,map,reconnect}));
  return {ws,welcome:await welcome};
}

for(const [index,mode] of ['room','survival','duel','ctf'].entries()){
  const code=codes[index],host=await join(mode,code,`${mode}-host`,'depot');
  const guest=await join(mode,code,`${mode}-guest`,'arcade');
  assert.equal(host.welcome.map,'depot',`${mode}: host chooses map`);
  assert.equal(guest.welcome.map,'depot',`${mode}: guest adopts room map`);
  host.ws.close();guest.ws.close();
}
console.log('PASS room maps: ordinary, survival, duel and objective guests use the host map');
