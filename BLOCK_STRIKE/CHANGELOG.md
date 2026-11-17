# BLOCK STRIKE Tahap 10 — 17 November 2026

- [10A] Radio Commands: Z/X/C dan tombol mobile; Follow, Cover, Hold, Attack, Backup, Regroup; respons bot dari Bot Chatter Remixed, global dan per-bot cooldown.
- [10B] Integrasi empat arsip pengguna: 44 radio MP3, 42 bot voice MP3, 3 first-frame GoldSrc muzzle sprites + 32 blood decals PNG dari dua varian WAD3. Muzzle flash dan blood impact rendering mempunyai batas objek dan lifetime.
- [10C] Match Configuration: jumlah pemain bebas **integer 2–32**, bukan hanya preset; satu slot manusia, pembagian CT/T hampir sama untuk total ganjil. Shortcut 2/6/12/16/24/32. Persist `localStorage`.
- [10D] Difficulty Easy/Normal/Hard diterapkan ke **kedua sisi**: reaksi, aim, vision, kecepatan, scanning; pencarian target berbasis LOS/memori dan perintah; HE bot dengan budget aman.
- [10E] Scoreboard klasik: Tab desktop, ikon mobile; statistik seluruh roster, bot yang mati tetap terlihat, kills/deaths dihitung dari kejadian nyata.
- [10F] AI LOD berdasarkan jumlah pemain, spawn fallback pada peta BSP, ikon radio/score masuk editor kontrol, dokumentasi QA, ZIP rilis independen <=24,9 MB/file.
- **QA:** 51/51 Tahap10 logic simulation, 37/37 regression Tahap9, 57 static asset/JS checks. **GPU WebGL asli & Safari iPhone fisik tidak diuji**, verdict CONDITIONAL.

---

# Tahap 9 — 17 November 2026

- Scope: perkuat layering HUD di atas scope mask; FOV dan reticle core tetap dipakai.
- USP/M4A1: secondary-action suppressor dengan animasi on/off dan suara tembakan sesuai state.
- Kontrol: ikon SVG, crouch desktop/mobile, night vision toggle dan custom 2/3/4-finger layout editor.
- Tactical Shield: buy CT, viewmodel GoldSrc, proteksi tembakan depan saat diangkat dan pistol saat diturunkan.
- Grenade: proyektil HE/Flash/Smoke dengan bounce/fuse, efek damage/blind/smoke dan pengaruh smoke pada deteksi bot.
- Loot: drop model dunia dari bot mati, pickup AMBIL/BATAL/E, swap slot + ammo dan drop senjata lama.
- Aset: pakai konversi GoldSrc GLB existing, koreksi orientasi/scale untuk model `w_` di dunia.
- QA: 37/37 PASS simulasi logic dengan GPU/GLB stub; validator aset lulus. **Safari iPhone fisik dan WebGL nyata belum diverifikasi.**
- Lihat `QA_TAHAP9.md` untuk metodologi dan seluruh batasan, jangan mengartikan ini sebagai rilis bebas bug.

---

# Tahap 8 — 17 November 2026

## Baseline

Baseline final adalah ZIP game lengkap dari tautan Drive pengguna, setelah transfer lampiran 92.36 MiB melampaui batas alat 32 MiB. Root ZIP: `block-strike-checkpoint6/block-strike/`; CRC lulus. SHA-256:

`99e8d407a76426837724d4f81648078030f3b7946e1c857c0aaf9f3f23185b34`

Audit dimulai dari `taupikh1/cs1.6`, commit `96323c0d2ac578b82b05aef71dda5c3f7c2e1f1f`. Setelah ZIP tersedia, semua file dibandingkan; 917 file berbeda/hilang, terutama aset map, dipulihkan dari ZIP. Kode runtime repository cocok dengan ZIP. Map GitHub yang belum terbaru tidak menggantikan map Tahap 7.

## Diagnosis dan perbaikan

