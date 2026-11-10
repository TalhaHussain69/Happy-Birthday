'use strict';
/* =====================================================================
   Areeshaaa's Birthday  ·  v2
   Envelope → countdown → gift → 3D cake (mic se phoonk) → fireworks →
   balloons → notes → cuties → letter → finale
   ===================================================================== */
const $=id=>document.getElementById(id);
const rnd=(a,b)=>a+Math.random()*(b-a);
const pick=a=>a[Math.random()*a.length|0];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const TAU=Math.PI*2;
const NAME='Areeshaaa';
if(document.fonts&&document.fonts.load)document.fonts.load('120px "Great Vibes"');
const pages=[...document.querySelectorAll('.page')];
const bgm=$('bgm'),nx=$('nx'),bk=$('bk'),muteBtn=$('mute');
let cur=0,fwOn=false,cakeFailed=false;

let timers=[];
const later=(fn,ms)=>{const t=setTimeout(fn,ms);timers.push(t);return t};
const clearTimers=()=>{timers.forEach(clearTimeout);timers=[]};

/* ---------------------------------------------------------------------
   AUDIO  (sound effects + music-box fallback, all synthesised)
   --------------------------------------------------------------------- */
let AC=null;
function ac(){
  if(!AC){const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;AC=new C()}
  if(AC.state==='suspended')AC.resume();
  return AC;
}
function tone(freq,t0,dur,vol,type){
  const a=ac();if(!a)return;
  const o=a.createOscillator(),g=a.createGain();
  o.type=type||'sine';o.frequency.value=freq;
  g.gain.setValueAtTime(0.0001,t0);
  g.gain.exponentialRampToValueAtTime(vol,t0+.012);
  g.gain.exponentialRampToValueAtTime(0.0001,t0+dur);
  o.connect(g);g.connect(a.destination);
  o.start(t0);o.stop(t0+dur+.05);
}
function noise(dur,cutoff,vol,pow){
  const a=ac();if(!a)return;
  const n=a.sampleRate*dur|0,b=a.createBuffer(1,n,a.sampleRate),d=b.getChannelData(0);
  for(let k=0;k<n;k++)d[k]=(Math.random()*2-1)*Math.pow(1-k/n,pow||3);
  const s=a.createBufferSource();s.buffer=b;
  const f=a.createBiquadFilter();f.type='lowpass';f.frequency.value=cutoff;
  const g=a.createGain();g.gain.value=vol;
  s.connect(f);f.connect(g);g.connect(a.destination);s.start();
}
const PENTA=[523.25,587.33,659.25,783.99,880,1046.5];
const sfx={
  on(){return !Music.muted},
  pop(){
    if(!this.on())return;const a=ac();if(!a)return;
    noise(.18,2600,.9,4);
    const o=a.createOscillator(),g=a.createGain(),t=a.currentTime;
    o.frequency.setValueAtTime(180,t);o.frequency.exponentialRampToValueAtTime(40,t+.1);
    g.gain.setValueAtTime(.5,t);g.gain.exponentialRampToValueAtTime(.001,t+.12);
    o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+.15);
  },
  puff(){if(this.on())noise(.22,1100,.12,2)},
  chime(k){
    if(!this.on())return;const a=ac();if(!a)return;
    const f=PENTA[(k===undefined?Math.random()*PENTA.length:k)%PENTA.length|0],t=a.currentTime;
    tone(f,t,1.3,.16,'sine');tone(f*2,t,.8,.05,'triangle');
  },
  tada(){
    if(!this.on())return;const a=ac();if(!a)return;const t=a.currentTime;
    [523.25,659.25,783.99,1046.5].forEach((f,k)=>{tone(f,t+k*.09,.9,.14,'triangle');tone(f*2,t+k*.09,.5,.04,'sine')});
  },
  sparkle(){
    if(!this.on())return;const a=ac();if(!a)return;const t=a.currentTime;
    for(let k=0;k<9;k++)tone(rnd(1400,3200),t+k*.07,.35,.05,'sine');
  },
  beep(f){if(!this.on())return;const a=ac();if(a)tone(f,a.currentTime,.35,.15,'triangle')}
};

/* Happy Birthday – music-box fallback if birthday.mp3 is missing */
const N={C4:261.63,D4:293.66,E4:329.63,F4:349.23,G4:392,A4:440,B4:493.88,C5:523.25,D5:587.33,E5:659.25,F5:698.46,G5:783.99};
const MELODY=[[N.G4,.75],[N.G4,.25],[N.A4,1],[N.G4,1],[N.C5,1],[N.B4,2],
  [N.G4,.75],[N.G4,.25],[N.A4,1],[N.G4,1],[N.D5,1],[N.C5,2],
  [N.G4,.75],[N.G4,.25],[N.G5,1],[N.E5,1],[N.C5,1],[N.B4,1],[N.A4,1],
  [N.F5,.75],[N.F5,.25],[N.E5,1],[N.C5,1],[N.D5,1],[N.C5,2]];
const Music={
  muted:false,box:false,want:false,timer:0,idx:0,ducked:false,
  start(){
    this.want=true;if(this.muted||this.ducked)return;
    const p=bgm.play();
    if(p&&p.catch)p.catch(()=>this.startBox());
  },
  startBox(){if(this.box||this.muted||this.ducked||!this.want)return;this.box=true;this.idx=0;this.step()},
  step(){
    if(!this.box)return;
    const m=MELODY[this.idx],a=ac();
    if(a){const t=a.currentTime;tone(m[0],t,1.5,.1,'triangle');tone(m[0]*2,t,.7,.03,'sine')}
    let wait=m[1]*430;this.idx++;
    if(this.idx>=MELODY.length){this.idx=0;wait+=2600}
    this.timer=setTimeout(()=>this.step(),wait);
  },
  stopBox(){this.box=false;clearTimeout(this.timer)},
  duck(){this.ducked=true;bgm.pause();this.stopBox()},
  unduck(){this.ducked=false;if(this.want&&!this.muted)this.start()},
  toggle(){
    this.muted=!this.muted;
    if(this.muted){bgm.pause();this.stopBox()}else if(this.want&&!this.ducked){this.start()}
    muteBtn.textContent=this.muted?'🔇':'🔊';
  }
};
bgm.volume=.8;
bgm.addEventListener('error',()=>Music.startBox());
muteBtn.onclick=()=>Music.toggle();

/* ---------------------------------------------------------------------
   CANVASES  (ambient bokeh + petals  /  fireworks, confetti, shards)
   --------------------------------------------------------------------- */
const bgc=$('bg'),bx=bgc.getContext('2d'),fxc=$('fx'),fx=fxc.getContext('2d');
let W=innerWidth,H=innerHeight,DPR=1;
function resize(){
  DPR=Math.min(window.devicePixelRatio||1,2);W=innerWidth;H=innerHeight;
  for(const c of [bgc,fxc]){c.width=W*DPR|0;c.height=H*DPR|0}
  bx.setTransform(DPR,0,0,DPR,0,0);fx.setTransform(DPR,0,0,DPR,0,0);
}
resize();addEventListener('resize',resize);

const bokeh=Array.from({length:24},()=>({x:Math.random(),y:Math.random(),r:rnd(16,72),vx:rnd(-.008,.008),vy:rnd(-.02,-.006),
  a:rnd(.05,.15),ph:rnd(0,TAU),h:pick([330,345,35,46,300])}));
const PETAL_COL=['#ffb3c7','#ff8fb1','#ffd0dc','#ff9db9'];
const newPetal=init=>({x:Math.random(),y:init?rnd(-.1,1):-.08,s:rnd(7,15),vy:rnd(.035,.075),sw:rnd(.4,1.2),ph:rnd(0,TAU),
  rot:rnd(0,TAU),vr:rnd(-1.2,1.2),fl:rnd(0,TAU),vf:rnd(1.5,3),c:pick(PETAL_COL)});
const petals=Array.from({length:14},()=>newPetal(true));

const hearts=Array.from({length:10},()=>({x:Math.random(),y:Math.random(),v:rnd(.02,.05),s:rnd(8,16),sw:rnd(.4,1),ph:rnd(0,TAU),c:pick(['#ff6f9f','#ff9db9','#ffb3c7'])}));
function drawBG(dt,T){
  bx.clearRect(0,0,W,H);
  bx.globalCompositeOperation='lighter';
  for(const b of bokeh){
    b.x+=b.vx*dt;b.y+=b.vy*dt;
    if(b.y<-.1){b.y=1.1;b.x=Math.random()}
    if(b.x<-.1)b.x=1.1;if(b.x>1.1)b.x=-.1;
    const al=b.a*(.65+.35*Math.sin(T*.6+b.ph)),x=b.x*W,y=b.y*H;
    const g=bx.createRadialGradient(x,y,b.r*.6,x,y,b.r);
    g.addColorStop(0,`hsla(${b.h},90%,70%,${al*.5})`);
    g.addColorStop(.85,`hsla(${b.h},90%,70%,${al})`);
    g.addColorStop(1,`hsla(${b.h},90%,70%,0)`);
    bx.fillStyle=g;bx.beginPath();bx.arc(x,y,b.r,0,TAU);bx.fill();
  }
  bx.globalCompositeOperation='source-over';
  for(let k=0;k<petals.length;k++){
    const p=petals[k];
    p.y+=p.vy*dt;p.rot+=p.vr*dt;p.fl+=p.vf*dt;
    if(p.y>1.08){petals[k]=newPetal(false);continue}
    const px=p.x*W+Math.sin(T*p.sw+p.ph)*34,py=p.y*H,s=p.s;
    bx.save();bx.translate(px,py);bx.rotate(p.rot);bx.scale(1,Math.abs(Math.cos(p.fl))*.85+.15);
    bx.globalAlpha=.6;bx.fillStyle=p.c;
    bx.beginPath();bx.moveTo(0,-s);
    bx.bezierCurveTo(s*.9,-s*.6,s*.8,s*.6,0,s);
    bx.bezierCurveTo(-s*.8,s*.6,-s*.9,-s*.6,0,-s);
    bx.fill();bx.restore();
  }
  for(const h of hearts){
    h.y-=h.v*dt;if(h.y<-.1){h.y=1.1;h.x=Math.random()}
    const hx=h.x*W+Math.sin(T*h.sw+h.ph)*24,hy=h.y*H,s=h.s*(1+.12*Math.sin(T*3+h.ph));
    bx.globalAlpha=.3;bx.fillStyle=h.c;bx.beginPath();bx.moveTo(hx,hy+s*.35);
    bx.bezierCurveTo(hx-s,hy-s*.4,hx-s*.5,hy-s*1.1,hx,hy-s*.5);bx.bezierCurveTo(hx+s*.5,hy-s*1.1,hx+s,hy-s*.4,hx,hy+s*.35);bx.fill();
  }
  bx.globalAlpha=1;
}

