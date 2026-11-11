// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
export const DEFAULT_SKIN='wanderer';
export const SKIN_RARITIES=[['普通','Common'],['稀有','Rare'],['史诗','Epic'],['传说','Legendary'],['神话','Mythic'],['超圣','Transcendent']];
export const SKIN_COLORS=['#c3c9c4','#5bb8df','#ac75ec','#ffca5b','#ee6b99','#e7f9ff'];

const designs=[
 ['wanderer','行旅者','Wanderer',0,0x615547,0xc4a479,0x45484a,'plain'],
 ['reed','苇原斥候','Reed Scout',1,0x405747,0x9b885b,0x353b30,'hood'],
 ['caravan','赤砂商旅','Red Dune Caravaner',1,0x864d35,0xe0aa62,0x48393d,'scarf'],
 ['shore','潮岸守卫','Tidewatch Guard',1,0x355872,0x84b3be,0x313a4b,'guard'],
 ['briar','荆冠猎手','Briar Hunter',2,0x3e584b,0xb1c783,0x333746,'thorn'],
 ['smoke','烟灰剑客','Ash Duelist',2,0x51405c,0xd8a1af,0x282537,'coat'],
 ['kiln','炉心工匠','Kiln Smith',2,0x563c39,0xe88b48,0x313337,'smith'],
 ['sun','日轮骑士','Sunwheel Knight',3,0x855943,0xeec266,0x46303c,'sun'],
 ['glacier','冰川行者','Glacier Walker',3,0x416682,0xb4e9f5,0x333f64,'crystal'],
 ['jackal','金面胡狼','Gilded Jackal',3,0x443d50,0xdab76f,0x2a2733,'jackal'],
 ['moon','月蚀行者','Eclipse Walker',4,0x332650,0xc4a4ef,0x201c34,'moon'],
 ['phoenix','朱焰神使','Vermilion Herald',4,0x8c3a42,0xf4a152,0x49263b,'feather'],
 ['sea','深海君王','Abyssal Regent',4,0x264c57,0x71d4c6,0x263342,'crown'],
 ['star','星门守望者','Stargate Sentinel',5,0x333553,0xa9e9ff,0x20233f,'orbit'],
 ['ivory','白曜裁决者','Ivory Arbiter',5,0xb0a68e,0xffdfa5,0x4a4154,'ivory'],
 ['void','虚空织者','Void Weaver',5,0x392a50,0xe1a6fc,0x241c35,'void'],
] as const;

export const ANCIENT_SKINS=designs.map(([id,zh,en,rarity,cloth,accent,boots,style])=>({id,zh,en,rarity,cloth,accent,boots,style}));
type SkinProfile={profession?:string;ancientSkin?:string;ancientSkinByJob?:Record<string,string>;ancientSkins?:string[]};
export function ownedAncientSkins(profile:SkinProfile):string[]{
 const unlocked=new Set([DEFAULT_SKIN,...(profile.ancientSkins||[])]);
 return ANCIENT_SKINS.filter(skin=>unlocked.has(skin.id)).map(skin=>skin.id);
}
export function equippedAncientSkin(profile:SkinProfile){
 const id=profile.ancientSkinByJob?.[profile.profession||'adventurer']||profile.ancientSkin;
 return id&&ownedAncientSkins(profile).includes(id)?id:DEFAULT_SKIN;
}

export const SKIN_PROFESSIONS={
 warrior:{zh:'战士',en:'Warrior',cloth:0x77463b,accent:0xdfa773},
 summoner:{zh:'召唤师',en:'Summoner',cloth:0x45715e,accent:0x9ee2a3},
 ice:{zh:'冰雪法师',en:'Frost Mage',cloth:0x447391,accent:0xb8efff},
 lightning:{zh:'雷电法师',en:'Lightning Mage',cloth:0x493e83,accent:0xffdf78},
 curse:{zh:'诅咒法师',en:'Curse Mage',cloth:0x563456,accent:0xef90c8},
 swordsman:{zh:'剑术师',en:'Swordmaster',cloth:0x36675a,accent:0xa5ead0},
 shadowblade:{zh:'影刃行者',en:'Shadowblade',cloth:0x373948,accent:0xab9fe0},
 stonewright:{zh:'岩铸师',en:'Stonewright',cloth:0x795b3a,accent:0xffc183},
};
export function ancientProfessionSkins(profession?:string){
 const job=profession&&Object.hasOwn(SKIN_PROFESSIONS,profession)?profession as keyof typeof SKIN_PROFESSIONS:undefined;
 const theme=job&&SKIN_PROFESSIONS[job];
 if(!theme)return ANCIENT_SKINS.map(skin=>({...skin,profession:'adventurer'}));
 return ANCIENT_SKINS.map(skin=>({...skin,profession:job,
  zh:theme.zh+' · '+(skin.rarity?skin.zh:'学徒服'),
  en:theme.en+' · '+(skin.rarity?skin.en:'Apprentice'),
  cloth:theme.cloth,accent:skin.rarity>=2?skin.accent:theme.accent,
 }));
}
