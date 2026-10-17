
/* ==========================================================================
   LAPISAN 3 · TAMPILAN 3D (View3D) — hanya MEMBACA Store
   ========================================================================== */
const View={spinners:[],vapor:[],clutter:[],lampPts:[],nightMats:[],barriers:[],trucks:new Map(),forks:new Map(),people:new Map(),docks:new Map(),slots:new Map(),pallets:new Map(),cars:new Map(),signals:new Map(),sites:new Map(),pickables:[],holds:[]};
/* ---------- renderer ---------- */
await Promise.race([document.fonts.ready, new Promise(r=>setTimeout(r,1500))]);
if(!window.THREE){ $('#loading').textContent='Gagal memuat mesin 3D. Muat ulang halaman.'; return; }
const canvas = $('#scene');
const renderer = new THREE.WebGLRenderer({canvas, antialias:true});
const LOWP=matchMedia('(pointer: coarse)').matches||innerWidth<820||(navigator.hardwareConcurrency||8)<=4;
renderer.setPixelRatio(Math.min(devicePixelRatio,LOWP?1.5:2));
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(26,1,1,1200);
const isMobile = () => innerWidth <= 820;
function resize(){ const w=innerWidth,h=innerHeight; renderer.setSize(w,h,false); canvas.style.width=w+'px'; canvas.style.height=h+'px'; camera.aspect=w/h; camera.updateProjectionMatrix(); }
resize(); addEventListener('resize',resize);
const C = h => new THREE.Color(h).convertSRGBToLinear();
const hemi = new THREE.HemisphereLight(0xffffff,0xffffff,0.56); hemi.groundColor=C(0xBFC8EA); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffffff,0.86);
sun.castShadow=true; sun.shadow.mapSize.set(LOWP?1024:2048,LOWP?1024:2048);
Object.assign(sun.shadow.camera,{left:-40,right:40,top:40,bottom:-40,near:1,far:200});
sun.shadow.bias=-0.0005; sun.shadow.normalBias=0.03; sun.shadow.radius=LOWP?2:3.5;
scene.add(sun); scene.add(sun.target);
const fill = new THREE.DirectionalLight(0xffffff,0.2); fill.position.set(30,18,-14); scene.add(fill);

let SUN_OFF=[-26,50,20];
const cam = {theta:-Math.PI/4, thetaGoal:-Math.PI/4, phi:0.66, zoom:1, zoomGoal:1, target:new THREE.Vector3(), goal:new THREE.Vector3(), fly:false, flight:null};
let shadowHalf=40;
function applyCam(){
  const dist=82/cam.zoom, c=Math.cos(cam.phi);
  camera.position.set(cam.target.x+Math.sin(cam.theta)*c*dist, Math.sin(cam.phi)*dist, cam.target.z+Math.cos(cam.theta)*c*dist);
  camera.lookAt(cam.target.x,0,cam.target.z);
  sun.position.set(cam.target.x+SUN_OFF[0],SUN_OFF[1],cam.target.z+SUN_OFF[2]); sun.target.position.set(cam.target.x,0,cam.target.z);
  const want=clamp(dist*0.5,26,80);
  if(Math.abs(want-shadowHalf)>3){ shadowHalf=want; Object.assign(sun.shadow.camera,{left:-want,right:want,top:want,bottom:-want}); sun.shadow.camera.updateProjectionMatrix(); }
}

/* ---------- geometry ---------- */
const geoC={};
function gR(w,h,d,r,forceS){
  r=Math.min(r,w/2-0.001,h/2-0.001,d/2-0.001); if(!(r>0.006)) r=0;
  const k=[w,h,d,r,forceS||0].map(n=>(+n).toFixed(3)).join('|'); if(geoC[k]) return geoC[k];
  if(!r) return geoC[k]=new THREE.BoxGeometry(w,h,d);
  const S=forceS||(r>=0.12?5:3), g=new THREE.BoxGeometry(w,h,d,S,S,S), p=g.attributes.position, n=g.attributes.normal, uv=g.attributes.uv;
  const tbl=sz=>{const q=sz/2; return S===5?[-q,-q+.586*r,-q+r,q-r,q-.586*r,q]:[-q,-q+r,q-r,q];};
  const tx=tbl(w),ty=tbl(h),tz=tbl(d), hw=w/2-r,hh=h/2-r,hd=d/2-r;
  const ix=(c,sz)=>clamp(Math.round((c/sz+0.5)*S),0,S);
  const v=new THREE.Vector3(), inn=new THREE.Vector3();
  for(let i=0;i<p.count;i++){
    const ax=Math.abs(n.getX(i))>.5?0:Math.abs(n.getY(i))>.5?1:2;
    const su=ax===0?d:w, sv=ax===1?d:h, tu=ax===0?tz:tx, tv=ax===1?tz:ty;
    uv.setXY(i,(tu[clamp(Math.round(uv.getX(i)*S),0,S)]+su/2)/su,(tv[clamp(Math.round(uv.getY(i)*S),0,S)]+sv/2)/sv);
    v.set(tx[ix(p.getX(i),w)],ty[ix(p.getY(i),h)],tz[ix(p.getZ(i),d)]);
    inn.set(clamp(v.x,-hw,hw),clamp(v.y,-hh,hh),clamp(v.z,-hd,hd));
    v.sub(inn); v.divideScalar(v.length()||1);
    n.setXYZ(i,v.x,v.y,v.z); p.setXYZ(i,inn.x+v.x*r,inn.y+v.y*r,inn.z+v.z*r);
  }
  return geoC[k]=g;
}
const gCache={};
const memo=(k,f)=>gCache[k]||(gCache[k]=f());
const gCyl=(r,h,s=14)=>memo('c'+r+'|'+h+'|'+s,()=>new THREE.CylinderGeometry(r,r,h,s));
const gCone=(r,h,s=20)=>memo('k'+r+'|'+h+'|'+s,()=>new THREE.ConeGeometry(r,h,s));
const gSph=(r,s=14)=>memo('s'+r+'|'+s,()=>new THREE.SphereGeometry(r,s,Math.round(s*0.75)));
const gHemi=(r,s=14)=>memo('h'+r+'|'+s,()=>new THREE.SphereGeometry(r,s,Math.round(s/2),0,Math.PI*2,0,Math.PI/2));
function gCap(r,len,seg=8){ return memo('cap'+r+'|'+len,()=>{const pts=[];
  for(let i=0;i<=seg;i++){const a=-Math.PI/2+i/seg*Math.PI/2; pts.push(new THREE.Vector2(Math.max(1e-4,Math.cos(a)*r),-len/2+Math.sin(a)*r));}
  for(let i=0;i<=seg;i++){const a=i/seg*Math.PI/2; pts.push(new THREE.Vector2(Math.max(1e-4,Math.cos(a)*r),len/2+Math.sin(a)*r));}
  return new THREE.LatheGeometry(pts,12);}); }
function gTire(R,ri,w,c=0.09){ return memo('tire'+R+'|'+w,()=>{const pts=[], h=w/2;
  pts.push(new THREE.Vector2(ri,-h));
  for(let i=0;i<=6;i++){const a=-Math.PI/2+i/6*Math.PI/2; pts.push(new THREE.Vector2(R-c+Math.cos(a)*c,-h+c+Math.sin(a)*c));}
  for(let i=0;i<=6;i++){const a=i/6*Math.PI/2; pts.push(new THREE.Vector2(R-c+Math.cos(a)*c,h-c+Math.sin(a)*c));}
  pts.push(new THREE.Vector2(ri,h));
  const g=new THREE.LatheGeometry(pts,18); g.rotateZ(Math.PI/2); return g;}); }
const gWheelLo=()=>memo('wlo',()=>{const g=new THREE.CylinderGeometry(0.32,0.32,0.24,10); g.rotateZ(Math.PI/2); return g;});
const gRim=(r,w)=>memo('rim'+r+'|'+w,()=>{const g=new THREE.CylinderGeometry(r,r,w,16); g.rotateZ(Math.PI/2); return g;});

/* ---------- materials ---------- */
const matC={};
function M(c,rough=.7,em){const k=c+'|'+rough+'|'+em; if(matC[k]) return matC[k];
  const m=new THREE.MeshStandardMaterial({roughness:rough,metalness:0}); m.color=C(c); if(em!=null) m.emissive=C(em); return matC[k]=m;}
const LAMP=[M(0x22C55E,.4,0x16A34A),M(0xF59E0B,.4,0xD97706)];
function RB(p,w,h,d,r,mat,x,y,z,o){o=o||{};const m=new THREE.Mesh(gR(w,h,d,r),typeof mat==='number'?M(mat):mat);m.position.set(x,y,z);
  if(o.rx)m.rotation.x=o.rx; if(o.ry)m.rotation.y=o.ry; if(o.rz)m.rotation.z=o.rz; m.castShadow=o.cast!==false; m.receiveShadow=true; p.add(m); return m;}
const vcC={}; const vcMat=(r,map)=>{const k=r+'|'+(map?map.uuid:'');return vcC[k]||(vcC[k]=new THREE.MeshStandardMaterial({vertexColors:true,roughness:r,metalness:0,map:map||null}));};
const _e=new THREE.Euler(), _q=new THREE.Quaternion(), _v=new THREE.Vector3(), _s=new THREE.Vector3();
class Parts{
  constructor(){this.l=[];}
  add(geo,color,x,y,z,ry=0,sx=1,sy=1,sz=1,rx=0,rz=0,su=1,sv=1,uvc=null){
    _e.set(rx,ry,rz); _q.setFromEuler(_e);
    const m=new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),_q.clone(),new THREE.Vector3(sx,sy,sz));
    this.l.push({geo,c:C(color),m,su,sv,uvc}); return this;}
  boxc(w,h,d,r,color,x,y,z,uvc,ry=0){return this.add(gR(w,h,d,r),color,x,y,z,ry,1,1,1,0,0,1,1,uvc);}
  geometry(){ return this.build().geometry; }
  box(w,h,d,r,color,x,y,z,ry=0){return this.add(gR(w,h,d,r),color,x,y,z,ry);}
  get empty(){return !this.l.length;}
  build(rough=.75,cast=true,map=null){
    let nv=0,ni=0; for(const p of this.l){nv+=p.geo.attributes.position.count; ni+=p.geo.index?p.geo.index.count:p.geo.attributes.position.count;}
    const pos=new Float32Array(nv*3),nor=new Float32Array(nv*3),col=new Float32Array(nv*3),uvs=new Float32Array(nv*2),ind=new Uint32Array(ni);
    let vo=0,io=0; const v=new THREE.Vector3(), nm=new THREE.Matrix3();
    for(const p of this.l){
      const P=p.geo.attributes.position,N=p.geo.attributes.normal,U=p.geo.attributes.uv; nm.getNormalMatrix(p.m);
      for(let i=0;i<P.count;i++){const o=(vo+i)*3;
        v.fromBufferAttribute(P,i).applyMatrix4(p.m); pos[o]=v.x;pos[o+1]=v.y;pos[o+2]=v.z;
        v.fromBufferAttribute(N,i).applyMatrix3(nm).normalize(); nor[o]=v.x;nor[o+1]=v.y;nor[o+2]=v.z;
        col[o]=p.c.r;col[o+1]=p.c.g;col[o+2]=p.c.b;
        if(p.uvc){uvs[(vo+i)*2]=p.uvc[0]; uvs[(vo+i)*2+1]=p.uvc[1];} else if(U){uvs[(vo+i)*2]=U.getX(i)*p.su; uvs[(vo+i)*2+1]=U.getY(i)*p.sv;}}
      if(p.geo.index){const I=p.geo.index;for(let i=0;i<I.count;i++)ind[io+i]=I.getX(i)+vo;io+=I.count;}
      else{for(let i=0;i<P.count;i++)ind[io+i]=vo+i;io+=P.count;}
      vo+=P.count;
    }
    const g=new THREE.BufferGeometry();
    g.setAttribute('position',new THREE.BufferAttribute(pos,3)); g.setAttribute('normal',new THREE.BufferAttribute(nor,3));
    g.setAttribute('color',new THREE.BufferAttribute(col,3)); g.setAttribute('uv',new THREE.BufferAttribute(uvs,2)); g.setIndex(new THREE.BufferAttribute(ind,1));
    g.computeBoundingSphere();
    const m=new THREE.Mesh(g,vcMat(rough,map)); m.castShadow=cast; m.receiveShadow=true; return m;
  }
}
/* ---------- instancing: satu draw call untuk banyak objek sejenis ---------- */
const _hide=new THREE.Matrix4().makeScale(0,0,0), _mA=new THREE.Matrix4(), _cA=new THREE.Color();
const POOLS=[]; let SIGPOOL=null;
class InstPool{
  constructor(geo,mat,max,opts={}){ const m=new THREE.InstancedMesh(geo,mat,max); m.count=max; for(let i=0;i<max;i++) m.setMatrixAt(i,_hide);
    if(opts.color){ m.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(max*3).fill(1),3); }
    m.castShadow=opts.cast!==false; m.receiveShadow=opts.receive!==false; m.frustumCulled=false; if(opts.order) m.renderOrder=opts.order;
    m.count=0; this.mesh=m; this.max=max; this.n=0; this.free=[]; scene.add(m); POOLS.push(this); }
  alloc(){ if(this.free.length) return this.free.pop(); if(this.n>=this.max) return -1; const i=this.n++; this.mesh.count=this.n; return i; }
  release(i){ if(i<0) return; this.mesh.setMatrixAt(i,_hide); this.free.push(i); this.dirty=true; }
  set(i,m){ if(i<0) return; this.mesh.setMatrixAt(i,m); this.dirty=true; }
  color(i,c){ if(i<0||!this.mesh.instanceColor) return; this.mesh.setColorAt(i,_cA.set(c).convertSRGBToLinear()); this.cdirty=true; }
  flush(){ if(this.dirty){ this.mesh.instanceMatrix.needsUpdate=true; this.dirty=false; } if(this.cdirty){ this.mesh.instanceColor.needsUpdate=true; this.cdirty=false; } }
}
const flushPools=()=>{ for(const p of POOLS) p.flush(); };
const stdMat=(rough=.7,vc=false)=>new THREE.MeshStandardMaterial({roughness:rough,metalness:0,vertexColors:vc});
function canvasTex(w,h,draw){const cv=document.createElement('canvas');cv.width=w;cv.height=h;draw(cv.getContext('2d'),w,h);
  const t=new THREE.CanvasTexture(cv);t.anisotropy=8;t.encoding=THREE.sRGBEncoding;return t;}
