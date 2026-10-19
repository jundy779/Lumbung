
/* ==========================================================================
   LAPISAN 4 · UI — panel, tabel, inspeksi data. Hanya MEMBACA Store.
   ========================================================================== */
const SITES=()=>Store.all('sites');

/* ---------- ikon isometrik mini (digambar di canvas, tanpa file gambar) ---------- */
const ICON3D=(()=>{ const cache={};
  const cv=(w,h,draw)=>{ const c=document.createElement('canvas'); c.width=w*2; c.height=h*2; const x=c.getContext('2d'); x.scale(2,2); draw(x); return c.toDataURL(); };
  const cube=(x,cx,cy,w,h,d,top,left,right)=>{ const a=w/2, b=w/4;
    x.fillStyle=left; x.beginPath(); x.moveTo(cx-a,cy); x.lineTo(cx,cy+b); x.lineTo(cx,cy+b+h); x.lineTo(cx-a,cy+h); x.closePath(); x.fill();
    x.fillStyle=right; x.beginPath(); x.moveTo(cx+a,cy); x.lineTo(cx,cy+b); x.lineTo(cx,cy+b+h); x.lineTo(cx+a,cy+h); x.closePath(); x.fill();
    x.fillStyle=top; x.beginPath(); x.moveTo(cx,cy-b); x.lineTo(cx+a,cy); x.lineTo(cx,cy+b); x.lineTo(cx-a,cy); x.closePath(); x.fill(); };
  const D={
    box:x=>{ cube(x,20,13,28,15,0,'#EBC48E','#C98F52','#DDA867'); x.fillStyle='#B07A44'; x.beginPath(); x.moveTo(13,9.5); x.lineTo(27,16.5); x.lineTo(27,18.5); x.lineTo(13,11.5); x.fill(); x.fillStyle='rgba(255,255,255,.35)'; x.fillRect(23,22,5,3); },
    crate:x=>{ cube(x,20,13,28,14,0,'#5C86FF','#2445C9','#3461F0'); x.strokeStyle='rgba(255,255,255,.35)'; x.lineWidth=1; for(let i=0;i<3;i++){ x.beginPath(); x.moveTo(9+i*4,15+i*2); x.lineTo(9+i*4,24+i*2); x.stroke(); x.beginPath(); x.moveTo(23+i*4,22-i*2); x.lineTo(23+i*4,13-i*2+0); x.stroke(); } },
    helmet:x=>{ const g=x.createRadialGradient(16,14,2,20,20,16); g.addColorStop(0,'#FFE27A'); g.addColorStop(1,'#E9A800'); x.fillStyle=g; x.beginPath(); x.ellipse(20,21,13,11,0,Math.PI,0); x.fill(); x.fillStyle='#D99A00'; x.beginPath(); x.ellipse(20,22,17,4.5,0,0,Math.PI*2); x.fill(); x.fillStyle='#FFD43B'; x.fillRect(18.5,10,3,11); },
    tape:x=>{ x.fillStyle='#A06A36'; x.beginPath(); x.ellipse(20,24,13,7,0,0,Math.PI*2); x.fill(); x.fillStyle='#C98F52'; x.fillRect(7,15,26,9); x.beginPath(); x.ellipse(20,15,13,7,0,0,Math.PI*2); x.fillStyle='#E3B172'; x.fill(); x.beginPath(); x.ellipse(20,15,6,3.2,0,0,Math.PI*2); x.fillStyle='#F4F6FB'; x.fill(); },
    gloves:x=>{ x.fillStyle='#4B6BFF'; x.beginPath(); x.roundRect?x.roundRect(11,10,15,20,6):x.rect(11,10,15,20); x.fill(); for(let i=0;i<4;i++){ x.fillRect(11+i*4,5+(i%2),3,9); } x.fillStyle='#3651D8'; x.fillRect(10,26,17,5); },
    panel:x=>{ cube(x,20,15,30,4,0,'#F4F6FB','#B8C2DD','#D3DAEE'); x.fillStyle='#FFF6D6'; x.beginPath(); x.moveTo(20,9); x.lineTo(31,14.5); x.lineTo(20,20); x.lineTo(9,14.5); x.fill(); },
    chair:x=>{ x.fillStyle='#2E3550'; x.fillRect(19,22,2,8); x.fillRect(12,30,16,2); x.fillStyle='#3B4462'; x.beginPath(); x.ellipse(20,21,10,4,0,0,Math.PI*2); x.fill(); x.fillStyle='#4E5A80'; x.beginPath(); x.roundRect?x.roundRect(13,6,14,13,4):x.rect(13,6,14,13); x.fill(); },
    frozen:x=>{ x.fillStyle='#8EC7FF'; x.beginPath(); x.roundRect?x.roundRect(9,8,22,24,5):x.rect(9,8,22,24); x.fill(); x.fillStyle='#4FA3F7'; x.fillRect(9,8,22,6); x.fillStyle='#fff'; x.font='700 11px system-ui'; x.textAlign='center'; x.fillText('❄',20,27); },
    bottle:x=>{ for(let i=0;i<3;i++){ x.fillStyle='#7FC4F0'; x.beginPath(); x.roundRect?x.roundRect(8+i*8,12,7,20,3):x.rect(8+i*8,12,7,20); x.fill(); x.fillStyle='#2E5BFF'; x.fillRect(9.5+i*8,9,4,4); } x.fillStyle='rgba(255,255,255,.5)'; x.fillRect(8,20,24,4); },
    retur:x=>{ cube(x,20,13,28,15,0,'#FFFFFF','#C7CFE6','#E3E8F5'); x.fillStyle='#2E5BFF'; x.font='800 9px system-ui'; x.fillText('↺',24,25); },
  };
  const depot=()=>cv(48,40,x=>{ cube(x,22,17,34,12,0,'#3F6EF7','#2449D8','#2E5BE6'); x.fillStyle='#F4F6FB'; x.beginPath(); x.moveTo(22,23.5); x.lineTo(39,15); x.lineTo(39,27); x.lineTo(22,35.5); x.fill(); x.fillStyle='#9DB4EE';
    for(let i=0;i<2;i++){ x.beginPath(); x.moveTo(25+i*6,25+-i*3); x.lineTo(29+i*6,23-i*3); x.lineTo(29+i*6,30-i*3); x.lineTo(25+i*6,32-i*3); x.fill(); } x.fillStyle='#5C86FF'; x.fillRect(5,21,6,9); });
  const truck=()=>cv(96,62,x=>{ x.fillStyle='rgba(46,60,120,.12)'; x.beginPath(); x.ellipse(50,52,40,7,-0.2,0,Math.PI*2); x.fill();
    x.fillStyle='#E3E8F5'; x.beginPath(); x.moveTo(14,22); x.lineTo(58,4); x.lineTo(58,30); x.lineTo(14,48); x.fill(); x.fillStyle='#FFFFFF'; x.beginPath(); x.moveTo(58,4); x.lineTo(70,9); x.lineTo(70,35); x.lineTo(58,30); x.fill();
    x.fillStyle='#F7F8FC'; x.beginPath(); x.moveTo(14,22); x.lineTo(58,4); x.lineTo(70,9); x.lineTo(26,27); x.fill();
    x.fillStyle='#2E5BFF'; x.beginPath(); x.moveTo(18,33); x.lineTo(54,18); x.lineTo(54,24); x.lineTo(18,39); x.fill();
    x.fillStyle='#2E5BFF'; x.beginPath(); x.moveTo(70,22); x.lineTo(84,28); x.lineTo(84,44); x.lineTo(70,38); x.fill(); x.fillStyle='#4A76FF'; x.beginPath(); x.moveTo(70,22); x.lineTo(76,18); x.lineTo(88,24); x.lineTo(84,28); x.fill();
    x.fillStyle='#1B2340'; x.beginPath(); x.moveTo(78,25); x.lineTo(86,29); x.lineTo(86,34); x.lineTo(78,30); x.fill();
    x.fillStyle='#23262F'; for(const [cx,cy] of [[24,48],[34,44],[62,36],[80,44]]){ x.beginPath(); x.ellipse(cx,cy,4.4,5,-0.4,0,Math.PI*2); x.fill(); } });
  return { item(name){ const n=(name||'').toLowerCase(); const k=/retur/.test(n)?'retur':/helm|helmet/.test(n)?'helmet':/lakban|tape|isolasi/.test(n)?'tape':/kontainer|plastik|crate|container/.test(n)?'crate':/sarung|glove/.test(n)?'gloves':/panel|led|lampu/.test(n)?'panel':/kursi|chair/.test(n)?'chair':/beku|frozen|es /.test(n)?'frozen':/air|water|minum|botol/.test(n)?'bottle':'box';
      return cache[k]||(cache[k]=cv(40,36,D[k])); }, depot(){ return cache.depot||(cache.depot=depot()); }, truck(){ return cache.truck||(cache.truck=truck()); } }; })();
const AVATAR=(()=>{ const c=document.createElement('canvas'); c.width=c.height=96; const x=c.getContext('2d');
  const g=x.createLinearGradient(0,0,0,96); g.addColorStop(0,'#DCE5FF'); g.addColorStop(1,'#B9C9FF'); x.fillStyle=g; x.beginPath(); x.arc(48,48,48,0,7); x.fill();
  x.save(); x.beginPath(); x.arc(48,48,48,0,7); x.clip();
  x.fillStyle='#2E5BFF'; x.beginPath(); x.ellipse(48,98,34,26,0,0,7); x.fill(); x.fillStyle='#F4F6FB'; x.beginPath(); x.moveTo(40,74); x.lineTo(48,84); x.lineTo(56,74); x.fill();
  x.fillStyle='#E9B48A'; x.fillRect(42,58,12,14); x.beginPath(); x.ellipse(48,46,17,19,0,0,7); x.fill();
  x.fillStyle='#2B2230'; x.beginPath(); x.ellipse(48,36,20,15,0,Math.PI,0); x.fill(); x.beginPath(); x.ellipse(31,52,6,17,0.15,0,7); x.fill(); x.beginPath(); x.ellipse(65,52,6,17,-0.15,0,7); x.fill();
  x.fillStyle='#2B2230'; x.beginPath(); x.arc(42,47,1.9,0,7); x.arc(54,47,1.9,0,7); x.fill(); x.strokeStyle='#B5654A'; x.lineWidth=1.8; x.beginPath(); x.arc(48,53,5,0.2,Math.PI-0.2); x.stroke();
  x.restore(); return c.toDataURL(); })();
const img3=(src,cls='ic3')=>`<img class="${cls}" src="${src}" alt="" aria-hidden="true">`;

let active=0, sel=null, follow=false, showData=false, tableOpen=false, tableTab='trucks';
const S_=()=>SITES()[active];
const IC={
  truck:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/></svg>',
  box:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 8l9-5 9 5v8l-9 5-9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/></svg>',
  depot:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 10l9-6 9 6v10H3z"/><path d="M7 20v-6h10v6M7 17h10"/></svg>',
  fork:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 17V9h6l3 5v3"/><path d="M15 4v13h6"/><circle cx="5.5" cy="18" r="1.8"/><circle cx="11" cy="18" r="1.8"/></svg>',
  bay:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 21V7l8-4 8 4v14"/><path d="M8 21v-9h8v9M8 15h8M8 18h8"/></svg>',
  person:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="7" r="3.5"/><path d="M5 21c0-4 3-7 7-7s7 3 7 7"/></svg>',
  close:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  focus:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="7"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/></svg>',
  open:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17 17 7M9 7h8v8"/></svg>',
  code:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M8 7l-5 5 5 5M16 7l5 5-5 5"/></svg>',
  chev:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="m9 6 6 6-6 6"/></svg>',
  check:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="m5 12 5 5 9-10"/></svg>',
  doc:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h6"/></svg>',
  pickI:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 8l9-5 9 5v8l-9 5-9-5z"/></svg>',
  load:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16v12H4zM9 7V4h6v3"/></svg>',
  road:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z"/></svg>',
  unl:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v12m0 0-4-4m4 4 4-4M4 21h16"/></svg>'
};
function truckStatus(t){
  if(t.broken&&t.state==='docked') return [t.broken.mech?'Diperbaiki':'Mogok','bad'];
  if(t.state==='docked'&&t.coldCheck>0) return ['Cek suhu','info'];
  switch(t.state){
    case 'away': return ['Dijadwalkan','mut'];
    case 'inbound': return ['Di jalan tol','info'];
    case 'to_store': return ['Menuju toko','info'];
    case 'transfer': return ['Antar-gudang','info'];
    case 'store_prep': case 'store_reverse': return ['Docking di toko','warn'];
    case 'store_docked': return [t.storePhase==='load'?'Muat retur':'Bongkar di toko','ok'];
    case 'store_pull': case 'store_close': return ['Selesai di toko','mut'];
    case 'leave': return ['Berangkat','mut'];
    case 'toll_in': case 'toll_out': return ['Gerbang tol','warn'];
    case 'highway': return ['Di jalan tol','mut'];
    case 'approach': return [t.bay&&t.pos.x>t.bay.x-14?'Docking':'Menuju','info'];
    case 'gate': return ['Check-in gerbang','warn'];
    case 'yard_wait': return ['Area tunggu','warn'];
    case 'prep': case 'reverse': return ['Docking','info'];
    case 'docked': return t.mode==='load'?['Memuat','ok']:['Membongkar','ok'];
    case 'pull': case 'close': return ['Selesai','mut'];
    case 'depart': return ['Berangkat','mut'];
    default: return ['Parkir','mut'];
  }
}
const forkStatus=f=>f.charging?['Mengisi daya','warn']:forkWorking(f)?['Bekerja','ok']:f.lunch?['Istirahat','info']:['Siaga','mut'];
/* v39: ringkasan istirahat makan per gudang */
function lunchInfo(s){ const ln=s&&s.kind!=='store'?lunchNow():null; if(!ln) return null; const eat=s.people.filter(p=>p.lunch&&p.lunch.phase==='eat').length, walk=s.people.filter(p=>p.lunch&&p.lunch.phase!=='eat').length, fk=s.forks.filter(f=>f.lunch).length;
  return {ln,eat,walk,fk,text:`${ln.L.label} · gelombang ${ln.wave+1}${eat?` · ${eat} makan di kantin`:''}${walk?` · ${walk} di jalan`:''}${fk?` · ${fk} forklift jeda`:''}${(staffMotoInfo(s)||{}).ojol?' · ojol mengantar makanan':''}`}; }
const dockStatus=b=>{const t=b.truck; if(!t) return ['Tersedia','mut']; if(t.state==='approach'||t.state==='gate') return ['Dijadwalkan','info']; if(t.state==='prep'||t.state==='reverse') return ['Truk tiba','warn']; if(t.state==='docked') return [t.mode==='load'?'Memuat':'Membongkar','ok']; return ['Berangkat','mut'];};
const chip=([t,c])=>`<span class="chip ${c}">${t}</span>`;
const bar=(p,cls='')=>`<div class="bar ${cls}"><i style="width:${clamp(p,0,100).toFixed(0)}%"></i></div>`;
const link=(id,txt)=>`<span class="linkbtn" data-sel="${id}">${txt}</span>`;
const dot=c=>`<i class="cdot" style="background:${c}"></i>`;
function crewLabel(t){ const d=t.crew; if(t.state==='away') return '—'; if(!d||!d.on) return 'di kabin';
  if(d.task==='door') return d.phase==='door'?(t.wantDoors?'membuka':'menutup')+' pintu belakang':d.phase==='toCab'||d.phase==='in'?'kembali ke kabin':'menuju pintu belakang';
  if(d.task==='rest'){ if(d.phase==='out'||d.phase==='toLounge') return 'menuju Pos Sopir'; if(d.phase==='lounge') return ({sit:'istirahat',sitchat:'ngobrol',chat:'ngobrol dengan sopir lain',phone:'menelepon',drink:'ngopi'}[d.pose]||'istirahat')+' di Pos Sopir'; return 'kembali ke truk'; }
  if(d.task==='wait') return d.phase==='waiting'?'menunggu di samping truk':d.phase==='back'||d.phase==='in'?'kembali ke kabin':'turun dari kabin';
  return 'di luar kabin'; }
const truckEta=t=>t.state==='away'?Math.max(2,Math.ceil(t.wait/20/WX.arrive)+2):['inbound','toll_in','approach','transfer'].includes(t.state)&&t.path?Math.max(1,Math.ceil((t.path.len-t.s)/(9*WX.speed)/60*4)):0;
const tons=t=>(t.total*0.32).toLocaleString('id-ID',{maximumFractionDigits:1});
/* posisi truk di antrean gerbang/area tunggu (1 = berikutnya mendapat bay) */
function queuePos(t){ const s=t.site, q=s.trucks.filter(o=>o.queued&&o.state!=='away').sort((a,b)=>(a.gq??1e9)-(b.gq??1e9)||(b.s||0)-(a.s||0)); return q.indexOf(t)+1; }
const qText=t=>t.queued?`antrean ke-${queuePos(t)}`:'check-in gerbang';
function siteNumbers(s){
  const docked=s.trucks.filter(t=>t.state==='docked').length, arriving=s.trucks.filter(t=>['approach','prep','reverse'].includes(t.state)).length;
  const waiting=s.trucks.filter(t=>t.state==='gate'||t.state==='yard_wait').length;
  return {stock:siteStock(s),docked,arriving,waiting,staged:s.slots.filter(x=>x.occupied).length,busy:s.bays.filter(b=>b.truck).length,onsite:s.trucks.filter(t=>t.state!=='away').length,working:s.forks.filter(forkWorking).length};
}
function palletWhere(p){ const L=p.location||{}; if(L.type==='slot'){ const sl=Store.get('slots',L.id); return `Staging · slot ${sl?sl.code:'?'}`; }
  if(L.type==='hold') return 'Area karantina QC'; if(L.type==='fork'){ const f=Store.get('forklifts',L.id); return `Diangkut ${f?f.short:'forklift'}`; }
  if(L.type==='truck') return `Di dalam ${L.id}`; return '—'; }