/* ---- fireworks / confetti / shards ---- */
const sparks=[],rockets=[],conf=[],shards=[],flashes=[];
const CONF_COL=['#ff6fa3','#ffd36e','#7ee8fa','#b388ff','#ff8a65','#69f0ae','#ffffff'];
function spark(x,y,vx,vy,o){
  sparks.push(Object.assign({x,y,vx,vy,life:1,decay:rnd(.008,.016),g:.04,drag:.985,size:1.8,h:40,s:100,l:65,tw:0},o||{}));
}
function glitter(x,y,n,hue){
  for(let k=0;k<n;k++)spark(x+rnd(-20,20),y,rnd(-2.4,2.4),rnd(-5.5,-1.2),
    {h:(hue||44)+rnd(-8,8),l:rnd(65,85),decay:rnd(.012,.022),g:.06,size:rnd(1.2,2.4),tw:1});
}
function explode(x,y,type){
  const hue=rnd(0,360);
  flashes.push({x,y,r:rnd(90,150),life:1,h:hue});
  if(type==='heart'){
    for(let k=0;k<70;k++){
      const t=k/70*TAU,hx=16*Math.pow(Math.sin(t),3),hy=-(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t));
      spark(x,y,hx*.27,hy*.27,{h:340+rnd(-12,12),l:68,decay:.011,g:.018,drag:.975,size:2.2});
    }
  }else if(type==='ring'){
    for(let k=0;k<64;k++){const a=k/64*TAU;spark(x,y,Math.cos(a)*3.9,Math.sin(a)*3.9,{h:hue,decay:.012,g:.025,drag:.975,size:2})}
  }else if(type==='willow'){
    for(let k=0;k<80;k++){const a=rnd(0,TAU),sp=rnd(1.5,4.2);
      spark(x,y,Math.cos(a)*sp,Math.sin(a)*sp,{h:42+rnd(-6,6),l:70,decay:.0055,g:.03,drag:.98,size:1.7,tw:1})}
  }else{
    for(let k=0;k<100;k++){const a=rnd(0,TAU),sp=rnd(1,5.4);
      spark(x,y,Math.cos(a)*sp,Math.sin(a)*sp,{h:hue+rnd(-25,25),decay:.012,g:.035,drag:.975,size:1.9})}
  }
}
function launch(x,ty){
  rockets.push({x:x===undefined?rnd(W*.15,W*.85):x,y:H+10,ty:ty===undefined?rnd(H*.12,H*.42):ty,
    type:pick(['peony','peony','ring','willow','heart'])});
}
function mkConf(o){
  return Object.assign({x:rnd(0,W),y:rnd(-40,-10),vx:rnd(-1,1),vy:rnd(1.2,3),g:.02,drag:.995,w:rnd(6,11),h:rnd(10,17),
    r:rnd(0,TAU),vr:rnd(-.2,.2),f:rnd(0,TAU),vf:rnd(.1,.26),c:pick(CONF_COL),sw:rnd(.6,1.6),ph:rnd(0,TAU)},o||{});
}
function cannon(n){
  n=n||70;
  for(let s=0;s<2;s++)for(let k=0;k<n;k++){const l=s===0;
    conf.push(mkConf({x:l?-10:W+10,y:H*.85,vx:(l?1:-1)*rnd(3,10),vy:-rnd(9,17),g:.28,drag:.985}))}
}
function rain(n){for(let k=0;k<n;k++)conf.push(mkConf())}
function shardBurst(x,y,color){
  for(let k=0;k<22;k++){const a=rnd(0,TAU),sp=rnd(2,8);
    shards.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-2,r:rnd(0,TAU),vr:rnd(-.4,.4),s:rnd(4,9),c:color,life:1})}
}

function drawFX(dt,T){
  const k=dt*60;
  fx.clearRect(0,0,W,H);
  fx.lineCap='round';
  /* rockets */
  for(let n=rockets.length-1;n>=0;n--){
    const r=rockets[n];
    r.vy=-Math.max(4,(r.y-r.ty)*.05);r.y+=r.vy*k;
    spark(r.x+rnd(-1,1),r.y,rnd(-.2,.2),rnd(.3,1),{h:38,l:72,decay:.06,size:1.4,g:.02});
    if(r.y<=r.ty+4){explode(r.x,r.y,r.type);rockets.splice(n,1)}
  }
  /* flashes + sparks glow */
  fx.globalCompositeOperation='lighter';
  for(let n=flashes.length-1;n>=0;n--){
    const f=flashes[n];f.life-=.08*k;
    if(f.life<=0){flashes.splice(n,1);continue}
    const g=fx.createRadialGradient(f.x,f.y,0,f.x,f.y,f.r);
    g.addColorStop(0,`hsla(${f.h},100%,80%,${f.life*.35})`);g.addColorStop(1,`hsla(${f.h},100%,60%,0)`);
    fx.fillStyle=g;fx.beginPath();fx.arc(f.x,f.y,f.r,0,TAU);fx.fill();
  }
  for(let n=sparks.length-1;n>=0;n--){
    const p=sparks[n];
    p.vx*=Math.pow(p.drag,k);p.vy=p.vy*Math.pow(p.drag,k)+p.g*k;
    p.x+=p.vx*k;p.y+=p.vy*k;p.life-=p.decay*k;
    if(p.life<=0){sparks.splice(n,1);continue}
    const al=clamp(p.life,0,1)*(p.tw?(.55+.45*Math.random()):1);
    fx.strokeStyle=`hsla(${p.h},${p.s}%,${p.l}%,${al})`;fx.lineWidth=p.size;
    fx.beginPath();fx.moveTo(p.x-p.vx*k*2.2,p.y-p.vy*k*2.2);fx.lineTo(p.x,p.y);fx.stroke();
  }
  fx.globalCompositeOperation='source-over';
  /* confetti */
  for(let n=conf.length-1;n>=0;n--){
    const p=conf[n];
    p.vy=Math.min(p.vy+p.g*k,3.6);p.vx*=Math.pow(p.drag,k);
    p.x+=p.vx*k+Math.sin(T*p.sw+p.ph)*.5*k;p.y+=p.vy*k;p.r+=p.vr*k;p.f+=p.vf*k;
    if(p.y>H+30){conf.splice(n,1);continue}
    fx.save();fx.translate(p.x,p.y);fx.rotate(p.r);fx.scale(1,Math.cos(p.f));
    fx.fillStyle=p.c;fx.fillRect(-p.w/2,-p.h/2,p.w,p.h);fx.restore();
  }
  /* balloon shards */
  for(let n=shards.length-1;n>=0;n--){
    const p=shards[n];
    p.vy+=.35*k;p.vx*=Math.pow(.98,k);p.x+=p.vx*k;p.y+=p.vy*k;p.r+=p.vr*k;p.life-=.022*k;
    if(p.life<=0){shards.splice(n,1);continue}
    fx.save();fx.translate(p.x,p.y);fx.rotate(p.r);fx.globalAlpha=clamp(p.life,0,1);fx.fillStyle=p.c;
    fx.beginPath();fx.moveTo(0,-p.s);fx.lineTo(p.s*.8,p.s*.6);fx.lineTo(-p.s*.8,p.s*.5);fx.closePath();fx.fill();fx.restore();
  }
  fx.globalAlpha=1;
}

let fwTimer=0;
function autoFX(dt){
  if(!fwOn)return;
  fwTimer-=dt;
  if(fwTimer<=0){launch();fwTimer=rnd(.5,1.1)}
  if(cur===12&&Math.random()<.35)rain(1);
}
let trailT=0;
addEventListener('pointermove',e=>{
  const n=performance.now();if(n-trailT<45)return;trailT=n;
  spark(e.clientX,e.clientY,rnd(-.6,.6),rnd(-1.3,-.2),{h:rnd(30,50),l:82,decay:.03,g:.02,size:2.2,tw:1});
});
document.addEventListener('pointerdown',e=>{
  if(!fwOn||(e.target.closest&&e.target.closest('button')))return;
  launch(e.clientX,e.clientY);
});

/* ---------------------------------------------------------------------
   MICROPHONE  (blow detection)
   --------------------------------------------------------------------- */
