// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import {emailHarness} from './account-email-check.mjs';
const h=await emailHarness();let alarm=0;h.registryState.storage.setAlarm=async due=>{alarm=due};
h.registryState.storage.sql.exec('INSERT INTO verified_emails VALUES(?,?,?)','mail@example.com','recipient',Date.now());
const mail={id:'test-official-1',title:'测试通知',titleEn:'Test notice',body:'<安全>\n中文正文',bodyEn:'English message'};
await h.registry.publishOfficialMail(mail,['Recipient','Recipient','offline']);assert(alarm>Date.now());
assert.equal(h.registry.officialInbox('recipient').length,1);assert.equal(h.registry.officialInbox('offline').length,1);assert.equal(h.registry.officialInbox('outsider').length,0);
await h.registry.publishOfficialMail(mail,['recipient']);assert.equal(h.registry.officialInbox('recipient').length,1);
const send=h.env.EMAIL.send;h.env.EMAIL.send=async()=>{throw Error('temporary outage')};await h.registry.alarm();assert.equal(h.registry.officialInbox('recipient').length,1,'email failure cannot erase game mail');assert.equal(h.registryState.storage.sql.exec('SELECT attempts FROM official_mail_recipients WHERE account=?','recipient').toArray()[0].attempts,1);
h.env.EMAIL.send=send;h.registryState.storage.sql.exec('UPDATE official_mail_recipients SET next=0');await h.registry.alarm();assert.equal(h.mail.length,1);assert.equal(h.mail[0].to,'mail@example.com');assert(h.mail[0].html.includes('&lt;安全&gt;'));assert.equal(h.mail[0].from.email,'notice-noreply@astrift.com');await h.registry.alarm();assert.equal(h.mail.length,1);
await assert.rejects(()=>h.registry.publishOfficialMail({...mail,id:'ancient-xp-compensation-20261015'},['recipient']));assert.equal(h.newRegistry().officialInbox('recipient').length,1);
const reg=await h.api('register',{name:'InboxTest',password:'Local-test-password-123',device:crypto.randomUUID(),snapshot:{}});assert(reg.body.ok);assert.equal((await h.api('email/inbox',{name:'InboxTest',token:'bad',device:crypto.randomUUID()})).status,401);
assert.equal(h.registry.officialInbox('recipient')[0].readAt,0);assert(h.registry.officialInbox('recipient')[0].createdAt>0);assert(h.registry.officialMailRead('Recipient',mail.id).ok);const stamp=h.registry.officialInbox('recipient')[0].readAt;assert(stamp>0);assert.equal(h.newRegistry().officialInbox('recipient')[0].readAt,stamp);assert.equal(h.registry.officialInbox('offline')[0].readAt,0);assert.equal(h.registry.officialMailRead('outsider',mail.id).ok,false);assert.equal((await h.api('email/read',{name:'InboxTest',token:'bad',device:crypto.randomUUID(),id:mail.id})).status,401);
console.log('PASS: persistent in-game mail, verified-email delivery, retries, idempotency, recipient isolation, retired compensation rejection and authenticated inbox.');