function header(icon,cls,small,title,sub,extra=''){
  return `<div class="dh"><div class="dic ${cls}">${icon}</div><div><small>${small}</small><h2>${title}</h2><p>${sub}</p></div>
  <div class="acts">${extra}<button data-act="data" aria-pressed="${showData}" aria-label="Lihat data mentah" title="Data mentah (JSON)" class="${showData?'on':''}">${IC.code}</button><button data-act="focus" aria-label="Fokus" title="Fokus">${IC.focus}</button>${sel||document.body.classList.contains('site-sheet')?`<button data-act="close" aria-label="Tutup" title="Tutup">${IC.close}</button>`:''}</div></div>`;
}
const dataBlock=rec=>showData?`<div class="rawdata"><div class="rawh"><b>Store.${Store.tableOf(rec)}</b><small>record yang dibaca tampilan 3D &amp; panel ini</small></div><pre>${JSON.stringify(publicRecord(rec),null,2).replace(/</g,'&lt;')}</pre></div>`:'';
function renderDetail(){
  const e=sel, el=$('#detail'); let h='';
  const s=(e&&e.siteId&&Store.get('stores',e.siteId))||S_();
  if(!e){
    const n=siteNumbers(s);
    const shNow=s.shiftNow||'pagi'; h=header(img3(ICON3D.depot(),'hd3'),'',`${s.type} · ${s.id}`,s.name,s.address)+dataBlock(s)+`<div class="shiftbar ${shNow}"><i></i><b>${SHIFTS[shNow].label}</b><span>${SHIFTS[shNow].hours} · ${s.people.length+s.forks.length} petugas bertugas</span></div>`+(()=>{ const li=lunchInfo(s); return li?`<div class="chips lunch">${chip(['Jam makan','ok'])}<span>${li.text}</span></div>`:''; })()+(()=>{ const mi=staffMotoInfo(s); if(!mi||!mi.moving) return ''; const a=mi.S.bikes.filter(b=>b.st==='arrive').length, l=mi.S.bikes.filter(b=>b.st==='leave').length; return `<div class="chips">${chip(['Ganti shift','info'])}<span>${a?`${a} motor staf datang`:''}${a&&l?' · ':''}${l?`${l} motor staf pulang`:''} lewat pintu belakang</span></div>`; })()+profileLine(s)+
      `<div class="chips">${chip(['Beroperasi','ok'])}<span>${n.docked} di dock · ${n.arriving} tiba${n.waiting?` · ${n.waiting} di gerbang/area tunggu`:''} · ${n.staged} palet disiapkan</span></div>
      <div class="grid2">
        <div class="stat"><small>Stok tersedia</small><b>${fmt(n.stock)} <span>/ ${fmt(s.capacity)}</span></b>${bar(n.stock/s.capacity*100)}</div>
        <div class="stat"><small>Bay truk</small><b>${n.busy} <span>/ ${s.bays.length} sibuk</span></b>${bar(n.busy/s.bays.length*100,'g')}</div>
        <div class="stat"><small>Keluar hari ini</small><b>${s.outToday} <span>truk</span></b></div>
        <div class="stat"><small>Put-away hari ini</small><b>${s.putToday} <span>palet</span></b></div>
      </div>
      ${kpiBlock(s)}
      <div class="sec"><h3>Inventaris</h3><small>unit</small></div>
      <ul class="inv">${s.inv.map(i=>`<li>${img3(ICON3D.item(i.name))}<span class="n">${i.name}</span><span class="q">${fmt(i.qty)}</span>${chip(i.qty<STOCK_LOW?['Stok menipis','warn']:['Tersedia','ok'])}</li>`).join('')}</ul>
      <div class="sec"><h3>Armada forklift</h3><small>${n.working}/${s.forks.length} bekerja</small></div>
      ${s.forks.map(f=>`<div class="flrow"><b>${link(f.id,f.short)}</b><span>${f.task}</span>${bar(f.battery,f.battery<30?'a':'g')}</div>`).join('')}`;
  } else if(e.kind==='store'){
    const d=e.bays[0], t=d.truck, ret=e.slots.filter(x=>x.data&&x.data.retur).length, recv=e.slots.filter(x=>x.data&&!x.data.retur).length;
    const st=t&&t.state==='store_docked'?[t.storePhase==='load'?'Memuat retur':'Menerima barang','info']:t?[t.state==='to_store'?'Truk dalam perjalanan':'Truk di dock','warn']:['Buka','ok'];
    h=header(img3(ICON3D.depot(),'hd3'),'',`${e.type} · ${e.id}`,e.name,e.address)+dataBlock(e)+
      `<div class="chips">${chip(st)}<span>${t?`${t.id} · ${truckStatus(t)[0].toLowerCase()}`:'Menunggu pengiriman berikutnya'}</span></div>
      <div class="grid2">
        <div class="stat"><small>Diterima hari ini</small><b>${e.receivedToday} <span>palet</span></b></div>
        <div class="stat"><small>Retur hari ini</small><b>${e.returnsToday} <span>palet</span></b></div>
        <div class="stat"><small>Di area terima</small><b>${recv} <span>palet</span></b></div>
        <div class="stat"><small>Retur siap diambil</small><b>${ret} <span>palet</span></b></div>
      </div>
      <dl class="kv"><dt>Dock</dt><dd>${link(d.id,d.label)}</dd><dt>Truk</dt><dd>${t?link(t.id,t.id+' · '+t.carrier.name):'—'}</dd><dt>Pemasok</dt><dd>${t?t.site.name:'Gudang Lumbung'}</dd><dt>Forklift</dt><dd>${link(e.forks[0].id,e.forks[0].short)} · ${e.forks[0].task}</dd></dl>`;
  } else if(e.kind==='truck'){
    const st=truckStatus(e), bay=e.bay||e.lastBay, atStore=e.bay&&Store.get('stores',e.bay.siteId), dst=e.dest&&Store.get('stores',e.dest);
    const where=atStore?`${atStore.name} · ${e.done}/${e.total} palet`:e.state==='to_store'&&dst?`Menuju ${dst.name}`:e.state==='transfer'&&e.xfer?`Menuju ${Store.get('sites',e.xfer).name}`:e.bay?`${s.id} · ${e.bay.label} · ${e.done}/${e.total} palet`:e.state==='parked'?`Area parkir · ${s.id}`:e.state==='gate'||e.state==='yard_wait'?`${s.id} · ${qText(e)}`:`Tiba ±${truckEta(e)} mnt`;
    const eta=e.broken&&e.state==='docked'?'Tertunda · truk mogok':e.state==='yard_wait'?'Menunggu bay kosong':e.state==='gate'?'Check-in ±15 dtk':e.state==='docked'?`Selesai dalam ${Math.max(1,(e.total-e.done)*3)} mnt`:['away','approach'].includes(e.state)?minsFrom(truckEta(e)):e.state==='parked'?'—':'Sekarang';
    const sh=e.shipment;
    h=header(IC.truck,'',e.carrier.name,e.id,`${e.driver} · ${e.plate}`,e.bay?`<button data-act="bay" aria-label="Lihat bay" title="Lihat bay">${IC.open}</button>`:'')+dataBlock(e)+
      `<div class="chips">${chip(st)}<span>${where}</span></div>`+
      (e.broken&&e.state==='docked'?(()=>{ const B=e.broken, left=Math.max(0,B.need-B.t), m=Math.floor(left/60), sc=Math.round(left%60), wt=B.mech?(B.t-B.mechAt>25?'Mekanik sedang memperbaiki':'Mekanik dalam perjalanan'):'Sopir menelepon bengkel';
        return `<div class="brk"><div class="bh"><b>${esc(B.cause)}</b><span>${wt} · siap ±${m?m+' mnt ':''}${sc} dtk lagi</span></div><div class="bbar"><i style="width:${Math.min(100,B.t/B.need*100).toFixed(0)}%"></i></div>${B.mech?'':'<button class="dopt on" data-mech="1"><b>Kirim mekanik</b><small>Perbaikan ±1 menit, bay cepat kosong lagi</small></button>'}</div>`; })():'')+
      destBlock(e)+(['approach','prep','reverse','store_prep','store_reverse','to_store'].includes(e.state)&&e.path?(()=>{ const rem=Math.max(0,e.path.len-e.s)+(['approach','prep'].includes(e.state)&&e.bay?reversePath(e.site,e.bay).len:0); const near=rem<60; return near?`<div class="prog"><div class="h"><span>${e.state.includes('reverse')?'Mundur ke dock':'Docking'}</span><b>${Math.round(rem)} m lagi</b></div>${bar(100-rem/60*100,'b')}</div>`:''; })():'')+(e.total?`<div class="prog"><div class="h"><span>${e.storePhase==='load'&&atStore?'Retur dimuat':e.mode==='load'?'Palet dimuat':'Palet dibongkar'}</span><b>${e.done}/${e.total}</b></div>${bar(e.done/e.total*100,'g')}</div>`:'')+
      `<dl class="kv"><dt>Pengiriman</dt><dd>${sh?link(sh.id,sh.id):'—'}</dd><dt>Pelanggan</dt><dd>${e.customer}</dd><dt>Asal</dt><dd>${sh?sh.origin:'—'}</dd><dt>Tujuan</dt><dd>${sh?sh.destination:'—'}</dd>
      ${e.coldCheck>0?`<dt>Suhu muatan</dt><dd>Sedang diperiksa…</dd>`:e.coldTemp?`<dt>Suhu muatan</dt><dd>${e.coldTemp.toLocaleString('id-ID',{maximumFractionDigits:1,minimumFractionDigits:1})}°C · lolos</dd>`:''}      <dt>Sopir</dt><dd>${e.driver} · ${crewLabel(e)}</dd><dt>Rute</dt><dd>${e.state==='transfer'&&e.xfer?`${s.id} → ${Store.get('sites',e.xfer).name} (antar-gudang)`:e.xferFrom&&['approach','gate','yard_wait'].includes(e.state)?`${Store.get('sites',e.xferFrom).id} → ${s.id}${e.bay?' · '+e.bay.label:' · area tunggu'} (antar-gudang)`:['gate','yard_wait'].includes(e.state)?`${e.state==='gate'?'Gerbang check-in':'Area tunggu'} ${s.id} → ${e.bay?e.bay.label:'bay berikutnya yang kosong'}`:dst?`${s.id} → jalan kota → ${dst.name}`:atStore?`Di ${atStore.name}`:e.shipment&&e.shipment.origin&&Store.all('stores').some(x=>x.name===e.shipment.origin)&&e.mode==='unload'?`${e.shipment.origin} → ${s.id} (retur)`:e.mode==='load'||['depart','toll_out','highway','leave'].includes(e.state)?'Jl. Lingkar → Gerbang Tol Jagorawi':'Gerbang Tol Jagorawi → Jl. Lingkar → '+s.id}</dd><dt>ETA</dt><dd>${eta}</dd><dt>Kecepatan</dt><dd>${Math.round((e.v||0)*5)} km/j</dd><dt>Bay</dt><dd>${e.bay?link(e.bay.id,e.bay.label+' · '+(atStore?atStore.name:s.id)):e.queued&&e.state!=='away'?`Menunggu bay · antrean ke-${queuePos(e)}`:'—'}</dd>
      <dt>Muatan</dt><dd>${e.total?`${e.done}/${e.total} palet · ${tons(e)} t`:'Kosong'}</dd></dl>`;
  } else if(e.kind==='forklift'){
    const st=forkStatus(e), c=Store.get('pallets',e.carryingPalletId);
    h=header(IC.fork,'y',`Forklift · ${s.id}`,e.short,'Listrik · LX-18 · kapasitas 1,8 t')+dataBlock(e)+
      `<div class="chips">${chip(st)}<span>${e.task}</span></div>
      <div class="prog"><div class="h"><span>Baterai</span><b>${Math.round(e.battery)}%</b></div>${bar(e.battery,e.battery<30?'a':'g')}</div>
      <dl class="kv"><dt>Operator</dt><dd>${s.profile==='robotic'?'Otonom · AGV dengan lidar':`${e.drivers?e.drivers[e.shiftNow||'pagi']:'—'} · ${SHIFTS[e.shiftNow||'pagi'].label}`}</dd><dt>Membawa</dt><dd>${c?link(c.id,`${c.item} · ${c.qty} unit`):'Kosong'}</dd><dt>Pindah hari ini</dt><dd>${e.moves} palet</dd>
      <dt>Kecepatan</dt><dd>${(e.v*3.6).toFixed(1)} km/j</dd><dt>Pengisian</dt><dd>Stasiun ${e.restIdx+1}</dd><dt>Site</dt><dd>${s.name}</dd></dl>`;
  } else if(e.kind==='dock'){
    const st=dockStatus(e), t=e.truck;
    const sub=!t?'Siap menerima truk':t.state==='approach'?`${t.id} sedang menuju dock`:t.state==='prep'||t.state==='reverse'?`${t.id} sedang mundur masuk`:t.state==='docked'?`${t.id} ${t.mode==='load'?'dimuat':'dibongkar'} ${t.done}/${t.total}`:`${t.id} sedang keluar`;
    h=header(IC.bay,'',`Dock bay · ${s.id}`,e.label,'Pintu dock dengan leveler')+dataBlock(e)+
      `<div class="chips">${chip(st)}<span>${sub}</span></div>
      <dl class="kv"><dt>Truk</dt><dd>${t?link(t.id,t.id+' · '+t.carrier.name):'—'}</dd><dt>Pintu belakang truk</dt><dd>${t?(t.doorsT>0.9?'Terbuka':t.doorsT>0.05?'Bergerak':'Tertutup'):'—'}</dd>
      <dt>Pintu dock</dt><dd>${e.doorState==='open'?'Terbuka':'Tertutup'}</dd><dt>Truk hari ini</dt><dd>${e.today}</dd><dt>Site</dt><dd>${s.name}</dd></dl>`;
  } else if(e.kind==='pallet'){
    const where=palletWhere(e), L=e.location||{};
    h=header(img3(ICON3D.item(e.retur?'retur':e.item),'hd3'),'t',`Palet · ${e.id}`,e.item,where)+dataBlock(e)+
      `<div class="chips">${chip(e.hold?['Tertahan QC','warn']:L.type==='slot'?(Store.get('slots',L.id)?.reserved?['Dijadwalkan muat','info']:['Disiapkan','ok']):L.type==='fork'?['Dipindahkan','info']:['Di truk','info'])}<span>${e.packing==='crate'?'Krat plastik':e.packing==='white'?'Kardus putih':'Kardus'}</span></div>
      <dl class="kv"><dt>Jumlah</dt><dd>${e.qty} unit</dd><dt>Berat kotor</dt><dd>${e.kg} kg</dd><dt>Lokasi</dt><dd>${where}</dd><dt>Lot</dt><dd>${e.lot}</dd><dt>Diterima</dt><dd>${e.recv}</dd><dt>Site</dt><dd>${s.name}</dd></dl>`;
  } else if(e.kind==='person'){
    h=header(IC.person,'',`Pekerja · ${s.id}`,e.name,e.role)+dataBlock(e)+
      `<div class="chips">${chip(e.lunch?(e.lunch.phase==='eat'?['Istirahat','ok']:['Ke/dari kantin','info']):e.v>0.1?['Berjalan','ok']:['Bertugas','info'])}<span>${e.doing}</span></div>
      <dl class="kv"><dt>Peran</dt><dd>${e.role}</dd><dt>Shift</dt><dd>${e.shift}</dd><dt>APD</dt><dd>Helm, rompi, sepatu safety</dd><dt>Kecepatan</dt><dd>${(e.v*3.6).toFixed(1)} km/j</dd><dt>Site</dt><dd>${s.name}</dd></dl>`;
  } else if(e.kind==='shipment'){
    const t=Store.get('trucks',e.truckId);
    h=header(IC.doc.replace(/14/g,'22'),'',`Pengiriman · ${e.direction==='outbound'?'keluar':'masuk'}`,e.id,`${e.origin} → ${e.destination}`)+dataBlock(e)+
      `<div class="chips">${chip([{scheduled:'Dijadwalkan',loading:'Dimuat',unloading:'Dibongkar',in_transit:'Dalam perjalanan',delivered:'Terkirim',completed:'Selesai'}[e.status]||e.status,'info'])}<span>${e.customer}</span></div>
      <dl class="kv"><dt>Truk</dt><dd>${t?link(t.id,t.id):'—'}</dd><dt>Asal</dt><dd>${e.origin}</dd><dt>Tujuan</dt><dd>${e.destination}</dd><dt>Palet</dt><dd>${e.total}</dd><dt>Dibuat</dt><dd>${e.createdAt}</dd></dl>`;
  }
  el.innerHTML=h; if(!e) drawHeat(s);
}
/* tooltip grafik KPI: elemen ber-data-tip di panel detail memakai #hoverTip yang sama dengan kanvas 3D */
{ const tip=$('#hoverTip'), show=ev=>{ const t=ev.target.closest&&ev.target.closest('[data-tip]'); if(!t||!t.dataset.tip){ tip.classList.remove('show'); return; }
    const [a,b]=t.dataset.tip.split('|'); tip.firstChild.textContent=a; tip.lastChild.textContent=b||''; const fl=ev.clientX>innerWidth-280; tip.style.left=fl?'auto':ev.clientX+'px'; tip.style.right=fl?(innerWidth-ev.clientX)+'px':'auto'; tip.style.top=ev.clientY+'px'; tip.classList.toggle('flip',fl); tip.classList.add('show'); };
  $('#detail').addEventListener('pointermove',show); $('#detail').addEventListener('pointerdown',show); $('#detail').addEventListener('pointerleave',()=>tip.classList.remove('show','flip')); }
$('#detail').addEventListener('click',ev=>{
  const l=ev.target.closest('[data-sel]'); if(l){ select(Store.find(l.dataset.sel),true); return; }
  const b=ev.target.closest('[data-act]'); if(!b) return;
  if(b.dataset.act==='close') select(null);
  else if(b.dataset.act==='data'){ showData=!showData; renderDetail(); }
  else if(b.dataset.act==='bay'&&sel&&sel.bay) select(sel.bay,true);
  else { const p=sel&&sel.kind!=='shipment'?worldPos(sel):siteHome(active); flyTo(p,Math.max(cam.zoomGoal,1.6)); if(sel&&['truck','forklift','person'].includes(sel.kind)) follow=true; }
});
function focusTruck(){ const s=S_(); if(sel&&sel.kind==='truck'&&sel.state!=='parked'&&sel.siteId===s.id) return sel;
  return s.trucks.find(t=>t.state==='docked')||s.trucks.find(t=>['approach','prep','reverse'].includes(t.state))||s.trucks.find(t=>t.state!=='parked'); }
function renderTrack(){
  const s=S_(), t=focusTruck(); if(!t) return;
  const load=t.mode==='load';
  const names=['Dikonfirmasi','Diambil','Dimuat','Di jalan',load?'Terkirim':'Dibongkar'];
  const icons=[IC.doc,IC.pickI,IC.load,IC.road,load?IC.check:IC.unl];
  const pre=['away','approach','gate','yard_wait','prep','reverse'].includes(t.state);
  const cur = load ? (pre?1: t.state==='docked'?2:3) : (pre?3: t.state==='docked'?4:5);
  const lbl=i=>(i===cur&&((load&&i===2)||(!load&&i===4)))?`${names[i]} ${t.done}/${t.total}`:names[i];
  const meta=t.bay?`${s.id} · ${t.bay.label} · ${t.state==='docked'?Math.max(1,(t.total-t.done)*3)+' mnt lagi':'tiba ±'+Math.max(1,truckEta(t))+' mnt'}`:t.state==='away'?`Tiba ±${truckEta(t)} mnt`:t.state==='gate'||t.state==='yard_wait'?`${s.id} · ${qText(t)}`:s.id;
  $('#track').innerHTML=`<div class="main"><div class="h"><b>${IC.road} Pelacakan pengiriman</b><small>${t.id} · ${t.carrier.name}</small></div>
    <div class="steps">${names.map((n,i)=>`<div class="step ${i<cur?'done':i===cur?'now':''}"><span class="c">${i<cur?IC.check:icons[i]}</span><b>${lbl(i)}</b><small>${i<cur?minsFrom(-((cur-i)*26)):i===cur?'Sekarang':'ETA '+minsFrom((i-cur)*24)}</small></div>`).join('')}</div></div>
    <button class="ship" data-id="${t.id}">${img3(ICON3D.truck(),'tkimg')}<span style="flex:1;min-width:0"><b>${t.ship}</b><small>${load?'Ke':'Dari'}: ${t.place}</small>${chip(truckStatus(t))}<span class="meta" style="display:block">${meta}</span></span>${IC.chev}</button>`;
}
$('#track').addEventListener('click',ev=>{const b=ev.target.closest('[data-id]'); if(b) select(Store.find(b.dataset.id),true);});
let tab='dock';
document.querySelectorAll('.tabs [role=tab]').forEach(b=>b.onclick=()=>{tab=b.dataset.tab;document.querySelectorAll('.tabs [role=tab]').forEach(x=>x.setAttribute('aria-selected',x===b));renderOps();});
function renderOps(){
  const s=S_(), n=siteNumbers(s);
  $('#tDock').textContent=`${n.busy}/${s.bays.length}`; $('#tFork').textContent=`${n.working}/${s.forks.length}`; $('#tTruck').textContent=n.onsite; $('#opsSite').textContent=s.name;
  let rows='';
  if(tab==='dock') rows=s.bays.map(b=>{const t=b.truck;
      if(!t) return `<button class="oprow" data-id="${b.id}"><b>${b.label}</b><span class="t"><small>Belum ada truk</small></span><span class="r">${chip(['Tersedia','mut'])}</span>${IC.chev}</button>`;
      return `<button class="oprow" data-id="${b.id}"><b>${b.label}</b><span class="t">${dot(t.carrier.cs)}${t.id}</span><span class="r">${chip(dockStatus(b))}${t.state==='docked'?bar(t.done/t.total*100,'g')+`<em>${t.done}/${t.total}</em>`:''}</span>${IC.chev}</button>`;}).join('');
  else if(tab==='fork') rows=s.forks.map(f=>`<button class="oprow" data-id="${f.id}"><b>${f.short}</b><span class="t">${f.task}</span><span class="r">${chip(forkStatus(f))}${bar(f.battery,f.battery<30?'a':'g')}<em>${Math.round(f.battery)}%</em></span>${IC.chev}</button>`).join('');
  else rows=s.trucks.slice().sort((a,b)=>(a.state==='away')-(b.state==='away')||(a.state==='parked')-(b.state==='parked')).map(t=>{
      const where=t.bay?`${s.id} · ${t.bay.label}`:t.state==='parked'?'Parkir':`Ke ${s.id}`;
      return `<button class="oprow" data-id="${t.id}"><b>${t.id.replace('TRK-','')}</b><span class="t">${dot(t.carrier.cs)}${where}</span><span class="r">${chip(truckStatus(t))}${t.state==='docked'?bar(t.done/t.total*100,'g')+`<em>${t.done}/${t.total}</em>`:t.state==='away'?`<em>${truckEta(t)} mnt</em>`:''}</span>${IC.chev}</button>`;}).join('');
  $('#opsList').innerHTML=rows;
}
$('#opsList').addEventListener('click',ev=>{const b=ev.target.closest('[data-id]'); if(!b) return; document.body.classList.remove('ops-open'); select(Store.find(b.dataset.id),true);});
$('#opsToggle').onclick=()=>document.body.classList.add('ops-open');
$('#opsClose').onclick=()=>document.body.classList.remove('ops-open');
const SPARK=new Map(); let sparkT=0;
function sparkHist(s,n){ let H=SPARK.get(s.id); if(!H){ const r=rng(strHash(s.id)); const walk=(v,amp,len=18)=>{ const a=[]; let x=v; for(let i=0;i<len;i++){ a.unshift(x); x=x+(r()-0.5)*amp; } return a; };
    H={stock:walk(n.stock,n.stock*0.02),trucks:walk(n.onsite,1.6).map(v=>Math.max(0,Math.round(v))),on:walk(ontimeNow(s),0.6)}; SPARK.set(s.id,H); } return H; }
