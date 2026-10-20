# Konteks Proyek — Lumbung

> Dokumen rujukan lengkap untuk pengembangan Lumbung di editor/IDE.
> Versi aplikasi saat dokumen ini ditulis: **v28.3** (17 Okt 2026).
> Jika editor-mu membaca file konteks tertentu secara otomatis (misalnya `AGENTS.md`), salin atau ubah nama file ini sesuai editornya.

---

## 1. Ringkasan

**Lumbung** adalah dashboard operasional gudang 3D isometrik milik **PT Fusionify Digital** (Bogor). Lima gudang dan dua toko disimulasikan dalam satu kota: truk datang lewat tol, masuk halaman gudang, mundur ke dock, dibongkar/dimuat forklift, lalu berangkat ke toko atau luar kota. Terinspirasi video konsep **WareTrack**, tetapi dibangun ulang dari nol — nama, logo, model, dan kode milik sendiri.

| | |
|---|---|
| Repo | https://github.com/jundy779/Lumbung (branch `main`) |
| Produksi | https://lumbung.fusionify.id (Vercel, build otomatis dari `main`) |
| Pemilik | jundy779 — Muhammad Jundy Rabbani |
| Arah jangka panjang | Tampilan 3D "Toko Live" untuk FUSIONIFY BOT (bot auto order Telegram) |

---

## 2. Aturan Kerja (wajib)

1. **Identitas commit:** author & committer `jundy779 <54092710+jundy779@users.noreply.github.com>`.
2. **Jangan pernah** menambahkan tag/atribusi AI di commit — tidak ada `Co-authored-by` AI, tidak ada "Generated with …".
3. **Bahasa:** seluruh teks UI dan pesan commit dalam **Bahasa Indonesia**.
4. **Edit di `src/`**, lalu jalankan `npm run build`. Jangan mengedit `index.html` langsung — itu hasil rakitan.
5. Setiap perubahan perilaku simulasi **wajib diuji** terhadap invariant keselamatan (§11) sebelum di-push.
6. Hindari dependensi baru. Aplikasi sengaja tanpa framework dan tanpa build saat runtime.
7. Perbarui `CHANGELOG.md` (dan `README.md` bila fitur baru) di setiap rilis.

---

## 3. Stack & Build

| Komponen | Keterangan |
|---|---|
| Rendering | Three.js **r128** dari CDN (`cdnjs`) — global `THREE` |
| Bahasa | JavaScript murni (ES2020), satu `<script>` besar |
| Font | Plus Jakarta Sans (Google Fonts) |
| Build | `node build.mjs` — menyambung `src/` menjadi satu file |
| Output | `index.html` (root) **dan** `public/index.html` (untuk Vercel) |
| Hosting | Vercel: `buildCommand: npm run build`, `outputDirectory: public` |

```bash
npm run build   # rakit src/ → index.html + public/index.html
npm start       # server lokal (npx serve) → http://localhost:3000
```

Urutan rakitan (penting — modul saling bergantung secara global):
`shell.html → a_core.js → b_layout.js → c_sim.js → d_part1.js → d_part2.js → e_ui.js`

`shell.html` diakhiri dengan `<script>` terbuka; `e_ui.js` menutupnya. Semua deklarasi top-level berbagi satu scope global.

---

## 4. Struktur File

```text
Lumbung/
├── src/
│   ├── shell.html   (~550 baris)  kerangka HTML + seluruh CSS
│   ├── a_core.js    (~100)  konstanta dunia, konfigurasi gudang, Store data, utilitas
│   ├── b_layout.js  (~140)  pembuatan gudang/toko, slot, palet, armada, pekerja, shift
│   ├── c_sim.js     (~890)  SIMULATOR: truk, forklift, sopir, persimpangan, rute, cuaca, peringatan
│   ├── d_part1.js   (~620)  pembuat model 3D, pool instancing, kota & jalan & tol
│   ├── d_part2.js   (~540)  bangunan gudang/toko, pengikatan entitas, sinkronisasi per frame
│   └── e_ui.js      (~585)  UI: panel, KPI, menu, toast, seleksi, kamera, loop frame
├── index.html, public/   hasil build
├── build.mjs, package.json, vercel.json, _headers
├── README.md, CHANGELOG.md, CARA-DEPLOY.md, KONTEKS-PROYEK.md
```

