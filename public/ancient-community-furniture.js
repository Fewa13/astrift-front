// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
const FURNITURE_EXPANSION = [
  { subcategory: "electronics", rows: [
    ["television", "\u843D\u5730\u652F\u67B6\u7535\u89C6", "Freestanding flat-screen TV", [1.5, 1.2, 0.4], "television"],
    ["wallTV", "\u58C1\u6302\u5BBD\u5C4F\u7535\u89C6", "Wall-mounted widescreen TV", [1.8, 1.1, 0.12], "television"],
    ["crtTV", "\u65CB\u94AE\u663E\u50CF\u7BA1\u7535\u89C6", "Dial CRT television", [0.9, 0.75, 0.7], "television"],
    ["consoleTV", "\u6728\u58F3\u7535\u89C6\u67DC\u4E00\u4F53\u673A", "Wooden console television", [1.6, 0.95, 0.6], "television"],
    ["cinemaTV", "\u5F71\u9662\u5927\u5C4F\u4E0E\u97F3\u7BB1", "Cinema screen and speakers", [3, 1.8, 0.6], "television"],
    ["projector", "\u6295\u5F71\u673A\u4E0E\u5E55\u5E03", "Projector and screen", [2.8, 2, 0.8], "projector"],
    ["desktopComputer", "\u53F0\u5F0F\u7535\u8111\u5168\u5957", "Desktop PC with keyboard and mouse", [1.4, 0.75, 0.7], "desktopComputer"],
    ["dualComputer", "\u53CC\u663E\u793A\u5668\u5DE5\u4F5C\u7AD9", "Dual-monitor workstation", [1.8, 0.8, 0.75], "desktopComputer"],
    ["gamingComputer", "\u900F\u660E\u4FA7\u677F\u6E38\u620F\u7535\u8111", "Gaming desktop workstation", [1.6, 0.85, 0.8], "desktopComputer"],
    ["allInOne", "\u4E00\u4F53\u5F0F\u53F0\u5F0F\u7535\u8111", "All-in-one computer", [1.1, 0.7, 0.5], "desktopComputer"],
    ["retroComputer", "\u8001\u5F0F\u663E\u50CF\u7BA1\u7535\u8111", "Retro CRT computer", [1.1, 0.8, 0.9], "desktopComputer"],
    ["laptop", "\u5C55\u5F00\u7684\u7B14\u8BB0\u672C\u7535\u8111", "Open laptop", [0.4, 0.3, 0.3], "laptop"],
    ["printer", "\u5E26\u7EB8\u76D2\u6253\u5370\u673A", "Printer with paper tray", [0.55, 0.4, 0.45], "printer"],
    ["speakers", "\u53CC\u58F0\u9053\u684C\u9762\u97F3\u7BB1", "Desktop speaker pair", [0.7, 0.4, 0.25], "speakers"],
    ["radio", "\u6728\u58F3\u6536\u97F3\u673A", "Wooden radio", [0.55, 0.32, 0.22], "radio"],
    ["recordPlayer", "\u5E26\u5531\u7247\u7684\u5531\u673A", "Record player", [0.6, 0.3, 0.45], "recordPlayer"],
    ["gameConsole", "\u6E38\u620F\u673A\u4E0E\u53CC\u624B\u67C4", "Game console and controllers", [0.7, 0.3, 0.4], "gameConsole"],
    ["deskFan", "\u5E26\u62A4\u7F69\u53F0\u5F0F\u98CE\u6247", "Guarded desk fan", [0.45, 0.6, 0.3], "deskFan"]
  ] },
  { subcategory: "tables", rows: [["lDesk", "\u8F6C\u89D2L\u5F62\u4E66\u684C", "L-shaped desk", [2, 0.8, 1.7], "writingDesk"], ["glassCoffeeTable", "\u91D1\u5C5E\u6846\u73BB\u7483\u8336\u51E0", "Metal-frame glass coffee table", [1.4, 0.45, 0.8], "diningTable"], ["foldingTable", "\u4EA4\u53C9\u652F\u67B6\u6298\u53E0\u684C", "Cross-braced folding table", [1.5, 0.75, 0.75], "diningTable"], ["pedestalTable", "\u96D5\u82B1\u5355\u67F1\u5706\u684C", "Carved pedestal table", [1.1, 0.8, 1.1], "diningTable"], ["marbleTable", "\u5927\u7406\u77F3\u53CC\u67F1\u9910\u684C", "Marble twin-pedestal table", [2.5, 0.8, 1.1], "diningTable"], ["roundCoffeeTable", "\u53CC\u5C42\u5706\u8336\u51E0", "Round tiered coffee table", [1, 0.5, 1], "diningTable"], ["computerDesk", "\u5E26\u4E3B\u673A\u6258\u67B6\u7535\u8111\u684C", "Computer desk with tower shelf", [1.6, 0.78, 0.75], "writingDesk"], ["schoolDesk", "\u8BFE\u684C\u4E0E\u4E66\u515C", "School desk with book shelf", [0.8, 0.75, 0.6], "writingDesk"]] },
  { subcategory: "seating", rows: [["foldingChair", "\u6298\u53E0\u6905", "Folding chair", [0.55, 0.9, 0.6], "diningChair"], ["wovenChair", "\u85E4\u7F16\u6276\u624B\u6905", "Woven armchair", [0.8, 0.95, 0.8], "diningChair"], ["metalChair", "\u91D1\u5C5E\u9760\u80CC\u6905", "Metal dining chair", [0.55, 0.95, 0.6], "diningChair"], ["plasticChair", "\u5F27\u80CC\u4F11\u95F2\u6905", "Curved-back chair", [0.6, 0.85, 0.65], "diningChair"], ["swivelChair", "\u9AD8\u80CC\u5DE5\u5B66\u6905", "High-back ergonomic chair", [0.75, 1.35, 0.75], "diningChair"], ["schoolChair", "\u6728\u9762\u8BFE\u6905", "School chair", [0.5, 0.85, 0.5], "diningChair"], ["loveseat", "\u53CC\u4EBA\u5C0F\u6C99\u53D1", "Two-seat loveseat", [1.7, 0.95, 0.95], "sofa"], ["singleSofa", "\u5355\u4EBA\u5C0F\u6C99\u53D1", "Single-seat sofa", [1, 0.95, 0.95], "sofa"], ["longSofa", "\u56DB\u4EBA\u957F\u6C99\u53D1", "Four-seat long sofa", [3.2, 1, 1], "sofa"], ["tuftedSofa", "\u62C9\u6263\u76AE\u8D28\u6C99\u53D1", "Tufted leather sofa", [2.5, 1.05, 1], "sofa"], ["curvedSofa", "\u5F27\u5F62\u6C99\u53D1", "Curved sofa", [2.8, 0.95, 1.4], "sofa"], ["modularSofa", "\u6A21\u5757\u7EC4\u5408\u6C99\u53D1", "Modular sofa", [3, 1, 2.3], "sofa"], ["daybed", "\u53CC\u6276\u624B\u4F11\u61A9\u69BB", "Two-arm daybed", [2.2, 0.8, 0.95], "sofa"], ["beanbag", "\u62FC\u74E3\u61D2\u4EBA\u6C99\u53D1", "Paneled beanbag", [1, 0.8, 1], "sofa"]] },
  { subcategory: "storage", rows: [["slidingWardrobe", "\u63A8\u62C9\u95E8\u8863\u67DC", "Sliding-door wardrobe", [2.2, 2.3, 0.7], "wardrobe"], ["carvedCabinet", "\u96D5\u82B1\u56DB\u95E8\u67DC", "Carved four-door cabinet", [2, 1.8, 0.6], "wardrobe"], ["tvStand", "\u7535\u89C6\u77EE\u67DC", "Low TV cabinet", [1.8, 0.5, 0.45], "wardrobe"], ["shoeCabinet", "\u767E\u53F6\u978B\u67DC", "Louvered shoe cabinet", [1, 0.9, 0.4], "wardrobe"], ["fileCabinet", "\u56DB\u5C49\u6587\u4EF6\u67DC", "Four-drawer filing cabinet", [0.5, 1.4, 0.6], "wardrobe"], ["wallCabinet", "\u5E26\u6302\u94A9\u58C1\u6A71", "Wall cabinet with hooks", [1.2, 0.9, 0.35], "wardrobe"], ["cornerCabinet", "\u8F6C\u89D2\u5C55\u793A\u67DC", "Corner display cabinet", [0.85, 1.8, 0.85], "wardrobe"], ["openWardrobe", "\u5F00\u653E\u5F0F\u8863\u5E3D\u67DC", "Open garment cabinet", [1.6, 2.1, 0.6], "wardrobe"], ["glassSideboard", "\u900F\u7A7A\u9648\u5217\u9910\u8FB9\u67DC", "Open-display sideboard", [1.7, 1, 0.45], "wardrobe"], ["rollingCart", "\u4E09\u5C42\u5E26\u8F6E\u63A8\u8F66", "Three-tier rolling cart", [0.8, 0.9, 0.5], "rollingCart"]] },
  { subcategory: "lighting", rows: [["arcLamp", "\u5F27\u81C2\u843D\u5730\u706F", "Arc floor lamp", [1.4, 2.2, 0.6], "floorLamp"], ["gooseneckLamp", "\u53EF\u8C03\u9605\u8BFB\u53F0\u706F", "Adjustable reading lamp", [0.45, 0.65, 0.45], "floorLamp"], ["pendantLamp", "\u540A\u7EBF\u5706\u9876\u706F", "Dome pendant lamp", [0.7, 1.3, 0.7], "floorLamp"], ["ceilingLight", "\u4E09\u73AF\u5438\u9876\u706F", "Three-ring ceiling light", [1, 0.3, 1], "floorLamp"], ["industrialLamp", "\u4E09\u811A\u5DE5\u4E1A\u5C04\u706F", "Tripod studio light", [0.8, 1.7, 0.8], "floorLamp"], ["bedsideLamp", "\u5E03\u7F69\u5E8A\u5934\u706F", "Fabric bedside lamp", [0.4, 0.6, 0.4], "floorLamp"], ["wallLantern", "\u5E26\u652F\u67B6\u58C1\u6302\u63D0\u706F", "Bracketed wall lantern", [0.4, 0.8, 0.4], "floorLamp"], ["clusterPendant", "\u4E09\u706F\u9AD8\u4F4E\u540A\u706F", "Three-height pendant cluster", [1.1, 1.5, 0.8], "floorLamp"]] },
  { subcategory: "bath", rows: [["tanklessToilet", "\u65E0\u6C34\u7BB1\u4E00\u4F53\u9A6C\u6876", "Tankless toilet", [0.55, 0.65, 0.8], "toilet"], ["wallToilet", "\u58C1\u6302\u9A6C\u6876\u4E0E\u6C34\u7BB1\u5899", "Wall-hung toilet", [0.6, 1, 0.8], "toilet"], ["squatToilet", "\u8E72\u5F0F\u4FBF\u5668", "Squat toilet", [0.65, 0.15, 0.8], "toilet"], ["vanitySink", "\u67DC\u5F0F\u6D17\u624B\u53F0", "Vanity washbasin", [1, 0.9, 0.6], "washbasin"], ["stoneBasin", "\u77F3\u53F0\u7897\u76C6\u6D17\u624B\u53F0", "Stone counter vessel sink", [1.1, 1, 0.6], "washbasin"], ["doubleVanity", "\u53CC\u76C6\u955C\u67DC\u6D17\u624B\u53F0", "Double-basin vanity", [1.8, 1.8, 0.65], "washbasin"], ["wallBasin", "\u58C1\u6302\u6D17\u624B\u76C6", "Wall-mounted washbasin", [0.65, 0.65, 0.5], "washbasin"], ["showerCabin", "\u5206\u5C42\u6846\u67B6\u6DCB\u6D74\u95F4", "Framed shower enclosure", [1, 2.2, 1], "shower"], ["towelStack", "\u53E0\u653E\u6D74\u5DFE", "Folded towel stack", [0.5, 0.25, 0.35], "towelStack"], ["soapSet", "\u6D17\u624B\u6DB2\u4E0E\u7682\u789F", "Soap dispenser and dish", [0.35, 0.25, 0.25], "soapSet"], ["toothbrushCup", "\u7259\u5237\u676F\u5957\u88C5", "Toothbrush cup set", [0.25, 0.25, 0.2], "toothbrushCup"]] },
  { subcategory: "fireplaces", rows: [["marbleFireplace", "\u96D5\u82B1\u77F3\u6750\u58C1\u7089", "Carved marble fireplace", [2.2, 1.6, 0.7], "fireplace"], ["cornerFireplace", "\u8F6C\u89D2\u94C1\u7089\u4E0E\u70DF\u7BA1", "Corner iron stove and flue", [1, 2.5, 1], "fireplace"], ["modernFireplace", "\u957F\u6761\u5D4C\u5165\u5F0F\u58C1\u7089", "Linear inset fireplace", [2.8, 1, 0.5], "fireplace"], ["tallFireplace", "\u9AD8\u70DF\u56F1\u7816\u780C\u58C1\u7089", "Tall brick-chimney fireplace", [1.8, 3, 0.9], "fireplace"]] },
  { subcategory: "plants", rows: [["emptyFlowerpot", "\u5E26\u5E95\u789F\u7A7A\u82B1\u76C6", "Empty flowerpot with saucer", [0.4, 0.4, 0.4], "emptyFlowerpot"], ["succulentPot", "\u591A\u8089\u62FC\u76D8\u76C6\u683D", "Succulent planter", [0.6, 0.35, 0.45], "indoorPlant"], ["cactusPot", "\u4ED9\u4EBA\u638C\u9676\u76C6", "Potted cactus", [0.5, 1, 0.5], "indoorPlant"], ["bonsaiPot", "\u6D45\u76C6\u9020\u578B\u76C6\u666F", "Shallow-pot bonsai", [0.8, 0.8, 0.6], "indoorPlant"], ["hangingFern", "\u540A\u7BEE\u8568\u7C7B", "Hanging fern basket", [0.7, 1, 0.7], "indoorPlant"], ["windowPlanter", "\u957F\u6761\u7A97\u53F0\u82B1\u76C6", "Window flower planter", [1.2, 0.5, 0.3], "indoorPlant"], ["orchidPot", "\u8774\u8776\u5170\u76C6\u683D", "Potted orchid", [0.55, 0.8, 0.45], "indoorPlant"], ["ceramicPlanter", "\u9AD8\u811A\u9676\u74F7\u7EFF\u690D\u76C6", "Ceramic plant on stand", [0.65, 1.4, 0.65], "indoorPlant"]] },
  { subcategory: "books", rows: [["singleBook", "\u70EB\u91D1\u7CBE\u88C5\u4E66", "Gilt hardcover book", [0.24, 0.05, 0.32], "books"], ["openBook", "\u644A\u5F00\u4E66\u672C", "Open book", [0.5, 0.08, 0.32], "books"], ["verticalBooks", "\u7ACB\u653E\u4E66\u7C4D\u4E0E\u4E66\u6321", "Upright books with bookends", [0.65, 0.35, 0.28], "books"], ["messyBooks", "\u9519\u843D\u53E0\u4E66", "Uneven book stack", [0.4, 0.3, 0.35], "books"], ["scroll", "\u5C55\u5F00\u7684\u7F8A\u76AE\u7EB8\u5377", "Unrolled parchment", [0.5, 0.08, 0.35], "scroll"], ["scrollBundle", "\u7ED1\u624E\u5377\u8F74\u675F", "Tied scroll bundle", [0.35, 0.3, 0.3], "scroll"]] },
  { subcategory: "stationery", rows: [["pen", "\u94A2\u7B14\u4E0E\u7B14\u5E3D", "Fountain pen with cap", [0.18, 0.025, 0.04], "pen"], ["pencil", "\u6728\u94C5\u7B14\u4E0E\u6A61\u76AE\u5934", "Wood pencil with eraser", [0.19, 0.02, 0.03], "pencil"], ["penHolder", "\u94A2\u7B14\u63D2\u5EA7", "Fountain-pen desk stand", [0.22, 0.19, 0.15], "pen"], ["pencilCup", "\u63D2\u6EE1\u7B14\u7684\u7B14\u7B52", "Filled pencil cup", [0.14, 0.23, 0.14], "pencilCup"], ["notebook", "\u7ED1\u5E26\u7B14\u8BB0\u672C", "Strapped notebook", [0.2, 0.025, 0.28], "notebook"], ["spiralNotebook", "\u7EBF\u5708\u7B14\u8BB0\u672C", "Spiral notebook", [0.21, 0.03, 0.29], "notebook"], ["openNotebook", "\u644A\u5F00\u8BB0\u4E8B\u672C", "Open lined notebook", [0.4, 0.03, 0.28], "notebook"], ["planner", "\u7FFB\u9875\u65E5\u7A0B\u672C", "Standing desk planner", [0.25, 0.16, 0.12], "notebook"], ["paperStack", "\u6574\u9F50\u6253\u5370\u7EB8", "Paper stack", [0.22, 0.035, 0.3], "paperStack"], ["paperTray", "\u53CC\u5C42\u6587\u4EF6\u6258\u76D8", "Two-tier document tray", [0.26, 0.14, 0.34], "paperTray"], ["folder", "\u5E26\u6807\u7B7E\u6587\u4EF6\u5939", "Labeled file folder", [0.24, 0.04, 0.32], "folder"], ["ruler", "\u523B\u5EA6\u76F4\u5C3A", "Marked ruler", [0.3, 0.012, 0.04], "ruler"], ["scissors", "\u5E26\u63E1\u73AF\u526A\u5200", "Handled scissors", [0.16, 0.025, 0.08], "scissors"], ["stapler", "\u91D1\u5C5E\u8BA2\u4E66\u673A", "Metal stapler", [0.15, 0.055, 0.045], "stapler"], ["tapeDispenser", "\u80F6\u5E26\u5207\u5272\u5EA7", "Tape dispenser", [0.14, 0.09, 0.06], "tapeDispenser"], ["eraser", "\u5E26\u7EB8\u5957\u6A61\u76AE", "Sleeved eraser", [0.065, 0.025, 0.035], "eraser"], ["glueStick", "\u65CB\u76D6\u56FA\u4F53\u80F6", "Capped glue stick", [0.04, 0.12, 0.04], "glueStick"], ["stickyNotes", "\u4FBF\u7B7E\u7EB8\u4E0E\u7FD8\u89D2\u7EB8\u9875", "Sticky-note pad", [0.09, 0.02, 0.09], "stickyNotes"], ["inkwell", "\u7FBD\u6BDB\u7B14\u4E0E\u58A8\u6C34\u74F6", "Quill and inkwell", [0.16, 0.25, 0.13], "inkwell"], ["deskOrganizer", "\u591A\u683C\u684C\u9762\u6536\u7EB3\u76D2", "Compartment desk organizer", [0.3, 0.2, 0.2], "deskOrganizer"]] },
  { subcategory: "appliances", rows: [["washingMachine", "\u6EDA\u7B52\u6D17\u8863\u673A", "Front-loading washing machine", [0.65, 0.9, 0.65], "washingMachine"], ["dryer", "\u6EDA\u7B52\u70D8\u5E72\u673A", "Tumble dryer", [0.65, 0.9, 0.65], "washingMachine"], ["microwave", "\u65CB\u94AE\u5FAE\u6CE2\u7089", "Microwave oven", [0.55, 0.32, 0.4], "microwave"], ["kettle", "\u7535\u70ED\u6C34\u58F6\u4E0E\u5E95\u5EA7", "Kettle and base", [0.28, 0.35, 0.24], "kettle"], ["toaster", "\u53CC\u69FD\u70E4\u9762\u5305\u673A", "Two-slot toaster", [0.3, 0.23, 0.2], "toaster"], ["coffeeMachine", "\u5496\u5561\u673A\u4E0E\u63A5\u6C34\u76D8", "Coffee machine", [0.35, 0.55, 0.4], "coffeeMachine"]] },
  { subcategory: "household", rows: [["wallClock", "\u523B\u5EA6\u6302\u949F", "Marked wall clock", [0.4, 0.4, 0.07], "wallClock"], ["photoFrame", "\u5E26\u652F\u67B6\u76F8\u6846", "Standing photo frame", [0.25, 0.3, 0.12], "photoFrame"], ["coatStand", "\u591A\u94A9\u8863\u5E3D\u67B6", "Multi-hook coat stand", [0.65, 1.8, 0.65], "coatStand"], ["umbrellaStand", "\u96E8\u4F1E\u6536\u7EB3\u6876", "Umbrella stand", [0.45, 0.9, 0.45], "umbrellaStand"], ["wasteBin", "\u5E26\u5185\u6876\u5783\u573E\u6876", "Lined waste bin", [0.35, 0.5, 0.35], "wasteBin"], ["laundryBasket", "\u7F16\u7EC7\u6D17\u8863\u7BEE", "Woven laundry basket", [0.55, 0.7, 0.45], "laundryBasket"], ["basket", "\u5E26\u63D0\u624B\u6536\u7EB3\u7BEE", "Handled storage basket", [0.45, 0.4, 0.3], "basket"], ["chessSet", "\u68CB\u76D8\u4E0E\u68CB\u5B50", "Chessboard and pieces", [0.5, 0.15, 0.5], "chessSet"], ["cushions", "\u4E09\u53EA\u88C5\u9970\u9760\u6795", "Three decorative cushions", [0.9, 0.4, 0.4], "cushions"], ["blanket", "\u6298\u53E0\u6D41\u82CF\u6BEF", "Folded fringed blanket", [0.65, 0.15, 0.5], "blanket"], ["shoePair", "\u4E00\u53CC\u7CFB\u5E26\u978B", "Laced shoes", [0.5, 0.2, 0.35], "shoePair"], ["wallCalendar", "\u6302\u5386\u4E0E\u7FFB\u9875\u5939", "Wall calendar", [0.3, 0.4, 0.06], "wallCalendar"]] }
];
function buildFurnitureExpansion(kind, existing) {
  const entry = FURNITURE_EXPANSION.flatMap((v) => v.rows).find((r) => r[0] === kind);
  if (!entry) return null;
  const [, , , [W, H, D], family] = entry, out = [], add = (shape, x, y, z, w, h, d, color = "#806247", ry = 0) => out.push({ shape, x, y, z, w, h, d, color, ry }), box = (x, y, z, w, h, d, color = "#806247", ry = 0) => add("box", x, y + h / 2, z, w, h, d, color, ry), cyl = (x, y, z, r, h, color = "#59656b") => add("cylinder", x, y + h / 2, z, r * 2, h, r * 2, color), ball = (x, y, z, r, color = "#8baaa0") => add("sphere", x, y, z, r * 2, r * 2, r * 2, color), append = (id, x = 0, y = 0, z = 0, scale = 1) => {
    for (const p of existing(id)) out.push({ ...p, x: x + p.x * scale, y: y + p.y * scale, z: z + p.z * scale, w: p.w * scale, h: p.h * scale, d: p.d * scale });
  }, wood = "#806247", dark = "#2e3841", metal = "#68777e", trim = "#bd9b62", cream = "#e0dbc9", cloth = "#5d858c", screen = "#264b60";
  const legs = (w = W, d = D, h = 0.4, color = wood) => {
    for (const x of [-w * 0.42, w * 0.42]) for (const z of [-d * 0.38, d * 0.38]) box(x, 0, z, 0.07, h, 0.07, color);
  };
  if (family === "television" || family === "desktopComputer" || ["laptop", "projector"].includes(kind)) {
    let monitor2 = function(x, w, h, y) {
      box(x, y, monitorZ, w, h, crt ? D * 0.65 : 0.07, dark);
      box(x, y + 0.035, monitorZ + (crt ? D * 0.34 : 0.041), w - 0.07, h - 0.07, 0.012, screen);
      box(x, y + h * 0.24, monitorZ + (crt ? D * 0.35 : 0.05), w * 0.64, 0.012, 0.012, "#6ba2a2");
      for (let i = 0; i < 3; i++) box(x - w * 0.28 + i * w * 0.23, y + h * 0.55, monitorZ + (crt ? D * 0.35 : 0.05), w * 0.15, h * 0.18, 0.013, ["#71979d", "#9da66e", "#8b769d"][i]);
      if (!wall) {
        cyl(x, 0, -0.04, 0.035, y + 0.03, metal);
        box(x, 0, 0.02, w * 0.45, 0.035, 0.25, metal);
      }
      box(x + w * 0.38, y + 0.015, monitorZ + 0.05, 0.025, 8e-3, 0.018, "#a2dfb3");
    };
    var monitor = monitor2;
    const crt = kind === "crtTV" || kind === "retroComputer", computer = family === "desktopComputer", wall = kind === "wallTV", laptop = kind === "laptop", monitorW = computer ? kind === "dualComputer" ? 0.62 : 0.75 : W * 0.9, monitorH = computer ? 0.46 : H * 0.68, monitorZ = crt ? D * 0.18 : 0;
    if (kind === "projector") {
      box(0, 0.22, 0, W, 0.04, D * 0.1, dark);
      box(0, 0.27, 0, W * 0.95, H * 0.8, 0.035, cream);
      for (const x of [-W * 0.38, W * 0.38]) box(x, 0, 0, 0.035, 0.3, 0.035, metal);
      box(0, 0, D * 0.35, 0.45, 0.15, 0.25, dark);
      ball(0, 0.08, D * 0.5, 0.065, "#95c9d4");
      return out;
    }
    if (laptop) {
      box(0, 0, 0.03, W, 0.025, D, dark);
      monitor2(0, W, 0.24, 0.035);
      for (let x = 0; x < 9; x++) for (let z = 0; z < 3; z++) box((x - 4) * 0.035, 0.026, 0.03 + z * 0.04, 0.025, 5e-3, 0.025, cream);
      box(0, 0.026, 0.13, 0.12, 4e-3, 0.06, metal);
      return out;
    }
    if (kind === "consoleTV") {
      box(0, 0, 0, W, 0.3, D, wood);
      for (const x of [-W * 0.42, W * 0.42]) box(x, 0.3, 0, 0.12, H - 0.3, D, wood);
      monitor2(-W * 0.1, W * 0.7, H * 0.57, 0.32);
      for (let i = 0; i < 5; i++) box(W * 0.37, 0.4 + i * 0.065, D * 0.33, 0.17, 0.025, 0.025, trim);
      return out;
    }
    if (kind === "dualComputer") {
      monitor2(-0.34, 0.62, 0.43, 0.22);
      monitor2(0.34, 0.62, 0.43, 0.22);
    } else monitor2(computer ? -0.1 : 0, monitorW, monitorH, wall ? 0 : computer ? 0.18 : 0.22);
    if (computer) {
      if (kind !== "allInOne") {
        const x = W * 0.39;
        box(x, 0, 0, 0.23, H * 0.9, D * 0.58, kind === "gamingComputer" ? "#42505a" : dark);
        box(x, 0, D * 0.3, 0.2, H * 0.85, 0.025, metal);
        for (let i = 0; i < 3; i++) {
          ball(x, 0.12 + i * 0.18, D * 0.32, 0.06, kind === "gamingComputer" ? ["#a483ca", "#6cabb4", "#9dbf85"][i] : dark);
          box(x - 0.08, 0.1 + i * 0.18, D * 0.32, 0.015, 0.1, 0.02, cream);
        }
      }
      box(-0.1, 0, D * 0.32, W * 0.55, 0.035, 0.18, dark);
      for (let i = 0; i < 12; i++) for (let j = 0; j < 3; j++) box(-W * 0.3 + i * W * 0.035, 0.038, D * 0.28 + j * 0.045, W * 0.026, 5e-3, 0.03, cream);
      ball(W * 0.3, 0.035, D * 0.34, 0.055, metal);
      box(W * 0.3, 0, D * 0.34, 0.2, 0.01, 0.2, "#526477");
    }
    if (kind === "cinemaTV") {
      for (const x of [-W * 0.46, W * 0.46]) {
        box(x, 0, 0.03, 0.25, H * 0.7, 0.3, dark);
        for (const y of [0.25, 0.65, 1.05]) ball(x, y, 0.2, 0.09, metal);
      }
    }
    if (kind === "crtTV") for (const x of [W * 0.35, W * 0.43]) ball(x, 0.22, D * 0.39, 0.035, trim);
    return out;
  }
  if (["printer", "speakers", "radio", "recordPlayer", "gameConsole", "deskFan"].includes(kind)) {
    if (kind === "printer") {
      box(0, 0, 0, W, H * 0.7, D, cream);
      box(0, H * 0.6, -D * 0.2, W * 0.8, 0.04, D * 0.6, dark);
      box(0, H * 0.7, D * 0.3, W * 0.65, 0.02, D * 0.7, "#eef0df");
      for (let i = 0; i < 5; i++) box(-W * 0.2, H * 0.725, D * 0.2 + i * 0.04, W * 0.35, 4e-3, 8e-3, metal);
      return out;
    }
    if (kind === "speakers") {
      for (const x of [-W * 0.32, W * 0.32]) {
        box(x, 0, 0, W * 0.3, H, D, dark);
        for (const y of [H * 0.3, H * 0.7]) ball(x, y, D * 0.52, W * 0.1, metal);
      }
      return out;
    }
    if (kind === "radio") {
      box(0, 0, 0, W, H, D, wood);
      for (let i = 0; i < 9; i++) box(-W * 0.18 + i * 0.025, H * 0.15, D * 0.51, 8e-3, H * 0.65, 0.012, dark);
      box(W * 0.25, H * 0.5, D * 0.52, 0.16, 0.07, 0.012, screen);
      for (const x of [0.16, 0.24]) ball(x, 0.06, D * 0.52, 0.023, trim);
      return out;
    }
    if (kind === "recordPlayer") {
      box(0, 0, 0, W, H * 0.5, D, wood);
      cyl(-0.1, H * 0.5, 0, 0.17, 0.025, dark);
      cyl(-0.1, H * 0.53, 0, 0.04, 4e-3, trim);
      box(0.17, H * 0.56, 0, 0.018, 0.018, 0.25, metal, 0.3);
      box(0, H * 0.5, -D * 0.47, W, H * 0.5, 0.025, wood);
      return out;
    }
    if (kind === "gameConsole") {
      box(0, 0, -0.05, 0.42, 0.2, 0.28, dark);
      for (let i = 0; i < 8; i++) box((i - 3.5) * 0.045, 0.15, 0.095, 0.02, 0.02, 0.01, metal);
      for (const x of [-0.22, 0.22]) {
        box(x, 0, 0.15, 0.18, 0.05, 0.1, metal);
        for (const dx of [-0.05, 0.05]) ball(x + dx, 0.055, 0.15, 0.02, dark);
      }
      return out;
    }
    cyl(0, 0, 0, 0.16, 0.035, metal);
    box(0, 0.035, 0, 0.06, 0.25, 0.06, metal);
    for (let i = 0; i < 16; i++) {
      const a = i * Math.PI / 8;
      ball(Math.sin(a) * 0.18, 0.4 + Math.cos(a) * 0.18, 0.03, 0.022, metal);
    }
    box(0, 0.39, 0.04, 0.35, 0.015, 0.02, cream);
    box(0, 0.23, 0.04, 0.015, 0.35, 0.02, cream);
    ball(0, 0.4, 0.07, 0.04, trim);
    return out;
  }
  if (family === "sofa") {
    if (kind === "beanbag") {
      for (let i = 0; i < 7; i++) {
        const a = i * Math.PI * 2 / 7;
        add("rock", Math.sin(a) * 0.2, 0.3, Math.cos(a) * 0.2, 0.65, 0.55, 0.65, cloth, a);
      }
      box(0, 0.2, -0.25, 0.6, 0.5, 0.2, cloth);
      return out;
    }
    const n = kind === "singleSofa" ? 1 : kind === "loveseat" ? 2 : kind === "longSofa" ? 4 : 3;
    legs(W, D, 0.18, dark);
    box(0, 0.18, 0, W, 0.22, D, cloth);
    for (const x of [-W * 0.46, W * 0.46]) box(x, 0.4, 0, 0.13, 0.35, D, cloth);
    for (let i = 0; i < n; i++) {
      const x = -W / 2 + (i + 0.5) * W / n, z = kind === "curvedSofa" ? Math.abs(i - (n - 1) / 2) * 0.15 : 0;
      box(x, 0.4, z, W / n - 0.035, 0.12, D * 0.82, "#8da5a6");
      box(x, 0.51, D * 0.405 + z, W / n - 0.07, 0.012, 0.012, "#b2c7be");
      box(x, 0.5, -D * 0.4 + z, W / n - 0.025, 0.43, 0.16, kind === "tuftedSofa" ? "#775b50" : cloth);
      if (kind === "tuftedSofa") for (const dx of [-0.17, 0.17]) ball(x + dx, 0.72, -D * 0.3, 0.018, trim);
    }
    if (kind === "modularSofa") {
      box(W * 0.25, 0.4, D * 0.55, W * 0.4, 0.12, D * 0.9, cloth);
      box(W * 0.44, 0.5, D * 0.35, 0.12, 0.4, D, cloth);
    }
    if (kind === "daybed") box(0, 0.5, -D * 0.43, W, 0.12, 0.12, cloth);
    return out;
  }
  if (family === "diningChair") {
    const office = kind === "swivelChair";
    legs(W, D, 0.43, kind === "metalChair" ? metal : wood);
    box(0, 0.43, 0, W, 0.07, D, office ? dark : wood);
    if (kind === "plasticChair") for (let i = 0; i < 5; i++) box((i - 2) * W * 0.16, 0.5, -D * 0.4, 0.07, H - 0.5, 0.08, "#9baca2");
    else {
      box(0, 0.52, -D * 0.42, W, H - 0.52, 0.06, office ? dark : wood);
      for (let i = 0; i < 5; i++) box((i - 2) * W * 0.15, 0.6, -D * 0.37, 0.012, H - 0.7, 0.02, trim);
    }
    if (kind === "wovenChair") for (const x of [-W * 0.46, W * 0.46]) {
      box(x, 0.5, 0, 0.05, 0.18, 0.05);
      box(x, 0.68, 0, 0.07, 0.05, D * 0.9);
      for (let j = 0; j < 6; j++) box(x, 0.5 + j * 0.025, 0, 0.015, 0.012, D * 0.8, trim);
    }
    if (kind === "foldingChair") for (const x of [-W * 0.35, W * 0.35]) box(x, 0.1, 0, 0.035, 0.7, 0.035, metal, 0.5);
    if (office) {
      cyl(0, 0, 0, 0.05, 0.43, metal);
      for (let i = 0; i < 5; i++) {
        const a = i * Math.PI * 2 / 5;
        box(Math.sin(a) * 0.2, 0, Math.cos(a) * 0.2, 0.35, 0.04, 0.04, metal, a);
      }
      box(0, H - 0.15, -D * 0.4, W * 0.7, 0.15, 0.12, dark);
    }
    return out;
  }
  if (family === "diningTable" || family === "writingDesk") {
    if (["pedestalTable", "roundCoffeeTable"].includes(kind)) {
      cyl(0, 0, 0, 0.16, H - 0.1, wood);
      cyl(0, 0, 0, W * 0.35, 0.06, wood);
      cyl(0, H - 0.1, 0, W * 0.5, 0.08, kind === "pedestalTable" ? wood : cream);
      if (kind === "roundCoffeeTable") cyl(0, 0.12, 0, W * 0.4, 0.06, wood);
      return out;
    }
    legs(W, D, H - 0.08, kind === "glassCoffeeTable" ? metal : wood);
    box(0, H - 0.08, 0, W, 0.08, D, kind === "glassCoffeeTable" ? "#a9c6c4" : kind === "marbleTable" ? "#c6c9bc" : wood);
    if (kind === "lDesk") {
      box(W * 0.28, H - 0.08, D * 0.48, W * 0.4, 0.08, D);
      for (const z of [D * 0.35, D * 0.85]) box(W * 0.4, 0, z, 0.07, H, 0.07);
    }
    if (kind === "foldingTable") {
      for (const z of [-D * 0.3, D * 0.3]) box(0, 0.2, z, W * 0.8, 0.04, 0.04, metal);
    }
    if (kind === "computerDesk") {
      box(W * 0.35, 0.1, 0, 0.35, 0.05, D * 0.8, wood);
      for (const x of [-W * 0.45, 0]) box(x, 0.5, -D * 0.45, 0.05, 0.2, 0.05, metal);
    }
    if (kind === "schoolDesk") {
      box(0, 0.48, 0, W * 0.85, 0.045, D * 0.8);
      box(0, 0.52, -D * 0.35, W * 0.85, 0.14, 0.04);
    }
    return out;
  }
  if (family === "wardrobe" || kind === "rollingCart") {
    const shelves = ["openWardrobe", "glassSideboard", "cornerCabinet", "rollingCart"].includes(kind), h = H;
    box(0, 0.06, -D * 0.45, W, h - 0.06, 0.05, wood);
    for (const x of [-W * 0.48, W * 0.48]) box(x, 0.03, 0, 0.055, h - 0.03, D, wood);
    for (const y of [0.06, H - 0.06]) box(0, y, 0, W, 0.06, D, kind === "tvStand" ? dark : wood);
    const rows = kind === "fileCabinet" ? 4 : kind === "shoeCabinet" ? 3 : kind === "tvStand" ? 2 : 3;
    if (shelves) {
      for (let j = 1; j < rows; j++) box(0, H * j / rows, 0, W, 0.045, D);
      if (kind === "openWardrobe") {
        box(0, H * 0.75, 0, W * 0.8, 0.025, 0.025, metal);
        for (let i = 0; i < 5; i++) box((i - 2) * 0.24, H * 0.3, 0, 0.19, H * 0.4, 0.09, ["#667c89", "#a18a75", "#899a85"][i % 3]);
      }
    } else {
      const cols = kind === "fileCabinet" ? 1 : kind === "carvedCabinet" ? 4 : 2;
      for (let i = 0; i < cols; i++) for (let j = 0; j < (kind === "slidingWardrobe" ? 1 : rows); j++) {
        const x = (i - (cols - 1) / 2) * W / cols, y = 0.1 + j * (H - 0.2) / rows;
        box(x, y, D * 0.48, W / cols - 0.035, kind === "slidingWardrobe" ? H - 0.18 : (H - 0.2) / rows - 0.035, 0.04, wood);
        box(x, y + 0.08, D * 0.53, 0.15, 0.025, 0.025, trim);
        if (kind === "shoeCabinet") for (let k = 0; k < 4; k++) box(x, y + 0.08 + k * 0.045, D * 0.51, W / cols * 0.7, 0.015, 0.012, dark);
      }
    }
    if (kind === "carvedCabinet") for (let i = 0; i < 4; i++) add("cone", (i - 1.5) * W * 0.23, H + 0.06, 0, 0.12, 0.12, 0.12, trim);
    if (kind === "wallCabinet") for (let i = 0; i < 5; i++) box((i - 2) * 0.2, -0.08, 0.12, 0.02, 0.09, 0.08, metal);
    if (kind === "rollingCart") for (const x of [-W * 0.4, W * 0.4]) for (const z of [-D * 0.35, D * 0.35]) ball(x, 0.04, z, 0.04, dark);
    return out;
  }
  if (family === "floorLamp") {
    const pendant = ["pendantLamp", "clusterPendant", "ceilingLight"].includes(kind), small = ["gooseneckLamp", "bedsideLamp"].includes(kind);
    if (pendant) {
      box(0, H - 0.03, 0, W * 0.4, 0.03, D * 0.4, metal);
      const count = kind === "clusterPendant" ? 3 : kind === "ceilingLight" ? 3 : 1;
      for (let i = 0; i < count; i++) {
        const x = (i - (count - 1) / 2) * W * 0.32, y = kind === "ceilingLight" ? 0.08 : 0.15 + i * 0.25;
        box(x, y, 0, 0.012, H - y, 0.012, metal);
        add("cone", x, y, 0, W / count, 0.18, D, cream);
      }
      return out;
    }
    cyl(0, 0, 0, W * 0.26, 0.04, metal);
    if (kind === "arcLamp") {
      box(-W * 0.25, 0.04, 0, 0.04, H - 0.25, 0.04, metal);
      box(0, H - 0.25, 0, W * 0.55, 0.04, 0.04, metal);
      add("cone", W * 0.25, H - 0.4, 0, 0.45, 0.3, 0.45, cream);
    } else {
      box(0, 0.04, 0, 0.035, H * 0.65, 0.035, metal);
      if (kind === "industrialLamp") {
        for (let i = 0; i < 3; i++) {
          const a = i * Math.PI * 2 / 3;
          box(Math.sin(a) * 0.2, 0, Math.cos(a) * 0.2, 0.04, H * 0.7, 0.04, metal);
        }
        add("cylinder", 0, H * 0.72, 0.1, 0.4, 0.3, 0.35, dark);
        ball(0, H * 0.9, 0.15, 0.15, cream);
      } else {
        add("cone", small ? 0.04 : 0, H * 0.78, 0, W * 0.8, H * 0.4, D * 0.8, cream);
        if (kind === "wallLantern") for (const x of [-W * 0.35, W * 0.35]) box(x, H * 0.35, 0, 0.025, H * 0.5, 0.025, wood);
      }
    }
    return out;
  }
  if (family === "toilet" || family === "washbasin" || kind === "showerCabin") {
    if (family === "toilet") {
      if (kind === "squatToilet") {
        box(0, 0, 0, W, 0.05, D, cream);
        for (const x of [-W * 0.32, W * 0.32]) box(x, 0.05, 0, W * 0.2, 0.035, D * 0.7, metal);
        box(0, 0.05, 0, W * 0.28, 0.015, D * 0.6, dark);
        return out;
      }
      box(0, kind === "wallToilet" ? 0.25 : 0, 0.04, W * 0.7, H * 0.5, D * 0.65, cream);
      cyl(0, H * 0.5, 0.06, W * 0.4, 0.08, cream);
      if (kind === "wallToilet") box(0, 0, -D * 0.4, W, H, 0.12, cream);
      else box(0, 0, -D * 0.3, W * 0.8, H * 0.8, 0.18, cream);
      return out;
    }
    if (kind === "showerCabin") {
      box(0, 0, 0, W, 0.06, D, cream);
      for (const x of [-W * 0.48, W * 0.48]) for (const z of [-D * 0.48, D * 0.48]) box(x, 0.06, z, 0.025, H - 0.06, 0.025, metal);
      for (const y of [0.06, H - 0.04]) for (const z of [-D * 0.48, D * 0.48]) box(0, y, z, W, 0.025, 0.025, metal);
      append("shower", 0, 0, 0, 0.9);
      return out;
    }
    const double = kind === "doubleVanity", counter = kind !== "wallBasin";
    if (counter) {
      box(0, 0, 0, W, 0.75, D, kind === "stoneBasin" ? "#9ba69d" : wood);
      for (const x of [-W * 0.25, W * 0.25]) box(x, 0.12, D * 0.51, W * 0.43, 0.48, 0.035, cream);
    }
    for (const x of double ? [-W * 0.25, W * 0.25] : [0]) {
      cyl(x, counter ? 0.75 : 0, 0, double ? 0.27 : W * 0.4, 0.1, cream);
      cyl(x, counter ? 0.85 : 0.1, 0, double ? 0.21 : W * 0.3, 0.015, "#759c9d");
      box(x, counter ? 0.85 : 0.1, -D * 0.25, 0.025, 0.2, 0.025, metal);
      box(x, counter ? 1.02 : 0.27, -D * 0.15, 0.03, 0.03, D * 0.25, metal);
    }
    if (double) {
      box(0, 1.05, -D * 0.46, W, 0.7, 0.04, trim);
      box(0, 1.1, -D * 0.43, W - 0.1, 0.6, 0.02, "#98b5b7");
    }
    return out;
  }
  if (family === "fireplace") {
    if (kind === "cornerFireplace") {
      cyl(0, 0, 0, 0.35, 0.85, dark);
      box(0, 0.15, 0.32, 0.45, 0.45, 0.03, screen);
      cyl(0, 0.85, 0, 0.09, H - 0.85, metal);
      for (const x of [-0.24, 0.24]) box(x, 0, 0, 0.05, 0.12, 0.4, metal);
    } else {
      const width = W, top = kind === "modernFireplace" ? 0.8 : 1.1;
      for (const x of [-width * 0.43, width * 0.43]) box(x, 0, 0, width * 0.14, top, D, kind === "marbleFireplace" ? cream : metal);
      box(0, top, 0, width, 0.15, D, cream);
      box(0, 0, -D * 0.44, width, 0.08, 0.1, dark);
      for (let i = 0; i < 7; i++) add("cone", (i - 3) * W * 0.08, 0.2, 0, W * 0.09, 0.35, 0.15, i % 2 ? "#dca356" : "#b67f43");
      if (kind === "tallFireplace") box(0, top + 0.15, 0, W * 0.45, H - top - 0.15, D * 0.6, wood);
      if (kind === "marbleFireplace") for (const x of [-W * 0.4, W * 0.4]) for (let i = 0; i < 4; i++) box(x, 0.12 + i * 0.2, D * 0.51, 0.18, 0.045, 0.03, trim);
    }
    return out;
  }
  if (["plants", "books", "stationery", "appliances", "household"].includes(FURNITURE_EXPANSION.find((v) => v.rows.some((r) => r[0] === kind)).subcategory) || ["towelStack", "soapSet", "toothbrushCup"].includes(kind)) {
    if (["emptyFlowerpot", "indoorPlant"].includes(family)) {
      const potH = kind === "emptyFlowerpot" ? H * 0.8 : kind === "hangingFern" ? 0.25 : H * 0.35;
      cyl(0, 0, 0, W * 0.28, potH, "#b19378");
      cyl(0, potH, 0, W * 0.3, 0.035, cream);
      cyl(0, potH + 0.035, 0, W * 0.25, 8e-3, dark);
      if (kind === "emptyFlowerpot") {
        cyl(0, 0, 0, W * 0.38, 0.025, wood);
        return out;
      }
      if (kind === "cactusPot") {
        cyl(0, potH, 0, 0.08, H * 0.55, "#658e62");
        for (const x of [-0.15, 0.15]) {
          box(x, potH + 0.2, 0, 0.07, 0.25, 0.07, "#658e62");
          box(x / 2, potH + 0.2, 0, 0.18, 0.05, 0.07, "#658e62");
        }
      } else if (kind === "bonsaiPot") {
        box(0, potH, 0, 0.09, H * 0.35, 0.09, wood);
        for (let i = 0; i < 5; i++) add("rock", Math.sin(i) * W * 0.3, potH + H * 0.35 + Math.cos(i) * 0.07, Math.cos(i) * D * 0.2, W * 0.4, 0.12, D * 0.4, "#5d8958", i);
      } else {
        for (let i = 0; i < 7; i++) {
          const a = i * 2.4;
          add(kind === "succulentPot" ? "cone" : "rock", Math.sin(a) * W * 0.25, potH + (kind === "hangingFern" ? 0.06 : H * 0.3), Math.cos(a) * D * 0.25, W * 0.35, kind === "succulentPot" ? 0.12 : 0.15, D * 0.45, kind === "orchidPot" ? ["#cba4c1", "#e2cccf"][i % 2] : "#6d945a", a);
        }
        if (kind === "hangingFern") for (const x of [-W * 0.2, W * 0.2]) box(x, potH, 0, 0.012, H - potH, 0.012, trim);
        if (kind === "ceramicPlanter") legs(W * 0.55, D * 0.55, 0.3, metal);
      }
      return out;
    }
    if (family === "books" || family === "scroll") {
      if (family === "scroll") {
        for (const x of [-W * 0.4, W * 0.4]) cyl(x, 0, 0, 0.04, 0.12, wood);
        box(0, 0.03, 0, W, 0.01, D, cream);
        for (let i = 0; i < 6; i++) box(0, 0.041, (i - 2.5) * D * 0.11, W * 0.7, 1e-3, 4e-3, metal);
        if (kind === "scrollBundle") for (let i = 0; i < 3; i++) cyl((i - 1) * 0.08, 0, 0, 0.035, 0.25, cream);
        return out;
      }
      if (kind === "verticalBooks") {
        for (let i = 0; i < 7; i++) {
          box((i - 3) * 0.07, 0, 0, 0.06, 0.2 + i % 3 * 0.05, 0.23, [wood, cloth, trim][i % 3]);
          box((i - 3) * 0.07, 0.04, 0.12, 0.045, 0.01, 8e-3, cream);
        }
        for (const x of [-0.3, 0.3]) box(x, 0, 0, 0.035, 0.25, 0.27, metal);
      } else if (kind === "openBook") {
        box(0, 0, 0, W, 0.015, D, wood);
        for (const x of [-W * 0.25, W * 0.25]) {
          box(x, 0.015, 0, W * 0.48, 0.025, D * 0.95, cream);
          for (let i = 0; i < 8; i++) box(x, 0.041, (i - 3.5) * D * 0.09, W * 0.35, 1e-3, 3e-3, metal);
        }
      } else {
        const n = kind === "messyBooks" ? 5 : 1;
        for (let i = 0; i < n; i++) {
          box(i % 2 * 0.03, i * 0.05, 0, W, 0.045, D, [wood, cloth, trim][i % 3], i * 0.05);
          box(i % 2 * 0.03, i * 0.05 + 8e-3, D * 0.49, W * 0.92, 0.028, 0.012, cream);
        }
      }
      return out;
    }
    if (["pen", "pencil", "pencilCup", "notebook", "paperStack", "paperTray", "folder", "ruler", "scissors", "stapler", "tapeDispenser", "eraser", "glueStick", "stickyNotes", "inkwell", "deskOrganizer"].includes(family)) {
      if (["pen", "pencil"].includes(family)) {
        if (kind === "penHolder") {
          box(0, 0, 0, 0.18, 0.035, 0.12, wood);
          cyl(0, 0.035, 0, 0.015, 0.14, trim);
        } else {
          box(0, 0, 0, W * 0.8, 0.015, 0.015, family === "pen" ? dark : "#c6a160");
          add("cone", W * 0.45, 8e-3, 0, 0.025, 0.02, 0.025, metal);
          box(-W * 0.4, 0, 0, 0.025, 0.018, 0.018, trim);
        }
        return out;
      }
      if (family === "pencilCup") {
        cyl(0, 0, 0, 0.06, 0.13, wood);
        for (let i = 0; i < 8; i++) box(Math.sin(i) * 0.04, 0.04, Math.cos(i) * 0.04, 0.012, 0.16 + i % 3 * 0.015, 0.012, [trim, cloth, dark][i % 3]);
        return out;
      }
      if (family === "notebook" || ["paperStack", "folder", "stickyNotes"].includes(family)) {
        const open = kind === "openNotebook";
        box(0, 0, 0, W, H * 0.7, D, family === "notebook" ? cloth : family === "stickyNotes" ? "#d8cb80" : cream);
        box(0, H * 0.2, D * 0.49, W * 0.93, H * 0.5, 6e-3, cream);
        for (let i = 0; i < 8; i++) box(0, H * 0.71, (i - 3.5) * D * 0.09, W * 0.78, 1e-3, 2e-3, metal);
        if (kind === "spiralNotebook") for (let i = 0; i < 9; i++) ball(-W * 0.46, H * 0.7, (i - 4) * D * 0.1, 8e-3, metal);
        if (kind === "planner") box(0, 0.03, -D * 0.3, W, H, 0.02, cream);
        if (kind === "notebook") box(W * 0.3, H * 0.72, 0, 0.015, 2e-3, D, trim);
        if (open) box(0, H * 0.72, 0, 6e-3, 1e-3, D, dark);
        return out;
      }
      if (family === "paperTray" || family === "deskOrganizer") {
        const n = family === "paperTray" ? 2 : 3;
        for (let i = 0; i < n; i++) {
          const y = family === "paperTray" ? i * 0.065 : 0, x = family === "deskOrganizer" ? (i - 1) * W / 3 : 0, w = family === "deskOrganizer" ? W / 3 : W;
          box(x, y, 0, w, 0.012, D, metal);
          for (const side of [-1, 1]) box(x + side * w * 0.48, y, 0, 8e-3, H * 0.65, D, metal);
          box(x, y, -D * 0.47, w, H * 0.65, 8e-3, metal);
        }
        return out;
      }
      if (family === "ruler") {
        box(0, 0, 0, W, 8e-3, D, cream);
        for (let i = 0; i < 30; i++) box((i - 14.5) * W / 30, 9e-3, D * 0.3, 2e-3, 1e-3, i % 5 === 0 ? D * 0.5 : D * 0.25, dark);
        return out;
      }
      if (family === "scissors") {
        for (const x of [-W * 0.23, W * 0.23]) {
          for (const z of [D * 0.1, D * 0.45]) box(x, 5e-3, z, 0.045, 5e-3, 7e-3, metal);
          for (const dx of [-0.02, 0.02]) box(x + dx, 5e-3, D * 0.275, 7e-3, 5e-3, D * 0.35, metal);
          box(x, 0, -D * 0.12, 0.018, 0.012, D * 0.8, metal, x < 0 ? -0.2 : 0.2);
        }
        return out;
      }
      if (family === "stapler") {
        box(0, 0, 0, W, 0.01, D, metal);
        box(0, 0.025, 0, W * 0.9, 0.025, D, dark);
        box(-W * 0.4, 0.01, 0, 0.025, 0.035, D, metal);
        return out;
      }
      if (family === "tapeDispenser") {
        box(0, 0, 0, W, 0.02, D, wood);
        add("torus", -0.02, 0.055, 0, 0.075, 0.075, 0.035, cream);
        box(W * 0.35, 0.02, 0, 0.02, 0.04, D, metal);
        return out;
      }
      if (family === "eraser") {
        box(0, 0, 0, W, H, D, cream);
        box(0, 1e-3, 0, W * 0.5, H + 1e-3, D + 2e-3, cloth);
        return out;
      }
      if (family === "glueStick") {
        cyl(0, 0, 0, 0.018, 0.1, cream);
        cyl(0, 0.1, 0, 0.02, 0.02, cloth);
        return out;
      }
      if (family === "inkwell") {
        cyl(0, 0, 0, 0.04, 0.06, dark);
        cyl(0, 0.06, 0, 0.025, 0.02, trim);
        box(0, 0.08, 0, 8e-3, 0.15, 8e-3, wood);
        add("rock", 0.015, 0.19, 0, 0.05, 0.13, 0.012, cream);
        return out;
      }
    }
    if (["washingMachine", "microwave", "kettle", "toaster", "coffeeMachine"].includes(family)) {
      if (family === "washingMachine") {
        box(0, 0, 0, W, H, D, cream);
        add("torus", 0, H * 0.45, D * 0.51, W * 0.65, W * 0.65, 0.05, metal);
        ball(0, H * 0.45, D * 0.5, W * 0.23, screen);
        for (const x of [-W * 0.3, W * 0.3]) ball(x, H * 0.85, D * 0.52, 0.035, metal);
        if (kind === "dryer") for (let i = 0; i < 5; i++) box((i - 2) * 0.07, H * 0.15, D * 0.51, 0.045, 0.025, 0.01, metal);
      } else if (family === "microwave") {
        box(0, 0, 0, W, H, D, cream);
        box(-W * 0.08, H * 0.15, D * 0.51, W * 0.65, H * 0.7, 0.015, screen);
        for (const y of [H * 0.3, H * 0.7]) ball(W * 0.36, y, D * 0.52, 0.027, metal);
      } else if (family === "kettle") {
        cyl(0, 0, 0, 0.12, 0.025, dark);
        cyl(0, 0.025, 0, 0.1, 0.24, metal);
        add("torus", 0.1, 0.16, 0, 0.14, 0.2, 0.035, dark);
        add("cone", -0.1, 0.23, 0, 0.1, 0.12, 0.08, metal);
      } else if (family === "toaster") {
        box(0, 0, 0, W, H, D, metal);
        for (const z of [-D * 0.2, D * 0.2]) box(0, H, z, W * 0.75, 5e-3, 0.025, dark);
        ball(W * 0.51, H * 0.4, 0, 0.025, dark);
      } else {
        box(0, 0, 0, W, H, D, dark);
        box(0, H * 0.1, D * 0.25, W * 0.85, 0.03, D * 0.6, metal);
        cyl(0, H * 0.2, D * 0.3, 0.06, 0.1, cream);
        box(0, H * 0.65, D * 0.4, 0.03, 0.08, 0.03, metal);
      }
      return out;
    }
    if (["towelStack", "cushions", "blanket"].includes(kind)) {
      const count = kind === "cushions" ? 3 : 3;
      for (let i = 0; i < count; i++) box(kind === "cushions" ? (i - 1) * W * 0.3 : 0, kind === "cushions" ? 0 : i * H / 3, 0, kind === "cushions" ? W * 0.3 : W, H / 3, D, [cloth, cream, trim][i]);
      if (kind === "blanket") for (let i = 0; i < 12; i++) box((i - 5.5) * W / 12, 0, D * 0.52, 0.012, 0.015, 0.07, cream);
      return out;
    }
    if (kind === "soapSet" || kind === "toothbrushCup") {
      cyl(-W * 0.2, 0, 0, W * 0.18, H * 0.7, kind === "soapSet" ? cream : cloth);
      if (kind === "soapSet") {
        box(-W * 0.2, H * 0.7, 0, 0.02, 0.06, 0.02, metal);
        box(-W * 0.1, H * 0.75, 0, 0.1, 0.015, 0.02, metal);
        box(W * 0.25, 0, 0, W * 0.4, 0.015, D * 0.7, cream);
      } else for (const x of [-0.03, 0.03]) {
        box(x, 0.08, 0, 0.012, 0.15, 0.012, cream);
        box(x, 0.2, 0, 0.02, 0.035, 0.015, cloth);
      }
      return out;
    }
    if (kind === "wallClock") {
      box(0, 0, 0, W, H, D, wood);
      ball(0, H * 0.5, D * 0.52, W * 0.42, cream);
      for (let i = 0; i < 12; i++) {
        const a = i * Math.PI / 6;
        box(Math.sin(a) * W * 0.33, H * 0.5 + Math.cos(a) * H * 0.33, D * 0.9, 8e-3, 0.02, 0.01, dark);
      }
      box(0, H * 0.5, D * 0.95, 0.01, H * 0.25, 0.01, dark);
      box(W * 0.1, H * 0.5, D * 0.95, W * 0.2, 0.01, 0.01, dark);
      return out;
    }
    if (kind === "photoFrame" || kind === "wallCalendar") {
      box(0, 0, 0, W, H, 0.025, wood);
      box(0, 0.025, 0.02, W - 0.04, H - 0.05, 0.01, kind === "photoFrame" ? screen : cream);
      if (kind === "photoFrame") box(0, 0, -D * 0.3, 0.035, H * 0.6, 0.035, wood);
      else for (let i = 0; i < 5; i++) for (let j = 0; j < 7; j++) box((j - 3) * W * 0.11, 0.05 + i * H * 0.15, 0.032, 0.015, 0.02, 1e-3, metal);
      return out;
    }
    if (kind === "coatStand") {
      cyl(0, 0, 0, 0.12, 0.06, metal);
      box(0, 0.06, 0, 0.035, H - 0.06, 0.035, wood);
      for (let i = 0; i < 6; i++) {
        const a = i * Math.PI / 3;
        box(Math.sin(a) * 0.15, H * 0.78, Math.cos(a) * 0.15, 0.035, 0.2, 0.035, wood);
        ball(Math.sin(a) * 0.15, H * 0.9, Math.cos(a) * 0.15, 0.03, trim);
      }
      return out;
    }
    if (["umbrellaStand", "wasteBin", "laundryBasket", "basket"].includes(kind)) {
      cyl(0, 0, 0, W * 0.4, H * 0.7, wood);
      cyl(0, H * 0.7, 0, W * 0.35, 0.015, dark);
      for (let i = 0; i < 10; i++) {
        const a = i * Math.PI / 5;
        box(Math.sin(a) * W * 0.4, 0.02, Math.cos(a) * D * 0.4, 0.015, H * 0.65, 0.015, trim);
      }
      if (kind === "basket") add("torus", 0, H * 0.75, 0, W * 0.8, H * 0.6, 0.04, wood);
      if (kind === "umbrellaStand") for (const x of [-0.1, 0, 0.1]) box(x, 0.15, 0, 0.025, H * 0.85, 0.025, metal);
      return out;
    }
    if (kind === "chessSet") {
      box(0, 0, 0, W, 0.025, D, wood);
      for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) box((i - 3.5) * W / 8, 0.025, (j - 3.5) * D / 8, W / 8, 2e-3, D / 8, (i + j) % 2 ? cream : dark);
      for (const z of [-D * 0.4, D * 0.4]) for (let i = 0; i < 8; i++) {
        cyl((i - 3.5) * W / 8, 0.03, z, 0.017, 0.05, z < 0 ? cream : dark);
        ball((i - 3.5) * W / 8, 0.1, z, 0.018, z < 0 ? cream : dark);
      }
      return out;
    }
    if (kind === "shoePair") {
      for (const x of [-W * 0.22, W * 0.22]) {
        box(x, 0, 0, W * 0.4, 0.04, D, metal);
        add("rock", x, H * 0.5, 0, W * 0.42, H, D, wood);
        for (let i = 0; i < 4; i++) box(x, H * 0.7, -D * 0.1 + i * 0.04, W * 0.22, 8e-3, 8e-3, cream);
      }
      return out;
    }
  }
  throw Error("Missing furniture geometry " + kind);
}
export {
  FURNITURE_EXPANSION,
  buildFurnitureExpansion
};
