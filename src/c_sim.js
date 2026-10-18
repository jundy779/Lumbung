
/* ==========================================================================
   LAPISAN 2 · SUMBER DATA (Simulator)
   Satu-satunya bagian yang MENULIS ke Store. Ganti dengan adapter WMS/GPS
   yang memanggil fungsi yang sama (upsert truck, setPalletLocation, emit)
   dan tampilan 3D maupun UI tidak perlu diubah.
   ========================================================================== */
const GRID={x0:-2,x1:2,z0:-1,z1:2};
/* jalan lingkar utara + Gerbang Tol Jagorawi (koordinat dunia) */
const ZHW=(GRID.z0-0.5)*PZ-ROAD/2-40, HWY={zE:ZHW-2.2,zW:ZHW+2.2,xToll:330,xEnd:620,rTurn:4.4};
/* ---------- paths ---------- */
function finalize(pts){ const L=[0]; for(let i=1;i<pts.length;i++) L.push(L[i-1]+Math.hypot(pts[i].x-pts[i-1].x,pts[i].z-pts[i-1].z)); return {p:pts,L,len:L[L.length-1],ci:0}; }
function polyPath(pts,r=1.2){
  const out=[]; const add=(x,z)=>{const l=out[out.length-1]; if(!l||Math.hypot(l.x-x,l.z-z)>1e-4) out.push({x,z});};
  add(pts[0].x,pts[0].z);
  for(let i=1;i<pts.length-1;i++){
    const p0=pts[i-1],p1=pts[i],p2=pts[i+1];
    const l1=Math.hypot(p1.x-p0.x,p1.z-p0.z), l2=Math.hypot(p2.x-p1.x,p2.z-p1.z);
    if(l1<1e-6||l2<1e-6) continue;
    const ux=(p1.x-p0.x)/l1,uz=(p1.z-p0.z)/l1,wx=(p2.x-p1.x)/l2,wz=(p2.z-p1.z)/l2;
    const th=Math.acos(clamp(ux*wx+uz*wz,-1,1));
    if(th<1e-3){ add(p1.x,p1.z); continue; }
    const t=Math.min(r*Math.tan(th/2), l1*0.5, l2*0.5);
    const ax=p1.x-ux*t, az=p1.z-uz*t, bx=p1.x+wx*t, bz=p1.z+wz*t;
    add(ax,az); const n=Math.max(6,Math.ceil(th*14));
    for(let k=1;k<n;k++){const s=k/n,a=(1-s)*(1-s),b=2*(1-s)*s,c=s*s; add(a*ax+b*p1.x+c*bx,a*az+b*p1.z+c*bz);}
    add(bx,bz);
  }
  add(pts[pts.length-1].x,pts[pts.length-1].z);
  return finalize(out);
}
function arcPts(cx,cz,r,a0,a1,n=28){const o=[];for(let i=0;i<=n;i++){const a=lerp(a0,a1,i/n);o.push({x:cx+Math.cos(a)*r,z:cz+Math.sin(a)*r});}return o;}
function linePts(x0,z0,x1,z1,step=1){const n=Math.max(1,Math.ceil(Math.hypot(x1-x0,z1-z0)/step)),o=[];for(let i=0;i<=n;i++)o.push({x:lerp(x0,x1,i/n),z:lerp(z0,z1,i/n)});return o;}
function samplePath(P,s){
  s=clamp(s,0,P.len); let i=P.ci; const L=P.L;
  while(i>0&&L[i]>s) i--; while(i<L.length-2&&L[i+1]<s) i++; P.ci=i;
  const a=P.p[i], b=P.p[Math.min(i+1,P.p.length-1)], seg=(L[i+1]-L[i])||1, t=clamp((s-L[i])/seg,0,1);
  let tx=b.x-a.x, tz=b.z-a.z; const tl=Math.hypot(tx,tz)||1;
  return {x:lerp(a.x,b.x,t), z:lerp(a.z,b.z,t), tx:tx/tl, tz:tz/tl};
}
function headingAt(P,s,rev){const p=samplePath(P,s); return rev?Math.atan2(-p.tx,-p.tz):Math.atan2(p.tx,p.tz);}

/* ---------- movement ---------- */
function setPath(e,P,rev,vmax,vturn){ e.path=P; e.s=0; e.rev=!!rev; e.vmax=vmax; e.vturn=vturn||vmax*0.5; P.ci=0; }
const WX={speed:1,fork:1,arrive:1,night:false,density:0.7,traffic:1,flash:false};
function circlesAt(e,x,z,h,out){ const sh=Math.sin(h), ch=Math.cos(h); for(let i=0;i<e.circ.length;i++){ const c=e.circ[i]; out[i]={x:x+sh*c.z,z:z+ch*c.z,r:c.r}; } out.length=e.circ.length; return out; }
function refreshCircles(list){ for(const e of list){ e.cw=e.cw||[]; circlesAt(e,e.pos.x,e.pos.z,e.heading,e.cw); } }
const _own=[];
function overlapC(a,b,m=0){ for(const p of a) for(const q of b){ const r=p.r+q.r+m; if((p.x-q.x)**2+(p.z-q.z)**2<r*r) return true; } return false; }
function lookAhead(e,others){
  if(!e.path) return Infinity;
  const D=Math.min(e.path.len-e.s, Math.max(2.4, e.v*e.v/(2*e.dec)+2.2));
  if(D<=0) return Infinity;
  const near=[];
  for(const o of others){ if(o===e||!o.solid) continue; const dd=Math.hypot(o.pos.x-e.pos.x,o.pos.z-e.pos.z); if(dd>D+9) continue; if(overlapC(e.cw,o.cw,0)) continue; near.push(o); }
  if(!near.length) return Infinity;
  const ci=e.path.ci;
  for(let d=0.35; d<=D+1e-6; d+=0.35){
    const p=samplePath(e.path,e.s+d), h=e.rev?Math.atan2(-p.tx,-p.tz):Math.atan2(p.tx,p.tz);
    circlesAt(e,p.x,p.z,h,_own);
    for(const o of near) if(overlapC(_own,o.cw,0.05)){ e.path.ci=ci; return d-0.35; }
  }
  e.path.ci=ci; return Infinity;
}
function moveStep(e,dt,block){
  if(!e.path) return true;
  const P=e.path, rem=P.len-e.s;
  let allow=Math.min(e.vmax*(e.kind==='person'?1:e.kind==='forklift'?WX.fork*(e.paceMul||1):WX.speed),Math.sqrt(2*e.dec*Math.max(0,rem)));
  const ci=P.ci, h0=headingAt(P,e.s,false), h1=headingAt(P,Math.min(P.len,e.s+2.4),false); P.ci=ci;
  allow=Math.min(allow, lerp(e.vmax,e.vturn,clamp(Math.abs(angDiff(h0,h1))/1.1,0,1)));
  if(block<Infinity) allow=Math.min(allow,Math.sqrt(2*e.dec*Math.max(0,block-0.05)));
  if(block<0.06) allow=0;
  if(allow<e.v) e.v=Math.max(allow,e.v-e.dec*1.6*dt); else e.v=Math.min(allow,e.v+e.acc*dt);
  const ds=Math.min(rem,e.v*dt); e.s+=ds; e.dist=(e.dist||0)+ds;
  const p=samplePath(P,e.s);
  const k=headingAt(P,Math.min(P.len,e.s+0.5),false)-0, kb=headingAt(P,Math.max(0,e.s-0.5),false); P.ci=Math.max(0,P.ci);
  e.curv=angDiff(kb,k)/1.0*(e.rev?-1:1);
  e.pos.x=p.x; e.pos.z=p.z;
  const hd=e.rev?Math.atan2(-p.tx,-p.tz):Math.atan2(p.tx,p.tz);
  e.heading=lerpAngle(e.heading,hd,Math.min(1,dt*14));
  e.spinV=e.v*(e.rev?-1:1);
  if(P.len-e.s<0.003){ e.v=0; e.path=null; e.heading=hd; return true; }
  return false;
}


/* waktu kejadian mengikuti jam simulasi (sama dengan jam asli di mode Real-time) */
function simNow(){ const d=nowWIB(), h=(Store.clock&&Store.clock.hour!=null)?Store.clock.hour:d.getHours()+d.getMinutes()/60; d.setHours(Math.floor(h),Math.floor((h%1)*60),0,0); return d; }
function logEvent(site,text,color='#2E5BFF',ent){ Store.emit({siteId:site.id,siteIdx:site.idx,text,color,t:simNow(),ref:ent&&ent.id}); }


/* ---------- persimpangan: klaim zona + antrean (give-way) ---------- */
const JUNC=new Map(), JH=ROAD/2+0.6;
function initJunctions(){ for(let kx=GRID.x0;kx<=GRID.x1+1;kx++){ for(let kz=GRID.z0;kz<=GRID.z1+1;kz++){ const x=(kx-0.5)*PX, z=(kz-0.5)*PZ; JUNC.set(kx+'_'+kz,{id:kx+'_'+kz,x,z,h:JH,pre:ROAD/2+3.4-JH,occ:new Map(),q:[]}); }
  const x=(kx-0.5)*PX; JUNC.set('H'+kx,{id:'H'+kx,x,z:ZHW,h:7.6,pre:0.6,occ:new Map(),q:[]}); } }
function juncAt(x,z){ const kx=Math.round(x/PX+0.5);
  if(Math.abs(z-ZHW)<=7.6){ const j=JUNC.get('H'+kx); return j&&Math.abs(x-j.x)<=j.h?j:null; }
  const kz=Math.round(z/PZ+0.5), j=JUNC.get(kx+'_'+kz); return j&&Math.abs(x-j.x)<=j.h&&Math.abs(z-j.z)<=j.h?j:null; }
function pathJunctions(P,ox,oz){ if(P.junc) return P.junc; const out=[]; let cur=null; const ci=P.ci;
  for(let s=0;s<=P.len+1e-6;s+=0.5){ const p=samplePath(P,s), j=juncAt(p.x+ox,p.z+oz);
    if(j){ if(!cur||cur.j!==j){ const hIn=Math.round(Math.atan2(p.tx,p.tz)/(Math.PI/2))&3; cur={j,sIn:s,sOut:s,hIn,hOut:hIn}; out.push(cur); } else { cur.sOut=s; cur.hOut=Math.round(Math.atan2(p.tx,p.tz)/(Math.PI/2))&3; } } else cur=null; }
  P.ci=ci; P.junc=out; return out; }
function jHeld(v){ return v._jheld||(hidden(v,'_jheld',new Set()),v._jheld); }
const jCompat=(a,b)=>a===b||(a[0]==='S'&&b[0]==='S'&&a[1]===b[1]);
function jRequest(j,v,mov,exitClear){
  if(j.occ.has(v)) return true;
  if(!j.q.includes(v)) j.q.push(v); hidden(v,'_jmov',mov);
  for(const [o,m] of j.occ) if(!jCompat(m,mov)) return false;
  for(const o of j.q){ if(o===v) break; if(!jCompat(o._jmov,mov)) return false; }
  if(!exitClear) return false;
  j.occ.set(v,mov); j.q.splice(j.q.indexOf(v),1); jHeld(v).add(j); return true; }
function jRelease(j,v){ j.occ.delete(v); const i=j.q.indexOf(v); if(i>=0) j.q.splice(i,1); jHeld(v).delete(j); }
function jDequeue(v){ for(const j of JUNC.values()){ const i=j.q.indexOf(v); if(i>=0) j.q.splice(i,1); } }
function jReleaseAll(v){ for(const j of [...jHeld(v)]) jRelease(j,v); jDequeue(v); }
/* truk: hitung jarak henti di depan persimpangan berikutnya */
const allTrucks=()=>Store.tables.trucks.values();
const _exC=[];
function exitFree(site,t,P,sOut){ const ci=P.ci;
  const offs=t._xpre>1?[1.5,3.5,5.5,7.5,9.5,11.5]:[1.5,3.5,5.5];
  for(const off of offs){ const e=samplePath(P,Math.min(P.len,sOut+off)); circlesAt(t,e.x+site.ox,e.z+site.oz,Math.atan2(e.tx,e.tz),_exC);
    for(const o of allTrucks()){ if(o===t||!o.solid||!o.cwW) continue; if(overlapC(_exC,o.cwW,0.2)){ P.ci=ci; return false; } } }
  P.ci=ci; return true; }
function truckJunctionBlock(site,t){
  const P=t.path; if(!P||t.rev) return Infinity; const J=pathJunctions(P,site.ox,site.oz); let block=Infinity, la;
  for(const c of J){
    if(t.s-3.6>c.sOut){ if(c.j.occ.has(t)) jRelease(c.j,t); continue; }
    const d=c.sIn-c.j.pre-(t.s+3.5)-0.2;
    if(c.j.sig&&d>-0.2){ const st=(c.hIn&1)?c.j.sig.stateH:c.j.sig.stateV; if(st==='R'||(st==='A'&&d>t.v*t.v/(2*t.dec))){ if(c.j.occ.has(t)) jRelease(c.j,t); jDequeue(t); block=Math.min(block,d); break; } }
    if(c.j.occ.has(t)) continue;
    if(d>t.v*t.v/(2*t.dec)+9) break;
    if(la===undefined) la=lookAheadTruck(t,site);
    if(la<d+0.6){ jDequeue(t); block=Math.min(block,d); break; }
    const mv=c.hIn===c.hOut?'S'+((c.hIn&1)?'x':'z')+c.hIn:'T'+c.hIn+c.hOut;
    t._xpre=c.j.pre; const ci=P.ci, ok=jRequest(c.j,t,mv,exitFree(site,t,P,c.sOut)); P.ci=ci;
    if(!ok){ block=Math.min(block,d); break; }
  }
  return block;
}

