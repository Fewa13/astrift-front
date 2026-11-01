// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
const STORAGE_KEY='astrift.matchRecovery.v1';
const ONLINE_WINDOW_MS=60_000;
const SOLO_WINDOW_MS=24*60*60*1000;
const MODES=new Set(['normal','duel','ranked','tournament','tri','quad','gunmaster','challenge','ctf','hardpoint','bomb','survival','aiDuel']);

export function readMatchRecovery(){
  try{
    const value=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');
    if(!value||value.version!==1||!MODES.has(value.mode)||typeof value.savedAt!=='number')return null;
    const age=Date.now()-value.savedAt;
    if(age<0||age>(value.online?ONLINE_WINDOW_MS:SOLO_WINDOW_MS))return null;
    if(value.online&&(!(/^[A-Z][0-9][A-Z][0-9][A-Z][0-9]$/.test(value.room||'')||/^[MT][A-F0-9]{25}$/.test(value.room||'')||/^SOLO-[0-9A-F-]{36}$/.test(value.room||''))||typeof value.id!=='string'||value.id.length>48))return null;
    return value;
  }catch{return null}
}

export function writeMatchRecovery(value){
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify({version:1,savedAt:Date.now(),...value}))}catch{}
}

export function clearMatchRecovery(){
  try{localStorage.removeItem(STORAGE_KEY)}catch{}
}
