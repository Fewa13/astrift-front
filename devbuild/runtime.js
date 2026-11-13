// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import initSqlJs from 'sql.js/dist/sql-asm.js';
import {AncientWorld} from '../src/ancient-world.ts';
import {ANCIENT_POTIONS} from '../src/ancient-rules.ts';
import {ANCIENT_SUPPLIES,supplyKey} from '../src/ancient-commerce.ts';
import {BOSS_CARDS,bossCardKey} from '../src/ancient-boss-cards.ts';
import {ANCIENT_SKINS} from '../src/ancient-skins.ts';

const key = 'astrift.dev.database.v1';
const SQL = await initSqlJs();
const saved = localStorage.getItem(key);
const db = saved ? new SQL.Database(Uint8Array.from(atob(saved), c => c.charCodeAt(0))) : new SQL.Database();
let dirty = false;
const sql = {exec(query, ...params) {
  const statement = db.prepare(query);
  const rows = [];
  try {
    statement.bind(params);
    while (statement.step()) rows.push(statement.getAsObject());
    if (/^\s*(INSERT|UPDATE|DELETE|REPLACE)\b/i.test(query)) dirty = true;
  } finally {
    statement.free();
  }
  return {toArray: () => rows, one: () => rows[0], [Symbol.iterator]: () => rows.values()};
}};
const peers = new Set();
let alarm, timer, pair;
let world;
const storage = {
  sql,
  transactionSync(fn) {
    db.run('SAVEPOINT dev_transaction');
    try {
      const result = fn();
      db.run('RELEASE dev_transaction');
      return result;
    } catch (error) {
      db.run('ROLLBACK TO dev_transaction');
      db.run('RELEASE dev_transaction');
      throw error;
    }
  },
  getAlarm: async () => alarm ?? null,
  setAlarm: async time => {
    alarm = time;
    clearTimeout(timer);
    timer = setTimeout(() => { alarm = null; void world.alarm().catch(console.error); }, Math.min(2147483647, Math.max(0, time - Date.now())));
  }
};
const sessions = {banState: async () => false, officialInbox: async () => []};
world = new AncientWorld({storage, getWebSockets: () => [...peers], acceptWebSocket: ws => peers.add(ws)}, {
  ACCOUNT_SESSIONS: {getByName: () => sessions},
  PLAYER_ACCOUNTS: {getByName: () => ({exists: async () => false})}
});
const name = 'admintest';
const session = {name, token: '0'.repeat(64), device: crypto.randomUUID()};
const checkpoint = () => {
  const bytes = db.export();
  let binary = '';
  for (let i = 0; i < bytes.length; i += 8192) binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
  localStorage.setItem(key, btoa(binary));
};
const saveIfDirty = () => {
  if (!dirty) return;
  checkpoint();
  dirty = false;
};
setInterval(saveIfDirty, 5000);
addEventListener('pagehide', saveIfDirty);
const unavailable = /^(community|trade|friend|party|leaderboard|puzzleLeaderboard|market|mail)/i;
async function command(data) {
  const {action} = data;
  if (unavailable.test(action)) return {ok:false,error:'Dev 中不可用 / Unavailable in Dev'};
  if (action === 'testPlayerLevel') data.level = Math.min(300, Math.max(1, Math.trunc(Number(data.level)) || 1));
  if (action === 'testSkillLevels') data.levels = Object.fromEntries(Object.entries(data.levels || {}).map(([id, level]) => [id, Math.min(30, Math.max(1, Math.trunc(Number(level)) || 1))]));
  const profile = world.read(name);
  profile.coins = 1e15;
  profile.ancientSkins = ANCIENT_SKINS.map(skin => skin.id);
  if (action === 'devTitle') {
    const rank = Number(data.rank);
    if (![1,2,3].includes(rank)) return {ok:false,error:'Invalid title'};
    sql.exec('INSERT OR REPLACE INTO ancient_puzzle_titles VALUES(?,?,?,1)', name, rank, 8640000000000000);
  }
  if (action === 'devRestock' || action === 'profile') {
    for (const id of Object.keys(ANCIENT_POTIONS)) profile.potions[id] = Math.max(999, profile.potions[id] || 0);
    for (const id of Object.keys(ANCIENT_SUPPLIES)) profile.materials[supplyKey(id)] = Math.max(999, profile.materials[supplyKey(id)] || 0);
    for (const id of Object.keys(BOSS_CARDS)) profile.materials[bossCardKey(id)] = Math.max(999, profile.materials[bossCardKey(id)] || 0);
  }
  if (action === 'buySupply') {
    const id = String(data.id);
    const count = Number(data.quantity);
    if (!Object.hasOwn(ANCIENT_SUPPLIES,id) || !Number.isSafeInteger(count) || count<1 || count>999) return {ok:false,error:'Invalid purchase'};
    profile.materials[supplyKey(id)] = (profile.materials[supplyKey(id)] || 0) + count;
  }
  world.save(name, profile);
  if (['devRestock','devTitle','buySupply'].includes(action)) {
    const updated = world.read(name);
    return {ok:true,profile:updated,title:updated.puzzleTitle};
  }
  const result = await world.command(name, action, data);
  if (result.ok && /^.*buy/i.test(action)) {
    const updated = world.read(name);
    updated.coins = profile.coins;
    world.save(name, updated);
    if (result.profile) result.profile.coins = updated.coins;
  }
  return result;
}

const NativeResponse = Response;
window.Response = new Proxy(NativeResponse, {construct(target, args) {
  return args[1]?.status === 101 ? {status:101, webSocket:args[1].webSocket} : Reflect.construct(target, args);
}});
window.WebSocketPair = class { constructor(){return pair;} };
class LocalSocket {
  static OPEN = 1;
  constructor(url) {
    this.readyState = 0;
    let attachment;
    const client = this;
    const peer = {
      get readyState() { return client.readyState; },
      deserializeAttachment: () => structuredClone(attachment),
      serializeAttachment: value => { attachment = structuredClone(value); },
      send: data => queueMicrotask(() => { if(this.readyState < 2) this.onmessage?.({data}); }),
      close: () => this.close()
    };
    this.peer = peer;
    queueMicrotask(async () => {
      if(this.readyState !== 0) return;
      pair = {0:this,1:peer};
      this.readyState = 1;
      try {
        const response = await world.fetch({url:String(url),headers:{get: name => name === 'Upgrade' ? 'websocket' : null}});
        if (response.status !== 101) throw Error(await response.text());
        this.onopen?.();
      } catch (error) {
        console.error(error);
        this.onerror?.();
        this.close();
      }
    });
  }
  send(data) {
    void world.webSocketMessage(this.peer, data).catch(console.error);
  }
  close() {
    if (this.readyState === 3) return;
    this.readyState = 3;
    if (peers.delete(this.peer)) world.webSocketClose(this.peer);
    this.onclose?.();
  }
}
window.WebSocket = LocalSocket;
window.__ASTRIFT_DEV__ = {session, command};
const networkFetch = window.fetch.bind(window);
window.fetch = async (input, init) => {
  const url = new URL(input instanceof Request ? input.url : input, 'https://dev.astrift.invalid');
  if (url.pathname === '/api/ancient/profile') return Response.json(await command(JSON.parse(init?.body || '{}')));
  if (url.pathname === '/api/client-version') return Response.json({ok:true});
  if (url.pathname.startsWith('/api/')) return Response.json({ok:false,error:'Unavailable in Dev'}, {status:403});
  return networkFetch(input, init);
};
