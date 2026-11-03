// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import { COMMUNITY_EXPANSION, buildCommunityExpansion } from "./ancient-community-expansion.js";
import { FURNITURE_EXPANSION, buildFurnitureExpansion } from "./ancient-community-furniture.js";
const items = [];
function register(category, subcategory, rows) {
  for (const [kind, name, en, size] of rows) items.push({ id: "kit-" + kind, kind, name, en, size, category, subcategory });
}
register("furniture", "seating", [
  ["diningChair", "\u9910\u6905", "Dining chair", [0.55, 1.05, 0.6]],
  ["stool", "\u5706\u6728\u51F3", "Round stool", [0.45, 0.5, 0.45]],
  ["barStool", "\u5427\u53F0\u9AD8\u811A\u51F3", "Bar stool", [0.5, 0.95, 0.5]],
  ["armchair", "\u8F6F\u57AB\u6276\u624B\u6905", "Upholstered armchair", [1, 1, 1]],
  ["rockingChair", "\u6447\u6905", "Rocking chair", [0.8, 1.15, 1.2]],
  ["bench", "\u957F\u6728\u51F3", "Wooden bench", [1.8, 0.9, 0.6]],
  ["parkBench", "\u94F8\u94C1\u516C\u56ED\u6905", "Iron garden bench", [2, 1, 0.7]],
  ["sofa", "\u4E09\u4EBA\u6C99\u53D1", "Three-seat sofa", [2.6, 1, 1]],
  ["cornerSofa", "\u8F6C\u89D2\u6C99\u53D1", "Corner sofa", [2.8, 1, 2.4]],
  ["chaise", "\u8D35\u5983\u8EBA\u6905", "Chaise lounge", [0.9, 1, 2]],
  ["throne", "\u738B\u5EA7", "Royal throne", [1.2, 2.2, 1.2]],
  ["officeChair", "\u4E66\u623F\u8F6C\u6905", "Desk chair", [0.7, 1.2, 0.7]],
  ["pew", "\u6559\u5802\u957F\u6905", "Chapel pew", [2.8, 1.1, 0.8]],
  ["ottoman", "\u8F6F\u57AB\u811A\u51F3", "Ottoman", [0.8, 0.45, 0.65]]
]);
register("furniture", "tables", [
  ["diningTable", "\u516D\u4EBA\u9910\u684C", "Dining table", [2.4, 0.8, 1.1]],
  ["roundTable", "\u5706\u5F62\u9910\u684C", "Round dining table", [1.5, 0.8, 1.5]],
  ["coffeeTable", "\u53CC\u5C42\u8336\u51E0", "Two-tier coffee table", [1.3, 0.45, 0.7]],
  ["sideTable", "\u5E8A\u5934\u8FB9\u684C", "Side table", [0.5, 0.6, 0.5]],
  ["writingDesk", "\u62BD\u5C49\u4E66\u684C", "Writing desk", [1.6, 0.82, 0.7]],
  ["executiveDesk", "\u5927\u578B\u4E66\u623F\u684C", "Executive desk", [2.2, 0.9, 1]],
  ["counter", "\u9152\u9986\u5427\u53F0", "Tavern counter", [3, 1.2, 0.8]],
  ["workbench", "\u6728\u5DE5\u5DE5\u4F5C\u53F0", "Carpenter workbench", [2, 0.9, 0.85]],
  ["banquetTable", "\u957F\u5BB4\u4F1A\u684C", "Banquet table", [4.5, 0.85, 1.25]],
  ["consoleTable", "\u7384\u5173\u957F\u684C", "Console table", [1.6, 0.85, 0.4]],
  ["picnicTable", "\u5E26\u957F\u51F3\u91CE\u9910\u684C", "Picnic table", [2, 0.85, 1.8]],
  ["altarTable", "\u96D5\u7EB9\u4F9B\u684C", "Ceremonial table", [2.1, 1, 0.9]]
]);
register("furniture", "bedroom", [
  ["singleBed", "\u5355\u4EBA\u5E8A", "Single bed", [1.1, 1.15, 2.2]],
  ["doubleBed", "\u53CC\u4EBA\u5E8A", "Double bed", [1.9, 1.2, 2.25]],
  ["canopyBed", "\u56DB\u67F1\u5E37\u5E54\u5E8A", "Canopy bed", [2.1, 2.6, 2.4]],
  ["bunkBed", "\u53CC\u5C42\u5E8A", "Bunk bed", [1.2, 2.1, 2.3]],
  ["cot", "\u8425\u5730\u884C\u519B\u5E8A", "Camp cot", [0.85, 0.55, 2]],
  ["wardrobe", "\u53CC\u95E8\u8863\u67DC", "Wardrobe", [1.6, 2.2, 0.65]],
  ["dresser", "\u516D\u5C49\u6597\u67DC", "Six-drawer dresser", [1.4, 1.05, 0.55]],
  ["nightstand", "\u62BD\u5C49\u5E8A\u5934\u67DC", "Drawer nightstand", [0.55, 0.65, 0.5]],
  ["vanity", "\u5E26\u955C\u68B3\u5986\u53F0", "Mirrored vanity", [1.3, 1.6, 0.5]],
  ["clothesRack", "\u5F00\u653E\u6302\u8863\u67B6", "Clothes rack", [1.5, 1.8, 0.55]],
  ["roomScreen", "\u4E09\u6298\u5C4F\u98CE", "Folding room screen", [2, 1.8, 0.2]],
  ["blanketChest", "\u5E8A\u5C3E\u6536\u7EB3\u7BB1", "Blanket chest", [1.4, 0.55, 0.6]]
]);
register("furniture", "storage", [
  ["bookcase", "\u6EE1\u4E66\u4E66\u67DC", "Filled bookcase", [1.4, 2.2, 0.4]],
  ["openShelf", "\u5F00\u653E\u7F6E\u7269\u67B6", "Open shelf", [1.5, 1.8, 0.5]],
  ["glassCabinet", "\u9648\u5217\u67DC", "Display cabinet", [1.2, 1.9, 0.5]],
  ["cupboard", "\u9910\u5177\u6A71\u67DC", "Kitchen cupboard", [1.5, 2, 0.55]],
  ["chest", "\u5305\u94C1\u6728\u7BB1", "Ironbound chest", [1, 0.65, 0.65]],
  ["barrel", "\u7B8D\u94C1\u6728\u6876", "Wooden barrel", [0.7, 1, 0.7]],
  ["crate", "\u8FD0\u8F93\u6728\u7BB1", "Shipping crate", [1, 1, 1]],
  ["crateStack", "\u5806\u53E0\u8D27\u7BB1", "Stacked cargo crates", [2.2, 2, 1.5]],
  ["weaponRack", "\u5251\u76FE\u6B66\u5668\u67B6", "Sword and shield rack", [1.8, 1.8, 0.5]],
  ["potionShelf", "\u836F\u5242\u67B6", "Potion shelf", [1.3, 1.7, 0.45]],
  ["wineRack", "\u8702\u683C\u9152\u67B6", "Wine rack", [1.3, 1.5, 0.55]],
  ["locker", "\u94C1\u76AE\u50A8\u7269\u67DC", "Metal locker", [0.8, 2, 0.6]]
]);
register("furniture", "kitchen", [
  ["stove", "\u56DB\u773C\u7076\u53F0", "Four-burner stove", [1, 0.95, 0.8]],
  ["oven", "\u7816\u780C\u70E4\u7089", "Brick oven", [1.5, 1.7, 1.2]],
  ["sink", "\u53CC\u69FD\u6C34\u69FD", "Double sink", [1.4, 0.95, 0.7]],
  ["kitchenIsland", "\u6599\u7406\u4E2D\u5C9B", "Kitchen island", [2.2, 0.95, 1]],
  ["fridge", "\u7ACB\u5F0F\u51B0\u67DC", "Standing refrigerator", [0.9, 1.9, 0.8]],
  ["rangeHood", "\u6392\u70DF\u7F69", "Range hood", [1.2, 1.2, 0.8]],
  ["hangingPots", "\u60AC\u6302\u9505\u5177\u67B6", "Hanging pot rack", [1.6, 0.65, 0.7]],
  ["pantry", "\u98DF\u54C1\u50A8\u7269\u67B6", "Pantry shelf", [1.6, 2, 0.6]],
  ["fireplace", "\u77F3\u780C\u58C1\u7089", "Stone fireplace", [2.2, 2.4, 0.85]],
  ["cauldron", "\u70BC\u836F\u5927\u9505", "Alchemy cauldron", [1.1, 1.1, 1.1]],
  ["butcherBlock", "\u539A\u6728\u7827\u677F\u53F0", "Butcher block", [1.2, 0.9, 0.8]],
  ["waterPump", "\u624B\u6447\u6C34\u6CF5", "Hand water pump", [0.7, 1.4, 0.7]]
]);
register("furniture", "bath", [
  ["bathtub", "\u72EC\u7ACB\u6D74\u7F38", "Freestanding bathtub", [0.9, 0.8, 1.9]],
  ["washbasin", "\u7ACB\u67F1\u6D17\u624B\u76C6", "Pedestal basin", [0.65, 0.95, 0.55]],
  ["toilet", "\u5750\u5F0F\u536B\u5177", "Toilet", [0.55, 0.85, 0.8]],
  ["shower", "\u5F00\u653E\u6DCB\u6D74\u67B6", "Shower fixture", [1, 2.3, 1]],
  ["towelRack", "\u6BDB\u5DFE\u67B6", "Towel rack", [0.9, 1.2, 0.35]],
  ["bathCabinet", "\u6D74\u5BA4\u955C\u67DC", "Bathroom mirror cabinet", [0.9, 1.6, 0.35]],
  ["woodenTub", "\u6728\u5236\u6D74\u6876", "Wooden soaking tub", [1.5, 1.1, 1.5]],
  ["washstand", "\u6C34\u76C6\u6D17\u6F31\u53F0", "Bowl washstand", [1, 0.9, 0.6]]
]);
register("furniture", "lighting", [
  ["floorLamp", "\u843D\u5730\u706F", "Floor lamp", [0.55, 1.9, 0.55]],
  ["tableLamp", "\u53F0\u706F", "Table lamp", [0.4, 0.65, 0.4]],
  ["chandelier", "\u516D\u81C2\u540A\u706F", "Six-arm chandelier", [1.5, 1.1, 1.5]],
  ["wallSconce", "\u53CC\u81C2\u58C1\u706F", "Wall sconce", [0.6, 0.7, 0.3]],
  ["candelabra", "\u4E09\u53C9\u70DB\u53F0", "Three-arm candelabra", [0.6, 0.8, 0.3]],
  ["streetLamp", "\u94C1\u827A\u8DEF\u706F", "Iron street lamp", [0.7, 3.8, 0.7]],
  ["paperLantern", "\u7ACB\u5F0F\u7EB8\u706F", "Standing paper lantern", [0.6, 1.4, 0.6]],
  ["brazier", "\u4E09\u811A\u706B\u76C6", "Tripod brazier", [0.8, 1.3, 0.8]]
]);
register("furniture", "decor", [
  ["rug", "\u51E0\u4F55\u7EB9\u5730\u6BEF", "Patterned rug", [2.5, 0.035, 1.8]],
  ["curtains", "\u53CC\u4FA7\u843D\u5730\u5E18", "Draped curtains", [2, 2.5, 0.25]],
  ["wallMirror", "\u96D5\u82B1\u58C1\u955C", "Framed wall mirror", [0.9, 1.3, 0.15]],
  ["painting", "\u5C71\u666F\u6302\u753B", "Landscape painting", [1.4, 0.9, 0.12]],
  ["grandClock", "\u843D\u5730\u6446\u949F", "Grandfather clock", [0.7, 2.2, 0.45]],
  ["vase", "\u843D\u5730\u9676\u74F6", "Floor vase", [0.5, 1, 0.5]],
  ["flowerVase", "\u63D2\u82B1\u74F7\u74F6", "Flower vase", [0.55, 0.85, 0.55]],
  ["indoorPlant", "\u9614\u53F6\u76C6\u683D", "Broadleaf pot plant", [1.1, 1.7, 1.1]],
  ["books", "\u644A\u5F00\u4E66\u672C\u4E0E\u53E0\u4E66", "Open book and book stack", [0.65, 0.3, 0.45]],
  ["tableware", "\u9910\u76D8\u4E0E\u676F\u5177", "Tableware setting", [0.8, 0.25, 0.5]],
  ["fruitBowl", "\u6C34\u679C\u7897", "Fruit bowl", [0.55, 0.35, 0.55]],
  ["globe", "\u94DC\u5EA7\u5730\u7403\u4EEA", "Brass globe", [0.65, 1.2, 0.65]],
  ["piano", "\u7ACB\u5F0F\u94A2\u7434", "Upright piano", [1.7, 1.35, 0.65]],
  ["harp", "\u7AD6\u7434", "Standing harp", [1.1, 1.8, 0.5]],
  ["drums", "\u6F14\u594F\u9F13\u7EC4", "Drum set", [1.8, 1.2, 1.4]],
  ["anvil", "\u94C1\u7827", "Anvil", [1, 0.8, 0.5]],
  ["forge", "\u5E26\u98CE\u7BB1\u953B\u7089", "Forge and bellows", [2.2, 1.9, 1.3]],
  ["loom", "\u6728\u5236\u7EC7\u5E03\u673A", "Weaving loom", [1.8, 1.8, 1.6]],
  ["spinningWheel", "\u7EBA\u8F66", "Spinning wheel", [1.1, 1.2, 0.65]],
  ["armorStand", "\u76D4\u7532\u5C55\u793A\u67B6", "Armored display stand", [0.8, 1.9, 0.6]]
]);
register("nature", "treeSpecies", [
  ["oak", "\u9614\u51A0\u6A61\u6811", "Broad-canopy oak", [7, 9, 7]],
  ["pine", "\u5C42\u53E0\u677E\u6811", "Layered pine", [4, 10, 4]],
  ["willow", "\u5782\u679D\u67F3\u6811", "Weeping willow", [8, 8, 8]],
  ["birch", "\u767D\u6866\u6811", "White birch", [4, 9, 4]],
  ["palm", "\u5F2F\u5E72\u68D5\u6988", "Curved palm", [6, 8, 6]],
  ["bamboo", "\u7AF9\u6797\u7C07", "Bamboo cluster", [4, 7, 4]],
  ["maple", "\u7EA2\u53F6\u67AB\u6811", "Red maple", [6, 7, 6]],
  ["ginkgo", "\u91D1\u53F6\u94F6\u674F", "Golden ginkgo", [6, 9, 6]],
  ["cherry", "\u6A31\u82B1\u6811", "Cherry blossom tree", [7, 7, 7]],
  ["cypress", "\u5C16\u51A0\u67CF\u6811", "Spire cypress", [3, 10, 3]],
  ["baobab", "\u5DE8\u5E72\u7334\u9762\u5305\u6811", "Baobab", [8, 10, 8]],
  ["mushroomTree", "\u5DE8\u578B\u8611\u83C7\u6811", "Giant mushroom tree", [6, 7, 6]],
  ["deadTree", "\u67AF\u679D\u53E4\u6811", "Dead ancient tree", [6, 7, 6]],
  ["fallenLog", "\u7A7A\u5FC3\u5012\u6728", "Hollow fallen log", [5, 1.5, 1.8]],
  ["treeStump", "\u5E74\u8F6E\u6811\u6869", "Growth-ring stump", [2, 1.2, 2]],
  ["orchardTree", "\u7ED3\u679C\u679C\u6811", "Fruit orchard tree", [5, 6, 5]]
]);
register("homes", "cottages", [
  ["cottage", "\u77F3\u57FA\u4E61\u95F4\u5C0F\u5C4B", "Stone-base cottage", [10, 5.5, 8]],
  ["logCabin", "\u539F\u6728\u6797\u95F4\u5C0F\u5C4B", "Forest log cabin", [10, 5.5, 9]],
  ["farmhouse", "\u5E26\u95E8\u5ECA\u519C\u820D", "Porch farmhouse", [13, 6, 10]],
  ["fisherHouse", "\u9AD8\u811A\u6E14\u5C4B", "Stilt fishing house", [10, 7, 9]],
  ["snowCabin", "\u96EA\u539F\u907F\u98CE\u6728\u5C4B", "Snow shelter cabin", [9, 5.5, 9]],
  ["desertHouse", "\u5E73\u9876\u8352\u6F20\u6C11\u5C45", "Flat-roof desert home", [10, 4.5, 10]],
  ["bambooHouse", "\u7AF9\u5236\u540A\u811A\u697C", "Bamboo stilt home", [11, 7, 9]],
  ["witchHut", "\u6797\u4E2D\u70BC\u836F\u5C0F\u5C4B", "Woodland alchemist hut", [10, 6.5, 10]]
]);
register("homes", "villas", [
  ["villa", "\u53CC\u5C42\u9633\u53F0\u522B\u5885", "Two-storey balcony villa", [16, 10, 13]],
  ["courtyardVilla", "\u4E2D\u592E\u5EAD\u9662\u522B\u5885", "Courtyard villa", [20, 8, 20]],
  ["manor", "\u53CC\u7FFC\u9886\u4E3B\u5B85\u90B8", "Twin-wing manor", [25, 11, 18]],
  ["townhouse", "\u53CC\u5C42\u8857\u9053\u4F4F\u5B85", "Two-storey townhouse", [9, 9, 12]],
  ["terraceHouse", "\u5E26\u5C4B\u9876\u9732\u53F0\u4F4F\u5B85", "Roof-terrace home", [13, 9, 12]],
  ["gardenVilla", "\u82B1\u56ED\u56DE\u5ECA\u522B\u5885", "Garden colonnade villa", [22, 9, 18]],
  ["lakeVilla", "\u4E34\u6C34\u5E73\u53F0\u522B\u5885", "Lakeside deck villa", [20, 9, 15]],
  ["mountainLodge", "\u5C71\u5730\u6311\u9AD8\u65C5\u820D", "Mountain lodge", [20, 11, 16]]
]);
register("buildings", "shops", [
  ["tavern", "\u5E26\u5427\u53F0\u9152\u9986", "Furnished tavern", [17, 7, 13]],
  ["inn", "\u53CC\u5C42\u5BA2\u6808", "Two-storey inn", [18, 10, 14]],
  ["blacksmith", "\u5F00\u653E\u5F0F\u94C1\u5320\u94FA", "Open-front smithy", [14, 6, 11]],
  ["apothecary", "\u8349\u836F\u4E0E\u70BC\u91D1\u5546\u5E97", "Apothecary shop", [12, 6, 10]],
  ["bakery", "\u5E26\u70E4\u7089\u9762\u5305\u623F", "Bakery with ovens", [13, 6, 11]],
  ["generalStore", "\u6742\u8D27\u5546\u5E97", "General store", [14, 6, 11]],
  ["marketHall", "\u591A\u644A\u4F4D\u96C6\u5E02\u5927\u5385", "Market hall", [22, 7, 15]],
  ["warehouse", "\u53CC\u5F00\u95E8\u4ED3\u5E93", "Cargo warehouse", [20, 8, 15]]
]);
register("buildings", "civic", [
  ["libraryHall", "\u53CC\u5C42\u4E66\u67B6\u56FE\u4E66\u9986", "Reading library", [20, 9, 15]],
  ["guildHall", "\u5192\u9669\u8005\u516C\u4F1A", "Adventurers guild hall", [22, 9, 17]],
  ["chapel", "\u5E26\u957F\u6905\u793C\u62DC\u5802", "Chapel with pews", [14, 11, 22]],
  ["cathedral", "\u53CC\u5854\u5927\u6559\u5802", "Twin-tower cathedral", [26, 19, 32]],
  ["temple", "\u67F1\u5ECA\u795E\u6BBF", "Colonnaded temple", [22, 11, 25]],
  ["bathhouse", "\u5E26\u6D74\u6C60\u6FA1\u5802", "Bathhouse with pools", [20, 8, 16]],
  ["greenhouse", "\u5F00\u653E\u62F1\u67B6\u6E29\u5BA4", "Open-rib greenhouse", [14, 6, 20]],
  ["stable", "\u5206\u680F\u9A6C\u53A9", "Stall stable", [19, 6, 12]],
  ["windmill", "\u98CE\u8F66\u78E8\u574A", "Windmill", [12, 16, 12]],
  ["watermill", "\u6C34\u8F66\u78E8\u574A", "Watermill", [17, 9, 13]],
  ["lighthouse", "\u87BA\u65CB\u9636\u706F\u5854", "Spiral-stair lighthouse", [10, 22, 10]],
  ["watchtower", "\u6728\u77F3\u77AD\u671B\u5854", "Timber watchtower", [8, 13, 8]],
  ["keep", "\u4E09\u5C42\u57CE\u5821\u4E3B\u697C", "Three-storey castle keep", [20, 17, 20]],
  ["gatehouse", "\u53CC\u5854\u57CE\u95E8\u697C", "Twin-tower gatehouse", [22, 13, 10]]
]);
register("architecture", "structures", [
  ["pavilion", "\u516B\u89D2\u4F11\u61A9\u4EAD", "Octagonal pavilion", [8, 5, 8]],
  ["gazebo", "\u82B1\u56ED\u51C9\u4EAD", "Garden gazebo", [7, 4.5, 7]],
  ["pergola", "\u8461\u8404\u85E4\u5ECA\u67B6", "Vine pergola", [6, 3.5, 10]],
  ["stoneBridge", "\u77F3\u58A9\u62F1\u6865", "Stone pier bridge", [7, 5, 18]],
  ["woodBridge", "\u53CC\u680F\u6728\u6865", "Railed timber bridge", [5, 2.5, 15]],
  ["suspensionBridge", "\u7EF3\u7D22\u540A\u6865", "Rope suspension bridge", [4, 4, 20]],
  ["stoneStairs", "\u77F3\u5236\u5BBD\u697C\u68AF", "Broad stone stair", [5, 3, 8]],
  ["woodStairs", "\u5E26\u6276\u624B\u6728\u697C\u68AF", "Railed timber stair", [3, 3.4, 6]],
  ["spiralStairs", "\u65B9\u5F62\u76D8\u65CB\u697C\u68AF", "Square spiral stair", [5, 6, 5]],
  ["cityWall", "\u53EF\u884C\u8D70\u57CE\u5899\u6BB5", "Walkable city wall", [12, 7, 4]],
  ["cityCorner", "\u8F6C\u89D2\u57CE\u5899\u6BB5", "City wall corner", [10, 7, 10]],
  ["towerRound", "\u73AF\u5ECA\u77F3\u5854", "Stone watch turret", [8, 12, 8]],
  ["portcullis", "\u5347\u8D77\u683C\u6805\u57CE\u95E8", "Raised portcullis gate", [8, 7, 3]],
  ["aqueduct", "\u4E09\u5B54\u5F15\u6C34\u6E20", "Three-span aqueduct", [20, 9, 4]],
  ["dock", "\u6728\u5236\u7801\u5934", "Timber dock", [8, 1, 14]],
  ["fountain", "\u4E09\u5C42\u55B7\u6CC9", "Three-tier fountain", [6, 4, 6]],
  ["well", "\u5E26\u5377\u626C\u6C34\u4E95", "Roofed well", [3, 3.3, 3]],
  ["statuePlaza", "\u96D5\u50CF\u5E7F\u573A", "Statue plaza", [12, 6, 12]],
  ["gardenArch", "\u8537\u8587\u82B1\u62F1\u95E8", "Rose garden arch", [4, 3.5, 2]],
  ["marketStall", "\u906E\u7BF7\u96C6\u5E02\u644A\u4F4D", "Canopied market stall", [4, 3.5, 3]],
  ["cart", "\u53CC\u8F6E\u8D27\u8F66", "Two-wheel handcart", [2, 1.7, 3]],
  ["carriage", "\u56DB\u8F6E\u68DA\u9A6C\u8F66", "Covered wagon", [2.6, 3, 4.5]],
  ["fenceGate", "\u5F00\u653E\u6728\u6805\u95E8", "Open picket gate", [4, 1.5, 0.5]],
  ["flowerBed", "\u56F4\u77F3\u82B1\u575B", "Stone-bordered flower bed", [4, 0.6, 2]]
]);
register("roomSets", "rooms", [
  ["setDining", "\u516D\u4EBA\u9910\u5385\u5957\u88C5", "Six-seat dining room", [5.5, 2.4, 4.5]],
  ["setBanquet", "\u957F\u684C\u5BB4\u4F1A\u5957\u88C5", "Banquet room set", [8, 2.5, 5]],
  ["setLiving", "\u5BA2\u5385\u6C99\u53D1\u8336\u51E0\u5957\u88C5", "Sofa living room set", [6, 2.4, 5]],
  ["setGrandLiving", "\u4F1A\u5BA2\u5385\u8F6C\u89D2\u6C99\u53D1\u5957\u88C5", "Grand lounge set", [7, 2.5, 6]],
  ["setStudy", "\u4E66\u684C\u4E66\u67DC\u5957\u88C5", "Study room set", [5, 2.4, 4.5]],
  ["setBedroom", "\u53CC\u4EBA\u5367\u5BA4\u5957\u88C5", "Double bedroom set", [5.5, 2.8, 5]],
  ["setCanopyBedroom", "\u56DB\u67F1\u5E8A\u5367\u5BA4\u5957\u88C5", "Canopy bedroom set", [6.5, 3, 5.5]],
  ["setDorm", "\u53CC\u5C42\u5E8A\u5BBF\u820D\u5957\u88C5", "Bunk dormitory set", [6, 2.5, 5]],
  ["setKitchen", "\u5B8C\u6574\u53A8\u623F\u5957\u88C5", "Complete kitchen set", [6, 2.5, 5]],
  ["setBathroom", "\u536B\u6D74\u5957\u88C5", "Complete bathroom set", [4.5, 2.5, 4]],
  ["setTavern", "\u9152\u9986\u5427\u53F0\u5957\u88C5", "Tavern bar set", [6.5, 2.5, 5]],
  ["setSmithy", "\u953B\u9020\u5DE5\u574A\u5957\u88C5", "Smithy workshop set", [6, 2.5, 5]],
  ["setAlchemy", "\u70BC\u91D1\u5DE5\u4F5C\u5BA4\u5957\u88C5", "Alchemy workshop set", [5, 2.5, 4.5]],
  ["setLibrary", "\u4E66\u67B6\u9605\u89C8\u533A\u5957\u88C5", "Library reading area", [7, 2.5, 6]],
  ["setCamp", "\u8425\u706B\u9732\u8425\u5957\u88C5", "Campfire rest set", [6, 2.2, 6]],
  ["setGarden", "\u5EAD\u9662\u4F11\u606F\u5957\u88C5", "Garden seating set", [6, 2.5, 5]]
]);
for (const section of FURNITURE_EXPANSION) for (const [kind, name, en, size, family] of section.rows) items.push({ id: "kit-" + kind, kind, name, en, size, category: "furniture", subcategory: section.subcategory, family });
items.push(...COMMUNITY_EXPANSION);
const canonical = {};
for (const [family, kinds] of Object.entries({ diningTable: ["diningTable", "roundTable", "coffeeTable", "sideTable", "writingDesk", "executiveDesk", "counter", "workbench", "banquetTable", "consoleTable", "picnicTable", "altarTable", "butcherBlock"], diningChair: ["diningChair", "stool", "barStool", "rockingChair", "bench", "parkBench", "throne", "officeChair", "pew"], sofa: ["sofa", "armchair", "cornerSofa", "chaise", "ottoman"], wardrobe: ["wardrobe", "dresser", "nightstand", "bookcase", "openShelf", "glassCabinet", "cupboard", "potionShelf", "wineRack", "pantry", "locker", "bathCabinet"], singleBed: ["singleBed", "doubleBed", "canopyBed", "bunkBed", "cot"], floorLamp: ["floorLamp", "tableLamp", "chandelier", "wallSconce", "candelabra", "streetLamp", "paperLantern", "brazier"], washbasin: ["washbasin", "washstand"], indoorPlant: ["indoorPlant", "flowerVase"] })) for (const kind of kinds) canonical[kind] = family;
for (const item of items) {
  item.family = canonical[item.family || item.kind] || item.family || item.kind;
  if (item.category === "furniture") {
    if (["books"].includes(item.kind)) item.subcategory = "books";
    if (["vase", "flowerVase", "indoorPlant"].includes(item.kind)) item.subcategory = "plants";
    if (item.kind === "fireplace") item.subcategory = "fireplaces";
  }
}
function communityCatalogTier(id) {
  const item = byId.get(id);
  if (!item) return null;
  if (item.tier) return item.tier;
  if (item.category !== "furniture") return 2;
  return item.kind === item.family ? 1 : 2;
}
const COMMUNITY_CATALOG = items;
const byId = new Map(items.map((v) => [v.id, v])), cache = /* @__PURE__ */ new Map();
const communityCatalogItem = (id) => byId.get(id);
const WOOD = "#795538", DARK = "#42352e", TRIM = "#bd945d", STONE = "#8c918b", METAL = "#46525a", CLOTH = "#567e83", CREAM = "#e1d5b5", LEAF = "#5b8651";
const SMITHY_FIXTURES = [{ kind: "forge", x: -3.8, z: -2.2, scale: 1 }, { kind: "workbench", x: 4.7, z: -2, scale: 1 }, { kind: "weaponRack", x: 4.7, z: 1.6, scale: 1 }, { kind: "barrel", x: -4.7, z: 2.6, scale: 1 }];
function rawModel(kind) {
  const out = [], add = (shape, x, y, z, w, h, d, color = WOOD, ry = 0) => out.push({ shape, x, y, z, w, h, d, color, ry }), box = (x, y, z, w, h, d, color = WOOD, ry = 0) => add("box", x, y + h / 2, z, w, h, d, color, ry), cyl = (x, y, z, r, h, color = WOOD) => add("cylinder", x, y + h / 2, z, r * 2, h, r * 2, color), ball = (x, y, z, r, color = CREAM) => add("sphere", x, y, z, r * 2, r * 2, r * 2, color), ring = (x, y, z, w, h, d, color = METAL, ry = 0) => add("torus", x, y, z, w, h, d, color, ry), legs = (w, d, h, color = WOOD) => {
    for (const x of [-w / 2, w / 2]) for (const z of [-d / 2, d / 2]) box(x, 0, z, 0.085, h, 0.085, color);
  }, trim = (w, d, y) => {
    for (const z of [-d / 2, d / 2]) box(0, y, z, w, 0.045, 0.045, TRIM);
    for (const x of [-w / 2, w / 2]) box(x, y, 0, 0.045, 0.045, d, TRIM);
  }, append = (id, x, y, z, rotation = 0, scale = 1) => {
    for (const p of rawModel(id)) {
      const c = Math.cos(rotation), s = Math.sin(rotation);
      out.push({ ...p, x: x + (p.x * c - p.z * s) * scale, y: y + p.y * scale, z: z + (p.x * s + p.z * c) * scale, w: p.w * scale, h: p.h * scale, d: p.d * scale, ry: p.ry + rotation });
    }
  };
  const expansion = buildCommunityExpansion(kind, rawModel);
  if (expansion) return expansion;
  const expanded = buildFurnitureExpansion(kind, rawModel);
  if (expanded) return expanded;
  const item = items.find((i) => i.kind === kind);
  if (!item) throw Error("Unknown community model " + kind);
  const [W, H, D] = item.size;
  if (["diningChair", "stool", "barStool", "armchair", "rockingChair", "bench", "parkBench", "sofa", "cornerSofa", "chaise", "throne", "officeChair", "pew", "ottoman"].includes(kind)) {
    const sofa = ["sofa", "cornerSofa", "chaise", "armchair", "ottoman"].includes(kind), seatY = kind === "barStool" ? 0.72 : 0.43;
    legs(W * 0.78, D * 0.68, seatY, kind === "parkBench" || kind === "officeChair" ? METAL : WOOD);
    if (kind === "stool" || kind === "barStool") {
      cyl(0, seatY, 0, W / 2, 0.09);
      for (const y of [0.15, 0.3]) for (const z of [-D * 0.3, D * 0.3]) box(0, y, z, W * 0.8, 0.035, 0.035);
      return out;
    }
    box(0, seatY, 0, W, sofa ? 0.17 : 0.08, D, sofa ? CLOTH : WOOD);
    if (kind !== "ottoman") {
      const backH = H - seatY - 0.12;
      box(0, seatY + 0.08, -D * 0.43, W, backH, 0.12, sofa ? CLOTH : WOOD);
      if (!sofa) for (let i = 0; i < Math.max(3, Math.round(W / 0.25)); i++) box(-W * 0.38 + i * W * 0.76 / (Math.max(3, Math.round(W / 0.25)) - 1), seatY + 0.1, -D * 0.41, 0.045, backH, 0.06, TRIM);
    }
    if (sofa) {
      const n = Math.max(1, Math.floor(W / 0.7));
      for (let i = 0; i < n; i++) {
        box(-W / 2 + (i + 0.5) * W / n, seatY + 0.17, 0, W / n - 0.035, 0.12, D * 0.8, "#9bafa2");
        box(-W / 2 + (i + 0.5) * W / n, seatY + 0.32, -D * 0.34, W / n - 0.04, 0.36, 0.15, CLOTH);
      }
      if (kind !== "ottoman") for (const x of [-W * 0.45, W * 0.45]) box(x, seatY, x === 0 ? 0 : 0, 0.14, 0.4, D * 0.95, CLOTH);
    }
    if (kind === "cornerSofa") {
      box(W * 0.32, seatY, D * 0.45, W * 0.35, 0.2, D * 0.9, CLOTH);
      box(W * 0.48, seatY, D * 0.3, 0.12, 0.5, D * 1.15, CLOTH);
    }
    if (kind === "rockingChair") {
      for (const x of [-W * 0.4, W * 0.4]) for (let i = 0; i < 5; i++) box(x, 0.05 + Math.abs(i - 2) * 0.015, (i - 2) * 0.22, 0.08, 0.06, 0.3, DARK);
    }
    if (kind === "officeChair") {
      cyl(0, 0, 0, 0.1, 0.43, METAL);
      for (let i = 0; i < 5; i++) {
        const t = i * Math.PI * 2 / 5;
        box(Math.sin(t) * 0.22, 0.08, Math.cos(t) * 0.22, 0.35, 0.04, 0.05, METAL, t);
        ball(Math.sin(t) * 0.28, 0.06, Math.cos(t) * 0.28, 0.055, METAL);
      }
    }
    if (kind === "throne") {
      for (const x of [-W * 0.43, W * 0.43]) {
        box(x, 0.5, 0, 0.13, 0.4, D * 0.9, TRIM);
        box(x, 1.25, -D * 0.43, 0.12, 0.7, 0.12, TRIM);
        ball(x, H - 0.1, -D * 0.43, 0.12, TRIM);
      }
      for (let i = 0; i < 5; i++) add("cone", (i - 2) * 0.18, H - 0.1 - Math.abs(i - 2) * 0.1, -D * 0.43, 0.15, 0.35, 0.15, TRIM);
    }
    return out;
  }
  if (["diningTable", "roundTable", "coffeeTable", "sideTable", "writingDesk", "executiveDesk", "counter", "workbench", "banquetTable", "consoleTable", "picnicTable", "altarTable", "butcherBlock"].includes(kind)) {
    if (kind === "roundTable") {
      cyl(0, 0, 0, 0.16, H - 0.1);
      cyl(0, 0, 0, 0.5, 0.09);
      cyl(0, H - 0.1, 0, W / 2, 0.1);
      cyl(0, H - 0.13, 0, W * 0.51, 0.025, TRIM);
      return out;
    }
    legs(W * 0.85, D * 0.75, H - 0.1);
    box(0, H - 0.12, 0, W, 0.12, D);
    trim(W, D, H - 0.04);
    if (["writingDesk", "executiveDesk", "sideTable", "consoleTable"].includes(kind)) {
      for (const x of [-W * 0.34, W * 0.34]) {
        box(x, 0.1, 0, W * 0.25, H - 0.28, D * 0.9, DARK);
        for (let j = 0; j < 3; j++) {
          box(x, 0.17 + j * (H - 0.28) / 3, D * 0.46, W * 0.22, 0.14, 0.05, WOOD);
          box(x, 0.2 + j * (H - 0.28) / 3, D * 0.5, 0.12, 0.025, 0.025, TRIM);
        }
      }
    }
    if (kind === "coffeeTable") box(0, 0.12, 0, W * 0.85, 0.06, D * 0.85, DARK);
    if (kind === "counter") {
      box(0, 0.08, 0, W * 0.94, H - 0.2, D * 0.85, DARK);
      for (let i = 0; i < 5; i++) box((i - 2) * W / 5, 0.15, D * 0.45, W / 5 - 0.04, H - 0.35, 0.035, WOOD);
    }
    if (kind === "workbench") {
      box(0, 0.2, 0, W * 0.86, 0.07, D * 0.8);
      for (let i = 0; i < 4; i++) box((i - 1.5) * 0.3, H, 0.1, 0.18, 0.04, 0.4, METAL);
      box(W * 0.4, H - 0.3, D * 0.6, 0.16, 0.3, 0.14, METAL);
    }
    if (kind === "picnicTable") for (const x of [-W * 0.65, W * 0.65]) {
      box(x, 0.43, 0, 0.35, 0.08, D);
      for (const z of [-D * 0.35, D * 0.35]) box(x, 0, z, 0.08, 0.43, 0.08);
    }
    if (kind === "altarTable") {
      box(0, H, 0, W * 0.6, 0.04, D * 0.65, "#b98b85");
      for (const x of [-W * 0.34, W * 0.34]) append("candelabra", x, H, 0, 0, 0.4);
    }
    return out;
  }
  if (["singleBed", "doubleBed", "canopyBed", "bunkBed", "cot"].includes(kind)) {
    const bunk = kind === "bunkBed", levels = bunk ? [0.35, 1.35] : [kind === "cot" ? 0.28 : 0.4];
    for (const x of [-W * 0.46, W * 0.46]) for (const z of [-D * 0.46, D * 0.46]) box(x, 0, z, 0.1, kind === "canopyBed" ? H : kind === "bunkBed" ? H : 0.6, 0.1);
    for (const y of levels) {
      box(0, y, 0, W, 0.13, D, DARK);
      box(0, y + 0.13, 0, W * 0.96, 0.15, D * 0.94, CREAM);
      box(0, y + 0.28, D * 0.15, W * 0.97, 0.07, D * 0.6, CLOTH);
      for (const x of W > 1.5 ? [-W * 0.23, W * 0.23] : [0]) box(x, y + 0.3, -D * 0.33, W > 1.5 ? W * 0.4 : W * 0.8, 0.12, 0.38, "#f0e5ce");
    }
    box(0, 0.45, -D * 0.47, W, 0.65, 0.09);
    trim(W, D, 0.42);
    if (kind === "canopyBed") {
      for (const z of [-D * 0.46, D * 0.46]) box(0, H - 0.1, z, W, 0.1, 0.1, TRIM);
      for (const x of [-W * 0.46, W * 0.46]) {
        box(x, H - 0.1, 0, 0.1, 0.1, D, TRIM);
        box(x, 0.7, -D * 0.1, 0.07, H - 0.9, D * 0.6, "#c5bcb4");
      }
    }
    if (bunk) {
      for (let i = 0; i < 6; i++) box(W * 0.5, 0.15 + i * 0.27, D * 0.2, 0.36, 0.045, 0.06);
      for (const x of [W * 0.35, W * 0.65]) box(x, 0, D * 0.2, 0.04, 1.9, 0.04);
    }
    return out;
  }
  if (["wardrobe", "dresser", "nightstand", "bookcase", "openShelf", "glassCabinet", "cupboard", "potionShelf", "wineRack", "pantry", "locker", "bathCabinet"].includes(kind)) {
    const open = ["bookcase", "openShelf", "potionShelf", "wineRack", "pantry", "glassCabinet"].includes(kind);
    box(0, 0.08, -D * 0.45, W, H - 0.08, 0.07, DARK);
    for (const x of [-W * 0.48, W * 0.48]) box(x, 0, 0, 0.06, H, D);
    box(0, 0, 0, W, 0.09, D);
    box(0, H - 0.09, 0, W, 0.09, D);
    trim(W, D, H - 0.07);
    const shelves = kind === "nightstand" ? 2 : kind === "dresser" ? 3 : 4;
    for (let j = 1; j < shelves; j++) box(0, H * j / shelves, 0, W, 0.045, D, WOOD);
    if (open) {
      for (let j = 0; j < shelves; j++) for (let i = 0; i < (kind === "bookcase" ? 7 : 4); i++) {
        const x = -W * 0.4 + i * W * 0.8 / (kind === "bookcase" ? 6 : 3), y = 0.1 + H * j / shelves;
        if (kind === "bookcase") {
          box(x, y, 0, W * 0.08, H / shelves * 0.72, D * 0.65, ["#785854", "#607f7a", "#b79c67", "#657184"][i % 4]);
          box(x, y + 0.06, D * 0.34, W * 0.075, 0.025, 0.015, TRIM);
        } else if (kind === "potionShelf") {
          cyl(x, y, 0, 0.06, 0.18, ["#7395b1", "#779d6a", "#ae767f"][i % 3]);
          cyl(x, y + 0.18, 0, 0.025, 0.06, CREAM);
        } else if (kind === "wineRack") {
          cyl(x, y, 0, 0.055, 0.25, "#5b7050");
          box(x, y + 0.09, D * 0.24, 0.1, 0.11, 0.04, CREAM);
        } else {
          box(x, y, 0, 0.18, 0.12 + 0.04 * (i % 2), D * 0.65, ["#b5a588", "#82685a", "#a3aaa3"][i % 3]);
        }
      }
    } else {
      const rows = kind === "dresser" ? 3 : kind === "nightstand" ? 2 : 1, cols = kind === "locker" ? 1 : 2;
      for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
        const x = (i - (cols - 1) / 2) * W / cols, y = 0.12 + j * (H - 0.2) / rows;
        box(x, y, D * 0.49, W / cols - 0.05, (H - 0.2) / rows - 0.04, 0.055, WOOD);
        box(x + (i === 0 ? 0.08 : -0.08), y + (H - 0.2) / rows * 0.5, D * 0.55, 0.055, 0.12, 0.045, TRIM);
      }
    }
    return out;
  }
  if (kind === "vanity") {
    append("writingDesk", 0, 0, 0, 0, 0.7);
    box(0, 0.8, -0.18, 1.15, 0.8, 0.07, TRIM);
    box(0, 0.85, -0.13, 1, 0.68, 0.025, "#9cb6b2");
    append("stool", 0, 0, 0.7, 0, 0.8);
    return out;
  }
  if (kind === "clothesRack") {
    for (const x of [-0.65, 0.65]) {
      box(x, 0, 0, 0.06, 1.7, 0.06, METAL);
      box(x, 0, 0, 0.5, 0.05, 0.5, METAL);
    }
    box(0, 1.65, 0, 1.4, 0.055, 0.055, METAL);
    for (let i = 0; i < 5; i++) {
      box((i - 2) * 0.23, 0.6, 0, 0.18, 0.85, 0.13, ["#6d8593", "#98796b", "#a6a48b"][i % 3]);
      ring((i - 2) * 0.23, 1.52, 0, 0.13, 0.13, 0.03, TRIM);
    }
    return out;
  }
  if (kind === "roomScreen") {
    for (let i = 0; i < 3; i++) {
      const x = (i - 1) * 0.65, r = (i - 1) * 0.18;
      box(x, 0.1, 0, 0.6, 1.6, 0.055, CREAM, r);
      for (const dx of [-0.3, 0.3]) box(x + dx, 0, 0, 0.035, 1.8, 0.08, DARK);
      box(x, 0.25, 0, 0.52, 0.04, 0.07, TRIM);
      box(x, 1.55, 0, 0.52, 0.04, 0.07, TRIM);
    }
    return out;
  }
  if (["chest", "blanketChest", "crate", "crateStack", "barrel", "weaponRack"].includes(kind)) {
    if (kind === "barrel") {
      cyl(0, 0, 0, 0.32, 1);
      for (const y of [0.1, 0.5, 0.87]) cyl(0, y, 0, 0.35, 0.055, METAL);
      for (let i = 0; i < 10; i++) {
        const a = i * Math.PI / 5;
        box(Math.sin(a) * 0.325, 0.07, Math.cos(a) * 0.325, 0.02, 0.86, 0.025, DARK);
      }
      return out;
    }
    if (kind === "crateStack") {
      append("crate", -0.55, 0, 0);
      append("crate", 0.55, 0, 0);
      append("crate", 0, 1, 0, 0, 0.9);
      return out;
    }
    if (kind === "weaponRack") {
      for (const x of [-0.8, 0.8]) box(x, 0, 0, 0.1, 1.7, 0.1);
      for (const y of [0.25, 1.3]) box(0, y, 0, 1.7, 0.1, 0.12);
      for (let i = 0; i < 4; i++) {
        const x = (i - 1.5) * 0.35;
        box(x, 0.35, 0.1, 0.045, 1.2, 0.06, "#aab5b5");
        box(x, 0.45, 0.13, 0.22, 0.05, 0.08, TRIM);
        box(x, 0.2, 0.12, 0.07, 0.25, 0.07, DARK);
      }
      return out;
    }
    box(0, 0, 0, W, H, D);
    for (const x of [-W * 0.4, W * 0.4]) {
      box(x, 0, D * 0.51, 0.08, H, 0.035, kind === "crate" ? DARK : METAL);
      box(x, 0, -D * 0.51, 0.08, H, 0.035, kind === "crate" ? DARK : METAL);
      box(x, H, 0, 0.08, 0.035, D);
    }
    for (const y of [0.05, H * 0.8]) box(0, y, D * 0.52, W, 0.06, 0.04, DARK);
    box(0, H * 0.5, D * 0.55, 0.12, 0.12, 0.04, TRIM);
    return out;
  }
  if (["stove", "oven", "sink", "kitchenIsland", "fridge", "rangeHood", "hangingPots", "fireplace", "cauldron", "waterPump"].includes(kind)) {
    if (kind === "stove") {
      box(0, 0, 0, W, H - 0.08, D, METAL);
      box(0, H - 0.08, 0, W, 0.08, D, "#b9bcb1");
      for (const x of [-0.25, 0.25]) for (const z of [-0.2, 0.2]) ring(x, H + 0.015, z, 0.32, 0.12, 0.32, DARK);
      for (const x of [-0.3, -0.1, 0.1, 0.3]) ball(x, 0.75, D * 0.51, 0.035, TRIM);
      box(0, 0.2, D * 0.51, 0.7, 0.4, 0.035, DARK);
      return out;
    }
    if (kind === "sink") {
      box(0, 0, 0, W, 0.82, D, "#73837c");
      for (const x of [-0.34, 0.34]) {
        box(x, 0.82, 0, 0.58, 0.05, 0.55, CREAM);
        box(x, 0.85, 0, 0.46, 0.02, 0.42, "#718f94");
      }
      for (const x of [-0.5, 0.5]) box(x, 0.1, D * 0.5, 0.55, 0.65, 0.04, WOOD);
      cyl(0, 0.9, -0.2, 0.025, 0.35, METAL);
      box(0, 1.2, -0.1, 0.05, 0.05, 0.25, METAL);
      return out;
    }
    if (kind === "kitchenIsland") {
      box(0, 0, 0, W, 0.85, D, WOOD);
      box(0, 0.85, 0, W + 0.12, 0.1, D + 0.12, CREAM);
      for (let i = 0; i < 4; i++) {
        box((i - 1.5) * 0.52, 0.2, D * 0.51, 0.46, 0.6, 0.04, DARK);
        box((i - 1.5) * 0.52, 0.6, D * 0.55, 0.2, 0.025, 0.025, TRIM);
      }
      return out;
    }
    if (kind === "fridge") {
      box(0, 0, 0, W, H, D, "#aebcb5");
      box(0, 0.06, D * 0.51, W * 0.93, H * 0.65, 0.04, "#d3d9ce");
      box(0, H * 0.7, D * 0.51, W * 0.93, H * 0.26, 0.04, "#c1ccc2");
      for (const y of [0.8, 1.55]) box(-0.3, y, D * 0.56, 0.04, 0.3, 0.05, METAL);
      return out;
    }
    if (kind === "rangeHood") {
      box(0, 0, 0, 1.2, 0.18, 0.8, METAL);
      box(0, 0.18, -0.1, 0.6, 0.3, 0.5, METAL);
      box(0, 0.48, -0.1, 0.3, 0.7, 0.3, METAL);
      for (let i = 0; i < 6; i++) box((i - 2.5) * 0.15, 0.03, 0.42, 0.09, 0.04, 0.02, DARK);
      return out;
    }
    if (kind === "hangingPots") {
      for (const x of [-0.7, 0.7]) box(x, 0.3, 0, 0.035, 0.35, 0.035, METAL);
      box(0, 0.3, 0, 1.5, 0.04, 0.05, METAL);
      for (let i = 0; i < 5; i++) {
        const x = (i - 2) * 0.28;
        cyl(x, 0, 0, 0.1, 0.18, METAL);
        box(x, 0.18, 0, 0.025, 0.15, 0.025, METAL);
      }
      return out;
    }
    if (kind === "fireplace" || kind === "oven") {
      for (const x of [-W * 0.4, W * 0.4]) box(x, 0, 0, W * 0.2, H * 0.6, D, STONE);
      box(0, H * 0.55, 0, W, 0.3, D, STONE);
      box(0, H * 0.65, -D * 0.15, W * 0.5, H * 0.35, D * 0.7, STONE);
      box(0, 0, -D * 0.4, W, 0.1, 0.1, STONE);
      box(0, 0.15, 0, W * 0.65, 0.1, D * 0.55, DARK);
      for (let i = 0; i < 4; i++) add("cone", (i - 1.5) * 0.16, 0.38, 0, 0.2, 0.4, 0.2, i % 2 ? "#b76c37" : "#d79b46");
      box(0, H * 0.45, D * 0.5, W + 0.1, 0.1, 0.17, TRIM);
      return out;
    }
    if (kind === "cauldron") {
      cyl(0, 0.2, 0, 0.48, 0.6, METAL);
      cyl(0, 0.8, 0, 0.43, 0.05, "#80a17a");
      for (let i = 0; i < 3; i++) {
        const a = i * Math.PI * 2 / 3;
        box(Math.sin(a) * 0.35, 0, Math.cos(a) * 0.35, 0.12, 0.3, 0.12, METAL);
      }
      for (const x of [-0.5, 0.5]) ring(x, 0.6, 0, 0.25, 0.3, 0.06, METAL);
      return out;
    }
    if (kind === "waterPump") {
      cyl(0, 0, 0, 0.15, 1, METAL);
      box(0, 1, 0, 0.18, 0.2, 0.18, METAL);
      box(0.2, 1.15, 0, 0.6, 0.05, 0.06, METAL, 0.3);
      box(0, 0.75, 0.2, 0.08, 0.08, 0.4, METAL);
      box(0, 0, 0, 0.55, 0.1, 0.55, STONE);
      return out;
    }
  }
  if (["bathtub", "woodenTub", "washbasin", "toilet", "shower", "towelRack", "washstand"].includes(kind)) {
    if (kind === "bathtub" || kind === "woodenTub") {
      const color = kind === "woodenTub" ? WOOD : CREAM;
      box(0, 0, 0, W, 0.1, D, color);
      for (const x of [-W * 0.45, W * 0.45]) box(x, 0.1, 0, W * 0.1, H - 0.1, D, color);
      for (const z of [-D * 0.45, D * 0.45]) box(0, 0.1, z, W, H - 0.1, D * 0.1, color);
      box(0, 0.25, 0, W * 0.78, 0.025, D * 0.78, "#8fbdc2");
      if (kind === "woodenTub") for (const y of [0.1, 0.7]) {
        for (const x of [-W * 0.51, W * 0.51]) box(x, y, 0, 0.025, 0.045, D, METAL);
        for (const z of [-D * 0.51, D * 0.51]) box(0, y, z, W, 0.045, 0.025, METAL);
      }
      return out;
    }
    if (kind === "washbasin" || kind === "washstand") {
      if (kind === "washstand") append("sideTable", 0, 0, 0, 0, 1.4);
      else cyl(0, 0, 0, 0.12, 0.75, CREAM);
      cyl(0, 0.72, 0, 0.3, 0.12, CREAM);
      cyl(0, 0.85, 0, 0.23, 0.015, "#789b9f");
      cyl(0, 0.84, -0.18, 0.025, 0.2, METAL);
      return out;
    }
    if (kind === "toilet") {
      cyl(0, 0, 0.08, 0.2, 0.38, CREAM);
      cyl(0, 0.38, 0.12, 0.25, 0.12, CREAM);
      box(0, 0.2, -0.23, 0.45, 0.6, 0.22, CREAM);
      ring(0, 0.51, 0.12, 0.48, 0.1, 0.55, "#c5d0c7");
      return out;
    }
    if (kind === "shower") {
      box(0, 0, 0, 1, 0.09, 1, STONE);
      cyl(0, 0.1, -0.4, 0.025, 2.05, METAL);
      box(0, 2.12, -0.2, 0.04, 0.04, 0.45, METAL);
      cyl(0, 2.08, 0, 0.16, 0.04, METAL);
      box(0, 1, -0.4, 0.2, 0.08, 0.08, METAL);
      return out;
    }
    if (kind === "towelRack") {
      for (const x of [-0.4, 0.4]) box(x, 0, 0, 0.035, 1.2, 0.035, METAL);
      for (const y of [0.45, 1.1]) box(0, y, 0, 0.85, 0.035, 0.035, METAL);
      box(0, 0.45, 0.05, 0.65, 0.55, 0.05, CLOTH);
      return out;
    }
  }
  if (["floorLamp", "tableLamp", "chandelier", "wallSconce", "candelabra", "streetLamp", "paperLantern", "brazier"].includes(kind)) {
    if (kind === "chandelier") {
      cyl(0, 0.45, 0, 0.045, 0.6, METAL);
      for (let i = 0; i < 6; i++) {
        const a = i * Math.PI / 3, x = Math.sin(a) * 0.55, z = Math.cos(a) * 0.55;
        box(x / 2, 0.4, z / 2, 0.055, 0.04, 0.65, TRIM, a);
        cyl(x, 0.35, z, 0.09, 0.08, TRIM);
        cyl(x, 0.43, z, 0.045, 0.3, CREAM);
        add("cone", x, 0.79, z, 0.07, 0.13, 0.07, "#e6ba65");
      }
      return out;
    }
    if (kind === "wallSconce" || kind === "candelabra") {
      if (kind === "wallSconce") box(0, 0, -0.12, 0.16, 0.55, 0.06, METAL);
      else cyl(0, 0, 0, 0.14, 0.06, TRIM);
      cyl(0, 0.05, 0, 0.025, 0.5, TRIM);
      for (const x of [-0.23, 0, 0.23]) {
        box(x / 2, 0.35, 0, 0.26, 0.035, 0.035, TRIM);
        cyl(x, 0.37, 0, 0.04, 0.25, CREAM);
        add("cone", x, 0.7, 0, 0.06, 0.1, 0.06, "#edc779");
      }
      return out;
    }
    if (kind === "brazier") {
      for (let i = 0; i < 3; i++) {
        const a = i * Math.PI * 2 / 3;
        box(Math.sin(a) * 0.25, 0, Math.cos(a) * 0.25, 0.08, 0.85, 0.08, METAL);
      }
      cyl(0, 0.7, 0, 0.35, 0.15, METAL);
      for (let i = 0; i < 5; i++) add("cone", Math.sin(i) * 0.15, 1, Math.cos(i) * 0.15, 0.15, 0.4, 0.15, "#d5934e");
      return out;
    }
    const poleH = kind === "tableLamp" ? 0.35 : kind === "streetLamp" ? 3.2 : kind === "paperLantern" ? 0.8 : 1.5;
    cyl(0, 0, 0, W * 0.4, 0.06, METAL);
    cyl(0, 0.06, 0, 0.03, poleH, METAL);
    if (kind === "paperLantern") {
      box(0, poleH, 0, 0.45, 0.5, 0.45, CREAM);
      for (const x of [-0.24, 0.24]) for (const z of [-0.24, 0.24]) box(x, poleH, z, 0.025, 0.55, 0.025, DARK);
    } else {
      add("cone", 0, poleH + 0.2, 0, W, 0.4, W, kind === "streetLamp" ? METAL : CREAM);
      cyl(0, poleH, 0, 0.1, 0.12, "#f2d595");
    }
    return out;
  }
  if (["rug", "curtains", "wallMirror", "painting", "grandClock", "vase", "flowerVase", "indoorPlant", "books", "tableware", "fruitBowl", "globe", "piano", "harp", "drums", "anvil", "forge", "loom", "spinningWheel", "armorStand"].includes(kind)) {
    if (kind === "rug") {
      box(0, 0, 0, W, 0.02, D, "#617d7a");
      for (const x of [-W * 0.45, W * 0.45]) box(x, 0.022, 0, 0.06, 0.01, D * 0.95, TRIM);
      for (const z of [-D * 0.44, D * 0.44]) box(0, 0.022, z, W * 0.92, 0.01, 0.06, TRIM);
      for (let i = 0; i < 5; i++) box((i - 2) * 0.35, 0.023, 0, 0.2, 0.01, 0.7, CREAM, Math.PI / 4);
      return out;
    }
    if (kind === "curtains") {
      box(0, H - 0.08, 0, W + 0.2, 0.05, 0.05, TRIM);
      for (const x of [-W * 0.36, W * 0.36]) {
        for (let i = 0; i < 5; i++) box(x + (i - 2) * 0.055, 0.15, 0.025 * Math.sin(i), 0.07, H - 0.25, 0.07, CLOTH);
        box(x, 0.9, 0.07, 0.36, 0.06, 0.035, TRIM);
      }
      return out;
    }
    if (kind === "wallMirror" || kind === "painting") {
      box(0, 0, 0, W, H, 0.07, TRIM);
      box(0, 0.06, 0.045, W - 0.12, H - 0.12, 0.025, kind === "wallMirror" ? "#9db7b8" : "#6c909b");
      if (kind === "painting") {
        add("cone", -0.25, 0.28, 0.07, 0.6, 0.42, 0.02, "#50685a");
        add("cone", 0.22, 0.23, 0.075, 0.8, 0.35, 0.02, "#648477");
        ball(0.35, 0.67, 0.08, 0.08, "#e7d5a0");
      }
      return out;
    }
    if (kind === "grandClock") {
      box(0, 0, 0, 0.65, 0.2, 0.4, DARK);
      box(0, 0.2, 0, 0.5, 1.65, 0.3, WOOD);
      box(0, 1.55, 0, 0.65, 0.6, 0.4);
      cyl(0, 0.25, 0, 0.06, 1.3, TRIM);
      ball(0, 0.65, 0.2, 0.13, TRIM);
      ball(0, 1.85, 0.23, 0.23, CREAM);
      box(0, 1.75, 0.46, 0.025, 0.18, 0.025, DARK);
      box(0.07, 1.84, 0.46, 0.15, 0.025, 0.025, DARK);
      return out;
    }
    if (kind === "vase" || kind === "flowerVase" || kind === "indoorPlant") {
      cyl(0, 0, 0, kind === "indoorPlant" ? 0.25 : 0.17, 0.35, "#a9876b");
      cyl(0, 0.3, 0, 0.12, 0.2, "#bdab85");
      if (kind === "vase") cyl(0, 0.5, 0, 0.09, 0.45, "#bbcfbf");
      else for (let i = 0; i < 7; i++) {
        const a = i * 2.4, x = Math.sin(a) * 0.25, z = Math.cos(a) * 0.25;
        cyl(x, 0.4, z, 0.013, 0.45 + i % 3 * 0.12, LEAF);
        add(kind === "indoorPlant" ? "rock" : "sphere", x, 0.9 + i % 3 * 0.15, z, kind === "indoorPlant" ? 0.55 : 0.12, 0.12, 0.25, kind === "indoorPlant" ? LEAF : ["#bd83a1", "#cfbf76", "#b2c8b0"][i % 3], a);
      }
      return out;
    }
    if (kind === "books") {
      for (let i = 0; i < 4; i++) box(-0.13, 0.04 + i * 0.06, 0, 0.28, 0.05, 0.4, ["#8b6f65", "#5a7a7c", "#b8a576"][i % 3], i * 0.06);
      box(0.23, 0.02, 0, 0.34, 0.025, 0.35, CREAM);
      box(0.23, 0.015, 0, 0.37, 0.015, 0.37, DARK);
      return out;
    }
    if (kind === "tableware" || kind === "fruitBowl") {
      cyl(0, 0, 0, 0.22, 0.04, CREAM);
      if (kind === "tableware") {
        cyl(0.3, 0, 0.1, 0.07, 0.16, CREAM);
        box(-0.3, 0, 0, 0.02, 0.015, 0.3, METAL);
        box(-0.35, 0, 0, 0.02, 0.015, 0.3, METAL);
      } else for (let i = 0; i < 5; i++) ball(Math.sin(i) * 0.1, 0.11 + Math.floor(i / 3) * 0.1, Math.cos(i) * 0.1, 0.09, ["#ab5d45", "#c7ab57", "#719255"][i % 3]);
      return out;
    }
    if (kind === "globe") {
      legs(0.4, 0.4, 0.55, TRIM);
      box(0, 0.55, 0, 0.55, 0.05, 0.55);
      ball(0, 0.93, 0, 0.28, "#6b8e92");
      ring(0, 0.93, 0, 0.68, 0.68, 0.04, TRIM);
      return out;
    }
    if (kind === "piano") {
      box(0, 0, 0, 1.6, 1.25, 0.5, DARK);
      box(0, 0.7, 0.36, 1.65, 0.08, 0.28);
      for (let i = 0; i < 22; i++) {
        box((i - 10.5) * 0.067, 0.79, 0.39, 0.06, 0.025, 0.2, CREAM);
        if (i % 3) box((i - 10.5) * 0.067, 0.82, 0.32, 0.03, 0.025, 0.1, DARK);
      }
      for (const x of [-0.6, 0.6]) box(x, 0, 0.4, 0.07, 0.72, 0.07);
      return out;
    }
    if (kind === "harp") {
      box(0, 0, 0, 1, 0.15, 0.5, TRIM);
      box(-0.4, 0.1, 0, 0.12, 1.6, 0.13);
      box(0.4, 0.1, 0, 0.12, 1.2, 0.13);
      box(0, 1.35, 0, 0.9, 0.15, 0.15, TRIM);
      for (let i = 0; i < 12; i++) box((i - 5.5) * 0.055, 0.2, 0, 8e-3, 1.2, 8e-3, CREAM);
      return out;
    }
    if (kind === "drums") {
      for (const [x, z, r, y] of [[0, 0, 0.4, 0.5], [-0.6, 0.2, 0.23, 0.7], [0.6, 0.2, 0.25, 0.7], [-0.4, -0.4, 0.2, 0.95], [0.4, -0.4, 0.2, 0.95]]) {
        cyl(x, 0.1, z, r, y, "#8e6654");
        cyl(x, 0.1 + y, z, r, 0.025, CREAM);
        for (const dx of [-r * 0.7, r * 0.7]) box(x + dx, 0, z, 0.025, 0.3, 0.025, METAL);
      }
      return out;
    }
    if (kind === "anvil") {
      box(0, 0, 0, 0.6, 0.35, 0.4, DARK);
      box(0, 0.35, 0, 0.4, 0.2, 0.3, METAL);
      box(0, 0.55, 0, 0.8, 0.15, 0.38, METAL);
      add("cone", 0.48, 0.62, 0, 0.25, 0.2, 0.3, METAL);
      return out;
    }
    if (kind === "forge") {
      append("fireplace", -0.4, 0, 0, 0, 0.7);
      append("anvil", 0.75, 0, 0.2, 0, 0.85);
      box(0.5, 0.25, -0.2, 0.8, 0.35, 0.5, DARK);
      for (let i = 0; i < 4; i++) box(0.5, 0.3 + i * 0.06, -0.2, 0.85, 0.025, 0.55, TRIM);
      return out;
    }
    if (kind === "loom") {
      for (const x of [-0.75, 0.75]) box(x, 0, 0, 0.1, 1.65, 0.1);
      for (const y of [0.2, 1.6]) box(0, y, 0, 1.6, 0.09, 0.1);
      for (let i = 0; i < 18; i++) box((i - 8.5) * 0.07, 0.25, 0, 0.012, 1.3, 0.012, CREAM);
      box(0, 0.3, 0.2, 1.3, 0.7, 0.03, CLOTH);
      for (const x of [-0.65, 0.65]) box(x, 0, 0.5, 0.09, 0.8, 0.09);
      return out;
    }
    if (kind === "spinningWheel") {
      legs(0.7, 0.4, 0.4);
      ring(0.15, 0.75, 0, 0.9, 0.9, 0.08, WOOD);
      box(0.15, 0.75, 0, 0.025, 0.85, 0.025, TRIM);
      box(0.15, 0.75, 0, 0.85, 0.025, 0.025, TRIM);
      box(-0.4, 0.4, 0, 0.08, 0.7, 0.08);
      return out;
    }
    if (kind === "armorStand") {
      box(0, 0, 0, 0.7, 0.08, 0.5);
      box(0, 0.08, 0, 0.06, 1.5, 0.06, DARK);
      box(0, 0.8, 0, 0.5, 0.6, 0.3, METAL);
      add("cone", 0, 0.65, 0, 0.55, 0.3, 0.35, METAL);
      ball(0, 1.6, 0, 0.18, METAL);
      for (const x of [-0.32, 0.32]) ball(x, 1.3, 0, 0.16, METAL);
      return out;
    }
  }
  if (item.category === "nature") {
    if (kind === "fallenLog") {
      for (let i = 0; i < 8; i++) {
        const a = i * Math.PI / 4;
        box(0, 0.7 + Math.sin(a) * 0.5, Math.cos(a) * 0.5, 4.5, 0.16, 0.18, WOOD);
      }
      for (const x of [-1.5, 1.5]) box(x, 0.9, 0, 0.18, 0.9, 0.2);
      return out;
    }
    if (kind === "treeStump") {
      cyl(0, 0, 0, 0.85, 1.05);
      for (const r of [0.3, 0.5, 0.7]) ring(0, 1.06, 0, r * 2, 0.05, r * 2, TRIM);
      return out;
    }
    const pine = ["pine", "cypress"].includes(kind), palm = kind === "palm", bamboo = kind === "bamboo", dead = kind === "deadTree", leafColor = kind === "maple" ? "#b7674f" : kind === "ginkgo" ? "#d7ba54" : kind === "cherry" ? "#dca3b9" : LEAF;
    if (bamboo) {
      for (let i = 0; i < 9; i++) {
        const a = i * 2.4, x = Math.sin(a) * 1.3, z = Math.cos(a) * 1.3, height = 5 + i % 3 * 0.65;
        cyl(x, 0, z, 0.08, height, "#7c9360");
        for (let j = 1; j < 6; j++) cyl(x, j * 0.8, z, 0.095, 0.045, "#acb079");
        for (let j = 0; j < 3; j++) add("rock", x + 0.4 * Math.sin(j + a), height - 0.6 + j * 0.2, z + 0.4 * Math.cos(j + a), 1, 0.12, 0.5, leafColor, a + j);
      }
      return out;
    }
    const trunk = kind === "baobab" ? 1.25 : kind === "birch" ? 0.22 : 0.4;
    cyl(0, 0, 0, trunk, H * 0.6, kind === "birch" ? "#c9d0c3" : WOOD);
    for (let i = 0; i < 5; i++) {
      const a = i * Math.PI * 2 / 5;
      box(Math.sin(a) * trunk, 0.1, Math.cos(a) * trunk, 0.25, 0.3, trunk * 2, WOOD, a);
    }
    if (pine) {
      for (let i = 0; i < 5; i++) add("cone", 0, H * 0.4 + i * H * 0.11, 0, W * (1 - i * 0.15), H * 0.3, D * (1 - i * 0.15), leafColor);
      return out;
    }
    if (kind === "mushroomTree") {
      cyl(0, 0, 0, 0.55, H * 0.7, "#d7c4a7");
      add("sphere", 0, H * 0.75, 0, W, H * 0.32, D, "#a67f93");
      for (let i = 0; i < 10; i++) {
        const a = i * 2.4;
        ball(Math.sin(a) * W * 0.32, H * 0.88, Math.cos(a) * D * 0.32, 0.22, "#d9d1b3");
      }
      return out;
    }
    const branches = palm ? 8 : 7;
    for (let i = 0; i < branches; i++) {
      const a = i * Math.PI * 2 / branches, x = Math.sin(a) * W * 0.23, z = Math.cos(a) * D * 0.23, y = H * 0.58 + i % 3 * H * 0.07;
      box(x / 2, y * 0.65, z / 2, trunk * 0.4, y * 0.45, 0.15, WOOD, a);
      if (!dead) {
        add(palm ? "rock" : "sphere", x, y, z, palm ? W * 0.55 : W * 0.48, H * (palm ? 0.08 : 0.25), D * 0.4, leafColor, a);
        if (kind === "willow") for (let j = 0; j < 3; j++) box(x + Math.sin(j + a) * 0.5, y - H * 0.3, z + Math.cos(j + a) * 0.5, 0.08, H * 0.4, 0.08, leafColor);
        if (kind === "orchardTree") for (let j = 0; j < 3; j++) ball(x + Math.sin(j) * 0.5, y - H * 0.1, z + Math.cos(j) * 0.4, 0.18, "#bd6d4b");
      }
    }
    return out;
  }
  if (item.category === "roomSets") {
    if (kind === "setDining" || kind === "setBanquet") {
      const banquet = kind === "setBanquet";
      append(banquet ? "banquetTable" : "diningTable", 0, 0, 0);
      const xs = banquet ? [-1.7, -0.6, 0.6, 1.7] : [-0.8, 0, 0.8];
      for (const z of [-1.25, 1.25]) for (const x of xs) append("diningChair", x, 0, z, z < 0 ? 0 : Math.PI);
      append("cupboard", -2, 0, -1.7);
      append("candelabra", 0, 0.85, 0);
      return out;
    }
    if (kind === "setLiving" || kind === "setGrandLiving") {
      append(kind === "setLiving" ? "sofa" : "cornerSofa", 0, 0, -1.8);
      append("coffeeTable", 0, 0, 0);
      append("armchair", -2, 0, 0.2, -Math.PI / 2);
      append("armchair", 2, 0, 0.2, Math.PI / 2);
      append("rug", 0, 0, 0.3);
      append("floorLamp", 2, 0, -1.8);
      append("books", 0, 0.46, 0);
      return out;
    }
    if (kind === "setStudy") {
      append("writingDesk", 0, 0, -0.8);
      append("officeChair", 0, 0, 0.3, Math.PI);
      append("bookcase", -1.7, 0, -1.5);
      append("globe", 1.5, 0, -1.3);
      append("books", -0.35, 0.83, -0.8);
      append("tableLamp", 0.5, 0.83, -0.8);
      return out;
    }
    if (["setBedroom", "setCanopyBedroom", "setDorm"].includes(kind)) {
      const bunk = kind === "setDorm";
      append(bunk ? "bunkBed" : kind === "setCanopyBedroom" ? "canopyBed" : "doubleBed", 0, 0, 0);
      if (bunk) append("bunkBed", 2, 0, 0);
      for (const x of [-1.5, 1.5]) {
        append("nightstand", x, 0, -0.8);
        append("tableLamp", x, 0.65, -0.8);
      }
      append("wardrobe", -1.7, 0, 1.7);
      append("rug", 0, 0, 1.9);
      return out;
    }
    if (kind === "setKitchen") {
      append("sink", -1.5, 0, -1.6);
      append("stove", 0, 0, -1.6);
      append("fridge", 1.45, 0, -1.6);
      append("cupboard", 2, 0, 0.2, Math.PI / 2);
      append("kitchenIsland", 0, 0, 0.8);
      append("hangingPots", 0, 1.9, 0.8);
      return out;
    }
    if (kind === "setBathroom") {
      append("bathtub", -1.3, 0, 0);
      append("washbasin", 0.2, 0, -1.1);
      append("toilet", 1.4, 0, -1.1);
      append("shower", 1.3, 0, 1);
      append("towelRack", 0, 0, 1.1);
      return out;
    }
    if (kind === "setTavern") {
      append("counter", 0, 0, -0.6);
      append("wineRack", -1.8, 0, -1.8);
      append("cupboard", 1, 0, -1.8);
      for (const x of [-1, 0, 1]) append("barStool", x, 0, 0.7);
      append("roundTable", -2, 0, 1.5);
      return out;
    }
    if (kind === "setSmithy") {
      append("forge", -1.3, 0, -0.7);
      append("workbench", 1.3, 0, -1);
      append("weaponRack", 1.8, 0, 1);
      append("barrel", -1.8, 0, 1.2);
      return out;
    }
    if (kind === "setAlchemy") {
      append("potionShelf", -1.5, 0, -1.3);
      append("potionShelf", 0, 0, -1.3);
      append("cauldron", 1.5, 0, 0);
      append("writingDesk", -0.5, 0, 0.5);
      append("books", -0.5, 0.83, 0.5);
      return out;
    }
    if (kind === "setLibrary") {
      for (const x of [-2.6, 2.6]) for (const z of [-1.5, 0, 1.5]) append("bookcase", x, 0, z, x < 0 ? -Math.PI / 2 : Math.PI / 2);
      append("diningTable", 0, 0, 0);
      for (const x of [-0.7, 0.7]) for (const z of [-1.2, 1.2]) append("diningChair", x, 0, z, z < 0 ? 0 : Math.PI);
      return out;
    }
    if (kind === "setCamp") {
      append("brazier", 0, 0, 0);
      for (let i = 0; i < 3; i++) {
        const a = i * Math.PI * 2 / 3;
        append("bench", Math.sin(a) * 2, 0, Math.cos(a) * 2, a);
      }
      append("barrel", 2, 0, -1.5);
      append("crate", -2, 0, -1.5);
      return out;
    }
    if (kind === "setGarden") {
      append("roundTable", 0, 0, 0);
      for (let i = 0; i < 4; i++) {
        const a = i * Math.PI / 2;
        append("parkBench", Math.sin(a) * 1.8, 0, Math.cos(a) * 1.8, a);
      }
      append("flowerVase", 0, 0.8, 0);
      return out;
    }
  }
  if (item.category === "homes" || item.category === "buildings") {
    let wallLine2 = function(cx, cz, length, base2, alongX, door) {
      const openings = [];
      if (door) openings.push({ a: -0.95, b: 0.95, bottom: 0, top: 2.4 });
      if (length >= 7) for (const x of [-length * 0.29, length * 0.29]) openings.push({ a: x - 0.65, b: x + 0.65, bottom: 1, top: 2.35 });
      openings.sort((a, b) => a.a - b.a);
      const panel = (position, y, width, height, color = wallColor, thickness = 0.22) => {
        if (width <= 0 || height <= 0) return;
        if (alongX) box(cx + position, base2 + y, cz, width, height, thickness, color);
        else box(cx, base2 + y, cz + position, thickness, height, width, color);
      };
      let from = -length / 2;
      for (const gap of openings) {
        panel((from + gap.a) / 2, 0, gap.a - from, 3.2);
        panel((gap.a + gap.b) / 2, 0, gap.b - gap.a, gap.bottom);
        panel((gap.a + gap.b) / 2, gap.top, gap.b - gap.a, 3.2 - gap.top);
        for (const edge of [gap.a, gap.b]) panel(edge, gap.bottom, 0.065, gap.top - gap.bottom, WOOD, 0.3);
        panel((gap.a + gap.b) / 2, gap.top, gap.b - gap.a + 0.13, 0.075, TRIM, 0.32);
        if (gap.bottom) {
          panel((gap.a + gap.b) / 2, gap.bottom - 0.06, gap.b - gap.a + 0.15, 0.07, TRIM, 0.38);
          panel((gap.a + gap.b) / 2, gap.bottom, 0.045, gap.top - gap.bottom, WOOD, 0.26);
        }
        from = gap.b;
      }
      panel((from + length / 2) / 2, 0, length / 2 - from, 3.2);
    }, shell2 = function(cx, cz, w, d, count, base2 = 0, roof = "gable") {
      const stairRun = Math.min(6.12, d - 2.2), stride = stairRun / 18, landingStart = -d / 2 + 1.1 + stairRun;
      box(cx, base2, cz, w + 0.3, 0.16, d + 0.3, STONE);
      for (let s = 0; s < count; s++) {
        const y = base2 + 0.16 + s * 3.2;
        if (s === 0) box(cx, y, cz, w, 0.12, d, "#8a7358");
        else {
          box(cx - 1.1, y, cz, w - 2.2, 0.12, d, "#8a7358");
          const stripX = cx + w / 2 - 1.1, frontLength = d / 2 - landingStart;
          box(stripX, y, cz + d / 2 - frontLength / 2, 2.2, 0.12, frontLength, "#8a7358");
          box(stripX, y, cz - d / 2 + 0.55, 2.2, 0.12, 1.1, "#8a7358");
        }
        wallLine2(cx, cz + d / 2, w, y, true, s === 0);
        wallLine2(cx, cz - d / 2, w, y, true, false);
        wallLine2(cx - w / 2, cz, d, y, false, false);
        wallLine2(cx + w / 2, cz, d, y, false, false);
        for (const x of [-w / 2, w / 2]) for (const z of [-d / 2, d / 2]) box(cx + x, y, cz + z, 0.18, 3.2, 0.18, WOOD);
        for (const z of [-d / 2, d / 2]) box(cx, y + 3.04, cz + z, w + 0.3, 0.16, 0.32, WOOD);
        for (const x of [-w / 2, w / 2]) box(cx + x, y + 3.04, cz, 0.32, 0.16, d + 0.3, WOOD);
        if (s < count - 1) for (let j = 0; j < 18; j++) {
          const x = cx + w / 2 - 1.1, z = cz - d / 2 + 1.1 + (j + 0.5) * stride;
          const stepTop = y + 0.12 + (j + 1) * 3.2 / 18;
          box(x, stepTop - 0.14, z, 1.35, 0.14, stride + 0.025, WOOD);
          out[out.length - 1].stair = true;
          if (j % 4 === 0 && j < 14) box(x - 0.68, y + (j + 1) * 3.2 / 18, z, 0.05, 0.8, 0.05, TRIM);
        }
      }
      const roofY = base2 + 0.28 + count * 3.2;
      if (roof === "flat") {
        box(cx, roofY, cz, w + 0.4, 0.16, d + 0.4, STONE);
        for (const z of [-d / 2, d / 2]) box(cx, roofY + 0.16, cz + z, w, 0.65, 0.2, wallColor);
        for (const x of [-w / 2, w / 2]) box(cx + x, roofY + 0.16, cz, 0.2, 0.65, d, wallColor);
      } else {
        const roofH = kind === "snowCabin" ? 2.2 : 1.65;
        add("wedge", cx, roofY + roofH / 2, cz - d / 4, w + 0.7, roofH, d / 2, "#586b67");
        add("wedge", cx, roofY + roofH / 2, cz + d / 4, w + 0.7, roofH, d / 2, "#586b67", Math.PI);
        box(cx, roofY + roofH, cz, w + 0.8, 0.12, 0.14, TRIM);
      }
      for (let i = 0; i < 3; i++) box(cx, base2 + i * 0.055, cz + d / 2 + 0.25 + i * 0.2, 2.4 - i * 0.2, 0.055, 0.65, STONE);
    };
    var wallLine = wallLine2, shell = shell2;
    const two = ["villa", "manor", "townhouse", "terraceHouse", "gardenVilla", "lakeVilla", "mountainLodge", "inn", "libraryHall"].includes(kind), tower = ["lighthouse", "watchtower", "keep"].includes(kind), stories = tower ? kind === "lighthouse" ? 5 : kind === "keep" ? 3 : 3 : two ? 2 : 1, wallColor = ["logCabin", "snowCabin", "mountainLodge", "bambooHouse"].includes(kind) ? "#86694c" : ["desertHouse", "temple", "cathedral", "chapel"].includes(kind) ? "#c1b49a" : "#b4b4a3";
    const base = ["fisherHouse", "bambooHouse"].includes(kind) ? 1.6 : 0;
    if (kind === "courtyardVilla" || kind === "gardenVilla") {
      shell2(-W * 0.34, 0, W * 0.3, D, 2, 0, "flat");
      shell2(W * 0.34, 0, W * 0.3, D, 2, 0, "flat");
      shell2(0, -D * 0.35, W * 0.4, D * 0.3, 1, 0, "flat");
      box(0, 0, 0, W * 0.35, 0.06, D * 0.5, STONE);
      append("fountain", 0, 0.06, -D * 0.08, 0, 0.45);
      for (const x of [-W * 0.2, W * 0.2]) for (const z of [-D * 0.2, D * 0.2]) append("indoorPlant", x, 0.05, z, 0, 1.2);
      return out;
    }
    if (kind === "manor") {
      shell2(0, -D * 0.1, W * 0.55, D * 0.8, 2);
      shell2(-W * 0.39, D * 0.07, W * 0.24, D * 0.6, 1);
      shell2(W * 0.39, D * 0.07, W * 0.24, D * 0.6, 1);
      append("setStudy", -3, 0.3, -2);
      append("setDining", 2, 0.3, 2, 0, 0.8);
      return out;
    }
    if (kind === "gatehouse") {
      shell2(-W * 0.34, 0, W * 0.3, D, 3, 0, "flat");
      shell2(W * 0.34, 0, W * 0.3, D, 3, 0, "flat");
      box(0, 6.6, 0, W * 0.4, 0.4, D);
      for (const z of [-D * 0.5, D * 0.5]) box(0, 7, z, W * 0.4, 2.4, 0.25, wallColor);
      for (let i = 0; i < 7; i++) box((i - 3) * 0.8, 9.4, D * 0.5, 0.5, 0.5, 0.4, STONE);
      return out;
    }
    if (kind === "cathedral") {
      shell2(0, -2, W * 0.65, D * 0.86, 3);
      for (const x of [-W * 0.43, W * 0.43]) shell2(x, D * 0.3, W * 0.22, D * 0.22, 4, 0, "flat");
      for (const x of [-4, 4]) for (const z of [-8, -3, 2]) append("pew", x, 0.3, z, 0, 1.1);
      append("altarTable", 0, 0.3, -D * 0.32, 0, 1.5);
      return out;
    }
    if (kind === "greenhouse") {
      box(0, 0, 0, W, 0.12, D, STONE);
      for (const x of [-W * 0.48, W * 0.48]) for (let i = 0; i < 7; i++) box(x, 0, -D * 0.42 + i * D * 0.14, 0.12, 3.5, 0.12, METAL);
      for (let i = 0; i < 7; i++) {
        const z = -D * 0.42 + i * D * 0.14;
        box(0, 3.5, z, W, 0.12, 0.12, METAL);
        for (const x of [-W * 0.3, W * 0.3]) {
          box(x, 0.15, z, W * 0.23, 0.25, D * 0.12, WOOD);
          for (let j = 0; j < 3; j++) append("indoorPlant", x + (j - 1) * 0.7, 0.4, z, 0, 0.65);
        }
      }
      return out;
    }
    if (kind === "blacksmith") {
      shell2(-2, 0, W * 0.65, D, 1);
      box(W * 0.28, 0, 0, W * 0.45, 0.28, D, STONE);
      for (const x of [W * 0.1, W * 0.48]) for (const z of [-D * 0.45, D * 0.45]) box(x, 0, z, 0.18, 3.4, 0.18, WOOD);
      box(W * 0.28, 3.4, 0, W * 0.45, 0.16, D, WOOD);
      for (const fixture of SMITHY_FIXTURES) append(fixture.kind, fixture.x, 0.28, fixture.z, 0, fixture.scale);
      return out;
    }
    shell2(0, 0, W * 0.92, D * 0.9, stories, base, kind === "desertHouse" || kind === "terraceHouse" || kind === "keep" || kind === "watchtower" || kind === "lighthouse" ? "flat" : "gable");
    if (base) {
      for (const x of [-W * 0.4, W * 0.4]) for (const z of [-D * 0.4, D * 0.4]) box(x, 0, z, 0.3, base, 0.3, WOOD);
      for (let i = 0; i < 10; i++) box(0, i * 0.16, D * 0.46 + 2 - i * 0.2, 1.6, 0.16, 0.24, WOOD);
    }
    const floorY = base + 0.3;
    if (["cottage", "logCabin", "farmhouse", "snowCabin", "fisherHouse", "desertHouse", "bambooHouse"].includes(kind)) {
      append("singleBed", -W * 0.3, floorY, -D * 0.23);
      append("roundTable", W * 0.2, floorY, 0, 0, 0.75);
      append("diningChair", W * 0.2, floorY, 1.15, Math.PI, 0.9);
      append("fireplace", 0, floorY, -D * 0.37, 0, 0.65);
      append("nightstand", -W * 0.15, floorY, -D * 0.28);
    }
    if (["villa", "townhouse", "terraceHouse", "lakeVilla", "mountainLodge"].includes(kind)) {
      append("setLiving", -W * 0.1, floorY, D * 0.17, 0, 0.75);
      append("setKitchen", -W * 0.18, floorY, -D * 0.22, 0, 0.62);
      append("setBedroom", -W * 0.1, floorY + 3.2, -D * 0.1, 0, 0.8);
      for (const x of [-W * 0.32, W * 0.32]) box(x, 3.36, D * 0.55, 0.12, 0.9, 0.12, WOOD);
      box(0, 3.32, D * 0.54, W * 0.7, 0.13, D * 0.2, WOOD);
      box(0, 4.2, D * 0.63, W * 0.7, 0.06, 0.07, WOOD);
    }
    if (kind === "tavern" || kind === "inn") {
      append("setTavern", -W * 0.2, floorY, -D * 0.16, 0, 0.85);
      for (const x of [-W * 0.27, W * 0.22]) for (const z of [D * 0.07, D * 0.3]) {
        append("roundTable", x, floorY, z, 0, 0.85);
        append("stool", x - 0.85, floorY, z);
        append("stool", x + 0.85, floorY, z);
      }
      if (kind === "inn") for (const x of [-W * 0.3, 0, W * 0.2]) append("singleBed", x, floorY + 3.2, -D * 0.2);
    }
    if (kind === "witchHut" || kind === "apothecary") append("setAlchemy", -W * 0.1, floorY, -D * 0.1, 0, 0.8);
    if (kind === "bakery") {
      append("oven", -W * 0.25, floorY, -D * 0.3);
      append("counter", 0, floorY, 0);
      append("workbench", W * 0.25, floorY, -D * 0.25);
      append("pantry", -W * 0.32, floorY, D * 0.15);
    }
    if (kind === "generalStore") {
      for (const x of [-W * 0.3, W * 0.3]) for (const z of [-D * 0.25, D * 0.1]) append("openShelf", x, floorY, z, x < 0 ? -Math.PI / 2 : Math.PI / 2);
      append("counter", 0, floorY, -D * 0.15);
    }
    if (kind === "libraryHall") append("setLibrary", -W * 0.1, floorY, -D * 0.1, 0, 1.2);
    if (kind === "guildHall") {
      append("banquetTable", 0, floorY, -D * 0.15);
      for (const x of [-W * 0.32, W * 0.32]) append("weaponRack", x, floorY, -D * 0.3);
      append("counter", -W * 0.25, floorY, D * 0.2);
      append("wallMirror", 0, 1.6, -D * 0.44, 0, 1.3);
    }
    if (kind === "chapel") {
      for (const x of [-W * 0.22, W * 0.22]) for (const z of [-D * 0.2, 0, D * 0.2]) append("pew", x, floorY, z);
      append("altarTable", 0, floorY, -D * 0.33, 0, 1.3);
    }
    if (kind === "temple") {
      for (const x of [-W * 0.42, W * 0.42]) for (let i = 0; i < 5; i++) {
        cyl(x, 0, (i - 2) * D * 0.18, 0.35, 4.5, STONE);
        cyl(x, 4.4, (i - 2) * D * 0.18, 0.5, 0.2, TRIM);
      }
      append("altarTable", 0, floorY, -D * 0.2, 0, 2);
    }
    if (kind === "bathhouse") {
      append("woodenTub", -W * 0.2, floorY, -D * 0.1, 0, 2.5);
      append("woodenTub", W * 0.2, floorY, -D * 0.1, 0, 2.5);
      for (const x of [-W * 0.3, W * 0.3]) append("bench", x, floorY, D * 0.28);
    }
    if (kind === "stable") {
      for (const x of [-W * 0.3, W * 0.3]) for (const z of [-D * 0.25, 0, D * 0.25]) {
        box(x, 0.3, z, 3, 0.8, 0.12, WOOD);
        box(x, 0.3, z + 1, 3, 0.8, 0.12, WOOD);
        box(x, 0.3, z + 0.5, 2, 0.6, 0.8, "#b5a268");
      }
    }
    if (kind === "warehouse") for (const x of [-W * 0.3, W * 0.3]) for (const z of [-D * 0.25, D * 0.18]) append("crateStack", x, floorY, z);
    if (kind === "marketHall") for (const x of [-W * 0.3, W * 0.3]) for (const z of [-D * 0.2, D * 0.2]) append("marketStall", x, floorY, z, x < 0 ? -Math.PI / 2 : Math.PI / 2, 0.8);
    if (kind === "windmill") {
      const y = H * 0.7, z = D * 0.48;
      for (let i = 0; i < 4; i++) {
        const a = i * Math.PI / 2;
        box(Math.sin(a) * 3, y + Math.cos(a) * 3, z, i % 2 ? 4 : 0.4, i % 2 ? 0.4 : 4, 0.15, WOOD);
        for (let j = 0; j < 5; j++) box(Math.sin(a) * (1.5 + j * 0.5), y + Math.cos(a) * (1.5 + j * 0.5), z + 0.08, 1.4, 0.12, 0.08, CREAM);
      }
      ball(0, y, z + 0.15, 0.3, TRIM);
    }
    if (kind === "watermill") {
      const x = W * 0.48;
      ring(x, 2.3, 0, 4.6, 4.6, 0.25, WOOD, Math.PI / 2);
      for (let i = 0; i < 14; i++) {
        const a = i * Math.PI / 7;
        box(x, 2.3 + Math.sin(a) * 2, Math.cos(a) * 2, 0.8, 0.3, 0.3, WOOD);
        box(x, 2.3, 0, 0.12, 4, 0.12, TRIM, a);
      }
    }
    if (kind === "lighthouse") {
      const y = stories * 3.2 + 0.6;
      for (let i = 0; i < 8; i++) {
        const a = i * Math.PI / 4;
        box(Math.sin(a) * W * 0.3, y, Math.cos(a) * D * 0.3, 0.1, 1.8, 0.1, METAL);
      }
      ball(0, y + 0.9, 0, 0.75, "#f6d98f");
      add("cone", 0, y + 2, 0, W * 0.8, 1.6, D * 0.8, METAL);
    }
    if (kind === "keep" || kind === "watchtower") for (const x of [-W * 0.4, W * 0.4]) for (let i = 0; i < 7; i++) box(x, stories * 3.2 + 0.5, (i - 3) * D * 0.12, 0.5, 0.8, 0.7, STONE);
    if (["farmhouse", "mountainLodge", "lakeVilla"].includes(kind)) {
      box(0, base + 0.05, D * 0.52, W * 0.8, 0.15, 2.8, WOOD);
      for (const x of [-W * 0.38, W * 0.38]) box(x, base, D * 0.61, 0.16, 3.3, 0.16, WOOD);
      box(0, base + 3.2, D * 0.52, W * 0.83, 0.1, 2.9, WOOD);
    }
    return out;
  }
  if (item.category === "architecture") {
    const posts = (xs, zs, h, color = WOOD) => {
      for (const x of xs) for (const z of zs) box(x, 0, z, 0.18, h, 0.18, color);
    };
    if (["stoneStairs", "woodStairs", "spiralStairs"].includes(kind)) {
      if (kind === "spiralStairs") {
        for (let i = 0; i < 40; i++) {
          const side = Math.floor(i / 10) % 4, t = i % 10 / 10, x = side === 0 ? -1.8 + 3.6 * t : side === 1 ? 1.8 : side === 2 ? 1.8 - 3.6 * t : -1.8, z = side === 0 ? -1.8 : side === 1 ? -1.8 + 3.6 * t : side === 2 ? 1.8 : 1.8 - 3.6 * t;
          box(x, (i + 1) * 0.15 - 0.12, z, side % 2 ? 1.35 : 0.38, 0.12, side % 2 ? 0.38 : 1.35, STONE);
          out[out.length - 1].stair = true;
        }
        return out;
      }
      const stairCount = Math.ceil(H / 0.2);
      for (let i = 0; i < stairCount; i++) {
        const z = -D / 2 + (i + 0.5) * D / stairCount;
        box(0, 0, z, W, (i + 1) * H / stairCount, D / stairCount + 0.02, kind === "woodStairs" ? WOOD : STONE);
        if (i % 3 === 0 && kind === "woodStairs") for (const x of [-W * 0.48, W * 0.48]) box(x, (i + 1) * H / stairCount, z, 0.06, 0.8, 0.06, TRIM);
      }
      return out;
    }
    if (["stoneBridge", "woodBridge", "suspensionBridge", "dock"].includes(kind)) {
      const stone = kind === "stoneBridge";
      for (let i = 0; i < 24; i++) {
        const z = -D / 2 + (i + 0.5) * D / 24, y = kind === "stoneBridge" ? 1 + Math.sin(i / 23 * Math.PI) * 1.4 : kind === "suspensionBridge" ? 0.8 - Math.sin(i / 23 * Math.PI) * 0.45 : 0.3;
        box(0, y, z, W, 0.14, D / 24 + 0.02, stone ? STONE : WOOD);
        if (i % 4 === 0 || i === 23) for (const x of [-W * 0.48, W * 0.48]) box(x, y, z, 0.09, 0.9, 0.09, stone ? STONE : WOOD);
        for (const x of [-W * 0.48, W * 0.48]) box(x, y + 0.85, z, 0.055, 0.07, D / 24 + 0.04, kind === "suspensionBridge" ? TRIM : WOOD);
      }
      if (stone) for (const z of [-D * 0.35, 0, D * 0.35]) for (const x of [-W * 0.36, W * 0.36]) box(x, 0, z, 0.8, 1.3, 1, STONE);
      return out;
    }
    if (["pavilion", "gazebo", "pergola", "gardenArch"].includes(kind)) {
      if (kind === "gardenArch") {
        for (const x of [-W * 0.43, W * 0.43]) box(x, 0, 0, 0.18, H, 0.3, WOOD);
        box(0, H - 0.25, 0, W, 0.25, D * 0.7, WOOD);
        for (let i = 0; i < 7; i++) add("rock", (i - 3) * W / 7, H, 0.1, 0.6, 0.3, 0.7, i % 2 ? "#be94a6" : LEAF);
        return out;
      }
      posts([-W * 0.43, W * 0.43], [-D * 0.43, D * 0.43], 3);
      if (kind === "pergola") {
        for (let i = 0; i < 9; i++) {
          const z = (i - 4) * D / 9;
          box(0, 3, z, W + 0.5, 0.12, 0.16, WOOD);
          add("rock", Math.sin(i) * W * 0.25, 3.1, z, 1, 0.12, 0.5, LEAF);
        }
        for (const x of [-W * 0.43, W * 0.43]) box(x, 2.8, 0, 0.15, 0.2, D, WOOD);
      } else {
        box(0, 0, 0, W, 0.15, D, STONE);
        add("cone", 0, 3.7, 0, W + 1, 1.5, D + 1, "#627b78");
        for (const z of [-D * 0.35, D * 0.35]) append("bench", 0, 0.15, z, z < 0 ? 0 : Math.PI, 1.2);
      }
      return out;
    }
    if (["cityWall", "cityCorner", "towerRound", "portcullis", "aqueduct"].includes(kind)) {
      if (kind === "aqueduct") {
        for (let i = 0; i < 4; i++) {
          const x = (i - 1.5) * W / 4;
          box(x, 0, 0, 0.9, H, 0.9, STONE);
        }
        box(0, H - 0.8, 0, W, 0.8, D, STONE);
        for (const z of [-D * 0.43, D * 0.43]) box(0, H, z, W, 0.7, 0.3, STONE);
        return out;
      }
      if (kind === "portcullis") {
        for (const x of [-W * 0.43, W * 0.43]) box(x, 0, 0, W * 0.14, H, D, STONE);
        box(0, H - 1.3, 0, W, 1.3, D, STONE);
        for (let i = 0; i < 12; i++) box((i - 5.5) * W * 0.055, H - 1.8, 0, 0.045, 2, 0.06, METAL);
        return out;
      }
      box(0, 0, 0, W, H - 0.8, D, STONE);
      for (let i = 0; i < Math.ceil(W); i++) for (const z of [-D * 0.46, D * 0.46]) box(-W / 2 + (i + 0.5) * W / Math.ceil(W), H - 0.8, z, 0.5, 0.8, 0.5, STONE);
      if (kind === "cityCorner") box(W * 0.3, 0, -D * 0.3, W * 0.4, H - 0.8, D, STONE);
      if (kind === "towerRound") {
        cyl(0, 0, 0, W * 0.43, H - 0.8, STONE);
        for (let i = 0; i < 12; i++) {
          const a = i * Math.PI / 6;
          box(Math.sin(a) * W * 0.43, H - 0.8, Math.cos(a) * D * 0.43, 0.6, 0.8, 0.6, STONE);
        }
      }
      return out;
    }
    if (kind === "fountain") {
      cyl(0, 0, 0, 2.8, 0.3, STONE);
      cyl(0, 0.3, 0, 2.5, 0.1, "#7fa7ab");
      for (const [y, r] of [[0.5, 1.7], [1.7, 1], [2.8, 0.5]]) {
        cyl(0, y, 0, 0.2, 1, STONE);
        cyl(0, y + 0.7, 0, r, 0.18, CREAM);
      }
      ball(0, 3.7, 0, 0.25, TRIM);
      return out;
    }
    if (kind === "well") {
      cyl(0, 0, 0, 1, 0.9, STONE);
      cyl(0, 0.88, 0, 0.8, 0.03, "#52737b");
      posts([-1.1, 1.1], [0], 2.5);
      box(0, 1.9, 0, 2.4, 0.1, 0.1, WOOD);
      box(0, 2.6, 0, 3, 0.1, 2.4, WOOD);
      box(0, 0.5, 0, 0.015, 1.4, 0.015, TRIM);
      return out;
    }
    if (kind === "statuePlaza") {
      box(0, 0, 0, W, 0.12, D, STONE);
      for (let i = 0; i < 3; i++) box(0, 0.12 + i * 0.22, 0, 3 - i * 0.5, 0.22, 3 - i * 0.5, STONE);
      box(0, 0.8, 0, 1, 2, 0.8, STONE);
      ball(0, 3.1, 0, 0.5, STONE);
      add("cone", 0, 1.5, 0, 1.9, 1.5, 1.5, STONE);
      for (const x of [-W * 0.35, W * 0.35]) append("parkBench", x, 0.12, 0, x < 0 ? -Math.PI / 2 : Math.PI / 2);
      return out;
    }
    if (kind === "marketStall") {
      posts([-1.7, 1.7], [-1.2, 1.2], 2.8);
      box(0, 0.9, 0, 3.5, 0.12, 2);
      box(0, 0, 0.9, 3.5, 0.9, 0.15, WOOD);
      for (let i = 0; i < 9; i++) box((i - 4) * 0.45, 2.8, 0, 0.45, 0.09, 3, i % 2 ? "#b4a177" : "#657e77");
      for (let i = 0; i < 5; i++) {
        append(i % 2 ? "fruitBowl" : "tableware", (i - 2) * 0.55, 1.03, 0, 0, 0.7);
      }
      return out;
    }
    if (kind === "cart" || kind === "carriage") {
      const carriage = kind === "carriage";
      box(0, 0.55, 0, W * 0.85, 0.12, D * 0.8, WOOD);
      for (const x of [-W * 0.43, W * 0.43]) box(x, 0.67, 0, 0.1, 0.7, D * 0.8, WOOD);
      for (const z of [-D * 0.38, D * 0.38]) box(0, 0.67, z, W, 0.7, 0.1, WOOD);
      for (const x of [-W * 0.55, W * 0.55]) for (const z of carriage ? [-D * 0.28, D * 0.28] : [0]) {
        ring(x, 0.5, z, 0.9, 0.9, 0.14, DARK, Math.PI / 2);
        cyl(x, 0.1, z, 0.08, 0.8, METAL);
      }
      if (carriage) {
        for (const x of [-W * 0.43, W * 0.43]) for (const z of [-D * 0.35, 0, D * 0.35]) box(x, 1.3, z, 0.08, 1.1, 0.08, WOOD);
        box(0, 2.4, 0, W, 0.1, D * 0.85, CREAM);
      } else for (const x of [-0.6, 0.6]) box(x, 0.4, D * 0.65, 0.08, 0.08, D * 0.7, WOOD);
      return out;
    }
    if (kind === "fenceGate") {
      for (const x of [-1.8, 1.8]) box(x, 0, 0, 0.15, 1.5, 0.15, WOOD);
      for (const x of [-1.15, 1.15]) {
        for (const y of [0.4, 1]) box(x, y, 0.25, 1.4, 0.07, 0.1, WOOD, 0.5);
        for (let i = 0; i < 5; i++) box(x + (i - 2) * 0.25, 0, 0.25, 0.06, 1.3, 0.08, WOOD);
      }
      return out;
    }
    if (kind === "flowerBed") {
      box(0, 0, 0, W, 0.12, D, "#564d38");
      for (const x of [-W * 0.48, W * 0.48]) for (let i = 0; i < 6; i++) add("rock", x, 0.14, (i - 2.5) * D / 6, 0.22, 0.25, 0.28, STONE);
      for (const z of [-D * 0.48, D * 0.48]) for (let i = 0; i < 10; i++) add("rock", (i - 4.5) * W / 10, 0.14, z, 0.3, 0.25, 0.2, STONE);
      for (let i = 0; i < 16; i++) {
        const x = Math.sin(i * 2.4) * W * 0.35, z = Math.cos(i * 2.4) * D * 0.3;
        box(x, 0.12, z, 0.025, 0.3, 0.025, LEAF);
        ball(x, 0.5, z, 0.13, ["#c095af", "#ddc578", "#a6b6d6"][i % 3]);
      }
      return out;
    }
  }
  throw Error("Missing geometry for community model " + kind);
}
function communityCatalogParts(id) {
  const item = byId.get(id);
  if (!item) return null;
  let result = cache.get(id);
  if (!result) {
    const [w, h, d] = item.size;
    result = rawModel(item.kind).map((p) => ({ ...p, x: p.x / w, y: p.y / h, z: p.z / d, w: p.w / w, h: p.h / h, d: p.d / d }));
    cache.set(id, result);
  }
  return result;
}
export {
  COMMUNITY_CATALOG,
  SMITHY_FIXTURES,
  communityCatalogItem,
  communityCatalogParts,
  communityCatalogTier
};
