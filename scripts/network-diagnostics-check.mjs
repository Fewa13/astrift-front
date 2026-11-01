// © 2026 Felix — Astrift / ASTRIFT FRONT. All rights reserved.
import assert from 'node:assert/strict';
import {networkReport,diagnosticFetch} from '../public/network-diagnostics.js';
globalThis.location=new URL('https://astrift-front.surge.sh/_world/main.html');globalThis.window={__ASTRIFT_API_ORIGIN__:'https://play.astrift.com'};
const report=networkReport('/api/account/login?token=secret',new TypeError('Failed to fetch'));
assert(report.includes('https://play.astrift.com/api/account/login'));assert(report.includes('TypeError: Failed to fetch'));assert(!report.includes('secret'));assert(!report.includes('?token'));assert(report.includes('cannot identify'));const original=new TypeError('Failed to fetch');await assert.rejects(diagnosticFetch('/api/account/login',{body:JSON.stringify({password:'private-password'})},async()=>{throw original}),e=>e===original);assert(!report.includes('private-password'));
const response={ok:true};assert.equal(await diagnosticFetch('/api/account/login',{},async()=>response),response);const abort=new DOMException('Aborted','AbortError');await assert.rejects(diagnosticFetch('/api/ancient/profile',{},async()=>{throw abort}),e=>e===abort);
console.log('PASS: sanitized endpoint diagnostics, honest cause uncertainty, original error/retry semantics, successful requests and aborts.');
