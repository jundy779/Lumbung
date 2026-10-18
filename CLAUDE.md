# CLAUDE.md · Peta Teknis Lumbung v31

Dokumen ini adalah "otak cadangan" proyek Lumbung. Ditulis dari pembacaan penuh seluruh `src/` (3.434 baris), uji jalan di Chromium headless (desktop 1440×900 dan ponsel 390×844), dan simulasi headless 30 serta 150 menit. Taruh file ini di root repo supaya sesi AI berikutnya langsung paham tanpa membaca ulang 320 KB kode.

Patokan versi: `package.json` 28.0.0, CHANGELOG terakhir v28.3 (17 Okt 2026). Kalau kode berubah, perbarui bagian yang terdampak, terutama nomor baris.

**Hubungan dengan `KONTEKS-PROYEK.md`:** dokumen itu ringkasan resmi proyek (aturan kerja, invariant keselamatan §11, pelajaran dari bug §14, backlog §15). `CLAUDE.md` ini pelengkapnya: peta kode yang lebih rinci dengan nomor baris, temuan audit, dan resep pengembangan. Kalau keduanya bertentangan soal aturan kerja, `KONTEKS-PROYEK.md` yang berlaku.

**Perubahan v31 (19 Okt 2026), Tahap 3 KPI khas per gudang**:
- `c_sim.js` (sebelum `simSite`): `KPI_COLD`, `kpiAct(h)`, `initMetrics(site)`, `metricsTick(site,dt)` (dipanggil di akhir `simSite`), hook `kpiOnDock` (reverse→docked), `kpiOnPull` (docked→pull), `kpiOnLoad` (palet masuk trailer), `kpiOnUnload` (palet masuk slot, set `pallet.inT`), `kpiHourVal`, `median`, `kpiSummary(site)`.
- Data: `site.t` (detik simulasi per site) dan `site.metrics` (hidden). Isi per profil: cold `temp/open/hours[24]`, dc `recent/hours[24]`, crossdock `transit[≤16]`, robotic `heat{g:Float32Array,cols,rows,x0,z0}` + `util` (EMA 2 menit), semua profil `dwell[≤12]`. Bucket jam `{s,w,seed}`; `seed:true` = perkiraan riwayat dari `rng(SEED^strHash(site.id))`, **bukan RAND**, supaya sidik jari simulasi tidak berubah (tetap `d15e868a`).
- Model suhu: `dT/dt = -(T+19)/150 + 0.0036·pintuTerbuka`. Batas aman −20 s/d −17 °C.
- `SCHEMA.sites` punya field `kpi` (dari `kpiSummary`). Pemeriksa ke-16 `kpi` di `makeSafetyChecker`. Harness Node mencetak `kpi` per site.
- `e_ui.js`: `profileLine` memakai `kpiSummary`; `kpiBlock(s)` (bagian "Kinerja khas" di panel gudang, setelah grid2), helper `kBars`, `kAxisY`, `barD`, `kCard`, `kLegend`, `drawHeat(s)` (kanvas, dipanggil setelah `renderDetail` mengisi innerHTML). Tooltip grafik: atribut `data-tip="judul|keterangan"` + listener delegasi di `#detail` yang memakai `#hoverTip`; kelas `.flip` membuka ke kiri di tepi kanan.
- `esc()` kini deklarasi fungsi (ter-hoist), karena render pertama terjadi sebelum baris definisinya.
- Ponsel: ketuk gedung → kelas body `site-sheet` menampilkan panel gudang (sebelumnya panel gudang tidak pernah tampil di ponsel).
- CSS grafik: `.kcard`, `.kchart` (`.kb`, `.kb.sd`, `.kl`, `.kband`, `.kref`, `.khit`), `.klg`, `.kheat`, `.kempty` di shell.html.

**Perubahan v30 (19 Okt 2026)**:
- `a_core.js`: `QS` (parameter URL), `SEED`, `SEEDED`, `RAND = rng(SEED)`. **Aturan: semua keputusan acak di b_layout & c_sim wajib lewat `RAND()`**, bukan `Math.random()` (View/UI boleh `Math.random`). `pick()` memakai `RAND` sebagai default. Di Node, seed dari global `__LUMBUNG_SEED`.
- Jam mode tetap maju dengan akumulasi `dt` (`Store.clock.el`), bukan `performance.now()`.
- Akhir `c_sim.js`: `SAFETY_LABELS`, `makeSafetyChecker()` (15 pemeriksaan, hanya membaca Store), `selftestInit({jam,cuaca})`, `selftestStep(dt,C)`, `simFingerprint()`.
- `e_ui.js`: `SIM_PAUSED` (frame loop tidak menjalankan simulasi saat uji), `runSelftest()` untuk `?selftest&menit=&jam=&seed=`, hasil di `window.__selftest`, helper `esc()`, baris "Seed simulasi" + salin tautan di menu Waktu & Cuaca.
- `tests/headless-sim.mjs [menit] [seed] [jam]`: pemanasan identik dengan startup aplikasi, lalu pemeriksa yang sama; exit code 1 bila gagal. Sidik jari Node = browser untuk seed/menit/jam yang sama (terbukti: `d15e868a` untuk 2 menit, seed 7, siang).
- Lalu lintas (`stepTraffic`): kunci persimpangan dilepas hanya bila lampu **persimpangan itu sendiri** merah (`redSigs`), sebelumnya lampu merah di persimpangan berikutnya dalam 45 m ikut melepas kunci; keputusan kuning (6 m/s²) / merah (8 m/s²) + `c.commit`; `exitRoom()` = aturan jangan menutup persimpangan (memprediksi lampu saat tiba dan antrean di seberang; saat kuning berkedip, persimpangan berikutnya yang terpakai dianggap titik berhenti); mobil yang badannya masih di persimpangan boleh merapat 4,4 m; `clearOfJunctions()` saat spawn; hijau masuk Jalan Lingkar 7 dtk.
- `crewDetour`: sampel jalur tiap 0,5 m sampai 8 m (sebelumnya 6 sampel di seluruh ruas, sehingga truk di depan sopir lolos).
- `PLANS.picker` dan `personStep`: tidak pernah meninggalkan antrean aksi kosong (sebelumnya crash di mode Siklus cepat).
- Temuan #5 (simulasi tanpa seed) dan #16 (nama perusahaan, kini "PT Fusionify Digital") selesai. Backlog B selesai.

**Perubahan v29 (18 Okt 2026)** yang memengaruhi isi dokumen ini:
- Data demo diganti angka Lumbung sendiri (sebelumnya identik dengan video konsep WareTrack). ID truk `TRK-{3104+i*59+idx*97}` (parkir `TRK-{4705+i*11+idx*23}`), ID kiriman `KRM-{24181..}` berurutan lewat `SHIP_SEQ` (b_layout.js).
- Three.js hanya dimuat sekali (baris duplikat di a_core.js dihapus). Temuan #1 dan #3 di bagian 11 sudah selesai.
- Tampilan awal lebih dekat: `HOME_ZOOM()` di e_ui.js (desktop 1,5, ponsel 0,82).
- Mode sinematik punya **mode cerita** (`storyCandidates`, `storyFrame`, `glide` di e_ui.js): ikuti satu truk dari tol sampai dock lalu forklift; pindah cerita bila truk diam > 10 dtk; perpindahan jauh dibatasi kecepatannya.
- Tilt-shift ikut zoom lewat variabel CSS `--tilt`; shadow map desktop 4096, frustum bayangan minimum 18.
- Plan pekerja baru `PLANS.picker` (c_sim.js) + 2 "Operator gudang" per site di area timur (rak, palet, krat), jauh dari forklift (uji: jarak minimum ≥16 m) dan truk.
- Properti halaman baru di `buildSiteView`: lampu halaman (ikut `View.lampPts`, menyala malam), kontainer kedua bertumpuk, hand pallet dekat rak.
- Populasi: 35 staf gudang (7 per site) + 14 warga + 50 sopir = 99 figur.
- Nomor baris di bawah mengacu ke v28.3. Di v29, e_ui.js bertambah ±45 baris mulai bagian sinematik, c_sim.js ±10 baris mulai `PLANS`.