function rr(x,X,Y,W,H,R){x.beginPath();x.moveTo(X+R,Y);x.arcTo(X+W,Y,X+W,Y+H,R);x.arcTo(X+W,Y+H,X,Y+H,R);x.arcTo(X,Y+H,X,Y,R);x.arcTo(X,Y,X+W,Y,R);x.closePath();}
const ribC={};
function ribMat(base,rib,rep,rough=.7){const k=base+rib+rep.toFixed(1);if(ribC[k])return ribC[k];
  const t=canvasTex(64,8,(x,w,h)=>{x.fillStyle=base;x.fillRect(0,0,w,h);x.fillStyle=rib;x.fillRect(0,0,14,h);x.globalAlpha=.5;x.fillRect(14,0,4,h);x.globalAlpha=1;x.fillStyle='rgba(255,255,255,.35)';x.fillRect(40,0,6,h);});
  t.wrapS=THREE.RepeatWrapping;t.repeat.set(Math.max(1,rep),1);return ribC[k]=new THREE.MeshStandardMaterial({map:t,roughness:rough});}
const doorMat=new THREE.MeshStandardMaterial({roughness:.6,map:canvasTex(64,128,(x,w,h)=>{x.fillStyle='#E9EDF8';x.fillRect(0,0,w,h);x.fillStyle='#CCD4EC';for(let y=6;y<h;y+=11)x.fillRect(0,y,w,2);})});
const trailerDoorTex=canvasTex(64,128,(x,w,h)=>{x.fillStyle='#E9EDF7';x.fillRect(0,0,w,h);x.fillStyle='#B9C2DC';x.fillRect(18,6,5,h-12);x.fillRect(42,6,5,h-12);x.fillStyle='#D3DAEC';x.fillRect(0,0,w,4);x.fillRect(0,h-4,w,4);});
const trailC={};
/* peta pantulan lingkungan (gradien langit→tanah) untuk cat kendaraan yang mengilap */
let VEH_ENV=null;
function vehEnv(){ if(VEH_ENV) return VEH_ENV;
  const t=canvasTex(256,128,(x,w,h)=>{ const g=x.createLinearGradient(0,0,0,h); g.addColorStop(0,'#FFFFFF'); g.addColorStop(0.42,'#EEF1FF'); g.addColorStop(0.5,'#C9D2F2'); g.addColorStop(0.62,'#A9B4E0'); g.addColorStop(1,'#8E9AD0'); x.fillStyle=g; x.fillRect(0,0,w,h);
    x.fillStyle='rgba(255,255,255,.95)'; x.fillRect(w*0.18,h*0.12,w*0.16,h*0.16); x.fillRect(w*0.62,h*0.18,w*0.1,h*0.1); });
  t.mapping=THREE.EquirectangularReflectionMapping; const pm=new THREE.PMREMGenerator(renderer); VEH_ENV=pm.fromEquirectangular(t).texture; pm.dispose(); return VEH_ENV; }
const gloss=(m,r=0.3,i=0.75)=>{ m.envMap=vehEnv(); m.envMapIntensity=i; m.roughness=r; m.metalness=0.05; return m; };
function trailerTex(car){if(trailC[car.name])return trailC[car.name];
  return trailC[car.name]=canvasTex(640,256,(x,w,h)=>{x.fillStyle='#F8F9FD';x.fillRect(0,0,w,h);
    { const gr=x.createLinearGradient(0,0,w,0); gr.addColorStop(0,car.cs); gr.addColorStop(1,car.cs); x.fillStyle=gr;
      x.beginPath(); x.moveTo(0,256); x.lineTo(0,200); x.bezierCurveTo(w*0.3,206,w*0.62,176,w,138); x.lineTo(w,256); x.closePath(); x.fill();
      x.globalAlpha=.28; x.beginPath(); x.moveTo(0,192); x.bezierCurveTo(w*0.3,198,w*0.62,166,w,126); x.lineTo(w,136); x.bezierCurveTo(w*0.62,174,w*0.3,204,0,198); x.closePath(); x.fill(); x.globalAlpha=1; }
    rr(x,40,50,64,64,14);x.fill();x.strokeStyle='#fff';x.lineWidth=7;x.lineCap='round';x.lineJoin='round';
    x.beginPath();x.moveTo(54,86);x.lineTo(72,71);x.lineTo(90,86);x.stroke();x.beginPath();x.moveTo(59,99);x.lineTo(85,99);x.stroke();
    x.fillStyle=car.cs;x.font='800 54px "Plus Jakarta Sans", system-ui, sans-serif';x.textBaseline='middle';x.fillText(car.name,122,78);
    x.fillStyle='#8B93B4';x.font='600 22px "Plus Jakarta Sans", system-ui, sans-serif';x.fillText('Kirim cepat, sampai tepat',124,120);
    x.fillStyle='rgba(255,255,255,.85)';x.font='700 20px "Plus Jakarta Sans", system-ui, sans-serif';x.fillText('lumbung.id/lacak',40,222);});}
const windowTex=(()=>{const t=canvasTex(64,64,(x,w,h)=>{x.fillStyle='#F4F6FC';x.fillRect(0,0,w,h);const g=x.createLinearGradient(0,10,0,48);g.addColorStop(0,'#A9BCEB');g.addColorStop(1,'#8FA6E0');x.fillStyle=g;rr(x,10,12,44,34,4);x.fill();x.fillStyle='rgba(255,255,255,.35)';x.fillRect(12,14,14,30);});
  t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;})();
const blobTex=canvasTex(128,128,(x)=>{const g=x.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'rgba(38,50,110,.5)');g.addColorStop(.5,'rgba(38,50,110,.24)');g.addColorStop(1,'rgba(38,50,110,0)');x.fillStyle=g;x.fillRect(0,0,128,128);});
const rectTex=canvasTex(256,256,(x)=>{x.shadowColor='rgba(38,50,110,.55)';x.shadowBlur=34;x.shadowOffsetX=1000;x.fillStyle='#000';x.fillRect(46-1000,46,164,164);});
const glowTex=canvasTex(128,128,(x)=>{const g=x.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'rgba(46,91,255,.55)');g.addColorStop(.6,'rgba(46,91,255,.2)');g.addColorStop(1,'rgba(46,91,255,0)');x.fillStyle=g;x.fillRect(0,0,128,128);});
const blobC={};
const blobMat=(op,rect)=>{const k=op+'|'+!!rect;return blobC[k]||(blobC[k]=new THREE.MeshBasicMaterial({map:rect?rectTex:blobTex,transparent:true,depthWrite:false,opacity:op,polygonOffset:true,polygonOffsetFactor:-2}));};
const planeG=new THREE.PlaneGeometry(1,1).rotateX(-Math.PI/2);
function blob(p,w,d,x,z,op=1,rect,y=GY+0.02){const m=new THREE.Mesh(planeG,blobMat(op,rect));m.scale.set(w,1,d);m.position.set(x,y,z);m.renderOrder=1;p.add(m);return m;}
class BlobBatch{ constructor(){this.l=[];} add(w,d,x,z,y=GY+0.02,rect){this.l.push([w,d,x,z,y,rect]);}
  build(p){ for(const rect of [false,true]){ const items=this.l.filter(b=>!!b[5]===rect); if(!items.length) continue;
    const pos=[],uv=[],ind=[]; items.forEach((b,i)=>{const [w,d,x,z,y]=b;pos.push(x-w/2,y,z-d/2, x+w/2,y,z-d/2, x+w/2,y,z+d/2, x-w/2,y,z+d/2);uv.push(0,0,1,0,1,1,0,1);const o=i*4;ind.push(o,o+2,o+1,o,o+3,o+2);});
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(ind);g.computeBoundingSphere();
    const m=new THREE.Mesh(g,blobMat(rect?1:.5,rect));m.renderOrder=1;p.add(m);} } }
function plateTex(text,bg='#16224D'){ return canvasTex(96,80,(x,w,h)=>{ x.fillStyle=bg; rr(x,3,3,w-6,h-6,10); x.fill(); x.strokeStyle='rgba(255,255,255,.35)'; x.lineWidth=3; rr(x,9,9,w-18,h-18,6); x.stroke(); x.fillStyle='#fff'; x.font='800 40px "Plus Jakarta Sans", system-ui, sans-serif'; x.textAlign='center'; x.textBaseline='middle'; x.fillText(text,w/2,h/2+2); }); }
function labelTex(text,bg,fg,w=128,h=80){return canvasTex(w,h,(x)=>{if(bg){x.fillStyle=bg;rr(x,4,4,w-8,h-8,14);x.fill();}x.fillStyle=fg;x.font=`800 ${Math.round(h*0.5)}px "Plus Jakarta Sans", system-ui, sans-serif`;x.textAlign='center';x.textBaseline='middle';x.fillText(text,w/2,h/2+2);});}
function decal(p,tex,w,h,x,y,z,ry=0,rx=0){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tex,transparent:true}));m.position.set(x,y,z);m.rotation.set(rx,ry,0);p.add(m);return m;}
function roofDecal(id){return canvasTex(256,320,(x)=>{x.fillStyle='rgba(255,255,255,.95)';x.beginPath();x.arc(128,118,100,0,Math.PI*2);x.fill();
  x.strokeStyle='#2E5BFF';x.lineWidth=18;x.lineCap='round';x.lineJoin='round';x.beginPath();x.moveTo(70,116);x.lineTo(128,74);x.lineTo(186,116);x.stroke();
  x.beginPath();x.moveTo(90,146);x.lineTo(166,146);x.moveTo(90,176);x.lineTo(166,176);x.stroke();
  x.fillStyle='#fff';x.font='800 50px "Plus Jakarta Sans", system-ui, sans-serif';x.textAlign='center';x.fillText(id,128,290);});}
