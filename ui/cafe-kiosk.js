(function(root){
 'use strict';
 let stopActive=()=>{};
 root.CoveCafeView={stop(){stopActive();},open(a){
  stopActive();
  const E=root.CoveCafeEngine,g=a.game(),s=E.init(g,Date.now());a.close();
  let panel=document.getElementById('cafe-kiosk');if(!panel){panel=document.createElement('section');panel.id='cafe-kiosk';panel.className='sheet cc-v2';document.getElementById('app').append(panel);a.register(panel);}
  panel.hidden=false;let previewFinish=null,confirmFinish=null,previewTier=null,confirmShop=false,previewDecor=null,confirmDecor=null;const floats=[];let workshop=false,recipeResult=null,renameOnly=false;let previewEquipment=null,displayState=s;let soundNote=0;const SOUND_ICON={music:'<path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/>',rain:'<path d="M7 15a4 4 0 0 1-.5-7.9A5.5 5.5 0 0 1 17 6.5a3.8 3.8 0 0 1 .5 7.5"/><path d="M8 18l-1 3M12 18l-1 3M16 18l-1 3"/>',off:'<path d="M11 5 6 9H3v6h3l5 4z"/><path d="M16 9l5 6M21 9l-5 6"/>'},SOUND_WORD={music:'Café music',rain:'Soft rain',off:'Sound off'};
let stripOpen=(()=>{try{return localStorage.getItem('neo.cafe.strip')==='1';}catch(e){return false;}})();let lastTab=null,view='outside',tab=null,layout={k:0,cx0:0,offset:0},frame=0,last=0,timer,cam=null,camT=0,camKey='',edgeCv=[null,null],edgeT=0,edgeSig='';const actors=a.actors();stopActive=()=>{cancelAnimationFrame(frame);clearInterval(timer);for(const cv of edgeCv){if(cv){cv.width=1;cv.height=1;}}const cv=panel.querySelector("canvas");if(cv){cv.width=1;cv.height=1;}stopActive=()=>{};};
  const money=n=>Math.round(n*10)/10;
  const tabName={menu:'My menu',pantry:'Ingredients',upgrades:'Improve café',resident:'Your café cat',report:'Sales & happy cats',help:'Café help'};
  let guideOn=!s.guideDone&&(!s.lessonComplete||s.guideStarted),guideNamed=!!s.recipeNames?.coffee;
  if(guideOn){s.guideStarted=true;a.save();}
  if(guideOn&&s.unlocked){tab='menu';view='inside';}
  function finishGuide(){s.guideDone=true;guideOn=false;if(s.open)tab=null;a.save();render();}
  function drawGuide(){
   panel.classList.toggle('cc-guiding',guideOn&&tab!=='help');
   const replay=document.createElement('button');replay.className='btn cc-guide-replay';replay.textContent='?';replay.setAttribute('aria-label','Help me play: Café guide');replay.onclick=()=>{if(!s.unlocked){explain({text:'First, set up your café for 120 Shells. It includes starter ingredients. Then make your free practice coffee, add it to your menu, and open for cats.'});return;}tab=tab==='help'?null:'help';render();};panel.querySelector('.cc-head-end').append(replay);
   if(!guideOn||tab==='help')return;
   // Before the cafe is set up there is no content panel to host the card in, so it used to get
   // prepended straight into .cc-intro — stacked right on top of that panel's own near-identical
   // "Set up your cafe" message and button. The intro already explains this step on its own; the
   // guide proper starts once there is something to make.
   if(!s.unlocked)return;
   let title,text,target,step,stockGuide=false;
   if(!s.lessonComplete){step=1;title='Make a cup';text=workshop?'Tap Make my first coffee. It’s free!':'Tap Make your first coffee. We will help you.';target=workshop?'[data-lesson]':'[data-create]';}
   else if(recipeResult||!guideNamed){step=2;title='Give it a name';text='Type a fun name. Then tap Save & sell. You can keep the name we picked, too.';target='[data-save-name]';}
   else if(!s.menu.length){step=3;title='Put it on the menu';text='Tap Add to menu beside your drink. This tells the cats what they can order.';target='[data-recipe]';}
   else if(!s.open&&whyClosed()){const wc=whyClosed();step=4;stockGuide=true;title='Stock up first';text=wc.text.replace(' Restock to open your café.','')+' Cats need ingredients before they can serve. Tap Ingredients to buy some, or grow them in the Garden.';target='[data-tab="pantry"]';}
   else if(!s.open){step=4;title='Welcome the cats!';text='Tap Closed at the top to open your café. Cats will make and serve the food for you.';target='[data-pause]';}
   else{step=5;title='You’re open!';text='Watch Taking order, then brewing or cooking, then serving. It all happens automatically. Each sale earns Shells. Grow more ingredients in the Garden to keep serving.';target='[data-garden]';}
   panel.dataset.guideStep=step;
   const card=document.createElement('section');card.className='cc-guide';card.setAttribute('aria-label','Café guide');
   const count=document.createElement('small');count.textContent='LET’S PLAY · '+({1:1,2:2,3:2,4:3,5:4}[step])+' OF 4';const heading=document.createElement('h3');heading.textContent=title;const copy=document.createElement('p');copy.textContent=text;
   const skip=document.createElement('button');skip.className='btn';skip.textContent=step===5?'Watch my café':'Skip guide';skip.onclick=finishGuide;
   card.append(count,heading,copy);
   // Step 1's "Skip guide" used to sit up here, a second and separately-placed way out right
   // next to the drawer's own Close button -- confusing on the very first screen a new player
   // sees. Put it beside the actual action (Make your first coffee) instead, once that button
   // is on screen to place it next to.
   const skipInline=target==='[data-create]';
   if(!skipInline)card.append(skip);
   if(stockGuide){const garden=document.createElement('button');garden.type='button';garden.className='btn primary';garden.textContent='Visit Cove Garden';garden.onclick=()=>{stopActive();a.garden();};card.append(garden);if(tab!=='pantry'){const pan=document.createElement('button');pan.type='button';pan.className='btn';pan.textContent='Get ingredients';pan.onclick=()=>{tab='pantry';render();};card.append(pan);}}
   const host=panel.querySelector('.cc-content:not([hidden])')||panel.querySelector('.cc-intro');if(host)host.prepend(card);
   const action=panel.querySelector(target);if(action){action.classList.add('cc-guide-target');action.setAttribute('aria-describedby','cc-guide-copy');copy.id='cc-guide-copy';
    if(skipInline){const row=document.createElement('div');row.className='cc-guide-row';action.replaceWith(row);row.append(action,skip);}
    requestAnimationFrame(()=>{const box=action.closest('.cc-content');if(!box)return;const r=action.getBoundingClientRect(),b=box.getBoundingClientRect();if(r.bottom>b.bottom)box.scrollTop+=r.bottom-b.bottom+12;});}
   else if(s.unlocked){card.append(skip);const go=document.createElement('button');go.className='btn primary';go.textContent='Show me';go.onclick=()=>{tab='menu';workshop=step===2;recipeResult=step===2?'coffee':null;render();};card.append(go);if(!host)panel.querySelector('.cc-tabs').after(card);}
  }

  const ready=()=>a.ready?a.ready():{count:0,yields:{}};
  // Harvest from the Café: Blessing owners get one-tap Harvest all; everyone else goes to the Garden to pick by hand.
  function harvestRipe(){
   if(!a.blessing||!a.blessing()){stopActive();a.garden();return;}
   E.settle(g,Date.now());a.harvestAll();render();
  }
  function ripeLabel(n){return a.blessing&&a.blessing()?'Harvest all · '+n+' ripe':n+' ripe · pick in Garden';}
  // The same recommendation the Garden and Pantry both use: plant exactly what the menu is short of.
  function plantRecommended(){
   const plan=E.plantingPlan(g);
   if(!plan.jobs.length){explain({text:ready().count?'Your plots are busy, and '+ready().count+' patch'+(ready().count===1?' is':'es are')+' ripe to harvest.':'Nothing to plant right now: your plots are full or already growing what you need.',go:'garden',label:'Open Garden'});return;}
   if(g.shells<plan.cost){explain({text:'Planting needs '+plan.cost.toLocaleString()+' Shells for seeds. You have '+Math.floor(g.shells).toLocaleString()+'.'});return;}
   let ok=false;commit(()=>{ok=E.plantSuggested(g,plan);});
   const mins=Math.ceil(Math.max(...plan.jobs.map(j=>E.ingredients[j.key].seconds))/60);
   explain(ok?{tone:'ok',text:'Planted '+plan.jobs.length+' patch'+(plan.jobs.length===1?'':'es')+' for '+plan.cost+' Shells. Ripe in about '+mins+' min — we will let you know.',go:'garden',label:'Open Garden'}:{text:'Could not plant right now. Open the Garden to choose crops.',go:'garden',label:'Open Garden'});
  }
  // Tapping a piece of equipment on the counter shows that thing's own upgrade/restock
  // button right where you are -- opening the Improve café tab instead reflowed the whole
  // scene (the camera shrinks the room to make room for the drawer), which read as a jarring
  // zoom just to see one button. A small popup keeps the view exactly as it was.
  let equipOpen=null,equipAnchor=null;
  function closeEquipPopup(){panel.querySelector('.cc-equip-pop')?.remove();equipOpen=null;equipAnchor=null;}
  // ax/ay: where the tap landed, in panel-relative pixels -- the popup anchors right there
  // (clamped so it never runs off a small phone screen) instead of docking at a fixed spot.
  function equipPopup(kind,ax,ay){
   equipOpen=kind;if(ax!=null)equipAnchor={x:ax,y:ay};
   panel.querySelector('.cc-equip-pop')?.remove();
   const pop=document.createElement('div');pop.className='cc-equip-pop';
   let title,desc,label,disabled=false,need=null,go=null;
   if(kind==='speed'){
    const cost=(s.speed+1)*300;disabled=s.speed>=2;
    title=['Little brewer','Twin brewer','Cove brewer'][s.speed];
    desc='One guest every '+(E.interval(s)/60000)+' minutes.';
    label=disabled?'Fully upgraded':'Upgrade · '+cost+' Shells';need=disabled||g.shells>=cost?null:cost;
    go=()=>{commit(()=>{if(g.shells>=cost){g.shells-=cost;s.speed++;}});equipPopup('speed');};
   }else if(kind==='cookware'){
    title='Copper cookware';desc='A copper kettle and lidded pot for your counter.';disabled=!!s.cookware;
    label=disabled?'Already yours':'Add · 180 Shells';need=disabled||g.shells>=180?null:180;
    go=()=>{commit(()=>{if(!s.cookware&&g.shells>=180){g.shells-=180;s.cookware=true;}});equipPopup('cookware');};
   }else if(kind.startsWith('ing:')){
    const key=kind.slice(4),cost=E.ingredients[key].import*5;
    title=E.ingredients[key].name;desc=(g.homestead.stock[key]||0)+' in the pantry.';
    label='Buy 5 · '+cost+' Shells';need=g.shells>=cost?null:cost;
    go=()=>{commit(()=>{if(g.shells>=cost){g.shells-=cost;E.acquire(g,key,5,cost);}});equipPopup(kind);};
   }
   pop.innerHTML=`<div class="cc-equip-head"><h4>${title}</h4><button type="button" class="cc-equip-x" aria-label="Close">×</button></div><p>${desc}</p><button type="button" class="btn primary cc-equip-go" data-go ${disabled?'disabled':''} ${need?'data-need="'+need+'"':''}>${label}</button>`;
   pop.querySelector('.cc-equip-x').onclick=closeEquipPopup;
   if(!disabled)pop.querySelector('[data-go]').onclick=go;
   panel.append(pop);
   {const pr=panel.getBoundingClientRect(),pw=pop.offsetWidth,ph=pop.offsetHeight,a=equipAnchor||{x:pr.width/2,y:pr.height/2};
    let left=a.x-pw/2,top=a.y-ph-18;
    left=Math.max(8,Math.min(left,pr.width-pw-8));
    top=Math.max(8,Math.min(top,pr.height-ph-8));
    pop.style.left=left+'px';pop.style.top=top+'px';}
  }
  // Rename: the sign, the title and (later) what friends see all use this name.
  function openRename(){
   panel.querySelector('.cc-rename')?.remove();
   const card=document.createElement('form');card.className='cc-rename';card.setAttribute('aria-label','Rename your café');
   const label=document.createElement('label');label.textContent='Your café’s name';const input=document.createElement('input');input.type='text';input.maxLength=22;input.value=E.cafeName(s)==='Catmint Café'?'':E.cafeName(s);input.placeholder='Catmint Café';input.autocomplete='off';input.setAttribute('aria-label','Café name');label.append(input);
   const row=document.createElement('div');row.className='cc-rename-row';const save=document.createElement('button');save.type='submit';save.className='btn primary';save.textContent='Save name';const cancel=document.createElement('button');cancel.type='button';cancel.className='btn';cancel.textContent='Cancel';cancel.onclick=()=>card.remove();row.append(save,cancel);
   const hint=document.createElement('small');hint.textContent='Up to 22 characters. It goes on your sign and shows to friends who visit.';card.append(label,hint,row);
   card.onsubmit=e=>{e.preventDefault();const v=input.value.trim();if(!v){explain({text:'Type a name first, or Cancel to keep the current one.'});return;}let ok=false;commit(()=>{ok=E.renameCafe(g,v);});explain(ok?{tone:'ok',text:'Your café is now “'+E.cafeName(s)+'”. The sign has been repainted.'}:{text:'That name could not be saved. Try another.'});};
   panel.querySelector('.cc-top').append(card);input.focus();
  }
  // The single best next thing to do, offered as one big button (the way good cozy games avoid a wall of choices).
  function nextAction(){
   if(!s.unlocked)return null;
   if(!s.lessonComplete)return {label:'Make your first coffee',fn:()=>{tab='menu';view='inside';workshop=true;render();}};
   if(!s.menu.length)return {label:'Add a drink to your menu',fn:()=>{tab='menu';render();}};
   const why=!s.open?whyClosed():null,rd=ready();
   if(why&&why.keys)return rd.count&&why.keys.some(k=>rd.yields[k]>0)?{label:a.blessing&&a.blessing()?'Harvest all · restock':'Harvest ripe crops',fn:harvestRipe}:{label:'Get ingredients to open',fn:()=>explain(why)};
   if(!s.open)return {label:'Open your café',fn:()=>panel.querySelector('[data-pause]')?.click()};
   if(missingKeys().length||[...document.querySelectorAll('#cafe-kiosk .cc-pip.low')].length)return {label:'Get ingredients',fn:()=>{tab='pantry';render();}};
   if(rd.count)return {label:a.blessing&&a.blessing()?'Harvest all · '+rd.count+' ripe':rd.count+' ripe · harvest',fn:harvestRipe};
   return null;
  }
  // Why the café can't open right now (null when it can): no menu yet, or an ingredient for something on the menu has run out.
  function missingKeys(){return [...new Set(E.recipes.filter(r=>s.menu.includes(r.id)).flatMap(r=>Object.entries(r.inputs).filter(([k,n])=>(g.homestead.stock[k]||0)<n).map(([k])=>k)))];}
  function whyClosed(){
   if(!s.menu.length)return {text:'Put a drink on your menu first. Cats only serve what is on it.',go:'menu',label:'Open Menu'};
   if(E.available(s,g.homestead.stock).length)return null;
   const keys=missingKeys(),names=keys.map(k=>E.ingredients[k].name.toLowerCase());
   return {text:'Out of '+(names.length>1?names.slice(0,-1).join(', ')+' and '+names.slice(-1):names[0]||'ingredients')+'. Restock to open your café.',keys};
  }
  // One-tap restock: buy 5 of a missing ingredient (opens the café again if that fixes it), or plant a suggested batch in the Garden.
  function buyMissing(k){
   const item=E.ingredients[k],cost=item.import*5;
   if(g.shells<cost){explain({text:'You need '+Math.ceil(cost-g.shells).toLocaleString()+' more Shells to buy 5 '+item.name.toLowerCase()+'. Growing them in the Garden costs less.',keys:[k]});return;}
   commit(()=>{g.shells-=cost;E.acquire(g,k,5,cost);E.setOpen(g,true,Date.now());});
   explain({tone:'ok',text:s.open?'Bought 5 '+item.name.toLowerCase()+' for '+cost+' Shells. Your café is open.':'Bought 5 '+item.name.toLowerCase()+' for '+cost+' Shells. Tap Closed to open when you are ready.'});
  }
  function plantMissing(){
   const plan=E.plantingPlan(g);
   if(!plan.jobs.length){explain({text:'Nothing to plant right now: your plots are full or already growing what you need. Harvest in the Garden when ready.',go:'garden',label:'Open Garden'});return;}
   if(g.shells<plan.cost){explain({text:'Planting needs '+plan.cost.toLocaleString()+' Shells for seeds. You have '+Math.floor(g.shells).toLocaleString()+'.'});return;}
   let ok=false;commit(()=>{ok=E.plantSuggested(g,plan);});
   const mins=Math.ceil(Math.max(...plan.jobs.map(j=>E.ingredients[j.key].seconds))/60);
   explain(ok?{tone:'ok',text:'Planted '+plan.jobs.length+' patch'+(plan.jobs.length===1?'':'es')+' for '+plan.cost+' Shells. Harvest in the Garden in about '+mins+' min.',go:'garden',label:'Open Garden'}:{text:'Could not plant right now. Open the Garden to choose crops.',go:'garden',label:'Open Garden'});
  }
  function explain(why){
   panel.querySelector('.cc-why')?.remove();
   const note=document.createElement('div');note.className='cc-why'+(why.tone==='ok'?' ok':'')+(why.keys?' restock':'');note.id='cc-why';note.setAttribute('role','status');
   const text=document.createElement('span');text.textContent=why.text;note.append(text);
   const acts=document.createElement('div');acts.className='cc-why-acts';
   const add=(label,fn,primary)=>{const b=document.createElement('button');b.className='btn'+(primary?' primary':'');b.textContent=label;b.onclick=fn;acts.append(b);};
   if(why.keys){const y=ready().yields,covers=why.keys.some(k=>y[k]>0);if(covers)add(a.blessing&&a.blessing()?'Harvest all · '+ready().count+' ripe':'Harvest ripe crops in Garden',harvestRipe,true);}
   for(const k of why.keys||[]){const item=E.ingredients[k],cost=item.import*5;add('Buy 5 '+item.name.toLowerCase()+' · '+cost+' Shells',()=>buyMissing(k),true);}
   if(why.keys)add('Plant in Garden',plantMissing,false);
   if(why.go)add(why.label,()=>{if(why.go==='garden'){stopActive();a.garden();}else{tab=why.go;render();}},false);
   if(acts.children.length)note.append(acts);
   panel.querySelector('.cc-top').append(note);setTimeout(()=>note.remove(),why.tone==='ok'?4500:(why.keys?12000:7000));
  }
  panel._needFn=e=>{const b=e.target.closest&&e.target.closest('[data-need],[data-why]');if(!b||!panel.contains(b))return;e.stopImmediatePropagation();e.preventDefault();
   if(b.dataset.why){explain({text:b.dataset.why});return;}
   const need=Math.ceil(Number(b.dataset.need)-g.shells);explain({text:'You need '+need.toLocaleString()+' more Shells for this.'+(b.hasAttribute('data-import')?' Growing ingredients in the Garden costs less.':'')});};
  if(!panel._needHook){panel._needHook=true;panel.addEventListener('click',e=>panel._needFn(e),true);}
  function commit(fn){E.settle(g,Date.now());fn();a.save();a.hud();render();}
  // The guest who just left tasted the drink: give that cat a reaction (used by the scene's emote and the sale note).
  function tasteReaction(){
   const lc=s.lastCompleted;if(!lc||lc.reaction||!E.taste)return;
   const r=E.recipes.find(x=>x.id===lc.id);if(!r)return;
   const pool=actors.length>1?actors.slice(1):actors;if(!pool.length)return;
   const cat=pool[(((s.sequence-1)%pool.length)+pool.length)%pool.length];
   const t=E.taste(s,r,cat);lc.reaction={mood:t.mood,text:t.text,at:Date.now()};
   const rg=(s.regulars||={}),e=(rg[cat.name]||={name:cat.name,coatKey:cat.coatKey,star:cat.star,visits:0,loved:{},last:null});e.visits++;e.last=t.mood;if(t.mood==='love')e.loved[r.id]=(e.loved[r.id]||0)+1;
  }
  function render(){
   const sceneCanvas=panel.querySelector("canvas");
   tasteReaction();
   // remember where the player was (scroll + focused control) so a purchase or toggle never throws them back to the top
   const prevBox=panel.querySelector('.cc-content'),prevScroll=prevBox&&!prevBox.hidden?prevBox.scrollTop:0,ae=document.activeElement,fk=ae&&panel.contains(ae)&&ae.attributes?[...ae.attributes].find(x=>x.name.startsWith('data-')&&x.name!=='data-close'):null,fv=fk?fk.value:null,fname=fk?fk.name:null;
   panel.classList.toggle('cc-managing',!!tab);
   cancelAnimationFrame(frame);clearInterval(timer);displayState=previewEquipment?{...s,[previewEquipment]:previewEquipment==='speed'?Math.min(2,s.speed+1):1}:previewDecor?{...s,decor:{...(s.decor||{}),[previewDecor]:true}}:s;
   panel.classList.toggle('cc-locked',!s.unlocked);const needs=new Set(s.menu.length?E.recipes.filter(r=>s.menu.includes(r.id)).flatMap(r=>Object.keys(r.inputs)):['coffee','catmint','honey']);const goal=s.unlocked?E.nextGoal(g):null,goalHtml=goal?`<button class="cc-goal${g.shells>=goal.cost?' ready':''}" data-goal="${goal.id}" aria-label="Next goal: ${goal.label}, ${goal.cost.toLocaleString()} Shells"><span>Next: ${goal.label}</span><i style="--p:${Math.round(Math.min(1,g.shells/goal.cost)*100)}%"></i><b>${Math.floor(Math.min(g.shells,goal.cost)).toLocaleString()} / ${goal.cost.toLocaleString()}</b></button>`:'';const goalAffordable=!!goal&&g.shells>=goal.cost;const dl=s.unlocked&&E.daily?E.daily(g):null,dailyReady=!!(dl&&dl.done&&!dl.claimed);const sMode=(a.soundMode&&a.soundMode())||'music';const spId=E.special?E.special(s):null,spRecipe=spId&&E.recipes.find(r=>r.id===spId),specialHtml=spRecipe?`<p class="cc-special">★ Today’s special: ${E.displayName(s,spRecipe)} · pays ${E.price(s,spRecipe)} Shells</p>`:'';const rdy=ready(),ripeChip=rdy.count?`<button class="cc-pip cc-ripe" data-ripe aria-label="${rdy.count} patches ripe in the Garden"><span>${ripeLabel(rdy.count)}</span></button>`:'';const pips=ripeChip+[...needs].map(k=>{const n=g.homestead.stock[k]||0,low=n<(E.recipes.filter(r=>s.menu.includes(r.id)).reduce((m,r)=>Math.max(m,r.inputs[k]||0),1));return `<button class="cc-pip${low?' low':''}" data-pip="${k}" aria-label="${E.ingredients[k].name}: ${n} in pantry${low?', running low':''}"><span>${E.ingredients[k].name}</span><b>${n}</b></button>`;}).join('');const anyLow=s.unlocked&&pips.includes(' low');panel.innerHTML=`<canvas aria-label="${view==='inside'?'Behind the counter, customers ordering at the window':'Seaside café kiosk'}" width="720" height="380"></canvas><div class="cc-top"><header class="cc-head"><button class="btn cc-back" data-close aria-label="Return to Cove">‹ Cove</button><div class="cc-switch" aria-label="Café view"><button aria-pressed="${view==='outside'}" data-view="outside">Storefront</button><button aria-pressed="${view==='inside'}" data-view="inside">Counter</button></div><h2 class="cc-title"></h2><span class="cc-head-end"></span></header>${s.unlocked?`<div class="cc-live${stripOpen?'':' compact'}"><div class="cc-live-row"><b class="cc-shells">${Math.floor(g.shells).toLocaleString()} Shells</b><span>${E.rating(s)?'★ '+E.rating(s).toFixed(1)+' · ':''}${s.served} served</span><button class="cc-snd" type="button" data-mode="${sMode}" aria-label="Café sound: ${SOUND_WORD[sMode]}. Tap to change."><svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${SOUND_ICON[sMode]}</svg>${Date.now()-soundNote<1800?`<span class="cc-snd-pill" role="status">${SOUND_WORD[sMode]}</span>`:''}</button><button class="cc-more" type="button" aria-expanded="${stripOpen}" aria-label="${stripOpen?'Show less':'Show more'}"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></button></div><div class="cc-pips${(anyLow||rdy.count)?' cc-attn':''}" role="group" aria-label="Pantry stock">${pips}</div><p class="cc-status" role="status"></p><div class="cc-brew-bar" role="progressbar" aria-label="Order brewing" aria-valuemin="0" aria-valuemax="100" hidden><i></i></div>${specialHtml}<div class="cc-cta-row"></div>${goalHtml}</div>`:`<div class="cc-live cc-live-lite"><b class="cc-shells">${Math.floor(g.shells).toLocaleString()} Shells</b></div>`}</div>`;
   // Keep the painted room across control updates; a new empty canvas flashes cream.
   if(sceneCanvas){const placeholder=panel.querySelector('canvas');sceneCanvas.setAttribute('aria-label',placeholder.getAttribute('aria-label'));placeholder.replaceWith(sceneCanvas);}
   panel.querySelector('[data-close]').onclick=()=>{a.close();cancelAnimationFrame(frame);clearInterval(timer);};
   if(a.resort){const back=document.createElement('button');back.type='button';back.className='btn';back.textContent='‹ Resort';back.setAttribute('aria-label','Back to Catmint Resort');back.onclick=()=>{stopActive();a.resort();};panel.querySelector('[data-close]').after(back);}
   panel.querySelector('.cc-title').textContent=E.cafeName(s);
   if(s.unlocked){const pen=document.createElement('button');pen.type='button';pen.className='cc-pen';pen.setAttribute('aria-label','Rename your café');pen.title='Rename your café';pen.innerHTML='<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20l1-4L16.5 4.5a2.1 2.1 0 013 3L8 19l-4 1z"/></svg>';pen.onclick=openRename;panel.querySelector('.cc-title').after(pen);
    {const live=panel.querySelector('.cc-live'),h2=panel.querySelector('.cc-title');if(live&&h2){const row=document.createElement('div');row.className='cc-name';row.append(h2,pen);live.prepend(row);}}}
   if(s.unlocked){const toggle=document.createElement('button');toggle.className='cc-service';toggle.dataset.pause='';toggle.setAttribute('role','switch');toggle.setAttribute('aria-checked',String(s.open));toggle.setAttribute('aria-label','Open café');const block=!s.open?whyClosed():null;toggle.classList.toggle('blocked',!!block);if(block)toggle.setAttribute('aria-describedby','cc-why');toggle.title=block?block.text:'Open or close your café';toggle.innerHTML='<span>'+ (s.open?'Open':'Closed')+'</span><span class="cc-toggle" aria-hidden="true"></span>';toggle.onclick=()=>{const opening=!s.open,why=opening?whyClosed():null;if(why){explain(why);return;}commit(()=>{E.setOpen(g,opening,Date.now());});const again=opening&&!s.open?whyClosed():null;explain(again||{tone:'ok',text:s.open?'Open for guests. Cats will serve while ingredients last.':(s.pending?'Closed. The order in progress will finish, then no new guests.':'Closed. Cats have stopped taking new orders.')});};panel.querySelector('.cc-head-end').append(toggle);}
   panel.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{if(view===b.dataset.view)return;view=b.dataset.view;if(view==='inside'&&tab==='upgrades')tab=null;render();});
   if(!s.unlocked){panel.insertAdjacentHTML('beforeend',`<div class="cc-intro"><h3>A little coffee. A lot of company.</h3><p>Your cats run every order. Set up your café and it comes with 6 coffee beans, 6 catmint and 2 honey.</p><button class="btn primary" data-start ${g.shells<120?'data-need="120"':''}>Set up your café · 120 Shells</button><small>${g.shells<120?'Save '+(120-Math.floor(g.shells))+' more Shells to get started.':'Make a drink, put it on the menu, then open for guests.'}</small></div>`);panel.querySelector('[data-start]').onclick=()=>commit(()=>{E.unlock(g,Date.now());if(guideOn){tab='menu';view='inside';}});}
   else{
    panel.insertAdjacentHTML('beforeend',`<nav class="cc-tabs" aria-label="Café management">${(view==='inside'?['menu','pantry']:['menu','pantry','upgrades']).map(k=>`<button aria-pressed="${tab===k}" data-tab="${k}">${tabName[k]}${k==='pantry'&&anyLow?'<i class="cc-dot" aria-label="running low"></i>':''}${k==='upgrades'&&goalAffordable?'<i class="cc-dot good" aria-label="something new to buy"></i>':''}${k==='report'&&dailyReady?'<i class="cc-dot good" aria-label="a daily reward is waiting"></i>':''}</button>`).join('')}</nav><div class="cc-content" ${tab?'':'hidden'}></div>`);
    panel.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{tab=tab===b.dataset.tab?null:b.dataset.tab;render();});const content=panel.querySelector('.cc-content');const sales=document.createElement('button');sales.type='button';sales.className='cc-sales-link';sales.textContent='Sales & happy cats'+(dailyReady?' · reward ready':'');sales.onclick=()=>{tab='report';render();};panel.querySelector('.cc-live-row').append(sales);panel.querySelectorAll('[data-pip]').forEach(b=>b.onclick=()=>{tab='pantry';render();});panel.querySelectorAll('[data-ripe]').forEach(b=>b.onclick=harvestRipe);
    panel.querySelector('.cc-snd')?.addEventListener('click',()=>{const order=['music','rain','off'],next=order[(order.indexOf(sMode)+1)%3];a.setSound&&a.setSound(next);soundNote=Date.now();render();setTimeout(()=>{if(panel.isConnected&&Date.now()-soundNote>=1750)render();},1850);});
    panel.querySelector('.cc-more')?.addEventListener('click',()=>{stripOpen=!stripOpen;try{localStorage.setItem('neo.cafe.strip',stripOpen?'1':'0');}catch(e){}render();});
    {const act=nextAction(),row=panel.querySelector('.cc-cta-row');if(act&&row&&!guideOn){const b=document.createElement('button');b.type='button';b.className='btn primary cc-cta';b.textContent=act.label;b.onclick=act.fn;row.append(b);}}
    panel.querySelector('[data-goal]')?.addEventListener('click',()=>{const id=panel.querySelector('[data-goal]').dataset.goal;view=(id==='speed'||id==='cookware')?'inside':'outside';tab='upgrades';render();});
    if(tab==='resident'){
     const hint=document.createElement('p');hint.textContent='Tap a cat to keep you company inside and at the window.';content.append(hint);
     const selected=actors.find(c=>c.cafeKey===s.residentCat)||actors[1]||actors[0];
     const grid=document.createElement('div');grid.className='cc-cat-grid';grid.setAttribute('aria-label','Available café cats');content.append(grid);
     for(const cat of actors){const chosen=cat===selected,button=document.createElement('button');button.type='button';button.className='cc-cat-choice';button.setAttribute('aria-pressed',String(chosen));
      const portrait=document.createElement('canvas');portrait.width=200;portrait.height=180;a.cat(portrait.getContext('2d'),cat,100,160,1.6,0,false);
      const image=document.createElement('img');image.src=portrait.toDataURL();image.alt='';image.width=100;image.height=90;button.append(image);
      const name=document.createElement('strong');name.textContent=cat.name||cat.coatKey||'Cat';button.append(name);
      const status=document.createElement('small');status.textContent=chosen?'✓ Your café cat':'Choose';button.append(status);
      button.onclick=()=>{s.residentCat=cat.cafeKey;a.save();tab=null;render();};grid.append(button);
     }
    }
    else if(tab==='help'){

     content.innerHTML='<p class="cc-help-intro">Build a little café for your cats. Grow ingredients, serve tasty treats, and earn Shells for new recipes and upgrades. Play at your own pace.</p><div class="cc-help-topics">'+[
      ['Make my first drink','Tap My menu, then Make your first coffee. It’s one tap and it’s free.','first','Make a drink'],
      ['Start serving','Save your first drink with Save & sell. Tap Closed at the top to open. Your cats take orders, make them, and serve them automatically. A progress bar starts at Taking order, then follows preparation and serving. You never have to tap to keep service going. Each sale earns Shells.','menu','Open my menu'],
      ['Help an order go faster','At the Counter, tap Taking order to skip the short wait. While a drink brews or food cooks, tap its bar once to halve the time left. Pickup shows serving. The Storefront shows progress too, without buttons. Helping is always optional.','menu','Back to my menu'],
      ['Choose what to sell','Open My menu. Unlock a recipe when you have what it needs. Give it your own name, then add it to the menu. On menu means cats can order it when you have the ingredients.','menu','Choose recipes'],
      ['A drink and a snack','Some cats order a drink and food together. Keep both on your menu and stock their ingredients. Drinks use the brewer, food uses the cookware, and both are served automatically.','menu','Choose my menu'],
      ['Grow food for my café','The Garden fills your café’s ingredient supply. Follow What my café needs, tap an empty patch, and choose seeds. Tap a growing crop to water it once. Tap it when Ready to harvest. The ingredients go straight to your café.','pantry','Find ingredients'],
      ['I ran out of ingredients','Buy more in Ingredients, or grow more in the Garden. If nothing on your menu can be made, your café closes. Refill, then tap Closed to open again. Crops wait safely until you pick them.','pantry','Get ingredients'],
      ['Make the café nicer','In Storefront, use Improve café for the building and decorations. At the Counter, tap the brewer or cookware to upgrade it.','upgrades','See improvements'],
      ['See how we are doing','Sales & happy cats shows your sales and customer reactions. Tap Show more beside the Shells total to find it.','report','See my results']
     ].map(([title,copy,dest,label])=>'<details class="cc-help-topic" name="cafe-help-topic"><summary>'+title+'</summary><p>'+copy+'</p><button class="btn primary" data-help-go="'+dest+'">'+label+'</button></details>').join('')+'</div><button class="btn" data-help-tour>Guide me step by step</button>';
     content.querySelectorAll('[data-help-go]').forEach(b=>b.onclick=()=>{const dest=b.dataset.helpGo;tab=dest==='first'?'menu':dest;if(dest==='first'){view='inside';workshop=true;recipeResult=null;}render();});
     content.querySelector('[data-help-tour]').onclick=()=>{guideOn=true;s.guideStarted=true;s.guideDone=false;guideNamed=!!s.recipeNames?.coffee;tab='menu';view='inside';workshop=!s.lessonComplete;recipeResult=null;a.save();render();};
     if(a.remindBox){const box=a.remindBox();if(box)content.append(box);}
    }else if(tab==='menu'){

     const escape=value=>String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
     const garden=()=>{if(guideOn&&s.open){s.guideDone=true;a.save();}stopActive();a.garden();};
     if(!workshop){
      const tiles=E.recipes.filter(r=>s.discovered.includes(r.id)).map(r=>{const level=s.recipeLevels?.[r.id]||0,sales=s.sales[r.id]||0,on=s.menu.includes(r.id),short=Object.entries(r.inputs).some(([k,n])=>(g.homestead.stock[k]||0)<n);const state=on?(short?'Needs ingredients':!s.open?'On menu · open café to serve':'Serving automatically'):'Not serving';return `<article class="cc-card cc-recipe${on?' on':''}"><span class="cc-cup">${cup(r.id)}</span><div class="cc-rbody"><h3>${escape(E.displayName(s,r))}</h3><small>${E.price(s,r)} Shells${E.special&&E.special(s)===r.id?' (today’s special)':''} · ${Object.entries(r.inputs).map(([k,n])=>{const nm=E.ingredients[k].name.toLowerCase();return n+' '+(n===1&&nm.endsWith('s')?nm.slice(0,-1):nm);}).join(' + ')}</small><strong class="cc-recipe-state${on&&short?' warn':''}">${state}</strong></div><button class="btn cc-menu-action" aria-pressed="${on}" aria-label="${on?'Remove':'Add'} ${escape(E.displayName(s,r))} ${on?'from':'to'} menu" data-recipe="${r.id}" ${!on&&s.menu.length>=E.menuLimit(s)?'disabled':''}>${on?'Remove from menu':s.menu.length>=E.menuLimit(s)?'Menu full':'Add to menu'}</button>${on&&short?'<button class="btn cc-recipe-restock" data-restock>Get ingredients</button>':''}<details class="cc-recipe-details"><summary>${sales} enjoyed · Level ${level+1}/3</summary><button class="btn" data-name="${r.id}">Rename</button><button class="btn" data-improve="${r.id}" ${level>=2?'disabled':sales<(level+1)*10?'data-why="Serve '+((level+1)*10-sales)+' more of this drink to improve it."':g.shells<(level+1)*50?'data-need="'+(level+1)*50+'"':''}>${level>=2?'Mastered':sales<(level+1)*10?'Serve '+((level+1)*10-sales)+' more to improve':'Improve · '+((level+1)*50)+' Shells · +2 per sale'}</button></details></article>`;}).join('');content.innerHTML=`${s.lessonComplete?`<p>Choose up to ${E.menuLimit(s)} recipes to sell. Remove one to swap. Renaming is free.</p>${tiles}<button class="btn cc-new" data-create>Recipe book · 20 recipes</button>`:`<p>Cats serve what is on your menu, while ingredients last.</p><button class="btn primary" data-create>Make your first coffee · free lesson</button>`}<button class="btn" data-garden>Grow ingredients in Cove Garden</button>`;
      content.querySelector('[data-create]').onclick=()=>{renameOnly=false;workshop=true;recipeResult=null;view='inside';render();};
      content.querySelectorAll('[data-recipe]').forEach(b=>b.onclick=()=>commit(()=>{const id=b.dataset.recipe;if(s.menu.includes(id))s.menu=s.menu.filter(k=>k!==id);else if(!E.addToMenu(g,id))explain({text:'Your menu is full. Remove one recipe to swap it.'});if(!s.menu.length)s.open=false;}));
      content.querySelectorAll('[data-restock]').forEach(b=>b.onclick=()=>{tab='pantry';render();});
      content.querySelectorAll('[data-improve]').forEach(b=>b.onclick=()=>commit(()=>E.improve(g,b.dataset.improve)));
      content.querySelectorAll('[data-name]').forEach(b=>b.onclick=()=>{recipeResult=b.dataset.name;renameOnly=true;workshop=true;render();});
      content.querySelector('[data-garden]').onclick=garden;
     }else{
      content.innerHTML='<button class="btn" data-back-menu>Back to my menu</button><section class="cc-lab"></section>';
      content.querySelector('[data-back-menu]').onclick=()=>{workshop=false;recipeResult=null;render();};
      const lab=content.querySelector('.cc-lab');
      if(recipeResult){
       const recipe=E.recipes.find(r=>r.id===recipeResult);
       lab.innerHTML=`<span class="cc-cup">${cup(recipe.id)}</span><h3>Make it yours</h3><p>${escape(recipe.name)} · ${E.price(s,recipe)} Shells per sale</p><label>Your drink or treat name<input maxlength="24" data-recipe-name aria-label="Recipe name"></label><small>${renameOnly?'Change the name without changing what is on sale.':'Keep this name or choose your own. Add it to your menu when a slot is free.'}</small><button class="btn primary" data-save-name>${renameOnly?'Save name':s.menu.length>=E.menuLimit(s)?'Save recipe':'Save & sell'}</button><p role="status"></p>`;
       lab.querySelector('input').value=E.displayName(s,recipe);
       lab.querySelector('[data-save-name]').onclick=()=>{const name=lab.querySelector('input').value;if(!name.trim()){lab.querySelector('[role="status"]').textContent='Give your creation a name first.';return;}commit(()=>{E.nameRecipe(g,recipe.id,name);if(!renameOnly)E.addToMenu(g,recipe.id);guideNamed=true;workshop=false;recipeResult=null;});};
      }else if(!s.lessonComplete){
       // One tap, free, always succeeds -- the old version was three separate taps
       // (add a bean / brew / taste) for what is really one action a beginner expects
       // to just work the first time.
       lab.innerHTML=`<span class="cc-cup">${cup('coffee')}</span><h3>Your first coffee</h3><p>It’s free — just to see how it’s done.</p><button class="btn primary" data-lesson>Make my first coffee</button>`;
       lab.querySelector('[data-lesson]').onclick=()=>commit(()=>{renameOnly=false;const result=E.lesson(g);recipeResult=result.id||null;if(result.id)a.firstBrewOverview?.();});
      }else{
       // Picking ingredient amounts and guessing a match used to be the way to learn a
       // new drink -- real recipes were never actually secret, so the guessing added
       // confusion without adding a real choice. Tap the drink you want instead.
       const recipeCard=r=>{
        const offer=E.recipeOffer(g,r.id),on=s.menu.includes(r.id),need=Object.entries(r.inputs).map(([k,n])=>n+' '+E.ingredients[k].name.toLowerCase()).join(' + ');
        const state=offer.owned?(on?'On menu':'Owned'):offer.eligible?'Available':'Locked';
        return '<article class="cc-card cc-recipe-pick"><span class="cc-cup">'+cup(r.id)+'</span><div class="cc-rbody"><h3>'+escape(E.displayName(s,r))+'</h3><strong>'+state+'</strong><small>'+escape(need)+' · '+E.price(s,r)+' Shells per sale</small>'+(offer.requirements.length&&!offer.owned?'<small>'+escape(offer.requirements.join(' · '))+'</small>':'')+'</div><button class="btn '+(offer.owned?'':'primary')+'" data-book="'+r.id+'" '+(!offer.owned&&(!offer.eligible||g.shells<offer.cost)?'disabled':'')+'>'+(offer.owned?'Rename':!offer.eligible?'Locked':g.shells<offer.cost?'Need '+offer.cost+' Shells':'Unlock · '+offer.cost+' Shells')+'</button></article>';
       };
       const owned=E.recipes.filter(r=>s.discovered.includes(r.id)),available=E.recipes.filter(r=>!s.discovered.includes(r.id)&&E.recipeOffer(g,r.id).eligible),locked=E.recipes.filter(r=>!s.discovered.includes(r.id)&&!E.recipeOffer(g,r.id).eligible);
       lab.innerHTML='<h3>Recipe book</h3><p>'+s.discovered.length+' / 20 owned · Buy once. Name it your way.</p>'+(available.length?'<h4>Ready to unlock</h4>'+available.map(recipeCard).join(''):'')+'<details><summary>Your recipes · '+owned.length+'</summary>'+owned.map(recipeCard).join('')+'</details>'+(locked.length?'<details><summary>Next recipes · '+locked.length+'</summary>'+locked.map(recipeCard).join('')+'</details>':'')+'<button class="btn" data-garden>Grow ingredients in Cove Garden</button>';
       lab.querySelectorAll('[data-book]').forEach(b=>b.onclick=()=>{const id=b.dataset.book,offer=E.recipeOffer(g,id);if(offer.owned){renameOnly=true;recipeResult=id;render();}else commit(()=>{if(E.buyRecipe(g,id)){renameOnly=false;recipeResult=id;}});});
       lab.querySelector('[data-garden]').onclick=garden;
      }
     }
    }else if(tab==='pantry'){
     content.innerHTML=`<p>Buy ingredients now with Shells, or grow them in Cove Garden for less. Harvested crops go straight into this stock.</p>${Object.entries(E.ingredients).map(([k,v])=>`<article class="cc-card"><div><h3>${v.name} <span class="cc-count">${g.homestead.stock[k]||0}</span></h3><small>Buy 5 for ${v.import*5} Shells · Garden harvest: ${v.yield} for ${v.cost} Shells</small></div><button class="btn" data-import="${k}" ${g.shells<v.import*5?'data-need="'+v.import*5+'"':''}>Buy 5 · ${v.import*5}</button></article>`).join('')}<button class="btn primary" data-garden>Visit Cove Garden</button>`;content.querySelectorAll('[data-import]').forEach(b=>b.onclick=()=>commit(()=>{const k=b.dataset.import,cost=E.ingredients[k].import*5;if(g.shells>=cost){g.shells-=cost;E.acquire(g,k,5,cost);}}));content.querySelector('[data-garden]').onclick=()=>{cancelAnimationFrame(frame);clearInterval(timer);a.garden();};
     const plan=E.pantryPlan(g),overview=document.createElement('details');overview.className='cc-pantry-plan';const heading=document.createElement('summary');heading.textContent='Plan what to grow';overview.append(heading);const goal=document.createElement('p');goal.textContent=plan.selected.length?'Stock goal: five more orders of every recipe on sale. Ingredients are shared between recipes.':'Start serving a recipe in My Menu to get planting recommendations.';overview.append(goal);{const plan=E.plantingPlan(g),rd=ready();if(plan.jobs.length){const counts={};for(const j of plan.jobs)counts[j.key]=(counts[j.key]||0)+1;const pb=document.createElement('button');pb.className='btn primary';pb.dataset.plantRec='';pb.textContent='Plant recommended · '+plan.cost+' Shells';pb.onclick=plantRecommended;const why=document.createElement('small');why.textContent='Plants '+Object.entries(counts).map(([k,n])=>n+' × '+E.ingredients[k].name.toLowerCase()).join(', ')+' in your free plots.';overview.append(pb,why);}if(rd.count){const hb=document.createElement('button');hb.className='btn'+(plan.jobs.length?'':' primary');hb.dataset.harvestRipe='';hb.textContent=ripeLabel(rd.count);hb.onclick=harvestRipe;overview.append(hb);}}
     // Put the garden route before the shopping list, not at the end of it.
     const grow=content.querySelector('[data-garden]');grow.textContent='Grow ingredients';content.prepend(grow);
     // Keep the Garden button visible; detailed forecasts are optional.
     for(const recipe of plan.selected){const p=document.createElement('p');p.textContent=recipe.name+': '+'up to '+recipe.orders+' order'+(recipe.orders===1?'':'s')+' from current stock.';overview.append(p);}
     for(const row of plan.rows.filter(r=>r.target)){const card=document.createElement('article');card.className='cc-card';const body=document.createElement('div');const name=document.createElement('h3');name.textContent=row.name+' · '+row.have+' in pantry';const detail=document.createElement('p');detail.textContent='Goal '+row.target+' · '+row.growing+' in Garden'+(row.ready?' ('+row.ready+' ready to harvest)':'');const action=document.createElement('small');action.textContent=row.ready&&row.short?'Harvest ready patches first.':row.plant?'Plant '+row.patches+' patch'+(row.patches===1?'':'es')+' · '+row.cost*row.patches+' Shells · '+Math.ceil(row.seconds/60)+' min per harvest.':row.short?'Already growing enough. Harvest when ready.':'Enough stocked for this goal.';const use=document.createElement('small');use.textContent='For '+row.usedBy.join(', ');body.append(name,detail,action,use);card.append(body);overview.append(card);}content.append(overview);
    }else if(tab==='report'){
     const best=E.recipes.slice().sort((a,b)=>(s.sales[b.id]||0)-(s.sales[a.id]||0))[0];const low=Object.keys(E.ingredients).sort((a,b)=>(g.homestead.stock[a]||0)-(g.homestead.stock[b]||0))[0];
     content.innerHTML=`<p class="cc-report-line">${s.served?'“The cups are empty. The hearts are full.”':'“Midknight has inspected the counter. Twice.”'}</p><div class="cc-stats">${[['Served',s.served],['Sales',money(s.revenue)],['Ingredient cost',money(s.cost+(s.experimentCost||0))],['Net profit',money(s.revenue-s.cost-(s.experimentCost||0))]].map(([k,v])=>`<div><small>${k}</small><strong>${v}</strong></div>`).join('')}</div><p>${s.served?'Best seller: '+E.displayName(s,best)+' · '+s.sales[best.id]+' sold':'Your first sale will appear here.'}</p><p>Garden tip: ${E.ingredients[low].name.toLowerCase()} is your lowest stock.</p>${E.plantingPlan(g).jobs.length?`<button class="btn primary" data-plant-rec>Plant recommended · ${E.plantingPlan(g).cost} Shells</button>`:''}<button class="btn${E.plantingPlan(g).jobs.length?'':' primary'}" data-garden>Visit Cove Garden</button><small class="cc-note">Lifetime figures. Costs follow ingredients used, including growing costs. Starter ingredients are complimentary. Stock-limited offline service runs for up to 12 hours; unused ingredients stay safe.</small>`;content.querySelector('[data-garden]').onclick=()=>{cancelAnimationFrame(frame);clearInterval(timer);a.garden();};content.querySelector('[data-plant-rec]')?.addEventListener('click',plantRecommended);
     const feedback=document.createElement('section');feedback.className='cc-feedback';const report=s.customerReport||{total:0,happy:0,delighted:0};
     feedback.innerHTML='<h3>Customer happiness</h3><p>'+report.happy+' happy of '+report.total+' rated visits · '+report.delighted+' delighted</p><small>In-game reactions since this update. Improving recipes helps earn warmer feedback.</small>';
     for(const visit of s.feedbackLog||[]){const recipe=E.recipes.find(r=>r.id===visit.id);if(!recipe)continue;const card=document.createElement('article');card.className='cc-card';const body=document.createElement('div'),title=document.createElement('h3'),quote=document.createElement('p');title.textContent=E.displayName(s,recipe)+' · '+(visit.rating===5?'Delighted':visit.rating>=4?'Happy':'Room to improve');quote.textContent='“'+visit.text+'”';body.append(title,quote);card.append(body);feedback.append(card);}content.prepend(feedback);
     if(E.daily){const d=E.daily(g);if(d){const sec=document.createElement('section');sec.className='cc-daily'+(d.done&&!d.claimed?' ready':'')+(d.claimed?' claimed':'');const h=document.createElement('h3');h.textContent='Today’s goal';const t=document.createElement('p');t.textContent=d.kind==='special'&&d.special?'Serve 5 of today’s special, '+E.displayName(s,E.recipes.find(r=>r.id===d.special))+'.':d.title+'.';
      const bar=document.createElement('div');bar.className='cc-daily-bar';bar.setAttribute('role','progressbar');bar.setAttribute('aria-valuemin','0');bar.setAttribute('aria-valuemax',String(d.target));bar.setAttribute('aria-valuenow',String(d.progress));const fill=document.createElement('i');fill.style.width=Math.round(d.progress/d.target*100)+'%';bar.append(fill);
      const foot=document.createElement('div');foot.className='cc-daily-foot';const c=document.createElement('small');c.textContent=d.claimed?'Collected. A new goal tomorrow.':d.progress+' of '+d.target+' · reward '+d.reward+' Shells';foot.append(c);
      if(d.done&&!d.claimed){const b=document.createElement('button');b.type='button';b.className='btn primary';b.textContent='Collect '+d.reward+' Shells';b.onclick=()=>{commit(()=>{E.claimDaily(g);});a.sfx&&a.sfx('collect');};foot.append(b);}
      sec.append(h,t,bar,foot);content.prepend(sec);}}
     {const list=Object.values(s.regulars||{}).sort((a,b)=>b.visits-a.visits).slice(0,6);const sec=document.createElement('section');sec.className='cc-regulars';const h=document.createElement('h3');h.textContent='Regulars';sec.append(h);
      if(!list.length){const p=document.createElement('p');p.textContent='Your guest book fills in as cats visit. Everyone has their own taste, so watch who loves what.';sec.append(p);}
      const word={love:'Loved it',happy:'Enjoyed it',meh:'Thought it fine',bitter:'Found it bitter'};
      for(const e of list){const fav=Object.entries(e.loved||{}).sort((a,b)=>b[1]-a[1])[0],fr=fav&&E.recipes.find(r=>r.id===fav[0]);const row=document.createElement('article');row.className='cc-regular';const d=document.createElement('div');const n=document.createElement('strong');n.textContent=e.name;const sm=document.createElement('small');sm.textContent=e.visits+' visit'+(e.visits===1?'':'s')+' · '+(fr?'Favourite: '+E.displayName(s,fr):'still finding a favourite');const last=document.createElement('span');last.className='cc-mood '+e.last;last.textContent=word[e.last]||'';d.append(n,sm);row.append(d,last);sec.append(row);}
      content.append(sec);}
    }else{
     content.innerHTML=`<p>Equipment you can see inside your café.</p><article class="cc-card"><div><h3>Coffee machine</h3><p>One guest every ${E.interval(s)/60000} minutes.</p><small>Level ${s.speed+1}/3 · no rushed cats</small></div><button class="btn" data-speed ${s.speed>=2?'disabled':g.shells<(s.speed+1)*300?'data-need="'+(s.speed+1)*300+'"':''}>${s.speed>=2?'Complete':'Upgrade · '+(s.speed+1)*300}</button></article><article class="cc-card"><div><h3>A table by the sea</h3><p>A cozy outdoor table and cushion.</p><small>Visual upgrade · no extra income multiplier</small></div><button class="btn" data-seat ${s.seats?'disabled':g.shells<150?'data-need="150"':''}>${s.seats?'Placed':'Add · 150'}</button></article><article class="cc-card"><div><h3>Copper cookware</h3><p>A copper kettle and lidded pot for your counter.</p><small>Visual upgrade · no income multiplier</small></div><button class="btn" data-cookware ${s.cookware?'disabled':g.shells<180?'data-need="180"':''}>${s.cookware?'Owned':'Add · 180'}</button></article>`;content.querySelector('[data-cookware]').onclick=()=>commit(()=>{if(!s.cookware&&g.shells>=180){g.shells-=180;s.cookware=true;view='inside';}});content.querySelector('[data-speed]').onclick=()=>commit(()=>{const n=(s.speed+1)*300;if(s.speed<2&&g.shells>=n){g.shells-=n;s.speed++;view='inside';}});content.querySelector('[data-seat]').onclick=()=>commit(()=>{if(!s.seats&&g.shells>=150){g.shells-=150;s.seats=1;}});
    }
   }
   if(tab==='upgrades'&&s.unlocked&&view==='outside'){
    const tier=s.shopTier||0,next=E.shops[tier+1],box=document.createElement('div');box.className='cc-shop-stages';
    box.innerHTML=`<h3>Your café, growing with you</h3><p>Three shop stages. Keep every machine, ingredient and sale when you expand. Buildings change the shop; brewing speed stays with your machine.</p>${E.shops.map((shop,i)=>`<article class="cc-card"><div><h3>${i+1}. ${shop.name}</h3><small>${shop.description}</small><small>${i<=tier?(i===tier?'Current shop':'Completed'):shop.cost.toLocaleString()+' Shells'+(i>tier+1?' · previous stage required':'')}</small></div><button class="btn" data-preview="${i}">Preview</button></article>`).join('')}${(previewTier!==null||previewFinish||previewDecor)?'<button class="btn" data-current>Show my shop</button>':''}${next?`<p>${Math.max(0,next.cost-Math.floor(g.shells)).toLocaleString()} Shells to save for ${next.name}. Each stage has its own price.</p><button class="btn primary" data-expand ${g.shells<next.cost?'data-need="'+next.cost+'"':''}>${confirmShop?'Confirm · spend '+next.cost.toLocaleString()+' Shells':'Expand · '+next.cost.toLocaleString()+' Shells'}</button>${confirmShop?'<button class="btn" data-cancel-expand>Cancel</button>':''}`:'<p>Your Seaside Café is fully expanded.</p>'}`;
    panel.querySelector('.cc-content').prepend(box);
    box.querySelectorAll('[data-preview]').forEach(b=>b.onclick=()=>{tab=null;previewTier=Number(b.dataset.preview);confirmShop=false;render();panel.scrollTop=0;});
    box.querySelector('[data-current]')&&(box.querySelector('[data-current]').onclick=()=>{previewTier=null;previewFinish=null;confirmFinish=null;confirmShop=false;previewDecor=null;confirmDecor=null;render();panel.scrollTop=0;});
    if(next)box.querySelector('[data-expand]').onclick=()=>{if(!confirmShop){confirmShop=true;render();return;}commit(()=>{E.upgradeShop(g,Date.now());previewTier=null;confirmShop=false;});};
    box.querySelector('[data-cancel-expand]')?.addEventListener('click',()=>{confirmShop=false;render();});
   }
   if(tab==='upgrades'&&s.unlocked&&view==='outside'){
    const finishes=document.createElement('section');finishes.className='cc-finishes';
    finishes.innerHTML='<h3>Make it your color</h3><p>Preview any finish free. Unlock once, then switch whenever you like. Colors are purely decorative.</p><div class="cc-finish-grid">'+Object.entries(E.finishes).map(([key,f])=>{const owned=key==='sage'||(s.finishesOwned||[]).includes(key),current=(s.finish||'sage')===key;return `<article><span class="cc-swatch" style="background:${f.body};border-bottom-color:${f.dark}"></span><h3>${f.name}</h3><small>${owned?'Owned':f.cost.toLocaleString()+' Shells'}</small><button class="btn" data-finish-preview="${key}">Preview</button><button class="btn primary" data-finish-buy="${key}" ${current?'disabled':(!owned&&g.shells<f.cost)?'data-need="'+f.cost+'"':''}>${current?'In use':owned?'Use finish':confirmFinish===key?'Confirm purchase':'Unlock'}</button></article>`;}).join('')+'</div>';
    panel.querySelector('.cc-shop-stages').after(finishes);
    finishes.querySelectorAll('[data-finish-preview]').forEach(b=>b.onclick=()=>{tab=null;previewFinish=b.dataset.finishPreview;confirmFinish=null;view='outside';render();panel.scrollTop=0;});
    finishes.querySelectorAll('[data-finish-buy]').forEach(b=>b.onclick=()=>{const key=b.dataset.finishBuy,owned=key==='sage'||(s.finishesOwned||[]).includes(key);if(!owned&&confirmFinish!==key){confirmFinish=key;render();return;}commit(()=>{E.buyFinish(g,key);previewFinish=null;confirmFinish=null;});});
   }
   if(tab==='upgrades'&&s.unlocked&&view==='outside'){
    const sec=document.createElement('section');sec.className='cc-decor';
    sec.innerHTML='<h3>Outdoor décor</h3><p>Make the outside yours. These are special, one-time pieces, so they cost real saving. Preview any of them free.</p>'+Object.entries(E.decor).map(([key,d])=>{const own=!!(s.decor&&s.decor[key]);return `<article class="cc-card"><div><h3>${d.name}</h3><small>${d.note}</small><small>${own?'In your café':d.cost.toLocaleString()+' Shells'}</small></div>${own?'':`<button class="btn" data-decor-preview="${key}">Preview</button><button class="btn primary" data-decor-buy="${key}" ${g.shells<d.cost?'data-need="'+d.cost+'"':''}>${confirmDecor===key?'Confirm · '+d.cost.toLocaleString():'Buy · '+d.cost.toLocaleString()}</button>`}</article>`;}).join('');
    (panel.querySelector('.cc-finishes')||panel.querySelector('.cc-shop-stages')).after(sec);
    sec.querySelectorAll('[data-decor-preview]').forEach(b=>b.onclick=()=>{tab=null;previewDecor=b.dataset.decorPreview;confirmDecor=null;view='outside';render();panel.scrollTop=0;});
    sec.querySelectorAll('[data-decor-buy]').forEach(b=>b.onclick=()=>{const key=b.dataset.decorBuy;if(confirmDecor!==key){confirmDecor=key;render();return;}let ok=false;commit(()=>{ok=E.buyDecor(g,key);previewDecor=null;confirmDecor=null;});if(ok){a.sfx?.('buy');explain({tone:'ok',text:E.decor[key].name+' is in place. Have a look outside.'});}});
   }
   if(previewDecor){const note=document.createElement('button');note.className='btn';note.textContent='Previewing '+E.decor[previewDecor].name.toLowerCase()+' · Back';note.onclick=()=>{previewDecor=null;tab='upgrades';render();};panel.querySelector('.cc-top').append(note);}
   if(previewFinish){const note=document.createElement('p');note.className='cc-note';note.textContent='Color preview: '+E.finishes[previewFinish].name+' · no Shells spent.';panel.querySelector('.cc-top').append(note);}
   if(previewTier!==null){const note=document.createElement('p');note.className='cc-note';note.textContent='Preview: '+E.shops[previewTier].name+' · your shop and Shells have not changed.';panel.querySelector('.cc-top').append(note);}
   if(tab==='upgrades'){
    const content=panel.querySelector('.cc-content');
    if(view==='outside'){const intro=content.querySelector(':scope > p');if(intro)intro.textContent='Your storefront and outdoor seating.';content.querySelectorAll('[data-speed],[data-cookware]').forEach(b=>b.closest('article').remove());}
    else{content.querySelector('[data-seat]')?.closest('article').remove();}
    for(const [key,selector]of [['speed','[data-speed]'],['cookware','[data-cookware]'],['seats','[data-seat]']]){const buy=content.querySelector(selector);if(!buy)continue;const preview=document.createElement('button');preview.className='btn';preview.textContent='Preview';preview.onclick=()=>{previewEquipment=key;tab=null;render();};buy.before(preview);}
   }
   if(previewEquipment){const note=document.createElement('button');note.className='btn';note.textContent='Previewing upgrade · Back';note.onclick=()=>{previewEquipment=null;tab='upgrades';render();};panel.querySelector('.cc-top').append(note);}
   const drawer=panel.querySelector('.cc-content');
   if(drawer&&tab){
    // A second "get me out" control alongside Skip guide/‹ Cove was confusing mid-tutorial --
    // same condition cc-guiding already uses, so Close reappears the moment the guide ends.
    const showClose=!(guideOn&&tab!=='help');
    drawer.insertAdjacentHTML('afterbegin','<div class="cc-drawer-head"><h3>'+(tabName[tab]||tab)+'</h3>'+(showClose?'<button class="btn" data-dismiss>Close</button>':'')+'</div>');
    drawer.querySelector('[data-dismiss]')?.addEventListener('click',()=>{tab=null;render();});
   }
   const cv=panel.querySelector('canvas');cv.onclick=e=>{if(equipOpen){closeEquipPopup();return;}if(tab){tab=null;render();return;}const b=cv.getBoundingClientRect(),fit=layout.k||b.width/720,x=(e.clientX-b.left)/fit+layout.cx0,y=(e.clientY-b.top)/fit-layout.offset;if(view==='inside'){const hot=CoveCafeScene.hotspots,hit=h=>h&&x>h.x&&x<h.x+h.w&&y>h.y&&y<h.y+h.h,pr=panel.getBoundingClientRect(),ax=e.clientX-pr.left,ay=e.clientY-pr.top;if(s.unlocked&&hit(hot&&hot.resident)){tab='resident';render();return;}if(s.unlocked&&hit(hot&&hot.machine)){equipPopup('speed',ax,ay);return;}if(s.unlocked&&hit(hot&&hot.cookware)){equipPopup('cookware',ax,ay);return;}if(s.unlocked&&hit(hot&&hot.beans)){equipPopup('ing:coffee',ax,ay);return;}if(s.unlocked)for(const key of ['coffee','catmint','honey'])if(hit(hot&&hot['jar_'+key])){equipPopup('ing:'+key,ax,ay);return;}const cupY=CoveCafeScene.cupY||280;if(s.unlocked&&x>170&&x<525&&y>cupY-15&&y<cupY+100){tab='menu';workshop=true;recipeResult=null;render();}return;}if(x>190&&x<530&&y>100&&y<235){view='inside';render();}else if(x>25&&x<120&&y>270&&y<350){panel.querySelector('.cc-sale')?.remove();const hello=document.createElement('div');hello.className='cc-sale';hello.setAttribute('role','status');hello.textContent=['This seat has excellent purr acoustics.','Stay a little. The sea isn’t going anywhere.','A quiet bench. Very important cat business.'][Math.floor(Date.now()/1000)%3];panel.append(hello);setTimeout(()=>hello.remove(),4500);}};
   panel.onkeydown=e=>{if(e.key==='Escape'){if(tab){tab=null;render();}else panel.querySelector('[data-close]').click();}};
   (panel.querySelector('.cc-tabs')||panel.querySelector('.cc-top')).insertAdjacentHTML('afterend','<p class="cc-visit-hint">'+(view==='outside'?'Tap the window to step inside':'')+'</p>');
   const pickup=document.createElement(view==='inside'?'button':'div');if(view==='inside')pickup.type='button';pickup.className='cc-pickup-order'+(view==='outside'?' cc-service-progress':'');pickup.hidden=true;
   pickup.innerHTML='<strong></strong><span class="cc-pickup-track" role="progressbar" aria-label="Order progress" aria-valuemin="0" aria-valuemax="100"><i></i></span><small></small>';
   pickup.onclick=()=>{if(view!=='inside')return;if(s.pending?E.helpOrder(g,Date.now()):E.takeOrder(g,Date.now())){a.save();render();}};panel.append(pickup);
   drawGuide();
   {const box=panel.querySelector('.cc-content');if(box&&tab&&lastTab===tab)box.scrollTop=prevScroll;lastTab=tab;
    if(fname){const again=[...panel.querySelectorAll('['+fname+']')].find(x=>x.getAttribute(fname)===fv);if(again)try{again.focus({preventScroll:true});}catch(e){}}}
   const renderedServed=s.served,renderedOpen=s.open,renderedPending=s.pending?.at;status();last=-Infinity;paint(performance.now());timer=setInterval(()=>{if(panel.hidden||!panel.isConnected){clearInterval(timer);cancelAnimationFrame(frame);return;}const before=s.served;E.settle(g,Date.now());if(!document.hidden&&!s.pending&&s.open&&Date.now()>=(s.lastCompleted?s.lastCompleted.at+7200:s.cursor+3000))E.takeOrder(g,Date.now());if(s.served!==renderedServed){tasteReaction();a.save();a.hud();floats.push({t0:performance.now(),text:'+'+(s.lastCompleted?.price||0)});a.sfx?.('collect');a.sfx?.('cafe-mood',null,{mood:s.lastCompleted?.reaction?.mood});render();const notice=document.createElement('div');notice.className='cc-sale';notice.setAttribute('role','status');const sold=E.recipes.find(r=>r.id===s.lastCompleted?.id);notice.textContent=sold?E.displayName(s,sold)+' · +'+(s.lastCompleted.price||E.price(s,sold))+' Shells — '+(s.lastCompleted.reaction?.text||s.lastCompleted.response?.text||'A happy little moment.'):'An order enjoyed · Shells added';panel.append(notice);setTimeout(()=>notice.remove(),4000);}else if(s.pending&&s.pending.at!==renderedPending){a.sfx?.('cafe-ding');a.save();render();}else if(s.open!==renderedOpen){a.save();render();}else status();},1000);
  }
  function status(){
   const el=panel.querySelector('.cc-status');if(!el)return;
   const now=Date.now(),pending=s.pending,seconds=pending?Math.max(0,Math.ceil((pending.at-now)/1000)):0;
   el.textContent=!s.menu.length?'Make a recipe, then Save & sell.':!s.open?(s.closedReason==='ingredients'?'Out of ingredients · closed for now.':'Ready? Tap Closed above to open.'):'Your cats cook and serve automatically.';
   const bar=panel.querySelector('.cc-brew-bar');if(bar)bar.hidden=true;
   const pickup=panel.querySelector('.cc-pickup-order');if(!pickup)return;
   panel.querySelector('.cc-order-secondary')?.remove();
   const canTake=s.open&&E.customerReady(s,now)&&E.available(s,g.homestead.stock).length>0;
   pickup.hidden=(!pending&&!canTake)||!!tab||!!equipOpen;
   pickup.querySelector('.cc-pickup-track').hidden=false;
   if(!pending){
    const start=s.lastCompleted?s.lastCompleted.at+4200:s.cursor,due=start+3000;
    const wait=Math.max(0,Math.ceil((due-now)/1000)),pct=Math.round(Math.max(0,Math.min(1,(now-start)/Math.max(1,due-start)))*100);
    pickup.setAttribute('aria-disabled',String(view==='outside'));pickup.classList.remove('boosted','boost-pop');
    pickup.querySelector('strong').textContent='Taking order…';pickup.querySelector('small').textContent=view==='outside'?'':'Tap to start now';
    pickup.setAttribute('aria-label','Taking order automatically. '+wait+' seconds left.'+(view==='outside'?'':' Tap to start now.'));
    const progress=pickup.querySelector('[role="progressbar"]');progress.setAttribute('aria-valuenow',String(pct));progress.setAttribute('aria-valuetext','Order starts automatically in '+wait+' seconds');progress.querySelector('i').style.width=pct+'%';return;
   }
   const recipe=E.recipes.find(r=>r.id===pending.id),pct=Math.round(Math.min(1,Math.max(0,1-(pending.at-now)/30000))*100);
   pickup.querySelector('strong').textContent=view==='outside'?'Serving…':seconds<=3?'Serving…':recipe.kind==='food'?'Cooking…':'Brewing…';pickup.setAttribute('aria-label',(pending.items||[recipe.id]).map(id=>E.displayName(s,E.recipes.find(r=>r.id===id))).join(' and ')+', '+seconds+' seconds left'+(view==='outside'||pending.helped?'':'. Tap to halve the remaining time.'));
   pickup.querySelector('small').textContent=view==='outside'?'':pending.helped?'2× boosted':'Tap to boost';
   pickup.setAttribute('aria-disabled',String(view==='outside'||!!pending.helped));pickup.classList.toggle('boosted',view==='inside'&&!!pending.helped);pickup.classList.toggle('boost-pop',view==='inside'&&!!pending.boostedAt&&now-pending.boostedAt<900);
   const progress=pickup.querySelector('[role="progressbar"]');progress.setAttribute('aria-valuenow',String(pct));progress.setAttribute('aria-valuetext',seconds+' seconds left');progress.querySelector('i').style.width=pct+'%';
   if(view==='inside'&&seconds>3&&(pending.items||[]).length>1&&!pickup.hidden){const second=pickup.cloneNode(true);second.classList.add('cc-order-secondary');second.querySelector('strong').textContent=recipe.kind==='food'?'Brewing…':'Cooking…';second.onclick=pickup.onclick;panel.append(second);}
  }
  function cup(id){if(E.recipes.find(r=>r.id===id)?.kind==='food')return '<svg viewBox="0 0 60 64" aria-label="Garden treats"><ellipse cx="30" cy="47" rx="28" ry="10" fill="#ddd0ad"/><circle cx="20" cy="35" r="12" fill="#c78e55"/><circle cx="39" cy="38" r="12" fill="#d6a366"/><path d="m14 31 10 7m10-5 8 9" stroke="#a77149" stroke-width="3"/></svg>';return `<svg viewBox="0 0 60 64" aria-hidden="true"><path d="M42 24h8q12 15-8 19" fill="none" stroke="#ae8761" stroke-width="5"/><path d="M10 20h34v26q-17 15-34 0Z" fill="${id==='tea'?'#8fa783':id==='midknight'?'#d0ad6b':'#e5cfa8'}"/><ellipse cx="27" cy="21" rx="17" ry="5" fill="#74523d"/><path d="M22 13q-7-6 0-11m12 11q-7-6 0-11" fill="none" stroke="#adbaa0" stroke-width="2"/></svg>`;}
  function paint(t){
   if(panel.hidden||!panel.isConnected)return;frame=requestAnimationFrame(paint);if(document.hidden||t-last<33)return;last=t;
   const canvas=panel.querySelector('canvas'),bounds=canvas.getBoundingClientRect();if(!bounds.width||!bounds.height)return;
   // The outside view crops only a sliver off each side on phones (it was 12-33%), and opening a tab never rescales it: the camera only pans a little, and eases there.
   const zoom=bounds.width<600&&bounds.height/bounds.width>1.3?(view==='inside'?1.06:1.15):1;let view720=720/zoom,cx0=(720-view720)/2,css=bounds.width/view720,vh=bounds.height/css;
   const density=Math.min(window.devicePixelRatio||1,2),pw=Math.round(bounds.width*density),ph=Math.round(bounds.height*density);if(canvas.width!==pw||canvas.height!==ph){canvas.width=pw;canvas.height=ph;}
   // Centre the 380-unit scene band in the space between the top stack and whatever sits at the bottom (open sheet, or the view switch and dock).
   const top=panel.querySelector('.cc-top')?.getBoundingClientRect().bottom-bounds.top||0,sheet=panel.querySelector('.cc-content:not([hidden])'),lower=panel.querySelector('.cc-tabs'),intro=panel.querySelector('.cc-intro');
   const sheetBelow=sheet&&sheet.getBoundingClientRect().left-bounds.left<bounds.width*.5;   // on wide screens the sheet docks beside the scene and covers none of it
   const bottomEdge=sheetBelow?sheet.getBoundingClientRect().top-bounds.top:intro?intro.getBoundingClientRect().top-bounds.top:lower&&lower.offsetParent?lower.getBoundingClientRect().top-bounds.top:bounds.height;
   const sideSheet=!!sheet&&!sheetBelow,availW=sideSheet?Math.max(240,sheet.getBoundingClientRect().left-bounds.left):bounds.width;
   if(view!=='inside'){const floor=lower&&lower.offsetParent?lower.getBoundingClientRect().top-bounds.top:bounds.height,cap=Math.max(1,floor-top-24)/420;if(cap<css){css=cap;view720=bounds.width/css;vh=bounds.height/css;cx0=(720-view720)/2;}}   // Fit the entire storefront and queue above the dock, including expanded tablet headers.
   // Opening My menu/Ingredients/Improve café used to shrink the whole room to make space for
   // the drawer -- every tab tap read as a jarring camera zoom. The drawer already overlays the
   // scene (it's absolutely positioned), so the room can just stay put at its normal size; the
   // drawer covers the lower counter while it's open, same as it always visually sat on top.
   if(sideSheet&&availW<bounds.width){css=Math.min(css,view==='inside'?availW/720:availW/380);view720=bounds.width/css;vh=bounds.height/css;cx0=360-(availW/2)/css;}   // a docked sheet: the outside scene keeps its size and pans into the space the sheet leaves; the room (its counter runs edge to edge) fits the space
   // Fit a complete counter composition, not a width-scaled crop. Mobile drawers overlay
   // the stable room; opening a sheet must not squeeze the window and furniture.
   if(view==='inside'){
    const floor=lower&&lower.offsetParent?lower.getBoundingClientRect().top-bounds.top:bounds.height;
    css=Math.min(availW/720,Math.max(180,floor-top)/560,1.5);
    view720=bounds.width/css;vh=bounds.height/css;cx0=360-(availW/2)/css;
   }
   let bandPx=420*css,isIn=view==='inside',offset=isIn?Math.max(0,top/css):Math.max(0,Math.min(vh-420,((top+Math.max(top+bandPx,bottomEdge))/2-bandPx/2)/css)),band=isIn?Math.max(560,((lower&&lower.offsetParent?lower.getBoundingClientRect().top-bounds.top:bounds.height)-top)/css):undefined;
   {const key=view+bounds.width+'x'+bounds.height,dtc=camT&&t-camT<400?Math.min(.1,(t-camT)/1000):1,ease=dtc>=1||!cam||camKey!==key||(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)?1:1-Math.exp(-dtc*11);camT=t;camKey=key;const tg={css,cx0,offset,band:band===undefined?0:band};if(ease>=1)cam=tg;else for(const q in tg)cam[q]+=(tg[q]-cam[q])*ease;css=cam.css;cx0=cam.cx0;offset=cam.offset;if(isIn)band=cam.band;view720=bounds.width/css;vh=bounds.height/css;}   // ease the camera so a tab opening glides instead of jumping
   layout={k:css,cx0,offset};
   const ctx=canvas.getContext('2d'),k=Math.round(720*(pw/view720))/720,tx=Math.round(-cx0*k);ctx.setTransform(k,0,0,k,tx,0);   // whole-pixel scene edges: a fractional edge blends the haze layer twice and draws a thin line
   const sceneArgs={height:vh,offset,band,inside:view==='inside',s:displayState,stock:g.homestead.stock,E,a,actors,t,previewTier,previewFinish};
   // Zoomed out past the 720-unit art (tablets): the sky, sea and grass bands carry on to the screen edges. The bands come from a guest-free copy of the scene's outermost strip, painted BEFORE the scene, so guests walking in from off-screen are drawn on top of it and never cut off.
   const Lm=tx,Rm=tx+Math.round(720*k),edgeWant=view!=='inside'&&(Lm>2||pw-Rm>2),sw=Math.max(4,Math.round(8*k)),buildEdges=()=>{for(let sd=0;sd<2;sd++){const cv=edgeCv[sd]||(edgeCv[sd]=document.createElement('canvas'));if(cv.width!==sw||cv.height!==ph){cv.width=sw;cv.height=ph;}const c2=cv.getContext('2d');c2.setTransform(1,0,0,1,0,0);c2.clearRect(0,0,sw,ph);c2.setTransform(k,0,0,k,-(sd?712:0)*k,0);CoveCafeScene(c2,Object.assign({},sceneArgs,{actors:[]}));}edgeT=t;edgeSig=sw+'x'+ph+view;};
   if(edgeWant){if(edgeSig!==sw+'x'+ph+view||!edgeCv[0])buildEdges();ctx.save();ctx.setTransform(1,0,0,1,0,0);if(Lm>2)ctx.drawImage(edgeCv[0],sw-2,0,2,ph,0,0,Lm+3,ph);if(pw-Rm>2)ctx.drawImage(edgeCv[1],0,0,2,ph,Rm-3,0,pw-Rm+3,ph);ctx.restore();}
   CoveCafeScene(ctx,sceneArgs);
   for(const pickup of panel.querySelectorAll('.cc-pickup-order')){if(pickup.hidden)continue;
    const anchor=view==='outside'?{x:360,y:278}:pickup.classList.contains('cc-order-secondary')?CoveCafeScene.secondOrderAnchor:CoveCafeScene.orderAnchor;if(!anchor){pickup.hidden=true;continue;}
    const px=(anchor.x-cx0)*css,py=(anchor.y+offset)*css;
    pickup.style.left=Math.max(8,Math.min(bounds.width-pickup.offsetWidth-8,px-pickup.offsetWidth/2))+'px';
    pickup.style.top=Math.max(top+8,Math.min(bounds.height-pickup.offsetHeight-70,py-(anchor.center?pickup.offsetHeight/2:0)))+'px';
   }
   if(edgeWant&&t-edgeT>250)buildEdges();   // after the main draw, so the guests' walking clock is never advanced twice
   if(floats.length){const now=performance.now();ctx.save();ctx.translate(0,offset);ctx.textAlign='center';for(let i=floats.length-1;i>=0;i--){const f=floats[i],age=(now-f.t0)/1700;if(age>=1){floats.splice(i,1);continue;}const y=(view==='inside'?(CoveCafeScene.cupY||280)+6:238)-age*54,al=age<.15?age/.15:1-Math.max(0,(age-.55)/.45);ctx.globalAlpha=Math.max(0,al);ctx.font='bold 26px Georgia';ctx.lineWidth=5;ctx.strokeStyle='rgba(255,250,235,.95)';ctx.strokeText(f.text,view==='inside'?344:360,y);ctx.fillStyle='#3f7a52';ctx.fillText(f.text,view==='inside'?344:360,y);}ctx.restore();}
  }
  render();
 }};
})(globalThis);
