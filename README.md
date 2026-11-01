# 星隙前线 / ASTRIFT FRONT

浏览器第一人称 3D 枪战游戏。支持单人对抗战术 AI，以及通过房间代码进行实时联机。

## 操作

- `WASD` 移动，鼠标瞄准，左键射击
- `R` 换弹，`Shift` 冲刺
- `Q` 启动星隙相位：短暂无敌并向前突进

## 本地运行

```bash
npm install
npm run dev
```
<!-- © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved. -->
<!-- © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved. -->
## 双模式 HTML 更新约定

Surge 双模式镜像：`https://astrift-front.surge.sh`；发布目录 `/Users/jingfeng/Documents/astrift-surge` 仅含双模式 `index.html` 和 Surge 的 `CNAME`。`build:html` 会同步生成该目录，线上仍需执行 `npx surge /Users/jingfeng/Documents/astrift-surge astrift-front.surge.sh` 并确认成功，不能只生成文件就称已更新。不要上传整个项目或凭证。若用户报告 Surge 与 Codeberg 均被封，再提醒可考虑 GitLab Pages；不能保证学校网络放行。

用户要求（2026-10-22）：以后更新正常游戏时，必须同步重新生成 `/Users/jingfeng/Documents/astrift-html/index.html`，该文件是 FPS + Ancient 双模式版。Codeberg `Astrift/pages` 仓库的 `pages` 分支根目录 `index.html` 已替换为双模式，单模式线上文件已删除；不要再用 Ancient-only 文件覆盖它，也不要上传成 `index1.html`。

正常 `npm run deploy` 的 predeploy 会执行 `build:html`。只构建可运行 `npm run build:html`。本地生成不会自动提交到 Codeberg；有授权发布方式时同步上传并验证，没有时明确告知用户需上传替换，不得把本地构建称为 Codeberg 已上线。


## GitHub source updates

Current source repository: https://github.com/Fewa13/astrift-front (`main`). After each completed and verified change, commit and push the relevant updates. Keep credentials, local caches, private diagnostics and generated release archives out of Git.

The historical `astrift-pages-upload-20261003/` directory and its Pages workflow are retained. Source backups do not update that historical Pages build. Current main, Surge and Firebase deployments use the project root and `.static-hosting` build workflow described in `AGENTS.md`.
