// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
export function rankDelta(won:boolean,deaths:number){
  return won?300+100*(10-Math.max(0,Math.min(10,Math.floor(deaths)))):-300;
}

export function seasonStepCost(nextLevel:number){
  const step=Math.max(0,Math.floor(nextLevel)-2);
  return Math.round(1500+40*Math.sqrt(step)+18*step);
}

export function seasonLevel(earned:number){
  const total=Math.max(0,Math.floor(earned));
  let level=1,spent=0;
  while(level<10000&&spent+seasonStepCost(level+1)<=total){level++;spent+=seasonStepCost(level)}
  const title=level<=10?'青铜':level<=20?'白银':level<=30?'黄金':level<=40?'钻石':level<=50?'传说':level<=60?'神话':level<=70?'超凡':level<=80?'战神':`巅峰${level-80}阶`;
  return {level,title,progress:total-spent,next:seasonStepCost(level+1),earned:total};
}

export type RankedAiProfile='advancedPlus'|'master'|'masterLow'|'masterMid'|'masterHigh'|'masterTop';
export function rankedAiProfile(level:number,roll:number):RankedAiProfile{
  const chance=Math.max(0,Math.min(99,Math.floor(roll)));
  if(level<=10)return chance<90?'advancedPlus':'master';
  if(level<=20)return chance<80?'advancedPlus':'master';
  if(level<=30)return chance<50?'advancedPlus':'masterLow';
  if(level<=40)return chance<30?'advancedPlus':chance<70?'masterLow':'masterMid';
  if(level<=50)return chance<50?'masterLow':'masterMid';
  if(level<=60)return chance<30?'masterLow':chance<90?'masterMid':'masterHigh';
  if(level<=70)return chance<80?'masterHigh':'masterMid';
  if(level<=80)return chance<70?'masterHigh':'masterTop';
  return 'masterTop';
}
