// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
// Spell-only tolerances: firearm/body hitboxes remain unchanged.
export const SKILL_CONTACT = {aimPadding:.75,areaPadding:.55,lanePadding:.45,slashRadius:2.8,netFlightRadius:3,netRadius:5,smallNetRadius:2.5,netDuration:4000,smallNetDuration:2000,netTick:500};
const families:Record<string,readonly string[]>={
 warrior:['war-crescent','war-ring','war-lance','war-comet'],
 summoner:['soul-orb','soul-ring','soul-sigil','soul-comet'],
 fire:['flame-orb','flame-ring','flame-comet','meteor-core'],
 ice:['ice-shard','ice-lance','frost-ring','ice-comet'],
 lightning:['thunder-lance','lightning-arc','storm-ring','thunder-sigil'],
 curse:['hex-orb','hex-sigil','hex-ring','hex-comet'],
 swordsman:['jade-crescent','jade-double','jade-ring','jade-lance'],
 shadowblade:['shadow-crescent','shadow-dart','shadow-double','shadow-ring'],
 stonewright:['stone-shard','stone-lance','stone-ring','stone-comet'],
 elementalist:['prism-orb','prism-sigil','prism-ring','prism-comet'],
 voidsword:['void-crescent','void-double','void-ring','void-lance'],
 abyssal:['abyss-orb','abyss-sigil','abyss-ring','abyss-comet'],
 chrono:['time-sigil','time-double','time-ring','time-comet'],
 necromancer:['bone-shard','bone-ring','bone-sigil','bone-comet'],
};
const routeFamilies:Record<string,readonly string[]>={
 berserker:['blood-bolt','blood-sigil','blood-lance','blood-ring'],paladin:['radiant-orb','radiant-ring','radiant-sigil','radiant-lance'],
 spiritcaller:['soul-orb','soul-ring','soul-sigil','soul-comet'],beastlord:['stone-shard','shadow-double','soul-ring','stone-comet'],
 stormcaller:['thunder-sigil','thunder-lance','storm-ring','thunder-comet'],voltstalker:['lightning-arc','thunder-lance','thunder-sigil','lightning-double'],
 crystalist:['crystal-shard','crystal-double','crystal-ring','crystal-comet'],winterwarden:['ice-lance','ice-shard','frost-ring','ice-comet'],
 wildfire:['flame-orb','flame-ring','flame-sigil','meteor-core'],hellfire:['nether-orb','nether-lance','nether-ring','nether-comet'],
 hexweaver:['hex-orb','hex-double','hex-ring','hex-sigil'],pactbinder:['blood-sigil','hex-lance','blood-ring','hex-comet'],
 blademaster:['jade-crescent','jade-ring','jade-double','jade-lance'],linebreaker:['jade-crescent','jade-double','jade-lance','jade-comet'],
 shadowhunter:['shadow-dart','shadow-crescent','shadow-double','shadow-ring'],boundarycutter:['shadow-crescent','shadow-lance','shadow-double','shadow-sigil'],
 mountainguard:['stone-comet','stone-ring','stone-sigil','stone-double'],veinforger:['stone-sigil','stone-lance','stone-comet','stone-ring'],
 'elemental-god':['prism-orb','prism-sigil','prism-ring','prism-comet'],'elemental-ward':['prism-ring','prism-double','prism-sigil','prism-comet'],
 riftlord:['void-crescent','void-double','void-ring','void-lance'],riftduelist:['void-lance','void-crescent','void-double','void-sigil'],
 'abyss-king':['abyss-orb','blood-sigil','abyss-ring','abyss-comet'],'abyss-herald':['hex-shard','abyss-double','hex-ring','abyss-sigil'],
 'time-sovereign':['time-sigil','time-double','time-ring','time-comet'],'time-weaver':['time-orb','time-double','time-sigil','time-ring'],
};
const routeColors:Record<string,readonly [number,number]>={paladin:[0xe4c66e,0xffeabe],beastlord:[0xb39164,0xe5e8ae],voltstalker:[0x887ae9,0xc5e9ff],hellfire:[0xdf477c,0xffb57a],pactbinder:[0xb84d89,0xe7b2e9],boundarycutter:[0xe58fae,0xc6b7f3],riftduelist:[0x7d97e9,0xcad8ff],'abyss-herald':[0x9c73d3,0x8ae2bf],'time-weaver':[0x6cdfcf,0xc7b1f2]};
const palettes:Record<string,readonly [number,number]>={warrior:[0xe95550,0xffc88e],summoner:[0x54dcb4,0xc4ffec],fire:[0xff792e,0xffd16c],ice:[0x70d8f5,0xd3efff],lightning:[0x8fafff,0xd7edff],curse:[0xad65e9,0xe9b6ed],swordsman:[0x49df91,0xc1fbd8],shadowblade:[0x9272d7,0xe9b4e7],stonewright:[0xb58a57,0xf2cb87],elementalist:[0x5bd8ce,0xffc173],voidsword:[0x9b7def,0xd2c8ff],abyssal:[0xd44e76,0xffa98a],chrono:[0xf2c66c,0xa9e7ec],necromancer:[0x7ad982,0xc2b4ef]};
export type SkillFlight={shape:string;color:number;trim:number;radius:number;speed:number;slot:number};
export function skillFlight(job:string,key:string,route=''):SkillFlight{
 const slot=Math.max(0,'XQZC'.indexOf(key)),list=families[job]||families.summoner;
 const shape=routeFamilies[route]?.[slot]||list[slot];
 const colors=routeColors[route]||palettes[job]||palettes.summoner;
 return {shape,color:colors[0],trim:colors[1],radius:shape.includes('crescent')||shape.includes('double')&&/^(jade|void|shadow)/.test(shape)?SKILL_CONTACT.slashRadius:shape.includes('ring')||shape.includes('sigil')?1.1:.7,speed:40,slot};
}

// Only attacks that travel as a projectile. Movement, self buffs, placed fields and
// sword/earth attacks with their own authoritative projectile simulation stay separate.
export const projectileSkills=new Set(['slash','soulbolt','icebolt','frostburst','blizzard','chain','storm','hex','drain','doom','firebolt','firewave','firestorm','inferno','tempest','swordwave','triplecut','swordrain','phantomblade','riftblade','stonefist','faultline','stoneprison','mountainfall','prism','judgment','erosion','voidslash','abysstouch','devour','temporalrift']);
export const projectileRoutes:Record<string,string>={berserker:'X',paladin:'C',stormcaller:'XC',voltstalker:'X',crystalist:'XQC',wildfire:'X',hellfire:'XQZ',hexweaver:'XQZC',pactbinder:'XQC',linebreaker:'XQC',shadowhunter:'X'};
export function isTravelingSkill(id:string,route=''){
 return id.startsWith('advanced:')?/^advanced:[XQZC]$/.test(id)&&!!projectileRoutes[route]?.includes(id.slice(-1)):projectileSkills.has(id);
}
