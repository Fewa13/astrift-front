// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.

// src/jade/workshop3d.js
import * as T3 from "./three.module.js";

// src/jade/patterns.ts
var JADE_PATTERN_GLSL = `
 float jHash(vec3 p){uvec3 c=uvec3(ivec3(p));uint h=c.x*0x8da6b343u ^ c.y*0xd8163841u ^ c.z*0xcb1ab31fu;h^=h>>16u;h*=0x7feb352du;h^=h>>15u;h*=0x846ca68bu;h^=h>>16u;return float(h&0xffffffu)/16777215.;}
 float jNoise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(jHash(i),jHash(i+vec3(1,0,0)),f.x),mix(jHash(i+vec3(0,1,0)),jHash(i+vec3(1,1,0)),f.x),f.y),mix(mix(jHash(i+vec3(0,0,1)),jHash(i+vec3(1,0,1)),f.x),mix(jHash(i+vec3(0,1,1)),jHash(i+vec3(1,1,1)),f.x),f.y),f.z);}
 float naturalJadePattern(float pattern,vec3 p,float phase){
  vec3 q=p+vec3(phase*.23,sin(phase)*.71,cos(phase)*.63);float n=jNoise(q*1.75),f=jNoise(q*6.7+vec3(3.1,7.4,1.7)),cloud=n*.72+f*.28;vec3 w=q+vec3(f-.5,n-.5,(n+f)*.5-.5)*.45;
  if(pattern<1.5)return .18+cloud*.65;
  if(pattern<2.5)return smoothstep(.2,.8,jNoise(vec3(q.x*1.4+f*.35,q.y*3.6,q.z*1.7))*.7+n*.3);
  if(pattern<3.5)return smoothstep(.52,.8,jNoise(q*vec3(8,2.2,3.1)+vec3(f*.7)));
  if(pattern<4.5)return smoothstep(.35,.85,cloud)*.78;
  if(pattern<5.5)return smoothstep(.28,.72,jNoise(q*1.2+vec3(f*.4)));
  if(pattern<6.5)return smoothstep(.2,.8,cloud);
  if(pattern<7.5)return .2+cloud*.48;
  if(pattern<8.5)return pow(f*.6+n*.4,1.5);
  if(pattern<9.5)return .1+pow(jNoise(w*vec3(4.2,36,4)),3.)*.65;
  if(pattern<10.5)return .08+pow(jNoise(q*11.)*.65+jNoise(q*23.+vec3(.7))*.35,2.)*.8;
  if(pattern<11.5)return smoothstep(.25,.75,jNoise(q*vec3(1.5,5.7,1.7))*.7+n*.3);
  return smoothstep(.35,.9,jNoise(w*vec3(3.2,7,3.8)+vec3(f*.8))*.66+n*.34)*.8;
 }
`;

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
var ORIGINS = [{ name: "\u83AB\u897F\u6C99", skin: "\u7070\u767D\u7802\u76AE", color: "#86857a", bias: 0.1, tip: "\u7802\u611F\u7EC6\u5BC6\uFF0C\u7559\u610F\u8131\u7802\u4E0E\u68C9\u7D6E\u3002" }, { name: "\u6728\u90A3", skin: "\u9EC4\u76D0\u7802\u76AE", color: "#aa9270", bias: 0.04, tip: "\u76AE\u58F3\u504F\u8584\uFF0C\u7559\u610F\u70B9\u72B6\u68C9\u4E0E\u8272\u5E26\u3002" }, { name: "\u4F1A\u5361", skin: "\u9752\u7070\u8721\u76AE", color: "#65786c", bias: -0.01, tip: "\u8868\u9762\u5149\u6ED1\uFF0C\u7559\u610F\u6C34\u5934\u4E0E\u7EC6\u88C2\u3002" }, { name: "\u540E\u6C5F", skin: "\u4E4C\u9ED1\u8584\u76AE", color: "#555c55", bias: 0.07, tip: "\u5C0F\u6599\u89C1\u957F\uFF0C\u8272\u4E0E\u88C2\u5F80\u5F80\u76F8\u4F34\u3002" }];
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

// src/jade/craft-geometry.js
import * as T2 from "./three.module.js";
function jadeProductGeometry(blank, world = false) {
  const b = blank;
  if (b.kind === "buddha") {
    const parts = JADE_BUDDHA_PARTS.map(([x, y, z, rx, ry, rz]) => {
      const g3 = new T2.SphereGeometry(1, world ? 16 : 24, world ? 12 : 18), p = g3.getAttribute("position");
      for (let i = 0; i < p.count; i++) {
        const px = (x + p.getX(i) * rx) * b.radius, py = (y + p.getY(i) * ry) * b.radius, t = (z - p.getZ(i) * rz) * b.depth;
        p.setXYZ(i, ...b.point.map((c, k) => c + b.u[k] * px + b.v[k] * py - b.normal[k] * t));
      }
      g3.computeVertexNormals();
      return g3;
    });
    const g2 = mergeGeometries(parts);
    for (const p of parts) p.dispose();
    g2.setAttribute("jade", new T2.Float32BufferAttribute(new Float32Array(g2.getAttribute("position").count).fill(1), 1));
    return g2;
  }
  if (b.kind === "bead") {
    const g2 = new T2.SphereGeometry(b.radius * 0.97, world ? 24 : 64, world ? 16 : 40), p = g2.getAttribute("position"), q = new T2.Quaternion().setFromUnitVectors(new T2.Vector3(0, 1, 0), new T2.Vector3(...b.normal));
    for (let i = 0; i < p.count; i++) {
      const v = new T2.Vector3().fromBufferAttribute(p, i).applyQuaternion(q);
      v.add(new T2.Vector3(...b.point)).addScaledVector(new T2.Vector3(...b.normal), -b.depth / 2);
      p.setXYZ(i, v.x, v.y, v.z);
    }
    g2.computeVertexNormals();
    g2.setAttribute("jade", new T2.Float32BufferAttribute(new Float32Array(p.count).fill(1), 1));
    return g2;
  }
  const positions = [], indices = [], segments = world ? 64 : 96, profile = world ? 16 : 32, mid = (b.radius + b.inner) / 2, half = (b.radius - b.inner) / 2;
  for (let i = 0; i <= segments; i++) for (let j = 0; j <= profile; j++) {
    const t = j / profile * Math.PI * 2, c = Math.cos(t), s = Math.sin(t), r = mid + Math.sign(c) * Math.pow(Math.abs(c), 0.38) * half * 0.97, depth = b.depth / 2 + Math.sign(s) * Math.pow(Math.abs(s), 0.38) * b.depth * 0.47;
    positions.push(...jadeBlankPoint(b, r, depth, i / segments * Math.PI * 2));
  }
  for (let i = 0; i < segments; i++) for (let j = 0; j < profile; j++) {
    const a = i * (profile + 1) + j, d = a + profile + 1;
    indices.push(a, d, a + 1, d, d + 1, a + 1);
  }
  const g = new T2.BufferGeometry();
  g.setAttribute("position", new T2.Float32BufferAttribute(positions, 3));
  g.setIndex(indices);
  g.computeVertexNormals();
  g.setAttribute("jade", new T2.Float32BufferAttribute(new Float32Array(positions.length / 3).fill(1), 1));
  return g;
}
function jadeCavityGeometry(b, openBottom = false) {
  const p = [], segments = 64, quad = (a, c, d, e) => p.push(...a, ...c, ...d, ...a, ...d, ...e);
  if (b.kind === "buddha") {
    const pt = (x, y, t) => b.point.map((v, k) => v + b.u[k] * x * b.radius + b.v[k] * y * b.radius - b.normal[k] * t);
    for (const [x, y, u, v] of JADE_BUDDHA_OUTLINE) quad(pt(x, y, 0), pt(x, y, b.depth), pt(u, v, b.depth), pt(u, v, 0));
    if (!openBottom) for (const [x, y, , rx, ry] of JADE_BUDDHA_PARTS) for (let i = 0; i < 64; i++) {
      const a = i / 64 * Math.PI * 2, c = (i + 1) / 64 * Math.PI * 2;
      p.push(...pt(x, y, b.depth), ...pt(x + rx * Math.cos(a), y + ry * Math.sin(a), b.depth), ...pt(x + rx * Math.cos(c), y + ry * Math.sin(c), b.depth));
    }
    const g2 = new T2.BufferGeometry();
    g2.setAttribute("position", new T2.Float32BufferAttribute(p, 3));
    g2.computeVertexNormals();
    g2.setAttribute("jade", new T2.Float32BufferAttribute(new Float32Array(p.length / 3).fill(1), 1));
    return g2;
  }
  for (let i = 0; i < segments; i++) {
    const x = i / segments * Math.PI * 2, y = (i + 1) / segments * Math.PI * 2, pt = (r, t, a) => jadeBlankPoint(b, r, t, a);
    quad(pt(b.radius, 0, x), pt(b.radius, b.depth, x), pt(b.radius, b.depth, y), pt(b.radius, 0, y));
    if (b.inner) quad(pt(b.inner, 0, y), pt(b.inner, b.depth, y), pt(b.inner, b.depth, x), pt(b.inner, 0, x));
    if (!openBottom) quad(pt(b.inner, b.depth, x), pt(b.radius, b.depth, x), pt(b.radius, b.depth, y), pt(b.inner, b.depth, y));
  }
  const g = new T2.BufferGeometry();
  g.setAttribute("position", new T2.Float32BufferAttribute(p, 3));
  g.computeVertexNormals();
  g.setAttribute("jade", new T2.Float32BufferAttribute(new Float32Array(p.length / 3).fill(1), 1));
  return g;
}

