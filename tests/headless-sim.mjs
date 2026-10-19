// Uji simulator Lumbung tanpa browser: lapis Data + Simulator (a_core, b_layout, c_sim) dijalankan di Node.
// Memakai pemeriksa invariant yang SAMA dengan mode ?selftest di browser (makeSafetyChecker di c_sim.js).
//
// Pemakaian:
//   node tests/headless-sim.mjs [menit=13] [seed=7] [jam=siang]
//   node tests/headless-sim.mjs 30 123 malam
// Keluar dengan kode 1 bila ada invariant yang gagal, sehingga bisa dipakai sebelum push / di CI.
// Seed + menit + jam yang sama selalu menghasilkan sidik jari (fingerprint) yang sama.
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const MIN = +(process.argv[2] || 13), SEED = +(process.argv[3] || 7), JAM = process.argv[4] || 'siang';
const src = f => readFileSync(new URL(`../src/${f}`, import.meta.url), 'utf8');
const core = src('a_core.js').split('\n').filter(l => !/^<script|^\(async function\(\)\{/.test(l)).join('\n');
const code = core + '\n' + src('b_layout.js') + '\n' + src('c_sim.js') + `
;(function(){
  const dups = []; const add0 = Store.add.bind(Store);
  Store.add = (t, r) => { if (Store.tables[t].has(r.id) && t === 'shipments') dups.push(r.id); return add0(t, r); };
  SITE_CONFIG.forEach((C,i)=>createSite(C,i)); STORE_CONFIG.forEach((C,i)=>createStore(C,i));
  const SITES=()=>Store.all('sites');
  SITES().forEach(populateSite); SITES().forEach(seedDocks); initTraffic(); initCityWalkers();
  /* pemanasan sama persis dengan startup aplikasi (e_ui.js), supaya yang diuji kondisi yang dilihat pengguna */
  LUNCH_HOLD=true;
  for(let k=0;k<1500;k++){ for(const s of SITES()) simSite(s,1/12); for(const st of stores()) simStore(st,1/12); if(k%3===0) stepTraffic(1/4); }
  LUNCH_HOLD=false;
  for(let k=0;k<300;k++) simCity(1/15);
  const C = selftestInit({ jam: ${JSON.stringify(JAM)} });
  const dt = 1/15, steps = Math.round(${MIN}*60/dt);
  for (let k = 0; k < steps; k++) selftestStep(dt, C);
  const R = C.report();
  globalThis.__report = { seed: SEED, jam: ${JSON.stringify(JAM)}, pass: R.pass && dups.length === 0, fingerprint: simFingerprint(),
    ...R.metrics, shipmentIdCollisions: dups.length,
    kpi: Object.fromEntries(SITES().map(s => [s.id, kpiSummary(s)])),
    failed: R.rows.filter(r => !r.ok).map(r => ({ cek: r.label, jumlah: r.count, contoh: r.examples })),
    passed: R.rows.filter(r => r.ok).map(r => r.label) };
})();`;
const ctx = { console, Math, Date, performance, URLSearchParams, __LUMBUNG_SEED: SEED, matchMedia: () => ({ matches: false, addEventListener() {} }) };
vm.createContext(ctx);
const t0 = Date.now();
vm.runInContext(code, ctx, { filename: 'lumbung-sim.js' });
const rep = { ...ctx.__report, wallMs: Date.now() - t0 };
console.log(JSON.stringify(rep, null, 1));
console.log(rep.pass ? `\nLULUS · ${rep.passed.length} pemeriksaan · seed ${SEED} · ${MIN} menit (${JAM})` : `\nGAGAL · ${rep.failed.length} pemeriksaan · seed ${SEED}`);
process.exit(rep.pass ? 0 : 1);
