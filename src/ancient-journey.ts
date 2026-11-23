import {ancientMonsterXP,ancientKillExperience,xpNeeded,type AncientProfile} from './ancient-rules';
import {ANCIENT_GROWTH} from './ancient-growth';
export function growthOutlook(p:AncientProfile){const reward=ancientKillExperience(ancientMonsterXP('grox',p.level),p.level);return {remaining:Math.max(0,xpNeeded(p.level)-p.xp),sameLevelKills:Math.ceil(Math.max(0,xpNeeded(p.level)-p.xp)/reward),levelsPerStep:ANCIENT_GROWTH.levelsPerStep,lateMultiplier:ANCIENT_GROWTH.stepMultiplier,anchor:ANCIENT_GROWTH.lateAnchor};}
