// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.

// src/jade/patterns.ts
function latticeHash(x, y, z) {
  let h = Math.imul(x, 2376512323) ^ Math.imul(y, 3625334849) ^ Math.imul(z, 3407524639);
  h ^= h >>> 16;
  h = Math.imul(h, 2146121005);
  h ^= h >>> 15;
  h = Math.imul(h, 2221713035);
  h ^= h >>> 16;
  return (h & 16777215) / 16777215;
}
var mix = (a, b, t) => a + (b - a) * t;
var smooth = (a, b, x) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
function noise(p) {
  const i = p.map(Math.floor), f = p.map((x, j) => {
    const t = x - i[j];
    return t * t * (3 - 2 * t);
  }), h = (x, y, z) => latticeHash(i[0] + x, i[1] + y, i[2] + z);
  return mix(mix(mix(h(0, 0, 0), h(1, 0, 0), f[0]), mix(h(0, 1, 0), h(1, 1, 0), f[0]), f[1]), mix(mix(h(0, 0, 1), h(1, 0, 1), f[0]), mix(h(0, 1, 1), h(1, 1, 1), f[0]), f[1]), f[2]);
}
function naturalJadePattern(pattern, p, phase) {
  const q = [p[0] + phase * 0.23, p[1] + Math.sin(phase) * 0.71, p[2] + Math.cos(phase) * 0.63], n = noise(q.map((x) => x * 1.75)), f = noise(q.map((x, i) => x * 6.7 + [3.1, 7.4, 1.7][i])), cloud = n * 0.72 + f * 0.28, w = q.map((x, i) => x + [f - 0.5, n - 0.5, (n + f) * 0.5 - 0.5][i] * 0.45);
  if (pattern === 1) return 0.18 + cloud * 0.65;
  if (pattern === 2) return smooth(0.2, 0.8, noise([q[0] * 1.4 + f * 0.35, q[1] * 3.6, q[2] * 1.7]) * 0.7 + n * 0.3);
  if (pattern === 3) return smooth(0.52, 0.8, noise(q.map((x, i) => x * [8, 2.2, 3.1][i] + f * 0.7)));
  if (pattern === 4) return smooth(0.35, 0.85, cloud) * 0.78;
  if (pattern === 5) return smooth(0.28, 0.72, noise(q.map((x) => x * 1.2 + f * 0.4)));
  if (pattern === 6) return smooth(0.2, 0.8, cloud);
  if (pattern === 7) return 0.2 + cloud * 0.48;
  if (pattern === 8) return Math.pow(f * 0.6 + n * 0.4, 1.5);
  if (pattern === 9) return 0.1 + Math.pow(noise(w.map((x, i) => x * [4.2, 36, 4][i])), 3) * 0.65;
  if (pattern === 10) return 0.08 + Math.pow(noise(q.map((x) => x * 11)) * 0.65 + noise(q.map((x) => x * 23 + 0.7)) * 0.35, 2) * 0.8;
  if (pattern === 11) return smooth(0.25, 0.75, noise(q.map((x, i) => x * [1.5, 5.7, 1.7][i])) * 0.7 + n * 0.3);
  return smooth(0.35, 0.9, noise(w.map((x, i) => x * [3.2, 7, 3.8][i] + f * 0.8)) * 0.66 + n * 0.34) * 0.8;
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
function jadeVariety(id) {
  return JADE_VARIETIES.find((v) => v.id === id);
}
var JADE_PRICE_CAP = 6e6;
var JADE_PRICE_RATES = [4, 50, 300, 5e3, 85e3, 3e6];
function jadeUnitPrice(grade, color, variety) {
  const quality = Math.max(0, Math.min(1, color));
  return (JADE_PRICE_RATES[grade] || 0) * Math.pow(quality, grade >= 3 ? 4 : 1) * (jadeVariety(variety)?.multiplier || 1);
}
function rollJadeVariety(value) {
  let n = Math.max(0, Math.min(0.999999, value)) * JADE_VARIETIES.reduce((n2, v) => n2 + v.weight, 0);
  return (JADE_VARIETIES.find((v) => (n -= v.weight) < 0) || JADE_VARIETIES[0]).id;
}
function jadePattern(pattern, p, phase) {
  return naturalJadePattern(pattern, p, phase);
}
function jadePigment(id, p, phase, light = false) {
  const v = jadeVariety(id);
  if (!v) return null;
  const t = jadePattern(v.pattern, p, phase), rgb = (hex) => [0, 2, 4].map((i) => parseInt(hex.slice(1 + i, 3 + i), 16) / 255);
  let a = rgb(v.colors[0]), b = rgb(v.colors[1]);
  if (v.pattern === 6) {
    if (t < 0.5) {
      b = rgb(v.colors[1]);
    } else {
      a = rgb(v.colors[1]);
      b = rgb(v.colors[2]);
    }
  }
  if (v.pattern === 7 && light) {
    a = rgb(v.colors[2]);
    b = rgb(v.colors[0]);
  }
  const k = v.pattern === 6 ? t < 0.5 ? t * 2 : (t - 0.5) * 2 : t;
  const linear = (c) => c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  return a.map((x, i) => linear(x) * (1 - k) + linear(b[i]) * k);
}

// src/ancient-jade-quality.ts
var JADE_QUALITY_WEIGHTS = [729e3, 24e4, 24e3, 5500, 1200, 250, 45, 5];
function jadeQuality(value) {
  return typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 8 ? value : 1;
}
function rollJadeQuality(random = Math.random) {
  let n = Math.max(0, Math.min(1 - Number.EPSILON, random())) * 1e6;
  for (let i = 0; i < JADE_QUALITY_WEIGHTS.length; i++) {
    n -= JADE_QUALITY_WEIGHTS[i];
    if (n < 0) return i + 1;
  }
  return 8;
}
function jadeQualitySummary(item) {
  const levels = item.parts?.length ? item.parts.filter((p) => p?.product).map((p) => jadeQuality(p.product.quality)) : [];
  if (!levels.length) return { quality: jadeQuality(item.quality), qualityMin: jadeQuality(item.qualityMin ?? item.quality), qualityMax: jadeQuality(item.qualityMax ?? item.quality) };
  return { quality: Math.floor(levels.reduce((a, b) => a + b, 0) / levels.length), qualityMin: Math.min(...levels), qualityMax: Math.max(...levels) };
}
var JADE_QUALITY_PRICE = [1, 1.5, 2.3, 3.5, 5.5, 8, 12, 18];
function jadePhysicalAppraisal(p, jade) {
  const purity = Math.max(0, Math.min(1, p.purity || 0)), mass = Math.max(0, p.weight || 0), unit = jadeUnitPrice(jade.grade, jade.color, jade.variety), sound = jade.grade > 0 && purity >= 0.25, premium = (p.blank?.kind === "bangle" ? 1.8 : 1.6) + purity * 0.6;
  const fissures = Math.max(0, Math.floor(p.crackCount || 0)), retention = Math.max(0.05, Math.pow(0.35, fissures));
  return Math.max(1, Math.floor((mass * unit * (0.2 + 0.8 * purity) * (sound ? premium : 0.65 + purity) + (sound ? (p.fee || 0) * 1.5 : 0)) * retention));
}
function priceJadeProduct(p, jade) {
  if (p.qualityPriceVersion === 2) return false;
  const canMeasure = jade && Number.isFinite(p.weight) && Number.isFinite(p.purity) && p.blank;
  p.baseValue = canMeasure ? jadePhysicalAppraisal(p, jade) : Number.isFinite(p.baseValue) ? Math.max(1, p.baseValue) : Math.max(1, p.value);
  p.value = Math.max(1, Math.floor(p.baseValue * JADE_QUALITY_PRICE[jadeQuality(p.quality) - 1]));
  p.qualityPriceVersion = 2;
  return true;
}

// src/ancient-collections.ts
var COLLECTION_LIMIT = 256;
var BEAD_LIMIT = 20;
function collectionFits(items) {
  return items.length <= COLLECTION_LIMIT && items.reduce((n, i) => n + i.parts.length, 0) <= 1024;
}

// src/jade/server-geometry.js
import { Plane as Plane2, Vector3 as Vector33 } from "./three.module.js";

// src/jade/rock-geometry.js
import * as T from "./three.module.js";

// src/jade/craft.ts
var JADE_DESIGNS = {
  bangle: { name: "\u624B\u956F", en: "Bangle", min: 40, max: 68, size: 54, fee: 8 },
  bead: { name: "\u73E0\u5B50", en: "Bead", min: 6, max: 24, size: 12, fee: 2 },
  buddha: { name: "\u7389\u4F5B\u540A\u5760", en: "Jade Buddha pendant", min: 20, max: 48, size: 32, fee: 12 },
  peace: { name: "\u5E73\u5B89\u6263", en: "Peace pendant", min: 16, max: 40, size: 26, fee: 5 }
};
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
function jadeBuddhaInside(x, y, z) {
  return JADE_BUDDHA_PARTS.some(([cx, cy, cz, rx, ry, rz]) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 + ((z - cz) / rz) ** 2 <= 1);
}
function jadeBuddhaFootprint(x, y, margin = 0) {
  return JADE_BUDDHA_PARTS.some(([cx, cy, , rx, ry]) => ((x - cx) / (rx + margin)) ** 2 + ((y - cy) / (ry + margin)) ** 2 <= 1);
}
var JADE_BUDDHA_OUTLINE = JADE_BUDDHA_PARTS.flatMap(([cx, cy, , rx, ry], index) => Array.from({ length: 96 }, (_, i) => {
  const a = i / 96 * Math.PI * 2, b = (i + 1) / 96 * Math.PI * 2, m = (a + b) / 2, x = cx + rx * Math.cos(m), y = cy + ry * Math.sin(m);
  if (JADE_BUDDHA_PARTS.some(([ox, oy, , sx, sy], n) => n !== index && ((x - ox) / sx) ** 2 + ((y - oy) / sy) ** 2 < 1)) return [];
  return [[cx + rx * Math.cos(a), cy + ry * Math.sin(a), cx + rx * Math.cos(b), cy + ry * Math.sin(b)]];
}).flat());
var BUDDHA_AREA_RATIO = JADE_BUDDHA_OUTLINE.reduce((n, [x, y, u, v]) => n + x * v - u * y, 0) / (2 * Math.PI);
var CRAFT_LIMIT = 12;
var dot = (a, b) => a.reduce((s, x, i) => s + x * b[i], 0);
var cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
var norm = (a) => {
  const l = Math.hypot(...a);
  return a.map((x) => x / l);
};
var clamp = (x) => Math.max(0, Math.min(1, x));
function jadeMillimeters(weight) {
  return 58 * Math.cbrt(weight);
}
function jadeFractures(a) {
  let seed = a.seed ^ 3652225 | 0;
  const r = () => {
    seed = Math.imul(seed ^ seed >>> 16, 73244475);
    seed = Math.imul(seed ^ seed >>> 16, 73244475);
    seed ^= seed >>> 16;
    return (seed >>> 0) / 4294967296;
  };
  return Array.from({ length: Math.min(4, Math.floor(a.cracks * 4.5)) }, () => ({ normal: norm([r() * 2 - 1, r() * 2 - 1, r() * 2 - 1]), offset: (r() - 0.5) * 1.25, phase: r() * 6.28 }));
}
function fractureDistance(f, p) {
  return dot(f.normal, p) + f.offset + 0.025 * Math.sin(p[0] * 9 + p[1] * 7 + p[2] * 5 + f.phase);
}
function jadeCoverageAt(a, p) {
  if (a.grade === 0) return 0;
  const phase = a.seed % 997 / 997 * Math.PI * 2, x = p[0] - (a.coreX - 50) * 0.025, y = p[1] - Math.sin(phase) * 0.12, z = p[2] - Math.cos(phase * 1.7) * 0.2, c = Math.cos(a.coreAngle * Math.PI / 180), s = Math.sin(a.coreAngle * Math.PI / 180);
  return clamp(1.3 - ((x * c + y * s) / (0.4 + a.core * 0.68)) ** 2 - ((-x * s + y * c) / (0.6 + a.core * 0.65)) ** 2 - (z / (0.48 + a.core * 0.65)) ** 2 + Math.sin(p[0] * 5 + Math.sin(p[1] * 4) * 2 + phase) * Math.cos(p[2] * 5 + p[1] * 3 - phase) * 0.15);
}
function originalInside(a, p) {
  const q = [p[0] / 1.42, p[1] / 1.04, p[2] / 0.96], r = Math.hypot(...q);
  if (r < 1e-8) return true;
  const [x, y, z] = q.map((x2) => x2 / r), ph = a.seed % 997 / 997 * Math.PI * 2;
  return r <= 1 + 0.065 * Math.sin(x * 4 + y * 3 + ph) * Math.cos(z * 4 - ph) + 0.045 * Math.cos(y * 6 - z * 3 + ph) + 0.025 * Math.sin(z * 9 + x * 5) - 9e-3;
}
function inJadeBlank(b, p, margin = 0) {
  const d = p.map((x2, i) => x2 - b.point[i]), t = -dot(d, b.normal), x = dot(d, b.u), y = dot(d, b.v), r = Math.hypot(x, y);
  return t >= -margin && t <= b.depth + margin && (b.kind === "buddha" ? jadeBuddhaFootprint(x / b.radius, y / b.radius, margin / b.radius) : r <= b.radius + margin && (b.inner === 0 || r >= b.inner - margin));
}
function makeJadeBlank(s, piece, layout) {
  const design = layout && typeof layout.kind === "string" && Object.hasOwn(JADE_DESIGNS, layout.kind) ? JADE_DESIGNS[layout.kind] : null;
  if (!design || !Number.isFinite(layout.size) || layout.size < design.min || layout.size > design.max || !Number.isInteger(layout.face) || !Array.isArray(layout.point) || layout.point.length !== 3 || !layout.point.every((x) => typeof x === "number" && Number.isFinite(x) && Math.abs(x) < 2)) return null;
  const face = piece.path[layout.face];
  if (!face || Math.abs(dot(face.normal, layout.point) + face.constant) > 3e-3) return null;
  const normal = face.normal.map((x) => -face.side * x), u = norm(cross(normal, Math.abs(normal[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0])), v = cross(normal, u), mm = jadeMillimeters(s.weight), radius = (layout.kind === "bangle" ? layout.size / 2 + 8 : layout.size / 2) / mm, inner = layout.kind === "bangle" ? layout.size / 2 / mm : layout.kind === "peace" ? radius * 0.2 : 0, depth = (layout.kind === "bangle" ? 12 : layout.kind === "peace" ? layout.size * 0.24 : layout.kind === "buddha" ? layout.size * 0.36 : layout.size) / mm;
  const error = dot(face.normal, layout.point) + face.constant, point = layout.point.map((x, i) => x - face.normal[i] * error);
  return { kind: layout.kind, size: layout.size, face: layout.face, point, normal, u, v, radius, inner, depth };
}
function jadeBlankPoint(b, r, t, angle) {
  return b.point.map((x, i) => x + b.u[i] * r * Math.cos(angle) + b.v[i] * r * Math.sin(angle) - b.normal[i] * t);
}
function assessJadeBlank(s, piece, layout) {
  const blank = makeJadeBlank(s, piece, layout);
  if (!blank) return { valid: false, error: "Choose a flat cut face" };
  const b = blank, a = s.jade || s.model, fractures = jadeFractures(a), ranges = fractures.map(() => [Infinity, -Infinity]);
  let purity = 0, count = 0, blankJade = 0, blankSamples = 0, shapeSamples = 0, totalShapeSamples = 0;
  const available = (p) => originalInside(a, p) && piece.path.every((f) => (dot(f.normal, p) + f.constant) * f.side >= -1e-4) && !(piece.holes || []).some((h) => inJadeBlank(h, p, 6e-3));
  for (let z = 0; z <= 4; z++) for (let ring = 0; ring <= 4; ring++) for (let j = 0; j < 48; j++) {
    const radius = Math.sqrt(b.inner * b.inner + (b.radius * b.radius - b.inner * b.inner) * ring / 4), p = jadeBlankPoint(b, radius, b.depth * z / 4, j / 48 * Math.PI * 2);
    if (b.kind === "buddha" && !inJadeBlank(b, p, 1e-5)) continue;
    if (!available(p)) return { valid: false, error: "Not enough solid material", blank: b };
    blankJade += jadeCoverageAt(a, p);
    blankSamples++;
  }
  if (b.kind === "buddha") for (const [x, y] of JADE_BUDDHA_OUTLINE) for (const t of [0, b.depth / 2, b.depth]) {
    const p = b.point.map((v, k) => v + b.u[k] * x * b.radius + b.v[k] * y * b.radius - b.normal[k] * t);
    if (!available(p)) return { valid: false, error: "Not enough solid material", blank: b };
  }
  for (const h of piece.holes || []) for (let z = 0; z <= 2; z++) for (let r = 0; r <= 2; r++) for (let j = 0; j < 24; j++) {
    const p = jadeBlankPoint(h, Math.sqrt(h.inner * h.inner + (h.radius * h.radius - h.inner * h.inner) * r / 2), h.depth * z / 2, j / 24 * Math.PI * 2);
    if (inJadeBlank(h, p, 1e-5) && inJadeBlank(b, p, 6e-3)) return { valid: false, error: "Overlaps a previous cut", blank: b };
  }
  for (let z = 0; z < 9; z++) {
    const t = b.depth * (0.03 + 0.94 * (z + 0.5) / 9), outer = b.kind === "bead" ? Math.sqrt(Math.max(0, (b.radius * 0.97) ** 2 - (t - b.depth / 2) ** 2)) : b.radius - (b.radius - b.inner) * 0.015, inner = b.kind === "bead" ? b.radius * 0.11 : b.inner + (b.radius - b.inner) * 0.015, area = Math.max(0, outer * outer - inner * inner);
    for (let ring = 0; ring < 5; ring++) for (let j = 0; j < 48; j++) {
      const angle = j / 48 * Math.PI * 2, r = Math.sqrt(inner * inner + area * (ring + 0.5) / 5), p = jadeBlankPoint(b, r, t, angle);
      totalShapeSamples++;
      if (b.kind === "buddha" && !jadeBuddhaInside(r * Math.cos(angle) / b.radius, r * Math.sin(angle) / b.radius, t / b.depth)) continue;
      shapeSamples++;
      purity += jadeCoverageAt(a, p) * area;
      count += area;
      fractures.forEach((f, i) => {
        const d = fractureDistance(f, p);
        ranges[i][0] = Math.min(ranges[i][0], d);
        ranges[i][1] = Math.max(ranges[i][1], d);
      });
    }
  }
  const crackCount = ranges.filter(([lo, hi]) => lo < 8e-3 && hi > -8e-3).length, cylinder = Math.PI * (b.radius * b.radius - b.inner * b.inner) * b.depth, volume = cylinder * (b.kind === "buddha" ? BUDDHA_AREA_RATIO : 1), productVolume = b.kind === "bead" ? volume * 0.6 : b.kind === "buddha" ? cylinder * shapeSamples / totalShapeSamples * 0.94 : volume * 0.94;
  return { valid: true, blank: b, purity: purity / count, blankPurity: blankJade / blankSamples, crackCount, volume, productVolume, error: "" };
}
function assessJadePlan(s, piece, layouts) {
  const holes = [...piece.holes || []], items = [];
  if (layouts.length > CRAFT_LIMIT) return { valid: false, items: [], error: "Craft batch limit reached" };
  for (const layout of layouts) {
    const item = assessJadeBlank(s, { ...piece, holes }, layout);
    items.push(item);
    if (item.valid && item.blank) holes.push(item.blank);
  }
  return { valid: layouts.length > 0 && items.every((i) => i.valid), items, error: items.find((i) => !i.valid)?.error || "" };
}

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
var clamp2 = (v, a, b) => Math.max(a, Math.min(b, v));
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
  const coverage = clamp2(1.3 - (u / (0.4 + a.core * 0.68)) ** 2 - (v / (0.6 + a.core * 0.65)) ** 2 - (z / (0.48 + a.core * 0.65)) ** 2 + cloud * 0.15, 0, 1);
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
  const smooth2 = mergeVertices(g, 1e-5);
  g.dispose();
  smooth2.computeVertexNormals();
  smooth2.setAttribute("jade", new T.Float32BufferAttribute(new Float32Array(smooth2.getAttribute("position").count), 1));
  return smooth2;
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
  const A = new T.Vector3(), B = new T.Vector3(), C = new T.Vector3(), cross2 = new T.Vector3(), point = new T.Vector3();
  for (let i = 0; i < position.count; i += 3) {
    A.fromBufferAttribute(position, i).sub(center);
    B.fromBufferAttribute(position, i + 1).sub(center);
    C.fromBufferAttribute(position, i + 2).sub(center);
    const weight = Math.abs(A.dot(cross2.crossVectors(B, C))) / 6;
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

// src/jade/server-geometry.js
function assayJadeStone(a, plane, paths = [], holes = []) {
  const original = createRockGeometry(a);
  let parent, split;
  try {
    const total = measureGeometry(original, a);
    if (!plane) return { total };
    parent = paths.length ? fragmentGeometry(original, paths) : original;
    split = splitRockGeometry(parent, new Plane2(new Vector33(...plane.normal), plane.constant));
    const shares = splitShares(split, a, holes), valid = shares.massShares.every((n) => n > 0.012) && split.ring.length >= 8 && split.positive.getAttribute("position").count > 60 && split.negative.getAttribute("position").count > 60;
    return { total, ...shares, valid };
  } finally {
    if (split) disposeSplit(split);
    if (parent && parent !== original) parent.dispose();
    original.dispose();
  }
}

// src/ancient-jade-stonework.ts
var ROUGH_STONES = { roughStone: { name: "\u5C71\u7EB9\u539F\u77F3", en: "Striated Rough", sell: 8, cut: 3, window: 2, bias: 0 }, roughDark: { name: "\u4E4C\u76AE\u539F\u77F3", en: "Darkskin Rough", sell: 14, cut: 5, window: 3, bias: 0.04 }, roughMoon: { name: "\u6708\u7EB9\u539F\u77F3", en: "Moonvein Rough", sell: 24, cut: 8, window: 5, bias: 0.1 } };
var JADE_GRADES = [{ name: "\u666E\u901A\u77F3\u6599", en: "Common Stone", rate: 4, color: "#aaa28c" }, { name: "\u8C46\u79CD\u7389", en: "Grain Jade", rate: 50, color: "#8dba76" }, { name: "\u7CEF\u79CD\u7389", en: "Soft Jade", rate: 140, color: "#a8d9ad" }, { name: "\u7CEF\u51B0\u7389", en: "Mist Jade", rate: 350, color: "#72d6b0" }, { name: "\u51B0\u79CD\u7389", en: "Ice Jade", rate: 850, color: "#5fe5c1" }, { name: "\u73BB\u7483\u7389", en: "Crystal Jade", rate: 1800, color: "#c0ffe9" }];
for (const [i, g] of JADE_GRADES.entries()) g.rate = JADE_PRICE_RATES[i];
function validStonePlane(p) {
  if (!p || typeof p !== "object") return false;
  const v = p;
  return Array.isArray(v.normal) && v.normal.length === 3 && v.normal.every((n) => typeof n === "number" && Number.isFinite(n)) && typeof v.constant === "number" && Number.isFinite(v.constant) && Math.abs(Math.hypot(...v.normal) - 1) < 1e-3 && Math.abs(v.constant) <= Math.hypot(v.normal[0] * 1.42, v.normal[1] * 1.04, v.normal[2] * 0.96) * 0.9;
}
function validStonePose(p) {
  return Array.isArray(p) && p.length === 4 && p.every((n) => typeof n === "number" && Number.isFinite(n)) && Math.abs(Math.hypot(...p) - 1) < 1e-3;
}
function stoneRng(seed) {
  return () => {
    seed |= 0;
    seed = seed + 1831565813 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function jadeStoneModel(s) {
  const r = stoneRng(s.seed ^ 5343943);
  return { seed: s.seed % 997, origin: s.seed % 4, grade: s.grade, core: s.coverage, coreX: 30 + r() * 40, coreAngle: -35 + r() * 70, color: s.color, cracks: s.cracks, weight: s.weight, ...s.grade && jadeVariety(s.variety) ? { variety: s.variety } : {} };
}
function stoneInterior(s) {
  const a = jadeStoneModel(s), phase = a.seed / 997 * Math.PI * 2;
  return { center: [(a.coreX - 50) * 0.025, Math.sin(phase) * 0.12, Math.cos(phase * 1.7) * 0.2], radii: [0.4 + a.core * 0.68, 0.6 + a.core * 0.65, 0.48 + a.core * 0.65], phase, color: s.color, cracks: s.cracks, grade: s.grade, angle: a.coreAngle * Math.PI / 180 };
}
function stoneCoverage(f, p) {
  if (f.grade === 0) return 0;
  const x = p[0] - f.center[0], y = p[1] - f.center[1], z = p[2] - f.center[2], c = Math.cos(f.angle || 0), s = Math.sin(f.angle || 0), q = [(x * c + y * s) / f.radii[0], (-x * s + y * c) / f.radii[1], z / f.radii[2]], cloud = Math.sin(p[0] * 5 + Math.sin(p[1] * 4) * 2 + f.phase) * Math.cos(p[2] * 5 + p[1] * 3 - f.phase);
  return Math.max(0, Math.min(1, 1.3 - q.reduce((n, v) => n + v * v, 0) + cloud * 0.15));
}
function insideRough(s, p) {
  const q = [p[0] / 1.42, p[1] / 1.04, p[2] / 0.96], r = Math.hypot(...q);
  if (r < 1e-9) return true;
  const [x, y, z] = q.map((n) => n / r), phase = s.seed % 997 / 997 * Math.PI * 2, d = 1 + 0.065 * Math.sin(x * 4 + y * 3 + phase) * Math.cos(z * 4 - phase) + 0.045 * Math.cos(y * 6 - z * 3 + phase) + 0.025 * Math.sin(z * 9 + x * 5);
  return r <= d;
}
function stoneJadeRatio(s) {
  if (s.grade === 0) return 0;
  const m = assayJadeStone(jadeStoneModel(s)).total;
  return m.jade / m.volume;
}
function planeOf(s) {
  return s.cut?.plane || { normal: [1, 0, 0], constant: -((s.cut?.position || 50) - 50) / 55 };
}
function stoneFaceJadeRatio(s) {
  if (!s.cut || !s.grade) return 0;
  const plane = planeOf(s), n = plane.normal, ref = Math.abs(n[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0], cross2 = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]], u = cross2(n, ref), len = Math.hypot(...u);
  for (let i = 0; i < 3; i++) u[i] /= len;
  const v = cross2(n, u), f = stoneInterior(s);
  let solid = 0, jade = 0;
  for (let i = 0; i < 16; i++) for (let j = 0; j < 16; j++) {
    const a = ((i + 0.5) / 16 * 2 - 1) * 1.6, b = ((j + 0.5) / 16 * 2 - 1) * 1.6, p = n.map((x, k) => -plane.constant * x + u[k] * a + v[k] * b);
    if (insideRough(s, p)) {
      solid++;
      jade += stoneCoverage(f, p);
    }
  }
  return jade / Math.max(1, solid);
}
function updateStoneAssay(s, measurement) {
  if (!s.cut || s.cut.assayVersion === 2) return false;
  const plane = planeOf(s), m = measurement || assayJadeStone(jadeStoneModel(s), plane), mass = m.massShares || [0.5, 0.5], jade = m.jadeShares || mass, ratio = s.grade === 0 ? 1 : m.total.jade / m.total.volume, retention = (1 - s.cracks * 0.45) * 0.97, total = s.weight * ratio * retention;
  s.cut.retention = retention;
  s.cut.jadeRatio = s.grade === 0 ? 0 : ratio;
  s.cut.assay = { solidVolume: m.total.volume, jadeVolume: m.total.jade };
  s.cut.pieces = [0, 1].map((i) => ({ id: String(i), path: [{ normal: [...plane.normal], constant: plane.constant, side: i === 0 ? 1 : -1 }], weight: s.weight * mass[i], jadeWeight: total * jade[i], value: Math.floor(total * jade[i] * JADE_GRADES[s.grade].rate * s.color * (jadeVariety(s.variety)?.multiplier || 1)), discount: 1, depth: 1 }));
  s.cut.rounds = 1;
  s.cut.weight = s.cut.pieces.reduce((n, p) => n + p.jadeWeight, 0);
  s.cut.value = s.cut.pieces.reduce((n, p) => n + p.value, 0);
  s.cut.faceJadeRatio = stoneFaceJadeRatio(s);
  s.cut.assayVersion = 2;
  updateStonePrice(s);
  return true;
}
function updateStonePrice(s) {
  if (!s.cut?.pieces || s.cut.pricingVersion === 3) return false;
  const unit = jadeUnitPrice(s.grade, s.color, s.variety), raw = s.cut.pieces.reduce((n, p) => n + p.jadeWeight * unit * p.discount, 0);
  s.cut.pricingScale = Math.min(1, JADE_PRICE_CAP / Math.max(1, raw));
  for (const p of s.cut.pieces) p.value = Math.floor(p.jadeWeight * unit * p.discount * s.cut.pricingScale);
  s.cut.value = s.cut.pieces.reduce((n, p) => n + p.value, 0);
  s.cut.pricingVersion = 3;
  return true;
}
function jadeProductValue(materialValue, purity, cracks, fee, grade, kind) {
  const quality = Math.max(0, Math.min(1, purity)), premium = (kind === "bangle" ? 1.8 : 1.6) + quality * 0.6, sound = grade > 0 && quality >= 0.25;
  return Math.max(1, Math.floor((materialValue * (sound ? premium : 0.65 + quality) + (sound ? fee * 1.5 : 0)) * Math.max(0.05, Math.pow(0.35, Math.max(0, Math.floor(cracks))))));
}
function updateProductPrices(s) {
  if (!s.cut?.pieces || !s.products?.length) return false;
  let changed = false;
  let budget = Math.max(0, JADE_PRICE_CAP - (s.craftBaseRealized ?? s.craftRealized ?? 0) - (s.craftBaseCollected ?? s.craftCollected ?? 0) - s.cut.value - s.products.reduce((n, p) => n + (p.baseValue ?? p.value), 0));
  for (const p of s.products) {
    if (p.pricingVersion === 3 && p.value >= 1) continue;
    const piece = s.cut.pieces.find((v) => v.path[p.blank.face] && Math.abs(v.path[p.blank.face].normal.reduce((n, x, i) => n + x * p.blank.point[i], v.path[p.blank.face].constant)) < 3e-3);
    const assay = piece ? assessJadeBlank({ ...s, model: jadeStoneModel(s) }, { ...piece, holes: [] }, p.blank) : null;
    const unit = jadeUnitPrice(s.grade, s.color, s.variety) * (s.cut.pricingScale ?? 1);
    p.materialValue ??= Math.ceil(p.weight / (p.blank.kind === "bead" ? 0.6 : 0.94) * (assay?.blankPurity ?? p.purity) * unit * (piece?.discount ?? 0.7));
    const target = jadeProductValue(p.materialValue, p.purity, p.crackCount, p.fee, s.grade, p.blank.kind), increase = Math.min(budget, Math.max(0, target - p.value));
    p.value += increase;
    budget -= increase;
    if (p.value === 0) {
      const donor = s.cut.pieces.find((v) => v.value > 0);
      if (donor) {
        donor.value--;
        s.cut.value--;
        p.value = 1;
      } else {
        const donor2 = s.products.find((v) => v !== p && v.value > 1);
        if (donor2) {
          donor2.value--;
          p.value = 1;
        }
      }
    }
    p.pricingVersion = 3;
    changed = true;
  }
  for (const p of s.products) changed = priceJadeProduct(p, jadeStoneModel(s)) || changed;
  return changed;
}
function updateStoneworkAssays(state) {
  let changed = false;
  for (const s of state.stones) {
    if (s.craftBaseRealized === void 0 || s.craftBaseCollected === void 0) {
      s.craftBaseRealized ??= s.craftRealized || 0;
      s.craftBaseCollected ??= s.craftCollected || 0;
      changed = true;
    }
    const measured = updateStoneAssay(s), priced = updateStonePrice(s), products = updateProductPrices(s);
    changed = measured || priced || products || changed;
  }
  return changed;
}
function makeRoughStone(source, seed, id = crypto.randomUUID()) {
  const r = stoneRng(seed), q = r(), b = ROUGH_STONES[source].bias, grade = q < 0.48 - b ? 0 : q < 0.75 - b * 0.5 ? 1 : q < 0.91 - b * 0.25 ? 2 : q < 0.97 - b * 0.1 ? 3 : q < 0.995 - b * 0.025 ? 4 : 5;
  return { id, source, seed, grade, weight: Math.round((0.45 + r() * 2.25) * 100) / 100, coverage: 0.22 + r() * 0.58, color: 0.55 + r() * 0.45, cracks: r(), lit: false, window: false, cost: 0, ...grade ? { variety: rollJadeVariety(stoneRng(seed ^ 104585490)()) } : {} };
}
function stoneView(s) {
  const windowCoverage = s.window ? stoneCoverage(stoneInterior(s), [0.32 * 0.78, 0.12 * 0.78, 0.92 * 0.78]) : 0;
  return { id: s.id, source: s.source, weight: s.weight, lit: s.lit, window: s.window, cost: s.cost, skin: s.seed % 4, shapeSeed: s.seed % 997, pose: s.pose, ...s.cut ? { quote: s.cut.value } : {}, products: s.products || [], realized: s.craftRealized || 0, collected: s.craftCollected || 0, ...s.window ? { windowTint: jadePigment(s.variety, [0.32, 0.12, 0.92], stoneInterior(s).phase, true), windowCoverage, signal: windowCoverage > 0.14 ? "bright" : "dull", cracked: s.cracks > 0.65 } : {}, ...s.cut ? { variety: s.variety, grade: s.grade, cut: s.cut, interior: stoneInterior(s), jade: jadeStoneModel(s) } : {} };
}
function stoneworkView(state) {
  return state.stones.map(stoneView);
}
function stoneRecutFee(s, piece) {
  return Math.max(ROUGH_STONES[s.source].cut, Math.min(40, Math.ceil((piece.weight * 5 + piece.depth * 2) / 2) * 2));
}
function stoneworkCommand(p, state, action, d, seed = crypto.getRandomValues(new Uint32Array(1))[0]) {
  if (action === "stoneList") return {};
  if (action === "stoneTake") {
    const source = String(d.source || ""), receipt = String(d.requestId || "");
    if (!/^[a-zA-Z0-9-]{8,64}$/.test(receipt)) return { error: "Invalid stone request" };
    const prior = state.receipts.find((r) => r.id === receipt);
    if (prior) return { selected: prior.stone };
    if (!Object.hasOwn(ROUGH_STONES, source) || (p.materials[source] || 0) < 1) return { error: "No rough stone available" };
    if (state.stones.length >= 60) return { error: "Sell a stone first (60 stone limit)" };
    const stone = makeRoughStone(source, seed);
    p.materials[source]--;
    state.stones.push(stone);
    state.receipts.push({ id: receipt, stone: stone.id });
    state.receipts = state.receipts.slice(-32);
    return { selected: stone.id };
  }
  const s = state.stones.find((s2) => s2.id === d.id);
  if (!s) return { error: "Stone no longer available" };
  const fees = ROUGH_STONES[s.source];
  if (action === "stoneProbe") {
    const point = d.point;
    if (!Array.isArray(point) || point.length !== 3 || !point.every((v2) => typeof v2 === "number" && Number.isFinite(v2) && Math.abs(v2) <= 1.8)) return { error: "Invalid probe point" };
    const f = stoneInterior(s), coverage = stoneCoverage(f, point.map((v2) => v2 * 0.78)), strength = s.grade === 0 ? 0.025 : Math.max(0.015, [0.025, 0.18, 0.38, 0.55, 0.76, 0.93][s.grade] * coverage);
    const normal = point.map((v2) => v2 / (Math.hypot(...point) || 1)), ref = Math.abs(normal[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0], cross2 = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]], u = cross2(normal, ref), len = Math.hypot(...u) || 1;
    for (let k = 0; k < 3; k++) u[k] /= len;
    const v = cross2(normal, u), pixels = [], size = 17, radius = 0.46, hex = JADE_GRADES[s.grade].color.slice(1), jade = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
    const fract = (x) => x - Math.floor(x), hash = (p2) => fract(Math.sin(p2[0] * 127.1 + p2[1] * 311.7 + p2[2] * 74.7) * 43758.5453), noise2 = (p2) => {
      const a = p2.map(Math.floor), b = p2.map(fract).map((t) => t * t * (3 - 2 * t));
      let sum = 0;
      for (let x = 0; x < 2; x++) for (let y = 0; y < 2; y++) for (let z = 0; z < 2; z++) sum += hash([a[0] + x, a[1] + y, a[2] + z]) * (x ? b[0] : 1 - b[0]) * (y ? b[1] : 1 - b[1]) * (z ? b[2] : 1 - b[2]);
      return sum;
    }, smooth2 = (a, b, t) => {
      t = Math.max(0, Math.min(1, (t - a) / (b - a)));
      return t * t * (3 - 2 * t);
    };
    const fractures = jadeFractures(jadeStoneModel(s)), maskSize = 49, mask = [];
    let visibleCrack = false, hasCrack = false;
    if (fractures.length) for (let y = 0; y < maskSize; y++) for (let x = 0; x < maskSize; x++) {
      const p2 = point.map((c, k) => c + u[k] * ((x / (maskSize - 1) * 2 - 1) * radius) + v[k] * ((y / (maskSize - 1) * 2 - 1) * radius));
      let shadow = 0;
      for (const depth of [1, 0.9, 0.78]) for (const f2 of fractures) {
        const distance = Math.abs(fractureDistance(f2, p2.map((c) => c * depth))), width = 8e-3 + radius / (maskSize - 1) * depth;
        shadow = Math.max(shadow, (1 - smooth2(3e-3, width, distance)) * (depth === 1 ? 1 : depth === 0.9 ? 0.88 : 0.76));
      }
      const value = Math.round(shadow * 255);
      mask.push(value);
      if (value > 12) hasCrack = true;
      if (value > 40 && Math.hypot(x - 24, y - 24) < 10) visibleCrack = true;
    }
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const p2 = point.map((c, k) => c + u[k] * ((x / (size - 1) * 2 - 1) * radius) + v[k] * ((y / (size - 1) * 2 - 1) * radius)), cv = stoneCoverage(f, p2.map((c) => c * 0.78)), cloud = noise2(p2.map((c) => c * 6 + f.phase)), stone = [0.43, 0.46, 0.38], base = [0.39, 0.5, 0.39], pigment = jadePigment(s.variety, p2, f.phase, true);
      for (let k = 0; k < 3; k++) {
        const material = stone[k] * (1 - cv) + (pigment ? pigment[k] * (0.75 + s.color * 0.25) : base[k] * (1 - s.color) + jade[k] * s.color) * cv;
        pixels.push(Math.round(Math.max(0, Math.min(1, material * (0.85 + cloud * 0.3))) * 255));
      }
      pixels.push(Math.round(cv * 255));
    }
    return { probe: { strength, tint: jadePigment(s.variety, point, f.phase, true) || void 0, coverage, glow: s.grade === 0 ? 0.025 : coverage * (0.16 + s.grade * 0.15), green: s.grade > 0 && coverage >= 0.12, cracked: visibleCrack, patch: { size, radius, u, v, point, pixels, ...hasCrack ? { crackMask: { size: maskSize, pixels: mask } } : {} } } };
  }
  if (action === "stonePose") {
    if (!validStonePose(d.pose)) return { error: "Invalid stone pose" };
    s.pose = [...d.pose];
    return { selected: s.id };
  }
  if (["stoneCollectAll", "stoneString", "stoneStringAll"].includes(action)) {
    const request = String(d.requestId || "");
    if (!/^[a-zA-Z0-9-]{8,64}$/.test(request)) return { error: "Invalid stone request" };
    if (s.craftRequests?.includes(request)) return { selected: s.id };
    const last = typeof d.lastProduct === "string" ? s.products?.findIndex((p2) => p2.id === d.lastProduct) : -1, ids = Array.isArray(d.ids) ? d.ids : action !== "stoneString" && last !== void 0 && last >= 0 ? s.products.slice(0, last + 1).filter((p2) => action === "stoneCollectAll" || p2.blank.kind === "bead").map((p2) => p2.id) : [];
    if (!ids.length || ids.some((id) => typeof id !== "string") || new Set(ids).size !== ids.length) return { error: "Choose matching loose beads" };
    const products = ids.map((id) => s.products?.find((v) => v.id === id));
    if (products.some((v) => !v)) return { error: "Collection item not found" };
    const selected = products, created = [], now = Date.now(), part = (product) => ({ product: structuredClone(product), jade: jadeStoneModel(s) });
    if (action === "stoneCollectAll") for (const product of selected) created.push({ id: "jade:" + s.id + ":" + product.id, kind: product.blank.kind, quality: product.quality || 1, size: product.blank.size, parts: [part(product)], value: product.value, createdAt: now });
    else {
      if (selected.some((v) => v.blank.kind !== "bead")) return { error: "Choose matching loose beads" };
      const groups = /* @__PURE__ */ new Map();
      for (const v of selected) {
        const g = groups.get(v.blank.size) || [];
        g.push(v);
        groups.set(v.blank.size, g);
      }
      if (action === "stoneString" && (groups.size !== 1 || selected.length < 2 || selected.length > BEAD_LIMIT)) return { error: "Use 2 to 20 matching beads" };
      for (const [size, beads] of groups) {
        let offset = 0;
        while (beads.length - offset >= 2) {
          const remaining = beads.length - offset, count = remaining === BEAD_LIMIT + 1 ? BEAD_LIMIT - 1 : Math.min(BEAD_LIMIT, remaining), batch = beads.slice(offset, offset + count);
          offset += count;
          created.push({ id: "jade-string:" + s.id + ":" + request + ":" + size + ":" + offset, kind: "bracelet", size, parts: batch.map(part), value: batch.reduce((n, p2) => n + p2.value, 0), createdAt: now });
        }
      }
      if (!created.length) return { error: "Use 2 to 20 matching beads" };
    }
    for (const item of created) item.quality = jadeQualitySummary(item).quality;
    if (!collectionFits([...p.collections || [], ...created])) return { error: "Collection inventory limit reached" };
    const consumed = new Set(created.flatMap((i) => i.parts.map((v) => v.product.id)));
    p.collections = [...p.collections || [], ...created];
    s.products = (s.products || []).filter((v) => !consumed.has(v.id));
    s.craftBaseCollected = (s.craftBaseCollected ?? s.craftCollected ?? 0) + created.reduce((n, i) => n + i.parts.reduce((a, p2) => a + (p2.product.baseValue ?? p2.product.value), 0), 0);
    s.craftCollected = (s.craftCollected || 0) + created.reduce((n, i) => n + i.value, 0);
    s.craftRequests ??= [];
    s.craftRequests.push(request);
    return { selected: s.id };
  }
  if (action === "stoneCollect") {
    const id = "jade:" + s.id + ":" + String(d.product || ""), product = s.products?.find((p2) => p2.id === d.product);
    if (!product) return p.collections?.some((i) => i.id === id) ? { selected: s.id } : { error: "Collection item not found" };
    const item = { id, kind: product.blank.kind, quality: product.quality || 1, size: product.blank.size, parts: [{ product: structuredClone(product), jade: jadeStoneModel(s) }], value: product.value, createdAt: Date.now() };
    if (!collectionFits([...p.collections || [], item])) return { error: "Collection inventory limit reached" };
    p.collections ??= [];
    p.collections.push(item);
    s.products.splice(s.products.indexOf(product), 1);
    s.craftBaseCollected = (s.craftBaseCollected ?? s.craftCollected ?? 0) + (product.baseValue ?? product.value);
    s.craftCollected = (s.craftCollected || 0) + product.value;
    return { selected: s.id };
  }
  if (action === "stoneProductSell") {
    const product = s.products?.find((p2) => p2.id === d.product);
    if (!product) return { selected: s.id };
    const next = Math.round(p.coins * 100) + product.value * 100;
    if (!Number.isSafeInteger(next)) return { error: "Gold limit reached" };
    p.coins = next / 100;
    s.craftBaseRealized = (s.craftBaseRealized ?? s.craftRealized ?? 0) + (product.baseValue ?? product.value);
    s.craftRealized = (s.craftRealized || 0) + product.value;
    s.products.splice(s.products.indexOf(product), 1);
    return { selected: s.id };
  }
  if (action === "stoneCraft") {
    const request = String(d.requestId || "");
    if (!/^[a-zA-Z0-9-]{8,64}$/.test(request)) return { error: "Invalid craft request" };
    if (s.craftRequests?.includes(request)) return { selected: s.id };
    if (d.layouts !== void 0) {
      if (!Array.isArray(d.layouts) || d.layouts.length < 1 || d.layouts.length > CRAFT_LIMIT || request.length > 60) return { error: "Invalid craft request" };
      const staged = structuredClone(state), profile = structuredClone(p);
      for (let i = 0; i < d.layouts.length; i++) {
        const result = stoneworkCommand(profile, staged, "stoneCraft", { id: s.id, piece: d.piece, requestId: i ? request + "-" + i : request, layout: d.layouts[i] });
        if (result.error) return result;
      }
      Object.assign(s, staged.stones.find((v) => v.id === s.id));
      Object.assign(p, profile);
      return { selected: s.id };
    }
    const piece = s.cut?.pieces?.find((p2) => p2.id === d.piece);
    if (!piece) return { error: "Choose a cut piece" };
    const assay = assessJadeBlank({ ...s, model: jadeStoneModel(s) }, piece, d.layout);
    if (!assay.valid || !assay.blank) return { error: assay.error };
    const fee2 = JADE_DESIGNS[assay.blank.kind].fee;
    if (p.coins < fee2) return { error: "Not enough Ancient Gold" };
    const density = s.weight / Math.max(1e-3, s.cut.assay.solidVolume) * Math.pow(0.97, piece.depth - 1), used = assay.volume * density;
    if (used > piece.weight * 0.98) return { error: "Not enough solid material" };
    const purity = assay.purity, weight = assay.productVolume * density, jadeUsed = Math.min(piece.jadeWeight, used * assay.blankPurity), removedValue = Math.min(piece.value, Math.ceil(piece.value * (piece.jadeWeight > 1e-5 ? jadeUsed / piece.jadeWeight : used / piece.weight)));
    const remainder = piece.value - removedValue, workedLoss = piece.workedDiscount ? 0 : Math.ceil(remainder * 0.12);
    const remainingValue = s.cut.value - removedValue - workedLoss, ceiling = Math.max(0, JADE_PRICE_CAP - (s.craftBaseRealized ?? s.craftRealized ?? 0) - (s.craftBaseCollected ?? s.craftCollected ?? 0) - (s.products || []).reduce((n, p2) => n + (p2.baseValue ?? p2.value), 0) - remainingValue);
    if (ceiling < 1) return { error: "This stone has reached its appraisal limit" };
    const value = Math.min(ceiling, jadeProductValue(removedValue, purity, assay.crackCount, fee2, s.grade, assay.blank.kind));
    const product = { quality: rollJadeQuality(), id: request, blank: assay.blank, weight, value, purity, crackCount: assay.crackCount, fee: fee2, materialValue: removedValue, pricingVersion: 3 };
    priceJadeProduct(product, jadeStoneModel(s));
    piece.holes ??= [];
    piece.holes.push(assay.blank);
    piece.weight = Math.max(0, piece.weight - used);
    piece.jadeWeight -= jadeUsed;
    piece.value -= removedValue + workedLoss;
    if (!piece.workedDiscount) {
      piece.discount *= 0.88;
      piece.workedDiscount = true;
    }
    s.cut.value = remainingValue;
    s.cut.weight = s.cut.pieces.reduce((n, p2) => n + p2.jadeWeight, 0);
    s.cost += fee2;
    p.coins = Math.round((p.coins - fee2) * 100) / 100;
    s.products ??= [];
    s.products.push(product);
    s.craftRequests ??= [];
    s.craftRequests.push(request);
    return { selected: s.id };
  }
  if (action === "stoneDiscard") {
    if (s.cut) return { error: "Only unopened rough stones can be discarded" };
    state.stones.splice(state.stones.indexOf(s), 1);
    return {};
  }
  if (action === "stoneSell") {
    if (!s.cut) return { error: "Uncut stones cannot be sold to the shop" };
    const value = s.cut.value + (s.products || []).reduce((n, p2) => n + p2.value, 0), next = Math.round(p.coins * 100) + value * 100;
    if (!Number.isSafeInteger(next)) return { error: "Gold limit reached" };
    p.coins = next / 100;
    state.stones.splice(state.stones.indexOf(s), 1);
    return {};
  }
  if (action === "stoneRecut") {
    if (!s.cut?.pieces) return { error: "Choose a cut piece" };
    const id = String(d.piece || ""), piece = s.cut.pieces.find((v) => v.id === id);
    if (!piece) {
      if (s.cut.pieces.some((v) => v.id.startsWith(id) && id && /^[01]{1,5}$/.test(id))) return { selected: s.id };
      return { error: "Choose a cut piece" };
    }
    if (piece.processedRecut) return { error: "Processed recut already used" };
    if (piece.weight < 0.08 || !piece.holes?.length && (piece.depth >= 5 || s.cut.pieces.reduce((n, p2) => n + (p2.processedRecut ? 0.5 : 1), 0) >= 16)) return { error: "Piece too small to recut" };
    if (!validStonePlane(d.plane) || !validStonePose(d.pose)) return { error: "Invalid cut line" };
    const plane2 = d.plane, fee2 = stoneRecutFee(s, piece);
    if (p.coins < fee2) return { error: "Not enough Ancient Gold" };
    const measured = assayJadeStone(jadeStoneModel(s), plane2, piece.path, piece.holes || []);
    if (!measured.valid) return { error: "Invalid cut line" };
    const mass = measured.massShares, jade = measured.jadeShares, children = [0, 1].map((i) => {
      const jadeWeight = piece.jadeWeight * jade[i] * 0.97, discount = Math.min(piece.discount * 0.94, 0.45 + 0.5 * Math.min(1, Math.sqrt(jadeWeight / 2)));
      return { id: piece.id + i, path: [...piece.path, { normal: [...plane2.normal], constant: plane2.constant, side: i === 0 ? 1 : -1 }], weight: piece.weight * mass[i] * 0.97, jadeWeight, value: Math.max(0, Math.min(Math.floor(piece.value * jade[i] * 0.97 * 0.94), Math.floor(jadeWeight * jadeUnitPrice(s.grade, s.color, s.variety) * (s.cut.pricingScale ?? 1) * discount))), discount, depth: piece.depth + 1, ...piece.workedDiscount ? { workedDiscount: true } : {}, ...piece.holes?.length ? { holes: structuredClone(piece.holes), processedRecut: true } : {} };
    });
    p.coins = Math.round((p.coins - fee2) * 100) / 100;
    s.cost += fee2;
    s.pose = [...d.pose];
    s.cut.pieces.splice(s.cut.pieces.indexOf(piece), 1, ...children);
    s.cut.rounds = (s.cut.rounds || 1) + 1;
    s.cut.value = s.cut.pieces.reduce((n, p2) => n + p2.value, 0);
    s.cut.weight = s.cut.pieces.reduce((n, p2) => n + p2.jadeWeight, 0);
    return { selected: s.id };
  }
  if (s.cut) return { selected: s.id };
  if (action === "stoneLight") {
    s.lit = true;
    return { selected: s.id };
  }
  if (action !== "stoneWindow" && action !== "stoneCut") return { error: "Unknown stone tool" };
  if (action === "stoneWindow" && s.window) return { selected: s.id };
  const position = Number(d.position ?? 50), angle = Number(d.angle ?? 0);
  if (action === "stoneCut" && (!Number.isFinite(position) || position < 20 || position > 80 || !Number.isFinite(angle) || angle < -90 || angle > 90)) return { error: "Invalid cut line" };
  if (action === "stoneCut" && d.plane !== void 0 && (!validStonePlane(d.plane) || !validStonePose(d.pose))) return { error: "Invalid cut line" };
  const fee = action === "stoneWindow" ? fees.window : fees.cut;
  if (p.coins < fee) return { error: "Not enough Ancient Gold" };
  const cutPlane = d.plane || { normal: [1, 0, 0], constant: -(position - 50) / 55 }, measurement = action === "stoneCut" ? assayJadeStone(jadeStoneModel(s), cutPlane) : void 0;
  if (measurement && !measurement.valid) return { error: "Invalid cut line" };
  p.coins = Math.round((p.coins - fee) * 100) / 100;
  s.cost += fee;
  if (action === "stoneWindow") {
    s.window = true;
    return { selected: s.id };
  }
  const plane = d.plane;
  s.cut = { position, angle, ...plane ? { plane: { normal: [...plane.normal], constant: plane.constant }, pose: [...d.pose] } : {}, weight: 0, value: 0, retention: 0 };
  if (validStonePose(d.pose)) s.pose = [...d.pose];
  updateStoneAssay(s, measurement);
  if (s.grade > 0 && s.variety) {
    state.collection ??= {};
    const old = state.collection[s.variety] || { count: 0, best: 0, grade: 0 };
    state.collection[s.variety] = { count: Math.min(999999999, old.count + 1), best: Math.max(old.best, s.cut.value), grade: Math.max(old.grade, s.grade) };
  }
  return { selected: s.id };
}
export {
  JADE_DESIGNS,
  JADE_GRADES,
  JADE_PRICE_CAP,
  JADE_PRICE_RATES,
  JADE_VARIETIES,
  ROUGH_STONES,
  assessJadeBlank,
  assessJadePlan,
  fractureDistance,
  inJadeBlank,
  insideRough,
  jadeBlankPoint,
  jadeFractures,
  jadeMillimeters,
  jadePigment,
  jadeProductValue,
  jadeStoneModel,
  jadeUnitPrice,
  jadeVariety,
  makeJadeBlank,
  makeRoughStone,
  stoneCoverage,
  stoneFaceJadeRatio,
  stoneInterior,
  stoneJadeRatio,
  stoneRecutFee,
  stoneRng,
  stoneView,
  stoneworkCommand,
  stoneworkView,
  updateStoneAssay,
  updateStonePrice,
  updateStoneworkAssays,
  validStonePlane,
  validStonePose
};
