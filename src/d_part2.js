
/* ---------- site view: dibangun dari record site (angka tata letak) ---------- */
const pickMat=new THREE.MeshBasicMaterial({visible:true});
function pickBox(w,h,d){ const m=new THREE.Mesh(gR(w,h,d,0),pickMat); m.layers.set(1); return m; }
function rectLine(P,cx,cz,lw,ld,y,c=0xF0B43C){P.box(lw,0.012,0.07,0,c,cx,y,cz-ld/2);P.box(lw,0.012,0.07,0,c,cx,y,cz+ld/2);P.box(0.07,0.012,ld,0,c,cx-lw/2,y,cz);P.box(0.07,0.012,ld,0,c,cx+lw/2,y,cz);}
const tagRef=(obj,table,id)=>{ obj.traverse(o=>o.userData.ref={table,id}); View.pickables.push(obj); };
const RIB=(()=>{const t=canvasTex(64,8,(x,w,h)=>{x.fillStyle='#F4F6FB';x.fillRect(0,0,w,h);x.fillStyle='#D7DDEC';x.fillRect(0,0,14,h);x.globalAlpha=.5;x.fillRect(14,0,4,h);x.globalAlpha=1;x.fillStyle='#FFFFFF';x.fillRect(40,0,6,h);});t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;})();
const FLAT=[0.45,0.5];
/* v41: tata letak lapis tampilan untuk motor staf & ojol (koordinat lokal site). Pintu belakang di pagar belakang sisi timur,
   parkir motor di belakang kantin, pintu staf di ujung timur dinding belakang gedung. Tidak memakai Store/RAND */
const LOTS=new Map();
function staffLot(s){ let L=LOTS.get(s.id); if(L) return L; const X=s.W/2, fz=s.fz, zi0=s.bounds.zi0, CZ=-fz-9.5, GX=X+17.8, rows=[CZ-4.8,CZ-7.0], slots=[];
  for(const rz of rows) for(let i=0;i<4;i++) slots.push({x:X+12.2+i*1.2,z:rz,h:-Math.PI/2});
  L={X,fz,CZ,GX,zg:zi0+0.3,rows,slots,out:{x:GX,z:zi0-2.6},door:{x:X-2.0,z:-fz-0.35},walkX:X+9.6,walkZ:-fz-1.4,ojol:{x:X+20.6,z:CZ+0.4}}; LOTS.set(s.id,L); return L; }
/* v44: bekas ban & noda oli di halaman gudang (gaya realistis). Jejak mundur di depan tiap bay, jejak lalu-lalang di lajur halaman,
   noda oli tempat truk biasa berhenti. Satu mesh per jenis per gudang, tekstur gelap transparan di atas apron (polygonOffset, tanpa z-fight) */
const TIRE_TEX=(()=>{ const t=canvasTex(32,256,(x,w,h)=>{ x.clearRect(0,0,w,h); const r=rng(77); for(let i=0;i<900;i++){ const px=4+r()*24, py=r()*h, a=0.03+r()*0.08; x.fillStyle=`rgba(20,18,16,${a})`; x.fillRect(px,py,1+r()*2,2+r()*7); } }); t.wrapT=THREE.RepeatWrapping; return t; })();
const OIL_TEX=canvasTex(128,128,(x,w,h)=>{ x.clearRect(0,0,w,h); const r=rng(31); for(let i=0;i<7;i++){ const cx=40+r()*48, cy=40+r()*48, rad=14+r()*26, g=x.createRadialGradient(cx,cy,0,cx,cy,rad); g.addColorStop(0,'rgba(24,20,16,.1)'); g.addColorStop(0.7,'rgba(24,20,16,.04)'); g.addColorStop(1,'rgba(18,16,14,0)'); x.fillStyle=g; x.fillRect(0,0,w,h); } });
function groundDecals(g,s){ const tire=[], oil=[], y=0.099;
  const strip=(x0,z0,x1,z1,w)=>{ const dx=x1-x0, dz=z1-z0, L=Math.hypot(dx,dz), nx=-dz/L*w/2, nz=dx/L*w/2; tire.push([x0+nx,z0+nz,x1+nx,z1+nz,x1-nx,z1-nz,x0-nx,z0-nz,L/6]); };
  const yard=s.zDock+6.4, xs=s.bays.map(b=>b.x), xa=xs[0]-28, xb=xs[xs.length-1]+14;
  for(const b of s.bays){ for(const k of [-0.86,0.86]) strip(b.x+k,s.zDock-2.4,b.x+k*1.05,yard+1.5,0.36); oil.push([b.x+(hsh(b.x,s.idx)-0.5)*0.6,s.zDock+0.6,1.7]); oil.push([b.x,yard,1.2]); }
  for(const k of [-0.86,0.86]) strip(xa,yard+k,xb,yard+k,0.4);
  const mk=(quads,tex)=>{ const pos=[],uv=[],ind=[]; quads.forEach((q,i)=>{ for(let j=0;j<4;j++) pos.push(q[j*2],y,q[j*2+1]); const v=q[8]||1; uv.push(0,0,1,0,1,v,0,v); const o=i*4; ind.push(o,o+2,o+1,o,o+3,o+2); });
    const ge=new THREE.BufferGeometry(); ge.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); ge.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2)); ge.setIndex(ind); ge.computeBoundingSphere();
    const m=new THREE.Mesh(ge,new THREE.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-2,side:THREE.DoubleSide})); m.renderOrder=1; g.add(m); };
  mk(tire,TIRE_TEX); mk(oil.map(([x,z,r])=>[x-r,z-r,x+r,z-r,x+r,z+r,x-r,z+r,1]),OIL_TEX); }
/* v44.1: bekukan matriks objek statis (gedung, jalan, pohon, rambu, pinggiran kota) setelah semua dibangun.
   Dari ±4.000 objek di scene, sebagian besar tidak pernah bergerak, tetapi three.js menyusun ulang matriksnya tiap frame.
   Yang tetap bergerak dikecualikan: daun pintu dock, lengan palang gerbang & tol, pin palet QC. Objek yang dibuat sesudahnya
   (truk, forklift, palet, efek cuaca, sorotan) tidak tersentuh karena fungsi ini dipanggil sebelum bindEntities */
function freezeStatic(){ const keep=new Set(), add=o=>o&&o.traverse(x=>keep.add(x));
  for(const v of View.docks.values()) add(v.door); for(const G of View.gates||[]) add(G.piv); for(const b of View.barriers) add(b.piv); for(const h of View.holds){ add(h.pin); add(h.disc); }
  scene.traverse(o=>{ if(o.isLight){ keep.add(o); if(o.target) keep.add(o.target); } });   /* matahari & targetnya ikut kamera */
  let n=0; scene.updateMatrixWorld(true);
  scene.traverse(o=>{ if(o===scene||keep.has(o)||!o.matrixAutoUpdate) return; o.matrixAutoUpdate=false; n++; });
  return n; }
