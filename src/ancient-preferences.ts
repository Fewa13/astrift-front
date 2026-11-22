// Account-owned controls; layouts remain separate for touch and desktop.
export type AncientPreferences={controls:{bindings:Record<string,string>;desktop:number;mobile:number};layouts:Record<string,Record<string,{x:number;y:number;scale:number}>>;language:'zh'|'en';quality:'smooth'|'balanced'|'sharp'};
export function validateAncientPreferences(value:unknown):AncientPreferences|null{
 if(!value||typeof value!=='object'||JSON.stringify(value).length>18000)return null;
 const v=value as AncientPreferences,c=v.controls;
 if(!c||!c.bindings||typeof c.bindings!=='object'||Object.keys(c.bindings).length>40||![c.desktop,c.mobile].every(n=>Number.isFinite(n)&&n>=10&&n<=400)||!['zh','en'].includes(v.language)||!['smooth','balanced','sharp'].includes(v.quality))return null;
 const bindings:Record<string,string>={},used=new Set<string>();
 for(const [key,code]of Object.entries(c.bindings)){if(!/^[a-zA-Z0-9]{1,24}$/.test(key)||typeof code!=='string'||!/^(Key[A-Z]|Digit[0-9]|Arrow(Up|Down|Left|Right)|Space|Tab|Shift(Left|Right)|Alt(Left|Right)|Enter|Backspace|Backquote|Minus|Equal|Bracket(Left|Right)|Semicolon|Quote|Comma|Period|Slash|Backslash|Mouse[01234]|Escape)$/.test(code)||used.has(code))return null;bindings[key]=code;used.add(code);}
 const layouts:AncientPreferences['layouts']={};
 for(const mode of ['desktop','touch']){const source=v.layouts?.[mode]||{};if(typeof source!=='object'||Array.isArray(source)||Object.keys(source).length>100)return null;const layout:AncientPreferences['layouts'][string]={};for(const [id,p]of Object.entries(source)){if(!/^[a-zA-Z0-9_-]{1,70}$/.test(id)||!p||![p.x,p.y,p.scale].every(Number.isFinite)||p.x<0||p.x>100||p.y<0||p.y>100||p.scale<.5||p.scale>2.5)return null;layout[id]={x:p.x,y:p.y,scale:p.scale};}layouts[mode]=layout;}
 return {controls:{bindings,desktop:c.desktop,mobile:c.mobile},layouts,language:v.language,quality:v.quality};
}
