
/* ==========================================================================
   DATA · tata letak site (angka saja) + pembuatan record awal di Store
   ========================================================================== */
function newPallet(site,R,packing,layers,location,extra){
  const it=site.inv[Math.floor(R()*site.inv.length)];
  const d=nowWIB(); d.setHours(d.getHours()-Math.floor(R()*30));
  const p={kind:'pallet',id:Store.nextId('PLT'),siteId:site.id,createdT:0,item:it.name,col:it.col,qty:20+Math.floor(R()*60),kg:40+Math.floor(R()*420),
    lot:'L'+(1200+Math.floor(R()*700))+'-'+String.fromCharCode(65+Math.floor(R()*6)),recv:d.toLocaleDateString('id-ID',{day:'numeric',month:'short'})+', '+hm(d),
    packing:packing||'box',layers:layers||2+Math.floor(R()*2),hold:false,location:location||null,...(extra||{})};
  return Store.add('pallets',p);
}
function setPalletLocation(pid,loc){ const p=Store.get('pallets',pid); if(p) p.location=loc; }
function deletePallet(pid){ Store.remove('pallets',pid); }
let SHIP_SEQ=24180; /* nomor kiriman berurutan: tidak pernah bentrok */
function newShipment(site,truck,mode){
  const city=pick(CITIES);
  const sh={kind:'shipment',id:'KRM-'+(++SHIP_SEQ),siteId:site.id,truckId:truck.id,direction:mode==='load'?'outbound':'inbound',
    customer:pick(CUSTOMERS),origin:mode==='load'?site.name:city,destination:mode==='load'?city:site.name,status:'scheduled',total:0,createdAt:hm(nowWIB())};
  if(Store.tables.shipments.size>160){ for(const [id,o] of Store.tables.shipments){ if(o.status==='delivered'||o.status==='completed'){ Store.remove('shipments',id); break; } } }
  return Store.add('shipments',sh);
}
const TRUCK_CIRC=[{z:2.25,r:1.06},{z:0.05,r:1.06},{z:-2.15,r:1.06}];
const FORK_CIRC=[{z:0.72,r:0.6},{z:-0.42,r:0.6},{z:1.42,r:0.42}];
const PERSON_CIRC=[{z:0,r:0.34}];
function truckRecord(site,id,car,R){
  const t={kind:'truck',id,siteId:site.id,carrier:car,driver:pick(DRIVERS,R),plate:plate(R),state:'away',mode:'load',dockId:null,shipmentId:null,
    done:0,total:0,cargo:new Array(6).fill(null),pos:P2(-500,-500),heading:Math.PI/2,v:0,doorsT:0,presence:1,
    acc:2.4,dec:3.4,vmax:7,path:null,s:0,circ:TRUCK_CIRC,solid:false,wait:0,pending:0,res:null,wantDoors:0,curv:0,stuck:0};
  relate(t,'site','sites','siteId'); hidden(t,'dest',null); relate(t,'bay','docks','dockId'); relate(t,'shipment','shipments','shipmentId'); hidden(t,'assigned',null);
  Object.defineProperty(t,'ship',{enumerable:false,get(){return this.shipment?this.shipment.id:'—';}});
  Object.defineProperty(t,'place',{enumerable:false,get(){const s=this.shipment; return s?(this.mode==='load'?s.destination:s.origin):'—';}});
  Object.defineProperty(t,'customer',{enumerable:false,get(){return this.shipment?this.shipment.customer:'—';}});
  site.trucks.push(t); return Store.add('trucks',t);
}
function createSite(C,idx){
  const R=rng(idx*977+13);
  const W=C.W,D=C.D,H=C.H,fz=D/2, cx=C.gx*PX, cz=C.gz*PZ, ox=cx+1.75, oz=cz+PZ/2-(fz+21.8);
  const s={kind:'site',id:C.id,name:C.name,type:C.type,address:C.address,capacity:C.capacity,stock:C.stock,ontimePct:C.ontimePct,ontimeDelta:C.ontimeDelta,
    idx,gx:C.gx,gz:C.gz,W,D,H,roof:C.roof,annex:!!C.annex,profile:C.profile||'general',bayCount:C.bays,forkCount:C.forks,ox,oz,fz,
    zE:fz+3.4,zDock:fz+6.6,Zr:fz+19.6,zc:fz+1.5,xL:(cx-PX/2)-ox,xR:(cx+PX/2)-ox,xs0:-W/2-20.6,xs1:W/2+0.6,
    bounds:{xi0:cx-PX/2+ROAD/2+SW-ox,xi1:cx+PX/2-ROAD/2-SW-ox,zi0:cz-PZ/2+ROAD/2+SW-oz,zi1:cz+PZ/2-ROAD/2-SW-oz},
    stockDelta:12+Math.floor(R()*10),outToday:18+Math.floor(R()*9),putToday:11+Math.floor(R()*8),arrivals:1+Math.floor(R()*3),
    inv:C.inventory.map(a=>({name:a[0],qty:a[1],col:a[2]}))};
  for(const k of ['trucks','forks','people','bays','slots','holds','res','spans','rest']) hidden(s,k,[]);
  hidden(s,'R',R);
  Store.add('sites',s);
  /* docks */
  for(let i=0;i<C.bays;i++){ const bx=(i-(C.bays-1)/2)*3.6;
    const d={kind:'dock',id:C.id+'-B'+(i+1),siteId:s.id,label:'Bay '+(i+1),i,x:bx,truckId:null,doorState:'closed',today:2+Math.floor(R()*6),pos:P2(bx,s.zDock)};
    relate(d,'truck','trucks','truckId'); relate(d,'site','sites','siteId'); s.bays.push(Store.add('docks',d)); }
  /* staging slots + pallets */
  for(let row=0;row<2;row++)for(let c=0;c<5;c++){
    const sx=-W/2-2.6-c*1.75, sz=row===0? fz-2.4 : fz+5.0;
    const sl={kind:'slot',id:C.id+'-S'+(row?'B':'A')+(c+1),siteId:s.id,code:(row?'B':'A')+(c+1),row,x:sx,z:sz,palletId:null,reserved:false,
      spot:{x:sx,z:row===0? sz+1.18 : sz-1.18,face:row===0?Math.PI:0}};
    relate(sl,'data','pallets','palletId'); Object.defineProperty(sl,'occupied',{enumerable:false,get(){return !!this.palletId;}});
    Store.add('slots',sl); s.slots.push(sl);
    if(R()<0.66){ const pk=R()<0.2?'crate':R()<0.18?'white':'box'; const p=newPallet(s,R,pk,undefined,{type:'slot',id:sl.id}); sl.palletId=p.id; }
  }
  /* charger / rest spots */
  for(let i=0;i<C.forks;i++) s.rest.push({x:-W/2-11.6-i*2.6,z:fz-0.4,face:Math.PI});
  /* Pos Sopir: area istirahat sopir di sisi barat platform + jalur pejalan kaki di depan deretan truk */
  { const LX=-W/2-25.2, LZ=fz+4.2; s.walkZ=fz+6.6+4.3; s.walkX=s.xs0-1.2;
    hidden(s,'lounge',{x:LX,z:LZ,entry:{x:s.walkX,z:LZ+2.6},spots:[
      {x:LX-1.6,z:LZ-1.15,face:0,kind:'bench'},{x:LX-0.5,z:LZ-1.15,face:0,kind:'bench'},{x:LX+0.6,z:LZ-1.15,face:0,kind:'bench'},
      {x:LX-0.75,z:LZ+0.55,face:Math.PI/2,kind:'stool',pair:4},{x:LX+0.75,z:LZ+0.55,face:-Math.PI/2,kind:'stool',pair:3},
      {x:LX-1.85,z:LZ+1.55,face:-Math.PI/2,kind:'counter'},{x:LX-1.85,z:LZ+0.75,face:-Math.PI/2,kind:'counter'},
      {x:LX+1.05,z:LZ+2.75,face:-Math.PI/2,kind:'stand',pair:8},{x:LX-0.05,z:LZ+2.75,face:Math.PI/2,kind:'stand',pair:7}]}); }
  /* QC hold pallets */
  for(let i=0;i<2;i++){ const p=newPallet(s,R,i?'crate':'white',2,{type:'hold',id:s.id,index:i},{hold:true}); p.holdPos={x:W/2+3.0+i*1.6,z:fz+3.6+i*0.6}; s.holds.push(p); }
  return s;
}
function populateSite(s){
  const R=s.R, W=s.W, fz=s.fz, cx=s.gx*PX, cz=s.gz*PZ;
  for(let i=0;i<s.bayCount+4;i++){ const t=truckRecord(s,'TRK-'+(3104+i*59+s.idx*97),CARRIERS[(i+s.idx)%CARRIERS.length],R); t.wait=0.3+i*4; }
  for(let i=0;i<2;i++){ const t=truckRecord(s,'TRK-'+(4705+i*11+s.idx*23),CARRIERS[(i+1+s.idx)%CARRIERS.length],R);
    t.state='parked'; t.solid=true; t.pos.set(W/2+9+i*2.8,0,fz+2); t.heading=0; const sh=newShipment(s,t,'load'); t.shipmentId=sh.id; }
  for(let i=0;i<s.forkCount;i++){ const sp=s.rest[i];
    const f={kind:'forklift',id:s.id+'-FL'+(i+1),siteId:s.id,short:'FL-0'+(i+1),task:'Siaga di stasiun',charging:false,battery:45+Math.floor(R()*50),carryingPalletId:null,
      lift:0.03,pos:P2(sp.x,sp.z),heading:sp.face,v:0,moves:6+Math.floor(R()*20),restIdx:i,
      acc:1.6,dec:2.6,vmax:2.2,path:null,s:0,circ:FORK_CIRC,solid:true,q:[],liftGoal:0.03,span:null,idleT:0,curv:0};
    relate(f,'site','sites','siteId'); hidden(f,'spot',sp); hidden(f,'drivers',{pagi:pick(WORKERS,R),malam:pick(WORKERS,R)}); hidden(f,'paceMul',{cold:0.85,robotic:1.12,crossdock:1.1}[s.profile]||1); hidden(f,'shiftNow','pagi'); s.forks.push(Store.add('forklifts',f)); }
  const L=cx-43.6-s.ox, Rr=cx+43.6-s.ox, zB=cz-31.6-s.oz, zF=cz+29-s.oz, route=[{x:L,z:zF},{x:L,z:zB},{x:Rr,z:zB},{x:Rr,z:zF}];
  hidden(s,'gate',{x:L+0.9,z:zF-2.2,post:{x:L-1.6,z:zF-2.2}});
  for(let i=0;i<3;i++){ const a=route[i], b=route[i+1], t=0.3+R()*0.4, dx=b.x-a.x, dz=b.z-a.z, l=Math.hypot(dx,dz);
    personRecord(s,R,'Petugas keamanan',{plan:'patrol',route,ri:i+1,y:0.08,start:{x:a.x+dx*t+dz/l*0.45,z:a.z+dz*t-dx/l*0.45,h:Math.atan2(dx,dz)},look:{vest:0x2E5BFF,hat:0xFFFFFF}}); }
  { const g=siteGate(s); personRecord(s,R,'Petugas gerbang',{plan:'gatekeeper',y:0.08,start:{x:g.home.x,z:g.home.z,h:Math.PI},look:{vest:0x2E5BFF,hat:0xFFFFFF,clip:true}}); }
  personRecord(s,R,'Pengawas dock',{plan:'supervisor',y:PH,start:{x:s.bays[0].x,z:fz+0.34,h:0},look:{vest:0xF26B1D,hat:0xFFFFFF,clip:true}});
  personRecord(s,R,'Petugas QC',{plan:'qc',y:GY,start:{x:W/2+2.6,z:fz+2.3,h:0},look:{vest:0xF6C40A,hat:0xF6C40A,clip:true}});
  /* dua operator gudang di area timur (lihat PLANS.picker) */
  personRecord(s,R,'Operator gudang',{plan:'picker',ri:0,y:GY,start:{x:W/2+10.4,z:fz-7.6,h:Math.PI},look:{vest:0xF26B1D,hat:0xF6C40A,clip:true}});
  personRecord(s,R,'Operator gudang',{plan:'picker',ri:5,y:GY,start:{x:W/2+15.2,z:fz-4.2,h:-Math.PI/2},look:{vest:0xF26B1D,hat:0xF6C40A,clip:true}});
}
const SHIFT_UNIFORM={
  'Petugas keamanan':{pagi:{vest:0x2E5BFF,hat:0xFFFFFF},malam:{vest:0x1E2A55,hat:0x2E5BFF}},
  'Petugas gerbang':{pagi:{vest:0x2E5BFF,hat:0xFFFFFF},malam:{vest:0x1E2A55,hat:0x2E5BFF}},
  'Pengawas dock':{pagi:{vest:0xF26B1D,hat:0xFFFFFF},malam:{vest:0x8BD12A,hat:0xFFFFFF}},
  'Petugas QC':{pagi:{vest:0xF6C40A,hat:0xF6C40A},malam:{vest:0x8BD12A,hat:0xF6C40A}},
  default:{pagi:{vest:0xF26B1D,hat:0xF6C40A},malam:{vest:0x8BD12A,hat:0xFFFFFF}}};