function sparkPath(el,arr,col){ if(!el) return; const W=72,Hh=30, mn=Math.min(...arr), mx=Math.max(...arr), sp=(mx-mn)||1;
  const pts=arr.map((v,i)=>[i/(arr.length-1)*W, Hh-3-(v-mn)/sp*(Hh-8)]); const d=pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' ');
  const last=pts[pts.length-1], id='g'+el.id;
  el.innerHTML=`<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${col}" stop-opacity=".22"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></linearGradient></defs><path d="${d} L${W} ${Hh} L0 ${Hh} Z" fill="url(#${id})"/><path class="l" d="${d}" stroke="${col}"/><circle cx="${last[0].toFixed(1)}" cy="${last[1].toFixed(1)}" r="2.4" fill="${col}"/>`; }
function renderSparks(s,n){ const H=sparkHist(s,n), now=performance.now();
  if(now-sparkT>3000&&!RP.on){ sparkT=now; for(const site of SITES()){ const nn=siteNumbers(site), h=sparkHist(site,nn); h.stock.push(nn.stock); h.trucks.push(nn.onsite); h.on.push(ontimeNow(site)); for(const k of ['stock','trucks','on']) if(h[k].length>24) h[k].shift(); } }
  sparkPath($('#spStock'),H.stock,'#2E5BFF'); sparkPath($('#spTruck'),H.trucks,'#7C3AED'); sparkPath($('#spOn'),H.on,'#16A34A'); }
function renderKPIs(){
  const s=S_(), n=siteNumbers(s); renderSparks(s,n);
  $('#kStock').textContent=fmt(n.stock);
  const sd=s.stockDelta; $('#kStockD').textContent=(sd>=0?'↑ +':'↓ −')+fmt(Math.abs(sd)); $('#kStockD').className='d'+(sd<0?' neg':'');
  $('#kStockS').textContent=`palet · ${s.id}`;
  $('#kTruck').textContent=n.onsite; $('#kTruckD').textContent='↑ +'+s.arrivals; $('#kTruckS').textContent=`${n.arriving} tiba · ${s.id}`;
  $('#kOn').textContent=ontimeNow(s).toLocaleString('id-ID')+'%'; $('#kOnD').textContent=(s.ontimeDelta>=0?'↑ +':'↓ −')+Math.abs(s.ontimeDelta).toLocaleString('id-ID')+'%'; $('#kOnD').className='d'+(s.ontimeDelta<0?' neg':'');
  $('#siteId').textContent=s.id; $('#siteName').textContent=s.name;
  $('#siteSub').textContent=`${Math.round(n.stock/s.capacity*100)}% penuh · ${n.docked}/${s.bays.length} di dock`;
  $('#clock').textContent=RP.on?hms(Store.clock.hour):hhmm(Store.clock.hour);
  { const na=openAlerts().length, d=$('#bellDot'); d.textContent=na?String(na):''; d.classList.toggle('cnt',na>0); d.style.display=(na||Store.unread)?'':'none'; }
  if(!$('#notif').hidden) renderNotif();
  const w=Store.weather, bad=['rain','storm','fog','sandstorm'].includes(w.condition); $('#wxIcon').textContent=w.icon; $('#wxText').textContent=`${w.label} · ${w.tempC}°C`;
  $('#wxBtn').classList.toggle('storm',bad); $('#stormBtn').setAttribute('aria-pressed',bad);
  const live=Store.clock.mode==='live'&&!RP.on; $('#liveLbl').textContent=RP.on?'Putar ulang':live?'Live':TIME_MODES[Store.clock.mode].label; $('#livePill').classList.toggle('sim',!live); $('#livePill').classList.toggle('rp',RP.on);
  if(!$('#envMenu').hidden) renderEnvMenu();
  document.body.classList.toggle('zoomed-out',cam.zoom<0.95&&!CLEAN);
}
function destBlock(t){ const o=destOptions(t); if(!o) return '';
  const btn=x=>`<button class="dopt${x.cur?' on':''}" data-dest="${esc(x.id)}"${x.busy?' disabled':''}><b>${esc(x.name)}</b><small>${esc(x.busy?x.by:x.cur?(t.pendingDest===x.id?'Menunggu keluar persimpangan…':'Tujuan saat ini'):x.type)}</small></button>`;
  const sec=(title,items,extra='')=>items.length||extra?`<div class="dsec">${title}</div><div class="dgrid">${items.map(btn).join('')}${extra}</div>`:'';
  const toll=o.toll?`<button class="dopt${!t.dest&&!t.xfer?' on':''}" data-dest="toll"><b>Luar kota</b><small>${!t.dest&&!t.xfer?'Tujuan saat ini':'via Tol Jagorawi'}</small></button>`:'';
  const sub=o.enroute?'Ubah rute saat di perjalanan':o.incoming?'Truk masih di jalan tol, bisa dialihkan':o.before?'Pilih tujuan sebelum berangkat':'Pindah bay sebelum truk mendekat';
  return `<div class="dest"><div class="dh"><b>Arahkan pengiriman</b><span>${sub}</span></div>${sec('Toko',o.list,toll)}${sec(o.incoming?'Alihkan ke gudang lain':'Antar ke gudang lain',o.sites)}${sec('Pindah bay',o.bays)}</div>`; }
function profileLine(s){ const p=s.profile||'general', nb=s.bays.length, busy=s.bays.filter(b=>b.truck&&b.truck.state==='docked').length, k=kpiSummary(s)||{};
  let ic='🏬', t=`Gudang umum · ${k.avgDockDwellMin!=null?`rata-rata ${n1(k.avgDockDwellMin)} mnt per truk di dock`:'penyimpanan rak'}`;
  if(p==='cold'){ ic='❄️'; t=`Suhu ruang ${n1(k.roomTempC)}°C · ${k.doorsOpen}/${nb} pintu terbuka`; }
  else if(p==='crossdock'){ const h=Math.ceil(nb/2), ib=s.bays.filter(b=>b.i<h&&b.truck&&b.truck.state==='docked').length, ob=busy-ib; ic='🔀'; t=`${k.medianTransitMin!=null?`Transit median ${n1(k.medianTransitMin)} mnt`:'Transit: menunggu palet pertama'} · Inbound ${ib}/${h} · Outbound ${ob}/${nb-h}`; }
  else if(p==='dc'){ ic='📦'; t=`${fmt(k.packagesPerHour||0)} paket/jam · ${k.windowMin||0} menit terakhir`; }
  else if(p==='robotic'){ const w=s.forks.filter(f=>forkWorking(f)).length; ic='🤖'; t=`Utilisasi AGV ${k.agvUtilPct??Math.round(w/Math.max(1,s.forks.length)*100)}% · ${w}/${s.forks.length} AGV bekerja`; }
  return `<div class="profline"><span>${ic}</span>${t}</div>`; }

/* ---------- Kinerja khas per gudang (v31): grafik SVG dari site.metrics ----------
   Satu seri per grafik, warna merek biru; riwayat perkiraan (sebelum aplikasi dibuka) memakai biru muda.
   Setiap batang/titik punya area hover lebar dengan data-tip "judul|keterangan". */
const n1=(v,d=1)=>v==null?'–':v.toLocaleString('id-ID',{minimumFractionDigits:d,maximumFractionDigits:d});
const hh=h=>String(h).padStart(2,'0')+'.00';
const kTip=(a,b)=>` data-tip="${esc(a)}|${esc(b)}"`;
function barD(x,y,w,h){ const r=Math.min(4,w/2,h); if(h<=0.5) return ''; return `M${x.toFixed(1)} ${(y+h).toFixed(1)}V${(y+r).toFixed(1)}A${r} ${r} 0 0 1 ${(x+r).toFixed(1)} ${y.toFixed(1)}H${(x+w-r).toFixed(1)}A${r} ${r} 0 0 1 ${(x+w).toFixed(1)} ${(y+r).toFixed(1)}V${(y+h).toFixed(1)}Z`; }
const KC={W:300,H:118,L:34,R:6,T:8,B:18};
function kAxisY(ticks,y,fmtv){ return ticks.map(v=>`<line class="kg" x1="${KC.L}" x2="${KC.W-KC.R}" y1="${y(v).toFixed(1)}" y2="${y(v).toFixed(1)}"/><text class="kt" x="${KC.L-5}" y="${(y(v)+3.5).toFixed(1)}" text-anchor="end">${fmtv(v)}</text>`).join(''); }
/* grafik batang: items [{v, seed, tip:[a,b], lab}] */
function kBars(items,{max,ticks,fmtv,ref,cap}={}){ const n=Math.max(items.length,cap||1), pw=KC.W-KC.L-KC.R, ph=KC.H-KC.T-KC.B, slot=pw/n, bw=Math.min(24,slot*0.72);
  const mx=max||Math.max(1,...items.map(i=>i.v||0))*1.12, y=v=>KC.T+ph-(v/mx)*ph;
  const tk=ticks||[0,mx/2,mx].map(v=>Math.round(v)), out=[kAxisY(tk,y,fmtv||fmt)];
  if(ref!=null) out.push(`<line class="kref" x1="${KC.L}" x2="${KC.W-KC.R}" y1="${y(ref).toFixed(1)}" y2="${y(ref).toFixed(1)}"/>`);
  items.forEach((it,i)=>{ const x=KC.L+i*slot+(slot-bw)/2, v=Math.max(0,it.v||0), top=y(v);
    out.push(`<path class="kb${it.seed?' sd':''}${it.cur?' cur':''}" d="${barD(x,top,bw,KC.T+ph-top)}"/>`);
    if(it.lab) out.push(`<text class="kt" x="${(x+bw/2).toFixed(1)}" y="${KC.H-5}" text-anchor="middle">${it.lab}</text>`);
    out.push(`<rect class="khit" x="${(KC.L+i*slot).toFixed(1)}" y="${KC.T}" width="${slot.toFixed(1)}" height="${ph}"${kTip(...it.tip)}/>`); });
  return `<svg class="kchart" viewBox="0 0 ${KC.W} ${KC.H}" role="img">${out.join('')}</svg>`; }
function kCard(title,big,unit,note,body,legend){ return `<div class="kcard"><div class="kh"><small>${title}</small><b>${big}<span> ${unit}</span></b><em>${note}</em></div>${body}${legend||''}</div>`; }
const kLegend=(a,b)=>`<div class="klg"><span><i class="m"></i>${a}</span>${b?`<span><i class="s"></i>${b}</span>`:''}</div>`;
function kpiBlock(s){ const m=s.metrics; if(!m) return ''; const k=kpiSummary(s), p=s.profile, H=m.h<0?Math.floor(Store.clock.hour):m.h;
  const order=Array.from({length:24},(_,i)=>(H+1+i)%24); let card='';
  if(p==='cold'){ const lo=-20.5, hi=-15.5, pw=KC.W-KC.L-KC.R, ph=KC.H-KC.T-KC.B, x=i=>KC.L+i/23*pw, y=v=>KC.T+(hi-Math.max(lo,Math.min(hi,v)))/(hi-lo)*ph;
    const pts=order.map((h,i)=>{ const b=m.hours[h], v=kpiHourVal(s,b); return {h,i,v,seed:b&&b.seed}; });
    const seg=(f)=>{ let d='', on=false; pts.forEach(q=>{ if(q.v==null||!f(q)){ on=false; return; } d+=(on?'L':'M')+x(q.i).toFixed(1)+' '+y(q.v).toFixed(1); on=true; }); return d; };
    const firstLive=pts.findIndex(q=>!q.seed&&q.v!=null);
    const out=[`<rect class="kband" x="${KC.L}" y="${y(KPI_COLD.hi).toFixed(1)}" width="${pw}" height="${(y(KPI_COLD.lo)-y(KPI_COLD.hi)).toFixed(1)}"/>`, kAxisY([-20,-18,-16],y,v=>'−'+Math.abs(v)+'°'),
      `<path class="kl sd" d="${seg(q=>q.seed||q.i===firstLive)}"/>`, `<path class="kl" d="${seg(q=>!q.seed)}"/>`];
    pts.forEach(q=>{ if(q.i%6===5||q.i===23) out.push(`<text class="kt" x="${x(q.i).toFixed(1)}" y="${KC.H-5}" text-anchor="${q.i===23?'end':'middle'}">${q.i===23?'kini':hh(q.h)}</text>`);
      const w=pw/23; out.push(`<rect class="khit" x="${(x(q.i)-w/2).toFixed(1)}" y="${KC.T}" width="${w.toFixed(1)}" height="${ph}"${kTip(`${hh(q.h)}${q.i===23?' · jam berjalan':''}`,q.v==null?'belum ada data':`${n1(q.v)} °C rata-rata · ${q.seed?'perkiraan riwayat':'terukur'}`)}/>`); });
    const last=pts[23]; if(last.v!=null) out.push(`<circle class="kdot" cx="${x(23).toFixed(1)}" cy="${y(k.roomTempC).toFixed(1)}" r="4"/>`);
    const ok=k.roomTempC<=KPI_COLD.hi;
    card=kCard('Suhu ruang · 24 jam',`${n1(k.roomTempC)}°C`,'',`${ok?'dalam':'di atas'} batas aman ≤ ${KPI_COLD.hi} °C · ${k.doorsOpen}/${s.bays.length} pintu dock terbuka`,
      `<svg class="kchart" viewBox="0 0 ${KC.W} ${KC.H}" role="img" aria-label="Suhu ruang 24 jam terakhir">${out.join('')}</svg>`,kLegend('Terukur','Perkiraan sebelum dibuka')+`<div class="klg"><span><i class="b"></i>Batas aman −20 s/d −17 °C</span></div>`); }
  else if(p==='dc'){ const items=order.map((h,i)=>{ const b=m.hours[h], v=kpiHourVal(s,b); return {v:v||0,seed:b&&b.seed,cur:i===23,lab:i===23?'kini':i%6===5?hh(h):'',tip:[`${hh(h)}${i===23?' · jam berjalan':''}`,v==null?'belum cukup data':`${fmt(Math.round(v))} paket/jam · ${b.seed?'perkiraan riwayat':'terukur'}`]}; });
    card=kCard('Paket keluar per jam',fmt(k.packagesPerHour),'paket/jam',`laju ${k.windowMin} menit terakhir dari palet yang dimuat`,kBars(items,{fmtv:v=>v>=1000?n1(v/1000,1)+'rb':fmt(v)}),kLegend('Terukur','Perkiraan sebelum dibuka')); }
  else if(p==='crossdock'){ const T=m.transit;
    if(!T.length) card=kCard('Waktu transit palet','–','mnt','menunggu palet pertama yang masuk lalu keluar',`<div class="kempty">Belum ada palet yang selesai transit${(()=>{ const w=s.slots.map(x=>x.palletId&&Store.get('pallets',x.palletId)).filter(P=>P&&P.inT!=null); return w.length?`<br>${w.length} palet sedang menunggu outbound · tertua ${n1((s.t-Math.min(...w.map(P=>P.inT)))/60)} mnt`:''; })()}</div>`);
    else { const med=k.medianTransitMin, items=T.map((x,i)=>({v:x.min,lab:'',tip:[x.id,`${n1(x.min)} mnt dari bongkar (inbound) sampai dimuat (outbound)`]}));
      card=kCard('Waktu transit palet',n1(med),'mnt median',`${T.length} palet terakhir · garis putus = median`,kBars(items,{ref:med,fmtv:v=>n1(v,0),cap:16}),''); } }
  else if(p==='robotic'){ const u=k.agvUtilPct;
    card=kCard('Peta panas pergerakan AGV',u==null?'–':u+'%','utilisasi',`rata-rata 2 menit · ${s.forks.length} AGV`,`<div class="kheatw"><canvas class="kheat" id="kHeat" aria-label="Peta panas pergerakan AGV"></canvas></div>`,
      `<div class="klg"><span>Gudang di atas, dock di bawah</span><span class="kramp"><i></i>jarang → padat</span></div>`); }
  else { const D=m.dwell;
    if(!D.length) card=kCard('Waktu truk di dock','–','mnt','menunggu truk pertama selesai',`<div class="kempty">Belum ada truk yang selesai di dock${(()=>{ const d=s.trucks.filter(t=>t.state==='docked'), w=d.filter(t=>t.dockT!=null); return d.length?`<br>${d.length} truk sedang di dock${w.length?` · terlama ${n1((s.t-Math.min(...w.map(t=>t.dockT)))/60)} mnt`:''}`:''; })()}</div>`);
    else { const items=D.map(x=>({v:x.min,tip:[x.id,`${n1(x.min)} mnt di dock · ${x.mode==='load'?'muat':'bongkar'} ${x.n} palet`]}));
      card=kCard('Waktu truk di dock',n1(k.avgDockDwellMin),'mnt rata-rata',`${D.length} truk terakhir · dari dock sampai keluar`,kBars(items,{fmtv:v=>n1(v,0),cap:12}),''); } }
  return `<div class="sec"><h3>Kinerja khas</h3><small>dihitung dari simulasi</small></div>${card}`; }
const HEAT_RAMP=['#cde2fb','#9ec5f4','#6da7ec','#3987e5','#256abf','#184f95','#0d366b'];
function drawHeat(s){ const cv=$('#kHeat'), m=s.metrics; if(!cv||!m||!m.heat) return; const g=m.heat, wrap=cv.parentElement, W=wrap.clientWidth||280, cs=W/g.cols, Hh=Math.round(cs*g.rows), dpr=Math.min(2,devicePixelRatio||1);
  cv.width=Math.round(W*dpr); cv.height=Math.round(Hh*dpr); cv.style.height=Hh+'px'; const c=cv.getContext('2d'); c.scale(dpr,dpr);
  let mx=0; for(const v of g.g) if(v>mx) mx=v; const dark=isDark();
  c.fillStyle=dark?'#222A52':'#F4F6FD'; c.fillRect(0,0,W,Hh);
  for(let r=0;r<g.rows;r++) for(let q=0;q<g.cols;q++){ const v=g.g[r*g.cols+q]; if(v<=mx*0.02||!mx) continue; const t=Math.sqrt(v/mx), k=Math.min(HEAT_RAMP.length-1,Math.floor(t*HEAT_RAMP.length)); c.fillStyle=dark?HEAT_RAMP[HEAT_RAMP.length-1-k]:HEAT_RAMP[k];   /* mode gelap: jarang = dekat latar, padat = terang */ c.fillRect(q*cs+0.5,r*cs+0.5,cs-1,cs-1); }
  const X=x=>(x-g.x0)*cs, Z=z=>(z-g.z0)*cs; c.strokeStyle=dark?'#AEB6DA':'#56608A'; c.lineWidth=1.2; c.setLineDash([]);
  c.strokeRect(X(-s.W/2),Z(g.z0)-1,s.W*cs,Z(s.fz)+1);   /* muka gedung (sisi dock) */
  c.setLineDash([3,3]); for(const b of s.bays) c.strokeRect(X(b.x-1.3),Z(s.zDock-1.6),2.6*cs,3.2*cs); c.setLineDash([]);
  c.fillStyle=dark?'#AEB6DA':'#56608A'; c.font='600 10px "Plus Jakarta Sans",system-ui,sans-serif'; c.textBaseline='top'; c.fillText('Gudang',X(-s.W/2)+4,2); c.textBaseline='bottom'; c.fillText('Dock',X(s.bays[0].x-1.3),Hh-2); c.fillText('Staging & charger',3,Hh-2);
  cv.onpointermove=ev=>{ const rc=cv.getBoundingClientRect(), q=Math.floor((ev.clientX-rc.left)/cs), r=Math.floor((ev.clientY-rc.top)/cs); if(q<0||r<0||q>=g.cols||r>=g.rows) return;
    const v=g.g[r*g.cols+q]; cv.dataset.tip=`Sel ${q},${r} (1 × 1 m)|${mx?Math.round(v/mx*100):0}% dari sel terpadat`; }; }
