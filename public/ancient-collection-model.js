// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.

// src/jade/collection-model.js
import * as T4 from "./three.module.js";

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
var JADE_PRICE_RATES = [4, 50, 300, 5e3, 85e3, 3e6];
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
function jadeQuality(value) {
  return typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 8 ? value : 1;
}

// src/jade/craft-geometry.js
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
var JADE_BUDDHA_OUTLINE = JADE_BUDDHA_PARTS.flatMap(([cx, cy, , rx, ry], index) => Array.from({ length: 96 }, (_, i) => {
  const a = i / 96 * Math.PI * 2, b = (i + 1) / 96 * Math.PI * 2, m = (a + b) / 2, x = cx + rx * Math.cos(m), y = cy + ry * Math.sin(m);
  if (JADE_BUDDHA_PARTS.some(([ox, oy, , sx, sy], n) => n !== index && ((x - ox) / sx) ** 2 + ((y - oy) / sy) ** 2 < 1)) return [];
  return [[cx + rx * Math.cos(a), cy + ry * Math.sin(a), cx + rx * Math.cos(b), cy + ry * Math.sin(b)]];
}).flat());
var BUDDHA_AREA_RATIO = JADE_BUDDHA_OUTLINE.reduce((n, [x, y, u, v]) => n + x * v - u * y, 0) / (2 * Math.PI);
var dot = (a, b) => a.reduce((s, x, i) => s + x * b[i], 0);
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
function jadeBlankPoint(b, r, t, angle) {
  return b.point.map((x, i) => x + b.u[i] * r * Math.cos(angle) + b.v[i] * r * Math.sin(angle) - b.normal[i] * t);
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

// src/jade/craft-geometry.js
function jadeProductGeometry(blank, world = false) {
  const b = blank;
  if (b.kind === "buddha") {
    const parts = JADE_BUDDHA_PARTS.map(([x, y, z, rx, ry, rz]) => {
      const g3 = new T.SphereGeometry(1, world ? 16 : 24, world ? 12 : 18), p = g3.getAttribute("position");
      for (let i = 0; i < p.count; i++) {
        const px = (x + p.getX(i) * rx) * b.radius, py = (y + p.getY(i) * ry) * b.radius, t = (z - p.getZ(i) * rz) * b.depth;
        p.setXYZ(i, ...b.point.map((c, k) => c + b.u[k] * px + b.v[k] * py - b.normal[k] * t));
      }
      g3.computeVertexNormals();
      return g3;
    });
    const g2 = mergeGeometries(parts);
    for (const p of parts) p.dispose();
    g2.setAttribute("jade", new T.Float32BufferAttribute(new Float32Array(g2.getAttribute("position").count).fill(1), 1));
    return g2;
  }
  if (b.kind === "bead") {
    const g2 = new T.SphereGeometry(b.radius * 0.97, world ? 24 : 64, world ? 16 : 40), p = g2.getAttribute("position"), q = new T.Quaternion().setFromUnitVectors(new T.Vector3(0, 1, 0), new T.Vector3(...b.normal));
    for (let i = 0; i < p.count; i++) {
      const v = new T.Vector3().fromBufferAttribute(p, i).applyQuaternion(q);
      v.add(new T.Vector3(...b.point)).addScaledVector(new T.Vector3(...b.normal), -b.depth / 2);
      p.setXYZ(i, v.x, v.y, v.z);
    }
    g2.computeVertexNormals();
    g2.setAttribute("jade", new T.Float32BufferAttribute(new Float32Array(p.count).fill(1), 1));
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
  const g = new T.BufferGeometry();
  g.setAttribute("position", new T.Float32BufferAttribute(positions, 3));
  g.setIndex(indices);
  g.computeVertexNormals();
  g.setAttribute("jade", new T.Float32BufferAttribute(new Float32Array(positions.length / 3).fill(1), 1));
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
    const g2 = new T.BufferGeometry();
    g2.setAttribute("position", new T.Float32BufferAttribute(p, 3));
    g2.computeVertexNormals();
    g2.setAttribute("jade", new T.Float32BufferAttribute(new Float32Array(p.length / 3).fill(1), 1));
    return g2;
  }
  for (let i = 0; i < segments; i++) {
    const x = i / segments * Math.PI * 2, y = (i + 1) / segments * Math.PI * 2, pt = (r, t, a) => jadeBlankPoint(b, r, t, a);
    quad(pt(b.radius, 0, x), pt(b.radius, b.depth, x), pt(b.radius, b.depth, y), pt(b.radius, 0, y));
    if (b.inner) quad(pt(b.inner, 0, y), pt(b.inner, b.depth, y), pt(b.inner, b.depth, x), pt(b.inner, 0, x));
    if (!openBottom) quad(pt(b.inner, b.depth, x), pt(b.radius, b.depth, x), pt(b.radius, b.depth, y), pt(b.inner, b.depth, y));
  }
  const g = new T.BufferGeometry();
  g.setAttribute("position", new T.Float32BufferAttribute(p, 3));
  g.computeVertexNormals();
  g.setAttribute("jade", new T.Float32BufferAttribute(new Float32Array(p.length / 3).fill(1), 1));
  return g;
}

// src/jade/workshop3d.js
import * as T3 from "./three.module.js";

// src/jade/rock-geometry.js
import * as T2 from "./three.module.js";

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
function phase3D(a) {
  return a.seed % 997 / 997 * Math.PI * 2;
}

// src/jade/rock-geometry.js
var phaseOf = phase3D;
var tetraVertices = [[0, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1], [0.5, 0, 0], [0, 0.5, 0], [0, 0, 0.5], [0.5, 0.5, 0], [0.5, 0, 0.5], [0, 0.5, 0.5]];
var tetraCells = [[0, 4, 5, 6], [4, 1, 7, 8], [5, 7, 2, 9], [6, 8, 9, 3], [4, 5, 6, 9], [4, 5, 7, 9], [4, 7, 8, 9], [4, 6, 8, 9]];
var volumeQuadrature = tetraCells.flatMap((cell) => [0, 1, 2, 3].map((k) => {
  const w = [0, 0, 0];
  for (let j = 0; j < 4; j++) for (let axis = 0; axis < 3; axis++) w[axis] += tetraVertices[cell[j]][axis] * (k === j ? 0.5854101966249685 : 0.1381966011250105);
  return w;
}));

// src/jade/workshop3d.js
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

// src/jade/collection-model.js
function createJadeCollectionModel(item) {
  const root = new T4.Group(), resources = [];
  root.name = "jade-" + item.kind;
  root.userData.collectionId = item.id;
  root.userData.beadCount = item.kind === "bracelet" ? item.parts.length : item.kind === "bead" ? 1 : 0;
  const radius = item.kind === "bracelet" ? Math.max(0.022, item.size * item.parts.length * 1.04 / (Math.PI * 2 * 1e3)) : item.kind === "bangle" ? (item.size / 2 + 8) / 1e3 : item.size / 2e3;
  for (let i = 0; i < item.parts.length; i++) {
    const part = item.parts[i], b = part.product.blank, center = new T4.Vector3(...b.point).addScaledVector(new T4.Vector3(...b.normal), -b.depth / 2), holder = new T4.Group(), mat = createJadeProductMaterial(part.jade, b, jadeQuality(part.product.quality ?? item.quality)), geo = jadeProductGeometry(b, true), mesh = new T4.Mesh(geo, mat);
    mesh.position.copy(center).negate();
    holder.add(mesh);
    resources.push(geo, mat);
    if (b.kind === "bead") {
      const bore = { ...b, radius: b.radius * 0.11, inner: 0 }, g = jadeCavityGeometry(bore, true), inner = new T4.Mesh(g, mat);
      inner.position.copy(mesh.position);
      holder.add(inner);
      resources.push(g);
    }
    const angle = i / Math.max(1, item.parts.length) * Math.PI * 2, target = item.kind === "bracelet" ? new T4.Vector3(-Math.sin(angle), Math.cos(angle), 0) : new T4.Vector3(0, 0, 1);
    holder.quaternion.setFromRotationMatrix(new T4.Matrix4().makeBasis(new T4.Vector3(...b.u), new T4.Vector3(...b.v), new T4.Vector3(...b.normal)).invert());
    holder.quaternion.premultiply(new T4.Quaternion().setFromUnitVectors(new T4.Vector3(0, 0, 1), target));
    holder.scale.setScalar(jadeMillimeters(part.jade.weight) / 1e3);
    if (item.kind === "bracelet") holder.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
    holder.userData.sourceProduct = part.product.id;
    root.add(holder);
  }
  if (item.kind === "bracelet") {
    const geo = new T4.TorusGeometry(radius, 65e-5, 6, Math.max(48, item.parts.length * 4)), mat = new T4.MeshStandardMaterial({ color: 8546119, roughness: 0.85 }), cord = new T4.Mesh(geo, mat);
    root.add(cord);
    resources.push(geo, mat);
  }
  root.userData.radius = radius;
  root.userData.dispose = () => {
    root.removeFromParent();
    for (const r of new Set(resources)) r.dispose();
  };
  return root;
}
function createJadeWearModel(item) {
  const root = new T4.Group(), geometries = [], radius = item.kind === "bracelet" ? Math.max(0.022, item.size * item.parts.length * 1.04 / (Math.PI * 2 * 1e3)) : item.kind === "bangle" ? (item.size / 2 + 8) / 1e3 : item.size / 2e3;
  for (let i = 0; i < item.parts.length; i++) {
    const part = item.parts[i], b = part.product.blank, jade = part.jade, fractures = jadeFractures(jade), phase = jade.seed % 997 / 997 * Math.PI * 2, source = jadeProductGeometry(b, true), center = new T4.Vector3(...b.point).addScaledVector(new T4.Vector3(...b.normal), -b.depth / 2), angle = i / Math.max(1, item.parts.length) * Math.PI * 2, target = item.kind === "bracelet" ? new T4.Vector3(-Math.sin(angle), Math.cos(angle), 0) : new T4.Vector3(0, 0, 1), q = new T4.Quaternion().setFromRotationMatrix(new T4.Matrix4().makeBasis(new T4.Vector3(...b.u), new T4.Vector3(...b.v), new T4.Vector3(...b.normal)).invert());
    q.premultiply(new T4.Quaternion().setFromUnitVectors(new T4.Vector3(0, 0, 1), target));
    const scale = jadeMillimeters(jade.weight) / 1e3, position = item.kind === "bracelet" ? new T4.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0) : new T4.Vector3();
    const bake = (g) => {
      const p = g.attributes.position, colors = [];
      for (let n = 0; n < p.count; n++) {
        const v = [p.getX(n), p.getY(n), p.getZ(n)], pigment = jadePigment(jade.variety, v, phase) || [0.2, 0.42, 0.26], coverage = jade.grade > 0 ? jadeCoverageAt(jade, v) : 0, fissure = fractures.some((f) => Math.abs(fractureDistance(f, v)) < 5e-3);
        for (let k = 0; k < 3; k++) colors.push(fissure ? [0.018, 0.027, 0.022][k] : [0.43, 0.46, 0.38][k] * (1 - coverage) + pigment[k] * (0.75 + (jade.color || 0) * 0.25) * coverage);
      }
      g.setAttribute("color", new T4.Float32BufferAttribute(colors, 3));
      g.setAttribute("jadeLustre", new T4.Float32BufferAttribute(new Float32Array(p.count).fill((jadeQuality(part.product.quality ?? item.quality) - 1) / 7), 1));
      g.translate(-center.x, -center.y, -center.z);
      g.applyQuaternion(q);
      g.scale(scale, scale, scale);
      g.translate(position.x, position.y, position.z);
      g.deleteAttribute("jade");
      g.deleteAttribute("uv");
      const flat = g.index ? g.toNonIndexed() : g;
      if (flat !== g) g.dispose();
      geometries.push(flat);
    };
    if (b.kind === "bead") {
      const p = source.attributes.position, index = source.index, indices = [];
      for (let n = 0; n < index.count; n += 3) {
        const ids = [index.getX(n), index.getX(n + 1), index.getX(n + 2)];
        if (ids.some((k) => {
          const v = new T4.Vector3().fromBufferAttribute(p, k).sub(new T4.Vector3(...b.point)), t = v.dot(new T4.Vector3(...b.normal));
          return Math.sqrt(Math.max(0, v.lengthSq() - t * t)) < b.radius * 0.11;
        })) continue;
        indices.push(...ids);
      }
      source.setIndex(indices);
      bake(jadeCavityGeometry({ ...b, radius: b.radius * 0.11, inner: 0 }, true));
    }
    bake(source);
  }
  if (item.kind === "bracelet") {
    const cord = new T4.TorusGeometry(radius, 65e-5, 5, Math.max(48, item.parts.length * 4)).toNonIndexed(), colors = new Float32Array(cord.attributes.position.count * 3);
    for (let i = 0; i < colors.length; i += 3) colors.set([0.22, 0.14, 0.07], i);
    cord.deleteAttribute("uv");
    cord.setAttribute("color", new T4.Float32BufferAttribute(colors, 3));
    cord.setAttribute("jadeLustre", new T4.Float32BufferAttribute(new Float32Array(cord.attributes.position.count), 1));
    geometries.push(cord);
  }
  const geometry = mergeGeometries(geometries);
  for (const g of geometries) g.dispose();
  const grade = item.parts.reduce((n, p) => n + p.jade.grade, 0) / Math.max(1, item.parts.length), material = new T4.MeshStandardMaterial({ vertexColors: true, roughness: Math.max(0.13, 0.46 - grade * 0.055), metalness: 0.035, side: T4.DoubleSide }), mesh = new T4.Mesh(geometry, material);
  material.onBeforeCompile = (shader) => {
    shader.vertexShader = "attribute float jadeLustre;varying float vJadeLustre;\n" + shader.vertexShader.replace("#include <begin_vertex>", "#include <begin_vertex>\nvJadeLustre=jadeLustre;");
    shader.fragmentShader = "varying float vJadeLustre;\n" + shader.fragmentShader.replace("#include <roughnessmap_fragment>", "#include <roughnessmap_fragment>\nroughnessFactor=mix(roughnessFactor,.055,vJadeLustre);").replace("#include <opaque_fragment>", `vec3 jadeView=normalize(vViewPosition);float jadeRim=pow(1.-max(dot(normal,jadeView),0.),3.);vec3 jadeReflection=reflect(-jadeView,normal);float jadeRibbon=pow(max(0.,dot(jadeReflection,normalize(vec3(-.7,.6,1.)))),mix(24.,55.,vJadeLustre));float jadeFill=pow(max(0.,dot(jadeReflection,normalize(vec3(.65,.35,.9)))),48.);float jadeBand=exp(-pow((jadeReflection.x+.20)/.105,2.))*smoothstep(-.20,.65,jadeReflection.y);outgoingLight+=vJadeLustre*((jadeRibbon*1.4+jadeFill*.5+jadeBand*1.25)*vec3(.87,.96,1.)+diffuseColor.rgb*(jadeRim*.75+.22));
#include <opaque_fragment>`);
  };
  material.customProgramCacheKey = () => "jade-quality-lustre-v1";
  mesh.userData.sourceProduct = item.parts[0]?.product.id;
  root.add(mesh);
  root.name = "jade-" + item.kind;
  root.userData = { collectionId: item.id, radius, beadCount: item.kind === "bracelet" ? item.parts.length : item.kind === "bead" ? 1 : 0, sourceProducts: item.parts.map((p) => p.product.id), dispose() {
    root.removeFromParent();
    geometry.dispose();
    material.dispose();
  } };
  return root;
}
function mountJadeCollectionPreview(host, item) {
  const canvas = document.createElement("canvas");
  canvas.style.cssText = "display:block;width:100%;height:230px;touch-action:none";
  canvas.setAttribute("aria-label", "\u85CF\u54C1\u9884\u89C8 / Collection preview");
  host.append(canvas);
  const renderer = new T4.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
  renderer.setPixelRatio(1);
  const scene = new T4.Scene(), camera = new T4.PerspectiveCamera(38, 1, 1e-3, 10), model = createJadeCollectionModel(item);
  scene.add(model);
  const r = model.userData.radius + (item.kind === "bracelet" ? item.size / 2e3 : 0);
  scene.add(new T4.AmbientLight(16777215, 2));
  let disposed = false, last = null, zoom = 1;
  const draw = () => {
    if (!disposed) renderer.render(scene, camera);
  }, resize = () => {
    if (disposed) return;
    const w = host.clientWidth || 500;
    renderer.setSize(Math.min(700, w), 230, false);
    camera.aspect = w / 230;
    camera.position.z = Math.max(0.012, r * 3.8) * Math.max(1, 230 / w) * zoom;
    camera.updateProjectionMatrix();
    draw();
  };
  canvas.onpointerdown = (e) => {
    last = [e.clientX, e.clientY];
    canvas.setPointerCapture(e.pointerId);
  };
  canvas.onpointermove = (e) => {
    if (!last || !canvas.hasPointerCapture(e.pointerId)) return;
    model.rotation.y += (e.clientX - last[0]) * 0.012;
    model.rotation.x += (e.clientY - last[1]) * 0.012;
    last = [e.clientX, e.clientY];
    draw();
  };
  canvas.onpointerup = canvas.onpointercancel = () => last = null;
  const wheel = (e) => {
    e.preventDefault();
    zoom = Math.max(0.62, Math.min(2.5, zoom * Math.exp(e.deltaY * 1e-3)));
    resize();
  };
  canvas.addEventListener("wheel", wheel, { passive: false });
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  resize();
  return () => {
    disposed = true;
    observer.disconnect();
    canvas.removeEventListener("wheel", wheel);
    canvas.onpointerdown = canvas.onpointermove = canvas.onpointerup = canvas.onpointercancel = null;
    model.userData.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
    canvas.remove();
  };
}
export {
  createJadeCollectionModel,
  createJadeWearModel,
  mountJadeCollectionPreview
};
