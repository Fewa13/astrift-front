// Shared late-game scale, calibrated to ordinary professions. Fusion bonuses
// deliberately never enter monster stats or progression requirements.
export const ANCIENT_GROWTH={lateAnchor:220,levelsPerStep:20,stepMultiplier:3,ordinaryHealthPerAttack:18,normalKillsAt300:80} as const;
export function ancientLateGrowth(level:number){return ANCIENT_GROWTH.stepMultiplier**((Math.max(ANCIENT_GROWTH.lateAnchor,level)-ANCIENT_GROWTH.lateAnchor)/ANCIENT_GROWTH.levelsPerStep)}
