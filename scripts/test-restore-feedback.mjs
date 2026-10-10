import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const source=html.slice(html.indexOf('let purchaseRestorePending ='),html.indexOf('// true when the native billing bridge'));
for(const scenario of ['success','empty','failure','unavailable','timeout']) {
  const status={isConnected:true,scrollIntoView(){}};
  let reconciled=null;
  const context={document:{querySelector:()=>({querySelector:()=>status}),querySelectorAll:()=>[]},
    toast(){},blessingActive:()=>false,nativeIap:()=>scenario!=='unavailable',
    window:{CoveNative:{iap:{restore:()=>scenario==='failure'?Promise.reject(new Error('offline')):scenario==='timeout'?new Promise(()=>{}):Promise.resolve(scenario==='empty'?[]:['welcome_pack'])}}},
    setTimeout:fn=>setTimeout(fn,5),clearTimeout,
    reconcileEntitlements:ids=>{reconciled=ids;},applyEntitlements(){},saveIap(){},save(){},syncHud(){},IAP_PRODUCTS:{welcome_pack:{}}};
  vm.createContext(context);vm.runInContext(source,context);
  const result=await context.restorePurchases();
  assert.equal(result,scenario==='success');
  assert.match(status.textContent,scenario==='success'?/restored to/:scenario==='empty'?/No purchases found/:scenario==='timeout'?/too long/:scenario==='unavailable'?/unavailable/:/Could not restore/);
  if(['failure','unavailable','timeout'].includes(scenario))assert.equal(reconciled,null);
}
console.log('Restore feedback: success, empty, error, unavailable and timeout passed.');
