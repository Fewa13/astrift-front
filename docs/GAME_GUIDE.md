<!-- © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved. -->
# 游戏助手 / Game guide

入口：FPS 大厅「游戏助手」；Ancient「商店与服务 → 游戏助手」。需要登录。

先选分类，可选具体条目免费读取，或输入问题继续查询。技能等级可调整。输出为游戏定义中的原始说明；不是针对个人装备、目标、药水等计算的最终伤害。

## 数据与准确性

`src/game-guide-data.ts` 直接导入技能说明、圣级说明、分支、装备说明、商店物品、NPC、主线目标、社区地图限制等当前定义。主线奖励指向实时任务 HUD，避免展示原始配置中的未处理奖励（例如血瓶升级、浮动经验）。

`scripts/build-game-guide.mjs` 从实际 FPS `WEAPONS` 与搜打撤经济表生成 `src/game-guide-fps.generated.ts`。已加入 `build:modes`。不能提取时构建会失败，避免静默保留旧资料。

AI 仅选择当前分类中相关条目的 ID。模型输出的数字、自由文本、未知 ID 均不会当成事实呈现。回答不充分时可选择具体条目。当前未涵盖的机制、个人实战伤害和掉率不作推测。

## 免费服务配置

当前无 API Key 时照常使用资料检索。不要把 Key 放入 public、单 HTML、浏览器配置或聊天中。

1. 在 https://console.groq.com/keys 注册并创建免费账户的 Key。不要升级付费套餐。
2. 在本项目终端运行 `npx wrangler secret put GROQ_FREE_KEY`，在终端提示中粘贴 Key。
3. 可选：在 https://aistudio.google.com/api-keys 创建未绑定计费的免费项目 Key，运行 `npx wrangler secret put GEMINI_FREE_KEY`。

`GAME_GUIDE_FREE_ONLY=true` 仅表示允许使用这些明确配置的免费项目 Key；不会改变供应商的账单设置。不要使用已经启用付费计费的项目 Key。没有自动购买、开通计费或其他模型的付费回退。

顺序：Groq Qwen → Gemini 2.5 Flash-Lite → 本地资料检索。只有配置的服务才会被调用。

每家额度使用共享 SQLite 持久保留：滚动24小时保守上限、分钟上限、预留输入字节和输出额度。429 后停用该服务24小时；其他 HTTP 失败停用5分钟；网络失败切换下一家。每玩家4秒冷却。来源选择缓存7天、最多1000条，缓存键包含准确资料内容、语言、问题和技能等级，资料更改自动失效。缓存只保存条目ID，不保存玩家聊天或账号内容。

供应商配额可能变化，也可能被账号中其他应用消耗；以供应商控制台为准。免费额度耗尽仍可查阅原始资料。

## 验证

`npm run typecheck`

`node scripts/game-guide-check.mjs`

测试涵盖当前定义、分类隔离、技能等级、未配置回退、429切换、缓存、反刷、模型虚构ID、持久额度。外部模型实际调用需先由用户配置免费 Key；不能将模拟测试描述为真实供应商调用成功。
