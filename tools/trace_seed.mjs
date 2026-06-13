const listeners={};
globalThis.addEventListener=(t,f)=>{(listeners[t]??=[]).push(f)};
globalThis.innerWidth=1280;globalThis.innerHeight=720;globalThis.devicePixelRatio=1;
globalThis.matchMedia=()=>({matches:false});
Object.defineProperty(globalThis,"navigator",{value:{getGamepads:()=>[]},configurable:true});
globalThis.location={search:""};globalThis.requestAnimationFrame=()=>{};
globalThis.Image=class{set src(v){setTimeout(()=>this.onload&&this.onload())}};
globalThis.Audio=class{constructor(){this.volume=1}play(){return{catch(){}}}cloneNode(){return new globalThis.Audio()}};
const ctxStub=new Proxy({},{get:(t,k)=>{if(k==="measureText")return()=>({width:10});return typeof k==="string"?()=>{}:undefined}});
globalThis.document={getElementById:(id)=>id==="c"?{getContext:()=>ctxStub,style:{}}:{style:{},textContent:""}};
await import("../game/game.js");
const T=globalThis.__TEST;
function key(c){T.pressed.add(c)}
function run(n,cmds=[]){for(let i=0;i<n;i++)T.update(16.67,new Set(cmds));}
const seed=parseInt(process.argv[2]||"12");
T.reset(seed);key("jump");run(1);key("jump");run(1);key("jump");run(1);
let steps=0;const trc=[];
while(T.state()!=="over"&&T.state()!=="escape"&&steps<60*300){
  steps++;
  if(T.state()==="card"){key("jump");run(1);continue;}
  const p=T.player();const cmds=["right"];
  const MW={harpy:"fire",golem:"lightning",serpent:"lightning",lion:"gravity"};
  const mob=T.mobs().find(m=>{
    if(m.hp<=0||Math.abs(m.x-p.x)>320||m.x<p.x-60)return false;
    const hy=m.hitY??m.y-40;
    return Math.abs(hy-(p.y-34))<55;});
  if(mob&&!T.activeRival()){
    const wi2=p.els.indexOf(MW[mob.kind]);
    if(wi2>=0&&p.el!==wi2)key("switch");
    if(steps%9===0)key("cast");
    if(mob.kind==="golem"&&Math.abs(mob.x-p.x)<90&&p.dashCd<=0&&p.onGround&&!T.aheadGap(200)&&!T.aheadGap(40))key("dash");else if(Math.abs(mob.x-p.x)<140&&p.onGround){cmds.length=0;cmds.push("ward");}
  }
  if(p.onGround){if(T.aheadGap(40))key("jump");else if(T.stepUp(100))key("jump");}
  else if(!T.activeRival()&&p.vy>0&&p.dashCd<=0&&T.voidBelow())key("dash");
  const r=T.activeRival();
  if(r){const wi=p.els.indexOf(r.weak);if(wi>=0&&p.el!==wi)key("switch");
    if(steps%10===0)key("cast");
    const ep=T.nearestEproj();
    if(ep&&ep.d<150&&p.onGround&&p.ward>30&&(r.x-p.x)*p.face>0)cmds.push("ward");
    else if(ep&&ep.d<90&&p.dashCd<=0)key("dash");
    cmds.length=0;if(p.x<r.x-320)cmds.push("right");else if(p.x>r.x-160)cmds.push("left");
    if(ep&&ep.d<140&&ep.dy>-30&&p.onGround&&steps%6===0)key("jump");}
  run(1,cmds);
  trc.push([steps,Math.round(T.player().x),Math.round(T.player().y),T.player().onGround?1:0,T.player().dashCd]);
  if(trc.length>50)trc.shift();
  if(false)console.log(steps,Math.round(T.player().x),Math.round(T.player().y),T.player().onGround?"G":"a","vy",T.player().vy.toFixed(1),"gap40",T.aheadGap(40),"dashT",T.player().dashT);
}
const p=T.player();
console.log("seed",seed,T.state(),T.overMsg(),"died at x",p.x.toFixed(0),"y",p.y.toFixed(0),"rival:",JSON.stringify(T.activeRival()?{x:T.activeRival().x,hp:T.activeRival().hp}:null),"guardian:",JSON.stringify({s:T.guardian().state,hp:T.guardian().hp}),"mobsAlive:",T.mobs().filter(m=>m.hp>0&&Math.abs(m.x-p.x)<500).map(m=>({k:m.kind,x:Math.round(m.x),hp:m.hp})));
console.log(JSON.stringify(trc.slice(-30)));
console.log(T.plats().filter(pl=>pl.x>p.x-700&&pl.x<p.x+500).sort((a,b)=>a.x-b.x).map(pl=>({x:Math.round(pl.x),y:pl.y,w:Math.round(pl.w),end:Math.round(pl.x+pl.w)})));