function signTex(id,name){return canvasTex(512,160,(x,w,h)=>{x.fillStyle='#FFFFFF';rr(x,4,4,w-8,h-8,18);x.fill();x.fillStyle='#2E5BFF';rr(x,24,30,100,100,22);x.fill();
  x.strokeStyle='#fff';x.lineWidth=10;x.lineCap='round';x.lineJoin='round';x.beginPath();x.moveTo(46,82);x.lineTo(74,60);x.lineTo(102,82);x.stroke();x.beginPath();x.moveTo(54,104);x.lineTo(94,104);x.stroke();
  x.fillStyle='#17204A';x.font='800 46px "Plus Jakarta Sans", system-ui, sans-serif';x.textBaseline='middle';x.fillText('Lumbung',146,64);
  x.fillStyle='#56608A';x.font='600 26px "Plus Jakarta Sans", system-ui, sans-serif';x.fillText(id+' · '+name,148,112);});}

/* ---------- models (hemat draw call) ---------- */
function axleGeo(xo,R=0.42,w=0.32){ return memo('axle'+xo+'|'+R+'|'+w,()=>{ const P=new Parts();
  for(const s of [-1,1]){ P.add(gTire(R,R*0.6,w),0x23262F,s*xo,0,0); P.add(gRim(R*0.6,w*0.86),0xCDD3E3,s*xo,0,0); P.add(gRim(R*0.22,w*0.96),0x7D869E,s*xo,0,0);
    for(let k=0;k<5;k++){ const a=k/5*Math.PI*2; P.add(gR(0.04,R*0.36,0.06,0),0x9AA3BA,s*(xo+w*0.44),Math.cos(a)*R*0.38,Math.sin(a)*R*0.38,0,1,1,1,-a,0); } }
  return P.geometry(); }); }
function makeAxle(xo,R,w,mat){ const ax=new THREE.Group(), spin=new THREE.Mesh(axleGeo(xo,R,w),mat); spin.castShadow=true; ax.add(spin); ax.userData.spin=spin; return ax; }
function cloneMats(root,skip){
  const map=new Map(), list=[];
  const cl=m=>{ if(!map.has(m)){ const c=m.clone(); map.set(m,c); list.push(c);} return map.get(m); };
  root.traverse(o=>{ if(!o.isMesh||(skip&&skip(o))) return; o.material=Array.isArray(o.material)?o.material.map(cl):cl(o.material); });
  return list;
}
const WHITE_UV=[0.03,0.97];
function truckBodyGeo(car){ return memo('truckbody'+car.name,()=>{
  const P=new Parts(), cab=car.cab, dk=0x2A2E3A, gl=0x1B2340, W=WHITE_UV, b=(w,h,d,r,c,x,y,z,ry=0)=>P.boxc(w,h,d,r,c,x,y,z,W,ry);
  b(1.22,0.28,6.0,0.08,dk,0,0.62,0.0);
  /* kabin cab-over kotak: kaca depan besar, gril gelap, bemper tebal */
  b(2.0,1.72,1.56,0.2,cab,0,1.5,2.62);
  b(1.9,0.12,1.4,0.06,cab,0,2.4,2.58);
  b(1.86,0.8,0.06,0.1,gl,0,1.86,3.39);
  for(const s of [-1,1]){ b(0.06,0.74,1.02,0.08,gl,s*1.0,1.86,2.78); b(0.06,0.06,1.06,0,0xF2F4FA,s*1.01,1.48,2.78);
    b(0.34,0.2,0.06,0.04,0xF5F7FF,s*0.72,1.0,3.41); b(0.14,0.14,0.05,0.03,0xFFB21A,s*0.92,1.0,3.41);
    b(0.08,0.4,0.16,0.04,dk,s*1.1,1.9,3.1); b(0.18,0.04,0.04,0,dk,s*1.04,1.76,3.1);
    b(0.34,0.12,0.9,0.06,dk,s*0.85,0.96,2.72); b(0.4,0.1,1.9,0.05,dk,s*0.81,0.9,-1.96);
    b(0.3,0.34,0.76,0.15,0xC3CADC,s*0.78,0.72,1.35); b(0.22,0.05,0.4,0.03,0x3A3F4E,s*0.99,0.58,2.4); b(0.2,0.12,0.05,0.03,0xE5484D,s*0.82,0.82,-3.24); }
  b(0.98,0.44,0.06,0.05,0x22262F,0,1.08,3.41); for(const y of [0.94,1.04,1.14,1.24]) b(0.88,0.035,0.03,0,0x5A6178,0,y,3.45);
  b(0.5,0.08,0.04,0.02,0xF5F7FF,0,1.42,3.42);
  b(2.08,0.34,0.3,0.12,0xDCE1EE,0,0.68,3.42); b(1.2,0.08,0.04,0,0x9AA3BA,0,0.62,3.58); b(1.96,0.14,0.16,0.05,0x3A3F4E,0,0.7,-3.18); b(1.98,0.18,4.95,0.05,0xCBD2E5,0,0.86,-0.725);
  /* trailer berongga: dinding putih + panel grafis di sisi luar */
  b(0.06,2.45,4.95,0,0xF7F8FC,0.96,2.175,-0.725); b(0.06,2.45,4.95,0,0xF7F8FC,-0.96,2.175,-0.725);
  b(0.05,2.43,4.9,0,0xD3D9E9,0.92,2.175,-0.725); b(0.05,2.43,4.9,0,0xD3D9E9,-0.92,2.175,-0.725);
  b(1.98,0.09,4.95,0.04,0xF7F8FC,0,3.44,-0.725); b(1.98,2.45,0.07,0.03,0xF7F8FC,0,2.175,1.7);
  for(const s of [-1,1]) b(0.09,2.55,0.1,0.03,0xB9C1D8,s*0.96,2.195,-3.17); b(1.98,0.12,0.1,0.03,0xB9C1D8,0,3.45,-3.17);
  const pl=new THREE.PlaneGeometry(4.9,2.41);
  P.add(pl,0xFFFFFF,0.992,2.175,-0.725,Math.PI/2); P.add(pl,0xFFFFFF,-0.992,2.175,-0.725,-Math.PI/2);
  return P.geometry(); }); }
function makeTruck(car,opts={}){
  const g=new THREE.Group();
  const bodyMat=gloss(new THREE.MeshStandardMaterial({map:trailerTex(car),vertexColors:true}),0.32,0.8);
  const body=new THREE.Mesh(truckBodyGeo(car),bodyMat); body.castShadow=true; body.receiveShadow=true; g.add(body);
  const doorMatT=gloss(new THREE.MeshStandardMaterial({map:trailerDoorTex}),0.36,0.7);
  const doors=[];
  for(const s of [1,-1]){ const piv=new THREE.Group(); piv.position.set(s*1.0,2.175,-3.2); g.add(piv);
    const d=new THREE.Mesh(gR(0.97,2.45,0.05,0),doorMatT); d.position.set(-s*0.485,0,-0.03); d.castShadow=true; piv.add(d); piv.userData.s=s; doors.push(piv); }
  const cabPiv=new THREE.Group(); cabPiv.position.set(-1.045,0,3.2); g.add(cabPiv);
  { const DP=new Parts(); DP.box(0.05,0.82,0.98,0.03,car.cab,0,1.12,-0.5); DP.box(0.055,0.62,0.86,0.04,0x1B2340,0,1.86,-0.46); DP.box(0.06,0.06,0.2,0.02,0x2A2E3A,-0.02,1.32,-0.82);
    const dm=DP.build(.4); gloss(dm.material,0.3,0.8); dm.castShadow=true; cabPiv.add(dm); }
  const wm=gloss(new THREE.MeshStandardMaterial({vertexColors:true}),0.45,0.5);
  const front=makeAxle(0.82,0.42,0.32,wm), steer=new THREE.Group(); steer.position.set(0,0.42,2.72); steer.add(front); g.add(steer);
  const axles=[front];
  for(const z of [-1.5,-2.42]){ const a=makeAxle(0.82,0.42,0.32,wm); a.position.set(0,0.42,z); g.add(a); axles.push(a); }
  if(opts.reefer){ const RP=new Parts(); RP.box(1.66,0.72,0.5,0.1,0xDDE3F0,0,3.0,1.95); RP.box(1.4,0.56,0.04,0.03,0x2B3247,0,3.0,2.21);
    for(const fx of [-0.36,0.36]){ RP.add(gCyl(0.22,0.03,16),0x5A6178,fx,3.0,2.24,0,1,1,1,Math.PI/2,0); RP.add(gCyl(0.07,0.04,8),0xC7CFE6,fx,3.0,2.25,0,1,1,1,Math.PI/2,0); }
    RP.box(1.66,0.1,0.5,0.03,0x2E5BFF,0,3.38,1.95); const rm=RP.build(.4); rm.castShadow=true; g.add(rm); }
  blob(g,3.0,7.8,0,0,1);
  const mats=cloneMats(g);
  return {g,mats,doors,steer,axles,cabPiv};
}
/* bodi forklift (dipakai forklift aktif & forklift parkir): pemberat kuning besar, rangka biru, atap pelindung berkisi, sopir */
function forkParts(P,x0,z0,ry,decor,o={}){
  const cs=Math.cos(ry), sn=Math.sin(ry), Y=o.body??0xF6B90A, Y2=o.body2??0xFFC93A, BL=o.chassis??0x2E5BE6, K=0x23262F, V=o.vest??0xF26B1D, HT=o.hat??0xF6C40A, SK=o.skin??0xF0C29C, drv=o.driver!==false;
  const put=(geo,col,lx,ly,lz,rx=0)=>P.add(geo,col,x0+lx*cs+lz*sn,ly,z0-lx*sn+lz*cs,ry,1,1,1,rx,0);
  const box=(w,h,d,r,col,lx,ly,lz,rx=0)=>put(gR(w,h,d,r),col,lx,ly,lz,rx);
  box(0.94,0.3,1.46,0.1,BL,0,0.34,0.0); box(1.0,0.66,0.8,0.22,Y,0,0.8,-0.42); box(0.9,0.12,0.7,0.06,Y2,0,1.15,-0.44);
  box(0.92,0.28,0.42,0.12,Y,0,0.62,0.44); box(0.3,0.1,0.2,0.04,0xF5F7FF,0.3,0.62,0.66); box(0.3,0.1,0.2,0.04,0xF5F7FF,-0.3,0.62,0.66);
  if(!o.agv){ box(0.46,0.12,0.42,0.05,K,0,0.98,-0.1); box(0.46,0.44,0.1,0.04,K,0,1.22,-0.3); }
  if(drv&&!o.agv){ put(gCap(0.17,0.24),V,0,1.38,-0.1); put(gCyl(0.172,0.04,12),0xE8EDF8,0,1.33,-0.1);
    put(gSph(0.13,12),SK,0,1.74,-0.06); put(gHemi(0.152),HT,0,1.78,-0.06); put(gCyl(0.19,0.02,12),HT,0,1.78,-0.03);
    for(const s of [-1,1]) put(gCap(0.055,0.28),V,s*0.2,1.32,0.08,-0.9); }
  if(!o.agv) put(gCyl(0.13,0.035,12),K,0,1.18,0.22,-1.0);
  if(o.agv){ box(0.86,0.5,0.62,0.12,Y,0,1.2,-0.38); box(0.88,0.06,0.64,0.02,0x2E5BFF,0,1.47,-0.38); put(gCyl(0.12,0.14,14),K,0,1.56,-0.38); put(gCyl(0.13,0.03,14),0x5C86FF,0,1.64,-0.38);
    box(0.6,0.05,0.04,0.01,0x60A5FA,0,0.78,0.66); }
  else { for(const [x,z] of [[0.41,0.34],[-0.41,0.34],[0.41,-0.66],[-0.41,-0.66]]) box(0.07,1.28,0.07,0.03,K,x,1.44,z);
    box(0.9,0.06,1.08,0.03,K,0,2.08,-0.16); for(let i=0;i<5;i++) box(0.84,0.04,0.06,0,0x3A3F4E,0,2.12,-0.6+i*0.22);
    box(0.12,0.1,0.12,0.04,0xFF9F1A,0.3,2.18,-0.6); }
  box(0.1,2.0,0.1,0.035,K,0.3,1.04,0.7); box(0.1,2.0,0.1,0.035,K,-0.3,1.04,0.7); box(0.7,0.08,0.1,0.03,K,0,2.02,0.7);
  if(decor){ box(0.7,0.36,0.06,0.03,K,0,0.3,0.78); box(0.1,0.04,0.95,0.015,0x3A3F4E,0.2,0.06,1.22); box(0.1,0.04,0.95,0.015,0x3A3F4E,-0.2,0.06,1.22);
    for(const [x,z,r] of [[0.44,0.36,0.24],[-0.44,0.36,0.24],[0.44,-0.56,0.21],[-0.44,-0.56,0.21]]) put(gTire(r,r*0.55,0.2),K,x,r,z); }
}
const FORK_LOOK={general:[{vest:0xF26B1D,hat:0xF6C40A},{vest:0x8BD12A,hat:0xFFFFFF}],crossdock:[{vest:0xF26B1D,hat:0xF6C40A},{vest:0x8BD12A,hat:0xFFFFFF}],
  dc:[{vest:0x7C3AED,hat:0xFFFFFF},{vest:0x5B21B6,hat:0x8BD12A}],cold:[{vest:0x1E40AF,hat:0xFFFFFF},{vest:0x13296B,hat:0x8BD12A}],
  robotic:[{agv:true,body:0xF4F6FB,body2:0xE2E8F0,chassis:0x2E5BFF},{agv:true,body:0xF4F6FB,body2:0xE2E8F0,chassis:0x2E5BFF}]};