/* ---------- truk: deteksi tabrakan di koordinat dunia (lintas site) ---------- */
const _ownW=[];
function refreshTruckWorld(site){ for(const t of site.trucks){ if(!t.solid) continue; t.cwW=t.cwW||[]; circlesAt(t,t.pos.x+site.ox,t.pos.z+site.oz,t.heading,t.cwW); } }
const FOLLOW_GAP=2.2, TIGHT_STATES=['reverse','pull','store_reverse','store_pull'];
function lookAheadTruck(t,site){
  if(!t.path) return Infinity;
  /* jarak aman antre: truk berhenti ±2,2 m di belakang kendaraan lain (kecuali manuver presisi di dock) */
  const G=(t.rev||TIGHT_STATES.includes(t.state))?0:FOLLOW_GAP;
  const D=Math.min(t.path.len-t.s,Math.max(2.4,t.v*t.v/(2*t.dec)+2.2)+G); if(D<=0) return Infinity;
  const wx=t.pos.x+site.ox, wz=t.pos.z+site.oz, own0=t.cwW||[], near=[];
  for(const o of Store.tables.trucks.values()){ if(o===t||!o.solid||!o.cwW) continue; const os=o.site;
    if(Math.hypot(o.pos.x+os.ox-wx,o.pos.z+os.oz-wz)>D+9) continue; if(own0.length&&overlapC(own0,o.cwW,0)) continue; near.push(o); }
  for(const o of site.trucks){ const c=o.crew; if(o===t||!c||!c.on) continue; const px=c.x+site.ox, pz=c.z+site.oz; if(Math.hypot(px-wx,pz-wz)>D+6) continue; near.push({cwW:[{x:px,z:pz,r:0.45}],walker:true}); }
  if(!near.length) return Infinity;
  const ci=t.path.ci;
  for(let d=0.35;d<=D+1e-6;d+=0.35){ const p=samplePath(t.path,t.s+d), h=t.rev?Math.atan2(-p.tx,-p.tz):Math.atan2(p.tx,p.tz);
    circlesAt(t,p.x+site.ox,p.z+site.oz,h,_ownW); for(const o of near) if(overlapC(_ownW,o.cwW,0.05)){ t.path.ci=ci; return Math.max(0,d-0.35-(o.walker?0:G)); } }
  t.path.ci=ci; return Infinity;
}
/* ---------- trucks ---------- */
function regionOf(site,bay){ return {x0:bay.x-2.4, x1:bay.x+RT+4.8}; }
const HOME_LANE=['approach','prep','reverse','pull','close','depart','to_store'];
function onLane(site,o){ return o.solid && HOME_LANE.includes(o.state) && o.pos.z>site.zDock+4.2 && o.pos.z<yardZ(site)+2.5 && o.pos.x>site.xL && o.pos.x<site.xR; }
function canAcquire(site,t,r,arriving){
  for(const q of site.res) if(q.owner!==t && q.x0<r.x1 && r.x0<q.x1) return false;
  for(const o of site.trucks){ if(o===t||!onLane(site,o)) continue;
    if(o.pos.x+3.6>r.x0-(arriving?0:12) && o.pos.x-3.6<r.x1) return false;
    if(arriving && o.pos.x>t.pos.x && o.pos.x-3.6<r.x1) return false; }
  return true;
}
function acquire(site,t,r){ t.res={owner:t,x0:r.x0,x1:r.x1}; site.res.push(t.res); }
function release(site,t){ if(!t.res) return; site.res.splice(site.res.indexOf(t.res),1); t.res=null; }
function resBlock(site,t){
  if(!(t.state==='approach'||t.state==='depart'||t.state==='to_store')||Math.sin(t.heading)<0.7 || t.rev || Math.abs(t.pos.z-yardZ(site))>2.5) return Infinity;
  const fx=t.pos.x+3.4; let b=Infinity;
  for(const q of site.res){ if(q.owner===t) continue; if(q.x0>fx-0.2) b=Math.min(b,q.x0-fx-0.6); }
  return b;
}
function clearCargo(t){ for(let k=0;k<6;k++){ if(t.cargo[k]) deletePallet(t.cargo[k]); t.cargo[k]=null; } }
function fillCargo(site,t,n){ clearCargo(t); const r=RAND;
  for(let k=0;k<n;k++){ const p=newPallet(site,r,r()<.25?'crate':r()<.2?'white':'box',1+Math.floor(r()*2),{type:'truck',id:t.id,index:k}); t.cargo[k]=p.id; } }
function expectedOcc(site){ let e=site.slots.filter(s=>s.occupied).length;
  for(const o of site.trucks){ if(o.homeBay&&o.state.startsWith('store')){ e+=o.cargo.filter(Boolean).length+(o.storePhase==='load'?o.total-o.done:0); continue; }
    if(!o.bay||o.bay.siteId!==site.id||o.state==='away'||o.state==='parked') continue; const left=o.total-o.done; e+=o.mode==='unload'?left:-left; }
  return e; }
function planMode(site){ const cap=site.slots.length, e=expectedOcc(site), want=3+Math.floor(RAND()*4);
  const canU=Math.min(want,cap-e), canL=Math.min(want,e);
  if(canU<2&&canL<2) return null;
  if(site.bias&&site.bias.t>0){ if(site.bias.mode==='load'&&canL>=2) return {mode:'load',total:Math.min(canL,5)}; if(site.bias.mode==='unload'&&canU>=2) return {mode:'unload',total:Math.min(canU,5)}; }
  if(canL>=2&&e>cap*0.45&&typeof freeStore==='function'&&freeStore()&&RAND()<0.6) return {mode:'load',total:Math.min(canL,4)};
  const pref = site.profile==='dc' ? (e>cap*0.3?'load':'unload') : (e<=cap/2 ? 'unload':'load');
  if(pref==='unload'&&canU>=2) return {mode:'unload',total:canU};
  if(pref==='load'&&canL>=2) return {mode:'load',total:canL};
  return canU>=canL?{mode:'unload',total:canU}:{mode:'load',total:canL}; }
const xdHalf=site=>Math.ceil(site.bays.length/2);
function freeBayFor(site,mode){ if(site.profile!=='crossdock') return site.bays.find(b=>!b.truck); const h=xdHalf(site); return site.bays.find(b=>!b.truck&&(mode==='unload'?b.i<h:b.i>=h)); }
function dispatch(site,t,bay,m0){
  const m=m0||planMode(site); t.mode=m.mode;
  t.bay=bay; bay.truck=t; t.total=m.total; t.done=0; t.pending=0; t.assigned=null;
  const sh=newShipment(site,t,t.mode); sh.total=t.total; sh.status=t.mode==='load'?'scheduled':'in_transit'; t.shipmentId=sh.id; t.dest=null;
  if(t.mode==='load'&&RAND()<0.85){ const st=freeStore(); if(st){ t.dest=st.id; st.bays[0].truckId=t.id; sh.destination=st.name; sh.customer=st.name; sh.storeId=st.id; } }
  t.driver=pick(DRIVERS); t.plate=plate(RAND);
  fillCargo(site,t,t.mode==='unload'?t.total:0);
  t.state='inbound'; t.pos.set(HWY.xEnd-site.ox,0,HWY.zW-site.oz); t.heading=-Math.PI/2; t.v=9; t.solid=true; t.doorsT=0; t.wantDoors=0; t.stuck=0; t.presence=0;
  setPath(t,inboundPath(site),false,11,4);
}
/* halaman gudang: truk berhenti & membuka pintu di dalam area gudang, bukan di jalan raya */
const RY=6;
const yardZ=s=>s.zDock+RY+0.4;
function yardTail(s,bay,x0){ const zA=yardZ(s), pts=linePts(x0,s.Zr,x0+2,s.Zr,1);
  for(let i=1;i<=14;i++){ const u=i/14, k=u*u*(3-2*u); pts.push({x:x0+2+u*14,z:s.Zr+(zA-s.Zr)*k}); }
  return pts.concat(linePts(x0+16,zA,bay.x+RY,zA,2).slice(1)); }
function reversePath(site,bay){ const zA=yardZ(site), pts=arcPts(bay.x+RY,zA-RY,RY,Math.PI/2,Math.PI,30).concat(linePts(bay.x,zA-RY,bay.x,site.zDock,0.5).slice(1)); return finalize(pts); }
function inboundPath(site){ const zW=HWY.zW-site.oz, x0=HWY.xEnd-site.ox, xt=HWY.xToll+7-site.ox; return finalize(linePts(x0,zW,xt,zW,3)); }
function approachPath(site,bay){ const R=HWY.rTurn, b=site.xL+2.2, zW=HWY.zW-site.oz, xt=HWY.xToll+7-site.ox;
  return finalize(linePts(xt,zW,b+R,zW,3).concat(arcPts(b+R,zW+R,R,-Math.PI/2,-Math.PI,16).slice(1)).concat(linePts(b,zW+R,b,site.Zr-5,2).slice(1))
    .concat(arcPts(site.xL+7.2,site.Zr-5,5,Math.PI,Math.PI/2,20).slice(1)).concat(yardTail(site,bay,site.xL+7.2).slice(1))); }
function departPath(site,bay,fromZ){ const R=HWY.rTurn, a=site.xR-2.2, zE=HWY.zE-site.oz, xt=HWY.xToll-7-site.ox;
  const pts=linePts(bay.x,fromZ,bay.x,site.Zr-RT,0.5).concat(arcPts(bay.x+RT,site.Zr-RT,RT,Math.PI,Math.PI/2,30).slice(1))
  .concat(linePts(bay.x+RT,site.Zr,site.xR-7.2,site.Zr,2).slice(1)).concat(arcPts(site.xR-7.2,site.Zr-5,5,Math.PI/2,0,20).slice(1))
  .concat(linePts(a,site.Zr-5,a,zE+R,2).slice(1)).concat(arcPts(a+R,zE+R,R,Math.PI,Math.PI*1.5,16).slice(1)).concat(linePts(a+R,zE,xt,zE,3).slice(1)); return finalize(pts); }
function highwayOutPath(site){ const zE=HWY.zE-site.oz; return finalize(linePts(HWY.xToll-7-site.ox,zE,HWY.xEnd-site.ox,zE,3)); }
const TRUCK_SPAWN={x:HWY.xEnd,z:HWY.zW};
function goAway(site,t,wait){ if(t.crew){ const L=site.lounge, sp=L&&t.crew.spot!=null?L.spots[t.crew.spot]:null; if(sp&&sp.who===t.id) sp.who=null; crewIn(t); } release(site,t); jReleaseAll(t); if(t.dest){ const st=Store.get('stores',t.dest); if(st&&st.bays[0].truckId===t.id) st.bays[0].truckId=null; t.dest=null; } if(t.mode==='unload') clearCargo(t); else clearCargo(t);
  if(t.shipment) t.shipment.status=t.mode==='load'?'delivered':'completed';
  t.state='away'; t.solid=false; t.dockId=null; t.wait=wait; t.pos.set(-500,0,-500); t.path=null; t.v=0; t.presence=0; }
/* ---------- sopir: naik-turun kabin, buka/tutup pintu, istirahat di Pos Sopir, kembali ke truk ---------- */
const TRUCK_CIRC_DRV=[...TRUCK_CIRC,{z:-4.3,r:0.6}];
const CREW_SPEED=1.45, CAB_DOOR={x:-1.6,z:1.95}, CAB_STEP={x:-1.22,z:2.5}, STEP_Y=0.55;
const tLocal=(t,lx,lz)=>{ const c=Math.cos(t.heading), sn=Math.sin(t.heading); return {x:t.pos.x+lx*c+lz*sn,z:t.pos.z-lx*sn+lz*c}; };
function crewOf(t){ if(!t.crew) hidden(t,'crew',{on:false,inCab:true,x:0,z:0,h:0,v:0,pose:null,task:null,phase:null,route:null,spot:null,timer:0,doorOK:false,act:null}); return t.crew; }
function crewOut(t){ const d=crewOf(t), p=tLocal(t,CAB_STEP.x,CAB_STEP.z); Object.assign(d,{on:false,inCab:false,x:p.x,z:p.z,y:STEP_Y,h:t.heading-Math.PI/2,v:0,pose:null,route:null,timer:0,ex:'open',en:null}); t.cabWant=1; return d; }
/* turun dari kabin: pintu terbuka → muncul di tangga kabin → melangkah turun → pintu ditutup */
function crewExit(t,d,dt){
  if(d.ex==='open'){ if((t.cabDoor||0)>0.95){ d.ex='climb'; d.timer=0.55; d.on=true; } return false; }
  if(d.ex==='climb'){ d.timer-=dt; const k=clamp(1-d.timer/0.55,0,1), a=tLocal(t,CAB_STEP.x,CAB_STEP.z), b=tLocal(t,CAB_DOOR.x,CAB_DOOR.z);
    d.x=lerp(a.x,b.x,k); d.z=lerp(a.z,b.z,k); d.y=STEP_Y*(1-k)*(1-k); d.h=t.heading-Math.PI/2; d.v=0.9;
    if(d.timer<=0){ d.y=0; d.v=0; t.cabWant=0; d.ex=null; return true; } return false; }
  return true; }
/* naik ke kabin: pintu dibuka → melangkah naik ke tangga → masuk (hilang) → pintu ditutup */
function crewEnter(t,d,dt){
  if(!d.en){ d.en='open'; t.cabWant=1; d.h=t.heading+Math.PI/2; d.v=0; d.pose=null; }
  if(d.en==='open'){ d.h+=angDiff(d.h,t.heading+Math.PI/2)*Math.min(1,dt*8); if((t.cabDoor||0)>0.95){ d.en='climb'; d.timer=0.55; } return false; }
  if(d.en==='climb'){ d.timer-=dt; const k=clamp(1-d.timer/0.55,0,1), a=tLocal(t,CAB_DOOR.x,CAB_DOOR.z), b=tLocal(t,CAB_STEP.x,CAB_STEP.z);
    d.x=lerp(a.x,b.x,k); d.z=lerp(a.z,b.z,k); d.y=STEP_Y*Math.sqrt(k); d.h=t.heading+Math.PI/2; d.v=0.9;
    if(d.timer<=0){ d.en='shut'; t.cabWant=0; d.on=false; d.v=0; } return false; }
  if(d.en==='shut'){ if((t.cabDoor||0)<0.05){ d.en=null; crewIn(t); return true; } return false; }
  return false; }
function crewIn(t){ const d=crewOf(t); d.on=false; d.inCab=true; d.y=0; d.en=null; d.ex=null; t.cabWant=0; d.task=null; d.phase=null; d.pose=null; d.act=null; d.route=null; t.circ=TRUCK_CIRC; }
/* zona bahaya: kolom bay tempat truk lain sedang mundur/maju/berangkat */
function crewZones(site,t,x,z){ let ids=null; const add=o=>(ids||(ids=[])).push(o);
  for(const o of site.trucks){ if(o===t||!o.solid) continue; const st=o.state;
    const bay=o.bay&&o.bay.siteId===site.id?o.bay:o.lastBay, bx=bay?bay.x:o.pos.x;
    if(st==='reverse'){ if(x>bx-1.8&&x<bx+1.8&&z>site.zE&&z<o.pos.z+3.8) add(o); continue; }
    if(st==='pull'||st==='close'){ if(x>bx-1.8&&x<bx+1.8&&z>site.zE&&z<site.zDock+8.2) add(o); continue; }
    if((st==='depart'||st==='to_store')&&o.pos.z<site.Zr-1){
      const sn=Math.sin(o.heading), cs=Math.cos(o.heading), lx=(x-o.pos.x)*cs-(z-o.pos.z)*sn, lz=(x-o.pos.x)*sn+(z-o.pos.z)*cs;
      if(Math.abs(lx)<1.8&&lz>-3.8&&lz<7) add(o); } }
  return ids; }
const bodyHit=(o,x,z)=>(o.cw||[]).some(c=>Math.hypot(c.x-x,c.z-z)<c.r+0.55);
const bodyGap=(o,x,z)=>{ let m=Infinity; for(const c of (o.cw||[])) m=Math.min(m,Math.hypot(c.x-x,c.z-z)-c.r); return m; };
/* truk benar-benar diam (tidak akan bergerak selama ada orang di jalurnya) */
const truckStill=o=>o.v<0.05&&(o.stuck||0)>1.0;
function crewDanger(site,t,x0,z0,x1,z1,patient){
  for(const o of site.trucks){ if(o===t||!o.solid||o.state==='parked') continue; const d1=bodyGap(o,x1,z1);
    const clear=o.v>0.05?0.95:(patient&&truckStill(o)?0.25:0.6); if(d1>=clear) continue; if(d1<bodyGap(o,x0,z0)-1e-4) return true; }
  const nxt=crewZones(site,t,x1,z1); if(!nxt) return false; const cur=crewZones(site,t,x0,z0)||[];
  return nxt.some(o=>!cur.includes(o)&&!(patient&&truckStill(o))); }