function buildSiteView(s){
  const R=rng(s.idx*977+513), W=s.W, D=s.D, H=s.H, fz=s.fz;
  const g=new THREE.Group(); g.position.set(s.ox,0,s.oz); scene.add(g);
  View.sites.set(s.id,{g});
  const {xi0,xi1,zi0,zi1}=s.bounds;
  const BB=new BlobBatch(), ST=new Parts(), LN=new Parts(), TR=new Parts(), WP=new Parts(), TP=new Parts(), INT=new Parts(), PK=new Parts(), GLS=new Parts();
  const prof=s.profile||'general', xdH=Math.ceil(s.bays.length/2);
  const fanPts=[];

  const wall=(geo,col,x,y,z,ry,su,sv=1,uvc=null)=>WP.add(geo,col,x,y,z,ry,1,1,1,0,0,su,sv,uvc);
  ST.box(xi1-xi0,0.02,zi1-zi0,0.2,0xE9EDF8,(xi0+xi1)/2,0.085,(zi0+zi1)/2);
  const bxs=s.bays.map(b=>b.x), dw0=bxs[0]-4, dw1=bxs[bxs.length-1]+RT+6;
  ST.box(dw1-dw0,0.02,SW+0.2,0.1,0xE3E8F6,(dw0+dw1)/2,0.088,zi1+SW/2);
  for(let x=dw0;x<dw1;x+=1.1) LN.box(0.55,0.01,0.09,0,0xF0B43C,x,0.1,s.zDock+4.4);
  for(const bx of bxs){ rectLine(LN,bx,s.zDock,2.7,7.2,0.1); for(const k of [-1,1]) LN.box(0.08,0.01,1.0,0,0xFFFFFF,bx+k*0.7,0.1,s.zE+0.8); }
  /* gedung: semua dinding & atap bergelombang = 1 mesh */
  const BLUE=0x3463F2, DW=2.3, DH=2.7, DEPTH=1.2, cold=s.roof==='flat', WC=0xFFFFFF;
  const bodyD=D-DEPTH, bz=-DEPTH/2;
  const SIDE=cold?0xF2F4FA:0x3B69F2, FAC=cold?0xFFFFFF:0xEEF1F8;
  wall(new THREE.PlaneGeometry(W,H),SIDE,0,H/2,-fz,Math.PI,W/0.36);
  wall(new THREE.PlaneGeometry(bodyD,H),SIDE,W/2,H/2,bz,Math.PI/2,bodyD/0.36);
  wall(new THREE.PlaneGeometry(bodyD,H),SIDE,-W/2,H/2,bz,-Math.PI/2,bodyD/0.36);
  wall(new THREE.PlaneGeometry(W,H),0x9AA4C8,0,H/2,fz-DEPTH,0,1,1,FLAT);
  wall(gR(W,PH,DEPTH,0),0xC9D1EA,0,PH/2,fz-DEPTH/2,0,W/0.36);
  const edges=[-W/2]; bxs.forEach(b=>edges.push(b-DW/2,b+DW/2)); edges.push(W/2);
  for(let k=0;k<edges.length;k+=2){const a=edges[k],b=edges[k+1],pw=b-a; if(pw<0.02) continue; wall(gR(pw,DH,DEPTH,0),FAC,(a+b)/2,PH+DH/2,fz-DEPTH/2,0,pw/0.36);}
  wall(gR(W,H-PH-DH,DEPTH,0),FAC,0,PH+DH+(H-PH-DH)/2,fz-DEPTH/2,0,W/0.36);
  TP.box(W-0.1,0.04,DEPTH,0,0xCDD4E8,0,PH-0.01,fz-DEPTH/2);
  const trim=cold?0x1F3A93:BLUE;
  for(const [x,z] of [[-W/2,fz],[W/2,fz],[-W/2,-fz],[W/2,-fz]]) TP.box(0.36,H+0.04,0.36,0.08,trim,x,H/2,z);
  if(!cold){ for(let i=0;i<bxs.length-1;i++){ const px=(bxs[i]+bxs[i+1])/2; TP.box(0.3,H-PH+0.02,0.22,0.06,trim,px,PH+(H-PH)/2,fz+0.04); }
    TP.box(W+0.1,0.24,0.18,0.05,trim,0,PH+0.12,fz+0.04);
    for(const x of [-W/2+0.42,W/2-0.42]){ TP.add(gCyl(0.07,H-0.3,8),0xF4F6FB,x,H/2-0.1,fz+0.26); TP.box(0.2,0.12,0.36,0.04,0xF4F6FB,x,H-0.2,fz+0.12); }
    TP.box(0.7,0.5,0.14,0.06,0xF4F6FB,-W/2+2.0,H-0.7,fz+0.07); for(let k=0;k<3;k++) TP.box(0.56,0.04,0.02,0,0x9AA3BA,-W/2+2.0,H-0.85+k*0.14,fz+0.15); }
  if(cold){ TP.box(W+0.34,0.32,0.08,0.03,trim,0,H-0.2,fz+0.04); TP.box(0.08,0.32,D+0.34,0.03,trim,-W/2-0.04,H-0.2,0); TP.box(0.08,0.32,D+0.34,0.03,trim,W/2+0.04,H-0.2,0); }
  const bg=new THREE.Group(); g.add(bg);
  decal(bg,signTex(s.id,s.name),3.2,1.0,W/2-2.4,H-1.0,fz+0.03);
  const RC=0x3F6EF7, slab=(w,l,x,y,z,rx)=>{ WP.add(gR(w,0.16,l,0.04),RC,x,y,z,0,1,1,1,rx,0,w/0.34,1); };
  const decalAt=(x,y,z,rx)=>{ const host=new THREE.Object3D(); host.position.set(x,y,z); host.rotation.x=rx; bg.add(host);
    const dec=new THREE.Mesh(new THREE.PlaneGeometry(1.9,2.375),new THREE.MeshBasicMaterial({map:roofDecal(s.id),transparent:true})); dec.rotation.x=-Math.PI/2; dec.position.set(-W*0.12,0.09,0); host.add(dec); };
  const gable=(pts,x,left,yb)=>{ const sh=new THREE.Shape(); sh.moveTo(pts[0][0]*(left?-1:1),pts[0][1]); for(let i=1;i<pts.length;i++) sh.lineTo(pts[i][0]*(left?-1:1),pts[i][1]); sh.closePath();
    WP.add(new THREE.ShapeGeometry(sh),cold?0xE7EBF6:0x3463F2,x,yb??H,0,left?-Math.PI/2:Math.PI/2,1,1,1,0,0,1/0.36,1/0.36); };
  if(s.roof==='gable'){
    const dk=D+0.7, rh=dk*0.19, a=Math.atan(rh/(dk/2)), L=(dk/2)/Math.cos(a)+0.06;
    /* gedung multi-bagian: bagian kiri lebih tinggi, masing-masing beratap pelana */
    const split=W>=14?-W/2+Math.round(W*0.4):null;
    const secs=split!==null?[{x0:-W/2,x1:split,h:H+1.4,main:false},{x0:split,x1:W/2,h:H,main:true}]:[{x0:-W/2,x1:W/2,h:H,main:true}];
    for(const sc of secs){ const sw=sc.x1-sc.x0, cx=(sc.x0+sc.x1)/2, hh=sc.h, ov=sc.main?0.35:0.3;
      if(hh>H){ const eh=hh-H;
        wall(new THREE.PlaneGeometry(sw,eh),FAC,cx,H+eh/2,fz+0.001,0,sw/0.36);
        wall(new THREE.PlaneGeometry(sw,eh),SIDE,cx,H+eh/2,-fz,Math.PI,sw/0.36);
        wall(new THREE.PlaneGeometry(D,eh),SIDE,sc.x0,H+eh/2,0,-Math.PI/2,D/0.36);
        wall(new THREE.PlaneGeometry(D,eh),SIDE,sc.x1,H+eh/2,0,Math.PI/2,D/0.36);
        TP.box(sw+0.1,0.18,0.22,0.05,trim,cx,H+0.02,fz+0.05);
        for(const x of [sc.x0,sc.x1]) TP.box(0.36,eh+0.04,0.36,0.08,trim,x,H+eh/2,fz); }
      for(const k of [1,-1]) slab(sw+ov*2,L,cx,hh+rh/2+0.06,k*dk/4,k*a);
      if(prof==='dc') for(const k of [1,-1]) for(let xx=sc.x0+1.4;xx<sc.x1-0.9;xx+=2.6) GLS.add(gR(0.95,0.05,L*0.72,0),0xFFFFFF,xx,hh+rh/2+0.06+0.1*Math.cos(k*a),k*dk/4+0.1*Math.sin(k*a),0,1,1,1,k*a,0);
      if(sc.main) decalAt(cx+W*0.12,hh+rh/2+0.06,dk/4,a);
      const tri=[[-dk/2+0.35,0],[dk/2-0.35,0],[0,rh]];
      if(!(split!==null&&sc.main)) gable(tri,sc.x0-0.002,true,hh); gable(tri,sc.x1+0.002,false,hh);
      TP.box(sw+ov*2+0.1,0.16,0.42,0.06,0x7C9DFF,cx,hh+rh+0.1,0);
      for(const k of [1,-1]) TP.box(sw+ov*2,0.18,0.2,0.06,0xF4F6FB,cx,hh+0.03,k*(dk/2-0.04));
      const nv=Math.max(1,Math.floor(sw/6));
      for(let i=0;i<nv;i++){ const vx=sc.x0+(i+0.5)*sw/nv, vz=-dk/4, vy=hh+rh*0.5+0.2;
        WP.add(gR(0.8,0.34,0.8,0.08),0xF4F6FB,vx,vy+0.12,vz,0,1,1,1,-a,0,1,1,[0.5,0.5]); }
    }
  } else if(s.roof==='saw'){
    const n=Math.max(3,Math.round(D/3)), dk=D/n, th=1.3, a=Math.atan(th/dk), L=dk/Math.cos(a)+0.04;
    for(let i=0;i<n;i++){ const z0=-fz+i*dk;
      slab(W+0.4,L,0,H+th/2+0.05,z0+dk/2,a); if(i===n-1) decalAt(0,H+th/2+0.05,z0+dk/2,a);
      if(prof==='robotic') for(let xx=-W/2+1.1;xx<W/2-0.6;xx+=1.75){ const yy=H+th/2+0.05+0.11*Math.cos(a), zz=z0+dk/2+0.11*Math.sin(a); TP.add(gR(1.6,0.05,L*0.8,0),0x1E2A55,xx,yy,zz,0,1,1,1,a,0); TP.add(gR(1.62,0.06,0.03,0),0x5B7BD5,xx,yy+0.005,zz,0,1,1,1,a,0); }
      TP.box(W+0.2,th,0.08,0,0x9DB4EE,0,H+th/2,z0+0.04);
      const tri=[[-z0,0],[-(z0+dk),0],[-z0,th]]; gable(tri,W/2+0.002,false); gable(tri,-W/2-0.002,true); }
    TP.box(W+0.4,0.14,0.16,0.06,0xFFFFFF,0,H+0.02,fz+0.05);
  } else {
    TP.box(W+0.3,0.3,D+0.3,0.08,0xF2F4FA,0,H+0.15,0); TP.box(W+0.36,0.12,D+0.36,0.05,trim,0,H+0.3,0); TP.box(W-0.2,0.08,D-0.2,0.05,0xE8ECF6,0,H+0.34,0);
    for(let i=0;i<Math.floor(W/4.2);i++) for(const zz of [-fz*0.5,fz*0.45]){ const x=-W/2+2.6+i*4.2; TP.box(1.7,0.55,1.0,0.12,0xF6F8FC,x,H+0.66,zz); for(const dx of [-0.42,0.42]){ TP.add(gCyl(0.33,0.05,16),0x3B4466,x+dx,H+0.95,zz); TP.add(gCyl(0.08,0.07,8),0x9AA3BA,x+dx,H+0.97,zz); fanPts.push([x+dx,H+1.01,zz]); } }
    decal(bg,roofDecal(s.id),2.4,3.0,-W*0.12,H+0.4,0,0,-Math.PI/2);
  }
  BB.add(W+5,D+5,0,0,0.1,true);
  if(s.annex){ const AW=5.6, AD=Math.min(4.5,D-4.4), AH=H+1.1, ax=-W/2-AW/2, az=-fz+AD/2;
    const AHw=H-0.6; wall(gR(AW,AHw,AD,0),0x3B69F2,ax,AHw/2,az,0,AW/0.36);
    const adk=AD+0.5, arh=adk*0.22, aa=Math.atan(arh/(adk/2)), aL=(adk/2)/Math.cos(aa)+0.05;
    for(const k of [1,-1]) WP.add(gR(AW+0.5,0.14,aL,0.04),0x3F6EF7,ax,AHw+arh/2+0.05,az+k*adk/4,0,1,1,1,k*aa,0,(AW+0.5)/0.34,1);
    { const tri=new THREE.Shape(); tri.moveTo(-adk/2+0.25,0); tri.lineTo(adk/2-0.25,0); tri.lineTo(0,arh); tri.closePath();
      WP.add(new THREE.ShapeGeometry(tri),0x3463F2,ax-AW/2-0.002,AHw,az,-Math.PI/2,1,1,1,0,0,1/0.36,1/0.36); }
    TP.box(AW+0.6,0.14,0.34,0.05,0x7C9DFF,ax,AHw+arh+0.08,az);
    for(const x of [ax-AW/2,ax+AW/2]) for(const z of [az-AD/2,az+AD/2]) TP.box(0.3,AHw+0.04,0.3,0.07,0x2449D8,x,AHw/2,z);
    TP.box(1.1,2.1,0.08,0.04,0xF4F6FB,ax+0.6,1.05,az+AD/2+0.04); TP.box(0.5,0.5,0.06,0.03,0x9DB4EE,ax-1.4,AHw*0.6,az+AD/2+0.04);
    BB.add(AW+3,AD+3,ax,az,0.1,true); const pk=pickBox(AW,AHw,AD); pk.position.set(ax,AHw/2,az); g.add(pk); tagRef(pk,'sites',s.id); }
  if(cold){ for(let i=0;i<3;i++){ const x=W/2-3-i*3.4, z=-fz-4.6; ST.add(gCyl(1.5,8,20),0xF4F6FB,x,4.1,z); ST.add(gHemi(1.5),0xE6EBF6,x,8.1,z); BB.add(4.4,4.4,x,z,0.1); } }
  wall(gR(2.5,2.6,6.2,0.08),0x17A090,-W/2-24,1.36,fz-8,0,16); BB.add(4,8.4,-W/2-24,fz-8,0.1,true);
  const bpk=pickBox(W,H,D); bpk.position.set(0,H/2,0); g.add(bpk); tagRef(bpk,'sites',s.id);
  if(prof==='robotic'){ TP.box(0.06,1.0,D-1.6,0.02,0x22305F,-W/2-0.04,H-0.85,0); TP.box(0.07,0.06,D-1.4,0,0x60A5FA,-W/2-0.05,H-0.3,0); }
  /* jendela kecil di dinding samping + ventilasi ujung pelana */
  if(!cold){ const zmin=s.annex?-fz+Math.min(4.5,D-4.4)+0.9:-fz+1.2;
    for(const z of [fz-2.6,fz-5.8,fz-9.0]){ if(z<zmin) continue; TP.box(0.06,0.62,0.9,0.03,0xF4F6FB,-W/2-0.02,H*0.62,z); TP.box(0.07,0.48,0.76,0.02,0x1B2A5C,-W/2-0.04,H*0.62,z); }
    TP.box(0.06,0.5,0.5,0.03,0xF4F6FB,-W/2-0.02,H+0.55,0); for(let k=0;k<3;k++) TP.box(0.07,0.05,0.4,0,0x5A6178,-W/2-0.05,H+0.4+k*0.14,0); }
  /* platform */
  const PL=new Parts(), xs0=s.xs0, xs1=s.xs1, conc=0xE4E8F4, yE=PH+0.012;
  PL.box(xs1-xs0,PH,3.4,0.05,conc,(xs0+xs1)/2,PH/2,fz+1.7); PL.box(-W/2-0.4-xs0,PH,10.2,0.05,conc,(xs0-W/2-0.4)/2,PH/2,fz+1.5);
  PL.box(xs1-(-W/2-0.4),0.03,0.16,0,0xF0B43C,(xs1-W/2-0.4)/2,yE,s.zE-0.1); PL.box(-W/2-0.4-xs0,0.03,0.16,0,0xF0B43C,(xs0-W/2-0.4)/2,yE,fz+6.5);
  PL.box(0.16,0.03,10.2,0,0xF0B43C,xs0+0.1,yE,fz+1.5); PL.box(-W/2-0.4-xs0,0.03,0.16,0,0xF0B43C,(xs0-W/2-0.4)/2,yE,fz-3.5); PL.box(0.16,0.03,3.2,0,0xF0B43C,-W/2-0.5,yE,fz+5.0);
  for(let x=-W/2+0.4;x<W/2;x+=1.0) PL.box(0.5,0.012,0.07,0,0xF0B43C,x,yE,fz+0.72);
  for(let x=xs0+0.5;x<xs1;x+=1.0){ PL.box(0.5,0.012,0.05,0,0xFFFFFF,x,yE,s.zc+0.72); PL.box(0.5,0.012,0.05,0,0xFFFFFF,x,yE,s.zc-0.72); }
  for(let k=0;k<4;k++) PL.box(1.2,PH*(4-k)/4,0.42,0.03,0xD9DEEC,xs1+0.6,PH*(4-k)/8,s.zE-0.25-k*0.42);
  for(const k of [-1,1]) PL.box(0.05,1.0,0.05,0.02,0x9AA3BA,xs1+0.6+k*0.6,PH+0.5,s.zE-0.9);
  PL.box(0.05,0.05,1.7,0.02,0x9AA3BA,xs1+1.2,PH+1.0,s.zE-0.9);
  BB.add(xs1-xs0+3,5,(xs0+xs1)/2,fz+2,0.1,true); BB.add(-W/2-xs0+3,12,(xs0-W/2)/2,fz+1.5,0.1,true);
  /* docks */
  for(const d of s.bays){ const bx=d.x;
    const inb=prof==='crossdock'&&d.i<xdH, fc=prof==='crossdock'?(inb?0x16A34A:0xF97316):BLUE;
    for(const k of [-1,1]) TP.box(0.16,DH+0.14,0.24,0.05,fc,bx+k*(DW/2+0.06),PH+(DH+0.14)/2-0.04,fz+0.06);
    TP.box(DW+0.44,0.16,0.24,0.05,fc,bx,PH+DH+0.06,fz+0.06);
    decal(g,plateTex(String(d.i+1).padStart(2,'0'),prof==='crossdock'?(inb?'#15803D':'#C2410C'):'#16224D'),0.46,0.38,bx,PH+DH+0.5,fz+0.06);
    if(prof==='cold'){ for(const k of [-1,1]) TP.box(0.3,DH+0.3,0.55,0.08,0x23262F,bx+k*(DW/2+0.2),PH+(DH+0.3)/2-0.05,fz+0.3); TP.box(DW+0.7,0.34,0.55,0.08,0x23262F,bx,PH+DH+0.16,fz+0.3); }
    const door=new THREE.Mesh(gR(DW-0.02,DH,0.06,0),doorMat); door.position.set(bx,PH+DH/2,fz-0.06); door.castShadow=true; g.add(door);
    for(const k of [-1,1]) makePallet_static(R()<.25?'crate':R()<.15?'white':'box',R,2+Math.floor(R()*2),bx+k*0.52,PH,fz-0.62,0.8,g);
    INT.add(new THREE.PlaneGeometry(DW,DH),0xEEF1FA,bx,PH+DH/2,fz-DEPTH+0.02,0); INT.add(new THREE.PlaneGeometry(DW,DEPTH),0xE2E6F4,bx,PH+0.005,fz-DEPTH/2,0,1,1,1,-Math.PI/2,0);
    for(const k of [-1,1]) INT.add(new THREE.PlaneGeometry(DEPTH,DH),0xD9DEEE,bx+k*DW/2*0.99,PH+DH/2,fz-DEPTH/2,-k*Math.PI/2);
    ST.box(2.2,0.03,1.4,0.02,0xB5BEDC,bx,PH+0.015,s.zE-0.72); for(const k of [-1,1]) ST.box(0.26,0.42,0.16,0.07,0x2B2F3A,bx+k*1.0,PH-0.3,s.zE+0.06);
    const lamp=RB(g,0.16,0.16,0.06,0.04,LAMP[0],bx+DW/2+0.36,PH+2.4,fz+0.03,{cast:false});
    const pk=pickBox(2.6,3.2,1.0); pk.position.set(bx,PH+1.5,fz+0.4); g.add(pk); tagRef(pk,'docks',d.id);
    View.docks.set(d.id,{door,lamp,open:0}); }
  if(prof==='crossdock'){ const ib=s.bays.filter(b=>b.i<xdH), ob=s.bays.filter(b=>b.i>=xdH), mid=a=>(a[0].x+a[a.length-1].x)/2, wid=a=>a[a.length-1].x-a[0].x+3.4;
    decal(g,storeSign('Inbound · Bongkar','#15803D'),Math.min(wid(ib),6.5),0.42,mid(ib),PH*0.5,s.zE+0.02); decal(g,storeSign('Outbound · Muat','#C2410C'),Math.min(wid(ob),6.5),0.42,mid(ob),PH*0.5,s.zE+0.02); }
  for(const sl of s.slots){ rectLine(LN,sl.x,sl.z,1.2,1.2,PH+0.014); const pb=pickBox(1.0,1.0,1.0); pb.position.set(sl.x,PH+0.5,sl.z); g.add(pb); tagRef(pb,'slots',sl.id); View.slots.set(sl.id,pb); }
  for(const r of s.rest){ ST.box(0.62,1.0,0.38,0.12,0xF4F6FB,r.x,PH+0.5,fz-2.75); ST.box(0.3,0.08,0.04,0.02,0x22C55E,r.x,PH+0.82,fz-2.55); }
  for(const p of s.holds){ rectLine(LN,p.holdPos.x,p.holdPos.z,1.5,1.5,0.1); const pin=makePin(); pin.scale.setScalar(1.25); pin.position.set(p.holdPos.x,1.7,p.holdPos.z); g.add(pin); tagRef(pin,'pallets',p.id); View.holds.push({pin,disc:pin.userData.disc,base:1.7,ph:View.holds.length*1.3}); }
  /* dekorasi (bukan data inventaris) */
  const rx0=W/2+10.4, rz0=fz-9; if(prof!=='crossdock'){
  for(const dx of [-1.85,0,1.85]) for(const dz of [-0.55,0.55]) TP.box(0.11,3.3,0.11,0.03,0x2E5BFF,rx0+dx,1.7,rz0+dz);
  for(const y of [0.18,1.2,2.22,3.25]){ TP.box(3.8,0.12,0.09,0.03,0xF28C28,rx0,y,rz0+0.55); TP.box(3.8,0.12,0.09,0.03,0xF28C28,rx0,y,rz0-0.55); }
  BB.add(5,2.6,rx0,rz0,0.1,true);
  for(const y of [0.24,1.26,2.28]) for(let q=0;q<3;q++){ if(R()<0.15) continue; makePallet_static(R()<0.25?'crate':R()<.2?'white':'box',R,1,rx0-1.25+q*1.25,y,rz0,0.88,g); }
  }
  for(let q=0;q<3;q++){ const a=makePallet(q===2?'white':'crate',R,R()<.5?1:2); a.position.set(W/2+8.2+q*1.35,GY,fz-6.2); g.add(a); STATIC_PALLETS.push(a); }
  if(s.gate){ const gp=s.gate.post; TP.box(1.7,2.3,1.7,0.12,0xF4F6FB,gp.x,1.15,gp.z); TP.box(1.72,0.7,1.72,0.06,0x9DB4EE,gp.x,1.6,gp.z); TP.box(2.1,0.16,2.1,0.06,0x2E5BE6,gp.x,2.38,gp.z);
    TP.box(0.7,1.5,0.06,0.03,0xD7DCEA,gp.x+0.5,0.8,gp.z+0.86); decal(g,storeSign('Pos Satpam','#1E2A55'),1.5,0.26,gp.x,2.1,gp.z+0.88); BB.add(2.6,2.6,gp.x,gp.z,0.1); }
  /* gerbang check-in truk (v32): pos jaga, palang bergerak, garis stop, marka area tunggu */
  { const G=siteGate(s), yZ=yardZ(s), bx=G.booth.x, bz=G.booth.z;
    TP.box(1.6,2.4,1.5,0.12,0xF4F6FB,bx,1.2,bz); TP.box(1.62,0.75,1.52,0.05,0x9DB4EE,bx,1.6,bz); TP.box(2.0,0.16,1.9,0.06,0x2E5BE6,bx,2.46,bz);
    TP.box(0.62,1.5,0.06,0.03,0xD7DCEA,bx+0.4,0.8,bz+0.76); decal(g,storeSign('Check-in','#1E2A55'),1.3,0.24,bx,2.18,bz+0.77); BB.add(2.2,2.1,bx,bz,0.1);
    TP.box(0.34,1.05,0.34,0.06,0xE9EDF8,G.armX,0.55,G.zArm1+0.12); TP.box(0.36,0.16,0.36,0.04,0xE5484D,G.armX,1.0,G.zArm1+0.12);
    const piv=new THREE.Group(); piv.position.set(G.armX,1.0,G.zArm1); g.add(piv);
    const AP=new Parts(), n=5, seg=(G.zArm1-G.zArm0)/n; for(let i=0;i<n;i++) AP.add(gR(0.1,0.1,seg,0),i%2?0xE5484D:0xFFFFFF,0,0,-(seg/2+i*seg)); piv.add(AP.build(.5));
    (View.gates||(View.gates=[])).push({piv,site:s});
    LN.box(0.14,0.012,2.9,0,0xFFFFFF,G.armX-0.55,0.1,yZ);
    const ax0=G.armX+1.2, ax1=s.bays[0].x-3.0; if(ax1>ax0+4){ rectLine(LN,(ax0+ax1)/2,yZ,ax1-ax0,3.1,0.1,0xF0B43C);
      for(let x=ax0+0.6;x<ax1-0.4;x+=1.6) LN.box(0.7,0.012,0.12,0,0xF0B43C,x+0.35,0.1,yZ-1.95);
      const tex=canvasTex(512,80,(x,w,h)=>{ x.fillStyle='rgba(183,110,0,.92)'; x.font='800 46px "Plus Jakarta Sans", system-ui, sans-serif'; x.textAlign='center'; x.textBaseline='middle'; x.fillText('AREA TUNGGU',w/2,h/2+2); });
      decal(g,tex,Math.min(5.2,ax1-ax0-1),0.8,(ax0+ax1)/2,0.11,yZ+0.95,0,-Math.PI/2); } }
  /* Pos Sopir + jalur pejalan kaki */
  if(s.lounge){ const L=s.lounge, LX=L.x, LZ=L.z, WD=0x9C6B3E;
    ST.box(6.8,0.04,6.0,0.2,0xE7EBF7,LX,0.1,LZ+0.7);
    for(const [px,pz] of [[LX-3.1,LZ-1.9],[LX+3.1,LZ-1.9],[LX-3.1,LZ+1.7],[LX+3.1,LZ+1.7]]) TP.box(0.12,2.7,0.12,0.04,0x9AA3BA,px,1.35,pz);
    for(const z of [LZ-1.9,LZ+1.7]) TP.box(6.8,0.16,0.14,0.04,0x2E5BE6,LX,2.68,z); for(const x of [LX-3.1,LX+3.1]) TP.box(0.14,0.16,3.8,0.04,0x2E5BE6,x,2.68,LZ-0.1);
    for(let i=0;i<9;i++) TP.box(0.14,0.1,4.1,0.03,0xF4F6FB,LX-3.0+i*0.75,2.82,LZ-0.1); TP.box(6.9,0.22,0.08,0.03,0xF4F6FB,LX,2.5,LZ+1.78);
    TP.box(3.5,0.08,0.52,0.03,WD,LX-0.5,0.47,LZ-1.22); TP.box(3.5,0.42,0.07,0.03,WD,LX-0.5,0.78,LZ-1.5); for(const x of [-2.1,-0.5,1.1]) TP.box(0.08,0.44,0.44,0.02,0x5A6178,LX+x,0.22,LZ-1.24);
    TP.add(gCyl(0.48,0.05,16),0xF4F6FB,LX,0.76,LZ+0.55); TP.add(gCyl(0.06,0.72,8),0x5A6178,LX,0.38,LZ+0.55);
    for(const x of [-0.75,0.75]){ TP.add(gCyl(0.2,0.06,12),WD,LX+x,0.47,LZ+0.55); TP.add(gCyl(0.04,0.44,6),0x5A6178,LX+x,0.22,LZ+0.55); }
    TP.box(0.62,1.0,2.2,0.06,0xF4F6FB,LX-2.6,0.5,LZ+1.15); TP.box(0.74,0.06,2.3,0.02,WD,LX-2.6,1.03,LZ+1.15); TP.box(0.3,0.36,0.28,0.05,0xE5484D,LX-2.62,1.24,LZ+1.85);
    for(let k=0;k<3;k++) TP.add(gCyl(0.05,0.1,8),0xFFFFFF,LX-2.5,1.11,LZ+0.5+k*0.18);
    TP.add(gCyl(0.16,0.42,12),0x7FC4F0,LX-2.62,1.27,LZ+0.25); TP.add(gCyl(0.24,0.12,12),0x5A6178,LX+2.7,0.06,LZ-1.4); TP.add(gSph(0.42,10),0x5FB880,LX+2.7,0.55,LZ-1.4);
    decal(g,storeSign('Pos Sopir','#2E5BFF'),2.0,0.32,LX,2.5,LZ+1.84);
    BB.add(7.4,5.2,LX,LZ,0.07,true);
    const wz=s.walkZ, x0=s.walkX, x1=Math.max(...bxs)+3; for(let x=x0;x<x1;x+=1.4){ LN.box(0.8,0.01,0.1,0,0xFFFFFF,x+0.4,0.1,wz-0.75); LN.box(0.8,0.01,0.1,0,0xFFFFFF,x+0.4,0.1,wz+0.75); }
    for(let z=L.entry.z;z<wz;z+=1.4){ LN.box(0.1,0.01,0.8,0,0xFFFFFF,x0-0.75,0.1,z+0.4); LN.box(0.1,0.01,0.8,0,0xFFFFFF,x0+0.75,0.1,z+0.4); } }
  /* v39: kantin pekerja (belakang-timur gedung). Titik duduk, meja saji, dan lajur jalan berasal dari canteen(s) di c_sim */
  { const C=canteen(s), CX=C.x, CZ=C.z, WD=0x9C6B3E, MT=0x5A6178, x0=CX-4.5, x1=CX+3.2, z0=CZ-2.8, z1=CZ+2.75;
    ST.box(x1-x0,0.04,z1-z0,0.2,0xF1E9DA,(x0+x1)/2,0.1,(z0+z1)/2);
    for(const [px,pz] of [[x0+0.15,z0+0.15],[x1-0.15,z0+0.15],[x0+0.15,z1-0.15],[x1-0.15,z1-0.15],[(x0+x1)/2,z0+0.15],[(x0+x1)/2,z1-0.15]]) TP.box(0.14,2.9,0.14,0.04,0x9AA3BA,px,1.45,pz);
    for(const z of [z0+0.15,z1-0.15]) TP.box(x1-x0,0.16,0.16,0.04,0xE5484D,(x0+x1)/2,2.88,z); for(const x of [x0+0.15,x1-0.15]) TP.box(0.16,0.16,z1-z0,0.04,0xE5484D,x,2.88,(z0+z1)/2);
    for(let i=0;i<11;i++) TP.box(0.14,0.1,z1-z0+0.3,0.03,i%2?0xF4F6FB:0xF8D9D9,x0+0.35+i*(x1-x0-0.7)/10,3.02,(z0+z1)/2);
    TP.box(x1-x0+0.1,0.24,0.08,0.03,0xF4F6FB,(x0+x1)/2,2.66,z1-0.1);
    /* meja saji + dapur kecil di belakangnya */
    TP.box(0.62,0.98,3.1,0.06,0xF4F6FB,CX-2.55,0.49,CZ+0.1); TP.box(0.74,0.06,3.2,0.02,0xC9D2E8,CX-2.55,1.0,CZ+0.1);
    const food=[0xF0B43C,0x5FB880,0xE0573B,0xF6E7C1,0x9C6B3E,0x5FB880];
    for(let k=0;k<6;k++){ const fz2=CZ-1.15+k*0.5; TP.box(0.36,0.06,0.36,0.02,0xD7DCEA,CX-2.55,1.06,fz2); TP.box(0.28,0.05,0.28,0.04,food[k],CX-2.55,1.1,fz2); }
    TP.box(0.5,0.32,3.0,0.03,0x9DB4EE,CX-2.55,1.3,CZ+0.1);
    TP.box(0.55,0.95,2.9,0.05,0xE9EDF8,CX-4.05,0.48,CZ+0.05); TP.box(0.5,0.06,0.5,0.02,0x23262F,CX-4.05,0.98,CZ-0.75); TP.box(0.5,0.06,0.5,0.02,0x23262F,CX-4.05,0.98,CZ+0.05);
    TP.add(gCyl(0.2,0.28,12),0xC9D2E8,CX-4.05,1.15,CZ-0.75); TP.add(gCyl(0.16,0.34,12),0xC9D2E8,CX-4.05,1.18,CZ+0.05);
    TP.box(0.55,1.7,0.6,0.06,0xF4F6FB,CX-4.05,0.85,CZ+1.6); TP.box(0.04,0.5,0.03,0.01,MT,CX-3.77,1.1,CZ+1.6);
    /* papan menu + nama */
    TP.box(0.08,0.9,1.5,0.03,0x1E2A55,CX-4.33,2.0,CZ+0.1);
    decal(g,storeSign('Kantin','#E5484D'),1.6,0.3,(x0+x1)/2,2.66,z1-0.04);
    /* dua meja panjang + bangku (titik duduk = C.seats) */
    for(const tz of [CZ-1.2,CZ+1.2]){ TP.box(2.45,0.06,0.74,0.03,WD,CX+0.7,0.76,tz); for(const lx of [-0.45,1.85]) TP.box(0.08,0.72,0.6,0.02,MT,CX+lx,0.38,tz);
      TP.add(gCyl(0.05,0.16,8),0xFFFFFF,CX+0.7,0.87,tz); TP.add(gCyl(0.04,0.12,8),0xE5484D,CX+0.55,0.86,tz+0.05); }
    for(const bz of [CZ-1.97,CZ-0.43,CZ+0.43,CZ+1.97]){ TP.box(2.4,0.07,0.34,0.02,WD,CX+0.7,0.47,bz); for(const lx of [-0.35,1.75]) TP.box(0.07,0.44,0.28,0.02,MT,CX+lx,0.22,bz); }
    /* galon, wastafel, tempat sampah, pot tanaman */
    TP.box(0.36,0.85,0.36,0.04,0xF4F6FB,x1-0.45,0.43,z0+0.45); TP.add(gCyl(0.15,0.42,12),0x7FC4F0,x1-0.45,1.07,z0+0.45);
    TP.box(0.7,0.85,0.42,0.04,0xE9EDF8,x0+1.4,0.43,z0+0.4); TP.box(0.5,0.05,0.3,0.02,0x9DB4EE,x0+1.4,0.87,z0+0.4);
    TP.add(gCyl(0.2,0.55,10),0x178A55,x1-0.45,0.28,z1-0.5); TP.add(gCyl(0.24,0.12,12),MT,x0+0.4,0.06,z1-0.45); TP.add(gSph(0.42,10),0x5FB880,x0+0.4,0.55,z1-0.45);
    BB.add(x1-x0+0.6,z1-z0+0.6,(x0+x1)/2,(z0+z1)/2,0.07,true);
    View.lampPts.push([CX-0.6+s.ox,2.6,CZ+s.oz]);
    /* jalur pejalan kaki dari area kerja ke kantin */
    const lx=C.lane, za=C.entry.z+0.9, zb=fz-7.6; for(let z=za;z<zb;z+=1.4){ LN.box(0.1,0.01,0.8,0,0xFFFFFF,lx-0.7,0.1,z+0.4); LN.box(0.1,0.01,0.8,0,0xFFFFFF,lx+0.7,0.1,z+0.4); } }
  /* v41: pintu belakang staf, parkir motor beratap, dan pintu staf di dinding belakang gedung (tata letak dari staffLot) */
  { const SL=staffLot(s), GX=SL.GX, zg=SL.zg, MT=0x9AA3BA;
    for(const sx of [-1.7,1.7]){ TP.box(0.3,1.9,0.3,0.05,0xE9EDF8,GX+sx,0.95,zg); TP.box(0.34,0.14,0.34,0.04,0x2E5BE6,GX+sx,1.95,zg); }
    decal(g,storeSign('Pintu belakang · staf','#1E2A55'),2.6,0.3,GX,2.25,zg+0.17);
    ST.box(2.6,0.04,(SL.rows[0]+0.6)-zg,0.2,0xDCE1EE,GX,0.1,(zg+SL.rows[0]+0.6)/2);
    const x0=SL.slots[0].x-0.9, x1=SL.slots[3].x+0.7, za=SL.rows[1]-1.3, zb=SL.rows[0]+1.3;
    ST.box(x1-x0,0.04,zb-za,0.2,0xE2E6F1,(x0+x1)/2,0.1,(za+zb)/2);
    for(const sl of SL.slots) LN.box(0.06,0.012,1.9,0,0xFFFFFF,sl.x+0.6,0.1,sl.z);
    for(const [px,pz] of [[x0+0.1,za+0.1],[x1-0.1,za+0.1],[x0+0.1,zb-0.1],[x1-0.1,zb-0.1]]) TP.box(0.1,2.3,0.1,0.03,MT,px,1.15,pz);
    GLS.box(x1-x0+0.3,0.05,zb-za+0.3,0.02,0xFFFFFF,(x0+x1)/2,2.34,(za+zb)/2); for(const z of [za+0.1,(za+zb)/2,zb-0.1]) TP.box(x1-x0+0.3,0.1,0.1,0.02,MT,(x0+x1)/2,2.28,z); /* atap polikarbonat tembus pandang: motor di bawahnya tetap terlihat dari kamera */ TP.box(x1-x0+0.36,0.14,0.08,0.03,0x2E5BE6,(x0+x1)/2,2.28,zb+0.1);
    decal(g,storeSign('Parkir motor','#2E5BFF'),1.5,0.26,(x0+x1)/2,2.05,zb+0.16);
    const D=SL.door; TP.box(1.1,2.15,0.08,0.03,0xC9D2E8,D.x,1.08+GY,-fz-0.03); TP.box(1.3,0.12,0.12,0.03,0x2E5BE6,D.x,2.25,-fz-0.06); TP.box(0.06,0.06,0.1,0.01,0x5A6178,D.x+0.38,1.05,-fz-0.1);
    decal(g,storeSign('Pintu staf','#1E2A55'),1.0,0.2,D.x,2.5,-fz-0.08,Math.PI);
    for(let z=zg+1.4;z<SL.rows[0];z+=1.6) LN.box(0.1,0.012,0.8,0,0xFFFFFF,GX,0.105,z);
    for(let x=SL.walkX;x>D.x+0.6;x-=1.4) LN.box(0.8,0.012,0.08,0,0xFFFFFF,x-0.4,0.1,SL.walkZ); }
  for(let i=0;i<2;i++) for(let j=0;j<2;j++) for(let l=0;l<(i+j===1?2:1);l++) makePallet_static('crate',R,2,W/2+12.6+i*1.3,GY+l*1.18,fz-3.6-j*1.3,0.9,g);
  /* barisan forklift parkir di stasiun pengisian (dekorasi, seperti referensi) */
  const nPark=s.forks.length>=3?4:3;
  if(prof==='crossdock'){ for(let i=0;i<6;i++){ const hx=W/2+1.6+i*0.95, hz=fz-2.3; TP.box(0.56,0.07,1.1,0.02,0xE5484D,hx,0.1,hz+0.15); TP.box(0.62,0.2,0.22,0.05,0xE5484D,hx,0.22,hz-0.45); TP.add(gCyl(0.03,1.1,6),0x23262F,hx,0.7,hz-0.62,0,1,1,1,0.35,0); TP.box(0.3,0.05,0.05,0.01,0x23262F,hx,1.22,hz-0.82); BB.add(0.9,1.5,hx,hz,0.08); }
    for(let i=0;i<4;i++) addCage(TP,W/2+2+i*1.15,fz-4.9); }
  else if(prof==='robotic'){ for(let i=0;i<nPark+1;i++){ const fx=W/2+1.7+i*1.3, fzp=fz-2.3; forkParts(TP,fx,fzp,0,true,{agv:true,driver:false,body:0xF4F6FB,body2:0xE2E8F0,chassis:0x2E5BFF}); TP.box(0.7,0.03,0.7,0.02,0x22C55E,fx,0.09,fzp-1.0); BB.add(1.4,2.3,fx,fzp+0.1,0.1); }
    for(let i=0;i<2;i++){ const ex=W/2+9+i*2.8; TP.box(0.42,1.3,0.3,0.1,0xF4F6FB,ex+1.4,0.7,fz-2.4); TP.box(0.3,0.36,0.04,0.02,0x22C55E,ex+1.4,1.05,fz-2.24); TP.box(0.1,0.1,0.1,0.02,0x2E5BFF,ex+1.4,1.42,fz-2.4); } }
  else { for(let i=0;i<nPark;i++){ const fx=W/2+1.7+i*1.45, fzp=fz-2.3; forkParts(TP,fx,fzp,0,true,{driver:false,...(prof==='dc'?{}:{})}); TP.box(0.5,0.9,0.3,0.1,0xF4F6FB,fx,0.55,fzp-1.15); TP.box(0.26,0.06,0.03,0.01,0x22C55E,fx,0.82,fzp-0.99); BB.add(1.5,2.4,fx,fzp+0.1,0.1); }
    if(prof==='dc') for(let i=0;i<3;i++) addCage(TP,W/2+2+i*1.15,fz-5.0); }
  ST.box(nPark*1.45+0.6,0.03,3.2,0.1,0xDCEFE5,W/2+1.7+(nPark-1)*1.45/2,0.1,fz-2.5);
  for(let row=0;row<2;row++) for(let x=-W/2+1.5;x<W/2-1;x+=2.9){ const z=-fz-6.5-row*6.4;
    LN.box(0.08,0.01,4.8,0,0xFFFFFF,x-1.45,0.1,z);
    if(prof==='dc'){ if(row===0){ if(R()<0.85) addVan(TP,0xF4F6FB,0x7C3AED,x,z,Math.PI); } else for(let m=0;m<3;m++) if(R()<0.8) addMotor(TP,pick([0x2E5BFF,0xE5484D,0x16A34A,0x23262F],R),x-0.9+m*0.9,z,0); }
    else if(R()<0.72) addCar(PK,pick([0xF3F5FB,0x2E5BFF,0x9AA4C2,0x3B4A7A,0xE0573B,0x17A090],R),x,z,row?0:Math.PI); }
  /* bayangan lembut parkiran ikut disembunyikan Tampilan Bersih bersama mobil parkir (sebelumnya tertinggal sebagai noda gelap di belakang gedung) */
  { const PB=new BlobBatch(), pg=new THREE.Group(); PB.add(W,15,0,-fz-9.7,0.1,true); PB.build(pg); g.add(pg); if(prof!=='dc') View.clutter.push(pg); }
  for(let i=0;i<2;i++) rectLine(LN,W/2+9+i*2.8,fz+2,2.5,7.4,0.1);
  const GL=new Parts(), FC=0xC7CFE6;
  const fence=(x0,z0,x1,z1)=>{const len=Math.hypot(x1-x0,z1-z0), n=Math.ceil(len/2.4), ry=Math.atan2(x1-x0,z1-z0);
    for(let i=0;i<=n;i++){const t=i/n; TP.box(0.08,1.3,0.08,0.02,FC,lerp(x0,x1,t),0.75,lerp(z0,z1,t));}
    TP.add(gR(0.22,0.22,len,0.06),0xE9EDF8,(x0+x1)/2,0.2,(z0+z1)/2,ry); GL.add(gR(0.04,1.0,len,0),0xFFFFFF,(x0+x1)/2,0.82,(z0+z1)/2,ry);};
  { const GX=staffLot(s).GX; fence(xi0+0.3,zi0+0.3,GX-1.7,zi0+0.3); fence(GX+1.7,zi0+0.3,xi1-0.3,zi0+0.3); } fence(xi0+0.3,zi0+0.3,xi0+0.3,zi1-0.3); fence(xi1-0.3,zi0+0.3,xi1-0.3,zi1-0.3);
  ST.box(xi1-xi0-1,0.05,2.2,0.6,0xE4E9F8,(xi0+xi1)/2,0.11,zi0+1.6); ST.box(2.2,0.05,zi1-zi0-4,0.6,0xE4E9F8,xi0+1.6,0.11,(zi0+zi1)/2); ST.box(2.2,0.05,zi1-zi0-4,0.6,0xE4E9F8,xi1-1.6,0.11,(zi0+zi1)/2);
  const tree=(x,z,k)=>{ if(LOOK.real){ R(); realTree(TR,x,z,k,0,s.ox,s.oz); BB.add(k*2.4,k*2.4,x,z,0.1); return; } TR.add(gCyl(0.11,1.0,6),0xB58B63,x,0.6,z);TR.add(gSph(1,10),R()<.5?0x6BC48C:0x5AB47C,x,1.05+k*1.05,z,0,k,k*1.25,k);BB.add(k*2.4,k*2.4,x,z,0.1);};
  const bush=(x,z,k)=>{ if(LOOK.real){ const g=TREE_G[Math.floor(hsh(x+s.ox,z+s.oz)*TREE_G.length)]; TR.add(gIco(1),g,x,0.1+k*0.45,z,0,k,k*0.62,k); TR.add(gIco(1),g,x+k*0.45,0.1+k*0.32,z+k*0.2,1,k*0.65,k*0.5,k*0.65); return; } TR.add(gSph(1,8),0x7CCB97,x,0.1+k*0.5,z,0,k,k*0.7,k);};
  for(let x=xi0+3;x<xi1-2;x+=6.5+R()*1.5){ const k=0.7+R()*0.3; if(Math.abs(x-staffLot(s).GX)>3.2) tree(x,zi0+1.6,k); } /* v41: celah untuk pintu belakang */
  for(let z=zi0+6;z<zi1-4;z+=7+R()*2){ tree(xi0+1.6,z,0.7+R()*0.3); tree(xi1-1.6,z,0.7+R()*0.3); }
  for(let x=xi0+6;x<xi1-4;x+=3.3){ const bx=x+R(), bz=zi0+1.6+(R()-.5), bk=0.45+R()*0.2; if(Math.abs(bx-staffLot(s).GX)>3) bush(bx,bz,bk); }
  const gz0=zi0+2.8, gz1=-fz-16.5; if(gz1>gz0) ST.box(W+10,0.05,gz1-gz0,1.2,0xE2E7F8,0,0.11,(gz0+gz1)/2);
  for(let i=0;i<6;i++) tree(-W/2-4+R()*(W+8),zi0+4+R()*Math.max(1,(-fz-17)-(zi0+4)),0.8+R()*0.4);
  /* properti halaman (desain Lumbung): lampu halaman, kontainer bertumpuk, hand pallet di dekat rak */
  { const pole=(x,z,ry)=>{ TP.add(gCyl(0.09,6.4,8),0x9AA3BA,x,3.2,z); TP.box(0.12,0.12,1.3,0.03,0x9AA3BA,x+Math.sin(ry)*0.6,6.35,z+Math.cos(ry)*0.6,ry);
      TP.box(0.5,0.16,0.7,0.05,0xEEF1F8,x+Math.sin(ry)*1.2,6.25,z+Math.cos(ry)*1.2,ry); BB.add(0.7,0.7,x,z,0.1);
      View.lampPts.push([x+Math.sin(ry)*1.2+s.ox,6.1,z+Math.cos(ry)*1.2+s.oz]); };
    for(let x=xi0+9;x<xi1-6;x+=19) pole(x,zi0+0.9,0);
    for(let z=zi0+14;z<-fz-2;z+=16) pole(xi1-0.9,z,-Math.PI/2);
    wall(gR(2.5,2.6,6.2,0.08),0xE0702B,-W/2-24,1.36+2.62,fz-8,0,16);
    if(prof!=='crossdock'){ const jx=W/2+7.3, jz=fz-8.4; TP.box(0.56,0.07,1.1,0.02,0xE5484D,jx,0.1,jz); TP.box(0.62,0.2,0.22,0.05,0xE5484D,jx,0.22,jz-0.6); TP.add(gCyl(0.03,1.1,6),0x23262F,jx,0.7,jz-0.77,0,1,1,1,0.35,0); TP.box(0.3,0.05,0.05,0.01,0x23262F,jx,1.22,jz-0.97); BB.add(0.9,1.5,jx,jz,0.08); } }
  { const im=INT.build(1,false); im.material=new THREE.MeshBasicMaterial({vertexColors:true}); im.receiveShadow=false; g.add(im); }
  { const pm=PK.build(.5); g.add(pm); View.clutter.push(pm); }
  if(GLS.l.length){ const gm2=GLS.build(.15,false); gm2.material=new THREE.MeshStandardMaterial({color:C(0x9DBBFF),roughness:.08,metalness:.25,transparent:true,opacity:.62,emissive:C(0xFFE3B0),emissiveIntensity:0}); g.add(gm2); View.nightMats.push({m:gm2.material,max:0.7}); }
  if(fanPts.length){ const bl=new Parts(); bl.box(0.58,0.02,0.09,0.01,0xD7DCEA,0,0,0); bl.box(0.09,0.02,0.58,0.01,0xD7DCEA,0,0,0);
    const im=new THREE.InstancedMesh(bl.geometry(),stdMat(.5,true),fanPts.length); im.frustumCulled=false; g.add(im); View.spinners.push({mesh:im,pts:fanPts}); }
  if(prof==='cold') View.vapor.push({s,spr:new Sprites(s.bays.length*6,1.0,0xFFFFFF,{additive:false,map:dustTex,order:6})});
  g.add(WP.build(.62,true,RIB)); g.add(TP.build(.6)); g.add(PL.build(.85)); g.add(ST.build(.85)); g.add(noTheme(LN.build(.9,false))); g.add(TR.build(.8));
  const gm=GL.build(.2,false); gm.material=new THREE.MeshStandardMaterial({color:C(0xFFFFFF),roughness:.2,transparent:true,opacity:.42}); g.add(gm);
  BB.build(g); if(LOOK.real) groundDecals(g,s);
}

