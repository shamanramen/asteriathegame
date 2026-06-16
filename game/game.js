import { STR } from "./strings.js";

// ---------- seeded RNG (logic), separate visual RNG ----------
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
let SEED=7, rng=mulberry32(SEED), vrng=mulberry32(999);

// ---------- input: command objects, physical key codes ----------
const BIND={KeyA:"left",KeyD:"right",ArrowLeft:"left",ArrowRight:"right",Space:"jump",KeyW:"jump",ArrowUp:"jump",KeyJ:"cast",KeyX:"cast",KeyK:"dash",KeyC:"dash",KeyQ:"switch",KeyL:"fuse",KeyZ:"fuse",KeyI:"ward",KeyS:"ward",ArrowDown:"ward",KeyP:"pause"};
const PAD={0:"jump",2:"cast",1:"dash",3:"switch",5:"fuse",4:"ward",12:"jump",14:"left",15:"right",9:"pause"};
const held=new Set(), pressed=new Set();
addEventListener("keydown",e=>{const c=BIND[e.code];if(c){if(!held.has(c))pressed.add(c);held.add(c);e.preventDefault();}});
addEventListener("keyup",e=>{const c=BIND[e.code];if(c)held.delete(c);});
let padPrev=new Set();
function padCommands(){const out=new Set();for(const gp of navigator.getGamepads?.()??[]){if(!gp)continue;gp.buttons.forEach((b,i)=>{if(b.pressed&&PAD[i])out.add(PAD[i]);});if(gp.axes[0]<-0.4)out.add("left");if(gp.axes[0]>0.4)out.add("right");}
for(const c of out)if(!padPrev.has(c))pressed.add(c);padPrev=out;return out;}
// touch buttons (populated in layout)
const touchBtns=[]; const touchHeld=new Set();
function touchAt(x,y){for(const b of touchBtns){if(x>=b.x&&x<=b.x+b.w&&y>=b.y&&y<=b.y+b.h)return b.cmd;}return null;}
const activeTouches=new Map();
addEventListener("touchstart",e=>{unlockAudio();for(const t of e.changedTouches){const c=touchAt(t.clientX,t.clientY);if(c){activeTouches.set(t.identifier,c);if(!touchHeld.has(c))pressed.add(c);touchHeld.add(c);}else{pressed.add("tap");}}e.preventDefault();},{passive:false});
addEventListener("touchmove",e=>{for(const t of e.changedTouches){const old=activeTouches.get(t.identifier);const c=touchAt(t.clientX,t.clientY);if(c!==old){if(old)touchHeld.delete(old);if(c){activeTouches.set(t.identifier,c);if(!touchHeld.has(c))pressed.add(c);touchHeld.add(c);}else activeTouches.delete(t.identifier);}}e.preventDefault();},{passive:false});
addEventListener("touchend",e=>{for(const t of e.changedTouches){const c=activeTouches.get(t.identifier);if(c)touchHeld.delete(c);activeTouches.delete(t.identifier);}e.preventDefault();},{passive:false});
addEventListener("mousedown",()=>{unlockAudio();pressed.add("tap");});
const commands=()=>new Set([...held,...touchHeld,...padCommands()]);

// ---------- canvas ----------
const canvas=document.getElementById("c"),ctx=canvas.getContext("2d");
ctx.imageSmoothingEnabled=false;
const DPR_CAP=1.5;let W=0,H=0;
function resize(){const dpr=Math.min(devicePixelRatio||1,DPR_CAP);W=innerWidth;H=innerHeight;canvas.width=W*dpr;canvas.height=H*dpr;canvas.style.width=W+"px";canvas.style.height=H+"px";ctx.setTransform(dpr,0,0,dpr,0,0);ctx.imageSmoothingEnabled=false;layoutTouch();}
addEventListener("resize",resize);addEventListener("orientationchange",resize);
const isTouch=matchMedia("(pointer:coarse)").matches;
function layoutTouch(){touchBtns.length=0;if(!isTouch)return;const s=Math.min(W,H)*0.16,m=14;
touchBtns.push({x:m,y:H-s-m,w:s,h:s,cmd:"left",label:"\u25C0"});
touchBtns.push({x:m*2+s,y:H-s-m,w:s,h:s,cmd:"right",label:"\u25B6"});
touchBtns.push({x:W-m-s,y:H-s-m,w:s,h:s,cmd:"jump",label:"\u2191"});
touchBtns.push({x:W-m*2-s*2,y:H-s-m,w:s,h:s,cmd:"cast",label:"\u2726"});
touchBtns.push({x:W-m*3-s*3,y:H-s-m,w:s,h:s,cmd:"dash",label:"\u00BB"});
touchBtns.push({x:W-m-s,y:H-s*2-m*2,w:s,h:s*0.7,cmd:"switch",label:"\u21BB"});
touchBtns.push({x:W-m*2-s*2,y:H-s*2-m*2,w:s,h:s*0.7,cmd:"fuse",label:"\u2605"});
touchBtns.push({x:W-m*3-s*3,y:H-s*2-m*2,w:s,h:s*0.7,cmd:"ward",label:"\u25C9"});}

// ---------- assets ----------
const IMG={},AUD={};
const imgFiles=["player_ember","player_tide","player_gilded","player_umbral","player_verdant","player_tempest","player_amethyst","player_sanguine","pose_stand_ember","pose_stand_tide","pose_stand_gilded","pose_stand_umbral","pose_stand_verdant","pose_stand_tempest","pose_stand_amethyst","pose_stand_sanguine","pose_jump_ember","pose_jump_tide","pose_jump_gilded","pose_jump_umbral","pose_jump_verdant","pose_jump_tempest","pose_jump_amethyst","pose_jump_sanguine","asteria","rival_fire","rival_water","rival_air","oracle","guardian","harpy","golem","serpent","lion","tile","bg_far","bg_mid","bg_near","fire_bolt","water_orb","wind_blade","lightning_orb","gravity_ring","star_shard"];
let loaded=0,toLoad=imgFiles.length;
for(const n of imgFiles){const im=new Image();im.src="./assets/"+n+".png";im.onload=()=>loaded++;im.onerror=()=>loaded++;IMG[n]=im;}
for(const n of ["sfx_cast","sfx_pickup","sfx_dash","sfx_hit"]){const a=new Audio("./assets/"+n+".mp3");a.volume=0.35;AUD[n]=a;}
const music=new Audio("./assets/music.m4a");music.loop=true;music.volume=0.30;
let audioOn=false;function unlockAudio(){if(audioOn)return;audioOn=true;music.play().catch(()=>{});}
function sfx(n){if(!audioOn)return;const a=AUD[n].cloneNode();a.volume=AUD[n].volume;a.play().catch(()=>{});}

// ---------- meta-progression ----------
const store=(()=>{try{return globalThis.localStorage}catch(e){return null}})();
function loadFrags(){try{return Math.max(0,parseInt(store?.getItem("asteria_frags")||"0",10)||0)}catch(e){return 0}}
function saveFrags(n){try{store?.setItem("asteria_frags",String(n))}catch(e){}}
let fragments=loadFrags();
const boons=()=>({hp6:fragments>=5,fastDash:fragments>=10,fuseHead:fragments>=18});

