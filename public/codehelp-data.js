// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
const entry=(syntax,zh,en,example=syntax)=>({syntax,zh,en,example});
export const CODE_HELP_SECTIONS=[
{id:'furniture',name:['家具、种植与料理','Furniture, gardening & cooking'],entries:[entry('when sit / stand / lie / plant / water / harvest / cook [any|id]','准星对准家具按交互键：坐下、躺下、种植或做饭。移动、跳跃或再次交互起身；床不会回血。温室每个位置独立种植，种子免费，成熟作物由本图玩家共享收获；只有种植者或图主能清除。食材和料理在背包「本图物品」，不同地图隔离。料理可在灶台或背包食用，恢复比例生命，共用15秒食用间隔。断线不会重置生长或重复给料理。','Aim at furniture and use Interact to sit, lie down, plant or cook. Move, jump or interact again to stand. Beds do not heal. Greenhouse slots grow independently with free seeds; ripe crops can be harvested by map players. Only the planter or owner can clear crops. Ingredients and meals stay in Inventory → Map items and are isolated between maps. Eat at a station or from the inventory; meals heal a percentage of HP and share a 15s interval. Reconnecting preserves growth without duplicating meals.',`when harvest any
  message "收获成功！去灶台做饭吧。" "Harvested! Visit a stove to cook."
end`),entry('garden_<crop> / meal_<recipe>','内置食材ID：garden_carrot、garden_tomato、garden_potato、garden_wheat、garden_cabbage、garden_pumpkin、garden_mushroom、garden_herb、garden_strawberry、garden_sunflower、garden_mint、garden_rice。料理ID：meal_salad、meal_roastedPotato、meal_stew、meal_porridge、meal_berryTart、meal_tea、meal_mushroomSoup、meal_pumpkinSoup、meal_sunflowerSnack。要在代码中 give/take 或 NPC 交易使用它们，先声明同名 item。sit/stand/lie 按物体ID匹配，plant/water/harvest 按作物ID，cook按食谱ID匹配；event.object 是物体ID，event.slot 是种植位ID，event.amount 是数量。','Built-in crop IDs: garden_carrot, garden_tomato, garden_potato, garden_wheat, garden_cabbage, garden_pumpkin, garden_mushroom, garden_herb, garden_strawberry, garden_sunflower, garden_mint, garden_rice. Meal IDs: meal_salad, meal_roastedPotato, meal_stew, meal_porridge, meal_berryTart, meal_tea, meal_mushroomSoup, meal_pumpkinSoup, meal_sunflowerSnack. Declare an item with the same ID before using it in give/take or NPC trades. sit/stand/lie match an object ID; plant/water/harvest match a crop ID; cook matches a recipe ID. event.object is the object ID, event.slot the planting slot and event.amount the quantity.',`item garden_carrot "胡萝卜" "Carrot"
when harvest carrot
  add carrotsPicked event.amount
end`)]},
{id:'start',name:['入门与示例','Start & examples'],entries:[entry('MapScript','代码只作用于当前社区地图，不能执行 JavaScript、访问网络或修改正常世界背包。编辑器中先检查，再应用；应用后自动保存，公开更新仍需提交审核。除了 item、recipe、loot、function、when 定义，指令要写在 when 或 function 块内，每个块以 end 结束。','Code affects only this community map. It cannot run JavaScript, access the network, or change the normal-world inventory. Check then Apply in the editor; changes autosave. Public updates still require review. Apart from item/recipe/loot/function/when definitions, put commands inside when or function blocks, ending each block with end.',`item coin "铜币" "Coin"
when join
  let clicks 0
  panel dashboard 4 22 30 35 "本图信息" "Map status"
  text stats dashboard "血量：{player.hp}/{player.maxhp}\\n点击：{clicks}" "HP: {player.hp}/{player.maxhp}\\nClicks: {clicks}"
  button reward dashboard "领取本图铜币" "Claim map coin"
end
when button reward
  add clicks 1
  give coin 1
  message "获得1枚本图铜币" "Received 1 map coin"
end`)]},
{id:'events',name:['事件','Events'],entries:[entry('when join … end','每次真正进入地图时执行；重连不会重新触发。','Runs once per map visit; reconnect does not run it again.'),entry('when kill any | kind … end','击杀任意怪物或指定种类时执行。kind 使用怪物 ID，例如 grox。','Runs after a kill, optionally filtered by monster ID, such as grox.','when kill any\n  add kills 1\nend'),entry('when npc any | id … end','与指定 NPC 完成对话时执行，也可用 any。','Runs when completing an NPC dialogue; optionally filter by NPC ID.'),entry('when timer seconds … end','在线时检查，间隔1–3600秒；不是离线计时器。','Checked while online, at intervals of 1–3600 seconds; not an offline timer.','when timer 2\n  add seconds 2\nend'),entry('when zone X Z radius … end','进入圆形区域时执行，离开后再次进入可以重新触发。','Runs on entering a circular zone; leaving and reentering can trigger it again.','when zone 10 20 5\n  message "进入广场" "Entered the square"\nend'),entry('when button id … end','只能由当前可见地图 UI 按钮触发，在服务器执行这些指令。按钮操作有频率限制。','Only a currently visible map UI button can trigger it. Commands execute on the server, with click rate limits.','when button home\n  teleport 0 0 0\nend')]},
{id:'ui',name:['文字、数据与按钮 UI','Text, live data & buttons'],entries:[entry('panel id X% Y% width% height% "中文标题" "English title"','坐标从屏幕左上角算，尺寸和位置用0–100百分比，面板必须完整在屏幕内，最小5×5。面板不自动附带关闭按钮，可由作者通过按钮事件调用 uihide 或 uiremove。','Coordinates start at the top left, using percentages 0–100. Panels must fit within the screen; minimum 5×5. Panels do not automatically include close buttons. Authors can use button events with uihide or uiremove.','when join\n  panel welcome 5 5 90 90 "欢迎" "Welcome"\nend'),entry('text id panelId "中文" "English"','面板内添加文字。普通文本是静态的；{player.hp}、{item.coin}、{shared.score}、{变量}会随着服务器同步自动刷新，不必反复重建面板。换行写成\\n。','Adds text inside a panel. Plain text is static. {player.hp}, {item.coin}, {shared.score}, and {variable} refresh with server synchronization; rebuilding the panel is unnecessary. Use \\n for line breaks.','text health dashboard "生命：{player.hp}" "HP: {player.hp}"'),entry('button id panelId "中文" "English"','添加按钮，再写 when button 同一ID 定义点击效果。内容只能是文字，不能注入 HTML。','Adds a button. Define its action with when button using the same ID. Content is plain text; HTML cannot be injected.','button home dashboard "回出生点" "Return to spawn"\n# 在单独的事件块中：\nwhen button home\n  teleport 0 0 0\nend'),entry('uishow id / uihide id / uiremove id','显示、隐藏或移除一个面板或控件。移除面板会一起移除内部控件。隐藏后可用 uishow 重新显示。','Show, hide, or remove a panel/widget. Removing a panel also removes its children. Use uishow to display a hidden panel again.','when button done\n  uihide dashboard\nend'),entry('UI limits','每人每图最多6个面板、40个控件（含面板）。标题/按钮每种语言最多120字符，正文1000字符。UI按玩家隔离，重连保留，真正退出地图清空。','At most 6 panels and 40 elements including panels per player/map. Titles/buttons: 120 characters per language; text: 1000. UI is per player, survives reconnect, and resets on leaving. ')]},
{id:'variables',name:['变量与实时数据','Variables & live data'],entries:[entry('let name expression','普通变量：真正退出地图时重置，断线重连保留。函数内 let 是函数局部变量。','Visit variable: resets on leaving, survives reconnect. Inside functions, let is local.','let score 0'),entry('save name expression / set name expression','按玩家、地图保存，退出和重连后仍保留。set 是兼容旧代码的 save。','Persistent per player/map; survives visits and reconnects. set is a legacy alias of save.','save visits (visits + 1)'),entry('add name expression','增加已有变量；字符串会拼接，未定义数值默认0。','Adds to a variable; strings concatenate. Undefined numeric variables default to 0.','add score 1'),entry('shared name expression / addshared name expression','地图全体玩家共享并永久保存。用 shared.name 读取。','Persistent shared map variable. Read with shared.name.','shared gate 0\naddshared score 1'),entry('player.hp / maxhp / x / y / z / level / name / map','读取服务器确认的玩家属性。player.y 为脚底高度。只读，不能直接赋值。','Read authoritative player properties. player.y is foot height. These values are read-only.','text position dashboard "坐标：{player.x}, {player.y}, {player.z}" "Position: {player.x}, {player.y}, {player.z}"'),entry('item.id / {variable} / $variable','item.id 读取本图物品数量。表达式可以直接写变量名或 $变量；字符串里用{变量}。','item.id reads map-only item quantity. Expressions accept bare variable names or $variable; templates use {variable}.','message "铜币：{item.coin}" "Coins: {item.coin}"')]},
{id:'logic',name:['判断、函数与计算','Logic, functions & math'],entries:[entry('if expression / else if expression / else / end','支持嵌套判断；每个 if 都需要 end。','Nested conditions are supported. Every if needs end.','if item.coin >= 3\n  take coin 3\nelse\n  message "铜币不足" "Not enough coins"\nend'),entry('repeat count … end','重复0–16次；不能写无限循环。','Repeats 0–16 times. Infinite loops are unavailable.','repeat 3\n  add score 1\nend'),entry('function name parameter … end / call name arguments -> result / return expression','函数写在事件块外，最多8个参数。call 的返回值变量是当前作用域普通变量。','Define functions outside events, with at most 8 parameters. call stores its return value in the current local/visit scope.','function twice amount\n  return amount * 2\nend\nwhen join\n  call twice 3 -> result\nend'),entry('+ - * / % / == != > >= < <= / and or not','支持四则、取余、比较与逻辑。多参数指令中的复合表达式用括号包住；文字用双引号。','Arithmetic, remainder, comparisons and logic. Wrap compound expressions in parentheses in multi-argument commands. Quote text.','teleport (player.x + 2) player.y player.z'),entry('random(min,max), min, max, abs, floor, ceil, round, clamp(value,min,max), len(text)','random 返回包含两端的随机整数。len 计算文字长度。除零等错误会标出代码行。','random returns an integer including both endpoints. len counts text characters. Errors such as division by zero report the source line.','let roll random(1,10)\nlet safe clamp(roll,2,8)')]},
{id:'items',name:['物品、消息与任务','Items, messages & tasks'],entries:[entry('item id "中文" "English"','在所有事件、函数外定义本图物品。最多128种。','Define a map-only item outside events/functions. At most 128 item types.','item coin "铜币" "Coin"'),entry('give itemId quantity / take itemId quantity','获得或交出本图物品，数量为0–999999整数。不影响普通世界，物品不足会报错。','Give/take map-only items, with integer quantities 0–999999. Does not affect the normal world. Insufficient items produce an error.','give coin 1'),entry('message "中文" "English"','给当前玩家显示一条消息，支持{变量}。','Shows a message to the current player. Supports {variable} templates.','message "你好，{player.name}" "Hello, {player.name}"'),entry('task id "中文" "English" / complete id / untask id','添加实时任务文字、标记完成或移除。最多8条，标题每种语言最多300字符。','Add a live task title, mark complete, or remove. At most 8 tasks; 300 characters per language.','task hunt "击杀：{kills}" "Kills: {kills}"\ncomplete hunt\nuntask hunt')]},
{id:'world',name:['玩家、怪物与物体','Players, monsters & objects'],entries:[entry('teleport X feetY Z','传送到本图安全位置，必须在边界内、站得住且没有被物体挡住。','Teleport to a safe location in this map, inside its boundary, on a surface, without intersecting objects.','teleport 0 0 0'),entry('heal amount','恢复当前玩家生命，不超过上限；有效数值0–1000000000。','Heals the current player up to max HP; valid range 0–1000000000.','heal 20'),entry('spawn kind level X feetY Z','生成本图临时怪物，受地图等级、BOSS数量、碰撞与16只临时怪物上限限制；5分钟后清理，不提供正常世界奖励。','Spawns a temporary map monster, subject to tier, boss count, placement, and a 16-temporary-monster cap. Removed after 5 minutes; no normal-world rewards.','spawn grox 5 15 0 15'),entry('show objectId / hide objectId / open objectId / close objectId','控制物体；hide取消碰撞，show恢复；open旋转90度并取消碰撞，close恢复。不能把玩家夹在新位置内。','Controls an object. hide disables collision; show restores it. open turns 90° and disables collision; close restores it. Changes cannot trap players.'),entry('move objectId X Y Z','移动已放置物体，仍受地图边界和安全检查约束。','Moves a placed object, subject to map boundary and safety checks.','move door 10 0 20')]},
{id:'npc',name:['NPC、保存与发布','NPCs, saving & publishing'],entries:[entry('NPC editor','中/高级地图可放最多32个 NPC，每人1–10轮中英文对话。交易只能用当前 Code 的 item 物品。NPC 不在当前对话范围时无法远程交易。','Intermediate/advanced maps support up to 32 NPCs with 1–10 bilingual dialogue rounds. Trades use items defined by the current Code. Players must be near the NPC.'),entry('Download / Upload / Preview','Code、NPC、物品定义和 UI 指令随地图下载/上传保留。试玩使用当前草稿，公开版本只有审核通过后才更新；变量和UI运行状态不属于地图模板。','Code, NPCs, item definitions and UI commands are retained in map downloads/uploads. Preview uses the draft; published changes require approval. Runtime variables/UI state are not map templates.')]},
{id:'errors',name:['错误与限制','Errors & limits'],entries:[entry('Check code / Runtime error log','代码框下可以检查语法；运行错误记录会显示玩家、事件、时间和行号。错误指令不会放开正常世界限制。','Check code below the editor for syntax validation. Runtime logs include player, event, time and line number. Errors never unlock normal-world access.'),entry('Limits','代码最多16000字符、32个事件、32个函数，嵌套块深度7、函数调用深度8、每次事件128次操作。过量循环会中止并报错。','Code: 16000 characters, 32 events, 32 functions; block depth 7, function-call depth 8, 128 operations per event. Excessive execution stops with an error.')]}];
CODE_HELP_SECTIONS.push(
{id:'game-events',name:['交互与战斗事件','Interaction & combat events'],entries:[
entry('when interact objectId','距离物体7米内按交互键（默认F）；服务器检查距离和遮挡。objectId 使用编辑器物体编号。','Use Interact (default F) within 7m of this object; the server validates range and visibility. Use the editor object ID.',`when interact gate
 message "碰到了机关" "Mechanism activated"
end`),
entry('when key KeyG','可用G/H/J/K/L/O/P/U/V/B/N/T，不抢占移动和技能键。屏幕也显示对应按钮供移动端点击；每人约0.3秒最多一次。','Available keys: G/H/J/K/L/O/P/U/V/B/N/T. Matching touch buttons appear. Limited to approximately one action per 0.3s.',`when key KeyG
 message "地图动作" "Map action"
end`),
entry('when leavezone X Z radius','离开区域时触发；zone 在进入时触发。重连保留区域状态。','Triggers when leaving a region; zone triggers when entering. Region state survives reconnects.',`when leavezone 0 0 5
 message "离开安全区" "Leaving safe area"
end`),
entry('when hurt / death / respawn','由服务器真实受击、死亡和复活触发。hurt/death 可读取 event.amount 和 event.source（monster/player/environment）。死亡事件不会自动复活玩家。','Triggered by authoritative damage, death and respawn. hurt/death expose event.amount and event.source (monster/player/environment). Death scripts do not automatically revive players.',`when hurt
 let lastDamage event.amount
end
when death
 message "你倒下了" "You have fallen"
end
when respawn
 message "已复活" "Respawned"
end`)]},
{id:'checkpoints',name:['检查点与死亡规则','Checkpoints & death rules'],entries:[
entry('checkpoint X Y Z / clearcheckpoint','Y为脚下高度，必须是地图内安全落脚点。死亡后按正常复活按钮回到检查点；被删掉或被挡住时回到出生点。检查点按玩家和地图保存。','Y is feet height and must be a safe surface inside the map. Normal respawn returns here; invalid checkpoints fall back to spawn. Stored per player/map.',`when zone 0 10 3
 checkpoint 0 0 10
end`),
entry('deathitems keep|clear / deathloss itemId count','默认保留本图物品。clear 清空；keep 可搭配 deathloss 扣指定数量，扣到0为止，每次死亡仅结算一次。不会扣正常世界物品。','Map items are kept by default. clear removes them; keep can use deathloss for fixed deductions, clamped at zero, once per death. Normal-world items are unaffected.',`item coin "铜币" "Coin"
when join
 deathitems keep
 deathloss coin 2
end`)]},
{id:'scene-feedback',name:['场景、特效与音效','Scene, effects & sound'],entries:[
entry('effect id kind X Y Z seconds','kind 为 flash/beam/ring/sparks；持续0.1–30秒，同图共享，最多16个同时存在。同编号会替换旧特效。','kind: flash/beam/ring/sparks. Duration 0.1–30s, shared in this map, maximum 16 active. Reusing an ID replaces the effect.',`when key KeyG
 effect beacon beam 0 0 0 3
end`),
entry('sound id kind X Y Z volume pitch seconds','内置合成音：chime/bell/rumble/wind/danger。音量0–1，音高0.25–4，时长0.1–20秒，最多8个；按距离衰减，浏览器首次交互后才能播放。禁止外部音频网址。','Built-in synthesized chime/bell/rumble/wind/danger. Volume 0–1, pitch 0.25–4, duration 0.1–20s; up to 8, distance-attenuated. Browser interaction is required before playback. External audio URLs are not allowed.',`when key KeyH
 sound bell bell 0 0 0 0.6 1 2
end`),
entry('stopeffect id / stopsound id','提前结束指定场景特效或音效。退出地图自动清理。','Stops an effect/sound early. Leaving cleans up automatically.',`when key KeyJ
 stopeffect beacon
 stopsound bell
end`),
entry('sky "#RRGGBB" / fog "#RRGGBB" density / environmentreset','共享天空色与雾色，雾密度0–0.08；environmentreset 恢复地图本来的环境。','Shared sky/fog colors, fog density 0–0.08. environmentreset restores the original map environment.',`when join
 sky "#233449"
 fog "#607080" 0.008
end`)]},
{id:'rounds',name:['回合、阶段与胜负','Rounds, stages & outcomes'],entries:[
entry('round phaseId seconds','共享回合状态；秒数0代表不自动结束。countdown 结束自动进入 active，其他有时限阶段结束进入 finished。win/lose 可用于胜负。顶部显示阶段与倒计时。','Shared round state. 0 means no automatic expiry. countdown advances to active; other timed phases expire into finished. Use win/lose for outcomes. A compact HUD shows stage/time.',`when key KeyG
 round countdown 5
end
when phase active
 message "开始！" "Go!"
end
when phase finished
 message "结束" "Finished"
end`),
entry('stage number / nextstage / resetround','阶段1–10000。resetround 回到 waiting/阶段1并清理本图特效音效；不删除存档变量或物品。round.number、round.stage、round.phase、round.remaining 可读取。phase 事件对每位玩家每次状态变更触发一次。','Stages 1–10000. resetround restores waiting/stage 1 and clears map effects/sounds; saved variables and items remain. Read round.number, round.stage, round.phase, round.remaining. Each phase transition triggers once per player.',`when key KeyH
 nextstage
 round win 10
end
when key KeyJ
 resetround
end`)]},
{id:'map-stats',name:['本图角色属性','Map-only character stats'],entries:[
entry('stat speed|jump|health|damage value / resetstats','speed是移速倍率0.25–3；jump是起跳速度倍率0.25–2；health是基础血量上限1–10亿（保留当前血量比例）；damage是造成伤害倍率0–10。只影响本人当前地图，重连保留，真正离开清空。resetstats 恢复默认。','speed: movement multiplier 0.25–3; jump: jump-velocity multiplier 0.25–2; health: base max HP 1–1 billion, preserving current HP ratio; damage: outgoing multiplier 0–10. Per player/current map; retained on reconnect, cleared on leaving. resetstats restores defaults.',`when join
 stat speed 1.2
 stat jump 1.3
 stat health 1000
 stat damage 1.5
end`)]},
{id:'input-controls',name:['输入、选择与进度条','Inputs, choices & progress'],entries:[
entry('input id panelId text|number|check|select "中文" "English" default','输入控件存入 input.id。文本最多200字；数字必须有限；check 使用 true/false。select 的值必须匹配 option。button 点击同时提交同面板输入，服务器校验；输入改变触发 when input id。','Controls are read through input.id. Text up to 200 characters, finite numbers, boolean check values. select values must match an option. Buttons submit their panel inputs; the server validates them. Changes trigger when input id.',`when join
 panel form 5 20 35 50 "设置" "Settings"
 input nickname form text "昵称" "Nickname" "Guest"
 input difficulty form select "难度" "Difficulty" "easy"
 option difficulty "easy" "简单" "Easy"
 option difficulty "hard" "困难" "Hard"
 input ready form check "准备" "Ready" false
 button apply form "确认" "Apply"
end
when button apply
 message "你好 {input.nickname}" "Hello {input.nickname}"
end
when input ready
 message "准备状态已更新" "Ready state updated"
end`),
entry('option inputId value "中文" "English"','给 select 添加选项，最多30个，值不能重复。','Adds a select option, up to 30 unique values.',`when join
 panel settings 5 20 30 40 "设置" "Settings"
 input mode settings select "模式" "Mode" 1
 option mode 1 "普通" "Normal"
 option mode 2 "困难" "Hard"
end`),
entry('progress id panelId value maximum "中文" "English"','value/maximum 可传数值或实时模板字符串，例如 "{player.hp}"。只显示进度，不直接改变量。所有面板仍由作者自行决定关闭/隐藏方式。','value/maximum accept numbers or live template strings such as "{player.hp}". Display only. Authors decide how panels are hidden/closed.',`when join
 panel vitals 5 20 30 20 "状态" "Vitals"
 progress health vitals "{player.hp}" "{player.maxhp}" "生命" "Health"
end`)]},
{id:'craft-loot',name:['制作配方与掉落表','Crafting & weighted loot'],entries:[
entry('recipe id output quantity ingredient quantity ...','放在块外。最多64种配方，物品先用item声明。craft id count（1–16）在事件内执行；材料不足不会扣除，也不会部分制造。','Outside blocks, up to 64 recipes using declared map items. craft id count (1–16) executes inside events. Insufficient ingredients cause no partial consumption.',`item ore "矿石" "Ore"
item key "钥匙" "Key"
recipe forge key 1 ore 3
when join
 give ore 6
 panel forgeUI 5 20 30 25 "制作" "Craft"
 button make forgeUI "制作钥匙" "Craft key"
end
when button make
 craft forge 1
end`),
entry('loot id item quantity weight ... / roll id count','块外定义最多32张表，权重为1–999999整数；roll 每次按权重抽一个结果，数量1–16。仅本图物品，作者自己用事件控制领取条件，不会改官方掉落顺序。','Up to 32 tables outside blocks, integer weights 1–999999. roll draws one weighted result per roll, count 1–16. Only map items; authors wire eligibility through events. Official spawns/drops are unchanged.',`item coin "铜币" "Coin"
item gem "宝石" "Gem"
loot chest coin 5 90 gem 1 10
when kill any
 roll chest 1
end`)]}
);