/* badan truk menghalangi langsung → buat jalan memutar lewat ujung depan/belakang truk */
function crewDetour(site,t,d,gx,gz){
  let best=null, bg=0.45;
  for(const o of site.trucks){ if(o===t||!o.solid||o.state==='parked'||o.v>0.05) continue;
    /* sampel rapat (tiap 0,5 m, sampai 8 m ke depan): pada ruas panjang, truk di depan sopir tetap terdeteksi */
    const SL=Math.hypot(gx-d.x,gz-d.z)||1, n=Math.max(1,Math.ceil(Math.min(SL,8)/0.5));
    for(let k=1;k<=n;k++){ const u=Math.min(1,k*0.5/SL), px=d.x+(gx-d.x)*u, pz=d.z+(gz-d.z)*u, g=bodyGap(o,px,pz); if(g<bg){ bg=g; best=o; } } }
  if(!best) return null;
  const o=best, fx=Math.sin(o.heading), fz=Math.cos(o.heading), rx=Math.cos(o.heading), rz=-Math.sin(o.heading);
  const loc=(x,z)=>({lx:(x-o.pos.x)*rx+(z-o.pos.z)*rz, lz:(x-o.pos.x)*fx+(z-o.pos.z)*fz}), W=loc(d.x,d.z), G=loc(gx,gz);
  const sW=W.lx>=0?1:-1, sG=G.lx>=0?1:-1, SIDE=2.0, END=4.7;
  const toW=(lx,lz)=>({x:o.pos.x+rx*lx+fx*lz, z:o.pos.z+rz*lx+fz*lz});
  const plan=e=>sW===sG?[toW(sW*SIDE,e)]:[toW(sW*SIDE,e),toW(sG*SIDE,e)];
  const len=pts=>{ let L=0, px=d.x, pz=d.z; for(const p of pts){ L+=Math.hypot(p.x-px,p.z-pz); px=p.x; pz=p.z; } return L+Math.hypot(gx-px,gz-pz); };
  /* titik memutar tidak boleh masuk platform dock atau badan jalan */
  const okPt=p=>!(p.z<site.zE+0.4&&p.x>site.xs0-0.5&&p.x<site.xs1+0.5)&&!(site.Zr!=null&&p.z>site.Zr-2.4);
  const opts=[plan(END),plan(-END)].filter(pts=>pts.every(okPt));
  if(!opts.length) return null;
  return opts.sort((a,b)=>len(a)-len(b))[0]; }
function crewWalk(site,t,d,dt){
  if(!d.route||!d.route.length){ d.v=0; return true; }
  const g=d.route[0], dx=g.x-d.x, dz=g.z-d.z, L=Math.hypot(dx,dz);
  if(L<0.05){ d.route.shift(); if(!d.route.length){ d.v=0; return true; } return false; }
  const step=Math.min(L,CREW_SPEED*dt), nx=d.x+dx/L*step, nz=d.z+dz/L*step;
  if(d.detourCd>0) d.detourCd-=dt;
  if(d.safe&&crewDanger(site,t,d.x,d.z,nx,nz,(d.blockT||0)>1.5)){ d.v=0; d.blockT=(d.blockT||0)+dt;
    if(d.blockT>2.5&&!(d.detourCd>0)){ const pts=crewDetour(site,t,d,g.x,g.z); d.detourCd=5; if(pts){ d.route.unshift(...pts); d.blockT=1.6; return false; } }
    /* tertahan dekat badan truk → menyingkir menjauh sampai jarak aman */
    { let near=null, gap=0.95; for(const o of site.trucks){ if(o===t||!o.solid||o.state==='parked') continue; const gg=bodyGap(o,d.x,d.z); if(gg<gap&&(o.v>0.05||d.blockT>0.8)){ gap=gg; near=o; } }
      if(near){ let cx=0,cz=0,best=Infinity; for(const c of near.cw){ const q=Math.hypot(c.x-d.x,c.z-d.z)-c.r; if(q<best){ best=q; cx=c.x; cz=c.z; } }
        let ax=d.x-cx, az=d.z-cz; const al=Math.hypot(ax,az)||1; ax/=al; az/=al; const st=Math.min(CREW_SPEED*0.8*dt,0.95-gap+0.02), rx=d.x+ax*st, rz=d.z+az*st;
        if(!site.trucks.some(o=>o!==t&&o!==near&&o.solid&&bodyGap(o,rx,rz)<0.5)){ d.x=rx; d.z=rz; d.v=CREW_SPEED*0.8; d.h+=angDiff(d.h,Math.atan2(ax,az))*Math.min(1,dt*8); } }
      else d.h+=angDiff(d.h,Math.atan2(dx,dz))*Math.min(1,dt*6); }
    return false; }
  d.blockT=Math.max(0,(d.blockT||0)-dt*0.6); /* menyusut perlahan: bolak-balik tetap terhitung tertahan */
  d.x=nx; d.z=nz; d.v=CREW_SPEED; d.h+=angDiff(d.h,Math.atan2(dx,dz))*Math.min(1,dt*10); return false; }
/* buka/tutup pintu belakang */
function driverStep(t,dt,goal){
  const d=crewOf(t);
  if(d.task!=='door'){ if(!d.inCab) return false; crewOut(t); d.task='door'; d.phase='out'; d.safe=false; t.circ=TRUCK_CIRC_DRV; }
  switch(d.phase){
    case 'out': if(crewExit(t,d,dt)){ d.phase='toRear'; d.route=[tLocal(t,-1.62,1.7),tLocal(t,-1.62,-3.95),tLocal(t,0,-4.35)]; } break;
    case 'toRear': if(crewWalk(t.site,t,d,dt)){ d.phase='door'; d.timer=0.35; d.h=t.heading; } break;
    case 'door': d.pose='push'; d.doorOK=true; t.wantDoors=goal;
      if((goal&&t.doorsT>0.995)||(!goal&&t.doorsT<0.005)){ d.timer-=dt; if(d.timer<=0){ d.pose=null; d.doorOK=false; d.phase='toCab'; d.route=[tLocal(t,-1.62,-3.95),tLocal(t,-1.62,1.7),tLocal(t,CAB_DOOR.x,CAB_DOOR.z)]; } } break;
    case 'toCab': if(crewWalk(t.site,t,d,dt)){ d.phase='in'; } break;
    case 'in': if(crewEnter(t,d,dt)) return true; break;
  }
  return false;
}
/* istirahat di Pos Sopir selama truk dibongkar/dimuat */
const ACT_LABEL={bench:'Istirahat di Pos Sopir',stool:'Ngobrol di Pos Sopir',counter:'Ngopi di warung Pos Sopir',stand:'Ngobrol dengan sopir lain'};
function crewStartRest(site,t){
  const L=site.lounge; if(!L) return false; const free=L.spots.map((sp,i)=>i).filter(i=>!L.spots[i].who); if(!free.length) return false;
  const pairWanted=free.filter(i=>{ const sp=L.spots[i]; return sp.pair!=null&&L.spots[sp.pair].who; });
  const pickI=pairWanted.length&&RAND()<0.75?pick(pairWanted):pick(free), sp=L.spots[pickI]; sp.who=t.id;
  const d=crewOut(t); d.task='rest'; d.phase='out'; d.spot=pickI; d.safe=true; t.circ=TRUCK_CIRC;
  const front=tLocal(t,-1.62,3.95);
  d.route=[front,{x:front.x,z:site.walkZ},{x:site.walkX,z:site.walkZ},L.entry,{x:sp.x,z:sp.z}];
  return true; }
function crewStartReturn(site,t){ const d=crewOf(t), L=site.lounge, sp=L.spots[d.spot]; if(sp&&sp.who===t.id) sp.who=null;
  const front=tLocal(t,-1.62,3.95); d.phase='toTruck'; d.pose=null; d.act=null;
  d.route=[L.entry,{x:site.walkX,z:site.walkZ},{x:front.x,z:site.walkZ},front,tLocal(t,CAB_DOOR.x,CAB_DOOR.z)]; }
function crewStartWait(t){ const d=crewOut(t); d.task='wait'; d.phase='out'; d.safe=false; d.route=[tLocal(t,-2.4,2.9)]; }
function crewTick(site,t,dt){
  const d=t.crew; if(!d||(!d.on&&d.en!=='shut'&&d.ex!=='open')||d.task==='door') return;
  if(d.task==='rest'){ const L=site.lounge;
    switch(d.phase){
      case 'out': if(crewExit(t,d,dt)) d.phase='toLounge'; break;
      case 'toLounge': if(crewWalk(site,t,d,dt)){ d.phase='lounge'; const sp=L.spots[d.spot]; d.h=sp.face; d.act=sp.kind; } break;
      case 'lounge': { const sp=L.spots[d.spot]; d.x=sp.x; d.z=sp.z; d.h=sp.face; const mate=sp.pair!=null&&L.spots[sp.pair].who&&site.trucks.some(o=>o.id===L.spots[sp.pair].who&&o.crew&&o.crew.phase==='lounge');
        d.pose=sp.kind==='bench'?'sit':sp.kind==='stool'?(mate?'sitchat':'sit'):sp.kind==='counter'?'drink':(mate?'chat':'phone'); d.act=sp.kind==='stand'&&!mate?'phone':sp.kind; break; }
      case 'toTruck': if(crewWalk(site,t,d,dt)){ d.phase='in'; } break;
      case 'in': crewEnter(t,d,dt); break; }
  } else if(d.task==='wait'){
    switch(d.phase){
      case 'out': if(crewExit(t,d,dt)) d.phase='toSpot'; break;
      case 'toSpot': if(crewWalk(site,t,d,dt)){ d.phase='waiting'; d.h=t.heading+Math.PI; d.pose='phone'; d.act='wait'; } break;
      case 'back': if(crewWalk(site,t,d,dt)){ d.phase='in'; } break;
      case 'in': crewEnter(t,d,dt); break; }
  }
}
function crewDockLife(site,t){ /* dipanggil selama truk docked di gudang */
  const d=crewOf(t), left=t.total-t.done;
  if(t.restPlan&&d.inCab&&left>=2&&t.done/Math.max(1,t.total)<0.6){ if(crewStartRest(site,t)) t.restPlan=false; }
  if(d.task==='rest'&&d.phase==='lounge'&&(left<=1||t.done/Math.max(1,t.total)>=0.8)) crewStartReturn(site,t);
  if(d.task==='rest'&&(d.phase==='toLounge'||d.phase==='out')&&left<=0){ const L=site.lounge, sp=L.spots[d.spot]; if(sp&&sp.who===t.id) sp.who=null; d.phase='toTruck'; d.route=[tLocal(t,-1.62,3.95),tLocal(t,CAB_DOOR.x,CAB_DOOR.z)]; }
  return d.inCab;
}
function crewStoreLife(t){ const d=crewOf(t), fin=t.done>=t.total&&t.pending===0&&!t.assigned;
  if(t.waitPlan&&d.inCab){ crewStartWait(t); t.waitPlan=false; }
  if(d.task==='wait'&&d.phase==='waiting'&&((t.storePhase==='load'&&t.done>=t.total-1)||(fin&&t.wait>0.5))){ d.phase='back'; d.pose=null; d.route=[tLocal(t,CAB_DOOR.x,CAB_DOOR.z)]; }
  return d.inCab; }