// ---------- cloaks ----------
const CLOAKS=[
 {id:"ember", img:"player_ember", name:STR.cloakEmber, desc:STR.cloakEmberDesc, color:"#d4634a", dmg:1.3, fuseGain:1.5, wardMax:100, wardReflect:false, blinkLen:175, blinkInv:18, speed:1, shardHeat:1},
 {id:"tide",  img:"player_tide",  name:STR.cloakTide,  desc:STR.cloakTideDesc,  color:"#4a7a9c", dmg:1, fuseGain:1, wardMax:160, wardReflect:true,  blinkLen:175, blinkInv:18, speed:1, shardHeat:1},
 {id:"gilded",img:"player_gilded",name:STR.cloakGilded,desc:STR.cloakGildedDesc,color:"#c9a86b", dmg:1, fuseGain:1, wardMax:100, wardReflect:false, blinkLen:175, blinkInv:18, speed:1.18, shardHeat:2},
 {id:"umbral",img:"player_umbral",name:STR.cloakUmbral,desc:STR.cloakUmbralDesc,color:"#6d5a9e", dmg:1, fuseGain:1, wardMax:100, wardReflect:false, blinkLen:245, blinkInv:34, speed:1, shardHeat:1},
 {id:"verdant", img:"player_verdant", name:STR.cloakVerdant, desc:STR.cloakVerdantDesc, color:"#5f9e63", dmg:1.2, fuseGain:1, wardMax:150, wardReflect:false, blinkLen:175, blinkInv:18, speed:0.97, shardHeat:1},
 {id:"tempest", img:"player_tempest", name:STR.cloakTempest, desc:STR.cloakTempestDesc, color:"#3bb0b8", dmg:1, fuseGain:1.7, wardMax:100, wardReflect:false, blinkLen:175, blinkInv:18, speed:1.1, shardHeat:1},
 {id:"amethyst",img:"player_amethyst",name:STR.cloakAmethyst,desc:STR.cloakAmethystDesc,color:"#c14fb8", dmg:1.15, fuseGain:1.2, wardMax:110, wardReflect:false, blinkLen:215, blinkInv:26, speed:1, shardHeat:2},
 {id:"sanguine",img:"player_sanguine",name:STR.cloakSanguine,desc:STR.cloakSanguineDesc,color:"#8f2230", dmg:1.45, fuseGain:1.2, wardMax:75, wardReflect:false, blinkLen:175, blinkInv:18, speed:1, shardHeat:1}];
let cloakIdx=0;
const cloak=()=>CLOAKS[cloakIdx];

// ---------- elements ----------
const FUSION_NAME={fire:STR.fusionFire,lightning:STR.fusionLightning,gravity:STR.fusionGravity};
const ELEMENTS={fire:{name:STR.elFire,color:"#d4634a",icon:"fire_bolt",speed:9,dmg:1,size:1},
lightning:{name:STR.elLightning,color:"#9f7bff",icon:"lightning_orb",speed:14,dmg:1.5,size:0.9,pierce:true},
gravity:{name:STR.elGravity,color:"#6d5a9e",icon:"gravity_ring",speed:5.5,dmg:2.2,size:1.5}};

// ---------- level generation (deterministic) ----------
const TILE=64,GROUND=520; // world-space; camera maps to screen
let level=null;
function genLevel(){rng=mulberry32(SEED);
const plats=[],shards=[],pickups=[],rivals=[],decos=[],mobs=[];let way=null;
let x=0;const chunks=7;
plats.push({x:-200,y:GROUND,w:1400});x=1200;
const rivalDefs=[
 {at:2,img:"rival_water",name:STR.rival2Name,wish:STR.rival2Wish,hp:8,weak:"lightning",proj:"water_orb",color:"#4a7a9c",echo:STR.echo2},
 {at:4,img:"rival_fire",name:STR.rival1Name,wish:STR.rival1Wish,hp:11,weak:"gravity",proj:"fire_bolt",color:"#d4634a",echo:STR.echo1},
 {at:6,img:"rival_air",name:STR.rival3Name,wish:STR.rival3Wish,hp:14,weak:"gravity",proj:"wind_blade",color:"#c9a86b",echo:STR.echo3}];
for(let c=1;c<=chunks;c++){
  const segs=4+Math.floor(rng()*2);
  for(let s=0;s<segs;s++){
    const w=260+rng()*340;
    const wide=(c>=2&&s===2&&rng()<0.85);   // one dash-gap per chunk from chunk 2 on
    const yo0=GROUND;                       // main lane stays at ground level - readable chase
    const gap=wide?285+rng()*25:70+rng()*70;
    const yo=yo0;
    x+=gap;plats.push({x,y:yo,w});
    if(rng()<0.55)shards.push({x:x+w*0.3+rng()*w*0.4,y:yo-70,got:false});
    if(c>=1&&!wide&&w>330&&rng()<0.38){
      const kinds=["harpy","golem","serpent","lion"];
      const kind=kinds[Math.floor(rng()*kinds.length)];
      mobs.push({kind,x:x+w*0.55,y:yo,hx:x+w*0.55,hp:kind==="golem"?4:2,hpMax:kind==="golem"?4:2,t:Math.floor(rng()*60),flash:0,dir:-1,vy:0});}
    if(rng()<0.5){const fy=yo-160,fx=x+w*0.2,fw=w*0.55;plats.push({x:fx,y:fy,w:fw});shards.push({x:fx+fw/2,y:fy-70,got:false});}
    x+=w;}
  // mobs on this chunk's segments (astrology/myth bestiary)
  // placed retroactively on the segment platforms just generated
  // chunk landmark platform
  x+=100;plats.push({x,y:GROUND,w:600});
  if(c===1)pickups.push({x:x+300,y:GROUND-80,el:"lightning",msg:STR.pickupLightning,got:false});
  if(c===3)pickups.push({x:x+300,y:GROUND-80,el:"gravity",msg:STR.pickupGravity,got:false});
  const rd=rivalDefs.find(r=>r.at===c);
  if(rd)rivals.push({...rd,x:x+430,y:GROUND,hpMax:rd.hp,state:"waiting",t:0,flash:0});
  x+=600;
  if(c===3){ // oracle sanctuary - neutral waystation, no heat decay inside
    x+=120;plats.push({x,y:GROUND,w:900});
    way={x0:x,x1:x+900,oracleX:x+450,
      altars:[{x:x+220,kind:"vit",cd:0},{x:x+680,kind:"fuse",cd:0}]};
    x+=900;}}
x+=110;plats.push({x,y:GROUND,w:1000});
const nexusX=x+650;
for(let i=0;i<40;i++)decos.push({x:rng()*x,y:100+rng()*260,r:1+rng()*2});
return{plats,shards,pickups,rivals,mobs,nexusX,endX:x+1000,way,guardian:{x:nexusX-330,y:GROUND,hp:26,hpMax:26,state:"waiting",t:0,flash:0,phase:1,weak:"lightning"}};}

// ---------- game state ----------
let state="title"; // title, intro, forge, play, card, over, escape
function loadCloseCalls(){try{return parseInt(store?.getItem("asteria_close")||"0",10)||0}catch(e){return 0}}
function saveCloseCalls(n){try{store?.setItem("asteria_close",String(n))}catch(e){}}
let closeCalls=loadCloseCalls();
let overMsg="",overSub="",cardRival=null,cardT=0,toast="",toastT=0,bigToast="",bigToastT=0;
const player={x:100,y:GROUND,vx:0,vy:0,w:34,h:60,face:1,onGround:false,coyote:0,jbuf:0,dashT:0,dashCd:0,inv:0,hp:5,hpMax:5,heat:100,els:["fire"],el:0,castCd:0,dead:false};
let cam=0,projs=[],eprojs=[],parts=[],time=0,drawCalls=0,winT=0;

function reset(){level=genLevel();const b=boons();player.hpMax=b.hp6?6:5;
Object.assign(player,{x:100,y:GROUND,vx:0,vy:0,face:1,onGround:false,coyote:0,jbuf:0,dashT:0,dashCd:0,inv:0,hp:player.hpMax,heat:100,els:["fire"],el:0,castCd:0,dead:false,shards:0,fuse:b.fuseHead?50:0,fuseMax:100,fuseFlash:0,
ward:0,wardMax:cloak().wardMax,warding:false,wardFlash:0,recoil:0,land:0,prevVy:0,idleT:0,airJumps:1,djT:0});
player.ward=player.wardMax;cam=0;projs=[];eprojs=[];parts=[];time=0;winT=0;toast="";bigToast="";}

