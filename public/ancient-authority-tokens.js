// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import { AUTHORITY_MAPS } from "./ancient-authority.js";
import { ancientMapHeight, tribeCompactZ } from "./ancient-rules.js";
const AUTHORITY_SHRINES = {
  tribe: [-7, tribeCompactZ(440) + 17, "\u5148\u7956\u796D\u575B\xB7\u65E5\u6677", "Ancestral altar \xB7 sundial", 7, tribeCompactZ(945) + 17, "\u738B\u5370\u796D\u575B\xB7\u754C\u7891", "Royal altar \xB7 boundary stone"],
  forest: [76, 310, "\u91D1\u66DC\u796D\u575B\xB7\u5E74\u8F6E\u7891", "Metal altar \xB7 age rings", 145, 251, "\u6CA7\u6F9C\u796D\u575B\xB7\u53CC\u76F8\u7891", "Water altar \xB7 twin planes"],
  city: [-30, 210, "\u897F\u4FA7\u65E7\u5B85\xB7\u505C\u6446\u949F\u5EA7", "Western house \xB7 stopped clock", 30, 320, "\u4E1C\u4FA7\u65E7\u5B85\xB7\u88C2\u9699\u5C01\u5323", "Eastern house \xB7 sealed rift"],
  blight: [-7, 275, "\u51C0\u5316\u88C5\u7F6E\xB7\u6B8B\u5B58\u523B\u5EA6", "Purifier \xB7 surviving dial", 16, 390, "\u6DF1\u5751\u95E8\u67F1\xB7\u88C2\u9699\u6954", "Pit gateway \xB7 rift keystone"],
  sanctum: [-30, 125, "\u897F\u4FA7\u7977\u4EAD\xB7\u7948\u65F6\u53F0", "Western pavilion \xB7 hour shrine", 27, 380, "\u53D7\u5149\u5668\u4FA7\xB7\u6298\u5149\u5C01\u5370", "Receiver \xB7 refraction seal"],
  starfall: [55, 165, "\u6C89\u6CA1\u62F1\u95E8\xB7\u822A\u65F6\u8BB0\u5F55", "Sunken arch \xB7 voyage chronicle", -109, 140, "\u73CA\u745A\u5854\xB7\u65AD\u5C42\u951A", "Coral tower \xB7 planar anchor"],
  frostcourt: [-35, 125, "\u51B0\u5C01\u55B7\u6CC9\xB7\u505C\u65F6\u523B\u5EA6", "Frozen fountain \xB7 still hours", 35, 190, "\u949F\u697C\u4FA7\xB7\u754C\u95E8\u6B8B\u5370", "Bell tower \xB7 portal seal"],
  skyreach: [148, 72, "\u98CE\u9E23\u7434\xB7\u661F\u65F6\u76D8", "Wind harp \xB7 sidereal dial", -8, 240, "\u7834\u788E\u661F\u8F68\xB7\u7A7A\u95F4\u5B9A\u6807", "Broken orbit \xB7 spatial datum"],
  dunes: [23, 180, "\u7EFF\u6D32\u9057\u5740\xB7\u6D41\u6C34\u8BA1\u65F6", "Oasis ruins \xB7 water clock", 67, 325, "\u65E5\u66DC\u65B9\u5C16\u7891\xB7\u65E5\u5F71\u754C\u7891", "Sun obelisk \xB7 shadow boundary"]
};
function authorityTokens(map) {
  if (!AUTHORITY_MAPS.includes(map)) return [];
  const a = AUTHORITY_SHRINES[map];
  if (!a) return [];
  return ["timelord", "spacelord"].map((job, index) => {
    const i = index * 4, x = a[i], z = a[i + 1], p = { x, z };
    return { job, map, ...p, y: ancientMapHeight(map, p.x, p.z), name: a[i + 2], en: a[i + 3] };
  });
}
export {
  AUTHORITY_SHRINES,
  authorityTokens
};