const hms=h=>{ const S=Math.floor(((h%24)+24)%24*3600), p2=x=>String(x).padStart(2,'0'); return p2(Math.floor(S/3600))+':'+p2(Math.floor(S/60)%60)+':'+p2(S%60); };
const hhmm=h=>{ const H=Math.floor(h)%24, M=Math.floor((h-Math.floor(h))*60); return String(H).padStart(2,'0')+':'+String(M).padStart(2,'0'); };
const phaseOf=h=>h<5.5?'Malam':h<10.5?'Pagi':h<14.5?'Siang':h<18.3?'Sore':h<19.3?'Senja':'Malam';
function renderEnvMenu(){
  const w=Store.weather, c=Store.clock, pct=v=>Math.round(v*100)+'%', neg=v=>v<1?' class="neg"':'';
  $('#envMenu').innerHTML=`<button class="cleanrow" role="switch" aria-checked="${CLEAN}" data-clean="1"><span><b>Tampilan bersih</b><small>Sembunyikan lalu lintas, gedung & rambu kota</small></span><i></i></button>
    <h4>Ukuran tampilan</h4><div class="seg seg3">${[['s','Ringkas'],['auto','Otomatis'],['l','Besar']].map(([k,l])=>`<button data-uiscale="${k}" aria-pressed="${UISCALE===k}">${l}</button>`).join('')}</div>
    <h4>Tema</h4><div class="seg seg3">${[['auto','Ikuti sistem'],['light','Terang'],['dark','Gelap']].map(([k,l])=>`<button data-themepick="${k}" aria-pressed="${THEME.pref===k}">${l}</button>`).join('')}</div><div class="clk"><span>${phaseOf(c.hour)} · ${c.mode==='live'?'mengikuti jam WIB':'simulasi'}</span><b>${hhmm(c.hour)}</b></div>
    <button class="cleanrow seedrow" data-photo="1"><span><b>Mode foto</b><small>Sembunyikan panel, atur kamera, lalu simpan gambar PNG (P)</small></span></button>
    <button class="cleanrow seedrow" data-tour="1"><span><b>Tur perkenalan</b><small>Kenali bagian-bagian layar dalam 1 menit (?)</small></span></button>
    <button class="cleanrow seedrow" data-copyseed="1"><span><b>Seed simulasi ${SEED}</b><small>${SEEDED?'Dipakai dari tautan':'Acak'} · salin tautan untuk mengulang kondisi awal</small></span></button>
    <h4>Waktu</h4><div class="seg">${Object.entries(TIME_MODES).map(([k,m])=>`<button data-time="${k}" aria-pressed="${c.mode===k}">${k==='live'?'● ':''}${m.label.replace(' (WIB)','')}</button>`).join('')}</div>
    <h4>Cuaca</h4><div class="wxg">${WX_ORDER.map(k=>`<button data-wx="${k}" aria-pressed="${w.condition===k}"><b>${WEATHER[k].icon}</b>${WEATHER[k].label}</button>`).join('')}</div>
    <div class="imp"><p><b>Dampak operasi:</b> ${w.impact} · ${trafficInfo().note}${WX.flash?' · lampu lalu lintas berkedip kuning':''}${WX.night?' · shift malam':''}</p>
      <ul><li>Kecepatan truk<b${neg(WX.speed)}>${pct(WX.speed)}</b></li><li>Forklift<b${neg(WX.fork)}>${pct(WX.fork)}</b></li>
      <li>Kedatangan truk<b${neg(WX.arrive)}>${pct(WX.arrive)}</b></li><li>Jarak pandang<b${w.visibilityM<2000?' class="neg"':''}>${w.visibilityM>=1000?(w.visibilityM/1000).toLocaleString('id-ID')+' km':w.visibilityM+' m'}</b></li>
      <li>Lalu lintas<b${WX.density>=0.95?' class="neg"':''}>${trafficInfo().label.split(' · ')[0]}</b></li><li>Angin<b>${w.windKmh} km/j</b></li>
      <li style="grid-column:1/-1">Tepat waktu<b${(w.ontime+trafficOntime())<0?' class="neg"':''}>${(()=>{const v=Math.round((w.ontime+trafficOntime())*10)/10; return (v>0?'+':v<0?'−':'±')+Math.abs(v).toLocaleString('id-ID');})()}%</b></li></ul></div>`;
}
const cleanPrev={time:null,wx:null};
/* ukuran tampilan UI: Ringkas / Otomatis / Besar (disimpan di browser) */
let UISCALE='auto'; try{ UISCALE=localStorage.getItem('lumbung.uiScale')||'auto'; }catch(_){}
function setUiScale(k){ UISCALE=k; document.body.classList.toggle('ui-s',k==='s'); document.body.classList.toggle('ui-l',k==='l'); try{ localStorage.setItem('lumbung.uiScale',k); }catch(_){} }
setUiScale(UISCALE);
function setClean(on,init){
  if(on===CLEAN&&!init) return;
  if(on){ cleanPrev.time=Store.clock.mode; cleanPrev.wx=Store.weather.condition; setTimeMode('siang'); setWeather('clear',true); }
  else if(!init&&cleanPrev.time){ setTimeMode(cleanPrev.time); setWeather(cleanPrev.wx,true); }
  applyClean(on); $('#cleanBtn').setAttribute('aria-pressed',on);
  try{ localStorage.setItem('lumbung.clean',on?'1':'0'); }catch(_){}
  refreshUI(true);
}
$('#cleanBtn').onclick=e=>{ e.stopPropagation(); setClean(!CLEAN); };
function toggleEnv(e){ e&&e.stopPropagation(); const m=$('#envMenu'); m.hidden=!m.hidden; $('#wxBtn').setAttribute('aria-expanded',!m.hidden); if(!m.hidden) renderEnvMenu(); }
$('#wxBtn').onclick=toggleEnv; $('#stormBtn').onclick=toggleEnv;
$('#envMenu').addEventListener('click',e=>{ e.stopPropagation(); const b=e.target.closest('button'); if(!b) return;
  if(b.dataset.clean){ setClean(!CLEAN); renderEnvMenu(); return; }
  if(b.dataset.uiscale){ setUiScale(b.dataset.uiscale); renderEnvMenu(); return; }
  if(b.dataset.photo){ $('#envMenu').hidden=true; startPhoto(); return; }
  if(b.dataset.themepick){ applyTheme(b.dataset.themepick); renderEnvMenu(); return; }
  if(b.dataset.tour){ $('#envMenu').hidden=true; startTour(); return; }
  if(b.dataset.copyseed){ const u=new URL(location.href); u.searchParams.set('seed',String(SEED)); const done=()=>showToast(`Tautan seed ${SEED} disalin`,'#16A34A');
    try{ navigator.clipboard.writeText(u.toString()).then(done,()=>showToast(u.toString(),'#2E5BFF')); }catch(_){ showToast(u.toString(),'#2E5BFF'); } return; }
  if(b.dataset.time) setTimeMode(b.dataset.time); if(b.dataset.wx) setWeather(b.dataset.wx); renderEnvMenu(); refreshUI(true); });
document.addEventListener('click',e=>{ if(!e.target.closest('#envMenu,#wxBtn,#stormBtn')){ $('#envMenu').hidden=true; $('#wxBtn').setAttribute('aria-expanded','false'); } });
/* ---------- tampilan Tabel: antarmuka lain untuk data yang sama ---------- */
const TABLES={
  trucks:{label:'Truk',cols:['ID','Site','Status','Mode','Dock','Pengiriman','Palet','Kecepatan'],row:t=>[t.id,t.siteId,truckStatus(t)[0],t.mode==='load'?'Muat':'Bongkar',t.bay?t.bay.label:'—',t.shipmentId||'—',t.total?`${t.done}/${t.total}`:'—',`${Math.round(t.v*5)} km/j`]},
  docks:{label:'Dock',cols:['ID','Site','Bay','Status','Truk','Pintu','Truk hari ini'],row:d=>[d.id,d.siteId,d.label,dockStatus(d)[0],d.truckId||'—',d.doorState==='open'?'Terbuka':'Tertutup',d.today]},
  forklifts:{label:'Forklift',cols:['ID','Site','Status','Tugas','Baterai','Membawa','Pindah'],row:f=>[f.id,f.siteId,forkStatus(f)[0],f.task,Math.round(f.battery)+'%',f.carryingPalletId||'—',f.moves]},
  pallets:{label:'Stok (palet)',cols:['ID','Site','Barang','Qty','Berat','Lot','Lokasi'],row:p=>[p.id,p.siteId,p.item,p.qty,p.kg+' kg',p.lot,palletWhere(p)]},
  shipments:{label:'Pengiriman',cols:['ID','Site','Arah','Pelanggan','Asal','Tujuan','Status','Palet'],row:s=>[s.id,s.siteId,s.direction==='outbound'?'Keluar':'Masuk',s.customer,s.origin,s.destination,s.status,s.total]},
  sites:{label:'Site',cols:['ID','Nama','Tipe','Stok','Kapasitas','Dock sibuk','Tepat waktu'],row:s=>{const n=siteNumbers(s);return [s.id,s.name,s.type,fmt(n.stock),fmt(s.capacity),`${n.busy}/${s.bays.length}`,ontimeNow(s)+'%'];}}
};
function renderTable(){
  if(!tableOpen) return;
  const T=TABLES[tableTab], q=($('#tvq').value||'').toLowerCase();
  let rows=Store.all(tableTab); if(tableTab==='trucks') rows=rows.filter(t=>t.state!=='away'); if(tableTab==='shipments') rows=rows.slice(-80).reverse();
  const data=rows.map(r=>({id:r.id,cells:T.row(r)})).filter(r=>!q||r.cells.join(' ').toLowerCase().includes(q));
  $('#tvTabs').innerHTML=Object.entries(TABLES).map(([k,v])=>`<button role="tab" aria-selected="${k===tableTab}" data-tt="${k}">${v.label} <span>${Store.tables[k].size}</span></button>`).join('');
  $('#tvBody').innerHTML=`<table><thead><tr>${T.cols.map(c=>`<th>${c}</th>`).join('')}</tr></thead><tbody>${data.map(r=>`<tr data-id="${r.id}">${r.cells.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  $('#tvCount').textContent=`${data.length} baris · Store.${tableTab}`;
}
$('#viewToggle').onclick=()=>{ tableOpen=!tableOpen; document.body.classList.toggle('table-open',tableOpen); $('#viewToggle').setAttribute('aria-pressed',tableOpen); $('#viewToggle span').textContent=tableOpen?'3D':'Tabel'; renderTable(); };
$('#tvTabs').addEventListener('click',e=>{const b=e.target.closest('[data-tt]'); if(b){ tableTab=b.dataset.tt; renderTable(); }});
$('#tvq').addEventListener('input',renderTable);
$('#tvBody').addEventListener('click',e=>{const r=e.target.closest('[data-id]'); if(!r) return; const rec=Store.find(r.dataset.id); if(!rec) return; tableOpen=false; document.body.classList.remove('table-open'); $('#viewToggle span').textContent='Tabel'; select(rec,true);});

/* ---------- seleksi, kamera, menu ---------- */
const HOME_ZOOM=()=>isMobile()?0.82:1.5; /* tampilan awal lebih dekat: truk & forklift tampil besar */
function flyTo(p,zoom,dur=0.9){ cam.flight={from:cam.target.clone(),to:p.clone(),z0:cam.zoom,z1:zoom??cam.zoomGoal,t:0,dur:reduceMotion?0.001:dur,dip:p.distanceTo(cam.target)>40}; follow=false; }
function select(e,fly){
  if(e&&e.kind==='slot') e=e.palletId?Store.get('pallets',e.palletId):null;
  const sid=e&&(e.kind==='site'?e.id:e.siteId);
  if(sid){ const i=SITES().findIndex(s=>s.id===sid); if(i>=0) active=i; }
  sel=(e&&e.kind!=='site')?e:null;
  document.body.classList.toggle('has-sel',!!sel);
  document.body.classList.toggle('site-sheet',!!(e&&e.kind==='site'));   /* ponsel: ketuk gedung = buka ringkasan gudang + Kinerja khas */
  applySelVis(sel);
  follow=!!(sel&&fly&&((sel.kind==='truck'&&sel.state!=='parked')||sel.kind==='forklift'||sel.kind==='person'));
  if(fly&&e&&e.kind!=='shipment'&&!(e.kind==='truck'&&e.state==='away')) flyTo(e.kind==='site'?siteHome(e.idx):worldPos(e),Math.max(cam.zoomGoal,e.kind==='site'?1.12:e.kind==='store'?1.25:1.45));
  refreshUI(true);
}
function switchSite(i){ active=i; sel=null; clearSelVis(); document.body.classList.remove('has-sel','site-sheet'); flyTo(siteHome(i),HOME_ZOOM(),1.7); refreshUI(true); }
function home(){ cam.thetaGoal=Math.round((cam.thetaGoal+Math.PI/4)/(Math.PI*2))*Math.PI*2-Math.PI/4; flyTo(siteHome(active),HOME_ZOOM()); }
const ptrs=new Map(); let drag=null, pinch=null;
canvas.addEventListener('pointerdown',e=>{ canvas.classList.add('grabbing'); canvas.setPointerCapture(e.pointerId); ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY}); closeMenus();
  if(ptrs.size===1) drag={sx:e.clientX,sy:e.clientY,moved:0,start:groundAt(e.clientX,e.clientY)};
  else if(ptrs.size===2){ drag=null; const [a,b]=[...ptrs.values()]; pinch={d:Math.hypot(a.x-b.x,a.y-b.y),z:cam.zoomGoal}; } });
let hoverT=0;
canvas.addEventListener('pointermove',e=>{
  if(ptrs.has(e.pointerId)) ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(pinch&&ptrs.size===2){ const [a,b]=[...ptrs.values()]; cam.zoomGoal=cam.zoom=clamp(pinch.z*Math.hypot(a.x-b.x,a.y-b.y)/pinch.d,0.4,3.4); return; }
  if(drag){ drag.moved=Math.max(drag.moved,Math.hypot(e.clientX-drag.sx,e.clientY-drag.sy));
    if(drag.moved>4&&drag.start){ cam.flight=null; follow=false; canvas.classList.add('dragging'); const p=groundAt(e.clientX,e.clientY); if(p){ cam.target.add(drag.start.clone().sub(p)); applyCam(); } } return; }
  const now=performance.now(); if(now-hoverT<70) return; hoverT=now; canvas.classList.toggle('hover',!!recordAt(e.clientX,e.clientY)); });
function endPtr(e){ if(drag&&drag.moved<=4&&ptrs.size===1){ const r=recordAt(e.clientX,e.clientY); select(r,!!r); }
  ptrs.delete(e.pointerId); if(ptrs.size<2) pinch=null; drag=null; canvas.classList.remove('dragging'); }
canvas.addEventListener('pointerup',endPtr);
canvas.addEventListener('pointercancel',e=>{ptrs.delete(e.pointerId);drag=null;pinch=null;canvas.classList.remove('dragging');});
canvas.addEventListener('wheel',e=>{e.preventDefault();cam.zoomGoal=clamp(cam.zoomGoal*Math.exp(-e.deltaY*0.0015),0.4,3.4);},{passive:false});
$('#zIn').onclick=()=>cam.zoomGoal=clamp(cam.zoomGoal*1.3,0.4,3.4);
$('#zOut').onclick=()=>cam.zoomGoal=clamp(cam.zoomGoal/1.3,0.4,3.4);
$('#rL').onclick=()=>cam.thetaGoal-=Math.PI/2;
$('#rR').onclick=()=>cam.thetaGoal+=Math.PI/2;
$('#home').onclick=()=>{select(null);home();};
function closeMenus(){ closeSearch(); $('#siteMenu').hidden=true; $('#siteBtn').setAttribute('aria-expanded','false'); $('#results').hidden=true; $('#notif').hidden=true; $('#bell').setAttribute('aria-expanded','false'); }
$('#siteBtn').onclick=e=>{ e.stopPropagation(); const m=$('#siteMenu'), open=m.hidden; closeMenus(); if(!open) return;
  const r=$('#siteBtn').getBoundingClientRect(); m.style.left=Math.min(r.left,innerWidth-300)+'px';
  m.innerHTML=SITES().map((s,i)=>{const n=siteNumbers(s); return `<button data-site="${i}" aria-current="${i===active}"><span class="sid">${s.id}</span><span class="sname"><b>${s.name}</b><small>${s.type} · ${Math.round(n.stock/s.capacity*100)}% penuh · ${n.docked}/${s.bays.length} di dock</small></span></button>`;}).join('');
  m.hidden=false; $('#siteBtn').setAttribute('aria-expanded','true'); };
$('#siteMenu').onclick=e=>{const b=e.target.closest('[data-site]'); if(!b) return; closeMenus(); switchSite(+b.dataset.site);};
$('#siteNext').onclick=e=>{ e.stopPropagation(); closeMenus(); switchSite((active+1)%SITES().length); };
let notifTab='alerts';
const SEVL={crit:'Kritis',warn:'Peringatan',info:'Info'}, SEVI={crit:'⛔',warn:'⚠️',info:'ℹ️'};
function renderNotif(){ const n=$('#notif'), open=openAlerts(), handling=[...ALERTS.values()].filter(a=>a.state==='done'), ev=Store.events;
  const card=a=>`<div class="al ${a.sev}"><div class="alh"><span class="ali">${SEVI[a.sev]}</span><div><b>${a.title}</b><small>${a.detail}${a.siteId?'':''} · sejak ${hm(a.t)}</small></div></div>
    <div class="ala">${a.actions.map(x=>`<button class="ab${x.primary?' pri':''}" data-alert="${a.id}" data-act="${x.id}">${x.label}</button>`).join('')}<button class="ab ghost" data-alert="${a.id}" data-act="ack" title="Tandai sudah ditangani">✓</button></div></div>`;
  const tabs=`<div class="ntabs"><button data-tab="alerts" class="${notifTab==='alerts'?'on':''}">Peringatan${open.length?` <em>${open.length}</em>`:''}</button><button data-tab="events" class="${notifTab==='events'?'on':''}">Aktivitas</button></div>`;
  let body='';
  if(notifTab==='alerts'){
    body=open.length?open.map(card).join(''):'<div class="empty ok">✓ Semua aman — tidak ada peringatan aktif.</div>';
    if(handling.length) body+=`<h5>Sedang ditindaklanjuti</h5>`+handling.map(a=>`<div class="alx"><span>${SEVI[a.sev]}</span><div><b>${a.title}</b><small>${a.doneLabel||'Ditindaklanjuti'}</small></div></div>`).join('');
    if(ALERT_LOG.length) body+=`<h5>Riwayat</h5>`+ALERT_LOG.slice(0,6).map(a=>`<div class="alx done"><span>✓</span><div><b>${a.title}</b><small>${a.how==='auto'?'Selesai otomatis':'Selesai · '+(a.doneLabel||'ditangani')} · ${hm(a.t)}</small></div></div>`).join('');
  } else body=ev.length?ev.slice(0,14).map((v,i)=>`<button data-ev="${i}"><i class="ni" style="background:${v.color}"></i><span><b>${v.text}</b><small>${v.siteId} · ${hm(v.t)}</small></span></button>`).join(''):'<div class="empty">Belum ada aktivitas.</div>';
  const st=n.scrollTop; n.innerHTML=tabs+body; n.scrollTop=st; }
$('#bell').onclick=e=>{ e.stopPropagation(); const n=$('#notif'), open=n.hidden; closeMenus(); if(!open) return; Store.unread=0;
  notifTab=openAlerts().length?'alerts':notifTab; renderNotif();
  n.hidden=false; $('#bell').setAttribute('aria-expanded','true'); renderKPIs(); };
$('#notif').onclick=e=>{ e.stopPropagation(); const tb=e.target.closest('[data-tab]'); if(tb){ notifTab=tb.dataset.tab; renderNotif(); return; }
  const ab=e.target.closest('[data-alert]'); if(ab){ const r=runAlert(ab.dataset.alert,ab.dataset.act); if(r.focus){ const ent=Store.find(r.focus); closeMenus(); if(ent){ if(ent.kind==='site') switchSite(ent.idx); else select(ent,true); } return; } if(r.msg) showToast(r.msg,'#16A34A'); renderNotif(); renderKPIs(); return; }
  const b=e.target.closest('[data-ev]'); if(!b) return; const v=Store.events[+b.dataset.ev]; closeMenus(); const r=v.ref&&Store.find(v.ref); if(r) select(r,true); else switchSite(v.siteIdx);};
document.addEventListener('click',e=>{ if(!e.target.closest('.search,#siteBtn,#siteMenu,#siteNext,#bell,#notif')) closeMenus(); });
const q=$('#q'), res=$('#results'); let hits=[], hi=0;
function searchIndex(){
  const items=[];
  SITES().forEach((s,i)=>{ items.push({label:s.name,sub:`${s.type} · ${s.id}`,icon:IC.depot,go:()=>switchSite(i)}); });
  for(const st of Store.all('stores')) items.push({label:st.name,sub:`${st.type} · tujuan pengiriman · ${st.id}`,icon:IC.depot,go:()=>select(st,true)});
  for(const t of Store.tables.trucks.values()) items.push({label:t.id,sub:`Truk · ${t.carrier.name} · ${truckStatus(t)[0]} · ${t.siteId}`,icon:IC.truck,go:()=>select(t,true)});
  for(const f of Store.tables.forklifts.values()) items.push({label:f.short+' · '+f.siteId,sub:`Forklift · ${f.task}`,icon:IC.fork,go:()=>select(f,true)});
  for(const d of Store.tables.docks.values()) items.push({label:d.label+' · '+d.siteId,sub:`Dock bay · ${dockStatus(d)[0]}`,icon:IC.bay,go:()=>select(d,true)});
  for(const p of Store.tables.pallets.values()) items.push({label:p.id,sub:`Palet · ${p.item} · ${palletWhere(p)}`,icon:IC.box,go:()=>select(p,true)});
  for(const s of Store.tables.shipments.values()) items.push({label:s.id,sub:`Pengiriman · ${s.origin} → ${s.destination}`,icon:IC.doc.replace(/14/g,'22'),go:()=>select(s,true)});
  for(const p of Store.tables.people.values()) if(p.siteId) items.push({label:p.name,sub:`Pekerja · ${p.role} · ${p.siteId}`,icon:IC.person,go:()=>select(p,true)});
  return items;
}
/* v32.1 · pencarian ramah ponsel: layar penuh di ≤820 px, saran cepat saat kolom kosong, teks yang cocok disorot */
const phoneUI=()=>matchMedia('(max-width:820px)').matches;
const Q_SUGGEST=['Area tunggu','Check-in gerbang','Memuat','Membongkar','Forklift','Toko','Petugas gerbang'];
function hl(text,v){ const t=String(text), i=v?t.toLowerCase().indexOf(v):-1; return i<0?esc(t):esc(t.slice(0,i))+'<mark>'+esc(t.slice(i,i+v.length))+'</mark>'+esc(t.slice(i+v.length)); }
const rowHTML=(h,i,v)=>`<button data-i="${i}" class="${i===hi?'on':''}"><span class="dic" style="width:30px;height:30px;border-radius:8px">${h.icon}</span><span class="rtx"><b>${hl(h.label,v)}</b><small>${hl(h.sub,v)}</small></span>${phoneUI()?`<span class="rgo">${IC.chev}</span>`:''}</button>`;
function renderResults(){ const v=q.value.trim().toLowerCase(); $('#qClear').hidden=!q.value;
  if(!v){ if(document.activeElement!==q&&!document.body.classList.contains('search-open')){ res.hidden=true; return; }
    hits=SITES().map((s,i)=>({label:s.name,sub:`${s.type} · ${s.id}`,icon:IC.depot,go:()=>switchSite(i)})); hi=-1;
    const idx=searchIndex().map(it=>(it.label+' '+it.sub).toLowerCase()), cnt=x=>{ const k=x.toLowerCase(); let n=0; for(const t of idx) if(t.includes(k)) n++; return n; };
    res.innerHTML=`<div class="rh">Pencarian cepat</div><div class="chips2">${Q_SUGGEST.map(x=>{ const n=cnt(x); return `<button data-sug="${esc(x)}" class="${n?'':'nil'}">${esc(x)}<i>${n}</i></button>`; }).join('')}</div><div class="rh">Gudang</div>`+hits.map((h,i)=>rowHTML(h,i,'')).join('');
    res.hidden=false; return; }
  const all=searchIndex().filter(it=>(it.label+' '+it.sub).toLowerCase().includes(v)), lim=phoneUI()?12:8; hits=all.slice(0,lim); hi=0;
  res.innerHTML=hits.length?`<div class="rh">Hasil<span>${all.length>lim?`${lim} dari ${all.length} · ketik lebih spesifik`:`${all.length} ditemukan`}</span></div>`+hits.map((h,i)=>rowHTML(h,i,v)).join('')
    :`<div class="empty">Tidak ada yang cocok dengan “${esc(q.value)}”. Coba ID truk (mis. TRK-3104), forklift, bay, palet, nomor pengiriman, atau status seperti “area tunggu”.</div>`;
  res.hidden=false; }