function spawnParts(x,y,color,n,spd=3){for(let i=0;i<n;i++){const a=vrng()*Math.PI*2,s=spd*(0.4+vrng());parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-1,life:24+vrng()*20,color});}}

// ---------- update ----------
function update(dt,cmds){
time++;
if(state==="title"||state==="over"||state==="escape"){ if(pressed.has("jump")||pressed.has("tap")||pressed.has("cast")){unlockAudio();if(state==="title"){state="intro";}else{SEED++;state="forge";}} pressed.clear();return;}
if(state==="intro"){if(pressed.has("jump")||pressed.has("tap")||pressed.has("cast")){state="forge";}pressed.clear();return;}
if(state==="forge"){
 if(pressed.has("left"))cloakIdx=(cloakIdx+CLOAKS.length-1)%CLOAKS.length;
 if(pressed.has("right"))cloakIdx=(cloakIdx+1)%CLOAKS.length;
 if(pressed.has("jump")||pressed.has("tap")){reset();state="play";sfx("sfx_pickup");}
 pressed.clear();return;}
if(state==="card"){cardT++;if(cardT>40&&(pressed.has("jump")||pressed.has("tap")||pressed.has("cast"))){state="play";cardRival.state="fight";}pressed.clear();return;}
if(pressed.has("pause")){state= state==="pause"?"play":"pause";pressed.clear();return;}
if(state==="pause"){if(pressed.has("tap"))state="play";pressed.clear();return;}

// --- play ---
const p=player;
const way=level.way;
const inWay=way&&p.x>way.x0&&p.x<way.x1;
const C=cloak();
const accel=0.9,maxv=5.2*C.speed,fric=0.8;
let mv=0;if(cmds.has("left"))mv-=1;if(cmds.has("right"))mv+=1; // opposite held = cancel, predictable
// ward (block/shield spell): hold to raise; drains gauge, regens when down
p.warding=cmds.has("ward")&&p.ward>0&&p.onGround;
if(p.warding){p.ward-=1.4;if(p.ward<=0){p.ward=0;p.warding=false;toast=STR.wardBroken;toastT=60;p.wardFlash=20;sfx("sfx_hit");}}
else p.ward=Math.min(p.wardMax,p.ward+0.55);
if(p.wardFlash>0)p.wardFlash--;
if(p.warding){mv=0;p.vx*=0.6;} // planted while warding
if(p.dashT>0){p.dashT--;}
else{p.vx+=mv*accel;if(!mv)p.vx*=fric;p.vx=Math.max(-maxv,Math.min(maxv,p.vx));if(mv)p.face=mv;}
if(p.dashCd>0)p.dashCd--;
// BLINK STEP: teleport dash with afterimages
if(pressed.has("dash")&&p.dashCd<=0&&!p.warding){
  const len=C.blinkLen*(boons().fastDash?1.15:1);
  const steps=5;
  for(let i=1;i<=steps;i++)parts.push({x:p.x+p.face*len*i/steps,y:p.y-32,vx:0,vy:0,life:10+i*4,color:C.color,ghost:{img:C.img,face:p.face,alpha:0.5-i*0.07}});
  let nx=p.x+p.face*len;
  // land on a platform if one is under the exit point, else keep height
  p.x=nx;p.dashT=12;p.vx=p.face*9;p.dashCd=boons().fastDash?26:34;p.inv=Math.max(p.inv,C.blinkInv);
  if(p.vy>2)p.vy=2;
  sfx("sfx_dash");spawnParts(nx,p.y-30,C.color,12,4);}
if(pressed.has("switch")&&p.els.length>1){p.el=(p.el+1)%p.els.length;sfx("sfx_pickup");}
// jump: buffer + coyote (frames at 60fps: 6f=100ms, 5f=83ms)
if(pressed.has("jump"))p.jbuf=7;else if(p.jbuf>0)p.jbuf--;
p.vy+=0.55;if(p.vy>14)p.vy=14;if(p.dashT>0){if(p.vy>1.2)p.vy=1.2;p.vx=p.face*9;}
p.y+=p.vy;p.x+=p.vx;
p.onGround=false;
for(const pl of level.plats){if(p.x>pl.x-14&&p.x<pl.x+pl.w+14){if(p.vy>=0&&p.y>=pl.y&&p.y-p.vy<=pl.y+18){p.y=pl.y;p.vy=0;p.onGround=true;}}}
if(p.onGround){p.safeX=p.x;p.safeY=p.y;p.airJumps=1;} // last safe footing + double-jump refresh
if(p.onGround&&p.prevVy>7)p.land=10; // landing squash
if(p.land>0)p.land--;if(p.djT>0)p.djT--;
p.prevVy=p.vy;
if(p.onGround&&Math.abs(p.vx)<0.4&&!p.warding)p.idleT++;else p.idleT=0;
if(p.onGround)p.coyote=6;else if(p.coyote>0)p.coyote--;
if(p.jbuf>0&&(p.onGround||p.coyote>0)){p.vy=-14;p.jbuf=0;p.coyote=0;spawnParts(p.x,p.y,"#7a8e5e",5,2);}
else if(p.jbuf>0&&!p.onGround&&p.coyote<=0&&p.airJumps>0&&p.dashT<=0){
  p.airJumps--;p.vy=-12.2;p.jbuf=0;p.djT=12;sfx("sfx_dash");
  // star-burst ring under the feet
  for(let i=0;i<10;i++){const a=Math.PI*(i/9);parts.push({x:p.x-Math.cos(a)*22,y:p.y-6,vx:-Math.cos(a)*2.2,vy:1.2+Math.sin(a)*0.8,life:20,color:cloak().color});}
  parts.push({x:p.x,y:p.y-32,vx:0,vy:0,life:12,color:"#c9a86b"});}
if(p.x<cam+20){p.x=cam+20;p.vx=Math.max(0,p.vx);}
// cast
if(p.castCd>0)p.castCd--;
const atAltar=inWay&&way.altars.some(al=>Math.abs(p.x-al.x)<60);
if(pressed.has("cast")&&p.castCd<=0&&!atAltar){const el=ELEMENTS[p.els[p.el]];projs.push({x:p.x+p.face*24,y:p.y-34,vx:p.face*el.speed,vy:0,el:p.els[p.el],life:80});p.castCd=el.speed>10?14:(el.dmg>2?30:18);p.recoil=8;sfx("sfx_cast");spawnParts(p.x+p.face*24,p.y-34,el.color,4,2);}
if(p.inv>0)p.inv--;
if(p.recoil>0)p.recoil--;
// fusion art: full meter + 2+ elements -> screen-clearing ultimate
if(pressed.has("fuse")&&p.fuse>=p.fuseMax&&p.els.length>=2){
  p.fuse=0;p.fuseFlash=40;p.inv=Math.max(p.inv,60);
  const el=ELEMENTS[p.els[p.el]];
  bigToast=FUSION_NAME[p.els[p.el]]+"\n"+STR.fusionUsed;bigToastT=150;
  sfx("sfx_hit");sfx("sfx_cast");
  for(let i=0;i<10;i++){const a=-0.5+i*0.11;projs.push({x:p.x+p.face*20,y:p.y-36,vx:p.face*Math.cos(a)*11,vy:Math.sin(a)*7,el:p.els[p.el],life:70,fusion:true});}
  eprojs.length=0;  // the ultimate scours the sky
  spawnParts(p.x,p.y-40,el.color,60,7);spawnParts(p.x,p.y-40,"#c9a86b",30,5);
}
if(p.fuseFlash>0)p.fuseFlash--;
// trail heat
const moving=Math.abs(p.vx)>0.6||p.dashT>0;
const fighting=level.rivals.some(r=>r.state==="fight")||level.guardian.state==="fight";
if(inWay){
  if(!way.greeted){way.greeted=true;bigToast=STR.waystation+"\n"+STR.oracleGreet;bigToastT=240;}
  for(const al of way.altars){if(al.cd>0)al.cd--;
    if(al.cd<=0&&Math.abs(p.x-al.x)<60&&pressed.has("cast")){
      const cost=al.kind==="vit"?3:4;
      if(p.shards>=cost){p.shards-=cost;al.cd=40;sfx("sfx_pickup");
        if(al.kind==="vit"){p.hp=p.hpMax;toast=STR.altarVit;}else{p.fuse=p.fuseMax;toast=STR.altarFuse;}
        toastT=80;spawnParts(al.x,GROUND-60,"#c9a86b",20,4);}
      else{toast=STR.altarPoor;toastT=60;}}}
}else p.heat-=(fighting?0.0083:(moving?0.0267:0.0833))*dt/16.67;
if(p.heat<=0){p.heat=0;die(STR.trailCold,STR.trailColdSub);}
// fall into void
if(p.y>GROUND+420){
  p.hp--;p.heat=Math.max(0,p.heat-8);sfx("sfx_hit");
  if(p.hp<=0){die(STR.fell,STR.fellSub);}
  else{p.x=p.safeX??100;p.y=p.safeY??GROUND;p.vx=0;p.vy=0;p.inv=70;p.dashT=0;
    spawnParts(p.x,p.y-30,"#6d5a9e",18,4);}
}
// shards
for(const s of level.shards){if(!s.got&&Math.abs(p.x-s.x)<34&&Math.abs(p.y-40-s.y)<54){s.got=true;p.heat=Math.min(100,p.heat+12*cloak().shardHeat);p.shards++;sfx("sfx_pickup");toast=STR.shard;toastT=50;spawnParts(s.x,s.y,"#c9a86b",12,3);}}
// element pickups
for(const pk of level.pickups){if(!pk.got&&Math.abs(p.x-pk.x)<40&&Math.abs(p.y-40-pk.y)<60){pk.got=true;p.els.push(pk.el);p.el=p.els.length-1;sfx("sfx_pickup");bigToast=STR.forbidden+"\n"+pk.msg;bigToastT=210;spawnParts(pk.x,pk.y,ELEMENTS[pk.el].color,30,5);}}
// bestiary mobs
const MOBW={harpy:"fire",golem:"lightning",serpent:"lightning",lion:"gravity"};
for(const m of level.mobs){
 if(m.hp<=0)continue;
 if(Math.abs(m.x-p.x)>900){continue;}
 m.t++;if(m.flash>0)m.flash--;
 const dx=p.x-m.x;
 if(m.kind==="harpy"){ // circling flyer, dives at the player
   const homeY=m.y-190;
   if(m.diving){m.x+=m.dvx;m.fy+=m.dvy;m.dvy+=0.1;if(m.fy>m.y-20){m.diving=false;}
   }else{m.fy=(m.fy??homeY)+Math.sin(m.t*0.05)*0.8;m.x+=Math.sin(m.t*0.02)*1.2;
     if(Math.abs(dx)<340&&m.t%140===0){m.diving=true;const d=Math.hypot(dx,(p.y-40)-m.fy)||1;m.dvx=dx/d*6.5;m.dvy=((p.y-40)-m.fy)/d*6.5;}}
   m.hitY=m.fy;}
 else if(m.kind==="golem"){ // slow walker, charges when aligned
   if(m.charging){m.x+=m.dir*5.2;m.chargeT--;if(m.chargeT<=0)m.charging=false;}
   else{m.x+=m.dir*0.6;if(Math.abs(m.x-m.hx)>130)m.dir*=-1;
     if(Math.abs(dx)<420&&Math.abs((p.y)-(m.y))<40&&m.t%170===0){m.charging=true;m.chargeT=46;m.dir=dx>0?1:-1;}}
   m.hitY=m.y-40;}
 else if(m.kind==="serpent"){ // stationary, lobs water arcs
   if(Math.abs(dx)<520&&m.t%150===0){const sp=4.2;const ang=Math.atan2((p.y-40)-(m.y-50),dx)-0.45;
     eprojs.push({x:m.x,y:m.y-50,vx:Math.cos(ang)*sp,vy:Math.sin(ang)*sp-2.2,img:"water_orb",life:170,grav:true});}
   m.hitY=m.y-42;}
 else if(m.kind==="lion"){ // prowls, pounces in an arc
   if(m.pouncing){m.x+=m.dvx;m.fy+=m.dvy;m.dvy+=0.42;if(m.fy>=m.y){m.fy=m.y;m.pouncing=false;}}
   else{m.fy=m.y;m.x+=m.dir*1.1;if(Math.abs(m.x-m.hx)>110)m.dir*=-1;
     if(Math.abs(dx)<300&&m.t%160===0){m.pouncing=true;m.dvx=(dx>0?1:-1)*5.4;m.dvy=-7.5;m.dir=dx>0?1:-1;}}
   m.hitY=(m.fy??m.y)-30;}
 // contact damage
 if(p.inv<=0&&!p.warding&&Math.abs(m.x-p.x)<34&&Math.abs((m.hitY??m.y-40)-(p.y-34))<46){
   p.hp--;p.inv=50;sfx("sfx_hit");spawnParts(p.x,p.y-30,"#d4634a",12,4);if(p.hp<=0)die(STR.slain,STR.slainSub);}
 // warded contact: shove back
 if(p.warding&&Math.abs(m.x-p.x)<44&&Math.abs((m.hitY??m.y-40)-(p.y-34))<50){
   m.x+=p.face*8;p.ward-=6;spawnParts(m.x,m.hitY??m.y-40,cloak().color,6,3);}
}
// rivals
for(const r of level.rivals){
 if(r.state==="waiting"&&p.x>r.x-440){r.state="card";cardRival=r;cardT=0;state="card";sfx("sfx_hit");}
 if(r.state==="fight"){
   r.t++;if(r.flash>0)r.flash--;
   // barrier
   if(p.x>r.x-40){p.x=r.x-40;p.vx=Math.min(0,p.vx);}
   // attack patterns
   const period=r.img==="rival_air"?46:(r.img==="rival_fire"?58:70);
   if(r.t%period===0){const dy=(p.y-40-(r.y-50));const d=Math.hypot(r.x-p.x,dy)||1;
     const n=r.img==="rival_air"?3:1;
     for(let i=0;i<n;i++){const sp=r.img==="rival_fire"?5.5:4.6;const ang=Math.atan2(dy,p.x-r.x)+(i-1)*0.22;
       eprojs.push({x:r.x,y:r.y-50,vx:Math.cos(ang)*sp,vy:Math.sin(ang)*sp,img:r.proj,life:140});}}
   if(r.img==="rival_water"&&r.t%160===0){for(let i=0;i<5;i++)eprojs.push({x:r.x-60-i*46,y:r.y-260,vx:0,vy:3.2,img:"water_orb",life:160});}
 }}
// player projectiles
for(const pr of projs){pr.x+=pr.vx;pr.y+=pr.vy;pr.life--;
 for(const m of level.mobs){if(m.hp<=0)continue;
  if(Math.abs(pr.x-m.x)<36&&Math.abs(pr.y-(m.hitY??m.y-40))<44){
   const weak=MOBW[m.kind]===pr.el;
   const dmg=(pr.fusion?3.2:ELEMENTS[pr.el].dmg)*cloak().dmg*(weak?2:1);
   m.hp-=dmg;m.flash=8;if(!ELEMENTS[pr.el].pierce&&!pr.fusion)pr.life=0;sfx("sfx_hit");
   spawnParts(pr.x,pr.y,ELEMENTS[pr.el].color,8,3);
   if(m.hp<=0){p.heat=Math.min(100,p.heat+6);p.shards++;if(p.els.length>=2)p.fuse=Math.min(p.fuseMax,p.fuse+8*cloak().fuseGain);spawnParts(m.x,m.hitY??m.y-40,"#c9a86b",20,5);}}}
 for(const r of level.rivals){if(r.state==="fight"&&Math.abs(pr.x-r.x)<46&&Math.abs(pr.y-(r.y-55))<70){const el=ELEMENTS[pr.el];const dmg=(pr.fusion?3.2:el.dmg)*cloak().dmg*(r.weak===pr.el?2:1);r.hp-=dmg;r.flash=8;if(p.els.length>=2)p.fuse=Math.min(p.fuseMax,p.fuse+3*cloak().fuseGain);if(!ELEMENTS[pr.el].pierce&&!pr.fusion)pr.life=0;sfx("sfx_hit");spawnParts(pr.x,pr.y,el.color,8,3);
   if(r.weak!==pr.el&&r.hp<r.hpMax*0.7&&!r.hinted){r.hinted=true;toast=STR.weakHint;toastT=120;}
   if(r.hp<=0&&r.state==="fight"){r.state="dead";p.heat=Math.min(100,p.heat+20);p.hp=Math.min(p.hpMax,p.hp+1);if(p.els.length>=2)p.fuse=Math.min(p.fuseMax,p.fuse+35*cloak().fuseGain);bigToast=STR.echoAbsorbed+"\n"+r.echo;bigToastT=200;spawnParts(r.x,r.y-60,r.color,40,6);}}}}
projs=projs.filter(pr=>pr.life>0);
// enemy projectiles
for(const ep of eprojs){ep.x+=ep.vx;ep.y+=ep.vy;if(ep.grav)ep.vy+=0.12;ep.life--;
 const nearP=Math.abs(ep.x-p.x)<(p.warding?46:26)&&Math.abs(ep.y-(p.y-34))<(p.warding?56:40);
 if(nearP&&p.warding){
   ep.life=0;p.ward-=14;sfx("sfx_hit");spawnParts(p.x+p.face*30,p.y-36,cloak().color,10,3);
   if(cloak().wardReflect){projs.push({x:p.x+p.face*30,y:p.y-34,vx:p.face*10,vy:0,el:p.els[p.el],life:60,reflected:true});toast=STR.reflected;toastT=35;}
   if(p.ward<=0){p.ward=0;p.warding=false;toast=STR.wardBroken;toastT=60;p.wardFlash=20;}
   continue;}
 if(p.inv<=0&&nearP){ep.life=0;p.hp--;p.inv=50;sfx("sfx_hit");spawnParts(p.x,p.y-30,"#d4634a",12,4);if(p.hp<=0)die(STR.slain,STR.slainSub);}}
eprojs=eprojs.filter(ep=>ep.life>0);
// particles
for(const pa of parts){pa.x+=pa.vx;pa.y+=pa.vy;pa.vy+=0.12;pa.life--;}
parts=parts.filter(pa=>pa.life>0);if(parts.length>140)parts.splice(0,parts.length-140);
// guardian boss at the nexus
const g=level.guardian;
if(g.state==="waiting"&&p.x>g.x-560){g.state="card";cardRival=Object.assign(g,{img:"guardian",name:STR.guardianName,wish:STR.guardianWish,color:"#9f7bff",proj:"lightning_orb",echo:""});cardT=0;state="card";sfx("sfx_hit");toast=STR.bossWarn;toastT=90;}
if(g.state==="fight"){
  g.t++;if(g.flash>0)g.flash--;
  if(p.x>g.x-60){p.x=g.x-60;p.vx=Math.min(0,p.vx);}
  // phase flip at half HP: weakness swaps lightning<->gravity
  if(g.phase===1&&g.hp<=g.hpMax/2){g.phase=2;g.weak="gravity";g.t=0;bigToast=STR.guardianPhase;bigToastT=160;spawnParts(g.x,g.y-90,"#6d5a9e",40,6);eprojs.length=0;}
  const period=g.phase===1?52:46;
  if(g.t%period===0){const dy=(p.y-40-(g.y-90));const ang=Math.atan2(dy,p.x-g.x);
    const n=g.phase===1?2:3;
    for(let i=0;i<n;i++)eprojs.push({x:g.x-40,y:g.y-90,vx:Math.cos(ang+(i-(n-1)/2)*0.26)*4.7,vy:Math.sin(ang+(i-(n-1)/2)*0.26)*4.7,img:g.phase===1?"lightning_orb":"gravity_ring",life:150});}
  if(g.t%130===0){ // ground shockwave - jump over it
    eprojs.push({x:g.x-70,y:GROUND-26,vx:-6,vy:0,img:"wind_blade",life:170,low:true});}
}
// player projectiles vs guardian
for(const pr of projs){if(g.state==="fight"&&pr.life>0&&Math.abs(pr.x-(g.x-10))<70&&Math.abs(pr.y-(g.y-90))<95){
  const dmg=(pr.fusion?3.2:ELEMENTS[pr.el].dmg)*cloak().dmg*(g.weak===pr.el?2:0.5);
  g.hp-=dmg;g.flash=8;if(!ELEMENTS[pr.el].pierce&&!pr.fusion)pr.life=0;sfx("sfx_hit");
  if(p.els.length>=2)p.fuse=Math.min(p.fuseMax,p.fuse+3);
  spawnParts(pr.x,pr.y,ELEMENTS[pr.el].color,8,3);
  if(g.hp<=0&&g.state==="fight"){g.state="dead";
    p.heat=Math.min(100,p.heat+30);spawnParts(g.x,g.y-90,"#9f7bff",70,8);}}}
// the Carmen Sandiego rule: reach her and she escapes - every time
if(p.x>level.nexusX&&g.state==="dead"){state="escape";winT=0;
  closeCalls++;saveCloseCalls(closeCalls);
  fragments++;saveFrags(fragments);
  spawnParts(level.nexusX+60,GROUND-80,"#c9a86b",60,7);spawnParts(level.nexusX+60,GROUND-80,"#9f7bff",40,6);
  if(fragments===5||fragments===10||fragments===18){const m=fragments===5?STR.boon1:(fragments===10?STR.boon2:STR.boon3);bigToast=m;bigToastT=300;}}
// camera
const target=p.x-W*0.32;cam+=(target-cam)*0.12;if(cam<0)cam=0;
if(toastT>0)toastT--;if(bigToastT>0)bigToastT--;
pressed.clear();}

