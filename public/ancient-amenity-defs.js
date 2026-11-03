// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
const GARDEN_CROPS = [
  { id: "carrot", name: ["\u80E1\u841D\u535C", "Carrot"], seconds: 60, yield: 3, color: "#e58c36", form: "root" },
  { id: "tomato", name: ["\u756A\u8304", "Tomato"], seconds: 90, yield: 3, color: "#cb4f3d", form: "vine" },
  { id: "potato", name: ["\u571F\u8C46", "Potato"], seconds: 100, yield: 3, color: "#ae8c5d", form: "root" },
  { id: "wheat", name: ["\u5C0F\u9EA6", "Wheat"], seconds: 120, yield: 3, color: "#d9b75c", form: "grain" },
  { id: "cabbage", name: ["\u5377\u5FC3\u83DC", "Cabbage"], seconds: 90, yield: 2, color: "#86ad64", form: "leaf" },
  { id: "pumpkin", name: ["\u5357\u74DC", "Pumpkin"], seconds: 180, yield: 2, color: "#d8923e", form: "fruit" },
  { id: "mushroom", name: ["\u8611\u83C7", "Mushroom"], seconds: 75, yield: 3, color: "#bda98b", form: "mushroom" },
  { id: "herb", name: ["\u9999\u8349", "Herb"], seconds: 80, yield: 3, color: "#6aab78", form: "herb" },
  { id: "strawberry", name: ["\u8349\u8393", "Strawberry"], seconds: 110, yield: 3, color: "#d85a66", form: "berry" },
  { id: "sunflower", name: ["\u5411\u65E5\u8475", "Sunflower"], seconds: 150, yield: 3, color: "#e6c351", form: "flower" },
  { id: "mint", name: ["\u8584\u8377", "Mint"], seconds: 70, yield: 3, color: "#73b8a1", form: "herb" },
  { id: "rice", name: ["\u6C34\u7A3B", "Rice"], seconds: 130, yield: 3, color: "#b9b778", form: "grain" }
];
const COMMUNITY_RECIPES = [
  { id: "salad", name: ["\u7530\u56ED\u6C99\u62C9", "Garden salad"], take: { carrot: 1, tomato: 1, cabbage: 1 }, seconds: 6, heal: 0.08 },
  { id: "roastedPotato", name: ["\u9999\u8349\u70E4\u571F\u8C46", "Herb-roasted potatoes"], take: { potato: 2, herb: 1 }, seconds: 8, heal: 0.1 },
  { id: "stew", name: ["\u852C\u83DC\u7096\u9505", "Vegetable stew"], take: { carrot: 1, potato: 1, cabbage: 1 }, seconds: 10, heal: 0.12 },
  { id: "porridge", name: ["\u9EA6\u9999\u7C73\u7CA5", "Wheat and rice porridge"], take: { wheat: 2, rice: 1 }, seconds: 8, heal: 0.1 },
  { id: "berryTart", name: ["\u8349\u8393\u9EA6\u997C", "Strawberry wheat cake"], take: { strawberry: 2, wheat: 1 }, seconds: 12, heal: 0.15 },
  { id: "tea", name: ["\u8584\u8377\u9999\u8349\u8336", "Mint and herb tea"], take: { mint: 1, herb: 1 }, seconds: 6, heal: 0.06 },
  { id: "mushroomSoup", name: ["\u9999\u8349\u8611\u83C7\u6C64", "Herbed mushroom soup"], take: { mushroom: 2, herb: 1 }, seconds: 9, heal: 0.12 },
  { id: "pumpkinSoup", name: ["\u5357\u74DC\u6D53\u6C64", "Pumpkin soup"], take: { pumpkin: 2, rice: 1 }, seconds: 12, heal: 0.18 },
  { id: "sunflowerSnack", name: ["\u70D8\u70E4\u8475\u82B1\u7C7D", "Roasted sunflower seeds"], take: { sunflower: 2 }, seconds: 6, heal: 0.06 }
];
const AMENITY_ITEMS = [...GARDEN_CROPS.map((c) => ({ id: "garden_" + c.id, name: [...c.name] })), ...COMMUNITY_RECIPES.map((r) => ({ id: "meal_" + r.id, name: [...r.name] }))];
export {
  AMENITY_ITEMS,
  COMMUNITY_RECIPES,
  GARDEN_CROPS
};
