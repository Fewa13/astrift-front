// First-person-only geometry. Kept separate from combat hitboxes and remote actors.
export function createWeaponViewModels(THREE,weapon){
  const models={};
  const box=(group,material,x,y,z,w,h,d,rotation=0)=>{
    const part=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);
    part.position.set(x,y,z);part.rotation.x=rotation;group.add(part);return part;
  };
  const tube=(group,material,x,y,z,r1,r2,length,segments=10)=>{
    const part=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,length,segments),material);
    part.rotation.x=Math.PI/2;part.position.set(x,y,z);group.add(part);return part;
  };
  const materials=(shellColor,accentColor)=>({
    shell:new THREE.MeshStandardMaterial({color:shellColor,metalness:.72,roughness:.35}),
    dark:new THREE.MeshStandardMaterial({color:0x121a20,metalness:.58,roughness:.48}),
    edge:new THREE.MeshStandardMaterial({color:0x647781,metalness:.82,roughness:.25}),
    grip:new THREE.MeshStandardMaterial({color:0x18252a,metalness:.16,roughness:.88}),
    accent:new THREE.MeshStandardMaterial({color:accentColor,emissive:accentColor,emissiveIntensity:.42,metalness:.45,roughness:.32}),
  });
  const start=(key,shellColor,accentColor)=>{
    const group=new THREE.Group();group.position.set(.32,-.28,-.62);weapon.add(group);models[key]=group;
    const finish=materials(shellColor,accentColor);
    group.userData.skinMaterials=finish;
    group.userData.baseColors=Object.fromEntries(Object.entries(finish).map(([slot,material])=>[slot,material.color.getHex()]));
    return {group,...finish};
  };
  const hand=(g,m,x,y,z)=>{
    box(g,m.grip,x,y,z,.19,.12,.24,-.16);
    box(g,m.edge,x-.03,y+.045,z-.07,.13,.026,.08);
  };
  const rail=(g,m,startZ,endZ)=>{
    box(g,m.dark,0,.145,(startZ+endZ)/2,.15,.035,Math.abs(endZ-startZ));
    for(let z=startZ;z>=endZ;z-=.09)box(g,m.edge,0,.17,z,.17,.018,.035);
  };
  const barrel=(g,m,startZ,endZ,r=.035)=>{
    tube(g,m.dark,0,.025,(startZ+endZ)/2,r,r,Math.abs(endZ-startZ));
    tube(g,m.edge,0,.025,endZ+.055,r*1.3,r*1.3,.11);
  };

  {
    const m=start("redline",0x263e49,0xf26556),g=m.group;
    box(g,m.shell,0,0,0,.29,.22,.49);
    box(g,m.dark,0,-.025,-.43,.27,.18,.42);
    box(g,m.edge,0,.105,.03,.29,.035,.39);
    for(const side of [-1,1]){
      box(g,m.edge,side*.149,.005,-.45,.018,.085,.32);
      box(g,m.accent,side*.151,.055,-.41,.009,.018,.22);
    }
    rail(g,m,.17,-.64);barrel(g,m,-.62,-.83,.034);
    box(g,m.dark,0,-.035,.38,.19,.14,.42);
    box(g,m.grip,0,-.21,.17,.11,.27,.13,-.2);
    g.userData.magazine=box(g,m.dark,0,-.23,-.11,.15,.3,.16,-.18);
    box(g,m.edge,0,-.39,-.1,.14,.035,.16);
    box(g,m.edge,.16,.04,.05,.025,.06,.13);
    box(g,m.accent,.178,.042,.06,.008,.018,.045);
    hand(g,m,-.13,-.19,-.39);
  }
  {
    const m=start("hammer",0x53453d,0xffb56a),g=m.group;
    box(g,m.shell,0,0,0,.33,.24,.55);
    box(g,m.dark,0,-.025,-.48,.28,.19,.48);
    box(g,m.edge,0,.12,.01,.31,.035,.45);
    for(const side of [-1,1]){
      box(g,m.edge,side*.165,.005,-.47,.022,.1,.38);
      box(g,m.accent,side*.178,.055,-.42,.012,.02,.23);
    }
    rail(g,m,.2,-.72);barrel(g,m,-.7,-.96,.04);
    box(g,m.dark,0,-.045,.43,.22,.16,.48);
    box(g,m.grip,0,-.23,.18,.12,.29,.15,-.2);
    g.userData.magazine=box(g,m.dark,0,-.22,-.11,.18,.25,.2,-.17);
    box(g,m.edge,0,-.43,-.12,.17,.04,.19);
    hand(g,m,-.14,-.19,-.45);
  }
  {
    const m=start("frost",0x344550,0x79dfff),g=m.group;
    box(g,m.shell,0,0,.045,.255,.2,.59);
    box(g,m.dark,0,-.04,-.39,.19,.14,.51);
    box(g,m.edge,0,.102,.12,.19,.033,.51);
    rail(g,m,.15,-.59);barrel(g,m,-.62,-.91,.027);
    tube(g,m.edge,0,.025,-.88,.05,.05,.09);
    box(g,m.dark,0,-.055,.48,.19,.15,.54);
    box(g,m.grip,0,-.11,.73,.22,.19,.12);
    box(g,m.grip,0,-.23,.2,.1,.27,.14,-.14);
    g.userData.magazine=box(g,m.dark,0,-.2,-.08,.115,.19,.14);
    box(g,m.edge,.18,.035,-.01,.21,.018,.022);
    tube(g,m.edge,.27,.03,-.015,.032,.032,.085,8);
    box(g,m.accent,-.128,.005,-.26,.008,.018,.24);
    hand(g,m,-.12,-.18,-.37);
  }
  {
    const m=start("gale",0x22514f,0x72ffbf),g=m.group;
    box(g,m.shell,0,0,.015,.29,.21,.58);
    box(g,m.dark,0,-.01,-.43,.235,.15,.48);
    box(g,m.edge,0,.104,.015,.28,.026,.49);
    rail(g,m,.19,-.63);barrel(g,m,-.64,-.9,.031);
    for(const side of [-1,1]){
      box(g,m.edge,side*.125,-.01,-.42,.017,.09,.35);
      box(g,m.accent,side*.137,.025,-.4,.008,.018,.2);
    }
    box(g,m.dark,0,-.04,.43,.18,.14,.49);
    box(g,m.grip,0,-.105,.67,.2,.13,.18);
    box(g,m.grip,0,-.22,.18,.115,.27,.14,-.13);
    g.userData.magazine=box(g,m.dark,0,-.23,-.1,.13,.23,.16,-.12);
    box(g,m.edge,.153,.035,.03,.021,.04,.1);
    hand(g,m,-.13,-.19,-.44);
  }
  {
    const m=start("meteor",0x575d3e,0xffba5a),g=m.group;
    tube(g,m.shell,0,.025,-.18,.17,.17,.99,14);
    tube(g,m.dark,0,.025,-.7,.2,.2,.14,14);
    tube(g,m.edge,0,.025,-.81,.165,.165,.11,14);
    tube(g,m.dark,0,.025,.35,.19,.19,.16,14);
    box(g,m.edge,0,.195,-.15,.19,.05,.64);
    rail(g,m,.13,-.48);
    box(g,m.grip,0,-.29,.23,.14,.34,.17,-.12);
    g.userData.magazine=box(g,m.dark,0,-.195,-.39,.23,.11,.18);
    box(g,m.edge,-.21,.03,-.14,.045,.12,.5);
    box(g,m.edge,.21,.03,-.14,.045,.12,.5);
    box(g,m.accent,0,-.095,-.72,.21,.025,.035);
    box(g,m.dark,0,-.055,.55,.23,.16,.22);
    hand(g,m,-.18,-.19,-.37);
  }
  {
    const m=start("shotgun",0x596771,0x68d9e8),g=m.group;
    box(g,m.shell,0,0,.05,.31,.22,.62);box(g,m.dark,0,-.04,-.43,.25,.17,.58);
    barrel(g,m,-.51,-1.03,.065);tube(g,m.edge,0,-.045,-.78,.035,.035,.47);
    box(g,m.grip,0,-.22,.2,.12,.3,.15,-.19);
    g.userData.magazine=box(g,m.dark,0,-.16,-.27,.15,.14,.45);
    box(g,m.accent,0,.13,-.48,.2,.018,.32);hand(g,m,-.14,-.2,-.47);
  }
  {
    const m=start("smg",0x354359,0x8c77ff),g=m.group;
    box(g,m.shell,0,0,-.08,.27,.22,.43);box(g,m.dark,0,-.03,-.39,.24,.17,.34);
    barrel(g,m,-.46,-.72,.036);rail(g,m,.13,-.56);
    box(g,m.grip,0,-.2,.17,.11,.26,.13,-.2);
    g.userData.magazine=box(g,m.dark,0,-.26,-.06,.13,.32,.14,-.11);
    box(g,m.accent,.145,.06,-.25,.012,.025,.22);hand(g,m,-.13,-.18,-.33);
  }
  {
    const m=start("revolver",0x625761,0xffbb82),g=m.group;
    box(g,m.shell,0,.01,-.12,.24,.16,.35);
    tube(g,m.edge,0,-.04,-.13,.12,.12,.18,10);
    barrel(g,m,-.28,-.66,.05);
    box(g,m.grip,0,-.2,.19,.11,.3,.13,-.34);
    g.userData.magazine=box(g,m.dark,0,-.045,-.12,.14,.12,.18);
    box(g,m.accent,0,.13,-.08,.1,.025,.16);
  }
  {
    const m=start("lmg",0x4f5952,0xc7eb68),g=m.group;
    box(g,m.shell,0,0,.04,.36,.27,.7);box(g,m.dark,0,-.02,-.52,.34,.2,.53);
    barrel(g,m,-.66,-1.16,.055);rail(g,m,.21,-.73);
    box(g,m.grip,0,-.22,.22,.13,.3,.16,-.15);
    g.userData.magazine=box(g,m.dark,.15,-.22,-.21,.28,.32,.29);
    for(const side of [-1,1])box(g,m.accent,side*.19,.07,-.5,.016,.025,.38);
    hand(g,m,-.15,-.2,-.5);
  }
  {
    const m=start("autoShotgun",0x53516c,0xff729c),g=m.group;
    box(g,m.shell,0,.01,.01,.34,.24,.57);box(g,m.dark,0,-.02,-.48,.31,.2,.45);
    barrel(g,m,-.6,-.96,.075);rail(g,m,.18,-.7);
    box(g,m.grip,0,-.22,.18,.12,.29,.14,-.17);
    g.userData.magazine=box(g,m.dark,0,-.27,-.17,.25,.3,.27);
    box(g,m.accent,0,.15,-.43,.22,.023,.28);hand(g,m,-.16,-.2,-.43);
  }
  // Each finish has raised metal inlays and light channels; legendary finishes add distinct silhouettes.
  for(const [key,model] of Object.entries(models)){
    const group=new THREE.Group();model.add(group);group.visible=false;
    const plate=new THREE.MeshStandardMaterial({color:0xffffff,metalness:.88,roughness:.2});
    const light=new THREE.MeshStandardMaterial({color:0xffffff,emissive:0xffffff,emissiveIntensity:.8,metalness:.5,roughness:.2});
    const radius=key==='meteor'?.19:key==='hammer'?.17:key==='frost'?.13:.145;
    for(const side of [-1,1]){
      const panel=box(group,plate,side*(radius+.007),.014,-.02,.012,.13,.39);
      panel.rotation.z=side*.12;
      box(group,light,side*(radius+.017),.055,-.16,.014,.014,.23);
      box(group,light,side*(radius+.017),-.043,.09,.014,.012,.12);
      for(let i=0;i<4;i++)box(group,plate,side*(radius+.022),.095,-.16+i*.075,.025,.012,.036);
    }
    const legendary=new THREE.Group(),voidShape=new THREE.Group(),novaShape=new THREE.Group(),tideShape=new THREE.Group();group.add(legendary);legendary.add(voidShape,novaShape,tideShape);
    for(const side of [-1,1]){
      for(let i=0;i<5;i++){
        const spine=box(voidShape,i%2?light:plate,side*(radius+.025),.16+i*.005,-.36+i*.13,.045,.035,.09);
        spine.rotation.z=side*(.32+i*.08);
      }
      for(let i=0;i<4;i++){
        const wing=box(novaShape,i%2?plate:light,side*(radius+.045+i*.014),.08,-.3+i*.18,.04,.08,.12);
        wing.rotation.z=side*(.26+i*.06);
      }
      for(let i=0;i<5;i++){
        const coil=box(tideShape,light,side*(radius+.038),.08,-.36+i*.14,.028,.025,.085);
        coil.rotation.y=side*.35;
      }
    }
    box(voidShape,light,0,.195,-.06,.07,.025,.25);
    box(novaShape,plate,0,.21,-.09,.11,.05,.34);
    box(novaShape,light,0,.24,-.09,.04,.015,.3);
    box(tideShape,light,0,.19,-.09,.045,.025,.5);
    model.userData.skinDetail={group,legendary,void:voidShape,nova:novaShape,tide:tideShape,plate,light};
    model.userData.magazineHome=model.userData.magazine.position.clone();
  }
  return models;
}
