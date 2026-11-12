// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
export type Contribution={name:string;damage:number};
// Equal damage uses the first contributor, never last-hit or random selection.
export function topContributor(entries:Contribution[]){return entries.reduce((best,e)=>!best||e.damage>best.damage?e:best,undefined as Contribution|undefined)?.name}
export function splitContribution(total:number,entries:Contribution[]){const sum=entries.reduce((n,e)=>n+e.damage,0),parts=entries.map(e=>{const exact=total*(e.damage/sum);return {name:e.name,amount:Math.floor(exact),remainder:exact-Math.floor(exact)}});let left=total-parts.reduce((n,p)=>n+p.amount,0);for(const p of [...parts].sort((a,b)=>b.remainder-a.remainder||a.name.localeCompare(b.name)))if(left-->0)p.amount++;return parts.map(({name,amount})=>({name,amount}))}
export function contributionOwner(entries:Contribution[],random=Math.random){let point=random()*entries.reduce((n,e)=>n+e.damage,0);for(const e of entries){point-=e.damage;if(point<0)return e.name}return entries.at(-1)!.name}