## 0. Aturan kerja (wajib, dari KONTEKS-PROYEK.md §2)

1. Identitas commit: author & committer `jundy779 <54092710+jundy779@users.noreply.github.com>`.
2. **Jangan pernah menambahkan tag/atribusi AI di commit**: tidak ada `Co-authored-by` AI, tidak ada "Generated with", tidak ada link sesi.
3. Seluruh teks UI dan pesan commit dalam Bahasa Indonesia.
4. Edit di `src/`, lalu `npm run build`. Jangan mengedit `index.html` langsung.
5. Setiap perubahan perilaku simulasi wajib diuji terhadap invariant keselamatan (KONTEKS-PROYEK.md §11) sebelum di-push. Mulai dari `node tests/headless-sim.mjs 30`, lalu cek visual di browser.
6. Hindari dependensi baru. Aplikasi sengaja tanpa framework dan tanpa build saat runtime.
7. Perbarui `CHANGELOG.md` (dan `README.md` bila fitur baru) di setiap rilis.
8. Integrasi Claude API apa pun wajib memakai prompt caching (bagian 14).

---

## 1. Ringkasan satu paragraf

Lumbung adalah dashboard operasional gudang 3D isometrik milik FUSIONIFY (PT Fusionify Digital). Lima gudang dan dua toko tujuan hidup di satu peta kota fiktif area Bogor/Depok/Cikarang. Truk datang lewat Tol Jagorawi, mundur ke dock, dibongkar atau dimuat forklift, lalu mengantar ke toko atau keluar kota. Semua data masih **simulasi di browser**; tidak ada backend, tidak ada API, tidak ada database. Hasil build berupa satu file `index.html` yang memuat Three.js r128 dan font Plus Jakarta Sans dari CDN. Target deploy: `lumbung.fusionify.id`.

---

## 2. Struktur repo & build

| Path | Isi | Baris |
|---|---|---|
| `src/shell.html` | `<head>`, seluruh CSS (token warna, responsif, dark mode), markup UI statis, tag `<script>` Three.js | 554 |
| `src/a_core.js` | Pembuka `<script>` + `(async function(){`, utilitas, konfigurasi dunia, `SITE_CONFIG`, master data, **Store** (lapis Data), `SCHEMA` | 100 |
| `src/b_layout.js` | Pembuat record awal: palet, shipment, truk, site, orang, toko (`STORE_CONFIG`) | 140 |
| `src/c_sim.js` | **Simulator**: jalur, gerak, tabrakan, persimpangan, truk, sopir, forklift, pekerja, shift, lalu lintas, cuaca/waktu, router kota, pusat peringatan, pengarahan truk, simulasi toko | 894 |
| `src/d_part1.js` | **View 3D bagian 1**: renderer, kamera, geometri & material, `Parts`, `InstPool`, tekstur canvas, model truk/forklift/palet/orang/mobil, `buildCityView` | 618 |
| `src/d_part2.js` | **View 3D bagian 2**: `buildSiteView`, `bindEntities`, `syncView` per frame, picking, visual seleksi, efek cuaca & cahaya, `buildStoreView`, Tampilan Bersih | 543 |
| `src/e_ui.js` | **UI**: panel detail, pelacakan, tab operasi, KPI + sparkline, menu waktu/cuaca, tabel, pencarian, notifikasi/peringatan, sinematik, label, lalu **startup & frame loop**, penutup `})();</script></body></html>` | 585 |
| `build.mjs` | Menggabung 7 file di atas apa adanya (tanpa pemisah) ke `index.html` dan `public/index.html` | 12 |
| `index.html` | Hasil build (sudah dicek identik byte-per-byte dengan hasil `node build.mjs`) | 321 KB |
| `vercel.json` | `buildCommand: npm run build`, `outputDirectory: public`, header keamanan + cache 5 menit | |
| `_headers` | Header yang sama untuk Cloudflare Pages / Netlify | |
| `tests/headless-sim.mjs` | **Baru (ditambahkan saat audit)**: menjalankan lapis Data + Simulator di Node tanpa browser untuk uji invarian | |

Hal penting soal build:
- Urutan file di `build.mjs` **wajib** dipertahankan. Semua file berbagi satu scope fungsi `async` raksasa, jadi `const` di `a_core.js` terlihat di `e_ui.js`. Tidak ada modul, tidak ada import.
- `a_core.js` baris 1 dan `shell.html` baris 554 **sama-sama** memuat `three.min.js` → Three.js termuat dua kali (konsol: `WARNING: Multiple instances of Three.js being imported`). Hapus salah satu.
- `public/` ada di `.gitignore`; Vercel membuatnya lewat `npm run build`.
- Perintah: `npm run build` lalu `npm start` (`npx serve .`, port 3000). Butuh Node 18+ hanya untuk merakit.

---

## 3. Arsitektur empat lapis

```
Store (Data)  ◄──menulis── Simulator (c_sim)  ◄──perintah── UI (arahkan truk, cuaca, aksi peringatan)
     │
     ├──dibaca──► View3D (d_part1, d_part2)   syncView() tiap frame
     └──dibaca──► UI (e_ui)                    refreshUI() tiap 0,5 detik
```

Klaim desainnya: simulator bisa diganti adapter WMS/GPS tanpa menyentuh View dan UI. Kenyataannya **sebagian benar**. View hanya membaca Store, itu konsisten. Tetapi UI juga memanggil fungsi simulator secara langsung (`setTruckDest`, `destOptions`, `runAlert`, `openAlerts`, `setWeather`, `setTimeMode`, `reversePath`, `approachPath`, `departPath`, `storeTripPath`, `storeReversePath`, `highwayOutPath`, `ontimeNow`, `forkWorking`) dan membaca `ALERTS`/`ALERT_LOG` langsung (e_ui:366, 473). Lihat bagian 12 untuk daftar yang harus disediakan adapter.

---

## 4. Lapis Data: `Store` (a_core.js:65-82)

Tabel berupa `Map` dengan kunci `id`:
`stores, sites, docks, slots, pallets, trucks, forklifts, people, shipments, cars, signals`

API: `add(table,rec)`, `get(table,id)`, `all(table)`, `where(table,fn)`, `remove(table,id)`, `find(id)` (cari di semua tabel, urutan tabel di atas), `tableOf(rec)` (pakai `rec.kind`), `nextId(prefix)` (counter global mulai 1001), `emit(event)` + `on(fn)` untuk log kejadian (maks 60, `unread` bertambah tiap emit).

State global tambahan yang menempel di Store: `Store.weather` (c_sim:733), `Store.clock` (c_sim:735).

Pola relasi:
- `relate(obj,key,table,idKey)` membuat getter/setter non-enumerable. Contoh: `truck.bay` ↔ `truck.dockId`. Yang ikut ke JSON hanya ID.
- `hidden(obj,key,val)` membuat properti non-enumerable (array internal seperti `site.trucks`, `site.slots`, state sementara seperti `t.crew`, `t.dest`, `t.restPlan`).

**`SCHEMA` (a_core.js:88-98) adalah kontrak data publik.** Inilah yang muncul di tombol "Data mentah (JSON)" di panel detail dan bentuk yang semestinya dikirim backend nanti. Ringkas:

| Tabel | Field publik |
|---|---|
| stores | id, name, type, address, dockId, dockTruckId, receivingSlots[{code,palletId}], receivedToday, returnsToday |
| sites | id, name, type, address, capacity, stockOnHand, stockDelta, outboundToday, putawayToday, arrivalsToday, ontimePct, inventory[{item,qty}] |
| docks | id, siteId, label, truckId, doorState, trucksToday |
| slots | id, siteId, code, palletId, reserved |
| pallets | id, siteId, item, qty, kg, lot, received, packing, hold, location |
| trucks | id, siteId, carrier, driver, plate, state, mode, dockId, shipmentId, palletsDone, palletsTotal, cargo[], position{x,z}, heading, speedMs, rearDoors |
| forklifts | id, siteId, label, task, charging, battery, carryingPalletId, forkHeight, position, heading, speedMs, movesToday |
| people | id, siteId, name, role, shift, activity, position, speedMs |
| shipments | id, siteId, truckId, direction, customer, origin, destination, status, palletsTotal, createdAt |

