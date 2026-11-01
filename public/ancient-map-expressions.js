// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
const mapIdentifier = (id) => /^(?!(?:constructor|prototype|__proto__)$)[a-zA-Z][a-zA-Z0-9_-]{0,31}$/.test(id);
function splitMapArgs(source) {
  const out = [];
  let start = 0, depth = 0, quote = false, escape = false;
  for (let i = 0; i < source.length; i++) {
    const c = source[i];
    if (quote) {
      if (escape) escape = false;
      else if (c === "\\") escape = true;
      else if (c === '"') quote = false;
      continue;
    }
    if (c === '"') quote = true;
    else if (c === "(") depth++;
    else if (c === ")") depth--;
    else if (depth === 0 && (c === "," || /\s/.test(c))) {
      if (source.slice(start, i).trim()) out.push(source.slice(start, i).trim());
      start = i + 1;
    }
    if (depth < 0) throw Error("Unmatched parenthesis");
  }
  if (quote || depth) throw Error("Unclosed quote or parenthesis");
  if (source.slice(start).trim()) out.push(source.slice(start).trim());
  return out;
}
function parseMapExpression(source) {
  if (!source.trim() || source.length > 2e3) throw Error("Invalid expression");
  const tokens = [];
  let i = 0;
  while (i < source.length) {
    if (/\s/.test(source[i])) {
      i++;
      continue;
    }
    const part = source.slice(i).match(/^("(?:[^"\\]|\\.)*"|(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?|\$?[A-Za-z_][A-Za-z0-9_.-]*|==|!=|>=|<=|&&|\|\||[()+*/%,!<>-])/);
    if (!part) throw Error("Invalid expression near " + source.slice(i, i + 20));
    tokens.push(part[0]);
    i += part[0].length;
    if (tokens.length > 256) throw Error("Expression too complex");
  }
  let at = 0, depth = 0;
  const precedence = { "or": 1, "||": 1, "and": 2, "&&": 2, "==": 3, "!=": 3, ">": 4, ">=": 4, "<": 4, "<=": 4, "+": 5, "-": 5, "*": 6, "/": 6, "%": 6 };
  const expression = (min = 0) => {
    if (++depth > 32) throw Error("Expression nesting limit");
    let node;
    const t = tokens[at++];
    if (t === void 0) throw Error("Incomplete expression");
    if (["-", "+", "!", "not"].includes(t)) node = { kind: "unary", op: t, value: expression(7) };
    else if (t === "(") {
      node = expression();
      if (tokens[at++] !== ")") throw Error("Missing closing parenthesis");
    } else if (t.startsWith('"')) node = { kind: "literal", value: JSON.parse(t) };
    else if (/^\d|^\.\d/.test(t)) node = { kind: "literal", value: Number(t) };
    else if (t === "true" || t === "false") node = { kind: "literal", value: t === "true" };
    else if (/^\$?[A-Za-z_]/.test(t)) {
      const name = t.replace(/^\$/, "");
      if (name.split(".").some((n) => !mapIdentifier(n))) throw Error("Invalid variable " + name);
      if (tokens[at] === "(") {
        at++;
        const args = [];
        if (tokens[at] !== ")") for (; ; ) {
          args.push(expression());
          if (tokens[at] !== ",") break;
          at++;
        }
        if (tokens[at++] !== ")") throw Error("Missing closing parenthesis");
        node = { kind: "call", name, args };
      } else node = { kind: "read", name };
    } else throw Error("Unexpected expression token " + t);
    while (at < tokens.length) {
      const op = tokens[at], p = precedence[op];
      if (p === void 0 || p < min) break;
      at++;
      node = { kind: "binary", op, left: node, right: expression(p + 1) };
    }
    depth--;
    return node;
  };
  const result = expression();
  if (at !== tokens.length) throw Error("Unexpected token " + tokens[at]);
  return result;
}
function mapNumber(v) {
  if (typeof v !== "number" || !Number.isFinite(v) || Math.abs(v) > 1e9) throw Error("Expected a finite number within \xB11000000000");
  return v;
}
const mapRead = (record, key) => Object.hasOwn(record, key) ? record[key] : 0;
function mapValue(v) {
  if (!["number", "string", "boolean"].includes(typeof v)) throw Error("Invalid variable value");
  if (typeof v === "number") return mapNumber(v);
  if (typeof v === "string" && v.length > 1e3) throw Error("Text exceeds 1000 characters");
  return v;
}
function evaluateMapExpression(node, read, call, step) {
  step();
  switch (node.kind) {
    case "literal":
      return mapValue(node.value);
    case "read":
      return mapValue(read(node.name));
    case "call":
      return mapValue(call(node.name, node.args.map((a) => evaluateMapExpression(a, read, call, step))));
    case "unary": {
      const v = evaluateMapExpression(node.value, read, call, step);
      return node.op === "!" || node.op === "not" ? !v : mapValue(node.op === "-" ? -mapNumber(v) : mapNumber(v));
    }
    case "binary": {
      const a = evaluateMapExpression(node.left, read, call, step);
      if (node.op === "and" || node.op === "&&") return !!a && !!evaluateMapExpression(node.right, read, call, step);
      if (node.op === "or" || node.op === "||") return !!a || !!evaluateMapExpression(node.right, read, call, step);
      const b = evaluateMapExpression(node.right, read, call, step);
      if (node.op === "==") return a === b;
      if (node.op === "!=") return a !== b;
      if ([">", ">=", "<", "<="].includes(node.op)) {
        if (typeof a !== typeof b || typeof a === "boolean") throw Error("Cannot compare different value types");
        return node.op === ">" ? a > b : node.op === ">=" ? a >= b : node.op === "<" ? a < b : a <= b;
      }
      if (node.op === "+" && (typeof a === "string" || typeof b === "string")) return mapValue(String(a) + String(b));
      const x = mapNumber(a), y = mapNumber(b);
      if ((node.op === "/" || node.op === "%") && y === 0) throw Error("Division by zero");
      return mapValue(node.op === "+" ? x + y : node.op === "-" ? x - y : node.op === "*" ? x * y : node.op === "/" ? x / y : x % y);
    }
  }
}
function interpolateMapText(text, read) {
  return text.replace(/\{\$?([A-Za-z][A-Za-z0-9_.-]*)\}/g, (_, name) => String(read(name))).slice(0, 1e3);
}
export {
  evaluateMapExpression,
  interpolateMapText,
  mapIdentifier,
  mapNumber,
  mapRead,
  mapValue,
  parseMapExpression,
  splitMapArgs
};
