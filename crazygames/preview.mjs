// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {fileURLToPath} from 'node:url';
const directory=path.dirname(fileURLToPath(import.meta.url));
const latest=JSON.parse(fs.readFileSync(path.join(directory,'latest.json'),'utf8'));
const root=path.resolve(directory,latest.game);if(!root.startsWith(path.join(directory,'releases')+path.sep))throw Error('Invalid preview path');
const port=Number(process.env.CG_PREVIEW_PORT)||8099;
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.txt':'text/plain'};
http.createServer((request,response)=>{
  const url=new URL(request.url,'http://localhost');
  if(url.pathname==='/'){response.writeHead(302,{Location:'/game/'}).end();return}
  if(!url.pathname.startsWith('/game/')){response.writeHead(404).end();return}
  const file=path.resolve(root,decodeURIComponent(url.pathname.slice(6)||'index.html'));
  if(!file.startsWith(root+path.sep)){response.writeHead(403).end();return}
  try{response.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});response.end(fs.readFileSync(file))}catch{response.writeHead(404).end()}
}).listen(port,'127.0.0.1',()=>console.log(`CrazyGames preview: http://127.0.0.1:${port}/game/`));