---

## 5. Arsitektur Empat Lapis

```
Data (Store)  ←ditulis─  Simulator (c_sim)
     │                        ↑ perintah (arahkan truk, aksi peringatan, cuaca)
     ├─dibaca→ Tampilan 3D (d_part1/2)
     └─dibaca→ UI (e_ui)
```

- **Simulator tidak pernah menyentuh Three.js.** Tampilan hanya membaca Store setiap frame (`syncView`).
- Prinsip ini yang memungkinkan simulator diganti **data nyata** (WMS/GPS/Socket.IO) tanpa mengubah tampilan.

---

## 6. Dunia & Koordinat

Konstanta (`a_core.js`): `PX=100, PZ=76, ROAD=9, SW=3, PH=1.01, RT=7, GY=0.06`

- Kota adalah grid blok `PX × PZ`; jalan selebar `ROAD` (lajur kiri ±2,2 m dari as, **lalu lintas lajur kiri** seperti Indonesia).
- `GRID={x0:-2,x1:2,z0:-1,z1:2}`. Gudang/toko menempati sel `(gx, gz)`.
- **Jalan Lingkar** di `ZHW`; **Gerbang Tol Jagorawi** di `x=330`; **Tol Jagorawi** (4 lajur, median beton) dari `x≈346` sampai `620`.
- `HWY={zE:ZHW-2.2, zW:ZHW+2.2, xToll:330, xEnd:620, rTurn:4.4}`.

**Koordinat lokal gudang** (semua posisi truk/orang/forklift disimpan lokal terhadap gudangnya):

| Field | Arti |
|---|---|
| `ox, oz` | offset dunia gudang (dunia = lokal + offset) |
| `fz = D/2` | muka depan bangunan (pintu dock) |
| `zE = fz+3.4` | tepi depan platform dock |
| `zDock = fz+6.6` | posisi pusat truk saat merapat |
| `yardZ = zDock+6.4` | **jalur halaman** tempat truk berhenti & membuka pintu |
| `Zr = fz+19.6` | lajur jalan raya di depan gudang |
| `xs0, xs1` | batas platform (termasuk sayap barat staging) |

Tinggi platform dock = `PH` (1,01 m). Pekerja platform memakai `p.y = PH`.

---

## 7. Gudang & Toko

| ID | Nama | Profil | W×D | Dock | Forklift | Atap |
|---|---|---|---|---|---|---|
| BGR-01 | Hub Cibinong | `general` | 16×9 | 3 | 2 | pelana + annex |
| BGR-02 | Cross-Dock Sentul | `crossdock` | 26×10 | 5 | 3 | gergaji |
| BKS-01 | DC Cikarang | `dc` | 24×12 | 4 | 3 | pelana + annex |
| BGR-03 | Gudang Dingin Cileungsi | `cold` | 20×12 | 3 | 2 | datar |
| DPK-01 | Hub Robotik Depok | `robotic` | 28×12 | 5 | 4 | gergaji |
| TK-01 | Segar Mart | toko | 14×10 | 1 | 1 (FL-T, bongkar & muat retur) | — |
| TK-02 | Nusantara Plaza | mal | 22×12 | 1 | 1 (FL-T, bongkar & muat retur) | — |

Profil disetel lewat `SITE_PROFILE` di `a_core.js` → `site.profile`.

**Perilaku per profil:**

| Profil | Visual | Perilaku simulasi |
|---|---|---|
| `general` | patokan | bongkar-muat campuran |
| `crossdock` | rangka dock hijau (IN) / oranye (OUT), tanpa rak, hand pallet | dock `i < ceil(n/2)` hanya **bongkar**, sisanya hanya **muat** (`freeBayFor`); forklift ×1,10 |
| `dc` | jendela atap kaca, van & motor kurir ungu | `planMode` condong ke **muat** (stok rendah); motor kurir di lalu lintas kota |
| `cold` | panel putih, kipas kondensor berputar, uap dingin, rangka karet dock, truk berpendingin | **cek suhu 5,5–7,5 dtk** setelah merapat sebelum forklift mulai (`t.coldCheck`); forklift ×0,85 |
| `robotic` | panel surya, kaca gelap, charger truk listrik | forklift = **AGV tanpa sopir** + proyeksi jalur biru; ×1,12 |

