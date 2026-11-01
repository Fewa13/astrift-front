// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.

// src/jade/rock-geometry.js
import * as T from "./three.module.js";

// src/jade/craft.ts
var JADE_BUDDHA_PARTS = [
  [0, -0.12, 0.52, 0.53, 0.5, 0.36],
  [0, 0.53, 0.49, 0.28, 0.28, 0.29],
  [0, 0.83, 0.5, 0.13, 0.1, 0.19],
  [-0.29, 0.51, 0.5, 0.085, 0.19, 0.14],
  [0.29, 0.51, 0.5, 0.085, 0.19, 0.14],
  [-0.48, -0.02, 0.48, 0.15, 0.35, 0.22],
  [0.48, -0.02, 0.48, 0.15, 0.35, 0.22],
  [-0.29, -0.29, 0.21, 0.18, 0.1, 0.13],
  [0.29, -0.29, 0.21, 0.18, 0.1, 0.13],
  [-0.46, -0.51, 0.49, 0.39, 0.23, 0.27],
  [0.46, -0.51, 0.49, 0.39, 0.23, 0.27],
  [0, -0.74, 0.54, 0.72, 0.105, 0.27],
  [0, 0.49, 0.19, 0.065, 0.07, 0.07],
  [-0.115, 0.57, 0.225, 0.075, 0.018, 0.028],
  [0.115, 0.57, 0.225, 0.075, 0.018, 0.028],
  [-0.08, 0.37, 0.225, 0.058, 0.017, 0.028],
  [0, 0.35, 0.21, 0.055, 0.015, 0.028],
  [0.08, 0.37, 0.225, 0.058, 0.017, 0.028],
  ...Array.from({ length: 7 }, (_, i) => [(i - 3) * 0.19, -0.69 + Math.abs(i - 3) * 9e-3, 0.26, 0.115, 0.09, 0.1])
];
function jadeBuddhaFootprint(x, y, margin = 0) {
  return JADE_BUDDHA_PARTS.some(([cx, cy, , rx, ry]) => ((x - cx) / (rx + margin)) ** 2 + ((y - cy) / (ry + margin)) ** 2 <= 1);
}
var JADE_BUDDHA_OUTLINE = JADE_BUDDHA_PARTS.flatMap(([cx, cy, , rx, ry], index) => Array.from({ length: 96 }, (_, i) => {
  const a = i / 96 * Math.PI * 2, b = (i + 1) / 96 * Math.PI * 2, m = (a + b) / 2, x = cx + rx * Math.cos(m), y = cy + ry * Math.sin(m);
  if (JADE_BUDDHA_PARTS.some(([ox, oy, , sx, sy], n) => n !== index && ((x - ox) / sx) ** 2 + ((y - oy) / sy) ** 2 < 1)) return [];
  return [[cx + rx * Math.cos(a), cy + ry * Math.sin(a), cx + rx * Math.cos(b), cy + ry * Math.sin(b)]];
}).flat());
var BUDDHA_AREA_RATIO = JADE_BUDDHA_OUTLINE.reduce((n, [x, y, u, v]) => n + x * v - u * y, 0) / (2 * Math.PI);
var dot = (a, b) => a.reduce((s, x, i) => s + x * b[i], 0);
function inJadeBlank(b, p, margin = 0) {
  const d = p.map((x2, i) => x2 - b.point[i]), t = -dot(d, b.normal), x = dot(d, b.u), y = dot(d, b.v), r = Math.hypot(x, y);
  return t >= -margin && t <= b.depth + margin && (b.kind === "buddha" ? jadeBuddhaFootprint(x / b.radius, y / b.radius, margin / b.radius) : r <= b.radius + margin && (b.inner === 0 || r >= b.inner - margin));
}

