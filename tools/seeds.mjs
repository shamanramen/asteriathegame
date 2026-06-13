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
function run(n,cmds=[]){for(let i=0;i<n;i++){T.update(16.67,new Set(cmds));T.render();}}
let fails=0;
const only=process.argv[2]?parseInt(process.argv[2]):null;
const verbose=!!only;
for(let seed=only??7;seed<(only?only+1:27);seed++){
  T.setFrags(0);T.reset(seed);key("jump");run(1);key("jump");run(1);key("jump");run(1);
  let steps=0;
  while(T.state()!=="over"&&T.state()!=="escape"&&steps<60*300){
    steps++;
    if(T.state()==="card"){key("jump");run(1);continue;}
    const p=T.player();const cmds=["right"];
    if(p.onGround){if(T.aheadGap(40))key("jump");else if(T.stepUp(100))key("jump");}
    else if(!T.activeRival()&&p.vy>0&&p.dashCd<=0&&T.voidBelow())key("dash");
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
    if(r){const wi=p.els.indexOf(r.weak);if(wi>=0&&p.el!==wi)key("switch");
      if(steps%10===0)key("cast");
      const ep=T.nearestEproj();
      if(ep&&ep.d<150&&p.onGround&&p.ward>30&&(r.x-p.x)*p.face>0)cmds.push("ward"); // ward only while facing the enemy
      else if(ep&&ep.d<90&&p.dashCd<=0)key("dash");
      cmds.length=0;if(p.x<r.x-320)cmds.push("right");else if(p.x>r.x-160)cmds.push("left");
      if(ep&&ep.d<140&&ep.dy>-30&&p.onGround&&steps%6===0)key("jump");}
    run(1,cmds);
    if(verbose&&steps%120===0)console.log(steps,Math.round(p.x),Math.round(p.y),"hp",p.hp,"heat",p.heat.toFixed(0),"ward",Math.round(p.ward),"fuse",Math.round(p.fuse),"mob",mob?mob.kind+"@"+Math.round(mob.x):"-","rival",r?Math.round(r.x):"-");
  }
  const ok=T.state()==="escape";if(!ok)fails++;
  console.log("seed",seed,T.state(),(steps/60).toFixed(0)+"s","hp:"+T.player().hp,"heat:"+T.player().heat.toFixed(0),ok?"":("REASON: "+T.overMsg()));
}
console.log(fails===0?"ALL SEEDS PASS":fails+" SEEDS FAIL");
