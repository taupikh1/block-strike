# BLOCK STRIKE — Tahap 14 Final (Dust Block Only)

Versi ini melanjutkan Tahap 12 Final. Fokusnya kontrol FPS klasik, HUD ikon mobile, spectator, konfigurasi, dan pengurangan aset peta yang bermasalah. **QA: CONDITIONAL** karena rendering GPU/WebGL sungguhan dan Safari iPhone fisik belum teruji. Baca `QA_TAHAP14_FINAL.md`.

## Tahap 14E–14G — Safari Input & Hold Fire

Kontrol mobile kini menghindari native double-tap zoom dan menu salin pada area gameplay (tanpa menghalangi scroll Buy/Radio/Settings). FIRE dapat ditahan untuk mengulang pistol dan knife slash; ADS knife atau klik kanan PC dapat ditahan untuk stab berulang, tetap mengikuti cooldown masing-masing dan mendukung drag-to-aim. Perubahan diuji pada DOM/Pointers Chromium, tetapi **belum diuji di Safari fisik**. Detail: `QA_TAHAP14_FINAL.md` dan `CHANGELOG_TAHAP14_FINAL.md`.

## Tahap 14D — Grenade Overhaul

HE, Flashbang dan Smoke memakai animasi GoldSrc asli dari ZIP pengguna dan model dunia yang sudah dikonversi sebelumnya. Kode baru `js/grenade14d.js` menyediakan fisika/damage/flash/smoke yang konsisten, sementara `js/game-systems9.js` mengimplementasikan urutan deploy → tarik pin → lempar, projectile/grenade FX, occlusion AI, dan pembersihan resource. **Ini merupakan adaptasi visual gameplay Three.js, bukan port efek GoldSrc persis.** QA: `QA_TAHAP14D.md`. Tahap 14E–14G tercakup pada rilis final ini.

## Tahap 14C — Tactical Shield Inventory & Weapon Switching

Saat membawa shield, slot pilihan senjata hanya menampilkan **PISTOL + SHIELD** dan **KNIFE**; grenade tetap dipilih melalui kontrol grenade tersendiri. Memilih pistol dari inventory secara otomatis kembali ke viewmodel shield+pistol, bukan pistol tanpa shield. Wheel, hotkey angka, tombol GANTI mobile, serta menu pemilih senjata mengikuti aturan yang sama. Membeli atau mengambil pistol tunggal (USP, Glock18, P228, Desert Eagle, Five-SeveN) mengganti pistol aktif tanpa menghilangkan shield. **Dual Elites dan semua primary lain diblokir ketika shield dimiliki.** Pemain harus menjatuhkan shield terlebih dahulu sebelum membeli atau mengambil rifle/primary lainnya. Menjatuhkan shield meninggalkan pistol dan knife di inventory; pickup shield dari tanah menggantikan primary yang ada pada CT. Lihat `QA_TAHAP14C.md`. Batch 14D dikerjakan terpisah dan tercatat pada bagian di atas; 14E–14G tercakup pada rilis final ini.

## Tahap 14B — Tactical Shield viewmodel

Perbaikan viewmodel shield+pistol (USP/Glock/P228/Desert Eagle/Five-SeveN), animasi pistol yang tidak menduplikasi tangan, perbaikan framing shield dari near-plane kamera. Batch 14B hanya viewmodel; aturan inventory diimplementasikan pada 14C. Grenade dan input Safari masih berikutnya. Lihat `QA_TAHAP14B.md` untuk hasil tes dan keterbatasan WebGL/Safari fisik.

