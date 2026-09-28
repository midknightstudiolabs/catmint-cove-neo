(function(root){'use strict';
const plots=[{x:210,y:205,w:200,h:140},{x:540,y:205,w:200,h:140},{x:190,y:420,w:200,h:140},{x:560,y:420,w:200,h:140}];
function scene(c,{view,cottages,selected,t,a}){
 const box=(x,y,w,h,col,r=0)=>{c.fillStyle=col;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();},oval=(x,y,rx,ry,col)=>{c.fillStyle=col;c.beginPath();c.ellipse(x,y,rx,ry,0,0,7);c.fill();},text=(s,x,y,size=14,col='#34554a')=>{c.fillStyle=col;c.font=`${size}px Georgia`;c.textAlign='center';c.fillText(s,x,y);};
 function tree(x,y,k=1){oval(x+5,y+15,27*k,10*k,'#274a3822');box(x-4,y-28,8,37,'#9c8060');oval(x,y-35,26*k,24*k,'#588767');oval(x-12,y-47,17*k,17*k,'#75a078');oval(x+11,y-44,18*k,17*k,'#69956e');}
 function bed(x,y,level){box(x-4,y-4,66,90,'#8d7052',7);box(x,y,58,82,'#fff7e4',5);box(x+3,y+27,52,50,['#94ada0','#7c9ba9','#d8af75'][level],4);box(x+8,y+6,42,18,'#f7eed9',6);box(x-4,y+72,66,12,'#927658',3);}
 function guest(m,x,y,scale,pose='loafing'){a.cat?.(c,{...m,pose},x,y,scale,t);}
 box(0,0,960,640,'#8fc8ca');for(let i=0;i<12;i++){box(15+i*84,48+(i%3)*14,44,2,'#c6e9dd80',1);box(20+i*79,110+(i%2)*14,26,2,'#c6e9dd80',1);}
 oval(480,450,475,380,'#e9d6a8');oval(480,458,435,335,'#b3c899');
 if(view==='inside'){
  const cot=cottages[selected],z=root.CoveResortEngine.stats(cot);
  box(96,70,768,496,'#735f48',16);box(108,82,744,472,'#e7dcc1',8);box(115,165,730,380,'#b9956e');
  for(let y=170;y<540;y+=25)box(115,y,730,2,'#ac865f');for(let x=140;x<840;x+=95)box(x,165,1,380,'#ac865f');
  // open-front cutaway, with sea-facing windows and separate bedroom / sitting room
  box(138,95,214,55,'#759f9a',5);box(145,101,200,43,'#b4dde1');box(242,101,5,43,'#f5ecd6');
  box(575,95,230,55,'#759f9a',5);box(582,101,216,43,'#b4dde1');box(687,101,5,43,'#f5ecd6');
  box(455,165,10,270,'#e5d8b8');box(455,495,10,50,'#e5d8b8');oval(300,367,130,95,'#d6dfbf');oval(300,367,112,80,'#bacba5');
  bed(185,247,cot.bed);if(z.capacity>1)bed(332,247,cot.bed);
  box(585,232,190,64,'#6d9480',15);box(593,238,81,50,'#98b09a',10);box(683,238,81,50,'#98b09a',10);
  oval(678,377,76,46,'#8d7254');oval(678,371,76,46,'#ead4a6');oval(660,365,12,8,'#fff5dc');oval(706,377,12,8,'#fff5dc');
  tree(805,475,.8);box(140,465,100,40,'#93795c',5);box(147,470,86,30,'#d9c399',4);if(cot.stage>0){oval(390,192,25,25,'#e7c270');text('☀',390,200,24);}
  text('BEDROOM',285,205,13,'#66543f');text('A PLACE TO DO NOTHING',680,205,13,'#66543f');
  if(cot.guest)cot.guest.party.members.forEach((m,i)=>guest(m,i?365:218,320,1.1,'sleeping'));
  text(root.CoveResortEngine.STAGES[cot.stage].name,480,605,24);return;
 }
 // reception, winding paths, landscaped edges and room for future expansion
 box(439,145,82,480,'#e5d2ad',35);box(225,341,505,48,'#e5d2ad',22);box(267,538,417,38,'#e5d2ad',19);
 for(let i=0;i<17;i++)box(468,180+i*26,23,12,'#f2e3c7',4);
 box(385,128,190,57,'#98795a',8);box(396,130,168,40,'#f0e5cc',3);text('COVE RESORT',480,154,20);box(393,175,8,20,'#98795a');box(559,175,8,20,'#98795a');
 for(let i=0;i<4;i++){
  const p=plots[i],cot=cottages[i],built=cot.built;oval(p.x+p.w/2,p.y+p.h-2,108,17,'#345b3526');c.save();c.globalAlpha=built?1:.6;
  box(p.x,p.y+40,p.w,p.h-40,built?'#f2e6c7':'#c8c9b0',9);box(p.x+8,p.y+46,p.w-16,8,'#dbcda9');
  c.fillStyle=built?['#789684','#7694a2','#be8d5c'][cot.stage]:'#929d89';c.beginPath();c.moveTo(p.x-12,p.y+46);c.lineTo(p.x+p.w/2,p.y-12);c.lineTo(p.x+p.w+12,p.y+46);c.closePath();c.fill();
  box(p.x+20,p.y+66,40,34,'#759997',3);box(p.x+23,p.y+69,34,28,'#c8e4da');box(p.x+36,p.y+69,3,28,'#f7edd8');
  box(p.x+140,p.y+66,40,34,'#759997',3);box(p.x+143,p.y+69,34,28,'#c8e4da');box(p.x+156,p.y+69,3,28,'#f7edd8');box(p.x+84,p.y+74,33,66,'#9b8060',6);box(p.x+80,p.y+130,44,12,'#d3b58c',2);
  if(cot.stage>0){box(p.x+12,p.y+106,52,10,'#a68b61',3);for(let j=0;j<5;j++)oval(p.x+18+j*9,p.y+100,5,6,'#c88371');}
  if(cot.stage>1){box(p.x+141,p.y+112,40,8,'#d7ba74',3);tree(p.x-15,p.y+128,.45);}
  c.restore();text(built?'Cottage '+(i+1):i===0?'Open your first cottage':'Cottage '+(i+1)+' · available',p.x+100,p.y+160,13);
  if(built&&cot.guest){const phase=((t/1000+i*7)%24)/24,walker=cot.guest.party.members[0];guest(walker,p.x+105+Math.sin(phase*6.28)*45,p.y+153,.48,'exploring');}
 }
 for(const [x,y] of [[95,260],[140,370],[95,510],[810,270],[845,400],[830,560],[335,600],[610,612],[310,170],[665,166]])tree(x,y,.8);
 for(let i=0;i<35;i++){const x=100+(i*127)%760,y=205+(i*71)%410;if(plots.some(p=>x>p.x-15&&x<p.x+215&&y>p.y-15&&y<p.y+165)||Math.abs(x-480)<45)continue;oval(x,y,3,5,'#759b6e');oval(x+7,y+3,3,5,'#87a97d');}
 text('THE SHORE PATH',480,626,12);text('Hotel & pool · future expansion',777,101,13,'#375e5e');
}
scene.slots=plots;root.CoveResortScene=scene;
})(globalThis);