/* ---------- binding: record → objek 3D ---------- */
function bindEntities(){
  peoplePools(Store.tables.people.size+Store.tables.trucks.size+36); /* +5 mekanik (v37) +25 motor staf & ojol (v41) + cadangan */
  for(const t of Store.all('trucks')){ const m=makeTruck(t.carrier,{reefer:!!(t.site&&t.site.profile==='cold')}); View.sites.get(t.siteId).g.add(m.g); m.g.visible=false; tagRef(m.g,'trucks',t.id);
    const seed=strHash(t.id)%997/97, look={vest:new THREE.Color(t.carrier.cs).getHex(),hat:0x1F2A44,clip:false,civ:true,skin:[0xF0C29C,0xD9A57B,0xB9825A][strHash(t.id)%3],pants:0x2E3550,seed};
    const rig=makePerson(look); View.sites.get(t.siteId).g.add(rig.g);
    View.trucks.set(t.id,{...m,spin:0,steerA:0,o:-1,drv:{rig,phase:seed,ww:0,poseT:0,lx:0,lz:0,lh:0,look}}); }
  for(const f of Store.all('forklifts')){ const fs=Store.get('sites',f.siteId), m=makeForklift(fs?fs.profile:'general'); View.sites.get(f.siteId).g.add(m.g); tagRef(m.g,'forklifts',f.id); View.forks.set(f.id,{...m,spin:0,steerA:0}); }
  peoplePools(Store.tables.people.size+Store.tables.trucks.size+36); /* +5 mekanik (v37) +25 motor staf & ojol (v41) + cadangan */
  /* v37: satu mekanik per gudang (hanya tampilan), muncul saat aksi "Kirim mekanik" */
  View.mech=new Map(); for(const s of Store.all('sites')){ const look={vest:0x24305E,hat:0xE0393E,clip:false,civ:false,skin:[0xF0C29C,0xD9A57B,0xB9825A][strHash(s.id)%3],pants:0x24305E,seed:strHash(s.id+'m')%997/97};
    const rig=makePerson(look); View.sites.get(s.id).g.add(rig.g); updatePerson(rig,false); View.mech.set(s.id,{rig,look,phase:look.seed,ww:0,poseT:0,lx:0,lz:0,lh:0,on:false,x:0,z:0,h:0,v:0,pose:null,route:null,truck:null}); }
  initStaffMotos(); /* v41 */ initBirds(); /* v42 */
  for(const p of Store.all('people')){ const m=makePerson(p.look); (p.siteId?View.sites.get(p.siteId).g:scene).add(m.g); if(p.siteId) tagRef(m.g,'people',p.id);
    View.people.set(p.id,{rig:m,phase:p.look.seed,ww:0,poseT:0,lx:p.pos.x,lz:p.pos.z,lh:p.heading}); }
  const CP=carPools(Store.tables.cars.size); for(const c of Store.all('cars')){ const i=CP.body.alloc(); CP.detail.alloc(); CP.body.color(i,'#'+new THREE.Color(c.color).getHexString()); View.cars.set(c.id,i); }
  View.motos=new Map(); for(const c of Store.all('cars')) if(strHash(c.id)%5===0&&View.motos.size<MOTO.max) View.motos.set(c.id,MOTO.alloc());
  for(const a of STATIC_PALLETS) updatePallet(a,true);
}
const cargoPos=k=>({x:(k%2)?0.44:-0.44,y:0.95,z:1.19-Math.floor(k/2)*1.1});
function palletTarget(p){
  const L=p.location; if(!L) return null;
  if(L.type==='slot'){ const sl=Store.get('slots',L.id); return {parent:View.sites.get(sl.siteId).g,x:sl.x,y:PH,z:sl.z,s:0.74,key:'slot:'+L.id}; }
  if(L.type==='hold') return {parent:View.sites.get(p.siteId).g,x:p.holdPos.x,y:GY,z:p.holdPos.z,s:1,key:'hold:'+p.id};
  if(L.type==='fork'){ const v=View.forks.get(L.id); return {parent:v.car,x:0,y:0,z:1.18,s:0.74,key:'fork:'+L.id}; }
  if(L.type==='truck'){ const v=View.trucks.get(L.id), c=cargoPos(L.index); return {parent:v.g,x:c.x,y:c.y,z:c.z,s:0.74,key:'truck:'+L.id+':'+L.index}; }
  return null;
}
const jl=(o,k,v,r)=>{ o.rotation[k]+=(v-o.rotation[k])*r; };
/* ---------- v42: animasi manusia yang mengalir ----------
   1) Posisi & arah tampilan dihaluskan (langkah simulasi yang jarang di perangkat hemat daya dan belokan tajam tidak lagi patah).
   2) Sendi memakai pegas teredam kritis (solusi tertutup, stabil untuk dt berapa pun): lengan/kepala bergerak dengan percepatan & perlambatan alami.
   3) Jalan: pinggul berayun & miring, badan berputar berlawanan, kepala tetap menatap ke depan, ayunan ikut kecepatan.
   4) Diam: memindah tumpuan berat badan, bernapas, sesekali menoleh. 5) Gerakan khas per aktivitas (menulis, menunjuk, menelepon, mengobrol, memasak, makan). */
function spr(o,k,target,w,dt){ const S=o.userData.sv||(o.userData.sv={}), v0=S[k]||0, e=o.rotation[k]-target, ex=Math.exp(-w*dt), tmp=(v0+w*e)*dt;
  o.rotation[k]=target+(e+tmp)*ex; S[k]=(v0-w*tmp)*ex; }
const sstep=x=>x<=0?0:x>=1?1:x*x*(3-2*x);
const nz=(t,a)=>Math.sin(t*0.71+a)*0.5+Math.sin(t*1.37+a*2.3)*0.3+Math.sin(t*0.23+a*4.1)*0.2; /* derau halus per orang */
function animPerson(p,v,dt){
  const m=v.rig; dt=Math.min(dt,0.1);
  if(v.rx==null||Math.hypot(p.pos.x-v.rx,p.pos.z-v.rz)>2.5){ v.rx=p.pos.x; v.rz=p.pos.z; v.rh=p.heading; v.lx=v.rx; v.lz=v.rz; v.lh=v.rh; v.ww=clamp((p.v||0)/0.85,0,1); }
  const kp=1-Math.exp(-dt*16); v.rx+=(p.pos.x-v.rx)*kp; v.rz+=(p.pos.z-v.rz)*kp;
  const dH=angDiff(v.rh,p.heading), maxT=((p.v||0)>0.25?6.5:4.2)*dt; v.rh+=clamp(dH*(1-Math.exp(-dt*10)),-maxT,maxT);
  const dx=v.rx-v.lx, dz=v.rz-v.lz, ds=Math.hypot(dx,dz), turnV=angDiff(v.lh,v.rh)/Math.max(dt,1e-4);
  v.lx=v.rx; v.lz=v.rz; v.lh=v.rh;
  v.phase+=ds/1.3*Math.PI*2+Math.min(Math.abs(turnV),3)*dt*1.4;
  const moving=clamp((p.v||0)/0.85,0,1), stepTurn=clamp(Math.abs(turnV)/2.2,0,1)*0.45;
  v.ww=lerp(v.ww,Math.max(moving,stepTurn),1-Math.exp(-dt*6));
  const w=v.ww, ph=v.phase, sd=p.look.seed||0, t=performance.now()/1000+sd*7, amp=clamp((p.v||0)/1.15,0.55,1.2)*w;
  const pose=p.pose; v.poseT=lerp(v.poseT,pose&&w<0.3?1:0,1-Math.exp(-dt*3.5)); const q=sstep(v.poseT), P=v.poseT>0.02?(pose||v.lastPose):null; if(pose) v.lastPose=pose;
  const eat=P==='sitchat'&&p.lunch&&p.lunch.phase==='eat';
  m.g.position.set(v.rx,p.y,v.rz); m.g.rotation.y=v.rh;
  const sitQ=(P==='sit'||P==='sitchat')?q:0, idle=(1-w)*(1-sitQ), free=idle*(1-q);
  const ws=nz(t*0.35,sd)*idle, gl=nz(t*0.42,sd+3), breath=Math.sin(t*1.9);
  const Wt=lerp(7,14,w), Wa=lerp(7.5,17,w), Wl=lerp(9,26,w), Wh=6;
  /* pinggul & badan */
  m.hips.position.y=lerp(0.95+(-0.03+0.04*Math.abs(Math.sin(ph)))*w-0.012*Math.abs(ws),0.5,sitQ); m.hips.position.x=ws*0.035;
  let hipY=0.1*Math.sin(ph)*amp, hipZ=0.05*Math.sin(ph)*w+ws*0.06;
  let toY=-0.16*Math.sin(ph)*amp, toX=0.04*w+0.05*amp+0.012*breath*(1-w), toZ=-hipZ*0.6;
  if(P==='clipboard') toX+=0.07*q; if(P==='push') toX+=0.2*q; if(P==='point') toY+=0.16*q;
  if(P==='look'){ const sc=Math.sin(t*0.55+sd)*q; toY+=0.2*sc; }
  if(P==='chat') toY+=0.1*Math.sin(t*0.5+sd)*q; if(eat) toX+=0.12*q;
  spr(m.hips,'y',hipY,Wt,dt); spr(m.hips,'z',hipZ,Wt,dt); spr(m.torso,'y',toY,Wt,dt); spr(m.torso,'x',toX,Wt,dt); spr(m.torso,'z',toZ,Wt,dt);
  m.torso.scale.y=1+0.013*breath*(1-w);
  /* kepala: menahan pandangan ke depan saat berjalan, menoleh santai saat diam */
  let hy=-(toY+hipY)*0.75+gl*0.5*free, hx=0.03*Math.sin(ph*2)*w+0.05*nz(t*0.6,sd+7)*free, hz=0.04*nz(t*0.3,sd+5)*idle;
  let wr=0; /* menulis di clipboard bergantian dengan melihat sekitar */
  if(P==='clipboard'){ wr=sstep((Math.sin(t*0.8+sd)+0.3)*1.6); hx+=lerp(0.12,0.42,wr)*q; hy+=(1-wr)*0.3*Math.sin(t*0.5)*q; }
  if(P==='look') hy+=Math.sin(t*0.55+sd)*0.6*q;
  if(P==='point') hx+=-0.06*q;
  if(P==='chat'||(P==='sitchat'&&!eat)){ hy+=Math.sin(t*0.7+sd)*0.22*q; hx+=Math.max(0,Math.sin(t*2.6))*0.1*q; }
  if(P==='phone'){ hy+=0.22*q; hx+=0.12*q; hz+=0.16*q; }
  if(P==='drink') hx+=-0.22*Math.max(0,Math.sin(t*0.9))*q;
  if(P==='push') hx+=0.32*q;
  let bite=0; if(eat){ const e=((t*0.38+sd)%1+1)%1; bite=e<0.32?sstep(e/0.32):e<0.5?1:e<0.8?1-sstep((e-0.5)/0.3):0; hx+=(0.24-0.12*bite)*q+0.04*Math.sin(t*13)*bite*q; hy*=1-0.6*q; }
  if(P==='sit') hx+=0.1*q;
  spr(m.head,'y',hy,Wh,dt); spr(m.head,'x',hx,Wh,dt); spr(m.head,'z',hz,Wh,dt);
  /* kaki & lengan */
  for(let i=0;i<2;i++){
    const pi=ph+i*Math.PI, side=i?1:-1, rest=Math.max(0,ws*(i?1:-1))*idle;
    const thigh=-0.5*Math.sin(pi)*amp-0.08*rest, knee=(0.06+0.85*Math.max(0,Math.cos(pi))*Math.max(0,Math.sin(pi+1.2)))*amp+0.03+0.22*rest;
    spr(m.th[i],'x',lerp(thigh,-1.48,sitQ),Wl,dt); spr(m.kn[i],'x',lerp(knee,1.5,sitQ),Wl,dt); spr(m.an[i],'x',lerp(-(thigh+knee)*0.8,0,sitQ),Wl,dt);
    let shx=0.42*Math.sin(pi)*amp+0.05*free, elx=-(0.15+0.4*Math.max(0,-Math.sin(pi)))*amp-0.2*(1-w), shz=side*(0.06+0.03*free);
    const L=(x,e,z)=>{ shx=lerp(shx,x,q); elx=lerp(elx,e,q); shz=lerp(shz,side*z,q); };
    if(P==='clipboard'){ if(i===0) L(-0.55,-1.3,-0.12); else L(-0.7,-1.45+0.09*Math.sin(t*9)*wr,-0.2); }
    if(P==='point'){ if(i===1) L(-1.4+0.07*Math.sin(t*2.4),-0.12,0.15); else L(0.08,-0.3,0.06); }
    if(P==='look') L(0.42,-0.95,-0.04); /* tangan di belakang punggung */
    if(P==='sit') L(-0.35,-0.75,0.04);
    if(P==='sitchat'){ if(eat){ if(i===1) L(lerp(-0.55,-1.0,bite),lerp(-0.9,-2.35,bite),-0.14*bite-0.02); else L(-0.55,-0.95,-0.06); }
      else if(i===1){ const g=Math.max(0,Math.sin(t*1.7)); L(-0.6-0.35*g,-1.2,-0.25*g); } else L(-0.4,-0.8,0.04); }
    if(P==='chat'){ const g=Math.max(0,Math.sin(t*1.9+i*2.1)), k=i?1:0.6; L(-0.25-0.5*g*k,-0.8-0.45*g*k,-0.18*g*k); }
    if(P==='phone'){ if(i===1) L(-0.45,-2.55,-0.35); else L(0.12,-1.45,0.36); /* tangan di pinggang */ }
    if(P==='drink'&&i===1){ const g=Math.max(0,Math.sin(t*0.9)); L(-0.55-0.6*g,-1.5-0.85*g,-0.3); }
    if(P==='push'){ const c=i?0.22*Math.sin(t*7.5):0.05*Math.sin(t*3.1); L(-0.95+c*0.3,-0.85+c,-0.08); } /* bekerja dengan tangan: memotong, mengaduk, mendorong */
    spr(m.sh[i],'x',shx,Wa,dt); spr(m.sh[i],'z',shz,Wa,dt); spr(m.el[i],'x',elx,Wa*1.1,dt);
  }
}
/* ---------- sinkron tiap frame: baca Store → ubah objek 3D ---------- */
/* v37: jas hujan saat hujan/badai. Staf gudang memakai jas hujan kuning keselamatan, sopir biru tua, warga warna acak; topi & kulit tetap */
function coatLook(look,id){ id=id||''; const h=strHash(id), drv=id.startsWith('TRK-'), c=drv?0x2C4A8C:look.civ?[0x2E5BFF,0xE0573B,0x17A090,0xF2C230,0x7C3AED][h%5]:0xF2C230;
  return {...look,vest:c,pants:c===0xF2C230?0xD9AE24:c}; }
