// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {PROFESSIONS,SKILLS,hasSkillBook} from './ancient-skills.js?v=20261109-cast-range-60';
export function renderSkillChoices(parent,{profile,en,action}){
 const available=profile.materials?.['supply:skill-choice']||0;if(!available)return;
 const L=(a,b)=>en()?b:a,el=(tag,text,p)=>{const n=document.createElement(tag);n.textContent=text;p.append(n);return n};
 const box=el('section','',parent);box.className='weaponCard ancientSkillChoices';el('h3',L('自选技能书','Selectable Skill Books')+' × '+available,box);el('p',L('点击技能增加一本；可跨职业选择，可只使用一部分，剩余保留。','Tap a skill to add one. Mix professions or use only part; remaining choices stay in your bag.'),box);
 const job=el('select','',box);job.setAttribute('aria-label',L('自选书职业','Skill book profession'));
 for(const [id,d]of Object.entries(PROFESSIONS))if(d.skills.some(hasSkillBook)){const o=el('option',L(d.name,d.en),job);o.value=id}
 if(PROFESSIONS[profile.profession]?.skills.some(hasSkillBook))job.value=profile.profession;
 const grid=el('div','',box);grid.className='ancientActivityFilters';const summary=el('p','',box),use=el('button','',box);use.type='button';const counts={};let sending=false;
 const total=()=>Object.values(counts).reduce((a,b)=>a+b,0);
 function draw(){grid.replaceChildren();for(const id of PROFESSIONS[job.value].skills.filter(hasSkillBook)){const row=el('div','',grid),minus=el('button','−',row),add=el('button',L(SKILLS[id].name,SKILLS[id].en)+' +1 · '+(counts[id]||0),row);minus.type=add.type='button';minus.setAttribute('aria-label',L('减少 ','Remove ')+L(SKILLS[id].name,SKILLS[id].en));minus.disabled=sending||!counts[id];add.disabled=sending||total()>=available;minus.onclick=()=>{counts[id]--;draw()};add.onclick=()=>{if(total()<available)counts[id]=(counts[id]||0)+1;draw()}}summary.textContent=L('已选择 ','Selected ')+total()+' / '+available+' · '+Object.entries(counts).filter(([,n])=>n).map(([id,n])=>L(SKILLS[id].name,SKILLS[id].en)+' × '+n).join(' · ');use.textContent=L('使用已选 ','Use selected ')+total();use.disabled=sending||!total();job.disabled=sending}
 job.onchange=draw;use.onclick=async()=>{if(use.disabled)return;sending=true;draw();try{await action('useSkillChoices',{selection:Object.entries(counts).filter(([,quantity])=>quantity).map(([id,quantity])=>({id,quantity}))})}finally{sending=false;if(box.isConnected)draw()}};draw();
}