Catatan: `cars` dan `signals` tidak punya schema publik (data lalu lintas dekoratif).

### Format ID
| Entitas | Pola | Contoh |
|---|---|---|
| Site | dari config | `BGR-01` |
| Toko | dari config | `TK-01` |
| Dock | `{site}-B{n}` | `BGR-01-B2`, toko: `TK-01-B1` |
| Slot staging | `{site}-S{A|B}{1-5}` | `BGR-01-SA3` |
| Forklift | `{site}-FL{n}` | `DPK-01-FL4`, toko: `TK-02-FL1` |
| Orang | `{site}-P{n}` / `KOTA-P{n}`, `n` counter global (tidak mulai ulang per site) | `BGR-01-P1`, `BGR-02-P6` |
| Truk | `TRK-{2051+i*77+idx*131}`, parkir `TRK-{2290+i*7+idx*40}` | `TRK-2128` (50 ID, sudah dicek unik) |
| Palet | `PLT-{seq}` | `PLT-1042` |
| Shipment | `#SHP-{78000..86999 acak}` | `#SHP-86579` (**bisa bentrok**, lihat isu) |
| Mobil | `CAR-{lane}-{i}` | |
| Lampu lalu lintas | `SIG-{x}_{z}` | |

---

## 5. Dunia & koordinat

Konstanta (a_core.js:34): `PX=100` (lebar blok kota), `PZ=76` (dalam blok), `ROAD=9`, `SW=3` (trotoar), `PH=1.01` (tinggi platform dock), `RT=7` (radius belok truk), `GY=0.06` (tinggi tanah).

- Grid kota: `GRID={x0:-2,x1:2,z0:-1,z1:2}` → 5×4 = 20 blok. Pusat blok di `(gx*100, gz*76)`.
- Jalan Lingkar Utara di `ZHW = -158.5`. Gerbang tol di `x=330`, jalan tol sampai `x=620` (`HWY`, c_sim.js:10). Truk spawn di `(620, ZHW+2.2)`.
- Setiap site/toko punya **koordinat lokal** sendiri. Group 3D site ditaruh di `(ox, oz)` dengan `ox = cx+1.75`, `oz = cz + 38 - (fz+21.8)`. Semua posisi entitas di Store (truk, forklift, orang) disimpan **dalam koordinat lokal site**. Dunia = lokal + `(ox,oz)`. Ini penting saat memasukkan GPS nyata.
- Tata letak lokal site (D = kedalaman gedung, `fz = D/2`):
  - Gedung berpusat di (0,0), muka dock menghadap +z di `z=fz`.
  - `zE = fz+3.4` tepi platform, `zDock = fz+6.6` posisi truk saat docked, `yardZ = zDock+6.4` jalur halaman tempat truk berhenti dan sopir membuka pintu belakang (pintu tidak pernah dibuka di jalan raya), `zc = fz+1.5` koridor forklift, `Zr = fz+19.6` jalan depan.
  - Bay ke-i: `x = (i-(n-1)/2)*3.6`.
  - Slot staging 2 baris × 5 kolom di barat gedung: `x = -W/2-2.6-c*1.75`, baris A `z=fz-2.4`, baris B `z=fz+5.0`. **Hanya 10 slot per gudang** (toko 6 slot).
  - Stasiun charger forklift: `x = -W/2-11.6-i*2.6`.
  - Pos Sopir (lounge 9 kursi/titik): `LX = -W/2-25.2`, `LZ = fz+4.2`.
  - Palet QC hold 2 buah di timur gedung, pos satpam di gerbang.
- Penempatan saat ini:

| ID | Nama | Profil | gx,gz | W×D×H | Bay | Forklift | Atap | Kapasitas |
|---|---|---|---|---|---|---|---|---|
| BGR-01 | Hub Cibinong | general | 0,0 | 16×9×4,6 | 3 | 2 | gable + annex | 1.800 |
| BGR-02 | Cross-Dock Sentul | crossdock | 1,0 | 26×10×4,5 | 5 | 3 | saw | 1.200 |
| BKS-01 | DC Cikarang | dc | -1,0 | 24×12×5,4 | 4 | 3 | gable + annex | 4.200 |
| BGR-03 | Gudang Dingin Cileungsi | cold | 0,1 | 20×12×5,0 | 3 | 2 | flat | 1.400 |
| DPK-01 | Hub Robotik Depok | robotic | 1,1 | 28×12×5,6 | 5 | 4 | saw | 2.600 |
| TK-01 | Segar Mart (Supermarket) | toko | 2,0 | 14×10 | 1 | 1 | | |
| TK-02 | Nusantara Plaza (Mal) | toko | -1,1 | 22×12 | 1 | 1 | | |

Populasi saat jalan: 50 truk (per site `bays+4` aktif + 2 parkir), 16 forklift, 39 orang (25 staf gudang + 14 warga kota) + 50 rig sopir = 89 figur, 160 mobil (10 lajur × 16), 36 lampu lalu lintas (30 di perempatan grid + 6 di jalan lingkar).

### Batasan penempatan (hasil hitung, tidak tertulis di kode)
Router truk hanya mengenal node `RX=[-150,-50,50,150]` dan `RZ=[ZHW,-114,-38,38,114,190]` (c_sim.js:763).
- Gudang yang mengirim ke toko butuh `gx*100+50 ∈ RX` **dan** untuk retur `gx*100-50 ∈ RX` → **gudang baru hanya aman di gx = -1, 0, atau 1**. Di gx=2, `storeTripPath` mengembalikan `null` dan truk diam-diam berangkat lewat tol. Di gx=-2, antar ke toko jalan, tetapi `storeToHomePath` gagal sehingga truk pulang lewat tol sambil masih membawa palet retur.
- Toko butuh `gx*100-50 ∈ RX` → toko di gx = -1, 0, 1, atau 2.
- Syarat tambahan untuk pasangan gudang-toko: jalan timur-barat hanya ada di jalan lingkar, `route` tidak mengizinkan putar balik, dan `storeTripPath` selalu mulai menghadap utara. Jadi **toko tidak boleh berada di kolom gx_gudang+1 dengan gz lebih besar (lebih ke selatan) dari gudang** (contoh gagal: gudang (1,0) ke toko (2,1)). Ke-10 pasangan yang ada sekarang sudah dicek berhasil.
- `gz*76+38` harus ada di RZ → gz = -1, 0, 1, 2 semua aman.
- Mau memperluas kota? Ubah `GRID`, `RX`, `RZ`, `CAR_H`, `CAR_V`, `NAMES_H/V` (d_part1.js:580) sekaligus.

---

## 6. Simulator (c_sim.js)

### 6.1 Gerak dasar
- Jalur = polyline dengan panjang kumulatif (`finalize`, `polyPath` membulatkan sudut dengan kurva kuadratik, `arcPts`, `linePts`). `samplePath(P,s)` memakai cache indeks `P.ci` (selalu kembalikan `P.ci` setelah sampling tambahan, pola ini dipakai di mana-mana).
- `moveStep(e,dt,block)` (c_sim:65): akselerasi/deselerasi ke batas kecepatan, perlambat di tikungan (`vturn`), berhenti sebelum jarak `block`. Kecepatan dikali `WX.speed` (truk), `WX.fork*paceMul` (forklift).
- Tabrakan: tiap entitas punya "circ" (lingkaran sepanjang badan). `TRUCK_CIRC` 3 lingkaran r 1,06; forklift 3; orang 1 r 0,34. `lookAhead` / `lookAheadTruck` menyapu jalur ke depan per 0,35 m dan mengembalikan jarak bebas. Truk dicek lintas site dalam koordinat dunia (`cwW`). Jarak antre `FOLLOW_GAP=2,2` m kecuali saat manuver presisi.

