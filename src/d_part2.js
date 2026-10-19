
/* ---------- site view: dibangun dari record site (angka tata letak) ---------- */
const pickMat=new THREE.MeshBasicMaterial({visible:true});
function pickBox(w,h,d){ const m=new THREE.Mesh(gR(w,h,d,0),pickMat); m.layers.set(1); return m; }
function rectLine(P,cx,cz,lw,ld,y,c=0xF0B43C){P.box(lw,0.012,0.07,0,c,cx,y,cz-ld/2);P.box(lw,0.012,0.07,0,c,cx,y,cz+ld/2);P.box(0.07,0.012,ld,0,c,cx-lw/2,y,cz);P.box(0.07,0.012,ld,0,c,cx+lw/2,y,cz);}
const tagRef=(obj,table,id)=>{ obj.traverse(o=>o.userData.ref={table,id}); View.pickables.push(obj); };
const RIB=(()=>{const t=canvasTex(64,8,(x,w,h)=>{x.fillStyle='#F4F6FB';x.fillRect(0,0,w,h);x.fillStyle='#D7DDEC';x.fillRect(0,0,14,h);x.globalAlpha=.5;x.fillRect(14,0,4,h);x.globalAlpha=1;x.fillStyle='#FFFFFF';x.fillRect(40,0,6,h);});t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;})();
const FLAT=[0.45,0.5];
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
  fence(xi0+0.3,zi0+0.3,xi1-0.3,zi0+0.3); fence(xi0+0.3,zi0+0.3,xi0+0.3,zi1-0.3); fence(xi1-0.3,zi0+0.3,xi1-0.3,zi1-0.3);
  ST.box(xi1-xi0-1,0.05,2.2,0.6,0xE4E9F8,(xi0+xi1)/2,0.11,zi0+1.6); ST.box(2.2,0.05,zi1-zi0-4,0.6,0xE4E9F8,xi0+1.6,0.11,(zi0+zi1)/2); ST.box(2.2,0.05,zi1-zi0-4,0.6,0xE4E9F8,xi1-1.6,0.11,(zi0+zi1)/2);
  const tree=(x,z,k)=>{TR.add(gCyl(0.11,1.0,6),0xB58B63,x,0.6,z);TR.add(gSph(1,10),R()<.5?0x6BC48C:0x5AB47C,x,1.05+k*1.05,z,0,k,k*1.25,k);BB.add(k*2.4,k*2.4,x,z,0.1);};
  const bush=(x,z,k)=>{TR.add(gSph(1,8),0x7CCB97,x,0.1+k*0.5,z,0,k,k*0.7,k);};
  for(let x=xi0+3;x<xi1-2;x+=6.5+R()*1.5) tree(x,zi0+1.6,0.7+R()*0.3);
  for(let z=zi0+6;z<zi1-4;z+=7+R()*2){ tree(xi0+1.6,z,0.7+R()*0.3); tree(xi1-1.6,z,0.7+R()*0.3); }
  for(let x=xi0+6;x<xi1-4;x+=3.3) bush(x+R(),zi0+1.6+(R()-.5),0.45+R()*0.2);
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
  g.add(WP.build(.62,true,RIB)); g.add(TP.build(.6)); g.add(PL.build(.85)); g.add(ST.build(.85)); g.add(LN.build(.9,false)); g.add(TR.build(.8));
  const gm=GL.build(.2,false); gm.material=new THREE.MeshStandardMaterial({color:C(0xFFFFFF),roughness:.2,transparent:true,opacity:.42}); g.add(gm);
  BB.build(g);
}

