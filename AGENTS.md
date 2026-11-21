# Astrift development workflow

- User preference (2026-11-01): after completing and validating each change, commit and push the relevant project updates to the configured GitHub repository as part of finishing the work.
- Additional game mirrors (2026-11-19): `ilovegames.surge.sh` and `ilovegames.web.app` (also `.firebaseapp.com`). Keep these in the shared Surge/Firebase deployment scripts and exact backend origin allowlist. Firebase Hosting uses `primary` and `ilovegames` targets in `.firebaserc`.
- Keep the existing main site, Workers, Surge, Firebase, and single-HTML update workflow in sync as applicable. GitHub is an additional delivery target. Every official HTML build also regenerates `../astrift-html/Astrift-Canva.html`.
- Never commit API keys, passwords, tokens, `.dev.vars`, local credential files, `.wrangler/`, `.firebase/`, or private account data. Review staged changes before committing.
- If no GitHub remote has been configured, request the user's intended repository URL instead of guessing a repository or publishing to a new one.

- GitHub remote: `https://github.com/Fewa13/astrift-front.git`, branch `main`. Preserve existing history; do not force-push. The legacy `astrift-pages-upload-20261003/` and its Pages workflow are retained; uploading source does not mean that legacy GitHub Pages site has been updated.

- For each published player-facing update, update both Desktop announcements, `Astrift Update(zh-CN).txt` and `Astrift Update(EN).txt`. Append changes for the same Irvine calendar day. On a new day, replace the previous day's announcement and update its date.

## Ancient 职业升华规则

- 用户要求完成全部相关实现、验证和发布，不能把预览或类型检查当作交付。
- 9 个普通圣级职业各有两条升华路线，共 18 条路线、72 个技能。普通圣级分支保持不变，保留技能成长、实战行为和视觉预览。
- 2026-11-20：融合职业不再选择升华路线。所有账户中已选择的融合分支自动回退到原融合职业，按 X、Q、Z、C 保留技能等级及换算后的精通进度，不消耗回退卷轴；融合所有权、多次点亮被动及普通职业不变。服务端必须拒绝重新选择融合分支。
- 融合职业仍使用独立技能精通成长和多次点亮；本次全部融合伤害统一下调 15%，包含召唤物，避免重复乘算。
- 验证选择、施法、重连、离线存档迁移及普通职业不受影响，再同步网站、单 HTML、Canva、Dev 和 GitHub。更新公告不写 Dev 更新。

- `astrift-ai.surge.sh` ships complete local game assets together with the AI frontend via `scripts/build-ai-game.mjs` and `deploy:ai-mirror`. Keep it in `deploy:surge-sites`; do not replace its local `/game.html` entry with a remote website. The AI title stays unchanged. AI styles use `ai-style.css` to avoid game asset collisions.

- 2026-11-20 武器词条：武器的召唤兽伤害和减速强化替换为吸血、挥击加速、暴击概率、暴击伤害或武器伤害，保留原数值档位与隐藏品阶；其他槽位不变。近战普攻基础暴击率30%、暴击倍率1.5；暴击概率加概率，暴击伤害加额外伤害（+10%为1.6倍），武器伤害只提高近战基础伤害。暴击由服务端命中时判定，技能及召唤物不套用武器暴击。

- 2026-11-20：近战普通攻击不暴击时，伤害保底为当前职业常用攻击技能单次伤害的20%，随技能等级、圣级、融合精通和装备技能强度增长；不按大招、全场总和或整段持续伤害比较。保底只提高普攻，武器伤害词条在保底后加成，暴击另外计算，不能反向抬高技能或重复乘算融合系数。

- 2026-11-20：飞行类攻击必须先生成服务端实体飞行轨迹，命中敌人后才产生伤害、减益与命中特效；有目标也不能直接爆发。撞墙、打空或超距不结算敌人效果；保留已有剑网/化剑剑气/飞刺的独立碰撞。
- 圣战士取消魅惑和直接削减生命上限：X圣裁斩、Q圣光恢复、Z领域每秒伤害并有限回血（每秒最多3%最大生命）、C飞行审判命中打击并削弱。路线ID、技能等级与精通保留，清理旧魅惑/审判状态，不再叠加旧领域20%全伤害吸血。

- 2026-11-21 权柄职业：时间之主对应时空行者，空间之主对应虚空剑圣。九张官方主线地图各有两种独立信物；对应融合职业全部主动及三项点亮被动至少12级，其余未消耗普通职业圣级后提交信物，永久解锁最终试炼。每天两次，使用对应预备融合职业连续击败同级、+5、+10、+20级BOSS；禁消耗品，不在轮次间补满血量或冷却，重连保留进度。新职业无技能书，使用独立精通；时间之主已按用户确认重做为加速、停滞、生命与位置回溯、自身攻击重演，取消永久怨灵、怨灵之气和复活怪物。技能ID、职业所有权、等级与精通保留，旧怨灵数据留档；回响不得递归、重复奖励或复制治疗与冷却刷新。
- 两座最终试炼场景必须宏伟、庞大、细致，天空也有专属时代残片、星钟、时间长河或星门、折叠碎片、裂痕。最终BOSS仅少数安全区；预警必须清楚且按基础移动速度、可走路径和反应余量保证至少一处可达，禁止不可躲伤害。使用实例化与性能档位保留独立可见召唤物。
