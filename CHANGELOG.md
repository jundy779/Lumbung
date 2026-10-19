# Changelog

## v42 · 20 Okt 2026
- **Gerak manusia lebih alami**: semua figur (staf, sopir, warga, penyeberang, mekanik, pengendara motor) kini digerakkan sendi berpegas teredam, jadi lengan, kepala, dan badan bergerak dengan percepatan dan perlambatan seperti orang sungguhan, tidak lagi "klik" pindah posisi. Posisi dan arah badan di layar dihaluskan, sehingga belokan tidak patah dan gerak tetap mulus di HP yang menyimulasikan gudang lain selang-seling. Terukur: lompatan arah hadap per frame turun dari 122 kali per 40 detik menjadi 0.
- Saat berjalan: pinggul berayun dan miring, badan berputar berlawanan arah langkah, kepala tetap menatap ke depan, panjang ayunan ikut kecepatan. Saat diam: memindah tumpuan berat badan, bernapas, sesekali menoleh.
- Gerakan sesuai kegiatan: menulis di clipboard sambil sesekali mengangkat kepala, menunjuk dengan badan ikut berputar, mengawasi dengan tangan di belakang punggung, menelepon sambil bertolak pinggang, mengobrol dengan dua tangan dan anggukan, petugas kantin memotong dan mengaduk, dan pekerja di kantin benar-benar menyuap makanan lalu mengunyah.
- **Burung**: merpati di halaman tiap gudang berjalan sambil mematuk di dekat kantin dan Pos Sopir, sesekali terbang dan bertengger berjajar di atas kanopi kantin dengan sayap terlipat, lalu kabur beterbangan saat staf, sopir, forklift, truk, atau motor mendekat (dengan suara kepak sayap bila suara dinyalakan). Empat kawanan merpati dan burung walet terbang berputar di atas kota dengan kepak dan melayang bergantian, miring saat berbelok. Malam hari dan saat hujan, kawanan kota pulang dan merpati bertengger.
- Semua di lapis tampilan, simulasi dan sidik jarinya tidak berubah.

## v41 · 20 Okt 2026
- **Pekerja datang dan pulang naik motor**: tiap gudang punya pintu belakang staf di pagar belakang sisi timur, parkir motor beratap polikarbonat untuk 8 motor di belakang kantin, dan pintu staf di dinding belakang gedung. Menjelang ganti shift (sekitar 05.42 dan 17.42) empat pekerja shift berikutnya masuk lewat pintu belakang, memarkir motor, turun, lalu berjalan ke pintu staf. Setelah ganti shift (sekitar 06.04 dan 18.04) pekerja shift sebelumnya keluar dari pintu staf, menyalakan motor, dan pulang. Selama shift, motor mereka tetap terparkir.
- **Ojol antar makanan**: di awal tiap gelombang istirahat (12.00, 12.30, 00.00, 00.30) satu pengemudi ojol berjaket hijau dengan tas makanan masuk lewat pintu belakang, berhenti di sisi timur kantin, menyerahkan pesanan, lalu pergi.
- Panel gudang menampilkan baris **Ganti shift** (berapa motor staf datang atau pulang) dan keterangan "ojol mengantar makanan" di baris jam makan. Motor yang datang atau pulang dan ojol di kantin juga jadi shot di mode sinematik.
- Semuanya di lapis tampilan dan dijadwalkan dari jam simulasi, jadi simulasi dan sidik jarinya tidak berubah. Saat jam melompat (ganti mode waktu, putar ulang) motor langsung menyesuaikan tanpa animasi. Di mode Siklus cepat, motor yang belum kebagian pengendara menunggu giliran, tidak muncul atau hilang tiba-tiba.
- Kapasitas pool figur orang dinaikkan supaya rig pengendara baru tidak membuat bagian tubuh figur lain hilang.

