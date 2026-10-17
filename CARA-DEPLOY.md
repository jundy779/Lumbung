# Deploy Lumbung ke lumbung.fusionify.id

Isi paket:

- `index.html` — seluruh aplikasi (satu file, ~310 KB). Three.js dan font dimuat dari CDN publik.
- `vercel.json` — konfigurasi untuk Vercel.
- `_headers` — konfigurasi untuk Cloudflare Pages / Netlify.

Pilih **salah satu** cara di bawah.

---

## Cara A — Vercel (paling cepat)

1. Buka https://vercel.com/new → **Deploy** tanpa Git: seret folder ini ke halaman upload
   (atau lewat terminal: `npm i -g vercel` lalu `vercel --prod` di dalam folder ini).
2. Setelah jadi, buka **Project → Settings → Domains → Add** → ketik `lumbung.fusionify.id`.
3. Di pengelola DNS `fusionify.id`, tambahkan record:

   | Tipe  | Nama      | Nilai                  |
   |-------|-----------|------------------------|
   | CNAME | `lumbung` | `cname.vercel-dns.com` |

4. Tunggu beberapa menit sampai status domain di Vercel hijau. HTTPS otomatis aktif.

## Cara B — Cloudflare Pages (jika DNS fusionify.id sudah di Cloudflare)

1. Cloudflare Dashboard → **Workers & Pages → Create → Pages → Upload assets**.
2. Unggah isi folder ini, beri nama proyek `lumbung`, lalu **Deploy**.
3. Buka **Custom domains → Set up a custom domain** → `lumbung.fusionify.id`.
   Record DNS dibuat otomatis oleh Cloudflare.

## Cara C — Server sendiri (Nginx / Express yang sudah ada)

Salin `index.html` ke folder web, misalnya `/var/www/lumbung/`, lalu arahkan subdomain ke sana.

Contoh Nginx:

```nginx
server {
  server_name lumbung.fusionify.id;
  root /var/www/lumbung;
  index index.html;
  location / { try_files $uri /index.html; }
  add_header X-Content-Type-Options nosniff;
}
```

Lalu tambahkan record DNS `A lumbung → IP server`, dan pasang HTTPS
(misalnya `sudo certbot --nginx -d lumbung.fusionify.id`).

---

## Mengecek hasilnya

- Buka https://lumbung.fusionify.id — layar pembuka "Lumbung" muncul, lalu dashboard 3D.
- Coba juga di ponsel; tampilannya otomatis menyesuaikan.
- Saat link dibagikan di WhatsApp/LinkedIn, muncul judul "Lumbung · Dashboard Gudang 3D".

## Memperbarui versi

Setiap ada versi baru, cukup ganti `index.html` lalu deploy ulang
(Vercel: `vercel --prod`; Cloudflare: unggah ulang; server: timpa file).