function die(msg,sub){if(player.dead)return;player.dead=true;overMsg=msg;overSub=sub;state="over";}

// ---------- render ----------
function dimg(im,x,y,w,h,flip){drawCalls++;if(flip){ctx.save();ctx.translate(x+w,y);ctx.scale(-1,1);ctx.drawImage(im,0,0,w,h);ctx.restore();}else ctx.drawImage(im,x,y,w,h);}
function text(s,x,y,size,color,align="center",font="bold"){drawCalls++;ctx.fillStyle=color;ctx.font=`${font} ${size}px 'Courier New',monospace`;ctx.textAlign=align;ctx.fillText(s,x,y);}

function render(){
drawCalls=0;
ctx.fillStyle="#07060c";ctx.fillRect(0,0,W,H);drawCalls++;
const sy=H/720; // world 720-high mapped to screen height
ctx.save();ctx.scale(sy,sy);const VW=W/sy;
// parallax (each layer = 2 draw calls max)
const f=IMG.bg_far,m=IMG.bg_mid,n=IMG.bg_near;
for(const[im,sp,al]of[[f,0.1,1],[m,0.3,0.85],[n,0.55,0.7]]){
 if(!im.width)continue;const iw=1280;let ox=-(cam*sp)%iw;if(ox>0)ox-=iw;ctx.globalAlpha=al;
 for(let x=ox;x<VW;x+=iw)dimg(im,x,0,iw,720);ctx.globalAlpha=1;}
if(state==="title"){renderTitle(VW);ctx.restore();renderTouchUI();devOut();return;}
if(state==="forge"){renderForge(VW);ctx.restore();renderTouchUI();devOut();return;}
if(state==="intro"){renderIntro(VW);ctx.restore();renderTouchUI();devOut();return;}
ctx.save();ctx.translate(-cam,0);
// platforms: tiles batched pattern-style
const t=IMG.tile;
for(const pl of level.plats){if(pl.x+pl.w<cam||pl.x>cam+VW)continue;
 const tiles=Math.ceil(pl.w/TILE);
 for(let i=0;i<tiles;i++)dimg(t,pl.x+i*TILE,pl.y,TILE,TILE);
 ctx.fillStyle="rgba(201,168,107,0.55)";ctx.fillRect(pl.x,pl.y,pl.w,3);drawCalls++;}
// shards
for(const s of level.shards){if(s.got||s.x<cam-60||s.x>cam+VW+60)continue;const bob=Math.sin(time*0.08+s.x)*6;dimg(IMG.star_shard,s.x-16,s.y+bob,32,38);}
// element pickups
for(const pk of level.pickups){if(pk.got)continue;const el=ELEMENTS[pk.el];const bob=Math.sin(time*0.06)*8;
 ctx.fillStyle=el.color;ctx.globalAlpha=0.25+0.15*Math.sin(time*0.1);ctx.beginPath();ctx.arc(pk.x,pk.y+20+bob,46,0,7);ctx.fill();ctx.globalAlpha=1;drawCalls++;
 dimg(IMG[el.icon],pk.x-24,pk.y+bob,48,48);}
// waystation
const wy=level.way;
if(wy&&wy.x1>cam&&wy.x0<cam+VW){
  ctx.fillStyle="rgba(201,168,107,0.07)";ctx.fillRect(wy.x0,0,wy.x1-wy.x0,720);drawCalls++;
  dimg(IMG.oracle,wy.oracleX-31,GROUND-104,62,104,player.x>wy.oracleX);
  for(const al of wy.altars){
    const glow=0.3+0.15*Math.sin(time*0.07+al.x);
    ctx.fillStyle=al.kind==="vit"?"#d4634a":"#9f7bff";ctx.globalAlpha=glow;ctx.beginPath();ctx.arc(al.x,GROUND-46,34,0,7);ctx.fill();ctx.globalAlpha=1;drawCalls++;
    ctx.fillStyle="#2a2138";ctx.fillRect(al.x-26,GROUND-40,52,40);drawCalls++;
    ctx.fillStyle="#c9a86b";ctx.fillRect(al.x-26,GROUND-44,52,5);drawCalls++;
    dimg(IMG[al.kind==="vit"?"star_shard":"gravity_ring"],al.x-14,GROUND-78,28,32);
    if(Math.abs(player.x-al.x)<170){ // labels only when near: keeps draw calls under budget
      text(al.kind==="vit"?STR.altarVit:STR.altarFuse,al.x,GROUND-104,11,"#c9a86b");
      text(al.kind==="vit"?STR.altarVitDesc:STR.altarFuseDesc,al.x,GROUND-88,10,"#e8dcc8");
      if(Math.abs(player.x-al.x)<60)text(STR.altarBuy,al.x,GROUND-122,10,"#9f7bff");}}}
// guardian
const g=level.guardian;
if(g.state!=="dead"&&g.x>cam-300&&g.x<cam+VW+300){
  if(g.flash%2===1)ctx.globalAlpha=0.4;
  dimg(IMG.guardian,g.x-83,g.y-170,166,170,true);ctx.globalAlpha=1;
  if(g.state==="fight"){
    ctx.fillStyle="#1a1626";ctx.fillRect(g.x-90,g.y-200,180,11);drawCalls++;
    ctx.fillStyle=g.phase===1?"#9f7bff":"#6d5a9e";ctx.fillRect(g.x-89,g.y-199,178*Math.max(0,g.hp/g.hpMax),9);drawCalls++;
    text(STR.guardianName,g.x,g.y-212,12,"#9f7bff");}}
// nexus shrine + Asteria
const nx=level.nexusX;
if(nx-cam<VW+400){ctx.fillStyle="rgba(201,168,107,0.16)";ctx.beginPath();ctx.arc(nx+60,GROUND-110,150,0,7);ctx.fill();drawCalls++;
 const ab=Math.sin(time*0.04)*5;
 if(time%5===0)parts.push({x:nx+20+vrng()*90,y:GROUND-40-vrng()*100,vx:-0.4-vrng()*0.5,vy:-0.3,life:36,color:vrng()<0.5?"#c9a86b":"#9f7bff"});
 dimg(IMG.asteria,nx,GROUND-144+ab,150,152,true);
 text(STR.nexusNear,nx+70,GROUND-280,15,"#c9a86b");}
// bestiary mobs
for(const m of level.mobs){
 if(m.hp<=0)continue;if(m.x<cam-150||m.x>cam+VW+150)continue;
 const my=m.kind==="harpy"?(m.fy??m.y-190):(m.kind==="lion"?(m.fy??m.y):m.y);
 const sizes={harpy:[79,74],golem:[81,86],serpent:[86,84],lion:[108,72]};
 const[mw,mh]=sizes[m.kind];
 if(m.flash%2===1)ctx.globalAlpha=0.4;
 ctx.save();
 const wob=m.kind==="harpy"?Math.sin(m.t*0.1)*0.08:(m.charging||m.pouncing?0.12*m.dir:Math.sin(m.t*0.04)*0.03);
 const myo=m.kind==="golem"?Math.abs(Math.sin(m.t*0.05))*-2:(m.kind==="serpent"?Math.sin(m.t*0.06)*3:0);
 ctx.translate(m.x,(m.kind==="harpy"?my+40:my)+myo);ctx.rotate(wob);
 dimg(IMG[m.kind],-mw/2,-(m.kind==="harpy"?mh*0.55:mh),mw,mh,(player.x<m.x));
 ctx.restore();ctx.globalAlpha=1;
 ctx.fillStyle="#1a1626";ctx.fillRect(m.x-22,(m.kind==="harpy"?my-mh*0.55:my-mh)-10,44,5);drawCalls++;
 ctx.fillStyle="#d4634a";ctx.fillRect(m.x-21,(m.kind==="harpy"?my-mh*0.55:my-mh)-9,42*Math.max(0,m.hp/m.hpMax),3);drawCalls++;}
// rivals
for(const r of level.rivals){if(r.state==="dead")continue;if(r.x<cam-200||r.x>cam+VW+200)continue;
 if(r.flash%2===1)ctx.globalAlpha=0.4;
 dimg(IMG[r.img],r.x-50,r.y-110,100,110,true);ctx.globalAlpha=1;
 if(r.state==="fight"){ctx.fillStyle="#1a1626";ctx.fillRect(r.x-50,r.y-140,100,9);drawCalls++;
  ctx.fillStyle=r.color;ctx.fillRect(r.x-49,r.y-139,98*Math.max(0,r.hp/r.hpMax),7);drawCalls++;}}
// player projectiles
for(const pr of projs)dimg(IMG[ELEMENTS[pr.el].icon],pr.x-16*ELEMENTS[pr.el].size,pr.y-16*ELEMENTS[pr.el].size,32*ELEMENTS[pr.el].size,32*ELEMENTS[pr.el].size,pr.vx<0);
// enemy projectiles
for(const ep of eprojs)dimg(IMG[ep.img],ep.x-14,ep.y-14,28,28,ep.vx<0);
// particles: ghosts as sprites, rest one batched pass per color
const byColor={};
for(const pa of parts){
 if(pa.ghost){ctx.globalAlpha=Math.max(0,pa.ghost.alpha*(pa.life/30));dimg(IMG[pa.ghost.img],pa.x-33,pa.y-32,66,64,pa.ghost.face<0);ctx.globalAlpha=1;continue;}
 (byColor[pa.color]??=[]).push(pa);}
for(const c in byColor){ctx.fillStyle=c;ctx.beginPath();for(const pa of byColor[c])ctx.rect(pa.x-2,pa.y-2,4,4);ctx.fill();drawCalls++;}
// player: pose-driven procedural animation rig
const p=player;
if(p.inv%6<3){
 const C=cloak();
 // pose select: airborne -> jump sprite; grounded idle -> stand sprite; else run sprite
 const airborne=!p.onGround&&p.dashT<=0;
 const standing=p.onGround&&Math.abs(p.vx)<=0.6&&p.dashT<=0;
 const img=airborne?IMG["pose_jump_"+C.id]:(standing?IMG["pose_stand_"+C.id]:IMG[C.img]);
 let pw,ph;
 if(airborne){pw=64;ph=66;}else if(standing){pw=29;ph=67;}else{pw=66;ph=64;}
 let bob=0,lean=0,sx=1,syq=1;
 // idle: breathing scale + slow bob; cloak motes drift off
 if(standing&&p.idleT>12){bob=Math.sin(time*0.05)*2.2;syq=1+Math.sin(time*0.05)*0.02;
   if(time%26===0)parts.push({x:p.x-p.face*10+(vrng()-0.5)*14,y:p.y-26-vrng()*30,vx:(vrng()-0.5)*0.4,vy:-0.5-vrng()*0.5,life:34,color:C.color});}
 // run: lean into motion + stride bob
 if(Math.abs(p.vx)>0.6&&p.onGround){lean=0.10*Math.sign(p.vx);bob=Math.abs(Math.sin(time*0.25))*-3;}
 // air: rising = tucked jump pose upright-ish; falling = spread with forward tilt
 if(airborne){
   if(p.vy<0){lean=0.05*p.face;syq*=1.05;sx*=0.96;}                 // rising tuck stretch
   else{lean=0.10*p.face+Math.min(0.14,p.vy*0.011);sx*=1.05;syq*=0.97;} // falling spread
   if(p.djT>0){lean+=p.face*0.5*(p.djT/12);}                         // double-jump flip kick
 }
 if(p.dashT>0)lean=0.22*p.face;
 // landing squash
 if(p.land>0){syq*=1-0.05*(p.land/10)*2;sx*=1+0.10*(p.land/10);}
 // cast recoil
 if(p.recoil>0){lean-=0.05*p.face*(p.recoil/8);}
 const rx=p.recoil>0?-p.face*2.5*(p.recoil/8):0;
 ctx.save();ctx.translate(p.x+rx,p.y+bob);ctx.rotate(lean);ctx.scale(sx,syq);
 dimg(img,-pw/2,-ph,pw,ph,p.face<0);ctx.restore();
 // ward arc shield
 if(p.warding){const wr=40+Math.sin(time*0.2)*2;
   ctx.strokeStyle=C.color;ctx.lineWidth=4;ctx.globalAlpha=0.85;
   ctx.beginPath();ctx.arc(p.x+bob*0+p.face*14,p.y-34,wr,-1.25+(p.face<0?Math.PI:0),1.25+(p.face<0?Math.PI:0));ctx.stroke();drawCalls++;
   ctx.globalAlpha=0.18;ctx.beginPath();ctx.arc(p.x+p.face*14,p.y-34,wr,-1.25+(p.face<0?Math.PI:0),1.25+(p.face<0?Math.PI:0));
   ctx.lineWidth=12;ctx.stroke();ctx.globalAlpha=1;drawCalls++;}
 // muzzle flash on cast
 if(p.recoil>5){const el=ELEMENTS[p.els[p.el]];ctx.fillStyle=el.color;ctx.globalAlpha=0.8*(p.recoil-5)/3;
   ctx.beginPath();ctx.arc(p.x+p.face*30,p.y-34,9+(8-p.recoil)*3,0,7);ctx.fill();ctx.globalAlpha=1;drawCalls++;}}
ctx.restore(); // world
if(player.fuseFlash>0){ctx.fillStyle=`rgba(201,168,107,${player.fuseFlash/100})`;ctx.fillRect(0,0,VW,720);drawCalls++;}
if(state!=="over"&&state!=="escape")renderHUD(VW);
if(state==="card")renderCard(VW);
if(state==="over"||state==="escape")renderEnd(VW);
if(state==="pause")text(STR.pause,VW/2,360,26,"#c9a86b");
ctx.restore(); // scale
renderTouchUI();devOut();}