function truckStep(site,t,dt){
  const others=site.trucks;
  crewTick(site,t,dt);
  t.cabDoor=clamp((t.cabDoor||0)+((t.cabWant?1:-1))*dt*2.6,0,1);
  if(!t.crew||!t.crew.on||t.crew.task!=='door'||t.crew.doorOK) t.doorsT=clamp(t.doorsT+(t.wantDoors?1:-1)*dt*0.55,0,1);
  switch(t.state){
    case 'away':
      t.wait-=dt*WX.arrive;
      if(t.wait<=0){ const pm=planMode(site), bay=pm?freeBayFor(site,pm.mode):null;
        let clear=true; for(const o of Store.tables.trucks.values()){ if(o!==t&&o.solid&&Math.hypot(o.pos.x+o.site.ox-TRUCK_SPAWN.x,o.pos.z+o.site.oz-TRUCK_SPAWN.z)<22){ clear=false; break; } }
        if(bay&&clear&&pm) dispatch(site,t,bay,pm); else t.wait=1.5; }
      return;
    case 'inbound': {
      const block=Math.min(lookAheadTruck(t,site),truckJunctionBlock(site,t)); t.presence=clamp(t.s/40,0,1);
      if(moveStep(t,dt,block)){ t.state='toll_in'; t.wait=1.6; }
      break; }
    case 'toll_in':
      t.wait-=dt; if(t.wait<=0){ t.state='approach'; t.presence=1; setPath(t,approachPath(site,t.bay),false,9,3); }
      break;
    case 'approach': {
      const r=regionOf(site,t.bay), fx=t.pos.x+3.4, onFront=Math.abs(t.pos.z-yardZ(site))<1.6&&Math.sin(t.heading)>0.7;
      let block=Math.min(lookAheadTruck(t,site),resBlock(site,t),truckJunctionBlock(site,t));
      if(!t.res&&onFront){ if(fx>r.x0-26 && canAcquire(site,t,r,true)) acquire(site,t,r); else block=Math.min(block,r.x0-fx-0.6); }
      t.presence=1;
      if(moveStep(t,dt,block)){ t.state='prep'; t.wait=0.6; t.wantDoors=0; }
      break; }
    case 'prep':
      t.wait-=dt; if(t.wait<=0&&driverStep(t,dt,1)){ t.state='reverse'; setPath(t,reversePath(site,t.bay),true,2.1,1.6); }
      break;
    case 'reverse':
      if(moveStep(t,dt,lookAheadTruck(t,site))){ t.state='docked'; t.wait=0; release(site,t); t.bay.today++; site.arrivals++; if(site.profile==='cold'){ hidden(t,'coldCheck',5.5+RAND()*2); logEvent(site,`${t.id} · cek suhu muatan di ${t.bay.label}`,'#0EA5E9',t); } hidden(t,'restPlan',RAND()<0.85);
        if(t.shipment) t.shipment.status=t.mode==='load'?'loading':'unloading';
        logEvent(site,`${t.id} tiba di ${t.bay.label} · ${t.mode==='load'?'muat':'bongkar'} ${t.total} palet`,'#2E5BFF',t); }
      break;
    case 'docked':
      if(t.coldCheck>0&&t.doorsT>0.99){ t.coldCheck-=dt; if(t.coldCheck<=0){ t.coldCheck=0; t.coldTemp=(-19.2+RAND()*1.4); } } {
      const inCab=crewDockLife(site,t);
      if(t.mode==='load'&&t.done+t.pending<t.total&&!t.assigned&&!site.slots.some(x=>x.occupied&&!x.reserved)){ t.starve=(t.starve||0)+dt;
        if(t.starve>25){ t.total=t.done+t.pending; t.starve=0; if(t.shipment) t.shipment.total=t.total; logEvent(site,`${t.id} berangkat dengan muatan parsial (${t.total} palet) · stok habis`,'#C2410C',t); } } else t.starve=0;
      if(t.done>=t.total&&t.pending===0&&!t.assigned&&inCab){ t.wait+=dt;
        if(t.wait>2 && canAcquire(site,t,regionOf(site,t.bay),false)){ acquire(site,t,regionOf(site,t.bay)); t.state='pull'; setPath(t,finalize(linePts(t.bay.x,site.zDock,t.bay.x,site.zDock+4,0.5)),false,1.6,1.6); } }
      else t.wait=0;
      break; }
    case 'pull':
      if(moveStep(t,dt,lookAheadTruck(t,site))){ t.state='close'; }
      break;
    case 'close':
      if(driverStep(t,dt,0)){ const bay=t.bay; bay.truck=null; if(t.mode==='load') site.outToday++; else applyRestock(site);
        if(t.shipment) t.shipment.status=t.mode==='load'?'in_transit':'completed';
        hidden(t,'lastBay',bay);
        const st=t.dest?Store.get('stores',t.dest):null, P=st?storeTripPath(site,t,st):null;
        if(P){ t.state='to_store'; setPath(t,P,false,8,3); logEvent(site,`${t.id} berangkat dari ${bay.label} ke ${st.name}`,'#178A55',t); }
        else { if(st){ st.bays[0].truckId=null; t.dest=null; } t.state='depart'; logEvent(site,`${t.id} berangkat dari ${bay.label} ${t.mode==='load'?'ke '+t.place:'(kosong)'}`,'#178A55',t); setPath(t,departPath(site,bay,site.zDock+4),false,7.5,2.6); } }
      break;
    case 'to_store': {
      if(t.pendingDest) applyRedirect(site,t);
      const block=Math.min(lookAheadTruck(t,site),truckJunctionBlock(site,t)); t.presence=1;
      if(t.res && (t.pos.z<site.zDock-6 || (t.pos.z>site.Zr-0.5 && t.pos.x-3.6>t.res.x1))) release(site,t);
      if(moveStep(t,dt,block)){ t.state='store_prep'; t.wait=0.6; t.wantDoors=0; }
      break; }
    case 'store_prep':
      t.wait-=dt; if(t.wait<=0&&driverStep(t,dt,1)){ const st=Store.get('stores',t.dest); t.state='store_reverse'; setPath(t,storeReversePath(site,st),true,2.1,1.6); }
      break;
    case 'store_reverse':
      if(moveStep(t,dt,lookAheadTruck(t,site))){ const st=Store.get('stores',t.dest); t.state='store_docked'; t.dockId=st.bays[0].id; st.bays[0].truckId=t.id; st.trucks.push(t);
        t.mode='unload'; t.total=t.cargo.filter(Boolean).length; t.done=0; t.pending=0; t.wait=0; hidden(t,'storePhase','unload'); hidden(t,'waitPlan',true); st.bays[0].today++;
        if(t.shipment) t.shipment.status='unloading'; logEvent(site,`${t.id} tiba di ${st.name} · bongkar ${t.total} palet`,'#7C3AED',t); }
      break;
    case 'store_docked': {
      const st=Store.get('stores',t.dest), inCab=crewStoreLife(t);
      if(t.storePhase==='load'&&!t.homeBay){ const hb=freeBayFor(site,'unload'); if(hb){ hb.truckId=t.id; hidden(t,'homeBay',hb); } }
      if(t.done>=t.total&&t.pending===0&&!t.assigned){
        if(t.storePhase==='unload'){ st.receivedToday+=t.total; if(t.shipment) t.shipment.status='delivered';
          const ret=st.slots.filter(s=>s.data&&s.data.retur&&!s.reserved).length;
          if(ret>0){ t.storePhase='load'; t.mode='load'; t.total=Math.min(2,ret); t.done=0; logEvent(site,`${st.name} memuat ${t.total} palet retur ke ${t.id}`,'#7C3AED',t); break; } }
        t.wait+=dt; if(t.wait>1.5&&inCab){ t.state='store_pull'; setPath(t,storePullPath(site,st),false,1.6,1.6); } }
      else t.wait=0;
      break; }
    case 'store_pull':
      if(moveStep(t,dt,lookAheadTruck(t,site))){ t.state='store_close'; t.wait=0; hidden(t,'closed',false); }
      break;
    case 'store_close':
      if(t.closed||(t.closed=driverStep(t,dt,0))){ const st=Store.get('stores',t.dest), ret=t.cargo.filter(Boolean).length;
        if(ret&&!t.homeBay){ const hb=freeBayFor(site,'unload'); if(hb){ hb.truckId=t.id; hidden(t,'homeBay',hb); } }
        if(ret&&!t.homeBay&&(t.wait=(t.wait||0)+dt)<60) break;
        st.bays[0].truckId=null; st.trucks.splice(st.trucks.indexOf(t),1);
        const bay=t.homeBay||null, P=bay?storeToHomePath(site,t,st,bay):null; hidden(t,'homeBay',null);
        if(P){ t.dockId=bay.id; bay.truck=t; t.mode='unload'; t.total=ret; t.done=0; t.pending=0; st.returnsToday+=ret;
          const sh=newShipment(site,t,'unload'); sh.origin=st.name; sh.customer=st.name; sh.total=ret; sh.status='in_transit'; t.shipmentId=sh.id;
          t.state='approach'; t.dest=null; setPath(t,P,false,8,3); logEvent(site,`${t.id} kembali ke ${site.name} membawa ${ret} palet retur`,'#2E5BFF',t); }
        else { if(bay&&bay.truckId===t.id) bay.truckId=null; const Q=storeToTollPath(site,t,st); t.dockId=null; t.dest=null; t.state='leave'; setPath(t,Q,false,8,3); } }
      break;
    case 'leave': {
      const block=Math.min(lookAheadTruck(t,site),truckJunctionBlock(site,t)); t.presence=1;
      if(moveStep(t,dt,block)){ t.state='toll_out'; t.wait=1.6; }
      break; }
    case 'depart': {
      const block=Math.min(lookAheadTruck(t,site),resBlock(site,t),truckJunctionBlock(site,t));
      if(t.res && t.pos.z>site.Zr-0.5 && t.pos.x-3.6>t.res.x1) release(site,t);
      t.presence=1;
      if(moveStep(t,dt,block)){ release(site,t); t.state='toll_out'; t.wait=1.6; }
      break; }
    case 'toll_out':
      t.wait-=dt; if(t.wait<=0){ t.state='highway'; setPath(t,highwayOutPath(site),false,11,4); }
      break;
    case 'highway': {
      const block=Math.min(lookAheadTruck(t,site),truckJunctionBlock(site,t));
      t.presence=t.path?clamp((t.path.len-t.s)/60,0,1):0;
      if(moveStep(t,dt,block)) goAway(site,t,3+RAND()*6);
      break; }
  }
  t.stuck = (t.path && t.v<0.02) ? t.stuck+dt : 0;
  if(t.stuck>300 && ['inbound','approach','depart','highway','to_store','leave'].includes(t.state)){ if(t.bay&&t.bay.truck===t) t.bay.truck=null; goAway(site,t,5); }
}

/* ---------- forklifts ---------- */
function spanFree(site,f,a){ const ok=new Set();
  for(const sp of site.spans){ if(sp.owner===f||!(sp.x0<a.x1&&a.x0<sp.x1)) continue;
    const o=sp.owner, follows = sp.dir===a.dir && (a.dir>0 ? a.xs < Math.min(o.pos.x, sp.xs-1.3)-4.4 : a.xs > Math.max(o.pos.x, sp.xs+1.3)+4.4);
    if(!follows) return false; ok.add(o); }
  for(const o of site.forks){ if(o===f||ok.has(o)) continue; if(Math.abs(o.pos.z-site.zc)<1.25 && o.pos.x+1.2>a.x0 && o.pos.x-1.2<a.x1) return false; } return true; }
function travel(f,dest,onExit){ f.q.push({t:'travel',dest,onExit}); }
function buildTravel(f,dest,onExit){
  const site=f.site, zc=site.zc, cur={x:f.pos.x,z:f.pos.z}, acts=[];
  const dir=Math.sign(dest.x-cur.x)||1, ex=cur.x-dir*1.3;
  const x0=Math.min(ex,dest.x,cur.x)-1.7, x1=Math.max(ex,dest.x,cur.x)+1.7;
  const back=polyPath([cur,{x:cur.x,z:zc},{x:ex,z:zc}],1.05);
  const fwd=polyPath([{x:ex,z:zc},{x:dest.x,z:zc},{x:dest.x,z:dest.z}],1.0);
  acts.push({t:'span',x0,x1,dir,xs:cur.x},{t:'path',P:back,rev:true,v:1.35});
  if(onExit) acts.push({t:'do',fn:onExit});
  acts.push({t:'path',P:fwd,rev:false,v:2.8},{t:'unspan'},{t:'do',fn:()=>{f.spot=dest;}});
  return acts;
}
const trailerSpot=(site,t,k)=>{const row=Math.floor(k/2),col=k%2; return {x:t.bay.x+(col?0.44:-0.44), z:site.zDock+1.19-row*1.1-1.18, face:0};};
function findJob(site,f){
  const want=site.kind==='store'?'store_docked':'docked';
  const cands=site.trucks.filter(t=>t.state===want&&t.doorsT>0.99&&!(t.coldCheck>0)&&(!t.assigned||t.assigned.f===f)&&t.done+t.pending<t.total)
    .sort((a,b)=>(a.done+a.pending)/a.total-(b.done+b.pending)/b.total);
  for(const t of cands){
    const free=s=>!s.reserved&&!site.forks.some(o=>o!==f&&(o.spot===s.spot||Math.hypot(o.pos.x-s.spot.x,o.pos.z-s.spot.z)<1.6));
    const slot=t.mode==='load'?site.slots.find(s=>s.occupied&&free(s)&&(site.kind!=='store'||(s.data&&s.data.retur))):site.slots.find(s=>!s.occupied&&free(s));
    if(slot) return {t,slot};
  }
  return null;
}
function decide(site,f,onExit){
  if(f.battery<25||f.forceCharge){ f.task='Menuju stasiun pengisian'; travel(f,site.rest[f.restIdx],onExit); f.q.push({t:'do',fn:()=>{f.charging=true;f.forceCharge=false;f.task='Mengisi daya';logEvent(site,`${f.short} baterai rendah, mulai mengisi daya`,'#B76E00',f);}}); return; }
  const job=findJob(site,f);
  if(job){ startJob(site,f,job,onExit); return; }
  const r=site.rest[f.restIdx];
  if(Math.hypot(f.pos.x-r.x,f.pos.z-r.z)>0.1){ f.task='Kembali ke stasiun'; travel(f,r,onExit); f.q.push({t:'do',fn:()=>{f.task='Siaga di stasiun';}}); }
  else { if(onExit) onExit(); f.task='Siaga di stasiun'; }
}
function startJob(site,f,job,onExit){
  const {t,slot}=job; const tok={f}; t.assigned=tok; t.pending++; slot.reserved=true;
  const rel=()=>{ if(t.assigned===tok) t.assigned=null; };
  if(t.mode==='load'){
    const k=t.done+t.pending-1;
    f.task=`Ambil palet ${slot.code} untuk ${t.id}`;
    travel(f,slot.spot,onExit);
    f.q.push({t:'lift',h:0},{t:'wait',d:0.25},{t:'do',fn:()=>{ const pid=slot.palletId; slot.palletId=null; f.carryingPalletId=pid; setPalletLocation(pid,{type:'fork',id:f.id}); f.task=`Muat ${t.id} di ${t.bay.label}`; }},{t:'lift',h:0.2});
    travel(f,trailerSpot(site,t,k));
    f.q.push({t:'lift',h:0},{t:'wait',d:0.2},{t:'do',fn:()=>{ const pid=f.carryingPalletId; f.carryingPalletId=null; if(pid){ t.cargo[k]=pid; setPalletLocation(pid,{type:'truck',id:t.id,index:k}); }
        t.done++; t.pending--; slot.reserved=false; site.stockDelta-=1; f.moves++; f.battery-=1.5; decide(site,f,()=>rel()); }},{t:'lift',h:0.03});
  } else {
    const k=t.total-t.done-t.pending;
    f.task=`Bongkar ${t.id} di ${t.bay.label}`;
    travel(f,trailerSpot(site,t,k),onExit);
    f.q.push({t:'lift',h:0},{t:'wait',d:0.25},{t:'do',fn:()=>{ const pid=t.cargo[k]; t.cargo[k]=null; f.carryingPalletId=pid; if(pid) setPalletLocation(pid,{type:'fork',id:f.id});
        t.done++; t.pending--; f.task=`Simpan ke slot ${slot.code}`; }},{t:'lift',h:0.2});
    travel(f,slot.spot,rel);
    f.q.push({t:'lift',h:0},{t:'wait',d:0.2},{t:'do',fn:()=>{ const pid=f.carryingPalletId; f.carryingPalletId=null; if(pid){ slot.palletId=pid; setPalletLocation(pid,{type:'slot',id:slot.id}); }
        slot.reserved=false; site.stockDelta+=1; site.putToday++; f.moves++; f.battery-=1.5; decide(site,f,null); }},{t:'lift',h:0.03});
  }
}
function forkStep(site,f,dt){
  if(f.charging){ f.battery=Math.min(100,f.battery+dt*2.2); if(f.battery>=92){ f.charging=false; f.task='Siaga di stasiun'; } }
  let guard=0;
  while(f.q.length && guard++<12){
    const a=f.q[0];
    if(a.t==='travel'){ f.q.shift(); f.q.unshift(...buildTravel(f,a.dest,a.onExit)); continue; }
    if(a.t==='span'){ if(spanFree(site,f,a)){ f.span={owner:f,x0:a.x0,x1:a.x1,dir:a.dir,xs:a.xs}; site.spans.push(f.span); f.q.shift(); continue; } break; }
    if(a.t==='unspan'){ if(f.span){ site.spans.splice(site.spans.indexOf(f.span),1); f.span=null; } f.q.shift(); continue; }
    if(a.t==='do'){ f.q.shift(); a.fn(); continue; }
    if(a.t==='wait'){ a.e=(a.e||0)+dt; if(a.e>=a.d){ f.q.shift(); continue; } break; }
    if(a.t==='lift'){ f.liftGoal=a.h; if(Math.abs(f.lift-a.h)<0.004){ f.q.shift(); continue; } break; }
    if(a.t==='path'){ if(!a.started){ a.started=true; setPath(f,a.P,a.rev,a.v,0.9); }
      const la=lookAhead(f,site.forks);
      if(moveStep(f,dt,la)){ f.q.shift(); f.blockT=0; continue; }
      /* pemecah deadlock: tertahan forklift lain yang sedang menunggu giliran koridor → lepas koridor lebih awal */
      if(f.v<0.05&&la<1){ f.blockT=(f.blockT||0)+dt;
        if(f.blockT>4&&f.span&&f.path&&f.path.len-f.s<6){ const waiter=site.forks.some(g=>g!==f&&!g.span&&g.q[0]&&g.q[0].t==='span'&&Math.hypot(g.pos.x-f.pos.x,g.pos.z-f.pos.z)<4);
          if(waiter){ site.spans.splice(site.spans.indexOf(f.span),1); f.span=null; const i=f.q.findIndex(x=>x.t==='unspan'); if(i>0) f.q.splice(i,1); f.blockT=0; } } }
      else f.blockT=0;
      break; }
    break;
  }
  f.lift+=clamp(f.liftGoal-f.lift,-dt*0.5,dt*0.5);
  if(!f.q.length && !f.charging){ f.idleT+=dt; if(f.idleT>0.6){ f.idleT=0; decide(site,f,null); } }
  if(f.path) f.battery=Math.max(3,f.battery-dt*0.03);
}
const forkWorking=f=>!!(f.q.length||f.path);

