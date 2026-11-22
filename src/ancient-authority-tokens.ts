import {AUTHORITY_MAPS,type AuthorityJob} from './ancient-authority.js';
import {ancientMapHeight,tribeCompactZ} from './ancient-rules.js';
// Authored beside identifiable story architecture, never searched around a secret
// or moved to the first random patch of walkable ground. Coordinates are shared
// by rendering and authoritative collection checks.
export const AUTHORITY_SHRINES:Record<string,readonly [number,number,string,string,number,number,string,string]>={
 tribe:[-7,tribeCompactZ(440)+17,'先祖祭坛·日晷','Ancestral altar · sundial',7,tribeCompactZ(945)+17,'王印祭坛·界碑','Royal altar · boundary stone'],
 forest:[76,310,'金曜祭坛·年轮碑','Metal altar · age rings',145,251,'沧澜祭坛·双相碑','Water altar · twin planes'],
 city:[-30,210,'西侧旧宅·停摆钟座','Western house · stopped clock',30,320,'东侧旧宅·裂隙封匣','Eastern house · sealed rift'],
 blight:[-7,275,'净化装置·残存刻度','Purifier · surviving dial',16,390,'深坑门柱·裂隙楔','Pit gateway · rift keystone'],
 sanctum:[-30,125,'西侧祷亭·祈时台','Western pavilion · hour shrine',27,380,'受光器侧·折光封印','Receiver · refraction seal'],
 starfall:[55,165,'沉没拱门·航时记录','Sunken arch · voyage chronicle',-109,140,'珊瑚塔·断层锚','Coral tower · planar anchor'],
 frostcourt:[-35,125,'冰封喷泉·停时刻度','Frozen fountain · still hours',35,190,'钟楼侧·界门残印','Bell tower · portal seal'],
 skyreach:[148,72,'风鸣琴·星时盘','Wind harp · sidereal dial',-8,240,'破碎星轨·空间定标','Broken orbit · spatial datum'],
 dunes:[23,180,'绿洲遗址·流水计时','Oasis ruins · water clock',67,325,'日曜方尖碑·日影界碑','Sun obelisk · shadow boundary']
};
export function authorityTokens(map:string){
 if(!AUTHORITY_MAPS.includes(map as typeof AUTHORITY_MAPS[number]))return [];
 const a=AUTHORITY_SHRINES[map];if(!a)return [];
 return (['timelord','spacelord'] as AuthorityJob[]).map((job,index)=>{const i=index*4,x=a[i] as number,z=a[i+1] as number,p={x,z};return {job,map,...p,y:ancientMapHeight(map,p.x,p.z),name:a[i+2] as string,en:a[i+3] as string};});
}
