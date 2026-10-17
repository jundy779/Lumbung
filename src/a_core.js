<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script>
(async function(){
'use strict';
/* ==========================================================================
   ARSITEKTUR (satu file, empat lapisan terpisah)
   1. DATA      · Store: tabel biasa (sites, docks, slots, pallets, trucks,
                  forklifts, people, shipments). Relasi pakai ID. Tanpa 3D.
   2. SUMBER    · Simulator: satu-satunya yang menulis ke Store. Bisa diganti
                  koneksi WMS / GPS / WebSocket tanpa menyentuh lapisan lain.
   3. TAMPILAN  · View3D: hanya MEMBACA Store lalu menggambar dunia 3D.
   4. UI        · Panel, tabel, inspeksi data: hanya MEMBACA Store.
   ========================================================================== */
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = s => document.querySelector(s);
const fmt = n => Math.round(n).toLocaleString('id-ID');
const pad = n => String(n).padStart(2,'0');
const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
const lerp = (a,b,t) => a+(b-a)*t;
const pick = (a,r=Math.random) => a[Math.floor(r()*a.length)];
function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const strHash = s => { let h=2166136261; for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619); } return h>>>0; };
function nowWIB(){ return new Date(new Date().toLocaleString('en-US',{timeZone:'Asia/Jakarta'})); }
const hm = d => pad(d.getHours())+':'+pad(d.getMinutes());
const minsFrom = m => { const h=(typeof Store!=='undefined'&&Store.clock)?Store.clock.hour:null; if(h==null){ const d=nowWIB(); d.setMinutes(d.getMinutes()+Math.round(m)); return hm(d); }
  let t=Math.round(h*60+m); t=((t%1440)+1440)%1440; return String(Math.floor(t/60)).padStart(2,'0')+':'+String(t%60).padStart(2,'0'); };
const cssVar = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const ease = t => t<.5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2;
const angDiff = (a,b) => ((b-a+Math.PI)%(Math.PI*2)+Math.PI*2)%(Math.PI*2)-Math.PI;
const lerpAngle = (a,b,t) => a+angDiff(a,b)*t;
const P2 = (x,z) => ({x,z,set(a,b,c){this.x=a;this.z=c;return this;}});

