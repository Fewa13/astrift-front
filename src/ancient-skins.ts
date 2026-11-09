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
const towerRewards=['reed','briar','sun','moon','star'];
type SkinProfile={ancientSkin?:string;ancientSkins?:string[];tower?:{best:number}};
export function ownedAncientSkins(profile:SkinProfile):string[]{
 const unlocked=new Set([DEFAULT_SKIN,...(profile.ancientSkins||[]),...towerRewards.filter((_,i)=>(profile.tower?.best||0)>=(i+1)*20)]);
 return ANCIENT_SKINS.filter(skin=>unlocked.has(skin.id)).map(skin=>skin.id);
}
export function equippedAncientSkin(profile:SkinProfile){
 return profile.ancientSkin&&ownedAncientSkins(profile).includes(profile.ancientSkin)?profile.ancientSkin:DEFAULT_SKIN;
}
