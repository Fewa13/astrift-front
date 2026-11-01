<!-- © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved. -->
# 一次性装备词条补送

所有原有 Ancient 武器、头盔、胸甲和羽翼保留原词条，额外随机增加一条适合槽位且不重复的普通词条。新增、掉落及打造装备也多一条。玉饰使用独立属性系统，不在本次装备词条迁移范围。

装备自身 `affixBonusVersion: 1` 标记补送完成；`gearAffixVersion: 2` 标记存档版本。旧存档读取时持久化补送，已经在线的玩家后续刷新/读取存档即可获得，离线玩家下次进入获得。市场托管装备在初始化市场时原位补送并保存，交易、取消上架、购买携带标记，不会再次补送。已有词条不重新随机，也不更改品质、锁定、装备位置或卖家要价。新物品初始即带补送标记。

常规生成数量为普通1、稀有2、史诗3、传说及以上4。天穹和太初仍保留原专属词条，额外词条不包含普通冷却缩减；既有总冷却减免上限保持不变。

验证：scripts/ancient-bonus-affix-check.mjs、scripts/ancient-high-gear-check.mjs、scripts/ancient-boss-loot-balance-check.mjs、TypeScript 检查。