function syncView(dt,now){
  for(const t of Store.tables.trucks.values()){ const v=View.trucks.get(t.id), m=v;
    const vis=t.state!=='away'; if(!vis){ m.g.visible=false; if(v.drv.wasOn){ updatePerson(v.drv.rig,false); v.drv.wasOn=false; } continue; }
    { const hg=View.sites.get(t.siteId).g; if(m.g.parent!==hg){ hg.add(m.g); hg.add(v.drv.rig.g); } }   /* v33: truk antar-gudang pindah ke grup gudang barunya */
    m.g.position.set(t.pos.x,GY,t.pos.z); m.g.rotation.y=t.heading;
    const a=ease(t.doorsT)*Math.PI*1.47; for(const d of m.doors) d.rotation.y=-d.userData.s*a;
    v.spin+=t.v*(t.rev?-1:1)*dt/0.42; for(const ax of m.axles) ax.userData.spin.rotation.x=v.spin;
    const want=clamp(Math.atan(4.6*(t.path?t.curv:0)),-0.55,0.55); v.steerA=lerp(v.steerA,want,Math.min(1,dt*5)); m.steer.rotation.y=v.steerA;
    const o=t.state==='parked'?1:t.presence;
    if(Math.abs(o-v.o)>0.004){ v.o=o; for(const mt of m.mats){ if(mt.userData.base==null){ mt.userData.base=mt.opacity; mt.userData.bt=mt.transparent; } mt.transparent=mt.userData.bt||o<0.999; mt.opacity=mt.userData.base*o; mt.needsUpdate=true; } }
    m.g.visible=o>0.01;
    m.cabPiv.rotation.y=ease(t.cabDoor||0)*1.2;
    const dv=t.crew, D=v.drv, on=!!(dv&&dv.on); { const w=(ENV.rain||0)>0.35; if(D.wet!==w){ D.wet=w; recolorPerson(D.rig,w?coatLook(D.look,t.id):D.look); } }
    if(on){ if(!D.wasOn){ D.lx=dv.x; D.lz=dv.z; D.lh=dv.h; D.rx=null; } animPerson({pos:{x:dv.x,z:dv.z},y:0.05+(dv.y||0),heading:dv.h,v:dv.v,pose:dv.pose,look:D.look},D,dt); }
    if(on||D.wasOn) updatePerson(D.rig,on); D.wasOn=on;
  }
  if(!View.agvDots){ const dg=new THREE.CircleGeometry(0.13,14); dg.rotateX(-Math.PI/2); View.agvDots=new InstPool(dg,new THREE.MeshBasicMaterial({color:C(0x4D8BFF),transparent:true,opacity:0.85,depthWrite:false}),160,{cast:false,receive:false,order:2}); for(let i=0;i<156;i++) View.agvDots.alloc(); }
  { const AD=View.agvDots; let k=0;
    for(const s of SITES()){ if(s.profile!=='robotic') continue; for(const f of s.forks){ const P=f.path; if(!P||k>150) continue; const ci=P.ci, y=(f.pos.y||0)+0.06;
        for(let d=0.9;d<=4.5&&f.s+d<P.len&&k<156;d+=0.6){ const p=samplePath(P,f.s+d); _pm.compose(_pv.set(p.x+s.ox,y+(p.y||0),p.z+s.oz),_pq.identity(),_ps.setScalar(1-d/7)); AD.set(k++,_pm); }
        P.ci=ci; } }
    for(let i=k;i<AD.used;i++) AD.set(i,_hide); AD.used=Math.max(AD.used||0,k); }
  for(const f of Store.tables.forklifts.values()){ const v=View.forks.get(f.id), m=v;
    m.g.position.set(f.pos.x,PH,f.pos.z); m.g.rotation.y=f.heading; m.car.position.y=f.lift; m.car.rotation.x=-0.06*clamp(f.lift/0.2,0,1);
    v.spin+=(f.path?f.v*(f.rev?-1:1):0)*dt/0.22; for(const a of m.axles) a.userData.spin.rotation.x=v.spin;
    const want=f.path?clamp(-Math.atan(1.0*f.curv),-0.7,0.7):v.steerA*0.98; v.steerA=lerp(v.steerA,want,Math.min(1,dt*6)); m.rsteer.rotation.y=v.steerA;
    const ni=f.shiftNow==='malam', em=!!(f.lunch&&m.empty); if(m.night.visible!==(ni&&!em)||m.day.visible!==(!ni&&!em)){ m.night.visible=ni&&!em; m.day.visible=!ni&&!em; if(m.empty) m.empty.visible=em; }
    m.beacon.material.emissiveIntensity=forkWorking(f)?0.35+0.65*Math.max(0,Math.sin(now/180+f.restIdx)):0.15;
  }
  const wet=(ENV.rain||0)>0.35;
  for(const p of Store.tables.people.values()){ const v=View.people.get(p.id), key=p.look.ver+'|'+wet; if(v.ver!==key){ v.ver=key; recolorPerson(v.rig,wet?coatLook(p.look,p.id):p.look); } animPerson(p,v,dt); updatePerson(v.rig,p.siteId?true:(!CLEAN&&(p.look.seed%1)<WX.density+0.15)); }
  for(const d of Store.tables.docks.values()){ const v=View.docks.get(d.id); const busy=d.doorState==='open', store=!!Store.get('stores',d.siteId), want=busy||(!store&&!WX.night)?1:0; v.open+=(want-v.open)*Math.min(1,dt*2.2);
    const k=1-0.92*v.open; v.door.scale.y=k; v.door.position.y=PH+2.7-1.35*k; v.lamp.material=LAMP[busy?1:0]; }
  for(const sl of Store.tables.slots.values()) View.slots.get(sl.id).visible=!!sl.palletId;
  if(View.spinners.length){ const ang=now*0.012; for(const sp of View.spinners){ sp.pts.forEach((p,i)=>{ _ve.set(0,ang+i*0.7,0); _vq.setFromEuler(_ve); _vm.compose(_vv.set(p[0],p[1],p[2]),_vq,_vs.set(1,1,1)); sp.mesh.setMatrixAt(i,_vm); }); sp.mesh.instanceMatrix.needsUpdate=true; } }
  for(const V of View.vapor){ const s=V.s, S=V.spr; let n=0, any=0;
    for(const b of s.bays){ const dv=View.docks.get(b.id); if(!dv||dv.open<0.3) continue; any=Math.max(any,dv.open);
      for(let k=0;k<6;k++){ const life=((now*0.00045)+k/6+b.i*0.13)%1; S.set(n++,b.x+s.ox+Math.sin(k*2.3+b.i)*0.7,PH+2.2+life*1.4,s.fz+s.oz+0.4+life*1.8,0.5+life*1.4); } }
    S.m.visible=n>0; if(n){ S.m.material.opacity=0.28*any; S.update(n); } }
  if(View.gates) for(const G of View.gates){ const tg=G.site.tgate; if(tg) G.piv.rotation.x=tg.armT*1.35; }
  for(const b of View.barriers){ let want=0; for(const t of Store.tables.trucks.values()){ if(!t.solid) continue; const s=t.site; if(Math.hypot(t.pos.x+s.ox-b.x,t.pos.z+s.oz-b.z)<9&&(t.state==='toll_in'||t.state==='toll_out'||t.v>0.5)){ want=1; break; } }
    b.open+=(want-b.open)*Math.min(1,dt*3); b.piv.rotation.x=-b.dir*b.open*1.35; }
  for(const h of View.holds) h.pin.position.y=h.base+(reduceMotion?0:Math.sin(now/1000*2.2+h.ph)*0.16);
  const CP=CARS; for(const c of Store.tables.cars.values()){ const i=View.cars.get(c.id); if(CLEAN||!c.active||c.presence<0.3){ CP.body.set(i,_hide); CP.detail.set(i,_hide); continue; }
    _pe.set(0,c.heading,0); _pq.setFromEuler(_pe); _pm.compose(_pv.set(c.x,0.04,c.z),_pq,_ps.set(1,1,1)); const mi=View.motos.get(c.id);
    if(mi!=null){ CP.body.set(i,_hide); CP.detail.set(i,_hide); MOTO.set(mi,_pm); } else { CP.body.set(i,_pm); CP.detail.set(i,_pm); } }
  if(View.motos.size) for(const c of Store.tables.cars.values()){ const mi=View.motos.get(c.id); if(mi!=null&&(CLEAN||!c.active||c.presence<0.3)) MOTO.set(mi,_hide); }
  for(const s of Store.tables.signals.values()){ const v=View.signals.get(s.id); if(!v) continue;
    const blink=Math.floor(now/550)%2;
    for(const [ax,st] of [['H',s.stateH],['V',s.stateV]]){ const k=st+ax+(st==='F'?blink:''); if(v.last[ax]===k) continue; v.last[ax]=k;
      v.idx[ax].forEach(([i,c])=>SIGPOOL.color(i,(c===0&&st==='R')||(c===1&&(st==='A'||(st==='F'&&blink)))||(c===2&&st==='G')?['#FF4040','#FFB21A','#2BE070'][c]:['#3A1C20','#3A2E18','#16301F'][c])); } }
  /* v44.1: tidak ada scene.updateMatrixWorld() di sini lagi; renderer.render sudah melakukannya sekali per frame.
     updatePallet memperbarui rantai induknya sendiri (updateWorldMatrix), rangka orang lewat updatePerson */
  /* palet: posisinya ditentukan sepenuhnya oleh field location di data */
  const seen=new Set();
  for(const p of Store.tables.pallets.values()){ seen.add(p.id);
    let v=View.pallets.get(p.id); const T=palletTarget(p); if(!T) continue;
    if(!v){ const mesh=makePallet(p.packing,rng(strHash(p.id)),p.layers); T.parent.add(mesh); mesh.position.set(T.x,T.y,T.z); mesh.scale.setScalar(T.s);
      v={mesh,key:T.key}; View.pallets.set(p.id,v); updatePallet(mesh,true); }
    else if(v.key!==T.key){ T.parent.attach(v.mesh); v.mesh.position.set(T.x,T.y,T.z); v.mesh.scale.setScalar(T.s); v.key=T.key; v.mesh.userData.pallet.dirty=true; }
    let vis=!RP.hide.has(p.id); if(vis&&p.location.type==='truck'){ const t=Store.get('trucks',p.location.id); vis=!!t&&(t.state==='parked'||t.presence>0.98); }
    if(vis!==v.mesh.visible){ v.mesh.visible=vis; v.mesh.userData.pallet.dirty=true; }
    if(p.location.type==='fork'||p.location.type==='truck') v.mesh.userData.pallet.dirty=true;
    updatePallet(v.mesh,false);
  }
  for(const [id,v] of View.pallets){ if(!seen.has(id)){ freePallet(v.mesh); v.mesh.parent&&v.mesh.parent.remove(v.mesh); View.pallets.delete(id); } }
  syncRail(dt); syncBreakdowns(dt,now); syncPedSignals(now); syncStaffMotos(dt); syncBirds(dt);
  flushPools();
}
/* ---------- posisi dunia & picking ---------- */
const _wp=new THREE.Vector3();
function worldPos(rec){
  if(!rec) return new THREE.Vector3();
  if(rec.kind==='pallet'){ const v=View.pallets.get(rec.id); if(v){ v.mesh.getWorldPosition(_wp); return new THREE.Vector3(_wp.x,0,_wp.z); } }
  if(rec.kind==='site') return siteHome(rec.idx);
  if(rec.kind==='store') return new THREE.Vector3(rec.ox,0,rec.oz+rec.fz+3);
  const s=rec.siteId?(Store.get('sites',rec.siteId)||Store.get('stores',rec.siteId)):null, ox=s?s.ox:0, oz=s?s.oz:0;
  return new THREE.Vector3(rec.pos.x+ox,0,rec.pos.z+oz);
}
function siteHome(i){ const s=Store.all('sites')[i]; return new THREE.Vector3(s.ox+1,0,s.oz+s.fz+4.2); }
const ray=new THREE.Raycaster(), ndc=new THREE.Vector2(), groundPlane=new THREE.Plane(new THREE.Vector3(0,1,0),0);
function setNDC(x,y){ndc.set(x/innerWidth*2-1,-(y/innerHeight)*2+1);ray.setFromCamera(ndc,camera);}
function groundAt(x,y){setNDC(x,y);const p=new THREE.Vector3();return ray.ray.intersectPlane(groundPlane,p)?p:null;}
ray.layers.enableAll();
function recordAt(x,y){ setNDC(x,y); const hits=ray.intersectObjects(View.pickables,true);
  for(const h of hits){ let o=h.object,vis=true; while(o){ if(!o.visible){vis=false;break;} o=o.parent; } const ref=h.object.userData.ref; if(!vis||!ref) continue;
    if(ref.table==='slots'){ const sl=Store.get('slots',ref.id); if(sl&&sl.palletId) return Store.get('pallets',sl.palletId); continue; }
    const r=Store.get(ref.table,ref.id); if(r) return r; }
  return null; }
/* ---------- visual seleksi ---------- */
const dotsMax=620, dotGeo=new THREE.CircleGeometry(0.17,14).rotateX(-Math.PI/2);
const dots=new THREE.InstancedMesh(dotGeo,new THREE.MeshBasicMaterial({color:0x2E5BFF,transparent:true,opacity:.9,depthWrite:false}),dotsMax);
dots.count=0; dots.renderOrder=3; dots.frustumCulled=false; scene.add(dots);
const destRing=new THREE.Mesh(new THREE.RingGeometry(0.9,1.15,40).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0x2E5BFF,transparent:true,opacity:.9,depthWrite:false})); destRing.visible=false; scene.add(destRing);
let selVis=null, bayVis=null;
function clearSelVis(){ if(selVis&&selVis.parent) selVis.parent.remove(selVis); selVis=null; if(bayVis&&bayVis.parent) bayVis.parent.remove(bayVis); bayVis=null; dots.count=0; destRing.visible=false; }
function makeBayVis(s,d){
  const g=new THREE.Group(); const gl=new THREE.Mesh(planeG,new THREE.MeshBasicMaterial({map:glowTex,transparent:true,depthWrite:false})); gl.scale.set(5.5,1,9); gl.position.set(d.x,0.12,s.zDock); gl.renderOrder=2; g.add(gl);
  const P=new Parts();
  for(const z of [s.zDock-3.4,s.zDock-1.2,s.zDock+1.2,s.zDock+3.6]) for(const k of [-1,1]) P.add(gR(0.9,0.04,0.1,0),0x2E5BFF,d.x+k*0.38,0.14,z,k*0.6);
  const m=P.build(1,false); m.material=new THREE.MeshBasicMaterial({color:0x2E5BFF}); g.add(m);
  const fr=new Parts(); rectLine(fr,d.x,s.zDock,2.9,7.4,0.13,0x2E5BFF); const fm=fr.build(1,false); fm.material=new THREE.MeshBasicMaterial({color:0x2E5BFF}); g.add(fm);
  View.sites.get(s.id).g.add(g); return g;
}
function applySelVis(sel){
  clearSelVis(); if(!sel) return;
  if(sel.kind==='dock'){ bayVis=makeBayVis(sel.site,sel); return; }
  const host=sel.kind==='truck'?View.trucks.get(sel.id).g:sel.kind==='forklift'?View.forks.get(sel.id).g:sel.kind==='person'?View.people.get(sel.id).rig.g:sel.kind==='pallet'&&View.pallets.get(sel.id)?View.pallets.get(sel.id).mesh:null;
  if(!host) return;
  const dims={truck:[2.4,3.85,7.3],forklift:[1.25,2.4,2.8],pallet:[1.5,1.5,1.5],person:[0.9,1.95,0.9]}[sel.kind];
  selVis=makeBracket(...dims); if(sel.kind==='forklift') selVis.position.z=0.25; host.add(selVis);
}
const _m4=new THREE.Matrix4();
function drawRoute(pts,site){ let n=0; for(const p of pts){ if(n>=dotsMax) break; _m4.makeTranslation(p.x+site.ox,0.16,p.z+site.oz); dots.setMatrixAt(n++,_m4); } dots.count=n; dots.instanceMatrix.needsUpdate=true; }

/* ---------- lingkungan: waktu (pagi–malam) + cuaca, dibaca dari Store.clock & Store.weather ---------- */
const ENV={mix:0,cur:null,flash:0,nextFlash:4}; let RIPPLE=null, DUST=null, HAZE=null, RAIN=null, LAMPG=null, POOLS_L=null, VLIGHT=null, BEAMS=null;
const LOWPOWER = matchMedia('(pointer: coarse)').matches || innerWidth<820 || (navigator.hardwareConcurrency||8)<=4;
const dustTex=canvasTex(64,64,(x)=>{const g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.45,'rgba(255,255,255,.45)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,64,64);});
const lightTex=canvasTex(64,64,(x)=>{const g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.2,'rgba(255,255,255,.8)');g.addColorStop(.5,'rgba(255,255,255,.18)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,64,64);});
const beamTex=canvasTex(64,128,(x)=>{const g=x.createLinearGradient(0,128,0,0);g.addColorStop(0,'rgba(255,255,255,.9)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.beginPath();x.moveTo(26,128);x.lineTo(38,128);x.lineTo(64,0);x.lineTo(0,0);x.closePath();x.fill();});
function makeDust(n,size,ymax,color){
  const S=new Sprites(n,size,color,{additive:false,map:dustTex,order:5}), ph=new Float32Array(n);
  for(let i=0;i<n;i++){ S.set(i,(Math.random()-.5)*110,Math.random()*ymax,(Math.random()-.5)*110,0.6+Math.random()*0.8); ph[i]=Math.random()*6.28; }
  return {S,pts:S.m,pos:S.pos,ph,n,ymax,base:0}; }
function makeRain(n){ const pos=new Float32Array(n*6); for(let i=0;i<n;i++){ const x=(Math.random()-.5)*110, y=Math.random()*30, z=(Math.random()-.5)*110; pos.set([x,y,z,x,y-0.9,z],i*6); }
  const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
  const m=new THREE.LineSegments(geo,new THREE.LineBasicMaterial({color:C(0xB8C6E2),transparent:true,opacity:0,depthWrite:false})); m.frustumCulled=false; m.visible=false; m.renderOrder=5; scene.add(m); return {m,pos,n}; }
class Sprites{
  constructor(n,size,color,{additive=true,map=lightTex,order=6,colors=false}={}){ this.n=n; this.size=size; this.count=0;
    const m=new THREE.InstancedMesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map,color:C(color),transparent:true,opacity:0,depthWrite:false,blending:additive?THREE.AdditiveBlending:THREE.NormalBlending}),n);
    if(colors) m.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(n*3).fill(1),3);
    m.frustumCulled=false; m.visible=false; m.renderOrder=order; m.count=0; scene.add(m); this.m=m; this.pos=new Float32Array(n*3); this.sc=new Float32Array(n).fill(1); }
  set(i,x,y,z,s=1){ this.pos[i*3]=x; this.pos[i*3+1]=y; this.pos[i*3+2]=z; this.sc[i]=s; }
  color(i,r,g,b){ this.m.instanceColor.setXYZ(i,r,g,b); }
  update(count){ this.count=count; this.m.count=count; const q=camera.quaternion; for(let i=0;i<count;i++){ const s=this.size*this.sc[i]; _vm.compose(_vv.set(this.pos[i*3],this.pos[i*3+1],this.pos[i*3+2]),q,_vs.set(s,s,s)); this.m.setMatrixAt(i,_vm); }
    this.m.instanceMatrix.needsUpdate=true; if(this.m.instanceColor) this.m.instanceColor.needsUpdate=true; }
}
function makeGlowPoints(pts,size,color){ const S=new Sprites(pts.length,size,color); pts.forEach((p,i)=>S.set(i,p[0],p[1],p[2])); S.static=true; return S; }
function makeGlowPointsOld(pts,size,color,additive=true){ const pos=new Float32Array(pts.length*3); pts.forEach((p,i)=>pos.set(p,i*3));
  const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
  const m=new THREE.Points(geo,new THREE.PointsMaterial({map:lightTex,size,sizeAttenuation:true,transparent:true,opacity:0,depthWrite:false,color:C(color),blending:additive?THREE.AdditiveBlending:THREE.NormalBlending,fog:true}));
  m.frustumCulled=false; m.visible=false; m.renderOrder=6; scene.add(m); return m; }
function initWeatherFX(){
  DUST=makeDust(LOWPOWER?700:1600,0.6,22,0xE8AE68); DUST.base=0.9; HAZE=makeDust(LOWPOWER?40:80,16,9,0xD9944E); HAZE.base=0.2;
  RAIN=makeRain(LOWPOWER?1600:3800);
  { /* v44: riak tetes hujan di tanah sekitar kamera (cincin melebar lalu pudar, warna instance = kecerahan karena blending aditif) */
    const n=LOWPOWER?70:170, pg=new THREE.PlaneGeometry(1,1); pg.rotateX(-Math.PI/2);
    const tex=canvasTex(64,64,(x,w,h)=>{ x.clearRect(0,0,w,h); x.strokeStyle='rgba(255,255,255,.9)'; x.lineWidth=3; x.beginPath(); x.arc(32,32,26,0,7); x.stroke(); x.strokeStyle='rgba(255,255,255,.35)'; x.lineWidth=2; x.beginPath(); x.arc(32,32,17,0,7); x.stroke(); });
    const m=new THREE.InstancedMesh(pg,new THREE.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,color:0xffffff}),n);
    m.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(n*3),3); m.frustumCulled=false; m.visible=false; m.renderOrder=2; scene.add(m);
    RIPPLE={m,n,p:Array.from({length:n},()=>({x:0,z:0,t:Math.random(),life:0.5+Math.random()*0.35}))}; }
  LAMPG=makeGlowPoints(View.lampPts,2.4,0xFFD08A);
  const dockPts=[]; for(const s of [...Store.all('sites'),...Store.all('stores')]) for(const b of s.bays) dockPts.push([b.x+s.ox,PH+3.2,s.fz+0.4+s.oz]);
  View.dockGlow=makeGlowPoints(dockPts,3.2,0xFFE2B0);
  const pg=new THREE.CircleGeometry(4.2,20); pg.rotateX(-Math.PI/2);
  POOLS_L=new THREE.InstancedMesh(pg,new THREE.MeshBasicMaterial({map:lightTex,color:C(0xFFC46B),transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending}),View.lampPts.length);
  View.lampPts.forEach((p,i)=>POOLS_L.setMatrixAt(i,new THREE.Matrix4().makeTranslation(p[0],0.07,p[2]))); POOLS_L.frustumCulled=false; POOLS_L.visible=false; POOLS_L.renderOrder=2; scene.add(POOLS_L);
  VLIGHT=new Sprites(Store.tables.trucks.size*9+(Store.tables.cars.size+Store.tables.forklifts.size)*4,1.0,0xFFFFFF,{colors:true,order:7});
  initSignalLamps();
  const bg=new THREE.PlaneGeometry(3.4,9); bg.rotateX(-Math.PI/2); bg.translate(0,0,4.5);
  BEAMS=new THREE.InstancedMesh(bg,new THREE.MeshBasicMaterial({map:beamTex,color:C(0xFFF0C8),transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending}),Store.tables.trucks.size+Store.tables.cars.size);
  BEAMS.frustumCulled=false; BEAMS.visible=false; BEAMS.renderOrder=3; scene.add(BEAMS);
}
/* palet waktu: [jam, warna langit, warna matahari, intensitas, langit hemi, tanah hemi, intensitas hemi, malam] */
const DAYKEYS=[[0,'#0C1226',0x8FA8FF,0.11,0x3A4782,0x141A33,0.17,1],[5.2,'#0F1530',0x8FA8FF,0.11,0x3A4782,0x141A33,0.17,1],[6.2,'#E7D2CF',0xFFAE74,0.42,0xFFD8BC,0x9AA2CC,0.62,0.3],
  [8,'BG',0xFFF2E2,0.48,0xF4F5FF,0xCDD2F2,1.0,0],[12,'BG',0xFFFFFF,0.52,0xF6F7FF,0xCDD2F2,1.04,0],[16,'BG',0xFFE8CA,0.48,0xFFF8F0,0xCDD2F2,1.0,0],
  [18,'#E6C1B6',0xFF9050,0.38,0xFFC2A2,0x949AC6,0.62,0.3],[19.2,'#323A68',0x6F7FD0,0.14,0x5763A6,0x252A4C,0.26,0.9],[24,'#0C1226',0x8FA8FF,0.11,0x3A4782,0x141A33,0.17,1]];