Seragam per profil: `PROFILE_UNIFORM` (b_layout). Forklift per profil: `FORK_LOOK` (d_part1).

---

## 8. Model Data (Store)

`Store.tables`: `sites, stores, docks, slots, pallets, trucks, forklifts, people, shipments, cars, signals`.
API: `Store.add(table, rec)`, `Store.get(table,id)`, `Store.all(table)`, `Store.find(id)`, `Store.emit(event)`, `Store.on(fn)`, `Store.events`, `Store.clock`, `Store.weather`.

- `relate(rec, name, table, idField)` membuat getter relasi (mis. `t.site`).
- `hidden(rec, key, val)` menambah field non-enumerable (tidak tampil di tabel data) — dipakai untuk state internal seperti `coldCheck`, `pendingDest`, `paceMul`, `drivers`, `shiftNow`.
- Event log: `logEvent(site, text, color, entity)` → `Store.emit`. Waktu memakai **`simNow()`** (jam simulasi, sama dengan jam asli di mode Real-time).

Field penting truk: `state, pos{x,z}, heading, v, path, s, rev, mode ('load'|'unload'), total, done, pending, bay, dest, crew, stuck, starve, cabDoor, cabWant, solid, circ, cwW`.

---

## 9. Simulator (`c_sim.js`)

### 9.1 Status truk

```
away → inbound → toll_in → approach → prep → reverse → docked → pull → close
      → depart → toll_out → highway → away
close → to_store → store_prep → store_reverse → store_docked → store_pull → store_close
      → approach (bawa retur) | leave → toll_out → highway
```

- **Halaman gudang:** `approachPath` keluar dari jalan raya lewat `yardTail` ke `yardZ`; truk berhenti di sana (`prep`), sopir membuka pintu belakang, lalu `reversePath` (radius `RY=6`) ke dock. **Pintu tidak pernah dibuka di jalan raya.**
- **Reservasi dock:** `regionOf / canAcquire / acquire / release / resBlock / onLane` menjaga area mundur tiap bay.
- **Persimpangan:** `JUNC`, `jRequest/jRelease/jReleaseAll`, `exitFree` (masuk hanya bila seluruh badan muat di seberang), lampu merah + kuning berkedip 22.00–05.00. Garis stop di **belakang zebra cross** (`j.pre`).
- **Jarak antre:** `FOLLOW_GAP=2.2` m di belakang kendaraan lain; dikecualikan untuk `TIGHT_STATES=['reverse','pull','store_reverse','store_pull']`.
- **Rute kota:** Dijkstra di grid (`route`, `routeCorners`, `polyPath`).

### 9.2 Sopir (crew)

- Keluar/masuk kabin: `crewOut/crewExit/crewEnter/crewIn` — pintu kabin (`cabDoor`) membuka, sopir melangkah ke tangga (`CAB_STEP`, `STEP_Y=0.55`), lalu turun/naik. Truk baru jalan setelah pintu tertutup.
- Rutinitas: buka/tutup pintu belakang (`driverStep`), istirahat di Pos Sopir (`crewDockLife`), menunggu di toko (`crewStoreLife`).
- Jalan kaki: `crewWalk` + `crewDanger` + `crewZones`; truk berhenti bila ada sopir di jalurnya.
- **Anti-macet:** `blockT` menyusut perlahan (tidak direset); setelah >1,5 dtk sopir boleh lewat 25 cm dari truk yang **benar-benar diam** (`truckStill`); setelah >2,5 dtk `crewDetour` memutar lewat ujung truk (tidak boleh masuk platform/jalan).

### 9.3 Forklift

Antrean tugas `span/path/lift/wait/do/travel/unspan`, anti-kebuntuan (jarak stasiun 2,6 m, pemecah kebuntuan bila tertahan >4 dtk), muat parsial bila stok habis (`t.starve`), isi daya bila baterai <25 % atau `f.forceCharge`.

### 9.4 Pekerja & shift