// src/jade/varieties.ts
var JADE_VARIETIES = [
  ["imperial", "\u5E1D\u738B\u7EFF", "Imperial Green", "#07864c", "#004f32", "#59dc80", 1, 2.2, 1, "\u6D53\u7EFF\u51DD\u805A\uFF0C\u6DF1\u5904\u6709\u4E1D\u7ED2\u822C\u7684\u8272\u6839\u3002", "Saturated emerald with deep, velvet color roots."],
  ["sunlit", "\u9633\u7EFF", "Sunlit Green", "#5dd54b", "#189347", "#d4f08c", 2, 1.45, 5, "\u660E\u4EAE\u9EC4\u7EFF\uFF0C\u8272\u5E26\u5982\u9633\u5149\u7A7F\u8FC7\u53F6\u7247\u3002", "Bright yellow-green in sunlit ribbons."],
  ["apple", "\u82F9\u679C\u7EFF", "Apple Green", "#8ac962", "#3c9a54", "#d8edb5", 1, 1.05, 10, "\u9C9C\u5AE9\u679C\u7EFF\u4E0E\u67D4\u548C\u6D45\u8272\u4E91\u56E2\u4EA4\u7EC7\u3002", "Fresh apple green with soft pale clouds."],
  ["spinach", "\u83E0\u83DC\u7EFF", "Spinach Green", "#387d42", "#173d31", "#92b275", 3, 1.05, 10, "\u6DF1\u7EFF\u5E95\u8272\u4E2D\u5EF6\u4F38\u51FA\u7EA4\u7EF4\u72B6\u8109\u7EDC\u3002", "Dark leafy green threaded with fine veins."],
  ["bean", "\u8C46\u7EFF", "Bean Green", "#98b775", "#587c4e", "#d4d6a4", 8, 0.8, 14, "\u9752\u8C46\u5E95\u8272\uFF0C\u7EC6\u788E\u9897\u7C92\u6E05\u6670\u53EF\u89C1\u3002", "Muted bean green with a granular texture."],
  ["oil", "\u6CB9\u9752", "Oily Blue-Green", "#5d8582", "#304e52", "#a5b9a3", 1, 0.85, 12, "\u7070\u84DD\u6CB9\u6DA6\u5E95\u8272\uFF0C\u4E91\u96FE\u6DF1\u6D45\u6D41\u52A8\u3002", "Oily grey-blue with drifting smoky clouds."],
  ["bluewater", "\u84DD\u6C34", "Bluewater", "#57a7b9", "#25506e", "#b6e3df", 2, 1.3, 6, "\u6E56\u84DD\u8272\u8089\u4E2D\u6709\u6D41\u52A8\u7684\u6DF1\u6D45\u6C34\u7EB9\u3002", "Lake blue with flowing, layered water lines."],
  ["clearwater", "\u6674\u6C34", "Clearwater", "#acd7b9", "#6bafac", "#e7f2d6", 1, 1.2, 8, "\u6D45\u9752\u4E0E\u6DE1\u7EFF\u76F8\u878D\uFF0C\u50CF\u96E8\u540E\u7684\u5929\u7A7A\u3002", "Pale cyan and green like a sky after rain."],
  ["violet", "\u7D2B\u7F57\u5170", "Violet", "#ae7fca", "#714b9d", "#e6c4ef", 1, 1.5, 5, "\u7D2B\u8272\u4E91\u7D6E\u5728\u6DE1\u767D\u7389\u8089\u4E2D\u6E10\u6B21\u94FA\u5F00\u3002", "Lavender clouds spreading through pale jade."],
  ["royalpurple", "\u7687\u5BB6\u7D2B", "Royal Purple", "#7740b4", "#371454", "#d49be9", 3, 2.1, 1, "\u6D53\u7D2B\u8272\u6839\u4E0E\u94F6\u7D2B\u7EC6\u8109\u76F8\u4E92\u7A7F\u63D2\u3002", "Rich purple roots crossed by silver-lilac veins."],
  ["pink", "\u7C89\u7D2B", "Rose Lavender", "#e1adcf", "#a36b9c", "#f9dfec", 1, 1.2, 7, "\u67D4\u7C89\u4E0E\u6D45\u7D2B\u6DF7\u6210\u7EC6\u817B\u7684\u82B1\u96FE\u3002", "Rose and lilac blended into a soft floral mist."],
  ["yellow", "\u9EC4\u7FE1", "Golden Yellow", "#dfb44f", "#a77929", "#fae4a0", 2, 1.05, 10, "\u91D1\u9EC4\u5C42\u5E26\u4E2D\u5939\u7740\u6D45\u871C\u8272\u7EB9\u8DEF\u3002", "Golden layers lined with pale honey."],
  ["honey", "\u871C\u7CD6\u9EC4", "Honey Amber", "#bd812e", "#75491f", "#f1c86c", 3, 1.2, 7, "\u7425\u73C0\u871C\u8272\u4E2D\u53EF\u89C1\u7CD6\u6D46\u822C\u7684\u6D53\u8272\u8109\u3002", "Amber honey with dark syrup-like veins."],
  ["red", "\u7EA2\u7FE1", "Red Jade", "#ce5b40", "#803326", "#f4ac79", 2, 1.4, 6, "\u6731\u7EA2\u5230\u6A58\u7EA2\u5C42\u5C42\u8FC7\u6E21\uFF0C\u50CF\u51DD\u56FA\u7684\u665A\u971E\u3002", "Vermilion and orange layers like a sunset."],
  ["cockscomb", "\u9E21\u51A0\u7EA2", "Crimson Crest", "#b52630", "#5c1727", "#ef7971", 3, 1.8, 2, "\u6DF1\u7EA2\u7389\u8089\u91CC\u5206\u5E03\u9C9C\u4EAE\u7684\u706B\u7130\u8272\u6839\u3002", "Deep crimson with bright flame-like roots."],
  ["ink", "\u58A8\u7FE0", "Ink Green", "#172e2b", "#071816", "#22a268", 7, 1.5, 5, "\u5916\u89C2\u8FD1\u9ED1\uFF0C\u6253\u706F\u5904\u900F\u51FA\u6DF1\u7EFF\u8272\u3002", "Near-black jade revealing deep green under light."],
  ["black", "\u4E4C\u9E21\u79CD", "Black Cloud", "#ced4cb", "#29332e", "#88978a", 4, 0.8, 12, "\u9ED1\u8272\u6591\u56E2\u6563\u843D\u5728\u7070\u767D\u7389\u8089\u4E2D\u3002", "Black mottling scattered through grey-white jade."],
  ["white", "\u767D\u51B0", "White Ice", "#e2eee7", "#afc8c7", "#fbfcf5", 1, 1.15, 10, "\u51B7\u767D\u8272\u8089\u4E0E\u6781\u6D45\u7684\u9752\u8272\u6C34\u7EB9\u3002", "Cool white with faint cyan water lines."],
  ["snow", "\u96EA\u82B1\u68C9", "Snowflake", "#8ab7b0", "#dff1e8", "#4c8d91", 10, 1.25, 7, "\u84DD\u9752\u5E95\u91CC\u6563\u7740\u4E00\u7C07\u7C07\u767D\u8272\u96EA\u82B1\u68C9\u3002", "White snowflake clusters suspended in blue-green."],
  ["greenflower", "\u7EFF\u98D8\u82B1", "Floating Green", "#e0e9d5", "#2d9457", "#8cc29a", 4, 1.3, 7, "\u6E05\u6DE1\u5E95\u8272\u4E0A\u6F02\u6D6E\u7740\u5206\u6563\u7684\u7FE0\u7EFF\u82B1\u56E2\u3002", "Scattered emerald blossoms on a pale ground."],
  ["blueflower", "\u84DD\u98D8\u82B1", "Floating Blue", "#d5e8e4", "#377c9c", "#91baca", 4, 1.35, 6, "\u9752\u767D\u7389\u8089\u95F4\u6F02\u7740\u6DF1\u6D45\u4E0D\u540C\u7684\u84DD\u82B1\u3002", "Blue blossoms drifting through cyan-white jade."],
  ["spring", "\u6625\u5E26\u5F69", "Spring Colors", "#b98bc8", "#58b77d", "#ede3e8", 5, 1.7, 4, "\u7D2B\u8272\u4E0E\u7EFF\u8272\u5728\u540C\u4E00\u5757\u7389\u8089\u4E0A\u4EA4\u6C47\u3002", "Lavender and green meet inside the same stone."],
  ["tricolor", "\u798F\u7984\u5BFF", "Fortune Tricolor", "#b487c7", "#5aaf6c", "#e1b557", 6, 2.1, 1, "\u7D2B\u3001\u7EFF\u3001\u91D1\u9EC4\u4E09\u8272\u4EA4\u9519\uFF0C\u5207\u4F4D\u6539\u53D8\u8272\u5F69\u6BD4\u4F8B\u3002", "Purple, green and gold; each cut reveals a different balance."],
  ["goldthread", "\u91D1\u4E1D\u79CD", "Golden Threads", "#a8cc81", "#ead16b", "#408d64", 9, 1.45, 5, "\u6D45\u7EFF\u7389\u8089\u4E2D\u6709\u7EC6\u957F\u91D1\u9EC4\u4E1D\u7EBF\u3002", "Fine golden threads running through light green jade."],
  ["moss", "\u82D4\u85D3\u7389", "Moss Veil", "#b7c5a5", "#3d6c4b", "#6f9472", 4, 0.85, 10, "\u82D4\u85D3\u72B6\u6DF1\u8272\u6591\u7EB9\u5728\u6D45\u5E95\u4E2D\u8513\u5EF6\u3002", "Moss-like dark inclusions spreading through a pale ground."],
  ["watermelon", "\u897F\u74DC\u7389", "Watermelon", "#d88d9c", "#55a576", "#ece6bd", 5, 1.15, 6, "\u6843\u7EA2\u548C\u7FE0\u7EFF\u76F8\u90BB\uFF0C\u4E2D\u95F4\u6709\u6D45\u8272\u8FC7\u6E21\u5E26\u3002", "Rose and green separated by a pale transition band."],
  ["orchid", "\u5170\u82B1\u7D2B", "Orchid Veins", "#d5c2e1", "#8756a1", "#eee5ed", 3, 1.3, 6, "\u6DE1\u7D2B\u5E95\u4E2D\u8212\u5C55\u51FA\u5170\u82B1\u822C\u7684\u6D53\u7D2B\u8109\u7EDC\u3002", "Orchid-purple veins unfolding in pale lavender."],
  ["lemon", "\u67E0\u6AAC\u9EC4", "Lemon Jade", "#e4db82", "#9baa64", "#faf0ba", 8, 0.95, 9, "\u6D45\u9EC4\u4E0E\u5AE9\u7EFF\u4EA4\u878D\uFF0C\u5E26\u6709\u7EC6\u5C0F\u7684\u4E91\u70B9\u3002", "Pale yellow and fresh green with tiny cloudy specks."],
  ["whitegreen", "\u767D\u5E95\u9752", "White-ground Green", "#e7ebda", "#19764b", "#8cb69a", 4, 1.25, 7, "\u5976\u767D\u5E95\u4E0A\u81EA\u7136\u6563\u5F00\u6DF1\u6D45\u7FE0\u8272\uFF0C\u4E0D\u89C4\u5219\u7684\u8272\u6839\u9690\u5165\u7389\u8089\u3002", "Emerald blooms diffuse into a creamy white ground."],
  ["iceblue", "\u51B0\u6674\u84DD", "Glacial Blue", "#bfdcde", "#5795b0", "#eaf4ee", 1, 1.3, 6, "\u6D45\u51B0\u84DD\u4E2D\u6D6E\u7740\u8F7B\u67D4\u7684\u6C34\u96FE\uFF0C\u8272\u6CFD\u4ECE\u6DF1\u5904\u7F13\u7F13\u6563\u5F00\u3002", "Soft icy blue with gently diffusing water-like clouds."],
  ["smokelavender", "\u70DF\u7D2B", "Smoky Lavender", "#b6a8c9", "#77728e", "#e0d7e5", 1, 1.2, 7, "\u7070\u7D2B\u96FE\u7D6E\u5C42\u5C42\u4EA4\u7EC7\uFF0C\u6D53\u6DE1\u8FB9\u754C\u67D4\u548C\u3002", "Layered grey-lavender mist with soft, fading edges."],
  ["lotuspink", "\u85D5\u7C89", "Lotus Pink", "#e8c6c0", "#ca9da7", "#f4e3d9", 1, 1.1, 9, "\u6E29\u6DA6\u85D5\u7C89\u5E26\u7740\u7EC6\u817B\u5976\u767D\u4E91\u56E2\u3002", "Warm lotus pink with delicate creamy clouds."],
  ["lakegreen", "\u6E56\u6C34\u7EFF", "Lagoon Green", "#92cbbb", "#3f9e91", "#d4e7d6", 2, 1.2, 8, "\u9752\u7EFF\u6C34\u8272\u6DF1\u6D45\u76F8\u878D\uFF0C\u67D4\u957F\u8272\u8109\u7F13\u7F13\u5EF6\u5C55\u3002", "Layered lagoon green crossed by elongated color roots."],
  ["sprinkledgold", "\u6D12\u91D1", "Scattered Gold", "#d9e2cd", "#d3a647", "#8cae8d", 10, 1.35, 5, "\u6DE1\u9752\u5E95\u4E0A\u6563\u843D\u4E0D\u89C4\u5219\u7684\u91D1\u9EC4\u8272\u6591\uFF0C\u758F\u5BC6\u81EA\u7136\u3002", "Irregular golden flecks scattered through pale cyan jade."],
  ["redyellow", "\u7EA2\u9EC4\u7FE1", "Sunset Amber", "#dcad58", "#b96545", "#efd49c", 11, 1.3, 6, "\u871C\u9EC4\u4E0E\u6696\u7EA2\u76F8\u4E92\u6D78\u67D3\uFF0C\u50CF\u7F13\u6162\u6C89\u6DC0\u7684\u77FF\u7269\u8272\u5C42\u3002", "Honey yellow and warm red blend in mineral-like layers."],
  ["goldgreen", "\u91D1\u5305\u7FE0", "Gold-veiled Green", "#cbb56c", "#3d8d61", "#e7dfb8", 5, 1.4, 5, "\u67D4\u91D1\u8272\u7389\u8089\u95F4\u900F\u51FA\u6DF1\u7EFF\u7684\u8272\u56E2\uFF0C\u8FB9\u7F18\u5E76\u4E0D\u9F50\u6574\u3002", "Deep green clouds emerge through irregular golden layers."],
  ["smokeflower", "\u70DF\u7070\u98D8\u82B1", "Smoky Blossoms", "#d2d9d5", "#687f88", "#a6b8b3", 4, 1.15, 8, "\u9752\u7070\u8272\u82B1\u56E2\u5728\u6DE1\u767D\u5E95\u4E2D\u805A\u6563\uFF0C\u5982\u6C34\u4E2D\u6655\u5F00\u7684\u58A8\u3002", "Cyan-grey blooms disperse like ink through a pale ground."],
  ["olive", "\u6A44\u6984\u7EFF", "Olive Green", "#a9b77b", "#728557", "#d8dcb8", 1, 1, 10, "\u6A44\u6984\u8272\u4E0E\u67D4\u548C\u8349\u9752\u81EA\u7136\u4EA4\u7EC7\uFF0C\u5E26\u7740\u4F4E\u8C03\u6CB9\u6DA6\u7684\u5149\u6CFD\u3002", "Olive and soft grassy green with a muted, oily luster."],
  ["peachcloud", "\u6843\u82B1\u7389", "Peach Blossom", "#e7beb5", "#bf8e9e", "#f0dcd0", 4, 1.15, 8, "\u6D45\u7C89\u5E95\u4E2D\u6D6E\u7740\u6DF1\u6D45\u4E0D\u540C\u7684\u6843\u7EA2\u4E91\u7D6E\u3002", "Rose-pink clouds float through a pale peach ground."],
  ["inkwash", "\u9752\u82B1\u58A8\u97F5", "Ink-wash Jade", "#d7dfd9", "#3c5b5a", "#8aaba5", 12, 1.3, 6, "\u58A8\u9752\u8272\u7EC6\u8109\u4E0E\u96FE\u72B6\u8272\u56E2\u4EA4\u7EC7\uFF0C\u4E0D\u518D\u662F\u89C4\u6574\u7684\u7EBF\u6761\u3002", "Inky cyan veins mingle with misty clouds, without regular stripes."]
].map(([id, name, en, a, b, c, pattern, multiplier, weight, desc, descEn]) => ({ id, name, en, colors: [a, b, c], pattern, multiplier, weight, desc, descEn }));
var JADE_PRICE_RATES = [4, 50, 300, 5e3, 85e3, 3e6];

