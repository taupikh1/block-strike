# QA — BLOCK STRIKE Tahap 14B

**Verdict: CONDITIONAL / PASS WITH LIMITATIONS.** Implementasi viewmodel lengkap menurut inspeksi kode dan parsing aset, tetapi belum tervalidasi secara visual pada GPU/Safari fisik.

## Bukti pemeriksaan

- `python tools/qa/tahap14b_viewmodel.py`: **30/30 PASS**, 0 uncaught page errors. Chromium menjalankan Three.js GLTFLoader dan AnimationMixer sungguhan untuk model `v_shield_r`, `v_usp`, `v_glock18`, `v_p228`, `v_deagle`, dan `v_fiveseven`. Verifikasi bawaan Five-SeveN tersembunyi, model pistol terpilih tepat, tidak ada primitive tangan ganda, animasi tersedia, shield naik/turun, mirror hand, penghindaran duplikasi, serta proyeksi geometri shield terhadap near-plane kamera.
- `python tools/qa/tahap13.py`: **34/34 PASS**, 0 page errors (regresi Tahap 13 melalui Chromium dengan renderer simulasi).
- `python tools/qa/tahap14a_assets.py /path/to/p_models`: **113/113 PASS**, model sumber `p_*.mdl` diambil dari ZIP asli pengguna untuk pemeriksaan konverter 14A.
- `python tools/qa/tahap14a_parse_runtime.py`: **7/7 PASS**, real GLTFLoader parsing sebagian model karakter dan `p_` dari Tahap 14A.
- `node tools/qa/tahap12_combat.cjs`: **27/27 PASS** untuk kalkulasi damage/armor Tahap 12.
- `python tools/qa/validate_assets.py`: PASS, 31 model viewmodel beranimasi, 165 suara WAV, 34 ikon PNG.
- `node --check` untuk seluruh berkas JavaScript utama: PASS.

## Pengujian yang belum dapat dijalankan

- Rendering WebGL GPU (konteks WebGL tidak tersedia pada browser lingkungan pengujian), screenshot nyata shield+Desert Eagle dan shield+USP, sinkronisasi visual mesh/tangan pada setiap frame animasi.
- Safari iPhone 13 fisik, orientasi landscape, performa shader dan animasi saat bermain.

## Batas dan risiko

- Shader, depth order, dan framing viewmodel perlu diuji secara visual di Safari; proyeksi geometri CPU tidak menggantikan screenshot GPU.
- Tahap 14B tidak mengubah aturan inventory dan pembelian shield. Hal-hal tersebut termasuk Tahap 14C dan sengaja tidak disentuh.
- Apabila model pistol gagal dimuat, fallback menampilkan kembali pistol bawaan shield supaya layar tidak kehilangan senjata sama sekali. Semua lima model pistol tersedia dalam paket lengkap.

**Kesimpulan:** layak sebagai patch 14B untuk uji pengguna, bukan klaim bahwa bug visual sepenuhnya terbukti hilang di Safari.