- Shift Pagi 06.00–18.00, Malam 18.00–06.00 (`shiftAt`, `shiftTick`, `swapShift`). Nama & seragam berbeda per shift.
- Satpam serah terima di pos satpam lewat rute patroli; pejalan kaki boleh berpapasan dengan orang dari arah berlawanan.

### 9.5 Lalu lintas kota

Mobil per lajur (`LANES`), jarak antar-mobil ±2 m, berhenti di garis stop. ±1/5 mobil ditampilkan sebagai **motor kurir DC** (tampilan saja; simulasinya sama).

### 9.6 Waktu & cuaca

- `TIME_MODES`: `live` (WIB), `pagi`, `siang`, `sore`, `malam`, `cycle` (24 jam ≈ 8 menit). `setTimeMode`, `tickClock`.
- `WEATHER`: cerah, berawan, hujan, badai petir, kabut, badai pasir → `applyWX()` mengatur `WX.speed/fork/arrive/density/flash/night`.

### 9.7 Arahkan pengiriman

`destOptions(t)`, `setTruckDest(t, destId|'toll')`. Sebelum berangkat: ganti tujuan langsung. Di perjalanan: `redirectPath` dari persimpangan berikutnya; bila sedang di persimpangan, ditunda (`pendingDest`, `applyRedirect`). Satu dock per toko (`st.bays[0].truckId`).

### 9.8 Pusat peringatan

`alertsTick` (tiap 1,2 dtk dari `simCity`), `ALERTS`, `ALERT_LOG`, `runAlert(id, actionId)`, `openAlerts()`.

| ID | Kondisi | Aksi |
|---|---|---|
| `stuck:<truk>` | tertahan >60 dtk (bukan dock/parkir) — **kritis** | lihat truk; alihkan ke toko lain bila menuju toko |
| `starve:<truk>` | dock muat, `starve>10` | berangkatkan dengan muatan yang ada (`total=done+pending`) |
| `full:<site>` / `empty:<site>` | staging ≥90 % / ≤10 % | prioritas muat/bongkar 10 menit (`site.bias`) |
| `stock:<site>:<item>` | qty < `STOCK_LOW` (300) | pesan restock 600 unit (tiba saat truk bongkar berikutnya selesai, `applyRestock`) |
| `bat:<forklift>` | baterai <26 % dan tidak sedang ke/di pengisian | isi daya sekarang (`forceCharge`) |
| `wx` | badai petir / kabut / badai pasir | kembalikan cerah |

Siklus: `open` → (aksi) `done` "Sedang ditindaklanjuti" → hilang dari daftar & masuk riwayat saat kondisi pulih (`auto`/`resolved`). Ada histeresis agar tidak berkedip.

---

## 10. Tampilan 3D (`d_part1.js`, `d_part2.js`)

- **Semua model dibuat dari kode** (`Parts`, `gR`, `gCap`, …). Tidak ada file aset.
- **Instancing** (`InstPool`) untuk palet, orang, mobil, motor, lampu lalu lintas, titik jalur AGV → draw call rendah.
- **Pool orang:** kapasitas `n*2+16` karena lengan/paha/betis/kaki **berpasangan**. Ada peringatan konsol bila pool penuh.
- Truk: trailer berongga (ruang dalam ±2,45 m, atap y=3,44), pintu belakang & pintu kabin beranimasi, unit pendingin untuk gudang dingin.
- `View.clutter` disembunyikan oleh **Tampilan Bersih** (`applyClean`).
- Cuaca: hujan (LineSegments), debu (Sprites), kilat, kabut, lampu malam (`LAMPG`, `POOLS_L`), sorot lampu kendaraan.
- Penanda per frame: `syncView(dt, now)` — truk, forklift, palet (hanya yang `dirty`), orang, dock, sinyal, kipas, uap dingin, motor, titik AGV.

---

## 11. Invariant Keselamatan (harus selalu 0)

