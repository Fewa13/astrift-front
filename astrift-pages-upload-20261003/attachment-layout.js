// One physical slot per attachment. IDs and effects remain unchanged.
export const ATTACHMENT_MOVES = {
  frost: {
    lowLight:'瞄具', dualScope:'瞄具', flashHider:'枪口', suppressor:'枪口',
    floating:'枪管', carbon:'枪管', thumb:'枪托与握把', sandbag:'特殊',
    straightBolt:'弹匣', singleLoader:'弹匣', fragRound:'弹药', subsonic:'弹药'
  },
  redline: {
    flipMagnifier:'瞄具', iron:'瞄具', suppressor:'枪口', comboMuzzle:'枪口',
    heavyHandguard:'护木', vented:'护木', shortGrip:'握把', supportGrip:'握把',
    balancedStock:'枪托', bullpup:'枪托', quadMag:'弹匣', coupledMag:'弹匣',
    hollow:'弹药', lowRecoil:'弹药', visibleLaser:'激光与导轨'
  },
  gale: {
    galeBipod:'特殊', galeLaser:'激光与导轨', galeThermal:'瞄具', galeCarbon:'护木',
    galeBuffer:'枪托', galeCalibrator:'特殊', galeQuiet:'弹药', galeCoupled:'弹匣',
    galeBalanced:'握把', galeIff:'激光与导轨', galeFlash:'激光与导轨'
  },
  meteor: {
    digitalRange:'瞄具', nightSight:'瞄具', cluster:'弹头', concussion:'弹头',
    smoke:'弹头', fireWarhead:'弹头', twoStage:'发动机', ricochet:'弹头',
    bunker:'引信', safety:'引信', remoteFuse:'引信', gyro:'尾翼与发射管', triple:'装填与携行'
  }
};

export function organizeAttachments(catalog) {
  for (const [weapon, moves] of Object.entries(ATTACHMENT_MOVES)) {
    const slots=catalog[weapon], extra=slots.战术扩展;
    for (const [id,slot] of Object.entries(moves)) {
      if (!extra?.[id]) continue;
      (slots[slot]??={})[id]=extra[id];
      delete extra[id];
    }
    if (extra && !Object.keys(extra).length) delete slots.战术扩展;
  }
  // These launcher parts were also filed under recoil control by mistake.
  for (const id of ['fastReload','dual']) {
    const slots=catalog.meteor;
    if (slots.操控[id]) { slots.装填与携行[id]=slots.操控[id]; delete slots.操控[id]; }
  }
}

export function migrateBuilds(builds,catalog) {
  const result=structuredClone(builds), conflicts=[];
  for (const [weapon,slots] of Object.entries(catalog)) {
    const build=result[weapon]??={};
    const relocations={战术扩展:ATTACHMENT_MOVES[weapon], ...(weapon==='meteor'?{操控:{fastReload:'装填与携行',dual:'装填与携行'}}:{})};
    for (const [source,moves] of Object.entries(relocations)) {
      const id=build[source], target=moves?.[id];
      if (!target) continue;
      // Keep the already selected physical-slot part; never stack two magazines/scopes.
      if (build[target] && build[target]!==id) conflicts.push(`${weapon}: ${catalog[weapon][target]?.[id]?.[0]||id}`);
      else build[target]=id;
      delete build[source];
    }
    for (const [slot,id] of Object.entries(build)) if (!slots[slot]?.[id]) delete build[slot];
  }
  return {builds:result,conflicts};
}