const Mic={
  on:false,stream:null,src:null,an:null,tb:null,fb:null,calT:0,base:.02,shown:0,
  async start(){
    if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia)throw new Error('nomic');
    const stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}});
    const a=ac();if(!a){stream.getTracks().forEach(t=>t.stop());throw new Error('noctx')}
    this.stream=stream;this.src=a.createMediaStreamSource(stream);
    this.an=a.createAnalyser();this.an.fftSize=1024;this.an.smoothingTimeConstant=.25;
    this.src.connect(this.an);
    this.tb=new Uint8Array(this.an.fftSize);this.fb=new Uint8Array(this.an.frequencyBinCount);
    this.calT=0;this.base=.02;this.shown=0;this.on=true;
  },
  stop(){
    if(this.stream)this.stream.getTracks().forEach(t=>t.stop());
    if(this.src)try{this.src.disconnect()}catch(e){}
    this.stream=null;this.src=null;this.on=false;
  },
  /* returns 0..1 "breath" strength */
  read(dt){
    if(!this.on)return 0;
    this.an.getByteTimeDomainData(this.tb);
    let s=0;for(let k=0;k<this.tb.length;k++){const v=(this.tb[k]-128)/128;s+=v*v}
    const rms=Math.sqrt(s/this.tb.length);
    this.an.getByteFrequencyData(this.fb);
    let low=0;for(let k=1;k<14;k++)low+=this.fb[k];low/=13*255;
    const raw=Math.max(rms*1.6,low*1.1);
    if(this.calT<.8){this.calT+=dt;this.base=Math.max(this.base,raw);this.shown=0;return 0}
    const thr=Math.max(.09,this.base*2.2+.03);
    this.shown=clamp(raw/(thr+.22),0,1);
    return clamp((raw-thr)/.22,0,1);
  }
};

/* ---------------------------------------------------------------------
   3D CAKE  (three.js)
   --------------------------------------------------------------------- */
