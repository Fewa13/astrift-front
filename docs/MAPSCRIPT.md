<!-- © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved. -->
# Astrift MapScript

代码只影响当前社区地图。不能操作正常世界金币、装备或账户，不能执行 JavaScript、网络请求或文件操作。下载、上传地图会保留 Code 和 NPC；玩家进度不会一起复制。

编辑器 → 代码：检查代码、应用代码、语法与命令、运行错误记录。选中物体后，右侧属性里的「脚本物体 ID」可点击复制，供物体命令使用。Tab 接受灰字补全，Esc 隐藏建议。

## 事件与基本命令

```text
item coin "铜币" "Coin"

when join
  message "欢迎 {player.name}" "Welcome {player.name}"
end

when kill grox
  give coin 1
end

when npc npc_trader
  take coin 1
end

when timer 10
  heal 5
end

when zone 20 30 5
  teleport 0 0 0
end
```

事件分别是入图、击杀、回复 NPC、在线定时器、进入圆形区域。`kill any` 表示任意怪物；`zone X Z 半径`。坐标 Y 指脚底高度。传送必须在地图边界内、有支撑面且不被阻挡。

`spawn grox 10 20 0 20` 在 X20、Y0、Z20 生成10级穴居兽。等级和 BOSS 数受地图等级限制；最多16只临时脚本怪，5分钟后清理，不给正常世界经验、金币、装备等收益。

## 变量、查询与运算

```text
let count 0
save visited true
set old_name 1
add count 1
let greeting "你好"
add greeting "，旅行者"
shared gate_open false
addshared team_kills 1
let roll random(1, 100)
let hp_percent player.hp / player.maxhp * 100
```

- `let`：玩家本次入图变量，重连保留，退出地图清空；在函数内为函数局部变量。
- `save` / 旧命令 `set`：该玩家在本图永久保存。
- `add`：增加已有变量，文字则拼接；未定义时按保存变量处理。
- `shared` / `addshared`：全图共享并保存；用 `shared.name` 读取。
- `$name` 与 `name` 都可读取变量。未定义变量为0。
- 查询：`item.coin`、`player.hp`、`player.maxhp`、`player.x/y/z`、`player.level`、`player.name`、`player.map`。
- 支持数字、双引号文字、`true/false`、括号、`+ - * / %`、`== != > >= < <=`、`and or not` 或 `&& || !`。
- 数学：`random(min,max)`（含端点的随机整数），`min`、`max`、`abs`、`floor`、`ceil`、`round`、`clamp(value,min,max)`、`len(text)`。
- 为兼容旧变量名中的短横线，变量减法请写空格：`count - 1`。
- 多参数命令里的复合表达式请加括号：`teleport ($x + 1) 0 20`。

## 分支、循环和函数

```text
function reward amount
  give coin amount
  return amount * 2
end

when kill any
  call reward 2 -> result
  let another reward(3)
  if player.hp < player.maxhp / 2
    heal 10
  else if item.coin >= 20
    message "有 {item.coin} 铜币" "Coins: {item.coin}"
  else
    addshared kills 1
  end
  repeat 3
    add count 1
  end
end
```

函数支持最多8个参数、局部变量、返回值和表达式调用。`repeat` 允许0–16次；没有无限循环。每个事件最多128次操作（表达式计算也计入），函数最多嵌套8层。每个 `function/when/if/repeat` 需要 `end`；`else if` 共用同一个末尾 `end`。

## 物体控制（全图同步并保存）

```text
when npc npc_guard
  open door_id
  move platform_id 20 2 30
  hide decoration_id
end
```

`show/hide ID` 显示／隐藏；隐藏时也去掉碰撞。`open ID` 在原始角度转90度并去掉碰撞；`close ID` 恢复原始角度与碰撞。`move ID X Y Z` 移到绝对坐标。恢复显示或关闭不会叠加旋转。如果修改会把在线玩家困在物体里，会拒绝本次事件并记录错误。命令控制的是单个物体 ID，组合中的各部件需分别控制。

## 自定义任务 HUD

```text
when join
  task hunt "击杀：{kills}/20" "Kills: {kills}/20"
end
when kill any
  add kills 1
  if kills >= 20
    complete hunt
  end
end
```

`task ID "中文" "English"` 创建或更新任务，`complete ID` 标记完成，`untask ID` 移除。每玩家每地图最多8条，进度与任务保存；文本中的 `{变量}` 会自动更新，也支持 `{shared.name}`、`{player.level}`、`{item.coin}`。主线任务不受影响。

## 报错与限制

语法检查会指出行号；运行错误在代码面板「运行错误记录」查看，包含时间、玩家、事件与报错。最多保留本图最近100条，连续重复错误会去重；有地图权限才能查看，View 不能清空。脚本出错不发放本次事件物品，不保存本次变量、任务或物体修改。普通玩家仍可看到自己的运行错误提示。

代码最多16000字符、128种本图物品、32个事件、32个函数。字符串最多1000字符，数字范围±10亿。地图数据、玩家数据互相隔离；共享变量只在本图共享，不会跨地图。