/* ---------- binding: record → objek 3D ---------- */
function bindEntities(){
  peoplePools(Store.tables.people.size+Store.tables.trucks.size+6);
  for(const t of Store.all('trucks')){ const m=makeTruck(t.carrier,{reefer:!!(t.site&&t.site.profile==='cold')}); View.sites.get(t.siteId).g.add(m.g); m.g.visible=false; tagRef(m.g,'trucks',t.id);
    const seed=strHash(t.id)%997/97, look={vest:new THREE.Color(t.carrier.cs).getHex(),hat:0x1F2A44,clip:false,civ:true,skin:[0xF0C29C,0xD9A57B,0xB9825A][strHash(t.id)%3],pants:0x2E3550,seed};
    const rig=makePerson(look); View.sites.get(t.siteId).g.add(rig.g);
    View.trucks.set(t.id,{...m,spin:0,steerA:0,o:-1,drv:{rig,phase:seed,ww:0,poseT:0,lx:0,lz:0,lh:0,look}}); }
  for(const f of Store.all('forklifts')){ const fs=Store.get('sites',f.siteId), m=makeForklift(fs?fs.profile:'general'); View.sites.get(f.siteId).g.add(m.g); tagRef(m.g,'forklifts',f.id); View.forks.set(f.id,{...m,spin:0,steerA:0}); }
  peoplePools(Store.tables.people.size+Store.tables.trucks.size+6);
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
function animPerson(p,v,dt){
  const m=v.rig, dx=p.pos.x-v.lx, dz=p.pos.z-v.lz, ds=Math.hypot(dx,dz), turnV=angDiff(v.lh,p.heading)/Math.max(dt,1e-4);
  v.lx=p.pos.x; v.lz=p.pos.z; v.lh=p.heading;
  v.phase+=ds/1.3*Math.PI*2+Math.min(Math.abs(turnV),3)*dt*1.4;
  const moving=clamp(p.v/0.85,0,1), stepTurn=clamp(Math.abs(turnV)/2.2,0,1)*0.45;
  v.ww=lerp(v.ww,Math.max(moving,stepTurn),Math.min(1,dt*7));
  const w=v.ww, ph=v.phase, t=performance.now()/1000+p.look.seed, r=Math.min(1,dt*11);
  const pose=p.pose; v.poseT=lerp(v.poseT,pose&&w<0.3?1:0,Math.min(1,dt*5)); const q=v.poseT;
  m.g.position.set(p.pos.x,p.y,p.pos.z); m.g.rotation.y=p.heading;
  const sitQ=(pose==='sit'||pose==='sitchat')?q:0;
  m.hips.position.y=lerp(0.95+(-0.03+0.04*Math.abs(Math.sin(ph)))*w,0.5,sitQ);
  jl(m.hips,'y',0.08*Math.sin(ph)*w,r); jl(m.hips,'z',0.035*Math.cos(ph)*w+0.02*Math.sin(t*0.6)*(1-w),r);
  jl(m.torso,'y',-0.15*Math.sin(ph)*w,r); jl(m.torso,'x',0.06*w+(pose==='clipboard'?0.06:pose==='push'?0.18:0)*q,r);
  m.torso.scale.y=1+0.012*Math.sin(t*2.3)*(1-w);
  let hy=0.12*Math.sin(ph)*w, hx=0;
  if(pose==='look') hy+=Math.sin(t*0.85)*0.75*q; if(pose==='clipboard') hx=0.38*q; if(pose==='point') hx=-0.05*q;
  if(pose==='chat'||pose==='sitchat'){ hy+=Math.sin(t*0.7)*0.25*q; hx+=Math.max(0,Math.sin(t*2.6))*0.12*q; } if(pose==='phone'){ hy+=0.25*q; hx+=0.1*q; } if(pose==='drink') hx+=-0.2*Math.max(0,Math.sin(t*0.9))*q;
  if(!pose) hy+=Math.sin(t*0.4)*0.15*(1-w);
  jl(m.head,'y',hy,r*0.7); jl(m.head,'x',hx,r*0.7);
  for(let i=0;i<2;i++){
    const pi=ph+i*Math.PI, side=i?1:-1;
    const thigh=-0.5*Math.sin(pi)*w, knee=(0.08+0.8*Math.max(0,Math.cos(pi))*Math.max(0,Math.sin(pi+1.2)))*w+0.03;
    jl(m.th[i],'x',lerp(thigh,-1.48,sitQ),r); jl(m.kn[i],'x',lerp(knee,1.5,sitQ),r); jl(m.an[i],'x',lerp(-(thigh+knee)*0.8,0,sitQ),r);
    let shx=0.45*Math.sin(pi)*w+0.04*(1-w), elx=-(0.18+0.42*Math.max(0,-Math.sin(pi)))*w-0.14*(1-w), shz=side*0.05;
    if(pose==='clipboard'){ shx=lerp(shx,i?-0.75:-0.55,q); elx=lerp(elx,i?-1.35:-1.25,q); shz=lerp(shz,side*-0.12,q); }
    if(pose==='point'&&i===1){ shx=lerp(shx,-1.4,q); elx=lerp(elx,-0.1,q); shz=lerp(shz,0.15,q); }
    if(pose==='sit'||pose==='sitchat'){ shx=lerp(shx,-0.35,q); elx=lerp(elx,-0.75,q); }
    if(pose==='sitchat'&&i===1){ const g=Math.max(0,Math.sin(t*1.7)); shx=lerp(shx,-0.6-0.35*g,q); elx=lerp(elx,-1.2,q); shz=lerp(shz,side*-0.25*g,q); }
    if(pose==='chat'&&i===1){ const g=Math.max(0,Math.sin(t*1.9)); shx=lerp(shx,-0.5-0.45*g,q); elx=lerp(elx,-1.0-0.3*g,q); shz=lerp(shz,side*-0.2*g,q); }
    if(pose==='phone'&&i===1){ shx=lerp(shx,-0.45,q); elx=lerp(elx,-2.55,q); shz=lerp(shz,side*-0.35,q); }
    if(pose==='drink'&&i===1){ const g=Math.max(0,Math.sin(t*0.9)); shx=lerp(shx,-0.55-0.6*g,q); elx=lerp(elx,-1.5-0.85*g,q); shz=lerp(shz,side*-0.3,q); }
    if(pose==='push'){ const sw=Math.sin(t*3.2+i*0.6)*0.08; shx=lerp(shx,-1.25+sw,q); elx=lerp(elx,-0.35,q); shz=lerp(shz,side*-0.05,q); }
    jl(m.sh[i],'x',shx,r); jl(m.sh[i],'z',shz,r); jl(m.el[i],'x',elx,r);
  }
}
/* ---------- sinkron tiap frame: baca Store → ubah objek 3D ---------- */
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
    const dv=t.crew, D=v.drv, on=!!(dv&&dv.on);
    if(on){ if(!D.wasOn){ D.lx=dv.x; D.lz=dv.z; D.lh=dv.h; } animPerson({pos:{x:dv.x,z:dv.z},y:0.05+(dv.y||0),heading:dv.h,v:dv.v,pose:dv.pose,look:D.look},D,dt); }
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
    const ni=f.shiftNow==='malam'; if(m.night.visible!==ni){ m.night.visible=ni; m.day.visible=!ni; }
    m.beacon.material.emissiveIntensity=forkWorking(f)?0.35+0.65*Math.max(0,Math.sin(now/180+f.restIdx)):0.15;
  }
  for(const p of Store.tables.people.values()){ const v=View.people.get(p.id); if(v.ver!==p.look.ver){ v.ver=p.look.ver; recolorPerson(v.rig,p.look); } animPerson(p,v,dt); updatePerson(v.rig,p.siteId?true:(!CLEAN&&(p.look.seed%1)<WX.density+0.15)); }
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
  scene.updateMatrixWorld();
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
  syncRail(dt);
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
const ENV={mix:0,cur:null,flash:0,nextFlash:4}; let DUST=null, HAZE=null, RAIN=null, LAMPG=null, POOLS_L=null, VLIGHT=null, BEAMS=null;
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
const WXLOOK={clear:{tint:null,amt:0,sun:1,hemi:1,near:230,far:560,dark:0},cloudy:{tint:'#C3C9D6',amt:0.45,sun:0.5,hemi:0.97,near:200,far:480,dark:0.1},
  rain:{tint:'#9DA6B8',amt:0.62,sun:0.3,hemi:0.85,near:80,far:290,dark:0.5},storm:{tint:'#6E778E',amt:0.78,sun:0.18,hemi:0.72,near:55,far:210,dark:0.8},
  fog:{tint:'#DADEE6',amt:0.85,sun:0.42,hemi:1,near:12,far:100,dark:0.5},sandstorm:{tint:'#D7A266',amt:0.86,sun:0.36,hemi:1.05,near:16,far:105,dark:0.4,sky:0xFFD19A,ground:0xC98E55,sunC:0xFFAE63}};
