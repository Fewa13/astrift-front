# Astrift development workflow

- User preference (2026-11-01): after completing and validating each change, commit and push the relevant project updates to the configured GitHub repository as part of finishing the work.
- Additional game mirrors (2026-11-19): `ilovegames-astrift.surge.sh` and `ilovegames-astrift.web.app` (also `.firebaseapp.com`). Keep these in the shared Surge/Firebase deployment scripts and exact backend origin allowlist. Firebase Hosting uses `primary` and `ilovegames` targets in `.firebaserc`.
- Keep the existing main site, Workers, Surge, Firebase, and single-HTML update workflow in sync as applicable. GitHub is an additional delivery target. Every official HTML build also regenerates `../astrift-html/Astrift-Canva.html`.
- Never commit API keys, passwords, tokens, `.dev.vars`, local credential files, `.wrangler/`, `.firebase/`, or private account data. Review staged changes before committing.
- If no GitHub remote has been configured, request the user's intended repository URL instead of guessing a repository or publishing to a new one.

- GitHub remote: `https://github.com/Fewa13/astrift-front.git`, branch `main`. Preserve existing history; do not force-push. The legacy `astrift-pages-upload-20261003/` and its Pages workflow are retained; uploading source does not mean that legacy GitHub Pages site has been updated.

- For each published player-facing update, update both Desktop announcements, `Astrift Update(zh-CN).txt` and `Astrift Update(EN).txt`. Append changes for the same Irvine calendar day. On a new day, replace the previous day's announcement and update its date.

## 未完成更新：Ancient 职业升华

用户已批准完整实现。任务未全部完成时继续实现和验证，不能把预览、配置、部分职业可用或仅通过类型检查当成交付。

- 9 个基础职业和 4 个融合职业各有两条升华路线。按照已确认的技能设计实现 26 条路线的实战行为、被动、模型和专属特效。
- 职业达到圣级后可选择一次分支，按 X、Q、Z、C 继承技能等级。融合职业保留同槽位的精通点。升华后的职业仍可参与融合。
- 升华技能通过服务端校验的战斗精通成长。按有效命中、击杀、治疗、召唤及增减益等不同机制结算，防止重复奖励。职业和技能界面显示双语效果、等级和进度，提供可操作的技能与外观预览。
- 验证正式客户端的选择、施法、进阶、重连、存档及融合流程，检查每条路线的视觉和性能。完成后按项目流程同步网站、正版单 HTML 和 GitHub。
- 26 条路线的 104 个技能已接入实战入口和视觉预览。继续逐条核对机制、数值、被动与边界条件。全技能施法检查只验证接入，不能代替逐技能行为验证。
