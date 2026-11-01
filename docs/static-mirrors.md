<!-- © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved. -->
# Surge / Firebase 镜像部署

游戏源文件统一在 `astrift-front/public`。两种托管都从这个目录生成 `.static-hosting`（多文件前端），不再部署 `astrift-html/index.html` 或维护 `astrift-surge/index.html`。

在 astrift-front 运行 `npm run deploy:mirrors` 会构建模式数据并依次更新 Surge 和 Firebase。也可运行 `npm run deploy:surge` / `npm run deploy:firebase` 单独更新。Cloudflare 正常版继续原部署流程；所有平台更新仍需分别部署。

构建时增加静态托管的世界外壳和路由适配，把 `/api/` 请求和 WebSocket 连到现有 `https://play.astrift.com` 后端。主项目的游戏 JS 原样复制；账号、存档和房间由同一个后端管理。不会上传 src、.dev.vars、服务端代码或本地配置。镜像不提供离线模式，避免静态托管缺少 API 时错误回退。

`npm run build:html` 仍生成独立单 HTML 供下载和嵌入，不再覆盖 Surge。`node scripts/static-hosting-check.mjs` 检查 API、WebSocket、模式路径与游戏文件一致性。旧 astrift-html/firebase.json 已指向新产物，推荐始终从主项目部署。
