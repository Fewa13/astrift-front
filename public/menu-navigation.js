// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
const panels=['normalModePanel','specialModePanel','loadoutModePanel'].map(id=>document.getElementById(id));
for(const panel of panels)document.body.append(panel);

function closePanels(){for(const panel of panels)panel.open=false}
for(const [buttonId,panelId] of [['openNormalMode','normalModePanel'],['openSpecialMode','specialModePanel'],['openLoadoutMode','loadoutModePanel']]){
  document.getElementById(buttonId).addEventListener('click',()=>{closePanels();document.getElementById(panelId).open=true});
}

const special=document.getElementById('specialModePanel');
const choices=document.getElementById('specialModeChoices');
const entries=[...special.querySelectorAll('.duelEntry,.objectiveEntry')];
entries.forEach((entry,index)=>{
  entry.classList.add('specialModeEntry');
  const button=document.createElement('button');button.type='button';button.className='specialModeChoice';button.textContent=entry.querySelector('b')?.textContent||`模式 ${index+1}`;
  button.addEventListener('click',()=>{
    for(const [i,item] of entries.entries())item.hidden=i!==index;
    for(const item of choices.children)item.classList.toggle('selected',item===button);
  });
  choices.append(button);
});
choices.firstElementChild?.click();

document.addEventListener('keydown',event=>{
  if(event.key!=='Escape'||!panels.some(panel=>panel.open)||!document.getElementById('menu').classList.contains('active'))return;
  event.preventDefault();event.stopImmediatePropagation();closePanels();
},true);
for(const panel of panels)panel.addEventListener('click',event=>{
  const button=event.target.closest('button');
  if(!button||button.id==='randomRoom'||button.classList.contains('specialModeChoice'))return;
  closePanels();
});
for(const id of ['solo','practice'])document.getElementById(id).addEventListener('click',closePanels);