/* ---------- people ---------- */
function offsetPoly(pts,d){ const o=[]; for(let i=0;i<pts.length;i++){ const a=pts[Math.max(0,i-1)],b=pts[i],c=pts[Math.min(pts.length-1,i+1)];
  let n1x=0,n1z=0,n2x=0,n2z=0;
  if(i>0){const l=Math.hypot(b.x-a.x,b.z-a.z);n1x=(b.z-a.z)/l;n1z=-(b.x-a.x)/l;}
  if(i<pts.length-1){const l=Math.hypot(c.x-b.x,c.z-b.z);n2x=(c.z-b.z)/l;n2z=-(c.x-b.x)/l;}
  if(i===0){n1x=n2x;n1z=n2z;} if(i===pts.length-1){n2x=n1x;n2z=n1z;}
  const dot=n1x*n2x+n1z*n2z, k=d/(1+dot); o.push({x:b.x+(n1x+n2x)*k,z:b.z+(n1z+n2z)*k}); } return o; }

function laneTarget(a,b,c,d=0.45){ const l1=Math.hypot(b.x-a.x,b.z-a.z)||1, n1x=(b.z-a.z)/l1, n1z=-(b.x-a.x)/l1;
  if(!c) return {x:b.x+n1x*d,z:b.z+n1z*d};
  const l2=Math.hypot(c.x-b.x,c.z-b.z)||1, n2x=(c.z-b.z)/l2, n2z=-(c.x-b.x)/l2, k=d/(1+n1x*n2x+n1z*n2z);
  return {x:b.x+(n1x+n2x)*k,z:b.z+(n1z+n2z)*k}; }
function faceTo(p,h){ p.act.push({t:'face',h}); }
function walkTo(p,pts){ p.act.push({t:'walk',pts}); }
function idle(p,d,pose,label){ p.act.push({t:'idle',d,pose,label}); }
const PLANS={
  supervisor(ctx,p){
    const n=ctx.bays.length; let i=Math.floor(RAND()*n); if(i===p.lastBay) i=(i+1)%n; p.lastBay=i;
    const b=ctx.bays[i], tx=b.x+(RAND()-.5)*0.8, z=ctx.fz+0.34;
    if(Math.abs(tx-p.pos.x)>0.3){ faceTo(p,tx>p.pos.x?Math.PI/2:-Math.PI/2); walkTo(p,[{x:tx,z}]); }
    faceTo(p,0);
    const t=b.truck&&b.truck.state==='docked'?b.truck:null;
    idle(p,2.5+RAND()*2.5,'clipboard',`Mencatat ${b.label}`);
    if(t&&RAND()<0.7) idle(p,1.6,'point',`Mengarahkan ${t.id}`);
    idle(p,1+RAND()*1.5,'look','Memantau dock');
  },
  patrol(ctx,p){
    const R=p.route; let nx=p.ri+p.rd; if(nx<0||nx>=R.length){ p.rd=-p.rd; nx=p.ri+p.rd; }
    const nn=nx+p.rd, c=(nn>=0&&nn<R.length)?R[nn]:null, tgt=laneTarget(R[p.ri],R[nx],c), h=Math.atan2(tgt.x-p.pos.x,tgt.z-p.pos.z);
    if(Math.abs(angDiff(p.heading,h))>0.6) faceTo(p,h);
    walkTo(p,[tgt]); p.ri=nx;
    if(RAND()<0.35) idle(p,1.5+RAND()*2,'look','Patroli');
  },
  loop(ctx,p){
    const R=p.route, nx=(p.ri+1)%R.length, c=R[(nx+1)%R.length], tgt=laneTarget(R[p.ri],R[nx],c), h=Math.atan2(tgt.x-p.pos.x,tgt.z-p.pos.z);
    if(Math.abs(angDiff(p.heading,h))>0.6) faceTo(p,h);
    walkTo(p,[tgt]); p.ri=nx; if(RAND()<0.15) idle(p,2+RAND()*2,'look','Jalan-jalan');
  },
  /* operator gudang: berkeliling area timur (rak, deretan palet, tumpukan krat), jauh dari jalur forklift & truk */
  picker(ctx,p){
    const W=ctx.W, fz=ctx.fz, X=W/2;
    const seq=[{x:X+10.4,z:fz-7.6,h:Math.PI,label:'Cek stok rak',d:3.2,pose:'clipboard'},{x:X+11.9,z:fz-7.6},{x:X+11.9,z:fz-6.25,h:-Math.PI/2,label:'Memeriksa palet masuk',d:2.6,pose:'look'},
      {x:X+11.9,z:fz-7.6},{x:X+15.2,z:fz-7.6},{x:X+15.2,z:fz-4.2,h:-Math.PI/2,label:'Menghitung krat',d:3.4,pose:'clipboard'},{x:X+15.2,z:fz-7.6}];
    /* lewati titik yang sudah ditempati (mis. sesudah serah terima shift) supaya selalu ada aksi berikutnya */
    for(let tries=0;tries<seq.length&&!p.act.length;tries++){
      const nx=(p.ri+1)%seq.length, o=seq[nx], h=Math.atan2(o.x-p.pos.x,o.z-p.pos.z);
      if(Math.hypot(o.x-p.pos.x,o.z-p.pos.z)>0.05){ if(Math.abs(angDiff(p.heading,h))>0.6) faceTo(p,h); walkTo(p,[{x:o.x,z:o.z}]); }
      p.ri=nx;
      if(o.label){ faceTo(p,o.h); idle(p,o.d+RAND()*1.5,o.pose,o.label); if(RAND()<0.3) idle(p,1.2,'point',o.label); } }
  },
  qc(ctx,p){
    const W=ctx.W, fz=ctx.fz, opts=[...ctx.holds.map(h=>({x:h.holdPos.x,z:h.holdPos.z-1.35,h:0,label:`Inspeksi ${h.id}`})),
      {x:W/2+7.0,z:fz+2.4,h:Math.PI/2,label:'Cek truk parkir'},{x:W/2+7.0,z:fz+0.6,h:Math.PI/2,label:'Cek truk parkir'}];
    let o=pick(opts); if(Math.hypot(o.x-p.pos.x,o.z-p.pos.z)<0.4) o=opts[(opts.indexOf(o)+1)%opts.length];
    const h=Math.atan2(o.x-p.pos.x,o.z-p.pos.z); faceTo(p,h); walkTo(p,[{x:o.x,z:o.z}]); faceTo(p,o.h);
    idle(p,3+RAND()*2,'clipboard',o.label); if(RAND()<0.4) idle(p,1.4,'point',o.label);
  }
};
function personStep(ctx,p,dt){
  if(!p.act.length){ PLANS[p.plan](ctx,p); if(!p.act.length) idle(p,0.5,null,'Berdiri'); } /* pengaman: rencana kosong tidak boleh menghentikan simulasi */
  const a=p.act[0];
  if(a.t==='face'){ const d=angDiff(p.heading,a.h), st=Math.sign(d)*Math.min(Math.abs(d),2.4*dt); p.heading+=st; p.v=Math.max(0,p.v-dt*3); if(Math.abs(d)<0.03){ p.heading=a.h; p.act.shift(); } }
  else if(a.t==='walk'){
    if(!a.P){ a.P=polyPath([{x:p.pos.x,z:p.pos.z},...a.pts],0.8); if(a.P.len<0.05){ p.act.shift(); return; } setPath(p,a.P,false,p.vmax,0.55); p.doing='Berjalan'; p.pose=null; }
    const h0=p.heading;
    const done=moveStep(p,dt,lookAhead(p,ctx.people.filter(q=>q!==p&&(q.v<0.05||Math.cos(q.heading-p.heading)>-0.3))));
    p.heading=lerpAngle(h0,p.heading,0.45);
    if(done) p.act.shift();
  }
  else if(a.t==='do'){ p.act.shift(); a.fn(); }
  else if(a.t==='idle'){ a.e=(a.e||0)+dt; p.pose=a.pose; p.doing=a.label||'Berdiri'; p.v=Math.max(0,p.v-dt*3); if(a.e>=a.d){ p.act.shift(); p.pose=null; } }
}

/* ---------- shift kerja: pagi 06.00–18.00, malam 18.00–06.00 ---------- */
const shiftAt=h=>(h>=6&&h<18)?'pagi':'malam';
function swapShift(p,sh){ p.shiftNow=sh; p.name=p.names[sh]; p.shift=SHIFTS[sh].label.replace('Shift ','')+' '+SHIFTS[sh].hours; Object.assign(p.look,p.uniform[sh]); p.look.skin=p.skins[sh]; p.look.ver=(p.look.ver||0)+1; }
function shiftTick(site,dt){
  const want=shiftAt(Store.clock.hour);
  if(site.shiftNow!==want){ const first=site.shiftNow==null; site.shiftNow=want;
    if(first){ for(const p of site.people) swapShift(p,want); for(const f of site.forks){ f.shiftNow=want; } return; }
    logEvent(site,`Pergantian shift · ${SHIFTS[want].label} (${SHIFTS[want].hours}) mulai bertugas`,'#7C3AED'); }
  for(const p of site.people){ if(p.shiftNow===want||p.shifting) continue; p.shifting=true;
    const gi=site.people.filter(q=>q.plan==='patrol').indexOf(p), spot={x:site.gate.x+0.2*gi,z:site.gate.z-gi*1.4};
    let via=[]; if(p.plan==='patrol'){ const R=p.route, from=p.rd>0?p.ri-1:p.ri, C=[]; for(let i=Math.min(from,R.length-1);i>=0;i--) C.push(R[i]);
      let prev={x:p.pos.x,z:p.pos.z}; for(let k=0;k<C.length;k++){ via.push(laneTarget(prev,C[k],C[k+1]||spot)); prev=C[k]; } }
    p.act=[...(p.plan==='patrol'?[{t:'walk',pts:[...via,spot]},{t:'face',h:-Math.PI/2}]:[]),{t:'idle',d:3.2,pose:'chat',label:'Serah terima shift'},
      {t:'do',fn:()=>{ swapShift(p,want); p.shifting=false; if(p.plan==='patrol'){ p.ri=0; p.rd=1; } }},{t:'idle',d:1.2,label:`Mulai ${SHIFTS[want].label.toLowerCase()}`}]; }
  for(const f of site.forks){ if(f.shiftNow===want) continue; f.shiftWait=(f.shiftWait||0)+dt;
    if(f.task.startsWith('Siaga')||f.charging||f.shiftWait>120){ f.shiftNow=want; f.shiftWait=0; } }
}
/* ---------- site tick ---------- */
function simSite(site,dt){
  if(site.bias){ site.bias.t-=dt; if(site.bias.t<=0) site.bias=null; }
  refreshCircles(site.trucks); refreshTruckWorld(site); refreshCircles(site.forks); refreshCircles(site.people);
  for(const t of site.trucks) if(t.state!=='parked') truckStep(site,t,dt);
  for(const f of site.forks) forkStep(site,f,dt);
  shiftTick(site,dt);
  for(const p of site.people) personStep(site,p,dt);
  for(const b of site.bays){ const t=b.truck; b.doorState=t&&t.state==='docked'?'open':'closed'; }
}

/* ---------- lalu lintas kota (data) ---------- */

const siteAt=(gx,gz)=>SITE_CONFIG.findIndex(s=>s.gx===gx&&s.gz===gz);
const CAR_H=[-114,-38,190], CAR_V=[-250,250];
const LANES=[];
function sigState(sig,ax,t){
  if(WX.flash) return 'F';
  if(sig.z===ZHW){ const u=((t+sig.off)%30+30)%30; /* jalan lingkar = jalan utama: hijau panjang + gelombang hijau */
    if(ax==='H') return u<17?'G':u<19.5?'A':'R'; return (u>=21&&u<28)?'G':(u>=28&&u<29.5)?'A':'R'; } /* hijau jalan masuk 7 dtk: antrean ke jalan lingkar tidak meluber ke persimpangan sebelumnya */
  const u=((t+sig.off)%28+28)%28;
  if(ax==='H') return u<9?'G':u<11.5?'A':'R';
  return (u>=14&&u<23)?'G':(u>=23&&u<25.5)?'A':'R'; }
const traffic={t:0};
/* posisi awal mobil tidak boleh di dalam persimpangan atau di atas zebra */
function clearOfJunctions(L,p){ for(const jc of L.juncs) if(p+2.1>jc.pIn-3.2&&p-2.1<jc.pOut+3.2) return jc.pOut+3.2+2.2; return p; }
function initTraffic(){
  const R=rng(99); initJunctions();
  for(let kx=GRID.x0;kx<=GRID.x1+1;kx++){ const x=(kx-0.5)*PX;
    for(const z of [ZHW,...Array.from({length:GRID.z1-GRID.z0+2},(_,i)=>(GRID.z0+i-0.5)*PZ)]) Store.add('signals',{kind:'signal',id:'SIG-'+x+'_'+z,x,z,off:z===ZHW?(30-((250-x)/10)%30)%30:R()*28,stateH:'G',stateV:'R'}); }
  for(const sg of Store.tables.signals.values()) for(const j of JUNC.values()) if(Math.abs(j.x-sg.x)<1&&Math.abs(j.z-sg.z)<1) j.sig=sg;
  const sigs=Store.all('signals');
  const X0=-640, X1=640, Z0=-640, Z1=640;
  for(const z of CAR_H){ LANES.push({ax:'x',st:z,c:z-2.2,dir:1,a:X0,b:X1}); LANES.push({ax:'x',st:z,c:z+2.2,dir:-1,a:X1,b:X0}); }
  for(const x of CAR_V){ LANES.push({ax:'z',st:x,c:x+2.2,dir:1,a:Z0,b:Z1}); LANES.push({ax:'z',st:x,c:x-2.2,dir:-1,a:Z1,b:Z0}); }
  LANES.forEach((L,li)=>{ L.len=Math.abs(L.b-L.a);
    L.juncs=[...JUNC.values()].filter(j=>L.ax==='x'?j.z===L.st:j.x===L.st).map(j=>{ const p=((L.ax==='x'?j.x:j.z)-L.a)*L.dir; return {j,pIn:p-j.h,pOut:p+j.h}; }).sort((a,b)=>a.pIn-b.pIn); L.stops=sigs.filter(s=>L.ax==='x'?s.z===L.st:s.x===L.st).map(s=>{ const j=[...JUNC.values()].find(j=>Math.abs(j.x-s.x)<1&&Math.abs(j.z-s.z)<1); return {sig:s,p:((L.ax==='x'?s.x:s.z)-L.a)*L.dir,off:j?j.h+j.pre:ROAD/2+3.4}; });
    const n=Math.round(L.len/80);
    for(let i=0;i<n;i++) Store.add('cars',{kind:'car',rank:R(),id:'CAR-'+li+'-'+i,lane:li,p:clearOfJunctions(L,(i+R()*0.5)/n*L.len),v:6,vmax:7+R()*3,wait:0,x:0,z:0,heading:0,presence:1,active:true,
      color:pick([0xF3F5FB,0x2E5BFF,0x9AA4C2,0x3B4A7A,0xE0573B,0x17A090,0x1B2340,0xF3F5FB],R)}); });
}
function exitRoom(L,cs,i,jc){
  let stopAt=Infinity;
  for(let k=i-1;k>=0;k--){ const o=cs[k]; if(o.wait>0||o.p<=jc.pOut-2) continue; if(o.v<3){ stopAt=o.p; break; } } /* mobil depan yang melambat dianggap akan berhenti */
  const c=cs[i], ax=L.ax==='x'?'H':'V';
  for(const s of L.stops){ const sp=s.p-s.off-2.1; if(sp<=jc.pOut+1||sp+6.2>=stopAt) continue; const st=ax==='H'?s.sig.stateH:s.sig.stateV;
    /* lampu di depan dinilai saat mobil diperkirakan tiba, bukan hanya sekarang */
    const stF=sigState(s.sig,ax,traffic.t+(sp-c.p)/Math.max(c.v,4));
    if(st==='R'||st==='A'||stF==='R'||stF==='A') stopAt=sp+6.2; }
  /* lampu kuning berkedip (malam): persimpangan berikutnya yang sedang terpakai dianggap titik berhenti */
  if(WX.flash) for(const jn of L.juncs){ const sp=jn.pIn-jn.j.pre-2.1; if(sp<=jc.pOut+1||sp>jc.pOut+70||sp+6.2>=stopAt) continue; if(jn.j.occ.size||jn.j.q.length) stopAt=sp+6.2; break; }
  if(stopAt===Infinity) return true;
  let m=0; for(let k=i-1;k>=0;k--){ const o=cs[k]; if(o.wait<=0&&o.p>jc.pOut-6&&o.p<stopAt-0.5) m++; }
  return stopAt-6.2*(m+1)-2.1>jc.pOut+2.6; }