| Area | Akar masalah | Perbaikan |
|---|---|---|
| Viewmodel | Arah maju GoldSrc dipetakan ke samping; offset dan rotasi reload berkonflik | Basis kamera diperbaiki; satu refleksi handedness; 31 GLB diregenerasi; kamera viewmodel terpisah |
| Skinning | Bind-space/weights existing perlu dibuktikan | Hierarki, inverse bind, bobot dan track diverifikasi; jalur skinning yang benar dipertahankan |
| NPC | Tidak ada attachment senjata | 31 model `p_` diekspor bone-local. Tulang Line direbasis ke Hand ancestor pada karakter |
| Combat/audio bot | Suara tetap menurut tim; statistik tidak mengikuti senjata | Loadout dari katalog W, burst cadence sesuai rate, ammo/reload, LOS sebelum damage, suara sesuai ID |
| Buy icons | Artwork GUI mengandung manusia | 34 ikon PNG transparan model `w_`; SVG untuk ammo/night vision |
| Scope | `.hidden !important` tidak dilepas; semua optic menyembunyikan crosshair | Sinkronisasi scope tunggal; mask untuk sniper, crosshair untuk AUG/SG552, HUD di atas mask |
| Input | Tap singkat terlewat sebelum frame update | Fire saat pointerdown; pointer capture; reset pada overlay/blur/pause/restart |
| Pembelian | Guard hanya pada UI; equipment penuh tetap bisa dipotong uang | Validasi transaksi: katalog, tim, zona, waktu, uang, kepemilikan, grenade cap; ammo per slot |
| Lifecycle map | Async render/collision tidak ditunggu; state lama dapat tersisa | Await world/textures/collision/doors/nav; cleanup state dan disposal world saat berganti map |
| Collision/spawn | Plafon dianggap kolom dari tanah; spawn generik dapat masuk obstacle | Simpan y1, periksa tinggi bawah blok; spawn native BSP; snap + grid routing untuk ES |
| Tekstur foliage | Ekspor beberapa daun/rumput menyisakan palette key hitam sebagai piksel opaque | Alpha 45 tekstur diperbaiki pada piksel hitam saja; RGB dipertahankan, daftar eksplisit dalam tools/foliage-alpha.json |
| Loading error | Back menyisakan class screen di atas main menu | Tutup semua layar pemilihan, matikan resume invalid, uji retry setelah fixture 404 |
| Safe area | Panel buy dan daftar map memakai ukuran viewport di luar padding inset | Ukuran panel mengikuti area konten; footer menghormati home indicator |
| Boot | CDN Three.js gagal di browser uji | Three.js r128, GLTFLoader, SkeletonUtils lokal dengan lisensi MIT |

## Gameplay

Ronde, ekonomi, damage/armor, inventaris, radar, scoreboard, granat dan kontrol lama dipertahankan. Damage bot memakai 0.38 × damage katalog, burst pendek dan jeda reaksi; interval dalam burst mengikuti rate, AWP minimal 1.45 detik. Shotgun mengisi satu peluru per insert. Class mengubah avatar dan rekan pemimpin regu. Kit defuse tidak dijual pada mode eliminasi yang belum memiliki objective bomb. Flash menahan combat bot; HE memeriksa LOS. Audio dibatasi 16 voice dengan cleanup.

## File utama

- Diubah: `index.html`, `js/game-core.js`, `js/bsp-render.js`, `js/bsp-doors.js`, `js/nav-graph.js` (clear state saja), konverter viewmodel.
- Baru: `js/game-systems8.js`, `js/classic-ui.js`, `js/layout-nav.js`, `css/classic.css`, `js/vendor/`, konverter held, pipeline ikon/HUD dan tes QA.
- Aset: 31 viewmodel diregenerasi; direktori `assets/models/held`, `assets/models/world`, `assets/ui` ditambahkan.
- Graf `cs_kvartal/nav/nav_graph.json` sama byte-for-byte dengan ZIP Tahap 7. Koneksi CT→T dan T→CT lulus.

Status pengujian dan keterbatasan: `QA_REPORT.md`.
