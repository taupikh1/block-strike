# QA BLOCK STRIKE Tahap 13 — 18 November 2026

**Verdict: CONDITIONAL / IMPLEMENTED, SIMULATION-VERIFIED.** Kode dan fitur dirilis untuk pengujian pengguna, tetapi rendering WebGL asli serta Safari iPhone 13 fisik **BELUM TERVERIFIKASI**. PASS di bawah hanya berlaku pada jenis pengujian yang disebutkan.

## Pengujian yang dilakukan

| Pengujian | Hasil | Yang diperiksa |
|---|---:|---|
| `python tools/qa/tahap13.py` | **34/34 PASS, 0 page errors** | Chromium 844×390; DOM dan input nyata dengan WebGLRenderer, GLTFLoader dan texture loader disimulasikan; menu Dust Block, walk, drop/pickup, knife secondary fire, flashlight, hand switching, weapon selector, team change, spectator, UI, blood lifecycle |
| `node tools/qa/tahap12_combat.cjs` | **27/27 PASS** | Regresi perhitungan damage, armor/helmet, shotgun pellet, scope dan stats senjata dari Tahap 12 |
| `python tools/qa/validate_tahap10.py` | **60 PASS, 0 FAIL** | Radio, data HUD, file JS/aset dan validasi statis lain |
| `python tools/qa/validate_assets.py` | **PASS** | 31 GLB animasi senjata, 165 WAV, 34 ikon transparan; referensi file lokal |
| `node --check js/*.js` | **PASS** | Sintaks JavaScript utama |
| `python tools/qa/tahap13_real_webgl.py` | **BLOCKED** | Upaya pengujian WebGL nyata gagal membuat konteks WebGL pada Chromium lingkungan ini |

## Verifikasi Tahap 13 dalam simulasi

- Dust Block menjadi satu-satunya pilihan; file BSP/Kvartal tidak lagi dipakai untuk startup.
- Shift menurunkan kecepatan sesuai mode walk; tidak lagi sprint. Kontrol mobile Walk tersedia.
- Drop weapon menghasilkan entitas senjata yang bisa dipungut; pisau tidak bisa dijatuhkan.
- Knife alternate fire masuk jalur animasi stab yang berbeda.
- Flashlight menambah spotlight dan bisa toggle; model senjata tidak dilepas.
- Left/Right weapon hand memantulkan model senjata visual, tanpa mengubah jalur peluru.
- Pindah CT/T ditunda sampai ronde berikutnya, jumlah bot kedua tim sesuai konfigurasi.
- Player mati masuk spectator, bukan game over; bot tetap bergerak, subject dapat diganti, dan player respawn di ronde berikutnya.
- Selector senjata menampilkan inventory aktual dan grenade yang dimiliki.
- Partikel dan decal darah memiliki batas jumlah, dibersihkan antar-ronde.
- In-game settings memiliki grafik, sens, volume, hand, crouch dan kontrol layout.

## Risiko dan pengujian yang belum dilaksanakan

1. **WebGL nyata:** tampilannya belum diperiksa di GPU aktual: sorotan flashlight, animasi pisau, world drop, decal darah, kedalaman/occlusion dan model tangan kiri/kanan mungkin memerlukan pembetulan.
2. **Safari iPhone 13:** viewport A2HS landscape, multitouch 3–4 jari, pengaturan grafis, audio mobile dan performa tidak diuji secara fisik.
3. **Spectator kamera:** follow POV bot sudah dihitung, tetapi keselarasan senjata/rotasi/animasi subjektif perlu dicek di 3D langsung.
4. **32 pemain:** tidak ada bukti FPS stabil pada perangkat mobile saat simulasi AI/renderer penuh.
5. **Efek darah:** decal planar pada permukaan tertentu bisa clipping/miring; dibatasi 20 decal dan 26 partikel untuk mengendalikan memori.
6. **Regresi:** skrip lama yang mengasumsikan Sprint/pilihan peta Kvartal tidak digunakan sebagai bukti kelulusan Tahap 13. Tes combat statis Tahap 12 dijalankan terpisah.
7. **Lisensi:** aset model/suara GoldSrc dan mod terkait hak redistribusinya belum diverifikasi untuk distribusi publik.

## Evidence

- `qa/tahap13/results.json`: perhitungan total 34 PASS.
- `qa/tahap13/hud-mobile-simulated.png`: screenshot HUD dalam renderer simulasi (**bukan** bukti GPU asli).
- `qa/tahap13/menu-game-simulated.png`: menu dalam renderer simulasi.
- `qa/tahap13/webgl-attempt.png`: screenshot dari upaya WebGL nyata yang tidak berhasil.

## Keputusan rilis

**Rilis Tahap 13 sebagai CONDITIONALLY TESTED BUILD,** bukan klaim kualitas final Safari/CS 1.6. Jalankan build via HTTP(S) atau GitHub Pages (bukan `file://`), refresh cache setelah upgrade, dan uji pengaturan serta seluruh state pemain mati/round reset dengan WebGL asli sebelum menandai PASS produksi.