function makeForklift(profile='general'){
  const g=new THREE.Group(), P=new Parts(), K=0x2B2F3A, L=FORK_LOOK[profile]||FORK_LOOK.general;
  forkParts(P,0,0,0,false,L[0]);
  const day=P.build(.5); gloss(day.material,0.34,0.7); g.add(day);
  const PN=new Parts(); forkParts(PN,0,0,0,false,{...L[1],skin:0xD9A57B}); const night=PN.build(.5); night.material=day.material; night.visible=false; g.add(night);
  const beacon=new THREE.Mesh(gSph(0.075,10),new THREE.MeshStandardMaterial({color:C(0xFF9F1A),emissive:C(0xFF8A00),emissiveIntensity:0.4,roughness:.3})); beacon.position.set(0.3,2.27,-0.6); if(profile==='robotic') beacon.position.set(0,1.72,-0.38); g.add(beacon);
  const car=new THREE.Group(); g.add(car);
  const CP=new Parts(); CP.box(0.7,0.36,0.06,0.03,K,0,0.26,0.74); CP.box(0.7,0.05,0.05,0.02,K,0,0.44,0.74);
  CP.box(0.1,0.04,0.95,0.015,0x3A3F4E,0.2,0.04,1.18); CP.box(0.1,0.04,0.95,0.015,0x3A3F4E,-0.2,0.04,1.18);
  car.add(CP.build(.5));
  const wm=vcMat(.6);
  const a1=makeAxle(0.42,0.22,0.2,wm); a1.position.set(0,0.22,0.36); g.add(a1);
  const rs=new THREE.Group(); rs.position.set(0,0.22,-0.56); g.add(rs); const a2=makeAxle(0.42,0.2,0.18,wm); rs.add(a2);
  blob(g,1.7,2.5,0,0.1,0.85);
  return {g,car,axles:[a1,a2],rsteer:rs,beacon,day,night};
}
/* ---------- palet ber-instancing: semua palet di kota = 5 draw call ---------- */
let PAL=null;
function palletPools(){ if(PAL) return PAL; const base=new Parts();
  base.box(1.16,0.06,1.16,0.02,0xCB975F,0,0.13,0); for(const z of [-0.48,0,0.48]) base.box(1.16,0.1,0.17,0.02,0xA9794A,0,0.05,z);
  PAL={ base:new InstPool(base.geometry(),stdMat(.85,true),420,{cast:!LOWP}),
    box:new InstPool(gR(0.54,0.5,0.54,0.05),stdMat(.85),4200,{color:true,cast:!LOWP}),
    tape:new InstPool(new THREE.BoxGeometry(0.11,0.012,0.548),stdMat(.9),3600,{color:true,cast:false}),
    blob:new InstPool(planeG,blobMat(0.85,false),900,{cast:false,receive:false,order:1}),
    film:new InstPool(gR(1.15,1,1.15,0.05),new THREE.MeshStandardMaterial({color:0xEEF4FF,transparent:true,opacity:0.42,roughness:0.12,metalness:0.05,depthWrite:false}),400,{cast:false,order:3}) };
  return PAL; }
const _pm=new THREE.Matrix4(), _pq=new THREE.Quaternion(), _pe=new THREE.Euler(), _pv=new THREE.Vector3(), _ps=new THREE.Vector3();
const pmat=(x,y,z,ry=0,sx=1,sy=1,sz=1)=>{ _pe.set(0,ry,0); _pq.setFromEuler(_pe); return new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),_pq.clone(),new THREE.Vector3(sx,sy,sz)); };
function makePallet(kind,r,forceL,noBlob){
  const P=palletPools(), anchor=new THREE.Object3D(), parts=[];
  const add=(pool,m,col)=>{ const i=pool.alloc(); if(i<0) return; parts.push({pool,i,m}); if(col!=null) pool.color(i,col); };
  add(P.base,pmat(0,0,0));
  const L=forceL||1+Math.floor(r()*3);
  if(kind==='crate'){ const n=Math.min(L,2);
    for(let l=0;l<n;l++)for(let i=0;i<2;i++)for(let j=0;j<2;j++) add(P.box,pmat((i-.5)*.56,0.41+l*0.51,(j-.5)*.56,0,1.02,1,1.02),'#2F5BEA');
    add(P.tape,pmat(0,0.16+n*0.51+0.005,0,Math.PI/2,0.8,3,2.06),'#5C82FF');
  } else { const cols=kind==='white'?['#F5F7FC','#EBEFF8']:['#DDA96D','#D49E61','#E4B67F'];
    for(let l=0;l<L;l++)for(let i=0;i<2;i++)for(let j=0;j<2;j++){
      if(l===L-1&&L>1&&r()<0.12) continue;
      const x=(i-.5)*.56+(r()-.5)*.03, z=(j-.5)*.56+(r()-.5)*.03, ry=(r()-.5)*.08, y=0.41+l*0.505;
      add(P.box,pmat(x,y,z,ry),cols[Math.floor(r()*cols.length)]);
      if(kind!=='white'&&l===L-1) add(P.tape,pmat(x,y+0.251,z,ry),'#B7834F'); }
    if(kind==='white') add(P.film,pmat(0,0.16+L*0.505/2,0,0,1,L*0.505+0.02,1)); }
  if(!noBlob) add(P.blob,pmat(0,0.02,0,0,1.7,1,1.7));
  anchor.userData.pallet={parts,dirty:true};
  return anchor;
}
function updatePallet(anchor,force){ const pd=anchor.userData.pallet; if(!pd) return; if(!force&&!pd.dirty) return;
  anchor.updateWorldMatrix(true,false); const show=anchor.visible&&(!anchor.parent||anchor.parent.visible);
  for(const p of pd.parts){ if(!show){ p.pool.set(p.i,_hide); continue; } _pm.multiplyMatrices(anchor.matrixWorld,p.m); p.pool.set(p.i,_pm); }
  pd.dirty=false; }
function freePallet(anchor){ const pd=anchor.userData.pallet; if(!pd) return; for(const p of pd.parts) p.pool.release(p.i); pd.parts=[]; }
/* ---------- pekerja ber-instancing: semua orang = ~14 draw call ---------- */
let PPL=null;
function peoplePools(n){ if(PPL) return PPL; const G=(f)=>{const P=new Parts(); f(P); return P.geometry();};
  const cap=n*2+16; /* anggota tubuh berpasangan (lengan, paha, betis, kaki) butuh 2 slot per orang */
  const mk=(geo,color=true,cast=true)=>new InstPool(geo,color?stdMat(.7):stdMat(.7,true),cap,{color,cast:cast&&!LOWP});
  PPL={ vest:mk(G(P=>{P.add(gCap(0.17,0.24),0xFFFFFF,0,0.31,0);P.box(0.3,0.1,0.18,0.06,0xFFFFFF,0,0.53,0);})),
    pelvis:mk(G(P=>P.add(gCap(0.14,0.12),0xFFFFFF,0,0.03,0))), neck:mk(G(P=>P.add(gCyl(0.06,0.09,10),0xFFFFFF,0,0.6,0)),true,false),
    bands:mk(G(P=>{P.add(gCyl(0.173,0.04,14),0xEEF2FA,0,0.24,0);P.add(gCyl(0.173,0.04,14),0xEEF2FA,0,0.4,0);}),false,false),
    head:mk(G(P=>{P.add(gSph(0.125,14),0xFFFFFF,0,0.13,0);P.add(gSph(0.028,6),0xFFFFFF,0,0.11,0.122);})),
    eyes:mk(G(P=>{P.add(gSph(0.017,6),0x1B2340,-0.045,0.14,0.113);P.add(gSph(0.017,6),0x1B2340,0.045,0.14,0.113);}),false,false),
    hat:mk(G(P=>P.add(gHemi(0.143),0xFFFFFF,0,0.16,0))), brim:mk(G(P=>P.add(gCyl(0.18,0.02,14),0xFFFFFF,0,0.165,0.025)),true,false),
    upper:mk(G(P=>{P.add(gCap(0.058,0.18),0xFFFFFF,0,-0.13,0);P.add(gSph(0.07,10),0xFFFFFF,0,0,0);})),
    fore:mk(G(P=>{P.add(gCap(0.048,0.17),0xFFFFFF,0,-0.12,0);P.add(gSph(0.055,8),0xFFFFFF,0,-0.26,0.01);})),
    clip:mk(G(P=>{P.box(0.2,0.012,0.27,0,0xF5F7FC,0.02,-0.27,0.1);P.box(0.21,0.008,0.28,0,0x8B5E34,0.02,-0.278,0.1);P.box(0.07,0.02,0.03,0,0x2E5BFF,0.02,-0.262,-0.02);}),false,false),
    thigh:mk(G(P=>P.add(gCap(0.078,0.3),0xFFFFFF,0,-0.22,0))), shin:mk(G(P=>P.add(gCap(0.066,0.28),0xFFFFFF,0,-0.2,0))),
    foot:mk(G(P=>P.box(0.12,0.07,0.25,0.035,0xFFFFFF,0,-0.03,0.05))) };
  return PPL; }
