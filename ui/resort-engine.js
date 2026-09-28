(function(root){
'use strict';
const MAX_COTTAGES=4,BUILD_COST=[0,500,1200,2200],OFFLINE_CAP=8*3600000;
const STAGES=[{name:'Driftwood Cottage',cost:0,payout:24,stayMs:180000},{name:'Seaside Cottage',cost:600,payout:38,stayMs:150000},{name:'Cove Retreat',cost:1500,payout:56,stayMs:120000}];
const COATS=['ginger','greytab','calico','greywhite','cream','siamese'],NAMES=['Clover','Poppy','Otis','Sailor','Juniper','Finch'];
function party(cap){return {kind:cap>1?'couple':'solo',name:NAMES[Math.floor(Math.random()*NAMES.length)],members:Array.from({length:cap},()=>({coatKey:COATS[Math.floor(Math.random()*COATS.length)],markSeed:Math.random()*1e9|0,age:'adult'}))};}
function init(g,now=Date.now()){
 if(!g.resort||!Array.isArray(g.resort.cottages))g.resort={version:3,cottages:Array.from({length:4},()=>({built:false,stage:0,bed:0,guest:null})),completedStays:0,revenue:0,lastTick:now,selected:0,view:'outside'};
 const s=g.resort;while(s.cottages.length<4)s.cottages.push({built:false,stage:0,guest:null,bed:0});
 for(const c of s.cottages){c.stage=Math.max(0,Math.min(2,Number(c.stage)||0));c.bed=Math.max(0,Math.min(2,Number(c.bed)||0));}
 if(s.version!==3){s.version=3;s.lastTick=now;}s.lastTick=Number.isFinite(s.lastTick)?s.lastTick:now;s.completedStays=s.completedStays||0;s.revenue=s.revenue||0;s.selected=Math.max(0,Math.min(3,s.selected||0));return s;
}
function stats(c){return {capacity:1+(c.stage>0?1:0),payout:STAGES[c.stage].payout+c.bed*8,stayMs:Math.max(60000,STAGES[c.stage].stayMs-c.bed*15000)};}
function checkIn(c,now){const z=stats(c);c.guest={party:party(z.capacity),checkInAt:now,checkOutAt:now+z.stayMs,payout:z.payout*z.capacity};c.ready=false;}
function settle(g,now=Date.now()){
 const s=init(g,now);if(now<s.lastTick)return 0;let paid=0;const start=Math.max(s.lastTick,now-OFFLINE_CAP);
 for(const c of s.cottages){if(!c.built)continue;if(!c.guest){checkIn(c,start);}
 let guest=c.guest;if(guest.checkOutAt<=now){const oldPay=Number.isFinite(guest.payout)?guest.payout:STAGES[c.stage].payout*(guest.party?.members?.length||1);paid+=oldPay;s.completedStays++;
 const z=stats(c),end=Math.max(guest.checkOutAt,start),count=Math.floor((now-end)/z.stayMs);paid+=count*z.payout*z.capacity;s.completedStays+=count;
 s.lastGuest={name:guest.party?.name||'A guest',payout:oldPay};checkIn(c,end+count*z.stayMs);
 }}
 g.shells=(g.shells||0)+paid;s.revenue+=paid;s.lastTick=now;return paid;
}
function buildCottage(g,i,now=Date.now()){const s=init(g,now),c=s.cottages[i],cost=BUILD_COST[i];if(!c||c.built||cost===undefined||(i>0&&!s.cottages[i-1].built)||g.shells<cost)return false;settle(g,now);g.shells-=cost;c.built=true;checkIn(c,now);return true;}
function upgradeCottage(g,i,now=Date.now()){const s=init(g,now),c=s.cottages[i],next=c&&STAGES[c.stage+1];if(!c?.built||!next||g.shells<next.cost)return false;settle(g,now);g.shells-=next.cost;c.stage++;return true;}
function upgradeBed(g,i,now=Date.now()){const s=init(g,now),c=s.cottages[i],cost=120*((c?.bed||0)+1);if(!c?.built||c.bed>=2||g.shells<cost)return false;settle(g,now);g.shells-=cost;c.bed++;return true;}
root.CoveResortEngine={MAX_COTTAGES,BUILD_COST,STAGES,OFFLINE_CAP,init,stats,settle,buildCottage,upgradeCottage,upgradeBed};
})(globalThis);
