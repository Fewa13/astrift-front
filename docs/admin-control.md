<!-- © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved. -->
# 管理员入口

入口：astrift.com/admin、play.astrift.com/admin、astrift-front.fewa3729.workers.dev/admin、astrift-front.surge.sh/admin、astrift-front.web.app/admin。导览页及镜像使用同一游戏后台。Canva / Google Sites 等第三方平台的页面路径不能由本项目创建；可直接打开以上管理入口。

两层密码均为 Worker Secrets：ASTRIFT_ADMIN_PASSWORD_1、ASTRIFT_ADMIN_PASSWORD_2，前端不含密码。第一层挑战5分钟有效，第二层管理会话30分钟有效并绑定来源IP；10次验证尝试会暂停15分钟。会话仅保留在浏览器 sessionStorage，退出管理会立即撤销；只存挑战/会话令牌的摘要。来源检查和两层验证同时在服务端执行。管理页不支持匿名文件、Google/Canva 动态代码沙箱来源。

- 封禁：秒、分钟、小时、天或永久，原因可选；到期自动失效，也可主动解封。撤销游戏登录状态、断开 Ancient 与已追踪的 FPS 在线房间。解封后需要重新登录。FPS WebSocket 连接使用30秒一次性、绑定房间路径的凭证，不在连接URL放长期登录令牌。旧单HTML需换成新版以支持新凭证。
- 公告：所有游戏内账号可见；可选同时发送到已验证的绑定邮箱。新公告有「查看公告」提示，客户端每60秒检查一次，并保留在官方邮箱。之后注册的账号也可在游戏邮箱看到公告。
- 游戏内单发：选择/输入一个注册账号，只进入该账号游戏邮箱；可附 Ancient 奖励。
- 绑定邮箱单发：发至目标账号已验证邮箱，不进入游戏邮箱，不附游戏物品；未绑定时拒绝发送。后台持久化发件队列，失败重试；页面提示已进入队列不代表邮箱已实际投递。
- 所有管理邮件结尾自动追加 Sincerely, Astrift Front Team。

Attachments support Ancient Gold, raw XP, Phase Cores, health/boost potions, profession and specific skill books, cross-profession skill-book selection, and random equipment/weapons of an administrator-selected quality (Common through Primordial). Collections, rough stones and manually configured equipment/affixes remain unsupported. Grants and per-account claim receipts commit in the same AncientWorld SQLite transaction.

发布和封禁提供预览，后台按操作ID去重，近100条操作记录可查看。公告和邮件内容按纯文本显示/HTML转义。邮件只含管理员填写内容和奖励说明，不含玩家邮箱登录凭证。

验证：scripts/admin-control-check.mjs 使用实际 Worker、DO类及SQLite数据库；覆盖验证/IP/锁定/挑战重放、封禁/解封/过期、登录撤销/房间踢出、一次性WebSocket票据、两种发信渠道、公告可见性、奖励白名单和领取事务。浏览器在本地测试账号上验证两层入口、封禁解封、邮件附件与署名预览。线上只做登录和读取状态检查，不封禁或发送真实玩家邮件。

主项目执行 npm run deploy:all 可构建并更新主 Worker、Surge、Firebase 和导览页。单HTML仍单独生成；静态镜像构建会同步导览页的 admin.html/admin.js/admin.css。导览页 CSP 的 connect-src 必须包含 https://play.astrift.com，否则页面自身会拦截管理API请求。

## Mailbox layout and new attachments

Both in-game mail and the account mailbox use one shared two-column view: a scrollable message list on the left, one message on the right, attachments at the bottom and the claim button at the lower right. Selection and scroll positions are retained during interaction.

The skill-choice attachment requires exactly the specified number of books. Players choose a profession, click skill cards to add one, and use the upper-right minus button to remove one. Multiple professions, different skills and multiple copies are supported. The server validates all IDs and counts without changing the profession or consuming a change book.

random-gear:1 through random-gear:8 generate Common through Primordial gear only when claimed. Normal random affixes and models apply; forge-exclusive items are excluded. A full equipment inventory blocks the entire grant without consuming the mail. Retrying an already claimed mail cannot duplicate or reroll equipment. Administrator grants are separate from map-specific boss drop restrictions.

Verification extends scripts/admin-control-check.mjs with mixed-profession choices, fixed and chosen copies of the same skill, invalid/insufficient selections, full-inventory atomicity, exact equipment quality and duplicate claim prevention. A local browser test received three selected skill books plus one Epic item; no test mail was sent to real players.
