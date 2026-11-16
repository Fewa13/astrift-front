// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {mkdir, readFile, writeFile} from 'node:fs/promises';

const source = new URL('../../astrift-html/Astrift-DevBuildAncient.html', import.meta.url);
const output = new URL('../.dev-hosting/', import.meta.url);
const html = await readFile(source, 'utf8');
const endpoint = 'https://play.astrift.com/api/devbuild/redeem';
if (!html.includes(endpoint)) throw new Error('DevBuild redemption endpoint missing from HTML');
await mkdir(output, {recursive:true});
await writeFile(new URL('index.html', output), html.replace(endpoint, '/api/devbuild/redeem'));