### 6.2 Persimpangan (c_sim:93-138)
- `JUNC` berisi node di setiap perempatan grid + node `H{kx}` di jalan lingkar. Tiap node punya `occ` (kendaraan yang sedang di dalam + kode gerakannya) dan `q` (antrean).
- Kode gerakan: lurus `S{x|z}{arah}`, belok `T{in}{out}`. Boleh berbarengan hanya kalau gerakannya identik atau sama-sama lurus di sumbu yang sama.
- Truk baru masuk kalau `exitFree` (ada ruang seukuran badan di seberang). Mobil memakai sistem yang sama (`stepTraffic`).
- Lampu: siklus 28 detik (H hijau 0-9, kuning sampai 11,5; V hijau 14-23, kuning sampai 25,5). Jalan lingkar 30 detik dengan gelombang hijau. Pukul 22.00-05.00 semua kuning berkedip (`WX.flash`).

### 6.3 Mesin status truk (`truckStep`, c_sim:359-472)

```
away ─(wait habis, planMode ada, bay bebas, spawn kosong ≤22 m)─► dispatch() ─► inbound ─► toll_in ─► approach ─► prep
prep (sopir turun buka pintu belakang) ─► reverse ─► docked
docked ─(done>=total, sopir di kabin, region bebas)─► pull ─► close (sopir tutup pintu)
close ─┬─(t.dest = toko & rute ada)─► to_store ─► store_prep ─► store_reverse ─► store_docked
       └─► depart ─► toll_out ─► highway ─► goAway() ─► away
store_docked (bongkar, lalu muat retur bila ada) ─► store_pull ─► store_close
store_close ─┬─(ada retur & bay bongkar di gudang asal)─► approach (pulang bawa retur)
             └─► leave ─► toll_out ─► highway ─► away
parked: 2 truk statis per site (dekorasi + target cek QC)
```

Angka penting: kecepatan maks inbound 11, approach 9 (8 untuk truk yang pulang membawa retur), reverse 2,1, pull 1,6, depart 7,5, to_store/leave 8, highway 11 (m/s simulasi; UI menampilkan `v*5` km/j).

Aturan khusus:
- `planMode(site)` memilih muat/bongkar dari perkiraan isi slot (`expectedOcc`), 2-6 palet per truk (maks 5 saat ada `site.bias`, maks 4 untuk muatan ke toko), ikut `site.bias` dari aksi peringatan. Profil `dc` condong ke muat.
- `freeBayFor`: profil crossdock memaksa bay `i < ceil(n/2)` hanya bongkar, sisanya hanya muat.
- `dispatch`: 85% truk muat diberi tujuan toko bila ada toko kosong (`freeStore`). Toko hanya menerima 1 truk sekaligus (`store.bays[0].truckId`).
- Truk muat yang kehabisan stok (`starve`) berangkat dengan muatan parsial setelah 25 detik.
- Profil `cold`: setelah docked ada `coldCheck` 5,5-7,5 detik (pintu harus terbuka penuh) sebelum forklift boleh mulai. Suhu hasil cek -19,2 s/d -17,8 °C.
- Pengaman macet: truk diam > 300 detik di status jalan langsung di-`goAway` (teleport keluar). Uji headless 30 menit: maksimum macet 24 detik, jadi pengaman ini jarang terpakai.
- `close` untuk truk bongkar memanggil `applyRestock(site)` (restock yang dipesan lewat peringatan baru masuk di sini).

### 6.4 Sopir truk (`t.crew`, c_sim:226-358)
Sub-mesin di dalam truk. Tugas: `door` (turun → jalan ke belakang → dorong pintu → balik → naik), `rest` (ke Pos Sopir, duduk/ngobrol/ngopi/telepon, balik saat muatan ≥ 80%), `wait` (menunggu di samping truk saat di toko). Saat sopir di luar, truk lain menganggapnya penghalang. Ada logika anti-bolak-balik: setelah tertahan 2,5 detik sopir mencari jalan memutar lewat ujung truk (`crewDetour`), dan menyingkir bila terlalu dekat badan truk.

### 6.5 Forklift (c_sim:474-560)
Antrean aksi `f.q`: `travel` (dipecah `buildTravel` jadi: klaim koridor `span` → mundur ke koridor `zc` → `do onExit` → maju ke tujuan → `unspan`), `span`, `unspan`, `do`, `wait`, `lift`, `path`.
- `decide`: baterai < 25 atau `forceCharge` → ke charger; ada pekerjaan → `startJob`; selain itu pulang ke stasiun.
- `findJob`: truk docked dengan pintu terbuka, belum di-assign forklift lain, diurutkan progres terendah.
- Muat: ambil palet di slot → taruh di `trailerSpot` (2 kolom × 3 baris di trailer). Bongkar: kebalikannya. Tiap pindah: baterai -1,5, `site.stockDelta` ±1.
- Charging +2,2%/detik sampai 92%. Pemecah deadlock koridor setelah tertahan 4 detik.
- `paceMul`: cold 0,85, crossdock 1,1, robotic 1,12.

### 6.6 Pekerja & shift
`PLANS`: `supervisor` (patroli bay, pose clipboard/point), `patrol` (satpam keliling pagar), `loop` (warga kota), `qc` (inspeksi palet hold & truk parkir). Shift pagi 06-18, malam 18-06 (`shiftAt`). Saat pergantian: satpam jalan ke pos gerbang, pose `chat` 3,2 detik, lalu nama/seragam/kulit ditukar (`swapShift`). Forklift ikut ganti shift saat siaga.

### 6.7 Waktu & cuaca
- `TIME_MODES`: `live` (jam WIB asli), `pagi` 07.00, `siang` 12.30, `sore` 17.24, `malam` 22.00, `cycle` (24 jam dalam 8 menit). Mode jam tetap (pagi/siang/sore/malam) tidak beku: jamnya tetap maju sesuai waktu nyata sejak dipilih.
- Kepadatan lalu lintas per jam (`trafficDensity`) memengaruhi kecepatan truk, frekuensi kedatangan, dan on-time.
- `WEATHER` (c_sim:725): clear, cloudy, rain, storm, fog, sandstorm dengan pengali `speed`, `fork`, `arrive`, `ontime`. `applyWX()` menggabungkan cuaca + lalu lintas ke objek global `WX`.
- `ontimeNow(site) = ontimePct + efek cuaca + efek lalu lintas`, dibatasi 80-99,6. Angka ini **formula kosmetik**, bukan hasil hitung pengiriman.

### 6.8 Router kota & pengarahan truk (c_sim:762-884)
- `route(start, heading, goalFn)`: pencarian biaya terendah (Dijkstra sederhana, `open.sort` tiap langkah) di graf RX×RZ, tanpa putar balik, penalti belok 25.
- `storeTripPath`, `storeToHomePath`, `storeToTollPath`, `redirectPath` membangun jalur dunia lalu dikonversi ke lokal site asal truk (`toLocal`).
- `destOptions(t)`: truk muat di `docked/pull/close` boleh pilih toko atau "Luar kota"; truk `to_store` boleh dialihkan ke toko lain. `setTruckDest` mengunci dock toko. Pengalihan saat jalan ditunda (`pendingDest`) sampai truk tidak berada di area persimpangan.

### 6.9 Pusat peringatan (c_sim:783-827)
`alertsTick` jalan tiap 1,2 detik. Peringatan yang kondisinya hilang otomatis ditutup ke `ALERT_LOG` (maks 25).

| ID | Kondisi buka (histeresis) | Aksi | Efek aksi |
|---|---|---|---|
| `stuck:{truk}` | macet > 60 dtk (tetap terbuka selama > 5) | Lihat truk; "Alihkan ke toko lain" hanya muncul bila truk sedang `to_store` dan ada toko lain kosong | `setTruckDest` |
| `starve:{truk}` | docked muat, `starve` > 10 dtk | Berangkatkan (n palet) | `t.total = done+pending` |
| `full:{site}` | slot ≥ 90% (tutup < 70%) | Prioritaskan muat 10 mnt | `site.bias={mode:'load',t:600}` |
| `empty:{site}` | slot ≤ 10% (tutup > 30%) | Prioritaskan bongkar 10 mnt | `site.bias={mode:'unload',t:600}` |
| `stock:{site}:{item}` | `inv.qty < 300` | Pesan restock | `i.restock=600`, masuk saat truk bongkar berikutnya selesai |
| `bat:{forklift}` | baterai < 26 (tutup ≥ 30) | Isi daya sekarang | `f.forceCharge=true` |
| `wx` | storm / fog / sandstorm | Kembalikan cerah | `setWeather('clear')` |

