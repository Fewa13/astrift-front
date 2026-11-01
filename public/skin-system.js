// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import * as THREE from './three.module.js?v=0.180.0';

const STORAGE='astrift.skins.v1';
export const SKIN_TIERS=[
  {name:'常规',kills:10,styles:[
    {id:'glacier',name:'霜白断层',desc:'陶瓷白护板 · 冰蓝刻线',shell:0xc8dce3,dark:0x19303c,edge:0xf1fbff,grip:0x3f6170,accent:0x46d9ff},
    {id:'ember',name:'熔痕',desc:'碳黑机匣 · 赤红灼痕',shell:0x363a42,dark:0x14191f,edge:0x9e6659,grip:0x292930,accent:0xff6549},
    {id:'moss',name:'雨林幽线',desc:'消光绿装甲 · 荧绿导轨',shell:0x566c59,dark:0x172923,edge:0xb2c7a5,grip:0x334438,accent:0x88f7a4}]},
  {name:'精良',kills:50,styles:[
    {id:'nebula',name:'暮星折光',desc:'紫曜合金 · 星点导线',shell:0x51466f,dark:0x15152c,edge:0xd1b8ff,grip:0x302b4a,accent:0xc18bff},
    {id:'aurora',name:'极光切面',desc:'深海蓝钛 · 青绿棱面',shell:0x1f6475,dark:0x092b38,edge:0xb7fff3,grip:0x245463,accent:0x62ffd9},
    {id:'copper',name:'鎏金余晖',desc:'枪铜雕刻 · 熔金导槽',shell:0x72503b,dark:0x251b1c,edge:0xf0bd79,grip:0x44322e,accent:0xffd18b}]},
  {name:'传奇',kills:150,styles:[
    {id:'void',name:'蚀界·裂隙核心',desc:'黑曜浮甲 · 紫能脊刺 · 裂隙脉冲',shell:0x171b2e,dark:0x060812,edge:0x8b79c6,grip:0x1d2036,accent:0xb371ff},
    {id:'nova',name:'日冕·焚星之冠',desc:'象牙白金 · 日冕翼片 · 金焰光核',shell:0xe4d8be,dark:0x382a25,edge:0xffdf92,grip:0x776754,accent:0xffbd50},
    {id:'tide',name:'沧渊·潮汐引擎',desc:'深海钛蓝 · 环绕能流 · 青色电弧',shell:0x163d60,dark:0x071a32,edge:0x75d9ea,grip:0x23465d,accent:0x4cf5ff}]}
];
const LOTTERY_RARITIES=[{id:'common',name:'普通',weight:50,shards:4,cost:20},{id:'rare',name:'稀有',weight:30,shards:8,cost:40},{id:'epic',name:'史诗',weight:15,shards:16,cost:80},{id:'legendary',name:'传说',weight:5,shards:30,cost:150}];
export const LOTTERY_SKINS=[
  ['chalk','晨雾白','乳白装甲 · 细金刻纹','common',0xd8d8ca,0x28343b,0xffedd0,0x606e70,0xc2eaff],
  ['cinder','余烬黑','石墨机匣 · 炽橘裂线','common',0x34363b,0x17191d,0xd88f64,0x4f4543,0xff9953],
  ['seabed','深海蓝','冷蓝涂层 · 珍珠波纹','common',0x356078,0x102836,0x9dd5e1,0x315369,0x5fd7ee],
  ['dune','流沙金','沙金磨砂 · 沙丘刻带','common',0xa89570,0x38352f,0xf1d49a,0x6c614f,0xffce78],
  ['jade','青瓷','玉青釉面 · 银色云纹','common',0x7ba99a,0x1d3939,0xe2fff1,0x3d6966,0x9df4c8],
  ['rose','暮玫','冷玫金属 · 深酒红镶边','common',0x986c78,0x30212d,0xf5c4c6,0x614353,0xffa9b8],
  ['slate','岩层灰','层岩压纹 · 荧蓝坐标','common',0x6e7c87,0x1a2834,0xc5dee9,0x405363,0x6ae7ff],
  ['crystal','棱晶','彩晶切面 · 镜银反射','rare',0x728cb5,0x1d2544,0xeee1ff,0x485474,0xc5adff],
  ['quartz','赤曜石','黑曜基底 · 红晶锋线','rare',0x342d37,0x120e19,0xf79a9c,0x4d3543,0xff5277],
  ['horizon','地平线','日落渐层 · 琥珀导光','rare',0x725679,0x211d38,0xffd2a2,0x594358,0xffaa64],
  ['verdant','森之脉','深绿钛甲 · 翡翠脉络','rare',0x315f51,0x0f2926,0xc6f9bb,0x355c4f,0x71f5ae],
  ['frostfire','霜焰','冰白护板 · 蓝焰裂纹','rare',0xaacdda,0x203b53,0xf7ffff,0x476a7f,0x53d8ff],
  ['circuit','夜航电路','午夜蓝甲 · 金色电路','rare',0x28375e,0x101728,0xf5d89c,0x314366,0xffdc75],
  ['eclipse','蚀日','环蚀纹章 · 赤金光边','epic',0x3b343e,0x111019,0xffdf9b,0x63454a,0xff745d],
  ['mirage','海市蜃楼','流彩幻面 · 蓝紫光栅','epic',0x5b639e,0x191b43,0xf2d6ff,0x414575,0x9cd6ff],
  ['thunder','雷霆矩阵','电弧矩阵 · 铬银雷纹','epic',0x50667b,0x152438,0xd8f8ff,0x355875,0x5ae9ff],
  ['lotus','金莲','象牙白金 · 莲瓣浮雕','epic',0xcab995,0x383028,0xfff3d0,0x79634d,0xffce83],
  ['singularity','奇点之心','黑洞环冠 · 紫星碎光','legendary',0x22243f,0x070a19,0xe4c5ff,0x2d3156,0xad71ff],
  ['phoenix','赤羽星凰','焰羽翼甲 · 熔金能核','legendary',0x8a3636,0x290e18,0xffe7a4,0x673037,0xffab48],
  ['celestial','天穹圣辉','虹彩圣甲 · 流星光轮','legendary',0xc4d4d7,0x26394a,0xffffff,0x678f9d,0x8df4ff]
].map(([id,name,desc,rarity,shell,dark,edge,grip,accent],variant)=>({id:`draw-${id}`,name,desc,rarity,shell,dark,edge,grip,accent,variant}));
export const ACTIVITY_SKINS=[
  {id:'event-warrior-gold',name:'武者大赛·冠军',desc:'冠军金纹 · 赤曜战旗 · 赛场核心',rarity:'legendary',shell:0xb88732,dark:0x22151a,edge:0xffe6a0,grip:0x573028,accent:0xff4f5f,variant:31},
  {id:'event-warrior-silver',name:'武者大赛·亚军',desc:'银锋护甲 · 冷蓝流光 · 荣耀徽记',rarity:'epic',shell:0x9fb6c2,dark:0x182531,edge:0xe9fbff,grip:0x405b6a,accent:0x63d9ff,variant:32},
  {id:'event-warrior-bronze',name:'武者大赛·季军',desc:'古铜战甲 · 琥珀刻线 · 勇者勋章',rarity:'rare',shell:0x9a603d,dark:0x2a1c1b,edge:0xf0bd78,grip:0x5a3d32,accent:0xffa84d,variant:33},
  {id:'event-ranked-apex',name:'最强排位·巅峰王座',desc:'深空紫晶 · 排位星环 · 巅峰印记',rarity:'legendary',shell:0x32245b,dark:0x0d0b20,edge:0xd8b5ff,grip:0x30244d,accent:0xa96bff,variant:34},
  {id:'event-breach-apex',name:'最强爆破·裂点终局',desc:'攻防红黑 · 核心倒计时 · 终局火花',rarity:'legendary',shell:0x4b2028,dark:0x160d16,edge:0xffaa79,grip:0x4d2930,accent:0xff554b,variant:35}
];
export const SEASON_SKINS=[
  {id:'season-s1-bronze',name:'S1-青铜',level:1,desc:'青铜棱甲 · 初启刻印',rarity:'common',shell:0x8b5b3c,dark:0x281b1b,edge:0xe5ab69,grip:0x46332c,accent:0xffbd74},
  {id:'season-s1-silver',name:'S1-白银',level:11,desc:'银镜装甲 · 冷光切线',rarity:'rare',shell:0xa5b9c9,dark:0x1a2936,edge:0xf0faff,grip:0x465e6e,accent:0x83e4ff},
  {id:'season-s1-gold',name:'S1-黄金',level:21,desc:'金羽护板 · 日纹导槽',rarity:'rare',shell:0xbd974e,dark:0x322719,edge:0xffe5a0,grip:0x64513a,accent:0xffc34a},
  {id:'season-s1-diamond',name:'S1-钻石',level:31,desc:'棱晶装甲 · 蓝白折射',rarity:'epic',shell:0x7cb6cc,dark:0x142e49,edge:0xe6fbff,grip:0x3c6c85,accent:0x69ecff},
  {id:'season-s1-legend',name:'S1-传说',level:41,desc:'绯红冠甲 · 金焰裂纹',rarity:'epic',shell:0x822d42,dark:0x290d1c,edge:0xffc997,grip:0x653449,accent:0xff715d},
  {id:'season-s1-myth',name:'S1-神话',level:51,desc:'星紫翼甲 · 辉光核心',rarity:'legendary',shell:0x624a9c,dark:0x18142f,edge:0xe7cbff,grip:0x433568,accent:0xc590ff},
  {id:'season-s1-transcend',name:'S1-超凡',level:61,desc:'翡翠能环 · 翼片流光',rarity:'legendary',shell:0x287b70,dark:0x0b2b2b,edge:0xc8fff0,grip:0x275d59,accent:0x5bffce},
  {id:'season-s1-war',name:'S1-战神',level:71,desc:'黑曜战甲 · 赤金锋翼',rarity:'legendary',shell:0x38313e,dark:0x0b0b16,edge:0xffd29b,grip:0x44303b,accent:0xff624d},
  {id:'season-s1-peak',name:'S1-巅峰',level:81,desc:'极昼星冠 · 虹彩相位脊',rarity:'legendary',shell:0xc7d7ed,dark:0x172546,edge:0xffffff,grip:0x5b7296,accent:0xa8a2ff}
];
export const TIMED_SKINS=[{id:'weekly-tower-king',name:'高塔之王',desc:'王冠塔甲 · 鎏金护板 · 青色能量脊',rarity:'legendary',shell:0xba9448,dark:0x112b35,edge:0xffedb1,grip:0x394852,accent:0x55f4ea,variant:60}];
let timedRewards=new Map(),serverClockOffset=0,timedRewardsKnown=false;
export const timedSkinRemaining=id=>Math.max(0,(timedRewards.get(id)||0)-(Date.now()+serverClockOffset));
function acceptTimedRewards(profile){permanentEventRewards=new Set(profile?.permanentEventRewards||profile?.eventRewards||[]);timedRewardsKnown=true;serverClockOffset=Number.isFinite(profile?.serverNow)?profile.serverNow-Date.now():0;timedRewards=new Map((profile?.timedSkins||[]).filter(s=>Number.isFinite(s.expiresAt)).map(s=>[s.skinId,s.expiresAt]));}
const ALL_SKINS=[...SKIN_TIERS.flatMap(t=>t.styles),...LOTTERY_SKINS,...SEASON_SKINS,...ACTIVITY_SKINS,...TIMED_SKINS];
let state={kills:0,claimed:[null,null,null],active:null,drawsUsed:0,drawOwned:[],shards:0};
let trialSkinId=null;
let seasonLevel=0;
let seasonClaims=new Set();
let eventRewards=new Set(),permanentEventRewards=new Set();
const trialClicks=new Map();
function readSkinState(){try{const saved=JSON.parse(localStorage.getItem(STORAGE)||'null');if(saved&&Number.isSafeInteger(saved.kills)&&saved.kills>=0){state.kills=saved.kills;state.claimed=SKIN_TIERS.map((tier,i)=>tier.styles.some(s=>s.id===saved.claimed?.[i])?saved.claimed[i]:null);state.drawsUsed=Number.isSafeInteger(saved.drawsUsed)?Math.max(0,Math.min(saved.drawsUsed,Math.floor(state.kills/15))):0;state.drawOwned=Array.isArray(saved.drawOwned)?[...new Set(saved.drawOwned.filter(id=>LOTTERY_SKINS.some(s=>s.id===id)))]:[];state.shards=Number.isSafeInteger(saved.shards)?Math.max(0,saved.shards):0;state.active=state.claimed.includes(saved.active)||state.drawOwned.includes(saved.active)||SEASON_SKINS.some(s=>s.id===saved.active)||ACTIVITY_SKINS.some(s=>s.id===saved.active)||TIMED_SKINS.some(s=>s.id===saved.active)?saved.active:null}else state={kills:0,claimed:[null,null,null],active:null,drawsUsed:0,drawOwned:[],shards:0}}catch{state={kills:0,claimed:[null,null,null],active:null,drawsUsed:0,drawOwned:[],shards:0}}}
readSkinState();
const save=()=>{try{localStorage.setItem(STORAGE,JSON.stringify(state))}catch{}};
const skinTextures=new Map();
const previewUrls=new Map();
function skinPattern(skin){
  if(skinTextures.has(skin.id))return skinTextures.get(skin.id);
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=256;
  const ctx=canvas.getContext('2d');
  const hex=value=>`#${value.toString(16).padStart(6,'0')}`;
  const accent=hex(skin.accent),edge=hex(skin.edge),dark=hex(skin.dark);
  const line=(points,color=accent,width=5)=>{ctx.beginPath();ctx.moveTo(...points[0]);for(const point of points.slice(1))ctx.lineTo(...point);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke()};
  const polygon=(points,fill,stroke=edge,width=3)=>{ctx.beginPath();ctx.moveTo(...points[0]);for(const point of points.slice(1))ctx.lineTo(...point);ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke()}};
  const gradient=ctx.createLinearGradient(0,0,512,256);gradient.addColorStop(0,`${dark}dd`);gradient.addColorStop(.55,`${hex(skin.shell)}aa`);gradient.addColorStop(1,`${dark}ee`);polygon([[8,38],[426,17],[502,77],[481,218],[65,240],[9,195]],gradient,`${edge}aa`,5);
  line([[16,47],[425,25],[492,82]],`${accent}bb`,5);line([[62,231],[475,210]],`${accent}88`,4);
  for(let i=0;i<9;i++){const x=30+i*54;line([[x,53],[x+17,52]],`${edge}bb`,2);line([[x,205],[x+22,204]],`${edge}88`,2)}
  if(skin.id==='weekly-tower-king'){
    for(let i=0;i<5;i++){const x=40+i*96;polygon([[x,183],[x,95],[x+16,95],[x+16,59],[x+34,59],[x+34,86],[x+52,47],[x+70,86],[x+70,59],[x+87,59],[x+87,183]],`${dark}ee`,edge,4);for(let y=116;y<179;y+=20)line([[x+14,y],[x+73,y]],accent,5)}line([[29,207],[480,207]],edge,7);
  }else if(skin.id==='glacier'){
    for(let i=0;i<7;i++){const x=58+i*65;polygon([[x,70],[x+38,51],[x+61,106],[x+24,134]],`${edge}88`,`${accent}ee`,2);line([[x+25,132],[x+58,177],[x+81,152]],accent,4)}
    line([[73,189],[196,153],[297,179],[432,99]],'#ffffff',3);
  }else if(skin.id==='ember'){
    for(let i=0;i<7;i++){const x=48+i*65;polygon([[x,192],[x+19,74],[x+34,59],[x+17,171]],`${accent}bb`,null);line([[x+18,190],[x+53,124],[x+48,80]],'#ffca78',3)}
    for(let i=0;i<6;i++){ctx.fillStyle=i%2?'#ffda86':'#ff5b35';ctx.fillRect(80+i*68,145-i%3*24,6,6)}
  }else if(skin.id==='moss'){
    for(let i=0;i<7;i++){const x=52+i*65,y=68+(i%3)*31;polygon([[x,y],[x+32,y-13],[x+51,y+16],[x+18,y+31]],i%2?'#334c37cc':'#91b783bb',`${accent}99`,2);line([[x+3,y+55],[x+55,y+48]],accent,3)}
  }else if(skin.id==='nebula'){
    for(let i=0;i<13;i++){const x=42+i*35,y=72+(i*47)%109,r=i%4===0?5:2;ctx.fillStyle=i%3===0?'#ffffff':accent;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();if(i%3===0)line([[x-10,y],[x+10,y]],`${accent}aa`,2)}
    line([[44,171],[125,92],[197,148],[291,75],[364,138],[461,85]],`${edge}bb`,3);
  }else if(skin.id==='aurora'){
    for(let i=0;i<5;i++){ctx.beginPath();ctx.moveTo(30,78+i*23);ctx.bezierCurveTo(172,-15+i*36,225,216+i*4,478,65+i*23);ctx.strokeStyle=i%2?`${accent}aa`:`${edge}dd`;ctx.lineWidth=13-i;ctx.stroke()}
    for(let i=0;i<7;i++)polygon([[65+i*61,161],[85+i*61,122],[110+i*61,180]],`${accent}55`,null);
  }else if(skin.id==='copper'){
    for(let i=0;i<6;i++){const x=52+i*72;polygon([[x,65],[x+49,65],[x+62,115],[x+49,170],[x,170],[x-12,115]],`${dark}88`,accent,3);line([[x+8,116],[x+42,116]],edge,5);ctx.beginPath();ctx.arc(x+25,116,13,0,Math.PI*2);ctx.strokeStyle=accent;ctx.lineWidth=3;ctx.stroke()}
  }else if(skin.id==='void'){
    polygon([[58,149],[179,63],[214,101],[313,54],[450,119],[320,144],[274,204],[163,172]],'#090917dd',accent,7);
    line([[38,193],[145,132],[209,150],[273,80],[339,121],[473,45]],'#f4c5ff',8);line([[67,81],[156,101],[186,58],[281,116],[356,77],[435,179]],accent,5);
    for(let i=0;i<5;i++)polygon([[117+i*67,54],[135+i*67,24],[150+i*67,69]],`${accent}cc`,null);
  }else if(skin.id==='nova'){
    const cx=258,cy=122;for(let i=0;i<17;i++){const a=i*Math.PI*2/17;line([[cx+Math.cos(a)*42,cy+Math.sin(a)*42],[cx+Math.cos(a)*190,cy+Math.sin(a)*90]],i%2?'#fff4ca':accent,i%2?4:7)}
    ctx.beginPath();ctx.arc(cx,cy,37,0,Math.PI*2);ctx.fillStyle='#fff5d6';ctx.fill();ctx.strokeStyle=accent;ctx.lineWidth=10;ctx.stroke();
    polygon([[31,199],[113,159],[190,195],[338,195],[419,159],[493,199]],`${accent}99`,edge,3);
  }else if(skin.id==='tide'){
    for(let i=0;i<6;i++){ctx.beginPath();ctx.moveTo(27,80+i*29);ctx.bezierCurveTo(144,5+i*28,166,202+i*17,306,111+i*12);ctx.bezierCurveTo(388,58+i*18,418,90+i*23,488,73+i*21);ctx.strokeStyle=i%2?accent:edge;ctx.lineWidth=9-i*.7;ctx.stroke()}
    for(let i=0;i<8;i++){ctx.beginPath();ctx.arc(68+i*54,105+(i*29)%94,5+i%3*2,0,Math.PI*2);ctx.strokeStyle='#d8fbff';ctx.lineWidth=2;ctx.stroke()}
  }else if(skin.id.startsWith('season-s1-')){
    const index=SEASON_SKINS.findIndex(item=>item.id===skin.id);
    const star=(cx,cy,r,points=6)=>{const outline=[];for(let i=0;i<points*2;i++){const a=i*Math.PI/points-Math.PI/2,reach=i%2?r*.47:r;outline.push([cx+Math.cos(a)*reach,cy+Math.sin(a)*reach])}polygon(outline,`${accent}bb`,edge,2)};
    if(index===0){for(let i=0;i<8;i++){const x=35+i*61;polygon([[x,76],[x+27,60],[x+54,79],[x+54,176],[x+27,190],[x,174]],i%2?`${dark}cc`:`${edge}66`,accent,2);line([[x+27,66],[x+27,185]],`${edge}cc`,3)}}
    if(index===1){for(let i=0;i<9;i++){const x=27+i*58;polygon([[x,70],[x+50,84],[x+33,176],[x-12,165]],i%2?`${edge}99`:`${accent}66`,edge,2);line([[x+48,84],[x-10,165]],'#ffffff',2)}}
    if(index===2){for(let i=0;i<7;i++){const x=51+i*69;polygon([[x,175],[x+16,72],[x+41,109],[x+54,68],[x+67,177]],`${accent}88`,edge,2);star(x+34,117,15,8)}}
    if(index===3){for(let i=0;i<7;i++){const x=57+i*65;polygon([[x,116],[x+28,60],[x+56,116],[x+28,182]],`${edge}77`,accent,3);line([[x,116],[x+56,116]],'#ffffff',2);line([[x+28,60],[x+28,182]],'#ffffff',2)}}
    if(index===4){for(let i=0;i<7;i++){const x=48+i*69;polygon([[x,80],[x+18,117],[x+36,64],[x+53,118],[x+70,79],[x+59,181],[x+11,181]],`${dark}ee`,edge,3);line([[x+13,171],[x+35,123],[x+57,171]],accent,5)}}
    if(index===5){for(let i=0;i<6;i++){const x=40+i*82;polygon([[x,183],[x+26,52],[x+55,141],[x+81,62],[x+71,190]],`${accent}66`,edge,3);star(x+45,117,21,7)}for(let i=0;i<17;i++)star(24+i*29,48+(i*41)%151,3,4)}
    if(index===6){for(let i=0;i<5;i++){const x=49+i*101;ctx.beginPath();ctx.arc(x+27,123,39,Math.PI*.1,Math.PI*1.85);ctx.strokeStyle=accent;ctx.lineWidth=9;ctx.stroke();polygon([[x+7,103],[x+53,86],[x+71,133],[x+28,160]],`${edge}77`,accent,3);line([[x-4,177],[x+73,66]],'#eaffff',3)}}
    if(index===7){for(let i=0;i<7;i++){const x=39+i*70;polygon([[x,183],[x+8,86],[x+26,110],[x+36,44],[x+50,114],[x+67,78],[x+76,183]],`${dark}ee`,accent,4);line([[x+16,165],[x+37,98],[x+62,165]],edge,4)}}
    if(index===8){const cx=256,cy=122;for(let i=0;i<16;i++){const a=i*Math.PI/8;line([[cx+Math.cos(a)*47,cy+Math.sin(a)*38],[cx+Math.cos(a)*178,cy+Math.sin(a)*105]],i%2?accent:edge,4)}ctx.beginPath();ctx.ellipse(cx,cy,49,38,0,0,Math.PI*2);ctx.fillStyle=dark;ctx.fill();ctx.strokeStyle=edge;ctx.lineWidth=10;ctx.stroke();star(cx,cy,29,8);for(let i=0;i<9;i++)star(27+i*58,46+(i*37)%143,5,5)}
  }else if(skin.id.startsWith('event-')){
    const id=skin.id;
    const ring=(x,y,r,color,width=4)=>{ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke()};
    if(id==='event-warrior-gold'){
      polygon([[34,167],[79,82],[132,128],[174,58],[217,134],[259,52],[303,130],[349,67],[397,122],[465,75],[478,188],[35,202]],`${dark}dd`,edge,5);
      for(let i=0;i<6;i++){const x=63+i*76;polygon([[x,168],[x+19,91],[x+38,147],[x+58,75],[x+50,183]],i%2?`${accent}aa`:`${edge}aa`,edge,2);line([[x+8,166],[x+29,114],[x+46,165]],'#fff1bd',3)}
      ring(258,126,46,edge,10);ring(258,126,32,accent,6);polygon([[258,83],[268,113],[298,111],[275,130],[282,163],[258,145],[234,163],[241,130],[218,111],[248,113]],'#fff4cb',accent,3);
    }else if(id==='event-warrior-silver'){
      for(let i=0;i<5;i++){const x=39+i*100;polygon([[x,161],[x+20,87],[x+49,128],[x+78,71],[x+89,166],[x+48,186]],`${edge}88`,accent,3);line([[x+13,160],[x+48,129],[x+75,159]],'#ffffff',3)}
      for(let i=0;i<4;i++){ctx.beginPath();ctx.ellipse(252,126,42+i*29,25+i*15,-.2,0,Math.PI*2);ctx.strokeStyle=i%2?accent:edge;ctx.lineWidth=3;ctx.stroke()}polygon([[252,84],[274,125],[252,165],[230,125]],'#edfbff',accent,4);
    }else if(id==='event-warrior-bronze'){
      for(let i=0;i<6;i++){const x=41+i*79;polygon([[x,82],[x+36,66],[x+70,84],[x+62,164],[x+35,189],[x+7,163]],i%2?`${dark}ee`:`${accent}77`,edge,4);line([[x+16,99],[x+35,122],[x+55,98]],'#ffdb9a',4);ring(x+35,145,13,accent,4)}
      line([[30,195],[110,172],[188,196],[266,172],[344,196],[421,172],[480,191]],edge,5);
    }else if(id==='event-ranked-apex'){
      polygon([[36,191],[94,109],[145,161],[194,48],[256,126],[315,45],[365,157],[422,100],[478,189]],`${dark}ee`,accent,6);
      for(let i=0;i<12;i++){const a=i*Math.PI/6;line([[257+Math.cos(a)*47,125+Math.sin(a)*35],[257+Math.cos(a)*137,125+Math.sin(a)*91]],i%2?accent:edge,3)}
      ctx.beginPath();ctx.ellipse(257,125,53,39,0,0,Math.PI*2);ctx.fillStyle=dark;ctx.fill();ctx.strokeStyle=edge;ctx.lineWidth=8;ctx.stroke();polygon([[257,91],[271,114],[296,125],[271,137],[257,160],[243,137],[218,125],[243,114]],'#f2e5ff',accent,4);
      for(let i=0;i<8;i++){const x=52+i*57;ring(x,59+(i*29)%138,3,'#f9eaff',2)}
    }else if(id==='event-breach-apex'){
      for(let i=0;i<7;i++){const x=38+i*69;polygon([[x,77],[x+54,57],[x+67,107],[x+47,182],[x+2,169]],i%2?`${dark}ee`:`${accent}77`,edge,3);line([[x+8,166],[x+53,75]],accent,4)}
      ring(257,125,47,edge,8);ring(257,125,35,accent,5);ring(257,125,23,'#fff0ce',3);line([[257,125],[257,101]],'#ffffff',5);line([[257,125],[275,136]],'#ffffff',5);
      for(let i=0;i<8;i++){const a=i*Math.PI/4;polygon([[257+Math.cos(a)*60,125+Math.sin(a)*60],[257+Math.cos(a+.12)*78,125+Math.sin(a+.12)*78],[257+Math.cos(a-.12)*78,125+Math.sin(a-.12)*78]],accent,null)}
    }
  }else if(skin.id.startsWith('draw-')){
    const v=skin.variant,rare=skin.rarity!=='common',epic=skin.rarity==='epic'||skin.rarity==='legendary',legend=skin.rarity==='legendary';
    for(let i=0;i<7;i++){const x=42+i*69,phase=(i*31+v*17)%65;
      if(v%4===0)polygon([[x,72+phase],[x+42,53+phase],[x+59,93+phase],[x+17,116+phase]],i%2?`${accent}77`:`${edge}88`,`${edge}cc`,2);
      if(v%4===1){line([[x,62],[x+32,102+phase],[x+9,168],[x+63,195]],i%2?edge:accent,7);line([[x+13,80],[x+43,109+phase]],`${dark}dd`,3)}
      if(v%4===2){ctx.beginPath();ctx.arc(x+22,115,22+phase*.25,0,Math.PI*2);ctx.strokeStyle=i%2?edge:accent;ctx.lineWidth=5;ctx.stroke();line([[x+22,87],[x+22,143]],`${accent}99`,2)}
      if(v%4===3){polygon([[x,171],[x+25,66],[x+49,96],[x+64,170]],i%2?`${accent}aa`:`${dark}cc`,edge,2);line([[x+10,173],[x+34,107]],accent,3)}
    }
    if(rare)for(let i=0;i<12;i++){const x=33+(i*43+v*19)%448,y=60+(i*53+v*11)%130;polygon([[x,y-4],[x+5,y],[x,y+4],[x-5,y]],i%3?accent:'#ffffff',null)}
    if(epic){line([[35,187],[127,153],[201,188],[294,76],[372,132],[479,62]],`${edge}dd`,5);line([[42,196],[130,161],[206,197],[300,85],[378,141],[485,71]],accent,2)}
    if(legend){const cx=258,cy=121;for(let i=0;i<14;i++){const a=i*Math.PI*2/14;line([[cx+Math.cos(a)*42,cy+Math.sin(a)*34],[cx+Math.cos(a)*100,cy+Math.sin(a)*77]],i%2?edge:accent,3)}ctx.beginPath();ctx.ellipse(cx,cy,42,32,0,0,Math.PI*2);ctx.fillStyle=dark;ctx.fill();ctx.strokeStyle=edge;ctx.lineWidth=8;ctx.stroke();ctx.beginPath();ctx.ellipse(cx,cy,16,12,0,0,Math.PI*2);ctx.fillStyle=accent;ctx.fill()}
  }
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;skinTextures.set(skin.id,texture);return texture;
}
export function activeSkin(){const skin=ALL_SKINS.find(s=>s.id===(trialSkinId||state.active))||null;if(!skin)return null;if(skin.id==='weekly-tower-king')return timedSkinRemaining(skin.id)>0?skin:null;if(trialSkinId===skin.id)return skin;if(skin.id.startsWith('event-'))return eventRewards.has(skin.id)&&(!timedRewards.has(skin.id)||permanentEventRewards.has(skin.id)||timedSkinRemaining(skin.id)>0)?skin:null;return !skin.level||seasonClaims.has(skin.id)?skin:null}
export function skinById(id){return ALL_SKINS.find(s=>s.id===id)||null}
// Standalone worlds reuse Main's unlock checks, finishes and batched silhouettes.
export function syncSkinProfile(profile,models){readSkinState();acceptTimedRewards(profile);seasonLevel=Math.max(0,Number(profile?.season?.level)||0);seasonClaims=new Set(profile?.seasonClaims||[]);eventRewards=new Set(profile?.eventRewards||[]);applySkin(models)}
export function applySkin(models){const skin=activeSkin(),legendary=Boolean(skin&&(state.claimed[2]===skin.id||skin.rarity==='legendary')),pattern=skin?skinPattern(skin):null;for(const model of Object.values(models)){model.userData.setSkinSilhouette?.(skin?.id??null);const materials=model.userData.skinMaterials,base=model.userData.baseColors;if(!materials)continue;for(const [slot,material] of Object.entries(materials)){material.color.setHex(skin?.[slot]??base[slot]);material.metalness=skin?slot==='grip'?.3:.78:slot==='grip'?.16:.72;material.roughness=skin?slot==='grip'?.72:slot==='dark'?.42:.26:slot==='grip'?.88:.4;if(slot==='accent'){material.emissive.setHex(skin?.accent??base.accent);material.emissiveIntensity=legendary?.85:.42}}const detail=model.userData.skinDetail;if(detail){detail.group.visible=Boolean(skin);for(const [id,shape] of Object.entries(detail.styles))shape.visible=skin?.id===id;detail.legendary.visible=legendary;detail.void.visible=skin?.id==='void';detail.nova.visible=skin?.id==='nova';detail.tide.visible=skin?.id==='tide';if(detail.drawEpic)detail.drawEpic.visible=skin?.rarity==='epic'||skin?.rarity==='legendary';if(detail.drawLegendary)detail.drawLegendary.visible=skin?.rarity==='legendary';detail.plate.color.setHex(skin?.edge??0xffffff);detail.plate.metalness=.88;detail.light.color.setHex(skin?.accent??0xffffff);detail.light.emissive.setHex(skin?.accent??0xffffff);detail.light.emissiveIntensity=legendary?1.9:.8;detail.decalMaterial.map=pattern;detail.decalMaterial.needsUpdate=true}}}
export function updateSkinPulse(model,time){const skin=activeSkin();if(!model?.userData.skinDetail||!skin||!(state.claimed[2]===skin.id||skin.rarity==='legendary'))return;model.userData.skinDetail.light.emissiveIntensity=1.5+Math.sin(time*.003)*.42}
let rerender=()=>{};
export function recordKill(){state.kills++;save();rerender()}
export function initSkinScreen(models){
  const screen=document.getElementById('skinsScreen'),tiers=document.getElementById('skinTiers'),progress=document.getElementById('skinProgress');
  const drawSection=document.getElementById('skinDrawSection');
  const trialDescription=skin=>trialSkinId===skin.id?'试用中 · 刷新失效':skin.desc;
  const tapTrial=skin=>{
    const count=(trialClicks.get(skin.id)||0)+1;
    if(count<10){trialClicks.set(skin.id,count);return}
    trialClicks.delete(skin.id);
    if(prompt('输入验证码')?.trim()!=='131421')return;
    trialSkinId=skin.id;applySkin(models);render();
  };
  const makeCard=(skin,rarity,description)=>{
    const button=document.createElement('button');button.type='button';button.className='skinCard';button.dataset.rarity=rarity;button.dataset.skin=skin.id;button.classList.toggle('selected',trialSkinId===skin.id||!trialSkinId&&state.active===skin.id);
    for(const slot of ['shell','dark','edge','accent'])button.style.setProperty('--'+slot,'#'+skin[slot].toString(16).padStart(6,'0'));
    const swatch=document.createElement('i');swatch.className='skinSwatch';
    for(const part of ['barrel','body','rail','stock','grip','mag','core','mark']){const piece=document.createElement('em');piece.className='skinPreview-'+part;if(part==='body'){if(!previewUrls.has(skin.id))previewUrls.set(skin.id,skinPattern(skin).image.toDataURL());piece.style.backgroundImage=`url("${previewUrls.get(skin.id)}")`}swatch.append(piece)}
    const name=document.createElement('b');name.textContent=skin.name;const desc=document.createElement('small');desc.textContent=description;button.append(swatch,name,desc);return button;
  };
  function render(){
    if(!document.getElementById('knifeSkinTiers').hidden)return;
    progress.textContent=`累计击杀 ${state.kills} 次 · 任务皮肤与抽奖皮肤共用一个装备位`;
    tiers.replaceChildren();
    SKIN_TIERS.forEach((tier,index)=>{
      const section=document.createElement('section');section.className='skinsTier';const heading=document.createElement('h3');heading.textContent=`${tier.name} · ${tier.kills} 击杀`;
      const note=document.createElement('small');note.textContent=state.claimed[index]?'本档已领取，可切换为当前展示':state.kills>=tier.kills?'任务已完成：从三套中选定一套':'还需 '+(tier.kills-state.kills)+' 次击杀解锁';
      const cards=document.createElement('div');cards.className='skinCards';
      for(const skin of tier.styles){
        const available=state.claimed[index]===skin.id||state.kills>=tier.kills&&!state.claimed[index];
        const description=trialSkinId===skin.id?trialDescription(skin):available?(state.active===skin.id?'使用中':state.claimed[index]===skin.id?'点击使用':skin.desc):trialDescription(skin);
        const button=makeCard(skin,index===2?'legendary':index===1?'rare':'common',description);
        button.onclick=()=>{
          if(!available){tapTrial(skin);return}
          if(!state.claimed[index]){if(!confirm(`确定领取「${skin.name}」？${tier.name}等级只能领取这一套。`))return;state.claimed[index]=skin.id}
          trialSkinId=null;state.active=skin.id;save();applySkin(models);render();
        };
        cards.append(button)
      }section.append(heading,note,cards);tiers.append(section)
    });
    const tickets=Math.max(0,Math.floor(state.kills/15)-state.drawsUsed);
    drawSection.replaceChildren();
    const head=document.createElement('div');head.className='skinDrawHead';const info=document.createElement('div');const h=document.createElement('h3');h.textContent='星隙补给 · 抽奖枪皮';const stat=document.createElement('small');stat.textContent=`每 15 次击杀得 1 抽 · 可抽 ${tickets} 次 · 已收藏 ${state.drawOwned.length}/20 · 碎片 ${state.shards}`;info.append(h,stat);
    const drawButton=document.createElement('button');drawButton.type='button';drawButton.textContent='抽取 1 次';drawButton.disabled=tickets<1;drawButton.onclick=()=>{
      if(Math.floor(state.kills/15)<=state.drawsUsed)return;
      const random=new Uint32Array(2);crypto.getRandomValues(random);const roll=random[0]/4294967296*100;let total=0;const rarity=LOTTERY_RARITIES.find(r=>(total+=r.weight)>roll)||LOTTERY_RARITIES.at(-1);const pool=LOTTERY_SKINS.filter(s=>s.rarity===rarity.id);const skin=pool[random[1]%pool.length];state.drawsUsed++;
      const repeated=state.drawOwned.includes(skin.id);if(repeated)state.shards+=rarity.shards;else state.drawOwned.push(skin.id);
      save();render();document.getElementById('skinDrawResult').textContent=repeated?`抽到重复的「${skin.name}」，转为 ${rarity.shards} 碎片`:`抽到 ${rarity.name}「${skin.name}」！已加入收藏，点击下方卡片装备。`;
    };head.append(info,drawButton);drawSection.append(head);
    const odds=document.createElement('small');odds.className='skinDrawOdds';odds.textContent='概率：普通 50% · 稀有 30% · 史诗 15% · 传说 5%。重复获得碎片，可兑换未拥有的皮肤。';drawSection.append(odds);
    const result=document.createElement('p');result.id='skinDrawResult';result.className='skinDrawResult';result.setAttribute('aria-live','polite');drawSection.append(result);
    for(const rarity of LOTTERY_RARITIES){
      const section=document.createElement('section');section.className='skinsTier';
      const heading=document.createElement('h4');heading.textContent=`${rarity.name} · ${LOTTERY_SKINS.filter(s=>s.rarity===rarity.id).length} 款`;
      const cards=document.createElement('div');cards.className='skinCards';
      for(const skin of LOTTERY_SKINS.filter(s=>s.rarity===rarity.id)){
        const owned=state.drawOwned.includes(skin.id);
        const description=trialSkinId===skin.id?trialDescription(skin):owned?(state.active===skin.id?'使用中':'点击装备'):`未拥有 · 需要 ${rarity.cost} 碎片`;
        const slot=document.createElement('div');slot.className='skinCardSlot';
        const button=makeCard(skin,rarity.id,description);button.classList.toggle('locked',!owned);
        button.onclick=()=>{if(!owned){tapTrial(skin);return}trialSkinId=null;state.active=skin.id;save();applySkin(models);render()};
        slot.append(button);
        if(!owned){
          const redeem=document.createElement('button');redeem.type='button';redeem.className='skinRedeem';
          redeem.textContent=`兑换 · ${rarity.cost} 碎片`;redeem.disabled=state.shards<rarity.cost;
          redeem.onclick=()=>{if(state.shards<rarity.cost||!confirm(`使用 ${rarity.cost} 碎片兑换「${skin.name}」？`))return;state.shards-=rarity.cost;state.drawOwned.push(skin.id);trialSkinId=null;state.active=skin.id;save();applySkin(models);render()};
          slot.append(redeem);
        }
        cards.append(slot);
      }
      section.append(heading,cards);drawSection.append(section);
    }
    const season=document.createElement('section');season.className='skinsTier seasonSkins';
    const seasonHeading=document.createElement('h3');seasonHeading.textContent='S1 赛季 · 称号奖励';
    const seasonNote=document.createElement('small');seasonNote.textContent=seasonLevel?`当前 ${seasonLevel} 级 · 达到等级后去赛季页面领取`:'登录账号后查看赛季奖励';
    const seasonCards=document.createElement('div');seasonCards.className='skinCards';
    for(const skin of SEASON_SKINS){
      const owned=seasonClaims.has(skin.id);
      const description=owned?(state.active===skin.id?'使用中':'点击装备'):seasonLevel>=skin.level?'前往赛季页面领取':`达到 ${skin.level} 级解锁`;
      const card=makeCard(skin,skin.rarity,description);card.classList.toggle('locked',!owned);
      card.onclick=()=>{if(!owned){tapTrial(skin);return}trialSkinId=null;state.active=skin.id;save();applySkin(models);render()};
      seasonCards.append(card);
    }
    season.append(seasonHeading,seasonNote,seasonCards);drawSection.append(season);
    const activity=document.createElement('section');activity.className='skinsTier activitySkins';
    const activityHeading=document.createElement('h3');activityHeading.textContent='活动枪皮 · 荣誉专栏';
    const activityNote=document.createElement('small');activityNote.textContent='赛事荣誉外观 · 获奖后在赛事页面领取';
    const activityCards=document.createElement('div');activityCards.className='skinCards';
    for(const skin of ACTIVITY_SKINS){
      const owned=eventRewards.has(skin.id)&&(!timedRewards.has(skin.id)||permanentEventRewards.has(skin.id)||timedSkinRemaining(skin.id)>0),button=makeCard(skin,skin.rarity,owned?(state.active===skin.id?'使用中':'点击装备'):`未获得 · ${skin.desc}`);
      button.classList.toggle('locked',!owned);
      button.onclick=()=>{if(!owned){tapTrial(skin);return}trialSkinId=null;state.active=skin.id;save();applySkin(models);render()};
      if(owned&&timedRewards.has(skin.id)&&!permanentEventRewards.has(skin.id)){const expiry=document.createElement('small');expiry.dataset.towerExpiry=skin.id;button.append(expiry)}activityCards.append(button);
    }
    activity.append(activityHeading,activityNote,activityCards);drawSection.append(activity);
    const weekly=document.createElement('section');weekly.className='skinsTier';const title=document.createElement('h3');title.textContent='高塔生存 · 周冠军';const cards=document.createElement('div');cards.className='skinCards';for(const skin of TIMED_SKINS){const owned=timedSkinRemaining(skin.id)>0,button=makeCard(skin,skin.rarity,owned?'':'本周冠军队伍奖励 · 7 天');button.classList.toggle('locked',!owned);if(owned){const timer=document.createElement('small');timer.dataset.towerExpiry=skin.id;button.append(timer);button.children[2].textContent=state.active===skin.id?'使用中':'点击装备'}button.onclick=()=>{if(!timedSkinRemaining(skin.id))return;trialSkinId=null;state.active=skin.id;save();applySkin(models);render()};cards.append(button)}weekly.append(title,cards);drawSection.append(weekly);updateTimedLabels();
  }
  function updateTimedLabels(){for(const node of document.querySelectorAll('[data-tower-expiry]')){const seconds=Math.ceil(timedSkinRemaining(node.dataset.towerExpiry)/1000);node.textContent='剩余 '+Math.floor(seconds/86400)+'天 '+Math.floor(seconds%86400/3600)+'时 '+Math.floor(seconds%3600/60)+'分 '+seconds%60+'秒'}}
  setInterval(()=>{updateTimedLabels();if(timedRewardsKnown&&timedRewards.has(state.active)&&!permanentEventRewards.has(state.active)&&!trialSkinId&&!timedSkinRemaining(state.active)){state.active=null;save();applySkin(models);rerender()}},1000);
  rerender=()=>{if(!screen.hidden)render()};
  addEventListener('astrift:account-changed',event=>{if(event.detail?.action==='login'){readSkinState();trialSkinId=null}acceptTimedRewards(event.detail?.profile);seasonLevel=Math.max(0,Number(event.detail?.profile?.season?.level)||0);seasonClaims=new Set(event.detail?.profile?.seasonClaims||[]);eventRewards=new Set(event.detail?.profile?.eventRewards||[]);applySkin(models);rerender()});
  addEventListener('astrift:account-profile',event=>{acceptTimedRewards(event.detail);seasonLevel=Math.max(0,Number(event.detail?.season?.level)||0);seasonClaims=new Set(event.detail?.seasonClaims||[]);eventRewards=new Set(event.detail?.eventRewards||[]);applySkin(models);rerender()});
  document.getElementById('openSkins').onclick=()=>{screen.hidden=false;document.getElementById('knifeSkinTiers').hidden=true;drawSection.hidden=false;render()};
  document.getElementById('closeSkins').onclick=()=>{
    screen.hidden=true;tiers.replaceChildren();drawSection.replaceChildren();previewUrls.clear();
    const equipped=activeSkin()?.id;
    for(const [id,texture] of skinTextures)if(id!==equipped){texture.dispose();skinTextures.delete(id)}
  };applySkin(models);return render;
}
