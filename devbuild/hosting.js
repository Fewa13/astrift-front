// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
export default {
 async fetch(request, env) {
  const url = new URL(request.url);
  if (url.pathname !== '/api/devbuild/redeem') return env.ASSETS.fetch(request);
  if (request.method !== 'POST') return Response.json({error:'仅支持 POST'}, {status:405});
  if (request.headers.get('Origin') !== url.origin) return Response.json({error:'请求来源无效'}, {status:403});
  return env.GAME.fetch(new Request('https://play.astrift.com/api/devbuild/redeem', request));
 },
};
