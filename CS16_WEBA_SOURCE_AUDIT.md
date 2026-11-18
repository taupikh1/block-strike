# BLOCK STRIKE — Audit sumber CS16.Weba.Ru (18 November 2026)

Sumber: https://cs16.weba.ru/cs16_files/

## Apa yang berhasil diperiksa

Direktori publik mencantumkan `sound/`, `sprites/`, `models/`, `resource/`, `gfx/`, `events/`, `autobuy.txt`, `rebuy.txt`, `commandmenu.txt`, dan `settings.scr`. `resource/UI/` mencantumkan layout buy untuk CT/T, scoreboard, team menu, dan spectator dalam format GoldSrc/VGUI `.res`. Website juga menyediakan `maps/` dan banyak WAD; keduanya **tidak** ditambahkan sesuai instruksi.

## Status pengambilan dan pemasangan

| Kelompok | Hasil | Status |
|---|---|---|
| Auto Buy / Rebuy | Implementasi JavaScript orisinal memakai transaksi dan stok BLOCK STRIKE, tombol F3/F4 pada Buy Menu dan keyboard. Prioritas default senjata CT/T, armor, grenade, ammo. Pembelian terakhir disimpan per tim. | IMPLEMENTED + UNIT TESTED |
| Sound radio dan weapon | BLOCK STRIKE sudah mempunyai suara senjata/radio dari arsip pengguna; tidak diunduh ulang. | EXISTING, UNCHANGED |
| Menu visual dan HUD | Referensi direktori `.res` tersedia; game sudah memakai HUD dan menu sendiri. `.res` tidak langsung kompatibel dengan HTML/CSS. | REFERENCED, NOT COPIED |
| Models `.mdl` | Model senjata dan karakter dari arsip pengguna sudah ada dalam baseline. Tidak diunduh ulang dari mirror. | EXISTING, UNCHANGED |
| Sprites `.spr`, gfx `.tga` | Perlu konversi dan audit animasi/transparansi jika nanti digunakan. | NOT DOWNLOADED |
| `commandmenu.txt` | Referensi menu GoldSrc. Belum dipasang karena antarmuka web membutuhkan implementasi ulang, bukan copy file. | NOT DOWNLOADED |
| DLL, addons, plugin, cheat | Biner engine/server GoldSrc tidak kompatibel dengan Three.js dan bukan fitur yang diminta. | EXCLUDED |
| Maps, WAD map, overview | Sengaja dikecualikan oleh pengguna. | EXCLUDED |

## Kendala

Pengunduhan langsung melalui container atas `https://cs16.weba.ru/cs16_files/autobuy.txt` dan `https://cs16.weba.ru/cs16_files/resource/UI/BuyMenu.res` gagal karena akses jaringan/DNS; pengambilan binary melalui layanan download juga gagal. Oleh sebab itu **tidak ada aset baru dari mirror yang dimasukkan ke ZIP**. Sebelum redistribusi aset resmi Counter-Strike milik Valve, pastikan izin penggunaan/redistribusi. Mendaftarkan file di direktori publik tidak berarti file bebas lisensi.

## Pengujian

- `node tools/qa/quickbuy15.cjs`: 18/18 PASS (fake state dan fungsi purchase; bukan uji GPU).
- `node tools/qa/tahap12_combat.cjs`: 27/27 PASS.
- `python tools/qa/validate_assets.py`: PASS (31 GLB animasi, 165 WAV, 34 ikon transparan, path lokal).
- `node --check` untuk 42 file JS: PASS.
- Chromium HTTP lokal: BLOCKED_BY_ADMINISTRATOR. Pengujian end-to-end browser dan Safari fisik **NOT VERIFIED**.

## Cara pakai fitur baru

Buka game, masuk pertandingan, berdiri di buy zone saat buy time aktif. Buka Buy Menu lalu pilih `F3 AUTO BUY` atau `F4 REBUY`. Di desktop, F3/F4 juga bisa ditekan langsung. Auto Buy mengikuti anggaran dan aturan CT/T. Rebuy mengulang transaksi sukses yang disimpan untuk tim saat itu bila barang masih bisa dibeli. Tidak ada uang atau senjata gratis.

## Catatan teknis

Perubahan dibatasi pada `index.html`, `css/quickbuy15.css`, `js/quickbuy15.js`, dan tes. Tidak ada map, senjata, animasi, damage, atau sistem AI yang dimodifikasi. Auto Buy/Rebuy merupakan fitur BLOCK STRIKE sendiri yang terinspirasi mekanisme CS 1.6; **bukan** hasil salin kode atau isi `autobuy.txt` dari web.
