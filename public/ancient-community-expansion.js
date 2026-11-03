// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
const families = [
  ["displayCounter", "\u5206\u683C\u5C55\u793A\u67DC\u53F0", "Partitioned display counter", "furniture", "display", [2.8, 1.5, 1.2]],
  ["instrumentCabinet", "\u4EEA\u5668\u9648\u5217\u67B6", "Instrument display rack", "furniture", "display", [2, 2.2, 0.65]],
  ["guildNoticeboard", "\u516C\u4F1A\u60AC\u8D4F\u544A\u793A\u67B6", "Guild bounty board", "furniture", "display", [2.4, 2.5, 0.7]],
  ["trophyCabinet", "\u6218\u5229\u54C1\u9648\u5217\u67DC", "Trophy cabinet", "furniture", "display", [2.2, 2.3, 0.7]],
  ["potionCart", "\u836F\u5242\u63A8\u8F66", "Potion service trolley", "furniture", "workshop", [1.4, 1.3, 0.9]],
  ["laboratoryBench", "\u70BC\u91D1\u5B9E\u9A8C\u53F0", "Alchemy laboratory bench", "furniture", "workshop", [2.8, 1.8, 1.2]],
  ["hangingLamp", "\u7EC4\u5408\u60AC\u540A\u706F", "Suspended lamp assembly", "furniture", "lighting", [1.8, 1.5, 1.8]],
  ["cookingStation", "\u7EC4\u5408\u6599\u7406\u53F0", "Cooking preparation station", "furniture", "kitchen", [2.8, 2, 1.2]],
  ["writingBureau", "\u673A\u5173\u79D8\u4E66\u4E66\u684C", "Secretary writing bureau", "furniture", "tables", [2, 1.8, 0.9]],
  ["aquarium", "\u6C34\u666F\u9648\u5217\u7F38", "Aquatic display cabinet", "furniture", "display", [2.2, 1.8, 0.85]],
  ["sewingStation", "\u88C1\u8863\u4E0E\u7EC7\u9020\u5DE5\u4F5C\u53F0", "Tailor workstation", "furniture", "workshop", [2.3, 1.6, 1.2]],
  ["weaponWorkbench", "\u6B66\u5177\u4FDD\u517B\u5DE5\u4F5C\u53F0", "Weapon maintenance bench", "furniture", "workshop", [2.7, 2, 1.2]],
  ["astronomerRoom", "\u661F\u8C61\u5E08\u7814\u7A76\u5BA4", "Astronomer study", "roomSets", "study", [9, 3.2, 8]],
  ["medicalWard", "\u8BCA\u7597\u4F11\u606F\u5BA4", "Medical treatment room", "roomSets", "care", [10, 2.8, 8]],
  ["classroom", "\u8BB2\u5802\u4E0E\u5B66\u4E60\u533A", "Classroom learning area", "roomSets", "study", [10, 2.6, 9]],
  ["archiveRoom", "\u6863\u6848\u6574\u7406\u5BA4", "Archive sorting room", "roomSets", "study", [10, 2.8, 9]],
  ["musicRoom", "\u4E50\u5E08\u6392\u7EC3\u5BA4", "Musician rehearsal room", "roomSets", "leisure", [9, 2.8, 8]],
  ["teaRoom", "\u54C1\u8336\u4F1A\u5BA2\u533A", "Tea reception room", "roomSets", "leisure", [9, 2.6, 8]],
  ["courtyardResidence", "\u5EAD\u9662\u8FDE\u5ECA\u5B85\u9662", "Courtyard residence", "homes", "courtyards", [22, 6, 20]],
  ["arcadeShop", "\u5ECA\u8857\u5546\u94FA", "Arcaded street shop", "buildings", "shops", [18, 6, 16]],
  ["woodlandRetreat", "\u6797\u95F4\u8FDE\u5C4B", "Woodland retreat", "homes", "cottages", [20, 6, 18]],
  ["canalHouse", "\u6C34\u5CB8\u8FDE\u5ECA\u5C45\u6240", "Canal-side residence", "homes", "courtyards", [22, 6, 18]],
  ["craftsmenHall", "\u5320\u4EBA\u5DE5\u574A\u4F1A\u9986", "Craftsmen workshop hall", "buildings", "shops", [24, 6, 20]],
  ["observatory", "\u5EAD\u9662\u89C2\u661F\u9986", "Courtyard observatory", "buildings", "civic", [22, 8, 22]],
  ["gardenGateway", "\u5EAD\u56ED\u95E8\u5ECA\u7EC4\u5408", "Garden gateway assembly", "architecture", "gardens", [10, 4.6, 8]],
  ["reservoir", "\u84C4\u6C34\u4E0E\u704C\u6E89\u6784\u7B51", "Reservoir and irrigation works", "architecture", "water", [12, 2.8, 10]],
  ["terrace", "\u9636\u53F0\u4E0E\u9732\u53F0\u6784\u7B51", "Terraced platform", "architecture", "terraces", [12, 3.3, 10]],
  ["ruinSanctuary", "\u6B8B\u57A3\u5723\u6240", "Ruined sanctuary", "architecture", "ruins", [14, 5.5, 12]],
  ["rootGrove", "\u53E4\u6811\u6839\u4E1B", "Ancient root grove", "nature", "treeSpecies", [11, 10, 10]],
  ["rockGarden", "\u5C71\u77F3\u5EAD\u666F", "Sculpted rock garden", "rocks", "gardens", [11, 4.2, 9]]
];
const layouts = [["\u53CC\u5217", "Twin rows"], ["\u9519\u5217", "Staggered"], ["\u73AF\u5F62", "Ring"], ["\u4E2D\u592E", "Central"], ["\u8F6C\u89D2", "Corner"], ["\u53CC\u7FFC", "Twin wings"], ["\u7EB5\u6DF1", "Long hall"], ["\u56DB\u89D2", "Four corners"], ["\u56F4\u5408", "Enclosed court"], ["\u9519\u5C42", "Stepped"], ["\u591A\u5E2D", "Gathering"], ["\u53CC\u5EAD", "Twin courts"]];
const houseLayouts = [["\u5355\u95F4\u524D\u5ECA", "Single wing"], ["\u53CC\u8054\u957F\u5ECA", "Twin connected wings"], ["\u4E09\u8054\u957F\u5ECA", "Triple connected wings"], ["U\u5F62\u5185\u5EAD", "U-shaped courtyard"], ["\u524D\u540E\u53CC\u5385", "Front and rear halls"], ["\u659C\u89D2\u53CC\u5385", "Offset halls"], ["\u7EB5\u6DF1\u4E09\u5385", "Three deep halls"], ["L\u5F62\u9662\u843D", "L-shaped court"], ["\u53CC\u5217\u5EAD\u9662", "Parallel courtyard"], ["\u8FDE\u6392\u4E09\u5385", "Three aligned halls"], ["\u5341\u5B57\u9662\u843D", "Cross-shaped court"], ["\u53CC\u5EAD\u4E94\u5385", "Twin courts, five halls"]];
const COMMUNITY_EXPANSION = families.flatMap(([family, zh, en, category, subcategory, size]) => layouts.map(([suffix, english], variant) => {
  if (["homes", "buildings"].includes(category)) [suffix, english] = houseLayouts[variant];
  if (category === "roomSets") {
    const n = 3 + variant % 4, cn = ["\u9519\u5217", "\u53CC\u5217", "\u73AF\u5F62"][variant % 3], kind = ["Staggered", "Twin-row", "Ring"][variant % 3];
    suffix = (variant >= 8 ? "\u5C4F\u98CE \xB7 " : "") + cn + n + "\u7EC4";
    english = (variant >= 8 ? "Screened " : "") + kind + " " + n + " stations";
  }
  return { id: `kit-x-${family}-${variant + 1}`, kind: `x-${family}-${variant + 1}`, family, variant, name: `${zh} \xB7 ${suffix}`, en: `${en} \xB7 ${english}`, category, subcategory, size: [...size], tier: variant < 8 ? 2 : 3 };
}));
const byKind = new Map(COMMUNITY_EXPANSION.map((m) => [m.kind, m]));
function buildCommunityExpansion(kind, existing) {
  const model = byKind.get(kind);
  if (!model) return null;
  const { family: f, variant: v } = model, [W, H, D] = model.size, out = [];
  const wood = "#78583f", dark = "#303e43", metal = "#647c80", trim = "#c5a56d", stone = "#8c9890", cream = "#d9d4bc", cloth = "#527e7b", leaf = "#51795b", glass = "#5d9f9b";
  const add = (shape, x, y, z, w, h, d, color = wood, ry = 0) => {
    out.push({ shape, x, y, z, w, h, d, color, ry });
  }, box = (x, y, z, w, h, d, color = wood, ry = 0) => add("box", x, y + h / 2, z, w, h, d, color, ry), cyl = (x, y, z, r, h, color = metal) => add("cylinder", x, y + h / 2, z, r * 2, h, r * 2, color), ball = (x, y, z, r, color = cream) => add("sphere", x, y, z, r * 2, r * 2, r * 2, color), ring = (x, y, z, w, h, d, color = metal, ry = 0) => add("torus", x, y, z, w, h, d, color, ry);
  const append = (id, x, y, z, scale = 1, ry = 0) => {
    const c = Math.cos(ry), s = Math.sin(ry);
    for (const p of existing(id)) out.push({ ...p, x: x + (p.x * c - p.z * s) * scale, y: y + p.y * scale, z: z + (p.x * s + p.z * c) * scale, w: p.w * scale, h: p.h * scale, d: p.d * scale, ry: p.ry + ry });
  };
  const feet = (w, d, h) => {
    for (const x of [-w * 0.4, w * 0.4]) for (const z of [-d * 0.36, d * 0.36]) {
      box(x, 0, z, 0.085, h, 0.085);
      box(x, 0, z, 0.12, 0.06, 0.12, metal);
    }
  };
  const bottle = (x, y, z, scale = 1, n = 0) => {
    cyl(x, y, z, 0.055 * scale, 0.17 * scale, ["#759c95", "#b69d65", "#837ba4"][n % 3]);
    cyl(x, y + 0.17 * scale, z, 0.027 * scale, 0.07 * scale, trim);
    cyl(x, y + 0.24 * scale, z, 0.035 * scale, 0.025 * scale, wood);
  };
  const drawer = (x, y, z, w, h) => {
    box(x, y, z, w, h, 0.05, wood);
    box(x, y + h * 0.48, z + 0.035, w * 0.2, 0.025, 0.035, trim);
  };
  const decorativePosts = (w, d, h) => {
    for (const x of [-w / 2, w / 2]) for (const z of [-d / 2, d / 2]) {
      box(x, 0, z, 0.18, h, 0.18, wood);
      box(x, h - 0.12, z, 0.26, 0.1, 0.26, trim);
    }
  };
  if (model.category === "furniture") {
    const offset = (v % 3 - 1) * 0.08, levels = 2 + v % 3, count = 3 + v % 4, top = 0.78 + v % 2 * 0.12;
    if (f === "hangingLamp") {
      const n = 3 + v % 6;
      box(0, H - 0.1, 0, W * 0.75, 0.08, 0.12, metal);
      for (let i = 0; i < n; i++) {
        const a = i * Math.PI * 2 / n, r = v === 3 ? 0 : 0.35 + v * 0.025, x = Math.cos(a) * r, z = Math.sin(a) * r, y = 0.1 + i % 3 * 0.16;
        box(x, y + 0.3, z, 0.025, H - y - 0.4, 0.025, metal);
        cyl(x, y, z, 0.13, 0.23, cream);
        ring(x, y + 0.25, z, 0.3, 0.06, 0.3, trim);
        add("cone", x, y + 0.4, z, 0.4, 0.22, 0.4, metal);
      }
      if (v >= 8) ring(0, H * 0.6, 0, 1.6, 0.08, 1.6, trim);
      return out;
    }
    feet(W * 0.92, D * 0.9, top);
    box(0, top, 0, W * 0.94, 0.09, D * 0.92, wood);
    box(0, 0.16, 0, W * 0.86, 0.06, D * 0.82, dark);
    for (let i = 0; i < count; i++) drawer(-W * 0.42 + (i + 0.5) * W * 0.84 / count, 0.35, D * 0.39, W * 0.8 / count, 0.22);
    if (f === "displayCounter" || f === "trophyCabinet" || f === "instrumentCabinet" || f === "aquarium") {
      const tall = f === "trophyCabinet" || f === "instrumentCabinet", base = tall ? 0.2 : top + 0.09, upper = H - 0.12;
      for (const x of [-W * 0.46, W * 0.46]) for (const z of [-D * 0.4, D * 0.4]) box(x, base, z, 0.055, upper - base, 0.055, trim);
      box(0, upper, 0, W * 0.96, 0.06, D * 0.88, dark);
      if (f === "aquarium") {
        box(0, base + 0.08, 0, W * 0.84, 0.035, D * 0.75, "#7aa9a1");
        for (let i = 0; i < count; i++) {
          const x = -W * 0.32 + i * W * 0.64 / (count - 1);
          box(x, base + 0.1, Math.sin(i + v) * D * 0.23, 0.035, 0.18 + i % 3 * 0.07, 0.035, leaf);
          add("rock", x, base + 0.11, Math.cos(i) * D * 0.2, 0.15, 0.14, 0.12, stone);
          add("cone", x, base + 0.32, Math.sin(i) * 0.1, 0.14, 0.08, 0.07, trim, Math.PI / 2);
        }
        for (const x of [-W * 0.44, W * 0.44]) box(x, base, 0, 0.018, upper - base, D * 0.8, glass);
        return out;
      }
      for (let j = 0; j < levels; j++) {
        const y = base + 0.12 + j * (upper - base - 0.24) / levels;
        box(0, y, 0, W * 0.87, 0.035, D * 0.8, cream);
        for (let i = 0; i < count; i++) {
          const x = -W * 0.36 + i * W * 0.72 / (count - 1), z = (j % 2 ? 0.16 : -0.12) * D;
          if (f === "instrumentCabinet") {
            cyl(x, y + 0.04, z, 0.065, 0.11, dark);
            ring(x, y + 0.22, z, 0.18, 0.18, 0.035, trim);
            box(x, y + 0.04, z, 0.025, 0.22, 0.025, metal);
          } else if (f === "trophyCabinet") {
            cyl(x, y + 0.04, z, 0.07, 0.06, dark);
            cyl(x, y + 0.1, z, 0.025, 0.1, trim);
            add("cone", x, y + 0.26, z, 0.17, 0.15, 0.17, trim);
            for (const side of [-1, 1]) ring(x + side * 0.08, y + 0.25, z, 0.12, 0.12, 0.035, trim);
          } else bottle(x, y + 0.04, z, 1, j + i);
        }
      }
    } else if (f === "guildNoticeboard") {
      box(0, top + 0.15, -D * 0.25, W * 0.9, H - top - 0.3, 0.1, dark);
      for (const x of [-W * 0.46, W * 0.46]) box(x, top, -D * 0.25, 0.12, H - top, 0.16, wood);
      for (let i = 0; i < count + 2; i++) {
        const x = -W * 0.34 + i % 3 * W * 0.33, y = top + 0.25 + Math.floor(i / 3) * 0.43;
        box(x, y, -D * 0.18, 0.35, 0.32, 0.015, cream);
        box(x, y + 0.25, -D * 0.155, 0.025, 0.025, 0.025, trim);
        for (let j = 0; j < 3; j++) box(x, y + 0.08 + j * 0.06, -D * 0.16, 0.22, 0.012, 0.012, metal);
      }
      if (v >= 8) add("cone", 0, H - 0.07, -D * 0.25, W * 0.6, 0.14, 0.25, trim);
    } else if (f === "potionCart") {
      for (const x of [-W * 0.4, W * 0.4]) for (const z of [-D * 0.4, D * 0.4]) ball(x, 0.09, z, 0.09, dark);
      for (let j = 0; j < levels; j++) {
        const y = 0.25 + j * 0.3;
        box(0, y, 0, W * 0.8, 0.035, D * 0.75, metal);
        for (let i = 0; i < count; i++) bottle(-W * 0.3 + i * W * 0.6 / (count - 1), y + 0.04, (i % 2 - 0.5) * D * 0.3, 0.65, i);
      }
      box(W * 0.44, 0.9, 0, 0.06, 0.3, D * 0.7, metal);
    } else if (f === "laboratoryBench") {
      for (let i = 0; i < count; i++) {
        const x = -W * 0.35 + i * W * 0.7 / (count - 1);
        bottle(x, top + 0.09, D * 0.19, 1.3, i);
        box(x, top + 0.09, -D * 0.25, 0.03, 0.55 + i % 2 * 0.12, 0.03, metal);
        ring(x, top + 0.6, -D * 0.25, 0.16, 0.16, 0.035, metal);
      }
      append("cauldron", W * 0.28, top + 0.09, -D * 0.05, 0.4);
      box(-W * 0.3, top + 0.09, 0, 0.4, 0.04, 0.3, cream);
      for (let j = 0; j < levels; j++) box(0, 1.25 + j * 0.16, -D * 0.39, W * 0.8, 0.04, 0.14, wood);
    } else if (f === "cookingStation") {
      box(-W * 0.32, top + 0.09, 0, 0.65, 0.035, D * 0.65, "#b49269");
      for (let i = 0; i < count; i++) {
        cyl(W * 0.14 + i % 2 * 0.35, top + 0.09, (Math.floor(i / 2) - 1) * 0.22, 0.09, 0.035, dark);
      }
      box(0, H - 0.22, -D * 0.3, W * 0.8, 0.13, 0.38, metal);
      for (let i = 0; i < count; i++) cyl(-W * 0.32 + i * W * 0.64 / (count - 1), top + 0.35, -D * 0.39, 0.065, 0.2, metal);
    } else if (f === "writingBureau") {
      for (let j = 0; j < levels; j++) box(0, top + 0.22 + j * 0.23, -D * 0.3, W * 0.86, 0.035, 0.24, wood);
      for (let i = 0; i < count; i++) {
        box(-W * 0.32 + i * W * 0.64 / (count - 1), top + 0.3, -D * 0.3, 0.08, 0.24 + i % 2 * 0.07, 0.16, ["#6d7f7a", "#967b65", "#768091"][i % 3]);
      }
      append("books", -0.25, top + 0.09, 0.12, 0.45);
      bottle(W * 0.3, top + 0.09, 0.1, 0.7);
      box(0, top + 0.1, 0.1, 0.6, 0.02, 0.25, cream);
    } else if (f === "sewingStation") {
      cyl(-W * 0.25, top + 0.09, 0, 0.17, 0.08, dark);
      box(-W * 0.25, top + 0.1, 0, 0.16, 0.28, 0.18, metal);
      box(-W * 0.08, top + 0.3, 0, 0.35, 0.08, 0.1, metal);
      for (let i = 0; i < count; i++) {
        const x = W * 0.05 + i * 0.13;
        ring(x, top + 0.12, -D * 0.25, 0.13, 0.13, 0.035, cloth);
        box(x, top + 0.09, -D * 0.25, 0.03, 0.2, 0.03, wood);
      }
      box(W * 0.22, top + 0.09, 0.15, W * 0.25, 0.025, D * 0.5, cloth);
    } else if (f === "weaponWorkbench") {
      box(0, top + 0.12, -D * 0.37, W * 0.86, 0.7, 0.08, dark);
      for (let i = 0; i < count; i++) {
        const x = -W * 0.3 + i * W * 0.6 / (count - 1);
        box(x, top + 0.18, -D * 0.28, 0.06, 0.53, 0.045, metal);
        box(x, top + 0.25, -D * 0.25, 0.2, 0.05, 0.07, trim);
      }
      append("anvil", W * 0.23, top + 0.1, 0.08, 0.45);
      box(-W * 0.25, top + 0.1, 0, 0.55, 0.025, 0.3, cream);
      for (let j = 0; j < levels; j++) box(-W * 0.3 + j * 0.18, top + 0.14, D * 0.2, 0.1, 0.04, 0.16, wood);
    }
    if (v >= 4 && v < 8) {
      box(0, 0.25, -D * 0.35, W * 0.8, 0.05, 0.08, trim);
      for (const x of [-W * 0.3, W * 0.3]) box(x, 0.16, -D * 0.35, 0.05, 0.22, 0.1, metal);
    }
    if (v % 3 === 2) {
      box(-W * 0.48, top, -D * 0.05, 0.07, 0.3, D * 0.9, trim);
      box(W * 0.48, top, -D * 0.05, 0.07, 0.3, D * 0.9, trim);
    }
    if (v >= 8) for (const x of [-W * 0.39, W * 0.39]) {
      ball(x, H - 0.08, -D * 0.4, 0.06, trim);
      box(x, top, -D * 0.4, 0.04, H - top - 0.08, 0.04, trim);
    }
    for (let i = 0; i < v % 4; i++) box((i - (v % 4 - 1) / 2) * W * 0.22, 0.19, offset, W * 0.04, top - 0.22, D * 0.65, wood);
    return out;
  }
  if (model.category === "roomSets") {
    box(0, 0, 0, W, 0.035, D, "#635d50");
    const n = 3 + v % 4, angle = v % 3 === 2 ? Math.PI * 2 / n : 0;
    const positions = Array.from({ length: n }, (_, i) => {
      if (v % 3 === 2) return { x: Math.sin(i * angle) * W * 0.3, z: Math.cos(i * angle) * D * 0.3, ry: i * angle + Math.PI };
      if (v % 3 === 1) return { x: (i % 2 ? 1 : -1) * W * 0.28, z: -D * 0.3 + Math.floor(i / 2) * D * 0.25, ry: i % 2 ? -Math.PI / 2 : Math.PI / 2 };
      return { x: -W * 0.32 + i * W * 0.64 / Math.max(1, n - 1), z: (i % 2 ? 1 : -1) * D * 0.24, ry: i % 2 ? Math.PI : 0 };
    });
    for (const [i, p] of positions.entries()) {
      if (f === "medicalWard") {
        append("singleBed", p.x, 0.035, p.z, 0.78, p.ry);
        append("nightstand", p.x + 0.68, 0.035, p.z, 0.65);
        bottle(p.x + 0.68, 0.5, p.z, 0.8, i);
      } else if (f === "classroom") {
        append("writingDesk", p.x, 0.035, p.z, 0.7, p.ry);
        append("diningChair", p.x, 0.035, p.z + 0.65, 0.8, p.ry);
        append("books", p.x, 0.65, p.z, 0.4);
      } else if (f === "archiveRoom") {
        append("bookcase", p.x, 0.035, p.z, 1, p.ry);
        append("chest", p.x + 0.65, 0.035, p.z, 0.6);
      } else if (f === "musicRoom") {
        append(["piano", "harp", "drums"][i % 3], p.x, 0.035, p.z, 0.72, p.ry);
        append("stool", p.x, 0.035, p.z + 0.7, 0.8);
      } else if (f === "teaRoom") {
        append(i % 2 ? "sofa" : "armchair", p.x, 0.035, p.z, 0.7, p.ry);
        append("sideTable", p.x + 0.7, 0.035, p.z, 0.8);
      } else {
        append("writingDesk", p.x, 0.035, p.z, 0.75, p.ry);
        append("globe", p.x, 0.7, p.z, 0.6);
        append("officeChair", p.x, 0.035, p.z + 0.7, 0.75);
      }
    }
    if (f === "astronomerRoom") {
      append("globe", 0, 0.035, 0, 1.4);
      ring(0, 1.6, 0, 2.3, 2.3, 0.08, trim);
      box(0, 0.035, 0, 0.2, 1.5, 0.2, wood);
    } else if (f === "teaRoom") {
      append("roundTable", 0, 0.035, 0, 1.2);
      append("tableware", 0, 1.02, 0, 0.7);
    } else if (f === "classroom") {
      box(0, 0.8, -D * 0.43, W * 0.5, 1.3, 0.1, dark);
      for (let i = 0; i < 4; i++) box(-W * 0.17 + i * 0.5, 1.3, -D * 0.36, 0.3, 0.03, 0.02, cream);
    } else append("roundTable", 0, 0.035, 0, 0.9);
    for (let i = 0; i < 2 + v % 3; i++) {
      const x = (i - (1 + v % 3) / 2) * W * 0.28;
      append("indoorPlant", x, 0.035, D * 0.43, 0.65);
    }
    if (v >= 8) {
      append("grandClock", -W * 0.44, 0.035, 0, 0.9);
      append("roomScreen", W * 0.35, 0.035, -D * 0.1, 0.7, Math.PI / 2);
    }
    return out;
  }
  if (["homes", "buildings"].includes(model.category)) {
    const layouts2 = [[[0, 0]], [[0, 0], [-1, 0]], [[0, 0], [-1, 0], [1, 0]], [[0, -1], [-1, 0], [1, 0]], [[0, 0], [0, -1]], [[0, 0], [1, -1]], [[0, 0], [0, -1], [0, 1]], [[-1, 0], [0, 0], [0, -1]], [[-1, -1], [1, -1], [-1, 0], [1, 0]], [[-1, 0], [0, 0], [1, 0]], [[0, -1], [-1, 0], [1, 0], [0, 1]], [[-1, -1], [1, -1], [-1, 0], [1, 0], [0, 1]]][v];
    const mw = W * 0.27, md = D * 0.26, stepX = mw + 0.5, stepZ = md + 0.55, wall = 3.1, base = 0.15;
    const room = (x, z, index) => {
      box(x, 0, z, mw, 0.15, md, stone);
      const roofY = base + wall + 0.12;
      box(x, base + wall, z, mw + 0.35, 0.12, md + 0.35, dark);
      for (const side of [-1, 1]) {
        box(x, roofY, z + side * (md / 2 + 0.12), mw + 0.42, 0.09, 0.1, trim);
        box(x + side * (mw / 2 + 0.12), roofY, z, 0.1, 0.09, md + 0.42, trim);
        box(x, 0.12, z + side * md / 2, mw, 0.13, 0.18, stone);
      }
      if (f === "observatory") {
        cyl(x, roofY, z, 1.25, 0.7, stone);
        add("cone", x, roofY + 1.28, z, 2.9, 1.2, 2.9, dark);
        ring(x, roofY + 0.6, z, 2.6, 0.1, 2.6, trim);
      } else if (f === "canalHouse") {
        for (const side of [-1, 1]) box(x + side * mw * 0.46, roofY, z, 0.08, 0.55, md * 0.9, wood);
        box(x, roofY, z - md * 0.46, mw * 0.92, 0.55, 0.08, wood);
      } else {
        const rh = f === "woodlandRetreat" ? 1.5 : f === "craftsmenHall" ? 1.25 : 0.95;
        add("wedge", x, roofY + rh / 2, z - md / 4, mw + 0.55, rh, md / 2 + 0.12, dark);
        add("wedge", x, roofY + rh / 2, z + md / 4, mw + 0.55, rh, md / 2 + 0.12, dark, Math.PI);
        box(x, roofY + rh, z, mw + 0.65, 0.1, 0.12, trim);
      }
      const wx = x + mw * 0.3, wy = base + 1.1, wz = z + md / 2 + 0.075;
      box(wx, wy, wz, mw * 0.22, 0.85, 0.035, glass);
      for (const side of [-1, 1]) {
        box(wx + side * mw * 0.12, wy - 0.04, wz + 0.025, 0.055, 0.94, 0.055, wood);
        box(wx, wy + (side < 0 ? -0.04 : 0.85), wz + 0.025, mw * 0.25, 0.055, 0.055, wood);
      }
      box(wx, wy + 0.4, wz + 0.04, mw * 0.23, 0.04, 0.04, trim);
      if (f === "arcadeShop") {
        box(x, base + 2.3, z + md * 0.57, mw * 0.8, 0.06, 0.8, cloth);
        for (const side of [-1, 1]) box(x + side * mw * 0.38, base, z + md * 0.65, 0.09, 2.4, 0.09, wood);
      }
      for (const side of [-1, 1]) {
        const len = (mw - 1.9) / 2;
        for (const end of [-1, 1]) box(x + end * (0.95 + len / 2), base, z + side * md / 2, len, wall, 0.12, cream);
        box(x, base + 2.4, z + side * md / 2, 1.9, 0.7, 0.12, cream);
      }
      for (const side of [-1, 1]) {
        const len = (md - 1.9) / 2;
        for (const end of [-1, 1]) box(x + side * mw / 2, base, z + end * (0.95 + len / 2), 0.12, wall, len, cream);
        box(x + side * mw / 2, base + 2.4, z, 0.12, 0.7, 1.9, cream);
      }
      for (const dx of [-mw / 2, mw / 2]) for (const dz of [-md / 2, md / 2]) box(x + dx, base, z + dz, 0.16, wall + 0.12, 0.16, wood);
      box(x, base + 0.02, z, mw * 0.65, 0.025, md * 0.5, cloth);
      if (f === "arcadeShop") {
        append("counter", x - mw * 0.27, base, z, 0.6, Math.PI / 2);
        append("openShelf", x + mw * 0.3, base, z - md * 0.25, 0.75);
        append("crate", x + mw * 0.28, base, z + md * 0.25, 0.6);
      } else if (f === "craftsmenHall") {
        append(index % 2 ? "loom" : "workbench", x - mw * 0.25, base, z - md * 0.2, 0.7);
        append("anvil", x + mw * 0.25, base, z + md * 0.23, 0.7);
        append("weaponRack", x + mw * 0.3, base, z - md * 0.2, 0.65);
      } else if (f === "observatory") {
        append("globe", x - mw * 0.23, base, z - md * 0.18, 0.9);
        append("writingDesk", x + mw * 0.25, base, z + md * 0.25, 0.65);
        ring(x, base + wall + 0.5, z, 2.2, 0.3, 2.2, trim);
        cyl(x, base + wall + 0.2, z, 0.1, 0.5, metal);
      } else {
        append(index % 2 ? "singleBed" : "sofa", x - mw * 0.26, base, z - md * 0.3, 0.5);
        append("sideTable", x + mw * 0.28, base, z + md * 0.22, 0.7);
        box(x + mw * 0.28, base, z - md * 0.27, 0.85, 1.4, 0.24, wood);
        for (let row = 0; row < 2; row++) {
          box(x + mw * 0.28, base + 0.2 + row * 0.5, z - md * 0.24, 0.72, 0.36, 0.05, dark);
          for (let book = 0; book < 4; book++) box(x + mw * 0.02 + 0.1 + book * 0.16, base + 0.2 + row * 0.5, z - md * 0.21, 0.11, 0.24 + book % 2 * 0.06, 0.12, ["#6d827b", "#9b8064", "#797a92"][book % 3]);
        }
      }
      append("flowerVase", x - mw * 0.3, base, z + md * 0.28, 0.5);
    };
    for (const [i, p] of layouts2.entries()) room(p[0] * stepX, p[1] * stepZ, i);
    for (let i = 0; i < layouts2.length; i++) for (let j = i + 1; j < layouts2.length; j++) {
      const [ax, az] = layouts2[i], [bx, bz] = layouts2[j];
      if (Math.abs(ax - bx) + Math.abs(az - bz) !== 1) continue;
      box((ax + bx) * stepX / 2, 0, (az + bz) * stepZ / 2, ax !== bx ? 1.1 : 2, 0.15, az !== bz ? 1.1 : 2, stone);
    }
    if (f === "canalHouse") {
      box(0, 0, D * 0.43, W * 0.8, 0.12, 1.3, wood);
      for (let i = 0; i < 6; i++) box(-W * 0.35 + i * W * 0.14, 0, D * 0.46, 0.12, 0.75, 0.12, wood);
    }
    if (f === "woodlandRetreat") {
      for (const x of [-W * 0.42, W * 0.42]) append("pine", x, 0, D * 0.33, 0.35);
    }
    if (v >= 8) {
      for (const x of [-W * 0.4, W * 0.4]) {
        append("streetLamp", x, 0, D * 0.39, 0.8);
        append("flowerBed", x, 0, -D * 0.4, 0.55);
      }
      box(0, 0, D * 0.34, 3, 0.15, 2, stone);
    }
    return out;
  }
  if (f === "gardenGateway") {
    const spans = 1 + v % 3, opening = 2.2, width = spans * opening;
    for (let i = 0; i <= spans; i++) {
      const x = -width / 2 + i * opening;
      box(x, 0, 0, 0.28, 3.2, 0.28, stone);
      box(x, 3.1, 0, 0.46, 0.12, 0.46, trim);
      ball(x, 3.4, 0, 0.18, cream);
    }
    for (let i = 0; i < spans; i++) {
      const x = -width / 2 + (i + 0.5) * opening;
      box(x, 2.85, 0, opening, 0.18, 0.34, wood);
      for (let j = 0; j < 4; j++) box(x - opening * 0.37 + j * opening * 0.25, 3.1, 0, 0.06, 0.55, 0.08, leaf);
    }
    for (const z of [-D * 0.3, D * 0.3]) for (const x of [-W * 0.32, W * 0.32]) {
      append("flowerBed", x, 0, z, 0.65);
      if (v % 2) append("parkBench", x, 0, z, 0.7, Math.PI / 2);
    }
    for (let i = 0; i < 1 + v % 4; i++) box(-width * 0.35 + i * width * 0.7 / Math.max(1, v % 4), 3.5, -0.15, 0.09, 0.12 + 0.07 * (v % 4), 0.3, trim);
    if (v >= 8) append("fountain", 0, 0, -D * 0.25, 0.4);
    return out;
  }
  if (f === "reservoir") {
    const basins = 1 + v % 4, bw = W * 0.8 / basins;
    for (let i = 0; i < basins; i++) {
      const x = -W * 0.4 + (i + 0.5) * W * 0.8 / basins, d = D * (0.4 + i % 2 * 0.1);
      box(x, 0, 0, bw - 0.12, 0.12, d, stone);
      for (const side of [-1, 1]) {
        box(x + side * (bw / 2 - 0.15), 0, 0, 0.16, 0.65, d, stone);
        box(x, 0, side * d / 2, bw, 0.65, 0.16, stone);
      }
      box(x, 0.15, 0, bw - 0.4, 0.025, d - 0.3, glass);
      for (let j = 0; j < 2 + v % 3; j++) box(x, 0.73, -d * 0.3 + j * d * 0.3, bw + 0.15, 0.1, 0.12, wood);
    }
    for (let i = 0; i < 2 + v % 4; i++) {
      cyl(-W * 0.4 + i * W * 0.8 / (1 + v % 4), 0, -D * 0.4, 0.13, 1.4, metal);
      ring(-W * 0.4 + i * W * 0.8 / (1 + v % 4), 1.4, -D * 0.4, 0.55, 0.55, 0.07, metal);
    }
    return out;
  }
  if (f === "terrace") {
    const levels = 2 + v % 4, rise = 0.4, steps = levels * 3;
    for (let i = 0; i < levels; i++) {
      const w = W * (0.85 - i * 0.13), d = D * (0.8 - i * 0.1);
      box(0, 0, -i * 0.22, w, (i + 1) * rise, d, stone);
      for (const x of [-w * 0.48, w * 0.48]) box(x, (i + 1) * rise, -d * 0.3, 0.18, 0.6 + i * 0.1, 0.18, trim);
    }
    for (let i = 0; i < steps; i++) {
      box(0, 0, D * 0.48 - i * 0.23, 2.2, (i + 1) * levels * rise / steps, 0.25, stone);
      out.at(-1).stair = true;
    }
    for (const x of [-W * 0.35, W * 0.35]) append(v % 2 ? "indoorPlant" : "vase", x, levels * rise, 0, 0.65);
    for (let i = 0; i < 1 + v % 3; i++) box(-W * 0.25 + i * W * 0.5 / Math.max(1, v % 3), levels * rise, -D * 0.23, 0.35, 0.15, 0.35, trim);
    if (v >= 8) {
      box(0, levels * rise, -D * 0.27, 3.5, 0.12, 0.6, wood);
      decorativePosts(3.7, 1.5, 2.3);
    }
    return out;
  }
  if (f === "ruinSanctuary") {
    box(0, 0, 0, W * 0.85, 0.12, D * 0.85, stone);
    const n = 4 + v % 5;
    for (let i = 0; i < n; i++) {
      const a = i * Math.PI * 2 / n, r = W * 0.32, x = Math.cos(a) * r, z = Math.sin(a) * D * 0.31, h = 1.5 + (i + v) % 4 * 0.65;
      cyl(x, 0.12, z, 0.25, h, stone);
      box(x, h + 0.12, z, 0.8, 0.15, 0.8, trim);
      if (i % 2 === v % 2) add("rock", x, h + 0.4, z, 0.5, 0.5, 0.4, stone);
    }
    box(0, 0.12, 0, 2.5, 0.35, 2, stone);
    append("altarTable", 0, 0.47, 0, 0.7);
    for (let i = 0; i < 2 + v % 4; i++) add("rock", -W * 0.3 + i * W * 0.16, 0.16, D * 0.32, 0.9, 0.3, 0.6, stone);
    return out;
  }
  if (f === "rootGrove") {
    const n = 2 + v % 4;
    for (let i = 0; i < n; i++) {
      const a = i * Math.PI * 2 / n, x = Math.cos(a) * W * 0.23, z = Math.sin(a) * D * 0.23, h = H * (0.5 + i % 3 * 0.12);
      cyl(x, 0, z, 0.28, h, wood);
      for (let j = 0; j < 5; j++) {
        const t = j * Math.PI * 2 / 5;
        add("rock", x + Math.cos(t) * 0.7, 0.25, z + Math.sin(t) * 0.7, 1.4, 0.5, 0.45, wood, t);
      }
      for (let j = 0; j < 3; j++) add("rock", x + Math.sin(i + j) * 0.7, h - 0.2 + j * 0.65, z + Math.cos(i - j) * 0.5, 3.4 - j * 0.45, 1.3, 3.2 - j * 0.3, leaf);
    }
    for (let i = 0; i < 3 + v % 3; i++) add("rock", -W * 0.3 + i * W * 0.15, 0.2, D * 0.32, 0.7, 0.4, 0.6, stone);
    return out;
  }
  if (f === "rockGarden") {
    const n = 3 + v % 5;
    for (let i = 0; i < n; i++) {
      const a = i * Math.PI * 2 / n, r = W * 0.24, h = 0.6 + (i + v) % 5 * 0.48;
      add("rock", Math.cos(a) * r, h / 2, Math.sin(a) * D * 0.25, 1.3, h, 0.9, stone, a);
      box(Math.cos(a) * r, 0, Math.sin(a) * D * 0.25, 1.6, 0.12, 1.3, dark);
    }
    append(v % 2 ? "pine" : "willow", 0, 0, 0, v % 2 ? 0.3 : 0.35);
    for (let i = 0; i < 4 + v % 3; i++) {
      const a = i * Math.PI * 2 / (4 + v % 3);
      ball(Math.sin(a) * W * 0.4, 0.12, Math.cos(a) * D * 0.4, 0.12, cream);
    }
    return out;
  }
  throw Error("Missing expansion model " + kind);
}
export {
  COMMUNITY_EXPANSION,
  buildCommunityExpansion
};