Semua peringatan juga punya tombol ✓ (`ack`) yang menandai "sedang ditindaklanjuti". Peringatan kritis baru memunculkan toast (interval 1 detik di e_ui:473).

### 6.10 Simulasi toko (`simStore`, c_sim:886)
Forklift toko membongkar ke slot, palet non-retur "terjual" setelah 14 detik (dihapus), dan tiap 25 detik muncul palet retur baru bila retur < 2.

---

## 7. View 3D (d_part1.js, d_part2.js)

- Renderer: `WebGLRenderer` antialias, sRGB, `PCFShadowMap`. `LOWP`/`LOWPOWER` (pointer kasar, lebar < 820, atau CPU ≤ 4 core) menurunkan pixel ratio ke 1,5, shadow map 1024, tanpa bayangan palet/orang, dan mensimulasikan site yang tidak dilihat bergantian frame.
- Kamera perspektif FOV 26 mengorbit `cam.target` (`theta`, `phi`, `zoom` 0,4-3,4, jarak `82/zoom`). Matahari ikut target kamera supaya shadow map tetap tajam.
- **Strategi draw call** (target ponsel ≤ 150):
  - `Parts`: menggabungkan banyak kotak/silinder statis jadi **satu mesh** dengan vertex color. Seluruh gedung, platform, marka, pohon per site jadi segelintir mesh.
  - `InstPool`: `InstancedMesh` dengan alokasi/rilis slot. Palet (base 420, box 4.200, tape 3.600, blob 900, film 400), orang (14 pool bagian tubuh, kapasitas `2n+16`), mobil (body + detail, 160), motor, lampu lalu lintas, titik jalur AGV (160).
  - `Sprites`: billboard instanced untuk lampu malam, uap gudang dingin, debu, lampu kendaraan.
  - Cache geometri `gR` (rounded box) dan material `M`.
- Semua model dibuat dari kode (tidak ada file aset). Tekstur dibuat di `<canvas>`: logo trailer per carrier, papan nama gedung, rambu jalan (atlas 1024²), gantry tol, jendela, aspal.
- **Picking**: kotak tak terlihat di `layers 1` dengan `userData.ref = {table,id}` (`tagRef`). `recordAt(x,y)` raycast lalu kembalikan record Store. Klik slot berarti memilih palet di slot itu.
- **Palet sepenuhnya ditentukan `pallet.location`** (`palletTarget`, d_part2:220): `slot` / `hold` / `fork` (menempel ke garpu forklift) / `truck` (posisi `cargoPos(index)` di trailer). Pindah lokasi = re-parent mesh.
- `syncView` (d_part2:265) setiap frame: transform truk + pintu + roda + kemudi + opasitas (`presence` untuk fade in/out di tol), sopir, titik jalur AGV (profil robotic), forklift (siang/malam beda model), orang (`animPerson` dengan pose: sit, sitchat, chat, phone, drink, push, clipboard, point, look), pintu dock (gulung), kipas, uap, palang tol, pin hold, mobil/motor, warna lampu lalu lintas, palet.
- `updateWeather`: interpolasi palet waktu `DAYKEYS` + `WXLOOK`, kabut, kilat badai, hujan (LineSegments), debu & kabut tanah, lampu jalan dan dock saat gelap, lampu & sorot kendaraan.
- **Tampilan Bersih** (`applyClean`): menyembunyikan `View.clutter` (gedung kota, rambu, marka, mobil parkir) dan lalu lintas.

---

## 8. UI (e_ui.js)

State modul: `active` (indeks site), `sel` (record terpilih), `follow`, `showData`, `tableOpen`, `tableTab`, `tab`, `notifTab`, `CLEAN`, `UISCALE`, `cine`.

| Bagian | Fungsi render | Catatan |
|---|---|---|
| Panel detail kanan | `renderDetail` (e_ui:113) | Varian: site (default), store, truck (+ kartu "Arahkan pengiriman" `destBlock`), forklift, dock, pallet, person, shipment. Tombol `<>` menampilkan `publicRecord` JSON |
| Kartu pelacakan bawah | `renderTrack` | 5 langkah, waktu langkah adalah perkiraan `minsFrom` (kosmetik) |
| Tab Dock/Forklift/Truk | `renderOps` | Pada layar 821-1280 px atau tinggi ≤ 820 dilipat jadi tombol "Operasi" |
| KPI atas + sparkline | `renderKPIs`, `renderSparks` | Riwayat sparkline awal = random walk ber-seed, lalu ditambah sampel tiap 3 detik |
| Menu Waktu & Cuaca | `renderEnvMenu` | Termasuk saklar Tampilan Bersih dan Ukuran tampilan |
| Tabel data | `renderTable` | 6 tab: trucks, docks, forklifts, pallets, shipments, sites |
| Lonceng | `renderNotif` | Tab Peringatan / Aktivitas, lencana jumlah peringatan terbuka |
| Pencarian `/` | `searchIndex`, `renderResults` | Site, toko, truk, forklift, dock, palet, shipment, pekerja; maks 8 hasil |
| Sinematik | `cineCandidates`, `pickShot`, `stepCine` | Shot berbobot `score^1.6`, 8-12 detik per shot |
| Label & rute | `drawLabels`, `updateRoute` | Label HTML diproyeksikan dari 3D; rute truk terpilih = titik instanced + ring tujuan |

- `refreshUI()` dipanggil tiap 0,5 detik; panel yang sedang di-hover/fokus tidak dirender ulang (`paused`).
- Kelas `body`: `has-sel`, `ops-open`, `table-open`, `cine`, `lowp`, `ui-s`, `ui-l`.
- `localStorage`: `lumbung.uiScale` (`s`/`auto`/`l`), `lumbung.clean` (**default `'1'`**, jadi pengunjung pertama selalu masuk Tampilan Bersih dengan waktu dipaksa Siang dan cuaca Cerah, bukan jam WIB live).
- Pengguna yang tampil di bar atas ("Rina Hartono · Manajer Operasional") dan avatarnya statis.

### Breakpoint CSS utama (shell.html)
- `≤ 820px`: mode ponsel (detail jadi sheet bawah, ops lewat tombol, kartu pelacakan disembunyikan, toast pindah ke atas).
- `821-1280px`: laptop dengan scaling (panel 330 px, KPI tanpa sparkline).
- `max-height 820/700/620`: penyesuaian layar pendek, `#ui{zoom:.9}` di bawah 620.
- `≥ 1640×940`, `≥ 1820×1020`, `≥ 2300×1260`: UI di-zoom 1,06 / 1,12 / 1,28.
- Dark mode: token CSS ada, tetapi banyak warna hardcode (splash, shiftbar, toast, peringatan) sehingga dark mode belum konsisten.

---

## 9. Urutan startup & frame loop (e_ui.js:539-582)

1. `createSite` ×5, `createStore` ×2, `populateSite`, `seedDocks` (sebagian dock langsung terisi), `initTraffic`, `initCityWalkers`.
2. **Pemanasan**: 1.500 langkah × 1/12 detik (≈125 detik simulasi) untuk semua site & toko, lalu `stockDelta` dan `arrivals` dikembalikan. Lalu 300 langkah `simCity`. Ini memblok main thread sebelum dunia 3D dibangun.
3. Kosongkan log, catat stok menipis, `Store.unread=2`.
4. `buildCityView`, `buildSiteView` ×5, `buildStoreView` ×2, `bindEntities`, `initWeatherFX`.
5. Terapkan preferensi Tampilan Bersih, posisikan kamera, `syncView`, hapus layar loading, `refreshUI(true)`.
6. `frame(now)`: `dt` dibatasi 0,05 → `tickClock` → `simSite` (bergiliran di LOWPOWER) → `simStore` → `simCity` (termasuk `alertsTick`) → `syncView` → `updateWeather` → kamera (sinematik / flight / follow) → `updateRoute` → render (dilewati saat tabel terbuka) → `drawLabels` → `refreshUI` tiap 0,5 detik.