## v40 · 20 Okt 2026
- **Tema gelap manual**: pilih **Ikuti sistem**, **Terang**, atau **Gelap** di menu Waktu & cuaca, atau pakai tombol bulan di kontrol peta untuk ganti cepat. Pilihan disimpan di browser dan dipasang sebelum halaman tampil, jadi tidak ada kedipan terang saat dibuka.
- Scene 3D ikut gelap: tanah halaman, apron, dinding, platform dock, dan trailer berubah ke biru tua sesuai terangnya, sementara atap, rompi, palet, lampu, dan marka jalan tetap jelas. Pergantian tema dianimasikan halus tanpa memuat ulang peta, dan tetap menyatu dengan siklus siang-malam.
- Semua warna yang dulu terkunci terang kini punya versi gelap: layar pembuka, bilah shift, kartu peringatan dan toast, chip mogok, ikon panel, grafik KPI, peta panas, dan sakelar menu. Bilah alamat di ponsel ikut berganti warna.
- **Tur perkenalan**: pengunjung pertama disambut tur singkat (10 sampai 11 langkah) yang menyorot pilihan gudang, angka utama, panel detail, operasi, kontrol peta, peringatan, menu waktu & cuaca, dan pencarian. Langkah yang elemennya tidak tampil (misalnya panel detail di ponsel) otomatis dilewati. Navigasi dengan tombol atau keyboard (panah, Enter, Esc), dan bisa diulang dari menu Waktu & cuaca atau tombol **?**.
- Perbaikan: area gulir panel detail kadang tergambar sebagai kotak hitam di bawah panel, terutama di mode gelap atau setelah ganti tema.
- Simulasi tidak berubah (sidik jari sama dengan v39).

## v39 · 19 Okt 2026
- **Istirahat makan & kantin**: setiap gudang punya kantin beratap di belakang sisi timur gedung, lengkap dengan meja saji, dapur kecil, papan menu, dua meja panjang berbangku, galon, wastafel, dan petugas kantin yang melayani. Jalur pejalan kaki bermarka menghubungkan area kerja ke kantin.
- Shift pagi makan siang pukul 12.00 sampai 13.00, shift malam makan malam pukul 00.00 sampai 01.00. Pekerja dibagi dua gelombang 30 menit (operator gudang pertama dan petugas QC di gelombang 1, operator gudang kedua di gelombang 2), jadi area kerja tidak pernah kosong. Mereka berjalan ke kantin, mengambil makanan di meja saji, duduk makan sambil mengobrol, lalu kembali ke pos. Satpam, petugas gerbang, dan pengawas dock tetap berjaga.
- **Operator forklift bergiliran**: dalam jendela makan, satu forklift per gudang parkir di stasiunnya dengan kabin kosong, sementara forklift lain tetap melayani dock. Selama ada forklift yang jeda, dispatcher tidak mengirim truk tambahan ke area tunggu, supaya antrean tidak meluber ke jalan. AGV di Hub Robotik tidak ikut istirahat.
- Panel gudang menampilkan baris **Jam makan** (gelombang, berapa orang makan di kantin, berapa forklift jeda). Panel pekerja dan forklift menampilkan status "Istirahat". Log kejadian mencatat mulai, pergantian gelombang, dan selesainya istirahat. Kantin yang ramai juga muncul sebagai shot di mode sinematik.
- Perbaikan lalu lintas: mobil di belakang bisa merebut klaim persimpangan saat mobil di depannya keluar antrean untuk mengalah ke penyeberang, lalu keduanya saling kunci dan antrean merambat sampai Jalan Lingkar. Sekarang hanya mobil terdepan di lajurnya yang boleh mengklaim persimpangan.
- Perbaikan gerbang: truk yang tiba di palang dengan bay sendiri kini selalu menyerahkan bay itu ke truk yang lebih dulu menunggu di area tunggu (sebelumnya hanya saat lajur penuh). Tanpa ini truk bisa lolos palang lalu tertahan lebih dari 2 menit di belakang truk antrean di lajur tunggal.
- Perbaikan pejalan kaki: dua orang yang berpapasan di lorong (misalnya dua operator gudang di area rak) bisa berhenti berhadapan dan saling tunggu selamanya. Sekarang setelah 1,5 detik yang satu menyingkir ke samping untuk memberi jalan. Penyeberang jalan juga baru mulai menyeberang bila awal zebra kosong dari pejalan kaki yang lewat, supaya tidak tertahan di tengah jalan saat lampu kendaraan berganti hijau.
- Uji mandiri: 2 pemeriksaan baru (aturan istirahat dan pejalan kaki tertahan di tempat lebih dari 30 detik). Total 26 pemeriksaan di Node. `?selftest&jam=` kini juga menerima jam bebas, misalnya `jam=11.9` untuk menguji pergantian ke jam makan. 20 dari 20 skenario lulus (16 skenario regresi lama + 4 skenario jam makan: 11.54, 12.54, 23.54, dan 00.24).

