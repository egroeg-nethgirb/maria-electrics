(function(){
if(!document.getElementById('dock'))document.body.insertAdjacentHTML('beforeend',`<button class="fab" data-open="">Play repair games</button>
<div class="scrim" id="scrim"></div>

<aside class="dock" id="dock" aria-label="Repair games" aria-hidden="true">
  <div class="d-top">
    <button data-open="core">Core</button><button data-open="wire">Wires</button><button data-open="wash">Clean</button>
    <button class="x" id="close" aria-label="Close games">✕</button>
  </div>
  <div class="stage"><canvas id="cv" width="360" height="540"></canvas></div>
  <div class="d-info"><div id="msg"></div><div id="sub"></div></div>
  <div id="tools"><button data-t="0">Scraper</button><button data-t="1">Degreaser</button><button data-t="2">Wire brush</button><button data-t="3">Oil dropper</button></div>
  <a class="d-call" href="tel:+919495600876">Need a real repair? <strong>Call +91 94956 00876</strong></a>
</aside>`);
const $=s=>document.querySelector(s),cv=$('#cv'),cx=cv.getContext('2d'),W=360,H=540;
const C={ink:'#12294F',cy:'#4FC3E8',bl:'#1B54D6'};
let cur=null,raf=0,last='core';
const say=(a,b)=>{$('#msg').textContent=a;$('#sub').textContent=b||''};
function pt(e){const r=cv.getBoundingClientRect(),s=Math.min(r.width/W,r.height/H);return[(e.clientX-r.left-(r.width-W*s)/2)/s,(e.clientY-r.top-(r.height-H*s)/2)/s]}
function grid(){cx.fillStyle=C.ink;cx.fillRect(0,0,W,H);cx.strokeStyle='rgba(79,195,232,.14)';cx.lineWidth=1;cx.beginPath();for(let i=0;i<=W;i+=30){cx.moveTo(i,0);cx.lineTo(i,H)}for(let j=0;j<=H;j+=30){cx.moveTo(0,j);cx.lineTo(W,j)}cx.stroke()}
function txt(t,x,y,c,sz){cx.fillStyle=c||'#fff';cx.font='600 '+(sz||13)+'px IBM Plex Mono,monospace';cx.textAlign='center';cx.fillText(t,x,y)}
function loop(f){cancelAnimationFrame(raf);const g=()=>{f();raf=requestAnimationFrame(g)};g()}

/* ---------- 1. Assembling the Core ---------- */
const funnel=g=>[[g-80,420,g-20,470],[g+80,420,g+20,470],[g-20,470,g-20,H],[g+20,470,g+20,H],[g-20,H-6,g+20,H-6]];
const core={lv:0,
L:[
 {n:'Fan blade',g:270,b:[150,72],pins:[[150,100]],s:[[90,240,260,300]]},
 {n:'Motor armature',g:90,b:[80,72],pins:[[80,100],[245,244]],s:[[40,200,230,250],[320,330,100,390]]},
 {n:'Mixer coupler gear',g:270,b:[60,70],pins:[[60,98],[312,203],[48,322]],s:[[30,160,300,200],[330,280,60,320],[20,380,200,405]]}],
start(){this.lv=0;this.load();cv.onpointerdown=e=>this.tap(pt(e))},
load(){const l=this.L[this.lv];this.l=l;this.pins=l.pins.map(p=>({x:p[0],y:p[1]}));this.b={x:l.b[0],y:l.b[1],vx:0,vy:0};this.segs=l.s.concat(funnel(l.g),[[0,0,0,H],[W,0,W,H]]);this.st=0;say('Level '+(this.lv+1)+' of 3: '+l.n,'Tap a pin to drop the part into the slot');loop(()=>this.tick())},
tap([x,y]){if(this.st)return;this.pins=this.pins.filter(p=>Math.hypot(p.x-x,p.y-y)>30)},
tick(){const b=this.b;
 if(!this.st)for(let k=0;k<4;k++){b.vy+=.1;b.x+=b.vx/4;b.y+=b.vy/4;
  const hit=(qx,qy,R)=>{const dx=b.x-qx,dy=b.y-qy,d=Math.hypot(dx,dy);if(d<R&&d>0){const nx=dx/d,ny=dy/d;b.x=qx+nx*R;b.y=qy+ny*R;const vn=b.vx*nx+b.vy*ny;if(vn<0){b.vx-=1.3*vn*nx;b.vy-=1.3*vn*ny;b.vx*=.996;b.vy*=.996}}};
  for(const[a,c,d,e]of this.segs){const ux=d-a,uy=e-c,t=Math.max(0,Math.min(1,((b.x-a)*ux+(b.y-c)*uy)/(ux*ux+uy*uy)));hit(a+ux*t,c+uy*t,16)}
  for(const p of this.pins)hit(p.x,p.y,28)}
 if(!this.st&&b.y>490&&Math.abs(b.x-this.l.g)<20&&Math.abs(b.vy)<1.5){this.st=1;say('Fitted.',this.lv<2?'Next part loading':'All parts fitted');setTimeout(()=>{if(this.lv<2){this.lv++;this.load()}else say('Core assembled.','All three parts fitted. Play again from Core.')},1200)}
 if(!this.st&&b.y>H+40){this.st=1;say('Part dropped outside the slot.','Resetting this level');setTimeout(()=>this.load(),900)}
 grid();cx.lineWidth=3;cx.strokeStyle=C.cy;cx.lineCap='round';cx.beginPath();for(const[a,c,d,e]of this.segs){cx.moveTo(a,c);cx.lineTo(d,e)}cx.stroke();
 txt('housing',this.l.g,H-14,'rgba(255,255,255,.6)',11);
 for(const p of this.pins){cx.strokeStyle='#fff';cx.lineWidth=3;cx.beginPath();cx.arc(p.x,p.y,12,0,7);cx.stroke();cx.beginPath();cx.moveTo(p.x-5,p.y);cx.lineTo(p.x+5,p.y);cx.moveTo(p.x,p.y-5);cx.lineTo(p.x,p.y+5);cx.stroke()}
 cx.save();cx.translate(b.x,b.y);cx.rotate(b.x/16);cx.strokeStyle='#7ad4ee';cx.lineWidth=3;cx.fillStyle='rgba(27,84,214,.55)';cx.beginPath();cx.arc(0,0,15,0,7);cx.fill();cx.stroke();cx.beginPath();for(let i=0;i<6;i++){cx.moveTo(0,0);cx.lineTo(Math.cos(i*1.047)*15,Math.sin(i*1.047)*15)}cx.stroke();cx.restore()}};

/* ---------- 2. Current Connector ---------- */
const wire={lv:0,R:5,Cc:4,S:80,X0:20,Y0:70,
L:[{n:'Fan',t:'capacitor',p:[[0,0],[1,0],[2,0],[2,1],[3,1],[4,1]]},
   {n:'Motor',t:'stator coils',p:[[0,3],[1,3],[1,2],[2,2],[3,2],[3,3],[4,3]]},
   {n:'Iron box',t:'soleplate',p:[[0,1],[1,1],[2,1],[2,2],[3,2],[3,1],[4,1]]},
   {n:'Mixer',t:'motor',p:[[0,2],[1,2],[1,1],[2,1],[2,0],[3,0],[4,0]]}],
rot:m=>((m<<1)|(m>>3))&15,
start(){this.lv=0;this.load();cv.onpointerdown=e=>this.tap(pt(e))},
load(){const l=this.L[this.lv];this.l=l;this.st=0;const D=[[0,-1,1,4],[1,0,2,8],[0,1,4,1],[-1,0,8,2]];
 do{this.g=[];for(let r=0;r<5;r++){this.g[r]=[];for(let c=0;c<4;c++)this.g[r][c]=[5,10,3,6,12,9][Math.random()*6|0]}
  l.p.forEach(([r,c],i)=>{let m=0;const pv=l.p[i-1]||[r-1,c],nx=l.p[i+1]||[r+1,c];for(const q of[pv,nx])for(const[dc,dr,bit]of D)if(c+dc===q[1]&&r+dr===q[0])m|=bit;this.g[r][c]=m});
  for(let r=0;r<5;r++)for(let c=0;c<4;c++)for(let k=Math.random()*4|0;k--;)this.g[r][c]=this.rot(this.g[r][c])
 }while(this.solve().ok);
 say(l.n+' ('+(this.lv+1)+' of 4)','Tap blocks to turn the wire from the plug to the '+l.t);loop(()=>this.draw())},
solve(){const g=this.g,on={},q=[],c0=this.l.p[0][1];if(g[0][c0]&1){on['0,'+c0]=1;q.push([0,c0])}
 while(q.length){const[r,c]=q.shift(),m=g[r][c];for(const[dr,dc,bit,opp]of[[-1,0,1,4],[0,1,2,8],[1,0,4,1],[0,-1,8,2]]){if(!(m&bit))continue;const R=r+dr,Cn=c+dc;if(R<0||R>4||Cn<0||Cn>3||on[R+','+Cn]||!(g[R][Cn]&opp))continue;on[R+','+Cn]=1;q.push([R,Cn])}}
 const e=this.l.p[this.l.p.length-1];return{on,ok:!!on[e[0]+','+e[1]]&&!!(g[e[0]][e[1]]&4)}},
tap([x,y]){if(this.st)return;const c=Math.floor((x-this.X0)/this.S),r=Math.floor((y-this.Y0)/this.S);if(r<0||r>4||c<0||c>3)return;this.g[r][c]=this.rot(this.g[r][c]);if(this.solve().ok){this.st=1;say('Power on.',this.l.n+' is running');setTimeout(()=>{if(this.lv<3){this.lv++;this.load()}else say('All four appliances powered.','Play again from Wires.')},1300)}},
draw(){grid();const{on,ok}=this.solve(),S=this.S,h=S/2;cx.lineCap='round';
 for(let r=0;r<5;r++)for(let c=0;c<4;c++){const x=this.X0+c*S,y=this.Y0+r*S,m=this.g[r][c],p=on[r+','+c];cx.strokeStyle='rgba(79,195,232,.3)';cx.lineWidth=1;cx.strokeRect(x+3,y+3,S-6,S-6);
  cx.strokeStyle=p?'#bff0ff':'#5C6B7A';cx.lineWidth=p?9:7;cx.shadowColor=C.cy;cx.shadowBlur=p?14:0;cx.beginPath();
  [[0,-h,1],[h,0,2],[0,h,4],[-h,0,8]].forEach(([dx,dy,b])=>{if(m&b){cx.moveTo(x+h,y+h);cx.lineTo(x+h+dx,y+h+dy)}});cx.stroke();cx.shadowBlur=0}
 const sx=this.X0+this.l.p[0][1]*S+h;cx.strokeStyle='#fff';cx.lineWidth=3;cx.fillStyle='#fff';cx.fillRect(sx-14,16,28,26);cx.fillRect(sx-8,6,4,10);cx.fillRect(sx+4,6,4,10);cx.beginPath();cx.moveTo(sx,42);cx.lineTo(sx,this.Y0);cx.stroke();
 const ex=this.X0+this.l.p[this.l.p.length-1][1]*S+h;cx.strokeStyle=ok?'#7ad4ee':'#5C6B7A';cx.lineWidth=3;cx.fillStyle=ok?'rgba(79,195,232,.5)':'rgba(255,255,255,.06)';cx.beginPath();cx.roundRect(ex-60,478,120,44,8);cx.fill();cx.stroke();txt(this.l.t,ex,506,'#fff',12)}};

/* ---------- 3. Restoration ---------- */
const wash={lv:0,tool:0,A:null,
LY:[{c:'#6b4a2b',a:1,n:'Crust'},{c:'#c9a227',a:.8,n:'Grease'},{c:'#b5532a',a:.95,n:'Rust'},{c:'#59616b',a:.85,n:'Dry film'}],
J:[{n:'Fan cowl',d(){cx.fillStyle=this.g();cx.beginPath();cx.arc(180,270,125,0,7);cx.fill();cx.strokeStyle='#fff';cx.lineWidth=4;cx.stroke();cx.fillStyle='#9fb3c8';for(let i=0;i<3;i++){cx.save();cx.translate(180,270);cx.rotate(i*2.09);cx.beginPath();cx.ellipse(0,-65,26,52,0,0,7);cx.fill();cx.restore()}cx.fillStyle='#1B54D6';cx.beginPath();cx.arc(180,270,24,0,7);cx.fill()}},
   {n:'Iron soleplate',d(){cx.fillStyle=this.g();cx.beginPath();cx.moveTo(60,340);cx.lineTo(230,340);cx.quadraticCurveTo(320,320,310,260);cx.quadraticCurveTo(300,190,220,180);cx.lineTo(60,180);cx.closePath();cx.fill();cx.strokeStyle='#fff';cx.lineWidth=4;cx.stroke();cx.fillStyle='#5C6B7A';for(let i=0;i<8;i++){cx.beginPath();cx.arc(90+i*28,220+(i%2)*60,5,0,7);cx.fill()}}},
   {n:'Mixer jar',d(){cx.fillStyle=this.g();cx.beginPath();cx.moveTo(100,150);cx.lineTo(260,150);cx.lineTo(240,380);cx.lineTo(120,380);cx.closePath();cx.fill();cx.strokeStyle='#fff';cx.lineWidth=4;cx.stroke();cx.fillStyle='#1B54D6';cx.fillRect(112,380,136,50);cx.fillStyle='#9fb3c8';cx.fillRect(90,132,180,20)}}],
g(){const g=cx.createLinearGradient(40,120,330,450);g.addColorStop(0,'#eef3f8');g.addColorStop(.5,'#b7c6d6');g.addColorStop(1,'#e4ecf4');return g},
start(){this.lv=0;this.tool=0;$('#tools').classList.add('on');this.sel();this.load();let down=0,lx,ly,tm=0;
 cv.onpointerdown=e=>{down=1;[lx,ly]=pt(e);cv.setPointerCapture(e.pointerId);this.ac()};cv.onpointerup=()=>down=0;
 cv.onpointermove=e=>{if(!down||this.st)return;const[x,y]=pt(e),c=this.lay[this.tool].getContext('2d');c.globalCompositeOperation='destination-out';c.lineWidth=this.tool==3?30:44;c.lineCap='round';c.beginPath();c.moveTo(lx,ly);c.lineTo(x,y);c.stroke();lx=x;ly=y;this.snd();if(Date.now()-tm>250){tm=Date.now();this.prog()}}},
sel(){document.querySelectorAll('#tools button').forEach(b=>b.classList.toggle('on',+b.dataset.t===this.tool))},
load(){const l=this.J[this.lv];this.cur=l;this.st=0;this.lay=this.LY.map(y=>{const o=document.createElement('canvas');o.width=W;o.height=H;const c=o.getContext('2d');c.fillStyle=y.c;c.globalAlpha=y.a;for(let i=0;i<55;i++){c.beginPath();c.arc(40+Math.random()*290,110+Math.random()*340,18+Math.random()*26,0,7);c.fill()}return o});this.n0=this.lay.map(o=>this.cnt(o));
 say('Job '+(this.lv+1)+' of 3: '+l.n,'Each tool removes one kind of grime');loop(()=>{cx.fillStyle='#E9EFF7';cx.fillRect(0,0,W,H);cx.shadowColor='rgba(18,41,79,.25)';cx.shadowBlur=18;l.d.call(this);cx.shadowBlur=0;this.lay.forEach(o=>cx.drawImage(o,0,0))})},
cnt(o){const d=o.getContext('2d').getImageData(40,110,290,340).data;let n=0;for(let i=3;i<d.length;i+=96)if(d[i]>40)n++;return n},
prog(){const rem=this.lay.reduce((s,o)=>s+this.cnt(o),0),tot=this.n0.reduce((a,b)=>a+b,0),p=Math.round(100*(1-rem/tot));say('Job '+(this.lv+1)+' of 3: '+this.cur.n,'Cleaned '+p+'%');
 if(p>=93){this.st=1;say(this.cur.n+' restored.','Gleaming');setTimeout(()=>{if(this.lv<2){this.lv++;this.load()}else say('Workshop finished.','All three parts restored. Play again from Clean.')},1300)}},
ac(){if(!this.A)try{this.A=new(window.AudioContext||window.webkitAudioContext)()}catch(e){}},
snd(){const A=this.A;if(!A||Date.now()-(this.ts||0)<45)return;this.ts=Date.now();const b=A.createBuffer(1,2200,A.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*(1-i/d.length);const s=A.createBufferSource(),f=A.createBiquadFilter(),g=A.createGain();s.buffer=b;f.type='bandpass';f.frequency.value=[900,3500,2000,500][this.tool];g.gain.value=.25;s.connect(f);f.connect(g);g.connect(A.destination);s.start()}};
document.querySelectorAll('#tools button').forEach(b=>b.onclick=()=>{wash.tool=+b.dataset.t;wash.sel()});

/* ---------- dock ---------- */
const G={core,wire,wash};
function openGame(id){id=id||last;last=id;cancelAnimationFrame(raf);cv.onpointerdown=cv.onpointermove=cv.onpointerup=null;$('#tools').classList.remove('on');
 $('#dock').classList.add('open');$('#dock').setAttribute('aria-hidden','false');$('#scrim').classList.add('on');$('.fab').style.display='none';
 document.querySelectorAll('.d-top [data-open]').forEach(b=>b.classList.toggle('on',b.dataset.open===id));G[id].start()}
function closeGame(){cancelAnimationFrame(raf);$('#dock').classList.remove('open');$('#dock').setAttribute('aria-hidden','true');$('#scrim').classList.remove('on');$('.fab').style.display=''}
document.querySelectorAll('[data-open]').forEach(b=>b.addEventListener('click',()=>openGame(b.dataset.open)));
$('#close').onclick=closeGame;$('#scrim').onclick=closeGame;addEventListener('keydown',e=>{if(e.key==='Escape')closeGame()});

/* ---------- mobile side menu ---------- */
const nav=document.querySelector('.nav'),links=nav&&nav.querySelector('nav.links');
if(links){const b=document.createElement('button');b.className='menu-btn';b.setAttribute('aria-label','Open menu');b.setAttribute('aria-expanded','false');b.innerHTML='<span></span><span></span><span></span>';nav.appendChild(b);
const s=document.createElement('div');s.className='menu-scrim';document.body.appendChild(s);
const set=o=>{document.body.classList.toggle('menu-open',o);b.setAttribute('aria-expanded',o);b.setAttribute('aria-label',o?'Close menu':'Open menu')};
b.onclick=()=>set(!document.body.classList.contains('menu-open'));s.onclick=()=>set(false);
links.addEventListener('click',e=>{if(e.target.closest('a'))set(false)});addEventListener('keydown',e=>{if(e.key==='Escape')set(false)})}
})();
