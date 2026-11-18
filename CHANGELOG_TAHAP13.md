# BLOCK STRIKE — Tahap 13 (18 November 2026)

Basis: Tahap 12 Final. Fokus: alur pertandingan, HUD mobile, kenyamanan kontrol dan spectator. Tahap 13 tidak mengklaim replikasi penuh Counter-Strike 1.6.

## Perubahan fitur

1. **Single battlefield**: hanya Dust Block ditampilkan dan dimuat. Pilihan CS/AS/ES Kvartal dan aset peta terkait dihapus dari distribusi penuh. Alur New Game langsung ke konfigurasi pertandingan.
2. **Classic Walk**: tombol Shift pada desktop dan kontrol Walk pada mobile menggantikan Sprint. Kecepatan bergerak diturunkan saat walk; kecepatan dasar disesuaikan berdasarkan senjata yang sedang dipegang. Tidak ada bonus sprint 30%.
3. **Mobile icon HUD**: tombol Drop, Weapon, Settings, Flashlight, dan Team ditambahkan. Radio, scoreboard, aksi tembak/aim, crouch, dan kontrol posisi kustom tetap tersedia. Ikon disesuaikan dengan gaya FPS mobile dan safe-area landscape.
4. **Weapon drop**: tombol tong sampah / Q menjatuhkan senjata aktif melalui sistem dropped-weapon yang sudah ada, sehingga dapat dipungut kembali. Pisau tidak dapat dibuang.
5. **Knife primary/secondary attack**: tombol tembak dan bidik/secondary action menggunakan jalur animasi slash dan stab terpisah dari sistem damage Tahap 12.
6. **Flashlight**: F / tombol lampu menyalakan/mematikan spotlight yang mengikuti arah kamera sambil mempertahankan senjata di tangan; tanpa render shadow untuk performa mobile.
7. **Weapon-hand**: tampilan senjata dapat dipindah antara Right Hand / Left Hand pada Settings, preferensi disimpan lokal.
8. **In-game settings**: panel Settings dapat dibuka saat bermain untuk grafik, sensitivitas, volume, pengaturan crouch dan editor tata letak tombol.
9. **Team switch**: tombol TEAM / M mengantre perpindahan CT–T untuk ronde berikutnya, dengan pengisian bot berdasarkan konfigurasi jumlah pemain dan keseimbangan tim.
10. **Weapon selector**: pilihan didasarkan pada senjata dan grenade yang benar-benar dimiliki player. Tombol radio serta ikon scoreboard menggunakan implementasi yang sudah ada.
11. **Blood FX polish**: penggunaan tekstur darah yang sudah tersedia untuk percikan sementara dan decal benturan pada objek terdekat, dengan batas jumlah dan pembersihan antar-ronde.
12. **Spectator mode**: setelah player tewas, pertandingan tidak langsung keluar ke main menu. Kamera menonton POV bot yang hidup; Next/Previous memilih bot, termasuk CT/T; ronde terus berjalan dan player respawn ketika ronde berikutnya dimulai.

## Perubahan internal

- Modul baru `js/game-systems13.js` dan style `css/tahap13.css` diintegrasikan dengan engine existing.
- Modifikasi pengelolaan kematian, update bot dan timer, hotkeys, inventory UI, mode kamera spectator, input walk, dan blood visuals.
- Menghapus direktori peta yang dinonaktifkan dari paket game penuh; patch memiliki daftar penghapusan tersendiri.
- Paket rilis tidak menambah dependensi CDN atau backend; GitHub Pages tetap didukung.

## Catatan batasan

- Mode spectator dan flashlight sudah diuji lewat Chromium dengan WebGL/asset loader simulasi, **belum** diuji pada GPU/WebGL nyata atau iPhone fisik.
- Tampilan darah merupakan pendekatan decal/particle berbasis tekstur, bukan simulasi cairan atau decal mesh kompleks.
- Kecepatan jalan per senjata merupakan implementasi balancing lokal, bukan reproduksi frame-perfect nilai CS 1.6.
- Model pistol/knife dari sudut pandang bot ketika spectator memerlukan pemeriksaan visual real-browser.
- Kontrol mobile dan pengaturan grafis berpotensi memerlukan tuning berdasarkan FPS, resolusi serta safe area perangkat.
