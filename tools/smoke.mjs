// Headless smoke: stub browser globals, drive update() via scripted routes.
const listeners={};
globalThis.addEventListener=(t,f)=>{(listeners[t]??=[]).push(f)};
globalThis.innerWidth=1280;globalThis.innerHeight=720;globalThis.devicePixelRatio=1;
globalThis.matchMedia=()=>({matches:false});
Object.defineProperty(globalThis,"navigator",{value:{getGamepads:()=>[]},configurable:true});
globalThis.location={search:""};
globalThis.URLSearchParams=URLSearchParams;
globalThis.performance=performance;
globalThis.requestAnimationFrame=()=>{};
globalThis.Image=class{set src(v){setTimeout(()=>this.onload&&this.onload())}};
globalThis.Audio=class{constructor(){this.volume=1}play(){return{catch(){}}}cloneNode(){return new globalThis.Audio()}};
const ctxStub=new Proxy({globalAlpha:1,fillStyle:"",strokeStyle:"",lineWidth:1,font:"",textAlign:""},{
 get:(t,k)=>{if(k in t)return t[k];if(k==="measureText")return()=>({width:10});return typeof k==="string"?()=>{}:undefined},
 set:(t,k,v)=>{t[k]=v;return true}});
const canvasStub={getContext:()=>ctxStub,style:{},width:0,height:0};
globalThis.document={getElementById:(id)=>id==="c"?canvasStub:{style:{},textContent:""}};
const mod=await import("../game/game.js");
// reach internals via exported test hooks
const T=globalThis.__TEST;
if(!T){console.error("NO TEST HOOK");process.exit(1)}
function key(c){T.pressed.add(c)}
function run(frames,cmds=[]){for(let i=0;i<frames;i++){const s=new Set(cmds);T.update(16.67,s);T.render();}}
// --- start game ---
key("jump");run(1);key("jump");run(1);key("jump");run(1); // title->intro->forge->play
console.log("state after start:",T.state());
// REFERENCE ROUTE: keep moving right, jump periodically, cast when rival fight, dash through
let result="",steps=0;const trace=[];
while(T.state()!=="over"&&T.state()!=="escape"&&steps<60*360){
  steps++;
  const st=T.state();
  if(st==="card"){key("jump");run(1);continue;}
  const p=T.player();
  const cmds=["right"];
  if(p.onGround){
    if(T.aheadGap(40))key("jump");                            // jump at the edge for max reach
    else if(T.stepUp&&T.stepUp(100))key("jump");              // raised ledge ahead
  } else if(!T.activeRival()&&p.vy>0&&p.dashCd<=0&&T.voidBelow())key("dash"); // air-dash glide over void
  if(st==="play"){
    const w=T.way&&T.way();
    if(w&&p.x>w.x0&&p.x<w.x1&&!T.activeRival()){
      const wantVit=p.hp<p.hpMax-1&&p.shards>=3;
      const wantFuse=!wantVit&&p.fuse<p.fuseMax*0.5&&p.shards>=4&&p.els.length>=2;
      if(wantVit||wantFuse){
        const al=w.altars.find(a=>a.kind===(wantVit?"vit":"fuse"));
        if(al){cmds.length=0;
          if(Math.abs(p.x-al.x)>30)cmds.push(p.x<al.x?"right":"left");
          else if(steps%8===0)key("cast");}
      }
    }
    const MW={harpy:"fire",golem:"lightning",serpent:"lightning",lion:"gravity"};
    const mob=T.mobs().find(m=>{
      if(m.hp<=0||Math.abs(m.x-p.x)>320||m.x<p.x-60)return false;
      const hy=m.hitY??m.y-40;
      return Math.abs(hy-(p.y-34))<55;});   // only mobs on the projectile line (divers count when low)
    if(mob&&!T.activeRival()){
      const wi2=p.els.indexOf(MW[mob.kind]);
      if(wi2>=0&&p.el!==wi2)key("switch");
      if(steps%9===0)key("cast");
      if(mob.kind==="golem"&&Math.abs(mob.x-p.x)<90&&p.dashCd<=0&&p.onGround&&!T.aheadGap(200)&&!T.aheadGap(40))key("dash");else if(Math.abs(mob.x-p.x)<140&&p.onGround){cmds.length=0;cmds.push("ward");} // turtle: ward + cast
    }
    let r=T.activeRival();
    const g=T.guardian&&T.guardian();
    if(!r&&g&&g.state==="fight")r={x:g.x,weak:g.weak,t:g.t};
    if(p.fuse>=p.fuseMax&&r)key("fuse");
    if(r){ // fight: weak element, cast constantly, dash-i-frame through incoming fire
      const els=p.els;const wi=els.indexOf(r.weak);
      if(wi>=0&&p.el!==wi)key("switch");
      if(steps%10===0)key("cast");
      const ep=T.nearestEproj&&T.nearestEproj();
      if(ep&&ep.d<90&&p.dashCd<=0)key("dash");          // i-frame through projectile
      cmds.length=0;
      if(p.x<r.x-320)cmds.push("right");else if(p.x>r.x-160)cmds.push("left");
      if(ep&&ep.d<140&&ep.dy>-30&&p.onGround&&steps%6===0)key("jump"); // hop over low shots
    }
  }
  run(1,cmds);
  if(steps%5===0)trace.push([steps,Math.round(T.player().x),Math.round(T.player().y),T.player().onGround?1:0]);
  if(trace.length>60)trace.shift();
}
console.log("guardian:",JSON.stringify({state:T.guardian().state,hp:T.guardian().hp,phase:T.guardian().phase}),"frags:",T.frags());
console.log("trace tail:",JSON.stringify(trace.slice(-25)));
const p=T.player();
console.log("REFERENCE:",T.state(),"steps:",steps,"time(s):",(steps/60).toFixed(1),"x:",p.x.toFixed(0),"y:",p.y.toFixed(0),"heat:",p.heat.toFixed(1),"hp:",p.hp,"els:",p.els.join(","),"reason:",T.overMsg());
result=T.state();
// CONTRAST ROUTE: linger (no movement)
T.reset(7);
key("jump");run(1);key("jump");run(1);key("jump");run(1);
let s2=0;while(T.state()!=="over"&&T.state()!=="escape"&&s2<60*360){s2++;if(T.state()==="card"){key("jump");run(1);continue;}run(1,[]);}
console.log("CONTRAST(idle):",T.state(),"time(s):",(s2/60).toFixed(1),"reason:",T.overMsg());
// PATTERN-LESS ROUTE: same play but never dash (and no dash-glide) -> should fail
T.reset(7);key("jump");run(1);key("jump");run(1);key("jump");run(1);
let s3=0;
while(T.state()!=="over"&&T.state()!=="escape"&&s3<60*360){
  s3++;
  if(T.state()==="card"){key("jump");run(1);continue;}
  const p=T.player();const cmds=["right"];
  if(p.onGround){if(T.aheadGap(40))key("jump");else if(T.stepUp(100))key("jump");}
  const r=T.activeRival();
  if(r){const wi=p.els.indexOf(r.weak);if(wi>=0&&p.el!==wi)key("switch");
    if(s3%10===0)key("cast");
    cmds.length=0;if(p.x<r.x-320)cmds.push("right");else if(p.x>r.x-160)cmds.push("left");
    const ep=T.nearestEproj();
    if(ep&&ep.d<140&&p.onGround&&s3%6===0)key("jump");}
  run(1,cmds);
}
console.log("PATTERN-LESS(no dash):",T.state(),"time(s):",(s3/60).toFixed(1),"x:",T.player().x.toFixed(0),"reason:",T.overMsg());
// DETERMINISM: same seed twice, compare positions after 600 frames
T.reset(7);key("jump");run(1);key("jump");run(1);key("jump");run(1);run(600,["right"]);const a=JSON.stringify([T.player().x,T.player().y,T.player().heat]);
T.reset(7);key("jump");run(1);key("jump");run(1);key("jump");run(1);run(600,["right"]);const b=JSON.stringify([T.player().x,T.player().y,T.player().heat]);
console.log("DETERMINISM:",a===b?"PASS":"FAIL",a,b);
// FUZZER: 3000 random valid inputs, no crash
T.reset(11);key("jump");run(1);key("jump");run(1);key("jump");run(1);
const acts=["left","right","jump","cast","dash","switch"];let crash=null;
try{for(let i=0;i<3000;i++){if(T.state()==="card")key("jump");if(Math.random()<0.3)key(acts[Math.floor(Math.random()*acts.length)]);run(1,[acts[Math.floor(Math.random()*acts.length)]]);if(T.state()==="over"||T.state()==="escape"){key("jump");run(1);}}}catch(e){crash=e}
console.log("FUZZER:",crash?("CRASH "+crash.message):"PASS");
console.log("SMOKE done. reference result:",result);
