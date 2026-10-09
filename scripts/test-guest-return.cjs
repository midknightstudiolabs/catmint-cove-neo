const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const html=fs.readFileSync('index.html','utf8');
const check=html.slice(html.indexOf('function checkOffline(then)'),html.indexOf('const scrim =',html.indexOf('function checkOffline(then)')));
const baseline=html.slice(html.indexOf('function guestReturnBaseline('),html.indexOf('load();',html.indexOf('function guestReturnBaseline(')));
const now=Date.now();const g={shells:100,lastSeen:now-3600000,cafe:{unlocked:true,revenue:10},resort:{revenue:100,cottages:[{job:{end:now-1}}],businesses:{}},homestead:{plots:[{ready:now-1},{ready:now+60000},null]}};
const ctx={G:g,Date,checkVetReturns(){},offlineCare(){},offlineArrivals(){},syncHud(){},offlineEarnings(e,done){done()},activeAdvs:()=>[],deliverDuePostcards:()=>false,_wywaReport:null,maybeWywa:()=>false,setTimeout:fn=>fn(),CoveCafeEngine:{settle(g){g.cafe.revenue+=8;g.shells+=8}},CoveResortEngine:{settle(g){g.resort.revenue+=24;g.shells+=24}}};vm.createContext(ctx);vm.runInContext(baseline+check,ctx);
vm.runInContext('_guestReturnBaseline=guestReturnBaseline();',ctx);
// An intervening startup save has already settled these earnings and jobs.
g.cafe.revenue+=16;g.resort.revenue+=48;g.resort.cottages[0].job=null;g.lastSeen=now;
vm.runInContext('checkOffline(()=>{});',ctx);
assert.equal(g.coveReturnSummary.cafe,24);assert.equal(g.coveReturnSummary.resort,72);assert.equal(g.coveReturnSummary.jobs,1);assert.equal(g.coveReturnSummary.patches,1);assert.equal(g.shells,132);
const report=JSON.stringify(g.coveReturnSummary);vm.runInContext('checkOffline(()=>{});',ctx);assert.equal(g.shells,132);assert.equal(JSON.stringify(g.coveReturnSummary),report);
console.log('PASS return report retains pre-startup settlement baseline, ready patches and completed jobs; report does not double-grant or repeat settlement');
