# QA — BLOCK STRIKE Tahap 14 Final (14E + 14F + 14G)

**Status: CONDITIONAL — DOM/Pointers & Logic verified; physical Safari and GPU NOT verified.**

Baseline: Tahap 14D (Dust Block only). Seluruh paket mempertahankan 14A–14D.

| Pemeriksaan | Hasil | Bukti |
|---|---|---|
| `python tools/qa/tahap14efg.py` | **34/34 PASS** | `qa/tahap14efg/results.json`, `controls-simulated.png` |
| `python tools/qa/tahap14d.py` | **44/44 PASS** | `qa/tahap14d/results.json` |
| `python tools/qa/tahap14c.py` | **33/33 PASS** | `qa/tahap14c/results.json` |
| `python tools/qa/tahap14b_viewmodel.py` | **30/30 PASS** | `qa/tahap14b/viewmodel-tests.json` |
| `python tools/qa/tahap13.py` | **34/34 PASS** | `qa/tahap13/results.json` |
| `node tools/qa/tahap12_combat.cjs` | **27/27 PASS** | output test command |
| `python tools/qa/tahap14a_assets.py <original p_ models>` | **113/113 PASS** | `qa/tahap14a/assets_results.json` |
| `python tools/qa/validate_assets.py` | PASS | 31 animated GLB, 165 WAV, 34 icons |
| `node --check` setiap `js/*.js` | PASS | static JavaScript parsing |
| `python tools/qa/tahap13_real_webgl.py` | **BLOCKED** | `Error creating WebGL context` |
| Playwright WebKit | **NOT TESTED** | Browser executable not installed |
| iPhone 13 physical Safari / A2HS | **NOT TESTED** | Device not available |

Jumlah 315 pemeriksaan lulus dari suite yang dieksekusi, dengan beberapa cakupan pengujian yang saling tumpang tindih. Ini **bukan** klaim 315 fitur independen ataupun pengujian Safari asli.

## Perilaku 14E/14F yang diuji
- PointerEvent langsung pada tombol dan area gameplay, satu jari pemilik, pelepasan jari lain tidak mematikan fire/stab.
- Tombol fire mobile ditahan lebih dari 800 ms: USP menembak beberapa kali, mengikuti `rate` dan mengurangi amunisi; setelah dilepas berhenti.
- Knife primary ditahan: slash berulang; knife secondary ditahan: stab berulang; mouse kanan desktop juga diuji.
- Dua jari pada primary dan secondary knife dapat menekan bersamaan; secondary mendapat prioritas ketika keduanya aktif.
- Drag pointer ketika menembak/stab mengubah yaw/pitch dengan batas delta dan pitch.
- Menahan ADS pada senjata scope **tidak** mengulang siklus zoom, hanya mengubah zoom satu kali.
- Double-tap pada area game dicegah; `touchscreen.tap()` dua kali pada viewport Chromium tetap memberi visualViewport.scale ≈ 1.
- Native context menu/selectstart/dragstart hanya dicegah pada permukaan game. Input dan scroll list Radio/Buy/Menu tetap diizinkan.
- Blur dan cancel mengosongkan state, sehingga input tidak tetap tertekan.
- Seluruh 14A–14D, darah, spectator, ronde, shield, dan grenade melewati pengujian regresi tersedia.

## Batasan yang harus diuji di iPhone
1. Buka Safari dan Add to Home Screen, orientasi landscape; ketuk FIRE dua kali, tahan FIRE, hold ADS knife, dan seret jari hingga keluar tombol.
2. Gunakan joystick + FIRE + ADS dua/lebih jari. Buka/tutup Buy/Radio/Scoreboard, pastikan scroll dan slider Settings tidak membeku.
3. Periksa apakah iOS menampilkan 'Salin', memilih teks, atau zoom halaman saat gameplay; ini tidak dapat dibuktikan sepenuhnya dari Chromium.
4. Verifikasi frame rate, shader, shield+pistol, smoke/flash, spectator, dan model NPC dalam rendering GPU nyata.

## Kesimpulan
Kode batch 14E–14G siap dijadikan build uji. Tidak ada regresi yang terlihat pada suite yang berhasil dijalankan. **Jangan menandai seluruh visual/perilaku Safari sebagai PASS** sampai ada pengujian fisik.
