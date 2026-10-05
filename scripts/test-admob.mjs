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
 const g=game(supporter);let coins=0;assert.ok(g.ads.offer('offline2x'));assert.equal(g.ads.offer('adventureBonus'),true);
 assert.equal(await g.ads.rewarded('offline2x','claim1',()=>coins+=10),true);assert.equal(coins,10);
 assert.equal(await g.ads.rewarded('offline2x','claim1',()=>coins+=10),false);
 g.G.ads.lastBonus=0;g.G.ads.bonusCount=3;assert.equal(await g.ads.rewarded('adventureBonus','claim2',()=>coins++),false);
}
const minor=game();minor.G.ads.born=new Date().getFullYear()-10;assert.equal(minor.ads.rewardReady('offline2x'),false);
const unknown=game();unknown.G.ads.born=null;assert.equal(unknown.ads.rewardReady('offline2x'),false);
assert.equal(game().ads.rewardReady('freeCoax'),false);

// Real offline reward UI and claim handlers, with a delayed-ad DOM stand-in.
const offline=html.slice(html.indexOf('function rewardReturnOffer('),html.indexOf('// v3: while you were away'));
for(const supporter of [false,true])for(const outcome of ['earned','skipped','failed']){
 const g=game(supporter),elements={};let saved=0,done=0;
 Object.assign(g,{setTimeout,document:{getElementById:id=>elements[id]||(elements[id]={isConnected:true})},backgroundShells:()=>100,aggregateRate:()=>1,openModal(){},closeModal(){},toast(){},save(){saved=g.G.shells;}});
 g.G.shells=10;g.G.ratePerSec=1;g.window.CoveNative.ads.initialize=async()=>true;g.window.CoveNative.ads.prepare=async()=>true;
 g.window.CoveNative.ads.show=async(p,earn)=>{assert.equal(saved,110);if(outcome==='failed')throw Error('unavailable');if(outcome==='earned'){earn();earn();}};
 vm.runInContext(offline+'\nthis.offline=offlineEarnings;',g);g.offline(100,()=>done++);
 const button=elements[supporter?'m-take':'return-double'];const first=button.onclick();await button.onclick();await first;
 assert.equal(g.G.shells,supporter||outcome==='earned'?210:110);assert.equal(done,1);
}
const retry=harness();let attempts=0;retry.sdk.requestConsentInfo=async()=>{if(++attempts===1)throw Error('offline');return {canRequestAds:true};};assert.equal(await retry.ads.initialize(),false);assert.equal(await retry.ads.initialize(),true);assert.equal(attempts,2);
console.log('PASS: iOS-only bridge, consent, retry after failure, single initialization, test IDs, earned-once rewards, failed/cancelled ads preserve base, Founder double without ads, game syntax.');

// Exercise the real adventure return function: multiplier never duplicates discoveries.
const adventure=html.slice(html.indexOf('function resolveAdventure(advId, onDone) {'),html.indexOf('// call an in-progress party home early'));
for(const enabled of [false,true])for(const founder of [false,true]){
 const cat={name:'Midknight',mascot:true,x:0,y:0,mood:50};const trip={id:'trip-1',endsAt:0,party:[{name:'Midknight'}]};let outcome,offer,finished=0;
 const c={ADS_ENABLED:enabled,Ads:{owned:()=>founder},G:{},cats:[cat],activeAdvs:()=>[trip],_departures:[],advLoot:()=>({reward:{shells:10}}),gainBond(){},spawnParticles(){},dedupeCats(){},save(){},syncHud(){},rebuildAttractors(){},neoScheduleAdventureReminders(){},renderAdventureCard(){},advVignette:()=>({outcome:{text:'Home',reward:{shells:100,pearls:1,driftwood:2,mapPiece:true,keepsakes:['shell']}}}),runVignette:(v,o)=>{outcome=v.outcome;o.onDone();},rewardReturnOffer:o=>{offer=o;}};
 vm.createContext(c);vm.runInContext(adventure+'\nthis.resolve=resolveAdventure;',c);c.resolve('trip-1',()=>finished++);
 const doubled=enabled&&founder;assert.equal(outcome.reward.shells,doubled?200:100);assert.equal(outcome.reward.pearls,doubled?2:1);assert.equal(outcome.reward.driftwood,doubled?4:2);assert.equal(outcome.reward.mapPiece,true);assert.equal(outcome.reward.keepsakes.length,1);
 if(enabled&&!founder){assert.equal(offer.resources.shells,100);assert.equal(offer.alreadyCollected,true);}else assert.equal(finished,1);
}
console.log('PASS: adventure totals, iOS Founder doubling, regular optional bonus, unique discoveries unchanged.');
