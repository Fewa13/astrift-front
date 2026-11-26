// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
function mergeTutorialProgress(a, b) {
  let x = {}, y = {};
  try {
    x = JSON.parse(a || "{}");
  } catch {
  }
  try {
    y = JSON.parse(b || "{}");
  } catch {
  }
  const out = { version: 2, owners: Object.assign(/* @__PURE__ */ Object.create(null), x.owners) };
  for (const [name, raw] of Object.entries(y.owners || {}).slice(0, 100)) {
    const s = raw, p = out.owners[name] || { modules: {} }, n = { ...s.updated >= p.updated ? s : p, modules: Object.assign(/* @__PURE__ */ Object.create(null), p.modules) };
    for (const [id, raw2] of Object.entries(s.modules || {}).slice(0, 100)) {
      const m = raw2;
      if (!["not-started", "in-progress", "completed", "skipped"].includes(m.status)) continue;
      if (!n.modules[id] || m.updated >= n.modules[id].updated) n.modules[id] = { status: m.status, step: Math.max(0, Math.min(99, Number(m.step) || 0)), updated: Number(m.updated) || 0 };
    }
    out.owners[name] = n;
  }
  return JSON.stringify(out);
}
export {
  mergeTutorialProgress
};
