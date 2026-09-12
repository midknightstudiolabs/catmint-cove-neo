// Permanent Cove activities. Timestamp-based progress; harvested stock never spoils.
function drawHomesteadEntrance(g,d){
  g.save();g.translate(d.x,d.y);g.lineWidth=2;g.strokeStyle='#80694c';
  if(d.place==='cafe'){
    g.fillStyle='#eddcba';g.fillRect(-29,-48,58,48);g.strokeRect(-29,-48,58,48);
    g.fillStyle='#769581';g.beginPath();g.moveTo(-35,-48);g.lineTo(0,-65);g.lineTo(35,-48);g.closePath();g.fill();
    g.fillStyle='#927657';g.fillRect(-8,-25,16,25);g.fillStyle='#c4dcd7';g.fillRect(-23,-34,12,15);g.fillRect(11,-34,12,15);
  }else{
    g.fillStyle='#a98861';g.fillRect(-32,-24,64,24);g.fillStyle='#72583d';g.fillRect(-28,-20,56,16);
    for(const x of [-19,0,19]){g.fillStyle='#8da56c';g.beginPath();g.ellipse(x,-21,5,13,-.4,0,Math.PI*2);g.fill();g.beginPath();g.ellipse(x+5,-23,5,12,.4,0,Math.PI*2);g.fill();}
  }
  g.fillStyle='#faf2dc';g.beginPath();g.roundRect(-36,3,72,19,6);g.fill();g.stroke();g.fillStyle='#43543f';g.font='bold 11px sans-serif';g.textAlign='center';g.fillText(d.place==='cafe'?'Catmint Café':'Cove Garden',0,16);g.restore();
}
const COVE_CROPS={carrot:{name:'Carrots',seconds:60,cost:2,yield:3},pumpkin:{name:'Pumpkins',seconds:600,cost:6,yield:6},berry:{name:'Berries',seconds:3600,cost:12,yield:12}};
const COVE_RECIPES={carrot:{name:'Carrot bites',seconds:30,ingredient:'carrot',amount:2,servings:4},pumpkin:{name:'Pumpkin nibbles',seconds:120,ingredient:'pumpkin',amount:3,servings:8},berry:{name:'Berry biscuits',seconds:300,ingredient:'berry',amount:4,servings:12}};
function neoHomestead(){
  G.homestead ||= {plots:[null,null,null,null],stock:{carrot:2,pumpkin:0,berry:0},batch:null,counter:0,earned:0,served:0,lastSale:Date.now(),tables:3};
  G.homestead.cloth ||= 'cream';
  G.homestead.layout ||= 'together';
  const h=G.homestead;
  if(!h.stoves){h.stoves=[h.batch||null,null];h.batch=null;}
  h.cafeXP ||= 0;
  h.open ??= true;
  h.trays ||= [{key:'carrot',servings:h.counter||0},{key:null,servings:0}];
  if(!h.cafeSliceStarted){h.cafeSliceStarted=true;h.stock.carrot+=8;h.stock.pumpkin+=6;h.stock.berry+=4;h.trays[0]={key:'carrot',servings:h.trays[0].servings+8};h.counter+=8;}
  return G.homestead;
}
function neoBuyCafeIngredients(){const h=neoHomestead();if(G.shells<4)return;G.shells-=4;h.stock.carrot+=3;save();syncHud();neoOpenHomestead('cafe');}
function neoCafeLevel(h){return 1+Math.floor(Math.sqrt(h.cafeXP/20));}
function neoAddStove(){const h=neoHomestead(),cost=200+(h.stoves.length-2)*150;if(h.stoves.length>=4||neoCafeLevel(h)<h.stoves.length||G.shells<cost)return;G.shells-=cost;h.stoves.push(null);save();syncHud();neoOpenHomestead('cafe');}
function neoExpandHomestead(kind){
  const h=neoHomestead(),garden=kind==='garden',n=garden?h.plots.length:h.tables,max=garden?8:5;
  const cost=garden?100+(n-4)*75:150+(n-3)*100;
  if(n>=max||G.shells<cost)return false;
  G.shells-=cost;if(garden)h.plots.push(null);else h.tables++;
  save();syncHud();return true;
}
function neoCropArt(key,ready){
  return `<svg viewBox="0 0 120 70" aria-hidden="true" class="homestead-crop-art"><path fill="#bea17b" d="M8 49 60 39l52 10-52 17Z"/><path fill="#745b42" d="m17 48 43-7 43 7-43 10Z"/>${[32,60,88].map(x=>`<path stroke="#6d885b" stroke-width="3" d="M${x} 48V${ready?20:35}"/><path fill="#8fa770" d="M${x} 39q-20-2-14-15 15 1 14 15m0-5q17-2 15-15-15 2-15 15"/>${ready?key==='carrot'?`<path fill="#ce9060" d="m${x-5} 42 10 0-5 13Z"/>`:key==='pumpkin'?`<ellipse fill="#ca9862" cx="${x}" cy="43" rx="10" ry="8"/>`:`<circle fill="#ad777e" cx="${x-5}" cy="35" r="5"/><circle fill="#ad777e" cx="${x+4}" cy="39" r="5"/>`:''}`).join('')}</svg>`;
}
// Prototype service clock: bounded fixed steps, one shared waiter, persistent guests.
function neoCafeService(h){return h.service ||= {clock:Date.now(),nextArrival:0,serial:0,visits:[],waiter:null};}
function neoCafeSettle(now=Date.now()){
 const h=neoHomestead(),v=neoCafeService(h);if(now<=v.clock)return;
 // Away time pauses this prototype's restaurant, preventing duplicate idle payouts.
 if(now-v.clock>30000){v.clock=now;return;}
 const items=neoCafeFurniture(h),tables=items.filter(f=>f.type==='table'&&!f.boxed&&neoCafeRoute(items,f));
 for(;v.clock+1000<=now;v.clock+=1000){const t=v.clock+1000;
  for(const g of v.visits){if(g.state==='arriving'&&t>=g.until){g.state='waiting';}
   if(g.state==='eating'&&t>=g.until){g.state='leaving';g.until=t+6000;h.earned+=2;h.served++;h.cafeXP++;}
   if(g.state==='leaving'&&t>=g.until)g.state='dirty';}
  if(v.waiter&&t>=v.waiter.until){const g=v.visits.find(g=>g.id===v.waiter.id);if(g){if(v.waiter.task==='serve'){g.state='eating';g.until=t+18000;}else g.state='done';}v.waiter=null;}
  v.visits=v.visits.filter(g=>g.state!=='done');
  if(!v.waiter){const dirty=v.visits.find(g=>g.state==='dirty'),waiting=v.visits.find(g=>g.state==='waiting');const tray=h.trays.find(t=>t.servings>0);
   const g=dirty||(tray&&waiting);if(g){const task=dirty?'clear':'serve';if(task==='serve'){g.recipe=tray.key;tray.servings--;h.counter--;if(!tray.servings)tray.key=null;g.state='serving';}v.waiter={id:g.id,table:g.table,task,start:t,until:t+5000};}}
  if(h.open&&h.counter>0&&t>=v.nextArrival){const table=tables.find(f=>!v.visits.some(g=>g.table===f.id));if(table){v.visits.push({id:++v.serial,table:table.id,state:'arriving',start:t,until:t+6000});v.nextArrival=t+12000;}}
 }
 h.lastSale=now;
}
function neoPlant(i,key){
  const h=neoHomestead(),c=COVE_CROPS[key];
  if(!c||i<0||i>=h.plots.length||h.plots[i]||G.shells<c.cost)return;
  G.shells-=c.cost;h.plots[i]={key,ready:Date.now()+c.seconds*1000};save();syncHud();neoOpenHomestead('garden');
}
function neoSellHarvest(key){const h=neoHomestead();if(!COVE_CROPS[key]||(h.stock[key]||0)<1)return;h.stock[key]--;G.shells++;save();syncHud();neoOpenHomestead('garden');}
function neoHarvest(i){
  const h=neoHomestead(),p=h.plots[i];if(!p||Date.now()<p.ready)return;
  h.stock[p.key]=(h.stock[p.key]||0)+COVE_CROPS[p.key].yield;h.plots[i]=null;save();neoOpenHomestead('garden');
}
function neoCook(key){
  const h=neoHomestead(),r=COVE_RECIPES[key],slot=h.stoves.indexOf(null);if(!r||slot<0||(h.stock[r.ingredient]||0)<r.amount)return;
  h.stock[r.ingredient]-=r.amount;h.stoves[slot]={key,ready:Date.now()+r.seconds*1000};save();neoOpenHomestead('cafe');
}
function neoStockCounter(slot){
  const h=neoHomestead();if(!Number.isInteger(slot))slot=h.stoves.findIndex(j=>j&&Date.now()>=j.ready);
  const job=h.stoves[slot];if(!job||Date.now()<job.ready)return;
  neoCafeSettle();const tray=h.trays.find(t=>t.key===job.key)||h.trays.find(t=>!t.servings);if(!tray)return;tray.key=job.key;tray.servings+=COVE_RECIPES[job.key].servings;if(!h.counter)h.lastSale=Date.now();h.counter+=COVE_RECIPES[job.key].servings;h.cafeXP+=3;h.stoves[slot]=null;save();neoOpenHomestead('cafe');
}
let neoHomesteadTimer;
let neoCafeFrame=0;
function neoCafeGuide(sheet,h){
 const guide=sheet.querySelector('#cafe-guidance'),button=sheet.querySelector('#cafe-next-action');if(!guide||!button)return;
 const ready=h.stoves.find(j=>j&&Date.now()>=j.ready&&h.trays.some(t=>!t.servings||t.key===j.key)),cooking=h.stoves.filter(Boolean),free=h.stoves.includes(null);
 let label='Cook a batch',message='Start with carrot bites. Your waiter handles seating, serving and clearing.';
 if(ready){label='Serve ready food';message='Your batch is ready. Tap below to put it on the counter.';}
 else if(cooking.length){const seconds=Math.max(0,Math.ceil((Math.min(...cooking.map(j=>j.ready))-Date.now())/1000));label=free?'Cook another batch':'View cooking';message=seconds?'Cooking · '+seconds+'s remaining. You can relax or decorate.':'Counters are full. Food will wait safely until there is space.';}
 else if(h.counter){message=h.counter+' treats ready. Your waiter takes care of your guests.';}
 if(!h.open)message='Café closed. Open it above when you are ready for guests.';
 if(guide.textContent!==message)guide.textContent=message;button.textContent=label;
}
function neoOpenHomestead(kind){
  closeAllPanels();neoCafeSettle();save();clearInterval(neoHomesteadTimer);cancelAnimationFrame(neoCafeFrame);
  const h=neoHomestead(),garden=kind==='garden';
  let sheet=document.getElementById('neo-homestead');
  if(!sheet){sheet=document.createElement('div');sheet.id='neo-homestead';sheet.className='sheet';document.getElementById('app').append(sheet);panels.homestead=sheet;}
  sheet.hidden=false;sheet.classList.toggle('cafe-full-room',!garden);
  const time=t=>Math.max(0,Math.ceil((t-Date.now())/1000));
  sheet.innerHTML=`<button class="x" aria-label="Back to the Cove">×</button><div class="kicker">YOUR LITTLE CORNER OF THE COVE</div><h2>${garden?'Cove Garden':'Catmint Café'}</h2><p>${garden?'Grow café ingredients for less: 3 carrots cost 2 shells to grow, versus 4 to buy. Pumpkins and berries make bigger café batches. Keep your harvest for cooking, or sell spare crops for 1 shell each. Crops never wither.':'Choose what to cook and stock the counter. Development preview · Guests seat themselves, a shared waiter serves and clears tables, and each finished meal earns 2 shells. Service pauses while away; cooking continues.'}</p><div class="homestead-stock">${Object.entries(COVE_CROPS).map(([k,c])=>`<span>${c.name}: <b>${h.stock[k]||0}</b></span>`).join('')}</div>`;
  if(garden){
    const grid=document.createElement('div');grid.className='homestead-grid';
    h.plots.forEach((p,i)=>{const card=document.createElement('article');card.className='homestead-patch';card.innerHTML=`<h3>Patch ${i+1}</h3>${neoCropArt(p?.key||'carrot',!!p&&!time(p.ready))}`;
      if(p){card.innerHTML+=`<p>${COVE_CROPS[p.key].name}</p><button class="btn" data-ready="${p.ready}" ${time(p.ready)?'disabled':''}>${time(p.ready)?'Growing · '+time(p.ready)+'s':'Harvest'}</button>`;card.querySelector('button').onclick=()=>neoHarvest(i);}
      else for(const [k,c]of Object.entries(COVE_CROPS)){const b=document.createElement('button');b.className='btn';b.textContent=`${c.name} · Harvest ${c.yield} · ${c.cost} shells · ${c.seconds<60?c.seconds+'s':c.seconds/60+'m'}`;b.disabled=G.shells<c.cost;b.onclick=()=>neoPlant(i,k);card.append(b);}
      grid.append(card);});sheet.append(grid);const market=document.createElement('div');market.className='homestead-stock';for(const [key,crop] of Object.entries(COVE_CROPS)){const sell=document.createElement('button');sell.className='btn';sell.textContent='Sell 1 '+crop.name.toLowerCase()+' · 1 shell';sell.disabled=!(h.stock[key]>0);sell.onclick=()=>neoSellHarvest(key);market.append(sell);}sheet.append(market);
  }else{
    const door=document.createElement('button');door.className='btn';door.textContent=h.open?'Open for guests · Close café':'Café closed · Open café';door.onclick=()=>{neoCafeSettle();h.open=!h.open;h.lastSale=Date.now();save();neoOpenHomestead('cafe');};sheet.append(door);
    const room=document.createElement('div');room.className='homestead-cafe-room';room.innerHTML=`<p>${h.counter} treats on the counter · ${h.served} served</p><div class="homestead-tables">${Array.from({length:h.tables},(_,i)=>`<span>Table ${i+1}<br>${h.counter?'Open for guests':'Waiting for treats'}</span>`).join('')}</div>`;sheet.append(room);
    room.querySelector('.homestead-tables').remove();
    const cv=document.createElement('canvas');cv.width=640;cv.height=360;cv.className='homestead-room-art';cv.setAttribute('role','img');cv.setAttribute('aria-label','Your café with '+h.tables+' tables'+(h.counter?' and familiar cat guests':''));room.append(cv);neoPaintCafe(cv,h);
    const note=document.createElement('p');note.className='homestead-greeting';note.setAttribute('aria-live','polite');note.textContent=h.counter?'A familiar table. A little company.':'The tables are ready. Stock the counter to welcome your cats.';room.append(note);
    const welcome=document.createElement('button');welcome.className='btn';welcome.textContent='Welcome a regular';welcome.disabled=!h.counter||!cats.some(c=>!c.visitor);welcome.onclick=()=>{const pool=cats.filter(c=>!c.visitor),c=pool[Math.floor(Math.random()*pool.length)];note.textContent=c.name+[' settles into a favourite seat.',' sniffs the treats and gives a slow blink.',' has come for a snack—and your company.'][Math.floor(Math.random()*3)];};room.append(welcome);
    const style=document.createElement('details');style.className='homestead-style';style.innerHTML='<summary>Make it yours · free styles</summary>';
    for(const key of ['cream','sage','rose']){const b=document.createElement('button');b.className='btn';b.textContent=key+' tablecloth';b.setAttribute('aria-pressed',h.cloth===key);b.onclick=()=>{h.cloth=key;save();neoOpenHomestead('cafe');};style.append(b);}
    for(const key of ['wood','tile']){const b=document.createElement('button');b.className='btn';b.textContent=key+' floor';b.onclick=()=>{h.floor=key;save();neoOpenHomestead('cafe');};style.append(b);}sheet.append(style);
    const earnings=document.createElement('button');earnings.className='btn';earnings.dataset.cafeCollect='';earnings.textContent=`Collect ${h.earned} shells`;earnings.disabled=!h.earned;earnings.onclick=()=>{neoCafeSettle();G.shells+=h.earned;h.earned=0;save();syncHud();neoOpenHomestead('cafe');};sheet.append(earnings);
    const trays=document.createElement('div');trays.className='homestead-stock';trays.id='neo-cafe-trays';trays.innerHTML=h.trays.map((t,i)=>`<span>Counter ${i+1}: <b>${t.servings?COVE_RECIPES[t.key].name+' · '+t.servings:'Empty'}</b></span>`).join('');sheet.append(trays);
    const kitchen=document.createElement('div');kitchen.id='neo-cafe-kitchen';kitchen.innerHTML=`<h3>Cookbook · Café level ${neoCafeLevel(h)}</h3><p>${h.cafeXP} café points · ${h.stoves.filter(j=>!j).length} free stoves</p>`;
    const stoves=document.createElement('div');stoves.className='homestead-grid';
    h.stoves.forEach((job,i)=>{const b=document.createElement('button');b.className='btn';if(job){b.dataset.ready=job.ready;b.textContent=time(job.ready)?`Stove ${i+1} · ${COVE_RECIPES[job.key].name} · ${time(job.ready)}s`:`Stove ${i+1} · Stock ${COVE_RECIPES[job.key].name}`;b.disabled=!!time(job.ready);b.onclick=()=>neoStockCounter(i);}else{b.textContent=`Stove ${i+1} · Ready to cook`;b.disabled=true;}stoves.append(b);});kitchen.append(stoves);
    const recipes=document.createElement('div');recipes.className='homestead-grid';for(const[k,r]of Object.entries(COVE_RECIPES)){const b=document.createElement('button');b.className='neo-destination';b.innerHTML=`<b>${r.name}</b><small>${r.amount} ${COVE_CROPS[r.ingredient].name.toLowerCase()} · ${r.seconds}s · ${r.servings} servings · 3 café points</small>`;b.disabled=!h.stoves.includes(null)||(h.stock[r.ingredient]||0)<r.amount;b.onclick=()=>neoCook(k);recipes.append(b);}kitchen.append(recipes);
    if(h.stoves.length<4){const buy=document.createElement('button');buy.className='btn';const cost=200+(h.stoves.length-2)*150;buy.textContent=`Add stove · ${cost} shells · Level ${h.stoves.length}`;buy.disabled=G.shells<cost||neoCafeLevel(h)<h.stoves.length;buy.onclick=neoAddStove;kitchen.append(buy);}const pantry=document.createElement('button');pantry.className='btn';pantry.textContent='Buy 3 carrots · 4 shells (growing costs 2)';pantry.disabled=G.shells<4;pantry.onclick=neoBuyCafeIngredients;kitchen.append(pantry);const tip=document.createElement('p');tip.textContent='Two counters hold two different recipes. Matching batches stack. If both are occupied, your finished food waits safely on its stove.';kitchen.append(tip);sheet.append(kitchen);
  }
  const n=garden?h.plots.length:h.tables,max=garden?8:5,cost=garden?100+(n-4)*75:150+(n-3)*100;
  if(n<max){const expand=document.createElement('button');expand.className='btn';expand.textContent=`Add ${garden?'a garden patch':'a table'} · ${cost} shells`;expand.disabled=G.shells<cost;expand.onclick=()=>{if(neoExpandHomestead(kind))neoOpenHomestead(kind);};sheet.append(expand);}
  const other=document.createElement('button');other.className='btn';other.textContent=garden?'Visit Catmint Café':'Visit Cove Garden';other.onclick=()=>neoOpenHomestead(garden?'cafe':'garden');sheet.append(other);
  if(!garden){
    const kitchen=sheet.querySelector('#neo-cafe-kitchen');kitchen.hidden=true;kitchen.classList.add('cafe-drawer');
    const close=document.createElement('button');close.className='btn';close.textContent='Back to café';close.onclick=()=>kitchen.hidden=true;kitchen.prepend(close);
    const nav=document.createElement('div');nav.className='cafe-bottom-nav';const cook=document.createElement('button');cook.className='btn';cook.id='cafe-next-action';cook.textContent='Cook a batch';cook.onclick=()=>{const ready=h.stoves.findIndex(j=>j&&Date.now()>=j.ready&&h.trays.some(t=>!t.servings||t.key===j.key));if(ready>=0){neoStockCounter(ready);return;}kitchen.hidden=!kitchen.hidden;};nav.append(cook);
    const styles=sheet.querySelector('.homestead-style');styles.classList.add('cafe-drawer');styles.hidden=true;const design=document.createElement('button');design.className='btn';design.textContent='Decorate';design.onclick=()=>{styles.hidden=!styles.hidden;styles.open=true;};nav.append(design);
    const backStyle=document.createElement('button');backStyle.className='btn';backStyle.textContent='Back to café';backStyle.onclick=()=>styles.hidden=true;styles.append(backStyle);
    for(const b of [...sheet.children])if(b.tagName==='BUTTON'&&(b.textContent.startsWith('Add a table')||b.textContent==='Visit Cove Garden'))styles.append(b);
    const collect=sheet.querySelector('[data-cafe-collect]');nav.append(collect);sheet.append(nav);const guide=document.createElement('p');guide.id='cafe-guidance';guide.setAttribute('aria-live','polite');sheet.insertBefore(guide,nav);neoCafeGuide(sheet,h);
    sheet.querySelector('.homestead-greeting')?.remove();sheet.querySelector('.homestead-cafe-room > button')?.remove();
  }
  sheet.querySelector('.x').onclick=()=>{sheet.hidden=true;clearInterval(neoHomesteadTimer);cancelAnimationFrame(neoCafeFrame);};
  neoHomesteadTimer=setInterval(()=>{if(sheet.hidden){clearInterval(neoHomesteadTimer);return;}if(document.hidden)return;if(!garden)neoCafeGuide(sheet,h);const before=h.served;neoCafeSettle();if(before!==h.served){save();const trays=sheet.querySelector('#neo-cafe-trays');if(trays)trays.innerHTML=h.trays.map((t,i)=>`<span>Counter ${i+1}: <b>${t.servings?COVE_RECIPES[t.key].name+' · '+t.servings:'Empty'}</b></span>`).join('');const count=sheet.querySelector('.homestead-cafe-room > p');if(count)count.textContent=h.counter+' treats on the counter · '+h.served+' served';const collect=sheet.querySelector('[data-cafe-collect]');if(collect){collect.textContent='Collect '+h.earned+' shells';collect.disabled=!h.earned;}}for(const b of sheet.querySelectorAll('[data-ready]')){const seconds=time(+b.dataset.ready);b.disabled=seconds>0;b.textContent=seconds?`${garden?'Growing':'Cooking'} · ${seconds}s`:garden?'Harvest':'Stock the counter';}},1000);
}

// Dedicated testing entry. Keeps this prototype separate from the live Cove save.
addEventListener('DOMContentLoaded',()=>{if(new URLSearchParams(location.search).has('cafe')){document.getElementById('titleScreen').hidden=true;document.getElementById('titleScreen').style.display='none';neoOpenHomestead('cafe');}});