## Main game
- `New Game` langsung membuka jumlah pemain (2–32; 32 eksperimental), difficulty Easy/Normal/Hard, lalu tim dan kelas. Arena tunggal **Dust Block**. Map `CS/AS/ES Kvartal` sengaja tidak disertakan.
- Saat player mati, simulasi ronde terus berjalan. HUD Spectator menampilkan nama/HP/senjata bot; panah kiri/kanan mengganti bot hidup, termasuk bot musuh. Respawn ronde berikutnya.
- Player dapat berganti CT ↔ T lewat tombol TEAM; perubahan **baru berlaku saat ronde berikutnya** untuk menjaga pembagian tim.
- Tombol pemilih senjata menampilkan inventory nyata (primary/secondary/knife/shield/grenade); tombol drop menghasilkan world weapon yang bisa diambil kembali lewat mekanik pickup Tahap 9.
- Knife: primary slash (fire/kiri) dan secondary stab (ADS/klik kanan); animasi dan damage kedua jenis berbeda.
- Flashlight menggunakan sorotan `SpotLight` yang mengikuti kamera, tidak mengganti model senjata. Left/right-hand memantulkan viewmodel, crosshair tetap di tengah.
- Shift sekarang berjalan pelan (walk) seperti CS 1.6, **bukan sprint**. Kecepatan per senjata mengikuti tabel internal yang dibatasi; crouch tetap aktif.
- Efek darah memakai tekstur HD yang sudah ada, percikan sementara dan decal dinding terbatas per ronde untuk menjaga memori.

## Controls
Desktop: WASD move, **Shift walk**, Ctrl crouch, Space jump, mouse/primary fire, right click atau V alternate fire, **F flashlight**, **Q drop weapon**, **M team menu**, Tab scoreboard, Z/X/C radio, N night vision, R reload, B buy, G grenade, E pickup, Esc pause. Mobile: icon fire (hold/drag to aim), radio, stats, team, weapon, flashlight, drop, settings, walk, crouch, grenade.

## Settings
Graphics Low/Medium/High, sensitivity, volume, control layout customizer, crouch hold/toggle, **Weapon Hand Left/Right**, settings disimpan via localStorage. Tidak perlu akun atau backend.

## Deployment
Static hosting: upload **isi folder `BLOCK_STRIKE/`** ke root repository (index.html, css, js, assets bersama). GitHub Settings > Pages > Deploy from branch > main > /(root), atau workflow yang sudah dipakai repo. Sertakan `.nojekyll`. Jalankan via HTTP/HTTPS, bukan file://. Musik tidak ditambahkan.

## Limitations
- WebGL actual rendering tidak lolos pada environment tes: `Error creating WebGL context`; yang lulus adalah tes DOM/logic dengan renderer stub. UI pada iPhone landscape perlu uji nyata.
- Blood splatter/decal adalah efek adaptasi berbasis tekstur, bukan simulasi fluida. Spotlight bergantung dukungan/performa GPU.
- Spectator POV menggunakan arah bot, dengan viewmodel dari loadout bot; animasi asli first-person dan kamera setiap frame masih memerlukan verifikasi WebGL.
- Knife/backstab, hitbox, FAMAS burst, BS physics dan performa bot 32 pemain memiliki keterbatasan yang sudah dijelaskan di Tahap 12.
- File `assets` yang bersumber dari game/mod pihak ketiga memerlukan pemeriksaan lisensi sebelum distribusi publik. Baca `ASSET_NOTICES.md`.

---

## Riwayat lama

> **Tahap 11 — CONDITIONAL (18 Nov 2026).** Radio Z/X/C masing-masing 9 perintah + MORE 6, radio scroll mobile, scoreboard kompak 2 kolom, ekonomi bot dengan pistol/$800 awal, bot crouch prosedural, shield dapat memakai Desert Eagle dan pistol tunggal lain, Arctic sekarang memakai reskin salju yang berbeda dari Phoenix. QA 39/39 khusus + 51/51 regresi 10 + 37/37 regresi 9 lulus pada **renderer simulasi**; WebGL asli dan Safari fisik belum teruji. Lihat `QA_TAHAP11.md`.

> **Tahap 10 — CONDITIONAL.** Radio command, bot difficulty, match setup 2–32, scoreboard dan efek aset telah diimplementasikan. QA 51 tes simulasi Tahap 10 + 37 regresi Tahap 9 + 57 cek aset/JS lulus, tetapi **perangkat Safari iPhone fisik dan WebGL asli belum diuji**. Lihat `QA_TAHAP10.md`.

# BLOCK STRIKE — Tahap 11