const _I=new THREE.Matrix4();
function makePerson(look){
  const P=peoplePools(120), {vest,hat,clip,civ,skin,pants}=look, shoe=0x22252E;
  const g=new THREE.Group(), hips=new THREE.Group(); hips.position.y=0.95; g.add(hips);
  const parts=[]; const put=(joint,pool,col,show=true)=>{ const i=pool.alloc(); if(i<0&&!window.__poolWarned){ window.__poolWarned=1; console.warn('[Lumbung] people pool full — body parts dropped'); } if(col!=null) pool.color(i,'#'+new THREE.Color(col).getHexString()); const key=col==null?null:col===vest?'vest':col===hat?'hat':col===skin?'skin':col===pants?'pants':null; parts.push({joint,pool,i,show,key}); };
  const torso=new THREE.Group(); hips.add(torso);
  put(torso,P.vest,vest); put(torso,P.pelvis,pants); put(torso,P.neck,skin); put(torso,P.bands,null,!civ);
  const head=new THREE.Group(); head.position.y=0.63; torso.add(head);
  put(head,P.head,skin); put(head,P.eyes,null); put(head,P.hat,hat); put(head,P.brim,hat,!civ);
  const sh=[],el=[],th=[],kn=[],an=[];
  for(const s of [-1,1]){
    const a=new THREE.Group(); a.position.set(s*0.215,0.52,0); torso.add(a); put(a,P.upper,vest);
    const e=new THREE.Group(); e.position.y=-0.29; a.add(e); put(e,P.fore,skin); if(s===1) put(e,P.clip,null,!!clip);
    const t=new THREE.Group(); t.position.x=s*0.095; hips.add(t); put(t,P.thigh,pants);
    const k=new THREE.Group(); k.position.y=-0.45; t.add(k); put(k,P.shin,pants);
    const f=new THREE.Group(); f.position.y=-0.43; k.add(f); put(f,P.foot,shoe);
    sh.push(a); el.push(e); th.push(t); kn.push(k); an.push(f);
  }
  const pk=new THREE.Mesh(gR(0.7,1.9,0.7,0),pickMatL); pk.position.y=0.95; pk.layers.set(1); g.add(pk);
  const bi=palletPools().blob.alloc(), bi2=palletPools().blob.alloc();
  return {g,hips,torso,head,sh,el,th,kn,an,parts,blobI:bi,blobI2:bi2};
}
function recolorPerson(rig,look){ for(const p of rig.parts){ if(!p.key) continue; p.pool.color(p.i,'#'+new THREE.Color(look[p.key]).getHexString()); if(p.pool===PPL.clip) continue; } }
function updatePerson(rig,visible){
  rig.g.updateMatrixWorld(true);
  for(const p of rig.parts){ if(!visible||!p.show) p.pool.set(p.i,_hide); else p.pool.set(p.i,p.joint.matrixWorld); }
  const b=palletPools().blob; if(!visible){ b.set(rig.blobI,_hide); b.set(rig.blobI2,_hide); } else { _pv.setFromMatrixPosition(rig.g.matrixWorld); _pm.makeScale(1.05,1,1.05).setPosition(_pv.x,_pv.y+0.02,_pv.z); b.set(rig.blobI,_pm); _pm.makeScale(0.5,1,0.5).setPosition(_pv.x,_pv.y+0.025,_pv.z); b.set(rig.blobI2,_pm); }
}
const pickMatL=new THREE.MeshBasicMaterial({visible:true});
function makePallet_static(kind,r,L,x,y,z,s,parent){ const a=makePallet(kind,r,L,true); a.position.set(x,y,z); a.scale.setScalar(s); parent.add(a); a.userData.pallet.dirty=true; STATIC_PALLETS.push(a); return a; }
const STATIC_PALLETS=[];
function addCar(P,color,x,z,ry){
  const c=Math.cos(ry), s=Math.sin(ry), at=(lx,lz)=>[x+lx*c+lz*s, z-lx*s+lz*c];
  const put=(geo,col,lx,y,lz)=>{const [wx,wz]=at(lx,lz); P.add(geo,col,wx,y,wz,ry);};
  put(gR(1.72,0.56,3.9,0.26,3),color,0,0.6,0); put(gR(1.5,0.5,2.05,0.24,3),0x1B2340,0,1.1,-0.15); put(gR(1.42,0.08,1.8,0),color,0,1.36,-0.2);
  for(const sx of [-1,1]){ put(gR(0.3,0.12,0.05,0),0xF5F7FF,sx*0.55,0.7,1.95); put(gR(0.3,0.1,0.05,0),0xE5484D,sx*0.6,0.72,-1.95); }
  for(const sx of [-0.78,0.78]) for(const lz of [1.25,-1.25]){ const [wx,wz]=at(sx,lz); P.add(gWheelLo(),0x23262F,wx,0.32,wz,ry); }
}
function addVan(P,col,stripe,x,z,ry){ const c=Math.cos(ry), s=Math.sin(ry), put=(g,cl,lx,y,lz)=>P.add(g,cl,x+lx*c+lz*s,y,z-lx*s+lz*c,ry);
  put(gR(1.86,1.7,4.6,0.22,3),col,0,1.25,0); put(gR(1.7,0.6,0.08,0.06),0x1B2340,0,1.7,2.28); put(gR(1.88,0.32,3.2,0),stripe,0,0.95,-0.5);
  for(const sx of [-0.8,0.8]) for(const lz of [1.5,-1.5]) put(gWheelLo(),0x23262F,sx,0.34,lz); }
function addMotor(P,col,x,z,ry){ const c=Math.cos(ry), s=Math.sin(ry), put=(g,cl,lx,y,lz,sx=1,sy=1,sz=1)=>P.add(g,cl,x+lx*c+lz*s,y,z-lx*s+lz*c,ry,sx,sy,sz);
  put(gR(0.36,0.42,1.2,0.12),col,0,0.62,0); put(gR(0.46,0.4,0.5,0.08),0xF97316,0,0.98,-0.42); put(gR(0.3,0.08,0.5,0.03),0x23262F,0,0.88,0.1);
  for(const lz of [0.6,-0.58]) put(gWheelLo(),0x23262F,0,0.3,lz,0.5,0.9,0.9); }
function addCage(P,x,z){ P.box(1.0,1.5,0.8,0.02,0x9AA3BA,x,0.8,z); P.box(0.9,1.2,0.7,0.04,0xDDA96D,x,0.72,z); P.box(0.96,0.04,0.76,0,0x5A6178,x,1.55,z); }
/* mobil lalu lintas: badan (warna per mobil) + detail = 2 draw call untuk semua mobil */
let CARS=null, MOTO=null;
function carPools(n){ if(CARS) return CARS; const B=new Parts(), Dt=new Parts();
  B.add(gR(1.72,0.56,3.9,0.26,3),0xFFFFFF,0,0.6,0); B.add(gR(1.42,0.08,1.8,0),0xFFFFFF,0,1.36,-0.2);
  Dt.add(gR(1.5,0.5,2.05,0.24,3),0x1B2340,0,1.1,-0.15);
  for(const sx of [-1,1]){ Dt.add(gR(0.3,0.12,0.05,0),0xF5F7FF,sx*0.55,0.7,1.95); Dt.add(gR(0.3,0.1,0.05,0),0xE5484D,sx*0.6,0.72,-1.95); }
  for(const sx of [-0.78,0.78]) for(const lz of [1.25,-1.25]) Dt.add(gWheelLo(),0x23262F,sx,0.32,lz);
  CARS={body:new InstPool(B.geometry(),gloss(stdMat(.3),0.28,0.85),n,{color:true}),detail:new InstPool(Dt.geometry(),gloss(stdMat(.4,true),0.3,0.7),n)};
  { const M=new Parts(); M.box(0.34,0.36,1.3,0.12,0x23262F,0,0.62,0); M.box(0.3,0.1,0.55,0.04,0x2E5BFF,0,0.86,0.15);
    for(const lz of [0.62,-0.6]) M.add(gWheelLo(),0x1B1E27,0,0.3,lz,0,0.45,0.9,0.9);
    M.add(gCap(0.17,0.32),0x7C3AED,0,1.22,-0.08); M.add(gSph(0.15,10),0xF4F6FB,0,1.62,0.02); M.box(0.08,0.3,0.42,0.03,0x7C3AED,0.17,1.1,0.18); M.box(0.08,0.3,0.42,0.03,0x7C3AED,-0.17,1.1,0.18);
    M.box(0.62,0.56,0.56,0.08,0x7C3AED,0,1.18,-0.66); M.box(0.64,0.08,0.58,0.02,0xF4F6FB,0,1.3,-0.66);
    MOTO=new InstPool(M.geometry(),gloss(stdMat(.45,true),0.3,0.7),Math.ceil(n/3)+4); }
  return CARS; }
function makePin(){
  const g=new THREE.Group(), P=new Parts(); P.add(gSph(0.44,18),0x2E5BFF,0,0.78,0); P.add(gCone(0.31,0.66,18),0x2E5BFF,0,0.32,0,0,1,1,1,Math.PI,0);
  const m=P.build(.35); g.add(m);
  const disc=new THREE.Mesh(new THREE.CircleGeometry(0.2,24),new THREE.MeshBasicMaterial({color:0xffffff})); disc.position.y=0.78; g.add(disc);
  g.userData.disc=disc; return g;
}
const bracketCache={};
function makeBracket(w,h,l){
  const k=[w,h,l].join('|');
  if(!bracketCache[k]){ const P=new Parts(), t=0.07, a=Math.min(w,l)*0.28;
    for(const sx of [-1,1])for(const sy of [0,1])for(const sz of [-1,1]){
      const x=sx*w/2,y=sy*h,z=sz*l/2;
      P.box(a,t,t,0,0x2E5BFF,x-sx*a/2,y,z); P.box(t,t,a,0,0x2E5BFF,x,y,z-sz*a/2); P.box(t,Math.min(a,h*0.35),t,0,0x2E5BFF,x,y+(sy?-1:1)*Math.min(a,h*0.35)/2,z);
    }
    bracketCache[k]=P.build(1,false).geometry; }
  const m=new THREE.Mesh(bracketCache[k],new THREE.MeshBasicMaterial({color:0x2E5BFF,vertexColors:false}));
  const gl=new THREE.Mesh(planeG,new THREE.MeshBasicMaterial({map:glowTex,transparent:true,depthWrite:false}));
  gl.scale.set(w*1.9,1,l*1.5); gl.position.y=0.05; gl.renderOrder=2;
  const bx=new THREE.Mesh(new THREE.BoxGeometry(w,h,l),new THREE.MeshBasicMaterial({color:0x2E5BFF,transparent:true,opacity:0.12,depthWrite:false})); bx.position.y=h/2; bx.renderOrder=4;
  const ed=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(w,h,l)),new THREE.LineBasicMaterial({color:0x4D7BFF,transparent:true,opacity:0.7})); ed.position.y=h/2; ed.renderOrder=5;
  const g=new THREE.Group(); g.add(m); g.add(gl); g.add(bx); g.add(ed); return g;
}
/* ---------- city ---------- */
const paveTex=(()=>{const t=canvasTex(64,64,(x,w,h)=>{x.fillStyle='#EEF1FA';x.fillRect(0,0,w,h);x.fillStyle='#E1E6F3';x.fillRect(0,0,w,2);x.fillRect(0,0,2,h);x.fillRect(0,31,w,1);x.fillRect(31,0,1,h);});t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;})();
const glassTex=(()=>{const t=canvasTex(64,64,(x,w,h)=>{const g=x.createLinearGradient(0,0,w,h);g.addColorStop(0,'#9FB8F2');g.addColorStop(1,'#6E8FE6');x.fillStyle=g;x.fillRect(0,0,w,h);x.fillStyle='rgba(255,255,255,.55)';x.fillRect(0,0,w,3);x.fillRect(0,0,2,h);x.fillStyle='rgba(255,255,255,.18)';x.fillRect(6,6,18,52);});t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;})();
function gantryTex(lines){return canvasTex(512,200,(x,w,h)=>{x.fillStyle='#1E7A4E';rr(x,4,4,w-8,h-8,16);x.fill();x.strokeStyle='#FFFFFF';x.lineWidth=5;rr(x,14,14,w-28,h-28,10);x.stroke();
  x.fillStyle='#fff';x.font='800 40px "Plus Jakarta Sans", system-ui, sans-serif';x.textBaseline='middle';
  lines.forEach((l,i)=>x.fillText(l,36,58+i*54));});}
