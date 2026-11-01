// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
export type AncientDamageSource={type:'monster'|'player'|'environment';kind?:string;name?:string;title?:[string,string];level?:number;attack:string};
export type AncientDeathCause=AncientDamageSource & {damage:number;at:number};
// Damage amounts and mitigation are computed by their existing authoritative paths.
// Recording provenance must not change balance, revive a target, or overwrite a lethal hit.
export function applyAncientDamage(target:{hp:number;deathCause?:AncientDeathCause},amount:number,source:AncientDamageSource,now=Date.now()){
 if(target.hp<=0||!Number.isFinite(amount)||amount<=0)return 0;
 const actual=Math.min(target.hp,amount);target.hp=Math.max(0,target.hp-amount);
 if(target.hp===0)target.deathCause={...source,damage:amount,at:now};return actual;
}