// src/jade/stone-core.js
var GRADES = [
  { name: "\u666E\u901A\u77F3\u6599", short: "\u77F3", color: "#a8a391", rate: 4, desc: "\u9897\u7C92\u7C97\u3001\u51E0\u4E4E\u4E0D\u900F\u5149\u3002\u4E5F\u6709\u5C5E\u4E8E\u5B83\u7684\u6734\u5B9E\u3002" },
  { name: "\u8C46\u79CD", short: "\u8C46", color: "#8dba76", rate: 50, desc: "\u6676\u4F53\u5982\u8C46\uFF0C\u9752\u7EFF\u8D28\u6734\uFF0C\u9002\u5408\u5165\u95E8\u628A\u73A9\u3002" },
  { name: "\u7CEF\u79CD", short: "\u7CEF", color: "#a8d9ad", rate: 140, desc: "\u5982\u7CEF\u7C73\u6C64\u822C\u6E29\u6DA6\uFF0C\u7EC6\u817B\u67D4\u548C\uFF0C\u9887\u6709\u97F5\u5473\u3002" },
  { name: "\u7CEF\u51B0\u79CD", short: "\u6DA6", color: "#72d6b0", rate: 350, desc: "\u7CEF\u610F\u6E10\u9000\uFF0C\u51B0\u611F\u521D\u751F\uFF0C\u6E29\u6DA6\u4E0E\u6E05\u900F\u517C\u5177\u3002" },
  { name: "\u51B0\u79CD", short: "\u51B0", color: "#5fe5c1", rate: 850, desc: "\u4F3C\u51B0\u6E05\u900F\uFF0C\u5149\u5F71\u6D41\u8F6C\uFF0C\u5DF2\u662F\u96BE\u5F97\u7684\u597D\u6599\u3002" },
  { name: "\u73BB\u7483\u79CD", short: "\u7483", color: "#c0ffe9", rate: 1800, desc: "\u6676\u83B9\u901A\u900F\uFF0C\u5B9B\u82E5\u51DD\u56FA\u7684\u6E05\u6CC9\uFF0C\u53EF\u9047\u800C\u4E0D\u53EF\u6C42\u3002" }
];
for (const [i, g] of GRADES.entries()) g.rate = JADE_PRICE_RATES[i];
var clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function phase3D(a) {
  return a.seed % 997 / 997 * Math.PI * 2;
}
function core3D(a) {
  const phase = phase3D(a);
  return { x: (a.coreX - 50) * 0.025, y: Math.sin(phase) * 0.12, z: Math.cos(phase * 1.7) * 0.2 };
}
function volumeSample3D(a, p) {
  const phase = phase3D(a), angle = a.coreAngle * Math.PI / 180, center = core3D(a), x = p.x - center.x, y = p.y - center.y, z = p.z - center.z;
  const u = x * Math.cos(angle) + y * Math.sin(angle), v = -x * Math.sin(angle) + y * Math.cos(angle);
  const cloud = Math.sin(p.x * 5 + Math.sin(p.y * 4) * 2 + phase) * Math.cos(p.z * 5 + p.y * 3 - phase);
  const coverage = clamp(1.3 - (u / (0.4 + a.core * 0.68)) ** 2 - (v / (0.6 + a.core * 0.65)) ** 2 - (z / (0.48 + a.core * 0.65)) ** 2 + cloud * 0.15, 0, 1);
  const strength = a.grade === 0 ? 0.025 : Math.max(0.015, [0.025, 0.18, 0.38, 0.55, 0.76, 0.93][a.grade] * coverage);
  return { coverage, strength, label: a.grade === 0 || coverage < 0.12 ? "\u6B64\u5904\u9EC4\u767D\u5F31\u5149\uFF0C\u900F\u5165\u5F88\u6D45\uFF0C\u6682\u672A\u89C1\u660E\u663E\u7EFF\u8272\u3002" : a.grade === 1 ? "\u89C1\u7EFF\u4F46\u9897\u7C92\u7C97\u3001\u900F\u5149\u77ED\uFF0C\u4F4E\u79CD\u6C34\u6599\uFF0C\u4E0D\u8981\u53EA\u56E0\u989C\u8272\u8FFD\u4EF7\u3002" : strength > 0.45 ? "\u6B64\u5904\u6E05\u7EFF\u900F\u4EAE\uFF0C\u5149\u6655\u5411\u5185\u5EF6\u4F38\uFF0C\u4ECD\u9700\u7559\u610F\u68C9\u88C2\u3002" : strength > 0.19 ? "\u6B64\u5904\u6709\u67D4\u548C\u9752\u7EFF\uFF0C\u900F\u5149\u4E00\u822C\uFF0C\u7EE7\u7EED\u8F6C\u52A8\u770B\u770B\u522B\u7684\u9762\u3002" : "\u6B64\u5904\u7565\u89C1\u6D45\u7EFF\uFF0C\u5149\u6655\u8F83\u77ED\uFF0C\u539A\u76AE\u6216\u9897\u7C92\u5F71\u54CD\u900F\u5149\u3002" };
}

