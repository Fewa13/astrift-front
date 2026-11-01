// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.

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
var ORIGINS = [{ name: "\u83AB\u897F\u6C99", skin: "\u7070\u767D\u7802\u76AE", color: "#86857a", bias: 0.1, tip: "\u7802\u611F\u7EC6\u5BC6\uFF0C\u7559\u610F\u8131\u7802\u4E0E\u68C9\u7D6E\u3002" }, { name: "\u6728\u90A3", skin: "\u9EC4\u76D0\u7802\u76AE", color: "#aa9270", bias: 0.04, tip: "\u76AE\u58F3\u504F\u8584\uFF0C\u7559\u610F\u70B9\u72B6\u68C9\u4E0E\u8272\u5E26\u3002" }, { name: "\u4F1A\u5361", skin: "\u9752\u7070\u8721\u76AE", color: "#65786c", bias: -0.01, tip: "\u8868\u9762\u5149\u6ED1\uFF0C\u7559\u610F\u6C34\u5934\u4E0E\u7EC6\u88C2\u3002" }, { name: "\u540E\u6C5F", skin: "\u4E4C\u9ED1\u8584\u76AE", color: "#555c55", bias: 0.07, tip: "\u5C0F\u6599\u89C1\u957F\uFF0C\u8272\u4E0E\u88C2\u5F80\u5F80\u76F8\u4F34\u3002" }];
var clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function rng(seed) {
  return () => {
    seed |= 0;
    seed = seed + 1831565813 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
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
var pieceName = (id) => "\u6599 " + id.split("").map((x) => x === "0" ? "A" : "B").join("");
var shares = (xs, fallback = [0.5, 0.5]) => Array.isArray(xs) && xs.length === 2 && xs.every((x) => Number.isFinite(x) && x > 1e-3 && x < 1) && Math.abs(xs[0] + xs[1] - 1) < 1e-3 ? xs : fallback;
function ensureCutPieces(a) {
  if (a.stage !== "cut") return [];
  if (a.cut.pieces) return a.cut.pieces;
  const rad = a.cut.angle * Math.PI / 180, plane = a.cut.plane3d ?? { normal: [Math.cos(rad), -Math.sin(rad), 0], constant: -(a.cut.position - 50) * 0.025 };
  const mass = shares(plane.massShares), jade = shares(plane.jadeShares, mass), first = Math.floor(a.cut.value * jade[0]);
  a.cut.pieces = [0, 1].map((i) => ({ id: String(i), path: [{ normal: [...plane.normal], constant: plane.constant, side: i === 0 ? 1 : -1 }], weight: a.weight * mass[i], jadeWeight: a.cut.weight * jade[i], value: i === 0 ? first : a.cut.value - first, discount: 1, depth: 1 }));
  if (a.cut.pricingVersion === 2) {
    for (const p of a.cut.pieces) p.value = Math.floor(p.jadeWeight * jadeUnitPrice(a.grade, a.color, a.variety) * (a.cut.pricingScale ?? 1) * p.discount);
    a.cut.value = a.cut.pieces.reduce((n, p) => n + p.value, 0);
  }
  a.cut.rounds ??= 1;
  return a.cut.pieces;
}
function recutFee(a, id) {
  const p = ensureCutPieces(a).find((p2) => p2.id === id);
  return p ? Math.max(20, Math.min(100, Math.ceil((p.weight * 18 + p.depth * 8) / 5) * 5)) : 0;
}
function canRecut(a, id) {
  const p = ensureCutPieces(a).find((p2) => p2.id === id);
  return !!p && p.weight >= 0.08 && p.depth < 5 && a.cut.pieces.length < 16;
}
function sizeDiscount(jadeKg) {
  return 0.45 + 0.5 * Math.min(1, Math.sqrt(Math.max(0, jadeKg) / 2));
}
function validVolumeAssay(a) {
  return !!(a && a.version === 2 && Number.isFinite(a.solidVolume) && a.solidVolume > 0 && Number.isFinite(a.jadeVolume) && a.jadeVolume >= 0 && a.jadeVolume <= a.solidVolume * 1.000001);
}
function applyVolumeAssay(a, assay, measurements) {
  if (!validVolumeAssay(assay)) throw Error("\u7389\u8089\u4F53\u79EF\u65E0\u6548\u3002");
  const pieces = ensureCutPieces(a), retention = 1 - a.cracks * 0.45;
  for (const p of pieces) {
    const m = measurements[p.id];
    if (!m || !Number.isFinite(m.jade) || m.jade < 0) throw Error("\u5B50\u6599\u4F53\u79EF\u65E0\u6548\u3002");
    p.jadeWeight = a.weight * (a.grade === 0 ? m.volume : m.jade) / assay.solidVolume * retention * Math.pow(0.97, p.depth);
    p.value = Math.floor(p.jadeWeight * jadeUnitPrice(a.grade, a.color, a.variety) * (a.cut.pricingScale ?? 1) * p.discount);
  }
  const sum = pieces.reduce((n, p) => n + p.value, 0);
  if (sum > JADE_PRICE_CAP) {
    const factor = JADE_PRICE_CAP / sum;
    for (const p of pieces) p.value = Math.floor(p.value * factor);
    a.cut.pricingScale = (a.cut.pricingScale ?? 1) * factor;
  }
  a.cut.value = pieces.reduce((n, p) => n + p.value, 0);
  a.cut.weight = pieces.reduce((n, p) => n + p.jadeWeight, 0);
  a.cut.yieldRate = a.cut.weight / a.weight;
  a.cut.pricingVersion = 2;
  a.cut.assay = { ...assay, retention, kerf: 0.97 };
}
export {
  GRADES,
  ORIGINS,
  applyVolumeAssay,
  canRecut,
  clamp,
  core3D,
  ensureCutPieces,
  phase3D,
  pieceName,
  recutFee,
  rng,
  sizeDiscount,
  validVolumeAssay,
  volumeSample3D
};
