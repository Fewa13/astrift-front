// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
export const POTION_DRINK_MS=2000;
export type PotionDrink={id:string;heal:number;started:number;ends:number};
export type DrinkingActor={hp:number;maxHp?:number;drinking?:PotionDrink};
export function beginPotionDrink(a:DrinkingActor,id:string,heal:number,now=Date.now()){
 if(a.drinking)return '正在喝药';
 if(a.hp<=0)return '请在存活时使用血瓶';
 if(a.hp>=(a.maxHp||100))return '生命值已满';
 a.drinking={id,heal,started:now,ends:now+POTION_DRINK_MS};return null;
}
export function finishPotionDrink(a:DrinkingActor,now=Date.now()){
 const drink=a.drinking;if(!drink)return null;
 if(a.hp<=0){delete a.drinking;return null}
 if(now<drink.ends)return null;
 delete a.drinking;const amount=Math.max(0,Math.min(drink.heal,(a.maxHp||100)-a.hp));a.hp+=amount;return amount;
}