/* v44: palet waktu gaya realistis. Matahari lebih kuat dan cahaya langit lebih lemah (bayangan lebih dalam), cahaya pantul tanah
   kecokelatan, langit/kabut biru keabuan, dan senja jingga yang lebih panjang. Format sama dengan DAYKEYS */
const DAYKEYS_R=[[0,'#080C1C',0x8FA4F0,0.1,0x1F2A55,0x0E1018,0.15,1],[5.2,'#0A1024',0x8FA4F0,0.1,0x1F2A55,0x0E1018,0.15,1],[6.1,'#E6C3A6',0xFFA35E,0.6,0xFFCDA6,0x6E6252,0.46,0.3],
  [7.5,'#D2DCE8',0xFFE2B8,1.12,0xD4DCEC,0x7A7262,0.48,0],[12,'#C9D7E9',0xFFF5E6,1.32,0xD0DBEC,0x7E7766,0.5,0],[16,'#D2D9E5',0xFFE2BC,1.2,0xD6DDEE,0x7E7462,0.48,0],
  [17.6,'#E3BC9C',0xFFA055,0.95,0xE8C8AE,0x6A5846,0.42,0.12],[18.4,'#A97C86',0xF0745C,0.36,0x8E7BA8,0x3A3245,0.36,0.55],[19.3,'#20264A',0x7A88D6,0.14,0x313C74,0x15171F,0.2,0.9],[24,'#080C1C',0x8FA4F0,0.1,0x1F2A55,0x0E1018,0.15,1]];
const WXLOOK={clear:{tint:null,amt:0,sun:1,hemi:1,near:230,far:560,dark:0},cloudy:{tint:'#C3C9D6',amt:0.45,sun:0.5,hemi:0.97,near:200,far:480,dark:0.1},
  rain:{tint:'#9DA6B8',amt:0.62,sun:0.3,hemi:0.85,near:80,far:290,dark:0.5},storm:{tint:'#6E778E',amt:0.78,sun:0.18,hemi:0.72,near:55,far:210,dark:0.8},
  fog:{tint:'#DADEE6',amt:0.85,sun:0.42,hemi:1,near:12,far:100,dark:0.5},sandstorm:{tint:'#D7A266',amt:0.86,sun:0.36,hemi:1.05,near:16,far:105,dark:0.4,sky:0xFFD19A,ground:0xC98E55,sunC:0xFFAE63}};
const _ca=new THREE.Color(), _cb=new THREE.Color(), _rm2=new THREE.Matrix4();
function dayAt(h){ const DK=LOOK.real?DAYKEYS_R:DAYKEYS; let i=0; while(i<DK.length-2&&DK[i+1][0]<=h) i++; const A=DK[i], B=DK[i+1], t=clamp((h-A[0])/(B[0]-A[0]),0,1), bg=cssVar('--bg');
  const col=(a,b)=>new THREE.Color(a==='BG'?bg:a).lerp(new THREE.Color(b==='BG'?bg:b),t);
  return {bg:col(A[1],B[1]),sun:new THREE.Color(A[2]).lerp(new THREE.Color(B[2]),t),si:lerp(A[3],B[3],t),hs:new THREE.Color(A[4]).lerp(new THREE.Color(B[4]),t),hg:new THREE.Color(A[5]).lerp(new THREE.Color(B[5]),t),hi:lerp(A[6],B[6],t),n:lerp(A[7],B[7],t)}; }
function envTarget(){ const h=Store.clock.hour, D=dayAt(h), W=WXLOOK[Store.weather.condition]||WXLOOK.clear;
  const bg=D.bg.clone(); if(W.tint){ const tc=new THREE.Color(W.tint).lerp(D.bg,D.n*0.75); bg.lerp(tc,W.amt); }
  const hs=D.hs.clone(), hg=D.hg.clone(), sun=D.sun.clone(); if(W.sky){ hs.lerp(new THREE.Color(W.sky),W.amt*(1-D.n)); hg.lerp(new THREE.Color(W.ground),W.amt*(1-D.n)); sun.lerp(new THREE.Color(W.sunC),W.amt); }
  else if(W.tint){ hs.lerp(new THREE.Color(0xC9CFDA),W.amt*0.5*(1-D.n)); }
  const fr=LOOK.real&&W.near>=200?1.35:1;   /* gaya realistis: kabut cerah lebih jauh supaya sawah & kampung di pinggir kota terlihat */
  return {bg,hs,hg,sun,si:D.si*W.sun,hi:D.hi*W.hemi,fi:(LOOK.real?0.06:0.12)*(1-D.n)*W.sun,near:W.near*fr,far:W.far*fr,n:D.n,lights:Math.max(D.n,W.dark),hour:h}; }
function sunOffset(h){ if(h<5.4||h>19.2) return [-20,52,14]; const t=(h-6)/12, az=lerp(-0.9,0.9,clamp(t,0,1)), el=Math.sin(clamp(t,0,1)*Math.PI); return [Math.sin(az)*-40-6,18+el*36,20+Math.cos(az)*8]; }
function updateWeather(dt,now){
  const T=envTarget(); if(!ENV.cur) ENV.cur={bg:T.bg.clone(),hs:T.hs.clone(),hg:T.hg.clone(),sun:T.sun.clone(),si:T.si,hi:T.hi,fi:T.fi,near:T.near,far:T.far,n:T.n,lights:T.lights};
  const E=ENV.cur, k=1-Math.exp(-dt*1.4);
  E.bg.lerp(T.bg,k); E.hs.lerp(T.hs,k); E.hg.lerp(T.hg,k); E.sun.lerp(T.sun,k); for(const f of ['si','hi','fi','near','far','n','lights']) E[f]+=(T[f]-E[f])*k;
  /* kilat saat badai petir */
  const storm=Store.weather.condition==='storm'; ENV.nextFlash-=dt; if(storm&&ENV.nextFlash<=0){ ENV.flash=1; ENV.nextFlash=5+Math.random()*9; ENV.flash2=0.32; }
  if(ENV.flash2!=null){ ENV.flash2-=dt; if(ENV.flash2<=0){ ENV.flash=Math.max(ENV.flash,0.8); ENV.flash2=null; } }
  ENV.flash=Math.max(0,ENV.flash-dt*5); const fl=ENV.flash*(reduceMotion?0.3:1);
  renderer.setClearColor(_ca.copy(E.bg).lerp(_cb.set(0xEEF2FF),fl*0.6));
  scene.fog.color.copy(E.bg); scene.fog.near=E.near; scene.fog.far=E.far;
  hemi.color.copy(E.hs); hemi.groundColor.copy(E.hg); hemi.intensity=E.hi+fl*1.2; sun.color.copy(E.sun); sun.intensity=E.si; fill.intensity=E.fi;
  const so=sunOffset(Store.clock.hour); for(let i=0;i<3;i++) SUN_OFF[i]+=(so[i]-SUN_OFF[i])*k;
  const L=E.lights;
  for(const nm of View.nightMats) nm.m.emissiveIntensity=nm.max*E.n;
  const lon=L>0.05; LAMPG.m.visible=POOLS_L.visible=lon&&!CLEAN; View.dockGlow.m.visible=lon; LAMPG.m.material.opacity=0.9*L; POOLS_L.material.opacity=0.34*L; View.dockGlow.m.material.opacity=0.75*L;
  if(lon){ LAMPG.update(LAMPG.n); View.dockGlow.update(View.dockGlow.n); }
  updateSignalLamps(dt,now); updateVehicleLights(L); updateClouds(dt,E);
  { const U=THEME_U.uDark; if(Math.abs(U.value-THEME_U.want)>0.001) U.value+=(THEME_U.want-U.value)*Math.min(1,dt*(reduceMotion?60:3.2)); else U.value=THEME_U.want; }
  /* v44: tanah basah naik ±15 dtk setelah hujan mulai, kering ±2 menit setelah reda; warna langit untuk pantulan genangan */
  { const wt=Store.weather.condition==='rain'||storm?1:0; ENV.wet=ENV.wet||0; ENV.wet+=(wt-ENV.wet)*Math.min(1,dt/(wt>ENV.wet?15:110)); GFX_U.uWet.value=LOOK.real?ENV.wet:0; GFX_U.uSky.value.copy(E.hs).multiplyScalar(0.35+E.hi*0.9); }
  /* hujan */
  const rainAmt=Store.weather.condition==='rain'?1:storm?1.6:0; ENV.rain=(ENV.rain||0)+(rainAmt-(ENV.rain||0))*k;
  const R=RAIN; R.m.visible=ENV.rain>0.02;
  if(R.m.visible){ R.m.material.opacity=Math.min(0.75,0.45*ENV.rain); R.m.material.color.set(E.n>0.5?0x8EA0C8:0xB8C6E2); R.m.position.set(cam.target.x,0,cam.target.z);
    const vy=(storm?30:22)*dt, wx=(storm?7:2)*dt, p=R.pos, act=Math.floor(R.n*Math.min(1,ENV.rain/1.6));
    for(let i=0;i<R.n;i++){ const o=i*6; if(i>=act){ p[o+1]=-50; p[o+4]=-50; continue; } p[o]+=wx; p[o+3]+=wx; p[o+1]-=vy; p[o+4]-=vy;
      if(p[o+4]<0||p[o+1]<-40){ const x=(Math.random()-.5)*110, y=24+Math.random()*8, z=(Math.random()-.5)*110, len=storm?1.3:0.9; p[o]=x; p[o+1]=y; p[o+2]=z; p[o+3]=x-(storm?0.3:0.08); p[o+4]=y-len; p[o+5]=z; }
      if(p[o]>55){ p[o]-=110; p[o+3]-=110; } }
    R.m.geometry.attributes.position.needsUpdate=true; }
  if(RIPPLE){ const P=RIPPLE, on=ENV.rain>0.05&&cam.zoom>0.8&&!reduceMotion; P.m.visible=on;
    if(on){ const span=Math.min(70,120/cam.zoom), act=Math.floor(P.n*Math.min(1,ENV.rain)), br=(ENV.cur.n>0.5?0.35:0.55)*Math.min(1,ENV.rain);
      for(let i=0;i<P.n;i++){ const q=P.p[i]; if(i>=act){ P.m.setMatrixAt(i,_hide); continue; } q.t+=dt/q.life;
        if(q.t>=1){ q.t=0; q.x=cam.target.x+(Math.random()-0.5)*span; q.z=cam.target.z+(Math.random()-0.5)*span; }
        const sc=0.12+q.t*0.75, a=(1-q.t)*(1-q.t)*br; _rm2.makeScale(sc,1,sc); _rm2.setPosition(q.x,0.115,q.z); P.m.setMatrixAt(i,_rm2); P.m.setColorAt(i,_cA.setRGB(a,a,a)); }
      P.m.instanceMatrix.needsUpdate=true; P.m.instanceColor.needsUpdate=true; } }
  /* debu (badai pasir) + kabut tanah */
  const sand=Store.weather.condition==='sandstorm', fog=Store.weather.condition==='fog';
  ENV.mix+=((sand||fog?1:0)-ENV.mix)*k; HAZE.pts.material.color.set(fog?0xE4E8EE:0xD9944E); DUST.pts.material.color.set(0xE8AE68);
  DUST.base=sand?0.9:0; HAZE.base=sand?0.2:fog?0.28:0;
  animDust(dt,now,ENV.mix);
}
const _vm=new THREE.Matrix4(), _vv=new THREE.Vector3(), _vq=new THREE.Quaternion(), _vs=new THREE.Vector3(1,1,1), _ve=new THREE.Euler();
function updateVehicleLights(L){
  const on=L>0.05; VLIGHT.m.visible=BEAMS.visible=on; if(!on) return;
  let n=0, b=0;
  const put=(x,y,z,r,g,bl)=>{ VLIGHT.set(n,x,y,z); VLIGHT.color(n,r,g,bl); n++; };
  /* lampu belakang: redup saat jalan biasa, terang saat mengerem (v34) */
  const veh=(x,z,h,fy,fz,fx,ry,rz,rx,beam,ls)=>{ const s=Math.sin(h), c=Math.cos(h), at=(lx,lz,y,r,g,bl)=>put(x+lx*c+lz*s,y,z-lx*s+lz*c,r,g,bl), tb=ls&&ls.brake?1:0.5;
    at(fx,fz,fy,1,0.95,0.8); at(-fx,fz,fy,1,0.95,0.8); at(rx,rz,ry,tb,0.15*tb,0.12*tb); at(-rx,rz,ry,tb,0.15*tb,0.12*tb);
    if(beam){ _ve.set(0,h,0); _vq.setFromEuler(_ve); _vm.compose(_vv.set(x+fz*s,0.06,z+fz*c),_vq,_vs); BEAMS.setMatrixAt(b++,_vm); }
    if(!ls||!ls.truck) return;
    /* sein / hazard (oranye berkedip) dan lampu mundur (putih) */
    if(ls.blinkOn){ for(const sd of [1,-1]) if(ls.turn===sd||ls.hazard){ at(sd*0.92,3.45,1.0,1,0.62,0.08); at(sd*0.965,-3.28,0.82,1,0.62,0.08); } }
    if(ls.rev){ at(0.6,-3.3,0.82,0.95,0.97,1); at(-0.6,-3.3,0.82,0.95,0.97,1); } };
  for(const t of Store.tables.trucks.values()){ if(t.state==='away'||t.presence<0.5) continue; const s=t.site; veh(t.pos.x+s.ox,t.pos.z+s.oz,t.heading,1.0,3.4,0.68,0.82,-3.26,0.82,t.state!=='docked'&&t.state!=='store_docked'&&t.state!=='parked',LAMP_ST.get(t)); }
  if(!CLEAN) for(const c of Store.tables.cars.values()){ if(!c.active||c.presence<0.3) continue; veh(c.x,c.z,c.heading,0.7,1.97,0.55,0.72,-1.97,0.6,true,LAMP_ST.get(c)); }
  for(const f of Store.tables.forklifts.values()){ const s=Store.get('sites',f.siteId)||Store.get('stores',f.siteId); if(!s) continue; const x=f.pos.x+s.ox, z=f.pos.z+s.oz, h=f.heading, sn=Math.sin(h), cs=Math.cos(h);
    put(x+0.3*cs+0.6*sn,0.75,z-0.3*sn+0.6*cs,1,0.95,0.8); put(x-0.3*cs+0.6*sn,0.75,z+0.3*sn+0.6*cs,1,0.95,0.8); }
  VLIGHT.update(n); VLIGHT.m.material.opacity=Math.min(1,0.45+L);
  for(let i=b;i<BEAMS.count;i++) BEAMS.setMatrixAt(i,_hide); BEAMS.instanceMatrix.needsUpdate=true; BEAMS.material.opacity=0.22*L;
}


/* ---------- v38: lampu penyeberang jalan di setiap zebra persimpangan grid ----------
   Dua kepala lampu per zebra (satu di tiap ujung, menghadap ujung seberang). Merah = orang berdiri, hijau = orang berjalan,
   hijau berkedip = jangan mulai menyeberang. Fasenya dari pedPhase() di c_sim.js, jadi sama dengan yang dipatuhi penyeberang. */
let PEDV=null;
function pedIconTex(walk){ return canvasTex(64,64,(x,w,h)=>{ x.fillStyle='#0E1120'; x.fillRect(0,0,w,h); x.fillStyle=walk?'#3BE38A':'#FF4545'; x.strokeStyle=x.fillStyle; x.lineCap='round'; x.lineWidth=6;
  x.beginPath(); x.arc(32,13,6,0,7); x.fill();
  if(walk){ x.beginPath(); x.moveTo(31,22); x.lineTo(28,38); x.lineTo(20,54); x.moveTo(28,38); x.lineTo(38,52); x.moveTo(30,26); x.lineTo(20,34); x.moveTo(30,26); x.lineTo(41,31); x.stroke(); }
  else { x.beginPath(); x.moveTo(32,22); x.lineTo(32,40); x.moveTo(27,40); x.lineTo(27,56); x.moveTo(37,40); x.lineTo(37,56); x.moveTo(25,25); x.lineTo(22,39); x.moveTo(39,25); x.lineTo(42,39); x.stroke(); x.fillRect(24,22,16,18); } }); }
function buildPedSignals(){ const P=new Parts(), heads=[]; const o=ROAD/2+1.6, a=ROAD/2+0.9, out=1.5;
  for(const sg of Store.all('signals')){ if(sg.z===ZHW) continue; const j=[...JUNC.values()].find(q=>Math.abs(q.x-sg.x)<1&&Math.abs(q.z-sg.z)<1); if(!j) continue;
    for(const side of ['N','E','S','W']){ const ax=ZEB_AX[side];
      for(const e of [-1,1]){ let px,pz,ry;
        if(side==='N'||side==='S'){ const zz=sg.z+(side==='N'?-(o+out):(o+out)); px=sg.x+e*a; pz=zz; ry=e>0?-Math.PI/2:Math.PI/2; }
        else { const xx=sg.x+(side==='W'?-(o+out):(o+out)); px=xx; pz=sg.z+e*a; ry=e>0?Math.PI:0; }
        P.add(gCyl(0.05,2.7,6),0x3B4466,px,1.35,pz); P.add(gR(0.36,0.7,0.2,0.05),0x1E2230,px,2.42,pz,ry);
        heads.push({sg,ax,x:px+Math.sin(ry)*0.105,z:pz+Math.cos(ry)*0.105,ry}); } } }
  const pm=P.build(.6); pm.castShadow=true; scene.add(pm); View.clutter.push(pm);
  const mk=walk=>{ const m=new THREE.InstancedMesh(new THREE.PlaneGeometry(0.32,0.32),new THREE.MeshBasicMaterial({map:pedIconTex(walk)}),heads.length); m.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(heads.length*3).fill(0.2),3); m.frustumCulled=false; scene.add(m); View.clutter.push(m); return m; };
  const R=mk(false), G=mk(true), M4=new THREE.Matrix4(), Q=new THREE.Quaternion(), E=new THREE.Euler(), V=new THREE.Vector3(), S=new THREE.Vector3(1,1,1);
  heads.forEach((h,i)=>{ E.set(0,h.ry,0); Q.setFromEuler(E); M4.compose(V.set(h.x,2.58,h.z),Q,S); R.setMatrixAt(i,M4); M4.compose(V.set(h.x,2.26,h.z),Q,S); G.setMatrixAt(i,M4); });
  PEDV={heads,R,G,last:new Map()}; }
function syncPedSignals(now){ if(!PEDV||CLEAN) return; const blink=Math.floor(now/400)%2; let dirty=false;
  PEDV.heads.forEach((h,i)=>{ const ph=pedPhase(h.sg,h.ax), key=ph.off?'o':ph.flash?(blink?'f1':'f0'):ph.walk?'w':'r'; if(PEDV.last.get(i)===key) return; PEDV.last.set(i,key); dirty=true;
    const r=key==='r'?1:0.16, g=key==='w'||key==='f1'?1:0.16; PEDV.R.setColorAt(i,_cA.setRGB(r,r,r)); PEDV.G.setColorAt(i,_cA.setRGB(g,g,g)); });
  if(dirty){ PEDV.R.instanceColor.needsUpdate=PEDV.G.instanceColor.needsUpdate=true; } }
