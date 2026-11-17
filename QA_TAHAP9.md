# BLOCK STRIKE Tahap 9 — QA & Release Notes

Tanggal: 17 November 2026. Verdict: **CONDITIONAL / REAL-GPU NOT VERIFIED**.

## Sumber dan integritas

- Baseline dari **lima** ZIP `BLOCK_STRIKE_TAHAP8_PAKET_1_DARI_5.zip` sampai `...5_DARI_5.zip` di Google Drive pengguna. Kelima CRC ZIP: PASS. Digabung ke root `BLOCK_STRIKE/`, 1.747 file tanpa path ganda.
- Lampiran `default-weapon-models(3).zip`: 265 berkas sumber, berisi MDL `v_shield_r`, `p_shield`, `w_shield`; model HE/flash/smoke `v_`, `p_`, `w_`; dan WAV on/off suppressor. Tahap 8 sudah memiliki GLB konversi `shield_r`, ketiga grenade, 31 viewmodel, termasuk world weapon GLB. Tidak perlu menyimpan paket MDL mentah dua kali dalam runtime.
- Tidak ditemukan model *night vision goggles* baru yang berdiri sendiri dalam paket lampiran; Tahap 8 sudah memiliki ikon nightvision.svg dan filter night vision. Tahap 9 memperbaiki state/manual toggle.

## Perubahan yang diimplementasikan

| Area | Status kode | Catatan |
|---|---|---|
| Scope + HUD | IMPLEMENTED | Scope mask di bawah HUD, z-index eksplisit; FOV zoom dan reticle menggunakan core Tahap 8 |
| USP/M4A1 silencer | IMPLEMENTED | Fungsi khusus kanan/V, animasi add/detach, varian tembakan unsil/sil |
| Mobile HUD ikon | IMPLEMENTED | SVG icon, ergonomi lanskap, HUD dan tombol dalam safe-area |
| Customize control layout | IMPLEMENTED | Drag-and-drop ikon, ukuran/opasitas, preset 2/3/4 jari, localStorage |
| Crouch | IMPLEMENTED | Ctrl/C desktop, toggle/hold mobile, modifier kecepatan, kamera dan BSP hull 3; cek headroom |
| Tactical Shield | IMPLEMENTED | CT equipment $2200, primary slot, v_ & w_ model GLB, raise/lower dan frontal bullet block; pistol dapat menembak saat shield turun |
| HE grenade | IMPLEMENTED | World projectile, gravitasi, bounce, fuse, damage berdasarkan jarak/halangan |
| Flashbang | IMPLEMENTED | World projectile, flash overlay, bot blind jarak/sudut |
| Smoke | IMPLEMENTED | World projectile, cloud animasi, LOS bot terhalang, clean-up saat habis |
| Night vision | IMPLEMENTED | Default off, beli dulu, N/mobile toggle, tidak otomatis aktif saat membeli |
| Bot weapon drop | IMPLEMENTED | Spawn world GLB saat bot mati, orientasi + skala GoldSrc, cache aset |
| Pickup + weapon swap | IMPLEMENTED | Prompt AMBIL/BATAL, E, tukar slot dengan menjatuhkan senjata lama, sinkron ammo/inventory |
| Buy menu | IMPLEMENTED | Shield di equipment, transaksi CT-only dan batas uang melalui guard lama |

**IMPLEMENTED berarti implementasi kode ada, bukan bukti bahwa seluruh fitur telah lolos pengujian GPU atau perangkat fisik.**

## Bukti yang dieksekusi di sesi ini

1. `python tools/qa/validate_assets.py`: **PASS**: 31 model GLB animasi, 165 WAV, 34 ikon transparan. Ini memeriksa aset lama, bukan pengukuran animasi Tahap 9.
2. `node --check js/*.js`: **PASS** untuk seluruh JS utama, termasuk file baru.
3. `python tools/qa/tahap9_simulated.py`: **37/37 PASS**, tanpa pengecualian JS; laporan `qa/tahap9/simulation.json` dan screenshot DOM di folder sama.
4. Verifikasi ZIP baseline: kelima `ZipFile.testzip()` mengembalikan PASS; 1.747 file.

### Batasan krusial simulasi

Chromium pada sandbox ini memblokir navigasi HTTP lokal (`ERR_BLOCKED_BY_ADMINISTRATOR`) dan tidak menyediakan konteks WebGL bahkan dengan SwiftShader. Untuk menguji event, state, dan DOM, QA Tahap 9 memakai `about:blank` dengan semua skrip/styles inlined, serta **stub `THREE.WebGLRenderer` dan `THREE.GLTFLoader`**. Jadi grafik hitam pada screenshot simulasi adalah akibat stub, bukan tampilan game normal.

**Tidak dites dalam sesi ini:** boot aset GLB sungguhan, draw calls GPU, gameplay 3D real-time, animasi visual shield/grenade/silencer, efek smoke dan flash pada GPU iPhone, browser Safari fisik, Add to Home Screen, collision semua rute BSP pada crouch, frame rate/memori 30 menit, daya tahan UI berbagai ukuran iPhone, dan regresi 94 tes Tahap 8 yang sebelumnya dilaporkan Codex. Hasil 94 tes Tahap 8 merupakan laporan lama, bukan tes ulang oleh ChatGPT.

## Catatan teknis / risiko tersisa

- Keakuratan taktis terhadap CS 1.6 adalah pendekatan gameplay, bukan replikasi engine GoldSrc: sudut perisai, damage, bounce grenade, smoke LOS, dan pickup dibuat sesuai konteks single-player BLOCK STRIKE.
- Perlindungan shield saat ini memblokir peluru depan ketika shield diangkat. Animasi/pose third-person khusus shield untuk bot belum divalidasi. Bot Tahap 9 tetap memakai loadout standar.
- Peluru dan grenade pada peta BSP memakai geometry raycast render sebagai deteksi tumbukan utama; diperlukan uji nyata pada semua peta, pintu dan celah sempit.
- Input multitouch dan HUD safe area memerlukan pengujian pada iPhone 13 lanskap nyata.
- HTML dan aset pihak ketiga belum diaudit untuk izin redistribusi. Periksa `ASSET_NOTICES.md` sebelum publikasi.
- Tidak ada commit GitHub: integrasi sebelumnya mengembalikan 403 untuk akses write. Deliverable adalah paket ZIP yang dapat diunggah pengguna.

## Cara pemeriksaan manual prioritas

1. Jalankan lewat HTTP/GitHub Pages, iPhone 13 landscape: pilih map, CT, game harus boot tanpa error.
2. Beli AWP, scope harus menampilkan HP, armor, amunisi, dan uang; tembakan ke arah bidik.
3. Ganti USP/M4A1, klik kanan/V pasang-lepas peredam, cek animasi dan audio setelah decode WAV.
4. Tahan Ctrl dan tes underpass/ceiling pada map BSP; pastikan saat tidak muat tidak bisa berdiri.
5. Beli shield CT, gunakan pistol, angkat/turunkan dan tembak musuh dari depan, cek tembakan dari belakang.
6. Lempar HE ke bot, Flash di depan bot dan pemain, Smoke di jalur tembak; cek efek dan bersih saat ronde habis.
7. Beli night vision, pastikan off sampai tombol N/NVG ditekan.
8. Bunuh bot, cek senjata jatuh ke tanah, tekan E/AMBIL, senjata lama harus jatuh dan bisa diambil kembali.
9. Buka Customize Layout, coba preset 2/3/4 jari, seret tombol, simpan dan reload browser.
10. Uji ronde berulang dan keempat peta, perhatikan leak, freeze dan FPS.
