/* Original Catmint Cove resort environment. Coordinates are shared with plot hit targets. */
(function(root){'use strict';
const positions=[[177,146],[291,165],[143,247],[268,272],[161,351],[285,373],[204,446],[322,466],[633,139],[730,171],[637,250],[751,283],[610,356],[733,389],[590,458],[701,475]];
const slots=positions.map(([x,y],i)=>({x:x-45,y:y-41,w:94,h:82,name:(i<4?'Palm Grove':i<8?'Sunset Gardens':i<12?'Lagoon Walk':'Coral Beach')+' '+(i%4+1)}));
let cache,key='';
// Shared pedestrian paths: guests choose destinations, follow the path network and rest on arrival.
const walks=new WeakMap(),nodes=[],links=[];
function node(x,y){let i=nodes.findIndex(p=>Math.hypot(p.x-x,p.y-y)<3);if(i<0){i=nodes.length;nodes.push({x,y});links.push([]);}return i;}
function road(points){let previous=null;for(const [x,y]of points){const n=node(x,y);if(previous!==null){links[n].push(previous);links[previous].push(n);}previous=n;}}
road([[471,117],[467,160],[469,209],[462,250],[448,278],[440,299],[445,314],[444,344],[453,375],[459,400],[459,425],[459,455],[460,481],[430,490],[426,535],[445,564],[475,575]]);
road([[160,194],[210,194],[260,204],[324,210],[370,208],[420,209],[469,209]]);
road([[126,297],[191,300],[230,307],[273,317],[330,324],[390,318],[445,314]]);
road([[151,399],[206,400],[241,415],[280,420],[350,425],[405,425],[459,425]]);
road([[200,490],[255,502],[315,513],[355,515],[394,508],[430,490]]);
road([[469,209],[479,228],[525,239],[575,235],[620,194],[670,198],[720,213],[777,219]]);
road([[445,314],[472,296],[484,265],[512,251],[550,254],[578,281],[607,308],[665,313],[730,332],[795,334]]);
road([[459,425],[515,418],[566,409],[620,413],[680,422],[736,435],[785,435]]);
road([[475,575],[525,560],[557,532],[576,507],[625,517],[685,522],[748,527]]);
const destinations=nodes.map((_,i)=>i).filter(i=>links[i].length===1);
function route(from,to){const queue=[from],parent=new Map([[from,null]]);for(let k=0;k<queue.length&&!parent.has(to);k++)for(const next of links[queue[k]])if(!parent.has(next)){parent.set(next,queue[k]);queue.push(next);}const result=[];for(let n=to;n!==null&&n!==undefined;n=parent.get(n))result.unshift(n);return result.slice(1);}
function wander(m,t){let w=walks.get(m);if(!w){const seed=Math.abs(m.markSeed||1);const n=seed%nodes.length;w={...nodes[n],at:n,route:[],pause:0,last:t,seed,face:1};walks.set(m,w);}const dt=Math.max(0,Math.min(.08,(t-w.last)/1000));w.last=t;
const random=()=>{w.seed=(Math.imul(w.seed,1664525)+1013904223)>>>0;return w.seed/4294967296;};
if(w.pause>0){w.pause-=dt;return {...w,moving:false};}
if(!w.route.length){const options=destinations.filter(n=>n!==w.at&&n!==w.previous);const to=options[Math.floor(random()*options.length)];w.previous=w.at;w.route=route(w.at,to);w.speed=12+random()*7;}
let distance=dt*w.speed;while(w.route.length&&distance>0){const n=w.route[0],p=nodes[n],dx=p.x-w.x,dy=p.y-w.y,d=Math.hypot(dx,dy);if(Math.abs(dx)>.1)w.face=dx<0?-1:1;if(d<=distance){w.x=p.x;w.y=p.y;w.at=n;w.route.shift();distance-=d;if(!w.route.length)w.pause=7+random()*17;}else{w.x+=dx/d*distance;w.y+=dy/d*distance;distance=0;}}
return {...w,moving:w.pause<=0};}
function landscape(c,{cottages,selected,amenities={},businesses={},t,a}){
const stateKey=JSON.stringify([cottages.map(x=>[x.built,x.stage,x.bed,x.kind,x.style]),amenities,Object.entries(businesses).map(([id,b])=>[id,b.level,b.job?.end])]);
if(!cache||key!==stateKey){cache=document.createElement('canvas');cache.width=1920;cache.height=1280;const g=cache.getContext('2d');g.scale(2,2);paint(g,cottages,amenities,businesses);key=stateKey;}
c.drawImage(cache,0,0,960,640);
a.cat?.(c,{coatKey:'midknight',mascot:true,markSeed:777,age:'adult',pose:'loafing'},477,554,.4,t);
// Jobs occupy fixed lots; only the progress fill changes each frame.
for(let i=0;i<cottages.length;i++){const j=cottages[i].job;if(!j)continue;const [x,y]=positions[i];c.fillStyle='#f2e3b9dd';c.fillRect(x-40,y-28,80,63);c.strokeStyle='#967147';c.lineWidth=2;for(let k=0;k<4;k++){c.beginPath();c.moveTo(x-38+k*25,y-35);c.lineTo(x-38+k*25,y+37);c.stroke();}c.fillStyle='#365c50';c.fillRect(x-40,y+31,80,12);c.fillStyle='#dbb65c';c.fillRect(x-38,y+33,76*Math.max(0,Math.min(1,(Date.now()-j.start)/(j.end-j.start))),8);c.font='bold 8px sans-serif';c.textAlign='center';c.fillStyle='#365c50';c.fillText('RENOVATING',x,y+9);}
for(const b of root.CoveResortEngine.BUSINESSES){const v=businesses[b.id];if(!v)continue;const {x,y}=b;if(v.job){c.fillStyle='#294d43';c.fillRect(x-27,y+26,54,8);c.fillStyle='#e6be64';c.fillRect(x-26,y+27,52*Math.max(0,Math.min(1,(Date.now()-v.job.start)/(v.job.end-v.job.start))),6);}else if(b.id==='kayak'){for(let k=0;k<2;k++){const yy=y+18+Math.sin(t/1500+k)*4;c.fillStyle=k?'#d39b63':'#e9d5a1';c.beginPath();c.ellipse(x+16+k*16,yy,5,17,.3,0,7);c.fill();c.strokeStyle='#6a6550';c.beginPath();c.moveTo(x+9+k*16,yy-8);c.lineTo(x+23+k*16,yy+8);c.stroke();}}else if(b.id!=='juice'){c.strokeStyle='#ffffff77';for(let k=0;k<3;k++){c.beginPath();c.moveTo(x+k*5-5,y-22);c.quadraticCurveTo(x+k*5+Math.sin(t/650+k)*3,y-28,x+k*5-5,y-33);c.stroke();}}}
// Soft cloud shadows drift across the sea; pool highlights stay inside the water.
c.save();c.globalAlpha=.10;c.fillStyle='#fff';for(let i=0;i<3;i++){const x=(t*.002+i*330)%1100-60;c.beginPath();c.ellipse(x,48+i*6,46,10,0,0,7);c.fill();}c.restore();
if(amenities.pool){c.save();c.beginPath();c.roundRect(506,286,64,80,16);c.clip();c.strokeStyle='#ddffed55';for(let k=0;k<8;k++){c.beginPath();c.ellipse(536+Math.sin(t/1500+k)*4,290+k*11,29,2,0,0,Math.PI);c.stroke();}c.restore();}
// Moving water is restricted to the open sea, never painted over the island.
c.save();c.strokeStyle='#d4f4e760';c.lineWidth=.8;for(let i=0;i<24;i++){const x=(i*127+t*.003)%960,y=i%2?610+i%3*8:24+i%3*12;c.beginPath();c.ellipse(x,y,10+i%4*4,2,0,0,Math.PI);c.stroke();}c.restore();
const p=slots[selected];if(p){c.save();c.strokeStyle='#fff1b6';c.lineWidth=2;c.setLineDash([5,3]);c.beginPath();c.roundRect(p.x-3,p.y+3,p.w+6,p.h-1,8);c.stroke();c.restore();}
// Activities use booked guests; no extra cats are added to the player's roster.
const visitors=cottages.flatMap((cot,plot)=>!cot.built||cot.job?[]:(cot.guest?.party?.members||[]).map(m=>({cot,plot,m})));
for(let i=0;i<visitors.length;i++){
const {cot,plot,m}=visitors[i];if(!cot.built||cot.job||!cot.guest?.party?.members?.length)continue;
const phase=(t/26000+i*.173)%1,forward=phase<.5,u=forward?phase*2:(1-phase)*2;
if(i<18&&i%6===5&&businesses.kayak?.level&&!businesses.kayak.job){const x=871+Math.sin(t/11000+i)*18,y=463+u*61;c.save();c.fillStyle='#efd49d';c.beginPath();c.ellipse(x,y,7,19,.12,0,7);c.fill();a.cat?.(c,{...m,pose:'loafing'},x,y+3,.28,t);c.strokeStyle='#755f41';c.lineWidth=2;c.beginPath();c.moveTo(x-12,y-7+Math.sin(t/550)*3);c.lineTo(x+12,y+7);c.stroke();c.restore();continue;}
if(i<18&&i%6===4){const shop=root.CoveResortEngine.BUSINESSES.filter(b=>b.id!=='kayak'&&businesses[b.id]?.level&&!businesses[b.id].job)[Math.floor(i/6)%3];if(shop){a.cat?.(c,{...m,pose:'loafing'},shop.x+12,shop.y+24,.32,t);continue;}}

if(i<16&&i%4===1&&amenities.pool){const x=523+(Math.floor(i/4)%2)*25,y=302+u*45;
c.save();c.beginPath();c.roundRect(506,286,64,80,16);c.clip();
c.strokeStyle='#e1f8e9aa';c.lineWidth=.9;for(let k=0;k<3;k++){c.beginPath();c.ellipse(x,y+3+k*3,6+k*3+Math.sin(t/450+i)*.8,1.8+k*.5,0,0,Math.PI*2);c.stroke();}
c.save();c.beginPath();c.rect(506,286,64,Math.max(0,y+1-286));c.clip();a.cat?.(c,{...m,pose:'loafing',face:forward?1:-1},x,y+11+Math.sin(t/550+i)*.6,.36,t);c.restore();c.fillStyle='#bde8da66';c.fillRect(x-5,y,10,1);c.restore();continue;}
if(i<16&&i%4===2&&amenities.garden){a.cat?.(c,{...m,pose:'sleeping'},380+(Math.floor(i/4)%2)*18,378+Math.floor(i/8)*31,.32,t);continue;}
if(i<16&&i%4===3&&amenities.cafe){a.cat?.(c,{...m,pose:'loafing'},502+(Math.floor(i/4)%4)*23,213,.32,t);continue;}
const q=wander(m,t);a.cat?.(c,{...m,pose:q.moving?'exploring':'loafing',trotting:false,face:q.face},q.x,q.y+2,.34,t);
}

}
function paint(c,cottages,A,B){
const rand=n=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v);};
const path=(d,col,stroke,width=1)=>{const p=new Path2D(d);if(col){c.fillStyle=col;c.fill(p);}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke(p);}return p;};
const oval=(x,y,rx,ry,col)=>{c.fillStyle=col;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();};
const box=(x,y,w,h,col,r=0)=>{c.fillStyle=col;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();};
const line=(x,y,X,Y,col,w=1)=>{c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.moveTo(x,y);c.lineTo(X,Y);c.stroke();};
function grad(x,y,X,Y,stops){let g=c.createLinearGradient(x,y,X,Y);for(const [v,col]of stops)g.addColorStop(v,col);return g;}
const ocean=grad(0,0,960,640,[[0,'#397f96'],[.45,'#5eafb0'],[1,'#83c8bc']]);box(0,0,960,640,ocean);
for(let i=0;i<320;i++){let x=rand(i)*960,y=rand(i+1000)*640;oval(x,y,rand(i+80)*27+4,1,'#daf6d911');}
const shore='M 110 130 C 149 69 245 63 312 79 C 380 92 405 57 486 62 C 576 65 617 69 681 82 C 771 91 849 130 852 201 C 863 267 831 303 854 364 C 888 446 846 487 802 518 C 738 559 699 529 633 553 C 559 589 515 565 455 583 C 379 596 352 558 281 562 C 217 562 138 531 107 479 C 76 431 118 378 91 329 C 62 274 92 239 87 197 C 81 172 97 150 110 130 Z';
c.save();c.translate(480,330);c.scale(1.07,1.10);c.translate(-480,-330);path(shore,'#a2d5c5');c.restore();
c.save();c.translate(480,330);c.scale(1.025,1.035);c.translate(-480,-330);path(shore,'#d3e5c5');c.restore();path(shore,'#efe0b6','#f7ecd0',3);
c.save();c.clip(new Path2D(shore));for(let i=0;i<2000;i++){let x=rand(i)*960,y=rand(i+770)*640;oval(x,y,.3+rand(i+14)*1.3,.5,i%2?'#a58f5120':'#fff9dd55');}c.restore();
c.save();c.translate(480,325);c.scale(.91,.89);c.translate(-480,-325);const land=path(shore,grad(100,100,700,570,[[0,'#a9c38b'],[.45,'#c0cf96'],[1,'#a1ba80']]));c.clip(land);for(let i=0;i<2700;i++){const x=rand(i)*960,y=rand(i+60)*640;oval(x,y,1+rand(i+30)*3,rand(i+21)+.3,i%3?'#688b5030':'#e5e6ad55');}c.restore();
// Paint the exact same network the guests walk, with all joins filled in one pass.
const roadShape=new Path2D();for(let i=0;i<nodes.length;i++)for(const j of links[i])if(j>i){roadShape.moveTo(nodes[i].x,nodes[i].y);roadShape.lineTo(nodes[j].x,nodes[j].y);}
c.lineCap='round';c.lineJoin='round';
for(const [width,color] of [[19,'#657c4730'],[16,'#baaa80'],[13,'#e0cfaa'],[9,'#eadbb8']]){c.lineWidth=width;c.strokeStyle=color;c.stroke(roadShape);}
// Small irregular paving seams replace the thick double-edged road appearance.
for(let i=0;i<nodes.length;i++)for(const j of links[i])if(j>i){const a=nodes[i],b=nodes[j],dx=b.x-a.x,dy=b.y-a.y,length=Math.hypot(dx,dy);for(let d=8;d<length;d+=12){const x=a.x+dx*d/length,y=a.y+dy*d/length;line(x-dy/length*4,y+dx/length*4,x+dy/length*4,y-dx/length*4,'#aa99732b',.65);}}
function roadDistance(x,y){let closest=Infinity;for(let i=0;i<nodes.length;i++)for(const j of links[i])if(j>i){const a=nodes[i],b=nodes[j],dx=b.x-a.x,dy=b.y-a.y,u=Math.max(0,Math.min(1,((x-a.x)*dx+(y-a.y)*dy)/(dx*dx+dy*dy)));closest=Math.min(closest,Math.hypot(x-a.x-u*dx,y-a.y-u*dy));}return closest;}
// Short cottage entry paths, tucked under the front verandas.
positions.forEach(([x,y],i)=>{if(!cottages[i]?.built)return;const door={x:x+12,y:y+29},n=nodes.filter(p=>p.y>=door.y).sort((a,b)=>Math.hypot(a.x-door.x,a.y-door.y)-Math.hypot(b.x-door.x,b.y-door.y))[0];if(n&&Math.hypot(n.x-door.x,n.y-door.y)<85){path('M '+door.x+' '+door.y+' L '+n.x+' '+n.y,null,'#d8c49e',6);}});
function bush(x,y,s=1){oval(x+3,y+3,15*s,8*s,'#3a624c22');for(let k=0;k<7;k++)oval(x+Math.cos(k)*9*s,y+Math.sin(k)*4*s,7*s,5*s,['#5f885c','#749960','#8da66b'][k%3]);}
function palm(x,y,s=1,flip=1){c.save();c.translate(x,y);c.scale(s*flip,s);oval(12,8,31,8,'#325e4530');path('M 0 0 Q 11 -23 3 -56',null,'#816d4c',6);path('M -1 0 Q 9 -25 1 -56',null,'#c0a477',2);for(let k=0;k<7;k++){const a=k*Math.PI*2/7,dx=Math.cos(a)*36,dy=Math.sin(a)*15;path('M 3 -55 Q '+(dx*.65)+' '+(-75+dy)+' '+dx+' '+(-50+dy)+' Q '+(dx*.4)+' '+(-61+dy)+' 3 -55',['#3f7356','#53855b','#78a168'][k%3]);line(3,-55,dx,-50+dy,'#b1be7740',.7);}oval(3,-52,3,4,'#8d734c');c.restore();}
function rock(x,y,s=1){path('M '+(x-9*s)+' '+y+' l '+3*s+' '+(-7*s)+' l '+10*s+' '+(-2*s)+' l '+7*s+' '+8*s+' l '+(-5*s)+' '+5*s+' Z','#919f8a');line(x-4*s,y-6*s,x+5*s,y-7*s,'#d4d4b6',2);}
function deck(x,y,w,h){box(x+2,y+4,w,h,'#655d3c28',2);box(x,y,w,h,'#ae8d61',2);for(let yy=y+3;yy<y+h;yy+=4)line(x+1,yy,x+w-1,yy,'#d8bc8b',.7);}
function lounger(x,y){box(x+2,y+3,11,22,'#6b6d4822',2);box(x,y,10,22,'#f7eccc',2);box(x+1,y+2,8,7,'#94af9e',1);line(x+2,y+12,x+8,y+12,'#d4c9a9');}
function umbrella(x,y){oval(x+5,y+10,17,7,'#244d4822');line(x,y,x,y+14,'#887858',2);for(let k=0;k<8;k++){c.fillStyle=k%2?'#e8d6b0':'#81a9a0';c.beginPath();c.moveTo(x,y-4);c.ellipse(x,y-4,15,10,0,k*Math.PI/4,(k+1)*Math.PI/4);c.closePath();c.fill();}oval(x,y-5,2,2,'#f4e6c4');}
function house(x,y,stage,variant=0,scale=1,kind="cottage",style){c.save();c.translate(x,y);c.scale(scale,scale);const wide=kind==="lodge"?46:stage===2?48:39;if(kind==="villa"){deck(-48,8,110,34);box(27,12,30,23,"#e9dfc0",3);box(30,15,24,17,"#68b6be",3);}if(kind==="lodge"){path("M -46 5 l 83 11 l 0 35 l -83 -11 Z","#ddd0ae");path("M 37 16 l 22 -14 l 0 35 l -22 14 Z","#b5a47f");for(let q=0;q<3;q++)box(-36+q*24,26+q*3,13,12,"#759b95",1);c.translate(0,-13);}oval(8,27,wide+13,12,'#3d503c27');deck(-wide-5,18,wide*2+15,18);path('M '+(-wide)+' -6 L '+(wide-9)+' 5 L '+(wide-9)+' 28 L '+(-wide)+' 17 Z','#eee0bd','#b3a07b',.7);path('M '+(wide-9)+' 5 L '+(wide+13)+' -9 L '+(wide+13)+' 14 L '+(wide-9)+' 28 Z','#c3b290');
for(let yy=0;yy<18;yy+=5)line(-wide+2,yy-1,wide-10,yy+10,'#c5b58c55',.5);
const roof=style==='ocean'?['#6d99af','#456978']:style==='terracotta'?['#c08668','#945f4b']:style==='sage'?['#77967d','#4f705a']:stage===0?['#ad9270','#867459']:stage===1?['#638878','#42695d']:['#92756a','#69574f'];
path('M '+(-wide-8)+' -8 L -10 -34 L '+(wide+19)+' -14 L '+(wide-7)+' 10 Z',roof[0],'#4b59494d',1);path('M -10 -34 L 13 -44 L '+(wide+19)+' -14 Z',roof[1]);
for(let k=0;k<7;k++){const u=k/7;line(-wide-3+(wide-7)*u,-7-25*u,wide-7-(wide+2)*u,7-34*u,'#ffffff22',.9);}line(-10,-34,13,-44,'#cfceab70',1.3);
for(let dx=-wide+10;dx<wide-15;dx+=25){path('M '+dx+' 0 l 13 2 l 0 12 l -13 -2 Z','#587a77','#e8dabb',1.8);line(dx+6,2,dx+6,11,'#b7d2c4',.8);}
path('M '+(wide-27)+' 9 l 13 2 l 0 16 l -13 -2 Z','#766347');oval(wide-16,18,1,1,'#e4c375');
for(const dx of [-wide+1,wide+4]){line(dx,11,dx,34,'#8d7451',2);line(dx+1,11,dx+1,33,'#e0c89a',.7);}line(-wide,28,wide+4,40,'#d4bc8e',2);
if(stage>0){box(-wide-4,26,19,5,'#8a7953',1);for(let k=0;k<5;k++){oval(-wide+k*3,24,4,3,'#69945b');oval(-wide+k*3,22,1.5,1.5,k%2?'#e5bca2':'#c9937d');}lounger(wide-15,28);}
if(stage>1){deck(-wide-6,-17,23,22);path('M '+(-wide-9)+' -19 l 22 -9 l 17 10 l -22 9 Z',roof[0]);for(let k=0;k<4;k++)line(-wide-5+k*7,-20,-wide+11+k*3,-11,'#dac2a566',1);}
c.restore();}
// Layered garden beds give each property its own soft edge without covering paths.
positions.forEach(([x,y],i)=>{if(!cottages[i]?.built)return;oval(x+3,y+15,49,27,'#77975a18');for(let k=0;k<6;k++){const xx=x-36+k*13,yy=y+34+Math.sin(k)*3;if(roadDistance(xx,yy)<12)continue;oval(xx,yy,5,3,'#739363');for(let f=0;f<3;f++)oval(xx-3+f*3,yy-2,1.3,1.3,['#f4d4ac','#e3a89c','#f0e5b9'][i%3]);}});
// Warm path lamps are placed beside junctions, never in the walking lane.
for(const [x,y]of [[451,225],[426,315],[441,425],[410,487],[612,220],[767,345],[761,446]]){oval(x+3,y+3,7,2,'#304f3825');line(x,y,x,y-14,'#756449',1.7);box(x-3,y-18,6,6,'#e5c585',1);box(x-2,y-17,4,4,'#fff0b9',1);path('M '+(x-4)+' '+(y-18)+' l 4 -3 l 4 3 Z','#526c53');}
// Pools and public gardens form the centre, rather than occupying leftover margins.
if(A.pool){deck(490,272,96,116);box(500,280,76,92,'#eee5cc',20);box(506,286,64,80,grad(506,286,570,366,[[0,'#3d9dba'],[1,'#86d1ca']]),16);for(let k=0;k<16;k++){let yy=291+k*4;line(514,yy,560,yy+2,k%2?'#d6f3dd55':'#399cab22',.7);}line(507,306,515,306,'#f0e9d4',2);line(507,315,515,315,'#f0e9d4',2);for(let k=0;k<3;k++){lounger(581,286+k*30);umbrella(600,284+k*30);}bush(503,382,.7);bush(567,382,.8);}else{oval(540,329,49,56,'#a1b97b');bush(524,309);bush(564,347);label('POOL GARDEN',540,330,true);}
if(A.garden){oval(390,393,39,48,'#7f9e6b');oval(390,393,31,39,'#d9c79e');oval(390,393,24,31,'#9eb77d');for(let k=0;k<12;k++){let ang=k*.53;oval(390+Math.cos(ang)*28,393+Math.sin(ang)*35,4,3,k%2?'#dcb3a1':'#f0d899');}box(379,389,23,7,'#9b7f59',2);line(381,396,381,402,'#715e45',2);line(399,396,399,402,'#715e45',2);}else bush(390,393,1.8);
if(A.cafe){
// Catmint Café: an open-front coffee shop, with the café game's sage machine and warm timber counter.
deck(486,145,101,77);
box(490,126,89,62,'#d9c49a',3);box(579,131,7,58,'#aa946c',1);
box(496,139,77,38,'#354f45',1);
// Back shelves, cups, jars and espresso machine remain visible through the service opening.
for(let row=0;row<2;row++){box(500,147+row*12,37,2,'#bfa578');for(let k=0;k<5;k++){box(502+k*7,141+row*12,4,6,k%2?'#f3e7c9':'#a9bd91',1);}}
box(544,150,22,20,'#809985',2);box(547,154,16,4,'#314a40',1);box(548,160,14,7,'#314a40');oval(560,154,1.5,1.5,'#edce82');box(546,168,19,2,'#b5b9a4');
// Broad striped awning and a slim fascia replace the cottage's pitched roof.
box(486,118,96,14,'#355b49',2);c.fillStyle='#fff0cd';c.textAlign='center';c.font='bold 8px Georgia';c.fillText('CATMINT CAFÉ',534,128);
path('M 490 132 L 579 132 L 586 146 L 484 146 Z','#e8dfbf');
for(let k=0;k<7;k++){const x=490+k*13;path('M '+x+' 132 l 7 0 l 1 14 l -8 0 Z','#78977b');}
box(484,146,102,4,'#658469',1);line(489,147,489,184,'#d7c198',2);line(580,147,580,184,'#d7c198',2);
box(495,173,80,14,'#b28b5c',1);for(let x=500;x<575;x+=8)line(x,177,x,185,'#977449',.6);box(492,171,86,4,'#eee0bb',1);
// Pastry display and take-away cups on the serving ledge.
box(501,162,22,10,'#9fbcb177',1);line(501,162,523,162,'#e5edd6',1);for(let k=0;k<3;k++)oval(505+k*7,169,2.6,1.8,'#d2a367');
for(const x of [534,539]){box(x,167,3,4,'#fff3d8',1);oval(x+1.5,167,1.5,.6,'#75583e');}
// Patio seating positions match the existing seated guest anchors.
for(let k=0;k<4;k++){const x=502+k*23;oval(x,203,8,5,'#806b4e');oval(x,201,8,5,'#f5deb5');oval(x,214,4,3,'#799278');box(x-1,196,3,4,'#fff6df',1);}
box(474,178,12,18,'#755e42',1);box(476,180,8,12,'#345345',1);c.fillStyle='#eee4c1';c.font='4px sans-serif';c.fillText('COFFEE',480,185);c.fillText('& CAKE',480,190);
bush(586,190,.45);box(581,194,10,7,'#aa7c59',2);label('CATMINT CAFÉ',535,232);
}else{bush(513,168,1.4);bush(548,178,1.2);label('CAFÉ TERRACE',531,208,true);}
// Mark ownership with survey stakes, leaving undeveloped land alive.
positions.forEach(([x,y],i)=>{const cot=cottages[i];if(cot?.built){house(x,y,cot.stage,i,.72,cot.kind,cot.style);bush(x-42,y+22,.55);bush(x+48,y+4,.7);label(String(i+1).padStart(2,'0'),x,y+58);}else{for(const [dx,dy]of[[-34,-14],[36,-3],[-34,25],[36,35]]){line(x+dx,y+dy,x+dx,y+dy-6,'#9e8961',1.5);oval(x+dx,y+dy-6,2,1,'#f6e8c7');}bush(x-15,y+4,.55);bush(x+21,y-8,.7);box(x-11,y+15,23,16,'#f5e8c4',2);line(x,y+30,x,y+36,'#9c8058',2);c.fillStyle='#637758';c.font='bold 9px sans-serif';c.textAlign='center';c.fillText(String(i+1).padStart(2,'0'),x,y+26);}});
for(const b of root.CoveResortEngine.BUSINESSES){const v=B[b.id];if(!v)continue;const {x,y}=b;deck(x-29,y-9,58,36);if(b.id==='restaurant'){house(x,y-8,2,0,.57);for(let k=0;k<3;k++){oval(x-20+k*20,y+21,7,4,'#efd9ab');oval(x-20+k*20,y+28,3,2,'#7a956d');}label('MOONLIT DINING',x,y+44);continue;}if(b.id==='kayak'){line(x-25,y-6,x+27,y-6,'#eee0b9',3);label('KAYAK JETTY',x,y+45);continue;}box(x-23,y-23,46,35,'#ecd9ad',2);box(x-27,y-29,54,12,'#8caa93',2);for(let k=0;k<6;k++)box(x-27+k*9,y-29,5,12,b.id==='juice'?'#edbc75':b.id==='bakery'?'#dca18a':'#d6d8b2');box(x-20,y-13,40,12,'#4a7568',2);box(x-27,y+2,54,8,'#bb9260',2);for(let k=0;k<(v.level||1)+1;k++)oval(x-17+k*12,y,3,3,b.id==='juice'?'#e5b44e':'#e7c591');if((v.level||0)>1){umbrella(x+24,y+19);oval(x+20,y+25,10,5,'#f2ddad');}label(b.name.toUpperCase(),x,y+44);}
for(let i=0;i<130;i++){const x=125+rand(i+6100)*670,y=105+rand(i+7200)*410;if(roadDistance(x,y)<17||positions.some(([px,py])=>Math.abs(x-px)<56&&Math.abs(y-py)<49)||x>345&&x<605)continue;oval(x,y,5,2,'#79935b36');for(let k=0;k<3;k++){line(x+k*2,y,x+k*2-1,y-4,'#728f59',.7);oval(x+k*2-1,y-5,1,1,['#f5dfad','#d9afba','#e9ecc9'][i%3]);}}
// Structured planting: keep mature trees clear of buildings and routes.
for(const [x,y,s]of [[109,167,.85],[99,267,.8],[120,410,.85],[161,488,.7],[254,526,.75],[352,548,.7],[590,548,.7],[762,508,.7],[828,429,.8],[825,283,.85],[792,139,.8],[676,94,.8],[555,92,.65],[386,103,.75],[249,91,.7]])palm(x,y,s,x%2?1:-1);
for(const [x,y]of [[343,139],[206,237],[314,336],[225,430],[596,217],[709,330],[663,450],[398,258],[803,361]]){bush(x,y,1.1);bush(x+13,y+5,.7);}
for(let i=0;i<25;i++){const x=130+i*28,y=560+Math.sin(i*.7)*12;if(x>411&&x<526)continue;rock(x,y,.4+rand(i)*.6);}
// Arrival deck, shaded reception and moored boat.
deck(444,542,68,81);for(const x of [444,511])for(let y=546;y<622;y+=18){line(x,y,x,y-8,'#8e7958',2);oval(x,y-8,2,1,'#e6d2a8');}house(472,516,1,0,.9);label('RECEPTION',474,554);path('M 523 581 Q 548 594 548 613 Q 532 623 519 611 Z','#f3ead2','#aa9674',1);path('M 523 587 L 537 595 L 539 613 L 524 608 Z','#6d9697');
for(let k=0;k<4;k++){let x=279+k*91;if(x>420&&x<529)continue;lounger(x,542);lounger(x+15,545);umbrella(x+10,535);}
label('PALM GROVE',226,76);label('LAGOON WALK',693,119);label('SUNSET GARDENS',355,440);label('CORAL BEACH',666,550);
function label(s,x,y,quiet=false){c.font='600 '+(s.length<3?8:8.5)+'px sans-serif';c.textAlign='center';const w=c.measureText(s).width+13;box(x-w/2,y-10,w,15,quiet?'#e9e4c78a':'#fcf4dace',5);c.fillStyle=quiet?'#76866b':'#4b6557';c.fillText(s,x,y);}
}
landscape.slots=slots;root.CoveResortLandscape=landscape;
})(globalThis);
