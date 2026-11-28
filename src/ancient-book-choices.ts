// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {hasSkillBook,skillBook,SKILLS} from './ancient-skills';
import type {AncientProfile} from './ancient-rules';
export const SKILL_CHOICE_KEY='supply:skill-choice';
export function useSkillChoices(p:AncientProfile,selection:unknown){
 if(!Array.isArray(selection)||!selection.length||selection.length>Object.keys(SKILLS).length)return 'Invalid skill book selection.';
 const selected=new Map<string,number>();let total=0;
 for(const item of selection){if(!item||typeof item.id!=='string'||!hasSkillBook(item.id)||selected.has(item.id)||!Number.isSafeInteger(item.quantity)||item.quantity<1)return 'Invalid skill book selection.';total+=item.quantity;if(!Number.isSafeInteger(total)||total>(p.materials[SKILL_CHOICE_KEY]||0))return 'Not enough selectable skill books.';selected.set(item.id,item.quantity)}
 for(const [id,n]of selected)if(!Number.isSafeInteger((p.materials[skillBook(id)]||0)+n))return 'Skill book quantity limit reached.';
 for(const [id,n]of selected)p.materials[skillBook(id)]=(p.materials[skillBook(id)]||0)+n;
 p.materials[SKILL_CHOICE_KEY]-=total;return null;
}
