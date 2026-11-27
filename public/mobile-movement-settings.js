const KEY='astrift.fixedMovement.v1';
export function fixedMovement(){try{return localStorage.getItem(KEY)==='true'}catch{return false}}
export function renderFixedMovement(host,en=()=>false){
 const row=document.createElement('div');row.className='touchMovementSetting';const text=document.createElement('div'),title=document.createElement('strong'),hint=document.createElement('small'),button=document.createElement('button');button.type='button';button.className='touchMovementSwitch';button.setAttribute('role','switch');
 const update=()=>{const english=en(),fixed=fixedMovement();title.textContent=english?'Fixed movement control':'固定移动键';hint.textContent=english?'Off: touch the left half to place the joystick. On: use its saved position.':'关闭：左半屏按下处出现摇杆；开启：使用保存的固定位置。';button.setAttribute('aria-label',title.textContent);button.setAttribute('aria-checked',String(fixed));button.textContent=english?(fixed?'ON':'OFF'):(fixed?'开启':'关闭')};
 button.onclick=()=>{try{localStorage.setItem(KEY,String(!fixedMovement()))}catch{}window.dispatchEvent(new Event('astrift:movement-mode-changed'));update()};text.append(title,hint);row.append(text,button);host.append(row);window.addEventListener('astrift:movement-mode-changed',update);window.addEventListener('astrift:language-changed',update);update();return row;
}
