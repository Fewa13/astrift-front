import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import WebSocket from 'ws';

const base = process.env.TEST_WS_BASE || 'ws://127.0.0.1:8787';
const modes = [['duel', 2], ['tri', 3], ['quad', 4], ['gunmaster', 2]];

function roomCode() {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const digits = '0123456789';
  return Array.from({ length: 3 }, () => letters[Math.floor(Math.random() * letters.length)] + digits[Math.floor(Math.random() * digits.length)]).join('');
}

function connect(mode, code, index) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`${base}/api/${mode}/${code}`);
    const peer = { ws, id: randomUUID(), messages: [] };
    const timeout = setTimeout(() => reject(new Error(`${mode} connection timeout`)), 8000);
    ws.on('open', () => {
      clearTimeout(timeout);
      ws.send(JSON.stringify({ type: 'join', id: peer.id, name: `Tester${index}` }));
      resolve(peer);
    });
    ws.on('message', bytes => {
      try { peer.messages.push(JSON.parse(bytes.toString())); } catch { /* ignore */ }
    });
    ws.on('error', reject);
  });
}

async function until(peer, predicate, label, timeoutMs = 8000) {
  const end = Date.now() + timeoutMs;
  while (Date.now() < end) {
    const found = peer.messages.find(predicate);
    if (found) return found;
    await new Promise(resolve => setTimeout(resolve, 25));
  }
  throw new Error(`${label} timed out; messages: ${peer.messages.map(m => m.type).join(',')}`);
}

for (const [mode, seats] of modes) {
  const code = roomCode();
  const peers = [];
  try {
    for (let i = 0; i < seats; i++) peers.push(await connect(mode, code, i));
    const joined = await until(peers[0], m => m.type === 'duel' && m.players.length === seats, `${mode} roster`);
    for (const peer of peers) peer.ws.send(JSON.stringify({ type: 'ready', round: joined.round }));
    const running = await until(peers[0], m => m.type === 'duel' && m.phase === 'running', `${mode} running`);
    const position = [13.5, 1.7, -27.25];
    peers[0].ws.send(JSON.stringify({ type: 'state', round: running.round, bout: running.bout, position, hp: 100, rotation: 1.2 }));
    const state = await until(peers[1], m => m.type === 'state' && m.id === peers[0].id && m.position?.[0] === position[0], `${mode} state`);
    assert.deepEqual(state.position, position);
    peers[0].ws.send(JSON.stringify({ type: 'shot', round: running.round, bout: running.bout, target: peers[1].id, damage: 100, zone: 'head' }));
    const shot = await until(peers[1], m => m.type === 'shot' && m.target === peers[1].id, `${mode} shot`);
    assert.equal(shot.damage, 100);
    peers[1].ws.send(JSON.stringify({ type: 'death', round: running.round, bout: running.bout, shotId: shot.shotId }));
    const scored = await until(peers[0], m => m.type === 'duel' && m.kill?.victimId === peers[1].id, `${mode} score`);
    assert.equal(scored.scores[0], 1);
    console.log(`${mode}: state, shot, death and score synchronized`);
  } finally {
    for (const peer of peers) peer.ws.close();
  }
}

{
  const code = roomCode();
  const peers = [];
  try {
    peers.push(await connect('survival', code, 0), await connect('survival', code, 1));
    await until(peers[0], m => m.type === 'survivalRoster' && m.players?.length === 2, 'survival roster');
    for (const peer of peers) peer.ws.send(JSON.stringify({ type: 'state', position: [0, 1.7, 0], hp: 0 }));
    const dead = await until(peers[0], m => m.type === 'survivalRoster' && m.players?.length === 2 && m.alive?.length === 0, 'survival all dead');
    assert.deepEqual(dead.alive, []);
    console.log('survival: all-dead roster synchronized');
  } finally {
    for (const peer of peers) peer.ws.close();
  }
}