## v38 · 19 Okt 2026
- **Jenis jalan dibedakan**: Tol Jagorawi kini beraspal paling gelap (garis tepi kuning di median), Jl. Lingkar Utara sebagai jalan arteri beraspal lebih gelap dengan garis tengah ganda kuning, dan jalan kota tetap terang dengan garis putus-putus. Saat peta diperkecil muncul kartu **Keterangan jalan**. Arahkan kursor ke jalan mana pun untuk melihat nama dan jenisnya (jalan tol, arteri, jalan kota, jalan akses tol, atau persimpangan).
- **Mobil bisa belok kiri, belok kanan, dan putar balik**: di enam persimpangan di tepi kota (Jl. Sukahati dan Jl. Raya Citeureup dengan Jl. Raya Jakarta–Bogor, Jl. Mayor Oking, dan Jl. Pajajaran) mobil memilih lurus, belok kiri, belok kanan, atau putar balik, dan bergerak melengkung mulus. Putar balik juga terjadi sesekali di persimpangan lain. Panah lajur di persimpangan itu menunjukkan lurus, kiri, dan kanan. Belokan tetap mengikuti lampu, memakai sistem klaim persimpangan yang sama dengan truk, dan hanya masuk bila lajur tujuan masih punya ruang.
- **Lampu penyeberang jalan** di setiap zebra persimpangan kota (merah = orang berdiri, hijau = orang berjalan, hijau berkedip = jangan mulai menyeberang), seirama dengan lampu kendaraan. Malam hari saat lampu kuning berkedip, lampu penyeberang padam.
- **Penyeberang jalan**: dua pejalan kaki di tiap persimpangan sudut berkeliling lewat keempat zebra. Mereka menunggu di tepi trotoar sampai lampu hijau, lalu menyeberang. Mobil yang belok mengalah pada penyeberang, kecuali mobil yang sudah melaju dekat dan tidak sempat mengerem.
- Kiriman antar-gudang dan pengalihan truk kini juga ditolak bila antrean check-in gerbang sudah penuh, supaya truk tidak menunggu lama di jalan raya depan gerbang.
- Uji mandiri: 2 pemeriksaan baru (mobil menyerempet penyeberang, penyeberang di zebra saat kendaraan arahnya hijau). Total 24 pemeriksaan di Node; 16 dari 16 skenario lulus. Dalam 10 menit simulasi tercatat ±310 belokan, ±80 putar balik, dan ±120 penyeberangan.

## v37 · 19 Okt 2026
- **Truk mogok di dock**: saat truk selesai dimuat atau dibongkar dan siap berangkat, ada peluang 4% mesinnya bermasalah (aki soak, mesin tidak mau menyala, selang radiator bocor, atau kabel starter putus). Truk menyalakan hazard, sopir turun ke depan kabin sambil menelepon bengkel, asap tipis keluar dari gril, dan segitiga pengaman dipasang. Bay tetap terisi sampai truk diperbaiki (3 sampai 5 menit bila dibiarkan).
- **Kirim mekanik**: peringatan kritis "TRK-xxxx mogok di Bay n" dan kartu merah di panel truk punya tombol "Kirim mekanik". Mekanik berseragam biru tua dan topi merah berjalan dari ujung halaman ke depan kabin, memeriksa mesin, lalu truk siap berangkat sekitar 1 menit kemudian. Status truk berubah "Mogok" → "Diperbaiki", dengan bilah progres dan perkiraan waktu.
- Truk mogok juga muncul sebagai shot di mode sinematik, dan operator uji di `?selftest` ikut mengirim mekanik.
- **Jas hujan**: saat hujan atau badai, staf gudang memakai jas hujan kuning, sopir memakai jas hujan biru tua, dan warga memakai jas hujan warna-warni.
- Perbaikan: pukul 05.00, lampu lalu lintas berpindah dari kuning berkedip langsung ke merah tanpa fase kuning. Truk yang sudah memegang persimpangan dan tidak sempat mengerem dulu berhenti di atas zebra cross. Sekarang truk itu tetap lewat, sama seperti aturan kuning.
- Catatan uji: 16 dari 16 skenario lulus. Tanpa mekanik pun (semua mogok dibiarkan 3 sampai 5 menit) uji 30 menit tetap lulus.