const Cake=(function(){
  let R,S,Cam,G,pl,ready=false,failed=false,active=false,finished=false;
  let candles=[],smoke=[],fairy=[],breath=0,sim=0,glowOp=-1,tex={};
  const stage=$('stage'),cv=$('cakeCv'),rg=$('rg');
  const msg=t=>{$('wm').textContent=t};

  const cnv=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};

  function frostTex(base,hi,lo,label,fs){
    const T=THREE,c=cnv(1024,256),x=c.getContext('2d');
    x.fillStyle=base;x.fillRect(0,0,1024,256);
    for(let k=0;k<22000;k++){
      x.fillStyle=Math.random()<.5?hi:lo;x.globalAlpha=Math.random()*.08;
      x.beginPath();x.arc(Math.random()*1024,Math.random()*256,Math.random()*2.2+.4,0,TAU);x.fill();
    }
    for(let k=0;k<90;k++){x.globalAlpha=.05;x.fillStyle=Math.random()<.5?hi:lo;x.fillRect(Math.random()*1024,0,Math.random()*10+2,256)}
    x.strokeStyle=lo;x.lineWidth=2;
    for(let k=0;k<26;k++){x.globalAlpha=.07;const xx=Math.random()*1024,yy=Math.random()*256;x.beginPath();x.moveTo(xx,yy);x.bezierCurveTo(xx+60,yy-10,xx+120,yy+12,xx+200,yy);x.stroke()}
    for(const yy of [44,216]){
      x.globalAlpha=.22;x.fillStyle=lo;x.beginPath();x.moveTo(0,yy);
      for(let px=0;px<=1024;px+=16)x.lineTo(px,yy+Math.sin(px*.05+yy)*2.5);
      for(let px=1024;px>=0;px-=16)x.lineTo(px,yy+5+Math.sin(px*.05+yy)*2.5);x.fill();
    }
    if(label){
      x.globalAlpha=1;x.textAlign='center';x.textBaseline='middle';x.font=`${fs}px "Great Vibes","Brush Script MT",cursive`;
      x.shadowColor='rgba(80,40,10,.5)';x.shadowBlur=3;x.shadowOffsetY=2;x.fillStyle='#c4902f';x.fillText(label,512,134);
      x.shadowBlur=0;x.shadowOffsetY=0;x.fillStyle='rgba(255,236,170,.9)';x.fillText(label,511,132);
    }
    x.globalAlpha=1;
    const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.encoding=T.sRGBEncoding;t.anisotropy=8;return t;
  }
  function stripeTex(a,b){
    const T=THREE,c=cnv(64,120),x=c.getContext('2d');
    x.fillStyle=b;x.fillRect(0,0,64,120);x.fillStyle=a;
    for(let k=-2;k<8;k++){x.beginPath();x.moveTo(0,k*20);x.lineTo(64,k*20-20);x.lineTo(64,k*20-8);x.lineTo(0,k*20+12);x.closePath();x.fill()}
    const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.encoding=T.sRGBEncoding;return t;
  }
  function flameTex(){
    const T=THREE,c=cnv(128,256),x=c.getContext('2d');
    const drop=(s,col)=>{
      x.save();x.translate(64,212);x.scale(s,s);x.translate(-64,-212);
      x.beginPath();x.moveTo(64,12);x.bezierCurveTo(78,70,106,118,102,168);x.bezierCurveTo(99,212,29,212,26,168);x.bezierCurveTo(22,118,50,70,64,12);
      x.closePath();x.fillStyle=col;x.fill();x.restore();
    };
    const layer=(s,r,g,b,a)=>{for(let j=0;j<5;j++)drop(s*(1+.05*(2-j)),`rgba(${r},${g},${b},${a/5})`)};
    layer(1,255,92,10,.3);layer(.86,255,140,20,.5);layer(.68,255,196,60,.75);layer(.46,255,240,170,.9);layer(.26,255,255,255,.95);
    return new T.CanvasTexture(c);
  }
  function softTex(r,g,b,a0){
    const T=THREE,c=cnv(128,128),x=c.getContext('2d');
    const gr=x.createRadialGradient(64,64,0,64,64,64);
    gr.addColorStop(0,`rgba(${r},${g},${b},${a0})`);gr.addColorStop(.35,`rgba(${r},${g},${b},${a0*.4})`);gr.addColorStop(1,`rgba(${r},${g},${b},0)`);
    x.fillStyle=gr;x.fillRect(0,0,128,128);return new T.CanvasTexture(c);
  }

  function build(){
    const T=THREE;
    R=new T.WebGLRenderer({canvas:cv,antialias:true,alpha:true,powerPreference:'high-performance'});
    R.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
    R.outputEncoding=T.sRGBEncoding;R.toneMapping=T.ACESFilmicToneMapping;R.toneMappingExposure=1.05;
    R.shadowMap.enabled=true;R.shadowMap.type=T.PCFSoftShadowMap;
    S=new T.Scene();Cam=new T.PerspectiveCamera(32,1,.1,60);
    G=new T.Group();S.add(G);

    /* lights */
    S.add(new T.HemisphereLight(0xffe6f0,0x3a1838,.75));
    const key=new T.DirectionalLight(0xfff0e0,1.0);key.position.set(4.5,8,5.5);key.castShadow=true;
    key.shadow.mapSize.set(1024,1024);
    const sc=key.shadow.camera;sc.left=-4;sc.right=4;sc.top=5;sc.bottom=-3;sc.near=1;sc.far=25;
    key.shadow.bias=-.0004;S.add(key);
    const rim=new T.DirectionalLight(0xff8fbf,.55);rim.position.set(-5,3.5,-4);S.add(rim);
    pl=new T.PointLight(0xffa04a,0,9,1.4);pl.position.set(0,3.5,0);S.add(pl);
    const gp=new T.Mesh(new T.PlaneGeometry(16,16),new T.ShadowMaterial({opacity:.4}));
    gp.rotation.x=-Math.PI/2;gp.receiveShadow=true;S.add(gp);

    const M=o=>new T.MeshStandardMaterial(o),P=o=>new T.MeshPhysicalMaterial(o);
    const add=(geo,mat,x,y,z,cast,recv)=>{
      const m=new T.Mesh(geo,mat);m.position.set(x,y,z);
      m.castShadow=cast!==false;m.receiveShadow=recv!==false;G.add(m);return m;
    };

    /* cake stand */
    const porcelain=P({color:0xfffaf5,roughness:.25,clearcoat:.8,clearcoatRoughness:.15});
    const gold=M({color:0xe3be72,metalness:.95,roughness:.28});
    add(new T.CylinderGeometry(1.15,1.2,.07,64),gold,0,.035,0);
    add(new T.CylinderGeometry(.2,.32,.42,32),gold,0,.28,0);
    add(new T.CylinderGeometry(2.35,2.2,.09,96),porcelain,0,.5,0);
    const lip=add(new T.TorusGeometry(2.35,.05,16,96),porcelain,0,.545,0);lip.rotation.x=Math.PI/2;

    /* tiers */
    const tiers=[
      {r:1.85,h:.82,base:'#f4b9cb',hi:'#ffffff',lo:'#c9738f',rim:0xffd0de,drip:0xffe6ee,rep:3,label:NAME,fs:150},
      {r:1.38,h:.72,base:'#fff4ec',hi:'#ffffff',lo:'#e6c9b8',rim:0xffffff,drip:0xf6a9c0,rep:3,label:'Happy Birthday',fs:118},
      {r:.95,h:.62,base:'#eea3bb',hi:'#ffffff',lo:'#b95b7b',rim:0xffc2d4,drip:0xffffff,rep:2}
    ];
    let y=.545;
    tiers.forEach(t=>{
      const tx=frostTex(t.base,t.hi,t.lo,t.label,t.fs);tx.repeat.set(t.rep,1);
      const mat=P({map:tx,bumpMap:tx,bumpScale:1.4,roughness:.42,clearcoat:.25,clearcoatRoughness:.5});
      add(new T.CylinderGeometry(t.r,t.r,t.h,96),mat,0,y+t.h/2,0);
      t.bot=y;y+=t.h;t.top=y;
      const rm=add(new T.TorusGeometry(t.r,.075,16,96),P({color:t.rim,roughness:.3,clearcoat:.5}),0,t.top,0);rm.rotation.x=Math.PI/2;
    });

    /* gold pearls at the foot of each tier */
    const pearlGeo=new T.SphereGeometry(.045,12,10);
    tiers.forEach(t=>{
      const n=Math.floor(TAU*t.r/.11),im=new T.InstancedMesh(pearlGeo,gold,n);
      const m=new T.Matrix4(),q=new T.Quaternion(),s=new T.Vector3(1,1,1),p=new T.Vector3();
      for(let k=0;k<n;k++){const a=k/n*TAU;p.set(Math.cos(a)*(t.r+.005),t.bot+.05,Math.sin(a)*(t.r+.005));m.compose(p,q,s);im.setMatrixAt(k,m)}
      im.castShadow=true;G.add(im);
    });

    /* drips */
    tiers.forEach(t=>{
      const mat=P({color:t.drip,roughness:.22,clearcoat:.7,clearcoatRoughness:.2});
      const n=Math.floor(TAU*t.r/.3);
      for(let j=0;j<n;j++){
        const a=j/n*TAU+rnd(-.08,.08),len=rnd(.1,.42),rad=rnd(.05,.085);
        add(new T.CapsuleGeometry(rad,len,3,10),mat,Math.cos(a)*(t.r+.01),t.top-rad-len/2+.03,Math.sin(a)*(t.r+.01),true,false);
      }
    });

    /* piped dollops + cherries */
    const prof=[[0,0],[.09,0],[.115,.04],[.1,.09],[.105,.13],[.075,.18],[.05,.23],[.022,.28],[0,.31]].map(p=>new T.Vector2(p[0],p[1]));
    const dolGeo=new T.LatheGeometry(prof,16);
    const dolMat=c=>P({color:c,roughness:.35,clearcoat:.3});
    const cherryMat=P({color:0xc4081f,roughness:.22,clearcoat:1,clearcoatRoughness:.08});
    const stemMat=M({color:0x4d6a2a,roughness:.7});
    const ring=(radius,n,topY,fn)=>{for(let k=0;k<n;k++){const a=k/n*TAU;fn(k,Math.cos(a)*radius,topY,Math.sin(a)*radius)}};
    const dollop=(x,yy,z,c)=>{const d=add(dolGeo,dolMat(c),x,yy,z);d.scale.setScalar(rnd(.9,1.15));d.rotation.y=rnd(0,TAU);return d};
    const cherry=(x,yy,z)=>{
      add(new T.SphereGeometry(.13,24,18),cherryMat,x,yy+.12,z);
      const st=add(new T.CylinderGeometry(.008,.008,.26,6),stemMat,x+.04,yy+.34,z,true,false);st.rotation.z=-.35;
    };
    ring(1.62,14,tiers[0].top,(k,x,yy,z)=>{if(k%2)dollop(x,yy,z,0xffffff);else cherry(x,yy+.02,z)});
    const sbC=cnv(128,128),sx=sbC.getContext('2d');sx.fillStyle='#d3122f';sx.fillRect(0,0,128,128);sx.fillStyle='#ffe6a6';
    for(let i=0;i<46;i++){sx.beginPath();sx.ellipse(rnd(0,128),rnd(0,128),1.6,2.6,0,0,TAU);sx.fill()}
    const sbT=new T.CanvasTexture(sbC);sbT.wrapS=sbT.wrapT=T.RepeatWrapping;sbT.encoding=T.sRGBEncoding;
    const sbGeo=new T.LatheGeometry([[0,0],[.14,.01],[.16,.06],[.14,.14],[.1,.22],[.05,.28],[0,.31]].map(p=>new T.Vector2(p[0],p[1])),20);
    const sbMat=P({map:sbT,roughness:.28,clearcoat:.8,clearcoatRoughness:.2}),leafMat=M({color:0x3a7d2c,roughness:.6});
    ring(1.17,12,tiers[1].top,(k,x,yy,z)=>{
      if(k%3===0){const b=add(sbGeo,sbMat,x,yy,z);b.scale.setScalar(1.15);b.rotation.y=rnd(0,TAU);
        const lf=add(new T.ConeGeometry(.1,.05,6),leafMat,x,yy+.01,z,false,false);lf.scale.set(1.2,1,1.2)}
      else dollop(x,yy,z,k%2?0xffd3e0:0xfff6ee);
    });
    /* sprinkles */
    const spGeo=new T.CylinderGeometry(.012,.012,.07,6),qf=new T.Quaternion().setFromEuler(new T.Euler(0,0,Math.PI/2)),upv=new T.Vector3(0,1,0);
    tiers.forEach((t,ti)=>{
      const inner=ti<2?tiers[ti+1].r+.1:.12,outer=t.r-.12;
      [0xff5fa2,0xffd36e,0x6fd3ea,0xffffff,0xb388ff].forEach(col=>{
        const im=new T.InstancedMesh(spGeo,M({color:col,roughness:.4}),22),m=new T.Matrix4(),q=new T.Quaternion(),p=new T.Vector3(),s1=new T.Vector3(1,1,1);
        for(let k=0;k<22;k++){const a=rnd(0,TAU),rr=Math.sqrt(rnd(inner*inner,outer*outer));
          q.setFromAxisAngle(upv,rnd(0,TAU)).multiply(qf);p.set(Math.cos(a)*rr,t.top+.014,Math.sin(a)*rr);m.compose(p,q,s1);im.setMatrixAt(k,m)}
        G.add(im);
      });
    });
    /* fairy lights on the cake plate */
    const fairyT=softTex(255,226,160,1);
    for(let k=0;k<28;k++){const a=k/28*TAU,sp=new T.Sprite(new T.SpriteMaterial({map:fairyT,blending:T.AdditiveBlending,transparent:true,depthWrite:false,toneMapped:false}));
      sp.scale.set(.24,.24,1);sp.position.set(Math.cos(a)*2.22,.62,Math.sin(a)*2.22);G.add(sp);fairy.push(sp)}
    ring(.8,10,tiers[2].top,(k,x,yy,z)=>{dollop(x,yy,z,0xffffff)});

    /* candles */
    const flameT=flameTex(),glowT=softTex(255,170,60,.9),emberT=softTex(255,110,30,1),smokeT=softTex(200,200,210,.55);
    tex.smoke=smokeT;
    const stripes=[['#ff7eb6','#ffffff'],['#f5c86a','#ffffff'],['#6fd3ea','#ffffff']].map(p=>stripeTex(p[0],p[1]));
    const top=tiers[2].top,CH=.72,pos=[[0,0]];
    for(let k=0;k<6;k++){const a=k/6*TAU;pos.push([Math.cos(a)*.56,Math.sin(a)*.56])}
    const sprMat=(map,op)=>new T.SpriteMaterial({map,blending:T.AdditiveBlending,transparent:true,depthWrite:false,toneMapped:false,opacity:op});
    pos.forEach((p,k)=>{
      const st=stripes[k%3];st.repeat.set(1,1);
      add(new T.CylinderGeometry(.05,.05,CH,20),M({map:st,roughness:.5}),p[0],top+CH/2,p[1]);
      const wick=add(new T.CylinderGeometry(.009,.009,.09,6),M({color:0x222222,roughness:.8,emissive:0x000000}),p[0],top+CH+.03,p[1],false,false);
      const core=new T.Sprite(sprMat(flameT,1));core.center.set(.5,.12);core.scale.set(.17,.34,1);core.position.set(p[0],top+CH+.06,p[1]);G.add(core);
      const glow=new T.Sprite(sprMat(glowT,.8));glow.scale.set(.9,.9,1);glow.position.set(p[0],top+CH+.2,p[1]);G.add(glow);
      const ember=new T.Sprite(sprMat(emberT,0));ember.scale.set(.16,.16,1);ember.position.set(p[0],top+CH+.07,p[1]);ember.visible=false;G.add(ember);
      candles.push({x:p[0],z:p[1],y:top+CH,core,glow,ember,wick,lit:true,hold:0,need:rnd(.4,1.1),ph:rnd(0,TAU),smokeLeft:0,smokeAcc:0,emberT:0});
    });
    /* smoke pool */
    for(let k=0;k<80;k++){
      const sp=new T.Sprite(new T.SpriteMaterial({map:smokeT,transparent:true,depthWrite:false,opacity:0,toneMapped:false}));
      sp.visible=false;G.add(sp);smoke.push({s:sp,age:0,life:1,on:false,x0:0,z0:0,vy:0,dr:0,ph:0});
    }
    onResize();
  }

  function onResize(){
    if(!R)return;
    const w=stage.clientWidth||300,h=stage.clientHeight||300;
    R.setSize(w,h,false);Cam.aspect=w/h;
    const d=8.8*clamp(.95/Cam.aspect,1,1.5);
    Cam.position.set(0,3.5*(d/8.8),d);Cam.lookAt(0,1.75,0);Cam.updateProjectionMatrix();
  }
  addEventListener('resize',onResize);

  function spawnSmoke(c){
    const p=smoke.find(q=>!q.on);if(!p)return;
    p.on=true;p.age=0;p.life=rnd(2.2,3);p.x0=c.x;p.z0=c.z;p.vy=rnd(.28,.4);p.dr=rnd(-.1,.1);p.ph=rnd(0,TAU);
    p.s.visible=true;p.s.position.set(c.x,c.y+.1,c.z);p.s.scale.set(.05,.05,1);
  }
  function extinguish(c){
    c.lit=false;c.core.visible=false;c.glow.visible=false;
    c.smokeLeft=1.6;c.emberT=2;c.ember.visible=true;sfx.puff();
  }
  function resetCandles(){
    candles.forEach(c=>{c.lit=true;c.hold=0;c.need=rnd(.4,1.1);c.core.visible=true;c.glow.visible=true;c.ember.visible=false;c.smokeLeft=0;c.emberT=0});
    smoke.forEach(p=>{p.on=false;p.s.visible=false});
    breath=0;sim=0;if(pl)pl.intensity=0;
  }

  function setControls(state){
    $('mic').hidden=state!=='start';
    $('meter').hidden=state!=='listening';
    $('blow').hidden=state==='done';
  }

  function allOut(){
    finished=true;Mic.stop();Music.unduck();setControls('done');
    msg('Wish maang li? Ab poori hogi ✨');
    sfx.tada();cannon(50);
    for(let k=0;k<4;k++)later(()=>launch(),k*260);
    later(()=>go(4),3300);
  }

  function frame(dt,T){
    if(!active||!ready)return;
    /* breath input */
    let target=0;
    if(sim>0){sim-=dt;target=.9+.1*Math.sin(T*30)}
    else if(Mic.on){target=Mic.read(dt);$('mbar').style.width=(Mic.shown*100).toFixed(0)+'%'}
    breath+=(target-breath)*(1-Math.exp(-dt*(target>breath?14:5)));

    let litN=0;
    const stress=clamp(breath*1.1,0,1);
    for(const c of candles){
      if(c.lit&&!finished){
        if(breath>.18){c.hold+=dt*breath;if(c.hold>=c.need){extinguish(c)}}
        else c.hold=Math.max(0,c.hold-dt*.9);
      }
      if(c.lit){
        litN++;
        const k=clamp(c.hold/c.need,0,1);
        const fl=1+.07*Math.sin(T*18+c.ph)+.05*Math.sin(T*29+c.ph*2)+.04*Math.sin(T*7.3+c.ph*3);
        const shrink=1-.5*Math.max(k,stress*.8);
        c.core.scale.set(.17*fl*(1-.15*stress),.34*fl*(1+.1*Math.sin(T*11+c.ph))*shrink,1);
        c.core.material.rotation=Math.sin(T*3.1+c.ph)*.06+stress*.28*Math.sin(T*22+c.ph)-stress*.3;
        c.glow.material.opacity=.8*fl*shrink;
        const gs=.8*(.9+.2*fl)*(.6+.4*shrink);c.glow.scale.set(gs,gs,1);
      }else{
        if(c.smokeLeft>0){c.smokeLeft-=dt;c.smokeAcc+=dt;while(c.smokeAcc>.09){c.smokeAcc-=.09;spawnSmoke(c)}}
        if(c.emberT>0){c.emberT-=dt;c.ember.material.opacity=clamp(c.emberT/2,0,1)*.9;if(c.emberT<=0)c.ember.visible=false}
      }
    }
    for(const p of smoke){
      if(!p.on)continue;
      p.age+=dt;const u=p.age/p.life;
      if(u>=1){p.on=false;p.s.visible=false;continue}
      p.s.position.y+=p.vy*dt;
      p.s.position.x=p.x0+Math.sin(p.age*3+p.ph)*.04*(.3+u)+p.dr*p.age;
      const sc=.05+.32*u;p.s.scale.set(sc,sc,1);
      p.s.material.opacity=.34*(1-u)*(u<.1?u/.1:1);
    }
    /* warm light + room glow follow the flames */
    const frac=litN/candles.length;
    pl.intensity+=(frac*1.5*(1+.08*Math.sin(T*14))-pl.intensity)*Math.min(1,dt*8);
    const go2=.12+.88*frac;
    if(Math.abs(go2-glowOp)>.01){glowOp=go2;rg.style.opacity=go2.toFixed(2)}

    fairy.forEach((f,i)=>{f.material.opacity=.35+.65*Math.pow(Math.sin(T*2.2+i*1.7),2)});
    G.rotation.y+=dt*.28;
    R.render(S,Cam);
    if(litN===0&&!finished)allOut();
  }

  /* ---- public ---- */
  function prepare(){
    if(ready||failed)return;
    try{if(!window.THREE)throw new Error('no three');build();ready=true}
    catch(err){console.error(err);failed=true}
  }
  function enter(){
    active=true;finished=false;glowOp=-1;
    msg('Pehle mic on karein, phir candles par zor se phoonk maariye 🌬️');
    setControls('start');Mic.stop();
    prepare();
    if(failed){
      cakeFailed=true;nx.style.display='';
      stage.innerHTML='<div class="cake-fallback">🎂</div>';
      msg('3D cake is device par nahi chal paya, neeche button se candles bujha dein 🙏');
      $('mic').hidden=true;
      return;
    }
    resetCandles();onResize();
  }
  function leave(){active=false;Mic.stop();Music.unduck();breath=0}
  function blowManual(){
    if(finished)return;
    if(failed){finished=true;allOut();return}
    sim=1.8;msg('Phoo… 🌬️');
  }
  async function useMic(){
    if(finished)return;
    Music.duck();
    try{
      await Mic.start();
      setControls('listening');msg('Zara khamoshi… mic set ho raha hai 🎧');
      later(()=>{if(Mic.on&&!finished)msg('Ab zor se phoonk maariye 🌬️ (mic ke bilkul qareeb)')},900);
    }catch(e){
      Music.unduck();
      if(e&&e.name==='NotAllowedError')msg('Mic ki ijazat nahi mili. Neeche wale button se candles bujha dein 🙏');
      else if(e&&e.message==='nomic')msg('Mic sirf https link par chalta hai. Neeche wale button se bujha dein 🙏');
      else msg('Mic shuru nahi ho saka. Neeche wale button se bujha dein 🙏');
    }
  }
  return {prepare,enter,leave,frame,blowManual,useMic};
})();
$('mic').onclick=()=>Cake.useMic();
$('blow').onclick=()=>Cake.blowManual();

