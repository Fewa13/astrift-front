import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { once } from 'node:events';
import WebSocket from 'ws';

const origin = process.env.ARENA_TEST_ORIGIN || 'ws://127.0.0.1:8788';
function roomCode() {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ', digits = '23456789';
  return Array.from(randomBytes(6), (value, index) => index % 2 ? digits[value % digits.length] : letters[value % letters.length]).join('');
}

async function connect(mode, room, id) {
  const socket = new WebSocket(`${origin}/api/${mode}/${room}`);
  const history = [];
  socket.on('message', raw => {
    const data = JSON.parse(String(raw));
    history.push(data);
    socket.emit('parsed', data);
  });
  await once(socket, 'open');
  const peer = { socket, history, id };
  socket.send(JSON.stringify({ type: 'join', id, name: id }));
  await waitFor(peer, data => data.type === 'duel' && data.players.some(player => player.id === id));
  return peer;
}

function waitFor(peer, matches) {
  const existing = peer.history.findLast(matches);
  if (existing) return Promise.resolve(existing);
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => { peer.socket.off('parsed', onParsed); reject(new Error(`Timed out waiting for ${peer.id}`)); }, 5_000);
    function onParsed(data) {
      if (!matches(data)) return;
      clearTimeout(timer);
      peer.socket.off('parsed', onParsed);
      resolve(data);
    }
    peer.socket.on('parsed', onParsed);
  });
}

async function exercise(mode, room, seats) {
  const peers = [];
  try {
    for (let team = 0; team < seats - 1; team++) {
      const peer = await connect(mode, room, `${mode}-${team}`);
      peers.push(peer);
      assert.equal(peer.history.findLast(data => data.type === 'duel').players.find(player => player.id === peer.id).team, team);
      peer.socket.send(JSON.stringify({ type: 'ready', round: 0 }));
    }
    const waiting = await waitFor(peers[0], data => data.type === 'duel' && data.players.length === seats - 1 && data.players.every(player => player.ready));
    assert.equal(waiting.phase, 'waiting', `${mode} started before all seats were filled`);

    const last = await connect(mode, room, `${mode}-${seats - 1}`);
    peers.push(last);
    const beforeStart = await waitFor(last, data => data.type === 'duel' && data.players.length === seats);
    assert.equal(beforeStart.phase, 'waiting');
    assert.deepEqual(beforeStart.players.map(player => player.team), Array.from({ length: seats }, (_, index) => index));
    last.socket.send(JSON.stringify({ type: 'ready', round: 0 }));
    const running = await waitFor(last, data => data.type === 'duel' && data.phase === 'running');
    assert.equal(running.seats, seats);
    assert.equal(running.scores.length, seats);
    assert.ok(running.endsAt - running.serverNow > 599_000);

    peers[0].socket.send(JSON.stringify({ type: 'shot', round: running.round, target: peers[1].id, damage: 100, zone: 'head' }));
    const shot = await waitFor(peers[1], data => data.type === 'shot' && data.target === peers[1].id);
    peers[1].socket.send(JSON.stringify({ type: 'death', round: running.round, shotId: shot.shotId }));
    const scored = await waitFor(peers[0], data => data.type === 'duel' && data.kill?.id === shot.shotId);
    assert.deepEqual(scored.scores, [1, ...Array(seats - 1).fill(0)]);

    const watcher = await connect(mode, room, `${mode}-watcher`);
    peers.push(watcher);
    const spectator = await waitFor(watcher, data => data.type === 'duel' && data.players.some(player => player.id === watcher.id));
    assert.equal(spectator.players.find(player => player.id === watcher.id).team, -1);
    peers[0].socket.send(JSON.stringify({ type: 'leave' }));
    const promoted = await waitFor(watcher, data => data.type === 'duel' && data.players.find(player => player.id === watcher.id)?.team === 0);
    assert.equal(promoted.phase, 'running');
    console.log(`${mode}: ${seats} seats, full-room start, scoring, spectator promotion passed`);
  } finally {
    for (const peer of peers) peer.socket.close();
  }
}

await exercise('duel', roomCode(), 2);
await exercise('tri', roomCode(), 3);
await exercise('quad', roomCode(), 4);