| Pemeriksaan | Target |
|---|---|
| Tabrakan truk–truk, mobil–mobil | 0 |
| Sopir tersenggol / menyentuh badan truk | 0 |
| Truk tertahan permanen / kebuntuan | 0 (tertahan wajar maks ±50 dtk di lampu merah Jalan Lingkar) |
| Kendaraan berhenti di atas zebra cross | 0 |
| Mobil menyerempet penyeberang jalan | 0 |
| Penyeberang di zebra saat kendaraan arahnya hijau | 0 |
| Pejalan kaki tertahan di tempat > 30 dtk (saling tunggu) | 0 |
| Lebih dari 1 forklift per gudang istirahat bersamaan / pekerja tertahan ke-dari kantin | 0 |
| Pintu truk dibuka di jalan raya | 0 |
| Cross-dock: truk merapat di dock arah yang salah | 0 |
| Gudang dingin: palet dipindah sebelum cek suhu | 0 |
| Truk yang diarahkan tiba di tujuan salah | 0 |
| Sopir tidak mendekat ke tujuannya >20 dtk | 0 |
| Orang dengan bagian tubuh hilang | 0 |
| Jarak antre truk (bemper–bemper) | rata-rata ±2–2,5 m, minimum ≥1,9 m |
| Truk sampai di dock tanpa check-in gerbang | 0 |
| Palang gerbang menutup di atas truk | 0 |
| Truk antre di jalan raya depan gerbang > 45 dtk | 0 |
| Truk menunggu di area tunggu > 10 menit | 0 |
| Truk merapat di bay milik gudang lain | 0 |
| Posisi truk melompat saat pindah gudang | 0 |

**Metode uji (sejak v30):** `node tests/headless-sim.mjs [menit] [seed] [jam]` di terminal, atau `?selftest` di browser. Keduanya memakai pemeriksa yang sama (`makeSafetyChecker` di `c_sim.js`) dan menghasilkan sidik jari yang sama untuk seed yang sama. Sebelum push minimal jalankan: `13 7 siang`, `13 7 malam`, `13 7 cycle`, dan satu uji `30 11 siang`.

**Catatan alat uji:** SwiftShader tidak merender `backdrop-filter` dan animasi CSS bisa tidak berjalan saat WebGL berat; pita hitam di bawah panel pada screenshot headless adalah **artefak**, bukan bug.

---

## 12. UI (`e_ui.js`, `shell.html`)

- **Bar atas:** logo, pencarian (`/`), pemilih gudang, chip cuaca (membuka menu Waktu & Cuaca), tombol Tabel, jam, lonceng peringatan (lencana angka), avatar.
- **Kartu KPI** + sparkline (`renderSparks`), **panel detail** (`renderDetail`) per jenis objek, **pelacakan pengiriman** (`renderTrack`), panel **Operasi** dock/forklift/truk (`renderOps`).
- **Kartu "Arahkan pengiriman"** di panel truk (`destBlock`).
- **Seleksi:** kotak biru transparan + label status; tooltip saat hover (`hoverInfo`); toast (`showToast`).
- **Mode sinematik** (`startCine/stepCine`), **Tampilan Bersih**, **Ukuran tampilan** Ringkas/Otomatis/Besar.
- **Penyimpanan browser:** `lumbung.clean`, `lumbung.uiScale`.
- **Urutan lapisan:** kanvas 3D → tilt-shift & vinyet (`z-index:1`) → label (`2`) → UI (`3`) → toast (`7`) → tooltip (`8`) → layar pembuka (`20`).
- **Variabel lebar panel detail:** `--dw` (354 px; 330 px di 821–1280 px). Kartu pelacakan dibatasi `calc(100% - 48px - var(--dw))`.
- **Skala otomatis:** hanya membesar bila layar lebar **dan** tinggi (≥1640×940 → 1,06; ≥1820×1020 → 1,12; ≥2300×1260 → 1,28); tinggi <620 px → 0,9.
- **Breakpoint utama:** ponsel ≤820 px; menengah 821–1280 px; layar pendek ≤820 px tinggi (panel Operasi dilipat jadi tombol).
- Mode gelap mengikuti `prefers-color-scheme`.

---

## 13. Performa

| Tampilan | Draw call (profil ponsel) |
|---|---|
| Satu gudang | ±116–122 |
| Seluruh kota | ±135–150 |

Ponsel/perangkat lemah (`LOWPOWER`): shadow map 1024, bayangan orang dimatikan, gudang yang tidak dilihat disimulasikan bergiliran tiap 2 frame.

