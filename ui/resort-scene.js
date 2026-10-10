(function(root){'use strict';
const plots=root.CoveResortLandscape.slots;
function scene(c,{view,cottages,selected,amenities={},businesses={},t,a}){
 if(view!=='inside')return root.CoveResortLandscape(c,{cottages,selected,amenities,businesses,t,a});
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
  const beds=Array.from({length:z.capacity},(_,j)=>({x:150+(j%3)*92,y:235+Math.floor(j/3)*110}));
  beds.forEach(p=>bed(p.x,p.y,cot.bed));
  box(585,232,190,64,'#6d9480',15);box(593,238,81,50,'#98b09a',10);box(683,238,81,50,'#98b09a',10);
  oval(678,377,76,46,'#8d7254');oval(678,371,76,46,'#ead4a6');oval(660,365,12,8,'#fff5dc');oval(706,377,12,8,'#fff5dc');
  tree(805,475,.8);box(140,465,100,40,'#93795c',5);box(147,470,86,30,'#d9c399',4);if(cot.stage>0){oval(390,192,25,25,'#e7c270');text('☀',390,200,24);}
  text('BEDROOM',285,205,13,'#66543f');text('A PLACE TO DO NOTHING',680,205,13,'#66543f');
  if(cot.guest){const sleeping=root.CoveResortLandscape.resting(cot,Date.now());
   if(sleeping)cot.guest.party.members.forEach((m,i)=>{const p=beds[i];if(!p)return;guest(m,p.x+29,p.y+57,.62,'sleeping');text('z z z',p.x+30,p.y+18-Math.sin(t/900+i)*3,12);});
   const settling=root.CoveResortLandscape.settling(cot,Date.now());
   if(!sleeping&&settling)cot.guest.party.members.forEach((m,i)=>{const seats=[[620,282],[724,282],[561,369],[788,369],[677,424]];const p=seats[i];if(p)guest(m,p[0],p[1],.55,'loafing');});
   text(sleeping?'Guests are resting · sweet dreams':settling?'Settling in · a little time to unwind':'Guests are out enjoying the resort',680,466,18);
  }else text('Ready for the next guests',680,466,18);
  text(root.CoveResortEngine.STAGES[cot.stage].name,480,605,24);return;
 }


}
scene.slots=plots;root.CoveResortScene=scene;
})(globalThis);
