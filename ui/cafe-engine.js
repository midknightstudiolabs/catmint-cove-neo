(function(root){
  'use strict';
  const ingredients={carrot:{name:'Carrots',import:2,cost:2,seconds:60,yield:3},coffee:{name:'Coffee beans',import:5,cost:10,seconds:900,yield:10},catmint:{name:'Catmint',import:3,cost:6,seconds:300,yield:8},honey:{name:'Honey',import:8,cost:12,seconds:1500,yield:8}};
  const recipes=[{id:'coffee',name:'Coastal Coffee',note:'A warm welcome in a little cup.',price:12,inputs:{coffee:1}},{id:'tea',name:'Catmint Cloud',note:'Soft, fragrant and wonderfully unhurried.',price:8,inputs:{catmint:1}},{id:'midknight',name:'Midknight Morning',note:'Coffee, honey, and a very serious purr.',price:30,inputs:{coffee:2,honey:1}}];
  recipes.push({id:'bites',name:'Honey Garden Bites',note:'Little carrot treats with a touch of honey.',price:18,inputs:{carrot:2,honey:1}});
  recipes.push(...[{"id":"carrot_crunch","name":"Carrot Crunch","price":6,"inputs":{"carrot":1},"served":0,"cost":0,"kind":"food"},{"id":"honey_tea","name":"Honey Cloud Tea","price":18,"inputs":{"catmint":1,"honey":1},"served":5,"cost":100,"kind":"tea"},{"id":"mint_coffee","name":"Mint Morning","price":20,"inputs":{"coffee":1,"catmint":1},"served":15,"cost":180,"kind":"coffee"},{"id":"double_coffee","name":"Double Purr","price":24,"inputs":{"coffee":2},"served":25,"cost":250,"kind":"coffee"},{"id":"mint_bites","name":"Catmint Nibbles","price":16,"inputs":{"carrot":2,"catmint":1},"served":40,"cost":350,"kind":"food"},{"id":"honey_coffee","name":"Golden Cup","price":24,"inputs":{"coffee":1,"honey":1},"served":55,"cost":450,"kind":"coffee"},{"id":"garden_tea","name":"Garden Tea","price":16,"inputs":{"catmint":2,"carrot":1},"served":70,"cost":550,"kind":"tea"},{"id":"honey_carrots","name":"Golden Carrot Bowl","price":22,"inputs":{"carrot":3,"honey":1},"served":90,"cost":700,"kind":"food"},{"id":"mint_honey","name":"Sweet Mint Pot","price":28,"inputs":{"catmint":2,"honey":1},"served":115,"cost":900,"kind":"tea"},{"id":"garden_plate","name":"Garden Picnic Plate","price":28,"inputs":{"carrot":3,"catmint":2},"served":140,"cost":1100,"kind":"food"},{"id":"cove_roast","name":"Cove Roast","price":36,"inputs":{"coffee":3},"served":170,"cost":1400,"kind":"coffee"},{"id":"honey_crunch","name":"Honey Crunch Bowl","price":34,"inputs":{"carrot":4,"honey":2},"served":200,"cost":1700,"kind":"food"},{"id":"moon_tea","name":"Moonlight Tea","price":38,"inputs":{"catmint":3,"honey":2},"served":240,"cost":2100,"kind":"tea"},{"id":"seaside_cup","name":"Seaside Signature","price":42,"inputs":{"coffee":2,"catmint":1,"honey":1},"served":285,"cost":2600,"kind":"coffee"},{"id":"picnic_bites","name":"Picnic Bites","price":40,"inputs":{"carrot":4,"catmint":2,"honey":1},"served":340,"cost":3200,"kind":"food"},{"id":"midknight_feast","name":"Midknight’s Garden Feast","price":52,"inputs":{"carrot":5,"catmint":2,"honey":2},"served":420,"cost":4500,"kind":"food"}]);
  for(const r of recipes){r.kind ||= r.id==='bites'?'food':r.id==='tea'?'tea':'coffee';r.cost ??= r.id==='midknight'?200:r.id==='bites'?150:0;r.served ??= r.id==='midknight'?20:r.id==='bites'?10:0;r.note ||= r.kind==='food'?'A garden treat for hungry paws.':r.kind==='tea'?'A gentle cup from the garden.':'A cozy coffee for a seaside break.';}
  const starters=['coffee','tea','carrot_crunch'];
  function recipeOffer(g,id){const s=init(g,Date.now()),r=recipes.find(r=>r.id===id);if(!r)return null;const owned=s.discovered.includes(id),requirements=[];if(s.served<r.served)requirements.push('Serve '+r.served+' customers ('+s.served+'/'+r.served+')');if(r.served>=90&&r.kind==='food'&&!s.cookware)requirements.push('Get Copper cookware');if(r.served>=170&&r.kind==='coffee'&&s.speed<1)requirements.push('Get the Twin brewer');return {owned,cost:r.cost,requirements,eligible:!requirements.length};}
  function buyRecipe(g,id){const r=recipes.find(r=>r.id===id),offer=recipeOffer(g,id),s=g.cafe;if(!s.unlocked||!offer||offer.owned||!offer.eligible||g.shells<offer.cost)return false;g.shells-=offer.cost;s.discovered.push(id);return true;}
  function menuLimit(s){return Math.max(s.menuCapacity||3,3+(s.shopTier||0));}
  function addToMenu(g,id){const s=init(g,Date.now());if(s.menu.includes(id))return true;if(!s.discovered.includes(id)||s.menu.length>=menuLimit(s))return false;s.menu.push(id);return true;}
  // Rush hour: two 45-minute windows a day (one in the morning, one in the afternoon) at times that change daily. Guests arrive 40% faster; each still pays the usual price.
  const RUSH_FACTOR=0.6,RUSH_LEN=45*60000;
  function rushWindows(now){const d=new Date(now);d.setHours(0,0,0,0);const day0=d.getTime(),key=d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();
    const a=day0+Math.round((7.5+hash01('rushA:'+key)*2.5)*3600000/60000)*60000,b=day0+Math.round((14.5+hash01('rushB:'+key)*3)*3600000/60000)*60000;
    return [[a,a+RUSH_LEN],[b,b+RUSH_LEN]];}
  function rush(now=Date.now()){const day=[...rushWindows(now),...rushWindows(now+86400000)];
    for(const [a,b] of day)if(now>=a&&now<b)return {active:true,start:a,end:b,left:b-now};
    const nx=day.find(([a])=>a>now);return {active:false,next:nx?nx[0]:null,until:nx?nx[0]-now:null};}
  const interval=(s,at)=>[240000,210000,180000][s.speed]*(at!=null&&rush(at).active?RUSH_FACTOR:1);
  const finishes={sage:{name:'Catmint Sage',cost:0,body:'#9eaf85',shade:'#6f865f',dark:'#395a45',light:'#e6ecd2'},butter:{name:'Buttercup',cost:2500,body:'#dfcb76',shade:'#b5a35b',dark:'#69653b',light:'#fff0b9'},blue:{name:'Coastal Blue',cost:2500,body:'#91b2bd',shade:'#608793',dark:'#365864',light:'#dae9e6'},rose:{name:'Rosewater',cost:5000,body:'#c6a094',shade:'#a07870',dark:'#70554e',light:'#f0ddd0'},cream:{name:'Oatmilk',cost:5000,body:'#d6c8a8',shade:'#ae9f7e',dark:'#655d49',light:'#f7eedb'}};
  function buyFinish(g,key){const s=init(g,Date.now()),f=finishes[key];if(!s.unlocked||!f)return false;s.finishesOwned ||= ['sage'];if(!s.finishesOwned.includes(key)){if(g.shells<f.cost)return false;g.shells-=f.cost;s.finishesOwned.push(key);}s.finish=key;return true;}
  const shops=[{name:'Little Kiosk',cost:0,description:'A compact timber serving window with two warm lamps.'},{name:'Garden Café',cost:20000,description:'A wider shop with a striped awning, hanging plants and flower boxes.'},{name:'Seaside Café',cost:45000,description:'A full façade with arched glowing windows, a raised sign and canopy lights.'}];
  // Outdoor décor: bought once, drawn in the outside view. Deliberately not cheap (a shop finish is 2,500+, a full new shop 20,000+).
  const decor={
    flowerbox:{name:'Window flower boxes',cost:1200,note:'Spilling blooms beneath the serving window.'},
    chalkboard:{name:'Chalkboard sign',cost:1800,note:'An A-frame board that chalks up today’s special.'},
    parasol:{name:'Parasol & bistro table',cost:3500,note:'A striped parasol over a little table for two.'},
    lights:{name:'String lights',cost:5500,note:'Warm bulbs along the roofline that glow after dark.'},
    statue:{name:'Midknight statue',cost:8000,note:'A stone cat keeping watch by the path.'},
    fountain:{name:'Garden fountain',cost:12000,note:'A little stone basin with water that never stops.'}
  };
  function buyDecor(g,id){const s=init(g,Date.now()),d=decor[id];if(!s.unlocked||!d)return false;s.decor||={};if(s.decor[id]||g.shells<d.cost)return false;g.shells-=d.cost;s.decor[id]=true;return true;}
  function cafeName(s){const n=String((s&&s.name)||'').trim();return n||'Catmint Café';}
  function renameCafe(g,name){const s=init(g,Date.now());if(!s.unlocked)return false;const clean=String(name||'').replace(/[\u0000-\u001f<>]/g,'').replace(/\s+/g,' ').trim().slice(0,22);if(!clean)return false;s.name=clean===('Catmint Café')?'':clean;return true;}
  // Average guest rating (3–5 stars) from the counts we already keep.
  function rating(s){const r=s&&s.customerReport;if(!r||!r.total)return null;const four=Math.max(0,r.happy-r.delighted),three=Math.max(0,r.total-r.happy);return Math.round((3*three+4*four+5*r.delighted)/r.total*10)/10;}
  // The next thing worth saving for — a visible goal beats a hidden shop.
  function nextGoal(g){const s=init(g,Date.now()),out=[];if(!s.unlocked)return null;
    if(s.speed<2)out.push({id:'speed',label:['Twin brewer','Cove brewer'][s.speed],cost:(s.speed+1)*300});
    if(!s.seats)out.push({id:'seat',label:'A table by the sea',cost:150});
    if(!s.cookware)out.push({id:'cookware',label:'Copper cookware',cost:180});
    for(const [id,d] of Object.entries(decor))if(!(s.decor&&s.decor[id]))out.push({id:'decor:'+id,label:d.name,cost:d.cost});
    const next=shops[(s.shopTier||0)+1];if(next)out.push({id:'shop',label:next.name,cost:next.cost});
    out.sort((a,b)=>a.cost-b.cost);return out[0]||null;}
  // Taste: every guest reacts to the drink in front of them. A drink's character (strong / sweet / mild / food) meets the cat's own personality;
  // a better recipe wins more hearts. Deterministic per cat and visit, so it never feels random-cruel.
  const PROFILE={coffee:{strong:2},tea:{mild:2},midknight:{strong:1,sweet:2},bites:{sweet:1,food:2}};
  const LIKES={glutton:{food:2,sweet:1},cuddly:{mild:2,sweet:1},bold:{strong:2},shy:{mild:2,strong:-.8},playful:{sweet:2},lazy:{mild:1,sweet:1},curious:{},grumpy:{strong:1,sweet:-.6},chatty:{sweet:1},climber:{strong:1}};
  function hash01(str){let h=2166136261;for(const ch of String(str)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619);}return (h>>>0)/4294967296;}
  function taste(s,r,cat){
    const prof=PROFILE[r.id]||(r.kind==='food'?{food:2}:r.kind==='tea'?{mild:2}:{strong:1}),traits=(cat&&cat.traits)||[],level=(s.recipeLevels&&s.recipeLevels[r.id])||0;let score=1.8;
    for(const t of traits){const l=LIKES[t]||{};for(const k in prof)score+=prof[k]*(l[k]||0);if(t==='curious'&&level>0)score+=1;}
    score+=level*.9+(hash01(((cat&&cat.name)||'')+':'+(s.served||0))-.5)*2;
    const name=(cat&&cat.name)||'A guest';
    if(score>=3.4)return {mood:'love',text:name+' loved it. Straight to the purr.'};
    if(score>=1)return {mood:'happy',text:name+' enjoyed it.'};
    if(score>=.5)return {mood:'meh',text:name+' thought it was fine.'};
    return {mood:'bitter',text:(r.id==='coffee'||r.id==='midknight')?name+' found it a little bitter. A better recipe, or honey, helps.':name+' wasn’t sure about that one.'};
  }
  function localDay(now){const d=new Date(now);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
  const DAILY_KINDS=['serve','special','earn'];
  function daily(g,now=Date.now()){
    const s=init(g,now);if(!s.unlocked)return null;
    const day=localDay(now);
    if(!s.daily||s.daily.day!==day){const sp=special(s,now);let kind=DAILY_KINDS[Math.floor(hash01('daily:'+day)*DAILY_KINDS.length)];if(kind==='special'&&!sp)kind='serve';s.daily={day,kind,served0:s.served||0,revenue0:s.revenue||0,special:sp||null,sold0:sp?((s.sales&&s.sales[sp])||0):0,claimed:false};}
    const d=s.daily;
    const cfg={serve:{title:'Serve 12 guests',target:12,reward:120,got:(s.served||0)-d.served0},special:{title:'Serve 5 of today’s special',target:5,reward:150,got:d.special?(((s.sales&&s.sales[d.special])||0)-d.sold0):0},earn:{title:'Earn 250 Shells from guests',target:250,reward:100,got:Math.floor((s.revenue||0)-d.revenue0)}}[d.kind];
    return {kind:d.kind,title:cfg.title,target:cfg.target,reward:cfg.reward,progress:Math.min(cfg.target,Math.max(0,cfg.got)),done:cfg.got>=cfg.target,claimed:!!d.claimed,special:d.special};
  }
  function claimDaily(g,now=Date.now()){const dl=daily(g,now);if(!dl||!dl.done||dl.claimed)return 0;g.cafe.daily.claimed=true;g.shells+=dl.reward;return dl.reward;}
  function upgradeShop(g,now){const s=init(g,now),tier=s.shopTier||0,next=shops[tier+1];if(!s.unlocked||!next||g.shells<next.cost)return false;settle(g,now);g.shells-=next.cost;s.shopTier=tier+1;return true;}
  function init(g,now){
    const h=g.homestead;
    if(!g.cafe){g.cafe={version:2,unlocked:false,open:false,cursor:now,sequence:0,speed:0,seats:0,menu:[],discovered:[],served:0,revenue:0,cost:0,sales:{},basis:{},pending:null};}
    if(!g.cafe.discovered)g.cafe.discovered=[...g.cafe.menu];
    if(g.cafe.recipeBookVersion!==1){g.cafe.menuCapacity=Math.max(3,g.cafe.menu.length);g.cafe.recipeBookVersion=1;}
    if(g.cafe.unlocked&&g.cafe.lessonComplete)for(const id of starters)if(!g.cafe.discovered.includes(id))g.cafe.discovered.push(id);
    if(!g.cafe.menu.length)g.cafe.open=false;
    return g.cafe;
  }
  function available(s,stock){return recipes.filter(r=>s.menu.includes(r.id)&&Object.entries(r.inputs).every(([k,n])=>(stock[k]||0)>=n));}
  function acquire(g,key,n,cost){const s=init(g,Date.now()),stock=g.homestead.stock,old=stock[key]||0; s.basis[key]=((s.basis[key]||0)*old+cost)/(old+n);stock[key]=old+n;}
  function settle(g,now){
    const s=init(g,now);if(!s.unlocked)return 0;
    if(now<s.cursor)return 0;
    const start=Math.max(s.cursor,now-43200000);let t=start,earned=0;
    if(s.cursor<start)s.cursor=start;
    for(let steps=0;steps<600;steps++){
      if(s.pending){if(s.pending.at>now)break;const p=s.pending;s.pending=null;g.shells+=p.price;earned+=p.price;s.served++;s.revenue+=p.price;s.cost+=p.cost;for(const id of (p.items||[p.id]))s.sales[id]=(s.sales[id]||0)+1;const response=feedback(s,p);s.lastCompleted={id:p.id,items:p.items||[p.id],at:p.at,price:p.price,response};s.customerReport||={total:0,happy:0,delighted:0};s.customerReport.total++;if(response.rating>=4)s.customerReport.happy++;if(response.rating===5)s.customerReport.delighted++;s.feedbackLog||=[];s.feedbackLog.unshift({id:p.id,at:p.at,price:p.price,...response});s.feedbackLog.length=Math.min(10,s.feedbackLog.length);root.CoveGuestStories?.served(g,p.items||[p.id],p.at);t=Math.max(t,p.at);}
      if(!s.open){s.cursor=now;break;}
      const options=available(s,g.homestead.stock);if(!options.length){s.open=false;s.closedReason='ingredients';s.cursor=now;break;}
      const due=s.cursor+interval(s,s.cursor);if(due>now)break;
      s.cursor=due;s.pending=prepareOrder(g,s,options,due);
    }
    return earned;
  }
  function setOpen(g,open,now=Date.now()){
    settle(g,now);const s=init(g,now);
    if(!open){s.open=false;s.closedReason=null;return true;}
    if(!s.unlocked||!available(s,g.homestead.stock).length){s.open=false;s.closedReason=s.menu.length?'ingredients':null;return false;}
    s.open=true;s.closedReason=null;
    // First welcome starts promptly. Reopening never resets the earning cadence.
    if(!s.sequence&&!s.pending)s.cursor=now-interval(s);
    settle(g,now);return true;
  }
  function unlock(g,now){const s=init(g,now);if(s.unlocked||g.shells<120)return false;g.shells-=120;s.unlocked=true;s.cursor=now-210000;
    // Retain all legacy prepared stock, jobs, furniture and earnings without rewriting them.
    // A one-time carry-over credits their value; old settlement is disabled by the adapter.
    const h=g.homestead;s.legacyCarryover={earned:h.earned||0,servings:h.counter||0,credited:true};
    const yields={carrot:4,pumpkin:8,berry:12};
    s.legacyCarryover.prepared=(h.stoves||[h.batch]).filter(Boolean).reduce((n,j)=>n+(yields[j.key]||0),0);
    g.shells+=s.legacyCarryover.earned+(s.legacyCarryover.servings+s.legacyCarryover.prepared)*2;
    s.speed=Math.min(2,Math.max(0,(h.stoves?.length||2)-2));s.seats=h.tables>3?1:0;
    acquire(g,'coffee',6,0);acquire(g,'catmint',6,0);acquire(g,'honey',2,0);return true;}
  // Recipes were never actually secret -- guessing ingredient amounts to "discover" a known,
  // fixed list just added friction. Tap the drink you want; it's made if you have the
  // ingredients, same cost/consumption as the old guessing game.
  function makeRecipe(g,id){const s=init(g,Date.now()),stock=g.homestead.stock,r=recipes.find(x=>x.id===id);
    if(!s.unlocked||!r)return {error:'Pick a drink to make.'};
    if(s.discovered.includes(id))return {error:'You already know how to make this.'};
    const short=Object.entries(r.inputs).find(([k,n])=>(stock[k]||0)<n);
    if(short)return {error:'You need more '+ingredients[short[0]].name.toLowerCase()+'.'};
    for(const [k,n]of Object.entries(r.inputs)){stock[k]-=n;s.experimentCost=(s.experimentCost||0)+(s.basis[k]||0)*n;}
    s.discovered.push(id);
    return {id,message:'You made '+r.name+'! Give it a name.'};
  }
  function feedback(s,p){const level=s.recipeLevels?.[p.id]||0,rating=Math.min(5,3+(s.served%5?1:0)+level),food=recipes.find(r=>r.id===p.id)?.kind==='food';
    const lines=rating===5?(food?['Every crumb was worth it.','Saving my last bite. Maybe.','Five purrs for the chef!']:['That deserves a very long purr.','My new favorite cozy cup.','I would queue again for this.']):rating===4?(food?['A lovely little garden snack.','Crumbs on my whiskers. No regrets.','Just right after a seaside stroll.']:['Warm paws. Happy heart.','A lovely cup by the sea.','I came for coffee. I stayed for company.']):(food?['A nice start. A little more refinement?']:['Cozy, but the flavor could be a little smoother.']);
    return {rating,text:lines[s.served%lines.length]};
  }
  function displayName(s,r){return s.recipeNames?.[r.id]||r.name;}
  // One drink on the menu is "today's special" (only when there are two or more): it pays a quarter more. It nudges you toward a varied menu.
  function special(s,now=Date.now()){if(!s||!s.menu||s.menu.length<2)return null;const day=new Date(now).toISOString().slice(0,10);return s.menu[Math.floor(hash01('special:'+day)*s.menu.length)];}
  function price(s,r,at){const base=r.price+(s.recipeLevels?.[r.id]||0)*2;return special(s,at||Date.now())===r.id?base+Math.ceil(base*.25):base;}
  function nameRecipe(g,id,name){const s=init(g,Date.now());if(!s.discovered.includes(id))return false;const clean=String(name||'').trim().replace(/\s+/g,' ').slice(0,24);if(!clean)return false;(s.recipeNames||={})[id]=clean;return true;}
  function lesson(g){const s=init(g,Date.now());if(!s.unlocked||s.lessonComplete)return {error:'Your free lesson is already complete.'};s.lessonComplete=true;if(!s.discovered.includes('coffee'))s.discovered.push('coffee');return {id:'coffee',message:'A balanced first cup! Give it your own name.'};}
  function improve(g,id){const s=init(g,Date.now()),level=s.recipeLevels?.[id]||0;if(!s.discovered.includes(id)||level>=2||(s.sales[id]||0)<(level+1)*10||g.shells<(level+1)*50)return false;g.shells-=(level+1)*50;(s.recipeLevels||={})[id]=level+1;return true;}
  function pantryPlan(g){const s=init(g,Date.now()),stock=g.homestead?.stock||{},selected=recipes.filter(r=>s.menu.includes(r.id)),needs={};
    for(const r of selected)for(const [key,n]of Object.entries(r.inputs))needs[key]=(needs[key]||0)+n*5;
    const rows=Object.entries(ingredients).map(([key,item])=>{const plots=(g.homestead?.plots||[]).filter(p=>p?.key===key),growing=plots.length*item.yield,ready=plots.filter(p=>p.ready<=Date.now()).length*item.yield,target=needs[key]||0,have=stock[key]||0,short=Math.max(0,target-have),plant=Math.max(0,short-growing);return {key,...item,have,target,short,growing,ready,plant,patches:Math.ceil(plant/item.yield),usedBy:selected.filter(r=>r.inputs[key]).map(r=>displayName(s,r))};});
    return {rows:rows.sort((a,b)=>Number(b.target>0)-Number(a.target>0)||b.plant-a.plant),selected:selected.map(r=>({id:r.id,name:displayName(s,r),orders:Math.min(...Object.entries(r.inputs).map(([k,n])=>Math.floor((stock[k]||0)/n)))}))};
  }
  function plantingPlan(g){const free=(g.homestead?.plots||[]).flatMap((p,i)=>p?[]:[i]),rows=pantryPlan(g).rows.filter(r=>r.patches>0).map(r=>({...r})),jobs=[];let cost=0;while(free.length&&rows.some(r=>r.patches>0)){for(const r of rows){if(!free.length)break;if(r.patches>0){jobs.push({slot:free.shift(),key:r.key});cost+=r.cost;r.patches--;}}}return {jobs,cost};}
  function plantSuggested(g,quote,now=Date.now()){const current=plantingPlan(g);if(!current.jobs.length||JSON.stringify(current)!==JSON.stringify(quote)||g.shells<current.cost)return false;for(const job of current.jobs){const crop=ingredients[job.key];g.homestead.plots[job.slot]={key:job.key,ready:now+crop.seconds*1000};}g.shells-=current.cost;return true;}
  function prepareOrder(g,s,options,now){
    const first=options[s.sequence++%options.length],items=[first.id];let cost=0,total=0;
    const consume=r=>{for(const[k,n]of Object.entries(r.inputs)){g.homestead.stock[k]-=n;cost+=(s.basis[k]||0)*n;}total+=price(s,r,now);};
    consume(first);
    // Every third guest pairs a drink (coffee or tea) with food when both are stocked.
    if(s.sequence%3===0){
      const other=available(s,g.homestead.stock).find(r=>first.kind==='food'?r.kind!=='food':r.kind==='food');
      if(other){consume(other);items.push(other.id);}
    }
    return {id:first.id,items,price:total,cost,at:now+30000};
  }
  function customerReady(s,now=Date.now()){return !s.lastCompleted||now-s.lastCompleted.at>=4200;}
  function takeOrder(g,now=Date.now()){
    const s=init(g,now);if(!s.unlocked||!s.open||s.pending||now<s.cursor||!customerReady(s,now))return false;
    const options=available(s,g.homestead.stock);if(!options.length)return false;
    s.cursor=now;s.pending=prepareOrder(g,s,options,now);return true;
  }
  function helpOrder(g,now=Date.now()){const s=init(g,now),p=s.pending;if(!p||p.helped||p.at<=now)return false;p.helped=true;p.boostedAt=now;p.at=now+Math.ceil((p.at-now)/2);return true;}
  root.CoveCafeEngine={customerReady,recipeOffer,buyRecipe,menuLimit,addToMenu,takeOrder,helpOrder,rush,daily,claimDaily,special,taste,ingredients,recipes,shops,finishes,decor,buyDecor,cafeName,renameCafe,rating,nextGoal,buyFinish,upgradeShop,interval,init,setOpen,available,acquire,settle,unlock,makeRecipe,displayName,price,nameRecipe,lesson,improve,pantryPlan,plantingPlan,plantSuggested};
})(globalThis);
