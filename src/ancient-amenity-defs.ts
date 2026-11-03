// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
export type AmenityKind='seat'|'bed'|'cook'|'plant';
export type AmenityUse={kind:AmenityKind;x?:number;y?:number;z?:number;depth?:number};
export const GARDEN_CROPS=[
 {id:'carrot',name:['胡萝卜','Carrot'],seconds:60,yield:3,color:'#e58c36',form:'root'},
 {id:'tomato',name:['番茄','Tomato'],seconds:90,yield:3,color:'#cb4f3d',form:'vine'},
 {id:'potato',name:['土豆','Potato'],seconds:100,yield:3,color:'#ae8c5d',form:'root'},
 {id:'wheat',name:['小麦','Wheat'],seconds:120,yield:3,color:'#d9b75c',form:'grain'},
 {id:'cabbage',name:['卷心菜','Cabbage'],seconds:90,yield:2,color:'#86ad64',form:'leaf'},
 {id:'pumpkin',name:['南瓜','Pumpkin'],seconds:180,yield:2,color:'#d8923e',form:'fruit'},
 {id:'mushroom',name:['蘑菇','Mushroom'],seconds:75,yield:3,color:'#bda98b',form:'mushroom'},
 {id:'herb',name:['香草','Herb'],seconds:80,yield:3,color:'#6aab78',form:'herb'},
 {id:'strawberry',name:['草莓','Strawberry'],seconds:110,yield:3,color:'#d85a66',form:'berry'},
 {id:'sunflower',name:['向日葵','Sunflower'],seconds:150,yield:3,color:'#e6c351',form:'flower'},
 {id:'mint',name:['薄荷','Mint'],seconds:70,yield:3,color:'#73b8a1',form:'herb'},
 {id:'rice',name:['水稻','Rice'],seconds:130,yield:3,color:'#b9b778',form:'grain'}
] as const;
export const COMMUNITY_RECIPES=[
 {id:'salad',name:['田园沙拉','Garden salad'],take:{carrot:1,tomato:1,cabbage:1},seconds:6,heal:.08},
 {id:'roastedPotato',name:['香草烤土豆','Herb-roasted potatoes'],take:{potato:2,herb:1},seconds:8,heal:.1},
 {id:'stew',name:['蔬菜炖锅','Vegetable stew'],take:{carrot:1,potato:1,cabbage:1},seconds:10,heal:.12},
 {id:'porridge',name:['麦香米粥','Wheat and rice porridge'],take:{wheat:2,rice:1},seconds:8,heal:.1},
 {id:'berryTart',name:['草莓麦饼','Strawberry wheat cake'],take:{strawberry:2,wheat:1},seconds:12,heal:.15},
 {id:'tea',name:['薄荷香草茶','Mint and herb tea'],take:{mint:1,herb:1},seconds:6,heal:.06},
 {id:'mushroomSoup',name:['香草蘑菇汤','Herbed mushroom soup'],take:{mushroom:2,herb:1},seconds:9,heal:.12},
 {id:'pumpkinSoup',name:['南瓜浓汤','Pumpkin soup'],take:{pumpkin:2,rice:1},seconds:12,heal:.18},
 {id:'sunflowerSnack',name:['烘烤葵花籽','Roasted sunflower seeds'],take:{sunflower:2},seconds:6,heal:.06}
] as const;
export const AMENITY_ITEMS=[...GARDEN_CROPS.map(c=>({id:'garden_'+c.id,name:[...c.name] as [string,string]})),...COMMUNITY_RECIPES.map(r=>({id:'meal_'+r.id,name:[...r.name] as [string,string]}))];
export type GardenPlot={crop:string;planted:number;ready:number;watered:boolean;by:string};
export type AmenityJob={recipe:string;started:number;ends:number;anchor:string};
export type AmenityPose={id:string;kind:'seat'|'bed';started:number;yaw:number;anchor:{x:number;y:number;z:number};camera:{x:number;y:number;z:number};returnTo:{x:number;y:number;z:number;yaw:number}};