---

## 14. Pelajaran dari Bug Sebelumnya (jangan diulang)

| Bug | Penyebab | Pelajaran |
|---|---|---|
| Orang "melayang" tanpa kaki | kapasitas pool instancing 1 slot/orang padahal anggota tubuh berpasangan | hitung kapasitas per **bagian**, bukan per objek; beri peringatan bila `alloc()` gagal |
| Truk tertahan oleh "lingkaran hantu" | `circlesAt` tidak memangkas array saat jumlah lingkaran berkurang | selalu set `out.length` saat menulis ulang array hasil |
| Atap gergaji bolong | cabang `else if` ganda yang kosong akibat penggantian teks | periksa hasil penggantian teks massal; ujikan visual setiap atap |
| Bar atas terburam | `.tilt` punya `z-index` sementara `#ui` tidak | tetapkan `z-index` eksplisit untuk semua lapisan tetap |
| Sopir bolak-balik di tempat | penghitung `blockT` direset setiap langkah bebas | gunakan penghitung yang menyusut, bukan reset |
| Kartu menimpa panel di jendela kecil | aturan layar pendek mengabaikan lebar panel detail | hitung tata letak dari variabel (`--dw`), uji di ≥6 ukuran termasuk ±990×530 |
| Alarm palsu "truk tertahan" | ambang 45 dtk < antrean lampu merah terpanjang | ukur kondisi normal dulu sebelum menetapkan ambang peringatan |
| Waktu peringatan ≠ jam di bar atas | `nowWIB()` vs jam simulasi | gunakan `simNow()` untuk semua stempel waktu kejadian |
| Pintu truk dibuka di jalan raya | titik berhenti sebelum mundur berada di lajur jalan | titik berhenti harus di dalam halaman (`yardZ`) |
| Truk berhenti di zebra cross | garis stop & titik berhenti di dalam area zebra | garis stop di belakang zebra (`j.pre`), di lajur kiri |
| Mobil saling kunci di persimpangan (v38→v39) | mobil depan keluar antrean (mengalah ke penyeberang), mobil di belakangnya merebut klaim | hanya kendaraan terdepan di lajurnya yang boleh mengklaim persimpangan |
| Dua operator gudang berhadapan selamanya (sejak v29) | keduanya menganggap yang lain penghalang diam | pejalan kaki yang tertahan 1,5 dtk mengalah (ID lebih besar) dan menyingkir; selalu ada pemeriksa "tertahan > 30 dtk" untuk setiap jenis agen |
| Warga menembus tangga stasiun (v36→v42.1) | tangga KRL ditambahkan di lapis tampilan tanpa memberi tahu rute pejalan kaki di simulasi | objek tampilan yang berdiri di jalur pejalan kaki wajib didaftarkan ke simulasi (`STATION_STAIRS` → `stairDetour`) |
| Uji bergantung jam dinding | pemanasan startup berjalan di jam 12 bawaan, jendela makan ikut aktif | fitur berbasis jam ditahan selama pemanasan (`LUNCH_HOLD`) |

---

## 15. Status & Backlog

**Selesai (v42):** animasi manusia (`spr` pegas teredam kritis per sendi, `nz` derau halus, posisi & arah tampilan `v.rx/v.rz/v.rh` dihaluskan di `animPerson`, gerak khas per pose termasuk makan `eat` saat `p.lunch.phase==='eat'`) dan burung (`BIRD`, `initBirds`, `syncBirds`: merpati per gudang dengan spot tanah + tengger kanopi kantin, kabur oleh `birdThreat`; 4 kawanan kota; suara `flutter`). Hanya tampilan.