/* ---------------------------------------------------------------------
   PAGE BUILDERS
   --------------------------------------------------------------------- */
/* name letters */
const nameHTML=Array.from(NAME).map((c,k)=>`<span style="--i:${k}">${c}</span>`).join('');
$('nm').innerHTML=nameHTML;$('nm2').innerHTML=nameHTML;

/* night sky */
function buildSky(){
  const st=$('stars');
  for(let k=0;k<90;k++){
    const d=document.createElement('i');
    d.style.cssText=`left:${rnd(0,100).toFixed(1)}%;top:${rnd(0,68).toFixed(1)}%;--s:${rnd(1,2.6).toFixed(1)}px;animation-delay:${rnd(0,4).toFixed(1)}s;animation-duration:${rnd(2,5).toFixed(1)}s`;
    st.appendChild(d);
  }
  const mk=(minH,maxH,fill,lit)=>{
    let x=0,s='';
    while(x<1200){
      const w=rnd(30,70),h=rnd(minH,maxH);
      s+=`<rect x="${x.toFixed(0)}" y="${(220-h).toFixed(0)}" width="${w.toFixed(0)}" height="${h.toFixed(0)}" fill="${fill}"/>`;
      if(lit)for(let wy=220-h+8;wy<210;wy+=14)for(let wx=x+6;wx<x+w-8;wx+=11)
        if(Math.random()<.28)s+=`<rect class="wn" x="${wx.toFixed(0)}" y="${wy.toFixed(0)}" width="4" height="6" fill="#ffd98a" style="animation-delay:${rnd(0,6).toFixed(1)}s"/>`;
      x+=w+rnd(0,6);
    }
    return s;
  };
  $('city').innerHTML=mk(50,130,'#1d1035',false)+mk(30,100,'#0c0617',true);
}
buildSky();

/* balloons */
const BAL=[['#ff9fc0','#ff3d7f','#b3124f'],['#ffe9a3','#ffc83d','#c28a00'],['#b5f1ff','#2fc6e8','#0a7f9e'],
  ['#d9c2ff','#8f5cff','#53279e'],['#ffc2a8','#ff6a3d','#a63410'],['#b9ffd5','#2fd57a','#0c8346']];
const WISH=['Khushi 💖','Hansi 😊','Pyar 💕','Sehat 🌸','Kamyabi ✨','Dosti 🤗','Sukoon 🕊️'];
function buildBalloons(){
  const ar=$('ar');ar.innerHTML='';let left=14;
  const upd=()=>{$('bleft').textContent=left?`${left} ghubare baqi hain`:'Sab phoot gaye!'};
  $('bmsg').textContent='';upd();
  for(let k=0;k<14;k++){
    const b=BAL[k%6],row=k<7?0:1,col=k%7,el=document.createElement('div');
    el.className='bal';
    el.style.cssText=`--l:${b[0]};--c:${b[1]};--k:${b[2]};left:${(col*13.6+rnd(-1,2)).toFixed(1)}%;top:${(row?44+rnd(-2,6):2+rnd(0,8)).toFixed(1)}%;--bw:${rnd(.92,1.1).toFixed(2)};--dl:${rnd(0,1.2).toFixed(2)}s;--sd:${rnd(3.2,5).toFixed(2)}s;--sl:${rnd(-2,0).toFixed(2)}s`;
    el.innerHTML='<div class="bb"><span class="bl"></span><span class="str"></span></div>';
    el.addEventListener('pointerdown',e=>{
      e.stopPropagation();
      const r=el.querySelector('.bb').getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
      shardBurst(cx,cy,b[1]);sfx.pop();
      const w=document.createElement('div');w.className='wishf';w.textContent=pick(WISH);w.style.left=cx+'px';w.style.top=cy+'px';
      document.body.appendChild(w);setTimeout(()=>w.remove(),1600);
      el.remove();left--;upd();
      if(!left){$('bmsg').textContent='Saari duaayein qabool! 🎉💖';sfx.tada();cannon(40);rain(40)}
    });
    ar.appendChild(el);
  }
}

