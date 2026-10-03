import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const config=fs.readFileSync(new URL('./admob-config.js',import.meta.url),'utf8');
const bridge=fs.readFileSync(new URL('./admob-bridge.js',import.meta.url),'utf8');
const tick=()=>new Promise(r=>setImmediate(r));
function harness(platform='ios',allowed=true){
 const listeners=new Map(),calls=[];
 const sdk={
  requestConsentInfo:async()=>({status:'NOT_REQUIRED',canRequestAds:allowed}),
  initialize:async()=>calls.push('init'),
  prepareRewardVideoAd:async o=>calls.push(o.adId),
  showRewardVideoAd:async()=>{},
  addListener:async(n,fn)=>{listeners.set(n,fn);return {remove:()=>listeners.delete(n)};},
  showPrivacyOptionsForm:async()=>{}
 };
 const ctx={window:{Capacitor:{isNativePlatform:()=>platform!=='web',getPlatform:()=>platform,Plugins:{AdMob:sdk}}},setTimeout,clearTimeout,console};
 vm.runInNewContext(config,ctx);vm.runInNewContext(bridge,ctx);
 return {ctx,calls,sdk,ads:ctx.window.CoveNative?.ads,emit:n=>listeners.get(n)?.()};
}
for(const p of ['web','android'])assert.equal(harness(p).ads,undefined);
const h=harness();vm.runInNewContext(bridge,h.ctx);assert.equal(h.ctx.window.CoveNative.ads,h.ads);
assert.equal(await h.ads.prepare('offline2x'),false);assert.equal(h.calls.length,0);
await Promise.all([h.ads.initialize(),h.ads.initialize()]);assert.equal(h.calls.filter(x=>x==='init').length,1);
await h.ads.prepare('offline2x');assert.ok(h.ads.ready('offline2x'));
assert.ok(h.calls.includes('ca-app-pub-3940256099942544/1712485313'));
assert.ok(!h.calls.some(x=>x.includes('6342093250826583')));
let awards=0;const shown=h.ads.show('offline2x',()=>awards++);await tick();
assert.equal(await h.ads.show('offline2x',()=>awards++),false);
h.emit('onRewardedVideoAdReward');h.emit('onRewardedVideoAdReward');assert.equal(awards,1);
h.emit('onRewardedVideoAdDismissed');assert.equal(await shown,true);
await h.ads.prepare('offline2x');const skip=h.ads.show('offline2x',()=>awards++);await tick();h.emit('onRewardedVideoAdDismissed');assert.equal(await skip,false);assert.equal(awards,1);
await h.ads.prepare('offline2x');const fail=h.ads.show('offline2x',()=>awards++);await tick();h.emit('onRewardedVideoAdFailedToShow');assert.equal(await fail,false);
await h.ads.prepare('offline2x');await h.ads.privacyOptions();assert.equal(h.ads.ready('offline2x'),false);
const denied=harness('ios',false);await denied.ads.initialize();assert.equal(await denied.ads.prepare('offline2x'),false);assert.equal(denied.calls.length,0);
const required=harness();const order=[];
required.sdk.requestConsentInfo=async()=>({status:'REQUIRED',isConsentFormAvailable:true,canRequestAds:false});
required.sdk.showConsentForm=async()=>{order.push('consent');return {canRequestAds:true};};
required.sdk.initialize=async()=>order.push('init');await required.ads.initialize();assert.deepEqual(order,['consent','init']);

// Exercise the actual game policy in isolation with deterministic rewards.
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
for(const m of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)){if(m[1].trim()&&!m[0].includes('application/ld+json'))new vm.Script(m[1]);}
const policy=html.slice(html.indexOf('const Ads = (() => {'),html.indexOf('\nsetInterval(()=>{ if(!document.hidden)Ads.warm'));
function game(supporter=false){
 const c={window:{CoveNative:{ads:{ready:()=>true,show:async(p,earn)=>{earn();earn();},initialize:async()=>{}}}},G:{ads:{asked:true,born:1990,supporter},tutorialDone:true},ADS_ENABLED:true,restMode:false,festMode:false,_cold:false,_paused:false,actx:null,save(){},syncHud(){},resumeAudio(){},console};
 vm.createContext(c);vm.runInContext(policy+'\nthis.ads=Ads;',c);return c;
}
for(const supporter of [true,false]){
 const g=game(supporter);let coins=0;assert.ok(g.ads.offer('offline2x'));assert.equal(g.ads.offer('adventureBonus'),false);
 assert.equal(await g.ads.rewarded('offline2x','claim1',()=>coins+=10),true);assert.equal(coins,10);
 assert.equal(await g.ads.rewarded('offline2x','claim1',()=>coins+=10),false);
 g.G.ads.lastBonus=0;g.G.ads.bonusCount=3;assert.equal(await g.ads.rewarded('adventureBonus','claim2',()=>coins++),false);
}
const minor=game();minor.G.ads.born=new Date().getFullYear()-10;assert.equal(minor.ads.rewardReady('offline2x'),false);
const unknown=game();unknown.G.ads.born=null;assert.equal(unknown.ads.rewardReady('offline2x'),false);
assert.equal(game().ads.rewardReady('freeCoax'),false);
const offline=html.slice(html.indexOf('function offlineEarnings(elapsed, then) {'),html.indexOf('// v3: while you were away'));
for(const outcome of ['earned','skipped','failed']){
 const g=game(), elements={};let saved=0,done=0;
 Object.assign(g,{document:{getElementById:id=>elements[id]||(elements[id]={})},backgroundShells:()=>100,aggregateRate:()=>1,cats:[],coveName:()=> 'Cove',openModal(){},closeModal(){},sfx(){},toast(){},save(){saved=g.G.shells;}});
 g.G.shells=10;g.G.ratePerSec=1;
 g.window.CoveNative.ads.show=async(p,earn)=>{assert.equal(saved,110,'base is saved before presenting');if(outcome==='failed')throw Error('unavailable');if(outcome==='earned'){earn();earn();}};
 vm.runInContext(offline+'\nthis.offline=offlineEarnings;',g);
 g.offline(100,()=>done++);
 const first=elements['m-2x'].onclick();await elements['m-2x'].onclick();await first;
 assert.equal(g.G.shells,outcome==='earned'?210:110);assert.equal(saved,g.G.shells);assert.equal(done,1);
}
console.log('PASS: platform isolation, single initialization, test IDs, consent gating, earned-only/once rewards, cancellation/failure, privacy cache invalidation, supporter parity, age gating, cooldown/cap, game script syntax.');
