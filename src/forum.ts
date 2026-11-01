// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import { DurableObject } from 'cloudflare:workers';
import {contentIssue} from './content-safety';

type ForumPost = {id:number; name:string; body:string; created_at:number; pinned:number};
type ForumResult = {ok:boolean; error?:string; retryAfter?:number; post?:ForumPost};
const SESSION_MS=30*60_000;
const POST_INTERVAL_MS=60_000;

export class ForumBoard extends DurableObject<Env> {
  constructor(ctx:DurableObjectState,env:Env){
    super(ctx,env);
    ctx.storage.sql.exec('CREATE TABLE IF NOT EXISTS forum_posts(id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL,body TEXT NOT NULL,created_at INTEGER NOT NULL,pinned INTEGER NOT NULL DEFAULT 0)');
    ctx.storage.sql.exec('CREATE TABLE IF NOT EXISTS forum_devices(device TEXT PRIMARY KEY,last_post_at INTEGER NOT NULL)');
    ctx.storage.sql.exec('CREATE TABLE IF NOT EXISTS forum_admin_sessions(token TEXT PRIMARY KEY,expires_at INTEGER NOT NULL)');
    ctx.storage.sql.exec('CREATE INDEX IF NOT EXISTS forum_posts_time ON forum_posts(pinned DESC,created_at DESC,id DESC)');
  }

  list(offset:number){
    const safeOffset=Math.max(0,Math.min(5000,Math.floor(offset)||0));
    const rows=this.ctx.storage.sql.exec<ForumPost>('SELECT id,name,body,created_at,pinned FROM forum_posts ORDER BY pinned DESC,created_at DESC,id DESC LIMIT 31 OFFSET ?',safeOffset).toArray();
    return {posts:rows.slice(0,30),hasMore:rows.length>30};
  }

  openAdminSession(){
    const token=crypto.randomUUID()+crypto.randomUUID();
    const now=Date.now();
    this.ctx.storage.sql.exec('INSERT INTO forum_admin_sessions(token,expires_at) VALUES(?,?)',token,now+SESSION_MS);
    this.ctx.storage.sql.exec('DELETE FROM forum_admin_sessions WHERE expires_at < ?',now);
    return token;
  }

  isAdmin(token:string){
    if(!token||token.length>100)return false;
    return Boolean(this.ctx.storage.sql.exec<{token:string}>('SELECT token FROM forum_admin_sessions WHERE token=? AND expires_at>?',token,Date.now()).toArray()[0]);
  }

  closeAdminSession(token:string){
    if(token)this.ctx.storage.sql.exec('DELETE FROM forum_admin_sessions WHERE token=?',token);
    return true;
  }

  publish(name:string,body:string,device:string,token:string,pinned:boolean):ForumResult{
    const issue=contentIssue(body,'post')||contentIssue(name,'name');if(issue)return {ok:false,error:issue};
    const admin=this.isAdmin(token);
    if(pinned&&!admin)return {ok:false,error:'管理员权限已失效'};
    if(!admin){
      const last=this.ctx.storage.sql.exec<{last_post_at:number}>('SELECT last_post_at FROM forum_devices WHERE device=?',device).toArray()[0]?.last_post_at||0;
      const remaining=POST_INTERVAL_MS-(Date.now()-last);
      if(remaining>0)return {ok:false,error:`请等待 ${Math.ceil(remaining/1000)} 秒后再发帖`,retryAfter:Math.ceil(remaining/1000)};
    }
    const now=Date.now();
    this.ctx.storage.sql.exec('INSERT INTO forum_posts(name,body,created_at,pinned) VALUES(?,?,?,?)',name,body,now,pinned?1:0);
    if(!admin)this.ctx.storage.sql.exec('INSERT INTO forum_devices(device,last_post_at) VALUES(?,?) ON CONFLICT(device) DO UPDATE SET last_post_at=excluded.last_post_at',device,now);
    const post=this.ctx.storage.sql.exec<ForumPost>('SELECT id,name,body,created_at,pinned FROM forum_posts ORDER BY id DESC LIMIT 1').one();
    return {ok:true,post};
  }

  moderate(id:number,action:'delete'|'pin'|'unpin',token:string):ForumResult{
    if(!this.isAdmin(token))return {ok:false,error:'管理员权限已失效'};
    if(action==='delete')this.ctx.storage.sql.exec('DELETE FROM forum_posts WHERE id=?',id);
    else this.ctx.storage.sql.exec('UPDATE forum_posts SET pinned=? WHERE id=?',action==='pin'?1:0,id);
    return {ok:true};
  }
}
