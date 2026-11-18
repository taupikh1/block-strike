# QA — BLOCK STRIKE Tahap 14A

Status: **PASS WITH LIMITATIONS / CONDITIONAL**. Tidak diklaim bebas bug visual.

## Verifikasi yang benar-benar dilakukan

- `python tools/qa/tahap14a_assets.py /path/ke/p_models`: **113/113 PASS**. Memeriksa 31 GLB held dan 8 skeleton karakter, semua segitiga sumber terlindungi (tidak terbuang), validitas material, nama tulang Hand, dan world-size (menggunakan skala 0,028), serta memastikan aksesori kotak tidak dibuat lagi.
- `python tools/qa/tahap14a_parse_runtime.py`: **7/7 PASS**. Chromium memuat GLB sebenarnya dengan GLTFLoader Three.js: 2 karakter (GIGN, Terror) dan 5 held weapon (USP, Glock, AK47, Dual Elites, Shield), termasuk tekstur dan skeleton. Bukan renderer simulasi untuk *parsing* GLB, namun tanpa WebGL GPU.
- `python tools/qa/tahap13.py`: **34/34 PASS**. Regresi gameplay Tahap 13 di Chromium (renderer & GLTFLoader disimulasikan).
- `python tools/qa/validate_assets.py`: **PASS** (31 animated weapon viewmodels, 165 WAV, 34 ikon); `node --check`: **PASS** untuk JS utama.

## Keterbatasan

- Browser di lingkungan ini menolak HTTP localhost dan konteks WebGL sungguhan. Tidak ada bukti screenshot render senjata NPC melalui GPU.
- GLB dengan model sumber sah dan ukuran wajar tidak menjamin pose sempurna di setiap animasi. Uji gerak, jongkok, pembelian senjata, kamera, dan semua skin dalam Safari iPhone diperlukan.
- Penggabungan tampilan first-person Tactical Shield + pistol **bukan bagian 14A** dan akan dikerjakan pada 14B bila diinstruksikan.
- Pengecekan model world `w_` dan fisika buang/ambil senjata belum berubah.