/* VIP lucky wheel (replaces cuties) */
const PRIZES=[['🍰','Ek bada sa cake ka slice, sirf aap ke liye!'],['🤗','Ek lamba, tight sa birthday hug!'],['💐','Gulaab ka phool aur dher saara pyar!'],
  ['🍫','Aap ki favourite chocolate treat!'],['🎬','Movie night — popcorn meri taraf se!'],['🤲','Meri har dua mein aap ka naam!'],
  ['👑','Aaj ki Queen aap hain, Areeshaaa!'],['🌟','Aap ki har wish poori hogi, InshaAllah!']];
const SEG=360/PRIZES.length,SEGCOL=['#5b1d6e','#e8a1b8','#7d2a62','#f0c273','#4a1a5a','#ff8fb1','#8a2d5c','#e0a85c'];
let wheelRot=0,wheelBusy=false;
function buildWheel(){
  const w=$('wheel');if(w.dataset.built)return;w.dataset.built=1;
  const pt=(a,r)=>{const t=(a-90)*Math.PI/180;return [(Math.cos(t)*r).toFixed(2),(Math.sin(t)*r).toFixed(2)]};
  let s='';
  PRIZES.forEach((p,i)=>{
    const a0=i*SEG-SEG/2,a1=i*SEG+SEG/2,A=pt(a0,100),B=pt(a1,100);
    s+=`<path d="M0 0L${A[0]} ${A[1]}A100 100 0 0 1 ${B[0]} ${B[1]}Z" fill="${SEGCOL[i]}" stroke="#fff1c9" stroke-width=".8" data-i="${i}"/>`;
    s+=`<text transform="rotate(${i*SEG}) translate(0,-68)" font-size="26" text-anchor="middle" dominant-baseline="central">${p[0]}</text>`;
  });
  w.innerHTML=s;
  const L=$('wLights');L.innerHTML='';
  for(let k=0;k<20;k++){const i=document.createElement('i'),t=k/20*TAU;i.style.left=(50+Math.sin(t)*47)+'%';i.style.top=(50-Math.cos(t)*47)+'%';i.style.margin='-4.5px';L.appendChild(i)}
}
function spinWheel(){
  if(wheelBusy)return;wheelBusy=true;
  const wrap=$('wheelWrap'),w=$('wheel'),ptr=$('wPtr');
  wrap.classList.add('spinning');w.querySelectorAll('.win').forEach(e=>e.classList.remove('win'));
  $('cmsg').textContent='Ghoom raha hai… 🤞';
  const k=Math.random()*PRIZES.length|0;
  const base=wheelRot-(wheelRot%360);
  wheelRot=base+360*(5+(Math.random()*2|0))+(360-k*SEG)+rnd(-SEG*.32,SEG*.32);
  w.style.transform=`rotate(${wheelRot}deg)`;sfx.sparkle();
  let lastSeg=-1,run=true;
  const watch=()=>{
    if(!run)return;
    const m=new DOMMatrix(getComputedStyle(w).transform),ang=(Math.atan2(m.b,m.a)*180/Math.PI+360)%360,idx=Math.floor((ang+SEG/2)/SEG);
    if(idx!==lastSeg){lastSeg=idx;ptr.classList.remove('flick');void ptr.offsetWidth;ptr.classList.add('flick');
      const a=ac();if(a&&!Music.muted)tone(900+idx*40,a.currentTime,.06,.06,'square')}
    requestAnimationFrame(watch);
  };
  requestAnimationFrame(watch);
  const done=()=>{
    run=false;w.removeEventListener('transitionend',done);
    wrap.classList.remove('spinning');wheelBusy=false;
    const m=$('cmsg');m.textContent=PRIZES[k][0]+' '+PRIZES[k][1];m.classList.remove('pop');void m.offsetWidth;m.classList.add('pop');
    w.querySelector(`path[data-i="${k}"]`).classList.add('win');
    sfx.tada();cannon(40);
    const r=wrap.getBoundingClientRect();for(let n=0;n<5;n++)later(()=>glitter(r.left+r.width/2,r.top+r.height*.45,26,44),n*120);
    later(()=>$('cmsg').textContent+=' (Dobara ghumayein 👑)',2600);
  };
  w.addEventListener('transitionend',done);
}
$('spin').addEventListener('pointerdown',e=>{e.stopPropagation();spinWheel()});

/* letter */
const LETTER='Areeshaaa, aap meri zindagi ki un khoobsurat doston mein se hain jin ke baghair sab adhoora lagta hai. Allah aap ko hamesha khush rakhe, aap ke saare khwab poore hon. Happy Birthday meri jaan! 💖';
function typeLetter(){
  const el=$('typed'),pg=$('paper'),ch=Array.from(LETTER);
  el.textContent='';pg.classList.remove('signed');el.classList.add('writing');
  let n=0;
  const step=()=>{
    n++;el.textContent=ch.slice(0,n).join('');
    if(n>=ch.length){el.classList.remove('writing');pg.classList.add('signed');sfx.chime(3);return}
    later(step,/[.,!]/.test(ch[n-1])?320:rnd(34,70));
  };
  later(step,1100);
}


/* scratch surprises */
const VOUCH=[['🍰','Aap ki pasand ka ek bada sa treat'],['🤗','Ek lamba, tight sa birthday hug'],['🤲','Meri har dua mein hamesha aap ka naam']];
function buildVouch(){
  const box=$('vouch');box.innerHTML='';
  VOUCH.forEach((v,k)=>{
    const d=document.createElement('div');d.className='vc';
    d.innerHTML=`<em>${v[0]}</em><span>${v[1]}</span><canvas></canvas>`;box.appendChild(d);
    const cv=d.querySelector('canvas'),w=d.clientWidth,h=d.clientHeight,dp=Math.min(devicePixelRatio||1,2);
    cv.width=w*dp;cv.height=h*dp;const x=cv.getContext('2d');x.scale(dp,dp);
    const g=x.createLinearGradient(0,0,w,h);g.addColorStop(0,'#f6d28a');g.addColorStop(.5,'#fff0c4');g.addColorStop(1,'#d9a24f');
    x.fillStyle=g;x.fillRect(0,0,w,h);
    x.fillStyle='rgba(120,70,20,.6)';x.font='800 16px Manrope,sans-serif';x.textAlign='center';x.textBaseline='middle';
    x.fillText(`✨ Scratch karein · ${k+1} ✨`,w/2,h/2);
    let down=false,cnt=0;
    const check=()=>{
      const a=x.getImageData(0,0,cv.width,cv.height).data;let c=0,n=0;
      for(let i=3;i<a.length;i+=64){n++;if(a[i]<20)c++}
      if(c/n>.5&&!d.classList.contains('done')){
        d.classList.add('done');sfx.sparkle();sfx.chime(k+2);
        const r=d.getBoundingClientRect();glitter(r.left+r.width/2,r.top+r.height/2,30,45);cannon(14);
      }
    };
    const scr=e=>{
      const r=cv.getBoundingClientRect();
      x.globalCompositeOperation='destination-out';x.beginPath();
      x.arc((e.clientX-r.left)*w/r.width,(e.clientY-r.top)*h/r.height,20,0,TAU);x.fill();
      if(++cnt%6===0)check();
    };
    cv.addEventListener('pointerdown',e=>{e.stopPropagation();down=true;try{cv.setPointerCapture(e.pointerId)}catch(_){}scr(e)});
    cv.addEventListener('pointermove',e=>{if(down)scr(e)});
    ['pointerup','pointercancel'].forEach(n=>cv.addEventListener(n,()=>{down=false;check()}));
  });
}

/* VIP password gate */
const PASSCODE='1130';
const HINT_TEXT='Hint: ye code ham dono ky special days ky number hain 💌';   // 3 galat koshishon ke baad dikhta hai
let pin='',unlocked=false,gateBusy=false,fails=0;
function renderPin(){[...$('pin').children].forEach((d,i)=>{d.classList.toggle('on',i<pin.length);d.classList.toggle('cur',i===pin.length)})}
function pinKey(k,btn){
  if(unlocked||gateBusy)return;
  $('vipHint').textContent='';
  if(btn){btn.classList.remove('hit');void btn.offsetWidth;btn.classList.add('hit');
    const r=btn.getBoundingClientRect();glitter(r.left+r.width/2,r.top+r.height/2,5,44)}
  if(k==='del'){pin=pin.slice(0,-1);renderPin();sfx.puff();return}
  if(pin.length>=4)return;
  pin+=k;renderPin();sfx.chime(pin.length-1);
  if(pin.length===4){gateBusy=true;setTimeout(checkPin,260)}
}
function checkPin(){
  const v=$('vip');
  if(pin===PASSCODE){
    unlocked=true;v.classList.add('open');$('vipSub').textContent='Access mil gaya! Welcome, Areeshaaa 👑';
    Music.start();sfx.tada();sfx.sparkle();cannon(50);
    for(let k=0;k<4;k++)later(()=>launch(),k*260);
    const r=v.getBoundingClientRect();for(let k=0;k<6;k++)later(()=>glitter(r.left+r.width/2,r.top+r.height*.25,26,44),k*140);
    later(()=>$('intro').classList.remove('locked'),2300);
  }else{
    fails++;v.classList.add('wrong');
    const a=ac();if(a&&!Music.muted){const t=a.currentTime;tone(196,t,.22,.12,'sawtooth');tone(165,t+.16,.3,.12,'sawtooth')}
    $('vipHint').textContent=fails>=3?HINT_TEXT:'Galat code 🙈 dobara koshish karein';
    setTimeout(()=>{v.classList.remove('wrong');pin='';renderPin();gateBusy=false},650);
  }
}
$('pad').addEventListener('pointerdown',e=>{const b=e.target.closest('button');if(!b)return;e.stopPropagation();e.preventDefault();pinKey(b.dataset.k,b)});
addEventListener('keydown',e=>{
  if(cur!==0||unlocked)return;
  if(/^[0-9]$/.test(e.key))pinKey(e.key);else if(e.key==='Backspace')pinKey('del');
});
renderPin();