## v36 · 19 Okt 2026
- **KRL layang & Stasiun Cibinong**: jalur kereta komuter layang membentang di atas Jl. z=−38 tepat di belakang deretan gudang BKS-01, BGR-01, dan BGR-02, lengkap dengan pilar di median, tiang listrik aliran atas, peron samping berkanopi, tangga ke trotoar, dan papan nama stasiun. Dua rangkaian 8 kereta (arah Jakarta Kota dan arah Bogor) berjalan bergantian: melambat, berhenti 24 detik di stasiun, lalu berangkat lagi. Jendela kereta menyala di malam hari dan muncul sebagai shot di mode sinematik. Murni tampilan, tidak ada perlintasan sebidang, jadi simulasi truk dan mobil tidak berubah.
- **Bayangan awan berjalan**: bayangan awan lembut bergerak pelan di seluruh kota mengikuti angin saat cerah atau berawan, lalu menghilang saat hujan dan malam.
- **Suara suasana** (tombol speaker di kontrol peta atau tombol M, default mati): dengung kota mengikuti kepadatan lalu lintas, hujan, angin, guntur setelah kilat, bip mundur truk yang terdekat dengan kamera, gemuruh KRL, klakson saat berangkat, bel stasiun saat tiba, kicau burung pagi, dan jangkrik malam. Semua disintesis dengan WebAudio, tanpa file audio. Volume mengikuti jarak sumber ke titik pandang kamera.
- **Mode foto** (menu Waktu & Cuaca atau tombol P): semua panel disembunyikan, kamera tetap bisa digeser, diputar, dan di-zoom, label bisa dinyalakan, lalu "Ambil foto" (atau Enter) menyimpan PNG beresolusi layar dengan keterangan gudang, jam, dan cuaca.
- Perbaikan: di Tampilan Bersih, bayangan lembut parkiran staf tertinggal sebagai noda gelap di belakang gedung setelah mobil parkirnya disembunyikan. Sekarang ikut tersembunyi.

## v35 · 19 Okt 2026
- **Putar ulang (garis waktu)**: tombol jam berpanah baru di kontrol peta merekam 10 menit terakhir (5 menit di HP dan perangkat hemat daya) dan bisa memutarnya ulang. Bilah putar ulang punya tombol putar/jeda, mundur dan maju 10 detik, kecepatan 1×, 4×, 16×, slider waktu, jam kejadian lengkap dengan detik, dan keterangan "x mnt y dtk lalu".
- Setiap kejadian di log tampil sebagai titik berwarna di garis waktu (kejadian gudang lain tampil pudar). Arahkan kursor untuk melihat isinya; klik untuk lompat ke 3 detik sebelum kejadian dan langsung memilih truk atau objek terkait.
- Saat putar ulang, truk, sopir, forklift, palet, pekerja, mobil, lampu lalu lintas, palang gerbang, pintu dock, jam, cuaca, dan lampu sein ikut kembali ke keadaan saat itu. Panel detail menampilkan status pada waktu tersebut, jadi bisa ditelusuri kenapa sebuah truk tertahan.
- Simulasi dijeda selama putar ulang dan dilanjutkan persis dari titik yang sama setelah "Kembali ke live" (diuji: keadaan sebelum dan sesudah identik, sidik jari seed sama). Aksi yang mengubah operasi (arahkan truk, aksi peringatan, waktu & cuaca, tampilan bersih, sinematik) dinonaktifkan selama putar ulang.
- Pintasan: Spasi putar/jeda, ← → lompat 5 detik, Esc kembali ke live.

## v34 · 19 Okt 2026
- **Lampu sinyal truk**: lampu rem menyala merah terang saat truk mengerem, antre, atau berhenti di palang dan area tunggu; lampu mundur putih menyala selama truk mundur ke dock; lampu sein oranye berkedip di depan, belakang, dan samping kabin sebelum truk berbelok (termasuk saat masuk halaman gudang dan berayun sebelum mundur), lalu padam ±0,6 detik setelah belokan selesai.
- Truk yang tertahan lebih dari 25 detik menyalakan **lampu hazard** (kedua sein berkedip).
- **Lampu rem mobil**: mobil lalu lintas kota menyalakan lampu rem saat melambat dan saat antre di lampu merah.
- Siang hari lampu tampil sebagai lensa terang dengan pendar kecil; malam hari lampu belakang redup saat berjalan dan terang saat mengerem, plus cahaya sein dan lampu mundur.
- Arah sein dibaca dari jalur truk 10–22 m di depan, jadi kiri/kanan selalu sesuai belokan yang akan diambil. Semua dihitung di lapis tampilan, sehingga simulasi, uji keselamatan, dan sidik jari seed tidak berubah.

