// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url))),out=path.resolve(root,'../astrift-html'),bytes=fs.statSync(path.join(out,'index.html')).size;
const before='<!-- © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved. -->\n<div id="sitesSizeResult">正在启动体积测试 / Starting size test…</div>\n<script>\n(()=>{const payload="',after='";const p=document.getElementById("sitesSizeResult");p.textContent="同体积代码加载成功 · "+payload.length+" 个测试字符";const b=document.createElement("button");b.textContent="点击测试";b.onclick=()=>b.textContent="脚本运行正常";document.body.append(b);})();\n</script>\n';
const text=before+'x'.repeat(bytes-Buffer.byteLength(before+after))+after;fs.writeFileSync(path.join(out,'google-sites-size-test.txt'),text);console.log('Generated size test:',Buffer.byteLength(text),'bytes; game:',bytes,'bytes');
