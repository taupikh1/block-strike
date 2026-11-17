# QA Tahap 8 — 17 November 2026

## Verdict: CONDITIONAL

Game dapat dijalankan dan kriteria inti yang diperiksa lulus. Status tidak dinaikkan menjadi READY karena Safari iPhone fisik, Add to Home Screen, performa GPU perangkat, sesi bermain panjang dan seluruh lintasan/lift BSP belum diuji. Tidak ada klaim pengujian perangkat fisik.

## Lingkungan dan sumber bukti

- Server HTTP lokal; seluruh runtime Three.js/loader berasal dari folder lokal, tanpa CDN.
- Chromium headless `/usr/bin/chromium`, WebGL software SwiftShader.
- WebKit 26.5 / Playwright build 2336 di Linux, WebGL aktif. Dependensi browser disiapkan di workspace terpisah, tidak disertakan dalam ZIP game.
- Chromium: 1366×768 desktop, 844×390 dan 740×360 dengan touch/mobile emulation.
- WebKit: 844×390 dengan touch/mobile emulation. Ini bukan Safari pada iPhone fisik.
- Screenshot adalah render gameplay/browser nyata. Fixture otomatis memberi uang, meredam combat lawan, mengatur pose/waktu simulasi untuk pemeriksaan terisolasi; fixture tersebut tidak ditanam sebagai cheat pada UI game.

## Perintah yang dijalankan

```sh
python -m http.server 8081 --directory /workspace/work
node work/qa/regression.cjs
node work/qa/extended.cjs
PLAYWRIGHT_BROWSERS_PATH=/workspace/work/qa/browsers PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=1 node work/qa/webkit.cjs
PLAYWRIGHT_BROWSERS_PATH=/workspace/work/qa/browsers PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=1 node work/qa/final-smoke.cjs
PLAYWRIGHT_BROWSERS_PATH=/workspace/work/qa/browsers PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=1 node work/qa/safe-area.cjs
node work/qa/loading.cjs
node work/qa/input-combat.cjs
python work/qa/validate_assets.py
for f in work/BLOCK_STRIKE/js/*.js; do node --check "$f" || exit 1; done
```

WebKit menggunakan wrapper dengan search path pustaka lokal yang diperlukan; pengecekan otomatis host dilewati setelah dependency runtime dipasang lokal dan WebGL berhasil dibuat. Ini tidak mensimulasikan OS iOS.

Tes yang dibundel di `tools/qa/` telah disesuaikan untuk dijalankan dari root `BLOCK_STRIKE`. Instal Playwright pada lingkungan developer, mulai server port 8080, lalu jalankan `node tools/qa/regression.cjs` atau `extended.cjs`. `GAME_URL` dan `QA_OUTPUT` dapat mengubah alamat server/folder bukti. Pemain tidak memerlukan tool pengembangan.

## Hasil

| Cakupan | Hasil | Bukti |
|---|---|---|
| Boot, menu, settings, credits, map/team/class | PASS | 3 viewport Chromium; WebKit landscape |
| Spawn CT USP / T Glock | PASS | Screenshot gameplay; class terpilih cocok dengan avatar |
| Semua 25 senjata katalog | PASS | Skinned geometry berada di frustum; screenshot setiap senjata dalam gameplay |
| Draw/fire/knife/idle | PASS | Clip sumber digunakan; fire/knife kembali ke idle |
| Shotgun M3 dan XM1014 | PASS | Ammo bertambah maksimal satu per fase insert; reserve berkurang; reload selesai |
| Pembelian dan kategori | PASS | Semua item enabled dibeli lewat klik/tap DOM; uang dan inventaris diperiksa untuk CT/T |
| Batas tim/waktu/zona/kepemilikan | PASS | Guard transaksi; item penuh/terlarang tidak memotong uang |
| Scroll buy menu | PASS | Wheel desktop dan gestur touch Chromium asli; item rifle terakhir terjangkau. WebKit scroll diuji secara programatis |
| Overlay memblokir aim/fire | PASS | Yaw/ammo tidak berubah ketika daftar disentuh/di-scroll |
| AWP/Scout scope, AUG/SG552, G3SG1/SG550 | PASS | Mask, FOV, crosshair dan visibilitas model sesuai jenis; dua level AWP/Scout tersedia |
| Pusat reticle | PASS | Selisih pusat scope dari viewport <1 CSS pixel |
| Switch/ronde/pause-resume | PASS | Scope/FOV/input kembali normal; jumlah bot tidak menumpuk |
| Joystick / swipe-to-look | PASS (Chromium touch) | Input CDP nyata memindahkan pemain; swipe mengubah yaw/pitch tanpa menembak; release mereset state |
| Tembakan terhalang dinding | PASS (fixture) | 20 percobaan bot tidak mengurangi HP/ammo; cadence AK/M4/AWP dibatasi rate katalog |
| Tombol mobile | PASS | Di dalam viewport, tidak saling tumpang tindih; halaman tidak scroll |
| NPC held weapons | PASS | Attachment tangan runtime; AK-47, Galil, MAC-10, USP, AWP terlihat dalam screenshot fixture gameplay |
| Audio NPC | PASS (instrumented) | AK-47, M4A1, AWP memilih WAV terkait, buffer decoded, AudioContext running; bukan tes dengar melalui speaker |
| Bot damage/cadence | PASS (fixture) | Damage mengikuti katalog ×0.38, LOS guard, cooldown dan ammo terimplementasi; tembakan mengurangi HP |
| Empat map / reset state | PASS | Boot, spawn finite, collision/nav sesuai map; tidak ada sisa graf CS pada map lain |
| Navigasi | PASS terbatas | Pergerakan 10 detik simulasi per map; graf CS 64.603 node, CT→T dan T→CT terhubung |
| GPU allocation saat switch | PASS | Setelah warmup: 333 geometri / 480 tekstur; setelah 75 switch: tetap 333 / 480; 25 instance cache |
| Error JS / HTTP | PASS | Tidak ada uncaught JS atau HTTP error pada suite final |
| Safari iPhone 13 fisik / A2HS | NOT VERIFIED | Tidak ada perangkat fisik |
| FPS, thermal, GPU memory perangkat | NOT VERIFIED | Renderer software server bukan ukuran performa iPhone |
| Sesi panjang dan seluruh lintasan/lift | NOT VERIFIED | Pemeriksaan gerak pendek tidak membuktikan semua path dapat diselesaikan secara fisik |