// node_modules/three/examples/jsm/utils/BufferGeometryUtils.js
import {
  BufferAttribute,
  BufferGeometry,
  Float32BufferAttribute,
  InstancedBufferAttribute,
  InterleavedBuffer,
  InterleavedBufferAttribute,
  TriangleFanDrawMode,
  TriangleStripDrawMode,
  TrianglesDrawMode,
  Vector3
} from "./three.module.js";
function mergeGeometries(geometries, useGroups = false) {
  const isIndexed = geometries[0].index !== null;
  const attributesUsed = new Set(Object.keys(geometries[0].attributes));
  const morphAttributesUsed = new Set(Object.keys(geometries[0].morphAttributes));
  const attributes = {};
  const morphAttributes = {};
  const morphTargetsRelative = geometries[0].morphTargetsRelative;
  const mergedGeometry = new BufferGeometry();
  let offset = 0;
  for (let i = 0; i < geometries.length; ++i) {
    const geometry = geometries[i];
    let attributesCount = 0;
    if (isIndexed !== (geometry.index !== null)) {
      console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + i + ". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them.");
      return null;
    }
    for (const name in geometry.attributes) {
      if (!attributesUsed.has(name)) {
        console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + i + '. All geometries must have compatible attributes; make sure "' + name + '" attribute exists among all geometries, or in none of them.');
        return null;
      }
      if (attributes[name] === void 0) attributes[name] = [];
      attributes[name].push(geometry.attributes[name]);
      attributesCount++;
    }
    if (attributesCount !== attributesUsed.size) {
      console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + i + ". Make sure all geometries have the same number of attributes.");
      return null;
    }
    if (morphTargetsRelative !== geometry.morphTargetsRelative) {
      console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + i + ". .morphTargetsRelative must be consistent throughout all geometries.");
      return null;
    }
    for (const name in geometry.morphAttributes) {
      if (!morphAttributesUsed.has(name)) {
        console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + i + ".  .morphAttributes must be consistent throughout all geometries.");
        return null;
      }
      if (morphAttributes[name] === void 0) morphAttributes[name] = [];
      morphAttributes[name].push(geometry.morphAttributes[name]);
    }
    if (useGroups) {
      let count;
      if (isIndexed) {
        count = geometry.index.count;
      } else if (geometry.attributes.position !== void 0) {
        count = geometry.attributes.position.count;
      } else {
        console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + i + ". The geometry must have either an index or a position attribute");
        return null;
      }
      mergedGeometry.addGroup(offset, count, i);
      offset += count;
    }
  }
  if (isIndexed) {
    let indexOffset = 0;
    const mergedIndex = [];
    for (let i = 0; i < geometries.length; ++i) {
      const index = geometries[i].index;
      for (let j = 0; j < index.count; ++j) {
        mergedIndex.push(index.getX(j) + indexOffset);
      }
      indexOffset += geometries[i].attributes.position.count;
    }
    mergedGeometry.setIndex(mergedIndex);
  }
  for (const name in attributes) {
    const mergedAttribute = mergeAttributes(attributes[name]);
    if (!mergedAttribute) {
      console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the " + name + " attribute.");
      return null;
    }
    mergedGeometry.setAttribute(name, mergedAttribute);
  }
  for (const name in morphAttributes) {
    const numMorphTargets = morphAttributes[name][0].length;
    if (numMorphTargets === 0) break;
    mergedGeometry.morphAttributes = mergedGeometry.morphAttributes || {};
    mergedGeometry.morphAttributes[name] = [];
    for (let i = 0; i < numMorphTargets; ++i) {
      const morphAttributesToMerge = [];
      for (let j = 0; j < morphAttributes[name].length; ++j) {
        morphAttributesToMerge.push(morphAttributes[name][j][i]);
      }
      const mergedMorphAttribute = mergeAttributes(morphAttributesToMerge);
      if (!mergedMorphAttribute) {
        console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the " + name + " morphAttribute.");
        return null;
      }
      mergedGeometry.morphAttributes[name].push(mergedMorphAttribute);
    }
  }
  return mergedGeometry;
}
function mergeAttributes(attributes) {
  let TypedArray;
  let itemSize;
  let normalized;
  let gpuType = -1;
  let arrayLength = 0;
  for (let i = 0; i < attributes.length; ++i) {
    const attribute = attributes[i];
    if (TypedArray === void 0) TypedArray = attribute.array.constructor;
    if (TypedArray !== attribute.array.constructor) {
      console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes.");
      return null;
    }
    if (itemSize === void 0) itemSize = attribute.itemSize;
    if (itemSize !== attribute.itemSize) {
      console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes.");
      return null;
    }
    if (normalized === void 0) normalized = attribute.normalized;
    if (normalized !== attribute.normalized) {
      console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes.");
      return null;
    }
    if (gpuType === -1) gpuType = attribute.gpuType;
    if (gpuType !== attribute.gpuType) {
      console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes.");
      return null;
    }
    arrayLength += attribute.count * itemSize;
  }
  const array = new TypedArray(arrayLength);
  const result = new BufferAttribute(array, itemSize, normalized);
  let offset = 0;
  for (let i = 0; i < attributes.length; ++i) {
    const attribute = attributes[i];
    if (attribute.isInterleavedBufferAttribute) {
      const tupleOffset = offset / itemSize;
      for (let j = 0, l = attribute.count; j < l; j++) {
        for (let c = 0; c < itemSize; c++) {
          const value = attribute.getComponent(j, c);
          result.setComponent(j + tupleOffset, c, value);
        }
      }
    } else {
      array.set(attribute.array, offset);
    }
    offset += attribute.count * itemSize;
  }
  if (gpuType !== void 0) {
    result.gpuType = gpuType;
  }
  return result;
}
function mergeVertices(geometry, tolerance = 1e-4) {
  tolerance = Math.max(tolerance, Number.EPSILON);
  const hashToIndex = {};
  const indices = geometry.getIndex();
  const positions = geometry.getAttribute("position");
  const vertexCount = indices ? indices.count : positions.count;
  let nextIndex = 0;
  const attributeNames = Object.keys(geometry.attributes);
  const tmpAttributes = {};
  const tmpMorphAttributes = {};
  const newIndices = [];
  const getters = ["getX", "getY", "getZ", "getW"];
  const setters = ["setX", "setY", "setZ", "setW"];
  for (let i = 0, l = attributeNames.length; i < l; i++) {
    const name = attributeNames[i];
    const attr = geometry.attributes[name];
    tmpAttributes[name] = new attr.constructor(
      new attr.array.constructor(attr.count * attr.itemSize),
      attr.itemSize,
      attr.normalized
    );
    const morphAttributes = geometry.morphAttributes[name];
    if (morphAttributes) {
      if (!tmpMorphAttributes[name]) tmpMorphAttributes[name] = [];
      morphAttributes.forEach((morphAttr, i2) => {
        const array = new morphAttr.array.constructor(morphAttr.count * morphAttr.itemSize);
        tmpMorphAttributes[name][i2] = new morphAttr.constructor(array, morphAttr.itemSize, morphAttr.normalized);
      });
    }
  }
  const halfTolerance = tolerance * 0.5;
  const exponent = Math.log10(1 / tolerance);
  const hashMultiplier = Math.pow(10, exponent);
  const hashAdditive = halfTolerance * hashMultiplier;
  for (let i = 0; i < vertexCount; i++) {
    const index = indices ? indices.getX(i) : i;
    let hash = "";
    for (let j = 0, l = attributeNames.length; j < l; j++) {
      const name = attributeNames[j];
      const attribute = geometry.getAttribute(name);
      const itemSize = attribute.itemSize;
      for (let k = 0; k < itemSize; k++) {
        hash += `${~~(attribute[getters[k]](index) * hashMultiplier + hashAdditive)},`;
      }
    }
    if (hash in hashToIndex) {
      newIndices.push(hashToIndex[hash]);
    } else {
      for (let j = 0, l = attributeNames.length; j < l; j++) {
        const name = attributeNames[j];
        const attribute = geometry.getAttribute(name);
        const morphAttributes = geometry.morphAttributes[name];
        const itemSize = attribute.itemSize;
        const newArray = tmpAttributes[name];
        const newMorphArrays = tmpMorphAttributes[name];
        for (let k = 0; k < itemSize; k++) {
          const getterFunc = getters[k];
          const setterFunc = setters[k];
          newArray[setterFunc](nextIndex, attribute[getterFunc](index));
          if (morphAttributes) {
            for (let m = 0, ml = morphAttributes.length; m < ml; m++) {
              newMorphArrays[m][setterFunc](nextIndex, morphAttributes[m][getterFunc](index));
            }
          }
        }
      }
      hashToIndex[hash] = nextIndex;
      newIndices.push(nextIndex);
      nextIndex++;
    }
  }
  const result = geometry.clone();
  for (const name in geometry.attributes) {
    const tmpAttribute = tmpAttributes[name];
    result.setAttribute(name, new tmpAttribute.constructor(
      tmpAttribute.array.slice(0, nextIndex * tmpAttribute.itemSize),
      tmpAttribute.itemSize,
      tmpAttribute.normalized
    ));
    if (!(name in tmpMorphAttributes)) continue;
    for (let j = 0; j < tmpMorphAttributes[name].length; j++) {
      const tmpMorphAttribute = tmpMorphAttributes[name][j];
      result.morphAttributes[name][j] = new tmpMorphAttribute.constructor(
        tmpMorphAttribute.array.slice(0, nextIndex * tmpMorphAttribute.itemSize),
        tmpMorphAttribute.itemSize,
        tmpMorphAttribute.normalized
      );
    }
  }
  result.setIndex(newIndices);
  return result;
}