Hasil uji headless (Chromium + SwiftShader, CPU render jadi lebih lambat dari perangkat nyata): layar loading hilang ±21 detik di desktop 1440×900, ±7 detik di 390×844. Tidak ada error JavaScript. Satu-satunya peringatan konsol: Three.js dimuat ganda.

---

## 10. Resep pengembangan

### Menambah gudang
1. Tambah objek ke `SITE_CONFIG` (a_core.js:35) dengan `gx` ∈ {-1,0,1} dan `gz` yang belum dipakai site/toko, lalu cek syarat pasangan gudang-toko (bagian 5). Isi `bays`, `forks`, `roof` (`gable`/`saw`/`flat`), `annex`, `capacity`, `stock`, `ontimePct`, `ontimeDelta`, `inventory`.
2. Tambah ke `SITE_PROFILE` kalau perlu profil khusus.
3. Lebar gedung harus muat di blok: `W` + area staging di barat (±25 m untuk Pos Sopir) tidak boleh melewati `bounds`.
4. Cek pencarian, menu site, dan sinematik otomatis ikut karena membaca `SITES()`.
5. Jalankan `node tests/headless-sim.mjs 30` untuk memastikan truk tidak macet.

### Menambah toko
Tambah ke `STORE_CONFIG` (b_layout.js:113) dengan `gx` ∈ {-1,0,1,2}, dan jangan taruh di kolom gx_gudang+1 di sebelah selatan gudang mana pun (bagian 5). Warna `color` dipakai papan nama & aksen. `freeStore`, `destOptions`, dan kartu "Arahkan pengiriman" otomatis menampilkannya.

### Menambah profil gudang baru
Sentuhan wajib: `SITE_PROFILE`, `PROFILE_UNIFORM` (b_layout:95), `FORK_LOOK` (d_part1:272), `paceMul` (b_layout:82), `buildSiteView` (dekorasi per `prof`), `profileLine` (e_ui:256), opsional `planMode`/`freeBayFor`/`findJob` untuk aturan operasi.

### Menambah jenis peringatan
Di `alertsTick`: hitung kondisi, panggil `upAlert(id,{sev:'crit'|'warn'|'info', kind, title, detail, siteId, ref, actions:[{id,label,primary,run:()=>'pesan toast'}]})`. Kalau aksi sudah dijalankan dan kondisi masih ada, set `a.state='done'` dan `a.doneLabel`. Penutupan otomatis sudah ditangani.

### Menambah cuaca
`WEATHER` + `WX_ORDER` (c_sim), `WXLOOK` (d_part2:421), daftar `WXL` di `alertsTick` bila perlu peringatan, efek partikel di `updateWeather`.

### Menambah kolom tabel / field publik
Ubah `SCHEMA` (kontrak data) dan `TABLES` (e_ui:299) bersamaan.

### Uji simulator (wajib sebelum push perubahan perilaku)
```bash
node tests/headless-sim.mjs 13 7 siang    # menit, seed, jam (siang|pagi|sore|malam|cycle)
node tests/headless-sim.mjs 13 7 malam
node tests/headless-sim.mjs 13 7 cycle
node tests/headless-sim.mjs 30 11 siang   # ketahanan
```
Atau di browser: `index.html?selftest&menit=13&jam=malam&seed=7`. Untuk menyelidiki kegagalan, ulangi seed yang sama: hasilnya identik. Menambah invariant baru: tambahkan label di `SAFETY_LABELS` dan pemeriksaannya di `check()` dalam `makeSafetyChecker`.

---

## 11. Temuan audit (urut prioritas)

| # | Prioritas | Temuan | Lokasi | Saran |
|---|---|---|---|---|
| 1 | ✅ Selesai v29 | Three.js dimuat dan dieksekusi dua kali (unduhan kedua biasanya dari cache, tetapi parse + eksekusi ±600 KB terjadi dua kali; konsol: "Multiple instances") | shell.html:554 & a_core.js:1 | Hapus baris 1 di a_core.js |
| 2 | Tinggi (saat data nyata masuk) | Hampir semua render memakai `innerHTML` dengan string data tanpa escape (nama, ID, item, alamat, teks kejadian). Aman selama data dari config sendiri, berbahaya begitu data datang dari WMS/API | e_ui.js (15 titik `innerHTML`), hanya `dataBlock` yang escape `<` | Buat helper `esc()` dan pakai di semua template sebelum integrasi |
| 3 | ✅ Selesai v29 | ID shipment acak 9.000 kemungkinan. Saat bentrok, `Store.add` **menimpa** shipment lama dan dua truk berbagi satu record. Terbukti: 1 tabrakan dalam simulasi 150 menit | b_layout.js:17 | Pakai `Store.nextId('SHP')` atau counter khusus |
| 4 | Sedang | Tiga konsep "stok" yang tidak saling terhubung: `site.stock+stockDelta` (angka KPI, kapasitas ribuan), `inv[].qty` (unit per barang, **tidak pernah berkurang**, hanya bertambah saat restock), dan 10 slot staging fisik yang menggerakkan simulasi | a_core:100, b_layout:43, c_sim:181 | Satukan model sebelum integrasi WMS. Akibat sekarang: 6 peringatan "stok menipis" selalu ada sejak awal |
| 5 | ✅ Selesai v30 | Simulasi memakai `Math.random` di banyak tempat (dispatch, planMode, shipment, sopir), jadi kasus langka tidak bisa diulang | c_sim (banyak), b_layout | Suntik RNG ber-seed lewat satu `RAND` global; sudah ada `rng(seed)` |
| 6 | Sedang | Panel notifikasi dirender ulang tiap 0,5 detik saat terbuka; klik bisa hilang kalau DOM diganti di antara pointerdown dan click | e_ui.js:247 → `renderNotif` | Render ulang hanya bila daftar peringatan berubah (bandingkan hash) |
| 7 | Rendah | Pemanasan 1.500 langkah memblok main thread sebelum render pertama | e_ui.js:542 | Pecah per chunk dengan `await` atau jalankan di Web Worker |
| 8 | Rendah | Default `lumbung.clean='1'` memaksa mode Siang + Cerah, jadi fitur Real-time WIB dan lalu lintas kota tidak terlihat di kunjungan pertama | e_ui.js:548 | Keputusan produk: pertimbangkan default live |
| 9 | Rendah | Waktu toast peringatan kritis memakai jam nyata (`new Date()`), sedangkan log memakai jam simulasi | e_ui.js:473-476 | Kirim `a.t` ke `showToast` |
| 10 | Rendah | Dua listener `pointermove` mengatur kursor dengan cara berbeda (class `hover` vs `style.cursor`) | e_ui.js:341, 466 | Satukan |
| 11 | Rendah | Kode mati: `makeGlowPointsOld`, `bodyHit`, `offsetPoly`, `labelTex`, `ribMat`, `SEVL`, `_I`, `ACT_LABEL`, `DIRV`, blok `if(cine.on){}`; `LOWP` dan `LOWPOWER` duplikat | beberapa | Bersihkan saat refactor modul |
| 12 | Rendah | Dark mode belum konsisten (warna hardcode di splash, shiftbar, toast, kartu peringatan) | shell.html | Pindahkan ke token CSS |
| 13 | Rendah | Pencarian di ponsel hampir tak terpakai (placeholder terpotong jadi 1 huruf di 390 px) | shell.html @820 | Ikon kaca pembesar yang membuka overlay pencarian |
| 14 | Info | README menyebut "~310 KB", hasil build sekarang 321 KB; README menyebut tabel hasil uji otomatis, tetapi skrip ujinya tidak ada di repo (sekarang ada `tests/headless-sim.mjs` sebagai awal) | README | Perbarui |
| 15 | Info | Teks di trailer truk mencetak `lumbung.id/lacak`, sedangkan domain resmi `lumbung.fusionify.id` | d_part1.js:166 | Samakan, atau pastikan domain itu memang dimiliki |
| 16 | ✅ Selesai v30 (PT Fusionify Digital) | README (baris 7 & 289), `package.json`, dan KONTEKS-PROYEK.md menulis "PT Fusionify Digital Group", sedangkan nama badan hukum FUSIONIFY yang dipakai di materi lain adalah "PT Fusionify Digital Store" | README, package.json | Pastikan mana yang benar lalu samakan |
| 17 | Info | Salinan kerja di zip punya `src/shell.html`, `CHANGELOG.md`, dan `index.html` ber-CRLF (Windows), sedangkan repo `jundy779/Lumbung` menyimpan LF. Isinya sama, tetapi `git status` menganggap 3 file berubah total dan `index.html` hasil build jadi campuran CRLF/LF | root | Tambah `.gitattributes` berisi `* text=auto eol=lf` |
| 18 | ✅ Selesai v30 | Tabel gudang di KONTEKS-PROYEK.md §7 mengosongkan kolom forklift untuk toko, padahal tiap toko punya 1 forklift `FL-T` (b_layout.js:135) yang membongkar dan memuat retur | KONTEKS-PROYEK.md | Koreksi tabelnya |
| 19 | Info | Angka on-time, ETA, langkah pelacakan, dan riwayat sparkline adalah formula/kosmetik, bukan dihitung dari data | c_sim:749, e_ui:99, 204, 227 | Tandai jelas sebagai demo atau hitung dari histori shipment |