/* ---------- v37: tampilan truk mogok: mekanik berjalan, asap dari gril, segitiga pengaman ---------- */
let BKFX=null;
function syncBreakdowns(dt,now){ if(!View.mech) return;
  if(!BKFX){ BKFX={smoke:new Sprites(60,1.0,0x8E93A3,{additive:false,map:dustTex,order:6}),tri:new Map()}; }
  let ns=0; const tk=now/1000;
  for(const s of Store.all('sites')){ const M=View.mech.get(s.id), t=s.trucks.find(x=>x.broken&&x.state==='docked'), B=t&&t.broken;
    /* segitiga pengaman di depan-kiri kabin */
    let tri=BKFX.tri.get(s.id); if(t&&!tri){ tri=new THREE.Mesh(new THREE.ConeGeometry(0.32,0.5,3),new THREE.MeshStandardMaterial({color:0xE5484D,emissive:C(0x4A0A0A)})); View.sites.get(s.id).g.add(tri); BKFX.tri.set(s.id,tri); }
    if(tri){ tri.visible=!!t; if(t){ const p=tLocal(t,1.55,4.5); tri.position.set(p.x,0.3,p.z); tri.rotation.y=t.heading; } }
    /* asap tipis dari gril sampai mekanik mulai bekerja */
    if(t&&!(B.mech&&B.t-B.mechAt>30)) for(let k=0;k<6&&ns<60;k++){ const life=((tk*0.35)+k/6)%1, g=tLocal(t,0.2*Math.sin(k*2.1),3.55+life*0.6);
      BKFX.smoke.set(ns++,g.x+s.ox+Math.sin(tk+k)*0.25*life,1.25+life*2.6,g.z+s.oz,0.5+life*1.6); }
    /* mekanik: berjalan dari ujung barat trotoar halaman ke depan kabin, memeriksa mesin, lalu pulang */
    const want=!!(t&&B.mech);
    if(want&&(!M.on||M.truck!==t)){ const st={x:s.walkX,z:s.walkZ}, f=tLocal(t,0.35,4.25); Object.assign(M,{on:true,truck:t,x:st.x,z:st.z,lx:st.x,lz:st.z,route:[{x:f.x,z:s.walkZ},f],pose:null,leaving:false}); }
    if(!want&&M.on&&!M.leaving){ M.leaving=true; M.pose=null; M.route=[{x:M.x,z:s.walkZ},{x:s.walkX,z:s.walkZ}]; }
    if(!M.on) continue;
    if(M.route&&M.route.length){ const g=M.route[0], dx=g.x-M.x, dz=g.z-M.z, d=Math.hypot(dx,dz), sp=1.5*dt;
      if(d<=sp){ M.x=g.x; M.z=g.z; M.route.shift(); } else { M.x+=dx/d*sp; M.z+=dz/d*sp; M.h=Math.atan2(dx,dz); } M.v=1.5; M.pose=null; }
    else { M.v=0; if(M.leaving){ M.on=false; updatePerson(M.rig,false); continue; } M.h=t.heading+Math.PI; M.pose=B.t-B.mechAt>25?'look':'clipboard'; }
    animPerson({pos:{x:M.x,z:M.z},y:0.05,heading:M.h,v:M.v,pose:M.pose,look:M.look},M,dt); updatePerson(M.rig,true); }
  BKFX.smoke.m.visible=ns>0; if(ns){ BKFX.smoke.m.material.opacity=0.32; BKFX.smoke.update(ns); } }
/* ---------- v41: pekerja datang & pulang naik motor, ojol antar makanan ke kantin (hanya tampilan) ----------
   Jadwal dihitung dari Store.clock.hour (tanpa RAND), jadi sidik jari simulasi tidak berubah dan putar ulang ikut benar.
   Per gudang 8 motor staf (4 shift pagi, 4 shift malam) parkir di belakang kantin. Pagi datang ±05.42–05.57 dan pulang ±18.04,
   malam datang ±17.42 dan pulang ±06.04. Saat jam melompat (ganti mode waktu, putar ulang) keadaan langsung disamakan tanpa animasi. */
const SM={on:false,lastH:null,sites:[]};
const SM_IN={pagi:5.70,malam:17.70}, SM_OUT={pagi:18.06,malam:6.06};
const SM_JACKET=[0x1E2A55,0x6B7280,0x9A3412,0x14532D,0x312E81,0x7C2D12,0x334155,0x0F766E], SM_HELM=[0xF4F6FB,0x111827,0xE5484D,0x2E5BFF,0xF2C230], SM_BIKE=[0x111827,0xE5484D,0xF4F6FB,0x2E5BFF,0x9AA3BA,0x16A34A];
const smWin=(h,a,b)=>a<b?(h>=a&&h<b):(h>=a||h<b);
function smPools(){ if(SM.pool) return; const B=new Parts();
  B.box(0.3,0.34,1.22,0.12,0xFFFFFF,0,0.58,0); B.box(0.27,0.12,0.6,0.05,0x23262F,0,0.84,-0.14); B.box(0.34,0.2,0.24,0.05,0xFFFFFF,0,0.98,0.5);
  B.box(0.64,0.05,0.05,0.02,0x23262F,0,1.12,0.42); B.box(0.14,0.08,0.05,0.02,0xFFF6D8,0,0.98,0.63); B.box(0.16,0.06,0.04,0.01,0xE5484D,0,0.8,-0.64);
  for(const lz of [0.6,-0.56]) B.add(gWheelLo(),0x1B1E27,0,0.3,lz,0,0.45,0.9,0.9);
  const n=Store.tables.sites.size; SM.pool=new InstPool(B.geometry(),gloss(stdMat(.45,true),0.3,0.7),n*8,{color:true});
  const O=new Parts(); O.box(0.3,0.34,1.22,0.12,0x16A34A,0,0.58,0); O.box(0.27,0.12,0.6,0.05,0x23262F,0,0.84,-0.14); O.box(0.34,0.2,0.24,0.05,0x16A34A,0,0.98,0.5);
  O.box(0.64,0.05,0.05,0.02,0x23262F,0,1.12,0.42); O.box(0.14,0.08,0.05,0.02,0xFFF6D8,0,0.98,0.63); for(const lz of [0.6,-0.56]) O.add(gWheelLo(),0x1B1E27,0,0.3,lz,0,0.45,0.9,0.9);
  O.box(0.52,0.46,0.5,0.06,0x16A34A,0,1.16,-0.6); O.box(0.54,0.08,0.52,0.02,0xF4F6FB,0,1.42,-0.6); O.box(0.53,0.1,0.06,0.01,0xF4F6FB,0,1.16,-0.34);
  SM.opool=new InstPool(O.geometry(),gloss(stdMat(.45,true),0.3,0.7),n); }
function smRig(look){ const rig=makePerson(look); return {rig,look,phase:look.seed,ww:0,poseT:0,lx:0,lz:0,lh:0,busy:false}; }
function initStaffMotos(){ smPools(); SM.sites=[]; let si=0;
  for(const s of Store.all('sites')){ const L=staffLot(s), g=View.sites.get(s.id).g, h=strHash(s.id), bikes=[];
    for(let k=0;k<8;k++){ const sh=k<4?'pagi':'malam', kk=k%4, i=SM.pool.alloc(); SM.pool.color(i,'#'+new THREE.Color(SM_BIKE[(h+k*3)%SM_BIKE.length]).getHexString());
      bikes.push({i,slot:L.slots[k],ta:(SM_IN[sh]+kk*0.06+si*0.013)%24,td:(SM_OUT[sh]+kk*0.05+si*0.011)%24,st:'away',an:null,x:0,z:0,h:0,
        look:{vest:SM_JACKET[(h+k)%SM_JACKET.length],hat:SM_HELM[(h+k*2)%SM_HELM.length],pants:0x2A2F3D,skin:[0xF0C29C,0xD9A57B,0xB9825A,0xE7B48D][(h+k)%4],clip:false,civ:true,seed:(h%97+k*13)/9}}); }
    const rigs=[]; for(let r=0;r<4;r++){ const R=smRig(bikes[r].look); g.add(R.rig.g); updatePerson(R.rig,false); rigs.push(R); }
    const oj=smRig({vest:0x16A34A,hat:0x16A34A,pants:0x23262F,skin:0xD9A57B,clip:false,civ:true,seed:h%53/7}); g.add(oj.rig.g); updatePerson(oj.rig,false);
    SM.sites.push({s,L,g,bikes,rigs,oj,ob:{i:SM.opool.alloc(),an:null},si}); si++; }
  SM.on=true; }
/* rute: daftar titik; kecepatan v, melambat di 2,5 m terakhir. Mengembalikan true bila sudah sampai */
function smMove(o,route,v,dt){ const g=route[0]; if(!g) return true; const dx=g.x-o.x, dz=g.z-o.z, d=Math.hypot(dx,dz);
  let left=d; for(let i=1;i<route.length;i++) left+=Math.hypot(route[i].x-route[i-1].x,route[i].z-route[i-1].z);
  const sp=Math.max(0.9,Math.min(v,left*1.6))*dt; if(d<=sp){ o.x=g.x; o.z=g.z; route.shift(); } else { o.x+=dx/d*sp; o.z+=dz/d*sp; o.hw=Math.atan2(dx,dz); }
  o.h=lerpAngle(o.h,o.hw??o.h,Math.min(1,dt*7)); o.v=sp/Math.max(dt,1e-4); return !route.length; }
function smArrivePath(L,b){ return [{x:L.GX,z:L.zg+0.4},{x:L.GX,z:b.slot.z},{x:b.slot.x,z:b.slot.z}]; }
function smWalkPath(L,b){ return [{x:b.slot.x+0.15,z:b.slot.z+0.75},{x:L.walkX,z:b.slot.z+0.75},{x:L.walkX,z:L.walkZ},{x:L.door.x,z:L.walkZ},{x:L.door.x,z:L.door.z}]; }
function smFreeRig(S){ return S.rigs.find(r=>!r.busy); }
function smDrawPerson(R,o,y,pose,dt,seated){ animPerson({pos:{x:o.x,z:o.z},y,heading:o.h,v:seated?0:o.v,pose,look:R.look},R,dt); updatePerson(R.rig,true);
  if(seated){ const b=palletPools().blob; b.set(R.rig.blobI,_hide); b.set(R.rig.blobI2,_hide); } }
function syncStaffMotos(dt){ if(!SM.on) return; const h=Store.clock.hour; let dh=SM.lastH==null?99:h-SM.lastH; if(dh<-12) dh+=24; if(dh>12) dh-=24;
  const jump=SM.lastH==null||dh<-1e-5||dh>0.2; SM.lastH=h;
  for(const S of SM.sites){ const L=S.L, ox=S.s.ox, oz=S.s.oz;
    for(const b of S.bikes){ const want=smWin(h,b.ta,b.td);
      if(jump&&b.an){ if(b.R){ b.R.busy=false; updatePerson(b.R.rig,false); b.R=null; } b.an=null; }
      if(jump) b.st=want?'parked':'away';
      else if(!b.an&&want&&b.st==='away'){ const R=smFreeRig(S); if(R){ R.busy=true; b.R=R; recolorPerson(R.rig,b.look); R.look=b.look; b.an={k:'ride',route:smArrivePath(L,b),t:0}; b.st='arrive'; b.x=L.out.x; b.z=L.out.z; b.h=0; b.hw=0; } } /* tidak ada rig bebas: tunggu giliran (frame berikutnya), jangan muncul tiba-tiba */
      else if(!b.an&&!want&&b.st==='parked'){ const R=smFreeRig(S); if(R){ R.busy=true; b.R=R; recolorPerson(R.rig,b.look); R.look=b.look; const w=smWalkPath(L,b).reverse(); b.p={x:w[0].x,z:w[0].z,h:Math.PI,v:0}; w.shift(); b.an={k:'walk',route:w,t:0}; b.st='leave'; } }
      const A=b.an;
      if(A){ A.t+=dt;
        if(b.st==='arrive'){
          if(A.k==='ride'){ if(smMove(b,A.route,4.6,dt)){ b.h=b.slot.h; A.k='off'; A.t=0; } smDrawPerson(b.R,{x:b.x-Math.sin(b.h)*0.12,z:b.z-Math.cos(b.h)*0.12,h:b.h,v:0},0.36,'sit',dt,true); }
          else if(A.k==='off'){ const P={x:b.slot.x+0.15,z:b.slot.z+0.75,h:Math.PI/2,v:0}; if(!b.p) b.p=P; smDrawPerson(b.R,b.p,GY,null,dt,false); if(A.t>0.8){ A.k='walk'; A.route=smWalkPath(L,b); A.route.shift(); } }
          else if(A.k==='walk'){ if(smMove(b.p,A.route,1.35,dt)){ b.R.busy=false; updatePerson(b.R.rig,false); b.R=null; b.an=null; b.p=null; b.st='parked'; } else smDrawPerson(b.R,b.p,GY,null,dt,false); } }
        else if(b.st==='leave'){
          if(A.k==='walk'){ if(smMove(b.p,A.route,1.35,dt)){ A.k='on'; A.t=0; } smDrawPerson(b.R,b.p,GY,null,dt,false); }
          else if(A.k==='on'){ smDrawPerson(b.R,{x:b.x-Math.sin(b.h)*0.12,z:b.z-Math.cos(b.h)*0.12,h:b.h,v:0},0.36,'sit',dt,true); if(A.t>0.9){ A.k='ride'; A.route=[{x:L.GX,z:b.slot.z},{x:L.GX,z:L.zg+0.4},{x:L.out.x,z:L.out.z}]; } }
          else if(A.k==='ride'){ if(smMove(b,A.route,4.6,dt)){ b.R.busy=false; updatePerson(b.R.rig,false); b.R=null; b.an=null; b.p=null; b.st='away'; } else smDrawPerson(b.R,{x:b.x-Math.sin(b.h)*0.12,z:b.z-Math.cos(b.h)*0.12,h:b.h,v:0},0.36,'sit',dt,true); } } }
      if(b.st==='parked'&&!b.an){ b.x=b.slot.x; b.z=b.slot.z; b.h=b.slot.h; }
      if(b.st==='away'&&!b.an) SM.pool.set(b.i,_hide);
      else { _pe.set(0,b.h,0); _pq.setFromEuler(_pe); _pm.compose(_pv.set(b.x+ox,GY,b.z+oz),_pq,_ps.set(1,1,1)); SM.pool.set(b.i,_pm); } }
    /* ojol: muncul tiap awal gelombang makan (12.00, 12.30, 00.00, 00.30), antar ke sisi timur kantin, serah terima, lalu pergi */
    const O=S.ob; if(!jump&&!O.an&&dh>0) for(const t0 of [12,12.5,0,0.5]){ const t=(t0+0.01+S.si*0.004)%24, prev=(h-dh+24)%24; if(smWin(t,prev,h)||(prev<=t&&t<h)){
        O.an={k:'ride',route:[{x:L.GX,z:L.zg+0.4},{x:L.GX,z:L.CZ-3.7},{x:L.ojol.x,z:L.CZ-3.0},{x:L.ojol.x,z:L.ojol.z}],t:0}; O.x=L.out.x; O.z=L.out.z; O.h=0; O.hw=0; break; } }
    if(jump&&O.an){ O.an=null; updatePerson(S.oj.rig,false); }
    if(O.an){ const A=O.an; A.t+=dt;
      if(A.k==='ride'){ if(smMove(O,A.route,4.2,dt)){ A.k='give'; A.t=0; } smDrawPerson(S.oj,{x:O.x-Math.sin(O.h)*0.12,z:O.z-Math.cos(O.h)*0.12,h:O.h,v:0},0.36,'sit',dt,true); }
      else if(A.k==='give'){ smDrawPerson(S.oj,{x:O.x-0.55,z:O.z+0.2,h:-Math.PI/2,v:0},GY,A.t<6?'point':null,dt,false); if(A.t>7.5){ A.k='back'; A.route=[{x:L.ojol.x,z:L.CZ-3.0},{x:L.GX,z:L.CZ-3.7},{x:L.GX,z:L.zg+0.4},{x:L.out.x,z:L.out.z}]; } }
      else if(A.k==='back'){ if(smMove(O,A.route,4.2,dt)){ O.an=null; updatePerson(S.oj.rig,false); } else smDrawPerson(S.oj,{x:O.x-Math.sin(O.h)*0.12,z:O.z-Math.cos(O.h)*0.12,h:O.h,v:0},0.36,'sit',dt,true); } }
    if(O.an){ _pe.set(0,O.h,0); _pq.setFromEuler(_pe); _pm.compose(_pv.set(O.x+ox,GY,O.z+oz),_pq,_ps.set(1,1,1)); SM.opool.set(O.i,_pm); } else SM.opool.set(O.i,_hide); } }
/* status untuk UI & sinematik */
function staffMotoInfo(s){ const S=SM.sites.find(x=>x.s===s); if(!S) return null; return {parked:S.bikes.filter(b=>b.st==='parked').length,moving:S.bikes.filter(b=>b.an).length,ojol:!!S.ob.an,ojolGive:S.ob.an&&S.ob.an.k==='give',S}; }
/* ---------- v42: burung (hanya tampilan) ----------
   Kawanan burung terbang berputar di atas kota (lintasan angka delapan, kepak & melayang bergantian, miring saat berbelok)
   dan merpati di halaman tiap gudang: berjalan sambil mematuk dekat kantin dan Pos Sopir, bertengger di balok kanopi kantin,
   lalu kabur beterbangan bila orang, sopir, forklift, truk, atau motor mendekat. Malam & hujan: kawanan kota pulang, merpati bertengger. */
const BIRD={on:false,t:0,pool:null,wing:null,flocks:[],groups:[],n:0};
const PIGEON=[0x8E96A8,0x9AA0AE,0x7A8193,0xD9DCE4,0x8B7563,0x6E7486], SWIFT=[0x3A3F4F,0x4A4038,0x2E3242];
const _bm=new THREE.Matrix4(), _wm=new THREE.Matrix4(), _wq=new THREE.Quaternion(), _we=new THREE.Euler(0,0,0,'YXZ'), _wv=new THREE.Vector3(), _wo=new THREE.Vector3(), _w1=new THREE.Vector3(1,1,1);
function birdPools(N){ if(BIRD.pool) return; const B=new Parts();
  B.add(gSph(1,10),0xFFFFFF,0,0,0,0,0.11,0.1,0.2); B.add(gSph(0.07,8),0xFFFFFF,0,0.085,0.15); B.add(gSph(0.05,6),0x6E9C8C,0,0.05,0.12);
  B.add(gCone(0.022,0.07,6),0x5B5550,0,0.075,0.23,0,1,1,1,Math.PI/2,0); B.box(0.1,0.02,0.13,0.01,0xFFFFFF,0,0.02,-0.22);
  for(const x of [-0.035,0.035]){ B.add(gSph(0.012,5),0x1B1E27,x+Math.sign(x)*0.025,0.1,0.18); B.box(0.015,0.07,0.015,0,0xC86A6A,x,-0.11,0.02); }
  const W=new Parts(); W.box(0.27,0.018,0.15,0.008,0xFFFFFF,0.135,0,0); W.box(0.12,0.012,0.11,0.006,0xFFFFFF,0.3,0,-0.03); W.box(0.2,0.02,0.03,0,0x3A3F4F,0.16,0.005,-0.055);
  BIRD.pool=new InstPool(B.geometry(),gloss(stdMat(.75,true),0.2,0.85),N,{color:true,cast:false});
  const wm=gloss(stdMat(.8,true),0.2,0.85); wm.side=THREE.DoubleSide; BIRD.wing=new InstPool(W.geometry(),wm,N*2,{color:true,cast:false}); }
function mkBird(col,scale){ const i=BIRD.pool.alloc(), w0=BIRD.wing.alloc(), w1=BIRD.wing.alloc(), hex='#'+new THREE.Color(col).getHexString(); BIRD.pool.color(i,hex); BIRD.wing.color(w0,hex); BIRD.wing.color(w1,hex);
  return {i,w0,w1,sc:scale,x:0,y:0,z:0,h:0,pitch:0,roll:0,flap:0,fp:Math.random()*6,glide:Math.random()*9,peck:0,vis:false}; }
function drawBird(b,wingA){ if(!b.vis){ BIRD.pool.set(b.i,_hide); BIRD.wing.set(b.w0,_hide); BIRD.wing.set(b.w1,_hide); return; }
  _we.set(b.pitch,b.h,b.roll); _wq.setFromEuler(_we); _bm.compose(_wv.set(b.x,b.y,b.z),_wq,_wo.set(b.sc,b.sc,b.sc)); BIRD.pool.set(b.i,_bm);
  const fo=1-clamp(b.open??1,0,1); for(const k of [0,1]){ const sd=k?1:-1; _we.set(0,sd*fo*1.35,sd*wingA*(1-fo*0.85),'YZX'); _wq.setFromEuler(_we); /* sayap terlipat ke belakang saat tidak terbang */ _wm.compose(_wv.set(sd*0.07,0.06,0.03),_wq,_wo.set(sd,1,1)); _wm.premultiply(_bm); BIRD.wing.set(k?b.w1:b.w0,_wm); } _we.order='YXZ'; }
/* sudut sayap: kepak cepat saat terbang naik/turun, sesekali melayang dengan sayap sedikit terangkat */
function wingOf(b,dt,flapping,hz){ b.open=lerp(b.open??1,1,1-Math.exp(-dt*10)); b.fp+=dt*hz*Math.PI*2; b.flap=lerp(b.flap,flapping?1:0,1-Math.exp(-dt*6)); return b.flap*(0.25+0.85*Math.sin(b.fp))+(1-b.flap)*0.18; }
function birdSpots(s){ const C=canteen(s), L=s.lounge, X=s.W/2, cz1=C.z+2.75, perch=[]; for(let k=0;k<6;k++) perch.push({x:C.x-3.4+k*1.1,y:3.14,z:cz1-0.15,h:0}); /* di atas balok depan kanopi kantin */
  const g=[{x:X+18.2,y:GY,z:C.z+5.6,r:1.8}]; if(L) g.push({x:L.x-0.8,y:GY,z:L.z+3.9,r:1.6}); return {ground:g,perch}; }
function initBirds(){ const sites=Store.all('sites'); birdPools(sites.length*7+4*9+4);
  BIRD.groups=sites.map((s,si)=>{ const sp=birdSpots(s), h=strHash(s.id), birds=[]; for(let k=0;k<6;k++) birds.push({...mkBird(PIGEON[(h+k*5)%PIGEON.length],1.25),open:0,ox:0,oz:0,tx:0,tz:0,wt:Math.random()*2,from:null,to:null,ft:0,fd:1,delay:0});
    const G={s,sp,birds,st:'ground',spot:sp.ground[0],timer:20+(h%30),cool:2}; for(const b of birds) birdPlace(G,b,true); return G; });
  /* kawanan kota: merpati abu-abu dan burung walet gelap */
  const F=[[ -60,-60,120,60,0.050,15,0],[160,40,100,70,0.060,19,1],[-160,120,90,55,0.045,22,0],[330,-150,110,45,0.055,17,1]];
  BIRD.flocks=F.map(([cx,cz,ax,az,w,alt,sw],fi)=>{ const n=sw?9:7, birds=[]; for(let k=0;k<n;k++){ const b=mkBird((sw?SWIFT:PIGEON)[(fi*3+k)%(sw?3:6)],sw?1.3:1.55); b.ofx=(Math.random()-0.5)*9; b.ofz=(Math.random()-0.5)*9; b.ofy=(Math.random()-0.5)*3; b.ph=Math.random()*6; b.lx=null; birds.push(b); }
    return {cx,cz,ax,az,w,alt,sw,ph:fi*1.7,birds,show:1}; });
  BIRD.on=true; }
function birdPlace(G,b,init){ const S=G.st==='perch'?null:G.spot; if(G.st==='perch'){ const k=G.birds.indexOf(b), P=G.sp.perch[k%G.sp.perch.length]; Object.assign(b,{x:P.x,y:P.y,z:P.z,h:P.h+(Math.random()-0.5)*0.6,pitch:0,roll:0}); }
  else { const a=Math.random()*6.28, r=Math.sqrt(Math.random())*S.r; Object.assign(b,{x:S.x+Math.cos(a)*r,y:S.y+0.12*b.sc,z:S.z+Math.sin(a)*r,h:Math.random()*6.28,pitch:0,roll:0}); b.tx=b.x; b.tz=b.z; } }
/* ancaman di dekat kawanan merpati (koordinat lokal gudang) */
function birdThreat(s,x,z,R){ const R2=R*R, near=(px,pz)=>(px-x)*(px-x)+(pz-z)*(pz-z)<R2;
  for(const p of s.people) if(near(p.pos.x,p.pos.z)) return true;
  for(const f of s.forks) if(near(f.pos.x,f.pos.z)) return true;
  for(const t of s.trucks){ if(t.state==='away') continue; if(near(t.pos.x,t.pos.z)) return true; const d=t.crew; if(d&&d.on&&near(d.x,d.z)) return true; }
  const S=SM.sites&&SM.sites.find(q=>q.s===s); if(S){ for(const b of S.bikes) if(b.an&&near(b.p?b.p.x:b.x,b.p?b.p.z:b.z)) return true; if(S.ob.an&&near(S.ob.x,S.ob.z)) return true; }
  return false; }