FPS 3D single-player melawan bot dengan Three.js/WebGL. Build ini melanjutkan Tahap 7; peta, collision BSP, pintu, props, karakter, dan graf navigasi asli dipertahankan.

**Verdict: CONDITIONAL.** Tahap 9 menambah mekanik game; 37/37 tes logika simulasi lulus tetapi WebGL sungguhan dan Safari iPhone fisik tidak dapat diuji di lingkungan ini. Lihat `QA_TAHAP9.md`. `QA_REPORT.md` adalah bukti baseline Tahap 8, bukan pengujian ulang Tahap 9.

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
| Klik kanan / V | Aksi khusus: zoom, toggle peredam USP/M4A1, angkat/turunkan tactical shield |
| Roda mouse | Ganti senjata; ubah level saat scoped |
| R / Space | Reload / lompat |
| B / O | Buy menu / equipment |
| 1–5 / G | Slot inventaris / granat |
| Tab | Tahan untuk scoreboard |
| Esc | Tutup buy menu atau menu jeda |

Klik arena mengunci pointer desktop. Gunakan B dan Esc ketika pointer terkunci. Dalam buy menu, 1–8 memilih kategori dan 9 menutup menu; Tab memindahkan fokus.

**iPhone landscape:** joystick kiri, swipe kanan untuk mengarahkan kamera; kontrol fire/reload/jump/crouch/scope/action/buy/grenade/pickup/NVG memakai ikon SVG. Layout dapat dipindahkan dan disimpan. AWP/Scout memiliki dua tingkat zoom; AUG/SG-552 mempertahankan crosshair dan viewmodel. CSS menggunakan safe-area insets. Safari standalone tersedia pada meta tag tetapi A2HS belum diuji fisik.

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
- Tahap 9 mengganti grenade instan dengan proyektil/efek dan mengaktifkan peredam/tameng. Implementasi belum diuji pada WebGL dan Safari iPhone fisik dalam sesi ini.
- Karakter memakai animasi idle/run/death yang tersedia; tidak mengada-adakan clip fire/reload karakter yang tidak ada pada sumber.
- Class mengubah avatar pemain dan rekan pemimpin regu. Avatar lokal disembunyikan pada first-person.
- Buy menu menjeda simulasi seperti baseline. Ammo primer/sekunder mengisi reserve slot terkait dengan harga yang ditampilkan.
- Tidak ada service worker; aset lokal lengkap bukan jaminan cache offline Safari.

## Pengembang

Runtime: `js/game-core.js`. Integrasi Tahap 8: `game-systems8.js`, `classic-ui.js`, `layout-nav.js`, `css/classic.css`. Integrasi Tahap 9: `game-systems9.js`, `css/tahap9.css`. Pipeline MDL: `tools/mdl2glb/`. Tes: `tools/qa/` memerlukan Python + numpy/Pillow dan Node + Playwright hanya untuk pengembang. Bukti di `qa/`. Dokumentasi Tahap 7 dipertahankan sebagai catatan historis.


## Tahap 9: kontrol dan mekanik

- **Desktop:** WASD/Mouse; Klik kanan/V = aksi khusus senjata (zoom, silencer USP/M4A1, angkat/turunkan shield); Ctrl = jongkok (hold); C = kategori radio; N = night vision on/off (harus beli); E = ambil dropped weapon; G = lempar grenade; R = reload; B = buy; Space = lompat.
- **Mobile:** tombol gameplay memakai ikon SVG; tombol tipe grenade untuk berganti HE/Flash/Smoke, tombol grenade untuk lempar, NVG untuk on/off, ikon jongkok dan ambil senjata. Settings → Customize Mobile Control Layout: drag-and-drop, ukuran, transparansi, preset 2/3/4 jari. Crouch mode dapat Toggle atau Hold.
- **Scope:** HUD HP, armor, ammo, uang dan timer tetap di atas scope. Sniper mengaktifkan lingkaran scope, sementara zoom AUG/SG552 mengikuti tampilan optical Tahap 8.
- **Senjata:** USP/M4A1 silencer dengan animasi + suara; Shield ada di Buy → Equipment untuk CT ($2200), memakai slot primary dan bisa mengangkat/turunkan perisai. Ketika shield turun, tembak menggunakan pistol; ketika terangkat, tembakan dari depan diblokir.
- **Grenade:** HE memberi radial damage, Flash membutakan sementara dan mengganggu bot, Smoke menghalangi garis pandang dan memudar.
- **Drop/pickup:** bot yang mati menjatuhkan world model senjatanya. Dekati → AMBIL/BATAL atau E; senjata lama pada slot yang sama jatuh agar bisa diambil kembali.
- **Night vision:** pembelian bukan aktivasi. Tekan N atau tombol NVG setelah pembelian.

