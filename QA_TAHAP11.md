# QA REPORT — BLOCK STRIKE Tahap 11

**Tanggal:** 18 November 2026. **Verdict: CONDITIONAL**. Browser GPU sungguhan dan Safari iPhone fisik belum diverifikasi.

## Sumber dan ruang lingkup
- Game dibangun dari gabungan **5 ZIP Tahap 10** pada baseline yang sama; seluruh map, suara, model, dan controller lama dipertahankan.
- Aset radio berasal dari 4 arsip yang diintegrasikan pada Tahap 10. Tahap 11 tidak menambah unduhan aset eksternal.
- Fitur: radio diperluas dan scroll, scoreboard dua kolom, crouch bot, Arctic/Phoenix reskin berbeda, ekonomi dan pembelian bot, shield/pistol.

## Eksekusi tes (bukan klaim asumsi)
1. `python tools/qa/tahap11_targeted.py`: **39/39 PASS**, 0 uncaught JS errors. 844×390 mobile landscape *emulation*, Chromium headless, semua JS dan CSS di-inline; `THREE.WebGLRenderer` dan `THREE.GLTFLoader` **di-stub**, jadi hasilnya hanya memverifikasi state/UI/interaksi.
2. `python tools/qa/tahap11_from10.py`: **51/51 PASS**, 0 JS errors. Regresi fitur Tahap 10 dengan fixture yang disesuaikan untuk 9 radio command dan 2 kolom scoreboard.
3. `python tools/qa/tahap11_from9.py`: **37/37 PASS**, 0 JS errors. Tes dropped weapon menggunakan persiapan primary enemy eksplisit untuk menghindari asumsi lama bot selalu memegang rifle pada ronde 1.
4. `python tools/qa/validate_tahap10.py`: **58 PASS**, 0 FAIL.
5. `python tools/qa/validate_assets.py`: **PASS** (31 animated weapon GLB, 165 WAV, 34 transparent PNG icons, path resolution).
6. Semua `js/*.js`: Node `--check` **PASS**.
7. Pengecekan GLB Arctic: header/length dan struktur JSON valid, 1 skin, 4 animasi, berbeda dari Phoenix; thumbnail Arctic berbeda secara SHA.
8. Eksperimen WebGL asli: Chromium dengan SwiftShader/ANGLE/default mengembalikan `canvas.getContext('webgl') === null` dan `webgl2 === null`; **rendering tidak bisa diuji** dari lingkungan ini.

## Hasil teramati di tes
- Semua bot awal ronde 1 memegang pistol (USP untuk CT, Glock18 untuk T), saldo $800, nama/ID unik. Bot kill: +$300 dan bertambah kill statistik. Akhir ronde menang: +$3250; kalah: +$1400, payout tidak berulang; ronde 2 dompet dipakai untuk membeli loadout valid.
- 33 pilihan radio dirender, setiap sumber audio terhubung ke file MP3 yang ada. Z/X/C masing-masing 9; tab MORE 6. Scroll list diuji pada 844×390: `scrollHeight > clientHeight` dan scroll mencapai akhir; keyboard `Z → 5` mengirim Follow kepada bot satu tim. Perintah laporan suara tidak diam-diam mengubah tujuan bot.
- Scoreboard 32 peserta: 16 CT dan 16 T tampil berdampingan; tinggi panel di bawah tinggi viewport; independen scroll untuk daftar panjang. Kolom menyajikan K/D/$/HP.
- Crouch bot mengubah state, menurunkan posisi mesh dan dapat kembali berdiri; player crouch dari Tahap 9 lolos regresi.
- Shield dapat membeli dan menembakkan Desert Eagle, memakai ammo Deagle yang sesungguhnya. Dual Elites dilarang saat membeli maupun mengambilnya ketika shield ada di inventory.

## Batasan yang HARUS diuji di perangkat asli
- **Animasi crouch model:** tidak ada clip crouch asli di 8 GLB karakter. Pose prosedural lipatan kaki/hip belum dibuktikan di GPU, tidak boleh diklaim setara animasi GoldSrc asli. Lakukan tes di keempat peta termasuk low ceilings, collider/hitbox, dan crouch saat firefight.
- **Shield viewmodel:** attachment pistol di rig FiveSeven bawaan memerlukan tes visual USP/Deagle/FiveSeven di Safari serta pergantian senjata saat membeli dan pickup.
- **Arctic:** ini reskin dari geometri Phoenix, bukan mesh unik. Periksa hasil pada model 3D, bukan hanya thumbnail.
- **Audio radio:** 33 opsi bukan berarti 44 file adalah perintah; sejumlah klip adalah announcer/kemenangan/event. Kualitas audio aktual tidak didengarkan lewat speaker pada tes ini.
- **Bot economy:** aturan reward mengikuti konfigurasi lokal $300/$3250/$1400, bukan jaminan seluruh rumus ekonomi asli CS 1.6 identik; tak ada bank persistence setelah mengulang NEW GAME.
- **32 pemain:** performa FPS nyata, thermal iPhone 13, dan kepadatan spawn BSP belum dievaluasi. Sistem snapshot player jumlah 2..32 tetap, 25–32 eksperimental.
- Peta BSP dan akses UI di Safari standalone Add to Home Screen belum diuji.
- Hak pakai ulang aset pihak ketiga belum terverifikasi penuh, lihat ASSET_NOTICES.md.

## Bukti lokal
- `qa/tahap11/targeted.json`, `qa/tahap11/scoreboard32-simulated.png`, `qa/tahap11/radio_manifest.json`
- `qa/tahap11/simulation.json` (regresi Tahap 10 yang diadaptasi)
- `qa/tahap11_regression/simulation.json` (regresi Tahap 9 yang diadaptasi)

**Status:** implementasi dan pengujian logika PASS; verifikasi visual/GPU dan Safari fisik masih NOT TESTED. Tidak membuat klaim seluruh bug sudah terselesaikan pada perangkat asli.
