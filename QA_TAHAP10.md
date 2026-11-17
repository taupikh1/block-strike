# BLOCK STRIKE — QA Tahap 10 (17 November 2026)

**VERDICT: CONDITIONAL / REAL WEBGL & SAFARI IPHONE BELUM TERVERIFIKASI**

Source baseline: BLOCK STRIKE Tahap 9 yang dibangun dari 5 arsip Tahap 8 pengguna. Tahap 10 dikembangkan di salinan independen, tidak mengubah berkas sumber asli.

## Ringkasan implementasi batch

| Batch | Implementasi | Batasan yang teruji |
|---|---|---|
| **10A Radio & Bot Orders** | Z/X/C PC, menu radio mobile, perintah Follow / Cover / Hold / Attack / Backup / Regroup, bot mengubah target navigasi, respons dan laporan suara berdasarkan event dengan cooldown | Logic: perintah mengubah state sekutu, bukan musuh; kontrol keyboard dan tombol mobile. Tidak ada playthrough A* peta BSP nyata |
| **10B Aset 4 arsip** | Radio MP3 (44 klip), chatter bot MP3 (42 klip), sprite muzzle flash GoldSrc (3 PNG), decal darah WAD3 (32 PNG), efek GPU ringan dengan lifecycle cleanup | PNG & MP3 valid. Belum diperiksa kualitas suara/efek dengan perangkat fisik. Dua entri RAR bot memunculkan error pembacaan checksum/header saat pemrosesan; klip terpakai tetap lolos ffprobe |
| **10C Match Setup** | Field angka bebas **2–32** (step 1), shortcut 2/6/12/16/24/32; 1 manusia + N−1 bot, pembagian genap, angka ganjil berpihak 1 slot ekstra ke tim player. Match setting disimpan localStorage | Diuji 2, 6, 17, 24, 31; 32 sebatas pengaturan, performa eksperimen |
| **10D AI Difficulty** | Easy/Normal/Hard memengaruhi reaction, aim, vision, scan cadence, movement pada seluruh bot sekutu dan musuh. Deteksi visual perlu LOS dan tidak terus melacak posisi musuh yang tersembunyi. Grenade HE bot terbatas berdasar difficulty dan jarak aman teman | Simulasi logic dan ownership grenade; bukan jaminan taktik cover/aim setara CS 1.6. Tidak mengubah HP atau damage bot berdasarkan difficulty |
| **10E Scoreboard** | Tab PC (hold), ikon mobile (toggle), seluruh CT/T termasuk bot mati sampai pergantian ronde; kills, deaths, status, HP, kategori LOCAL/BOT | Data dari state kill/death asli, tanpa ping fiktif; 6 dan 24 peserta diuji |
| **10F Performance & QA** | AI scan dan movement interval menyesuaikan jumlah karakter, efek visual terikat lifetime, HUD fixed iPhone landscape dan editor kontrol dapat menggeser tombol baru | Render GPU sungguhan, performa 24–32 bot, input iOS Safari fisik **belum diuji** |

## QA yang benar-benar dijalankan

- **Simulasi Tahap 10:** `51/51 PASS`, exceptions: `0`. Fixture: Chromium headless `about:blank`, semua JS/CSS inlined, stub **THREE.WebGLRenderer, THREE.GLTFLoader dan THREE.TextureLoader**. Ini memverifikasi state dan event, **BUKAN** rendering/asset WebGL sungguhan.
- **Regresi Tahap 9:** `37/37 PASS`. Cakupan meliputi scope HUD, silencer, shield, crouch, night vision, player grenade HE/flash/smoke, dropped weapons, pickup, kontrol mobile editor.
- **Validasi aset dan JS Tahap 10:** `57 PASS`, `0 FAIL`. ffprobe 86 MP3, PNG dari 7z/WAD3 dan JS `node --check`.
- **Validasi aset lama:** `python tools/qa/validate_assets.py` PASS (31 GLB animasi, 165 WAV, 34 ikon weapon).
- **Keterbatasan browser lokal:** percobaan konteks WebGL Chromium mode SwiftShader / Mesa / ANGLE memberi `null`; tidak ada pengujian GPU asli yang dapat diklaim. Browser lokal tidak mengizinkan navigasi HTTP host test. Safari iPhone13/A2HS belum dites.