function renderHUD(VW){
const p=player;
// trail heat bar
ctx.fillStyle="rgba(7,6,12,0.72)";ctx.fillRect(14,12,290,58);drawCalls++;
text(STR.heat,24,32,13,"#c9a86b","left");
ctx.fillStyle="#1a1626";ctx.fillRect(24,40,210,14);drawCalls++;
const hcol=p.heat>40?"#c9a86b":(p.heat>18?"#d4634a":"#ff3030");
ctx.fillStyle=hcol;ctx.fillRect(24,40,210*p.heat/100,14);drawCalls++;
// hp
text(STR.hpLabel,24,68,11,"#7a8e5e","left");
for(let i=0;i<p.hpMax;i++){ctx.fillStyle=i<p.hp?"#d4634a":"#2a2138";ctx.fillRect(110+i*22,58,16,12);drawCalls++;}
// fusion meter
if(p.els.length>=2){
  text(STR.fusionLabel,24,96,11,"#9f7bff","left");
  ctx.fillStyle="#1a1626";ctx.fillRect(90,86,144,12);drawCalls++;
  const full=p.fuse>=p.fuseMax;
  ctx.fillStyle=full?"#c9a86b":"#9f7bff";ctx.fillRect(90,86,144*p.fuse/p.fuseMax,12);drawCalls++;
  if(full&&time%40<25)text(STR.fusionReady,24,118,11,"#c9a86b","left");}
// ward gauge
text(STR.wardLabel,250,32,11,"#4a7a9c","left");
ctx.fillStyle="#1a1626";ctx.fillRect(300,22,90,11);drawCalls++;
ctx.fillStyle=p.wardFlash>0?"#d4634a":cloak().color;ctx.fillRect(300,22,90*p.ward/p.wardMax,11);drawCalls++;
// shards + fragments + close calls
text(STR.shardCount+": "+p.shards,250,52,12,"#c9a86b","left");
if(fragments>0)text(STR.fragCount+": "+fragments,250,70,11,"#9f7bff","left");
if(closeCalls>0)text(STR.closeCalls+": "+closeCalls,400,52,11,"#e8dcc8","left");
// elements
for(let i=0;i<p.els.length;i++){const el=ELEMENTS[p.els[i]];const x=VW-60-i*56;
 ctx.fillStyle=i===p.el?"rgba(201,168,107,0.3)":"rgba(7,6,12,0.6)";ctx.fillRect(x-4,10,52,52);drawCalls++;
 if(i===p.el){ctx.strokeStyle=el.color;ctx.lineWidth=2;ctx.strokeRect(x-4,10,52,52);drawCalls++;}
 dimg(IMG[el.icon],x,14,44,44);}
if(toastT>0)text(toast,VW/2,140,18,"#c9a86b");
if(bigToastT>0){ctx.fillStyle="rgba(7,6,12,0.82)";ctx.fillRect(VW/2-360,170,720,86);drawCalls++;
 const lines=bigToast.split("\n");text(lines[0],VW/2,202,20,"#9f7bff");if(lines[1])text(lines[1],VW/2,232,14,"#e8dcc8");}}

