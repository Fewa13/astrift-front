// © 2026 Felix — Astrift. Shared walking / forward sprint threshold.
export function joystickInput(dx,dy,radius){const length=Math.hypot(dx,dy),limit=Math.max(radius,length,1);return {x:dx/limit,y:dy/limit,sprint:dy<=-radius*.85};}