const Q_PH=q.placeholder;
function openSearch(){ if(document.body.classList.contains('search-open')) return; q.placeholder='Cari truk, palet, gudang, status…'; document.body.classList.add('search-open'); q.focus({preventScroll:true}); renderResults(); }
function closeSearch(){ if(!document.body.classList.contains('search-open')) return; document.body.classList.remove('search-open'); q.placeholder=Q_PH; q.value=''; $('#qClear').hidden=true; res.hidden=true; q.blur(); }
$('.search').addEventListener('click',e=>{ if(phoneUI()&&!document.body.classList.contains('search-open')&&!e.target.closest('#results')){ e.stopPropagation(); openSearch(); } });
$('#qBack').addEventListener('click',e=>{ e.stopPropagation(); closeSearch(); });
$('#qClear').addEventListener('click',e=>{ e.stopPropagation(); q.value=''; q.focus(); renderResults(); });
q.addEventListener('input',renderResults); q.addEventListener('focus',()=>{ if(phoneUI()) openSearch(); else renderResults(); });
q.addEventListener('keydown',e=>{
  if(e.key==='ArrowDown'||e.key==='ArrowUp'){ e.preventDefault(); if(!hits.length) return; hi=(hi+(e.key==='ArrowDown'?1:-1)+hits.length)%hits.length; res.querySelectorAll('[data-i]').forEach((b,i)=>b.classList.toggle('on',i===hi)); }
  else if(e.key==='Enter'&&hits[Math.max(0,hi)]){ hits[Math.max(0,hi)].go(); q.value=''; closeMenus(); q.blur(); }
  else if(e.key==='Escape'){ q.value=''; closeMenus(); q.blur(); } });
res.addEventListener('click',e=>{ const sg=e.target.closest('[data-sug]'); if(sg){ e.stopPropagation(); q.value=sg.dataset.sug; renderResults(); if(!phoneUI()) q.focus(); return; }
  const b=e.target.closest('[data-i]'); if(!b) return; hits[+b.dataset.i].go(); q.value=''; closeMenus(); res.hidden=true; });
addEventListener('keydown',e=>{ if(e.key==='/'&&document.activeElement!==q&&document.activeElement!==$('#tvq')){ e.preventDefault(); q.focus(); } else if(e.key==='Escape'&&document.activeElement!==q){ select(null); document.body.classList.remove('ops-open'); } });
const busy={};
['detail','track','ops'].forEach(id=>{const el=document.getElementById(id);
  el.addEventListener('pointerenter',()=>busy[id]=true); el.addEventListener('pointerleave',()=>busy[id]=false);
  el.addEventListener('focusin',()=>busy[id+'f']=true); el.addEventListener('focusout',()=>busy[id+'f']=false);});
const paused=id=>busy[id]||busy[id+'f'];
function refreshUI(force){ renderKPIs(); if(force||!paused('detail')) renderDetail(); if(force||!paused('track')) renderTrack(); if(force||!paused('ops')) renderOps(); if(tableOpen&&!busy.tv) renderTable(); }
$('#tableView').addEventListener('pointerenter',()=>busy.tv=true); $('#tableView').addEventListener('pointerleave',()=>busy.tv=false);

/* ---------- mode sinematik: kamera meluncur ke area paling menarik ---------- */
const cine={on:false,shot:null,last:null};
function cineCandidates(){
  const c=[];
  for(const s of SITES()){
    for(const t of s.trucks){
      if(t.state==='reverse'&&t.bay) c.push({key:t.id,score:9,rec:t,zoom:1.95,phi:0.48,title:`${t.id} mundur ke ${t.bay.label}`,sub:s.name});
      else if(t.state==='docked'&&t.done<t.total&&t.bay) c.push({key:t.id,score:5,rec:t,zoom:1.6,phi:0.6,title:`${t.id} ${t.mode==='load'?'dimuat':'dibongkar'} ${t.done}/${t.total}`,sub:`${s.name} · ${t.bay.label}`});
      else if(t.state==='depart'&&t.presence>0.95) c.push({key:t.id,score:6,rec:t,zoom:1.45,phi:0.46,title:`${t.id} berangkat ke ${t.place}`,sub:'via Tol Jagorawi'});
      else if(t.broken&&t.state==='docked') c.push({key:t.id,score:8,rec:t,zoom:2.3,phi:0.42,title:`${t.id} mogok di ${t.bay?t.bay.label:'dock'}`,sub:`${s.name} · ${t.broken.mech?'mekanik memperbaiki':t.broken.cause.toLowerCase()}`});
      else if(t.state==='gate') c.push({key:t.id,score:7,rec:t,zoom:2.0,phi:0.5,title:`${t.id} check-in di gerbang`,sub:`${s.name} · ${t.gateChecked?'palang dibuka':'petugas mengecek surat jalan'}`});
      else if(t.state==='approach'&&t.presence>0.95) c.push({key:t.id,score:4,rec:t,zoom:1.4,phi:0.5,title:`${t.id} menuju ${s.name}`,sub:`dari ${t.place}`}); }
    for(const t of s.trucks){ if(t.state==='store_docked'||t.state==='store_reverse'){ const st=Store.get('stores',t.dest); if(st) c.push({key:t.id+'s',score:8,rec:t,zoom:1.8,phi:0.5,title:`${t.id} ${t.state==='store_reverse'?'mundur ke dock':t.storePhase==='load'?'memuat retur di':'bongkar di'} ${st.name}`,sub:st.type+' · '+st.address}); }
      else if(t.state==='transfer'&&t.presence>0.9){ const B=Store.get('sites',t.xfer); if(B) c.push({key:t.id+'x',score:6,rec:t,zoom:1.5,phi:0.48,title:`${t.id} antar-gudang ke ${B.name}`,sub:`dari ${s.name} · ${t.cargo.filter(Boolean).length} palet`}); }
      else if(t.state==='to_store'&&t.presence>0.9){ const st=Store.get('stores',t.dest); if(st) c.push({key:t.id+'t',score:5,rec:t,zoom:1.5,phi:0.48,title:`${t.id} mengantar ke ${st.name}`,sub:`dari ${s.name}`}); } }
    for(const f of s.forks) if(f.carryingPalletId) c.push({key:f.id,score:7,rec:f,zoom:2.5,phi:0.55,title:`${f.short} membawa palet`,sub:`${s.name} · ${f.task}`});
    { const li=lunchInfo(s), ea=li&&s.people.filter(p=>p.lunch&&p.lunch.phase==='eat'); if(ea&&ea.length) c.push({key:'kantin'+s.id,score:4+ea.length,rec:ea[0],zoom:3.0,phi:0.5,title:`Kantin ${s.name}`,sub:`${ea.length} pekerja ${li.ln.L.meal.toLowerCase()} · ${li.fk?'forklift bergiliran istirahat':'operasi tetap jalan'}`}); }
    /* v41: motor staf datang/pulang dan ojol di kantin (objek tampilan, posisi dibaca langsung dari keadaan animasinya) */
    { const mi=staffMotoInfo(s); if(mi){ const mv=mi.S.bikes.find(b=>b.an&&b.an.k==='ride'), O=mi.S.ob;
      if(mv) c.push({key:'motor'+s.id,score:5,rec:{siteId:s.id,get pos(){ return {x:mv.x,z:mv.z}; }},zoom:2.4,phi:0.5,title:mv.st==='arrive'?'Pekerja shift datang':'Pekerja shift pulang',sub:`${s.name} · lewat pintu belakang staf`});
      if(mi.ojol) c.push({key:'ojol'+s.id,score:6,rec:{siteId:s.id,get pos(){ return {x:O.x,z:O.z}; }},zoom:2.6,phi:0.5,title:'Ojol antar makanan',sub:`ke kantin ${s.name}`}); } }
    const sup=s.people.find(p=>p.role==='Pengawas dock'); if(sup&&sup.pose) c.push({key:sup.id,score:3,rec:sup,zoom:3.1,phi:0.42,title:`${sup.name}`,sub:`${sup.doing} · ${s.name}`});
    c.push({key:s.id,score:2,rec:s,zoom:0.95,phi:0.72,title:s.name,sub:`${s.type} · ${siteNumbers(s).docked} truk di dock`});
  }
  /* v36: KRL di Stasiun Cibinong (shot tetap di peron, kereta yang bergerak) */
  for(const tr of RAIL.trains||[]){ const st=tr.st; if(!st||!['melambat','berhenti','berangkat'].includes(st.ph)) continue;
    c.push({key:'krl',score:5,pos:new THREE.Vector3(RAIL.stX+tr.dir*14,0,RAIL.z),zoom:1.05,phi:0.42,title:st.ph==='melambat'?`KRL ${tr.name} memasuki ${RAIL.stName}`:st.ph==='berhenti'?`KRL berhenti di ${RAIL.stName}`:`KRL berangkat dari ${RAIL.stName}`,sub:tr.name}); break; }
  c.push({key:'jx',score:1.6,pos:new THREE.Vector3(250,0,-38),zoom:1.25,phi:0.55,title:'Persimpangan Jl. Raya',sub:'Lampu lalu lintas & antrean kendaraan'});
  c.push({key:'wide',score:1.3,pos:new THREE.Vector3(40,0,60),zoom:0.42,phi:0.88,title:'Kawasan Gudang Lumbung',sub:`5 site · ${[...Store.tables.trucks.values()].filter(t=>t.state!=='away').length} truk aktif`});
  return c.filter(x=>x.key!==cine.last);
}
function setCap(title,sub){ if(cine.capT===title&&cine.capS===sub) return; const fresh=cine.capT!==title; cine.capT=title; cine.capS=sub;
  const cap=$('#cineCap'); if(!fresh){ $('#cineSub').textContent=sub; return; }
  cap.classList.remove('show'); clearTimeout(cine.capTimer); cine.capTimer=setTimeout(()=>{ $('#cineTitle').textContent=title; $('#cineSub').textContent=sub; cap.classList.add('show'); },450); }
/* cerita: kamera mengikuti satu truk tanpa potong, dari gerbang tol sampai dock, lalu forklift yang melayaninya */
function storyCandidates(){ const c=[];
  for(const s of SITES()) for(const t of s.trucks){
    if(!(t.bay&&t.bay.siteId===s.id)&&!t.queued) continue;
    if(t.state==='inbound'&&t.path&&t.path.len-t.s<150) c.push({t,kind:'arrive',w:3});
    else if(t.state==='toll_in') c.push({t,kind:'arrive',w:3});
    else if(t.state==='approach'&&t.presence>0.95&&t.path&&t.path.len-t.s>60) c.push({t,kind:'arrive',w:2});
    else if(t.state==='to_store'&&t.path&&t.s<40) c.push({t,kind:'deliver',w:2});
    else if(t.state==='transfer'&&t.path&&t.s<40) c.push({t,kind:'deliver',w:2.5}); }
  return c.filter(x=>x.t.id!==cine.lastStory); }
function pickShot(){
  const sc=storyCandidates();
  if(sc.length&&Math.random()<0.8){ let tot=sc.reduce((a,x)=>a+x.w,0), r=Math.random()*tot, p=sc[0]; for(const x of sc){ r-=x.w; if(r<=0){ p=x; break; } }
    cine.shot={story:true,rec:p.t,kind:p.kind,t:0,dock:0,orbit:(Math.random()<.5?-1:1)*0.035}; cine.lastStory=p.t.id; cine.last=p.t.id; return; }
  const c=cineCandidates(); let tot=c.reduce((a,x)=>a+x.score**1.6,0), r=Math.random()*tot, pick=c[0];
  for(const x of c){ r-=x.score**1.6; if(r<=0){ pick=x; break; } }
  cine.shot={...pick,t:0,dur:8+Math.random()*4,orbit:(Math.random()<.5?-1:1)*(0.05+Math.random()*0.04)}; cine.last=pick.key;
  setCap(pick.title,pick.sub);
}
function shotTarget(sh){ if(sh.pos) return sh.pos; const r=sh.rec; return r.kind==='site'?siteHome(r.idx):worldPos(r); }
function shotValid(sh){ const r=sh.rec; if(!r) return true; if(r.kind==='truck') return r.state!=='away'&&(r.state==='parked'||r.presence>0.6); return true; }
/* bingkai per tahap cerita: subjek yang diikuti, zoom, sudut, dan teks */
function storyFrame(sh,dt){ const t=sh.rec, s=t.site; if(!s||t.state==='away') return null;
  const st=Store.get('stores',t.dest), car=t.carrier.name;
  if(sh.kind==='arrive'){
    switch(t.state){
      case 'inbound': case 'toll_in': return {sub:t,zoom:1.15,phi:0.6,title:`${t.id} keluar Gerbang Tol Jagorawi`,cap:`${car} · menuju ${s.name}`};
      case 'approach': return {sub:t,zoom:1.4,phi:0.55,title:`${t.id} menuju ${s.name}`,cap:`${car} · ${t.driver} · ${t.bay?t.bay.label:''}`};
      case 'gate': return {sub:t,zoom:2.0,phi:0.5,title:t.gateChecked?`Palang gerbang dibuka untuk ${t.id}`:`${t.id} check-in di gerbang ${s.name}`,cap:t.gateChecked?(t.bay?`menuju ${t.bay.label}`:'menuju area tunggu'):'petugas gerbang mengecek surat jalan'};
      case 'yard_wait': return {sub:t,zoom:1.7,phi:0.52,title:`${t.id} menunggu di area tunggu`,cap:`${s.name} · semua bay sedang terisi`};
      case 'prep': return {sub:t,zoom:1.9,phi:0.5,title:'Sopir membuka pintu belakang',cap:`${t.id} di halaman ${s.name}`};
      case 'reverse': return {sub:t,zoom:2.05,phi:0.48,title:`${t.id} mundur ke ${t.bay.label}`,cap:s.name};
      case 'docked': { sh.dock+=dt; if(sh.dock>36) return null;
        const f=s.forks.find(f=>f.carryingPalletId&&f.task.includes(t.id))||s.forks.find(f=>f.task.includes(t.id));
        const ttl=t.coldCheck>0?`Cek suhu muatan ${t.id}`:`${t.mode==='load'?'Memuat':'Membongkar'} ${t.id} · ${t.done}/${t.total} palet`;
        return {sub:f&&!(t.coldCheck>0)?f:t,zoom:f?2.35:1.9,phi:0.55,title:ttl,cap:f?`${f.short} · ${f.task}`:`${s.name} · ${t.bay.label}`}; }
      default: return null; } }
  switch(t.state){
    case 'transfer': { const B=Store.get('sites',t.xfer); return {sub:t,zoom:1.35,phi:0.55,title:`${t.id} antar-gudang ke ${B?B.name:'gudang lain'}`,cap:`dari ${s.name} · ${t.cargo.filter(Boolean).length} palet`}; }
    case 'approach': case 'gate': case 'yard_wait': if(!t.xferFrom) return null; return {sub:t,zoom:t.state==='approach'?1.4:1.9,phi:0.52,title:t.state==='gate'?`${t.id} check-in di ${s.name}`:t.state==='yard_wait'?`${t.id} menunggu bay di ${s.name}`:`${t.id} tiba di ${s.name}`,cap:`kiriman antar-gudang dari ${Store.get('sites',t.xferFrom).name}`};
    case 'prep': case 'reverse': if(!t.xferFrom) return null; return {sub:t,zoom:2.0,phi:0.5,title:`${t.id} merapat di ${s.name}`,cap:t.bay?t.bay.label:''};
    case 'docked': if(!t.xferFrom) return null; { sh.dock+=dt; if(sh.dock>26) return null; return {sub:t,zoom:1.9,phi:0.55,title:`Bongkar kiriman antar-gudang · ${t.done}/${t.total}`,cap:`${t.id} · ${s.name}`}; }
    case 'to_store': return {sub:t,zoom:1.35,phi:0.55,title:`${t.id} mengantar ke ${st?st.name:'toko'}`,cap:`dari ${s.name} · ${t.cargo.filter(Boolean).length} palet`};
    case 'store_prep': case 'store_reverse': return {sub:t,zoom:1.95,phi:0.5,title:`${t.id} merapat di ${st?st.name:'toko'}`,cap:st?st.address:''};
    case 'store_docked': { sh.dock+=dt; if(sh.dock>26) return null; return {sub:t,zoom:1.9,phi:0.55,title:`${t.storePhase==='load'?'Memuat retur':'Bongkar'} di ${st?st.name:'toko'} · ${t.done}/${t.total}`,cap:`${t.id} · ${car}`}; }
    default: return null; } }
const _look=new THREE.Vector3();
/* geser target kamera dengan batas kecepatan: perpindahan jauh jadi terbang mulus, bukan lompatan */
function glide(goal,rateFn,dt){ const d=cam.target.distanceTo(goal); if(d<1e-4) return 0; const step=Math.min(d*(1-Math.exp(-dt*rateFn(d))),(18+d*0.25)*dt); cam.target.lerp(goal,step/d); return d; }
function startCine(){ if(cine.on) return; cine.on=true; select(null); cam.flight=null; follow=false; document.body.classList.add('cine'); $('#cineBtn').setAttribute('aria-pressed','true'); cine.capT=null; pickShot(); }
function stopCine(){ if(!cine.on) return; cine.on=false; cine.shot=null; document.body.classList.remove('cine'); $('#cineCap').classList.remove('show'); $('#cineBtn').setAttribute('aria-pressed','false');
  cam.thetaGoal=cam.theta; cam.zoomGoal=cam.zoom; cine.phiBack=true; }
function stepCine(dt){
  const sh=cine.shot; if(!sh) return; sh.t+=dt;
  if(sh.story){
    const F=sh.t<170?storyFrame(sh,dt):null; if(!F){ pickShot(); return; }
    /* truk lama tertahan antrean/lampu merah → pindah ke cerita lain supaya shot tidak membosankan */
    const tr=sh.rec; sh.idle=(['inbound','approach','to_store','yard_wait','transfer'].includes(tr.state)&&tr.v<0.3)?(sh.idle||0)+dt:0; if(sh.idle>10){ pickShot(); return; }
    setCap(F.title,F.cap);
    const r=F.sub, p=worldPos(r), ahead=r.v?Math.min(7,r.v*0.75):0; _look.set(p.x+Math.sin(r.heading||0)*ahead,0,p.z+Math.cos(r.heading||0)*ahead);
    const dist=glide(_look,dist0=>dist0>40?1.1:1.9,dt), zg=dist>40?Math.min(F.zoom,clamp(0.95-dist/600,0.5,0.75)):F.zoom;
    cam.zoom+=(zg-cam.zoom)*(1-Math.exp(-dt*0.7)); cam.zoomGoal=cam.zoom;
    cam.phi+=(F.phi-cam.phi)*(1-Math.exp(-dt*0.6)); cam.theta+=sh.orbit*dt; cam.thetaGoal=cam.theta; return; }
  if(sh.t>sh.dur||!shotValid(sh)){ pickShot(); return; }
  const goal=shotTarget(sh), dist=glide(goal,()=>0.85,dt), zg=dist>60?Math.min(sh.zoom,clamp(0.95-dist/600,0.5,0.8)):sh.zoom;
  cam.zoom+=(zg-cam.zoom)*(1-Math.exp(-dt*0.55)); cam.zoomGoal=cam.zoom;
  cam.phi+=(sh.phi-cam.phi)*(1-Math.exp(-dt*0.6)); cam.theta+=sh.orbit*dt; cam.thetaGoal=cam.theta;
}
['pointerup','pointercancel','pointerleave'].forEach(ev=>canvas.addEventListener(ev,()=>canvas.classList.remove('grabbing')));
const tipEl=$('#hoverTip'); let tipT=0;
function hoverInfo(r){ if(!r) return null; switch(r.kind){
  case 'truck': return [r.id,`${r.carrier.name} · ${truckStatus(r)[0]}`];
  case 'forklift': return [`Forklift ${r.short}`,`${forkStatus(r)[0]} · ${r.task}`];
  case 'person': return [r.name,`${r.role} · ${r.doing}`];
  case 'dock': return [r.label,dockStatus(r)[0]];
  case 'slot': { const p=r.data; return [`Slot ${r.code}`,p?`${p.item} · ${p.qty} unit`:'Kosong']; }
  case 'pallet': return [r.item,`${r.qty} unit · ${r.id}`];
  case 'site': return [r.name,`${r.type} · ${r.id}`];
  case 'store': return [r.name,`${r.type} · tujuan pengiriman`];
  default: return null; } }