function renderCard(VW){const r=cardRival;
ctx.fillStyle="rgba(7,6,12,0.85)";ctx.fillRect(0,0,VW,720);drawCalls++;
text(STR.rivalIntercept,VW/2,170,16,"#d4634a");
const big=r.img==="guardian";dimg(IMG[r.img],VW/2-(big?85:70),big?180:210,big?170:140,big?175:150,false);
text(r.name,VW/2,410,24,r.color);
wrap(r.wish,VW/2,450,15,"#e8dcc8",640);
text(STR.retry.replace(STR.retry,isTouch?"Tap to face them":"Press SPACE to face them"),VW/2,560,14,"#c9a86b");}

function wrap(s,x,y,size,color,maxw){ctx.font=`bold ${size}px 'Courier New',monospace`;const words=s.split(" ");let line="",yy=y;
for(const w of words){if(ctx.measureText(line+w).width>maxw){text(line,x,yy,size,color);line=w+" ";yy+=size+8;}else line+=w+" ";}
text(line,x,yy,size,color);}

function renderTitle(VW){
ctx.fillStyle="rgba(7,6,12,0.55)";ctx.fillRect(0,0,VW,720);drawCalls++;
dimg(IMG.asteria,VW/2-160,150,180,150,true);
dimg(IMG.player_ember,VW/2+30,190,120,116,false);
text(STR.title,VW/2,420,64,"#c9a86b");
text(STR.subtitle,VW/2,460,20,"#9f7bff");
text(STR.pressStart,VW/2,540,16,"#e8dcc8");
text(isTouch?STR.controlsTouch:STR.controls,VW/2,590,12,"#7a8e5e");}