const PROFILE_UNIFORM={
  cold:{pagi:{vest:0x1E40AF,hat:0xFFFFFF},malam:{vest:0x13296B,hat:0x8BD12A}},
  dc:{pagi:{vest:0x7C3AED,hat:0xFFFFFF},malam:{vest:0x5B21B6,hat:0x8BD12A}},
  robotic:{pagi:{vest:0xE2E8F0,hat:0x2E5BFF},malam:{vest:0x334155,hat:0x2E5BFF}}};
const SHIFTS={pagi:{label:'Shift Pagi',hours:'06.00–18.00'},malam:{label:'Shift Malam',hours:'18.00–06.00'}};
function personRecord(site,R,role,o){
  const p={kind:'person',id:(site?site.id:'KOTA')+'-P'+(Store.all('people').length+1),siteId:site?site.id:null,name:pick(WORKERS,R),role,
    shift:'Pagi 06.00–18.00',doing:'Berjalan',pose:null,pos:P2(o.start.x,o.start.z),heading:o.start.h||0,v:0,y:o.y,
    acc:1.4,dec:2.6,vmax:1.0+R()*0.3,path:null,s:0,circ:PERSON_CIRC,solid:true,act:[],plan:o.plan,route:o.route,ri:o.ri||0,rd:1,lastBay:-1};
  hidden(p,'look',{...o.look,seed:R()*10,skin:pick([0xF0C29C,0xD9A57B,0xB9825A,0xE7B48D],R),pants:pick([0x2E3550,0x3B4462,0x2A2F3D],R)});
  if(site){ hidden(p,'names',{pagi:p.name,malam:pick(WORKERS.filter(n=>n!==p.name),R)}); hidden(p,'shiftNow','pagi');
    const U=(role!=='Petugas keamanan'&&role!=='Petugas gerbang'&&PROFILE_UNIFORM[site.profile])||SHIFT_UNIFORM[role]||SHIFT_UNIFORM.default; hidden(p,'uniform',{pagi:{...U.pagi,clip:o.look.clip},malam:{...U.malam,clip:o.look.clip}});
    hidden(p,'skins',{pagi:p.look.skin,malam:pick([0xF0C29C,0xD9A57B,0xB9825A,0xE7B48D],R)}); Object.assign(p.look,p.uniform.pagi); }
  if(site){ relate(p,'site','sites','siteId'); site.people.push(p); }
  return Store.add('people',p);
}

