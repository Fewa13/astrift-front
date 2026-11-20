import assert from 'node:assert/strict';
import {build} from 'esbuild';
const built=await build({stdin:{contents:`export * from './src/ancient-artifacts';export {newAncientProfile} from './src/ancient-rules';`,resolveDir:process.cwd()},bundle:true,write:false,platform:'node',format:'esm'});
const {ARTIFACTS,ARTIFACT_ROUTES,ARTIFACT_TRAILS,artifactMasteryRequirement,artifactClueFound,canStartArtifactTrial,recordArtifactVictory,completeArtifactTrial,newAncientProfile}=await import('data:text/javascript;base64,'+Buffer.from(built.outputFiles[0].text).toString('base64'));
for(const [id,spec] of Object.entries(ARTIFACTS)){
 assert.equal(ARTIFACT_TRAILS[id].length,1);
 if(id==='origin')continue;
 const p=newAncientProfile();p.level=spec.level-1;assert.equal(artifactClueFound(p,id),false);
 p.secrets={[ARTIFACT_ROUTES[id].clue]:2};assert(artifactClueFound(p,id),'old discoveries still count');
 p.secrets={};p.level=spec.level;assert(artifactClueFound(p,id),'required level directly reveals ordinary clues');
 p.mastery={test:{level:ARTIFACT_ROUTES[id].mastery,points:0}};
 for(const kind of spec.targets){recordArtifactVictory(p,kind,.34);assert(!p.artifacts?.[id]?.marks[kind]);recordArtifactVictory(p,kind,1);}
 assert(!canStartArtifactTrial(p,id),'a real relic inspection remains required');
 p.artifacts[id].trail=3;assert(canStartArtifactTrial(p,id),'old multi-trace progress is retained');
 assert(completeArtifactTrial(p,id,0));assert.equal(p.artifacts[id].stage,1);assert(!completeArtifactTrial(p,id,0),'reward cannot be repeated');
 for(let stage=1;stage<=3;stage++){const required=artifactMasteryRequirement(id,stage);assert.equal(required,ARTIFACT_ROUTES[id].mastery+stage*3);p.artifacts[id].stage=stage;p.mastery.test.level=required-1;assert(!canStartArtifactTrial(p,id));p.mastery.test.level=required;assert(canStartArtifactTrial(p,id));}
}
const p=newAncientProfile();p.level=ARTIFACTS.origin.level;p.mastery=Object.fromEntries([0,1,2,3].map(i=>['skill'+i,{level:ARTIFACT_ROUTES.origin.mastery,points:0}]));p.secrets={sanctum:2,forest:2,city:2};assert(!artifactClueFound(p,'origin'));
p.artifacts=Object.fromEntries(Object.keys(ARTIFACTS).filter(id=>id!=='origin').map(id=>[id,{stage:4,marks:{}}]));assert(artifactClueFound(p,'origin'));
console.log('PASS: level-unlocked clues, old discoveries/trails preserved, one trace, one victory per boss, contribution and trial gates, exactly-once ownership and hidden Origin conditions.');