function renderIntro(VW){
ctx.fillStyle="rgba(7,6,12,0.78)";ctx.fillRect(0,0,VW,720);drawCalls++;
const lines=STR.intro.split("|");let y=260;
for(const l of lines){text(l,VW/2,y,17,"#e8dcc8");y+=44;}
text(STR.pressStart,VW/2,y+60,15,"#c9a86b");}

function renderForge(VW){
ctx.fillStyle="rgba(7,6,12,0.82)";ctx.fillRect(0,0,VW,720);drawCalls++;
text(STR.forgeTitle,VW/2,130,30,"#c9a86b");
text(STR.forgeSub,VW/2,164,13,"#7a8e5e");
const C=CLOAKS[cloakIdx];
// carousel: prev/next dimmed
const prev=CLOAKS[(cloakIdx+CLOAKS.length-1)%CLOAKS.length],next=CLOAKS[(cloakIdx+1)%CLOAKS.length];
ctx.globalAlpha=0.25;dimg(IMG["pose_stand_"+prev.id],VW/2-245,238,52,114,false);dimg(IMG["pose_stand_"+next.id],VW/2+195,238,52,114,true);ctx.globalAlpha=1;
const bob=Math.sin(time*0.05)*4;
dimg(IMG["pose_stand_"+C.id],VW/2-31,206+bob,62,136,false);
ctx.strokeStyle=C.color;ctx.lineWidth=3;ctx.strokeRect(VW/2-90,196,180,180);drawCalls++;
text(C.name,VW/2,420,24,C.color);
wrap(C.desc,VW/2,456,14,"#e8dcc8",620);
text(STR.forgeHint,VW/2,560,13,"#c9a86b");
text(STR.controlsForge,VW/2,596,11,"#7a8e5e");
if(closeCalls>0)text(STR.closeCalls+": "+closeCalls+"   "+STR.fragCount+": "+fragments,VW/2,640,12,"#9f7bff");}

