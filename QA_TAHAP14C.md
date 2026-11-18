# QA — BLOCK STRIKE Tahap 14C

**Verdict: CONDITIONAL / CODE VERIFIED.** Aturan inventory dan input shield telah diuji secara terintegrasi pada DOM/Three.js dengan renderer yang disimulasikan. Pengujian WebGL/Safari nyata belum tersedia.

## Hasil aktual

| Pemeriksaan | Hasil | Bukti |
|---|---|---|
| `python tools/qa/tahap14c.py` | **33/33 PASS**, 0 JavaScript page error | `qa/tahap14c/results.json` |
| `python tools/qa/tahap14b_viewmodel.py` | **30/30 PASS** | `qa/tahap14b/viewmodel-tests.json` |
| `python tools/qa/tahap13.py` | **34/34 PASS** | `qa/tahap13/results.json` |
| `node tools/qa/tahap12_combat.cjs` | **27/27 PASS** | log test script |
| `python tools/qa/validate_assets.py` | **PASS** | 31 GLB viewmodel, 165 WAV, 34 PNG icon |
| `node --check js/*.js` | **PASS** | syntax utama |
| `python tools/qa/tahap13_real_webgl.py` | **BLOCKED** | `Error creating WebGL context` (renderer tidak dibuat; bukan PASS) |

## Skenario khusus

- Shield dengan USP, ganti knife dan kembali ke USP+shield lewat hotkey, pointer/mobile, dan aturan wheel: PASS.
- Pembelian shield, Desert Eagle dengan shield, ammo pistol, dan perubahan gun slot: PASS.
- Blok pembelian rifle/primary ammo/Dual Elites ketika shield dimiliki tanpa memotong uang: PASS.
- Pembelian primary setelah shield dibuang: PASS.
- Pistol yang dijatuhkan bot bisa di-pickup selama shield aktif; pistol sebelumnya dijatuhkan: PASS.
- Jatuhkan shield, simpan pistol/knife; ambil shield dari dunia dengan primary lain di CT: PASS.
- Pemilihan senjata cuma `PISTOL + SHIELD` dan `KNIFE` saat shield aktif; grenade tetap tersedia melalui kontrol terpisah: PASS.
- Pickup shield oleh T serta pickup shield kedua diblokir: PASS (aturan fungsi; belum tes render real).

## Screenshot (simulasi, bukan bukti GPU)

- `qa/tahap14c/shield-inventory-simulated.png`
- `qa/tahap14c/shield-deagle-simulated.png`

## Batas dan risiko

- Tes Chromium menggunakan `THREE.WebGLRenderer` dan `GLTFLoader` stub untuk interaksi gameplay. Tahap 14B memiliki tes parse model GLB asli yang terpisah, tetapi tidak membuktikan visual akhir 14C di GPU.
- Pengujian iPhone Safari fisik, performa multitouch, posisi pistol+shield pada animasi pertama sesudah pickup, dan rendering dunia saat shield jatuh masih **NOT VERIFIED**.
- 14D (grenade), 14E (Safari input), 14F (hold-to-attack), 14G (final QA) **sengaja belum dikerjakan** sesuai permintaan satu batch per giliran.
