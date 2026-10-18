// Menjalankan lapis Data + Simulator Lumbung (a_core, b_layout, c_sim) di Node tanpa browser/3D.
// Dipakai untuk uji cepat invarian simulasi setelah mengubah c_sim.js.
// Pemakaian: node tests/headless-sim.mjs [menit_simulasi=30]
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const MIN = +(process.argv[2] || 30);
const src = f => readFileSync(new URL(`../src/${f}`, import.meta.url), 'utf8');
let core = src('a_core.js').split('\n').filter(l => !/^<script|^\(async function\(\)\{/.test(l)).join('\n');
const code = core + '\n' + src('b_layout.js') + '\n' + src('c_sim.js') + `
;(function(){
  const dups = []; const add0 = Store.add.bind(Store);
  Store.add = (t, r) => { if (Store.tables[t].has(r.id) && t === 'shipments') dups.push(r.id); return add0(t, r); };
  SITE_CONFIG.forEach((C,i)=>createSite(C,i)); STORE_CONFIG.forEach((C,i)=>createStore(C,i));
  const SITES=()=>Store.all('sites');
  SITES().forEach(populateSite); SITES().forEach(seedDocks); initTraffic(); initCityWalkers();
  setTimeMode('siang');
  const dt = 1/20, steps = Math.round(${MIN}*60/dt); let maxStuck = 0, maxStuckId = '', teleports = 0, minPickerFork = Infinity, minPickerTruck = Infinity;
  const seenStates = new Map(); let doneDeliveries = 0;
  const origGoAway = goAway;
  for (let k = 0; k < steps; k++) {
    tickClock(dt);
    for (const s of SITES()) simSite(s, dt);
    for (const st of stores()) simStore(st, dt);
    simCity(dt);
    for (const t of Store.tables.trucks.values()) {
      if (t.stuck > maxStuck) { maxStuck = t.stuck; maxStuckId = t.id + ' (' + t.state + ')'; }
      if (t.stuck > 299.9 && t.stuck < 300.1) teleports++;
      seenStates.set(t.state, (seenStates.get(t.state) || 0) + 1);
    }
    if (k % 10 === 0) for (const s of SITES()) for (const p of s.people) {
      if (p.role !== 'Operator gudang') continue;
      for (const f of s.forks) minPickerFork = Math.min(minPickerFork, Math.hypot(f.pos.x - p.pos.x, f.pos.z - p.pos.z));
      for (const t of s.trucks) if (t.solid) minPickerTruck = Math.min(minPickerTruck, Math.hypot(t.pos.x - p.pos.x, t.pos.z - p.pos.z));
    }
  }
  const ships = Store.all('shipments');
  globalThis.__report = {
    simMinutes: ${MIN},
    shipmentIdCollisions: dups.length,
    shipmentsInStore: ships.length,
    shipmentStatus: ships.reduce((a, s) => (a[s.status] = (a[s.status] || 0) + 1, a), {}),
    maxTruckStuckSec: Math.round(maxStuck), maxStuckTruck: maxStuckId,
    teleports,
    minOperatorToForkliftM: Math.round(minPickerFork * 10) / 10,
    minOperatorToTruckCenterM: Math.round(minPickerTruck * 10) / 10,
    openAlerts: openAlerts().map(a => a.title),
    alertLog: ALERT_LOG.length,
    pallets: Store.tables.pallets.size,
    outToday: SITES().map(s => s.id + ':' + s.outToday + '/' + s.putToday),
    stockPct: SITES().map(s => s.id + ':' + Math.round(s.slots.filter(x => x.occupied).length / s.slots.length * 100) + '%'),
  };
})();`;
const ctx = { console, Math, Date, performance, matchMedia: () => ({ matches: false, addEventListener() {} }) };
vm.createContext(ctx);
const t0 = Date.now();
vm.runInContext(code, ctx, { filename: 'lumbung-sim.js' });
console.log(JSON.stringify({ ...ctx.__report, wallMs: Date.now() - t0 }, null, 1));
