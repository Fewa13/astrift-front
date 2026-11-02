// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import { MAP_GAME_COMMANDS, MAP_SCRIPT_KEYS } from "./ancient-map-gameplay.js";
import { parseMapExpression, evaluateMapExpression, splitMapArgs, mapIdentifier, mapRead, mapNumber, mapValue, interpolateMapText } from "./ancient-map-expressions.js";
const identifier = { test: mapIdentifier };
function compileMapScript(source) {
  if (source.length > 16e3) throw Error("MapScript: maximum 16000 characters");
  const p = { items: [], events: [], functions: /* @__PURE__ */ Object.create(null) }, stack = [];
  let lineNumber = 0;
  for (const raw of source.split("\n")) {
    lineNumber++;
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    try {
      const [op, ...tail] = line.split(/\s+/), rest = line.slice(op.length).trim(), args = splitMapArgs(rest), parent = stack.at(-1), body = parent?.body;
      const fail = (text) => {
        throw Error(text);
      }, name = (v) => {
        if (!mapIdentifier(v || "")) fail("Invalid identifier " + v);
        return v;
      }, count = (n) => {
        if (args.length !== n) fail("Wrong argument count for " + op);
      }, expression = (v) => parseMapExpression(v), literal = (v) => v?.startsWith('"') ? JSON.parse(v) : v;
      if (op === "item") {
        if (body) fail("Put item definitions outside blocks");
        count(3);
        name(args[0]);
        const zh = literal(args[1]), en = literal(args[2]);
        if (!zh || !en || zh.length > 80 || en.length > 80 || p.items.some((i) => i.id === args[0])) fail("Invalid or duplicate item");
        p.items.push({ id: args[0], name: [zh, en] });
        if (p.items.length > 128) fail("Maximum 128 items");
        continue;
      }
      if (op === "recipe" || op === "loot") {
        if (body) fail("Put recipe/loot definitions outside blocks");
        name(args[0]);
        const number = (v) => {
          const n = Number(v);
          if (!Number.isSafeInteger(n) || n < 1 || n > 999999) fail("Recipe/loot amounts and weights must be 1\u2013999999");
          return n;
        };
        if (op === "recipe") {
          if (args.length < 5 || args.length % 2 !== 1) fail("recipe id output quantity ingredient quantity ...");
          p.recipes ??= [];
          if (p.recipes.length >= 64 || p.recipes.some((r) => r.id === args[0])) fail("Maximum 64 unique recipes");
          p.recipes.push({ id: args[0], output: name(args[1]), quantity: number(args[2]), ingredients: Array.from({ length: (args.length - 3) / 2 }, (_, i) => ({ item: name(args[3 + i * 2]), quantity: number(args[4 + i * 2]) })) });
        } else {
          if (args.length < 4 || (args.length - 1) % 3 !== 0) fail("loot id item quantity weight ...");
          p.loot ??= [];
          if (p.loot.length >= 32 || p.loot.some((r) => r.id === args[0])) fail("Maximum 32 unique loot tables");
          p.loot.push({ id: args[0], entries: Array.from({ length: (args.length - 1) / 3 }, (_, i) => ({ item: name(args[1 + i * 3]), quantity: number(args[2 + i * 3]), weight: number(args[3 + i * 3]) })) });
        }
        continue;
      }
      if (op === "when" || op === "function") {
        if (body) fail("Cannot nest event/function definitions");
        const next = [];
        if (op === "when") {
          const event = args[0];
          if (!["join", "kill", "npc", "timer", "zone", "leavezone", "button", "interact", "key", "hurt", "death", "respawn", "phase", "input"].includes(event)) fail("Unknown event");
          if (["interact", "input", "phase"].includes(event) && (args.length !== 2 || !mapIdentifier(args[1]))) fail(event + " requires an identifier");
          if (event === "key" && (args.length !== 2 || !MAP_SCRIPT_KEYS.includes(args[1]))) fail("Unsupported map key");
          if (["hurt", "death", "respawn", "join"].includes(event) && args.length !== 1) fail(event + " has no arguments");
          if (event === "button" && (args.length !== 2 || !mapIdentifier(args[1]))) fail("button requires an identifier");
          if (event === "timer" && (args.length !== 2 || !Number.isInteger(+args[1]) || +args[1] < 1 || +args[1] > 3600)) fail("Timer must be 1\u20133600 seconds");
          if (["zone", "leavezone"].includes(event) && (args.length !== 4 || args.slice(1).some((v) => !Number.isFinite(+v)) || +args[3] <= 0)) fail("zone X Z radius");
          p.events.push({ event, args: args.slice(1), body: next });
          if (p.events.length > 32) fail("Maximum 32 events");
          stack.push({ kind: "when", body: next });
        } else {
          const id = name(args[0]);
          if (["random", "min", "max", "abs", "floor", "ceil", "round", "clamp", "len"].includes(id)) fail("Reserved function name " + id);
          const params = args.slice(1).map(name);
          if (params.length > 8 || new Set(params).size !== params.length || p.functions[id]) fail("Invalid/duplicate function or parameters");
          p.functions[id] = { params, body: next, line: lineNumber };
          if (Object.keys(p.functions).length > 32) fail("Maximum 32 functions");
          stack.push({ kind: "function", body: next, fn: id });
        }
        continue;
      }
      if (op === "end") {
        if (!stack.length) fail("Unexpected end");
        stack.pop();
        continue;
      }
      if (op === "else") {
        if (!parent || parent.kind !== "if" || !parent.command || parent.command.otherwise) fail("Unexpected else");
        const frame = parent, alternative = [];
        frame.command.otherwise = alternative;
        if (tail[0] === "if") {
          const nested = { op: "if", args: [], line: lineNumber, expressions: [expression(rest.slice(2).trim())], body: [] };
          alternative.push(nested);
          frame.command = nested;
          frame.body = nested.body;
        } else {
          if (rest) fail("Use else or else if condition");
          frame.body = alternative;
          frame.kind = "else";
        }
        continue;
      }
      if (!body) fail("Put commands inside when/function blocks");
      const c = { op, args: [], line: lineNumber };
      if (["let", "save", "set", "add", "shared", "addshared"].includes(op)) {
        name(args[0]);
        c.args = [args[0]];
        c.expressions = [expression(rest.slice(args[0].length).trim())];
      } else if (["give", "take"].includes(op)) {
        name(args[0]);
        c.args = [args[0]];
        c.expressions = [expression(rest.slice(args[0].length).trim())];
      } else if (op === "if" || op === "repeat") {
        c.expressions = [expression(rest)];
        if (op === "repeat" && c.expressions[0].kind === "literal") {
          const v = c.expressions[0].value;
          if (typeof v !== "number" || !Number.isInteger(v) || v < 0 || v > 16) fail("Repeat count must be 0\u201316");
        }
        c.body = [];
      } else if (MAP_GAME_COMMANDS[op]) {
        const spec = MAP_GAME_COMMANDS[op];
        count(spec.count);
        if (spec.literals.includes(0)) name(args[0]);
        if (["input", "progress"].includes(op)) name(args[1]);
        c.args = [...args.map((v, i) => spec.literals.includes(i) ? literal(v) : "")];
        c.expressions = args.filter((_, i) => !spec.literals.includes(i)).map(expression);
      } else if (op === "panel") {
        count(7);
        name(args[0]);
        c.args = [args[0]];
        c.expressions = args.slice(1).map(expression);
      } else if (op === "text" || op === "button") {
        count(4);
        name(args[0]);
        name(args[1]);
        c.args = args.slice(0, 2);
        c.expressions = args.slice(2).map(expression);
      } else if (["uishow", "uihide", "uiremove"].includes(op)) {
        count(1);
        c.args = [name(args[0])];
      } else if (op === "message") {
        count(2);
        c.expressions = args.map(expression);
      } else if (op === "teleport") {
        count(3);
        c.expressions = args.map(expression);
      } else if (op === "heal") {
        c.expressions = [expression(rest)];
      } else if (op === "spawn") {
        count(5);
        c.args = [literal(args[0])];
        c.expressions = args.slice(1).map(expression);
      } else if (["show", "hide", "open", "close"].includes(op)) {
        count(1);
        c.args = [literal(args[0])];
      } else if (op === "move") {
        count(4);
        c.args = [literal(args[0])];
        c.expressions = args.slice(1).map(expression);
      } else if (op === "task") {
        count(3);
        name(args[0]);
        c.args = [args[0]];
        c.expressions = args.slice(1).map(expression);
      } else if (op === "complete" || op === "untask") {
        count(1);
        c.args = [name(args[0])];
      } else if (op === "return") {
        if (!stack.some((s) => s.kind === "function")) fail("Return is only valid inside a function");
        c.expressions = [expression(rest || "0")];
      } else if (op === "call") {
        const at = args.indexOf("->"), values = at < 0 ? args.slice(1) : args.slice(1, at);
        if (at >= 0 && (at !== args.length - 2 || !mapIdentifier(args.at(-1)))) fail("call function args -> result");
        c.args = [name(args[0]), at >= 0 ? args.at(-1) : ""];
        c.expressions = values.map(expression);
      } else fail("Unknown command " + op);
      body.push(c);
      if (c.body) {
        if (stack.length >= 7) fail("Block nesting limit");
        stack.push({ kind: op, body: c.body, command: c });
      }
    } catch (e) {
      throw Error(`MapScript line ${lineNumber}: ${e.message}`);
    }
  }
  if (stack.length) throw Error("MapScript: missing end");
  const builtins = /* @__PURE__ */ new Set(["random", "min", "max", "abs", "floor", "ceil", "round", "clamp", "len"]);
  const checkExpression = (e) => {
    if (e.kind === "call") {
      if (!builtins.has(e.name) && !p.functions[e.name]) throw Error("Unknown function " + e.name);
      if (p.functions[e.name] && p.functions[e.name].params.length !== e.args.length) throw Error("Wrong argument count for " + e.name);
      e.args.forEach(checkExpression);
    } else if (e.kind === "binary") {
      checkExpression(e.left);
      checkExpression(e.right);
    } else if (e.kind === "unary") checkExpression(e.value);
  };
  const check = (commands) => {
    for (const c of commands) {
      try {
        if (["give", "take"].includes(c.op) && !p.items.some((i) => i.id === c.args[0])) throw Error("Undefined item " + c.args[0]);
        if (c.op === "call" && (!p.functions[c.args[0]] || p.functions[c.args[0]].params.length !== c.expressions.length)) throw Error("Unknown function or wrong arguments: " + c.args[0]);
        c.expressions?.forEach(checkExpression);
        if (c.body) check(c.body);
        if (c.otherwise) check(c.otherwise);
      } catch (e) {
        throw Error(`MapScript line ${c.line}: ${e.message}`);
      }
    }
  };
  for (const r of p.recipes || []) for (const item of [r.output, ...r.ingredients.map((i) => i.item)]) if (!p.items.some((i) => i.id === item)) throw Error("Undefined recipe item " + item);
  for (const table of p.loot || []) for (const e of table.entries) if (!p.items.some((i) => i.id === e.item)) throw Error("Undefined loot item " + e.item);
  p.events.forEach((e) => check(e.body));
  Object.values(p.functions).forEach((f) => check(f.body));
  return p;
}
function cleanMapNPCs(raw, tier, items) {
  if (raw === void 0) return [];
  if (!Array.isArray(raw) || raw.length > (tier === 1 ? 0 : 32)) throw Error("NPCs require intermediate maps; maximum 32");
  const text = (v) => {
    if (!Array.isArray(v) || v.length !== 2 || v.some((s) => typeof s !== "string" || !s.trim() || s.length > 500)) throw Error("NPC: Chinese and English text required");
    return [v[0].trim(), v[1].trim()];
  };
  const amount = (v) => {
    if (!Array.isArray(v) || v.length > 8) throw Error("NPC: invalid trade");
    return v.map((a) => {
      if (!items.some((i) => i.id === a?.item) || !Number.isInteger(a.quantity) || a.quantity < 1 || a.quantity > 999999) throw Error("NPC: invalid map item or quantity");
      return { item: a.item, quantity: a.quantity };
    });
  };
  const ids = /* @__PURE__ */ new Set();
  return raw.map((n) => {
    if (!identifier.test(n?.id) || ids.has(n.id) || ![n.x, n.y, n.z, n.rotation].every(Number.isFinite) || Math.abs(n.x) > 500 || Math.abs(n.z) > 500 || n.y < 0 || n.y > 500 || Math.abs(n.rotation) > 100 || !Array.isArray(n.lines) || !n.lines.length || n.lines.length > 10) throw Error("NPC: invalid placement or dialogue (1\u201310 rounds)");
    ids.add(n.id);
    return { id: n.id, name: text(n.name), x: n.x, y: n.y, z: n.z, rotation: n.rotation, lines: n.lines.map((l) => ({ npc: text(l.npc), player: text(l.player), give: amount(l.give || []), take: amount(l.take || []) })) };
  });
}
function runMapScript(program, event, match, ctx) {
  let budget = 128;
  const temp = ctx.temp ??= {}, shared = ctx.shared ??= {}, frames = [];
  const step = () => {
    if (--budget < 0) throw Error("Event operation limit");
  }, read = (key) => {
    if (key.startsWith("shared.")) return mapRead(shared, key.slice(7));
    if (key.startsWith("item.") || key.startsWith("items.")) return mapRead(ctx.items, key.slice(key.indexOf(".") + 1));
    if (["player.", "event.", "round.", "input."].some((p) => key.startsWith(p))) return ctx.query?.(key) ?? 0;
    for (let i = frames.length - 1; i >= 0; i--) if (Object.hasOwn(frames[i], key)) return frames[i][key];
    return Object.hasOwn(temp, key) ? temp[key] : mapRead(ctx.vars, key);
  };
  const call = (name, args) => {
    step();
    const numbers = () => args.map(mapNumber);
    if (name === "random") {
      if (args.length !== 2) throw Error("random(min, max)");
      const [min, max] = numbers();
      if (!Number.isInteger(min) || !Number.isInteger(max) || max < min) throw Error("Invalid random range");
      return Math.floor((ctx.random?.() ?? Math.random()) * (max - min + 1)) + min;
    }
    if (["min", "max"].includes(name)) {
      if (!args.length) throw Error("Missing math arguments");
      return name === "min" ? Math.min(...numbers()) : Math.max(...numbers());
    }
    if (["abs", "floor", "ceil", "round"].includes(name)) {
      if (args.length !== 1) throw Error("Wrong math argument count");
      return Math[name](mapNumber(args[0]));
    }
    if (name === "clamp") {
      if (args.length !== 3) throw Error("clamp(value, min, max)");
      const [n, min, max] = numbers();
      if (max < min) throw Error("Invalid clamp range");
      return Math.max(min, Math.min(max, n));
    }
    if (name === "len") {
      if (args.length !== 1 || typeof args[0] !== "string") throw Error("len requires text");
      return Array.from(args[0]).length;
    }
    const f = program.functions[name];
    if (!f || f.params.length !== args.length) throw Error("Unknown function or wrong arguments: " + name);
    if (frames.length >= 8) throw Error("Function call depth limit");
    frames.push(Object.fromEntries(f.params.map((p, i) => [p, args[i]])));
    try {
      return run(f.body)?.value ?? 0;
    } finally {
      frames.pop();
    }
  };
  const evaluate = (e) => evaluateMapExpression(e, read, call, step), local = (key) => (frames.at(-1) || temp)[key], assignLocal = (key, value) => {
    (frames.at(-1) || temp)[key] = mapValue(value);
  };
  const run = (commands) => {
    for (const c of commands) {
      try {
        step();
        const a = c.args, v = (i) => evaluate(c.expressions[i]), n = (i) => mapNumber(v(i));
        switch (c.op) {
          case "checkpoint":
          case "clearcheckpoint":
          case "deathitems":
          case "deathloss":
          case "effect":
          case "stopeffect":
          case "sound":
          case "stopsound":
          case "sky":
          case "fog":
          case "environmentreset":
          case "round":
          case "stage":
          case "nextstage":
          case "resetround":
          case "stat":
          case "resetstats":
          case "craft":
          case "roll":
          case "input":
          case "option":
          case "progress": {
            if (!ctx.game) throw Error("Map gameplay unavailable");
            ctx.game(c.op, a, (c.expressions || []).map(evaluate));
            break;
          }
          case "panel":
          case "text":
          case "button":
          case "uishow":
          case "uihide":
          case "uiremove": {
            if (!ctx.ui) throw Error("Map UI unavailable");
            ctx.ui(c.op, a[0], a[1] || "", (c.expressions || []).map(evaluate));
            break;
          }
          case "let":
            assignLocal(a[0], v(0));
            break;
          case "save":
          case "set": {
            const value = v(0);
            ctx.vars[a[0]] = value;
            delete temp[a[0]];
            break;
          }
          case "shared":
            shared[a[0]] = v(0);
            break;
          case "addshared": {
            const value = v(0), old = mapRead(shared, a[0]);
            shared[a[0]] = mapValue(typeof old === "string" || typeof value === "string" ? String(old) + String(value) : mapNumber(old) + mapNumber(value));
            break;
          }
          case "add": {
            const scope = [...frames].reverse().find((f) => Object.hasOwn(f, a[0])) || (Object.hasOwn(temp, a[0]) ? temp : ctx.vars), old = mapRead(scope, a[0]), value = v(0);
            scope[a[0]] = mapValue(typeof old === "string" || typeof value === "string" ? String(old) + String(value) : mapNumber(old) + mapNumber(value));
            break;
          }
          case "give":
          case "take": {
            const quantity = n(0);
            if (!Number.isInteger(quantity) || quantity < 0 || quantity > 999999) throw Error("Invalid item quantity");
            const current = mapNumber(mapRead(ctx.items, a[0]));
            if (c.op === "take" && current < quantity) throw Error("Not enough map items");
            ctx.items[a[0]] = Math.min(999999, current + (c.op === "give" ? quantity : -quantity));
            break;
          }
          case "message":
            ctx.message([interpolateMapText(String(v(0)), read), interpolateMapText(String(v(1)), read)]);
            break;
          case "teleport":
            ctx.teleport(n(0), n(1), n(2));
            break;
          case "heal":
            ctx.heal(n(0));
            break;
          case "spawn":
            ctx.spawn(a[0], n(0), n(1), n(2), n(3));
            break;
          case "if": {
            const result = run(v(0) ? c.body || [] : c.otherwise || []);
            if (result) return result;
            break;
          }
          case "repeat": {
            const count = n(0);
            if (!Number.isInteger(count) || count < 0 || count > 16) throw Error("Repeat count must be 0\u201316");
            for (let i = 0; i < count; i++) {
              const result = run(c.body || []);
              if (result) return result;
            }
            break;
          }
          case "return":
            return { value: v(0) };
          case "call": {
            const value = call(a[0], c.expressions.map(evaluate));
            if (a[1]) assignLocal(a[1], value);
            break;
          }
          case "show":
          case "hide":
          case "open":
          case "close":
          case "move": {
            if (!ctx.object) throw Error("Object controls unavailable");
            ctx.object(a[0], c.op, c.op === "move" ? [n(0), n(1), n(2)] : void 0);
            break;
          }
          case "task":
          case "complete":
          case "untask": {
            if (!ctx.task) throw Error("Task HUD unavailable");
            ctx.task(a[0], c.op === "task" ? [String(v(0)), String(v(1))] : null, c.op === "complete");
            break;
          }
        }
      } catch (e) {
        if (e.message.startsWith("MapScript line ")) throw e;
        throw Error(`MapScript line ${c.line}: ${e.message}`);
      }
    }
  };
  for (const e of program.events) if (e.event === event && match(e.args)) run(e.body);
}
export {
  cleanMapNPCs,
  compileMapScript,
  interpolateMapText,
  runMapScript
};
