import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const file=fs.readFileSync(new URL('./capacitor-bridge.js',import.meta.url),'utf8');
const code=file.slice(file.indexOf('  var REVENUECAT_ANDROID_KEY'),file.lastIndexOf('\n})();'));
const tick=()=>new Promise(r=>setImmediate(r));
function sdk(fail=false){let configured=false,release;const calls=[];const rc={
 isConfigured:async()=>({isConfigured:configured}),
 configure:async opts=>{calls.push(['configure',opts]);assert.deepEqual(Object.keys(opts),['apiKey']);await new Promise(r=>release=r);if(fail)throw Error('offline');configured=true;},
};for(const m of ['getProducts','getCustomerInfo','restorePurchases','purchaseStoreProduct','addCustomerInfoUpdateListener'])rc[m]=async()=>{assert.ok(configured,'billing called before configuration');calls.push([m]);return {products:[],customerInfo:{allPurchasedProductIdentifiers:[]}};};return {rc,calls,release:()=>release()};}
function page(s,platform='ios'){const resume=[];const ctx=vm.createContext({P:{Purchases:s.rc,App:{addListener:(name,fn)=>resume.push(fn)}},Cap:{getPlatform:()=>platform},window:{CoveNative:{}},console:{warn(){}},Promise,Date});return {ctx,resume,run:()=>vm.runInContext(code,ctx)};}
const s=sdk(),a=page(s);a.run();const bridge=a.ctx.window.CoveNative.iap;a.run();await tick();assert.equal(s.calls.length,1);const pending=bridge.restore();await tick();assert.equal(s.calls.length,1);s.release();await pending;await tick();assert.equal(s.calls.filter(x=>x[0]==='configure').length,1);assert.equal(a.resume.length,1);await a.resume[0]();
const b=page(s);b.run();await tick();await b.ctx.window.CoveNative.iap.sync();assert.equal(s.calls.filter(x=>x[0]==='configure').length,1,'WebView reload must reuse native configuration');
const bad=sdk(true),c=page(bad);c.run();await tick();bad.release();await assert.rejects(c.ctx.window.CoveNative.iap.restore());assert.equal(c.ctx.window.CoveNative.iap.available,true);assert.equal(JSON.stringify(await c.ctx.window.CoveNative.iap.buy('welcome_pack')),JSON.stringify({ok:false,reason:'unavailable'}));assert.equal(bad.calls.length,1);
const unknown=sdk(),d=page(unknown,'unknown');d.run();await tick();assert.equal(unknown.calls.length,0);
assert.doesNotMatch(code,/\.logIn\(|\.logOut\(|appUserID\s*:/);
console.log('PASS: duplicate load, in-flight init, WebView reload, resume, failure handling, anonymous configuration and unsupported platforms');