/* ---------------------------------------------------------------------
   PAGE HOOKS & NAVIGATION
   --------------------------------------------------------------------- */
function openEnvelope(){
  if(!unlocked)return;
  const e=$('env');if(e.classList.contains('open'))return;
  e.classList.add('open');$('envStage').classList.add('open');Music.start();sfx.chime(0);sfx.sparkle();
  {const r=e.getBoundingClientRect();for(let k=0;k<12;k++)toss(pick(['💖','💕','✨','💗']),r.left+r.width/2,r.top+r.height*.4,{vx:rnd(-170,170),vy:rnd(-460,-240),g:480,T:1.9,rot:rnd(-90,90),fs:rnd(20,34)});glitter(r.left+r.width/2,r.top,30,340)}
  later(()=>go(1),2100);
}
$('start').onclick=openEnvelope;$('seal').onclick=openEnvelope;

const CAPS={3:'Tayyar ho jayein… 💕',2:'Bas zara sa aur… ✨',1:'Aur ab… 🎁'};
function countdownHook(){
  const c=$('cd'),t=$('ttl'),w=$('cdw'),pk=$('cdPks');
  t.classList.remove('show');pk.classList.remove('show');w.classList.remove('gone','tick');
  const setN=(v,f)=>{c.textContent=v;w.dataset.n=v;$('cdCap').textContent=CAPS[v]||'';w.classList.remove('tick');void w.offsetWidth;w.classList.add('tick');sfx.beep(f);
    glitter(W/2,H*.4,14,v*100)};
  setN(3,392);later(()=>setN(2,440),1000);later(()=>setN(1,494),2000);
  later(()=>{
    c.textContent='🎉';w.dataset.n='go';$('cdCap').textContent='';w.classList.remove('tick');void w.offsetWidth;w.classList.add('tick');
    sfx.tada();cannon(60);for(let k=0;k<5;k++)later(()=>launch(),k*220);
    later(()=>{w.classList.add('gone');t.classList.add('show');pk.classList.add('show');sfx.sparkle();
      for(let k=0;k<7;k++)later(()=>glitter(rnd(W*.2,W*.8),H*rnd(.3,.45),22,44),k*170)},700);
  },3000);
}

function giftHook(){
  const sc=$('giftScene'),w=$('gwrap');GiftFX.clear();
  sc.classList.remove('open');w.classList.remove('shake');
  later(()=>Cake.prepare(),500);
  later(()=>w.classList.add('shake'),1000);
  later(()=>{
    w.classList.remove('shake');sc.classList.add('open');sfx.sparkle();later(()=>GiftFX.burst(),350);
    const r=$('giftBox').getBoundingClientRect();
    for(let k=0;k<6;k++)later(()=>glitter(r.left+r.width/2,r.top+r.height*.1,26),k*160);
  },2000);
}

const hooks={
  0:()=>{$('env').classList.remove('open');$('envStage').classList.remove('open')},
  1:countdownHook,
  2:giftHook,
  3:()=>Cake.enter(),
  5:buildBalloons,
  7:buildParty,
  8:()=>{buildWheel();$('cmsg').textContent='Beech wale 👑 par tap karein'},
  9:buildVouch,
  10:buildAward,
  11:typeLetter,
  12:()=>{cannon(80);for(let k=0;k<5;k++)later(()=>launch(),k*300);finLoop()}
};

function go(n){
  if(n<0||n>=pages.length||n===cur)return;
  clearTimers();
  if(cur===3)Cake.leave();
  if(cur===2)GiftFX.clear();
  const sw=$('sweep');sw.classList.remove('go');void sw.offsetWidth;sw.classList.add('go');
  pages[cur].classList.remove('on');cur=n;pages[cur].classList.add('on');
  $('cnt').textContent=`${cur+1}/${pages.length}`;
  fwOn=(cur===4||cur===12);
  nx.style.display=(cur===0||cur===12||(cur===3&&!cakeFailed))?'none':'';
  bk.style.display=(cur===0||cur===1)?'none':'';
  if(hooks[cur])hooks[cur]();
}
nx.onclick=()=>go(cur+1);
bk.onclick=()=>go(cur-1);
$('again').onclick=()=>go(0);
addEventListener('keydown',e=>{
  if(e.key==='ArrowRight'&&nx.style.display!=='none')go(cur+1);
  if(e.key==='ArrowLeft'&&bk.style.display!=='none')go(cur-1);
});
nx.style.display='none';bk.style.display='none';

/* gold sparkle trail on drag / mouse move */
let lastTrail=0;
addEventListener('pointermove',e=>{
  if(e.pointerType!=='mouse'&&!e.buttons&&e.pressure===0)return;
  const n=performance.now();if(n-lastTrail<45)return;lastTrail=n;
  glitter(e.clientX,e.clientY,2,pick([44,335,44]));
});


/* =====================================================================
   v6 · pookies, gift burst, dance party
   ===================================================================== */
const PKC={bear:['#c98f63','#f3d3b3'],pink:['#ff9fbd','#ffe0ea'],bunny:['#fff6fa','#ffc4d6'],kitty:['#ffcf9a','#fff0dd']};
const KINDS=['bear','pink','bunny','kitty'];
function pookie(k,hat){
  const [a,b]=PKC[k];
  const ears=k==='bunny'?`<ellipse cx="34" cy="16" rx="9" ry="20" fill="${a}" transform="rotate(-10 34 16)"/><ellipse cx="66" cy="16" rx="9" ry="20" fill="${a}" transform="rotate(10 66 16)"/><ellipse cx="34" cy="17" rx="4.5" ry="13" fill="${b}" transform="rotate(-10 34 17)"/><ellipse cx="66" cy="17" rx="4.5" ry="13" fill="${b}" transform="rotate(10 66 17)"/>`
   :k==='kitty'?`<path d="M20 44L23 10L47 24Z M80 44L77 10L53 24Z" fill="${a}"/><path d="M27 34L28 18L40 26Z M73 34L72 18L60 26Z" fill="${b}"/>`
   :`<circle cx="26" cy="26" r="12" fill="${a}"/><circle cx="74" cy="26" r="12" fill="${a}"/><circle cx="26" cy="26" r="6" fill="${b}"/><circle cx="74" cy="26" r="6" fill="${b}"/>`;
  const hatS=hat?`<path d="M50 -18L38 8H62Z" fill="#ffd36e"/><path d="M43 -2H57M40 4H60" stroke="#ff5fa2" stroke-width="3"/><circle cx="50" cy="-19" r="4" fill="#ff5fa2"/>`:'';
  const muz=(k==='bear'||k==='pink')?`<ellipse cx="50" cy="61" rx="13" ry="9" fill="${b}"/>`:'';
  const wh=k==='kitty'?'<path d="M22 60h-9M22 65l-8 3M78 60h9M78 65l8 3" stroke="#3a1f33" stroke-width="1.5" stroke-linecap="round"/>':'';
  return `<svg class="pk" viewBox="0 -24 100 144" aria-hidden="true"><ellipse cx="38" cy="113" rx="11" ry="6" fill="${a}"/><ellipse cx="62" cy="113" rx="11" ry="6" fill="${a}"/><ellipse cx="50" cy="92" rx="25" ry="22" fill="${a}"/><ellipse cx="50" cy="95" rx="15" ry="14" fill="${b}"/><path d="M50 104C38 96 38 86 45 86c3 0 5 2 5 4 0-2 2-4 5-4 7 0 7 10-5 18z" fill="#ff4f86"/><g class="pk-al"><ellipse cx="24" cy="90" rx="7" ry="14" fill="${a}" transform="rotate(18 24 90)"/></g><g class="pk-ar"><ellipse cx="76" cy="90" rx="7" ry="14" fill="${a}" transform="rotate(-18 76 90)"/></g>${ears}<ellipse cx="50" cy="52" rx="${k==='kitty'?35:33}" ry="${k==='kitty'?30:32}" fill="${a}"/>${muz}<g class="pk-eyes"><circle cx="38" cy="52" r="4.4" fill="#3a1f33"/><circle cx="62" cy="52" r="4.4" fill="#3a1f33"/><circle cx="36.8" cy="50.6" r="1.5" fill="#fff"/><circle cx="60.8" cy="50.6" r="1.5" fill="#fff"/></g><ellipse cx="50" cy="58" rx="3.6" ry="2.6" fill="${k==='bear'?'#3a1f33':'#ff7a9e'}"/><path d="M44 63Q50 69 56 63" stroke="#3a1f33" stroke-width="2" fill="none" stroke-linecap="round"/><ellipse cx="29" cy="62" rx="5.5" ry="3.6" fill="#ff7aa2" opacity=".55"/><ellipse cx="71" cy="62" rx="5.5" ry="3.6" fill="#ff7aa2" opacity=".55"/>${wh}${hatS}</svg>`;
}
document.querySelectorAll('.gpk,.env-pk').forEach(e=>e.innerHTML=pookie(e.dataset.k));
$('cdPks').innerHTML=['bear','bunny','kitty'].map((k,i)=>`<div class="cdp" style="--i:${i}">${pookie(k,true)}</div>`).join('');

