// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
export async function worldEntry(request:Request,assets:{fetch(request:Request):Promise<Response>}):Promise<Response|undefined>{
 const url=new URL(request.url);
 if(!['GET','HEAD'].includes(request.method))return;
 if(['/ancient','/ancient/','/ancient.html'].includes(url.pathname)){
  url.pathname='/';return new Response(null,{status:302,headers:{Location:url.href,'Set-Cookie':'astrift_world=ancient; Path=/; Max-Age=31536000; SameSite=Lax; Secure','Cache-Control':'no-store'}});
 }
 if(!['/','/index.html','/_world/main','/_world/ancient'].includes(url.pathname))return;
 // Keep the explicit main document available for the offline cache regardless of selection.
 const shell=url.pathname==='/',ancient=url.pathname==='/_world/ancient';
 url.pathname=shell?'/world-shell':ancient?'/ancient':'/';
 const assetRequest=new Request(url,request),response=await assets.fetch(assetRequest),headers=new Headers(response.headers);
 headers.set('Cache-Control','no-store');headers.set('X-Astrift-World',shell?'shell':ancient?'ancient':'main');
 return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
}