function stepTraffic(dt){
  traffic.t+=dt;
  for(const s of Store.tables.signals.values()){ s.stateH=sigState(s,'H',traffic.t); s.stateV=sigState(s,'V',traffic.t); }
  const cars=Store.all('cars');
  LANES.forEach((L,li)=>{
    const cs=cars.filter(c=>c.lane===li).sort((a,b)=>b.p-a.p);
    cs.forEach((c,i)=>{
      if(c.wait>0){ if(c._jheld&&c._jheld.size) jReleaseAll(c); c.wait-=dt; c.active=false; if(c.wait<=0){ const busy=cars.some(o=>o!==c&&o.lane===li&&o.wait<=0&&o.p<16); if(busy) c.wait=0.8; else if((c.rank??0)>WX.density) c.wait=2+RAND()*4; else { c.p=0; c.v=5; } } return; }
      let block=Infinity, sigStop=false; const redSigs=new Set(); /* lampu yang mengharuskan mobil ini berhenti (per persimpangan, bukan global) */
      const lead=cs.slice(0,i).reverse().find(o=>o.wait<=0);
      /* badan masih di persimpangan / zebra seberang → boleh merapat lebih dekat ke mobil depan supaya persimpangan & zebra cepat bersih */
      if(lead){ const inBox=L.juncs.some(jc=>c.p+2.1>jc.pIn&&c.p-2.1<jc.pOut+2.6); block=Math.min(block,lead.p-c.p-(inBox?4.4:6.2)); }
      for(const s of L.stops){ const line=s.p-s.off, d=line-(c.p+2.1); if(d<-0.5||d>45){ if(c.commit===s&&d<-0.5) c.commit=null; continue; } const st=L.ax==='x'?s.sig.stateH:s.sig.stateV;
        /* sudah terlanjur lewat batas aman saat kuning/merah → lanjutkan sampai lewat, jangan mengerem mendadak di atas zebra */
        if(st==='G'||st==='F'){ if(c.commit===s) c.commit=null; continue; }
        if(c.commit===s) continue;
        /* kuning: berhenti bila masih nyaman (6 m/s²); merah: berhenti bila masih sempat rem keras (8 m/s²); selain itu terus */
        const need=c.v*c.v/(2*(st==='A'?6:8))+0.3;
        if(d>need||c.v<2){ block=Math.min(block,d); sigStop=true; redSigs.add(s.sig); } else hidden(c,'commit',s); }
      for(const jc of L.juncs){
        if(c.p-2.2>jc.pOut){ if(jc.j.occ.has(c)) jRelease(jc.j,c); continue; }
        const red=!!(jc.j.sig&&redSigs.has(jc.j.sig));
        if(jc.j.occ.has(c)){ if(red&&c.p+2.1<jc.pIn) jRelease(jc.j,c); else continue; }
        const d=jc.pIn-jc.j.pre-(c.p+2.1)-0.2; if(d>c.v*c.v/(2*5)+7) break;
        if(red&&d>=-0.1){ jDequeue(c); break; }
        /* "jangan menutup persimpangan": masuk hanya bila antrean di seberang menyisakan ruang sampai bemper belakang lewat zebra */
        let exitOk=exitRoom(L,cs,i,jc); if(!exitOk&&c.v>4&&d<c.v*c.v/16) exitOk=true; /* sudah tidak sempat berhenti sebelum garis: ikut masuk, jangan berhenti di zebra */
        if(!jRequest(jc.j,c,'S'+L.ax+(L.dir>0?'+':'-'),exitOk)){ block=Math.min(block,d); }
        break;
      }
      const allow=Math.min(c.vmax*WX.speed,Math.sqrt(2*5*Math.max(0,block-0.3)));
      if(allow<c.v) c.v=Math.max(allow,c.v-8*dt); else c.v=Math.min(allow,c.v+2.6*dt);
      c.p+=c.v*dt;
      if(c.p>=L.len){ c.wait=2+RAND()*6; c.active=false; return; }
      const coord=L.a+L.dir*c.p; c.x=L.ax==='x'?coord:L.c; c.z=L.ax==='x'?L.c:coord;
      c.heading=L.ax==='x'?(L.dir>0?Math.PI/2:-Math.PI/2):(L.dir>0?0:Math.PI);
      c.active=true; c.presence=clamp(Math.min(c.p,L.len-c.p)/90,0,1);
    });
  });
}
const city={people:[],bays:[],holds:[]};
function initCityWalkers(){
  const R=rng(777);
  const blocks=[[-1,1],[2,0],[-2,0],[0,-1],[1,-1],[-1,-1],[0,2],[1,2],[2,1]].filter(([gx,gz])=>siteAt(gx,gz)<0&&!STORE_CONFIG.some(S=>S.gx===gx&&S.gz===gz));
  for(const [gx,gz] of blocks){ const cx=gx*PX, cz=gz*PZ, hx=(PX-ROAD)/2-1.9, hzz=(PZ-ROAD)/2-1.9;
    const route=[{x:cx-hx,z:cz-hzz},{x:cx+hx,z:cz-hzz},{x:cx+hx,z:cz+hzz},{x:cx-hx,z:cz+hzz}];
    for(let i=0;i<2;i++){ const ri=i*2, a=route[ri], b=route[(ri+1)%4], t=0.2+R()*0.6, dx=b.x-a.x, dz=b.z-a.z, l=Math.hypot(dx,dz);
      city.people.push(personRecord(null,R,'Warga',{plan:'loop',route,ri,y:0.08,start:{x:a.x+dx*t+dz/l*0.45,z:a.z+dz*t-dx/l*0.45,h:Math.atan2(dx,dz)},
        look:{vest:pick([0xFFFFFF,0x2E5BFF,0x9AA4C2,0xE0573B,0x17A090,0xF2B53A],R),hat:pick([0x2A2622,0x3B2A20,0x1B1B1B],R),civ:true}})); } }
}
function simCity(dt){
  alertsTick(dt); stepTraffic(dt); refreshCircles(city.people); for(const p of city.people) personStep(city,p,dt); }

/* ---------- cuaca (data, seperti feed stasiun cuaca) ---------- */
const WEATHER={
  clear:{label:'Cerah',icon:'☀️',visibilityM:10000,windKmh:8,tempC:31,speed:1,fork:1,arrive:1,ontime:0,impact:'Operasi normal'},
  cloudy:{label:'Berawan',icon:'⛅',visibilityM:8000,windKmh:14,tempC:28,speed:1,fork:1,arrive:1,ontime:-0.3,impact:'Operasi normal · sinar matahari redup'},
  rain:{label:'Hujan',icon:'🌧️',visibilityM:1500,windKmh:22,tempC:25,speed:0.75,fork:0.85,arrive:0.85,ontime:-1.8,impact:'Jalan licin · batas kecepatan diturunkan · lantai dock basah'},
  storm:{label:'Badai petir',icon:'⛈️',visibilityM:600,windKmh:48,tempC:24,speed:0.55,fork:0.6,arrive:0.6,ontime:-4.6,impact:'Petir: kerja di area terbuka dibatasi · kedatangan truk ditunda'},
  fog:{label:'Kabut',icon:'🌫️',visibilityM:200,windKmh:4,tempC:23,speed:0.6,fork:0.9,arrive:0.8,ontime:-3.1,impact:'Jarak pandang rendah · kendaraan melambat'},
  sandstorm:{label:'Badai pasir',icon:'🌪️',visibilityM:120,windKmh:62,tempC:36,speed:0.55,fork:0.75,arrive:0.65,ontime:-5.2,impact:'Jarak pandang 120 m · debu di area dock · kendaraan dibatasi'}};
const WX_ORDER=['clear','cloudy','rain','storm','fog','sandstorm'];
Store.weather={condition:'clear',...WEATHER.clear};
const TIME_MODES={live:{label:'Real-time (WIB)'},pagi:{label:'Pagi',h:7},siang:{label:'Siang',h:12.5},sore:{label:'Sore',h:17.4},malam:{label:'Malam',h:22},cycle:{label:'Siklus cepat'}};
Store.clock={mode:'live',hour:12,base:12,t0:0};
const wibHour=()=>{ const d=nowWIB(); return d.getHours()+d.getMinutes()/60+d.getSeconds()/3600; };
function setTimeMode(mode){ const c=Store.clock; c.mode=mode; c.el=0; c.base=mode==='live'?wibHour():mode==='cycle'?c.hour:TIME_MODES[mode].h; c.hour=c.base; applyWX(); }
const isNight=h=>h<5.6||h>=18.9;
function tickClock(dt){ const c=Store.clock; if(c.mode==='live') c.hour=wibHour(); else if(c.mode==='cycle') c.hour=(c.hour+dt*24/480)%24; else { c.el=(c.el||0)+dt; c.hour=(c.base+c.el/3600)%24; } applyWX(); } /* jam mode tetap maju dengan waktu simulasi (deterministik), bukan jam dinding */
function trafficDensity(h){ if(h>=21||h<5) return 0.22; if(h<6.5) return lerp(0.22,0.85,(h-5)/1.5); if(h<9) return 1; if(h<16) return 0.7; if(h<19) return 1; return lerp(1,0.3,(h-19)/2); }
function trafficInfo(){ const d=WX.density, h=Store.clock.hour; return d<0.35?{label:'Sepi',note:'jalan lengang, pengiriman lebih cepat'}:d>=0.95?{label:h<12?'Padat · jam sibuk pagi':'Padat · jam sibuk sore',note:'lalu lintas padat, truk melambat'}:d>=0.6?{label:'Ramai lancar',note:'lalu lintas normal'}:{label:'Lengang',note:'lalu lintas mulai sepi'}; }
function applyWX(){ const w=Store.weather, h=Store.clock.hour, n=isNight(h), d=trafficDensity(h);
  const tf=d<0.35?1.18:d>=0.95?0.85:1.02-(d-0.35)*0.16;
  WX.density=d; WX.traffic=tf; WX.speed=w.speed*tf; WX.fork=w.fork; WX.arrive=w.arrive*(d<0.35?1.25:d>=0.95?0.85:1); WX.night=n; WX.flash=h>=22||h<5;
  const lab=trafficInfo().label; if(WX._lab&&WX._lab!==lab&&Store.tables.sites.size){ for(const s of Store.all('sites')) logEvent(s,`Lalu lintas ${lab.toLowerCase()} · ${trafficInfo().note}`,d<0.35?'#178A55':d>=0.95?'#C2410C':'#2E5BFF'); } WX._lab=lab; }
function setWeather(cond,quiet){ const w=WEATHER[cond]; Store.weather={condition:cond,...w}; applyWX(); if(quiet) return;
  for(const s of Store.all('sites')) logEvent(s,cond==='clear'?'Cuaca cerah · operasi kembali normal':`${w.label}: ${w.impact.toLowerCase()}`,cond==='clear'||cond==='cloudy'?'#178A55':'#C2410C'); }
const trafficOntime=()=>WX.density<0.35?0.8:WX.density>=0.95?-0.6:0;
const ontimeNow=s=>Math.min(99.6,Math.max(80,Math.round((s.ontimePct+Store.weather.ontime+trafficOntime())*10)/10));
/* kondisi awal: sebagian dock sudah terisi supaya operasi langsung terlihat berjalan */
function seedDocks(site){
  const n=Math.max(1,site.bays.length-1);
  for(let i=0;i<n;i++){ const t=site.trucks[i], bay=site.bays[i]; let m=planMode(site); if(!m) break;
    if(site.profile==='crossdock') m={mode:bay.i<xdHalf(site)?'unload':'load',total:3+Math.floor(RAND()*3)};
    t.mode=m.mode; t.total=m.total; t.bay=bay; bay.truck=t; t.pending=0; t.assigned=null;
    const sh=newShipment(site,t,t.mode); sh.total=t.total; sh.status=t.mode==='load'?'loading':'unloading'; t.shipmentId=sh.id;
    t.done=Math.floor(RAND()*Math.max(1,t.total-1));
    if(t.mode==='unload') fillCargo(site,t,t.total-t.done); else { clearCargo(t); for(let k=0;k<t.done;k++){ const p=newPallet(site,RAND,'box',2,{type:'truck',id:t.id,index:k}); t.cargo[k]=p.id; } }
    t.state='docked'; t.pos.set(bay.x,0,site.zDock); t.heading=0; t.v=0; t.solid=true; t.doorsT=1; t.wantDoors=1; t.presence=1; t.wait=0; t.path=null; bay.doorState='open'; hidden(t,'restPlan',RAND()<0.85); }
}

/* ---------- router jalan kota untuk truk (hanya jalan yang aman untuk truk) ---------- */
const RX=[-150,-50,50,150], RZ=[ZHW,-114,-38,38,114,190];
const DIRV={E:{x:1,z:0},W:{x:-1,z:0},S:{x:0,z:1},N:{x:0,z:-1}}, OPP={E:'W',W:'E',S:'N',N:'S'};
const LOFF={E:{x:0,z:-2.2},W:{x:0,z:2.2},S:{x:2.2,z:0},N:{x:-2.2,z:0}};
function rNeighbors(n){ const out=[];
  if(RX.includes(n.x)){ const i=RZ.indexOf(n.z); if(i>0) out.push({x:n.x,z:RZ[i-1],d:'N'}); if(i>=0&&i<RZ.length-1) out.push({x:n.x,z:RZ[i+1],d:'S'}); }
  if(n.z===ZHW){ const i=RX.indexOf(n.x); if(i>0) out.push({x:RX[i-1],z:ZHW,d:'W'}); if(i>=0&&i<RX.length-1) out.push({x:RX[i+1],z:ZHW,d:'E'}); }
  return out; }
function route(start,h0,goalFn){ const key=(n,h)=>n.x+','+n.z+','+h, best=new Map(), open=[{n:start,h:h0,c:0,path:[{n:start,h:h0}]}];
  while(open.length){ open.sort((a,b)=>a.c-b.c); const cur=open.shift(); const k=key(cur.n,cur.h); if(best.has(k)) continue; best.set(k,1);
    if(goalFn(cur.n,cur.h)&&cur.path.length>0) return cur.path;
    for(const nb of rNeighbors(cur.n)){ if(nb.d===OPP[cur.h]) continue; const c=cur.c+Math.hypot(nb.x-cur.n.x,nb.z-cur.n.z)+(nb.d===cur.h?0:25);
      open.push({n:{x:nb.x,z:nb.z},h:nb.d,c,path:cur.path.concat([{n:{x:nb.x,z:nb.z},h:nb.d}])}); } }
  return null; }
