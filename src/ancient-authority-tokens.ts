import {AUTHORITY_MAPS,AUTHORITY_JOBS,type AuthorityJob} from './ancient-authority.js';
import {mapSecret} from './ancient-quests.js';
import {blocked,ancientMapHeight} from './ancient-rules.js';
export function authorityTokens(map:string){if(!AUTHORITY_MAPS.includes(map as typeof AUTHORITY_MAPS[number]))return [];const secret=mapSecret(map);if(!secret)return [];return (Object.keys(AUTHORITY_JOBS) as AuthorityJob[]).flatMap((job,index)=>{for(let radius=5;radius<=22;radius+=2)for(let i=0;i<16;i++){const angle=i*Math.PI/8+index*Math.PI,x=secret.x+Math.cos(angle)*radius,z=secret.z+Math.sin(angle)*radius,y=ancientMapHeight(map,x,z);if(!blocked(x,z,1,map,y)&&Math.hypot(x-secret.x,z-secret.z)>4)return [{job,map,x,y,z}];}return [];});}
