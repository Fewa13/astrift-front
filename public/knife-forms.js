// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
// Independent, hand-authored profiles; dimensions stay within combat-knife scale.
const form=(blade,width,length,guardStyle='swept',inlay=null)=>{
 const guards={swept:[[-width*.8,-.055],[-width,-.01],[-width,.055],[-.055,.018],[.055,.018],[width,.055],[width,-.01],[width*.8,-.055]],straight:[[-width,-.045],[width,-.045],[width,.045],[-width,.045]],wing:[[-width,-.09],[-width*.7,.09],[-.05,.035],[.05,.035],[width*.7,.09],[width,-.09],[.06,-.035],[-.06,-.035]],compact:[[-width,-.04],[width*.7,-.04],[width,.045],[-width*.75,.045]]};
 const side=blade.slice(1,Math.ceil(blade.length/2)+1);
 return {blade,edge:[...side,...side.map(([x,y])=>[x*.8,y*.96+.01]).reverse()],guard:[width*2,.065,.095],guardProfile:guards[guardStyle],handle:[.12,.105,length],pommel:[.15,.12,.07],channel:[.012,.006,.31],channelZ:-.3,inlay:inlay||[[-.009,.17],[.009,.17],[.011,.57],[0,.68],[-.011,.57]]};
};
export const KNIFE_FORMS={
 froststeel:form([[-.072,0],[.072,0],[.077,.57],[.025,.84],[-.045,1.01],[-.072,.71]],.12,.39,'compact'),
 rustcopper:form([[-.1,0],[.095,0],[.145,.47],[.13,.67],[.06,.81],[-.075,.82],[-.11,.64]],.15,.36,'straight'),
 aurorablade:form([[-.065,0],[.075,0],[.125,.32],[.155,.59],[.09,.85],[-.075,1.04],[-.028,.72],[-.09,.39]],.15,.4,'swept',[[.005,.15],[.027,.24],[.078,.55],[.066,.7],[.054,.57]]),
 redobsidian:form([[-.075,0],[.082,0],[.1,.59],[.055,.82],[-.078,.94],[-.084,.62]],.11,.38,'compact'),
 starfall:form([[-.057,0],[.057,0],[.07,.73],[.044,1.04],[-.065,1.13],[-.063,.75]],.15,.43,'swept'),
 phasebreak:form([[-.075,0],[.075,0],[.09,.36],[.059,.78],[0,1.12],[-.059,.78],[-.09,.36]],.17,.39,'wing',[[0,.12],[.026,.31],[0,.84],[-.026,.31]]),
 'knife-draw-comet':form([[-.055,0],[.064,0],[.07,.49],[.11,.74],[.025,.98],[-.054,.72]],.1,.38,'compact'),
 'knife-draw-tide':form([[-.085,0],[.06,0],[.13,.34],[.17,.68],[.075,.92],[-.105,1.02],[-.015,.68],[-.075,.39]],.14,.4,'swept',[[.012,.17],[.038,.29],[.098,.62],[.072,.72],[.066,.55]]),
 'knife-draw-ember':form([[-.105,0],[.095,0],[.115,.38],[.17,.62],[.038,.87],[-.082,.71],[-.116,.42]],.125,.36,'compact'),
 'knife-draw-ghost':form([[-.039,0],[.039,0],[.045,.69],[0,1.15],[-.045,.69]],.095,.44,'straight'),
 'knife-draw-thunder':form([[-.087,0],[.069,0],[.077,.74],[.032,1.01],[-.087,.84],[-.043,.7],[-.096,.6],[-.046,.51],[-.105,.4]],.155,.39,'wing'),
 'knife-draw-verdant':form([[-.054,0],[.06,0],[.123,.35],[.147,.58],[.085,.82],[.01,1.05],[-.067,.82],[-.113,.56],[-.09,.32]],.135,.42,'swept',[[0,.16],[.039,.31],[.054,.61],[.01,.85],[-.01,.58]]),
 'knife-draw-eclipse':form([[-.068,0],[.07,0],[.12,.23],[.2,.4],[.22,.6],[.16,.78],[.025,.91],[-.078,.92],[.07,.74],[.099,.57],[.077,.39],[-.051,.28]],.12,.36,'compact',[[.016,.17],[.049,.25],[.146,.48],[.141,.63],[.114,.52]]),
 'knife-draw-crown':form([[-.065,0],[.066,0],[.097,.22],[.084,.59],[.036,.91],[0,1.16],[-.036,.91],[-.084,.59],[-.097,.22]],.185,.41,'wing',[[0,.13],[.032,.29],[.022,.58],[0,.92],[-.022,.58],[-.032,.29]]),
 'knife-event-warrior-gold':form([[-.055,0],[.058,0],[.076,.71],[.09,.96],[.033,1.17],[-.056,1.08],[-.07,.68]],.16,.44,'swept',[[.001,.16],[.017,.18],[.033,.76],[.018,.93],[.013,.73]]),
 'knife-event-warrior-silver':form([[-.06,0],[.06,0],[.079,.45],[.037,.82],[0,1.14],[-.037,.82],[-.079,.45]],.17,.4,'straight'),
 'knife-event-warrior-bronze':form([[-.092,0],[.074,0],[.125,.52],[.063,.68],[-.055,.95],[-.11,.68]],.145,.39,'compact'),
 'knife-event-ranked-apex':form([[-.038,0],[.041,0],[.061,.19],[.045,.89],[0,1.21],[-.045,.89],[-.061,.19]],.16,.44,'wing',[[0,.14],[.017,.23],[0,.99],[-.017,.23]]),
 'knife-event-breach-apex':form([[-.073,0],[.073,0],[.11,.21],[.1,.66],[.04,.97],[-.085,.9],[-.086,.41]],.13,.4,'compact',[[.005,.19],[.025,.22],[.029,.65],[.008,.81],[-.005,.6]])
};
export function knifePreviewSVG(skin){
 const f=KNIFE_FORMS[skin.id]||KNIFE_FORMS.froststeel,path=p=>'M'+p.map(v=>v.join(',')).join('L')+'Z',color=k=>'#'+skin[k].toString(16).padStart(6,'0'),id='blade-'+skin.id;
 return `<svg viewBox="0 0 280 140" aria-hidden="true"><defs><linearGradient id="${id}"><stop stop-color="${color('edge')}"/><stop offset=".22" stop-color="${color('shell')}"/><stop offset=".65" stop-color="${color('dark')}"/><stop offset="1" stop-color="${color('edge')}"/></linearGradient></defs><g transform="translate(119 95) rotate(48) scale(100 -100)"><rect x="-.06" y="-.46" width=".12" height=".4" rx=".025" fill="${color('grip')}" stroke="${color('dark')}" stroke-width=".018"/><path d="${path(f.guardProfile)}" fill="${color('dark')}" stroke="${color('edge')}" stroke-width=".007"/><path d="${path(f.blade)}" fill="url(#${id})"/><path d="${path(f.edge)}" fill="${color('edge')}"/><path d="${path(f.inlay)}" fill="${color('accent')}"/><rect x="-.073" y="-.49" width=".146" height=".065" rx=".012" fill="${color('shell')}"/></g></svg>`;
}