const _ca=new THREE.Color(), _cb=new THREE.Color();
function dayAt(h){ let i=0; while(i<DAYKEYS.length-2&&DAYKEYS[i+1][0]<=h) i++; const A=DAYKEYS[i], B=DAYKEYS[i+1], t=clamp((h-A[0])/(B[0]-A[0]),0,1), bg=cssVar('--bg');
  const col=(a,b)=>new THREE.Color(a==='BG'?bg:a).lerp(new THREE.Color(b==='BG'?bg:b),t);
  return {bg:col(A[1],B[1]),sun:new THREE.Color(A[2]).lerp(new THREE.Color(B[2]),t),si:lerp(A[3],B[3],t),hs:new THREE.Color(A[4]).lerp(new THREE.Color(B[4]),t),hg:new THREE.Color(A[5]).lerp(new THREE.Color(B[5]),t),hi:lerp(A[6],B[6],t),n:lerp(A[7],B[7],t)}; }
function envTarget(){ const h=Store.clock.hour, D=dayAt(h), W=WXLOOK[Store.weather.condition]||WXLOOK.clear;
  const bg=D.bg.clone(); if(W.tint){ const tc=new THREE.Color(W.tint).lerp(D.bg,D.n*0.75); bg.lerp(tc,W.amt); }
  const hs=D.hs.clone(), hg=D.hg.clone(), sun=D.sun.clone(); if(W.sky){ hs.lerp(new THREE.Color(W.sky),W.amt*(1-D.n)); hg.lerp(new THREE.Color(W.ground),W.amt*(1-D.n)); sun.lerp(new THREE.Color(W.sunC),W.amt); }
  else if(W.tint){ hs.lerp(new THREE.Color(0xC9CFDA),W.amt*0.5*(1-D.n)); }
  return {bg,hs,hg,sun,si:D.si*W.sun,hi:D.hi*W.hemi,fi:0.12*(1-D.n)*W.sun,near:W.near,far:W.far,n:D.n,lights:Math.max(D.n,W.dark),hour:h}; }
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
  /* hujan */
  const rainAmt=Store.weather.condition==='rain'?1:storm?1.6:0; ENV.rain=(ENV.rain||0)+(rainAmt-(ENV.rain||0))*k;
  const R=RAIN; R.m.visible=ENV.rain>0.02;
  if(R.m.visible){ R.m.material.opacity=Math.min(0.75,0.45*ENV.rain); R.m.material.color.set(E.n>0.5?0x8EA0C8:0xB8C6E2); R.m.position.set(cam.target.x,0,cam.target.z);
    const vy=(storm?30:22)*dt, wx=(storm?7:2)*dt, p=R.pos, act=Math.floor(R.n*Math.min(1,ENV.rain/1.6));
    for(let i=0;i<R.n;i++){ const o=i*6; if(i>=act){ p[o+1]=-50; p[o+4]=-50; continue; } p[o]+=wx; p[o+3]+=wx; p[o+1]-=vy; p[o+4]-=vy;
      if(p[o+4]<0||p[o+1]<-40){ const x=(Math.random()-.5)*110, y=24+Math.random()*8, z=(Math.random()-.5)*110, len=storm?1.3:0.9; p[o]=x; p[o+1]=y; p[o+2]=z; p[o+3]=x-(storm?0.3:0.08); p[o+4]=y-len; p[o+5]=z; }
      if(p[o]>55){ p[o]-=110; p[o+3]-=110; } }
    R.m.geometry.attributes.position.needsUpdate=true; }
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
    L.hazard=(t.stuck||0)>25;
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
  for(let x=xi0+3;x<xi1-2;x+=7){ B.add(gCyl(0.11,1.0,6),0xB58B63,x,0.6,zi0+1.6); B.add(gSph(1,10),0x5FB880,x,1.8,zi0+1.6,0,0.9,1.15,0.9); }
  g.add(B.build(.62)); g.add(PL.build(.85)); g.add(LN.build(.9,false));
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
  stair(sx+62,sx+82,Z+6.1); stair(sx-62,sx-82,Z-6.1);
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
function cloudShader(sh){ sh.uniforms.cloudMap=CLOUD_U.cloudMap; sh.uniforms.cloudOff=CLOUD_U.cloudOff; sh.uniforms.cloudAmt=CLOUD_U.cloudAmt;
    sh.vertexShader='varying vec3 vCloudW;\n'+sh.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\nvec4 cwp=vec4(transformed,1.0);\n#ifdef USE_INSTANCING\ncwp=instanceMatrix*cwp;\n#endif\nvCloudW=(modelMatrix*cwp).xyz;');
    sh.fragmentShader='varying vec3 vCloudW;\nuniform sampler2D cloudMap;\nuniform vec2 cloudOff;\nuniform float cloudAmt;\n'+sh.fragmentShader.replace('#include <lights_fragment_end>','#include <lights_fragment_end>\nif(cloudAmt>0.001){ float cl=texture2D(cloudMap,vCloudW.xz/520.0+cloudOff).a; float ck=1.0-cloudAmt*cl; reflectedLight.directDiffuse*=ck; reflectedLight.directSpecular*=ck; reflectedLight.indirectDiffuse*=1.0-cloudAmt*cl*0.35; }'); }
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
