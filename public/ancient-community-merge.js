// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
function mergeCommunityDraft(base, local, remote, preferLocal = () => true) {
  const conflicts = [], map = structuredClone(remote);
  const choose = (before, mine, theirs, key) => {
    if (equal(before, mine)) return theirs;
    if (!equal(before, theirs) && !equal(mine, theirs)) {
      conflicts.push(key);
      return preferLocal(key) ? mine : theirs;
    }
    return mine;
  };
  for (const key of ["name", "boundary", "spawn", "sky", "skyArt", "code", "npcs", "rules", "visibility"]) map[key] = structuredClone(choose(base[key], local[key], remote[key], key));
  for (const key of ["objects", "spawns"]) {
    const b = new Map(base[key].map((o) => [o.id, o])), l = new Map(local[key].map((o) => [o.id, o])), r = new Map(remote[key].map((o) => [o.id, o])), out = [];
    for (const id of /* @__PURE__ */ new Set([...r.keys(), ...l.keys(), ...b.keys()])) {
      const before = b.get(id), mine = l.get(id), theirs = r.get(id);
      if (!before || !mine || !theirs) {
        const chosen = choose(before, mine, theirs, key + ":" + id);
        if (chosen) out.push(structuredClone(chosen));
        continue;
      }
      const value = { ...theirs };
      for (const field of /* @__PURE__ */ new Set([...Object.keys(before), ...Object.keys(mine), ...Object.keys(theirs)])) {
        const chosen = choose(before[field], mine[field], theirs[field], key + ":" + id + ":" + field);
        if (chosen === void 0) delete value[field];
        else value[field] = structuredClone(chosen);
      }
      out.push(value);
    }
    map[key] = out;
  }
  return { map, conflicts };
}
function communityChangedFields(base, next) {
  const keys = [];
  for (const key of ["name", "boundary", "spawn", "sky", "skyArt", "code", "npcs", "rules", "visibility"]) if (!equal(base[key], next[key])) keys.push(key);
  for (const key of ["objects", "spawns"]) {
    const b = new Map(base[key].map((o) => [o.id, o])), n = new Map(next[key].map((o) => [o.id, o]));
    for (const id of /* @__PURE__ */ new Set([...b.keys(), ...n.keys()])) {
      const old = b.get(id), value = n.get(id);
      if (!old || !value) {
        keys.push(key + ":" + id);
        continue;
      }
      for (const field of /* @__PURE__ */ new Set([...Object.keys(old), ...Object.keys(value)])) if (!equal(old[field], value[field])) keys.push(key + ":" + id + ":" + field);
    }
  }
  return keys;
}
export {
  communityChangedFields,
  mergeCommunityDraft
};