Yang **sudah bagus** dan sebaiknya dipertahankan: pemisahan View yang hanya membaca Store, `SCHEMA` sebagai kontrak, `pallet.location` sebagai satu-satunya sumber posisi palet, instancing yang disiplin, histeresis di peringatan, dan aksesibilitas dasar (aria, `prefers-reduced-motion`, fokus keyboard, `/` untuk cari, Esc untuk tutup).

---

## 12. Jalan menuju data nyata (adapter)

Untuk mengganti simulator dengan WMS/GPS/WebSocket, adapter harus:
1. Mengisi tabel Store dengan record ber-`kind` yang benar dan memasang relasi (`relate`) seperti di `b_layout.js`. View membutuhkan field non-publik juga: `truck.presence`, `truck.doorsT`, `truck.cabDoor`, `truck.curv`, `truck.v`, `truck.rev`, `forklift.lift`, `person.pose`, `person.look`, dll.
2. Mengonversi posisi GPS ke **koordinat lokal site** (`x - site.ox`, `z - site.oz`) dalam meter, dengan orientasi peta kota fiktif. Butuh tabel kalibrasi per site.
3. Memakai nama status truk yang sama (`truckStatus`, `dockStatus`, cineCandidates, alertsTick, updateRoute bergantung pada string status).
4. Menyediakan pengganti fungsi yang dipanggil UI: `setTruckDest`, `destOptions`, `runAlert`/`openAlerts`, `truckEta`, `ontimeNow`, dan fungsi jalur untuk menggambar rute (`approachPath`, `reversePath`, `departPath`, `storeTripPath`, `highwayOutPath`, `storeReversePath`).
5. Memanggil `Store.emit({siteId, siteIdx, text, color, t, ref})` untuk log kejadian.

Saran desain: buat antarmuka `Source` dengan dua implementasi (`SimSource`, `LiveSource`), dan pindahkan semua pemanggilan simulator dari UI ke antarmuka itu.

---

## 13. Rekomendasi untuk pengembangan besar (urutan yang masuk akal)

1. **Rapikan fondasi**: hapus Three.js ganda, perbaiki ID shipment, tambah `esc()`. Kecil, aman, langsung terasa.
2. **Pindah ke ES module + Vite** (masih bisa menghasilkan satu file lewat plugin single-file). Ini prasyarat TypeScript dan pemecahan file 900 baris.
3. **RNG ber-seed + mode `?selftest`** di atas `tests/headless-sim.mjs`. Jadikan uji invarian bagian dari CI (tabrakan 0, macet < 60 dtk, cross-dock arah benar, cek suhu sebelum bongkar).
4. **Satukan model stok** (palet ↔ unit barang ↔ kapasitas) supaya KPI bermakna.
5. **Lapisan `Source`** (bagian 12) lalu integrasi data nyata atau "Toko Live" FUSIONIFY BOT seperti di peta jalan README.
6. **Upgrade Three.js** dari r128. Perubahan yang pasti kena: `renderer.outputEncoding`/`sRGBEncoding` → `outputColorSpace`/`SRGBColorSpace`, `texture.encoding` → `colorSpace`, `convertSRGBToLinear` tetap ada, pemakaian global `THREE` harus jadi import. Uji ulang `InstancedMesh.instanceColor` dan PMREM.
7. Fitur di peta jalan README: KPI khas per profil, check-in gerbang & area tunggu, pengiriman antar-gudang (butuh router dari site ke site, sekarang hanya site ↔ toko ↔ tol).

---

## 14. Aturan integrasi AI (Claude API): WAJIB pakai prompt caching

Keputusan pemilik proyek: setiap fitur AI di Lumbung (misalnya asisten "Tanya Lumbung", ringkasan peringatan, rekomendasi dispatch) **harus memakai prompt caching** supaya biaya hemat. Sumber: https://platform.claude.com/docs/en/build-with-claude/prompt-caching (dicek 18 Okt 2026).

### Arsitektur
- **Jangan panggil API dari browser.** Lumbung adalah file statis; API key yang ditaruh di `index.html` bisa dibaca siapa pun. Buat fungsi serverless Vercel (misalnya `api/tanya.js`) yang menyimpan key di Environment Variable `ANTHROPIC_API_KEY`, lalu UI memanggil `/api/tanya`.
- UI cukup mengirim pertanyaan + potongan data yang relevan dari `publicRecord()` (kontrak `SCHEMA`), bukan seluruh Store.

### Urutan prompt (cache dihitung dari depan: tools → system → messages)
1. `tools`: definisi tool tetap (jangan diubah antar request; perubahan apa pun di sini membatalkan semua cache).
2. `system`: instruksi + pengetahuan statis Lumbung (peran asisten, daftar site & profil, arti status truk, aturan peringatan, ringkasan `SCHEMA`). **Pasang `cache_control` di blok terakhir yang statis ini.**
3. `messages`: riwayat percakapan, lalu **snapshot data live di pesan user terakhir**, setelah breakpoint. Snapshot berubah tiap detik, jadi jangan pernah diletakkan sebelum breakpoint.

### Aturan supaya cache benar-benar kena
- Bagian statis harus ≥ **512 token** untuk Claude Opus 5.5 / Sonnet 5.5 / Haiku 5.5 (model lama 1.024-4.096). Di bawah itu, request tetap jalan tanpa cache dan tanpa error.
- Jangan masukkan jam, tanggal, ID acak, atau angka live ke `system`. Satu karakter beda = cache baru.
- Jaga `tool_choice`, keberadaan gambar, setelan thinking, dan `effort` tetap sama antar panggilan.
- TTL default 5 menit (`{"type":"ephemeral"}`), gratis diperpanjang tiap terbaca. Kalau jeda antar pertanyaan bisa lebih dari 5 menit, pakai `{"type":"ephemeral","ttl":"1h"}`.
- Maksimal 4 breakpoint. Untuk percakapan multi-turn paling gampang pakai **caching otomatis** (field `cache_control` di level atas request), plus satu breakpoint eksplisit di akhir `system`.
- Request paralel: tunggu respons pertama mulai keluar dulu, baru kirim sisanya, supaya semuanya membaca cache yang sama.
- Opsional: pre-warm saat halaman dibuka dengan `max_tokens: 0` dan breakpoint di prefix bersama.

### Biaya (relatif ke harga input normal)
Tulis cache 5 menit 1,25×, tulis cache 1 jam 2×, baca cache 0,1× (0,05× untuk Opus 5.5 dan Sonnet 5.5). Breakpoint sendiri gratis.

