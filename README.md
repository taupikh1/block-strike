# BLOCK STRIKE — Tahap 8

FPS 3D single-player melawan bot dengan Three.js/WebGL. Build ini melanjutkan Tahap 7; peta, collision BSP, pintu, props, karakter, dan graf navigasi asli dipertahankan.

**Verdict: CONDITIONAL.** Chromium desktop/mobile dan WebKit Linux lulus pengujian. Safari iPhone fisik, Add to Home Screen, performa GPU perangkat dan sesi panjang belum diverifikasi. Lihat `QA_REPORT.md`.

## Menjalankan lokal

Ekstrak `BLOCK_STRIKE`, buka terminal di folder tersebut, jalankan:

```sh
python -m http.server 8080
```

Buka `http://localhost:8080`. Jangan memakai `file://` karena model/peta memakai fetch. Pemain tidak memerlukan Node.js. Pustaka runtime sudah lokal di `js/vendor/`, tanpa CDN.

## GitHub Pages

1. Unggah **isi** `BLOCK_STRIKE` ke root repository; `index.html`, `css`, `js`, `assets` sejajar.
2. Sertakan `.nojekyll`, pertahankan kapitalisasi dan struktur folder.
3. Settings → Pages → Deploy from a branch → main → /(root).
4. Buka URL Pages setelah deployment selesai; New Game → Map → Team → Class → Start Match.

Paket ini belum di-deploy oleh proses pengerjaan. Baca `ASSET_NOTICES.md` sebelum publikasi: hak redistribusi pihak ketiga belum terverifikasi lengkap. Tidak perlu backend.

## Kontrol

| Desktop | Aksi |
|---|---|
| WASD / panah | Bergerak |
| Mouse / klik kiri | Melihat / menembak |
| Klik kanan / V | Siklus zoom pada senjata berscope |
| Roda mouse | Ganti senjata; ubah level saat scoped |
| R / Space | Reload / lompat |
| B / O | Buy menu / equipment |
| 1–5 / G | Slot inventaris / granat |
| Tab | Tahan untuk scoreboard |
| Esc | Tutup buy menu atau menu jeda |

Klik arena mengunci pointer desktop. Gunakan B dan Esc ketika pointer terkunci. Dalam buy menu, 1–8 memilih kategori dan 9 menutup menu; Tab memindahkan fokus.

**iPhone landscape:** drag kiri untuk joystick, swipe kanan untuk melihat. Tombol TEMBAK, RELOAD, GANTI, LOMPAT, GREN, BUY, MENU tersedia. BIDIK hanya muncul pada senjata yang mendukung zoom. AWP/Scout memiliki dua tingkat; AUG/SG-552 mempertahankan crosshair dan viewmodel. CSS menggunakan safe-area insets. Meta Safari standalone tersedia, tetapi A2HS belum diuji pada perangkat fisik.

## Peta dan mode

| Peta | Implementasi |
|---|---|
| Dust Block | Arena blok bawaan |
| CS Kvartal | BSP, tekstur/lightmap, sky, props, collision, pintu, graf A* Tahap 7 |
| AS Kvartal | BSP, tekstur/lightmap, sky, props, collision, pintu; AI pursuit dasar |
| ES Kvartal | Layout blok sederhana dari BSP; rute grid di tanah |

Semua peta memakai eliminasi tim. Objective hostage/VIP/escape dan plant/defuse belum tersedia. Kit defuse diberi penjelasan tidak tersedia pada mode ini dan tidak mengurangi uang. Tidak ada multiplayer.

## Perbaikan utama

- Viewmodel GoldSrc asli beserta tangan; skeletal idle/draw/fire/reload/knife; reload shotgun per peluru.
- Kamera viewmodel terpisah mencegah clipping dinding; tidak ada rotasi reload buatan.
- Model `p_` mengikuti tulang tangan bot; Dual Elites memakai dua attachment. Loadout menentukan model, suara, damage, jangkauan, amunisi dan cadence.
- Menu klasik emas/gelap, pilihan map/team/class, settings, credits, pause/resume.
- Ikon transparan model `w_`, kategori bernomor, validasi tim/zona/waktu/uang/kepemilikan pada transaksi.
- Scope sniper berpusat pada viewport dan reset saat ganti senjata/ronde; HUD tetap terlihat.

## Keterbatasan

- AS Kvartal belum mempunyai graf A* khusus. Seluruh lintasan/lift dan semua kondisi macet pada BSP belum diverifikasi lewat sesi panjang.
- Flash/smoke/HE sederhana. Grenade viewmodel, toggle silencer, shield belum menjadi aksi pemain.
- Karakter memakai animasi idle/run/death yang tersedia; tidak mengada-adakan clip fire/reload karakter yang tidak ada pada sumber.
- Class mengubah avatar pemain dan rekan pemimpin regu. Avatar lokal disembunyikan pada first-person.
- Buy menu menjeda simulasi seperti baseline. Ammo primer/sekunder mengisi reserve slot terkait dengan harga yang ditampilkan.
- Tidak ada service worker; aset lokal lengkap bukan jaminan cache offline Safari.

## Pengembang

Runtime: `js/game-core.js`. Integrasi Tahap 8: `game-systems8.js`, `classic-ui.js`, `layout-nav.js`, `css/classic.css`. Pipeline MDL: `tools/mdl2glb/`. Tes: `tools/qa/` memerlukan Python + numpy/Pillow dan Node + Playwright hanya untuk pengembang. Bukti di `qa/`. Dokumentasi Tahap 7 dipertahankan sebagai catatan historis.