function buildCityView(){
  const g=new THREE.Group(); scene.add(g);
  const R=rng(4242);
  const bg=cssVar('--bg'); renderer.setClearColor(new THREE.Color(bg)); scene.fog=new THREE.Fog(C(bg),230,560);
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(2400,2400),new THREE.MeshStandardMaterial({color:C(cssVar('--ground')),roughness:1}));
  ground.rotation.x=-Math.PI/2; ground.receiveShadow=true; g.add(ground);
  const X0=(GRID.x0-0.5)*PX-ROAD/2, X1=(GRID.x1+0.5)*PX+ROAD/2, Z0=(GRID.z0-0.5)*PZ-ROAD/2, Z1=(GRID.z1+0.5)*PZ+ROAD/2;
  RB(g,X1-X0,0.04,Z1-Z0,0,new THREE.MeshStandardMaterial({color:C(cssVar('--road')),roughness:.95}),(X0+X1)/2,0.02,(Z0+Z1)/2,{cast:false});
  const L=new Parts(), W=0xFFFFFF;
  const vx=[],hz=[]; for(let k=GRID.x0;k<=GRID.x1+1;k++) vx.push((k-0.5)*PX); for(let k=GRID.z0;k<=GRID.z1+1;k++) hz.push((k-0.5)*PZ);
  const e=ROAD/2-0.45;
  for(const x of vx) for(let i=0;i<hz.length-1;i++){ const za=hz[i]+ROAD/2+3.2, zb=hz[i+1]-ROAD/2-3.2;
    for(let z=za+1;z<zb-2;z+=5) L.box(0.14,0.01,2.4,0,W,x,0.045,z+1.2);
    for(const s of [-1,1]) L.box(0.12,0.01,zb-za,0,W,x+s*e,0.045,(za+zb)/2);
  }
  for(const z of hz) for(let i=0;i<vx.length-1;i++){ const xa=vx[i]+ROAD/2+3.2, xb=vx[i+1]-ROAD/2-3.2;
    for(let x=xa+1;x<xb-2;x+=5) L.box(2.4,0.01,0.14,0,W,x+1.2,0.045,z);
    for(const s of [-1,1]) L.box(xb-xa,0.01,0.12,0,W,(xa+xb)/2,0.045,z+s*e);
  }
  for(const x of vx) for(const z of hz) for(const s of [-1,1]) for(let k=-3.6;k<=3.6;k+=0.9){ L.box(0.5,0.01,2.4,0,W,x+k,0.046,z+s*(ROAD/2+1.6)); L.box(2.4,0.01,0.5,0,W,x+s*(ROAD/2+1.6),0.046,z+k); }
  const plates=new Parts(), city=new Parts(), bldg=new Parts(), glass=new Parts(), trees=new Parts(), BB=new BlobBatch();
  const tree=(x,z,s,kind)=>{ kind=kind??(R()<0.7?0:1);
    if(kind===0){ trees.add(gCyl(0.11,1.0,6),0xB58B63,x,0.58,z); trees.add(gSph(1,10),R()<.5?0x6BC48C:0x5AB47C,x,1.03+s*1.05,z,0,s,s*1.25,s); }
    else { trees.add(gCyl(0.1,0.8,6),0xA97E58,x,0.5,z); for(let k=0;k<3;k++) trees.add(gCone(s*(1.0-k*0.24),s*1.1,9),k%2?0x4FA872:0x5DB57E,x,0.9+s*(0.5+k*0.62),z); }
    BB.add(s*2.4,s*2.4,x,z,0.1); };
  const lamp=(x,z,ry)=>{ View.lampPts.push([x+Math.sin(ry)*1.0,4.5,z+Math.cos(ry)*1.0]); city.add(gCyl(0.07,4.6,6),0x9AA3BA,x,2.38,z); city.add(gR(0.08,0.08,1.1,0),0x9AA3BA,x+Math.sin(ry)*0.5,4.62,z+Math.cos(ry)*0.5,ry); city.add(gR(0.32,0.12,0.5,0),0xEEF1F8,x+Math.sin(ry)*1.0,4.58,z+Math.cos(ry)*1.0,ry); };
  const bench=(x,z,ry)=>{ city.add(gR(1.5,0.08,0.45,0.03),0xB58B63,x,0.55,z,ry); city.add(gR(1.5,0.4,0.07,0.03),0xB58B63,x-Math.sin(ry)*0.2,0.8,z-Math.cos(ry)*0.2,ry); for(const s of [-0.6,0.6]) city.add(gR(0.07,0.45,0.4,0.02),0x5B6378,x+Math.cos(ry)*s,0.32,z-Math.sin(ry)*s,ry); };
  const busStop=(x,z,ry)=>{ city.add(gR(3.2,0.08,1.4,0.04),0x2E5BFF,x,2.6,z,ry); for(const s of [-1.4,1.4]) city.add(gR(0.08,2.5,0.08,0.03),0x9AA3BA,x+Math.cos(ry)*s,1.35,z-Math.sin(ry)*s,ry); city.add(gR(3.0,1.6,0.05,0.02),0xCFE0FF,x-Math.sin(ry)*0.6,1.5,z-Math.cos(ry)*0.6,ry); bench(x,z-0,ry); };
  const roofStuff=(x,z,top,w,d)=>{ if(R()<0.6){ city.add(gCyl(0.9,1.4,16),0xF4F6FB,x-w*0.25,top+1.2,z-d*0.2); for(const a of [-0.5,0.5]) for(const b of [-0.5,0.5]) city.add(gR(0.08,0.6,0.08,0.02),0x9AA3BA,x-w*0.25+a,top+0.3,z-d*0.2+b); }
    for(let i=0;i<2+Math.floor(R()*3);i++) city.add(gR(1.0,0.6,0.8,0.1),0xE9EDF6,x+w*0.1+i*1.3-1,top+0.35,z+d*0.2);
    if(R()<0.5) city.add(gCyl(0.05,3,6),0x9AA3BA,x+w*0.3,top+1.5,z-d*0.3); };
  const sites=new Map(); SITE_CONFIG.forEach((S,i)=>sites.set(S.gx+','+S.gz,S)); STORE_CONFIG.forEach(S=>sites.set(S.gx+','+S.gz,S));
  for(let gx=GRID.x0;gx<=GRID.x1;gx++) for(let gz=GRID.z0;gz<=GRID.z1;gz++){
    const cx=gx*PX, cz=gz*PZ, bw=PX-ROAD, bd=PZ-ROAD;
    plates.add(gR(bw,0.08,bd,0.35),0xFFFFFF,cx,0.04,cz,0,1,1,1,0,0,bw/2,bd/2);
    const S=sites.get(gx+','+gz);
    for(let t=-bw/2+6;t<=bw/2-6;t+=16){ lamp(cx+t,cz-bd/2+0.5,0); if(!S) lamp(cx+t,cz+bd/2-0.5,Math.PI); }
    for(let t=-bd/2+8;t<=bd/2-8;t+=16){ lamp(cx-bw/2+0.5,cz+t,Math.PI/2); lamp(cx+bw/2-0.5,cz+t,-Math.PI/2); }
    if(S){ for(const t of [-bw/2+6,bw/2-6]) lamp(cx+t,cz+bd/2-0.5,Math.PI); continue; }
    const ix=bw/2-SW, iz=bd/2-SW, kind=Math.floor(R()*4);
    for(let t=-ix+4;t<=ix-4;t+=11){ tree(cx+t,cz-bd/2+0.9,0.6+R()*0.25); tree(cx+t,cz+bd/2-0.9,0.6+R()*0.25); }
    for(let t=-iz+6;t<=iz-6;t+=11){ tree(cx-bw/2+0.9,cz+t,0.6+R()*0.25); tree(cx+bw/2-0.9,cz+t,0.6+R()*0.25); }
    if(kind===0){
      const n=2+Math.floor(R()*2);
      for(let i=0;i<n;i++){ const w=14+R()*8, d=12+R()*6, h=8+Math.floor(R()*4)*3.2, x=cx-ix+8+w/2+i*(w+8), z=cz-6+R()*6; if(x+w/2>cx+ix-2) break;
        const P=R()<0.5?glass:bldg; P.add(gR(w,h,d,0.15),P===glass?0xFFFFFF:(R()<.5?0xFFFFFF:0xE6ECFB),x,h/2+0.08,z,0,1,1,1,0,0,w/3.2,h/3.2);
        city.box(w+0.3,0.3,d+0.3,0.08,0xF2F4FA,x,h+0.23,z); city.box(w*0.5,0.5,0.6,0.1,0x3463F2,x,1.8,z+d/2+0.3); roofStuff(x,z,h+0.38,w,d);
        BB.add(w+5,d+5,x,z,0.1,true); }
      for(let i=0;i<8;i++) addCar(city,pick([0xF3F5FB,0x2E5BFF,0x9AA4C2,0x3B4A7A,0xE0573B],R),cx-ix+6+i*3.1,cz+iz-5,0);
      for(let i=0;i<=8;i++) city.box(0.08,0.01,4.8,0,0xFFFFFF,cx-ix+4.45+i*3.1,0.1,cz+iz-5);
    } else if(kind===1){
      for(let i=0;i<3;i++){ const w=10, d=26+R()*6, h=12+Math.floor(R()*4)*3.2, x=cx-ix+8+i*16, z=cz;
        bldg.add(gR(w,h,d,0.2),R()<.6?0xFFFFFF:0xDCE6FF,x,h/2+0.08,z,0,1,1,1,0,0,d/3.2,h/3.2);
        city.box(w+0.4,0.35,d+0.4,0.1,0x3463F2,x,h+0.25,z); roofStuff(x,z,h+0.42,w,d); BB.add(w+6,d+6,x,z,0.1,true); }
      for(let i=0;i<6;i++) tree(cx+ix-8-R()*12,cz-iz+6+R()*(iz*2-12),0.8+R()*0.4);
    } else if(kind===2){
      city.box(ix*2,0.06,iz*2,1.5,0xDCF2E5,cx,0.1,cz);
      city.box(ix*2-4,0.05,2.4,1,0xF4F6FB,cx,0.12,cz); city.box(2.4,0.05,iz*2-4,1,0xF4F6FB,cx,0.12,cz);
      city.box(12,0.05,8,3.5,0xA9C8F5,cx+ix*0.45,0.13,cz-iz*0.5); city.box(12.6,0.1,8.6,3.7,0xE6EBF6,cx+ix*0.45,0.11,cz-iz*0.5);
      for(let i=0;i<4;i++) bench(cx-6+i*4,cz+2.2,Math.PI);
      for(let i=0;i<22;i++){ const x=cx-ix+3+R()*(ix*2-6), z=cz-iz+3+R()*(iz*2-6); if(Math.abs(x-cx)<2.5||Math.abs(z-cz)<2.5) continue; if(Math.abs(x-cx-ix*0.45)<8&&Math.abs(z-cz+iz*0.5)<6) continue; tree(x,z,0.75+R()*0.5); }
    } else {
      for(let i=0;i<4;i++){ const x=cx-ix+8+i*5.5, z=cz-8; city.add(gCyl(2.4,10,16),0xF1F4FA,x,5.1,z); city.add(gHemi(2.4,12),0xE6EBF6,x,10.1,z); city.box(0.3,10,0.3,0.05,0x9AA3BA,x+2.5,5,z); BB.add(7,7,x,z,0.1); }
      const w=30,d=16,x=cx+ix-w/2-4,z=cz+4;
      city.box(w,5,d,0.12,0xEFF2F9,x,2.58,z); city.box(w+0.6,0.4,d+0.6,0.1,0x3463F2,x,5.2,z); BB.add(w+5,d+5,x,z,0.1,true);
      for(let i=0;i<5;i++) addCar(city,pick([0xF3F5FB,0x9AA4C2,0x3B4A7A],R),x-w/2+3+i*3,z+d/2+4,0);
    }
  }
  /* signals at car intersections */
  const SP=new Parts();
  SIGPOOL=new InstPool(gSph(0.1,10),new THREE.MeshBasicMaterial({color:0xffffff}),Store.tables.signals.size*12,{color:true,cast:false});
  for(const sd of Store.all('signals')){ const x=sd.x, z=sd.z;
    const sig={idx:{H:[],V:[]},last:{H:'',V:''}}; View.signals.set(sd.id,sig);
    const corners=[[1,1,'H',Math.PI/2],[-1,-1,'H',-Math.PI/2],[1,-1,'V',Math.PI],[-1,1,'V',0]];
    for(const [sx,sz,ax,ry] of corners){ const px=x+sx*(ROAD/2+0.8), pz=z+sz*(ROAD/2+0.8);
      SP.add(gCyl(0.08,3.4,6),0x3B4466,px,1.75,pz); SP.add(gR(0.34,0.95,0.3,0.08),0x2B2F3A,px,3.2,pz,ry);
      [0,1,2].forEach(k=>{ const i=SIGPOOL.alloc(); SIGPOOL.set(i,new THREE.Matrix4().makeTranslation(px+Math.sin(ry)*0.16,3.5-k*0.3,pz+Math.cos(ry)*0.16)); sig.idx[ax].push([i,k]); }); } }
  { const m=SP.build(.5); g.add(m); View.clutter.push(m); }
  /* gantry signs at site intersections */
  for(const S of SITE_CONFIG){ const cx=S.gx*PX, cz=S.gz*PZ, zs=cz+PZ/2, xr=cx+PX/2, xl=cx-PX/2;
    const sgn=(x,z,lines)=>{ city.box(0.22,6.2,0.22,0.06,0x9AA3BA,x-3.8,3.15,z); city.box(0.22,6.2,0.22,0.06,0x9AA3BA,x+3.8,3.15,z); city.box(8.0,0.2,0.2,0.05,0x9AA3BA,x,6.2,z);
      const b=new THREE.Mesh(new THREE.PlaneGeometry(5.4,2.1),new THREE.MeshBasicMaterial({map:gantryTex(lines),side:THREE.DoubleSide})); b.position.set(x,5.0,z+0.12); g.add(b); View.clutter.push(b); };
    sgn(xr,zs-ROAD/2-10,['↑ Tol Jagorawi','Jakarta · Bandung · Bekasi']);
    sgn(xl,zs-ROAD/2-22,['↓ Kawasan Gudang','Lumbung '+S.id]);
  }
  /* jalan lingkar utara, penghubung, perpanjangan jalan ke kabut, Gerbang Tol Jagorawi */
  { const RM=new THREE.MeshStandardMaterial({color:C(cssVar('--road')),roughness:.95}), RW=ROAD, W=0xFFFFFF, Y=0xF0B43C;
    const strip=(x0,x1,z0,z1)=>{ const m=new THREE.Mesh(gR(Math.abs(x1-x0),0.04,Math.abs(z1-z0),0),RM); m.position.set((x0+x1)/2,0.02,(z0+z1)/2); m.receiveShadow=true; g.add(m); };
    const X0g=(GRID.x0-0.5)*PX-RW/2, X1g=(GRID.x1+0.5)*PX+RW/2, Z0g=(GRID.z0-0.5)*PZ-RW/2, Z1g=(GRID.z1+0.5)*PZ+RW/2;
    for(const z of CAR_H){ strip(-660,X0g,z-RW/2,z+RW/2); strip(X1g,660,z-RW/2,z+RW/2); for(const [a,b] of [[-660,X0g],[X1g,660]]) for(let x=a+2;x<b-2;x+=5) L.box(2.4,0.01,0.14,0,W,x,0.045,z); }
    for(const x of CAR_V){ strip(x-RW/2,x+RW/2,-660,Z0g); strip(x-RW/2,x+RW/2,Z1g,660);
      for(const [a,b] of [[-660,ZHW-RW/2-4],[ZHW+RW/2+4,Z0g],[Z1g,660]]) for(let z=a+2;z<b-2;z+=5) L.box(0.14,0.01,2.4,0,W,x,0.045,z); }
    const XT0=HWY.xToll-16, XT1=HWY.xToll+16;
    strip((GRID.x0-0.5)*PX-RW/2,XT0,ZHW-RW/2,ZHW+RW/2);
    for(let x=(GRID.x0-0.5)*PX+6;x<XT0-2;x+=5){ let skip=false; for(let k=GRID.x0;k<=GRID.x1+1;k++) if(Math.abs(x-(k-0.5)*PX)<8) skip=true; if(Math.abs(x-HWY.xToll)<16) skip=true; if(!skip) L.box(2.4,0.01,0.14,0,W,x,0.045,ZHW); }
    for(const s of [-1,1]) L.box(XT0-((GRID.x0-0.5)*PX),0.01,0.12,0,W,(XT0+(GRID.x0-0.5)*PX)/2,0.045,ZHW+s*(RW/2-0.45));
    for(let k=GRID.x0+1;k<=GRID.x1;k++){ const x=(k-0.5)*PX; strip(x-RW/2,x+RW/2,ZHW+RW/2,Z0g);
      for(let z=ZHW+RW/2+4;z<Z0g-2;z+=5) L.box(0.14,0.01,2.4,0,W,x,0.045,z+1.2);
      L.box(RW/2-0.5,0.01,0.35,0,W,x-RW/4-0.1,0.046,ZHW+RW/2+1.2); }
    const SH=new Parts();
    for(let x=(GRID.x0-0.5)*PX+8;x<XT0-6;x+=13){ let skip=false; for(let k=GRID.x0;k<=GRID.x1+1;k++) if(Math.abs(x-(k-0.5)*PX)<9) skip=true; if(Math.abs(x-HWY.xToll)<20) skip=true; if(skip) continue;
      for(const s of [-1,1]){ SH.add(gCyl(0.06,0.7,6),0x9AA3BA,x,0.35,ZHW+s*(RW/2+0.7)); } SH.add(gR(13,0.18,0.08,0),0xC7CFE6,x+6.5,0.55,ZHW-(RW/2+0.7)); SH.add(gR(13,0.18,0.08,0),0xC7CFE6,x+6.5,0.55,ZHW+(RW/2+0.7)); }
    for(let x=-240;x<640;x+=18+((x*7)%5)){ for(const s of [-1,1]){ const z=ZHW+s*(RW/2+4+((x*13)%3)+(x>XT1?4:0)); SH.add(gCyl(0.11,1.0,6),0xB58B63,x,0.55,z); SH.add(gSph(1,10),0x5FB880,x,1.9,z,0,0.95,1.2,0.95); } }
    /* Jalan tol: lebih lebar, 4 lajur + bahu, median beton, guardrail, lampu median, papan hijau */
    { const TW=8.4, x0=XT1, x1=660, len=x1-x0, cx=(x0+x1)/2, RMT=new THREE.MeshStandardMaterial({color:C(0xB3BBD6),roughness:.9});
      const tm=new THREE.Mesh(gR(len,0.04,TW*2,0),RMT); tm.position.set(cx,0.021,ZHW); tm.receiveShadow=true; g.add(tm);
      for(const s of [-1,1]){ L.box(len,0.01,0.16,0,W,cx,0.046,ZHW+s*7.3); L.box(len,0.01,0.12,0,Y,cx,0.046,ZHW+s*0.72);
        for(let x=x0+4;x<x1-4;x+=9) L.box(4.0,0.01,0.15,0,W,x+2,0.046,ZHW+s*3.95); }
      SH.add(gR(len,0.7,0.5,0.08),0xE4E8F2,cx,0.37,ZHW); SH.add(gR(len,0.08,0.22,0.03),0xA8B1C9,cx,0.74,ZHW);
      for(let x=x0+3;x<x1;x+=4) for(const s of [-1,1]) SH.add(gR(0.12,0.75,0.12,0.03),0x9AA3BA,x,0.38,ZHW+s*8.9);
      for(const s of [-1,1]){ SH.add(gR(len,0.3,0.08,0.03),0xC7CFE6,cx,0.62,ZHW+s*8.95); SH.add(gR(len,0.05,0.09,0.01),0xE8ECF6,cx,0.74,ZHW+s*8.95); }
      for(let x=x0+14;x<x1-6;x+=32){ SH.add(gCyl(0.12,7.2,8),0x9AA3BA,x,3.6,ZHW); for(const s of [-1,1]){ SH.add(gR(0.1,0.1,2.4,0),0x9AA3BA,x,7.05,ZHW+s*1.2); SH.add(gR(0.42,0.14,0.7,0.05),0x5A6178,x,6.98,ZHW+s*2.4); View.lampPts.push([x,6.8,ZHW+s*2.4]); } }
      const gx=x0+58; for(const s of [-1,1]) SH.add(gR(0.4,7.0,0.4,0.08),0x9AA3BA,gx,3.5,ZHW+s*9.7); SH.add(gR(0.5,0.5,19.8,0.1),0x9AA3BA,gx,6.9,ZHW);
      const gboard=(txt,sub,ry,zc)=>{ const m=new THREE.Mesh(new THREE.PlaneGeometry(7.6,2.0),new THREE.MeshBasicMaterial({map:canvasTex(760,200,(x,w,h)=>{ x.fillStyle='#0E7C4A'; x.fillRect(0,0,w,h); x.strokeStyle='#fff'; x.lineWidth=6; x.strokeRect(10,10,w-20,h-20);
          x.fillStyle='#fff'; x.textAlign='center'; x.font='800 66px "Plus Jakarta Sans", system-ui, sans-serif'; x.fillText(txt,w/2,95); x.font='600 38px "Plus Jakarta Sans", system-ui, sans-serif'; x.fillText(sub,w/2,158); })}));
        m.position.set(gx+(ry>0?0.28:-0.28),5.9,zc); m.rotation.y=ry; g.add(m);
        const bk=new THREE.Mesh(new THREE.PlaneGeometry(7.6,2.0),new THREE.MeshStandardMaterial({color:C(0x8A93A8),roughness:.7})); bk.position.set(gx+(ry>0?0.24:-0.24),5.9,zc); bk.rotation.y=ry+Math.PI; g.add(bk); };
      gboard('Jakarta ↑','Tol Jagorawi · 42 km',-Math.PI/2,ZHW+4.4); gboard('Bogor · Cibinong','Keluar 500 m',Math.PI/2,ZHW-4.4); }
    /* Gerbang Tol Jagorawi */
    const xt=HWY.xToll, cz=ZHW;
    strip(xt-16,xt+16,cz-RW/2-3,cz+RW/2+3);
    for(const sx of [-6,6]) for(const sz of [-1,1]) SH.add(gR(0.5,6.2,0.5,0.1),0xE6EBF6,xt+sx,3.1,cz+sz*(RW/2+2.2));
    SH.add(gR(16,0.7,RW+6.4,0.2),0x2E5BFF,xt,6.4,cz); SH.add(gR(15.4,0.18,RW+5.8,0.06),0xF4F6FB,xt,6.0,cz);
    for(const [bx,bz] of [[xt-7,cz-RW/2+0.2],[xt+7,cz+RW/2-0.2]]){ SH.add(gR(1.4,0.25,4.2,0.1),0xE9EDF8,bx,0.17,bz); SH.add(gR(1.2,2.4,1.6,0.12),0xF4F6FB,bx,1.45,bz); SH.add(gR(1.25,0.9,1.65,0.05),0x9DB4EE,bx,1.85,bz); SH.add(gR(1.4,0.16,1.8,0.06),0x2E5BFF,bx,2.72,bz); }
    SH.add(gR(1.2,0.12,RW+2,0.04),0xF0B43C,xt,0.06,cz);
    g.add(SH.build(.6));
    const sign=new THREE.Mesh(new THREE.PlaneGeometry(9,0.62),new THREE.MeshBasicMaterial({map:canvasTex(1024,72,(x,w,h)=>{x.fillStyle='#2E5BFF';x.fillRect(0,0,w,h);x.fillStyle='#fff';x.font='800 44px "Plus Jakarta Sans", system-ui, sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText('GERBANG TOL JAGORAWI',w/2,h/2+2);}),side:THREE.DoubleSide}));
    for(const s of [-1,1]){ const m=sign.clone(); m.rotation.y=s>0?Math.PI/2:-Math.PI/2; m.position.set(xt+s*8.02,6.4,cz); g.add(m); }
    const armMat=new THREE.MeshStandardMaterial({color:C(0xFFFFFF),roughness:.5});
    for(const [bx,bz,dir] of [[xt-7,cz-RW/2+0.2,1],[xt+7,cz+RW/2-0.2,-1]]){ const piv=new THREE.Group(); piv.position.set(bx,1.0,bz+dir*0.8); g.add(piv);
      const P=new Parts(); for(let i=0;i<5;i++) P.add(gR(0.8,0.1,0.1,0),i%2?0xE5484D:0xFFFFFF,0,0,dir*(0.4+i*0.8)); const arm=P.build(.5); piv.add(arm);
      View.barriers.push({piv,x:bx,z:bz+dir*2.4,open:0,dir}); }
  }
  /* marka & rambu: garis stop, panah lajur, papan nama jalan, batas kecepatan, jalur truk */
  { const XG0=(GRID.x0-0.5)*PX, XG1=(GRID.x1+0.5)*PX, ZG0=(GRID.z0-0.5)*PZ, ZG1=(GRID.z1+0.5)*PZ, gridZ=z=>z>=ZG0-1&&z<=ZG1+1&&z!==ZHW;
    const has=(x,z,d)=>{ if(d==='W') return (gridZ(z)&&x>XG0+1)||CAR_H.includes(z)||(z===ZHW&&x>XG0+1);
      if(d==='E') return (gridZ(z)&&x<XG1-1)||CAR_H.includes(z)||z===ZHW;
      if(d==='N') return z===ZHW?CAR_V.includes(x):true;
      return z===ZHW?true:(z<ZG1-1||CAR_V.includes(x)); };
    const ash=new THREE.Shape(); ash.moveTo(-1.1,-0.13); ash.lineTo(0.35,-0.13); ash.lineTo(0.35,-0.42); ash.lineTo(1.1,0); ash.lineTo(0.35,0.42); ash.lineTo(0.35,0.13); ash.lineTo(-1.1,0.13); ash.closePath();
    const arrow=new THREE.ShapeGeometry(ash); arrow.rotateX(-Math.PI/2);
    const MK=new Parts();
    for(const sd of Store.all('signals')){ const off=sd.z===ZHW?8.2:ROAD/2+3.25;
      const A={W:{dx:-1,dz:0,lz:-2.2,ry:0},E:{dx:1,dz:0,lz:2.2,ry:Math.PI},N:{dx:0,dz:-1,lx:2.2,ry:-Math.PI/2},S:{dx:0,dz:1,lx:-2.2,ry:Math.PI/2}};
      for(const d of ['W','E','N','S']){ if(!has(sd.x,sd.z,d)) continue; const a=A[d];
        if(a.dx){ const x=sd.x+a.dx*off, z=sd.z+a.lz; MK.box(0.4,0.012,4.0,0,0xFFFFFF,x,0.047,z); for(const k of [5,14]) MK.add(arrow,0xFFFFFF,x+a.dx*k,0.047,z,a.ry); }
        else { const z=sd.z+a.dz*off, x=sd.x+a.lx; MK.box(4.0,0.012,0.4,0,0xFFFFFF,x,0.047,z); for(const k of [5,14]) MK.add(arrow,0xFFFFFF,x,0.047,z+a.dz*k,a.ry); } } }
    { const mm=MK.build(.9,false); g.add(mm); View.clutter.push(mm); }
    /* atlas rambu */
    const NAMES_H={'-114':'Jl. Raya Jakarta–Bogor','-38':'Jl. Mayor Oking','38':'Jl. Industri Cibinong','114':'Jl. Tegar Beriman','190':'Jl. Pajajaran'};
    const NAMES_V={'-250':'Jl. Sukahati','-150':'Jl. Cikaret','-50':'Jl. Pemda','50':'Jl. Karadenan','150':'Jl. Pakansari','250':'Jl. Raya Citeureup'};
    const names=[...Object.values(NAMES_H),...Object.values(NAMES_V),'Jl. Lingkar Utara'];
    const AW=1024, AH=1024, cells={};
    const atlas=canvasTex(AW,AH,(x)=>{ x.fillStyle='#1E6E43'; x.fillRect(0,0,AW,AH);
      names.forEach((n,i)=>{ const cx=(i%3)*340, cy=Math.floor(i/3)*64; x.fillStyle='#17804A'; x.fillRect(cx+2,cy+2,336,60); x.strokeStyle='#fff'; x.lineWidth=3; x.strokeRect(cx+6,cy+6,328,52);
        x.fillStyle='#fff'; x.font='700 28px "Plus Jakarta Sans", system-ui, sans-serif'; x.textAlign='center'; x.textBaseline='middle'; x.fillText(n,cx+170,cy+33); cells[n]=[cx+2,cy+2,336,60]; });
      const icon=(key,cx,cy,draw)=>{ cells[key]=[cx,cy,124,124]; x.save(); x.translate(cx,cy); draw(); x.restore(); };
      const truck=(col,s=1)=>{ x.fillStyle=col; x.fillRect(30*s,52*s,46*s,26*s); x.fillRect(76*s,60*s,18*s,18*s); x.beginPath(); x.arc(42*s,82*s,6*s,0,7); x.arc(84*s,82*s,6*s,0,7); x.fill(); };
      const by=448;
      icon('speed40',0,by,()=>{ x.fillStyle='#fff'; x.beginPath(); x.arc(62,62,60,0,7); x.fill(); x.lineWidth=14; x.strokeStyle='#D7262E'; x.beginPath(); x.arc(62,62,52,0,7); x.stroke(); x.fillStyle='#111'; x.font='800 50px system-ui, sans-serif'; x.textAlign='center'; x.textBaseline='middle'; x.fillText('40',62,66); });
      icon('speed30',128,by,()=>{ x.fillStyle='#fff'; x.beginPath(); x.arc(62,62,60,0,7); x.fill(); x.lineWidth=14; x.strokeStyle='#D7262E'; x.beginPath(); x.arc(62,62,52,0,7); x.stroke(); x.fillStyle='#111'; x.font='800 50px system-ui, sans-serif'; x.textAlign='center'; x.textBaseline='middle'; x.fillText('30',62,66); });
      icon('truckok',256,by,()=>{ x.fillStyle='#1F4FD8'; x.fillRect(2,2,120,120); x.strokeStyle='#fff'; x.lineWidth=5; x.strokeRect(8,8,108,108); truck('#fff'); x.fillStyle='#fff'; x.font='700 15px system-ui'; x.textAlign='center'; x.fillText('JALUR TRUK',62,34); });
      icon('notruck',384,by,()=>{ x.fillStyle='#fff'; x.beginPath(); x.arc(62,62,60,0,7); x.fill(); truck('#111'); x.lineWidth=12; x.strokeStyle='#D7262E'; x.beginPath(); x.arc(62,62,52,0,7); x.stroke(); x.beginPath(); x.moveTo(25,25); x.lineTo(99,99); x.stroke(); });
      icon('ped',512,by,()=>{ x.fillStyle='#1F4FD8'; x.fillRect(2,2,120,120); x.fillStyle='#fff'; x.beginPath(); x.moveTo(62,12); x.lineTo(112,104); x.lineTo(12,104); x.closePath(); x.fill(); x.fillStyle='#111'; x.beginPath(); x.arc(62,46,7,0,7); x.fill(); x.fillRect(58,54,8,24); x.fillRect(50,76,6,20); x.fillRect(68,76,6,20); for(let i=0;i<4;i++) x.fillRect(20+i*22,98,14,4); });
      icon('toll',640,by,()=>{ x.fillStyle='#17804A'; x.fillRect(2,2,120,120); x.fillStyle='#fff'; x.font='800 30px system-ui'; x.textAlign='center'; x.fillText('TOL',62,48); x.font='700 16px system-ui'; x.fillText('Jagorawi',62,74); x.font='800 26px system-ui'; x.fillText('→',62,104); });
      cells.back=[900,900,40,40]; x.fillStyle='#8A93A8'; x.fillRect(900,900,40,40); });
    atlas.anisotropy=4;
    const uvGeo=(key,w,h)=>{ const g=new THREE.PlaneGeometry(w,h), r=cells[key], uv=g.attributes.uv; const u0=r[0]/AW,u1=(r[0]+r[2])/AW,v1=1-r[1]/AH,v0=1-(r[1]+r[3])/AH;
      for(let i=0;i<uv.count;i++) uv.setXY(i,uv.getX(i)?u1:u0,uv.getY(i)?v1:v0); return g; };
    const SG=new Parts(), POLE=0x8A93A8;
    const board=(key,w,h,x,y,z,ry)=>{ SG.add(uvGeo(key,w,h),0xFFFFFF,x+Math.sin(ry)*0.03,y,z+Math.cos(ry)*0.03,ry); SG.add(uvGeo('back',w,h),0xFFFFFF,x-Math.sin(ry)*0.01,y,z-Math.cos(ry)*0.01,ry+Math.PI); };
    const post=(x,z,h=2.9)=>city.add(gCyl(0.05,h,6),POLE,x,h/2,z);
    for(const sd of Store.all('signals')){ if(sd.z===ZHW) continue; const nh=NAMES_H[String(sd.z)], nv=NAMES_V[String(sd.x)]; if(!nh||!nv) continue;
      const px=sd.x+ROAD/2+1.0, pz=sd.z-ROAD/2-1.0; post(px,pz,3.6);
      board(nh,2.6,0.46,px+1.1,3.35,pz,0); board(nv,2.6,0.46,px,2.85,pz-1.1,-Math.PI/2); }
    for(const x of RX){ const px=x-ROAD/2-1.0, pz=ZHW+ROAD/2+1.0; post(px,pz,3.4); board('Jl. Lingkar Utara',2.6,0.46,px-1.1,3.2,pz,0); board('truckok',0.8,0.8,px,2.2,pz+0.02,Math.PI);
      post(px,pz+12); board('truckok',0.8,0.8,px,2.4,pz+12,0); }
    for(let gx=GRID.x0;gx<=GRID.x1;gx++) for(let gz=GRID.z0;gz<=GRID.z1;gz++){ const cx=gx*PX, cz=gz*PZ, bw=PX-ROAD, bd=PZ-ROAD;
      const sx=cx-bw/2+9, sz=cz+bd/2-0.7, car=CAR_H.includes(cz+PZ/2); post(sx,sz); board(car?'speed40':'speed30',0.75,0.75,sx,2.55,sz,0);
      const vx=cx-bw/2+0.7, vz=cz-bd/2+10; post(vx,vz); board(CAR_V.includes(cx-PX/2)?'speed40':'speed30',0.75,0.75,vx,2.55,vz,-Math.PI/2);
      if(CAR_H.includes(cz+PZ/2)&&RX.includes(cx+PX/2)){ const nx=cx+bw/2-3, nz=cz+bd/2-0.7; post(nx,nz); board('notruck',0.75,0.75,nx,2.55,nz,0); } }
    for(const x of [-60,90,240]){ post(x,ZHW+ROAD/2+1.2,3.0); board('toll',0.95,0.95,x,2.6,ZHW+ROAD/2+1.2,0); }
    const sm=SG.build(.55,false,atlas); sm.material.side=THREE.FrontSide; g.add(sm); View.clutter.push(sm);
  }
  g.add(L.build(.9,false)); g.add(plates.build(.9,false,paveTex)); const c0=g.children.length; g.add(city.build(.75)); { const bm=bldg.build(.6,true,windowTex); bm.material.emissive=C(0xFFD49A); bm.material.emissiveMap=windowTex; bm.material.emissiveIntensity=0; View.nightMats.push({m:bm.material,max:0.95}); g.add(bm); } g.add(glass.build(.25,true,glassTex)); g.add(trees.build(.8)); BB.build(g); View.clutter.push(...g.children.slice(c0));
  return g;
}