## v33.1 · 19 Okt 2026
- **Antrean mobil tidak lagi meluber ke zebra cross.** Aturan "jangan menutup persimpangan" sebelumnya hanya menghitung mobil yang sudah keluar persimpangan, sehingga mobil yang masih melintas di dalam persimpangan tidak ikut dihitung. Saat lampu masuk Jalan Lingkar merah, mobil terakhir bisa ikut masuk lalu berhenti dengan badan di atas zebra. Sekarang semua mobil di depan ikut dihitung, dengan jarak antre nyata 6,5 m. Kasus `20 13 pagi` dan `20 14 sore` kini lulus.
- **Staging gudang 50% lebih lega**: baris B diperpanjang ke barat sayap platform dari 5 jadi 10 slot, sehingga tiap gudang kini punya 15 slot (sebelumnya 10). Baris A tetap 5 slot karena berbagi lantai dengan charger forklift. Dalam uji 15 menit, waktu ketika gudang "staging penuh" (sisa < 4 slot) turun dari 76% jadi 18%, jadi pengiriman antar-gudang dan truk bongkar lebih jarang tertolak.
- Catatan uji: 16 dari 16 skenario lulus penuh (22 pemeriksaan per skenario, 20 sampai 22 pengiriman antar-gudang per 30 menit).

## v33 · 19 Okt 2026
- **Pengiriman antar-gudang**: truk muat bisa diarahkan ke gudang lain dari kartu "Arahkan pengiriman" (bagian baru "Antar ke gudang lain"). Setelah selesai dimuat, truk keluar halaman, menyeberang kota lewat rute terpendek tanpa putar balik, check-in di gerbang gudang tujuan, menunggu di area tunggu bila perlu, lalu dibongkar forklift gudang tujuan. Setelah itu truk keluar lewat tol dan kembali ke pool gudang asalnya.
- Sekitar 18% truk muat yang tidak ke toko kini otomatis mengirim sebagian stok ke gudang lain, jadi pengiriman antar-gudang terlihat tanpa perlu diatur manual.
- **Mengarahkan truk yang sedang datang**: truk yang masih di jalan tol bisa dialihkan ke gudang lain (masuk antrean gerbang gudang itu), dan truk yang sedang menuju dock bisa dipindah ke bay lain yang kosong selama belum mengunci area manuver.
- Setiap pilihan gudang menampilkan alasan bila tidak bisa dipilih (area tunggu penuh, staging penuh, stok kosong, tidak ada rute).
- Truk di palang yang sudah punya bay tetapi terhalang truk antrean di lajur kini menyerahkan bay-nya ke truk antrean paling depan, jadi urutan fisik di lajur selalu sama dengan urutan mendapat bay.
- Perkiraan isi staging tidak lagi mengurangi stok untuk truk muat yang masih antre (belum pasti dapat bay). Sebelumnya, pada kasus langka, staging bisa penuh sementara semua bay terisi truk bongkar dan truk muat terjebak di antrean.
- Perbaikan satpam: saat berbalik arah di ujung rute patroli atau saat pergantian shift, jalurnya bisa melenceng sampai ±4 m keluar pagar dan masuk ke lajur truk. Sekarang tidak lagi.
- Status, rute bertitik di peta, panel truk (asal → tujuan antar-gudang), pelacakan, pencarian ("antar-gudang"), dan sinematik ikut mendukung pengiriman antar-gudang.
- Uji mandiri kini punya "operator uji" yang tiap ±12 detik menjalankan perintah pengguna secara acak (pindah bay, alihkan truk datang, kirim antar-gudang/toko/tol), plus 2 pemeriksaan baru: truk merapat di bay gudang lain dan posisi truk melompat saat pindah gudang. Total 22 pemeriksaan di Node, 23 di browser.
- Catatan uji: 15 dari 16 skenario lulus penuh (setiap skenario 30 menit berisi 12 sampai 22 pengiriman antar-gudang). Satu kasus sisa bukan dari truk: `node tests/headless-sim.mjs 20 13 pagi`, antrean mobil di jalan ujung barat menuju Jalan Lingkar meluber sampai zebra cross saat jam sibuk (kelas masalah yang sama dengan catatan v30 dan v32).

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
