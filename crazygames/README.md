<!-- © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved. -->
# Astrift · CrazyGames 专用更新目录

这个目录维护 CrazyGames 版本，不改变 Workers / Pages / GitHub 等现有入口。

## 更新方式

在项目根目录运行：

```sh
npm run crazygames:build
npm run crazygames:preview
```

浏览器打开 `http://127.0.0.1:8099/game/`。不要直接双击 HTML。

- 游戏功能仍共用 `../public/`，不复制维护第二套游戏源代码。
- CrazyGames 专用修改写进 `overrides/` 或 `build.mjs`，**不要修改已经生成的 game/ 文件**。
- 发布前可在 `config.json` 修改平台版本号、后端地址、默认语言、SDK 开关。
- 每次打包创建新的 `releases/<版本-时间-哈希>/`；历史包不覆盖、不自动删除。
- `latest.json` 指向最近一次构建。`game/` 是平台 HTML5 文件，ZIP 根目录直接包含 `index.html`。
- `report.json` 记录源文件哈希、体积、数量和待处理问题，便于检查版本和回退。
- `npm run crazygames:check` 验证打包路径、敏感文件排除、API/WebSocket 转发和基础 SDK 事件。
- `npm run crazygames:browser-check` 在本机 Chrome 无头浏览器里测试子目录资源、练习场和 SDK 生命周期；使用 SDK 测试替身，不代替官方 Preview。

## 当前专用适配

- 本地资源改为相对路径，能在平台子目录运行。
- `/api/` 和 WebSocket 统一指向现有 Worker；不复制或泄露服务端代码与密钥。
- 仅平台包移除原主页的 Service Worker 注册和强制关闭确认；普通版本保留。
- 仅平台包加载 CrazyGames HTML5 SDK v3，初始化后报告 loading 和 gameplay start/stop。
- SDK 加载失败不阻止单人玩法和本地预览。默认语言依然中文，可切换英文。
- 平台包已接入 SDK 的 muteAudio / disableChat 初始设置与变化监听；需上传 cg.2 后进行官方 Preview 验证。
- 未加入广告、收费、平台账号自动关联或平台邀请逻辑。

## 上架前还没完成的事情

这是**开发构建，不是已审核/完全合规版本**。

1. **后端跨域**：已允许官方 Preview 实际游戏来源 `https://xing-xi-qian-xian-astrift-front.game-files.crazygames.com`，未开放其他游戏或通配域名。2026-10-06 已部署后端 `540dade8-a7ab-4d38-b1f7-a3dd49c7b2e7`，官方预览创建普通房间成功、显示 Connected。双人同步及各模式回归仍需验证。
2. **账号与云存档**：Full Launch 要按平台账号/数据要求接入，现有自建账号不能假定已经满足要求。
3. **平台设置与社交**：核对 `muteAudio`、`disableChat`、用户生成内容审核、平台用户名、房间分享、即时联机和加入邀请。当前只有基础 SDK 生命周期报告。
4. **提交素材**：名称、说明、操作说明、封面、宣传素材、手机横屏设置等在 Developer Portal 填写。
5. **实际测试**：在官方 Preview 工具验证电脑/手机、鼠标锁定、声音、联机和所有特殊模式；当地浏览器测试不等于平台通过审核。

## 官方资料（2026-10-06 核对）

- [HTML5 SDK v3 初始化](https://docs.crazygames.com/sdk/intro/)
- [Gameplay / loading 与平台设置](https://docs.crazygames.com/sdk/game/)
- [技术要求：资源相对路径、体积、基础与完整接入](https://docs.crazygames.com/requirements/technical/)
- [联机、邀请与聊天要求](https://docs.crazygames.com/requirements/multiplayer/)
- [开发者提交入口](https://developer.crazygames.com/)