## Defek dan risiko terbuka

1. **BLOCKER verifikasi visual:** gameplay 3D, animasi bot, muzzle flash, darah, radio audio yang terdengar, tabrakan BSP, line-of-sight di 4 peta, dan FPS GPU perangkat belum dibuktikan di browser 3D nyata. Lakukan QA setelah deploy.
2. **25–32 peserta = eksperimental.** Simulasi tidak mengukur frame rate, temperatur iPhone, jumlah draw call aktual, atau A* pada peta CS Kvartal dengan 64.603 node.
3. **Spawn BSP:** bila spawn native map tidak cukup, ada pencarian posisi staggered dengan cek capsule/headroom; jika geometri sangat sempit dapat terjadi fallback overlap. Harus diukur pada masing-masing peta.
4. **AI:** Hard tidak menggunakan wallhack. Bot mengejar titik terakhir terlihat dan objective/arah perintah, bukan koordinat musuh tersembunyi terus-menerus. Flanking/cover lanjutan dan koordinasi tim kompleks belum setara AI CS 1.6 asli.
5. **Audio sumber:** Radio Remix mempunyai 44 WAV, semuanya dikonversi ke MP3; Bot Chatter Remix mempunyai 491 WAV, dipilih 42 klip relevan. Dua entri RAR saat ekstraksi mengalami error checksum/header; hasil konversi yang dipakai lolos ffprobe, tetapi **audible quality** masih perlu mendengarkan.
6. **Konversi visual:** `.spr` hanya first frame dari setiap sprite, bukan animated sprite penuh. Decal WAD3 dipakai sebagai transient sprite, bukan decal persisten pada geometri BSP; belum ada balistik peluru baru.
7. **Lisensi:** sumber aset berasal dari empat arsip unggahan pengguna. Hak publikasi/redistribusi pihak ketiga belum diverifikasi. `ASSET_NOTICES.md` memuat catatan.
8. GitHub push tidak dilakukan; konektor GitHub sebelumnya mengembalikan `403 Resource not accessible by integration` untuk operasi tulis.

## Tes manual wajib sebelum menandai release PASS

1. Deploy folder `BLOCK_STRIKE` lewat HTTP/GitHub Pages, buka Safari iPhone 13 Landscape dan browser desktop; cek start tanpa 404/exception, model & textures ter-render.
2. Pilih **2, 6, 17, 24, 31, 32** lalu cek roster nyata dan posisi spawn CT/T di keempat map. Dokumentasikan FPS, bottleneck, dan masalah tumpukan spawn.
3. Pilih CT dan T; setiap sisi, pada Easy/Normal/Hard, ukur reaksi, akurasi dan komunikasi perintah untuk bot sekutu dan musuh.
4. Tekan Z→1 Cover, X→1 Attack, X→2 Backup, Z→3 Hold, X→3 Regroup; pastikan AI mengubah rute dan balasan suara tidak saling menumpuk.
5. Periksa radio dan bot chatter dari speaker, volume, kompatibilitas Safari MP3 serta cooldown per bot.
6. Tembakkan USP, M4A1, AK-47, dan AWP, pastikan muzzle flash muncul pada moncong senjata yang benar. Tembak bot dan lihat efek darah tanpa layar biru/putih.
7. Tahan Tab desktop; di mobile gunakan tombol papan skor; cek kills/deaths dari kematian pemain maupun bot, susunan tim dan scroll 32 orang.
8. Uji radio dan scoreboard di layout editor 2/3/4 jari, cek tidak tumpang tindih dengan tombol scope, buy, notch dan home indicator.
9. Ulang seluruh regresi Tahap 9 di browser nyata: HUD scope, shield, grenade, night vision, pickup senjata, kontrol, dan death/restart.
10. Putar 20–30 menit dan ukur memori, audio source, sprite FX cleanup, serta jalur BSP pada map CS Kvartal / AS Kvartal / ES Kvartal.

**Status implementasi dan status pengujian sengaja dipisah.** Jangan mengklaim semua mekanik sudah sempurna hanya dari simulator.