/* ---------- konfigurasi dunia & master data ---------- */
const PX=100, PZ=76, ROAD=9, SW=3, PH=1.01, RT=7, GY=0.06;
const SITE_CONFIG = [
  {id:'BGR-01', name:'Hub Cibinong', type:'Hub', address:'Jl. Mayor Oking No. 12, Cibinong, Bogor', gx:0, gz:0, W:16, D:9, H:4.6, bays:3, forks:2, roof:'gable', annex:true, capacity:1800, stock:1412, ontimePct:96.6, ontimeDelta:0.4,
   inventory:[['Kardus Lipat (M)',1906,'#D9A66B'],['Kontainer Plastik',297,'#2F5BEA'],['Helm Proyek',212,'#F2B53A'],['Lakban Cokelat',4448,'#9C6B3E']]},
  {id:'BGR-02', name:'Cross-Dock Sentul', type:'Cross-dock', address:'Jl. MH Thamrin Kav. 8, Sentul City, Bogor', gx:1, gz:0, W:26, D:10, H:4.5, bays:5, forks:3, roof:'saw', capacity:1200, stock:610, ontimePct:96.2, ontimeDelta:-0.3,
   inventory:[['Air Mineral 24-pak',820,'#5AB0E8'],['Kardus Lipat (L)',145,'#D9A66B'],['Palet Kayu',96,'#B9874F'],['Stretch Film',1210,'#B8C4E6']]},
  {id:'BKS-01', name:'DC Cikarang', type:'Pusat distribusi', address:'Kawasan Jababeka II Blok C3, Cikarang', gx:-1, gz:0, W:24, D:12, H:5.4, bays:4, forks:3, roof:'gable', annex:true, capacity:4200, stock:3310, ontimePct:98.1, ontimeDelta:0.9,
   inventory:[['Panel LED 60×60',1787,'#E8EDFB'],['Kursi Kantor',174,'#3B4A7A'],['Kardus Lipat (M)',882,'#D9A66B'],['Botol Air 600ml',5750,'#5AB0E8']]},
  {id:'BGR-03', name:'Gudang Dingin Cileungsi', type:'Gudang dingin', address:'Jl. Raya Narogong Km 18, Cileungsi', gx:0, gz:1, W:20, D:12, H:5.0, bays:3, forks:2, roof:'flat', capacity:1400, stock:990, ontimePct:96.0, ontimeDelta:0.4,
   inventory:[['Kacang Polong Beku 10 kg',334,'#A7D8B8'],['Air Mineral 24-pak',364,'#5AB0E8'],['Sarung Tangan Nitril',495,'#2F5BEA'],['Kontainer Plastik',208,'#2F5BEA']]},
  {id:'DPK-01', name:'Hub Robotik Depok', type:'Hub robotik', address:'Jl. Margonda Raya No. 300, Depok', gx:1, gz:1, W:28, D:12, H:5.6, bays:5, forks:4, roof:'saw', capacity:2600, stock:1730, ontimePct:95.9, ontimeDelta:-0.2,
   inventory:[['Panel LED 60×60',1767,'#E8EDFB'],['Kardus Lipat (M)',1017,'#D9A66B'],['Sarung Tangan Nitril',486,'#2F5BEA'],['Helm Proyek',306,'#F2B53A']]}
];
const SITE_PROFILE={'BGR-01':'general','BGR-02':'crossdock','BKS-01':'dc','BGR-03':'cold','DPK-01':'robotic'};
SITE_CONFIG.forEach(c=>c.profile=SITE_PROFILE[c.id]||'general');
const CARRIERS = [
  {name:'Lumbung', cab:0x2E5BFF, cs:'#2E5BFF'},
  {name:'Nusa Logistik', cab:0xF3F5FB, cs:'#1F3A93'},
  {name:'Kirim Kilat', cab:0x13A08F, cs:'#0F9484'},
  {name:'Sinar Kargo', cab:0xF3F5FB, cs:'#E0702B'}
];
const CITIES = ['Jakarta Selatan','Depok','Bandung','Bekasi','Tangerang','Sukabumi','Karawang','Cianjur','Bogor Kota','Purwakarta'];
const CUSTOMERS = ['Toko Sinar Jaya','Mitra Retail Bogor','Indo Grosir Depok','Pasar Segar Cibubur','Koperasi Maju Bersama','Sentra Elektronik','Segar Mart','Apotek Sehat Selalu'];
const DRIVERS = ['Budi Santoso','Agus Pratama','Dedi Kurniawan','Rudi Hartono','Slamet Riyadi','Yoga Saputra','Fajar Nugroho','Hendra Wijaya','Rizky Ramadhan','Wahyu Setiawan','Eko Prasetyo','Andi Firmansyah'];
const WORKERS = ['Siti Aminah','Dewi Lestari','Joko Susilo','Rina Marlina','Bambang Irawan','Tono Sugiarto','Lia Kartika','Arif Hidayat','Nur Halimah','Gilang Permana'];
const plate = r => pick(['F','B','D','T'],r)+' '+(1000+Math.floor(r()*8999))+' '+String.fromCharCode(65+Math.floor(r()*26))+String.fromCharCode(65+Math.floor(r()*26));
const STOCK_LOW = 300;

/* ==========================================================================
   LAPISAN 1 · DATA
   ========================================================================== */