function renderEnd(VW){
ctx.fillStyle="rgba(7,6,12,0.8)";ctx.fillRect(0,0,VW,720);drawCalls++;
if(state==="escape"){winT++;
 // she dissolves into stardust as the screen holds
 const fade=Math.max(0,1-winT/110);
 ctx.globalAlpha=fade;dimg(IMG.asteria,VW/2-77+winT*1.7,150-winT*0.6,154,156,false);ctx.globalAlpha=1;
 if(winT%3===0&&fade>0)parts.push({x:VW/2+winT*1.7+(vrng()-0.5)*60,y:200+(vrng()-0.5)*80,vx:vrng()*1.5,vy:-0.6,life:40,color:vrng()<0.5?"#c9a86b":"#9f7bff"});
 text(STR.escapeTitle,VW/2,350,32,"#c9a86b");
 wrap(STR.escape1,VW/2,396,15,"#e8dcc8",700);
 if(winT>60)wrap(STR.escape2,VW/2,448,15,"#9f7bff",700);
 if(winT>120){wrap(STR.escape3,VW/2,508,15,"#c9a86b",700);
   text(STR.closeCalls+": "+closeCalls+"   "+STR.fragCount+": "+fragments,VW/2,548,13,"#e8dcc8");}
 if(winT>150)text(STR.retry,VW/2,610,14,"#7a8e5e");}
else{text(overMsg,VW/2,320,34,"#d4634a");text(overSub,VW/2,370,16,"#e8dcc8");text(STR.retry,VW/2,470,15,"#c9a86b");}}

function renderTouchUI(){if(!isTouch)return;
for(const b of touchBtns){ctx.fillStyle=touchHeld.has(b.cmd)?"rgba(201,168,107,0.45)":"rgba(201,168,107,0.16)";ctx.fillRect(b.x,b.y,b.w,b.h);drawCalls++;
ctx.fillStyle="#e8dcc8";ctx.font=`bold ${b.h*0.45}px monospace`;ctx.textAlign="center";ctx.fillText(b.label,b.x+b.w/2,b.y+b.h*0.65);drawCalls++;}}

// ---------- dev overlay ----------
const dev=new URLSearchParams(location.search).has("dev");
const devEl=document.getElementById("dev");if(dev)devEl.style.display="block";
let frames=0,fpsAt=performance.now(),fps=0;
function devOut(){if(!dev)return;devEl.textContent=`${fps} fps\ndraw calls: ${drawCalls}\nentities: ${parts.length+projs.length+eprojs.length}\nheat ${player.heat.toFixed(0)} x ${player.x.toFixed(0)}`;}

// ---------- loop ----------
const STEP=1000/60;let acc=0,last=performance.now(),paused=false;
addEventListener("blur",()=>{paused=true;if(state==="play")state="pause";});
addEventListener("focus",()=>{paused=false;last=performance.now();});
function frame(now){requestAnimationFrame(frame);if(paused)return;
acc+=now-last;last=now;if(acc>250)acc=250;
const cmds=commands();
while(acc>=STEP){update(STEP,cmds);acc-=STEP;}
render();
frames++;if(now-fpsAt>=500){fps=Math.round(frames*1000/(now-fpsAt));frames=0;fpsAt=now;}}
resize();reset();requestAnimationFrame(frame);

// ---------- test hook (headless smoke; no-op for players) ----------
globalThis.__TEST={update,render,pressed,guardian:()=>level.guardian,mobs:()=>level.mobs,cloak:()=>cloak(),setCloak:(i)=>{cloakIdx=i;},closeCalls:()=>closeCalls,way:()=>level.way,frags:()=>fragments,setFrags:(n)=>{fragments=n;},plats:()=>level.plats,
 nearestEproj:()=>{let best=null;for(const ep of eprojs){const dx=ep.x-player.x,dy=ep.y-(player.y-34);const d=Math.hypot(dx,dy);if((dx*ep.vx<0||Math.abs(dx)<60)&&(!best||d<best.d))best={d,dy};}return best;},
 voidBelow:()=>{return !level.plats.some(pl=>player.x>pl.x-12&&player.x<pl.x+pl.w+12&&pl.y>=player.y-4&&pl.y<=player.y+320);},
 stepUp:(d=100)=>{const px=player.x+d;return level.plats.some(pl=>px>pl.x-10&&px<pl.x+pl.w+10&&pl.y<player.y-20&&pl.y>player.y-160);},
 state:()=>state,player:()=>player,overMsg:()=>overMsg,
 reset:(s)=>{SEED=s;reset();state="title";player.dead=false;},
 activeRival:()=>level.rivals.find(r=>r.state==="fight")||null,
 aheadGap:(d=90)=>{const px=player.x+d;return !level.plats.some(pl=>px>pl.x-10&&px<pl.x+pl.w+10&&pl.y>=player.y-150&&pl.y<=player.y+80);}};