/* v38: info jalan saat kursor di atas aspal (membedakan jalan tol, arteri, dan jalan kota) */
function roadInfo(x,z){ if(!isFinite(x)) return null; const half=ROAD/2+0.3, XT0=HWY.xToll-16;
  if(Math.abs(z-ZHW)<9.2&&x>XT0) return Math.abs(x-HWY.xToll)<16?['Gerbang Tol Jagorawi','Gardu tol · semua truk check-out/in di sini']:['Tol Jagorawi','Jalan tol · 4 lajur, median beton · bebas hambatan, tanpa lampu merah'];
  if(Math.abs(z-ZHW)<half) return ['Jl. Lingkar Utara','Jalan arteri · penghubung kawasan gudang ke tol · garis ganda: dilarang menyalip'];
  const vx=Object.keys(ROAD_NAMES_V).map(Number).find(v=>Math.abs(x-v)<half), hz=Object.keys(ROAD_NAMES_H).map(Number).find(v=>Math.abs(z-v)<half);
  if(vx!=null&&hz!=null){ const turn=CAR_V.includes(vx)&&CAR_H.includes(hz); return [`Persimpangan ${ROAD_NAMES_H[hz]} × ${ROAD_NAMES_V[vx]}`,turn?'Lampu lalu lintas & penyeberang · boleh lurus, belok kiri/kanan, putar balik':'Lampu lalu lintas & penyeberang · boleh lurus atau putar balik']; }
  if(hz!=null) return [ROAD_NAMES_H[hz],CAR_H.includes(hz)?'Jalan kota · 2 lajur · lalu lintas umum':'Jalan kota · akses kawasan gudang'];
  if(vx!=null){ if(z<(GRID.z0-0.5)*PZ-ROAD/2&&z>ZHW) return ['Jalan akses tol',`${ROAD_NAMES_V[vx]} · menuju Jl. Lingkar Utara`]; return [ROAD_NAMES_V[vx],CAR_V.includes(vx)?'Jalan kota · 2 lajur · lalu lintas umum':'Jalan kota · akses kawasan gudang']; }
  return null; }
canvas.addEventListener('pointermove',ev=>{ if(ptrs.size||cine.on||ev.pointerType==='touch'){ tipEl.classList.remove('show'); return; }
  const now=performance.now(); if(now-tipT<70) return; tipT=now;
  let info=null, road=false; try{ info=hoverInfo(recordAt(ev.clientX,ev.clientY)); if(!info&&cam.zoom<2.4){ const gp=groundAt(ev.clientX,ev.clientY); if(gp){ info=roadInfo(gp.x,gp.z); road=!!info; } } }catch(_){}
  if(info){ tipEl.classList.remove('flip'); tipEl.style.right='auto'; tipEl.firstChild.textContent=info[0]; tipEl.lastChild.textContent=info[1]; tipEl.style.left=ev.clientX+'px'; tipEl.style.top=ev.clientY+'px'; tipEl.classList.add('show'); canvas.style.cursor=road?'':'pointer'; }
  else { tipEl.classList.remove('show'); canvas.style.cursor=''; } });
canvas.addEventListener('pointerleave',()=>{ tipEl.classList.remove('show'); canvas.style.cursor=''; });
/* ---- toast untuk peringatan kritis baru ---- */
setInterval(()=>{ for(const a of ALERTS.values()) if(a.fresh){ a.fresh=false; if(a.sev==='crit') showToast(`${a.title} — buka Peringatan untuk menindaklanjuti`,'#DC2626',a.ref); } },1000);
/* ---- toast untuk kejadian penting di site yang sedang dilihat ---- */
let toastT=0;
function showToast(text,color='#2E5BFF',ref=null,when=new Date()){ const box=$('#toasts'); while(box.children.length>=3) box.firstChild.remove();
  const el=document.createElement('div'); el.className='toast'; el.innerHTML=`<i style="background:${color}"></i><span></span><small>${hm(when)}</small>`; el.querySelector('span').textContent=text;
  el.onclick=()=>{ const r=ref&&Store.find(ref); if(r) select(r,true); el.remove(); };
  box.appendChild(el); setTimeout(()=>{ el.classList.add('out'); setTimeout(()=>el.remove(),380); },4600); }
document.addEventListener('click',ev=>{ const b=ev.target.closest&&ev.target.closest('[data-mech]'); if(!b||!sel||sel.kind!=='truck') return;
  if(RP.on){ showToast(RP_MSG,'#B76E00'); return; } showToast(sendMechanic(sel),'#2E5BFF',sel.id); refreshUI(true); });
document.addEventListener('click',ev=>{ const b=ev.target.closest&&ev.target.closest('[data-dest]'); if(!b||b.disabled||!sel||sel.kind!=='truck') return;
  const r=setTruckDest(sel,b.dataset.dest); if(r!=='ok') showToast(r,'#C2410C',sel.id); else { const id=b.dataset.dest, d=id.startsWith('bay:')?Store.get('docks',id.slice(4)):Store.get('stores',id)||Store.get('sites',id); showToast(`${sel.id} diarahkan ke ${d?(d.label||d.name):'luar kota via Tol Jagorawi'}`,'#2E5BFF',sel.id); }
  refreshUI(true); });
Store.on(ev=>{ const s=S_(); if(!s||ev.siteId!==s.id) return; if(!(ev.color==='#C2410C'||ev.color==='#7C3AED'||/retur|shift|tiba di/i.test(ev.text))) return;
  const now=performance.now(); if(now-toastT<4000) return; toastT=now;
  showToast(ev.text,ev.color,ev.ref,ev.t); });
$('#cineBtn').onclick=e=>{ e.stopPropagation(); cine.on?stopCine():startCine(); };
$('#cineExit').onclick=stopCine;
canvas.addEventListener('pointerdown',()=>stopCine(),true); canvas.addEventListener('wheel',()=>stopCine(),{capture:true,passive:true});
addEventListener('keydown',e=>{ if(cine.on&&(e.key==='Escape'||e.key===' ')){ e.preventDefault(); stopCine(); } });

/* ---------- rute & label (UI overlay yang dihitung dari data) ---------- */
let routeEnd=null;
function updateRoute(){
  dots.count=0; destRing.visible=false; routeEnd=null;
  if(!sel||sel.kind!=='truck') return;
  const t=sel, site=t.site, pts=[]; const push=(P,s0)=>{ let s=s0; while(s<P.len&&pts.length<600){ pts.push(samplePath(P,s)); s+=pts.length<90?0.9:2.2; } P.ci=0; };
  const xB=t.xfer&&Store.get('sites',t.xfer), gEnd=B=>{ const g=siteGate(B); return {x:B.ox+g.xc,z:B.oz+yardZ(B)}; };
  if(t.state==='transfer'&&xB){ if(t.path) push(t.path,t.s+2); routeEnd={...gEnd(xB),text:`Ke ${xB.name}`,sub:`antar-gudang · ${t.cargo.filter(Boolean).length} palet`}; drawRoute(pts,site); return; }
  if(xB&&['docked','pull','close'].includes(t.state)){ const P=siteTripPath(site,t,xB); if(P) push(P,0); routeEnd={...gEnd(xB),text:`Ke ${xB.name}`,sub:'antar-gudang · check-in di gerbang'}; drawRoute(pts,site); return; }
  if(t.queued&&['inbound','toll_in','approach','gate','yard_wait'].includes(t.state)){ if(t.path) push(t.path,t.s+2); if(t.state==='inbound'||t.state==='toll_in') push(approachPath(site,gatePseudo(site)),0);
    const g=siteGate(site); routeEnd={x:site.ox+g.headX,z:site.oz+yardZ(site),text:`Area tunggu ${site.name}`,sub:t.xferFrom?`dari ${Store.get('sites',t.xferFrom).name} · ${qText(t)}`:qText(t)}; drawRoute(pts,site); return; }
  if(['inbound','toll_in','approach','gate','prep','reverse'].includes(t.state)&&t.bay){
    if(t.path) push(t.path,t.s+2);
    if(t.state==='inbound'||t.state==='toll_in') push(approachPath(site,t.bay),0);
    if(t.state!=='reverse') push(reversePath(site,t.bay),0);
    destRing.position.set(t.bay.x+site.ox,0.15,site.zDock+site.oz); destRing.visible=true;
    if(t.state==='inbound') routeEnd={x:HWY.xToll,z:ZHW,text:`Dari ${t.place}`,sub:'keluar Gerbang Tol Jagorawi'};
  } else if(['to_store','store_prep','store_reverse'].includes(t.state)){
    const st=Store.get('stores',t.dest); if(t.path) push(t.path,t.s+2); if(t.state==='to_store') push(storeReversePath(site,st),0);
    routeEnd={x:st.ox+st.bays[0].x,z:st.oz+st.zDock,text:`Bongkar di ${st.name}`,sub:`${t.cargo.filter(Boolean).length} palet · lalu ambil retur`};
  } else if(['leave'].includes(t.state)){ if(t.path) push(t.path,t.s+2); push(highwayOutPath(site),0); routeEnd={x:HWY.xToll,z:ZHW,text:'Kembali ke pool',sub:'via Gerbang Tol Jagorawi'};
  } else if(['docked','pull','close','depart','toll_out','highway'].includes(t.state)){
    const bay=t.bay||t.lastBay;
    const dstS=t.dest&&Store.get('stores',t.dest);
    if(dstS&&['docked','pull','close'].includes(t.state)){ const P=storeTripPath(site,t,dstS); if(P) push(P,0); routeEnd={x:dstS.ox+dstS.bays[0].x,z:dstS.oz+dstS.zDock,text:`Ke ${dstS.name}`,sub:'antar barang · ambil retur'}; drawRoute(pts,site); return; }
    if(['docked','pull','close'].includes(t.state)&&bay) push(departPath(site,bay,t.state==='docked'?site.zDock:t.pos.z),0);
    else if(t.path) push(t.path,t.s+2);
    if(t.state!=='highway') push(highwayOutPath(site),0);
    routeEnd={x:HWY.xToll,z:ZHW,text:t.mode==='load'?`Ke ${t.place}`:'Kembali ke pool',sub:'via Gerbang Tol Jagorawi'};
  } else return;
  drawRoute(pts,site);
}
const labelLayer=$('#labels'); const tagPool=[];
function tag(i){ if(!tagPool[i]){ const el=document.createElement('div'); el.className='tag'; labelLayer.appendChild(el); tagPool[i]=el; } return tagPool[i]; }
const tmp=new THREE.Vector3();
function place(el,wx,wy,wz){ tmp.set(wx,wy,wz).project(camera); if(tmp.z>1||tmp.x<-1.1||tmp.x>1.1||tmp.y<-1.1||tmp.y>1.1){ el.style.display='none'; return; } el.style.display=''; el.style.left=((tmp.x+1)/2*innerWidth)+'px'; el.style.top=((1-tmp.y)/2*innerHeight)+'px'; }
function drawLabels(){
  let n=0; const s=S_();
  if(!tableOpen&&!cine.on){
    for(const t of s.trucks){ if(t.state==='away'||(t.state!=='parked'&&t.presence<0.5)) continue; const el=tag(n++);
      const isSel=sel===t; el.className='tag'+(isSel?' sel':'')+(t.state==='parked'&&!isSel?' dim':''); el.innerHTML=isSel?`${t.id}<span class="st">${truckStatus(t)[0]}</span>`:t.id;
      place(el,t.pos.x+s.ox,3.95,t.pos.z+s.oz); }
    if(sel&&sel.kind!=='truck'&&sel.kind!=='shipment'){ const el=tag(n++); const ss=Store.get('sites',sel.siteId);
      if(sel.kind==='dock'){ el.className='tag bay'; el.innerHTML=`${sel.label}<span class="st">${dockStatus(sel)[0]}</span>`; place(el,sel.x+ss.ox,PH+3.6,ss.fz+0.5+ss.oz); }
      else { const p=worldPos(sel), hgt={forklift:PH+2.6,person:(sel.y||0)+2.3,pallet:2.6}[sel.kind]||2; el.className='tag'; el.innerHTML=sel.kind==='forklift'?`${sel.short}<span class="st">${forkStatus(sel)[0]}</span>`:sel.kind==='person'?sel.name:sel.id; place(el,p.x,hgt,p.z); } }
    if(routeEnd){ const el=tag(n++); el.className='tag'; el.innerHTML=`🛣 ${routeEnd.text}<span class="st">${routeEnd.sub}</span>`; place(el,routeEnd.x,7.5,routeEnd.z); }
  }
  for(let i=n;i<tagPool.length;i++) tagPool[i].style.display='none';
}

/* ==========================================================================
   APLIKASI: data → simulator → tampilan
   ========================================================================== */
SITE_CONFIG.forEach((C,i)=>createSite(C,i)); STORE_CONFIG.forEach((C,i)=>createStore(C,i));
SITES().forEach(populateSite); SITES().forEach(seedDocks);
initTraffic(); initCityWalkers();
{ const keep=SITES().map(s=>[s.stockDelta,s.arrivals]); LUNCH_HOLD=true; for(let k=0;k<1500;k++){ for(const s of SITES()) simSite(s,1/12); for(const st of stores()) simStore(st,1/12); if(k%3===0) stepTraffic(1/4); } SITES().forEach((s,i)=>{ s.stockDelta=keep[i][0]; s.arrivals=keep[i][1]; }); LUNCH_HOLD=false; }
for(let k=0;k<300;k++) simCity(1/15);
Store.events.length=0;
SITES().forEach(s=>s.inv.forEach(i=>{ if(i.qty<STOCK_LOW) logEvent(s,`Stok ${i.name} menipis (${fmt(i.qty)} unit)`,'#B76E00'); }));
Store.unread=2;
document.body.classList.toggle('lowp',LOWPOWER); { const av=document.querySelector('.user .avatar'); if(av){ av.textContent=''; av.style.backgroundImage=`url(${AVATAR})`; av.classList.add('img'); } } buildCityView(); SITES().forEach(buildSiteView); stores().forEach(buildStoreView); buildRailView(); buildPedSignals(); initClouds(); bindEntities(); initWeatherFX();
{ let pref='1'; try{ pref=localStorage.getItem('lumbung.clean')??'1'; }catch(_){} if(pref==='1') setClean(true,true); }
cam.target.copy(siteHome(0)); cam.zoom=cam.zoomGoal=HOME_ZOOM(); applyCam();
syncView(0,performance.now());
{ const L=$('#loading'); L.classList.add('done'); setTimeout(()=>L.remove(),600); } refreshUI(true);
/* ---------- uji mandiri di browser: ?selftest[&menit=13][&jam=siang|malam|cycle][&seed=7] ----------
   Simulasi dipercepat dengan langkah tetap 1/15 dtk, diperiksa makeSafetyChecker (sama dengan tests/headless-sim.mjs).
   Hasil juga tersedia di window.__selftest untuk otomasi (Playwright). */
let SIM_PAUSED=QS.has('selftest'); /* mode uji: simulasi normal ditahan sejak awal supaya hasilnya sama persis dengan tests/headless-sim.mjs */
function esc(v){ return String(v).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }   /* deklarasi fungsi: ter-hoist, aman dipakai render pertama */
async function runSelftest(){
  const menit=clamp(+(QS.get('menit')||13)||13,1,60), jq=String(QS.get('jam')||'').replace(',','.'), hh=parseFloat(jq), jam=['siang','pagi','sore','malam','cycle'].includes(jq)?jq:isFinite(hh)&&hh>=0&&hh<24?String(hh):'siang', jamL=TIME_MODES[jam]?TIME_MODES[jam].label:`Pukul ${hhmm(+jam)}`;
  SIM_PAUSED=true; stopCine(); select(null);
  const box=document.createElement('div'); box.id='selftest'; box.setAttribute('role','dialog'); box.setAttribute('aria-live','polite'); document.body.appendChild(box);
  box.innerHTML=`<div class="sth"><b>Uji mandiri</b><small>seed ${SEED} · ${menit} menit · ${esc(jamL)}</small></div><p id="stP">Menyiapkan simulasi…</p><div class="stbar"><i id="stBar"></i></div>`;
  const C=selftestInit({jam}), dt=1/15, total=Math.round(menit*60/dt), t0=performance.now(); let k=0;
  while(k<total){ const end=Math.min(total,k+120); for(;k<end;k++) selftestStep(dt,C);
    $('#stP').textContent=`Menjalankan simulasi ${Math.floor(k*dt/60)} dari ${menit} menit…`; $('#stBar').style.width=(k/total*100).toFixed(1)+'%';
    await new Promise(r=>setTimeout(r,0)); }
  const R=C.report(); R.rows.push({id:'pool',label:'Orang dengan bagian tubuh hilang',count:window.__poolWarned?1:0,ok:!window.__poolWarned,examples:[]});
  Object.assign(R,{pass:R.rows.every(r=>r.ok),seed:SEED,menit,jam,fingerprint:simFingerprint(),durasiMs:Math.round(performance.now()-t0)});
  window.__selftest=R; try{ console.table(R.rows.map(r=>({cek:r.label,jumlah:r.count,lulus:r.ok}))); }catch(_){}
  const m=R.metrics, fail=R.rows.filter(r=>!r.ok);
  box.innerHTML=`<div class="sth"><b>${R.pass?'✓ Lulus':'✗ Gagal'} · uji mandiri</b><small>seed ${SEED} · ${menit} menit · ${esc(jamL)} · ${(R.durasiMs/1000).toFixed(1)} dtk</small></div>
    <p class="${R.pass?'ok':'bad'}">${R.pass?`Semua ${R.rows.length} pemeriksaan keselamatan bernilai 0.`:`${fail.length} dari ${R.rows.length} pemeriksaan gagal.`}</p>
    <ul>${R.rows.map(r=>`<li class="${r.ok?'ok':'bad'}"><span>${r.ok?'✓':'✗'}</span><div><b>${esc(r.label)}</b>${r.ok?'':`<small>${r.count}× · ${r.examples.map(esc).join(' · ')}</small>`}</div></li>`).join('')}</ul>
    <p class="stm">Truk paling lama tertahan ${m.maxStuckSec} dtk · jarak antre minimum ${m.minQueueGapM??'–'} m · ${m.crossdockChecks.toLocaleString('id-ID')} cek cross-dock · ${m.coldChecks} cek suhu · ${m.gateCheckins} check-in gerbang (antre maks ${m.maxQueueWaitSec} dtk) · sidik jari <code>${R.fingerprint}</code></p>
    <div class="sta"><button data-st="again">Ulangi seed ini</button><button data-st="new">Seed baru</button><button data-st="close" class="pri">Tutup</button></div>`;
  box.onclick=e=>{ const b=e.target.closest('[data-st]'); if(!b) return; const u=new URL(location.href);
    if(b.dataset.st==='again'){ u.searchParams.set('seed',String(SEED)); location.href=u.toString(); } else if(b.dataset.st==='new'){ u.searchParams.set('seed',String(Math.floor(Math.random()*1e6))); location.href=u.toString(); } else box.remove(); };
  SIM_PAUSED=false; refreshUI(true);
}
if(QS.has('selftest')) setTimeout(runSelftest,300);

/* ---------- v35: garis waktu & putar ulang ----------
   Perekam membaca Store setiap 0,5 dtk waktu simulasi (tidak menulis apa pun, jadi simulasi & sidik jari seed tidak berubah).
   Saat putar ulang: simulasi dijeda, field tampilan di Store diisi dari rekaman (diinterpolasi), lalu dikembalikan PERSIS
   ke nilai live saat keluar. Aksi yang mengubah operasi (arahkan truk, aksi peringatan, waktu & cuaca) diblokir selama putar ulang. */
