(function(root){
 'use strict';
 const queues=new WeakMap();
 root.CoveCafeScene=function(c,{inside,s,stock,E,a,actors,t,height=380,offset:forcedOffset,band,previewTier=null,previewFinish=null}){
  const tier=previewTier??s.shopTier??0;
  const palette=E.finishes[previewFinish||s.finish]||E.finishes.sage;
  const rect=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);},oval=(x,y,rx,ry,col)=>{c.fillStyle=col;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();};
  const round=(x,y,w,h,r,col)=>{c.fillStyle=col;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();};
  const label=(str,x,y,size=16,col='#405842')=>{c.fillStyle=col;c.font=`${size}px Georgia`;c.textAlign='center';c.fillText(str,x,y);};
  const fitLabel=(str,x,y,maxW,size,col,min=11)=>{let z=size;c.font=`${z}px Georgia`;while(z>min&&c.measureText(str).width>maxW){z--;c.font=`${z}px Georgia`;}c.fillStyle=col;c.textAlign='center';c.fillText(str,x,y);};
  const resident=actors.find(cat=>cat.cafeKey===s.residentCat)||actors[1]||actors[0];
  const cafeTitle=E.cafeName?E.cafeName(s).toUpperCase():'CATMINT CAFÉ';
  const has=id=>!!(s.decor&&s.decor[id]);
  let outsideY=124; let L=null;   // the inside layout, so the sign, steam and emotes can find their places
  const heart=(x,y,z,col)=>{c.fillStyle=col;c.beginPath();c.moveTo(x,y+z*.9);c.bezierCurveTo(x-z*1.6,y-z*.2,x-z*.7,y-z*1.3,x,y-z*.4);c.bezierCurveTo(x+z*.7,y-z*1.3,x+z*1.6,y-z*.2,x,y+z*.9);c.fill();};
  const sparkle=(x,y,z,col)=>{c.fillStyle=col;c.beginPath();for(let i=0;i<8;i++){const a=i*Math.PI/4,r=i%2?z*.38:z;c.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r);}c.closePath();c.fill();};
  // The guest's first sip: hearts for a favourite, sparkles for a good cup, a quiet "…" for fine, a green squint for too bitter.
  const emote=(x,y,mood,u)=>{c.save();c.globalAlpha=Math.max(0,u<.1?u/.1:1-Math.max(0,(u-.55)/.45));const rise=u*34;
   if(mood==='love'){for(let i=0;i<3;i++)heart(x+(i-1)*13+Math.sin(u*7+i)*3,y-rise-i*8,i===1?8:6,'#e8798f');}
   else if(mood==='happy'){for(let i=0;i<3;i++)sparkle(x+(i-1)*12,y-rise-Math.abs(i-1)*7,5,'#f2c65c');}
   else if(mood==='meh'){round(x-14,y-rise-14,28,18,9,'#faf3df');label('…',x,y-rise-1,15,'#7a7563');}
   else{const fy=y-rise-10;oval(x,fy,11,11,'#bcd68b');c.strokeStyle='#4f6b35';c.lineWidth=1.6;c.beginPath();c.moveTo(x-6,fy-3);c.lineTo(x-2,fy-1);c.moveTo(x+6,fy-3);c.lineTo(x+2,fy-1);c.stroke();c.beginPath();c.moveTo(x-4,fy+5);c.quadraticCurveTo(x-2,fy+2,x,fy+5);c.quadraticCurveTo(x+2,fy+8,x+4,fy+5);c.stroke();oval(x+14,fy-4+u*8,2.2,3,'#9fd0e6');}
   c.restore();};
  const now=Date.now(),night=new Date().getHours()<6||new Date().getHours()>=18,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const stocked=s.unlocked&&s.open&&E.available(s,stock).length,active=!!s.pending,depart=s.lastCompleted?(now-s.lastCompleted.at)/12000:99;
  const lead=active?s.sequence-1:s.sequence;
  let queue=queues.get(s);if(!queue){queue=new Map();queues.set(s,queue);}
  function queued(x,y,scale,id){
   let p=queue.get(id);if(!p){p={x:-55-(id-lead)*80,y:390,last:t,walk:0};queue.set(id,p);}
   const dt=Math.min(.05,Math.max(0,(t-p.last)/1000));p.last=t;
   const distance=Math.hypot(x-p.x,y-p.y),step=Math.min(distance,dt*55);
   if(reduced){p.x=x;p.y=y;p.walk=0;}else{if(distance>0){p.x+=(x-p.x)/distance*step;p.y+=(y-p.y)/distance*step;}p.walk+=(Number(distance>1)-p.walk)*Math.min(1,dt*9);}
   customer(p.x,p.y,scale,id,p.walk);
   for(const key of queue.keys())if(key<lead-2||key>lead+3)queue.delete(key);
  }
  function customer(x,y,scale,id,walking=false){
   const pool=actors.length>1?actors.slice(1):actors;
   const cat=pool[((id%pool.length)+pool.length)%pool.length];
   a.cat(c,cat,x,y,scale*1.5,reduced?0:t,reduced?0:walking);
  }
  function machine(x,y){
   const color=['#93a392','#758f80','#536e60'][s.speed||0];round(x,y,132,103,10,color);rect(x+10,y+12,112,22,'#344d42');
   c.strokeStyle='#b6c2ab';c.lineWidth=2;c.beginPath();c.roundRect(x+3,y+3,126,97,8);c.stroke();
   oval(x+104,y+23,7,7,'#eadfc0');c.strokeStyle='#6b745b';c.lineWidth=1.3;c.beginPath();c.moveTo(x+104,y+23);c.lineTo(x+107,y+19);c.stroke();
   for(let i=0;i<=s.speed;i++)oval(x+22+i*25,y+23,5,5,'#e1ca89');rect(x+18,y+45,96,43,'#3f5046');rect(x+14,y+87,104,7,'#b9bdac');
   for(let i=0;i<(s.speed?2:1);i++){rect(x+36+i*42,y+43,5,17,'#d1d0b8');round(x+26+i*42,y+66,24,20,3,'#fbf1d9');}
   label(['Little brewer','Twin brewer','Cove brewer'][s.speed||0],x+66,y+121,13,tier===0?'#f3e8cf':'#405842');
  }
  function kettle(x,y){oval(x,y,28,22,s.cookware?'#b48657':'#9aab9c');rect(x-9,y-28,18,7,'#596e59');c.strokeStyle='#596e59';c.lineWidth=6;c.beginPath();c.arc(x+26,y-2,15,-1.4,1.4);c.stroke();c.fillStyle=s.cookware?'#b48657':'#9aab9c';c.beginPath();c.moveTo(x-24,y-5);c.lineTo(x-44,y-20);c.lineTo(x-31,y+9);c.fill();}
  function bubble(x,y){if(!active&&depart>=0&&depart<1&&s.lastCompleted?.response)return;const r=active?E.recipes.find(r=>r.id===s.pending.id):null;const greetings=['Something warm, please.','One cup. Two paws.','Is the sunny seat taken?','I came for the company.','Make mine extra cozy.','My whiskers smelled coffee.'];round(x-132,y-25,264,35,12,'#faf3df');fitLabel(r?(s.pending.items||[r.id]).map(id=>E.displayName(s,E.recipes.find(x=>x.id===id))).join(' + ')+', please.':greetings[s.sequence%greetings.length],x,y-3,240,16,'#405842');}
  const extra=Math.max(0,height-380),offset=Number.isFinite(forcedOffset)?forcedOffset:extra*.45;c.save();
  rect(0,0,720,height,night?'#405a65':'#dce8db');rect(0,offset+220,720,height,inside?'#dbc5a1':night?'#777663':'#dacbad');c.translate(0,offset);
  const sky=c.createLinearGradient(0,-offset,0,125);sky.addColorStop(0,night?'#26384c':'#9bcbd7');sky.addColorStop(1,night?'#4a6570':'#e0e8d2');rect(0,-offset,720,offset+260,sky);
  const water=c.createLinearGradient(0,100,0,228);water.addColorStop(0,night?'#3a5c69':'#91bfbd');water.addColorStop(1,night?'#496e72':'#b2cebd');rect(0,100,720,128,water);
  // Distant headlands stay above the sea, with quiet reflections instead of hard stripes.
  c.fillStyle=night?'#354f5e':'#85aaa6';c.beginPath();c.moveTo(0,103);c.lineTo(0,86);c.quadraticCurveTo(44,65,95,95);c.quadraticCurveTo(123,89,152,103);c.fill();
  c.beginPath();c.moveTo(720,103);c.lineTo(720,79);c.quadraticCurveTo(675,78,645,97);c.lineTo(612,103);c.fill();
  for(let i=0;i<10;i++)rect((i*97)%720,116+(i*19)%103,24+(i%3)*13,1,night?'#b7ceca24':'#f5f4df55');
  if(night){oval(647,49,16,16,'#f3e5be');for(let i=0;i<9;i++)rect(646-i*2,110+i*9,4+i*4,1,'#e7dfaf22');}
  rect(0,220,720,160,night?'#777663':'#dacbad');
  if(inside){drawInside();
  }else{
   root.CoveCafeScene.hotspots=null;
   // A quiet seaside garden surrounds the café; props remain flat illustrations.
   const breeze=reduced?0:Math.sin(t/2400)*2;
   for(const [x,y,r] of [[50,70,36],[660,85,42]]){oval(x,y,r,11,night?'#607782':'#f0f1df');oval(x+19,y-7,r*.6,12,night?'#607782':'#f0f1df');}
   rect(0,226,720,154+extra,night?'#596c54':'#8ea577');
   c.fillStyle=night?'#8b8870':'#d8c6a0';c.beginPath();c.moveTo(310,304);c.lineTo(410,304);c.lineTo(545,380+extra);c.lineTo(100,380+extra);c.closePath();c.fill();
   for(let i=0;i<6;i++){const y=345+i*50;oval(340-i*8,y,29+i*3,6,night?'#a19c82':'#eee0bd');}
   // Small uneven catmint clusters, leaving room around customers and purchased decor.
   for(const [x,y] of [[34,252],[71,272],[25,325],[651,249],[686,276],[668,329]]){
    oval(x,y+5,16,5,night?'#4d604c':'#7d996b');
    for(let i=-1;i<=1;i++){const px=x+i*7,py=y-10-Math.abs(i)*3;rect(px+breeze*.35,py,1.4,y-py,'#66805a');
     c.save();c.translate(px,py+7);c.rotate(i*.35);oval(-3,0,5,2.5,'#8b9e71');oval(3,-4,5,2.5,'#7d9568');c.restore();oval(px+breeze*.35,py,2,3.5,'#aaa1b7');}
   }
   for(const x of [132,586]){rect(x-2,280,4,55,'#685e48');round(x-8,271,16,23,4,night?'#ffe0a0':'#e5d3a8');if(night){oval(x,337,29,8,'#f4d69322');const halo=c.createRadialGradient(x,282,0,x,282,40);halo.addColorStop(0,'#ffdc9340');halo.addColorStop(1,'#ffdc9300');oval(x,282,40,40,halo);}}
   // Orthographic elevation: every stage has its own silhouette, never an angled side wall.
   const left=[180,113,40][tier],right=720-left,roof=[99,76,47][tier];
   const glow=(x,y,r,alpha=.18)=>{if(!night)return;const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba(255,211,135,'+alpha+')');g.addColorStop(1,'rgba(255,211,135,0)');oval(x,y,r,r,g);};
   const lamp=(x,y)=>{rect(x-2,y-14,4,14,'#705c41');round(x-7,y,14,22,4,night?'#ffe2a6':'#d6cbae');glow(x,y+12,42);};
   const plant=(x,y)=>{rect(x-19,y,38,24,'#aa805a');for(let i=-1;i<=1;i++){oval(x+i*12,y-10,11,18,'#69835e');oval(x+i*12,y-23,4,4,'#d4b477');}};
   oval(360,322,(right-left)/2+16,10,night?'#5b6054':'#b7a78b');
   rect(left-8,309,right-left+16,12,'#a48660');
   round(left,roof,right-left,230+(99-roof)-18,5,palette.body);
   for(let x=left+10;x<right;x+=18)rect(x,232,1,76,palette.shade);
   rect(left,roof,right-left,9,palette.dark);
   rect(left+5,roof+10,5,297-roof,palette.light);rect(right-10,roof+10,5,297-roof,palette.shade);
   if(tier===2){
    // Full café: broad façade with two lit display windows and a raised central sign.
    for(const x of [left+20,right-106]){
     round(x,119,86,132,24,palette.dark);round(x+7,128,72,112,18,night?'#9b835a':'#cbd5b7');
     rect(x+41,128,4,111,'#ddc79f');rect(x+7,181,72,4,'#ddc79f');
     glow(x+43,188,58,.13);plant(x+43,274);
    }
    rect(left+8,roof+12,8,242,palette.light);rect(right-16,roof+12,8,242,palette.light);
    round(235,22,250,58,12,palette.dark);fitLabel(cafeTitle,360,60,226,25,'#fff0d5');
    for(let x=left+20;x<right-10;x+=22){if(x<228||x>485)rect(x,roof+13,9,5,palette.light);}
   }else{
    round(left+24,roof-43,right-left-48,39,5,palette.dark);
    fitLabel(cafeTitle,360,roof-16,right-left-70,tier?26:23,'#fff0d5');
   }
   const wx=tier===0?left+25:205,ww=tier===0?310:310,wy=tier===0?124:116;
   outsideY=wy;
   rect(wx-7,wy-7,ww+14,113,'#b68b5d');rect(wx,wy,ww,99,night?'#5d6047':'#45624e');
   rect(wx+9,wy+22,ww-18,5,'#bfa278');
   for(let i=0;i<4;i++){rect(wx+15+i*15,wy+6,9,15,palette.light);rect(wx+16+i*15,wy+11,7,3,palette.shade);}
   rect(wx+16,wy+53,57,39,'#99ad94');rect(wx+24,wy+62,41,18,'#334b3e');rect(wx+37,wy+82,13,10,'#f6ead1');
   a.cat(c,resident,360,wy+103,1.05,reduced?0:t,false);
   round(wx+ww-70,wy+37,58,50,3,palette.dark);label('MENU',wx+ww-41,wy+50,10,'#f7e9c9');
   for(let i=0;i<3;i++)rect(wx+ww-61,wy+58+i*7,39-i*5,2,'#bfcbae');
   rect(wx-13,wy+100,ww+26,10,'#d0ac79');rect(wx-8,wy+110,ww+16,5,'#816444');
   rect(wx-10,wy+101,ww+20,2,'#e5c594');
   // A little catmint stamp ties the counter to the Garden and the Cove palette.
   c.save();c.translate(360,239);c.fillStyle=palette.dark;c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(-14,0,-13,-11);c.quadraticCurveTo(-1,-12,0,0);c.moveTo(1,0);c.quadraticCurveTo(14,-3,12,-14);c.quadraticCurveTo(0,-12,1,0);c.fill();c.restore();
   if(tier>0){
    // Garden's scalloped cloth canopy becomes a long café awning at the final stage.
    const ax=tier===1?left-8:185,aw=tier===1?right-left+16:350;
    rect(ax,87,aw,23,palette.light);
    for(let x=ax;x<ax+aw;x+=28){rect(x,87,14,23,palette.shade);round(x,104,14,13,5,palette.shade);round(x+14,104,14,13,5,palette.light);}
    if(tier===1){plant(left+35,278);plant(right-35,278);for(const x of [left+30,right-30]){rect(x-12,142,24,15,'#ad8b61');oval(x,132,18,22,'#71875c');}}
   }else{rect(left-5,107,right-left+10,9,palette.light);}
   label(tier===0?'A LITTLE CUP OF COVE':tier===1?'GROWN HERE · BREWED WITH LOVE':'COFFEE · CATMINT · COMPANY',360,266,tier===0?12:13,palette.dark);
   if(tier===2){label('YOUR LITTLE HOME BY THE SEA',360,287,10,palette.dark);}
   const lamps=tier===0?[left+12,right-12]:tier===1?[left+17,right-17]:[left+119,right-119];
   lamps.forEach(x=>lamp(x,178));
   if(night){glow(360,wy+63,115,.12);oval(360,316,ww*.46,14,'#eed09118');}
   if(tier===2){for(const x of [248,360,472]){rect(x-1,111,2,10,'#756344');oval(x,124,4,5,night?'#ffe5a4':'#dbc791');glow(x,128,25,.12);}}
   if(s.guestFlowerBox){round(146,305,45,14,3,'#aa805a');for(let k=0;k<5;k++){rect(151+k*8,295,2,12,'#688957');oval(152+k*8,293,5,4,k%2?'#e9c990':'#cfa4af');}}
   // ---- outdoor décor (bought in Upgrades) ----
   if(has('lights')){const y0=roof+18;c.strokeStyle='rgba(60,46,32,.55)';c.lineWidth=1.4;c.beginPath();c.moveTo(left-6,y0);c.quadraticCurveTo(360,y0+34,right+6,y0);c.stroke();
    for(let i=0;i<=10;i++){const u=i/10,bx=left-6+(right-left+12)*u,by=y0+2*(1-u)*u*34;const twinkle=.75+.25*Math.sin(t/500+i);
     if(night){const gl=c.createRadialGradient(bx,by+5,0,bx,by+5,22);gl.addColorStop(0,'rgba(255,219,140,'+(.45*twinkle)+')');gl.addColorStop(1,'rgba(255,219,140,0)');oval(bx,by+5,22,22,gl);}
     oval(bx,by+5,3.2,4,night?'#ffe6a8':'#e8d7a4');}}
   if(has('flowerbox')){const bx=wx-8,bw=ww+16;round(bx,wy+112,bw,15,3,'#8a6a49');rect(bx,wy+112,bw,4,'#a58459');
    for(let i=0;i<bw/13;i++){const fx=bx+8+i*13,col=['#e7a2a7','#f2d27a','#c6b2e6','#f4efe1'][i%4];rect(fx,wy+104-(i%3)*2,2,10,'#5f7c4f');oval(fx-2,wy+103-(i%3)*2,4,3,'#6f8f5a');oval(fx+3,wy+102-(i%3)*2,4,3,'#6f8f5a');oval(fx+1,wy+100-(i%3)*2,3.2,3.2,col);}}
   if(has('chalkboard')){const cx=468,cy=336;c.fillStyle='rgba(36,31,23,.13)';oval(cx,cy+2,19,4,'rgba(36,31,23,.13)');
    c.strokeStyle='#7a5c3d';c.lineWidth=3;c.beginPath();c.moveTo(cx-16,cy);c.lineTo(cx-11,cy-40);c.moveTo(cx+16,cy);c.lineTo(cx+11,cy-40);c.stroke();
    round(cx-19,cy-44,38,34,3,'#8a6a49');round(cx-16,cy-41,32,28,2,'#2f4a3d');
    const sp=E.recipes.find(r=>r.id===(E.special&&E.special(s)))||E.recipes.find(r=>s.menu&&s.menu.includes(r.id));label('TODAY',cx,cy-31,7,'#f4efe1');const nm=sp?E.displayName(s,sp).toUpperCase().split(' ')[0].slice(0,9):'COFFEE';fitLabel(nm,cx,cy-19,29,8,'#f6e7b4',5);c.strokeStyle='#f4efe1';c.lineWidth=.7;c.beginPath();c.moveTo(cx-11,cy-27);c.lineTo(cx+11,cy-27);c.stroke();}
   if(has('parasol')){const px=548,py=344;oval(px,py+2,26,6,'rgba(36,31,23,.13)');rect(px-1.5,py-52,3,52,'#8a6a49');
    for(let i=0;i<6;i++){c.fillStyle=i%2?'#f4efe1':'#d9887f';c.beginPath();c.moveTo(px,py-66);c.lineTo(px-34+i*11.3,py-46);c.lineTo(px-34+(i+1)*11.3,py-46);c.closePath();c.fill();}
    oval(px,py-66,2.5,2.5,'#8a6a49');round(px-15,py-12,30,4,2,'#a58459');rect(px-1.5,py-12,3,12,'#7a5c3d');round(px-9,py-19,18,7,3,'#f4efe1');oval(px-12,py-2,4,2,'#7a5c3d');if(actors.length>3&&!(s.seats))a.cat(c,actors[3],px+30,py+8,.75,reduced?0:t,false);}
   if(has('statue')){const sx=150,sy=326;oval(sx,sy+2,20,5,'rgba(36,31,23,.13)');round(sx-15,sy-10,30,12,3,'#9ea79f');round(sx-12,sy-14,24,6,2,'#b1b9b0');
    c.fillStyle='#8f9a94';c.beginPath();c.moveTo(sx-9,sy-13);c.quadraticCurveTo(sx-13,sy-30,sx-6,sy-38);c.lineTo(sx-8,sy-47);c.lineTo(sx-1,sy-43);c.lineTo(sx+4,sy-43);c.lineTo(sx+9,sy-47);c.lineTo(sx+8,sy-38);c.quadraticCurveTo(sx+13,sy-30,sx+9,sy-13);c.closePath();c.fill();
    c.strokeStyle='#8f9a94';c.lineWidth=4;c.beginPath();c.moveTo(sx+9,sy-14);c.quadraticCurveTo(sx+24,sy-14,sx+21,sy-28);c.stroke();
    c.fillStyle='rgba(255,255,255,.22)';c.beginPath();c.ellipse(sx-4,sy-30,2.5,9,0,0,7);c.fill();oval(sx-3,sy-33,1.1,1.1,'#5d675f');oval(sx+3,sy-33,1.1,1.1,'#5d675f');}
   if(has('fountain')){const fx=214,fy=318;oval(fx,fy+2,24,6,'rgba(36,31,23,.13)');round(fx-20,fy-10,40,12,5,'#a7b0a8');oval(fx,fy-10,18,5,'#9fc9cf');rect(fx-3,fy-30,6,20,'#a7b0a8');oval(fx,fy-31,10,3.5,'#b7c0b8');
    if(!reduced){c.strokeStyle='rgba(175,220,228,.85)';c.lineWidth=1.6;for(let i=0;i<4;i++){const ph=(t/700+i*.25)%1,dx=(i-1.5)*6;c.beginPath();c.moveTo(fx,fy-33);c.quadraticCurveTo(fx+dx*.7,fy-46+ph*8,fx+dx*1.6,fy-12);c.stroke();}
     oval(fx+Math.sin(t/300)*8,fy-10,2.4,1.1,'rgba(255,255,255,.7)');}else{c.strokeStyle='rgba(175,220,228,.85)';c.lineWidth=1.6;c.beginPath();c.moveTo(fx,fy-33);c.quadraticCurveTo(fx-8,fy-42,fx-13,fy-12);c.moveTo(fx,fy-33);c.quadraticCurveTo(fx+8,fy-42,fx+13,fy-12);c.stroke();}}
   // A public resting bench is distinct from the purchasable café table.
   rect(28,318,86,8,'#ba9971');rect(33,300,76,7,'#ba9971');rect(33,309,76,5,'#ba9971');rect(38,325,5,20,'#786046');rect(99,325,5,20,'#786046');
   if(!stocked&&!active&&actors.length>1){a.cat(c,actors[1],73,320,.85,reduced?0:t,false);}
   if(stocked||active){queued(382,390,.70,lead);queued(302,390,.70,lead+1);queued(222,390,.70,lead+2);}
   if(depart>=0&&depart<1)customer(382+depart*390,390,.70,s.sequence-1,true);
   if(s.seats){rect(659,299,8,42,'#927550');oval(663,294,32,12,'#c5aa7d');round(651,276,12,16,3,'#f6edd7');oval(657,276,6,2,'#7b5a42');if(actors.length>2)a.cat(c,actors[2],615,350,.9,reduced?0:t,false);}
  }

  // ================= INSIDE: behind the counter, looking out through the serving window =================
  // One full-bleed room that fills whatever space the screen gives it (band = height between the top stack and the bottom controls).
  function drawInside(){
   // Where the tappable counter props are, in the same untranslated coordinate space the
   // canvas click handler already uses for the cup zone -- so tapping the brewer, kettle or
   // beans jumps straight to that thing's own upgrade/restock screen instead of always
   // opening "make a drink".
   const hotspots={};
   const W=720,BH=Math.max(380,Number.isFinite(band)?band:height-offset),warm=night?'rgba(255,205,130,':'rgba(255,214,150,';
   const winH=Math.round(Math.max(150,Math.min(300,BH*.3))),cTop=Math.round(Math.max(300,Math.min(BH*.63,640))),winB=cTop-16,winT=winB-winH,winL=64,winR=656;
   const topFace=46,cf=140,panelT=cTop+topFace+2,panelB=Math.min(BH,panelT+cf);
   const hz=winT+Math.round(winH*.5),prom=winB-Math.round(winH*.3),leadScale=Math.max(1.1,winH*.0072);
   const mx=28,my=cTop+40-103;
   L={winT,winB,cTop,panelT,panelB,leadX:360,faceY:winB-4-64*leadScale,signX:winR-58,signY:winT+40,mx,my};
   const sway=reduced?0:Math.sin(t/1700);
   const wood='#a5825a',woodD='#7f6244',woodL='#d3b58a';
   // wall
   const wg=c.createLinearGradient(0,-offset,0,BH);wg.addColorStop(0,night?'#33424b':'#e8d9b8');wg.addColorStop(1,night?'#2b3941':'#efe4c9');c.fillStyle=wg;c.fillRect(-900,-offset,W+1800,height);
   c.fillStyle=night?'rgba(255,255,255,.03)':'rgba(120,90,50,.055)';for(let x=-900;x<W+900;x+=36)c.fillRect(x,-offset,1.5,height);
   // ceiling beam
   rect(-900,-offset,W+1800,offset+22,woodD);rect(-900,20,W+1800,4,'rgba(0,0,0,.18)');
   // shelves above the window
   const Z=winT-40;
   if(Z>=100){
    const two=Z>=215&&tier>0,ys=two?[Math.round(Z*.44),Z-10]:[Z-10];
    const board=(y,x0,x1)=>{round(x0,y,x1-x0,7,2,wood);rect(x0+6,y+7,6,10,woodD);rect(x1-12,y+7,6,10,woodD);c.fillStyle='rgba(0,0,0,.10)';c.fillRect(x0,y+7,x1-x0,3);};
    const jar=(x,y,key,ch,fill)=>{const q=Math.max(0,Math.min(1,(stock&&stock[key]||0)/12));round(x-17,y-46,34,46,8,night?'rgba(220,235,235,.28)':'rgba(255,255,255,.55)');
     if(q>0){c.save();c.beginPath();c.roundRect(x-15,y-44,30,42,7);c.clip();rect(x-15,y-2-42*q,30,42*q,fill);c.restore();}
     c.strokeStyle='rgba(90,70,45,.55)';c.lineWidth=1.6;c.beginPath();c.roundRect(x-17,y-46,34,46,8);c.stroke();
     round(x-12,y-55,24,10,3,'#b9905e');round(x-9,y-33,18,12,2,'#f7efd7');label(ch,x,y-23,9,'#5f5a48');
     if(q<.18){oval(x+15,y-50,6,6,'#d9635a');label('!',x+15,y-47,9,'#fff');}
     hotspots['jar_'+key]={x:x-19,y:y-58,w:38,h:52};};
    const mug=(x,y,col)=>{round(x-9,y-16,18,16,4,col);c.strokeStyle=col;c.lineWidth=3;c.beginPath();c.arc(x+10,y-9,5,-1.2,1.2);c.stroke();rect(x-8,y-14,16,2,'rgba(255,255,255,.35)');};
    const plant=(x,y)=>{round(x-12,y-16,24,16,3,'#b07f58');for(let i=-1;i<=1;i++){c.save();c.translate(x+i*8,y-16);c.rotate(i*.35+sway*.04);oval(0,-14,5,15,'#6f8f5a');c.restore();}};
    const shelf1=ys[0];
    board(shelf1,150,570);
    mug(188,shelf1,'#e9d6b0');mug(210,shelf1,'#9fb7a0');mug(296,shelf1,'#e4a08a');round(316,shelf1-22,36,22,6,'#f4ecd5');rect(350,shelf1-16,9,4,'#f4ecd5');
    jar(400,shelf1,'coffee','C','#6b4a34');jar(466,shelf1,'catmint','M','#7ea56a');jar(532,shelf1,'honey','H','#e2b04a');
    if(two){board(ys[1],96,624);plant(140,ys[1]);mug(206,ys[1],'#f4ecd5');mug(228,ys[1],'#94aa91');
     round(300,ys[1]-24,50,24,6,'#f4ecd5');rect(348,ys[1]-18,10,4,'#f4ecd5');rect(304,ys[1]-30,42,6,'#e7dab8');
     round(410,ys[1]-38,30,38,3,'#c9a56d');rect(414,ys[1]-34,22,30,'#f6ecd0');heart(425,ys[1]-18,6,'#c98a7a');
     plant(560,ys[1]);}
    else{plant(596,shelf1);}
   }
   // hanging specials board
   if(Z>=150){const bx=250,by=30,bw=150,bh=46;c.strokeStyle='rgba(60,44,28,.6)';c.lineWidth=1.2;c.beginPath();c.moveTo(bx-46,22);c.lineTo(bx-46,by);c.moveTo(bx+46,22);c.lineTo(bx+46,by);c.stroke();
    round(bx-bw/2,by,bw,bh,5,'#8a6a49');round(bx-bw/2+5,by+5,bw-10,bh-10,3,'#2f4a3d');
    const sp=E.recipes.find(r=>r.id===(E.special&&E.special(s)))||E.recipes.find(r=>s.menu&&s.menu.includes(r.id));
    label(sp&&E.special&&E.special(s)?'TODAY’S SPECIAL':'TODAY',bx,by+19,10,'#f4efe1');fitLabel(sp?E.displayName(s,sp):'Coffee',bx,by+36,bw-24,15,'#f6e7b4',9);}
   // window: the world outside
   c.save();c.beginPath();c.rect(winL,winT,winR-winL,winH);c.clip();
   const sk=c.createLinearGradient(0,winT,0,hz);sk.addColorStop(0,night?'#1f2f40':'#8ec3ce');sk.addColorStop(1,night?'#496a72':'#e8f0d8');c.fillStyle=sk;c.fillRect(winL,winT,winR-winL,hz-winT);
   if(night){oval(560,winT+winH*.2,15,15,'#f3e5be');for(let i=0;i<14;i++)oval(winL+30+(i*97)%560,winT+8+(i*53)%Math.max(20,hz-winT-24),1.1,1.1,'rgba(255,248,220,'+(.5+.4*Math.sin(t/600+i))+')');}
   else{const sg=c.createRadialGradient(560,winT+winH*.22,4,560,winT+winH*.22,60);sg.addColorStop(0,'rgba(255,244,190,.95)');sg.addColorStop(1,'rgba(255,244,190,0)');oval(560,winT+winH*.22,60,60,sg);oval(560,winT+winH*.22,17,17,'#fff3c4');
    const cx=((reduced?0:t/70)%860)-90;oval(cx,winT+winH*.16,46,11,'rgba(255,255,255,.85)');oval(cx+26,winT+winH*.16-6,30,11,'rgba(255,255,255,.85)');oval(cx+330,winT+winH*.3,38,9,'rgba(255,255,255,.7)');}
   const sea=c.createLinearGradient(0,hz,0,prom);sea.addColorStop(0,night?'#3f6a72':'#86bcc0');sea.addColorStop(1,night?'#2c4f5a':'#5f979f');c.fillStyle=sea;c.fillRect(winL,hz,winR-winL,prom-hz);
   c.strokeStyle=night?'rgba(220,240,240,.28)':'rgba(255,255,255,.5)';c.lineWidth=1.6;for(let i=0;i<7;i++){const yy=hz+6+i*((prom-hz-8)/7),xx=winL+((i*137+(reduced?0:t/40*(1+i*.15)))%(winR-winL+120))-60;c.beginPath();c.moveTo(xx,yy);c.lineTo(xx+34+i*4,yy);c.stroke();}
   {const bx=((reduced?200:t/55)%900)-60,by=hz+7;c.fillStyle=night?'#d8d2bc':'#fbf5e2';c.beginPath();c.moveTo(bx,by-24);c.lineTo(bx+16,by-2);c.lineTo(bx,by-2);c.fill();c.fillStyle=night?'#c4bca0':'#f0e2c0';c.beginPath();c.moveTo(bx-3,by-18);c.lineTo(bx-14,by-2);c.lineTo(bx-3,by-2);c.fill();rect(bx-14,by-2,32,5,'#7d5f43');}
   rect(winL,prom,winR-winL,winB-prom,night?'#8d8368':'#d3c19a');rect(winL,prom,winR-winL,3,night?'#71684f':'#b9a47c');
   c.strokeStyle=night?'rgba(0,0,0,.14)':'rgba(120,90,50,.16)';c.lineWidth=1;for(let x=winL;x<winR;x+=48){c.beginPath();c.moveTo(x,prom+3);c.lineTo(x-14,winB);c.stroke();}
   rect(winL,prom-15,winR-winL,3,'#7f6a4c');for(let x=winL+10;x<winR;x+=52)rect(x,prom-15,3,15,'#7f6a4c');
   if(stocked||active){
    const showLead=!!active||E.customerReady(s,now),fy=prom+(winB-prom)*.4;
    customer(548,fy,leadScale*.5,lead+1);customer(628,fy-2,leadScale*.44,lead+2);if(tier>0)customer(150,fy-1,leadScale*.46,lead+3);
    if(showLead)customer(360,winB-4,leadScale,lead);
    if(depart>=0&&depart<1)customer(360+depart*330,winB-4-depart*8,leadScale*(1-.3*depart),s.sequence-1,true);
   }else label('A quiet moment by the sea.',360,hz+22,20,night?'#e6efe6':'#496247');
   c.restore();
   // frame, awning valance and sill
   c.strokeStyle=woodD;c.lineWidth=12;c.strokeRect(winL-6,winT-6,winR-winL+12,winH+12);c.strokeStyle='rgba(255,255,255,.18)';c.lineWidth=2;c.strokeRect(winL-1,winT-1,winR-winL+2,winH+2);
   {const ax=winL-16,aw=winR-winL+32;rect(ax,winT-30,aw,26,palette.light);for(let x=ax;x+28<=ax+aw+1;x+=28){rect(x,winT-30,14,26,palette.shade);round(x,winT-12,14,15,6,palette.shade);round(x+14,winT-12,14,15,6,palette.light);}rect(ax,winT-32,aw,4,palette.dark);}
   rect(winL-16,winB+4,winR-winL+32,7,woodL);
   // backsplash between the window and the counter
   if(tier===2){rect(-900,winB+11,W+1800,cTop-winB-11,'#ece2ca');c.fillStyle='#d8ccae';for(let x=-900;x<W+900;x+=24)c.fillRect(x,winB+11,1,cTop-winB);}else{rect(-900,winB+11,W+1800,cTop-winB-11,palette.shade);}
   // pendant lamps
   for(const lx of [104,616]){const len=Math.max(40,Math.min(96,winT-42)),ly=22+len,ang=sway*.03*(lx<360?1:-1);c.save();c.translate(lx,22);c.rotate(ang);c.strokeStyle='rgba(60,44,28,.7)';c.lineWidth=1.6;c.beginPath();c.moveTo(0,0);c.lineTo(0,len);c.stroke();
    c.fillStyle=palette.dark;c.beginPath();c.moveTo(-9,len);c.lineTo(9,len);c.lineTo(28,len+26);c.lineTo(-28,len+26);c.closePath();c.fill();rect(-28,len+24,56,3,palette.shade);oval(0,len+28,8,5,night?'#ffe6a8':'#f3e3b4');
    if(night){const gl=c.createRadialGradient(0,len+30,0,0,len+30,90);gl.addColorStop(0,'rgba(255,214,140,.5)');gl.addColorStop(1,'rgba(255,214,140,0)');oval(0,len+30,90,90,gl);}c.restore();}
   // the counter: top face, front panel
   const tg=c.createLinearGradient(0,cTop,0,cTop+topFace);tg.addColorStop(0,'#e3cba0');tg.addColorStop(1,'#cfae7e');c.fillStyle=tg;c.fillRect(-900,cTop,W+1800,topFace);
   rect(-900,cTop-3,W+1800,4,'#b8935f');c.strokeStyle='rgba(120,84,48,.16)';c.lineWidth=1;for(let i=0;i<9;i++){const yy=cTop+8+(i*13)%(topFace-10),xx=(i*83)%W;c.beginPath();c.moveTo(xx,yy);c.lineTo(xx+90+(i%3)*30,yy);c.stroke();}
   rect(-900,cTop+topFace-2,W+1800,4,'#9a7549');
   if(tier===2){rect(-900,panelT,W+1800,panelB-panelT,'#bbac8d');c.fillStyle='#d3c8ad';for(let x=-900;x<W+900;x+=45)c.fillRect(x,panelT,1.5,panelB-panelT);for(let y=panelT+44;y<panelB;y+=44)c.fillRect(-900,y,W+1800,1.5);}
   else{rect(-900,panelT,W+1800,panelB-panelT,tier===1?palette.body:wood);c.fillStyle=tier===1?palette.shade:woodD;for(let x=-900;x<W+900;x+=48)c.fillRect(x,panelT,2,panelB-panelT);}
   rect(-900,panelB-3,W+1800,3,'rgba(0,0,0,.2)');
   // the floor below the counter
   if(panelB<BH){rect(-900,panelB,W+1800,BH-panelB+offset+40,night?'#75674f':'#c9a877');c.strokeStyle='rgba(90,64,38,.16)';c.lineWidth=1.4;for(let y=panelB+18;y<BH+offset;y+=22){c.beginPath();c.moveTo(0,y);c.lineTo(W,y);c.stroke();}rect(-900,panelB,W+1800,9,'rgba(0,0,0,.14)');
    const fy=Math.min(BH-16,panelB+(BH-panelB)*.62);
    if(BH-panelB>70){oval(360,fy,210,Math.min(30,(BH-panelB)*.24),palette.light);oval(360,fy,180,Math.min(22,(BH-panelB)*.17),palette.shade);
     round(38,fy-44,58,50,14,'#c7a97b');rect(50,fy-52,34,10,'#a98a5e');label('BEANS',67,fy-15,10,'#6a5238');
     hotspots.beans={x:24,y:fy-64,w:88,h:80};
     if(resident){hotspots.resident={x:574,y:fy-88,w:88,h:105};oval(618,fy+4,46,10,'rgba(0,0,0,.14)');round(578,fy-14,80,22,11,palette.body);a.cat(c,resident,618,fy-2,1.05,reduced?0:t,false);}}}
   // things on the counter
   machine(mx,my);
   hotspots.machine={x:mx-4,y:my-6,w:140,h:145};
   {const px=344,py=cTop+30;oval(px,py,46,11,'#b99c70');if(!active){round(px-15,py-38,30,34,4,'#faf2df');oval(px,py-37,15,4,'#856547');}label('Pickup',px,panelT+22,15,tier===0?'#f3e8cf':'#405842');L.cupY=py-38;root.CoveCafeScene.cupY=L.cupY;}
   if(!s.cookware){round(430,cTop+22,80,15,4,'#617665');oval(470,cTop+21,29,5,'#403e32');round(437,cTop+8,66,14,5,'#927252');rect(501,cTop+10,27,5,'#705a42');label('Cookware',478,panelT+22,13,tier===0?'#f3e8cf':'#405842');}
   if(s.cookware){const cx=430,cy=cTop-2;round(cx,cy,80,40,7,'#b98d60');rect(cx-8,cy,95,7,'#806849');oval(cx+40,cy-6,10,5,'#806849');label('Copper cookware',cx+48,panelT+22,13,tier===0?'#f3e8cf':'#405842');}
   kettle(590,cTop+18);
   hotspots.cookware={x:422,y:cTop-14,w:110,h:70};
   {const hx=630,hy=cTop-8;round(hx,hy,40,50,6,'#9aaa87');for(let i=0;i<3;i++){c.strokeStyle='#816b4e';c.lineWidth=5;c.beginPath();c.moveTo(hx+10+i*10,hy+14);c.lineTo(hx+5+i*12,hy-24);c.stroke();oval(hx+5+i*12,hy-28,4,8,'#816b4e');}}
   if(tier>0){const px=246,py=cTop+34;round(px-14,py-18,28,20,3,'#b07f58');for(let i=-1;i<=1;i++){c.save();c.translate(px+i*7,py-18);c.rotate(i*.4+sway*.05);oval(0,-13,5,14,'#6f8f5a');c.restore();}}
   // warm light
   if(night){rect(-900,-offset,W+1800,height,'rgba(24,34,58,.24)');}
   for(const lx of [104,616]){const lg=c.createRadialGradient(lx,cTop,0,lx,cTop,220);lg.addColorStop(0,warm+(night?'.24)':'.14)'));lg.addColorStop(1,warm+'0)');c.fillStyle=lg;c.fillRect(lx-220,cTop-220,440,440);}
   const vg=c.createRadialGradient(360,BH*.48,BH*.28,360,BH*.48,BH*.95);vg.addColorStop(0,'rgba(58,38,20,0)');vg.addColorStop(1,'rgba(58,38,20,.2)');c.fillStyle=vg;c.fillRect(-900,-offset,W+1800,height);
   if(stocked||active)bubble(360,winT+34);
   root.CoveCafeScene.hotspots=hotspots;
  }
  // a small enamel-and-cord sign, like the one in a real shop door: it sways a hair and says nothing loudly
  {const word=s.open?'OPEN':s.pending?'FINISHING':'CLOSED',sx=inside?L.signX:498,sy=inside?L.signY:214,sw=58,sh=20,ang=reduced?0:Math.sin(now/1100)*.035;
   c.save();c.translate(sx,sy);c.strokeStyle='rgba(74,58,40,.7)';c.lineWidth=1;c.beginPath();c.moveTo(-14,-9);c.lineTo(0,-16);c.lineTo(14,-9);c.stroke();oval(0,-16,1.6,1.6,'#6a5238');
   c.rotate(ang);c.fillStyle='rgba(36,31,23,.16)';c.beginPath();c.roundRect(-sw/2+1.5,-9+2.5,sw,sh,5);c.fill();
   c.fillStyle='#f7efd9';c.strokeStyle=s.open?'#6f9a78':'#b9a884';c.lineWidth=1.4;c.beginPath();c.roundRect(-sw/2,-9,sw,sh,5);c.fill();c.stroke();
   c.fillStyle=s.open?'#3d6b4b':'#8b7660';c.font=(word.length>6?'bold 8px':'bold 10px')+' Georgia';c.textAlign='center';c.fillText(word.split('').join(word.length>6?'':'\u200a'),0,5);
   c.restore();}
  // Preparation stays at its equipment; the last three seconds are pickup/serving.
  const recipe=active?E.recipes.find(r=>r.id===s.pending.id):null;
  const food=recipe?.kind==='food',serving=active&&s.pending.at-now<=3000;
  const stationX=inside?(food?470:L.mx+38):(food?439:248);
  const stationY=inside?(food?L.cupY+8:L.my+66):(food?outsideY+82:outsideY+82);
  const equipmentAnchor=isFood=>({x:isFood?470:L.mx+66,y:L.panelT+32});
  root.CoveCafeScene.orderAnchor=inside&&active&&!serving?equipmentAnchor(food):{x:344,y:inside?L.panelT+32:229};
  root.CoveCafeScene.secondOrderAnchor=inside&&active&&!serving&&(s.pending.items||[]).length>1?equipmentAnchor(!food):null;
  if(active)for(const [itemIndex,itemId] of (s.pending.items||[s.pending.id]).entries()){
   const recipe=E.recipes.find(r=>r.id===itemId),food=recipe?.kind==='food';
   const stationX=inside?(food?470:L.mx+38):(food?439:248),stationY=inside?(food?L.cupY+8:L.my+66):outsideY+82;
   const p=Math.max(0,Math.min(1,1-(s.pending.at-now)/30000));
   const px=serving?((inside?344:360)+((s.pending.items||[]).length>1?(itemIndex?25:-25):0)):stationX,py=serving?(inside?L.cupY:outsideY+75):stationY;
   c.save();c.translate(px,py);if(!inside)c.scale(.45,.45);else if(!food&&!serving)c.scale(.72,.60);
   if(food){
    if(serving){round(-24,22,48,8,4,'#ece2c8');for(let i=0;i<3;i++){const x=(i-1)*14,y=16+(i%2)*4;oval(x,y,9,7,'#c48b4c');rect(x-4,y-3,2,2,'#a57646');}}
    else if(inside&&s.cookware){const dy=reduced?0:Math.sin(t/110)*1.3;round(-48,-4+dy,95,6,3,'#806849');oval(0,-9+dy,10,5,'#806849');}
    else{round(-32,8,64,15,5,'#927252');rect(30,10,26,5,'#705a42');for(let i=-1;i<=1;i++)oval(i*15,8+(reduced?0:Math.sin(t/220+i)*1.2),8,5,p>.6?'#c48b4c':'#dec49a');}
   }else{
    round(-15,0,30,34,4,'#faf2df');const level=serving?27:4+p*23,tea=recipe?.kind==='tea';
    round(-11,30-level,22,level,2,tea?'#97ae76':'#9b704d');oval(0,30-level,11,3,tea?'#c0d19a':'#d4ac79');
    c.strokeStyle='#faf2df';c.lineWidth=4;c.beginPath();c.arc(17,16,7,-1.5,1.5);c.stroke();
    if(!serving&&!reduced){c.strokeStyle=tea?'#b7c68d':'#b18859';c.lineWidth=2.5;c.beginPath();c.moveTo(0,-10);c.lineTo(0,29-level);c.stroke();}
   }
   if(!reduced){for(let i=0;i<3;i++){const phase=(t/1600+i/3)%1,x=(i-1)*10,y=-phase*30;c.globalAlpha=(1-phase)*.65;c.strokeStyle='#fff2d2';c.lineWidth=2;c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+7,y-7,x+2,y-14);c.stroke();}}
   c.restore();
  }
  if(depart>=0&&depart<.5&&s.lastCompleted&&s.lastCompleted.reaction)emote(inside?L.leadX+depart*330:382+depart*390,inside?L.faceY:344,s.lastCompleted.reaction.mood,depart/.5);
  if(!active&&depart>=0&&depart<1&&s.lastCompleted?.response){const response=s.lastCompleted.response,bx=inside?360:Math.max(150,Math.min(570,382+depart*390)),by=inside?L.winT+8:262+depart*14;round(bx-130,by,260,24,10,'#fff1d8');fitLabel(response.text,bx,by+17,236,12,'#496247');}
  c.restore();
 };
})(globalThis);
