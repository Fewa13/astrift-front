# Astrift development workflow

- 2026-11-25：桌面三个需求原件为 ASTRIFT_Community_Maps_2.0.txt、ASTRIFT_Future_System_Updates.txt、ASTRIFT_Smart_Onboarding_System.txt。社区地图的等级仅影响面积，模型/NPC/天空/组件/模型库等功能及通用性能预算一致。新组件必须经共享校验，默认静止，运动从原始变换计算，禁止累积漂移；动态碰撞和事件结果由服务端决定并持久化。试玩不得写回真实账户奖励。摄影默认关闭，只在作者允许的社区地图使用自由镜头，不修改角色位置；离开地图必须停音频并释放录制资源。
- 2026-11-25：FPS隐藏爆破和搜打撤入口；大厅中央开始游戏，普通/特殊模式分列，设置右上、武器装备右下，反馈和游戏助手归设置。移除旧FPS独立强制教程；通用情境教学使用稳定ID及账号存档，完成/跳过/步骤/关闭状态跨刷新保留，存档读取失败先等待重试，普通版本更新不得清空。HUD按FPS和Ancient分开保存。
- 2026-11-25：社区地图正常怪物可获得金币；BOSS技能书额外一本概率30%，怪物等级至少高于奖励所属玩家5级则固定两本，仍保留普通职业书籍白名单和本职业权重。社区BOSS也适用，试玩与临时召唤怪物不能刷书。虚空剑圣受伤25%概率获得3秒20%移速，刷新时长而不叠加层数。配置位于 ancient-skills.ts。

- 2026-11-22 高度判定：范围、持续区域、弹道和连锁均按实际高度判断；怪物 air 为世界米，玩家 y 为视点高度。断翼魔禽高空快速飞行，俯冲有固定落点预警和可躲避窗口。召唤物攻击高度随体型变化，大骷髅使用合成体型；魔化召唤物沿用玩家魔化交战规则，攻击视线从召唤物自身计算，禁止健康玩家互伤。

- 2026-11-22 最新普攻规则（覆盖技能5%保底）：非暴击基础伤害＝（等级基础攻击×1＋武器基础伤害）×武器伤害词条×其他适用增伤，最后计算暴击；不得按任何职业、技能等级或技能倍率反推普攻保底。默认暴击15%与已有暴击词条机制保留，装备摘要不再展示普攻保底和暴击概率/倍率两句说明。职业实战统计删除表头“召唤”那一列，普攻及每个实际技能独立显示累计伤害；并非删除召唤职业/技能。历史技能合计保留为未分项，不伪造历史技能分配。

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

- 2026-11-21：怪物属性和升级节奏始终以普通职业为本，禁止按融合职业输出反向抬怪抵消融合收益。220级后同类怪物每20级血量与经验约3倍，普通职业基础攻击同步成长；经验调整保留账户等级和升级百分比，金币经济独立。权柄信物必须固定在有故事含义、可到达的场景地标旁，禁止运行时随机找空地放置。

- 2026-11-21 最新近战调整（覆盖此前比例）：不暴击普攻保底为当前职业常用攻击技能单次伤害的1/20（5%），默认暴击率15%；武器词条额外加成与基础1.5倍暴击倍率保留。

- 2026-11-21：Chrono Walker时空跃迁20米，起点7米/落点8米伤害光环不沿路径绘制。速度药水200金币/日5瓶/10分钟移速+50%；五种元素药水各400金币/日5瓶/10分钟20%技能及召唤攻击触发，同目标同元素每秒最多一次；狂暴5000金币/日3瓶/10分钟，冷却×0.8、伤害×2、移速+30%、承伤×1.5、近战间隔×0.7、施法距离×1.1。不同移速药水加算，同类刷新，狂暴与双倍伤害同类增伤取较高值。所有增益服务端判定并随账户保存。

- 2026-11-22：狂暴药水1000金币/每日3瓶，可与双倍伤害药水相乘为4倍伤害，同类重复使用仍刷新时长；覆盖此前5000和增伤取较高值规则。时空行者时间回溯在成功回溯时，离开位置与返回位置各造成一次8米280%技能攻击伤害，手动、低血量、到期回溯一致，失败回溯不造成伤害。

- 2026-11-22 稳定性：心跳必须在任何 await 前提交连接活跃状态；等待外部结果后禁止写回旧角色快照，避免覆盖新血量、位置、冷却和召唤物。错误连接立即持久化，过时连接不得恢复权威；客户端拒绝不完整数值快照。权柄副本状态同步必须携带 authority 地图标记。
- 2026-11-22 体验：受伤轻微红边；键位、灵敏度、语言、桌面/触屏独立布局和画质上限账户同步，离线设置按账户排队、刷新保留。角色下提供成长与战斗记录。职业平衡记录实际扣血（区分武器/技能/召唤）、最终击杀与死亡，不以溢出伤害作比较。记录批量落库，退出时刷新。用户已取消最近20次掉落和每日清剿：不得重新添加记录、页面、进度或领取奖励。现有怪物与经验继续使用普通职业基准。

- 2026-11-26：社区地图运行时必须区分作者初始数据与计算后的姿态，重复校验/重建禁止把分组变换累乘；静态实例不得每帧改写矩阵。延迟机关动作保留发起玩家归属，其他玩家心跳不得替其执行或写入个人变量。

- 2026-11-26：Ancient 的进入按钮为 ancientHomeEnter，原位置是右下角。HUD只缩放 ancientHeader 的玩家信息卡，禁止缩放整个 ancientHeader（会改变其中 fixed 元素的定位基准，进入按钮跑到右上角）；默认 translate/scale 使用 none，不用 0px/1 创建额外包含块。涉及按钮错位先检查真实页面及其祖先样式，不得混同FPS开始按钮。

- 2026-11-26：社区地图浏览使用“全部地图/我的收藏”下拉，首次打开默认全部。新增表单控件必须套用共享深色样式并有用途标签，禁止裸白输入/下拉和无名滑杆。改键按移动、战斗、交互、工具、快捷栏分组；按键方案用命名保存和下拉载入，不用原生prompt让玩家猜方案名。

- 2026-11-26：创意工坊与NPC商店、玩家市场同列于商店分类，浏览/下载不要求进入编辑器；上传及文件导入留在编辑器。FPS入口使用居中开始与底部常用入口，必须实际渲染检查桌面/手机的按钮可见和命中，禁止只验证DOM存在。

- 2026-11-26：FPS开始按钮紧接主标题下方，与标题作为一个完整主区域；禁止单独悬浮在正中间或与左侧标题割裂。用户不认可通用圆角大卡片，沿用战斗HUD切角、细青线和较紧凑尺寸。