**Selesai (v42.2):** logo resmi (lencana biru #0D6CD7 dengan lumbung putih) di favicon, apple-touch-icon, og:image, bilah atas, layar pemuatan, tur, mode foto, atap & papan gudang, dan trailer armada Lumbung (`LOGO_SRC`, `drawLogo`, `logoTex` di d_part1). File sumber `assets/lumbung-logo.png`. Temuan audit #15 (domain di trailer) selesai. Hanya tampilan.

**Selesai (v41):** motor staf & ojol (hanya tampilan, d_part2): `staffLot(s)` (pintu belakang `GX=W/2+17,8`, 8 slot parkir di belakang kantin, pintu staf `X-2`, jalur `walkX/walkZ`), dibangun di `buildSiteView` (pagar belakang dipotong, pohon/semak di celah dilewati), `SM`/`initStaffMotos`/`syncStaffMotos` (jadwal `SM_IN`/`SM_OUT` dari jam simulasi, rig pengendara 4 per gudang + 1 ojol, deteksi lompatan jam), `staffMotoInfo(s)` untuk panel & sinematik. Pool orang `+36`.

**Selesai (v40):** tema gelap manual (`THEME`, `isDark()`, `MQ_DARK` di a_core; skrip `<head>` memasang `data-theme`; `applyTheme(pref)` di e_ui; token CSS baru untuk semua warna yang dulu hardcode; scene 3D: `THEME_U.uDark` di shader global `cloudShader` memetakan warna netral terang ke biru tua, `THEMED`/`themedMat` untuk material bertoken, `noTheme()` untuk marka), tombol `#themeBtn`, tur perkenalan (`TOUR_STEPS`, `startTour`/`tourGo`/`tourPlace`/`endTour`, `localStorage['lumbung.tour']`, tombol `?`, `?notour`). Sidik jari simulasi tidak berubah.

**Selesai (v39):** istirahat makan & kantin. c_sim: `LUNCH` (pagi 12.00, malam 00.00, 1 jam, dua gelombang 30 mnt), `lunchNow`, `canteen(s)` (titik duduk, meja saji, lajur jalan, di-cache `s.cant`), `lunchVia`, `lunchWant`/`lunchPlan`/`lunchBack` (antrean aksi orang, label jalan), `forkLunch` (satu forklift per gudang bergiliran, bukan robotic), `lunchTick` (log), `LUNCH_HOLD` saat pemanasan, `PLANS.canteen` (petugas kantin). b_layout: `lunchSeat`/`lunchWave` untuk operator gudang & QC, peran 'Petugas kantin'. View: kantin di `buildSiteView`, `empty` (forklift tanpa operator). UI: `lunchInfo(s)`, chip Istirahat, shot sinematik kantin. Perbaikan: klaim persimpangan hanya untuk mobil terdepan, pejalan kaki mengalah (`a.bt`, sidestep), `xingFree` untuk penyeberang. Pemeriksa baru `lunch`, `personStall`; `selftestInit` menerima jam angka.

**Selesai (v38):** jenis jalan (token `--road-art`, `--road-toll`, garis ganda kuning arteri, `roadInfo` hover, kartu `#roadLegend`), mobil belok/putar balik (`initTurns`, `carPlan` per persimpangan di `c.plans`, `planMove`, `laneRoomAfter`, `startTurn`/`stepTurn` kurva Bezier kubik, `c.home` untuk lajur awal saat muncul ulang), lampu penyeberang (`pedPhase`, `buildPedSignals`, `syncPedSignals`), penyeberang jalan (`PLANS.cross`, `xingPts`, `pedCanStart`, `zebraBusy`, `movSides`, aksi orang `until`), `gateLoad` untuk menolak kiriman/alihan saat antrean gerbang penuh.

**Selesai (v37):** truk mogok di dock (`BK_CHANCE` 4%, `startBreakdown`, `sendMechanic`, `crewBreakLife`, `t.broken={t,need,mech,mechAt,cause}`, peringatan `brk:<truk>`), mekanik & asap & segitiga di tampilan (`View.mech`, `syncBreakdowns`), jas hujan (`coatLook`), komit truk saat lampu langsung merah setelah kuning berkedip.

**Selesai (v36):** suasana kota di lapis tampilan: KRL layang + Stasiun Cibinong (`RAIL`, `railSchedule`, `trainAt`, `buildRailView`, `syncRail` di d_part2.js; waktu kereta `RAIL.t` berjalan di View, bukan simulasi), bayangan awan (`CLOUD_U`, `cloudShader` dipasang di `MeshStandardMaterial.prototype.onBeforeCompile`, `initClouds`, `updateClouds`), suara WebAudio (`SND`, `sndTick`, `setSound`, tombol `#soundBtn`, tombol M), mode foto (`PHOTO`, `startPhoto`, `takePhoto`, tombol P).

**Selesai (v35):** garis waktu & putar ulang (`REC`, `recordTick`, `capture`, `applyRec`, `rpBackup`, `enterReplay`/`exitReplay`, `rpSeek` di e_ui.js; `RP` di d_part2.js). Perekam hanya membaca Store; putar ulang menjeda simulasi dan mengembalikan nilai live persis saat keluar.

**Selesai (v34):** lampu sinyal kendaraan di lapis tampilan (`updateSignalLamps`, `LAMP_ST`, `turnAhead`, `TRUCK_LAMPS`, `CAR_LAMPS` di d_part2.js): rem, mundur, sein, hazard truk + rem mobil; tanpa perubahan simulasi.

**Selesai (v33.1):** aturan "jangan menutup persimpangan" untuk mobil menghitung semua mobil di depan termasuk yang masih di dalam persimpangan (`exitRoom`, jarak antre 6,5 m), staging 15 slot per gudang (baris A 5, baris B 10).

**Selesai (v33):** pengiriman antar-gudang (`t.xfer`, state `transfer`, `siteTripPath`, `rehome` + `flushMoves` saat truk pindah pool, kembali ke pool asal `homeId`), alihkan truk di tol ke gudang lain (`redirectIncoming`), pindah bay (`changeBay`/`retargetLane`), serah bay di palang ke truk antrean terdepan, operator uji di selftest, pemeriksa `wrongSite` dan `jump`.

**Selesai (v32):** check-in gerbang & area tunggu. State truk baru `gate` dan `yard_wait`; `siteGate(s)` (geometri palang/pos/area tunggu + kapasitas), `gateS`, `laneRoom`, `assignFromQueue` (FIFO urut check-in), `gateTick`, `PLANS.gatekeeper`, truk retur ikut antrean (`t.queued`, tidak lagi `homeBay`), aturan kuning truk `t._commit`. Pemeriksa baru: gateSkip, gateArm, roadQueue, queueLong.

**Selesai (v31):** Tahap 3 KPI & grafik khas per gudang. `site.metrics` diisi `metricsTick()` di akhir `simSite()` (tanpa RAND, sidik jari tidak berubah), hook `kpiOnDock/kpiOnPull/kpiOnLoad/kpiOnUnload`, ringkasan `kpiSummary()` ikut `SCHEMA.sites.kpi`, grafik SVG + kanvas peta panas di `kpiBlock()`/`drawHeat()` (e_ui.js), pemeriksaan ke-16 "KPI gudang tidak valid".

**Selesai (v30):** simulasi ber-seed (`?seed=`), uji mandiri `?selftest` + `tests/headless-sim.mjs` dengan 15 pemeriksaan invariant, perbaikan lalu lintas (mobil melepas kunci persimpangan karena lampu merah di persimpangan berikutnya, keputusan kuning/merah yang konsisten dengan pengereman, aturan "jangan menutup persimpangan"), sopir bisa memutari truk yang menghalangi di ruas panjang, crash pekerja di mode siklus cepat.

**Selesai (v29):** mode sinematik bercerita (ikuti satu truk tanpa potong), kamera awal lebih dekat, tilt-shift ikut zoom, operator gudang & properti halaman, data demo milik sendiri, ID kiriman berurutan, `tests/headless-sim.mjs`.

**Selesai (v28.3):** lima gudang berkarakter, jalan tol vs jalan raya, alur halaman gudang, shift, sopir & pintu kabin, arahkan pengiriman, pusat peringatan, jarak antre, UI responsif & ringkas, deploy Vercel + domain.

**Belum dikerjakan (urutan disarankan):**

1. Ide lain: laporan/ekspor, analitik dock, tombol mode gelap manual, tur perkenalan, pintasan keyboard, bahasa Inggris, Gunung Salak, bloom.
2. Jangka panjang: integrasi data nyata / Toko Live FUSIONIFY BOT; migrasi ke TypeScript + Three.js terbaru.

**Batasan yang diketahui:** data masih simulasi; laporan "beberapa glitch" belum terdiagnosis (butuh rekaman layar).