function corner(n,a,b){ if(a===b) return null; const A=LOFF[a],B=LOFF[b]; return (a==='E'||a==='W')?{x:n.x+B.x,z:n.z+A.z}:{x:n.x+A.x,z:n.z+B.z}; }
function routeCorners(path,finalDir){ const pts=[]; for(let i=0;i<path.length;i++){ const inH=path[i].h, outH=i<path.length-1?path[i+1].h:finalDir; if(i===0&&!outH) continue; const c=corner(path[i].n,inH,outH||inH); if(c) pts.push(c); } return pts; }
const toLocal=(pts,s)=>pts.map(p=>({x:p.x-s.ox,z:p.z-s.oz}));
const toWorld=(pts,s)=>pts.map(p=>({x:p.x+s.ox,z:p.z+s.oz}));
function stores(){ return Store.all('stores'); }
function storeEntry(st){ return {x:st.gx*PX-PX/2,z:st.gz*PZ+PZ/2}; }
function freeStore(){ const c=stores().filter(st=>!st.bays[0].truckId); return c.length?pick(c):null; }
/* ---------- pusat peringatan: kondisi operasional + aksi yang bisa dijalankan ---------- */
const ALERTS=new Map(), ALERT_LOG=[]; let alertAcc=0, alertSeq=0;
function applyRestock(site){ for(const i of site.inv) if(i.restock){ i.qty+=i.restock; logEvent(site,`Restock ${i.name} tiba (+${i.restock.toLocaleString('id-ID')} unit)`,'#178A55'); i.restock=0; } }
function upAlert(id,o){ let a=ALERTS.get(id); if(!a){ a={id,seq:++alertSeq,t:simNow(),state:'open',fresh:true}; ALERTS.set(id,a); } Object.assign(a,o); a.live=true; return a; }
function closeAlert(a,how){ ALERTS.delete(a.id); ALERT_LOG.unshift({id:a.id,sev:a.sev,title:a.title,siteId:a.siteId,how,doneLabel:a.doneLabel,t:simNow()}); if(ALERT_LOG.length>25) ALERT_LOG.pop(); }
const lookAct=(id,label)=>({id:'look',label,focus:id});
function alertsTick(dt){ alertAcc+=dt; if(alertAcc<1.2) return; alertAcc=0;
  for(const a of ALERTS.values()) a.live=false;
  const prev=id=>ALERTS.get(id);
  for(const t of Store.tables.trucks.values()){ const site=t.site; if(!site||!t.solid) continue;
    const sid='stuck:'+t.id, stuck=!['docked','parked','away','store_docked'].includes(t.state)&&(t.stuck>60||(prev(sid)&&t.stuck>5));
    if(stuck){ const acts=[lookAct(t.id,'Lihat truk')]; const o=destOptions(t); if(o&&o.enroute){ const alt=o.list.find(x=>!x.busy&&!x.cur); if(alt) acts.unshift({id:'reroute',label:`Alihkan ke ${alt.name}`,primary:true,run:()=>setTruckDest(t,alt.id)==='ok'?`${t.id} dialihkan ke ${alt.name}`:'Gagal mengalihkan'}); }
      upAlert(sid,{sev:'crit',kind:'truck',title:`${t.id} tertahan ${Math.round(t.stuck)} detik`,detail:`${site.name} · menunggu jalur kosong`,siteId:site.id,ref:t.id,actions:acts}); }
    const vid='starve:'+t.id;
    if(t.state==='docked'&&t.mode==='load'&&(t.starve>10||(prev(vid)&&t.starve>0))){ const acts=[lookAct(t.id,'Lihat truk')];
      if(t.done+t.pending>=1) acts.unshift({id:'go',label:`Berangkatkan (${t.done+t.pending} palet)`,primary:true,run:()=>{ t.total=t.done+t.pending; t.starve=0; if(t.shipment) t.shipment.total=t.total; logEvent(site,`${t.id} diberangkatkan dengan muatan parsial (${t.total} palet)`,'#2E5BFF',t); return `${t.id} diberangkatkan dengan ${t.total} palet`; }});
      upAlert(vid,{sev:'warn',kind:'truck',title:`${t.id} menunggu stok untuk dimuat`,detail:`${t.done}/${t.total} palet · ${t.bay?t.bay.label+' · ':''}${site.name}`,siteId:site.id,ref:t.id,actions:acts}); } }
  for(const s of SITES_SIM()){ const occ=s.slots.filter(x=>x.occupied).length/Math.max(1,s.slots.length);
    const fid='full:'+s.id, eid='empty:'+s.id;
    if(occ>=0.9||(prev(fid)&&occ>0.7)){ const a=upAlert(fid,{sev:'warn',kind:'site',title:`${s.name} hampir penuh`,detail:`Area staging ${Math.round(occ*100)}% terisi`,siteId:s.id,ref:s.id,
        actions:[{id:'bias',label:'Prioritaskan muat 10 mnt',primary:true,run:()=>{ s.bias={mode:'load',t:600}; logEvent(s,`Prioritas truk muat diaktifkan 10 menit`,'#2E5BFF'); return 'Truk muat diprioritaskan 10 menit'; }},lookAct(s.id,'Lihat gudang')]});
      if(s.bias&&s.bias.mode==='load'&&a.state==='open'){ a.state='done'; a.doneLabel='Prioritas muat aktif'; } }
    if(occ<=0.1||(prev(eid)&&occ<0.3)){ const a=upAlert(eid,{sev:'warn',kind:'site',title:`${s.name} hampir kosong`,detail:`Area staging ${Math.round(occ*100)}% terisi`,siteId:s.id,ref:s.id,
        actions:[{id:'bias',label:'Prioritaskan bongkar 10 mnt',primary:true,run:()=>{ s.bias={mode:'unload',t:600}; logEvent(s,`Prioritas truk bongkar diaktifkan 10 menit`,'#2E5BFF'); return 'Truk bongkar diprioritaskan 10 menit'; }},lookAct(s.id,'Lihat gudang')]});
      if(s.bias&&s.bias.mode==='unload'&&a.state==='open'){ a.state='done'; a.doneLabel='Prioritas bongkar aktif'; } }
    for(const i of s.inv){ const iid='stock:'+s.id+':'+i.name; if(i.qty>=STOCK_LOW) continue;
      const a=upAlert(iid,{sev:'warn',kind:'stock',title:`Stok ${i.name} menipis`,detail:`${i.qty.toLocaleString('id-ID')} unit tersisa · ${s.name}`,siteId:s.id,ref:s.id,
        actions:[{id:'po',label:'Pesan restock',primary:true,run:()=>{ i.restock=600; logEvent(s,`Restock ${i.name} dipesan (600 unit) · tiba bersama truk bongkar berikutnya`,'#2E5BFF'); return `Restock ${i.name} dipesan`; }},lookAct(s.id,'Lihat gudang')]});
      if(i.restock&&a.state==='open'){ a.state='done'; a.doneLabel='Restock dipesan · menunggu truk bongkar'; } }
    for(const f of s.forks){ const bid='bat:'+f.id; const low=!f.charging&&(f.battery<26||(prev(bid)&&f.battery<30))&&!f.task.startsWith('Menuju stasiun');
      if(low){ const a=upAlert(bid,{sev:'warn',kind:'fork',title:`Baterai ${f.short} ${Math.round(f.battery)}%`,detail:`${f.task} · ${s.name}`,siteId:s.id,ref:f.id,
          actions:[{id:'charge',label:'Isi daya sekarang',primary:true,run:()=>{ f.forceCharge=true; return `${f.short} akan ke stasiun setelah tugas ini`; }},lookAct(f.id,'Lihat forklift')]});
        if(f.forceCharge&&a.state==='open'){ a.state='done'; a.doneLabel='Menuju pengisian setelah tugas ini'; } } } }
  const c=Store.weather&&Store.weather.condition, WXL={storm:'Badai petir',fog:'Kabut tebal',sandstorm:'Badai pasir'};
  if(WXL[c]) upAlert('wx',{sev:'info',kind:'wx',title:`Cuaca: ${WXL[c]}`,detail:`Kecepatan truk ${Math.round(WX.speed*100)}% · forklift ${Math.round(WX.fork*100)}%`,siteId:null,ref:null,
      actions:[{id:'clear',label:'Kembalikan cerah',primary:true,run:()=>{ setWeather('clear'); return 'Cuaca dikembalikan cerah'; }}]});
  for(const a of [...ALERTS.values()]) if(!a.live) closeAlert(a,a.state==='done'?'resolved':'auto');
}
function runAlert(id,actId){ const a=ALERTS.get(id); if(!a) return {msg:'Peringatan sudah selesai'};
  if(actId==='ack'){ a.state='done'; a.doneLabel='Ditandai sudah ditangani'; return {msg:'Ditandai sudah ditangani'}; }
  const act=a.actions.find(x=>x.id===actId); if(!act) return {msg:'Aksi tidak tersedia'};
  if(act.focus) return {focus:act.focus};
  const msg=act.run(); a.state='done'; a.doneLabel=a.doneLabel||act.label; a.doneLabel=act.label; return {msg}; }
const openAlerts=()=>[...ALERTS.values()].filter(a=>a.state==='open').sort((a,b)=>(a.sev==='crit'?0:a.sev==='warn'?1:2)-(b.sev==='crit'?0:b.sev==='warn'?1:2)||b.seq-a.seq);
const SITES_SIM=()=>Store.all('sites');
/* ---------- pengarahan manual: pengguna memilih tujuan truk ---------- */
const DEST_BEFORE=['docked','pull','close'];
function destOptions(t){ const site=t.site; if(!site) return null;
  const before=DEST_BEFORE.includes(t.state)&&t.mode==='load', enroute=t.state==='to_store';
  if(!before&&!enroute) return null;
  return {enroute,list:stores().map(st=>{ const by=st.bays[0].truckId; return {id:st.id,name:st.name,type:st.type,cur:t.dest===st.id||t.pendingDest===st.id,busy:!!(by&&by!==t.id),by}; }),toll:!enroute}; }
function cardinal(h){ const sx=Math.sin(h), cz=Math.cos(h); if(sx>0.8) return 'E'; if(sx<-0.8) return 'W'; if(cz>0.8) return 'S'; if(cz<-0.8) return 'N'; return null; }
function redirectPath(site,t,st){ const p={x:t.pos.x+site.ox,z:t.pos.z+site.oz}, D=cardinal(t.heading); if(!D) return null;
  for(const j of JUNC.values()) if(Math.abs(p.x-j.x)<j.h+j.pre+3&&Math.abs(p.z-j.z)<j.h+j.pre+3) return null;
  let node=null;
  if(D==='E'||D==='W'){ const zS=RZ.reduce((a,b)=>Math.abs(b-p.z)<Math.abs(a-p.z)?b:a); const xs=RX.filter(x=>D==='E'?x>p.x+9:x<p.x-9); if(xs.length) node={x:D==='E'?Math.min(...xs):Math.max(...xs),z:zS}; }
  else { const xS=RX.reduce((a,b)=>Math.abs(b-p.x)<Math.abs(a-p.x)?b:a); const zs=RZ.filter(z=>D==='S'?z>p.z+9:z<p.z-9); if(zs.length) node={x:xS,z:D==='S'?Math.min(...zs):Math.max(...zs)}; }
  if(!node) return null;
  const en=storeEntry(st), pr=route(node,D,(n,h)=>n.x===en.x&&n.z===en.z&&(h==='S'||h==='N')); if(!pr) return null;
  const mid=routeCorners([{n:node,h:D},...pr.slice(1)],'E'), ahead={x:p.x+Math.sin(t.heading)*3,z:p.z+Math.cos(t.heading)*3};
  const tail=toWorld(yardTail(st,st.bays[0],en.x-st.ox+7.2),st);
  return polyPath(toLocal([p,ahead,...mid,...tail],site),4.6); }
function applyRedirect(site,t){ const st=Store.get('stores',t.pendingDest); if(!st){ t.pendingDest=null; return; }
  const P=redirectPath(site,t,st); if(!P) return;
  jReleaseAll(t); t.dest=st.id; t.pendingDest=null; setPath(t,P,false,8,3); }
function setTruckDest(t,destId){ const site=t.site, o=destOptions(t); if(!o) return 'Truk ini tidak bisa diarahkan sekarang';
  const sh=t.shipment, curId=t.pendingDest||t.dest, cur=curId?Store.get('stores',curId):null;
  if(destId==='toll'){ if(o.enroute) return 'Truk sudah di perjalanan ke toko';
    if(cur&&cur.bays[0].truckId===t.id) cur.bays[0].truckId=null; t.dest=null;
    if(sh){ sh.destination='Pelanggan luar kota'; sh.customer=sh.customer||'Pelanggan luar kota'; sh.storeId=null; }
    logEvent(site,`${t.id} diarahkan keluar kota via Tol Jagorawi`,'#2E5BFF',t); return 'ok'; }
  const st=Store.get('stores',destId); if(!st) return 'Tujuan tidak ditemukan'; if(st===cur) return 'ok';
  const by=st.bays[0].truckId; if(by&&by!==t.id) return `${st.name} sedang dipakai ${by}`;
  if(cur&&cur.bays[0].truckId===t.id) cur.bays[0].truckId=null; st.bays[0].truckId=t.id;
  if(o.enroute){ hidden(t,'pendingDest',st.id); applyRedirect(site,t); } else t.dest=st.id;
  if(sh){ sh.destination=st.name; sh.customer=st.name; sh.storeId=st.id; }
  logEvent(site,`${t.id} diarahkan ke ${st.name}`,'#2E5BFF',t); return 'ok'; }
