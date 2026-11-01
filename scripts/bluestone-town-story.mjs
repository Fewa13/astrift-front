// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
export function applyBluestoneStory(map){
 map.code=`# © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
# 青石小镇：居民委托 / Bluestone Town: Townsfolk Errands
# Replaces the original starter Code. Rewards and items stay in this map.
# qs_* = persistent progress; talk_count = current visit only.
item towncoin "小镇铜币" "Town coin"
item bread "麦香面包" "Fresh bread"
item herbs "香草束" "Herb bundle"
item postcard "青石明信片" "Bluestone postcard"
item badge "访客徽章" "Visitor badge"
item flour "磨坊面粉" "Milled flour"
item tools "打包好的工具" "Wrapped tools"
item certificate "小镇漫游证" "Town explorer certificate"
item letter "密封的家书" "Sealed letter"
when join
  let talk_count 0
  if qs_welcome == 0
    give towncoin 8
    save qs_welcome 1
    message "欢迎来到青石小镇！先找集市南侧的镇务官艾拉，领取居民委托。" "Welcome to Bluestone! Meet Ayla, the town clerk south of the market, for your first errand."
  end
  if qs_story == 0
    message "引导：艾拉位于 X -8，Z -30；与她交谈开始。" "Guide: Ayla is at X -8, Z -30. Talk to her to begin."
  end
end
when npc any
  add talk_count 1
end
when npc npc_warden
  if qs_story == 0
    message "沿石路向广场走，镇务官艾拉在 X -8，Z -30 等你。" "Follow the street toward the square. Ayla awaits at X -8, Z -30."
  end
end
when npc npc_clerk
  if qs_story == 0
    give badge 1
    give towncoin 3
    save qs_story 1
    message "居民委托 1：去西南找磨坊主奥文取面粉（X -108，Z -72）。" "Errand 1: Collect flour from Owen the miller to the southwest (X -108, Z -72)."
  end
  if qs_story == 7
    give towncoin 6
    give postcard 1
    save qs_story 8
    message "居民委托完成！铜币 +6，明信片 +1。可以探索五个街区，或找信使接循环送信。" "Errands complete! +6 coins and a postcard. Explore all five districts or ask the courier about repeatable deliveries."
  end
end
when npc npc_miller
  if qs_story == 1
    give flour 1
    save qs_story 2
    message "拿到面粉。送给广场的面包师米洛（X -9，Z -12）。" "Flour collected. Take it to Milo the baker in the square (X -9, Z -12)."
  end
end
when npc npc_baker
  if qs_story == 2
    take flour 1
    give bread 2
    give towncoin 3
    save qs_story 3
    message "面粉送达！面包 +2、铜币 +3。去找铁匠布兰（X -8，Z -52）。" "Flour delivered! +2 loaves and +3 coins. Meet Bran the smith (X -8, Z -52)."
  end
end
when npc npc_smith
  if qs_story == 3
    give tools 1
    save qs_story 4
    message "拿到工具包。送往东南工坊的搬运工库克（X 108，Z -72）。" "Tools collected. Deliver them to Cooke the porter in the southeast (X 108, Z -72)."
  end
end
when npc npc_porter
  if qs_story == 4
    take tools 1
    give towncoin 4
    save qs_story 5
    message "工具送达！铜币 +4。园丁罗莎在东北等你（X 72，Z 110）。" "Tools delivered! +4 coins. Rosa the gardener awaits in the northeast (X 72, Z 110)."
  end
  if qs_delivery == 1
    save qs_delivery 2
    message "循环送信：地址确认了，去找农夫托比（X -72，Z -108）送出家书。" "Delivery: Address confirmed. Take the letter to Toby the farmer (X -72, Z -108)."
  end
end
when npc npc_gardener
  if qs_story == 5
    give herbs 1
    save qs_story 6
    message "拿到香草。送给广场的草药商塞拉（X 9，Z -4）。" "Herbs collected. Take them to Sera the herbalist in the square (X 9, Z -4)."
  end
end
when npc npc_herbalist
  if qs_story == 6
    take herbs 1
    give towncoin 4
    save qs_story 7
    message "香草送达！铜币 +4。回镇务官艾拉那里领取谢礼（X -8，Z -30）。" "Herbs delivered! +4 coins. Return to Ayla for your reward (X -8, Z -30)."
  end
end
when npc npc_reader
  if qs_explored >= 5
    if qs_certificate == 0
      give certificate 1
      give towncoin 5
      save qs_certificate 1
      message "五个街区都逛过了！获得小镇漫游证，铜币 +5。" "All five districts explored! You earned a town explorer certificate and +5 coins."
    end
  end
  if qs_explored < 5
    message "探索集市、书香街区、花园宅邸、风车农庄和匠人工坊，再来找我。" "Explore the market, archive quarter, manor gardens, windmill farm and artisan yard, then return."
  end
end
when npc npc_courier
  if qs_delivery == 0
    give letter 1
    save qs_delivery 1
    message "循环送信：先找搬运工库克核对地址（X 108，Z -72）。完整送完才有铜币。" "Delivery accepted: Ask Cooke to confirm the address (X 108, Z -72). Coins are awarded only after the full route."
  end
  if qs_delivery == 3
    give towncoin 2
    save qs_delivery 0
    add qs_deliveries 1
    message "家书已送达，铜币 +2。再次交谈可以接下一封。" "Letter delivered! +2 coins. Talk again for another delivery."
  end
end
when npc npc_farmer
  if qs_delivery == 2
    take letter 1
    save qs_delivery 3
    message "托比收到了家书。回去找信使佩尔领取报酬（X 32，Z -72）。" "Toby received the letter. Return to Pell the courier for payment (X 32, Z -72)."
  end
end
`;
 const reminders=[
 [1,'去找磨坊主奥文取面粉：X -108，Z -72。','Collect flour from Owen: X -108, Z -72.'],
 [2,'把面粉送给米洛：X -9，Z -12。','Deliver flour to Milo: X -9, Z -12.'],
 [3,'去铁匠布兰那里领工具：X -8，Z -52。','Collect tools from Bran: X -8, Z -52.'],
 [4,'把工具交给库克：X 108，Z -72。','Deliver tools to Cooke: X 108, Z -72.'],
 [5,'去找园丁罗莎：X 72，Z 110。','Meet Rosa the gardener: X 72, Z 110.'],
 [6,'把香草交给塞拉：X 9，Z -4。','Deliver herbs to Sera: X 9, Z -4.'],
 [8,'居民委托已完成。可找信使佩尔循环送信，或找学者伊文领取探索奖励。','Errands complete. Visit Pell for repeatable deliveries or Iven for exploration rewards.']
 ];
 const reminderCode=reminders.map(([stage,zh,en])=>`  if qs_story == ${stage}\n    message "${zh}" "${en}"\n  end\n`).join('');map.code=map.code.replace('when npc npc_clerk\n','when npc npc_clerk\n'+reminderCode);
 const districts=[['market',0,0,18,'集市广场','Market Square'],['archive',-112,112,25,'书香街区','Archive Quarter'],['garden',112,112,25,'花园宅邸','Manor Gardens'],['farm',-112,-112,25,'风车农庄','Windmill Farm'],['forge',112,-112,25,'匠人工坊','Artisan Yard']];
 for(const [id,x,z,r,zh,en]of districts)map.code+=`when zone ${x} ${z} ${r}\n  if qs_place_${id} == 0\n    give towncoin 2\n    save qs_place_${id} 1\n    add qs_explored 1\n    message "发现${zh}，铜币 +2。五个街区都走过后，找学者伊文领取漫游证。" "Discovered ${en}, +2 coins. Visit all five districts and see Iven for an explorer certificate."\n  end\nend\n`;
 const lines={
  clerk:[['欢迎来帮忙！先去西南磨坊找奥文取面粉，送给广场的米洛，再找铁匠布兰。完成后记得回我这里领取谢礼。','Welcome, helper! Collect flour from Owen southwest, bring it to Milo in the square, then see Bran the smith. Return here when the errands are done.'],['我来帮忙。','I will help.']],
  miller:[['面粉磨好了。若艾拉请你来取，交谈后就会放进你的本图背包。送去广场的面包摊吧。','The flour is ready. If Ayla sent you, it will go into your map inventory after this conversation. Take it to the bakery stall in the square.'],['我替艾拉来取面粉。','Ayla sent me for flour.']],
  baker:[['今早第一炉刚出炉。带了奥文的面粉的话，我会收下并送你两份面包和三枚铜币。也可以看看摊上的面包。','The first batch is fresh. If you brought Owen’s flour, I will trade it for two loaves and three coins. You can also browse the stall.'],['请收下面粉。','Here is the flour.']],
  smith:[['把这包修好的工具送给东南工坊的库克吧。他常在东边石路的路口清点货物。','Take the repaired tools to Cooke in the southeast yard. He is usually counting cargo by the eastern crossroads.'],['我来送工具。','I can deliver the tools.']],
  porter:[['给我带工具，或是替佩尔核对送信地址？工具我会收好；家书要交给西南农庄的托比。','Tools for me, or a letter address for Pell? I will take the tools; the letter belongs to Toby at the southwest farm.'],['我来办委托。','I am here on an errand.']],
  gardener:[['这是刚剪下的香草。若你是艾拉派来的，就帮我送给广场的塞拉。沿石路走，别踩坏花圃。','These herbs are freshly cut. If Ayla sent you, take them to Sera in the square. Follow the stone street and mind the flower beds.'],['我帮你送过去。','I will take them.']],
  herbalist:[['罗莎的香草到了吗？我会按约给你四枚铜币。完事后回艾拉那里报个平安。','Herbs from Rosa? I will pay the promised four coins. Then let Ayla know the errands are finished.'],['我带了香草。','I brought the herbs.']],
  reader:[['我在记小镇的风物。集市、书香街区、花园、农庄和工坊都走过的话，我就送你一张漫游证。','I collect stories of the town. Visit the market, archive quarter, gardens, farm and artisan yard, and I will award you an explorer certificate.'],['看看我的探索记录。','Check my exploration record.']],
  courier:[['愿意帮我送封家书吗？先找东南的库克核对地址，再交给西南的托比，最后回来领两枚铜币。每次都要完整跑一趟。','Will you deliver a letter? Confirm the address with Cooke southeast, deliver it to Toby southwest, then return for two coins. Each delivery needs the full route.'],['接送信，或交回执。','Accept a letter, or report delivery.']],
  farmer:[['风一吹就得赶紧磨麦子。你若是佩尔派来的，就把家书交给我，然后回去告诉他我收到了。','When the wind blows, the grain cannot wait. If Pell sent you, hand me the letter, then tell him it arrived.'],['这里有一封家书。','I have a letter for you.']],
  warden:[['第一次来？沿路去找镇务官艾拉。可以帮镇民跑跑腿，也能慢慢逛。这里的物品和铜币都只在小镇内使用。','First visit? Meet Ayla the town clerk along this street. Help with errands or simply explore. Town items and coins are used only here.'],['我去找艾拉。','I will find Ayla.']]
 };
 for(const [id,[speech,reply]]of Object.entries(lines)){const n=map.npcs.find(n=>n.id==='npc_'+id);if(!n)throw Error('Missing story NPC '+id);n.lines[0]={npc:speech,player:reply,take:[],give:[]}}
}
