// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import {CHAPTER_ROUTES,chapterProjection} from '../public/ancient-geography.js';

const endpoints = {city:168, blight:180, sanctum:180};

export function devBoundary(map) {
  const route = CHAPTER_ROUTES[map];
  if (!route) return Object.hasOwn(endpoints,map) ? {x:0,z:endpoints[map],width:180,angle:0} : null;
  const end = route.at(-1)[0] * .3;
  const i = route.findIndex(point => point[0] >= end);
  const a = route[i-1], b = route[i], t = (end-a[0])/(b[0]-a[0]);
  return {
    x:a[1]+(b[1]-a[1])*t, z:a[2]+(b[2]-a[2])*t,
    width:2*(a[3]+(b[3]-a[3])*t)+4,
    angle:Math.atan2(b[1]-a[1],b[2]-a[2])
  };
}

export function beyondDevBoundary(map,x,z) {
  const route = CHAPTER_ROUTES[map];
  return route ? chapterProjection(map,x,z).u > route.at(-1)[0]*.3 : z > (endpoints[map] ?? Infinity);
}
