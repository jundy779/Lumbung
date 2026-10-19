# Changelog

## v32.2 · 19 Okt 2026
- KPI atas di HP kini tampil utuh bertiga dalam satu baris (Stok tersedia, Truk di lokasi, Tepat waktu). Sebelumnya deretan KPI harus digeser dan kartu ketiga terpotong dengan efek pudar di tepi kanan yang di mode gelap terlihat seperti bayangan rusak.
- Di HP ikon kartu dan keterangan kecil disembunyikan supaya angka tetap besar; label "Pengiriman tepat waktu" disingkat jadi "Tepat waktu".

## v32.1 · 19 Okt 2026
- **Pencarian di HP diperbaiki**. Sebelumnya kolom pencarian di layar 390 px terpotong jadi satu huruf dan hasilnya berupa dropdown kecil. Sekarang di layar ≤ 820 px kolom pencarian jadi tombol kaca pembesar, dan saat diketuk terbuka layar pencarian penuh: tombol kembali, kolom besar dengan teks 16 px (iOS tidak lagi zoom otomatis), tombol hapus teks, keyboard dengan tombol "Cari", dan daftar hasil yang mudah disentuh (baris ±58 px).
- Saat kolom masih kosong muncul **Pencarian cepat** (Area tunggu, Check-in gerbang, Memuat, Membongkar, Forklift, Toko, Petugas gerbang) lengkap dengan jumlahnya saat ini, plus daftar lima gudang. Berlaku juga di desktop.
- Teks yang cocok disorot di hasil, jumlah hasil ditampilkan ("8 dari 23 · ketik lebih spesifik"), di HP sampai 12 hasil.
- Memilih hasil langsung menutup layar pencarian dan membuka panel objek. Tombol kembali atau Esc menutupnya.
- Teks hasil pencarian kini di-escape (bagian dari temuan audit #2) dan warnanya tidak lagi pudar di desktop.

## v32 · 19 Okt 2026
- **Check-in gerbang**: setiap gudang punya pos Check-in dan palang di ujung jalan masuk halaman. Truk berhenti di palang, petugas gerbang berjalan ke jendela sopir untuk mengecek surat jalan, kembali ke pos, lalu membuka palang. Palang turun lagi setelah ekor truk lewat.
- **Area tunggu truk**: truk tidak lagi menunggu di luar peta saat semua bay penuh. Truk boleh datang, check-in, lalu menunggu di lajur halaman bertanda AREA TUNGGU. Bay yang kosong diberikan berurutan sesuai urutan check-in (FIFO), jadi truk yang sudah dapat bay tidak pernah terjebak di belakang truk yang masih menunggu.
- Kapasitas area tunggu dihitung dari panjang lajur (2 truk di Hub Cibinong, DC Cikarang, dan Gudang Dingin; 1 truk di Cross-Dock Sentul dan Hub Robotik). Palang hanya dibuka bila truk bisa melewati palang sepenuhnya, sehingga antrean tidak meluber ke jalan raya.
- Truk yang pulang dari toko membawa retur kini ikut antrean gerbang yang sama, bukan memesan bay sejak di toko.
- Petugas gerbang baru di tiap gudang (5 orang), ikut pergantian shift.
- Status truk baru: "Check-in gerbang" dan "Area tunggu", lengkap dengan posisi antrean di panel truk, kartu pelacakan, dan pencarian (ketik "area tunggu").
- Mode sinematik punya shot check-in gerbang dan menunggu di area tunggu.
- Truk kini memakai aturan kuning yang sama dengan mobil: bila tidak sempat berhenti saat lampu kuning, truk berkomitmen lewat dan tidak mengerem mendadak di atas zebra cross saat lampu menjadi merah.
- Uji mandiri bertambah 4 pemeriksaan: truk sampai di dock tanpa check-in, palang menutup di atas truk, truk antre di jalan raya depan gerbang > 45 dtk, dan truk menunggu di area tunggu > 10 menit. Laporan juga mencatat jumlah check-in dan waktu tunggu terlama.
- Data mentah gudang punya field `gate` (jumlah check-in, truk menunggu, kapasitas).
- Catatan uji: 15 dari 16 skenario lulus penuh (termasuk 30 menit siang, malam, dan siklus cepat seed 6 dan 21). Satu kasus sisa bukan dari truk: pada `node tests/headless-sim.mjs 20 14 sore`, antrean mobil di jalan ujung barat menuju Jalan Lingkar meluber sampai zebra cross saat jam sibuk sore. Ini kelas masalah lalu lintas mobil yang sama dengan catatan v30.

## v31 · 19 Okt 2026
- **Kinerja khas per gudang**: panel gudang kini punya bagian "Kinerja khas" dengan grafik yang dihitung dari simulasi, bukan rumus tampilan:
  - Gudang Dingin Cileungsi: suhu ruang 24 jam. Suhu naik ±0,54 °C untuk tiap pintu dock yang terbuka dan pulih ke −19 °C saat pintu tertutup; pita hijau menandai batas aman −20 s/d −17 °C.
  - Cross-Dock Sentul: waktu transit tiap palet, dari dibongkar di bay inbound sampai dimuat di bay outbound (16 palet terakhir + garis median).
  - DC Cikarang: paket keluar per jam dari isi palet yang benar-benar dimuat, 24 jam terakhir.
  - Hub Robotik Depok: peta panas pergerakan AGV (sel 1 × 1 m) dan utilisasi AGV rata-rata 2 menit.
  - Hub Cibinong: waktu truk di dock untuk 12 truk terakhir.
- Riwayat jam sebelum aplikasi dibuka ditampilkan sebagai perkiraan (biru muda, garis putus) supaya jelas beda dengan data terukur.
- Arahkan kursor ke batang, titik jam, atau sel peta panas untuk melihat angka persisnya. Tooltip di tepi kanan layar kini membuka ke kiri.
- Ringkasan KPI ikut di data mentah gudang (`kpi` di record `sites`), siap dipakai backend nanti.
- Di ponsel, ketuk gedung untuk membuka ringkasan gudang beserta grafiknya.
- Uji mandiri bertambah satu pemeriksaan: angka KPI harus terhingga dan masuk akal. Pengukuran KPI tidak memakai RNG simulasi, jadi sidik jari simulasi sama persis dengan v30 (`d15e868a` untuk seed 7, 2 menit, siang).
- Semua 9 skenario regresi v30 lulus penuh.

## v30 · 19 Okt 2026
- **Simulasi ber-seed**: `?seed=123` membuat keputusan acak simulator bisa diulang. Seed tampil di menu Waktu & Cuaca dengan tombol salin tautan.
- **Uji mandiri `?selftest`** (opsional `&menit=13&jam=malam`): simulasi dipercepat lalu muncul laporan 16 pemeriksaan keselamatan. Hasil juga ada di `window.__selftest` untuk otomasi.
- `tests/headless-sim.mjs [menit] [seed] [jam]` memakai pemeriksa yang sama dan keluar dengan kode 1 bila ada yang gagal. Browser dan terminal menghasilkan sidik jari keadaan yang sama untuk seed yang sama.
- Jam mode tetap (Pagi/Siang/Sore/Malam) kini maju dengan waktu simulasi, bukan jam dinding.
- Perbaikan lalu lintas yang ditemukan oleh uji mandiri:
  - Mobil melepas "kunci" persimpangan karena lampu merah di persimpangan *berikutnya* (±44 m di depan, dekat Jalan Lingkar), lalu tertahan di tengah persimpangan dan bisa bersenggolan dengan mobil dari arah lain.
  - Keputusan berhenti saat kuning/merah kini konsisten dengan kemampuan rem; mobil yang terlanjur lewat batas aman saat kuning melanjutkan, tidak lagi mengerem di atas zebra cross.
  - Aturan "jangan menutup persimpangan": mobil hanya masuk bila antrean di seberang (termasuk lampu yang akan merah saat tiba) menyisakan ruang sampai bemper belakang lewat zebra.
  - Hijau arah masuk Jalan Lingkar diperpanjang menjadi 7 detik agar antrean tidak meluber ke persimpangan sebelumnya.
  - Mobil tidak lagi muncul di dalam persimpangan saat halaman dibuka.
- Sopir yang jalannya terhalang badan truk di ruas panjang kini menemukan jalan memutar (sebelumnya pemeriksaan jalur terlalu jarang dan truk di depannya tidak terdeteksi).
- Perbaikan crash di mode Siklus cepat: operator gudang bisa kehabisan tugas saat pergantian shift sehingga simulasi berhenti.
- Nama perusahaan diseragamkan menjadi PT Fusionify Digital.
- Catatan uji: 9 dari 10 skenario lulus penuh (seed 1, 2, 3, 4, 5, 7, 11; siang, malam, siklus cepat; termasuk uji ketahanan 30 menit siang dan malam). Satu kasus sisa: pada uji 30 menit siklus cepat seed 21, satu mobil terdeteksi sekali (0,25 dtk) berhenti dengan badan di zebra saat lampu kuning berkedip malam dan antrean Jalan Lingkar meluber. Ulangi dengan `node tests/headless-sim.mjs 30 21 cycle`.

## v29 · 18 Okt 2026
- **Mode sinematik bercerita**: kamera mengikuti satu truk tanpa potong dari gerbang tol, masuk halaman, sopir membuka pintu, mundur ke dock, cek suhu (gudang dingin), sampai forklift bongkar-muat; juga perjalanan antar ke toko. Shot pindah otomatis bila truk lama tertahan antrean.
- Perpindahan kamera jarak jauh kini terbang mulus dengan kecepatan dibatasi, tidak lagi melompat.
- Tampilan awal lebih dekat: truk, forklift, dan pekerja tampil lebih besar.
- Efek tilt-shift ikut tingkat zoom, bayangan desktop lebih tajam (shadow map 4096).
- Halaman gudang lebih hidup: dua operator gudang per site, lampu halaman yang menyala di malam hari, kontainer bertumpuk, hand pallet di dekat rak.
- Data demo diganti angka Lumbung sendiri (stok, kapasitas, inventaris, on-time) dan format ID baru: truk `TRK-31xx` dst., kiriman `KRM-24181` dst. berurutan sehingga tidak pernah bentrok.
- Three.js tidak lagi dimuat dua kali.
- Skrip uji `tests/headless-sim.mjs` ditambahkan ke repo.

## v28.3 — 17 Okt 2026
- Kartu pelacakan tidak lagi menimpa panel gudang di jendela sempit/pendek (misalnya jendela artifact atau zoom browser besar).
- Area sangat pendek (tinggi < 620 px) otomatis memakai UI sedikit lebih kecil.

## v28.2 — 17 Okt 2026
- UI bawaan lebih ringkas: skala otomatis kini hanya membesar bila layar lebar **dan** tinggi, sehingga peta 3D lebih lega di layar 1080p.
- Pilihan **Ukuran tampilan** (Ringkas / Otomatis / Besar) di menu Waktu & Cuaca, tersimpan di browser.
- Kontrol peta di ponsel tidak lagi menimpa deretan KPI.

## v28.1 — 17 Okt 2026
- Sopir tidak lagi bolak-balik di tempat saat jalannya terhalang truk yang diam: setelah menunggu sebentar ia boleh lewat lebih dekat ke truk yang berhenti, dan memutar lewat ujung depan/belakang truk bila badan truk menghalangi langsung.

## v28 — 17 Okt 2026
- **Pusat peringatan yang bisa ditindaklanjuti**: truk tertahan, truk menunggu stok, gudang hampir penuh/kosong, stok menipis, baterai forklift rendah, dan cuaca ekstrem — masing-masing dengan tombol aksi yang langsung memengaruhi operasi, selesai otomatis, dan tercatat di riwayat.
- Lencana jumlah peringatan di ikon lonceng; lonceng kini juga tampil di ponsel.
- Waktu kejadian dan peringatan mengikuti jam simulasi.
- Perbaikan kartu KPI di ponsel yang labelnya meluber keluar kartu.

## v27
- Truk menjaga jarak aman ±2,2 m saat mengantre.
- Bar atas tidak lagi ikut terburam efek tilt-shift.

## v26 — 17 Okt 2026
- Perbaikan orang tergambar tanpa kaki dan lengan (kapasitas pool instancing kini 2× jumlah orang + peringatan bila penuh).
- Trailer truk ditinggikan 45 cm sehingga forklift tidak lagi menembus atap saat bongkar-muat.
- Bayangan kontak orang dipertegas.

## v24–v25
- Fitur **Arahkan pengiriman**: pilih tujuan truk (toko atau luar kota), termasuk pengalihan rute saat di perjalanan.

## v22–v23
- Lima gudang berkarakter: Gudang Dingin (cek suhu, truk berpendingin), Cross-Dock (inbound/outbound), DC (kurir motor, jendela atap kaca), Hub Robotik (AGV, panel surya).
- Jalan tol Jagorawi 4 lajur dibedakan dari jalan raya.
- Perbaikan atap gergaji yang tidak tergambar.

## v19–v21
- Truk berhenti dan membuka pintu di halaman gudang, bukan di jalan raya.
- Garis stop dipindah ke belakang zebra cross di lajur kiri.
- Poles desain: sparkline KPI, tooltip hover, toast, layar pembuka, vinyet.
- Tata letak responsif untuk laptop dengan scaling dan layar pendek.

## v16–v18
- Shift pagi & malam dengan seragam, nama, dan serah terima di pos satpam.
- Animasi pintu kabin dan sopir naik-turun.

## v1–v15
- Fondasi: empat lapis arsitektur, simulator truk & forklift, kota dengan lampu lalu lintas, cuaca & waktu, mode sinematik, tampilan bersih, optimasi instancing untuk ponsel.