const Store=(()=>{
  const T={stores:new Map(),sites:new Map(),docks:new Map(),slots:new Map(),pallets:new Map(),trucks:new Map(),forklifts:new Map(),people:new Map(),shipments:new Map(),cars:new Map(),signals:new Map()};
  const events=[], subs=new Set(); let seq=1000;
  return {
    tables:T,
    nextId(prefix){ return prefix+'-'+(++seq); },
    add(table,rec){ T[table].set(rec.id,rec); return rec; },
    get(table,id){ return id==null?null:T[table].get(id)||null; },
    all(table){ return [...T[table].values()]; },
    where(table,fn){ const o=[]; for(const r of T[table].values()) if(fn(r)) o.push(r); return o; },
    remove(table,id){ T[table].delete(id); },
    find(id){ for(const k in T){ const r=T[k].get(id); if(r) return r; } return null; },
    tableOf(rec){ return {store:'stores',site:'sites',dock:'docks',slot:'slots',pallet:'pallets',truck:'trucks',forklift:'forklifts',person:'people',shipment:'shipments',car:'cars',signal:'signals'}[rec.kind]; },
    events, unread:0,
    emit(e){ events.unshift(e); if(events.length>60) events.pop(); this.unread++; subs.forEach(f=>f(e)); },
    on(f){ subs.add(f); }
  };
})();
/* relasi: disimpan sebagai ID (ikut ke JSON), diakses sebagai objek (tidak ikut ke JSON) */
function relate(obj,key,table,idKey){ Object.defineProperty(obj,key,{enumerable:false,configurable:true,get(){return Store.get(table,this[idKey]);},set(v){this[idKey]=v?v.id:null;}}); }
function hidden(obj,key,val){ Object.defineProperty(obj,key,{value:val,writable:true,enumerable:false,configurable:true}); }
/* skema publik per tabel: inilah "kontrak data" yang dibaca UI / dikirim backend */
const r2=v=>Math.round(v*100)/100;
const SCHEMA={
  stores:    r=>({id:r.id,name:r.name,type:r.type,address:r.address,dockId:r.bays[0].id,dockTruckId:r.bays[0].truckId,receivingSlots:r.slots.map(s=>({code:s.code,palletId:s.palletId})),receivedToday:r.receivedToday,returnsToday:r.returnsToday}),
  sites:     r=>({id:r.id,name:r.name,type:r.type,address:r.address,capacity:r.capacity,stockOnHand:siteStock(r),stockDelta:r.stockDelta,outboundToday:r.outToday,putawayToday:r.putToday,arrivalsToday:r.arrivals,ontimePct:r.ontimePct,inventory:r.inv.map(i=>({item:i.name,qty:i.qty}))}),
  docks:     r=>({id:r.id,siteId:r.siteId,label:r.label,truckId:r.truckId,doorState:r.doorState,trucksToday:r.today}),
  slots:     r=>({id:r.id,siteId:r.siteId,code:r.code,palletId:r.palletId,reserved:r.reserved}),
  pallets:   r=>({id:r.id,siteId:r.siteId,item:r.item,qty:r.qty,kg:r.kg,lot:r.lot,received:r.recv,packing:r.packing,hold:!!r.hold,location:r.location}),
  trucks:    r=>({id:r.id,siteId:r.siteId,carrier:r.carrier.name,driver:r.driver,plate:r.plate,state:r.state,mode:r.mode,dockId:r.dockId,shipmentId:r.shipmentId,palletsDone:r.done,palletsTotal:r.total,cargo:r.cargo.filter(Boolean),position:{x:r2(r.pos.x),z:r2(r.pos.z)},heading:r2(r.heading),speedMs:r2(r.v),rearDoors:r.doorsT>0.99?'open':r.doorsT<0.01?'closed':'moving'}),
  forklifts: r=>({id:r.id,siteId:r.siteId,label:r.short,task:r.task,charging:r.charging,battery:Math.round(r.battery),carryingPalletId:r.carryingPalletId,forkHeight:r2(r.lift),position:{x:r2(r.pos.x),z:r2(r.pos.z)},heading:r2(r.heading),speedMs:r2(r.v),movesToday:r.moves}),
  people:    r=>({id:r.id,siteId:r.siteId,name:r.name,role:r.role,shift:r.shift,activity:r.doing,position:{x:r2(r.pos.x),z:r2(r.pos.z)},speedMs:r2(r.v)}),
  shipments: r=>({id:r.id,siteId:r.siteId,truckId:r.truckId,direction:r.direction,customer:r.customer,origin:r.origin,destination:r.destination,status:r.status,palletsTotal:r.total,createdAt:r.createdAt})
};
const publicRecord=rec=>{ const t=Store.tableOf(rec); return SCHEMA[t]?SCHEMA[t](rec):rec; };
const siteStock=s=>clamp(s.stock+s.stockDelta,0,s.capacity);