const REC={dt:0.5,max:LOWPOWER?600:1200,t:0,acc:0,frames:[],pal:new Map(),ev:[],str:[''],smap:new Map([['',0]]),E:null};
const sid=v=>{ v=v==null?'':String(v); let i=REC.smap.get(v); if(i==null){ i=REC.str.length; REC.str.push(v); REC.smap.set(v,i); } return i; };
const TS=17, CS=7, FS=6, PS=6, KS=8;
function recEnts(){ if(REC.E) return REC.E; const S=Store.all('sites'), D=[...Store.tables.docks.values()];
  REC.E={T:[...Store.tables.trucks.values()],F:[...Store.tables.forklifts.values()],P:[...Store.tables.people.values()],C:[...Store.tables.cars.values()],
    G:[...Store.tables.signals.values()],S,D,sIdx:new Map(S.map((x,i)=>[x.id,i])),dIdx:new Map(D.map((x,i)=>[x.id,i]))}; return REC.E; }
function capture(){ const E=recEnts(), n=E.T.length*(TS+CS)+E.F.length*FS+E.P.length*PS+E.C.length*KS+E.G.length*2+E.S.length+E.D.length, d=new Float32Array(n); let k=0;
  for(const t of E.T){ const c=t.crew, L=LAMP_ST.get(t);
    d[k++]=t.pos.x; d[k++]=t.pos.z; d[k++]=t.heading; d[k++]=t.v; d[k++]=sid(t.state); d[k++]=t.doorsT||0; d[k++]=t.cabDoor||0; d[k++]=t.presence??1; d[k++]=t.rev?1:0;
    d[k++]=E.sIdx.get(t.siteId)??-1; d[k++]=t.dockId?E.dIdx.get(t.dockId)??-1:-1; d[k++]=sid(t.mode); d[k++]=t.done||0; d[k++]=t.total||0; d[k++]=t.path?t.curv||0:0; d[k++]=t.stuck||0; d[k++]=L?L.turn:0;
    if(c&&c.on){ d[k++]=1; d[k++]=c.x; d[k++]=c.z; d[k++]=c.h; d[k++]=c.v||0; d[k++]=sid(c.pose); d[k++]=c.y||0; } else { d[k++]=0; k+=6; } }
  for(const f of E.F){ d[k++]=f.pos.x; d[k++]=f.pos.z; d[k++]=f.heading; d[k++]=f.v||0; d[k++]=f.lift||0; d[k++]=f.rev?1:0; }
  for(const p of E.P){ d[k++]=p.pos.x; d[k++]=p.pos.z; d[k++]=p.heading; d[k++]=p.v||0; d[k++]=sid(p.pose); d[k++]=p.y||0; }
  for(const c of E.C){ d[k++]=c.p; d[k++]=c.v; d[k++]=c.active?1:0; d[k++]=c.presence??1; d[k++]=c.x; d[k++]=c.z; d[k++]=c.heading; d[k++]=c.lane; } /* v38: mobil bisa belok, jadi posisi & lajur direkam langsung */
  for(const g of E.G){ d[k++]=sid(g.stateH); d[k++]=sid(g.stateV); }
  for(const s of E.S){ d[k++]=s.tgate?s.tgate.armT:0; }
  for(const b of E.D){ d[k++]=b.doorState==='open'?1:0; }
  return {t:REC.t,hour:Store.clock.hour,wx:Store.weather.condition,d}; }
const palKey=L=>!L?'':L.type+'|'+(L.id??'')+'|'+(L.index??'');
const palLoc=k=>{ const [type,id,idx]=k.split('|'), o={type}; if(id) o.id=id; if(idx!=='') o.index=+idx; return o; };
function recordTick(dt){ REC.t+=dt; REC.acc+=dt; if(REC.acc<REC.dt) return; REC.acc=0;
  REC.frames.push(capture()); if(REC.frames.length>REC.max) REC.frames.shift();
  for(const p of Store.tables.pallets.values()){ const k=palKey(p.location); let h=REC.pal.get(p.id); if(!h){ h=[]; REC.pal.set(p.id,h); } if(!h.length||h[h.length-1][1]!==k) h.push([REC.t,k]); }
  const t0=REC.frames[0].t; if(REC.frames.length%60===0){ for(const [id,h] of REC.pal){ while(h.length>1&&h[1][0]<=t0) h.shift(); if(!Store.tables.pallets.has(id)&&h[h.length-1][0]<t0) REC.pal.delete(id); } while(REC.ev.length&&REC.ev[0].rt<t0) REC.ev.shift(); } }
Store.on(ev=>{ if(!RP.on) REC.ev.push({rt:REC.t,ev}); });
/* tulis satu keadaan ke Store; A,B = frame, a = bobot interpolasi */
function applyRec(A,B,a){ const E=recEnts(), d=A.d, e=(B||A).d; let k=0; const L=(i)=>d[i]+(e[i]-d[i])*a, LH=(i)=>d[i]+angDiff(d[i],e[i])*a;
  RP.turn.clear();
  for(const t of E.T){ const same=d[k+9]===e[k+9]&&Math.hypot(e[k]-d[k],e[k+1]-d[k+1])<25, w=same?a:0, Li=i=>d[i]+(e[i]-d[i])*w;
    t.pos.x=Li(k); t.pos.z=Li(k+1); t.heading=same?d[k+2]+angDiff(d[k+2],e[k+2])*w:d[k+2]; t.v=Li(k+3); t.state=REC.str[d[k+4]]; t.doorsT=Li(k+5); t.cabDoor=Li(k+6); t.presence=Li(k+7); t.rev=!!d[k+8];
    const si=d[k+9]; if(si>=0) t.siteId=E.S[si].id; const di=d[k+10]; t.dockId=di>=0?E.D[di].id:null; t.mode=REC.str[d[k+11]]; t.done=d[k+12]; t.total=d[k+13]; t.curv=d[k+14]; t.stuck=d[k+15]; RP.turn.set(t,d[k+16]); k+=TS;
    const c=t.crew; if(c){ c.on=!!d[k]; if(c.on){ c.x=Li(k+1); c.z=Li(k+2); c.h=same?d[k+3]+angDiff(d[k+3],e[k+3])*w:d[k+3]; c.v=d[k+4]; c.pose=REC.str[d[k+5]]||undefined; c.y=d[k+6]; } } k+=CS; }
  for(const f of E.F){ f.pos.x=L(k); f.pos.z=L(k+1); f.heading=LH(k+2); f.v=d[k+3]; f.lift=L(k+4); f.rev=!!d[k+5]; k+=FS; }
  for(const p of E.P){ const jump=Math.hypot(e[k]-d[k],e[k+1]-d[k+1])>6, w=jump?0:a; p.pos.x=d[k]+(e[k]-d[k])*w; p.pos.z=d[k+1]+(e[k+1]-d[k+1])*w; p.heading=d[k+2]+angDiff(d[k+2],e[k+2])*w; p.v=d[k+3]; p.pose=REC.str[d[k+4]]||undefined; p.y=d[k+5]; k+=PS; }
  for(const c of E.C){ const jump=Math.hypot(e[k+4]-d[k+4],e[k+5]-d[k+5])>8, w=jump?0:a; c.p=d[k]; c.v=d[k+1]; c.active=!!d[k+2]; c.presence=d[k+3];
    c.x=d[k+4]+(e[k+4]-d[k+4])*w; c.z=d[k+5]+(e[k+5]-d[k+5])*w; c.heading=d[k+6]+angDiff(d[k+6],e[k+6])*w; c.lane=d[k+7]; k+=KS; }
  for(const g of E.G){ g.stateH=REC.str[d[k]]; g.stateV=REC.str[d[k+1]]; k+=2; }
  for(const s of E.S){ if(s.tgate) s.tgate.armT=L(k); k++; }
  for(const b of E.D){ b.doorState=d[k]?'open':'closed'; k++; }
  Store.clock.hour=A.hour+(B&&Math.abs(B.hour-A.hour)<1?(B.hour-A.hour)*a:0); if(Store.weather.condition!==A.wx) Store.weather={condition:A.wx,...WEATHER[A.wx]}; }
function applyPallets(T){ RP.hide.clear();
  for(const p of Store.tables.pallets.values()){ const h=REC.pal.get(p.id); let k=null; if(h) for(let i=h.length-1;i>=0;i--) if(h[i][0]<=T+1e-6){ k=h[i][1]; break; }
    if(k==null){ RP.hide.add(p.id); continue; } if(palKey(p.location)!==k) p.location=palLoc(k); } }
/* cadangan nilai live yang PERSIS (bukan Float32 rekaman) untuk setiap field yang ditulis applyRec */
function rpBackup(){ const E=recEnts(), B=[], keep=(o,ks)=>{ if(o) for(const k of ks) B.push([o,k,o[k],Object.prototype.hasOwnProperty.call(o,k)]); };
  for(const t of E.T){ keep(t.pos,['x','z']); keep(t,['heading','v','state','doorsT','cabDoor','presence','rev','siteId','dockId','mode','done','total','curv','stuck']); keep(t.crew,['on','x','z','h','v','pose','y']); }
  for(const f of E.F){ keep(f.pos,['x','z']); keep(f,['heading','v','lift','rev']); }
  for(const p of E.P){ keep(p.pos,['x','z']); keep(p,['heading','v','pose','y']); }
  for(const c of E.C) keep(c,['p','v','active','presence','x','z','heading','lane']);
  for(const g of E.G) keep(g,['stateH','stateV']);
  for(const st of E.S) keep(st.tgate,['armT']);
  for(const b of E.D) keep(b,['doorState']);
  return B; }
function rpSpan(){ const F=REC.frames; return F.length?{t0:F[0].t,t1:F[F.length-1].t}:null; }
function rpSeek(T){ const F=REC.frames, sp=rpSpan(); if(!sp) return; T=clamp(T,sp.t0,sp.t1); RP.T=T;
  const i=clamp(Math.floor((T-sp.t0)/REC.dt),0,F.length-1), A=F[i], B=F[Math.min(i+1,F.length-1)], a=B.t>A.t?clamp((T-A.t)/(B.t-A.t),0,1):0;
  applyRec(A,B,a); applyPallets(T); }
function enterReplay(){ if(RP.on||SIM_PAUSED) return; const sp=rpSpan(); if(!sp||sp.t1-sp.t0<15){ showToast('Rekaman belum cukup. Tunggu beberapa detik lagi.','#B76E00'); return; }
  stopCine(); closeMenus&&closeMenus();
  RP.live={bak:rpBackup(),pal:new Map([...Store.tables.pallets.values()].map(p=>[p.id,p.location])),clock:{...Store.clock},wx:Store.weather};
  RP.on=true; RP.play=true; RP.speed=1; document.body.classList.add('replay'); $('#replayBar').hidden=false; $('#replayBtn').setAttribute('aria-pressed','true');
  rpBuildMarks(); rpSeek(Math.max(sp.t0,sp.t1-60)); rpUI(true); refreshUI(true); }
function exitReplay(){ if(!RP.on) return; const L=RP.live;
  for(const [o,key,v,had] of L.bak){ if(had) o[key]=v; else delete o[key]; } for(const p of Store.tables.pallets.values()){ const o=L.pal.get(p.id); if(o) p.location=o; }
  Object.assign(Store.clock,L.clock); Store.weather=L.wx; RP.hide.clear(); RP.turn.clear(); RP.on=false; RP.live=null;
  document.body.classList.remove('replay'); $('#replayBar').hidden=true; $('#replayBtn').setAttribute('aria-pressed','false'); refreshUI(true); }
function rpStep(rdt){ if(!RP.play) return; const sp=rpSpan(); let T=RP.T+rdt*RP.speed; if(T>=sp.t1){ T=sp.t1; RP.play=false; rpUI(true); } rpSeek(T); }
const rpAgo=s=>{ s=Math.max(0,Math.round(s)); const m=Math.floor(s/60), r=s%60; return s<1?'ujung rekaman':(m?m+' mnt ':'')+(r||!m?r+' dtk':'')+' lalu'; };
function rpUI(full){ const sp=rpSpan(); if(!sp||!RP.on) return; const r=$('#rpRange'); r.min=sp.t0; r.max=sp.t1; if(document.activeElement!==r||full) r.value=RP.T;
  $('#rpClock').textContent=hms(Store.clock.hour); $('#rpAgo').textContent=rpAgo(sp.t1-RP.T); $('#rpLen').textContent=`Rekaman ${Math.round((sp.t1-sp.t0)/60)} menit`;
  const pct=(sp.t1>sp.t0?(RP.T-sp.t0)/(sp.t1-sp.t0):1)*100; $('#rpFill').style.width=pct+'%';
  $('#rpPlay').innerHTML=RP.play?'<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>':'<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.8v14.4a1 1 0 0 0 1.5.86l11.6-7.2a1 1 0 0 0 0-1.72L8.5 3.94A1 1 0 0 0 7 4.8z"/></svg>';
  $('#rpPlay').setAttribute('aria-label',RP.play?'Jeda':'Putar');
  if(full) for(const b of document.querySelectorAll('#rpSpeed button')) b.setAttribute('aria-pressed',String(+b.dataset.sp===RP.speed));
  $('#replayBar').classList.toggle('atEnd',sp.t1-RP.T<0.6); if(RP.markSite!==active){ RP.markSite=active; rpBuildMarks(); } }
/* penanda kejadian di garis waktu: warna = warna kejadian, klik = lompat 3 dtk sebelum kejadian */
function rpBuildMarks(){ const sp=rpSpan(), box=$('#rpMarks'); if(!sp) return; const W=sp.t1-sp.t0||1, cur=S_();
  box.innerHTML=REC.ev.filter(x=>x.rt>=sp.t0&&x.rt<=sp.t1).slice(-160).map(x=>{ const mine=!cur||x.ev.siteId===cur.id;
    return `<button class="rpm${mine?'':' dim'}" style="left:${((x.rt-sp.t0)/W*100).toFixed(2)}%;--c:${esc(x.ev.color||'#2E5BFF')}" data-rt="${x.rt}" data-ref="${esc(x.ev.ref||'')}" data-tip="${esc(hm(x.ev.t))} · ${esc(x.ev.siteId||'')}|${esc(x.ev.text)}" aria-label="${esc(x.ev.text)}"></button>`; }).join(''); }
/* aksi yang mengubah operasi diblokir saat putar ulang supaya keadaan live tidak tercampur keadaan masa lalu */
const RP_MSG='Sedang putar ulang. Kembali ke live untuk mengubah operasi.';
{ const _sd=setTruckDest, _ra=runAlert, _sw=setWeather, _st=setTimeMode;
  setTruckDest=(...a)=>RP.on?RP_MSG:_sd(...a); runAlert=(...a)=>RP.on?{msg:RP_MSG}:_ra(...a);
  setWeather=(...a)=>RP.on?showToast(RP_MSG,'#B76E00'):_sw(...a); setTimeMode=(...a)=>RP.on?showToast(RP_MSG,'#B76E00'):_st(...a); }
$('#replayBtn').onclick=e=>{ e.stopPropagation(); RP.on?exitReplay():enterReplay(); };
$('#rpLive').onclick=exitReplay;
$('#rpPlay').onclick=()=>{ const sp=rpSpan(); if(!RP.play&&sp&&sp.t1-RP.T<0.6) rpSeek(Math.max(sp.t0,sp.t1-60)); RP.play=!RP.play; rpUI(true); };
$('#rpBack').onclick=()=>{ rpSeek(RP.T-10); rpUI(true); };
$('#rpFwd').onclick=()=>{ rpSeek(RP.T+10); rpUI(true); };
$('#rpRange').addEventListener('input',e=>{ RP.drag=true; rpSeek(+e.target.value); rpUI(); });
$('#rpRange').addEventListener('change',()=>{ RP.drag=false; });
$('#rpSpeed').onclick=e=>{ const b=e.target.closest('button'); if(!b) return; RP.speed=+b.dataset.sp; rpUI(true); };
$('#rpMarks').onclick=e=>{ const b=e.target.closest('.rpm'); if(!b) return; rpSeek(+b.dataset.rt-3); RP.play=true; const r=b.dataset.ref&&Store.find(b.dataset.ref); if(r) select(r,true); rpUI(true); };
$('#rpMarks').addEventListener('pointerover',e=>{ const b=e.target.closest('.rpm'); if(!b) return; const [h,txt]=b.dataset.tip.split('|'), bb=b.getBoundingClientRect();
  tipEl.innerHTML=`<b>${h}</b><span>${txt}</span>`; tipEl.style.left=Math.min(innerWidth-260,Math.max(8,bb.left-110))+'px'; tipEl.style.top=(bb.top-64)+'px'; tipEl.classList.add('show'); });
$('#rpMarks').addEventListener('pointerout',()=>tipEl.classList.remove('show'));
addEventListener('keydown',e=>{ if(!RP.on||document.activeElement===q) return;
  if(e.key==='Escape'){ e.preventDefault(); e.stopImmediatePropagation(); exitReplay(); }
  else if(e.key===' '){ e.preventDefault(); $('#rpPlay').click(); }
  else if(e.key==='ArrowLeft'&&document.activeElement!==$('#rpRange')){ rpSeek(RP.T-5); rpUI(true); }
  else if(e.key==='ArrowRight'&&document.activeElement!==$('#rpRange')){ rpSeek(RP.T+5); rpUI(true); } },true);

/* ---------- v36: suara suasana (WebAudio sintetis, tanpa file audio) ----------
   Dengung kota, hujan, angin, guntur, bip mundur truk terdekat, gemuruh & klakson KRL, kicau burung pagi, jangkrik malam.
   Volume mengikuti jarak sumber ke titik pandang kamera dan tingkat zoom. Default mati; status disimpan di browser. */
const SND={on:false,ctx:null,n:{},lastFlash:0,trainPh:['',''],birdT:3};
try{ SND.want=localStorage.getItem('lumbung.sound')==='1'; }catch(_){}
function sndInit(){ if(SND.ctx) return SND.ctx; const AC=window.AudioContext||window.webkitAudioContext; if(!AC) return null; const c=new AC(); SND.ctx=c;
  const master=c.createGain(); master.gain.value=0; master.connect(c.destination); SND.master=master;
  const buf=c.createBuffer(1,c.sampleRate*2,c.sampleRate), d=buf.getChannelData(0); let b=0; for(let i=0;i<d.length;i++){ d[i]=Math.random()*2-1; } SND.noise=buf;
  const bro=c.createBuffer(1,c.sampleRate*2,c.sampleRate), e=bro.getChannelData(0); for(let i=0;i<e.length;i++){ b=(b+0.02*(Math.random()*2-1))/1.02; e[i]=b*3.5; } SND.brown=bro;
  const loop=(bufr,filters,gain)=>{ const src=c.createBufferSource(); src.buffer=bufr; src.loop=true; let node=src; for(const f of filters){ node.connect(f); node=f; } const g=c.createGain(); g.gain.value=0; node.connect(g); g.connect(master); src.start(); return g; };
  const flt=(type,f,q=0.7)=>{ const x=c.createBiquadFilter(); x.type=type; x.frequency.value=f; x.Q.value=q; return x; };
  SND.n.city=loop(SND.brown,[flt('lowpass',380)]); SND.n.rain=loop(SND.noise,[flt('highpass',1400),flt('lowpass',7000)]);
  SND.n.wind=loop(SND.noise,[flt('bandpass',480,0.6)]); SND.n.train=loop(SND.brown,[flt('lowpass',140)]);
  SND.n.cricket=loop(SND.noise,[flt('bandpass',4600,18)]);
  { const o=c.createOscillator(); o.type='square'; o.frequency.value=1150; const f=flt('lowpass',2400), g=c.createGain(); g.gain.value=0; o.connect(f); f.connect(g); g.connect(master); o.start(); SND.n.beep=g; }
  return c; }
function sndSet(g,v,t=0.25){ if(g) g.gain.setTargetAtTime(v,SND.ctx.currentTime,t); }
function sndOneShot(kind,vol=1,delay=0){ const c=SND.ctx; if(!c||vol<0.01) return; const t0=c.currentTime+delay;
  if(kind==='thunder'){ const s=c.createBufferSource(); s.buffer=SND.brown; const f=c.createBiquadFilter(); f.type='lowpass'; f.frequency.value=220; const g=c.createGain();
    g.gain.setValueAtTime(0,t0); g.gain.linearRampToValueAtTime(0.9*vol,t0+0.08); g.gain.exponentialRampToValueAtTime(0.001,t0+3.2); s.connect(f); f.connect(g); g.connect(SND.master); s.start(t0); s.stop(t0+3.3); }
  else if(kind==='horn'){ for(const fr of [349,440]){ const o=c.createOscillator(); o.type='sawtooth'; o.frequency.value=fr; const f=c.createBiquadFilter(); f.type='lowpass'; f.frequency.value=1300; const g=c.createGain();
      g.gain.setValueAtTime(0,t0); g.gain.linearRampToValueAtTime(0.09*vol,t0+0.05); g.gain.setValueAtTime(0.09*vol,t0+0.9); g.gain.linearRampToValueAtTime(0,t0+1.15); o.connect(f); f.connect(g); g.connect(SND.master); o.start(t0); o.stop(t0+1.2); } }
  else if(kind==='chime'){ [659,523,587,392].forEach((fr,i)=>{ const o=c.createOscillator(); o.type='sine'; o.frequency.value=fr; const g=c.createGain(), t=t0+i*0.42;
      g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(0.12*vol,t+0.02); g.gain.exponentialRampToValueAtTime(0.001,t+1.1); o.connect(g); g.connect(SND.master); o.start(t); o.stop(t+1.2); }); }
  else if(kind==='bird'){ const o=c.createOscillator(); o.type='sine'; const g=c.createGain(), f0=2600+Math.random()*1400, n=2+Math.floor(Math.random()*3);
    for(let i=0;i<n;i++){ const t=t0+i*0.13; o.frequency.setValueAtTime(f0,t); o.frequency.exponentialRampToValueAtTime(f0*1.35,t+0.07); g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(0.035*vol,t+0.015); g.gain.linearRampToValueAtTime(0,t+0.09); }
    o.connect(g); g.connect(SND.master); o.start(t0); o.stop(t0+n*0.13+0.1); } }