Hasil mesin: **51 pemeriksaan Chromium + 18 WebKit + 25 extended = 94 PASS**. Validasi struktural tambahan: 31 GLB, 165 WAV, 34 ikon PNG transparan dan referensi aset lokal lulus. Graf navigasi CS sama byte-for-byte dengan Tahap 7 dan reachable dua arah.

Tambahan sesudah suite 94 pemeriksaan: smoke test empat map pada Chromium dan WebKit; grenade cap/kepemilikan/zona tidak mengurangi uang; tembakan tap dan batas 16 voice; ES bergerak sekitar 39.9 unit selama 60 detik simulasi. Uji 404 tekstur map menampilkan error dan Back yang berfungsi, lalu retry berhasil dengan 462 tekstur siap. Perbaikan alpha pada 45 tekstur mempertahankan RGB dan piksel lain (perbandingan byte/array terhadap Tahap 7).

Pengujian safe area **lulus pada Chromium dan WebKit, 844×390 serta 740×360**, memakai inset sintetis kiri/kanan 47 px dan bawah 21 px. Ini memeriksa layout CSS, bukan simulasi notch/toolbar Safari fisik.

## Perbaikan dari temuan QA

- Boot baseline gagal ketika CDN tidak tersedia: pustaka runtime dibundel lokal.
- Senjata hilang pada baseline direproduksi di screenshot; root conversion diperbaiki dan viewmodel nyata terlihat setelahnya.
- Attachment pertama memakai tulang khusus Line yang tidak ada pada karakter; converter direbasis ke Hand ancestor, lalu diperiksa ulang secara visual.
- Tap fire singkat hilang pada frame lambat: shoot dipicu pada pointerdown; uji tembak/reload ulang lulus.
- Mask scope menutup HUD: lapisan HUD diperbaiki, screenshot WebKit menunjukkan HP/ammo/radar tetap terbaca.
- Spawn/collision ES mendorong pemain dari posisi awal: collision y1 diperbaiki; snap ke cell bebas dan rute grid ditambahkan.
- Tekstur foliage memiliki palette key hitam yang masih opaque: mask alpha 45 ekspor diperbaiki, warna sumber tetap sama. Map menunggu tekstur sebelum loading ditutup.
- Fixture 404 menemukan class screen tersisa setelah Back: seluruh layar pemilihan ditutup dan retry berhasil.
- Buy window dan map/class selection kini mengikuti ruang di dalam safe-area padding.
- Timing assertion awal terlalu bergantung pada FPS software; tes kini menunggu state FOV/reload yang diharapkan. Pointer lock desktop diuji dengan pelepasan lock/shortcut sesuai alur kontrol.

## Artefak

`qa/regression.json`, `qa/extended.json`, `qa/webkit-regression.json`, `qa/assets.json`, `qa/nav-connectivity.json`, `qa/final-smoke.json`, `qa/loading.json`, `qa/safe-area.json`, `qa/foliage-alpha.json`, `qa/input-combat.json`, screenshot desktop/mobile/scope/buy/class, screenshot seluruh senjata, screenshot map, dan contoh attachment bot. Indeks screenshot: `qa/index.html`.

Screenshot suite utama diambil ketika fitur tersebut diuji; beberapa menunjukkan warna Dust sebelum koreksi pencahayaan terakhir. Screenshot berawalan `final-` dan `safe-`, serta screenshot WebKit terbaru, menampilkan kondisi akhir terkait. Galeri membedakan keduanya.

Perbedaan dari referensi: warna/menu/scope mengikuti inspirasi CS 1.6, sementara Dust Block tetap arena blok, touch control tetap tersedia, dan map/karakter memakai aset yang sudah ada. Build ini tidak diklaim sebagai replika identik CS 1.6.
