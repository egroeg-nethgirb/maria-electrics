(function(){
if(!document.getElementById('dock'))document.body.insertAdjacentHTML('beforeend',`<button class="fab" data-open="" aria-label="Play repair games"><svg class="fab-ic" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor"/></svg><span class="fab-tx">Play repair games</span></button>
<div class="scrim" id="scrim"></div>

<aside class="dock" id="dock" aria-label="Repair games" aria-hidden="true">
  <div class="d-top">
    <button data-open="catch">Catch</button><button data-open="rush">Rush</button><button data-open="wire">Wires</button><button data-open="memo">Memory</button>
    <button class="x" id="close" aria-label="Close games">✕</button>
  </div>
  <div class="stage"><canvas id="cv" width="360" height="540"></canvas></div>
  <div class="d-info"><div id="msg"></div><div id="sub"></div></div>
</aside>`);
const $=s=>document.querySelector(s),cv=$('#cv'),cx=cv.getContext('2d'),W=360,H=540;
const C={ink:'#12294F',cy:'#4FC3E8',bl:'#1B54D6'};
let cur=null,raf=0,last='catch',gen=0;const later=(f,ms)=>{const g=gen;setTimeout(()=>{if(g===gen)f()},ms)};
const say=(a,b)=>{$('#msg').textContent=a;$('#sub').textContent=b||''};
function pt(e){const r=cv.getBoundingClientRect(),s=Math.min(r.width/W,r.height/H);return[(e.clientX-r.left-(r.width-W*s)/2)/s,(e.clientY-r.top-(r.height-H*s)/2)/s]}
function grid(){cx.fillStyle=C.ink;cx.fillRect(0,0,W,H);cx.strokeStyle='rgba(79,195,232,.14)';cx.lineWidth=1;cx.beginPath();for(let i=0;i<=W;i+=30){cx.moveTo(i,0);cx.lineTo(i,H)}for(let j=0;j<=H;j+=30){cx.moveTo(0,j);cx.lineTo(W,j)}cx.stroke()}
function txt(t,x,y,c,sz){cx.fillStyle=c||'#fff';cx.font='600 '+(sz||13)+'px IBM Plex Mono,monospace';cx.textAlign='center';cx.fillText(t,x,y)}
function loop(f){cancelAnimationFrame(raf);const g=()=>{f();raf=requestAnimationFrame(g)};g()}

/* ---------- shared helpers ---------- */
let AC;const beep=(f,d)=>{try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();const o=AC.createOscillator(),g=AC.createGain();o.type='triangle';o.frequency.value=f;g.gain.value=.1;o.connect(g);g.connect(AC.destination);o.start();o.stop(AC.currentTime+(d||.1))}catch(e){}};
const bst={g:k=>{try{return+localStorage.getItem('maria-'+k)||0}catch(e){return 0}},s:(k,v)=>{try{localStorage.setItem('maria-'+k,v)}catch(e){}}};
function hud(lv,lives,sc){cx.textAlign='left';cx.fillStyle='#fff';cx.font='600 13px IBM Plex Mono,monospace';cx.fillText('LV '+lv,14,26);txt('♥'.repeat(Math.max(0,lives))+'♡'.repeat(Math.max(0,3-lives)),W/2,26,'#ff6b6b',15);cx.textAlign='right';cx.fillStyle='#7ad4ee';cx.fillText(sc+' pts',W-14,26)}
function fin(k,sc,lv){const b=bst.g(k),nb=sc>b;if(nb)bst.s(k,sc);say('Game over at level '+lv+': '+sc+' points',(nb?'New best! ':'Best '+b+'. ')+'Tap the screen to play again')}
function ban(a,b){cx.fillStyle='rgba(18,41,79,.88)';cx.fillRect(0,190,W,120);txt(a,W/2,240,'#fff',22);txt(b||'',W/2,274,'#7ad4ee',13)}

/* ---------- 1. Current Connector (endless, timed, harder every level) ---------- */
const wire={N:['Fan','Motor','Iron box','Mixer'],T:['capacitor','stator coils','soleplate','motor'],
start(){this.lv=1;this.sc=0;this.lives=3;this.over=0;cv.onpointerdown=e=>this.tap(pt(e));this.load()},
rot:m=>((m<<1)|(m>>3))&15,
path(){const R=this.R,K=this.K,min=R+Math.min(this.lv*2,R),seen={},p=[];
 let n=0;const go=(r,c)=>{if(++n>400)return 0;p.push([r,c]);seen[r*9+c]=1;if(r===R-1&&p.length>=min)return 1;
  for(const[dr,dc]of[[1,0],[0,1],[0,-1],[-1,0]].sort(()=>Math.random()-.5)){const a=r+dr,b=c+dc;if(a<0||a>=R||b<0||b>=K||seen[a*9+b])continue;if(go(a,b))return 1}
  p.pop();delete seen[r*9+c];return 0};
 for(let t=0;t<60;t++){p.length=0;for(const k in seen)delete seen[k];n=0;if(go(0,Math.random()*K|0)&&p.length)return p}return this.fallback()},
fallback(){const p=[];for(let r=0;r<this.R;r++)p.push([r,0]);return p},
load(){const lv=this.lv;this.K=Math.min(6,4+((lv-1)>>1));this.R=Math.min(8,5+((lv-1)>>1));this.S=Math.floor(Math.min(320/this.K,400/this.R));this.X0=(W-this.K*this.S)/2;this.Y0=70;
 this.lim=Math.max(16,48-3*lv);this.t0=Date.now();this.st=0;const p=this.p=this.path(),pool=lv>2?[5,10,3,6,12,9,7,14,13,11]:[5,10,3,6,12,9];
 do{this.g=[];for(let r=0;r<this.R;r++){this.g[r]=[];for(let c=0;c<this.K;c++)this.g[r][c]=pool[Math.random()*pool.length|0]}
  p.forEach(([r,c],i)=>{let m=0;for(const q of[p[i-1]||[r-1,c],p[i+1]||[r+1,c]]){if(q[0]<r)m|=1;else if(q[0]>r)m|=4;else if(q[1]>c)m|=2;else m|=8}this.g[r][c]=m});
  for(let r=0;r<this.R;r++)for(let c=0;c<this.K;c++)for(let k=Math.random()*4|0;k--;)this.g[r][c]=this.rot(this.g[r][c])
 }while(this.solve().ok);
 const i=(lv-1)%4;say('Level '+lv+': '+this.N[i],'Tap blocks to route power to the '+this.T[i]+' before time runs out');loop(()=>this.draw())},
solve(){const g=this.g,on={},q=[],c0=this.p[0][1];if(g[0][c0]&1){on['0,'+c0]=1;q.push([0,c0])}
 while(q.length){const[r,c]=q.shift(),m=g[r][c];for(const[dr,dc,bit,opp]of[[-1,0,1,4],[0,1,2,8],[1,0,4,1],[0,-1,8,2]]){if(!(m&bit))continue;const a=r+dr,b=c+dc;if(a<0||a>=this.R||b<0||b>=this.K||on[a+','+b]||!(g[a][b]&opp))continue;on[a+','+b]=1;q.push([a,b])}}
 const e=this.p[this.p.length-1];return{on,ok:!!on[e[0]+','+e[1]]&&!!(g[e[0]][e[1]]&4)}},
tap([x,y]){if(this.over){this.start();return}if(this.st)return;const c=Math.floor((x-this.X0)/this.S),r=Math.floor((y-this.Y0)/this.S);if(r<0||r>=this.R||c<0||c>=this.K)return;this.g[r][c]=this.rot(this.g[r][c]);beep(300,.04);
 if(this.solve().ok){this.st=1;const left=Math.max(0,this.lim-(Date.now()-this.t0)/1000),pts=100*this.lv+Math.round(left*5);this.sc+=pts;beep(660,.2);say('Power on: +'+pts,'Level up!');later(()=>{this.lv++;this.load()},1300)}},
fail(){this.st=1;this.lives--;beep(150,.3);if(this.lives<=0){this.over=1;fin('wire',this.sc,this.lv)}else{say('Out of time. Life lost.','New circuit loading');later(()=>this.load(),1200)}},
draw(){const left=Math.max(0,this.lim-(Date.now()-this.t0)/1000);if(!this.st&&!this.over&&left<=0)this.fail();
 grid();const{on,ok}=this.solve(),S=this.S,h=S/2;cx.lineCap='round';
 for(let r=0;r<this.R;r++)for(let c=0;c<this.K;c++){const x=this.X0+c*S,y=this.Y0+r*S,m=this.g[r][c],p=on[r+','+c];cx.strokeStyle='rgba(79,195,232,.3)';cx.lineWidth=1;cx.strokeRect(x+2,y+2,S-4,S-4);
  cx.strokeStyle=p?'#bff0ff':'#5C6B7A';cx.lineWidth=Math.max(5,S/10);cx.shadowColor=C.cy;cx.shadowBlur=p?14:0;cx.beginPath();
  [[0,-h,1],[h,0,2],[0,h,4],[-h,0,8]].forEach(([dx,dy,b])=>{if(m&b){cx.moveTo(x+h,y+h);cx.lineTo(x+h+dx,y+h+dy)}});cx.stroke();cx.shadowBlur=0}
 const sx=this.X0+this.p[0][1]*S+h;cx.strokeStyle='#fff';cx.lineWidth=3;cx.fillStyle='#fff';cx.fillRect(sx-12,40,24,18);cx.fillRect(sx-7,32,4,8);cx.fillRect(sx+3,32,4,8);cx.beginPath();cx.moveTo(sx,58);cx.lineTo(sx,this.Y0);cx.stroke();
 const e=this.p[this.p.length-1],ex=this.X0+e[1]*S+h,ey=this.Y0+this.R*S+8;cx.strokeStyle=ok?'#7ad4ee':'#5C6B7A';cx.lineWidth=3;cx.fillStyle=ok?'rgba(79,195,232,.5)':'rgba(255,255,255,.06)';cx.beginPath();cx.roundRect(ex-50,ey,100,34,8);cx.fill();cx.stroke();txt(this.T[(this.lv-1)%4],ex,ey+22,'#fff',11);
 hud(this.lv,this.lives,this.sc);cx.fillStyle=left<8?'#ff6b6b':'#4FC3E8';cx.fillRect(14,34,(W-28)*(left/this.lim),4);
 if(this.over)ban('GAME OVER',this.sc+' points · tap to retry')}};

/* ---------- 3. Part Catcher ---------- */
const ctch={G:['⚙️','🔩','🌀','🔧'],
start(){this.lv=1;this.sc=0;this.lives=3;this.over=0;cv.onpointerdown=cv.onpointermove=e=>{if(this.over){if(e.type==='pointerdown')this.start();return}this.x=Math.max(this.w/2,Math.min(W-this.w/2,pt(e)[0]))};this.nl()},
nl(){const l=this.lv;this.goal=6+l*3;this.got=0;this.it=[];this.w=Math.max(54,104-l*4);this.x=W/2;this.spd=1.5+l*.22;this.gap=Math.max(24,70-l*4);this.f=0;this.intro=70;beep(520,.15);say('Level '+l+': catch '+this.goal+' parts','Drag to move the tray. Dodge the burnt parts, do not miss good ones.');loop(()=>this.tick())},
tick(){if(!this.over&&!this.intro){this.f++;
  if(this.f%this.gap===0){const r=Math.random(),k=r<.04?'s':r<Math.min(.45,.15+this.lv*.035)?'b':'g';this.it.push({x:24+Math.random()*(W-48),y:-20,k,v:this.spd*(.85+Math.random()*.5),i:Math.random()*4|0})}
  for(const o of this.it){o.y+=o.v;if(!o.d&&o.y>458&&o.y<496&&Math.abs(o.x-this.x)<this.w/2+10){o.d=1;
    if(o.k==='b'){this.lives--;this.sh=12;beep(130,.3)}else{this.got+=o.k==='s'?2:1;this.sc+=o.k==='s'?30:10;beep(o.k==='s'?900:600,.07)}}
   else if(!o.d&&o.y>H+10){o.d=1;if(o.k==='g'){this.lives--;this.sh=12;beep(130,.25)}}}
  this.it=this.it.filter(o=>!o.d&&o.y<H+20);
  if(this.lives<=0){this.over=1;fin('catch',this.sc,this.lv)}
  else if(this.got>=this.goal){this.lv++;this.sc+=50;this.nl()}}
 if(this.intro)this.intro--;
 grid();cx.save();if(this.sh>0){cx.translate((Math.random()-.5)*this.sh,0);this.sh--}
 cx.textAlign='center';for(const o of this.it){cx.font='28px sans-serif';cx.fillText(o.k==='b'?'🔥':o.k==='s'?'⭐':this.G[o.i],o.x,o.y)}
 cx.fillStyle=C.cy;cx.strokeStyle='#fff';cx.lineWidth=2;cx.beginPath();cx.roundRect(this.x-this.w/2,490,this.w,16,6);cx.fill();cx.stroke();cx.restore();
 hud(this.lv,this.lives,this.sc);cx.fillStyle='rgba(255,255,255,.15)';cx.fillRect(14,36,W-28,5);cx.fillStyle='#FFD54A';cx.fillRect(14,36,(W-28)*Math.min(1,this.got/this.goal),5);
 if(this.intro)ban('LEVEL '+this.lv,'Catch '+this.goal+' parts');if(this.over)ban('GAME OVER',this.sc+' points · tap to retry')}};

/* ---------- 4. Circuit Memory ---------- */
const memo={P:[{n:'FAN',c:'#4FC3E8',f:262},{n:'MOTOR',c:'#7F9BFF',f:330},{n:'IRON',c:'#FFB300',f:392},{n:'MIXER',c:'#5FD38D',f:523}],
start(){this.lv=1;this.sc=0;this.lives=3;this.over=0;this.seq=[];cv.onpointerdown=e=>this.tap(pt(e));this.round();loop(()=>this.draw())},
round(){while(this.seq.length<this.lv+2)this.seq.push(Math.random()*4|0);this.i=0;this.ph='show';this.lit=-1;say('Level '+this.lv+': watch closely',this.seq.length+' signals');
 const sp=Math.max(240,640-this.lv*50);this.seq.forEach((p,k)=>{later(()=>{this.lit=p;beep(this.P[p].f,sp*.0008)},700+k*sp);later(()=>{this.lit=-1},700+k*sp+sp*.7)});
 later(()=>{this.ph='in';this.t0=Date.now();say('Level '+this.lv+': your turn','Repeat all '+this.seq.length+' signals')},700+this.seq.length*sp+80)},
box(i){return[20+(i%2)*165,120+(i>>1)*165,155,155]},
tap([x,y]){if(this.over){this.start();return}if(this.ph!=='in')return;for(let i=0;i<4;i++){const[a,b,w,h]=this.box(i);if(x>=a&&x<=a+w&&y>=b&&y<=b+h){this.press(i);return}}},
press(i){this.lit=i;beep(this.P[i].f,.15);later(()=>{this.lit=-1},180);
 if(i===this.seq[this.i]){this.i++;this.t0=Date.now();if(this.i===this.seq.length){this.ph='wait';this.sc+=10*this.seq.length;this.lv++;say('Level up!','+'+10*this.seq.length+' points');later(()=>this.round(),1000)}}else this.bad()},
bad(){this.ph='wait';this.lives--;beep(130,.35);if(this.lives<=0){this.over=1;fin('memo',this.sc,this.lv)}else{say('Wrong signal. Life lost.','Same sequence again');later(()=>this.round(),1100)}},
draw(){if(this.ph==='in'&&!this.over&&Date.now()-this.t0>Math.max(1300,3200-this.lv*180))this.bad();
 grid();for(let i=0;i<4;i++){const[a,b,w,h]=this.box(i),on=this.lit===i;cx.fillStyle=on?this.P[i].c:'rgba(27,84,214,.22)';cx.strokeStyle=this.P[i].c;cx.lineWidth=on?4:2;cx.beginPath();cx.roundRect(a,b,w,h,16);cx.fill();cx.stroke();txt(this.P[i].n,a+w/2,b+h/2+6,on?'#12294F':'#fff',16)}
 hud(this.lv,this.lives,this.sc);if(this.ph==='in'){const f=1-(Date.now()-this.t0)/Math.max(1300,3200-this.lv*180);cx.fillStyle='#7ad4ee';cx.fillRect(14,34,Math.max(0,(W-28)*f),4)}
 txt(this.ph==='show'?'WATCH':this.ph==='in'?'YOUR TURN':'',W/2,90,'#FFD54A',14);if(this.over)ban('GAME OVER',this.sc+' points · tap to retry')}};

/* ---------- 4. Fault Rush ---------- */
const rush={ic:['🌀','⚙️','♨️','🍹'],nm:['FAN','MOTOR','IRON','MIXER'],
start(){this.reset();cv.onpointerdown=e=>this.tap(pt(e))},
reset(){this.cells=Array(9).fill(null);this.sc=0;this.cb=0;this.lv=3;this.t0=Date.now();this.nx=this.t0+700;this.fl=[];this.over=0;this.best=this.rd();say('Fault Rush','Tap sparking appliances fast. Never touch a ⚠ live wire.');loop(()=>this.tick())},
rd(){try{return+localStorage.getItem('maria-rush')||0}catch(e){return 0}},
mul(){return Math.min(5,1+Math.floor(this.cb/3))},
tap([x,y]){if(this.over){this.reset();return}const c=Math.floor((x-20)/110),r=Math.floor((y-110)/110);if(x<20||y<110||c>2||r>2||(x-20)%110>100||(y-110)%110>100)return;
 const i=r*3+c,f=this.cells[i],cx0=20+c*110+50,cy0=110+r*110+40;if(!f){this.cb=0;return}this.cells[i]=null;
 if(f.k==='f'){this.cb++;const p=10*this.mul();this.sc+=p;this.fl.push({x:cx0,y:cy0,t:Date.now(),s:'+'+p,c:'#7ad4ee'})}
 else{this.lv--;this.cb=0;this.fl.push({x:cx0,y:cy0,t:Date.now(),s:'ZAP!',c:'#ff5d6c'});this.chk()}},
chk(){if(this.lv>0)return;this.end()},
end(){if(this.over)return;this.over=1;const nb=this.sc>this.best;if(nb){this.best=this.sc;try{localStorage.setItem('maria-rush',this.sc)}catch(e){}}
 say('Shift over: '+this.sc+' points',(nb?'New best! ':'Best '+this.best+'. ')+'Tap the screen to play again')},
tick(){const n=Date.now(),el=(n-this.t0)/1000,left=Math.max(0,45-el);
 if(!this.over){if(left<=0)this.end();
  if(n>this.nx){const e=this.cells.map((c,i)=>c?-1:i).filter(i=>i>=0);if(e.length){const i=e[Math.random()*e.length|0];this.cells[i]={k:el>5&&Math.random()<.22?'l':'f',s:n,e:n+Math.max(750,1800-el*20)}}this.nx=n+Math.max(380,980-el*12)}
  this.cells.forEach((c,i)=>{if(c&&c.e<n){this.cells[i]=null;if(c.k==='f'){this.lv--;this.cb=0;this.chk()}}})}
 grid();cx.textAlign='left';cx.fillStyle='#fff';cx.font='600 14px IBM Plex Mono,monospace';cx.fillText('SCORE '+this.sc,16,34);
 txt(Math.ceil(left)+'s',W/2+20,34,left<8?'#ff8a65':'#7ad4ee',16);cx.textAlign='right';cx.fillStyle='#ff5d6c';cx.fillText('♥'.repeat(Math.max(0,this.lv)),W-16,34);
 cx.textAlign='left';cx.fillStyle='rgba(255,255,255,.55)';cx.font='500 11px IBM Plex Mono,monospace';cx.fillText('BEST '+this.best,16,56);
 if(this.mul()>1)txt('COMBO x'+this.mul(),W/2,80,'#FFD54A',14);
 for(let i=0;i<9;i++){const c=this.cells[i],X=20+(i%3)*110,Y=110+Math.floor(i/3)*110,k=c&&c.k;
  cx.lineWidth=2;cx.strokeStyle=k==='f'?'#FFB300':k==='l'?'#ff5d6c':'rgba(79,195,232,.5)';cx.fillStyle=k==='f'?'rgba(255,152,0,.28)':k==='l'?'rgba(220,40,60,.3)':'rgba(27,84,214,.22)';
  cx.beginPath();cx.roundRect(X,Y,100,100,12);cx.fill();cx.stroke();
  if(k==='l'){cx.font='34px sans-serif';cx.textAlign='center';cx.fillText('⚠️',X+50,Y+52);txt('LIVE WIRE',X+50,Y+82,'#ffb3bb',11)}
  else{cx.font='36px sans-serif';cx.textAlign='center';cx.fillStyle='#fff';cx.fillText(this.ic[i%4],X+50,Y+54);txt(this.nm[i%4],X+50,Y+84,'rgba(255,255,255,.6)',11);
   if(k==='f'){cx.font='20px sans-serif';cx.fillText('⚡',X+82,Y+24);const f=Math.max(0,(c.e-n)/(c.e-c.s));cx.fillStyle='#FFB300';cx.fillRect(X+10,Y+92,80*f,4)}}
  if(k==='l'){const f=Math.max(0,(c.e-n)/(c.e-c.s));cx.fillStyle='#ff5d6c';cx.fillRect(X+10,Y+92,80*f,4)}}
 this.fl=this.fl.filter(f=>n-f.t<700);for(const f of this.fl){cx.globalAlpha=1-(n-f.t)/700;txt(f.s,f.x,f.y-(n-f.t)/12,f.c,18);cx.globalAlpha=1}
 txt('Tap the sparking ones. Skip the live wires.',W/2,470,'rgba(255,255,255,.55)',11);
 if(this.over){cx.fillStyle='rgba(18,41,79,.82)';cx.fillRect(0,170,W,190);txt('SHIFT OVER',W/2,230,'#7ad4ee',22);txt(this.sc+' points',W/2,272,'#fff',28);txt('tap to play again',W/2,320,'rgba(255,255,255,.7)',13)}}};

/* ---------- dock ---------- */
const G={wire,rush,catch:ctch,memo};
function openGame(id){gen++;id=id||last;last=id;cancelAnimationFrame(raf);cv.onpointerdown=cv.onpointermove=cv.onpointerup=null;
 $('#dock').classList.add('open');$('#dock').setAttribute('aria-hidden','false');$('#scrim').classList.add('on');$('.fab').style.display='none';
 document.querySelectorAll('.d-top [data-open]').forEach(b=>b.classList.toggle('on',b.dataset.open===id));G[id].start()}
function closeGame(){gen++;cancelAnimationFrame(raf);$('#dock').classList.remove('open');$('#dock').setAttribute('aria-hidden','true');$('#scrim').classList.remove('on');$('.fab').style.display=''}
document.querySelectorAll('[data-open]').forEach(b=>b.addEventListener('click',()=>openGame(b.dataset.open)));
$('#close').onclick=closeGame;$('#scrim').onclick=closeGame;addEventListener('keydown',e=>{if(e.key==='Escape')closeGame()});

/* ---------- mobile side menu ---------- */
const nav=document.querySelector('.nav'),links=nav&&nav.querySelector('nav.links');
if(links){const b=document.createElement('button');b.className='menu-btn';b.setAttribute('aria-label','Open menu');b.setAttribute('aria-expanded','false');b.innerHTML='<span></span><span></span><span></span>';nav.appendChild(b);
const s=document.createElement('div');s.className='menu-scrim';document.body.appendChild(s);
const set=o=>{document.body.classList.toggle('menu-open',o);b.setAttribute('aria-expanded',o);b.setAttribute('aria-label',o?'Close menu':'Open menu')};
b.onclick=()=>set(!document.body.classList.contains('menu-open'));s.onclick=()=>set(false);
links.addEventListener('click',e=>{if(e.target.closest('a'))set(false)});addEventListener('keydown',e=>{if(e.key==='Escape')set(false)})}
/* ---------- all pages: play button shrinks to a circle as you scroll down ---------- */
(function(){
const fab=document.querySelector('.fab'),tx=fab&&fab.querySelector('.fab-tx');if(!fab||!tx)return;
const SHRINK=160;let lw=0,tick=0;
const measure=()=>{tx.style.maxWidth='none';tx.style.marginLeft='8px';lw=tx.scrollWidth;upd()};
function upd(){tick=0;const y=window.scrollY||0,p=Math.min(1,Math.max(0,y/SHRINK))
 tx.style.maxWidth=(lw*(1-p))+'px';tx.style.opacity=String(Math.max(0,1-p*1.4));tx.style.marginLeft=(8*(1-p))+'px';}
addEventListener('scroll',()=>{if(!tick)tick=requestAnimationFrame(upd)},{passive:true});
addEventListener('resize',measure);addEventListener('load',measure);
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(measure);
measure();
})();
})();
