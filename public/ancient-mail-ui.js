// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {createMailboxView} from './mailbox-view.js?v=20261027-back-1';
export function createAncientMailUI({en,request,onProfile,onBack}){return createMailboxView({en,onBack,read:id=>request('mailRead',{id}),load:()=>request('mailList'),claim:(id,selection)=>request('mailClaim',{id,selection}),onProfile})}
