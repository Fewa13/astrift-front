// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
const KEY='astrift.lookSensitivity.v1';
const TOUCH_KEY='astrift.touchSensitivity.v1';
export const normalizeSensitivity=value=>Number.isFinite(Number(value))&&Number(value)>0?Math.max(.1,Math.min(5,Number(value))):1;
export function loadSensitivity(mobile=false){try{const value=localStorage.getItem(mobile?TOUCH_KEY:KEY);if(value!==null)return normalizeSensitivity(value);if(mobile){const legacy=localStorage.getItem(KEY);return legacy!==null&&normalizeSensitivity(legacy)!==1?normalizeSensitivity(legacy):1.5}return 1}catch{return mobile?1.5:1}}
export function saveSensitivity(value,mobile=false){const normalized=normalizeSensitivity(value);try{localStorage.setItem(mobile?TOUCH_KEY:KEY,String(normalized))}catch{}return normalized}
export function lookMultiplier(sensitivity,zoom,blend){return normalizeSensitivity(sensitivity)*(1+(1/Math.max(1,zoom||1)-1)*Math.max(0,Math.min(1,blend)))}