// src/jade/rock-geometry.js
var phaseOf = phase3D;
function createRockGeometry(a) {
  const g = new T.IcosahedronGeometry(1, 14), p = g.getAttribute("position"), phase = phaseOf(a);
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const d = 1 + 0.065 * Math.sin(x * 4 + y * 3 + phase) * Math.cos(z * 4 - phase) + 0.045 * Math.cos(y * 6 - z * 3 + phase) + 0.025 * Math.sin(z * 9 + x * 5);
    p.setXYZ(i, x * d * 1.42, y * d * 1.04, z * d * 0.96);
  }
  g.deleteAttribute("normal");
  g.deleteAttribute("uv");
  const smooth = mergeVertices(g, 1e-5);
  g.dispose();
  smooth.computeVertexNormals();
  smooth.setAttribute("jade", new T.Float32BufferAttribute(new Float32Array(smooth.getAttribute("position").count), 1));
  return smooth;
}
function polygonClip(vertices, plane, sign) {
  const result = [];
  for (let i = 0; i < vertices.length; i++) {
    const a = vertices[i], b = vertices[(i + 1) % vertices.length], da = plane.distanceToPoint(a.p) * sign, db = plane.distanceToPoint(b.p) * sign;
    if (da >= -1e-7) result.push(a);
    if (da > 0 && db < 0 || da < 0 && db > 0) {
      const t = da / (da - db);
      result.push({ p: a.p.clone().lerp(b.p, t), n: a.n.clone().lerp(b.n, t).normalize(), face: a.face + (b.face - a.face) * t, edge: true });
    }
  }
  return result;
}
function buffer(positions, normals, jade = null) {
  const g = new T.BufferGeometry();
  g.setAttribute("position", new T.Float32BufferAttribute(positions, 3));
  g.setAttribute("normal", new T.Float32BufferAttribute(normals, 3));
  g.setAttribute("jade", new T.Float32BufferAttribute(jade ?? new Float32Array(positions.length / 3), 1));
  g.computeBoundingSphere();
  return g;
}
function splitRockGeometry(source, plane) {
  const g = source.index ? source.toNonIndexed() : source, p = g.getAttribute("position"), n = g.getAttribute("normal"), j = g.getAttribute("jade");
  const sides = [{ positions: [], normals: [], jade: [] }, { positions: [], normals: [], jade: [] }], points = /* @__PURE__ */ new Map();
  for (let i = 0; i < p.count; i += 3) {
    const tri = [0, 1, 2].map((j2) => ({ p: new T.Vector3().fromBufferAttribute(p, i + j2), n: new T.Vector3().fromBufferAttribute(n, i + j2), face: g.getAttribute("jade")?.getX(i + j2) ?? 0 }));
    [1, -1].forEach((sign, k) => {
      const polygon = polygonClip(tri, plane, sign);
      for (const v2 of polygon) if (v2.edge || Math.abs(plane.distanceToPoint(v2.p)) < 1e-6) points.set(v2.p.toArray().map((x) => Math.round(x * 1e5)).join(","), v2.p);
      for (let j2 = 1; j2 < polygon.length - 1; j2++) for (const v2 of [polygon[0], polygon[j2], polygon[j2 + 1]]) {
        sides[k].positions.push(...v2.p.toArray());
        sides[k].normals.push(...v2.n.toArray());
        sides[k].jade.push(v2.face);
      }
    });
  }
  if (g !== source) g.dispose();
  const ring = [...points.values()], center = new T.Vector3();
  for (const v2 of ring) center.add(v2);
  if (ring.length) center.divideScalar(ring.length);
  const u = new T.Vector3().crossVectors(plane.normal, Math.abs(plane.normal.y) < 0.9 ? new T.Vector3(0, 1, 0) : new T.Vector3(1, 0, 0)).normalize(), v = new T.Vector3().crossVectors(plane.normal, u);
  ring.sort((a, b) => Math.atan2(a.clone().sub(center).dot(v), a.clone().sub(center).dot(u)) - Math.atan2(b.clone().sub(center).dot(v), b.clone().sub(center).dot(u)));
  const caps = [[], []], capNormals = [[], []];
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i], b = ring[(i + 1) % ring.length];
    [[center, b, a], [center, a, b]].forEach((tri, k) => {
      for (const p2 of tri) {
        caps[k].push(...p2.toArray());
        capNormals[k].push(...plane.normal.clone().multiplyScalar(k === 0 ? -1 : 1).toArray());
      }
    });
  }
  return { positive: buffer(sides[0].positions, sides[0].normals, sides[0].jade), negative: buffer(sides[1].positions, sides[1].normals, sides[1].jade), capPositive: buffer(caps[0], capNormals[0], new Float32Array(caps[0].length / 3).fill(1)), capNegative: buffer(caps[1], capNormals[1], new Float32Array(caps[1].length / 3).fill(1)), ring, center };
}
function planeFromStroke(start, end, quaternion, halfWidth = 2.15, halfHeight = 2.15 / 1.5) {
  const a = new T.Vector3((start.x - 0.5) * halfWidth * 2, (0.5 - start.y) * halfHeight * 2, 0), b = new T.Vector3((end.x - 0.5) * halfWidth * 2, (0.5 - end.y) * halfHeight * 2, 0);
  const direction = b.clone().sub(a).normalize();
  if (a.distanceTo(b) < 0.16) throw Error("\u5207\u7EBF\u592A\u77ED\uFF0C\u8BF7\u5212\u8FC7\u77F3\u5934\u753B\u4E00\u6761\u957F\u4E00\u70B9\u7684\u7EBF\u3002");
  const normal = new T.Vector3(-direction.y, direction.x, 0), inverse = quaternion.clone().invert();
  normal.applyQuaternion(inverse);
  a.applyQuaternion(inverse);
  return new T.Plane().setFromNormalAndCoplanarPoint(normal, a);
}
var volumeAt = volumeSample3D;
function closeHalf(split, side) {
  return mergeGeometries(side === 1 ? [split.positive, split.capPositive] : [split.negative, split.capNegative]);
}
function disposeSplit(split) {
  for (const key of ["positive", "negative", "capPositive", "capNegative"]) split[key].dispose();
}
function fragmentGeometry(original, path) {
  let current = original.clone();
  for (const p of path) {
    const split = splitRockGeometry(current, new T.Plane(new T.Vector3().fromArray(p.normal), p.constant)), next = closeHalf(split, p.side);
    current.dispose();
    disposeSplit(split);
    current = next;
  }
  return current;
}
function fragmentSurfaceGeometry(original, path) {
  let current = original.clone();
  for (const p of path) {
    const split = splitRockGeometry(current, new T.Plane(new T.Vector3().fromArray(p.normal), p.constant)), next = (p.side === 1 ? split.positive : split.negative).clone();
    current.dispose();
    disposeSplit(split);
    current = next;
  }
  return current;
}
var tetraVertices = [[0, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1], [0.5, 0, 0], [0, 0.5, 0], [0, 0, 0.5], [0.5, 0.5, 0], [0.5, 0, 0.5], [0, 0.5, 0.5]];
var tetraCells = [[0, 4, 5, 6], [4, 1, 7, 8], [5, 7, 2, 9], [6, 8, 9, 3], [4, 5, 6, 9], [4, 5, 7, 9], [4, 7, 8, 9], [4, 6, 8, 9]];
var volumeQuadrature = tetraCells.flatMap((cell) => [0, 1, 2, 3].map((k) => {
  const w = [0, 0, 0];
  for (let j = 0; j < 4; j++) for (let axis = 0; axis < 3; axis++) w[axis] += tetraVertices[cell[j]][axis] * (k === j ? 0.5854101966249685 : 0.1381966011250105);
  return w;
}));
function measureGeometry(geometry, a, holes = []) {
  const g = geometry.index ? geometry.toNonIndexed() : geometry, position = g.getAttribute("position");
  geometry.computeBoundingBox();
  const center = geometry.boundingBox.getCenter(new T.Vector3());
  let volume = 0, jade = 0;
  const A = new T.Vector3(), B = new T.Vector3(), C = new T.Vector3(), cross = new T.Vector3(), point = new T.Vector3();
  for (let i = 0; i < position.count; i += 3) {
    A.fromBufferAttribute(position, i).sub(center);
    B.fromBufferAttribute(position, i + 1).sub(center);
    C.fromBufferAttribute(position, i + 2).sub(center);
    const weight = Math.abs(A.dot(cross.crossVectors(B, C))) / 6;
    let coverage = 0, available = holes.length ? 0 : volumeQuadrature.length;
    if (a.grade === 0 && !holes.length) coverage = volumeQuadrature.length;
    else for (const q of volumeQuadrature) {
      point.copy(A).multiplyScalar(q[0]).addScaledVector(B, q[1]).addScaledVector(C, q[2]).add(center);
      if (holes.length) {
        if (holes.some((h) => inJadeBlank(h, [point.x, point.y, point.z]))) continue;
        available++;
      }
      coverage += a.grade === 0 ? 1 : volumeAt(a, point).coverage;
    }
    volume += weight * available / volumeQuadrature.length;
    jade += weight * coverage / volumeQuadrature.length;
  }
  if (g !== geometry) g.dispose();
  return { volume, jade };
}
function splitShares(split, a, holes = []) {
  const geos = [closeHalf(split, 1), closeHalf(split, -1)], m = geos.map((g) => measureGeometry(g, a, holes));
  geos.forEach((g) => g.dispose());
  const share = (key) => {
    const total = m[0][key] + m[1][key];
    const p = total > 1e-8 ? Math.min(0.998, Math.max(2e-3, m[0][key] / total)) : 0.5;
    return [p, 1 - p];
  };
  return { massShares: share("volume"), jadeShares: share("jade") };
}
export {
  closeHalf,
  createRockGeometry,
  disposeSplit,
  fragmentGeometry,
  fragmentSurfaceGeometry,
  measureGeometry,
  phaseOf,
  planeFromStroke,
  splitRockGeometry,
  splitShares,
  volumeAt
};
