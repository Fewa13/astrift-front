// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
const units=['k','m','b','t','qa','qi','sx','sp','oc','no','dc'];
const divisors=units.map((_,i)=>Number('1e'+((i+1)*3)));
const thresholds=units.map((_,i)=>Number('1e'+((i+2)*3)));
const compact=new Intl.NumberFormat('en-US',{maximumFractionDigits:2});
const whole=new Intl.NumberFormat('en-US',{maximumFractionDigits:0});

export function formatAncientNumber(value,fractionDigits=0){
 if(!Number.isFinite(value))return String(value);
 const magnitude=Math.abs(value);
 for(let i=units.length-1;i>=0;i--){
  if(magnitude>=thresholds[i])return compact.format(value/divisors[i])+units[i];
 }
 return (fractionDigits?compact:whole).format(value);
}