function birdTakeoff(G,target,perch){ const sp=G.sp; G.st='fly'; G.next=perch?'perch':'ground'; G.spot=target; let k=0; G.timer=perch?10+Math.random()*15:35+Math.random()*45;
  for(const b of G.birds){ const P=perch?sp.perch[k%sp.perch.length]:null; const a=Math.random()*6.28, r=Math.sqrt(Math.random())*(target.r||0.5);
    b.from={x:b.x,y:b.y,z:b.z}; b.to=P?{x:P.x,y:P.y,z:P.z,h:P.h}:{x:target.x+Math.cos(a)*r,y:target.y+0.12*b.sc,z:target.z+Math.sin(a)*r,h:Math.random()*6.28};
    const d=Math.hypot(b.to.x-b.from.x,b.to.z-b.from.z); b.fd=Math.max(1.6,d/6.5); b.ft=0; b.delay=Math.random()*0.45; b.arc=3.5+d*0.22; k++; }
  if(typeof sndOneShot==='function'&&SND.ctx&&SND.want){ const sx=G.s.ox+G.birds[0].x, sz=G.s.oz+G.birds[0].z, dd=Math.hypot(sx-cam_x(),sz-cam_z()); if(dd<70) sndOneShot('flutter',Math.max(0.15,1-dd/70)); } }
const cam_x=()=>cam.target.x, cam_z=()=>cam.target.z;
function syncBirds(dt){ if(!BIRD.on) return; BIRD.t+=dt; const t=BIRD.t, E=ENV.cur, night=E?E.n:0, wx=Store.weather.condition, wet=wx==='rain'||wx==='storm', dust=wx==='sandstorm';
  /* kawanan kota */
  const fShow=(night>0.55||wet||dust)?0:1;
  for(const F of BIRD.flocks){ F.show=lerp(F.show,fShow,1-Math.exp(-dt*0.8)); const vis=F.show>0.05;
    const u=t*F.w+F.ph, Lx=F.cx+F.ax*Math.sin(u), Lz=F.cz+F.az*Math.sin(2*u), Ly=F.alt+3*Math.sin(u*0.7)+ (1-F.show)*25;
    for(const b of F.birds){ const wob=t*0.6+b.ph; const x=Lx+b.ofx+2.2*Math.sin(wob*1.3), z=Lz+b.ofz+2.2*Math.cos(wob), y=Ly+b.ofy+0.8*Math.sin(wob*2.1);
      if(b.lx!=null){ const vx=x-b.lx, vz=z-b.lz, vy=y-b.ly, sp=Math.hypot(vx,vz); if(sp>1e-4){ const h=Math.atan2(vx,vz), dh=angDiff(b.h,h); b.h=h; b.roll=lerp(b.roll,clamp(-dh/Math.max(dt,1e-3)*0.35,-0.7,0.7),1-Math.exp(-dt*4)); b.pitch=lerp(b.pitch,clamp(-vy/Math.max(sp,1e-3),-0.5,0.5),1-Math.exp(-dt*4)); } }
      b.lx=x; b.ly=y; b.lz=z; b.x=x; b.y=y; b.z=z; b.vis=vis;
      b.glide+=dt; const cyc=(b.glide%(F.sw?2.4:3.6))/(F.sw?2.4:3.6); const wa=wingOf(b,dt,cyc<(F.sw?0.45:0.6)||b.pitch<-0.15,F.sw?9:6.5);
      drawBird(b,wa); } }
  /* merpati di halaman gudang */
  for(const G of BIRD.groups){ const s=G.s, ox=s.ox, oz=s.oz; G.timer-=dt; G.cool-=dt;
    const wantPerch=night>0.5||wet;
    if(G.st==='ground'){
      if(G.cool<=0&&birdThreat(s,G.spot.x,G.spot.z,3.4)){ const alt=G.sp.ground.filter(q=>q!==G.spot); const pr=Math.random()<0.45||!alt.length; birdTakeoff(G,pr?G.sp.perch[0]:alt[Math.floor(Math.random()*alt.length)],pr); G.cool=4; }
      else if(wantPerch||G.timer<=0){ birdTakeoff(G,G.sp.perch[0],true); } }
    else if(G.st==='perch'){ if(!wantPerch&&G.timer<=0){ const g=G.sp.ground; let tgt=g[Math.floor(Math.random()*g.length)]; if(birdThreat(s,tgt.x,tgt.z,4)) tgt=g.find(q=>!birdThreat(s,q.x,q.z,4)); if(tgt) birdTakeoff(G,tgt,false); else G.timer=5; } }
    let landed=0;
    for(const b of G.birds){ let wa=0.05;
      if(G.st==='fly'){ if(b.delay>0){ b.delay-=dt; wa=wingOf(b,dt,true,9)*0.4; }
        else { b.ft+=dt; const k=clamp(b.ft/b.fd,0,1), e=k<0.5?2*k*k:1-Math.pow(-2*k+2,2)/2, A=b.from, B=b.to;
          const nx=lerp(A.x,B.x,e), nz=lerp(A.z,B.z,e), ny=lerp(A.y,B.y,e)+Math.sin(k*Math.PI)*b.arc, vx=nx-b.x, vz=nz-b.z, vy=ny-b.y, sp=Math.hypot(vx,vz);
          if(sp>1e-4){ const h=Math.atan2(vx,vz); b.roll=lerp(b.roll,clamp(-angDiff(b.h,h)*4,-0.6,0.6),1-Math.exp(-dt*5)); b.h=h; } b.pitch=lerp(b.pitch,clamp(-vy/Math.max(sp,1e-3),-0.6,0.6),1-Math.exp(-dt*5));
          b.x=nx; b.y=ny; b.z=nz; wa=wingOf(b,dt,k<0.35||k>0.8,k>0.8?11:8);
          if(k>=1){ b.y=B.y; b.h=B.h??b.h; b.pitch=0; b.roll=0; b.tx=b.x; b.tz=b.z; landed++; wa=0.05; } } }
      else if(G.st==='ground'){ /* berjalan pelan, berhenti, mematuk; kepala mengangguk saat berjalan */
        b.wt-=dt; if(b.wt<=0){ const S=G.spot, a=Math.random()*6.28, r=Math.sqrt(Math.random())*S.r; b.tx=S.x+Math.cos(a)*r; b.tz=S.z+Math.sin(a)*r; b.wt=1.5+Math.random()*3.5; b.peck=Math.random()<0.55?1.2+Math.random()*1.4:0; }
        const dx=b.tx-b.x, dz=b.tz-b.z, d=Math.hypot(dx,dz);
        if(d>0.06&&b.peck<=0){ const h=Math.atan2(dx,dz); b.h+=clamp(angDiff(b.h,h),-dt*5,dt*5); const st=Math.min(d,dt*0.35); b.x+=Math.sin(b.h)*st; b.z+=Math.cos(b.h)*st; b.pitch=0.12*Math.max(0,Math.sin(t*14+b.fp)); }
        else if(b.peck>0){ b.peck-=dt; b.pitch=0.55*Math.max(0,Math.sin(t*9+b.fp))**2; } else b.pitch=lerp(b.pitch,0,1-Math.exp(-dt*6));
        b.y=G.spot.y+0.12*b.sc; b.roll=0; b.flap=0; }
      else { b.pitch=0.06*Math.sin(t*0.7+b.fp)*Math.max(0,Math.sin(t*0.13+b.fp*3)); }  /* bertengger: sesekali merapikan bulu */
      if(!(G.st==='fly'&&b.delay<=0&&b.ft<b.fd)) b.open=lerp(b.open??0,0,1-Math.exp(-dt*7)); /* hinggap / menunggu: sayap dilipat */
      b.vis=true; const lx=b.x, lz=b.z; b.x+=ox; b.z+=oz; drawBird(b,wa); b.x=lx; b.z=lz; }
    if(G.st==='fly'&&landed===G.birds.length){ G.st=G.next; if(G.st==='ground') for(const b of G.birds){ b.wt=Math.random()*1.5; b.peck=0; } } }
}
/* status untuk sinematik */
function birdInfo(){ return BIRD.groups.filter(G=>G.st==='fly').map(G=>G.s.id); }
/* ---------- v34: lampu sinyal kendaraan ----------
   Rem (merah terang), mundur (putih), sein & hazard (oranye berkedip) untuk truk, plus lampu rem mobil.
   Semua dihitung di View dari keadaan Store (kecepatan, status, jalur di depan), jadi simulasi dan sidik jarinya tidak berubah.
   Siang: kotak lampu tanpa pencahayaan (MeshBasic) menutup lensa di model. Malam: sprite cahaya di updateVehicleLights. */
const LAMP_ST=new Map(), LAMP_HOLD=['inbound','toll_in','approach','depart','toll_out','highway','to_store','leave','transfer','gate','yard_wait'];
const LAMP_REV=['reverse','store_reverse'];
const LAMP_COL={brake:'#FF2B2B',rev:'#FFFFFF',turn:'#FFA412'};
/* posisi lensa lokal truk: [lx, y, lz, lebar, tinggi, tebal, jenis]; lampu sein samping di kabin supaya kedipan terlihat dari kamera isometrik */
const TRUCK_LAMPS=[[0.8,0.83,-3.27,0.3,0.2,0.04,'brake'],[-0.8,0.83,-3.27,0.3,0.2,0.04,'brake'],[0.56,0.83,-3.27,0.18,0.2,0.04,'rev'],[-0.56,0.83,-3.27,0.18,0.2,0.04,'rev'],
  [0.97,0.83,-3.27,0.06,0.2,0.04,'turnL'],[-0.97,0.83,-3.27,0.06,0.2,0.04,'turnR'],[0.92,1.0,3.44,0.2,0.2,0.04,'turnL'],[-0.92,1.0,3.44,0.2,0.2,0.04,'turnR'],
  [1.02,1.25,2.2,0.04,0.12,0.3,'turnL'],[-1.02,1.25,2.2,0.04,0.12,0.3,'turnR']];
const CAR_LAMPS=[[0.6,0.72,-1.975,0.34,0.14,0.04,'brake'],[-0.6,0.72,-1.975,0.34,0.14,0.04,'brake']];
let LAMPS=null, HALO=null;
/* status putar ulang (v35, diisi e_ui.js): saat aktif, arah sein diambil dari rekaman, bukan dari jalur hidup */
const RP={on:false,turn:new Map(),hide:new Set(),T:0,play:false,speed:1};
function initSignalLamps(){
  const n=Store.tables.trucks.size*TRUCK_LAMPS.length+Store.tables.cars.size*CAR_LAMPS.length;
  LAMPS=new InstPool(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial({color:0xFFFFFF}),n,{color:true,cast:false,receive:false});
  /* pendar kecil di sekitar lampu yang menyala (siang & malam), hanya untuk truk */
  HALO=new Sprites(Store.tables.trucks.size*6,1.0,0xFFFFFF,{additive:false,colors:true,order:8}); }
const _lm=new THREE.Matrix4(), _lq=new THREE.Quaternion(), _le=new THREE.Euler(), _lv=new THREE.Vector3(), _ls=new THREE.Vector3();
const wrapA=a=>Math.atan2(Math.sin(a),Math.cos(a));
/* arah belok dari jalur di depan: 1 = kiri (+x lokal), -1 = kanan, 0 = lurus. Indeks cache jalur (P.ci) dikembalikan supaya simulasi tidak terganggu */
function turnAhead(t){ const P=t.path; if(!P||t.rev||P.len-t.s<2) return 0; const ci=P.ci;
  const p0=samplePath(P,t.s), h0=Math.atan2(p0.tx,p0.tz), look=clamp(8+t.v*2,10,22); let best=0;
  for(let d=2;d<=look;d+=1.5){ if(t.s+d>P.len) break; const p=samplePath(P,t.s+d), dh=wrapA(Math.atan2(p.tx,p.tz)-h0); if(Math.abs(dh)>Math.abs(best)) best=dh; }
  P.ci=ci; return Math.abs(best)>0.38?Math.sign(best):0; }
function lampState(k,v,dt,now,id){ let L=LAMP_ST.get(k); if(!L){ L={pv:v,bT:0,ph:(strHash(id)%1000)/1000*0.75,turn:0,turnT:0}; LAMP_ST.set(k,L); }
  const dec=(L.pv-v)/Math.max(dt,1e-3); L.pv=v; if(dec>0.9) L.bT=0.35; else L.bT=Math.max(0,L.bT-dt); return L; }
function updateSignalLamps(dt,now){ if(!LAMPS) return; let n=0, nh=0, halo=0; const tsec=now/1000;
  const put=(x,z,h,y0,spec,col)=>{ const s=Math.sin(h), c=Math.cos(h), [lx,ly,lz,w,hh,dd]=spec;
    _le.set(0,h,0); _lq.setFromEuler(_le); _lm.compose(_lv.set(x+lx*c+lz*s,y0+ly,z-lx*s+lz*c),_lq,_ls.set(w,hh,dd)); LAMPS.set(n,_lm); LAMPS.color(n,col); n++;
    if(halo&&nh<HALO.n){ HALO.set(nh,_lv.x,_lv.y,_lv.z,halo); const k=col===LAMP_COL.brake?[1,0.2,0.16]:col===LAMP_COL.rev?[1,1,1]:[1,0.62,0.1]; HALO.color(nh,k[0],k[1],k[2]); nh++; } };
  for(const t of Store.tables.trucks.values()){
    if(t.state==='away'||t.state==='parked'||t.presence<0.5){ LAMP_ST.delete(t); continue; }
    const L=lampState(t,t.v,dt,now,t.id); L.truck=true;
    const hold=LAMP_HOLD.includes(t.state)&&t.v<0.25;
    L.rev=!!t.rev||LAMP_REV.includes(t.state);
    L.brake=L.bT>0||hold||(L.rev&&t.v<0.2);
    /* sein ditahan 0,6 dtk setelah belokan selesai supaya tidak berkedip putus-putus di tikungan halus */
    const tr=RP.on?(RP.turn.get(t)||0):turnAhead(t); if(tr){ L.turn=tr; L.turnT=0.6; } else { L.turnT=Math.max(0,L.turnT-dt); if(!L.turnT) L.turn=0; }
    L.hazard=(t.stuck||0)>25||!!(t.broken&&t.state==='docked');
    L.blinkOn=((tsec+L.ph)%0.75)<0.42;
    const s=t.site, x=t.pos.x+s.ox, z=t.pos.z+s.oz;
    for(const sp of TRUCK_LAMPS){ const k=sp[6];
      const on=k==='brake'?L.brake:k==='rev'?L.rev:L.blinkOn&&(L.hazard||(k==='turnL'?L.turn===1:L.turn===-1));
      halo=k==='brake'?0.75:k==='rev'?0.7:sp[5]>0.1?0:0.95; if(on) put(x,z,t.heading,GY,sp,k==='brake'?LAMP_COL.brake:k==='rev'?LAMP_COL.rev:LAMP_COL.turn); } }
  for(const c of Store.tables.cars.values()){
    if(CLEAN||!c.active||c.presence<0.3||View.motos.has(c.id)){ LAMP_ST.delete(c); continue; }
    const L=lampState(c,c.v,dt,now,c.id); L.brake=L.bT>0||c.v<0.3;
    halo=0; if(L.brake) for(const sp of CAR_LAMPS) put(c.x,c.z,c.heading,0.04,sp,LAMP_COL.brake); }
  HALO.update(nh); HALO.m.visible=nh>0; HALO.m.material.opacity=0.5;
  for(let i=n;i<LAMPS.n;i++) LAMPS.set(i,_hide); LAMPS.n=Math.max(LAMPS.n,n); LAMPS.mesh.count=LAMPS.n; LAMPS.flush(); }
function animDust(dt,now,m){
  for(const D of [DUST,HAZE]){ if(!D) continue; const on=m>0.01&&D.base>0; D.pts.visible=on; if(!on) continue;
    D.pts.material.opacity=D.base*m; D.pts.position.set(cam.target.x,0,cam.target.z);
    const t=now/1000, gust=1+0.45*Math.sin(t*0.7)+0.25*Math.sin(t*2.3), wx=(D===HAZE?(Store.weather.condition==='fog'?1.2:7):15)*gust, wz=3.5*Math.sin(t*0.31), p=D.pos;
    for(let i=0;i<D.n;i++){ const k=i*3; p[k]+=wx*dt; p[k+2]+=(wz+Math.sin(t*1.7+D.ph[i])*1.2)*dt; p[k+1]+=Math.sin(t*2.1+D.ph[i])*0.6*dt;
      if(p[k]>55) p[k]-=110; if(p[k]<-55) p[k]+=110; if(p[k+2]>55) p[k+2]-=110; if(p[k+2]<-55) p[k+2]+=110; if(p[k+1]<0) p[k+1]+=D.ymax; if(p[k+1]>D.ymax) p[k+1]-=D.ymax; }
    D.S.update(D.n); }
}
/* ---------- toko & mal (dibangun dari record store) ---------- */
function storeSign(text,bg){ return canvasTex(1024,160,(x,w,h)=>{ x.fillStyle=bg; x.fillRect(0,0,w,h); x.fillStyle='#fff'; x.font='800 96px "Plus Jakarta Sans", system-ui, sans-serif'; x.textAlign='center'; x.textBaseline='middle'; x.fillText(text.toUpperCase(),w/2,h/2+4); }); }
function buildStoreView(s){
  const g=new THREE.Group(); g.position.set(s.ox,0,s.oz); scene.add(g); View.sites.set(s.id,{g});
  const W=s.W,D=s.D,H=s.H,fz=s.fz, mall=s.type==='Mal', acc=C(s.color).getHex(), R=rng(strHash(s.id));
  const B=new Parts(), GLs=new Parts(), LN=new Parts(), BB=new BlobBatch();
  /* gedung */
  B.box(W,H,D,0.12,mall?0xF1EEF8:0xF7F5EE,0,H/2,0);
  B.box(W+0.3,0.9,D+0.3,0.12,acc,0,H-0.45,0);
  B.box(W+0.5,0.25,D+0.5,0.08,0xFFFFFF,0,H+0.12,0);
  if(mall){ B.box(W*0.45,2.2,D*0.5,0.15,0xE6E1F2,-W*0.15,H+1.3,-D*0.1); B.box(W*0.45+0.2,0.3,D*0.5+0.2,0.08,acc,-W*0.15,H+2.45,-D*0.1);
    for(let i=0;i<3;i++) B.add(gCyl(0.7,0.4,14),0xF4F6FB,W*0.25,H+0.45,-D*0.3+i*1.8); }
  else for(let i=0;i<3;i++) B.box(1.4,0.7,1.0,0.12,0xF4F6FB,-W/2+2+i*2.2,H+0.6,-D*0.2);
  /* fasad kaca di sisi barat (menghadap kamera) */
  GLs.add(gR(0.08,H*0.62,D*0.8,0),0xFFFFFF,-W/2-0.05,H*0.42,0);
  if(mall) GLs.add(gR(0.08,H*0.3,D*0.8,0),0xFFFFFF,-W/2-0.05,H*0.85-0.6,0);
  for(let k=-2;k<=2;k++) B.box(0.12,H*0.65,0.14,0.03,0xD7DCEA,-W/2-0.1,H*0.42,k*D*0.18);
  B.box(0.4,0.22,3.4,0.08,acc,-W/2-0.3,H*0.78,0);
  /* dock */
  const bx=s.bays[0].x, DW=2.3, DH=2.7;
  for(const k of [-1,1]) B.box(0.16,DH+0.14,0.24,0.05,acc,bx+k*(DW/2+0.06),PH+(DH+0.14)/2-0.04,fz+0.06);
  B.box(DW+0.44,0.16,0.24,0.05,acc,bx,PH+DH+0.06,fz+0.06);
  const door=new THREE.Mesh(gR(DW-0.02,DH,0.06,0),doorMat); door.position.set(bx,PH+DH/2,fz+0.02); door.castShadow=true; g.add(door);
  const lamp=RB(g,0.16,0.16,0.06,0.04,LAMP[0],bx+DW/2+0.36,PH+2.4,fz+0.08,{cast:false});
  View.docks.set(s.bays[0].id,{door,lamp,open:0});
  const dk=pickBox(2.6,3.2,1.0); dk.position.set(bx,PH+1.5,fz+0.4); g.add(dk); tagRef(dk,'docks',s.bays[0].id);
  for(const k of [-1,1]) B.box(0.26,0.42,0.16,0.07,0x2B2F3A,bx+k*1.0,PH-0.3,s.zE+0.06);
  B.box(2.2,0.03,1.4,0.02,0xB5BEDC,bx,PH+0.015,s.zE-0.72);
  /* papan nama */
  const sign=new THREE.Mesh(new THREE.PlaneGeometry(Math.min(W*0.7,mall?13:8),mall?1.3:1.0),new THREE.MeshBasicMaterial({map:storeSign(s.name,s.color),transparent:true}));
  sign.position.set(mall?W*0.12:-W*0.08,H-0.45,fz+0.17); g.add(sign);
  const side=sign.clone(); side.rotation.y=-Math.PI/2; side.position.set(-W/2-0.17,H-0.45,0); side.scale.setScalar(0.75); g.add(side);
  /* platform + jalur */
  const PL=new Parts(), conc=0xE4E8F4, yE=PH+0.012;
  PL.box(s.xs1-s.xs0,PH,3.4,0.05,conc,(s.xs0+s.xs1)/2,PH/2,fz+1.7); PL.box(-W/2-s.xs0,PH,10.2,0.05,conc,(s.xs0-W/2)/2,PH/2,fz+1.5);
  PL.box(s.xs1-s.xs0,0.03,0.16,0,0xF0B43C,(s.xs0+s.xs1)/2,yE,s.zE-0.1); PL.box(0.16,0.03,10.2,0,0xF0B43C,s.xs0+0.1,yE,fz+1.5);
  for(let x=s.xs0+0.5;x<s.xs1;x+=1.0){ PL.box(0.5,0.012,0.05,0,0xFFFFFF,x,yE,s.zc+0.72); PL.box(0.5,0.012,0.05,0,0xFFFFFF,x,yE,s.zc-0.72); }
  BB.add(s.xs1-s.xs0+3,5,(s.xs0+s.xs1)/2,fz+2,0.1,true); BB.add(-W/2-s.xs0+3,12,(s.xs0-W/2)/2,fz+1.5,0.1,true); BB.add(W+4,D+4,0,0,0.1,true);
  for(const sl of s.slots){ rectLine(LN,sl.x,sl.z,1.2,1.2,PH+0.014); const pb=pickBox(1.0,1.0,1.0); pb.position.set(sl.x,PH+0.5,sl.z); g.add(pb); tagRef(pb,'slots',sl.id); View.slots.set(sl.id,pb); }
  for(const r of s.rest){ B.box(0.62,1.0,0.38,0.12,0xF4F6FB,r.x,PH+0.5,fz-2.75); B.box(0.3,0.08,0.04,0.02,0x22C55E,r.x,PH+0.82,fz-2.55); }
  rectLine(LN,bx,s.zDock,2.7,7.2,0.1);
  const {xi0,xi1,zi0,zi1}=s.bounds;
  /* parkir pelanggan & pepohonan */
  for(let x=xi0+3;x<xi1-3;x+=2.9){ const z=-fz-7; LN.box(0.08,0.01,4.8,0,0xFFFFFF,x-1.45,0.1,z); if(R()<0.75) addCar(B,pick([0xF3F5FB,0x2E5BFF,0x9AA4C2,0xE0573B,0x17A090,0x3B4A7A],R),x,z,Math.PI); }
  B.box(xi1-xi0-2,0.03,7,0.3,0xD9DEEC,(xi0+xi1)/2,0.09,-fz-7);
  for(let x=xi0+3;x<xi1-2;x+=7){ if(LOOK.real){ realTree(B,x,zi0+1.6,0.85,1,s.ox,s.oz); continue; } B.add(gCyl(0.11,1.0,6),0xB58B63,x,0.6,zi0+1.6); B.add(gSph(1,10),0x5FB880,x,1.8,zi0+1.6,0,0.9,1.15,0.9); }
  g.add(B.build(.62)); g.add(PL.build(.85)); g.add(noTheme(LN.build(.9,false)));
  const gm=GLs.build(.15,false); gm.material=new THREE.MeshStandardMaterial({color:C(mall?0x8FA7E8:0x9CC9B4),roughness:.15,metalness:.1,emissive:C(0xFFE3B0),emissiveIntensity:0}); g.add(gm); View.nightMats.push({m:gm.material,max:0.7});
  const pk=pickBox(W,H,D); pk.position.set(0,H/2,0); g.add(pk); tagRef(pk,'stores',s.id);
  BB.build(g);
}

