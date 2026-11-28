// Local-only diagnostics: no account data or telemetry is transmitted.
const samples=[];
export function entryTimer(stage){
 const start=performance.now();
 return (detail={})=>{const row={stage,ms:performance.now()-start,...detail};samples.push(row);if(samples.length>200)samples.shift();performance.measure?.('ancient:'+stage,{start,end:performance.now()});return row;};
}
export const yieldEntry=()=>new Promise(resolve=>requestAnimationFrame(()=>setTimeout(resolve,0)));
export async function entryStage(stage,work){const end=entryTimer(stage);try{return await work()}finally{end()}}
if(typeof window!=='undefined'){
 window.ancientEntryPerformance=()=>samples.map(row=>({...row}));
 if(typeof PerformanceObserver!=='undefined'&&PerformanceObserver.supportedEntryTypes?.includes('longtask'))new PerformanceObserver(list=>{for(const item of list.getEntries()){samples.push({stage:'longtask',ms:item.duration,start:item.startTime});if(samples.length>200)samples.shift()}}).observe({type:'longtask',buffered:true});
}
