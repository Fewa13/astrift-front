// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {PROFESSIONS,SKILLS} from './ancient-skills';
import type {AncientProfile} from './ancient-rules';
export const EXPERIENCE_MAIL={
 id:'ancient-xp-compensation-20261015',date:'2026-10-15',sender:'ASTRIFT',
 title:'升级体验调整与补偿',titleEn:'Progression Update & Compensation',
 body:'此前怪物经验偏低，导致大家升级缓慢。我们对此致以歉意，感谢你的耐心与支持。怪物击杀经验现已从原基础的额外增加15%调整为额外增加20%。请在领取时自选4本当前职业的技能书，可以选择不同技能，也可以重复选择同一种。',
 bodyEn:'Monster XP was too low, making leveling slower than intended. We sincerely apologize and thank you for your patience and support. The monster kill XP bonus has been increased from 15% to 20% above the original base. As compensation, please choose 4 skill books for your current profession when claiming this mail. You may select different skills or multiple copies of the same book.',
 books:4
} as const;
export function mailBookChoices(profile:AncientProfile){return (PROFESSIONS[profile.profession||'']?.skills||[]).map(id=>({id,name:SKILLS[id].name,en:SKILLS[id].en}))}
// Retired mail cannot be claimed by older clients either.
export function claimExperienceMail(_profile:AncientProfile,_id:unknown,_selection:unknown){return 'Mail not found';}
