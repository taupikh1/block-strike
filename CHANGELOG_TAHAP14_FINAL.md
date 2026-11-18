# CHANGELOG — BLOCK STRIKE Tahap 14 Final

**Baseline:** Tahap 14D (sudah berisi 14A skala model, 14B shield+pistol viewmodel, 14C inventory shield, 14D HE/Flash/Smoke). Tahap ini hanya melengkapi 14E, 14F, dan 14G.

## 14E — Mobile Safari gesture and pointer safety
- Tambah `js/safari14e.js` untuk memblokir double-tap zoom, long-press text selection/callout, native drag, dan gesture pinch pada area gameplay ketika match aktif.
- Cakupan sengaja terbatas pada canvas, area look/joystick, dan tombol gameplay. Scroll dan interaksi dalam Radio, Buy Menu, Settings, Weapon Selector, dan Scoreboard tetap berfungsi.
- Tambah `css/tahap14efg.css`: `touch-action:none` bagi kontrol game; input settings/number tetap selectable; overlay yang memiliki konten panjang tetap `pan-y`.
- Pointer input mengamankan satu ID sentuhan per tombol. Satu jari yang lepas tidak boleh menghentikan serangan jari lain. Semua state dilepas pada cancel, blur, visibility change, dan reset kontrol.

## 14F — Hold-to-fire pistol & knife
- Tahan tombol FIRE: pistol satu tangan (termasuk yang dipasangkan ke shield) menembak berulang menurut jeda dan amunisi senjata; rifle otomatis tetap otomatis; sniper/senjata semi lain mempertahankan perilaku satu tembakan per tekan.
- Tahan tombol FIRE saat knife: slash berulang sesuai jeda serang.
- Tahan tombol bidik/alternate (mobile) atau klik kanan (desktop) saat knife: stab berulang, tidak otomatis mengulang untuk scope, silencer, shield, atau fire mode.
- Swipe sambil menahan FIRE atau alternate knife tetap menggerakkan kamera. Stab diprioritaskan jika tombol primary dan secondary ditekan bersamaan.
- Menukar senjata atau menghentikan match membersihkan state penekanan lama.
- Tambah helper `js/attack14f.js` dan ubah input/update di `js/game-core.js`, `js/game-systems8.js`, serta label secondary di `js/game-systems9.js`.

## 14G — Release QA
- Tambah tes browser `tools/qa/tahap14efg.py`, hasilnya di `qa/tahap14efg/results.json`.
- Jalankan regresi 14D, 14C, 14B, Tahap 13, combat 12, dan pemeriksaan model 14A.
- Validasi sintaks JavaScript, aset, CRC dan SHA-256 dari setiap ZIP lengkap serta ZIP patch.
- **QA CONDITIONAL:** real WebGL gagal membuat konteks di lingkungan tes; belum ada verifikasi iPhone 13 Safari fisik. Playwright WebKit tidak terinstal. Release adalah build uji perangkat, bukan klaim GPU PASS.

## Isi rilis
- Rilis lengkap dibagi ZIP maksimal 24.900.000 byte per file; ekstrak semuanya ke direktori sama.
- Patch `14D → 14 Final` hanya untuk instalasi yang sudah memiliki Tahap 14D lengkap.
- Tidak ada aset tambahan pihak ketiga atau perubahan map dalam Tahap 14E–14G.
