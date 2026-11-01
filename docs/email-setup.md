<!-- © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved. -->
# Astrift domain email

Configured on 2026-10-25 (America/Los_Angeles).

| Purpose | Address | Incoming mail |
| --- | --- | --- |
| Player support | help@astrift.com | Forward to the owner's verified Gmail destination |
| Email verification | verify-noreply@astrift.com | Drop replies |
| Password recovery | reset-noreply@astrift.com | Drop replies |
| Account security | security-noreply@astrift.com | Drop replies |
| Transactional game notices | notice-noreply@astrift.com | Drop replies |

Cloudflare Email Routing and Email Sending are enabled for astrift.com.
Inbound MX/SPF, outbound cf-bounce MX/SPF/DKIM and DMARC are configured.
Routing is explicit; no catch-all forwarding is enabled.

The owner confirmed receipt of both tests:
- notice-noreply@astrift.com to the verified Gmail destination.
- notice-noreply@astrift.com to help@astrift.com, forwarded to the verified Gmail destination.

## Current limitations

This is a forwarding alias, not an independently hosted mailbox with its own password.
Gmail replies use the Gmail address until Gmail's Send mail as/SMTP is configured.
Registered players may optionally link one email, verified with a six-digit code.
Settings → Account exposes linking later. Linked emails work as login identifiers.
Password recovery verifies an emailed code, rotates the password salt/hash and
revokes old sessions. Verification and recovery use different sender addresses.
Codes expire after 10 minutes, allow five attempts, are single-use and only stored
as SHA-256 hashes. Sends have a 60-second cooldown and durable per-IP/email limits.
No arbitrary subject/body/sender public send-email endpoint is exposed.

## Game integration

Transactional email is sent by the rate-limited account backend using the EMAIL
Cloudflare send_email binding. AccountEmailStore selects the sender by purpose.
Keep email credentials and sending tokens out of browser code and single-HTML exports.
Surge, Firebase and other approved game frontends can use the same backend API; the
frontend hosting domain does not change the sender's @astrift.com address.
No-reply emails should direct users to help@astrift.com for support.

## Management

Run from /Users/jingfeng/Documents/astrift-front:

```sh
node node_modules/wrangler/bin/wrangler.js email routing rules list astrift.com
node node_modules/wrangler/bin/wrangler.js email routing addresses list
node node_modules/wrangler/bin/wrangler.js email sending settings astrift.com
node node_modules/wrangler/bin/wrangler.js email sending dns get astrift.com
```

Do not recreate routing rules without checking the existing rules; duplicate rules
make support routing harder to audit. Domain/DNS settings are persistent and are
not removed by normal Worker, Surge or Firebase deployments.

## 官方游戏邮件

`AccountSessionRegistry.publishOfficialMail(mail, accounts)` 是仅供服务端调用的投递方法，目前没有开放发布 HTTP 接口。邮件 ID 幂等，游戏内保存到指定账号，同时向发布时已验证绑定的邮箱投递。离线玩家仍可收信，未绑定邮箱只保留游戏内版本；发送失败由持久化闹钟重试，最多六次。外部邮件发送在服务进程异常时可能重试重复投递，不能承诺跨供应商 exactly-once。验证码不进入游戏内邮箱。

旧 `ancient-xp-compensation-20261015` 已下架且不能再领取，已发放奖励不回收。Ancient 邮件入口和设置→账号→官方邮件读取同一份记录。没有向真实玩家发布测试通知。

## 玩家连接问题报告

连接失败面板提供「发送问题报告」，通过 `/api/account/problem-report`（可未登录提交，保持来源检查）发往 `help@astrift.com`，由已有路由转发至客服 Gmail。固定收件人、固定发件人 `notice-noreply@astrift.com`，客户端不能指定邮件地址或主题。报告不发送请求正文、账号密码、验证码、令牌；请求地址去掉查询参数。邮件中的客户端文本转义为纯文本展示。

服务端在 AccountSessionRegistry 的 SQLite 中保存限流和幂等回执：设备每5分钟1次、每小时3次；违反短冷却暂停10分钟，超小时额度暂停1小时。同IP每小时15次，超额暂停15分钟；所有玩家合计每小时30封、每天100封。学校共享IP可能触发网络额度，所以设备额度优先限制，网络额度较宽。冷却/暂停只影响问题报告，不影响登录或游玩。重复提交同一报告ID不会重复发邮件。

浏览器成功提交后本地冷却5分钟；网络不通或服务端邮件发送失败，显示未发送并保留复制诊断入口。不自动反复重发，不向玩家显示虚假的发送成功。若网络同时阻断报告后端，无法从该网络直接发信。

检查脚本：`scripts/problem-reports-check.mjs`，模拟原生邮件绑定，不向真实邮箱发送测试垃圾邮件；浏览器本地模拟已验证发送按钮、成功反馈与禁用状态。