// src/jade/workshop3d.js
var WIDTH = 900;
var HEIGHT = 600;
var HALF_W = 2.15;
var HALF_H = HALF_W / 1.5;
var vertexShader = `
 attribute float jade;varying float vFace;varying vec3 vLocal; varying vec3 vNormal; varying vec3 vEye;
 void main(){vFace=jade;vLocal=position;vec4 eye=modelViewMatrix*vec4(position,1.);vEye=-eye.xyz;vNormal=normalize(normalMatrix*normal);gl_Position=projectionMatrix*eye;}
`;
var BUDDHA_HOLE_GLSL = `bool buddhaHole(vec3 d,vec3 n,float radius){vec3 u=normalize(cross(n,abs(n.y)<.9?vec3(0.,1.,0.):vec3(1.,0.,0.))),v=cross(n,u);vec2 p=vec2(dot(d,u),dot(d,v))/radius;return ${JADE_BUDDHA_PARTS.map(([x, y, , rx, ry]) => `dot((p-vec2(${x.toFixed(6)},${y.toFixed(6)}))/vec2(${rx.toFixed(6)},${ry.toFixed(6)}),(p-vec2(${x.toFixed(6)},${y.toFixed(6)}))/vec2(${rx.toFixed(6)},${ry.toFixed(6)}))<=1.`).join("||")};}`;
var fragmentShader = `
 uniform vec3 uColorA,uColorB,uColorC,uWindowTint; uniform float uVariety,uQualityLustre;
 uniform vec4 uFractures[4];uniform float uFracturePhase[4],uFractureCount,uHoleCount,uHoleRows,uExpose,uPolish;uniform sampler2D uHoleData;
 uniform sampler2D uProbeMap,uProbeCrackMap; uniform vec3 uProbeU,uProbeV,uProbeSample; uniform float uProbeReady,uProbeCrackReady; uniform vec3 uSkin,uJade,uProbe,uProbeRead; uniform float uExternalProbe,uWindowCoverage; uniform float uPhase,uGrade,uCore,uCoreX,uCoreAngle,uCap,uWindow,uProbeOn,uCracks,uColor;
 varying float vFace;varying vec3 vLocal;varying vec3 vNormal;varying vec3 vEye;
 float hash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
 float noise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
 float coverage(vec3 p){vec3 d=p-vec3(uCoreX,sin(uPhase)*.12,cos(uPhase*1.7)*.2);float c=cos(uCoreAngle),s=sin(uCoreAngle);vec3 q=vec3(d.x*c+d.y*s,-d.x*s+d.y*c,d.z)/vec3(.4+uCore*.68,.6+uCore*.65,.48+uCore*.65);float cloud=sin(p.x*5.+sin(p.y*4.)*2.+uPhase)*cos(p.z*5.+p.y*3.-uPhase);return clamp(1.3-dot(q,q)+cloud*.15,0.,1.);}
 ${BUDDHA_HOLE_GLSL}
 ${JADE_PATTERN_GLSL}
 float jadePattern(vec3 p){return naturalJadePattern(uVariety,p,uPhase);}
 vec3 pigment(vec3 p){float t=jadePattern(p);if(uVariety>5.5&&uVariety<6.5)return t<.5?mix(uColorA,uColorB,t*2.):mix(uColorB,uColorC,(t-.5)*2.);return mix(uColorA,uColorB,t);}
 void main(){
  vec3 p=vLocal;
  for(int i=0;i<int(uHoleCount);i++){float row=(float(i)+.5)/uHoleRows;vec4 hole=texture2D(uHoleData,vec2(1./6.,row)),axis=texture2D(uHoleData,vec2(.5,row));vec4 shape=texture2D(uHoleData,vec2(5./6.,row));float inner=shape.x;vec3 d=p-hole.xyz;float t=-dot(d,axis.xyz),r=length(d+axis.xyz*t);if(t>-.001&&t<axis.w-.0002&&r<hole.w-.0002&&(inner<.0001||r>inner+.0002)&&(shape.y<.5||buddhaHole(d,axis.xyz,hole.w)))discard;}
  float n=noise(p*9.+uPhase),fine=hash(floor(p*350.));float vein=noise(p*22.+n*2.);
  vec3 normal=normalize(vNormal+vec3(n-.5,vein-.5,fine-.5)*mix(.08,.015,uQualityLustre));if(!gl_FrontFacing)normal=-normal;
  float diffuse=max(dot(normal,normalize(vec3(-.55,.8,1.))),0.);float rim=pow(1.-max(dot(normal,normalize(vEye)),0.),3.);
  vec3 skin=uSkin*(.62+n*.5)+(fine-.5)*.11+vec3(smoothstep(.64,.72,vein)*.055);
  float window=uWindow*(1.-smoothstep(.14,.20,distance(p,vec3(.32,.12,.92))));
  float cutFace=max(uCap,vFace);float face=max(cutFace,window);float cvFace=coverage(cutFace>.5?p:p*.78);if(uExternalProbe>.5&&cutFace<.5)cvFace=uWindowCoverage;vec3 material=mix(vec3(.43,.46,.38),mix(vec3(.39,.50,.39),uJade,uColor),cvFace*max(step(.5,uGrade),uExternalProbe*step(.02,uWindowCoverage)));
  if(uVariety>.5&&uGrade>.5)material=mix(vec3(.43,.46,.38),pigment(p)*(.75+uColor*.25),cvFace);
  if(uExternalProbe>.5&&cutFace<.5&&uWindow>.5)material=mix(vec3(.43,.46,.38),uWindowTint,cvFace);
  float cloud=noise(p*6.+uPhase);material*=.85+cloud*.3;
  float cracks=(1.-smoothstep(.0,.012+uCracks*.02,abs(noise(p*3.+uPhase)-.5)))*smoothstep(.47,.65,noise(p*8.-uPhase));material*=1.-cracks*(.15+uCracks*.3)*(1.-uExpose);
  float fissure=0.,fissureEdge=0.;
  for(int i=0;i<4;i++){if(float(i)>=uFractureCount)break;float d=abs(dot(p,uFractures[i].xyz)+uFractures[i].w+.025*sin(dot(p,vec3(9.,7.,5.))+uFracturePhase[i]));fissure=max(fissure,1.-smoothstep(.0015,.006,d));fissureEdge=max(fissureEdge,1.-smoothstep(.006,.012,d));}
  material=mix(material,vec3(.018,.027,.022),fissure*.94*uExpose);material+=vec3(.14,.16,.13)*max(0.,fissureEdge-fissure)*uExpose;
  vec3 color=mix(skin,material,face)*(.38+diffuse*.78)+rim*vec3(.025,.04,.025);
  float gloss=pow(max(dot(reflect(-normalize(vec3(-.55,.8,1.)),normal),normalize(vEye)),0.),38.);
  color+=gloss*(.02+face*.19*step(2.5,uGrade));
  vec3 reflected=reflect(-normalize(vEye),normal);float softbox=pow(max(0.,dot(reflected,normalize(vec3(-.45,.8,1.)))),18.);color+=uPolish*(softbox*.36+rim*.075)*vec3(.92,.98,.93);
  // View-dependent polish and softly transmitted jade color, without transparency sorting.
  float q=uQualityLustre;
  vec3 reflection=reflect(-normalize(vEye),normal);
  float ribbon=pow(max(0.,dot(reflection,normalize(vec3(-.7,.6,1.)))),mix(24.,55.,q));
  float fill=pow(max(0.,dot(reflection,normalize(vec3(.65,.35,.9)))),48.);
  float polishBand=exp(-pow((reflection.x+.20)/.105,2.))*smoothstep(-.20,.65,reflection.y);
  color+=q*(ribbon*1.4+fill*.5+polishBand*1.25)*vec3(.87,.96,1.);
  color+=material*q*(rim*.75+pow(max(dot(-normal,normalize(vec3(-.55,.8,1.))),0.),2.)*.28);
  color=mix(color,color+material*.22,q*face);
  if(uProbeOn>.5){
   vec3 delta=p-uProbe;float strength=uExternalProbe>.5?uProbeRead.z:coverage(p*.78)*(.16+uGrade*.15);
   float radius=.24+strength*.26;float irregular=.8+noise(p*16.+uPhase)*.35;
   float glow=exp(-pow(length(delta)/radius,2.)*2.4)*irregular;
   vec3 sampleDelta=p-uProbeSample;vec2 uv=vec2(dot(sampleDelta,uProbeU),dot(sampleDelta,uProbeV))/.92+.5;
   vec4 inside=texture2D(uProbeMap,clamp(uv,0.,1.));
   float valid=uProbeReady*smoothstep(0.,.14,min(min(uv.x,1.-uv.x),min(uv.y,1.-uv.y)));
   vec3 transmitted=mix(vec3(.47,.43,.32),inside.rgb,valid);
   // Interior clouding and fissures shape the beam instead of a flat green/yellow disk.
   color=mix(color,transmitted*(1.35+inside.a*.8),clamp(glow*.95,0.,.96));
   color+=exp(-pow(length(delta)/.045,2.))*vec3(.35,.32,.23);
   // Apply real fissure shadows AFTER illumination, so the bright lamp cannot erase them.
   float seam=texture2D(uProbeCrackMap,clamp(uv,0.,1.)).r*valid*uProbeCrackReady;
   color=mix(color,vec3(.012,.021,.016),clamp(seam*exp(-pow(length(delta)/max(radius,.32),2.)*1.2)*1.6,0.,.97));
  }
  gl_FragColor=vec4(color,1.);
  #include <colorspace_fragment>
 }
`;
function baseMaterialFor(a, cap = false) {
  const v = jadeVariety(a.variety);
  return new T3.ShaderMaterial({ uniforms: { uQualityLustre: { value: 0 }, uVariety: { value: v?.pattern || 0 }, uColorA: { value: new T3.Color(v?.colors[0] || "#8dba76") }, uColorB: { value: new T3.Color(v?.colors[1] || "#8dba76") }, uColorC: { value: new T3.Color(v?.colors[2] || "#8dba76") }, uWindowTint: { value: a.windowTint ? new T3.Color().setRGB(...a.windowTint) : new T3.Color("#8dba76") }, uProbeMap: { value: null }, uProbeU: { value: new T3.Vector3(1, 0, 0) }, uProbeV: { value: new T3.Vector3(0, 1, 0) }, uProbeSample: { value: new T3.Vector3() }, uProbeReady: { value: 0 }, uExternalProbe: { value: a.externalProbe ? 1 : 0 }, uWindowCoverage: { value: a.windowCoverage || 0 }, uProbeRead: { value: new T3.Vector3(0.025, 0, 0.025) }, uSkin: { value: new T3.Color(ORIGINS[a.origin].color) }, uJade: { value: new T3.Color(GRADES[a.externalProbe ? 1 : a.grade].color) }, uProbe: { value: new T3.Vector3(0, 0, 0.95) }, uProbeOn: { value: 0 }, uPhase: { value: phaseOf(a) }, uGrade: { value: a.grade }, uCore: { value: a.core }, uCoreX: { value: (a.coreX - 50) * 0.025 }, uCoreAngle: { value: a.coreAngle * Math.PI / 180 }, uCap: { value: cap ? 1 : 0 }, uWindow: { value: a.window ? 1 : 0 }, uCracks: { value: a.cracks }, uColor: { value: a.color } }, vertexShader, fragmentShader, side: T3.DoubleSide });
}
function materialFor(a, cap = false, holes = [], polish = false) {
  const m = baseMaterialFor(a, cap), fractures = jadeFractures(a), rows = Math.max(1, holes.length), data = new Float32Array(rows * 12);
  holes.forEach((h, i) => data.set([...h.point, h.radius, ...h.normal, h.depth, h.inner, h.kind === "buddha" ? 1 : 0, 0, 0], i * 12));
  const holeData = new T3.DataTexture(data, 3, rows, T3.RGBAFormat, T3.FloatType);
  holeData.needsUpdate = true;
  m.addEventListener("dispose", () => holeData.dispose());
  Object.assign(m.uniforms, {
    uProbeCrackMap: { value: null },
    uProbeCrackReady: { value: 0 },
    uExpose: { value: a.stage === "cut" ? 1 : 0 },
    uPolish: { value: polish ? 1 : 0 },
    uFractureCount: { value: fractures.length },
    uFractures: { value: Array.from({ length: 4 }, (_, i) => new T3.Vector4(...fractures[i] ? [...fractures[i].normal, fractures[i].offset] : [0, 0, 0, 0])) },
    uFracturePhase: { value: Array.from({ length: 4 }, (_, i) => fractures[i]?.phase || 0) },
    uHoleCount: { value: holes.length },
    uHoleRows: { value: rows },
    uHoleData: { value: holeData }
  });
  return m;
}
function createJadeProductMaterial(model, blank, quality = 1) {
  const bore = blank.kind === "bead" ? { ...blank, radius: blank.radius * 0.11, inner: 0 } : null;
  const material = materialFor({ ...model, stage: "cut" }, true, bore ? [bore] : [], true);
  material.uniforms.uQualityLustre.value = (Math.max(1, Math.min(8, quality)) - 1) / 7;
  return material;
}
function mountWorkshop3D(canvas, overlay, a, callbacks = {}) {
  const renderer = new T3.WebGLRenderer({ canvas, alpha: true, antialias: true, preserveDrawingBuffer: true, powerPreference: "low-power" });
  renderer.setPixelRatio(1);
  renderer.setSize(WIDTH, HEIGHT, false);
  renderer.setClearColor(0, 0);
  renderer.outputColorSpace = T3.SRGBColorSpace;
  overlay.width = WIDTH;
  overlay.height = HEIGHT;
  const ink = overlay.getContext("2d");
  const scene = new T3.Scene(), camera = new T3.OrthographicCamera(-HALF_W, HALF_W, HALF_H, -HALF_H, 0.1, 30);
  camera.position.set(0, 0, 7);
  camera.lookAt(0, 0, 0);
  const root = new T3.Group();
  scene.add(root);
  const originalGeometry = createRockGeometry(a), selectedPiece = a.stage === "cut" ? ensureCutPieces(a).find((p) => p.id === callbacks.selectedPiece) : null, canCut = !callbacks.product && (a.stage === "raw" || !!selectedPiece);
  const product = callbacks.product, geometry = product ? jadeProductGeometry(product.blank) : selectedPiece ? fragmentGeometry(originalGeometry, selectedPiece.path) : originalGeometry, focusCenter = new T3.Vector3();
  if (selectedPiece || product) {
    geometry.computeBoundingBox();
    geometry.boundingBox.getCenter(focusCenter);
  }
  const bore = product?.blank.kind === "bead" ? { ...product.blank, radius: product.blank.radius * 0.11, inner: 0 } : null;
  const skin = materialFor(a, !!product, bore ? [bore] : selectedPiece?.holes, !!product), jade = materialFor(a, true), raw = new T3.Mesh(geometry, skin);
  raw.position.copy(focusCenter).negate();
  root.add(raw);
  const ray = new T3.Raycaster(), quaternion = new T3.Quaternion();
  let pose = { yaw: a.view3d?.yaw ?? -0.28, pitch: a.view3d?.pitch ?? 0.14, roll: a.view3d?.roll ?? 0 }, mode = "rotate", probeOn = false, probePoint = new T3.Vector3().fromArray(a.probe3d ?? [0, 0, 0.95]), pointer = null, stroke = null, saw = null, parts = null, disposed = false;
  let separation = 0, frame = 0, probePresent = false, probeSequence = 0, probeTimer = 0, lastProbe = -1e3, probeBusy = false, probePending = false;
  if (product) {
    const b = product.blank, q = new T3.Quaternion().setFromRotationMatrix(new T3.Matrix4().makeBasis(new T3.Vector3(...b.u), new T3.Vector3(...b.v), new T3.Vector3(...b.normal)).invert()), e = new T3.Euler().setFromQuaternion(q, "YXZ");
    pose = { yaw: e.y, pitch: e.x, roll: e.z };
  }
  let craftSettings = null, craftLayout = null, craftAssay = null, craftAnimation = null, craftTool = null;
  let craftLayouts = [], craftAssays = [], activeCraft = -1, animationIndex = -1, craftLighting = false;
  let editingCraft = false, hoverPoint = null, ghostKey = "", ghost = null;
  const ghostMaterial = new T3.MeshBasicMaterial({ color: 11910585, transparent: true, opacity: 0.46, depthWrite: false, depthTest: false, side: T3.DoubleSide });
  function hideCraftGhost() {
    if (ghost) ghost.visible = false;
    canvas.dataset.craftHover = "false";
  }
  function hoverCraft(p) {
    hoverPoint = p;
    if (mode !== "craft" || !selectedPiece || !craftSettings || callbacks.isBusy?.()) {
      hideCraftGhost();
      schedule();
      return;
    }
    const hit = rayHit(p), face = hit ? selectedPiece.path.findIndex((f) => Math.abs(new T3.Vector3(...f.normal).dot(hit) + f.constant) < 3e-3) : -1;
    const b = face < 0 ? null : makeJadeBlank({ weight: a.weight }, selectedPiece, { kind: craftSettings.kind, size: craftSettings.size, face, point: hit.toArray() });
    if (!b) {
      hideCraftGhost();
      schedule();
      return;
    }
    const key = b.kind + ":" + b.size + ":" + face;
    if (key !== ghostKey) {
      if (ghost) {
        ghost.geometry.dispose();
        ghost.removeFromParent();
      }
      ghost = new T3.Mesh(jadeProductGeometry({ ...b, point: [0, 0, 0] }, true), ghostMaterial);
      ghost.name = "craft-hover-preview";
      ghost.renderOrder = 8;
      root.add(ghost);
      ghostKey = key;
    }
    ghost.visible = true;
    ghost.position.fromArray(b.point).sub(focusCenter);
    canvas.dataset.craftHover = "true";
    canvas.dataset.craftHoverPoint = b.point.join(",");
    canvas.dataset.craftHoverKind = b.kind;
    schedule();
  }
  const probeTexture = new T3.DataTexture(new Uint8Array(17 * 17 * 4), 17, 17, T3.RGBAFormat);
  probeTexture.minFilter = probeTexture.magFilter = T3.LinearFilter;
  probeTexture.needsUpdate = true;
  skin.uniforms.uProbeMap.value = probeTexture;
  const probeCrackTexture = new T3.DataTexture(new Uint8Array(49 * 49), 49, 49, T3.RedFormat);
  probeCrackTexture.minFilter = probeCrackTexture.magFilter = T3.LinearFilter;
  probeCrackTexture.unpackAlignment = 1;
  probeCrackTexture.needsUpdate = true;
  skin.uniforms.uProbeCrackMap.value = probeCrackTexture;
  const shadowCanvas = document.createElement("canvas");
  shadowCanvas.width = 256;
  shadowCanvas.height = 128;
  const sc = shadowCanvas.getContext("2d"), sg = sc.createRadialGradient(128, 64, 3, 128, 64, 125);
  sg.addColorStop(0, "#0008");
  sg.addColorStop(1, "#0000");
  sc.fillStyle = sg;
  sc.fillRect(0, 0, 256, 128);
  const shadowTexture = new T3.CanvasTexture(shadowCanvas), shadowMaterial = new T3.SpriteMaterial({ map: shadowTexture, depthWrite: false, opacity: 0.85 }), shadow = new T3.Sprite(shadowMaterial);
  shadow.position.set(0, -1.14, -0.4);
  shadow.scale.set(3.7, 0.9, 1);
  scene.add(shadow);
  const allGeometries = [.../* @__PURE__ */ new Set([originalGeometry, geometry])], allMaterials = [skin, jade, shadowMaterial];
  const backCracks = [], pieceIds = /* @__PURE__ */ new WeakMap();
  let nextPieceId = 1;
  const crackFront = new T3.WebGLRenderTarget(WIDTH, HEIGHT, { minFilter: T3.NearestFilter, magFilter: T3.NearestFilter, depthBuffer: true, stencilBuffer: false });
  crackFront.depthTexture = new T3.DepthTexture(WIDTH, HEIGHT, T3.UnsignedIntType);
  const crackMaskMaterial = new T3.ShaderMaterial({ vertexShader: `attribute float jade,crackPiece;varying float face,piece;void main(){face=jade;piece=crackPiece;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`, fragmentShader: `varying float face,piece;void main(){gl_FragColor=vec4(piece/255.,face,0.,1.);}`, side: T3.DoubleSide });
  crackMaskMaterial.defaultAttributeValues.crackPiece = [0];
  allMaterials.push(crackMaskMaterial);
  function addBackCracks(parent, geo, offset, base = skin) {
    if (a.stage !== "cut" || !jadeFractures(a).length) return;
    let id = pieceIds.get(parent);
    if (!id) {
      id = nextPieceId++;
      pieceIds.set(parent, id);
    }
    geo.setAttribute("crackPiece", new T3.Float32BufferAttribute(new Float32Array(geo.getAttribute("position").count).fill(id), 1));
    const mat = new T3.ShaderMaterial({ uniforms: { ...base.uniforms, uFrontMask: { value: crackFront.texture }, uFrontDepth: { value: crackFront.depthTexture }, uPieceId: { value: id }, uFrameSize: { value: new T3.Vector2(WIDTH, HEIGHT) }, uCameraRange: { value: new T3.Vector2(camera.near, camera.far) }, uStoneScale: { value: 1 } }, vertexShader, fragmentShader: `
   uniform vec4 uFractures[4];
   uniform float uFracturePhase[4],uFractureCount,uHoleCount,uHoleRows;uniform sampler2D uHoleData;
   uniform sampler2D uFrontMask,uFrontDepth;uniform vec2 uFrameSize,uCameraRange;uniform float uPieceId,uStoneScale;
   varying vec3 vLocal,vEye;
   ${BUDDHA_HOLE_GLSL}
   void main(){vec2 uv=gl_FragCoord.xy/uFrameSize;vec4 front=texture2D(uFrontMask,uv);
    if(abs(front.r*255.-uPieceId)>.25||front.g<.5)discard;
    float frontZ=mix(uCameraRange.x,uCameraRange.y,texture2D(uFrontDepth,uv).r);
    float depth=(vEye.z-frontZ)/max(.001,uStoneScale);
    if(depth<.008||depth>=.30)discard;
    float fade=1.-smoothstep(.025,.30,depth);vec3 p=vLocal;
    for(int i=0;i<int(uHoleCount);i++){float row=(float(i)+.5)/uHoleRows;vec4 hole=texture2D(uHoleData,vec2(1./6.,row)),axis=texture2D(uHoleData,vec2(.5,row));vec4 shape=texture2D(uHoleData,vec2(5./6.,row));float inner=shape.x;vec3 d=p-hole.xyz;float t=-dot(d,axis.xyz),r=length(d+axis.xyz*t);if(t>-.001&&t<axis.w-.0002&&r<hole.w-.0002&&(inner<.0001||r>inner+.0002)&&(shape.y<.5||buddhaHole(d,axis.xyz,hole.w)))discard;}
    float line=0.;for(int i=0;i<4;i++){if(float(i)>=uFractureCount)break;float d=abs(dot(p,uFractures[i].xyz)+uFractures[i].w+.025*sin(dot(p,vec3(9.,7.,5.))+uFracturePhase[i]));line=max(line,1.-smoothstep(.002,.009,d));}
    if(line<.03)discard;gl_FragColor=vec4(.76,.78,.77,line*.7*fade);
   }`, side: T3.BackSide, transparent: true, depthTest: false, depthWrite: false });
    const mesh = new T3.Mesh(geo, mat);
    mesh.position.copy(offset);
    mesh.renderOrder = 5;
    parent.add(mesh);
    backCracks.push(mesh);
    allMaterials.push(mat);
    canvas.dataset.backCracks = "gray";
    canvas.dataset.backCrackOcclusion = "own-cut-face-depth";
  }
  if (a.stage === "cut" && (selectedPiece || product)) addBackCracks(root, geometry, raw.position);
  function addCavities(parent, piece, offset) {
    for (const hole of piece.holes || []) {
      const original = jadeCavityGeometry(hole, piece.openBore), geo = piece.path?.length ? fragmentSurfaceGeometry(original, piece.path) : original, mat = materialFor(a, true), mesh = new T3.Mesh(geo, mat);
      if (geo !== original) original.dispose();
      mesh.position.copy(offset).negate();
      parent.add(mesh);
      allGeometries.push(geo);
      allMaterials.push(mat);
    }
  }
  if (selectedPiece && !product) addCavities(root, selectedPiece, focusCenter);
  if (bore) addCavities(root, { holes: [bore], openBore: true }, focusCenter);
  function applyPose() {
    root.quaternion.setFromEuler(new T3.Euler(pose.pitch, pose.yaw, pose.roll || 0, "YXZ"));
    quaternion.copy(root.quaternion);
    root.updateMatrixWorld(true);
    fitView();
    canvas.dataset.yaw = pose.yaw.toFixed(3);
    canvas.dataset.pitch = pose.pitch.toFixed(3);
    callbacks.onPose?.(pose);
  }
  function fitView() {
    root.scale.setScalar(1);
    root.updateMatrixWorld(true);
    const ghostParent = ghost?.parent;
    if (ghostParent) ghost.removeFromParent();
    const box = new T3.Box3().setFromObject(root);
    if (ghostParent) ghostParent.add(ghost);
    const mx = Math.max(Math.abs(box.min.x), Math.abs(box.max.x)), my = Math.max(Math.abs(box.min.y), Math.abs(box.max.y));
    root.scale.setScalar(Math.min(product ? 12 : 1, 1.9 / mx, 1.19 / my));
    root.updateMatrixWorld(true);
  }
  function project(p) {
    const v = root.localToWorld(p.clone().sub(focusCenter)).project(camera);
    return { x: (v.x * 0.5 + 0.5) * WIDTH, y: (0.5 - v.y * 0.5) * HEIGHT };
  }
  function rayHit(p) {
    ray.setFromCamera(new T3.Vector2(p.x * 2 - 1, 1 - p.y * 2), camera);
    root.updateMatrixWorld(true);
    const hit = ray.intersectObject(raw, false)[0];
    return hit ? root.worldToLocal(hit.point.clone()).add(focusCenter) : null;
  }
  function placeCraft(p) {
    if (!selectedPiece || !craftSettings) return;
    const reject = () => {
      updateCraftPlan("Choose a flat cut face");
    };
    const hit = rayHit(p);
    if (!hit) {
      reject();
      return;
    }
    const point = hit.toArray(), face = selectedPiece.path.findIndex((f) => Math.abs(new T3.Vector3(...f.normal).dot(hit) + f.constant) < 3e-3);
    if (face < 0) {
      reject();
      return;
    }
    if (!editingCraft || activeCraft < 0) {
      if (craftLayouts.length >= CRAFT_LIMIT) {
        updateCraftPlan("Craft batch limit reached");
        return;
      }
      const candidate = { kind: craftSettings.kind, size: craftSettings.size, face, point }, check = assessJadePlan({ weight: a.weight, jade: a }, selectedPiece, [...craftLayouts, candidate]), item = check.items.at(-1);
      if (!item?.valid) {
        let error = item?.error || "Not enough solid material";
        if (error === "Not enough solid material" && assessJadePlan({ weight: a.weight, jade: a }, { ...selectedPiece, holes: [] }, [candidate]).valid) error = "Overlaps a previous cut";
        updateCraftPlan(error);
        return;
      }
      activeCraft = craftLayouts.length;
    }
    craftLayouts[activeCraft] = { kind: craftSettings.kind, size: craftSettings.size, face, point };
    updateCraftPlan();
  }
  function updateCraftPlan(error = "") {
    const result = assessJadePlan({ weight: a.weight, jade: a }, selectedPiece, craftLayouts);
    craftAssays = result.items;
    craftLayout = craftLayouts[activeCraft] || null;
    craftAssay = craftAssays[activeCraft] || null;
    canvas.dataset.craftValid = String(result.valid);
    canvas.dataset.craftCount = String(craftLayouts.length);
    canvas.dataset.craftEditing = String(editingCraft);
    callbacks.onCraft?.({ ...result, ...error ? { error } : {}, layout: craftLayout, layouts: craftLayouts.map((p) => ({ ...p, point: [...p.point] })), active: activeCraft, editing: editingCraft });
    schedule();
  }
  function drawCraft() {
    for (let i = 0; i < craftAssays.length; i++) drawCraftItem(craftAssays[i], i === activeCraft);
  }
  function drawCraftItem(assay, selected) {
    const b = assay?.blank;
    if (!b) return;
    ink.save();
    const circle = (r, depth, dashed = false) => {
      ink.beginPath();
      for (let j = 0; j <= 96; j++) {
        const p2 = project(new T3.Vector3(...jadeBlankPoint(b, r, depth, j / 96 * Math.PI * 2)));
        j ? ink.lineTo(p2.x, p2.y) : ink.moveTo(p2.x, p2.y);
      }
      ink.setLineDash(dashed ? [7, 7] : []);
      ink.strokeStyle = "#050807";
      ink.lineWidth = 6;
      ink.stroke();
      ink.strokeStyle = "#fff";
      ink.lineWidth = 2.5;
      ink.stroke();
    };
    if (b.kind === "buddha") {
      const at = (x, y) => project(new T3.Vector3(...b.point.map((p2, k) => p2 + b.u[k] * x * b.radius + b.v[k] * y * b.radius)));
      const outline = new Path2D();
      for (const [x, y, u, v] of JADE_BUDDHA_OUTLINE) {
        const a2 = at(x, y), c = at(u, v);
        outline.moveTo(a2.x, a2.y);
        outline.lineTo(c.x, c.y);
      }
      for (const i of [0, 1, 7, 8, 9, 10, 12, 13, 14, 15, 16]) {
        const [cx, cy, , rx, ry] = JADE_BUDDHA_PARTS[i];
        for (let j = 0; j <= 48; j++) {
          const angle = j / 48 * Math.PI * 2, p2 = at(cx + rx * Math.cos(angle), cy + ry * Math.sin(angle));
          if (j) outline.lineTo(p2.x, p2.y);
          else outline.moveTo(p2.x, p2.y);
        }
      }
      ink.setLineDash([]);
      ink.strokeStyle = "#050807";
      ink.lineWidth = 5;
      ink.stroke(outline);
      ink.strokeStyle = assay.valid ? "#fff" : "#ff786b";
      ink.lineWidth = 1.7;
      ink.stroke(outline);
      canvas.dataset.craftPlacedShape = "buddha";
    } else {
      circle(b.radius, 0);
      if (b.inner) circle(b.inner, 0);
      circle(b.radius, b.depth, true);
      if (b.inner) circle(b.inner, b.depth, true);
    }
    const p = project(new T3.Vector3(...b.point));
    ink.setLineDash([]);
    ink.strokeStyle = assay.valid ? "#fff" : "#ff786b";
    ink.lineWidth = selected ? 2 : 1;
    ink.beginPath();
    ink.moveTo(p.x - 8, p.y);
    ink.lineTo(p.x + 8, p.y);
    ink.moveTo(p.x, p.y - 8);
    ink.lineTo(p.x, p.y + 8);
    ink.stroke();
    if (craftAnimation !== null && selected) {
      const angle = craftAnimation * Math.PI * 6, r = b.radius, pos = project(new T3.Vector3(...jadeBlankPoint(b, r, b.depth * Math.min(1, craftAnimation * 2), angle)));
      ink.fillStyle = "#fff1a9";
      ink.shadowColor = "#ffc85b";
      ink.shadowBlur = 14;
      ink.beginPath();
      ink.arc(pos.x, pos.y, 6, 0, 7);
      ink.fill();
      for (let i = 0; i < 12; i++) {
        const t = angle + i * 2.4;
        ink.fillRect(pos.x + Math.cos(t) * (10 + i * 2), pos.y + Math.sin(t) * (6 + i * 2), 2, 2);
      }
    }
    ink.restore();
  }
  function getPoint(e) {
    const r = canvas.getBoundingClientRect();
    return { x: clamp2((e.clientX - r.left) / r.width, -0.25, 1.25), y: clamp2((e.clientY - r.top) / r.height, -0.25, 1.25) };
  }
  function reportProbe() {
    if (!callbacks.requestProbe) {
      const local = probePoint.clone().multiplyScalar(0.78), info = volumeAt(a, local);
      callbacks.onProbe?.({ ...info, point: probePoint.toArray() });
      return;
    }
    probePending = true;
    if (probeBusy || probeTimer) return;
    const run = () => {
      probeTimer = 0;
      if (disposed || !probeOn || !probePresent) {
        probePending = false;
        return;
      }
      probePending = false;
      probeBusy = true;
      lastProbe = performance.now();
      const point = probePoint.toArray();
      Promise.resolve(callbacks.requestProbe(point)).then((info) => {
        if (disposed || !probeOn || !info) return;
        skin.uniforms.uProbeRead.value.set(info.strength || 0.025, info.coverage || 0, info.glow || 0.025);
        const p = info.patch;
        if (p?.size === 17 && p.pixels?.length === 17 * 17 * 4) {
          probeTexture.image.data.set(p.pixels);
          probeTexture.needsUpdate = true;
          skin.uniforms.uProbeU.value.fromArray(p.u);
          skin.uniforms.uProbeV.value.fromArray(p.v);
          skin.uniforms.uProbeSample.value.fromArray(p.point);
          skin.uniforms.uProbeReady.value = 1;
          const mask = p.crackMask, validMask = mask?.size === 49 && mask.pixels?.length === 49 * 49;
          skin.uniforms.uProbeCrackReady.value = validMask ? 1 : 0;
          if (validMask) {
            probeCrackTexture.image.data.set(mask.pixels);
            probeCrackTexture.needsUpdate = true;
          }
        }
        callbacks.onProbe?.({ ...info, point });
        schedule();
      }).catch((e) => {
        if (!disposed) callbacks.onProbeError?.(e);
      }).finally(() => {
        probeBusy = false;
        if (probePending && !disposed && probeOn && probePresent) reportProbe();
      });
    };
    const wait = 180 - (performance.now() - lastProbe);
    if (wait > 0) probeTimer = setTimeout(run, wait);
    else run();
  }
  function drawInk() {
    ink.clearRect(0, 0, WIDTH, HEIGHT);
    drawCraft();
    if (stroke) {
      ink.save();
      ink.strokeStyle = "#ead094";
      ink.lineWidth = 2;
      ink.setLineDash([9, 6]);
      ink.beginPath();
      ink.moveTo(stroke.start.x * WIDTH, stroke.start.y * HEIGHT);
      ink.lineTo(stroke.end.x * WIDTH, stroke.end.y * HEIGHT);
      ink.stroke();
      ink.setLineDash([]);
      for (const p of [stroke.start, stroke.end]) {
        ink.beginPath();
        ink.arc(p.x * WIDTH, p.y * HEIGHT, 5, 0, Math.PI * 2);
        ink.fillStyle = "#f2d99d";
        ink.fill();
      }
      ink.restore();
    }
    if (saw) {
      const { start, end, progress } = saw, x = start.x + (end.x - start.x) * progress, y = start.y + (end.y - start.y) * progress;
      ink.save();
      ink.strokeStyle = "#1a251c";
      ink.lineWidth = 6;
      ink.beginPath();
      ink.moveTo(start.x, start.y);
      ink.lineTo(x, y);
      ink.stroke();
      ink.strokeStyle = "#e9c575";
      ink.lineWidth = 2;
      ink.stroke();
      ink.translate(x, y);
      ink.rotate(Math.atan2(end.y - start.y, end.x - start.x));
      ink.fillStyle = "#d1bd86";
      ink.fillRect(-11, -5, 22, 10);
      for (let i = 0; i < 16; i++) {
        ink.fillStyle = i % 2 ? "#f8dfa4" : "#9ead94";
        ink.fillRect(Math.sin(i * 14 + progress * 74) * 24, Math.cos(i * 6 + progress * 98) * 30, 2, 2);
      }
      ink.restore();
    }
    if (probeOn && probePresent && a.stage === "raw") {
      const p = project(probePoint);
      ink.save();
      ink.translate(p.x, p.y);
      ink.rotate(0.55);
      ink.fillStyle = "#14221c";
      ink.strokeStyle = "#9cae96";
      ink.lineWidth = 2;
      ink.beginPath();
      ink.roundRect(7, -10, 73, 20, 4);
      ink.fill();
      ink.stroke();
      ink.fillStyle = "#bba56c";
      ink.fillRect(0, -12, 7, 24);
      ink.fillStyle = "#fff1bc";
      ink.fillRect(-1, -7, 3, 14);
      for (let i = 0; i < 4; i++) {
        ink.fillStyle = "#405347";
        ink.fillRect(25 + i * 7, -8, 3, 16);
      }
      ink.restore();
    }
    const origin = { x: WIDTH - 53, y: HEIGHT - 43 };
    for (const [axis, color, label] of [[new T3.Vector3(1, 0, 0), "#bc9b72", "X"], [new T3.Vector3(0, 1, 0), "#91ae81", "Y"], [new T3.Vector3(0, 0, 1), "#86a6ab", "Z"]]) {
      axis.applyQuaternion(root.quaternion);
      ink.strokeStyle = color;
      ink.beginPath();
      ink.moveTo(origin.x, origin.y);
      ink.lineTo(origin.x + axis.x * 23, origin.y - axis.y * 23);
      ink.stroke();
      ink.fillStyle = color;
      ink.font = "9px monospace";
      ink.fillText(label, origin.x + axis.x * 30 - 3, origin.y - axis.y * 30 + 3);
    }
  }
  function render() {
    if (disposed) return;
    canvas.style.cursor = mode === "light" && probePresent && a.stage === "raw" ? "none" : mode === "light" || mode === "cut" || mode === "craft" ? "crosshair" : "grab";
    canvas.dataset.probeCursor = mode === "light" && probePresent && a.stage === "raw" ? "lamp" : "normal";
    skin.uniforms.uProbeOn.value = probeOn && probePresent && a.stage === "raw" ? 1 : 0;
    skin.uniforms.uProbe.value.copy(probePoint);
    if (backCracks.length) {
      const shadowVisible = shadow.visible, toolVisible = craftTool?.visible, ghostVisible = ghost?.visible;
      shadow.visible = false;
      if (craftTool) craftTool.visible = false;
      if (ghost) ghost.visible = false;
      for (const mesh of backCracks) {
        mesh.visible = false;
        mesh.material.uniforms.uStoneScale.value = root.scale.x;
      }
      scene.overrideMaterial = crackMaskMaterial;
      renderer.setRenderTarget(crackFront);
      renderer.clear();
      renderer.render(scene, camera);
      renderer.setRenderTarget(null);
      scene.overrideMaterial = null;
      shadow.visible = shadowVisible;
      if (craftTool) craftTool.visible = toolVisible;
      if (ghost) ghost.visible = ghostVisible;
      for (const mesh of backCracks) mesh.visible = true;
    }
    renderer.render(scene, camera);
    drawInk();
  }
  function schedule() {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      render();
    });
  }
  function buildParts(data) {
    if (parts) return;
    const plane = new T3.Plane(new T3.Vector3().fromArray(data.normal), data.constant), split = splitRockGeometry(geometry, plane);
    const original = data.view ?? { yaw: -0.28, pitch: 0.14 }, cutPose = new T3.Quaternion().setFromEuler(new T3.Euler(original.pitch, original.yaw, original.roll || 0, "YXZ"));
    const front = new T3.Vector3(0, 0, 1).applyQuaternion(cutPose.invert());
    parts = [1, -1].map((side, i) => {
      const group = new T3.Group(), surface = i === 0 ? split.positive : split.negative, cap = i === 0 ? split.capPositive : split.capNegative;
      const pivot = split.center.clone();
      const skinMesh = new T3.Mesh(surface, skin), capMesh = new T3.Mesh(cap, jade);
      skinMesh.position.copy(pivot).negate();
      capMesh.position.copy(skinMesh.position);
      group.add(skinMesh, capMesh);
      group.position.copy(pivot).sub(focusCenter);
      root.add(group);
      addBackCracks(group, surface, skinMesh.position);
      addBackCracks(group, cap, capMesh.position);
      allGeometries.push(surface, cap);
      const outward = plane.normal.clone().multiplyScalar(-side), target = outward.clone().multiplyScalar(0.85).addScaledVector(front, 0.55).normalize(), rotation = new T3.Quaternion().setFromUnitVectors(outward, target);
      return { group, pivot, side, normal: plane.normal, rotation };
    });
    raw.visible = false;
  }
  function openParts(progress) {
    separation = progress;
    for (const p of parts ?? []) {
      p.group.position.copy(p.pivot).sub(focusCenter).addScaledVector(p.normal, p.side * 0.85 * progress);
      p.group.quaternion.identity().slerp(p.rotation, progress);
    }
    fitView();
  }
  function beginCut(data) {
    stroke = null;
    const plane = new T3.Plane(new T3.Vector3().fromArray(data.normal), data.constant), split = splitRockGeometry(geometry, plane);
    const projected = split.ring.map(project), start = data.stroke.start, end = data.stroke.end, dx = end.x - start.x, dy = end.y - start.y;
    projected.sort((a2, b) => a2.x * dx + a2.y * dy - (b.x * dx + b.y * dy));
    saw = { start: projected[0], end: projected.at(-1), progress: 0 };
    for (const g of [split.positive, split.negative, split.capPositive, split.capNegative]) g.dispose();
    render();
  }
  function animateCut(progress, data) {
    if (progress < 0.68) {
      if (saw) saw.progress = progress / 0.68;
    } else {
      buildParts(data);
      saw = null;
      const t = (progress - 0.68) / 0.32;
      openParts(t * t * (3 - 2 * t));
    }
    render();
  }
  function cutFromStroke(start, end) {
    if (Math.hypot((end.x - start.x) * WIDTH, (end.y - start.y) * HEIGHT) < 35) throw Error("\u5207\u7EBF\u592A\u77ED\uFF0C\u8BF7\u5212\u8FC7\u77F3\u5934\u753B\u4E00\u6761\u957F\u4E00\u70B9\u7684\u7EBF\u3002");
    let hits = 0;
    for (let i = 0; i <= 12; i++) {
      const t = i / 12;
      if (rayHit({ x: start.x + (end.x - start.x) * t, y: start.y + (end.y - start.y) * t })) hits++;
    }
    if (hits < 2) throw Error("\u5207\u7EBF\u6CA1\u6709\u7A7F\u8FC7\u77F3\u5934\uFF0C\u8BF7\u5728\u77F3\u5934\u4E0A\u5212\u4E00\u5200\u3002");
    const plane = planeFromStroke(start, end, root.quaternion, HALF_W / root.scale.x, HALF_H / root.scale.x);
    plane.constant -= plane.normal.dot(focusCenter);
    const split = splitRockGeometry(geometry, plane);
    const measured = splitShares(split, a);
    const valid = measured.massShares.every((x) => x > 0.012) && split.ring.length >= 8 && split.positive.getAttribute("position").count > 60 && split.negative.getAttribute("position").count > 60;
    for (const g of [split.positive, split.negative, split.capPositive, split.capNegative]) g.dispose();
    if (!valid) throw Error("\u5207\u7EBF\u592A\u9760\u8FB9\uFF0C\u8BF7\u5212\u8FC7\u77F3\u5934\u5185\u90E8\u3002");
    const total = measureGeometry(originalGeometry, a);
    return { normal: plane.normal.toArray(), constant: plane.constant, stroke: { start, end }, view: { ...pose }, assay: { version: 2, solidVolume: total.volume, jadeVolume: total.jade }, ...measured };
  }
  function finishPointer(e, cancelled = false) {
    if (!pointer || e.pointerId !== pointer.id) return;
    const drawn = mode === "cut" && stroke;
    pointer = null;
    if (cancelled) {
      stroke = null;
      schedule();
      return;
    }
    if (drawn) {
      const line = stroke;
      stroke = null;
      try {
        callbacks.onCut?.(cutFromStroke(line.start, line.end));
        schedule();
      } catch (err) {
        callbacks.onError?.(err.message);
        schedule();
      }
    } else callbacks.onCommit?.();
  }
  canvas.onpointerdown = (e) => {
    if (callbacks.isBusy?.() || pointer || e.button !== 0) return;
    canvas.setPointerCapture(e.pointerId);
    const p = getPoint(e);
    pointer = { id: e.pointerId, last: p };
    if (mode === "craft") {
      hideCraftGhost();
      placeCraft(p);
    } else if (mode === "cut" && canCut) {
      stroke = { start: p, end: p };
      schedule();
    } else if (mode === "light" && a.stage === "raw") {
      const hit = rayHit(p);
      if (hit) {
        probePresent = true;
        probePoint.copy(hit);
        a.probe3d = hit.toArray();
        reportProbe();
        schedule();
      }
    }
  };
  canvas.onpointermove = (e) => {
    if (callbacks.isBusy?.()) return;
    const p = getPoint(e);
    if (mode === "craft") hoverCraft(p);
    if (!pointer) {
      if (mode === "light" && a.stage === "raw") {
        const hit = rayHit(p);
        probePresent = !!hit;
        if (hit) {
          probePoint.copy(hit);
          reportProbe();
        } else {
          probeSequence++;
          clearTimeout(probeTimer);
          probeTimer = 0;
        }
        schedule();
      }
      return;
    }
    if (pointer.id !== e.pointerId) return;
    if (mode === "rotate" || !canCut) {
      pose.yaw += (p.x - pointer.last.x) * 5.5;
      pose.pitch = clamp2(pose.pitch + (p.y - pointer.last.y) * 4.3, -1.5, 1.5);
      a.view3d = { ...pose };
      applyPose();
    } else if (mode === "light") {
      const hit = rayHit(p);
      if (hit) {
        probePresent = true;
        probePoint.copy(hit);
        a.probe3d = hit.toArray();
        reportProbe();
      } else {
        probePresent = false;
        callbacks.onProbe?.({ label: "\u706F\u5149\u672A\u8D34\u4F4F\u77F3\u9762\uFF0C\u8BF7\u79FB\u5230\u77F3\u5934\u4E0A\u89C2\u5BDF\u3002", point: null });
      }
    } else if (stroke) stroke.end = p;
    pointer.last = p;
    schedule();
  };
  canvas.onpointerenter = (e) => {
    if (mode === "light" || mode === "craft") canvas.onpointermove(e);
  };
  canvas.onpointerleave = () => {
    hoverPoint = null;
    hideCraftGhost();
    if (!pointer) {
      probePresent = false;
      probeSequence++;
      clearTimeout(probeTimer);
      probeTimer = 0;
      schedule();
    }
  };
  canvas.onpointerup = (e) => finishPointer(e);
  canvas.onpointercancel = (e) => finishPointer(e, true);
  canvas.onlostpointercapture = (e) => finishPointer(e, true);
  canvas.onkeydown = (e) => {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key) || callbacks.isBusy?.()) return;
    e.preventDefault();
    pose.yaw += e.key === "ArrowRight" ? 0.15 : e.key === "ArrowLeft" ? -0.15 : 0;
    pose.pitch = clamp2(pose.pitch + (e.key === "ArrowDown" ? 0.15 : e.key === "ArrowUp" ? -0.15 : 0), -1.5, 1.5);
    a.view3d = { ...pose };
    applyPose();
    schedule();
    callbacks.onCommit?.();
  };
  canvas.addEventListener("webglcontextlost", (e) => {
    e.preventDefault();
    if (!disposed) callbacks.onError?.("\u7ACB\u4F53\u753B\u9762\u6682\u65F6\u4E2D\u65AD\uFF0C\u8BF7\u5237\u65B0\u9875\u9762\u6062\u590D\uFF1B\u5B58\u6863\u5DF2\u4FDD\u7559\u3002");
  });
  applyPose();
  if (a.stage === "cut" && !selectedPiece && !product) {
    const pieces = ensureCutPieces(a);
    if (pieces.length === 2 && pieces.every((p) => p.depth === 1 && !p.holes?.length)) {
      const data = a.cut.plane3d ?? legacyPlane(a);
      buildParts(data);
      openParts(1);
    } else {
      raw.visible = false;
      const cols = Math.min(4, Math.ceil(Math.sqrt(pieces.length))), rows = Math.ceil(pieces.length / cols);
      for (let i = 0; i < pieces.length; i++) {
        const geo = fragmentGeometry(originalGeometry, pieces[i].path);
        geo.computeBoundingBox();
        const center = geo.boundingBox.getCenter(new T3.Vector3()), pieceMat = materialFor(a, false, pieces[i].holes), mesh = new T3.Mesh(geo, pieceMat), group = new T3.Group();
        allMaterials.push(pieceMat);
        mesh.position.copy(center).negate();
        group.add(mesh);
        addBackCracks(group, geo, mesh.position, pieceMat);
        addCavities(group, pieces[i], center);
        group.position.set((i % cols - (cols - 1) / 2) * 2.1, ((rows - 1) / 2 - Math.floor(i / cols)) * 1.8, 0);
        const last = pieces[i].path.at(-1), outward = new T3.Vector3().fromArray(last.normal).multiplyScalar(-last.side), front = new T3.Vector3(0, 0, 1).applyQuaternion(root.quaternion.clone().invert());
        group.quaternion.setFromUnitVectors(outward, outward.clone().multiplyScalar(0.25).addScaledVector(front, 0.8).normalize());
        root.add(group);
        allGeometries.push(geo);
      }
      fitView();
    }
  }
  canvas.dataset.renderer = "webgl";
  render();
  return {
    setCraft(settings) {
      craftSettings = { ...settings };
      if (mode !== "craft" && !craftLayout && selectedPiece) {
        const f = selectedPiece.path.at(-1), blank = makeJadeBlank({ weight: a.weight }, selectedPiece, { ...settings, face: selectedPiece.path.length - 1, point: f.normal.map((x) => -x * f.constant) }), q = new T3.Quaternion().setFromRotationMatrix(new T3.Matrix4().makeBasis(new T3.Vector3(...blank.u), new T3.Vector3(...blank.v), new T3.Vector3(...blank.normal)).invert()), e = new T3.Euler().setFromQuaternion(q, "YXZ");
        pose = { yaw: e.y, pitch: e.x, roll: e.z };
        applyPose();
      }
      mode = "craft";
      canvas.dataset.mode = "craft";
      canvas.style.cursor = "crosshair";
      if (settings.startNew) {
        activeCraft = -1;
        editingCraft = false;
      } else if (editingCraft && activeCraft >= 0) craftLayouts[activeCraft] = { ...craftLayouts[activeCraft], kind: settings.kind, size: settings.size };
      updateCraftPlan();
      if (hoverPoint) hoverCraft(hoverPoint);
    },
    selectCraft(index) {
      if (!craftLayouts[index]) return;
      activeCraft = index;
      editingCraft = true;
      craftSettings = { kind: craftLayouts[index].kind, size: craftLayouts[index].size };
      mode = "craft";
      canvas.dataset.mode = "craft";
      updateCraftPlan();
    },
    removeCraft(index) {
      if (index < 0 || index >= craftLayouts.length) return;
      craftLayouts.splice(index, 1);
      activeCraft = -1;
      editingCraft = false;
      updateCraftPlan();
    },
    craftCount() {
      return craftLayouts.length;
    },
    clearCraft() {
      craftLayouts = [];
      activeCraft = -1;
      editingCraft = false;
      updateCraftPlan();
    },
    animateCraft(progress) {
      const count = craftAssays.length || 1, index = Math.min(count - 1, Math.floor(progress * count));
      if (index !== animationIndex) {
        craftTool?.removeFromParent();
        craftTool = null;
        animationIndex = index;
      }
      progress = Math.min(1, progress * count - index);
      activeCraft = index;
      craftAssay = craftAssays[index];
      craftAnimation = progress;
      const b = craftAssay?.blank;
      if (b && !craftTool) {
        craftTool = new T3.Group();
        root.add(craftTool);
        const metal = new T3.MeshStandardMaterial({ color: "#adb9b7", metalness: 0.78, roughness: 0.24, side: T3.DoubleSide }), grit = new T3.MeshStandardMaterial({ color: "#4c5754", metalness: 0.4, roughness: 0.75 });
        allMaterials.push(metal, grit);
        const tube = new T3.CylinderGeometry(b.radius + 3e-3, b.radius + 3e-3, 0.26, 64, 1, true), rim = new T3.TorusGeometry(b.radius + 3e-3, 8e-3, 6, 64), shaft = new T3.CylinderGeometry(b.radius * 0.22, b.radius * 0.22, 0.28, 20);
        rim.rotateX(Math.PI / 2);
        rim.translate(0, -0.13, 0);
        shaft.translate(0, 0.24, 0);
        for (const [geo, mat] of [[tube, metal], [rim, grit], [shaft, metal]]) {
          craftTool.add(new T3.Mesh(geo, mat));
          allGeometries.push(geo);
        }
        if (!craftLighting) {
          craftLighting = true;
          scene.add(new T3.AmbientLight(14675173, 1.7));
          const key = new T3.DirectionalLight(16777215, 3);
          key.position.set(-2, 4, 5);
          scene.add(key);
        }
      }
      if (craftTool && b) {
        const descent = progress < 0.65 ? progress / 0.65 : Math.max(0, 1 - (progress - 0.65) / 0.35), n = new T3.Vector3(...b.normal);
        craftTool.position.fromArray(b.point).sub(focusCenter).addScaledVector(n, 0.14 - b.depth * descent);
        craftTool.quaternion.setFromUnitVectors(new T3.Vector3(0, 1, 0), n);
        craftTool.rotateY(progress * 45);
        craftTool.visible = progress < 0.97;
      }
      render();
    },
    setMode(next, light = false) {
      mode = next;
      hideCraftGhost();
      hoverPoint = null;
      probeOn = light;
      canvas.dataset.mode = next;
      canvas.style.cursor = next === "cut" ? "crosshair" : next === "light" ? "crosshair" : "grab";
      stroke = null;
      probePresent = false;
      schedule();
    },
    reset() {
      pose = { yaw: -0.28, pitch: 0.14, roll: 0 };
      a.view3d = { ...pose };
      applyPose();
      schedule();
      callbacks.onCommit?.();
    },
    beginCut,
    animateCut,
    reveal(info) {
      if (disposed) return;
      Object.assign(a, info);
      for (const [old, cap] of [[skin, false], [jade, true]]) {
        const next = materialFor(a, cap);
        for (const [key, value] of Object.entries(next.uniforms)) {
          if (key === "uProbeMap" || key === "uProbeCrackMap" || value.value?.isTexture) continue;
          if (old.uniforms[key]?.value?.copy) old.uniforms[key].value.copy(value.value);
          else old.uniforms[key] = value;
        }
        next.dispose();
      }
      render();
    },
    stats() {
      return { geometries: renderer.info.memory.geometries, calls: renderer.info.render.calls };
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      ghost?.geometry.dispose();
      ghostMaterial.dispose();
      ghost?.removeFromParent();
      clearTimeout(probeTimer);
      probeTimer = 0;
      probeSequence++;
      if (frame) cancelAnimationFrame(frame);
      for (const key of ["onpointerenter", "onpointerleave", "onpointerdown", "onpointermove", "onpointerup", "onpointercancel", "onlostpointercapture", "onkeydown"]) canvas[key] = null;
      for (const g of allGeometries) g.dispose();
      for (const m of allMaterials) m.dispose();
      shadowTexture.dispose();
      probeTexture.dispose();
      probeCrackTexture.dispose();
      crackFront.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    }
  };
}
function legacyPlane(a) {
  const rad = a.cut.angle * Math.PI / 180;
  return { normal: [Math.cos(rad), -Math.sin(rad), 0], constant: -(a.cut.position - 50) * 0.025 };
}
function revalueUnsoldStone(a) {
  if (a.stage !== "cut" || a.cut.pricingVersion === 2) return false;
  const original = createRockGeometry(a), m = measureGeometry(original, a), assay = { version: 2, solidVolume: m.volume, jadeVolume: m.jade }, measurements = {};
  try {
    for (const p of ensureCutPieces(a)) {
      const g = fragmentGeometry(original, p.path);
      measurements[p.id] = measureGeometry(g, a);
      g.dispose();
    }
    applyVolumeAssay(a, assay, measurements);
  } finally {
    original.dispose();
  }
  return true;
}
export {
  createJadeProductMaterial,
  mountWorkshop3D,
  revalueUnsoldStone
};