/* gudang → toko */
function storeTripPath(site,t,st){
  const bay=t.bay, home=site, xRn=(home.gx*PX+PX/2), zS=home.gz*PZ+PZ/2, en=storeEntry(st);
  const pre=toWorld(linePts(bay.x,home.zDock+4,bay.x,home.Zr-RT,0.5).concat(arcPts(bay.x+RT,home.Zr-RT,RT,Math.PI,Math.PI/2,30).slice(1)),home);
  let mid;
  if(Math.abs(xRn-en.x)<1&&Math.abs(zS-en.z)<1) mid=[];
  else { const p=route({x:xRn,z:zS},'N',(n,h)=>n.x===en.x&&n.z===en.z&&(h==='S'||h==='N')); if(!p) return null; mid=routeCorners([{n:{x:xRn,z:zS},h:'E'},...p.slice(1)],'E'); }
  const tail=toWorld(yardTail(st,st.bays[0],en.x-st.ox+7.2),st);
  return polyPath(toLocal(pre.concat(mid,tail),home),4.6);
}
function storeReversePath(home,st){ const b=st.bays[0], zA=yardZ(st); return finalize(toLocal(toWorld(arcPts(b.x+RY,zA-RY,RY,Math.PI/2,Math.PI,30).concat(linePts(b.x,zA-RY,b.x,st.zDock,0.5).slice(1)),st),home)); }
function storePullPath(home,st){ const b=st.bays[0]; return finalize(toLocal(toWorld(linePts(b.x,st.zDock,b.x,st.zDock+4,0.5),st),home)); }
/* toko → gudang (bongkar retur) atau → tol */
function storeExitPts(st){ const b=st.bays[0], zW=st.Zr+4.4, R=7; return toWorld(linePts(b.x,st.zDock+4,b.x,zW-R,0.5).concat(arcPts(b.x-R,zW-R,R,0,Math.PI/2,20).slice(1)),st); }
function storeToHomePath(home,t,st,bay){
  const en=storeEntry(st), hl={x:home.gx*PX-PX/2,z:home.gz*PZ+PZ/2};
  const p=route({x:en.x,z:en.z},'W',(n,h)=>n.x===hl.x&&n.z===hl.z&&(h==='S'||h==='N')); if(!p) return null;
  const mid=routeCorners(p,'E'), tail=toWorld(yardTail(home,bay,home.xL+7.2),home);
  return polyPath(toLocal(storeExitPts(st).concat(mid,tail),home),4.6);
}
function storeToTollPath(home,t,st){
  const en=storeEntry(st), p=route({x:en.x,z:en.z},'W',(n,h)=>n.z===ZHW&&n.x===RX[RX.length-1]&&h!=='W'); if(!p) return null;
  const mid=routeCorners(p,'E'), end={x:HWY.xToll-7,z:HWY.zE};
  return polyPath(toLocal(storeExitPts(st).concat(mid,[end]),home),4.6);
}
/* simulasi toko: forklift toko + konsumsi barang + retur baru */
function simStore(st,dt){
  refreshCircles(st.forks);
  for(const t of st.trucks){ const h=t.site; t.cw=t.cw||[]; circlesAt(t,t.pos.x+h.ox-st.ox,t.pos.z+h.oz-st.oz,t.heading,t.cw); }
  for(const f of st.forks) forkStep(st,f,dt);
  const d=st.bays[0], t=d.truck; d.doorState=t&&t.state==='store_docked'?'open':'closed';
  for(const sl of st.slots){ const p=sl.data; if(!p||sl.reserved) continue; p.createdT=(p.createdT||0)+dt; if(!p.retur&&p.createdT>14){ deletePallet(p.id); sl.palletId=null; } }
  st._rt=(st._rt||0)+dt; if(st._rt>25){ st._rt=0; const nret=st.slots.filter(s=>s.data&&s.data.retur).length, empty=st.slots.find(s=>!s.occupied&&!s.reserved);
    if(nret<2&&empty){ const p=newPallet(st,RAND,'white',1,{type:'slot',id:empty.id},{retur:true,item:'Retur kardus & palet kosong'}); empty.palletId=p.id; } }
}

/* ==========================================================================
   UJI MANDIRI · pemeriksa invariant keselamatan (KONTEKS-PROYEK.md §11)
   Hanya membaca Store. Dipakai mode ?selftest di browser dan tests/headless-sim.mjs.
   ========================================================================== */
const SAFETY_LABELS={
  truckTruck:'Tabrakan truk–truk', truckCar:'Tabrakan truk–mobil', carCar:'Tabrakan mobil–mobil', forkFork:'Tabrakan forklift–forklift',
  personHit:'Orang tertabrak truk/forklift', crewTouch:'Sopir menyentuh badan truk lain', zebra:'Kendaraan berhenti di atas zebra cross',
  doorsRoad:'Pintu truk dibuka di jalan raya', crossdock:'Cross-dock: truk di dock arah yang salah', cold:'Gudang dingin: palet dipindah sebelum cek suhu',
  redirect:'Truk tiba di tujuan yang salah', crewStall:'Sopir tidak mendekat ke tujuannya > 20 dtk', stuck:'Truk tertahan > 120 dtk',
  teleport:'Truk "diteleport" pengaman macet (> 300 dtk)', gap:'Jarak antre truk < 1,5 m'};
function makeSafetyChecker(){
  const V={}; for(const k in SAFETY_LABELS) V[k]={n:0,ex:[]};
  const bad=(k,msg)=>{ const v=V[k]; v.n++; if(v.ex.length<3&&!v.ex.includes(msg)) v.ex.push(msg); };
  const M={simSec:0,checks:0,maxStuck:0,maxStuckId:'',minGap:Infinity,crossdock:0,cold:0,redirect:0,zebraStops:0};
  const VX=[],HZ=[]; for(let k=GRID.x0;k<=GRID.x1+1;k++) VX.push((k-0.5)*PX); for(let k=GRID.z0;k<=GRID.z1+1;k++) HZ.push((k-0.5)*PZ);
  const Z0=ROAD/2+0.4, Z1=ROAD/2+2.8, ZW=3.85;
  const onZebra=(x,z)=>{ for(const X of VX){ const dx=Math.abs(x-X); if(dx>Z1+0.1) continue; for(const Z of HZ){ const dz=Math.abs(z-Z); if(dx<=ZW&&dz>=Z0&&dz<=Z1) return true; if(dz<=ZW&&dx>=Z0&&dx<=Z1) return true; } } return false; };
  const onRoad=(x,z)=>VX.some(X=>Math.abs(x-X)<ROAD/2)||HZ.some(Z=>Math.abs(z-Z)<ROAD/2)||Math.abs(z-ZHW)<9;
  const body=(x,z,h,offs)=>offs.map(o=>({x:x+Math.sin(h)*o,z:z+Math.cos(h)*o}));
  const T_OFF=[3.3,2.25,0,-2.15,-3.2], C_OFF=[1.95,0,-1.95];
  const carCirc=c=>[-1.3,0,1.3].map(o=>({x:c.x+Math.sin(c.heading)*o,z:c.z+Math.cos(c.heading)*o,r:0.95}));
  const stopT=new Map(), crewP=new Map(), arrived=new Set(), stuckHit=new Set();
  const MOVING=['inbound','approach','depart','highway','to_store','leave'], ROADST=['inbound','approach','depart','highway','to_store','leave','toll_in','toll_out'];
  let acc=0;
  function check(dt){
    M.checks++;
    const trucks=[...Store.tables.trucks.values()], solid=trucks.filter(t=>t.solid&&t.cwW&&t.state!=='away');
    /* truk–truk (koordinat dunia) */
    for(let i=0;i<solid.length;i++) for(let j=i+1;j<solid.length;j++){ const a=solid[i], b=solid[j]; const ax=a.pos.x+a.site.ox, az=a.pos.z+a.site.oz, bx=b.pos.x+b.site.ox, bz=b.pos.z+b.site.oz;
      if(Math.hypot(ax-bx,az-bz)>9) continue; if(overlapC(a.cwW,b.cwW,-0.25)) bad('truckTruck',`${a.id} × ${b.id} (${a.state}/${b.state})`); }
    /* mobil */
    const cars=[...Store.tables.cars.values()].filter(c=>c.active&&c.wait<=0), cc=cars.map(carCirc);
    for(let i=0;i<cars.length;i++){ for(let j=i+1;j<cars.length;j++){ if(Math.abs(cars[i].x-cars[j].x)>5||Math.abs(cars[i].z-cars[j].z)>5) continue; if(overlapC(cc[i],cc[j],-0.25)) bad('carCar',`${cars[i].id} × ${cars[j].id}`); }
      for(const t of solid){ const tx=t.pos.x+t.site.ox, tz=t.pos.z+t.site.oz; if(Math.abs(tx-cars[i].x)>7||Math.abs(tz-cars[i].z)>7) continue; if(overlapC(t.cwW,cc[i],-0.25)) bad('truckCar',`${t.id} × ${cars[i].id}`); } }
    /* per site: forklift, orang, sopir (koordinat lokal site) */
    for(const s of Store.all('sites')){
      const F=s.forks; for(let i=0;i<F.length;i++) for(let j=i+1;j<F.length;j++) if(F[i].cw&&F[j].cw&&overlapC(F[i].cw,F[j].cw,-0.15)) bad('forkFork',`${F[i].id} × ${F[j].id}`);
      /* catatan: t.cw truk yang sedang di toko ditulis ulang dalam koordinat toko oleh simStore, jadi truk dicek memakai koordinat dunia (cwW) */
      const gapW=(o,x,z)=>{ let m=Infinity; for(const c of o.cwW) m=Math.min(m,Math.hypot(c.x-x,c.z-z)-c.r); return m; };
      for(const p of s.people){ if(!p.cw) continue; const px=p.pos.x+s.ox, pz=p.pos.z+s.oz;
        for(const o of solid) if(gapW(o,px,pz)<0.34-0.1) bad('personHit',`${p.name} (${p.role}) × ${o.id}`);
        for(const o of F) if(o.cw&&overlapC(p.cw,o.cw,-0.1)) bad('personHit',`${p.name} (${p.role}) × ${o.id}`); }
      for(const t of s.trucks){ const d=t.crew; if(!d||!d.on) continue; const cx=d.x+s.ox, cz=d.z+s.oz;
        for(const o of solid){ if(o===t) continue; if(gapW(o,cx,cz)<-0.05) bad('crewTouch',`sopir ${t.id} (${d.task}/${d.phase}) × ${o.id} (${o.state})`); }
        if(d.route&&d.route.length&&d.v>0.01||(d.route&&d.route.length&&(d.blockT||0)>0)){ const g=d.route[0], key=t.id+':'+g.x.toFixed(1)+','+g.z.toFixed(1), dist=Math.hypot(g.x-d.x,g.z-d.z);
          let r=crewP.get(t.id); if(!r||r.key!==key){ r={key,best:dist,t:0}; crewP.set(t.id,r); }
          if(dist<r.best-0.3){ r.best=dist; r.t=0; } else { r.t+=dt; if(r.t>20){ bad('crewStall',`sopir ${t.id} (${d.task}/${d.phase})`); r.t=0; } } } else crewP.delete(t.id); }
    }
    /* status truk */
    for(const t of trucks){ const s=t.site; if(!s||t.state==='away') { stopT.delete(t.id); continue; }
      if(MOVING.includes(t.state)&&t.stuck>M.maxStuck){ M.maxStuck=t.stuck; M.maxStuckId=`${t.id} (${t.state})`; }
      if(MOVING.includes(t.state)&&t.stuck>120&&!stuckHit.has(t.id)){ stuckHit.add(t.id); bad('stuck',`${t.id} ${Math.round(t.stuck)} dtk (${t.state})`); }
      if(t.stuck<1) stuckHit.delete(t.id);
      if(t.stuck>299.9&&t.stuck<300.4) bad('teleport',`${t.id} (${t.state})`);
      const wx=t.pos.x+s.ox, wz=t.pos.z+s.oz;
      /* zebra: kendaraan berhenti ≥1 dtk dengan badan di atas zebra */
      if(ROADST.includes(t.state)&&t.v<0.05){ const st=(stopT.get(t.id)||0)+dt; stopT.set(t.id,st); if(st>=1){ M.zebraStops++; if(body(wx,wz,t.heading,T_OFF).some(p=>onZebra(p.x,p.z))) bad('zebra',`${t.id} (${t.state})`); } } else stopT.delete(t.id);
      if(t.doorsT>0.05&&ROADST.includes(t.state)&&body(wx,wz,t.heading,[0,-3.2]).some(p=>onRoad(p.x,p.z))) bad('doorsRoad',`${t.id} (${t.state})`);
      if(t.state==='docked'&&s.profile==='crossdock'&&t.bay){ M.crossdock++; const inb=t.bay.i<xdHalf(s); if((t.mode==='unload')!==inb) bad('crossdock',`${t.id} ${t.mode} di ${t.bay.label}`); }
      if(t.state==='docked'&&s.profile==='cold'&&t.coldCheck>0){ M.cold++; if(t.pending>0||s.forks.some(f=>f.task.includes(t.id))) bad('cold',`${t.id} di ${t.bay.label}`); }
      if(t.state==='store_docked'){ const k=t.id+':'+t.shipmentId; if(!arrived.has(k)){ arrived.add(k); M.redirect++; const sh=t.shipment;
        if(t.dockId!==(Store.get('stores',t.dest)||{bays:[{}]}).bays[0].id||(sh&&sh.storeId&&sh.storeId!==t.dest)) bad('redirect',`${t.id} tiba di ${t.dockId}, seharusnya ${sh&&sh.storeId}`); } }
    }
    for(const c of cars) if(c.v<0.05){ const k='c'+c.id, st=(stopT.get(k)||0)+dt; stopT.set(k,st); if(st>=1&&body(c.x,c.z,c.heading,C_OFF).some(p=>onZebra(p.x,p.z))) bad('zebra',`${c.id}`); } else stopT.delete('c'+c.id);
    /* jarak antre: truk diam beruntun di jalan */
    const q=solid.filter(t=>t.v<0.05&&ROADST.includes(t.state)&&!TIGHT_STATES.includes(t.state));
    for(let i=0;i<q.length;i++) for(let j=0;j<q.length;j++){ if(i===j) continue; const a=q[i], b=q[j]; if(Math.abs(angDiff(a.heading,b.heading))>0.35) continue;
      const ax=a.pos.x+a.site.ox, az=a.pos.z+a.site.oz, bx=b.pos.x+b.site.ox, bz=b.pos.z+b.site.oz, f=(bx-ax)*Math.sin(a.heading)+(bz-az)*Math.cos(a.heading);
      if(f<=0||f>12) continue; const lat=Math.abs((bx-ax)*Math.cos(a.heading)-(bz-az)*Math.sin(a.heading)); if(lat>1.2) continue;
      const gap=f-3.42-3.24; if(gap<M.minGap) M.minGap=gap; if(gap<1.5) bad('gap',`${a.id} → ${b.id} ${gap.toFixed(2)} m`); }
  }
  return {
    tick(dt){ M.simSec+=dt; acc+=dt; if(acc>=0.25){ check(acc); acc=0; } },
    report(){ const rows=Object.keys(SAFETY_LABELS).map(k=>({id:k,label:SAFETY_LABELS[k],count:V[k].n,ok:V[k].n===0,examples:V[k].ex}));
      return {pass:rows.every(r=>r.ok),rows,metrics:{simMinutes:Math.round(M.simSec/6)/10,checks:M.checks,maxStuckSec:Math.round(M.maxStuck),maxStuckTruck:M.maxStuckId,
        minQueueGapM:M.minGap===Infinity?null:Math.round(M.minGap*100)/100,crossdockChecks:M.crossdock,coldChecks:M.cold,storeArrivals:M.redirect,stoppedChecks:M.zebraStops}}; }
  };
}
function selftestInit(opt={}){ setTimeMode(opt.jam&&TIME_MODES[opt.jam]&&opt.jam!=='live'?opt.jam:'siang'); setWeather(opt.cuaca&&WEATHER[opt.cuaca]?opt.cuaca:'clear',true); return makeSafetyChecker(); }
function selftestStep(dt,C){ tickClock(dt); for(const s of Store.all('sites')) simSite(s,dt); for(const st of stores()) simStore(st,dt); simCity(dt); C.tick(dt); }
/* sidik jari keadaan: sama persis bila seed, durasi & langkah sama (untuk membuktikan simulasi bisa diulang) */
function simFingerprint(){ let h=''; for(const t of Store.tables.trucks.values()) h+=t.id+t.state+t.pos.x.toFixed(2)+t.pos.z.toFixed(2)+t.done; for(const f of Store.tables.forklifts.values()) h+=f.pos.x.toFixed(2)+f.pos.z.toFixed(2); return strHash(h).toString(16); }