/* ---------- toko / mal tujuan pengiriman (data) ---------- */
const STORE_CONFIG=[
  {id:'TK-01',name:'Segar Mart',type:'Supermarket',address:'Jl. Raya Bogor Km 32',gx:2,gz:0,W:14,D:10,H:5.2,color:'#16A34A'},
  {id:'TK-02',name:'Nusantara Plaza',type:'Mal',address:'Jl. Pajajaran No. 88',gx:-1,gz:1,W:22,D:12,H:8.5,color:'#7C3AED'}
];
function createStore(C,idx){
  const W=C.W,D=C.D,fz=D/2, cx=C.gx*PX, cz=C.gz*PZ, ox=cx+1.75, oz=cz+PZ/2-(fz+21.8);
  const s={kind:'store',id:C.id,name:C.name,type:C.type,address:C.address,color:C.color,idx:-1-idx,gx:C.gx,gz:C.gz,W,D,H:C.H,ox,oz,fz,
    zE:fz+3.4,zDock:fz+6.6,Zr:fz+19.6,zc:fz+1.5,xL:(cx-PX/2)-ox,xR:(cx+PX/2)-ox,xs0:-W/2-12,xs1:W/2+0.6,
    bounds:{xi0:cx-PX/2+ROAD/2+SW-ox,xi1:cx+PX/2-ROAD/2-SW-ox,zi0:cz-PZ/2+ROAD/2+SW-oz,zi1:cz+PZ/2-ROAD/2-SW-oz},
    receivedToday:4+Math.floor(RAND()*6),returnsToday:Math.floor(RAND()*4),stockDelta:0,putToday:0,outToday:0,arrivals:0,
    inv:[{name:'Barang retur',qty:0,col:'#E9EDF8'}]};
  for(const k of ['trucks','forks','people','bays','slots','holds','res','spans','rest']) hidden(s,k,[]);
  Store.add('stores',s);
  const d={kind:'dock',id:C.id+'-B1',siteId:s.id,label:'Dock toko',i:0,x:0,truckId:null,doorState:'closed',today:1,pos:P2(0,s.zDock)};
  relate(d,'truck','trucks','truckId'); relate(d,'site','stores','siteId'); s.bays.push(Store.add('docks',d));
  for(let c=0;c<3;c++) for(let row=0;row<2;row++){ const sx=-W/2-2.6-c*1.75, sz=row===0?fz-2.4:fz+5.0;
    const sl={kind:'slot',id:C.id+'-S'+(row?'B':'A')+(c+1),siteId:s.id,code:(row?'B':'A')+(c+1),row,x:sx,z:sz,palletId:null,reserved:false,spot:{x:sx,z:row===0?sz+1.18:sz-1.18,face:row===0?Math.PI:0}};
    relate(sl,'data','pallets','palletId'); Object.defineProperty(sl,'occupied',{enumerable:false,get(){return !!this.palletId;}});
    Store.add('slots',sl); s.slots.push(sl); }
  s.rest.push({x:-W/2-9.0,z:fz-0.4,face:Math.PI});
  for(let i=0;i<2;i++){ const sl=s.slots[i*2]; const p=newPallet(s,RAND,'white',1,{type:'slot',id:sl.id},{retur:true,item:'Retur kardus & palet kosong'}); sl.palletId=p.id; }
  const sp=s.rest[0];
  const f={kind:'forklift',id:s.id+'-FL1',siteId:s.id,short:'FL-T',task:'Siaga di stasiun',charging:false,battery:80,carryingPalletId:null,
    lift:0.03,pos:P2(sp.x,sp.z),heading:sp.face,v:0,moves:Math.floor(RAND()*8),restIdx:0,
    acc:1.6,dec:2.6,vmax:2.2,path:null,s:0,circ:FORK_CIRC,solid:true,q:[],liftGoal:0.03,span:null,idleT:0,curv:0};
  relate(f,'site','stores','siteId'); hidden(f,'spot',sp); s.forks.push(Store.add('forklifts',f));
  return s;
}