/* ---------- mode tampilan bersih: sembunyikan keramaian kota, fokus ke operasi gudang ---------- */
let CLEAN=false;
function applyClean(on){ CLEAN=on; for(const o of View.clutter) o.visible=!on; if(SIGPOOL) SIGPOOL.mesh.visible=!on; }

/* ---------- v36: KRL layang ----------
   Jalur kereta komuter layang di atas Jl. z=-38 (di belakang deretan gudang BKS-01, BGR-01, BGR-02), dengan Stasiun Cibinong di x=0.
   Murni tampilan: tidak ada perlintasan sebidang, jadi truk & mobil tidak terpengaruh. Pilar diletakkan di median, jauh dari persimpangan. */
const RAIL={z:-38,y:9.2,x0:-780,x1:780,v:16,acc:0.7,dwell:24,idle:40,t:0,cars:8,carL:19.8,trains:[],stX:0,stName:'Stasiun Cibinong'};
RAIL.top=RAIL.y+0.66;
function railSchedule(){ const R=RAIL, D=R.v*R.v/(2*R.acc), L0=R.x1, cruise=(L0-D)/R.v, td=R.v/R.acc; return {D,L0,cruise,td,T:cruise*2+td*2+R.dwell,P:cruise*2+td*2+R.dwell+R.idle}; }
/* posisi pusat rangkaian (s dari ujung barat/timur), kecepatan, dan fase */
function trainAt(t){ const R=RAIL, S=railSchedule(); let u=((t%S.P)+S.P)%S.P;
  if(u<S.cruise) return {s:R.v*u,v:R.v,ph:'jalan'}; u-=S.cruise;
  if(u<S.td) return {s:S.L0-S.D+R.v*u-0.5*R.acc*u*u,v:R.v-R.acc*u,ph:'melambat'}; u-=S.td;
  if(u<R.dwell) return {s:S.L0,v:0,ph:'berhenti',left:R.dwell-u}; u-=R.dwell;
  if(u<S.td) return {s:S.L0+0.5*R.acc*u*u,v:R.acc*u,ph:'berangkat',dep:u}; u-=S.td;
  if(u<S.cruise) return {s:S.L0+S.D+R.v*u,v:R.v,ph:'jalan'}; return {s:2*S.L0+400,v:0,ph:'luar'}; }
function railTex(text){ return canvasTex(512,64,(x,w,h)=>{ x.fillStyle='#1B2A6B'; x.fillRect(0,0,w,h); x.fillStyle='#F2B53A'; x.fillRect(0,h-6,w,6);
  x.fillStyle='#fff'; x.font='700 34px "Plus Jakarta Sans",system-ui,sans-serif'; x.textBaseline='middle'; x.fillText(text,22,h/2-2); x.textAlign='right'; x.font='600 24px system-ui'; x.fillStyle='#BFD0FF'; x.fillText('KRL · Commuter',w-20,h/2-2); }); }
function buildRailView(){
  const R=RAIL, Z=R.z, Y=R.y, g=new THREE.Group(); scene.add(g); const P=new Parts(), TOP=Y+0.45;
  const vx=[]; for(let k=GRID.x0;k<=GRID.x1+1;k++) vx.push((k-0.5)*PX);
  const nearJ=x=>Math.abs(x)<262&&vx.some(j=>Math.abs(x-j)<13);
  const STW=82; /* setengah panjang stasiun */
  /* pilar T di median jalan */
  for(let x=R.x0+12;x<=R.x1;x+=24){ if(nearJ(x)) continue; const st=Math.abs(x-R.stX)<STW+2;
    P.box(1.1,Y-0.45,1.3,0.18,0xD3D9E6,x,(Y-0.45)/2,Z); P.box(1.5,0.95,st?13.6:7.8,0.14,0xC6CDDD,x,Y-0.55,Z); }
  /* dek + parapet + kerikil + rel */
  P.box(R.x1-R.x0,0.9,7.4,0.08,0xE7EBF4,0,Y,Z); P.box(R.x1-R.x0,0.16,7.5,0.02,0xA9B2C9,0,Y-0.52,Z);
  for(const s of [-1,1]){ P.box(R.x1-R.x0,0.75,0.26,0.05,0xF3F5FA,0,TOP+0.37,Z+s*3.57); P.box(R.x1-R.x0,0.06,0.3,0.02,0x2E5BFF,0,TOP+0.52,Z+s*3.72); }
  for(const tz of [-1.8,1.8]){ P.box(R.x1-R.x0,0.13,2.7,0.03,0x8E919C,0,TOP+0.06,Z+tz); for(const rz of [-0.72,0.72]) P.box(R.x1-R.x0,0.09,0.09,0,0x4E5466,0,TOP+0.17,Z+tz+rz); }
  /* tiang listrik aliran atas (LAA) */
  for(let x=R.x0+24;x<=R.x1;x+=48){ if(Math.abs(x-R.stX)<STW) continue; for(const s of [-1,1]) P.box(0.2,6.2,0.2,0.04,0x9AA3BA,x,TOP+3.1,Z+s*3.35); P.box(0.14,0.18,6.9,0.03,0x9AA3BA,x,TOP+5.7,Z); }
  for(const tz of [-1.8,1.8]) P.box(R.x1-R.x0,0.04,0.04,0,0x5A6178,0,TOP+5.35,Z+tz);
  /* Stasiun Cibinong: peron samping, kanopi, tangga ke trotoar */
  const sx=R.stX; P.box(STW*2+4,0.9,14.2,0.08,0xE7EBF4,sx,Y,Z);
  for(const s of [-1,1]){ const pz=Z+s*5.35;
    P.box(STW*2,1.08,3.3,0.06,0xDDE2EE,sx,TOP+0.54,pz); P.box(STW*2,0.05,0.35,0,0xF2B53A,sx,TOP+1.1,Z+s*3.85);
    P.box(STW*2,1.1,0.18,0.05,0xF3F5FA,sx,TOP+1.63,Z+s*7.0);
    for(let x=sx-STW+8;x<=sx+STW-8;x+=16) P.box(0.22,4.3,0.22,0.05,0xB9C1D8,x,TOP+3.25,Z+s*6.6);
    for(let x=sx-STW+14;x<=sx+STW-14;x+=24) P.box(1.4,0.5,0.45,0.08,0x2E5BFF,x,TOP+1.35,Z+s*6.4); }
  /* kanopi per peron (bagian tengah terbuka supaya kereta tetap terlihat dari atas) */
  for(const s of [-1,1]){ P.add(gR(STW*2+4,0.22,4.6,0.1),0xDCE3F2,sx,TOP+5.45,Z+s*5.6,0,1,1,1,s*0.08,0);
    for(let x=sx-STW;x<=sx+STW;x+=3.2) P.add(gR(0.08,0.05,4.5,0),0xC3CCE2,x,TOP+5.58,Z+s*5.6,0,1,1,1,s*0.08,0);
    P.box(STW*2+4.2,0.5,0.28,0.06,0x2E5BFF,sx,TOP+5.25,Z+s*7.85); P.box(STW*2+4.2,0.12,0.2,0.03,0xF2B53A,sx,TOP+4.98,Z+s*7.85); }
  /* tangga: dari peron turun ke trotoar di kedua sisi jalan (di luar zebra persimpangan) */
  const stair=(x0,x1,pz)=>{ const len=Math.abs(x1-x0), h=TOP+1.08, ang=Math.atan2(h,len), d=Math.sign(x1-x0);
    P.add(gR(Math.hypot(len,h),0.35,2.4,0.05),0xD8DDE9,(x0+x1)/2,h/2,pz,0,1,1,1,0,-d*ang);
    for(const s of [-1,1]) P.add(gR(Math.hypot(len,h),0.07,0.07,0),0x9AA3BA,(x0+x1)/2,h/2+1.0,pz+s*1.15,0,1,1,1,0,-d*ang);
    P.box(2.6,h,2.6,0.1,0xCDD3E2,x0-d*1.3,h/2,pz); };
  stair(sx+62,sx+82,Z+6.1); stair(sx-62,sx-82,Z-6.1); /* jejak tangga dicatat di STATION_STAIRS (c_sim) supaya rute warga memutarinya; ubah keduanya bersamaan */
  const m=P.build(.7); m.castShadow=true; m.receiveShadow=true; g.add(m);
  /* papan nama stasiun di sisi kanopi yang menghadap kamera */
  const sm=new THREE.MeshBasicMaterial({map:railTex(R.stName)});
  for(const [dx,s] of [[-40,1],[40,1],[0,-1]]){ const b=new THREE.Mesh(new THREE.PlaneGeometry(10,1.25),sm); b.position.set(sx+dx,TOP+4.25,Z+s*7.98); if(s<0) b.rotation.y=Math.PI; g.add(b); }
  for(let x=sx-STW+10;x<=sx+STW-10;x+=20) for(const s of [-1,1]) View.lampPts.push([x,TOP+5.1,Z+s*5.4]);
  /* rangkaian kereta: badan, ujung kabin, jendela (menyala malam) */
  const B=new Parts(), CB=new Parts(), WN=new Parts(), carL=19.6, base=0.95;
  const body=(Pp,cab)=>{ Pp.box(carL,3.0,2.9,0.38,0xF4F6FB,0,base+1.5,0); Pp.box(carL-1,0.55,2.5,0.1,0x3A3F4E,0,base-0.2,0);
    Pp.box(carL+0.02,0.3,2.92,0.05,0x2E5BFF,0,base+0.62,0); Pp.box(carL+0.02,0.08,2.92,0,0xF2B53A,0,base+0.84,0);
    for(const x of [-6.6,6.6]){ Pp.box(2.7,0.6,2.3,0.1,0x2B2F3A,x,base-0.35,0); for(const s of [-1,1]) for(const xx of [-0.9,0.9]) Pp.add(gCyl(0.42,0.2,12),0x23262F,x+xx,base-0.42,s*1.08,0,1,1,1,Math.PI/2,0); }
    Pp.box(carL-0.6,0.1,2.5,0.05,0xCDD3E1,0,base+3.02,0); for(let x=-8;x<=8;x+=2) Pp.box(0.08,0.04,2.4,0,0xB9C1D3,x,base+3.08,0);
    for(const x of [-5,5]){ Pp.box(3.0,0.38,1.7,0.12,0x9AA3BA,x,base+3.25,0); Pp.add(gCyl(0.42,0.06,14),0x5A6178,x+0.6,base+3.46,0); }
    for(const x of [-7.6,-2.6,2.6,7.6]) for(const s of [-1,1]) Pp.box(1.25,2.05,0.04,0.02,0xC9D0E0,x,base+1.55,s*1.46);
    if(cab){ Pp.box(0.5,2.3,2.7,0.3,0xF4F6FB,carL/2+0.15,base+1.65,0); Pp.box(0.06,1.15,2.3,0.08,0x16204A,carL/2+0.42,base+2.25,0);
      for(const s of [-1,1]) Pp.box(0.06,0.18,0.42,0.04,0xFFF6D8,carL/2+0.43,base+0.95,s*0.95); Pp.box(0.06,0.3,1.2,0.02,0xF2B53A,carL/2+0.43,base+1.45,0);
      Pp.box(1.8,0.12,0.14,0.02,0x3A3F4E,2,base+3.6,0); Pp.add(gR(1.9,0.06,0.06,0),0x3A3F4E,2.4,base+4.05,0,0,1,1,1,0,0.5); } };
  body(B,false); body(CB,true);
  for(const x of [-5.1,-0.1,5.1]) for(const s of [-1,1]){ WN.box(3.2,0.95,0.05,0.04,0xFFFFFF,x,base+2.15,s*1.47); }
  for(const s of [-1,1]) for(const x of [-8.9,8.9]) WN.box(0.7,0.95,0.05,0.04,0xFFFFFF,x,base+2.15,s*1.47);
  const n=2*R.cars, mat=gloss(stdMat(.35,true),0.3,0.8);
  const mk=(geo,matr,cnt)=>{ const im=new THREE.InstancedMesh(geo,matr,cnt); im.castShadow=true; im.receiveShadow=true; im.frustumCulled=false; for(let i=0;i<cnt;i++) im.setMatrixAt(i,_hide); g.add(im); return im; };
  const winMat=new THREE.MeshStandardMaterial({color:0x1B2340,roughness:0.15,metalness:0.1,emissive:C(0xFFE3A6),emissiveIntensity:0}); View.nightMats.push({m:winMat,max:1.1});
  R.mid=mk(B.geometry(),mat,n), R.cab=mk(CB.geometry(),mat,4), R.win=mk(WN.geometry(),winMat,n); R.win.castShadow=false;
  /* dua arah: timur (lajur kiri = sisi utara, z-1,8) dan barat (z+1,8), jadwal selang setengah periode */
  const S=railSchedule(); R.trains=[{dir:1,z:Z-1.8,off:0,name:'Bogor → Jakarta Kota'},{dir:-1,z:Z+1.8,off:S.P*0.5,name:'Jakarta Kota → Bogor'}];
}
const _rm=new THREE.Matrix4(), _rq=new THREE.Quaternion(), _rv=new THREE.Vector3(), _rs=new THREE.Vector3(1,1,1), _re=new THREE.Euler();
function syncRail(dt){ const R=RAIL; if(!R.mid) return; R.t+=dt; let ci=0, mi=0;
  R.trains.forEach((tr,k)=>{ const st=trainAt(R.t+tr.off), S=railSchedule(); tr.st=st; const X=tr.dir*(st.s-S.L0), out=st.ph==='luar';
    tr.x=X; for(let i=0;i<R.cars;i++){ const cx=X-tr.dir*(i-(R.cars-1)/2)*R.carL, cab=i===0||i===R.cars-1;
      _re.set(0,(tr.dir>0?0:Math.PI)+(i===R.cars-1?Math.PI:0),0); _rq.setFromEuler(_re); _rm.compose(_rv.set(cx,R.top,tr.z),_rq,_rs);
      const hide=out||Math.abs(cx)>R.x1+10;
      if(cab){ R.cab.setMatrixAt(ci++,hide?_hide:_rm); } else R.mid.setMatrixAt(mi++,hide?_hide:_rm);
      R.win.setMatrixAt(k*R.cars+i,hide?_hide:_rm); } });
  R.mid.instanceMatrix.needsUpdate=R.cab.instanceMatrix.needsUpdate=R.win.instanceMatrix.needsUpdate=true; }

/* ---------- v36: bayangan awan berjalan ----------
   Awan menggelapkan cahaya matahari langsung (bukan cahaya langit) pada semua material standar lewat onBeforeCompile,
   jadi tanah, atap, truk, dan rel ikut teduh secara konsisten. Tekstur awan disampel dari posisi dunia (x,z). */
const CLOUD_U={cloudMap:{value:null},cloudOff:{value:new THREE.Vector2()},cloudAmt:{value:0}};
/* v40: tema gelap di scene 3D. Warna netral terang (tanah halaman, apron, dinding putih, trailer) dipetakan ke biru tua sesuai terangnya,
   warna jenuh (atap biru, rompi, palet, lampu) dan marka jalan (userData.noTheme) tidak berubah. uDark dianimasikan, jadi tidak perlu kompilasi ulang */
const THEME_U={uDark:{value:0},want:0};
/* v44: efek permukaan gaya realistis untuk semua bidang datar di permukaan tanah (normal dunia menghadap atas, y < 0,9 m):
   butiran halus + bercak sedang + noda besar dari derau posisi dunia (tanpa UV, jadi jalan, apron, trotoar, dan sawah ikut),
   memudar saat kamera jauh supaya tidak berkedip. uWet (hujan): permukaan menggelap & mengilap, genangan dari derau besar
   memantulkan warna langit. Bukan pantulan sungguhan, tapi murah untuk ponsel */
const GFX_U={uReal:{value:LOOK.real?1:0},uWet:{value:0},uSky:{value:new THREE.Color(0x9fb4d8)}};
const GFX_NOISE='float gHash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }\nfloat gNoise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f); return mix(mix(gHash(i),gHash(i+vec2(1.0,0.0)),f.x),mix(gHash(i+vec2(0.0,1.0)),gHash(i+vec2(1.0,1.0)),f.x),f.y); }\nfloat gFbm(vec2 p){ return gNoise(p)*0.5+gNoise(p*2.03+17.1)*0.3+gNoise(p*4.11+3.7)*0.2; }\n';
const GFX_COLOR='\nfloat gUp=0.0, gPud=0.0;\nif(uReal>0.5){ gUp=smoothstep(0.82,0.96,vNW.y)*(1.0-smoothstep(0.35,0.9,vCloudW.y));\n if(gUp>0.001){ vec2 q=vCloudW.xz; float dist=length(vViewPosition), near=1.0-smoothstep(70.0,190.0,dist);\n'+(LOWPOWER?'  float fine=0.5, mid=gNoise(q*0.35), big=gNoise(q*0.045+5.3);\n':'  float fine=gNoise(q*3.1)*0.6+gNoise(q*9.7)*0.4, mid=gFbm(q*0.35), big=gFbm(q*0.045+5.3);\n')+'  diffuseColor.rgb*=1.0+gUp*((fine-0.5)*0.11*near+(mid-0.5)*0.15+(big-0.5)*0.12);\n  if(uWet>0.001){ gPud=smoothstep(0.54,0.6,gFbm(q*0.09+11.0))*uWet*gUp; diffuseColor.rgb*=mix(1.0,0.64,uWet*gUp)*mix(1.0,0.72,gPud); } } }\n';
function cloudShader(sh){ sh.uniforms.cloudMap=CLOUD_U.cloudMap; sh.uniforms.cloudOff=CLOUD_U.cloudOff; sh.uniforms.cloudAmt=CLOUD_U.cloudAmt; sh.uniforms.uReal=GFX_U.uReal; sh.uniforms.uWet=GFX_U.uWet; sh.uniforms.uSky=GFX_U.uSky;
    sh.uniforms.uDark=THEME_U.uDark; sh.uniforms.uThemeK={value:this&&this.userData&&this.userData.noTheme?0:1};
    sh.vertexShader='varying vec3 vCloudW;\nvarying vec3 vNW;\n'+sh.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\nvec4 cwp=vec4(transformed,1.0);\n#ifdef USE_INSTANCING\ncwp=instanceMatrix*cwp;\n#endif\nvCloudW=(modelMatrix*cwp).xyz;\nvNW=normalize((vec4(transformedNormal,0.0)*viewMatrix).xyz);');
    sh.fragmentShader='varying vec3 vCloudW;\nvarying vec3 vNW;\nuniform sampler2D cloudMap;\nuniform vec2 cloudOff;\nuniform float cloudAmt;\nuniform float uDark;\nuniform float uThemeK;\nuniform float uReal;\nuniform float uWet;\nuniform vec3 uSky;\n'+GFX_NOISE+sh.fragmentShader.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=mix(roughnessFactor,0.22,uWet*gUp); roughnessFactor=mix(roughnessFactor,0.05,gPud);').replace('#include <color_fragment>','#include <color_fragment>'+GFX_COLOR+'\nif(uDark*uThemeK>0.001){ vec3 c0=diffuseColor.rgb; float mx=max(c0.r,max(c0.g,c0.b)), mn=min(c0.r,min(c0.g,c0.b)), lu=dot(c0,vec3(0.2126,0.7152,0.0722)), sa=(mx-mn)/max(mx,1e-3); float w=smoothstep(0.30,0.62,lu)*(1.0-smoothstep(0.12,0.30,sa)); vec3 dk=mix(vec3(0.010,0.015,0.058),vec3(0.046,0.062,0.185),smoothstep(0.62,1.0,lu)); diffuseColor.rgb=mix(c0,dk,w*uDark*uThemeK); }').replace('#include <lights_fragment_end>','#include <lights_fragment_end>\nif(gUp*uWet>0.001){ float fr=pow(1.0-clamp(dot(normal,normalize(vViewPosition)),0.0,1.0),4.0); reflectedLight.indirectSpecular+=uSky*(0.08*uWet*gUp+0.6*gPud)*(0.35+fr); }\nif(cloudAmt>0.001){ float cl=texture2D(cloudMap,vCloudW.xz/520.0+cloudOff).a; float ck=1.0-cloudAmt*cl; reflectedLight.directDiffuse*=ck; reflectedLight.directSpecular*=ck; reflectedLight.indirectDiffuse*=1.0-cloudAmt*cl*0.35; }'); }
/* dipasang di prototipe: semua MeshStandardMaterial (tanah, gedung, truk, kereta) ikut teduh tanpa menyentuh tiap pembuat material */
THREE.MeshStandardMaterial.prototype.onBeforeCompile=cloudShader;
let CLOUDS=null;
function initClouds(){
  const tex=canvasTex(512,512,(x,w,h)=>{ const r=rng(2611); x.clearRect(0,0,w,h);
    for(let i=0;i<22;i++){ const cx=r()*w, cy=r()*h, rad=70+r()*120;
      for(const ox of [-w,0,w]) for(const oy of [-h,0,h]){ const gr=x.createRadialGradient(cx+ox,cy+oy,0,cx+ox,cy+oy,rad); gr.addColorStop(0,'rgba(0,0,0,.55)'); gr.addColorStop(0.5,'rgba(0,0,0,.28)'); gr.addColorStop(1,'rgba(0,0,0,0)'); x.fillStyle=gr; x.beginPath(); x.arc(cx+ox,cy+oy,rad,0,7); x.fill(); } } });
  tex.encoding=THREE.LinearEncoding; tex.wrapS=tex.wrapT=THREE.RepeatWrapping; CLOUD_U.cloudMap.value=tex; CLOUDS={o:0}; }
function updateClouds(dt,E){ if(!CLOUDS) return; const c=Store.weather.condition, want=(c==='clear'?0.3:c==='cloudy'?0.45:0)*(1-clamp(E.n*1.6,0,1))*(reduceMotion?0.6:1);
  CLOUDS.o+=(want-CLOUDS.o)*Math.min(1,dt*0.8); CLOUD_U.cloudAmt.value=CLOUDS.o; const wind=(Store.weather.windKmh||8)/8;
  CLOUD_U.cloudOff.value.x+=dt*0.0011*wind; CLOUD_U.cloudOff.value.y+=dt*0.0005*wind; }