function setSound(on){ SND.want=on; try{ localStorage.setItem('lumbung.sound',on?'1':'0'); }catch(_){}
  $('#soundBtn').setAttribute('aria-pressed',String(on)); if(on){ const c=sndInit(); if(!c){ showToast('Browser ini tidak mendukung suara','#B76E00'); return; } c.resume&&c.resume(); }
  SND.on=on&&!!SND.ctx; if(SND.master) sndSet(SND.master,on?0.7:0,0.3); }
$('#soundBtn').onclick=e=>{ e.stopPropagation(); setSound(!SND.want); if(SND.want) showToast('Suara suasana menyala · M untuk matikan','#2E5BFF'); };
$('#soundBtn').setAttribute('aria-pressed',String(!!SND.want));
/* browser butuh interaksi pengguna sebelum audio boleh berbunyi */
addEventListener('pointerdown',()=>{ if(SND.want&&!SND.on) setSound(true); },{once:true,capture:true});
addEventListener('keydown',e=>{ if((e.key==='m'||e.key==='M')&&!e.ctrlKey&&!e.metaKey&&document.activeElement!==q&&!(document.activeElement&&/INPUT|TEXTAREA/.test(document.activeElement.tagName))) setSound(!SND.want); });
function sndTick(dt){ if(!SND.on||!SND.ctx) return; const T=cam.target, H=82/cam.zoom, near=clamp((cam.zoom-0.4)/1.6,0,1);
  const dist=(x,z)=>Math.hypot(x-T.x,z-T.z,H*0.6), fall=(d,r)=>clamp(1-d/r,0,1);
  const w=Store.weather.condition, hour=Store.clock.hour, night=hour<5||hour>=19;
  sndSet(SND.n.city,(CLEAN?0.05:0.09)*(0.4+WX.density*0.8)*(0.6+0.4*near)*(RP.on?0.6:1),0.8);
  sndSet(SND.n.rain,(ENV.rain||0)*0.32,0.6);
  sndSet(SND.n.wind,(w==='sandstorm'?0.5:w==='storm'?0.28:(Store.weather.windKmh||8)>30?0.12:0.015),1.2);
  sndSet(SND.n.cricket,night&&w!=='rain'&&w!=='storm'?0.05*(0.5+0.5*Math.sin(performance.now()/180)):0,0.05);
  if(ENV.flash>0.9&&SND.lastFlash<0.5) sndOneShot('thunder',0.8,0.5+Math.random()*1.2); SND.lastFlash=ENV.flash;
  /* bip mundur: truk mundur terdekat */
  let best=0; for(const [t,L] of LAMP_ST){ if(!L.truck||!L.rev) continue; const s=t.site; if(!s) continue; best=Math.max(best,fall(dist(t.pos.x+s.ox,t.pos.z+s.oz),70)); }
  const on=(performance.now()%900)<450; sndSet(SND.n.beep,best*0.05*(on?1:0),0.012);
  /* KRL: gemuruh, klakson saat berangkat, bel stasiun saat tiba */
  let tr=0; RAIL.trains.forEach((t,i)=>{ if(!t.st) return; const ph=t.st.ph, d=dist(clamp(T.x,t.x-80,t.x+80),t.z);
    if(ph!=='luar'&&ph!=='berhenti') tr=Math.max(tr,fall(d,260)*(0.3+0.7*t.st.v/RAIL.v));
    if(ph!==SND.trainPh[i]){ if(ph==='berangkat') sndOneShot('horn',fall(d,320)); if(ph==='berhenti') sndOneShot('chime',fall(dist(RAIL.stX,RAIL.z),260)); SND.trainPh[i]=ph; } });
  sndSet(SND.n.train,tr*0.5,0.4);
  /* burung pagi saat cerah */
  SND.birdT-=dt; if(SND.birdT<=0){ SND.birdT=1.5+Math.random()*4; if(hour>=5.3&&hour<10&&(w==='clear'||w==='cloudy')) sndOneShot('bird',0.6+0.4*near); } }

/* ---------- v36: mode foto ---------- */
const PHOTO={on:false};
function startPhoto(){ if(PHOTO.on) return; stopCine(); if(RP.on) exitReplay(); closeMenus&&closeMenus(); $('#envMenu').hidden=true; select(null); PHOTO.on=true; document.body.classList.add('photo'); }
function stopPhoto(){ if(!PHOTO.on) return; PHOTO.on=false; document.body.classList.remove('photo','photo-labels'); $('#pbLabels').setAttribute('aria-pressed','false'); }
function takePhoto(){ renderer.render(scene,camera); const src=renderer.domElement, W=src.width, H=src.height, cv=document.createElement('canvas'); cv.width=W; cv.height=H; const x=cv.getContext('2d');
  x.drawImage(src,0,0); const s=S_(), k=Math.max(1,W/1600), pad=28*k;
  const g=x.createLinearGradient(0,H-150*k,0,H); g.addColorStop(0,'rgba(10,15,40,0)'); g.addColorStop(1,'rgba(10,15,40,.55)'); x.fillStyle=g; x.fillRect(0,H-150*k,W,150*k);
  x.fillStyle='#fff'; x.font=`800 ${30*k}px "Plus Jakarta Sans",system-ui,sans-serif`; x.textBaseline='alphabetic'; x.fillText('Lumbung',pad,H-pad-30*k);
  x.font=`600 ${17*k}px "Plus Jakarta Sans",system-ui,sans-serif`; x.fillStyle='rgba(255,255,255,.85)';
  x.fillText(`${s.name} · ${hhmm(Store.clock.hour)} · ${Store.weather.label}`,pad,H-pad);
  x.textAlign='right'; x.fillStyle='rgba(255,255,255,.7)'; x.fillText('lumbung.fusionify.id',W-pad,H-pad);
  const a=document.createElement('a'); a.download=`lumbung-${s.id}-${hhmm(Store.clock.hour).replace(':','')}.png`; a.href=cv.toDataURL('image/png'); document.body.appendChild(a); a.click(); a.remove();
  const f=$('#photoFlash'); f.classList.add('on'); requestAnimationFrame(()=>requestAnimationFrame(()=>f.classList.remove('on'))); showToast('Foto disimpan ke folder unduhan','#16A34A'); }
{ const _select=select; select=(r,...a)=>PHOTO.on&&r?null:_select(r,...a); } /* mode foto: klik peta tidak memilih objek */
$('#pbShot').onclick=e=>{ e.stopPropagation(); takePhoto(); };
$('#pbExit').onclick=e=>{ e.stopPropagation(); stopPhoto(); };
$('#pbLabels').onclick=e=>{ e.stopPropagation(); const on=!document.body.classList.contains('photo-labels'); document.body.classList.toggle('photo-labels',on); e.currentTarget.setAttribute('aria-pressed',String(on)); };
addEventListener('keydown',e=>{ const ae=document.activeElement; if(ae===q||(ae&&/INPUT|TEXTAREA/.test(ae.tagName))||e.ctrlKey||e.metaKey) return;
  if(e.key==='p'||e.key==='P'){ PHOTO.on?stopPhoto():startPhoto(); }
  else if(PHOTO.on&&e.key==='Escape'){ e.preventDefault(); stopPhoto(); }
  else if(PHOTO.on&&e.key==='Enter'){ e.preventDefault(); takePhoto(); } });
let last=performance.now(), uiT=0, fno=0, tiltB=-1; const simAcc=new Map();
function frame(now){
  const rdt=Math.max(0,(now-last)/1000), dt=Math.min(0.05,rdt); last=Math.max(last,now); fno++;
  if(RP.on){ rpStep(Math.min(rdt,0.1)); if(fno%6===0) rpUI(); }
  else if(!SIM_PAUSED){
  tickClock(dt);
  SITES().forEach((s,i)=>{ if(!LOWPOWER||i===active){ simSite(s,dt); return; } const a=(simAcc.get(s.id)||0)+dt; if(fno%2===i%2){ simSite(s,Math.min(a,0.1)); simAcc.set(s.id,0); } else simAcc.set(s.id,a); });
  for(const st of stores()) simStore(st,dt);
  simCity(dt);
  recordTick(dt);
  }
  syncView(dt,now); updateWeather(Math.min(rdt,0.25),now); sndTick(Math.min(rdt,0.25));
  const k=reduceMotion?1:Math.min(1,dt*6);
  if(cine.on) stepCine(Math.min(rdt,0.1));
  else if(cine.phiBack){ cam.phi+=(0.66-cam.phi)*Math.min(1,dt*2); if(Math.abs(cam.phi-0.66)<0.002){ cam.phi=0.66; cine.phiBack=false; } }
  if(cine.on){}
  else if(cam.flight){ const F=cam.flight; F.t=Math.min(1,F.t+Math.min(rdt,0.25)/F.dur); const e=ease(F.t);
    cam.target.lerpVectors(F.from,F.to,e); cam.zoom=lerp(F.z0,F.z1,e)*(F.dip?1-Math.sin(Math.PI*F.t)*0.35:1); cam.zoomGoal=F.z1; if(F.t>=1) cam.flight=null; }
  else { cam.zoom+=(cam.zoomGoal-cam.zoom)*k; if(follow&&sel&&!(sel.kind==='truck'&&sel.state==='away')){ cam.target.lerp(worldPos(sel),Math.min(1,dt*2.5)); } }
  if(!cine.on) cam.theta+=(cam.thetaGoal-cam.theta)*k;
  applyCam();
  /* tilt-shift ikut zoom: makin dekat, makin terasa seperti maket */
  { const tb=Math.round(clamp((cam.zoom-0.6)/0.9,0.45,1.7)*10)/10; if(tb!==tiltB){ tiltB=tb; document.documentElement.style.setProperty('--tilt',tb); } }
  camera.getWorldDirection(tmp); const dx=tmp.x,dy=tmp.y,dz=tmp.z;
  for(const h of View.holds){ h.disc.quaternion.copy(camera.quaternion); h.disc.position.set(-dx*0.45,0.78-dy*0.45,-dz*0.45); }
  if(selVis&&!reduceMotion) selVis.children[1].material.opacity=0.75+Math.sin(now/1000*4)*0.25;
  if(sel&&sel.kind==='pallet'&&!Store.get('pallets',sel.id)){ sel=null; clearSelVis(); document.body.classList.remove('has-sel'); }
  if(selVis&&sel&&sel.kind==='pallet'){ const v=View.pallets.get(sel.id); if(v&&selVis.parent!==v.mesh) v.mesh.add(selVis); }
  updateRoute();
  if(!tableOpen&&(!SIM_PAUSED||fno%20===0)) renderer.render(scene,camera); /* saat uji mandiri, render jarang supaya uji cepat */
  drawLabels();
  uiT+=dt; if(uiT>0.5){ uiT=0; refreshUI(); }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
/* ---------- v40: tema terang / gelap / ikuti sistem ---------- */
function applyTheme(pref,save=true){ THEME.pref=pref; const r=document.documentElement; if(pref==='auto') delete r.dataset.theme; else r.dataset.theme=pref;
  if(save) try{ localStorage.setItem('lumbung.theme',pref); }catch(_){}
  const dk=isDark(); THEME_U.want=dk?1:0; for(const t of THEMED) t.m.color.copy(C(cssVar(t.v)));
  const bg=cssVar('--bg'); renderer.setClearColor(new THREE.Color(bg)); scene.fog.color=C(bg);
  const mt=document.querySelector('meta[name="theme-color"]'); if(mt) mt.content=dk?'#10162E':'#2E5BFF';
  const tb=$('#themeBtn'); if(tb){ tb.setAttribute('aria-pressed',dk); tb.title=dk?'Tema gelap aktif · klik untuk terang':'Tema terang aktif · klik untuk gelap'; }
  refreshUI(true); }
MQ_DARK.addEventListener('change',()=>{ if(THEME.pref==='auto') applyTheme('auto',false); });
$('#themeBtn').onclick=()=>{ applyTheme(isDark()?'light':'dark'); if(!$('#envMenu').hidden) renderEnvMenu(); showToast(isDark()?'Tema gelap aktif':'Tema terang aktif','#2E5BFF'); };
THEME_U.uDark.value=THEME_U.want=isDark()?1:0; applyTheme(THEME.pref,false);

/* ---------- v40: tur perkenalan ---------- */
const TOUR_STEPS=[
  {title:'Selamat datang di Lumbung',body:'Pusat kendali lima gudang dan dua toko dalam satu peta 3D. Truk datang lewat tol, forklift bongkar-muat, pekerja bergantian shift, semuanya bergerak sendiri. Tur ini kira-kira satu menit.'},
  {title:'Peta 3D',body:'Seret untuk menggeser, gulir atau cubit untuk zoom. Klik truk, forklift, palet, dock, atau pekerja untuk melihat detailnya.',hint:'map'},
  {t:['.sitewrap'],title:'Pilih gudang',body:'Pindah antar gudang dari sini. Tombol panah di sebelahnya langsung ke gudang berikutnya, dan kamera terbang ke lokasinya.'},
  {t:['.kpis'],title:'Angka utama',body:'Stok, truk di lokasi, dan ketepatan waktu untuk gudang yang sedang dipilih, lengkap dengan tren singkatnya.'},
  {t:['#detail'],title:'Panel detail',body:'Isinya mengikuti apa yang dipilih: gudang, truk, forklift, palet, atau pekerja. Truk yang sedang dimuat bisa diarahkan ke toko atau gudang lain dari sini.'},
  {t:['#ops','#opsToggle'],title:'Operasi',body:'Daftar dock, forklift, dan truk beserta statusnya. Klik satu baris untuk langsung fokus ke objeknya.'},
  {t:['.mapctl'],title:'Kontrol peta',body:'Zoom, putar kamera, tampilan bersih, mode sinematik, cuaca, suara, tema, dan putar ulang 10 menit terakhir.'},
  {t:['#bell'],title:'Peringatan',body:'Truk tertahan, stok menipis, baterai forklift lemah, atau truk mogok muncul di sini, lengkap dengan tombol tindakan.'},
  {t:['#wxBtn','#stormBtn'],title:'Waktu, cuaca & tema',body:'Ubah jam dan cuaca untuk melihat dampaknya ke operasi, pilih tema terang atau gelap, buka mode foto, atau ulangi tur ini.'},
  {t:['.search'],title:'Cari apa saja',body:'Tekan / lalu ketik nomor truk, palet, pengiriman, atau nama pekerja.',bodyM:'Ketuk kaca pembesar lalu ketik nomor truk, palet, pengiriman, atau nama pekerja.'},
  {title:'Siap memantau',body:'Tur bisa diulang kapan saja dari menu Waktu & cuaca atau dengan tombol ?. Selamat bekerja, semoga truknya tidak ada yang mogok.'}];
const TOUR={on:false,i:0,steps:[],el:null,raf:0};
const tourVis=sel=>{ const e=document.querySelector(sel); if(!e) return null; const r=e.getBoundingClientRect(), cs=getComputedStyle(e); return r.width>4&&r.height>4&&cs.display!=='none'&&cs.visibility!=='hidden'?e:null; };
function startTour(){ if(TOUR.on||RP.on||PHOTO.on) return; stopCine(); closeMenus(); $('#envMenu').hidden=true;
  TOUR.steps=TOUR_STEPS.filter(st=>!st.t||st.t.some(tourVis)); TOUR.on=true; TOUR.i=0; document.body.classList.add('touring');
  const el=document.createElement('div'); el.id='tour'; el.setAttribute('role','dialog'); el.setAttribute('aria-modal','true'); el.setAttribute('aria-labelledby','tourT');
  el.innerHTML='<div class="tspot none"></div><div class="tcard"><small id="tourN"></small><h3 id="tourT"></h3><p id="tourB"></p><div class="tmap" aria-hidden="true"><span>Seret</span><span>Gulir / cubit</span><span>Klik objek</span></div><div class="tnav"><button class="tskip">Lewati</button><span></span><button class="tprev">Kembali</button><button class="tnext pri">Lanjut</button></div></div>';
  document.body.appendChild(el); TOUR.el=el;
  el.querySelector('.tskip').onclick=()=>endTour(); el.querySelector('.tprev').onclick=()=>tourGo(TOUR.i-1); el.querySelector('.tnext').onclick=()=>tourGo(TOUR.i+1);
  tourGo(0); const loop=()=>{ if(!TOUR.on) return; tourPlace(); TOUR.raf=requestAnimationFrame(loop); }; loop(); }
function tourGo(i){ if(i>=TOUR.steps.length) return endTour(); TOUR.i=Math.max(0,i); const st=TOUR.steps[TOUR.i], el=TOUR.el, n=TOUR.steps.length;
  if(st.t&&st.t[0]==='#detail'&&!sel) refreshUI(true);
  el.querySelector('#tourN').textContent=`${TOUR.i+1} dari ${n}`; el.querySelector('#tourT').textContent=st.title; el.querySelector('#tourB').textContent=(phoneUI()&&st.bodyM)||st.body;
  el.querySelector('.tmap').hidden=st.hint!=='map'; el.querySelector('.tprev').hidden=TOUR.i===0;
  const nx=el.querySelector('.tnext'); nx.textContent=TOUR.i===n-1?'Selesai':TOUR.i===0?'Mulai tur':'Lanjut'; el.querySelector('.tskip').hidden=TOUR.i===n-1;
  TOUR.target=st.t?st.t.map(tourVis).find(Boolean):null; el.classList.toggle('center',!TOUR.target); tourPlace(true); nx.focus({preventScroll:true}); }
function tourPlace(){ const el=TOUR.el; if(!el) return; const sp=el.querySelector('.tspot'), cd=el.querySelector('.tcard'), vw=innerWidth, vh=innerHeight, G=16, cw=cd.offsetWidth, ch=cd.offsetHeight;
  const t=TOUR.target; if(!t||!t.isConnected){ sp.classList.add('none'); cd.style.left=Math.round((vw-cw)/2)+'px'; cd.style.top=Math.round(Math.max(G,(vh-ch)/2))+'px'; return; }
  const r=t.getBoundingClientRect(), pad=6, x=r.left-pad, y=r.top-pad, w=r.width+pad*2, h=Math.min(r.height+pad*2,vh-y-G);
  sp.classList.remove('none'); Object.assign(sp.style,{left:x+'px',top:y+'px',width:w+'px',height:h+'px'});
  /* kartu: di bawah target bila cukup ruang, lalu di atas, lalu di samping (kiri/kanan), selalu di dalam layar */
  let L,T; if(y+h+12+ch<=vh-G){ T=y+h+12; L=x+w/2-cw/2; } else if(y-12-ch>=G){ T=y-12-ch; L=x+w/2-cw/2; }
  else if(x-12-cw>=G){ L=x-12-cw; T=y+h/2-ch/2; } else { L=x+w+12; T=y+h/2-ch/2; }
  cd.style.left=Math.round(clamp(L,G,vw-cw-G))+'px'; cd.style.top=Math.round(clamp(T,G,vh-ch-G))+'px'; }
function endTour(){ if(!TOUR.on) return; TOUR.on=false; cancelAnimationFrame(TOUR.raf); document.body.classList.remove('touring'); TOUR.el&&TOUR.el.remove(); TOUR.el=null;
  try{ localStorage.setItem('lumbung.tour','1'); }catch(_){} }
addEventListener('keydown',e=>{ const ae=document.activeElement;
  if(TOUR.on){ e.stopImmediatePropagation(); if(e.key==='Escape'){ e.preventDefault(); endTour(); } else if(e.key==='ArrowRight'){ e.preventDefault(); tourGo(TOUR.i+1); } else if(e.key==='ArrowLeft'){ e.preventDefault(); tourGo(TOUR.i-1); }
    else if(e.key==='Tab'){ const bs=[...TOUR.el.querySelectorAll('button')].filter(b=>!b.hidden); const k=bs.indexOf(ae); e.preventDefault(); bs[(k+(e.shiftKey?-1:1)+bs.length)%bs.length].focus(); } return; }
  if(e.key==='?'&&ae!==q&&!(ae&&/INPUT|TEXTAREA/.test(ae.tagName))){ e.preventDefault(); startTour(); } },true); /* capture: selama tur, pintasan lain (P, M, /) tidak ikut jalan */
/* pengunjung pertama: tur dibuka otomatis setelah dunia siap (tidak saat uji mandiri, putar ulang, atau mode foto) */
{ let seen=false; try{ seen=localStorage.getItem('lumbung.tour')==='1'; }catch(_){} if(!seen&&!QS.has('selftest')&&!QS.has('notour')) setTimeout(()=>{ if(!TOUR.on&&!PHOTO.on&&!RP.on&&!cine.on) startTour(); },1400); }
})();
</script>
</body>
</html>
