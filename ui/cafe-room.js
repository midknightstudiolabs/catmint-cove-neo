// Editable flat 2D café floor. Guest routes share the placement walkability map.
function neoCafeFurniture(h){
  if(!h.furniture)h.furniture=[{id:'oven',type:'oven',x:1,y:0},{id:'counter',type:'counter',x:4,y:0},{id:'plant',type:'plant',x:6,y:0}];
  for(let i=0;i<h.tables;i++)if(!h.furniture.some(f=>f.id==='table'+i)){
    const spots=[[1,2],[3,2],[5,2],[1,3],[5,3]];const p=spots[i]||[6,3];
    h.furniture.push({id:'table'+i,type:'table',x:p[0],y:p[1],boxed:h.furniture.some(f=>!f.boxed&&f.x===p[0]&&f.y===p[1])});
  }
  for(const [prefix,type,count,spots] of [['oven','oven',h.stoves?.length||1,[[1,0],[0,0],[0,1],[7,1]]],['counter','counter',h.trays?.length||1,[[4,0],[5,0]]]])for(let i=1;i<count;i++){const id=prefix+i;if(!h.furniture.some(f=>f.id===id)){const p=spots[i];h.furniture.push({id,type,x:p[0],y:p[1],boxed:h.furniture.some(f=>!f.boxed&&f.x===p[0]&&f.y===p[1])});}}
  h.floor ||= 'wood';return h.furniture;
}
function neoCafeRoute(items,target){
  const blocked=new Set(items.filter(f=>!f.boxed).map(f=>f.x+','+f.y));
  const queue=[{x:3,y:4,path:[{x:3,y:4}]}],seen=new Set(['3,4']);
  while(queue.length){const p=queue.shift();if(Math.abs(p.x-target.x)+Math.abs(p.y-target.y)===1)return p.path;
    for(const [dx,dy]of [[0,-1],[1,0],[-1,0],[0,1]]){const x=p.x+dx,y=p.y+dy,k=x+','+y;if(x<0||x>7||y<0||y>4||blocked.has(k)||seen.has(k))continue;seen.add(k);queue.push({x,y,path:[...p.path,{x,y}]});}}
  return null;
}
function neoCafeCanPlace(items,id,x,y){
  if(x<0||x>7||y<0||y>4||(x===3&&y===4)||items.some(f=>f.id!==id&&!f.boxed&&f.x===x&&f.y===y))return false;
  const proposed=items.map(f=>f.id===id?{...f,x,y,boxed:false}:f);
  return proposed.filter(f=>!f.boxed&&['table','oven','counter'].includes(f.type)).every(f=>neoCafeRoute(proposed,f));
}
function neoPaintCafe(cv,h){
  cancelAnimationFrame(neoCafeFrame);cv.width=720;cv.height=560;
  const room=cv.parentElement,items=neoCafeFurniture(h),g=cv.getContext('2d');
  const toolbar=document.createElement('div');toolbar.className='cafe-room-tools';toolbar.innerHTML='<button class="btn" data-edit>Arrange café</button><button class="btn" data-store disabled>Put away</button><select aria-label="Stored café furniture"><option value="">Stored furniture</option></select><span role="status">Tap the stove to cook, or the counter to stock treats.</span>';room.insertBefore(toolbar,cv);
  let editing=false,selected=null,drag=null,ghost=null,last=0;
  const status=toolbar.querySelector('span'),select=toolbar.querySelector('select');
  function controls(){toolbar.querySelector('[data-edit]').setAttribute('aria-pressed',String(editing));toolbar.querySelector('[data-edit]').textContent=editing?'Done arranging':'Arrange café';toolbar.querySelector('[data-store]').disabled=!editing||!selected||['oven','counter'].includes(selected.type)||(selected.type==='table'&&items.filter(f=>f.type==='table'&&!f.boxed).length<=1);select.innerHTML='<option value="">Stored furniture</option>'+items.filter(f=>f.boxed).map(f=>`<option value="${f.id}">${f.type==='table'?'Table & chair':f.type}</option>`).join('');}
  toolbar.querySelector('[data-edit]').onclick=()=>{if(neoCafeService(h).visits.length){status.textContent='Close the café and let guests finish before rearranging.';return;}editing=!editing;selected=null;ghost=null;controls();status.textContent=editing?'Select furniture, then tap a free tile or drag. Keep the door and walkways clear.':'Your café layout is saved.';save();};
  toolbar.querySelector('[data-store]').onclick=()=>{if(toolbar.querySelector('[data-store]').disabled)return;selected.boxed=true;selected=null;ghost=null;save();controls();status.textContent='Stored safely. Choose it from Stored furniture to place it again.';};
  select.onchange=()=>{selected=items.find(f=>f.id===select.value)||null;if(selected){editing=true;controls();status.textContent='Tap an empty tile to place your furniture for free.';}};
  function point(e){const r=cv.getBoundingClientRect();return{x:Math.floor(((e.clientX-r.left)*720/r.width-40)/80),y:Math.floor(((e.clientY-r.top)*560/r.height-120)/80)};}
  cv.style.touchAction='none';
  cv.onpointerdown=e=>{const p=point(e),hit=items.find(f=>!f.boxed&&f.x===p.x&&f.y===p.y);if(!editing){if(hit?.type==='oven'){document.getElementById('neo-cafe-kitchen').hidden=false;status.textContent='Choose a recipe below the room.';}if(hit?.type==='counter'){if(h.stoves.some(j=>j&&Date.now()>=j.ready))neoStockCounter();else status.textContent=h.counter?`${h.counter} treats ready for guests.`:'Cook a batch on the stove first.';}return;}
    if(hit)selected=hit;if(!selected)return;drag={id:e.pointerId};ghost=p;cv.setPointerCapture(e.pointerId);controls();};
  cv.onpointermove=e=>{if(drag?.id===e.pointerId)ghost=point(e);};
  cv.onpointerup=e=>{if(drag?.id!==e.pointerId)return;const p=point(e);drag=null;if(selected&&neoCafeCanPlace(items,selected.id,p.x,p.y)){selected.x=p.x;selected.y=p.y;selected.boxed=false;status.textContent='Placed. Your guests still have a clear path.';save();}else status.textContent='That tile blocks furniture or a walkway. Choose a green tile.';ghost=null;controls();};
  cv.onpointercancel=()=>{drag=null;ghost=null;};
  const originals=cats.filter(c=>!c.visitor).slice(0,5),guests=originals.map(c=>{const copy=new Cat({coatKey:c.coatKey,mascot:c.mascot,markSeed:c.markSeed,x:0,y:0});copy.state='loafing';copy.worn=[...(c.worn||[])];return copy;});
  const waiterCat=new Cat({coatKey:originals[0]?.coatKey||'ginger',x:0,y:0});
  const center=p=>({x:80+p.x*80,y:160+p.y*80});
  function paint(t){
    if(!cv.isConnected||document.getElementById('neo-homestead').hidden)return;neoCafeFrame=requestAnimationFrame(paint);if(document.hidden||t-last<66)return;last=t;
    const still=matchMedia('(prefers-reduced-motion: reduce)').matches;
    g.clearRect(0,0,720,560);g.fillStyle='#f3e7ca';g.fillRect(0,0,720,560);
    g.fillStyle='#bcdedb';g.fillRect(210,20,300,67);g.strokeStyle='#b39b74';g.lineWidth=6;g.strokeRect(210,20,300,67);g.beginPath();g.moveTo(360,20);g.lineTo(360,87);g.stroke();
    g.fillStyle='#43543f';g.font='bold 18px Georgia';g.textAlign='center';g.fillText('Catmint Café',360,110);
    for(let y=0;y<5;y++)for(let x=0;x<8;x++){g.fillStyle=h.floor==='tile'?((x+y)%2?'#e6ecd9':'#f6efdb'):'#decaab';g.fillRect(40+x*80,120+y*80,80,80);g.strokeStyle=editing?'#93a87c':'#ceb997';g.lineWidth=1;g.strokeRect(40+x*80,120+y*80,80,80);}
    g.fillStyle='#94ad91';g.fillRect(280,510,80,14);g.fillStyle='#43543f';g.font='13px sans-serif';g.fillText('Entrance',320,545);
    if(editing&&selected)for(let y=0;y<5;y++)for(let x=0;x<8;x++){g.fillStyle=neoCafeCanPlace(items,selected.id,x,y)?'#81ac7530':'#bc73602a';g.fillRect(41+x*80,121+y*80,78,78);}
    const layers=[];
    for(const f of items.filter(f=>!f.boxed))layers.push({y:center(f).y,draw:()=>{
      const p=center(f);g.save();g.translate(p.x,p.y);
      if(f.type==='table'){g.fillStyle='#ae9069';g.fillRect(-9,8,18,24);g.fillStyle='#809a7b';g.fillRect(-20,20,40,12);g.fillStyle={cream:'#faf0d7',sage:'#c6dabd',rose:'#e5c3b3'}[h.cloth];g.beginPath();g.ellipse(0,-4,32,21,0,0,Math.PI*2);g.fill();if(h.counter){g.fillStyle='#fffaf0';g.beginPath();g.ellipse(0,-5,12,7,0,0,Math.PI*2);g.fill();g.fillStyle='#bf9460';g.fillRect(-5,-10,10,6);}}
      else if(f.type==='plant'){g.fillStyle='#b08a67';g.fillRect(-13,-4,26,26);g.fillStyle='#819c68';for(const a of [-.7,0,.7]){g.save();g.rotate(a);g.beginPath();g.ellipse(0,-15,9,23,0,0,Math.PI*2);g.fill();g.restore();}}
      else {g.fillStyle=f.type==='oven'?'#829b91':'#b99b71';g.fillRect(-32,-28,64,48);g.fillStyle='#faf1da';g.fillRect(-32,-30,64,12);g.fillStyle='#43543f';if(f.type==='oven'){g.fillRect(-21,-5,42,19);g.fillStyle=h.stoves[f.id==='oven'?0:Number(f.id.replace('oven',''))]?'#d6af6a':'#a4b6ad';g.fillRect(-15,0,30,10);}else {g.fillStyle='#fff8e8';g.fillRect(-22,-24,44,9);}g.fillStyle='#43543f';g.font='11px sans-serif';g.fillText(f.type==='oven'?(h.stoves[f.id==='oven'?0:Number(f.id.replace('oven',''))]?'Cooking':'Stove'):'Counter',0,36);}
      if(selected===f){g.strokeStyle='#477354';g.lineWidth=3;g.strokeRect(-37,-37,74,74);}g.restore();}});
    if(!editing){const service=neoCafeService(h);for(const visit of service.visits){const table=items.find(f=>f.id===visit.table),c=guests[(visit.id-1)%Math.max(1,guests.length)];if(!table||!c)continue;const path=neoCafeRoute(items,table);if(!path)continue;
      const now=Date.now(),distance=still?1:visit.state==='arriving'?Math.min(1,Math.max(0,1-(visit.until-now)/6000)):visit.state==='leaving'?Math.max(0,Math.min(1,(visit.until-now)/6000)):1;
      const k=distance*(path.length-1),a=center(path[Math.floor(k)]),b=center(path[Math.min(path.length-1,Math.ceil(k))]),f=k%1,p={x:a.x+(b.x-a.x)*f,y:a.y+(b.y-a.y)*f};
      if(visit.state!=='dirty')layers.push({y:p.y,draw:()=>{g.save();g.translate(p.x,p.y+12);g.scale(1.35,1.35);c.state=distance<1?'walking':'loafing';c.walk=still?0:t/130;c.walkAmt=distance<1?1:0;c.face=b.x<a.x?-1:1;c.bob=0;drawCat(g,c,true);g.restore();g.fillStyle='#43543f';g.font='12px sans-serif';g.textAlign='center';g.fillText({arriving:'A table for one',waiting:'Ready to order',serving:'On its way',eating:'Enjoying a treat',leaving:'Thank you! +2'}[visit.state]||'',p.x,p.y-40);}});
      if(visit.state==='dirty'){const p=center(table);g.fillStyle='#faf5e8';g.beginPath();g.ellipse(p.x,p.y-5,12,6,0,0,7);g.fill();}
    }
    if(service.waiter){const job=service.waiter,table=items.find(f=>f.id===job.table),counter=items.find(f=>f.type==='counter'&&!f.boxed);if(table&&counter){const from=neoCafeRoute(items,counter),to=neoCafeRoute(items,table);if(from&&to){const route=[...from.slice().reverse(),...to.slice(1)],phase=still?1:Math.max(0,Math.min(1,(Date.now()-job.start)/(job.until-job.start))),k=phase*(route.length-1),a=center(route[Math.floor(k)]),b=center(route[Math.min(route.length-1,Math.ceil(k))]),p={x:a.x+(b.x-a.x)*(k%1),y:a.y+(b.y-a.y)*(k%1)};layers.push({y:p.y,draw:()=>{g.save();g.translate(p.x,p.y);g.scale(1.1,1.1);waiterCat.state='walking';waiterCat.walk=still?0:t/130;waiterCat.walkAmt=still?0:1;waiterCat.face=b.x<a.x?-1:1;drawCat(g,waiterCat,true);g.fillStyle='#f7f0dc';g.fillRect(-10,-3,20,15);g.fillStyle='#78957c';g.fillRect(-8,-1,16,3);if(job.task==='serve'){g.fillStyle='#f9f3df';g.beginPath();g.ellipse(16,-10,13,5,0,0,7);g.fill();g.fillStyle='#bc905d';g.fillRect(11,-16,10,5);}g.restore();}});}}}

    }
    layers.sort((a,b)=>a.y-b.y);for(const l of layers)l.draw();
    if(ghost&&selected){g.strokeStyle=neoCafeCanPlace(items,selected.id,ghost.x,ghost.y)?'#477354':'#b55b49';g.lineWidth=4;g.strokeRect(42+ghost.x*80,122+ghost.y*80,76,76);}
  }
  controls();neoCafeFrame=requestAnimationFrame(paint);
}
