// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
// Game color/pattern varieties, independent of the existing jade clarity grades.
import {naturalJadePattern} from './patterns';
export const JADE_VARIETIES=[
 ['imperial','帝王绿','Imperial Green','#07864c','#004f32','#59dc80',1,2.2,1,'浓绿凝聚，深处有丝绒般的色根。','Saturated emerald with deep, velvet color roots.'],
 ['sunlit','阳绿','Sunlit Green','#5dd54b','#189347','#d4f08c',2,1.45,5,'明亮黄绿，色带如阳光穿过叶片。','Bright yellow-green in sunlit ribbons.'],
 ['apple','苹果绿','Apple Green','#8ac962','#3c9a54','#d8edb5',1,1.05,10,'鲜嫩果绿与柔和浅色云团交织。','Fresh apple green with soft pale clouds.'],
 ['spinach','菠菜绿','Spinach Green','#387d42','#173d31','#92b275',3,1.05,10,'深绿底色中延伸出纤维状脉络。','Dark leafy green threaded with fine veins.'],
 ['bean','豆绿','Bean Green','#98b775','#587c4e','#d4d6a4',8,.8,14,'青豆底色，细碎颗粒清晰可见。','Muted bean green with a granular texture.'],
 ['oil','油青','Oily Blue-Green','#5d8582','#304e52','#a5b9a3',1,.85,12,'灰蓝油润底色，云雾深浅流动。','Oily grey-blue with drifting smoky clouds.'],
 ['bluewater','蓝水','Bluewater','#57a7b9','#25506e','#b6e3df',2,1.3,6,'湖蓝色肉中有流动的深浅水纹。','Lake blue with flowing, layered water lines.'],
 ['clearwater','晴水','Clearwater','#acd7b9','#6bafac','#e7f2d6',1,1.2,8,'浅青与淡绿相融，像雨后的天空。','Pale cyan and green like a sky after rain.'],
 ['violet','紫罗兰','Violet','#ae7fca','#714b9d','#e6c4ef',1,1.5,5,'紫色云絮在淡白玉肉中渐次铺开。','Lavender clouds spreading through pale jade.'],
 ['royalpurple','皇家紫','Royal Purple','#7740b4','#371454','#d49be9',3,2.1,1,'浓紫色根与银紫细脉相互穿插。','Rich purple roots crossed by silver-lilac veins.'],
 ['pink','粉紫','Rose Lavender','#e1adcf','#a36b9c','#f9dfec',1,1.2,7,'柔粉与浅紫混成细腻的花雾。','Rose and lilac blended into a soft floral mist.'],
 ['yellow','黄翡','Golden Yellow','#dfb44f','#a77929','#fae4a0',2,1.05,10,'金黄层带中夹着浅蜜色纹路。','Golden layers lined with pale honey.'],
 ['honey','蜜糖黄','Honey Amber','#bd812e','#75491f','#f1c86c',3,1.2,7,'琥珀蜜色中可见糖浆般的浓色脉。','Amber honey with dark syrup-like veins.'],
 ['red','红翡','Red Jade','#ce5b40','#803326','#f4ac79',2,1.4,6,'朱红到橘红层层过渡，像凝固的晚霞。','Vermilion and orange layers like a sunset.'],
 ['cockscomb','鸡冠红','Crimson Crest','#b52630','#5c1727','#ef7971',3,1.8,2,'深红玉肉里分布鲜亮的火焰色根。','Deep crimson with bright flame-like roots.'],
 ['ink','墨翠','Ink Green','#172e2b','#071816','#22a268',7,1.5,5,'外观近黑，打灯处透出深绿色。','Near-black jade revealing deep green under light.'],
 ['black','乌鸡种','Black Cloud','#ced4cb','#29332e','#88978a',4,.8,12,'黑色斑团散落在灰白玉肉中。','Black mottling scattered through grey-white jade.'],
 ['white','白冰','White Ice','#e2eee7','#afc8c7','#fbfcf5',1,1.15,10,'冷白色肉与极浅的青色水纹。','Cool white with faint cyan water lines.'],
 ['snow','雪花棉','Snowflake','#8ab7b0','#dff1e8','#4c8d91',10,1.25,7,'蓝青底里散着一簇簇白色雪花棉。','White snowflake clusters suspended in blue-green.'],
 ['greenflower','绿飘花','Floating Green','#e0e9d5','#2d9457','#8cc29a',4,1.3,7,'清淡底色上漂浮着分散的翠绿花团。','Scattered emerald blossoms on a pale ground.'],
 ['blueflower','蓝飘花','Floating Blue','#d5e8e4','#377c9c','#91baca',4,1.35,6,'青白玉肉间漂着深浅不同的蓝花。','Blue blossoms drifting through cyan-white jade.'],
 ['spring','春带彩','Spring Colors','#b98bc8','#58b77d','#ede3e8',5,1.7,4,'紫色与绿色在同一块玉肉上交汇。','Lavender and green meet inside the same stone.'],
 ['tricolor','福禄寿','Fortune Tricolor','#b487c7','#5aaf6c','#e1b557',6,2.1,1,'紫、绿、金黄三色交错，切位改变色彩比例。','Purple, green and gold; each cut reveals a different balance.'],
 ['goldthread','金丝种','Golden Threads','#a8cc81','#ead16b','#408d64',9,1.45,5,'浅绿玉肉中有细长金黄丝线。','Fine golden threads running through light green jade.'],
 ['moss','苔藓玉','Moss Veil','#b7c5a5','#3d6c4b','#6f9472',4,.85,10,'苔藓状深色斑纹在浅底中蔓延。','Moss-like dark inclusions spreading through a pale ground.'],
 ['watermelon','西瓜玉','Watermelon','#d88d9c','#55a576','#ece6bd',5,1.15,6,'桃红和翠绿相邻，中间有浅色过渡带。','Rose and green separated by a pale transition band.'],
 ['orchid','兰花紫','Orchid Veins','#d5c2e1','#8756a1','#eee5ed',3,1.3,6,'淡紫底中舒展出兰花般的浓紫脉络。','Orchid-purple veins unfolding in pale lavender.'],
 ['lemon','柠檬黄','Lemon Jade','#e4db82','#9baa64','#faf0ba',8,.95,9,'浅黄与嫩绿交融，带有细小的云点。','Pale yellow and fresh green with tiny cloudy specks.'],
 ['whitegreen','白底青','White-ground Green','#e7ebda','#19764b','#8cb69a',4,1.25,7,'奶白底上自然散开深浅翠色，不规则的色根隐入玉肉。','Emerald blooms diffuse into a creamy white ground.'],
 ['iceblue','冰晴蓝','Glacial Blue','#bfdcde','#5795b0','#eaf4ee',1,1.3,6,'浅冰蓝中浮着轻柔的水雾，色泽从深处缓缓散开。','Soft icy blue with gently diffusing water-like clouds.'],
 ['smokelavender','烟紫','Smoky Lavender','#b6a8c9','#77728e','#e0d7e5',1,1.2,7,'灰紫雾絮层层交织，浓淡边界柔和。','Layered grey-lavender mist with soft, fading edges.'],
 ['lotuspink','藕粉','Lotus Pink','#e8c6c0','#ca9da7','#f4e3d9',1,1.1,9,'温润藕粉带着细腻奶白云团。','Warm lotus pink with delicate creamy clouds.'],
 ['lakegreen','湖水绿','Lagoon Green','#92cbbb','#3f9e91','#d4e7d6',2,1.2,8,'青绿水色深浅相融，柔长色脉缓缓延展。','Layered lagoon green crossed by elongated color roots.'],
 ['sprinkledgold','洒金','Scattered Gold','#d9e2cd','#d3a647','#8cae8d',10,1.35,5,'淡青底上散落不规则的金黄色斑，疏密自然。','Irregular golden flecks scattered through pale cyan jade.'],
 ['redyellow','红黄翡','Sunset Amber','#dcad58','#b96545','#efd49c',11,1.3,6,'蜜黄与暖红相互浸染，像缓慢沉淀的矿物色层。','Honey yellow and warm red blend in mineral-like layers.'],
 ['goldgreen','金包翠','Gold-veiled Green','#cbb56c','#3d8d61','#e7dfb8',5,1.4,5,'柔金色玉肉间透出深绿的色团，边缘并不齐整。','Deep green clouds emerge through irregular golden layers.'],
 ['smokeflower','烟灰飘花','Smoky Blossoms','#d2d9d5','#687f88','#a6b8b3',4,1.15,8,'青灰色花团在淡白底中聚散，如水中晕开的墨。','Cyan-grey blooms disperse like ink through a pale ground.'],
 ['olive','橄榄绿','Olive Green','#a9b77b','#728557','#d8dcb8',1,1.0,10,'橄榄色与柔和草青自然交织，带着低调油润的光泽。','Olive and soft grassy green with a muted, oily luster.'],
 ['peachcloud','桃花玉','Peach Blossom','#e7beb5','#bf8e9e','#f0dcd0',4,1.15,8,'浅粉底中浮着深浅不同的桃红云絮。','Rose-pink clouds float through a pale peach ground.'],
 ['inkwash','青花墨韵','Ink-wash Jade','#d7dfd9','#3c5b5a','#8aaba5',12,1.3,6,'墨青色细脉与雾状色团交织，不再是规整的线条。','Inky cyan veins mingle with misty clouds, without regular stripes.']
].map(([id,name,en,a,b,c,pattern,multiplier,weight,desc,descEn])=>({id:id as string,name:name as string,en:en as string,colors:[a,b,c] as string[],pattern:pattern as number,multiplier:multiplier as number,weight:weight as number,desc:desc as string,descEn:descEn as string}));
export function jadeVariety(id?:string){return JADE_VARIETIES.find(v=>v.id===id);}
export const JADE_PRICE_CAP=6000000;
export const JADE_PRICE_RATES=[4,50,300,5000,85000,3000000];
export function jadeUnitPrice(grade:number,color:number,variety?:string){const quality=Math.max(0,Math.min(1,color));return (JADE_PRICE_RATES[grade]||0)*Math.pow(quality,grade>=3?4:1)*(jadeVariety(variety)?.multiplier||1);}
export function rollJadeVariety(value:number){let n=Math.max(0,Math.min(.999999,value))*JADE_VARIETIES.reduce((n,v)=>n+v.weight,0);return (JADE_VARIETIES.find(v=>(n-=v.weight)<0)||JADE_VARIETIES[0]).id;}
export function jadePattern(pattern:number,p:number[],phase:number){
 return naturalJadePattern(pattern,p,phase);
}
export function jadePigment(id:string|undefined,p:number[],phase:number,light=false){const v=jadeVariety(id);if(!v)return null;const t=jadePattern(v.pattern,p,phase),rgb=(hex:string)=>[0,2,4].map(i=>parseInt(hex.slice(1+i,3+i),16)/255);let a=rgb(v.colors[0]),b=rgb(v.colors[1]);if(v.pattern===6){if(t<.5){b=rgb(v.colors[1]);}else{a=rgb(v.colors[1]);b=rgb(v.colors[2]);}}if(v.pattern===7&&light){a=rgb(v.colors[2]);b=rgb(v.colors[0]);}const k=v.pattern===6?(t<.5?t*2:(t-.5)*2):t;const linear=(c:number)=>c<=.04045?c/12.92:Math.pow((c+.055)/1.055,2.4);return a.map((x,i)=>linear(x)*(1-k)+linear(b[i])*k);}
