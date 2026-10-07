(function(root){

'use strict';

const MAX_COTTAGES=16,BUILD_COST=[0,500,1200,2200,3200,4400,5800,7400,9200,11200,13400,15800,18400,21200,24200,27400],OFFLINE_CAP=8*3600000;

const STAGES=[{name:'Driftwood Cottage',cost:0,payout:24,stayMs:180000},{name:'Seaside Cottage',cost:600,payout:38,stayMs:150000},{name:'Cove Retreat',cost:1500,payout:56,stayMs:120000}];

const BUILDINGS={cottage:{name:'Garden cottage',extra:0,capacity:0,pay:0,time:0},lodge:{name:'Family lodge',extra:1800,capacity:2,pay:6,time:60000},villa:{name:'Terrace villa',extra:3600,capacity:1,pay:24,time:30000}};

const AMENITIES=[{id:'garden',name:'Botanical garden',cost:1800,bonus:.05},{id:'pool',name:'Lagoon pool',cost:4200,bonus:.10},{id:'cafe',name:'Terrace café',cost:6500,bonus:.15}];

function bonus(g){return AMENITIES.reduce((n,a)=>n+(g.resort?.amenities?.[a.id]?a.bonus:0),0);}

function buyAmenity(g,id,now=Date.now()){const s=init(g,now),a=AMENITIES.find(a=>a.id===id);if(!a||s.amenities[id]||!s.cottages.some(c=>c.built)||g.shells<a.cost)return false;settle(g,now);g.shells-=a.cost;s.amenities[id]=true;return true;}

const COATS=['ginger','greytab','calico','greywhite','cream','siamese'],NAMES=['Clover','Poppy','Otis','Sailor','Juniper','Finch'];

function party(cap){return {kind:cap>1?'couple':'solo',name:NAMES[Math.floor(Math.random()*NAMES.length)],members:Array.from({length:cap},()=>({coatKey:COATS[Math.floor(Math.random()*COATS.length)],markSeed:Math.random()*1e9|0,age:'adult'}))};}

function init(g,now=Date.now()){

 if(!g.resort||!Array.isArray(g.resort.cottages))g.resort={version:3,cottages:Array.from({length:MAX_COTTAGES},()=>({built:false,stage:0,bed:0,guest:null})),completedStays:0,revenue:0,lastTick:now,selected:0,view:'outside'};

 const s=g.resort;s.amenities=s.amenities||{};if(g.cafe?.unlocked)s.amenities.cafe=true;while(s.cottages.length<MAX_COTTAGES)s.cottages.push({built:false,stage:0,guest:null,bed:0});

 for(const c of s.cottages){if(!BUILDINGS[c.kind])c.kind="cottage";c.stage=Math.max(0,Math.min(2,Number(c.stage)||0));c.bed=Math.max(0,Math.min(2,Number(c.bed)||0));}

 if(s.version!==3){s.version=3;s.lastTick=now;}s.lastTick=Number.isFinite(s.lastTick)?s.lastTick:now;s.completedStays=s.completedStays||0;s.revenue=s.revenue||0;s.selected=Math.max(0,Math.min(MAX_COTTAGES-1,s.selected||0));return s;

}

function stats(c){const kind=BUILDINGS[c.kind]||BUILDINGS.cottage;return {capacity:1+(c.stage>0?1:0)+kind.capacity+(c.service==='family'?1:0),payout:STAGES[c.stage].payout+c.bed*8+kind.pay+(c.service==='retreat'?15:0),stayMs:Math.max(60000,STAGES[c.stage].stayMs-c.bed*15000+kind.time+(c.service==='family'?60000:c.service==='retreat'?30000:0))};}

function checkIn(c,now,g){const z=stats(c);c.guest={party:party(z.capacity),checkInAt:now,checkOutAt:now+z.stayMs,payout:Math.floor(z.payout*z.capacity*(1+bonus(g)))};c.ready=false;}

function settle(g,now=Date.now()){

 const s=init(g,now);if(now<s.lastTick)return 0;let paid=0;const start=Math.max(s.lastTick,now-OFFLINE_CAP);

 for(const c of s.cottages){if(!c.built)continue;if(!c.guest){checkIn(c,start,g);}

 let guest=c.guest;if(guest.checkOutAt<=now){const oldPay=Number.isFinite(guest.payout)?guest.payout:STAGES[c.stage].payout*(guest.party?.members?.length||1);paid+=oldPay;s.completedStays++;

 const z=stats(c),end=Math.max(guest.checkOutAt,start),count=Math.floor((now-end)/z.stayMs);paid+=count*Math.floor(z.payout*z.capacity*(1+bonus(g)));s.completedStays+=count;

 s.lastGuest={name:guest.party?.name||'A guest',payout:oldPay};checkIn(c,end+count*z.stayMs,g);

 }}

 g.shells=(g.shells||0)+paid;s.revenue+=paid;s.lastTick=now;return paid;

}

function buildCost(g,i,kind='cottage'){const s=init(g);if(!Number.isInteger(i)||i<0||i>=MAX_COTTAGES||!BUILDINGS[kind])return Infinity;return (s.cottages.some(c=>c.built||c.job)?Math.max(500,BUILD_COST[i]):0)+BUILDINGS[kind].extra;}
function buildCottage(g,i,now=Date.now(),kind="cottage"){if(!BUILDINGS[kind])return false;const s=init(g,now),c=s.cottages[i],cost=buildCost(g,i,kind);if(!c||c.built||cost===undefined||g.shells<cost)return false;settle(g,now);g.shells-=cost;c.kind=kind;c.built=true;checkIn(c,now,g);return true;}

function upgradeCottage(g,i,now=Date.now()){const s=init(g,now),c=s.cottages[i],next=c&&STAGES[c.stage+1];if(!c?.built||!next||g.shells<next.cost)return false;settle(g,now);g.shells-=next.cost;c.stage++;return true;}

function upgradeBed(g,i,now=Date.now()){const s=init(g,now),c=s.cottages[i],cost=120*((c?.bed||0)+1);if(!c?.built||c.bed>=2||g.shells<cost)return false;settle(g,now);g.shells-=cost;c.bed++;return true;}

// Timed resort development. Jobs use absolute timestamps and survive save/reload.

const BUSINESSES=[

 {id:'juice',name:'Fruit juice stall',cost:900,minutes:5,gross:36,expense:12,need:1,x:354,y:285},

 {id:'bakery',name:'Beach bakery',cost:2400,minutes:15,gross:90,expense:30,need:3,x:386,y:335},

 {id:'restaurant',name:'Moonlit restaurant',cost:7200,minutes:60,gross:240,expense:90,need:6,x:385,y:154},

 {id:'kayak',name:'Kayak jetty',cost:3600,minutes:30,gross:100,expense:28,need:4,x:825,y:490}

];

const oldInit=init,oldSettle=settle,oldBuild=buildCottage;

init=function(g,now=Date.now()){const s=oldInit(g,now);s.businesses ||= {};s.businessIncome ||= 0;return s;};

function businessRate(g,b){const s=init(g),level=s.businesses[b.id]?.level||0,rooms=s.cottages.filter(c=>c.built&&!c.job).reduce((n,c)=>n+stats(c).capacity,0);return Math.floor((b.gross-b.expense)*level*Math.min(1,rooms/(b.need*2)));}

function finishJobs(s,at){for(const c of s.cottages){if(c.job&&c.job.end<=at){const j=c.job;if(j.type==='build')c.built=true;else c[j.type]=j.target;c.job=null;c.guest=null;}}for(const b of Object.values(s.businesses)){if(b.job&&b.job.end<=at){b.level=b.job.target;b.job=null;b.lastPaid=at;}}}

settle=function(g,now=Date.now()){

 const s=init(g,now);if(now<s.lastTick)return 0;const from=Math.max(s.lastTick,now-OFFLINE_CAP);finishJobs(s,from);

 const times=[...s.cottages.map(c=>c.job?.end),...Object.values(s.businesses).map(b=>b.job?.end)].filter(t=>t>from&&t<=now);times.push(now);times.sort((a,b)=>a-b);let total=0;

 for(const at of [...new Set(times)]){

  for(const b of BUSINESSES){const v=s.businesses[b.id];if(!v||v.job||!v.level)continue;const start=Math.max(v.lastPaid??from,now-OFFLINE_CAP),cycles=Math.floor((at-start)/300000);if(cycles>0){const paid=cycles*businessRate(g,b);g.shells+=paid;s.revenue+=paid;s.businessIncome+=paid;total+=paid;v.lastPaid=start+cycles*300000;}}

  const closed=s.cottages.filter(c=>c.job&&c.built);closed.forEach(c=>c.built=false);total+=oldSettle(g,at);closed.forEach(c=>c.built=true);finishJobs(s,at);

 }return total;

};

function renovate(g,i,type,cost,target,minutes,now){settle(g,now);const c=init(g,now).cottages[i];if(!c?.built||c.job||g.shells<cost)return false;g.shells-=cost;c.guest=null;c.job={type,target,start:now,end:now+minutes*60000};return true;}

upgradeCottage=function(g,i,now=Date.now()){const c=init(g,now).cottages[i],next=c&&STAGES[c.stage+1];return !!next&&renovate(g,i,'stage',next.cost,c.stage+1,c.stage?60:15,now);};

upgradeBed=function(g,i,now=Date.now()){const c=init(g,now).cottages[i];return !!c&&c.bed<2&&renovate(g,i,'bed',120*(c.bed+1),c.bed+1,5*(c.bed+1),now);};

buildCottage=function(g,i,now=Date.now(),kind='cottage'){const s=init(g,now),first=!s.cottages.some(c=>c.built||c.job),c=s.cottages[i];if(!c||c.job)return false;if(!oldBuild(g,i,now,kind))return false;if(!first){c.built=false;c.guest=null;c.job={type:'build',start:now,end:now+(kind==='villa'?60:kind==='lodge'?30:10)*60000};}return true;};

function buyBusiness(g,id,now=Date.now()){settle(g,now);const s=init(g,now),b=BUSINESSES.find(b=>b.id===id),v=s.businesses[id]||{level:0};if(!b||v.job||v.level>=3||s.cottages.filter(c=>c.built).length<b.need)return false;const cost=b.cost*(v.level+1);if(g.shells<cost)return false;g.shells-=cost;v.job={start:now,end:now+b.minutes*(v.level+1)*60000,target:v.level+1};s.businesses[id]=v;return true;}

function specialize(g,i,service,now=Date.now()){if(!['family','retreat','standard'].includes(service)||init(g,now).cottages[i]?.service===service)return false;return renovate(g,i,'service',600,service,15,now);}
function customize(g,i,style){const c=init(g).cottages[i];if(!c?.built||c.job||!['sage','terracotta','ocean'].includes(style))return false;c.style=style;return true;}

root.CoveResortEngine={buildCost,BUILDINGS,AMENITIES,BUSINESSES,businessRate,buyBusiness,specialize,customize,bonus,buyAmenity,MAX_COTTAGES,BUILD_COST,STAGES,OFFLINE_CAP,init,stats,settle,buildCottage,upgradeCottage,upgradeBed};

})(globalThis);
