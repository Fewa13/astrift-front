import {PROFESSIONS} from './ancient-skills.js';
const el=(tag,text,parent)=>{const n=document.createElement(tag);n.textContent=text;parent.append(n);return n;};
export function createJourneyUI({en,request}){
 let generation=0;
 async function render(parent){const token=++generation,english=en(),L=(a,b)=>english?b:a;el('h2',L('成长与战斗记录','Journey & Combat'),parent);const box=el('section',L('正在读取账户记录…','Loading account records…'),parent);box.className='weaponCard ancientJourneySummary';try{const data=await request('journeyStatus');if(token!==generation||!box.isConnected)return;box.replaceChildren();const g=data.growth;el('h3',L('下一等级','Next level'),box);el('p',L('剩余经验：','XP remaining: ')+g.remaining.toLocaleString()+L('；约相当于 ','; approximately ')+g.sameLevelKills+L('只同级普通怪。',' ordinary enemies at your level.'),box);el('small',L('估算不包含药水、精英或BOSS奖励。220级后同类怪物血量、经验与普通职业基础攻击每20级约3倍，融合职业优势单独计算。','Estimate excludes potions, elites and bosses. After level 220, same-kind enemy HP/XP and ordinary base attack grow about 3× every 20 levels; fusion advantages are separate.'),box);
 el('h3',L('职业实战统计','Profession combat records'),box);el('small',L('从本次更新开始累计，只统计实际扣除的生命值，排除溢出伤害和训练场。不用跨职业总伤害直接判断强弱，培养时间和技能等级也会影响结果。','Recorded from this update. Counts actual HP removed, excluding overkill and training. Time played and skill ranks affect comparisons.'),box);
 const table=el('table','',box),head=el('tr','',table);for(const text of [L('职业','Profession'),L('普攻','Melee'),L('技能','Skills'),L('召唤','Summons'),L('击杀','Kills'),L('死亡','Deaths')])el('th',text,head);
 for(const r of data.battle){const row=el('tr','',table);for(const text of [PROFESSIONS[r.job]?.[english?'en':'name']||r.job,...['weapon','skill','summon','kills','deaths'].map(k=>Math.round(r[k]).toLocaleString())])el('td',text,row)}if(!data.battle.length)el('p',L('进行战斗后会出现记录。','Fight enemies to begin recording.'),box);
 el('h3',L('长期目标','Long-term goals'),box);el('p',L('普通职业圣级 → 技能精通与神器探索 → 融合职业多次点亮 → 对应权柄信物与最终试炼。职业、神器页面可查看自身具体条件。','Ordinary Holy → mastery and artifact exploration → fusion passive ignition → authority tokens and final trials. Open Professions and Artifacts for your requirements.'),box);
 }catch(e){if(box.isConnected)box.textContent=L('读取失败，可重新打开重试：','Could not load; reopen to retry: ')+e.message}}
 return {render};
}