/* background pookies: balloon fliers + side peekers */
(function(){
  const BALC=['#ff9fc0','#ffd36e','#9fe8ff','#d9c2ff','#ffc2a8'],bg=$('pkbg');
  [[8,0],[30,9],[54,18],[74,4],[91,13]].forEach(([x,dl],i)=>{
    const d=document.createElement('div');d.className='pkf';
    d.style.cssText=`--x:${x}%;--s:${rnd(54,78)|0}px;--d:${rnd(28,40)|0}s;--dl:-${dl*2.3}s;--c:${BALC[i]}`;
    d.innerHTML=`<div class="pkf-d"><div class="pkf-s"><i class="pkb"></i><i class="pks"></i>${pookie(KINDS[i%4])}</div></div>`;bg.appendChild(d);
  });
  [['l',34,'bear',0],['r',58,'bunny',-5],['l',74,'kitty',-9],['r',16,'pink',-3]].forEach(([s,y,k,dl])=>{
    const d=document.createElement('div');d.className='pkp '+s;d.style.cssText=`--y:${y}%;--dl:${dl}s`;d.innerHTML=pookie(k);bg.appendChild(d);
  });
})();

/* generic arc particle (emoji) */
function toss(emo,x,y,o){
  const el=document.createElement('div');el.className='toss';el.textContent=emo;el.style.cssText=`left:${x}px;top:${y}px;font-size:${o.fs||28}px`;
  document.body.appendChild(el);
  const g=o.g===undefined?900:o.g,T=o.T||2,kf=[];
  for(let i=0;i<=14;i++){const t=T*i/14;
    kf.push({transform:`translate(${o.vx*t}px,${o.vy*t+.5*g*t*t}px) rotate(${(o.rot||0)*t}deg) scale(${i<2?.3+i*.35:1})`,opacity:i>11?1-(i-11)/3:1})}
  el.animate(kf,{duration:T*1000,fill:'forwards'}).onfinish=()=>el.remove();
  return el;
}

/* gift box: pookie pops out + things fly out */
const GiftFX={els:[],
  clear(){this.els.forEach(e=>e.remove());this.els=[]},
  burst(){
    const gl=$('giftBox').querySelector('.gl').getBoundingClientRect(),cx=gl.left+gl.width/2,cy=gl.top+gl.height/2;
    const w=document.createElement('div');w.className='pkout';w.style.cssText=`left:${cx-55}px;top:${cy-250}px`;
    w.innerHTML=`<div class="say">Surprise! 🎉</div><div class="pkout-in">${pookie(pick(KINDS),true)}</div>`;
    document.body.appendChild(w);this.els.push(w);
    const E=['💖','⭐','🎀','🧸','🍬','💌','🦋','🌸','✨','💗','🎈','🎈','🪩'];
    for(let k=0;k<24;k++)later(()=>{
      const e=pick(E),fl=e==='🎈';
      this.els.push(toss(e,cx+rnd(-20,20),cy,{vx:rnd(-200,200),vy:fl?rnd(-130,-70):rnd(-640,-380),g:fl?-90:rnd(700,1000),T:fl?3.4:rnd(1.6,2.3),rot:rnd(-240,240),fs:rnd(22,38)}));
    },250+k*70);
    sfx.chime(4);later(()=>sfx.chime(5),200);later(()=>{cannon(30);sfx.tada()},500);
  }};

/* finale joy */
$('finPks').innerHTML=KINDS.map((k,i)=>`<div class="fp" style="--i:${i}">${pookie(k,true)}</div>`).join('');
$('finPks').addEventListener('pointerdown',e=>{const p=e.target.closest('.fp');if(!p)return;e.stopPropagation();sfx.chime(+p.style.getPropertyValue('--i')+1);
  const r=p.getBoundingClientRect();for(let k=0;k<6;k++)toss(pick(['💖','🎉','✨','🎈']),r.left+r.width/2,r.top,{vx:rnd(-110,110),vy:rnd(-340,-200),g:450,T:1.5,rot:rnd(-80,80),fs:rnd(22,32)})});
function finLoop(n){n=n||0;if(cur!==12)return;
  toss(pick(['🎉','🎈','💖','✨','🎊','🌸','🎂']),rnd(W*.05,W*.95),H+20,{vx:rnd(-40,40),vy:-rnd(380,620),g:60,T:3.4,rot:rnd(-120,120),fs:rnd(24,40)});
  if(n%6===5){cannon(24);launch();sfx.sparkle()}
  later(()=>finLoop(n+1),520)}


/* VIP award night */
function buildAward(){
  const a=$('awd'),b=$('awdGo');a.classList.remove('open');b.textContent='🎬 Parda uthayein';$('awdSub').textContent='Parda uthane ke liye tap karein ✨';
  const flash=()=>{const f=document.createElement('i');f.style.cssText=`left:${rnd(5,90)}%;top:${rnd(8,80)}%`;$('awdF').appendChild(f);setTimeout(()=>f.remove(),420);sfx.puff()};
  const celebrate=()=>{sfx.tada();cannon(40);launch();
    for(let k=0;k<16;k++)later(flash,k*260);
    const r=a.getBoundingClientRect();for(let k=0;k<10;k++)later(()=>toss(pick(['⭐','🌟','💖','✨','🎉']),r.left+r.width/2,r.top+r.height*.6,{vx:rnd(-220,220),vy:rnd(-420,-240),g:600,T:1.8,rot:rnd(-120,120),fs:rnd(22,34)}),k*120)};
  b.onclick=()=>{
    if(!a.classList.contains('open')){a.classList.add('open');b.textContent='🎆 Phir se celebrate!';$('awdSub').textContent='Ladies & gentlemen… Areeshaaa! 👏';sfx.sparkle();later(celebrate,1500)}
    else celebrate();
  };
  a.onclick=()=>{if(!a.classList.contains('open'))b.onclick()};
}


/* floating words in the background */
(function(){
  const WORDS=['Areeshaaaaaaaaaaaa Cutie 💖','Areeshaaaaaaaaaaaa Cutie ✨','Areeshaaaaaaaaaaaa Cutie 🎀','Pookie 🧸','Princess 👑','Sweetheart 💕','Cutiepie 🌸','Queen of Hearts ♥','Happy Birthday 🎂','Jaan 💖','Sunshine ☀️','Areeshaaaaaaaaaaaa Cutie 💫'];
  const FF=['"Great Vibes",cursive','"Cormorant Garamond",serif','"Cinzel",serif','"Caveat",cursive'];
  const COL=['#ffe3a8','#ffb3c7','#fff1c9','#e8c8ff','#ffd0dc'];
  function fill(parent,n,boost){
    const box=document.createElement('div');box.className='wbg';
    for(let k=0;k<n;k++){
      const e=document.createElement('div'),up=k%2===1,w=WORDS[k%WORDS.length];
      e.className='wf'+(up?' up':'');e.textContent=w;
      e.style.cssText=`--fs:${rnd(22,54).toFixed(0)}px;--o:${(rnd(.12,.24)*boost).toFixed(2)};--c:${pick(COL)};--ff:${pick(FF)};--y:${rnd(2,92).toFixed(0)}%;--x:${rnd(-5,80).toFixed(0)}%;--d:${rnd(26,60).toFixed(0)}s;--dl:-${rnd(0,50).toFixed(0)}s;--r:${rnd(-14,14).toFixed(0)}deg`;
      box.appendChild(e);
    }
    parent.prepend(box);
  }
  fill($('pkbg'),16,1);
  const sky=document.querySelector('.sky');if(sky)fill(sky,12,1.2);
})();

/* pookie dance party */
function buildParty(){
  const crew=$('ptyCrew'),pty=$('pty');pty.classList.remove('hype');
  crew.innerHTML=KINDS.map((k,i)=>`<div class="pw d${i+1}" data-i="${i}">${pookie(k,i%2===0)}</div>`).join('');
  crew.querySelectorAll('.pw').forEach(p=>p.addEventListener('pointerdown',e=>{
    e.stopPropagation();p.classList.remove('jump');void p.offsetWidth;p.classList.add('jump');
    const r=p.getBoundingClientRect();sfx.chime(+p.dataset.i+1);
    for(let k=0;k<5;k++)toss(pick(['💖','🎵','✨','💕']),r.left+r.width/2,r.top+r.height*.2,{vx:rnd(-90,90),vy:rnd(-300,-180),g:420,T:1.4,rot:rnd(-60,60),fs:rnd(20,30)});
  }));
  $('ptyGo').onclick=()=>{const on=pty.classList.toggle('hype');$('ptyGo').textContent=on?'🎶 Aur zor se!':'🎶 Party shuru karein!';
    if(on){sfx.tada();cannon(45);for(let k=0;k<3;k++)later(()=>launch(),k*250)}};
  const notes=()=>{if(cur!==7)return;const r=crew.getBoundingClientRect();
    toss(pick(['🎵','🎶','💖','✨']),r.left+rnd(.1,.9)*r.width,r.top+r.height*.3,{vx:rnd(-40,40),vy:-rnd(90,150),g:-30,T:2.4,rot:rnd(-40,40),fs:rnd(20,30)});
    later(notes,pty.classList.contains('hype')?160:480)};
  notes();
}

/* ---------------------------------------------------------------------
   MAIN LOOP
   --------------------------------------------------------------------- */
let last=performance.now(),T=0;
function frame(now){
  const dt=Math.min(.05,(now-last)/1000);last=now;T+=dt;
  drawBG(dt,T);drawFX(dt,T);autoFX(dt);Cake.frame(dt,T);
requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
