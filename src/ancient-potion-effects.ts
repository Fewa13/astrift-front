// Timed consumables. Shared by server combat, movement prediction and UI.
export type PotionHolder={boosts?:Record<string,number>};
export const POTION_EFFECTS={duration:600000,speed:.5,berserk:{cooldown:.8,damage:2,speed:.3,incoming:1.5,melee:.7,range:1.1},element:{chance:.2,interval:1000,duration:4000,fireTotal:.3,damage:.2,chain:.15,chainRadius:6}} as const;
export const ELEMENT_POTIONS=['elementFire','elementLightning','elementCurse','elementEarth','elementIce'] as const;
export const potionActive=(a:PotionHolder,id:string,now=Date.now())=>(a.boosts?.[id]||0)>now;
export const potionCooldownMultiplier=(a:PotionHolder,now=Date.now())=>potionActive(a,'berserk',now)?POTION_EFFECTS.berserk.cooldown:1;
export const potionRangeMultiplier=(a:PotionHolder,now=Date.now())=>potionActive(a,'berserk',now)?POTION_EFFECTS.berserk.range:1;
export const potionSpeedMultiplier=(a:PotionHolder,now=Date.now())=>1+(potionActive(a,'speed',now)?POTION_EFFECTS.speed:0)+(potionActive(a,'berserk',now)?POTION_EFFECTS.berserk.speed:0);
export const potionDamageMultiplier=(a:PotionHolder,now=Date.now())=>(potionActive(a,'damage',now)?2:1)*(potionActive(a,'berserk',now)?POTION_EFFECTS.berserk.damage:1);

export const potionCooldownReduction=(base:number,a:PotionHolder,now=Date.now())=>base+(1-base)*(1-potionCooldownMultiplier(a,now));

export const potionIncomingMultiplier=(a:PotionHolder,now=Date.now())=>potionActive(a,'berserk',now)?POTION_EFFECTS.berserk.incoming:1;
export const potionMeleeMultiplier=(a:PotionHolder,now=Date.now())=>potionActive(a,'berserk',now)?POTION_EFFECTS.berserk.melee:1;