Seluruh kode tetap statis untuk GitHub Pages. Fitur di atas telah diimplementasikan tetapi **validasi browser WebGL sungguhan/tes di iPhone fisik belum dilakukan**; baca laporan QA Tahap 9.

## Tahap 10 — bot, radio, match dan scoreboard

- Urutan NEW GAME: Pilih MAP → **MATCH CONFIGURATION** → Pilih CT/T → Kelas → Mulai.
- **Max Players:** input bilangan bulat dari **2 sampai 32**, bebas misalnya 2,3,6,17,24,31,32. Angka adalah total manusia + bot. Misalnya CT 24: 1 player + 11 CT bot versus 12 T bot. Untuk angka ganjil, tim player mendapat satu slot lebih.
- **AI Difficulty:** Easy, Normal, Hard. Semua bot sekutu dan musuh pakai tingkat yang sama; tidak ada bonus HP/damage berdasarkan difficulty. Aksi radio dan LOS mengatur target; bot tidak otomatis tahu posisi musuh yang tersembunyi.
- **RADIO:** Keyboard Z=Group, X=Team, C=Reports; angka 1–3 memilih perintah; Esc menutup radio. Pada mobile tekan ikon radio, pindah tab Z/X/C, lalu perintah. Need Backup memanggil bot sekutu; Follow/Regroup membuat bot mengikuti; Hold menahan posisi; Attack maju ke titik yang player tunjuk. Bot hanya menembak target yang terdeteksi.
- **SCOREBOARD:** tahan Tab PC; di mobile ketuk ikon Scoreboard dan ketuk overlay untuk menutup. Memuat CT/T, kills, deaths, status hidup, HP dan identitas bot; tidak menampilkan ping palsu.
- **ASET:** `assets/phase10/audio/{radio,bot}/` adalah hasil kompresi MP3 dari dua RAR unggahan pengguna. `assets/phase10/fx/` berisi sprites PNG dari 7Z muzzle flash dan WAD3 darah. Hanya klip terpilih digunakan untuk menghemat download iPhone.
- **Performance:** 25–32 pemain ditandai eksperimental sampai ada QA GPU/Safari fisik.
- **QA:** `python tools/qa/tahap10_simulated.py`, `python tools/qa/tahap9_regression10.py`, `python tools/qa/validate_tahap10.py`, dan `python tools/qa/validate_assets.py`.

## Tahap 11: kontrol baru
- PC: buka radio `Z`, `X`, `C`; pilih perintah menggunakan `1` sampai `9`, ganti tab atau klik MORE untuk tambahan. `Tab` menampilkan scoreboard kedua tim secara bersamaan, `Ctrl` tetap untuk crouch pemain.
- Mobile: tombol radio; daftar opsi di-scroll dengan usapan; scoreboard CT/T berdampingan dengan scroll independen; tombol tutup `×`.
- Bot: crouch dilakukan otomatis secara situasional (termasuk perintah Hold); semua bot mulai ronde pertama dengan pistol/$800 dan membeli senjata di awal ronde berikutnya jika mampu. Data uang setiap bot terlihat di scoreboard.
- Shield: selagi shield dipilih, klik kanan/tombol aksi mengangkat atau menurunkan; setelah diturunkan pistol tunggal termasuk Desert Eagle dapat digunakan. Dual Elites tidak kompatibel.