### Pantau
Catat `usage.cache_read_input_tokens` dan `usage.cache_creation_input_tokens` di log fungsi serverless. Kalau keduanya 0 terus, prefix-nya terlalu pendek atau ada yang berubah antar request. Total input = `cache_read + cache_creation + input_tokens`.

### Kerangka `api/tanya.js`
```js
// Vercel serverless function. Key di env ANTHROPIC_API_KEY, tidak pernah dikirim ke browser.
import { LUMBUNG_SYSTEM } from './lumbung-system.js'; // teks statis ≥512 token, tanpa jam/angka live

export default async function handler(req, res) {
  const { question, snapshot, history = [] } = req.body;
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-haiku-5-5',
      max_tokens: 800,
      cache_control: { type: 'ephemeral' },                       // caching otomatis untuk riwayat percakapan
      system: [{ type: 'text', text: LUMBUNG_SYSTEM, cache_control: { type: 'ephemeral', ttl: '1h' } }],
      messages: [...history, { role: 'user', content: `Data operasional saat ini (JSON):\n${JSON.stringify(snapshot)}\n\nPertanyaan: ${question}` }]
    })
  });
  const data = await r.json();
  console.log('cache', data.usage?.cache_read_input_tokens, data.usage?.cache_creation_input_tokens);
  res.status(r.status).json(data);
}
```
Catatan: `vercel.json` sekarang memakai `outputDirectory: public` untuk file statis; folder `api/` di root tetap dikenali Vercel sebagai serverless function. Batasi juga panjang pertanyaan dan pasang rate limit sederhana supaya kuota tidak dihabiskan orang lain.

---

## 15. Konvensi kode yang dipakai

- Gaya padat satu baris, nama pendek (`t` truk, `f` forklift, `s`/`site`, `st` toko, `P` path, `R` RNG). Pertahankan gaya ini saat menambal agar diff kecil, atau refactor sekaligus saat pindah modul.
- Teks UI, komentar, dan log dalam Bahasa Indonesia. Format angka `id-ID`.
- Warna merek: biru `#2E5BFF`; hijau OK `#178A55`; amber `#B76E00`; merah `#C93C3C`/`#DC2626`; ungu toko/retur `#7C3AED`.
- Kredit README: terinspirasi video konsep WareTrack, semua aset dibuat ulang dari nol. Jangan menyalin aset atau merek WareTrack.

---

## 16. Backlog dari sesi pengembangan sebelumnya (dicatat 18 Okt 2026)

### 16.1 Fitur yang sudah disepakati, belum dikerjakan
Urutan pengerjaan yang disarankan: **B → A → C → D**. Fondasi uji dulu, supaya fitur berikutnya tidak diam-diam merusak simulator.

**A. Tahap 3: KPI & grafik khas per gudang** ✅ selesai di v31 (lihat catatan v31 di atas)
- Sekarang: hanya satu baris `profileLine()` (e_ui.js:256), dan angkanya formula kosmetik (suhu = sinus + jumlah pintu terbuka, paket/jam = rumus dari stok).
- Butuh data riwayat: tambahkan ring buffer `site.metrics` yang diisi di `simSite()` tiap N detik simulasi, lalu grafik SVG di panel detail (pola `sparkPath` bisa dipakai ulang).
- Gudang Dingin: suhu ruang 24 jam, dihitung dari pintu dock yang terbuka (`doorState`) dan pemulihan pendingin.
- Cross-Dock: waktu transit butuh **cap waktu di palet** (`pallet.inT` saat dibongkar di bay inbound, dihitung saat dimuat di bay outbound). Palet sekarang tidak menyimpan riwayat.
- Hub Robotik: peta panas AGV = grid sel ±1 m yang mengakumulasi `f.pos` forklift, ditampilkan sebagai tekstur canvas di lantai atau mini-map di panel.
- DC: paket/jam dari laju `outToday` sungguhan, bukan rumus.

**B. Fondasi anti-bug: seed + `?selftest`** ✅ selesai di v30 (lihat catatan v30 di atas)
- Ada 28 pemanggilan `Math.random` di b_layout.js + c_sim.js. Ganti dengan satu RNG global `RAND = rng(seed)` dari `?seed=`. RNG lama tetap dipakai untuk hal kosmetik di View/UI (6 pemanggilan) supaya tidak mengganggu urutan angka simulasi.
- Mode uji harus memakai jam tetap (bukan `live`), karena `nowWIB()` ikut memengaruhi shift dan kepadatan lalu lintas.
- `?selftest`: jalankan simulasi dipercepat di browser dengan pemeriksa invarian yang ada di tabel README (tabrakan, zebra cross, pintu dibuka di jalan, arah cross-dock, cek suhu sebelum bongkar, tujuan pengarahan), lalu tampilkan hasil sebagai overlay. Logika pemeriksanya bisa dibagi dengan `tests/headless-sim.mjs`.

**C. Check-in gerbang & area tunggu truk**
- Sekarang truk langsung `toll_in → approach` ke bay, dan truk yang tidak dapat bay menunggu di luar peta (status `away`). Pos satpam (`site.gate`) hanya dekorasi; palang yang bergerak hanya di gerbang tol.
- Perlu status baru, misalnya `gate_checkin` (berhenti di palang, satpam mendekat, palang naik) dan `yard_wait` (parkir di area tunggu bila belum ada bay), plus palang di pos satpam per site.
- Hati-hati dengan sistem reservasi `canAcquire`/`resBlock`, klaim persimpangan, dan rute pejalan kaki satpam. Validasi dengan selftest dari B.

**D. Pengiriman antar-gudang + mengarahkan truk yang sedang datang**
- Router sekarang hanya site ↔ toko ↔ tol. Pintu masuk site di `(gx*100-50, gz*76+38)` sudah dipakai `storeToHomePath`, jadi rute site→site bisa disusun dari `route()` yang sama.
- **Hambatan terbesar**: posisi truk disimpan dalam koordinat lokal site asal, mesh-nya menempel di group site asal, dan forklift hanya melayani `site.trucks`. Kunjungan ke toko berhasil karena toko punya logika khusus (`st.trucks`, `simStore`). Untuk antar-gudang, pilihannya: (1) mekanisme "truk tamu" seperti toko, atau (2) refactor posisi truk ke koordinat dunia. Opsi 2 lebih bersih dan sekaligus membantu integrasi GPS (bagian 12).
- Mengarahkan truk yang sedang datang ke dock lain: perlu melepas reservasi bay lama (`bay.truck`, `t.res`, klaim persimpangan) dan menghitung ulang `approachPath`. Perhatikan batasan penempatan gx di bagian 5.

### 16.2 Ide yang pernah diusulkan, belum dipilih
- Bisnis: garis waktu & putar ulang kejadian (butuh B: seed + log event yang lengkap), laporan & ekspor PDF/Excel, analitik dock.
- UX: tombol mode gelap manual (token CSS sudah ada, tapi warna hardcode perlu dibereskan dulu, lihat temuan #12), tur perkenalan, pintasan keyboard lengkap, versi bahasa Inggris (semua teks sekarang hardcode di template).
- Suasana: lampu sein, rem, mundur (sudah ada `VLIGHT` untuk lampu depan/belakang, tinggal ditambah status), siluet Gunung Salak, KRL melintas, suara ambien, bloom lampu malam (butuh post-processing, berat untuk ponsel).
- Kehidupan: pekerja datang naik motor, istirahat siang, jas hujan saat hujan (`p.look` + `recolorPerson`), kejadian tak terduga seperti truk mogok (bisa memakai jalur peringatan `stuck`).
- Sinematik: shot bercerita mengikuti satu truk dari gerbang sampai dock, mode foto untuk materi promosi.

### 16.3 Batasan yang masih ada
- Data masih simulasi (bagian 12).
- Pengaman truk di zebra cross sudah ada, tapi belum bisa dibuktikan 100% tanpa seed (B).
- Tujuan pengiriman masih 2 toko + luar kota (D).
- Three.js masih r128 (bagian 13 poin 6).
