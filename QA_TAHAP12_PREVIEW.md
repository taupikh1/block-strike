# BLOCK STRIKE — QA Tahap 12 Preview (Bot & Mobile Controls)

**Verdict: CONDITIONAL.** Hanya tes logika/input/browser tersimulasi dan validasi struktur aset. Rendering GPU asli, Safari fisik, dan seluruh rute BSP **NOT TESTED**.

## Eksekusi tes yang benar-benar dijalankan
- `python tools/qa/tahap12_preview.py`: **24/24 PASS**, tidak ada page error.
  - Simulasi match 6 pemain, keyboard Shift hold/release, sprint dinonaktifkan oleh crouch, mobile sprint toggle.
  - Pointer event fire: sambil menembak, drag mengubah yaw/pitch, lepas sentuhan menghentikan tembakan.
  - Bot mengganti tujuan patroli setelah mencapai tujuan sebelumnya, animasi visual mount hadir.
  - Fallback crouch lama dan native crouch tanpa offset negatif tambahan.
  - 8 GLB karakter mempunyai 16 nama animasi yang diperlukan, empat thumbnail CT unik.
- `python tools/qa/tahap11_targeted.py`: **39/39 PASS** dengan render/model stub.
- `python tools/qa/tahap11_from10.py`: **51/51 PASS** dengan render/model stub.
- `python tools/qa/tahap11_from9.py`: **37/37 PASS** dengan render/model stub.
- `python tools/qa/validate_assets.py`: **PASS** 31 animated weapon GLBs, 165 WAV, 34 transparent weapon icons.
- `node --check` pada semua JS gameplay yang diubah: **PASS**.
- `trimesh` berhasil memuat seluruh 8 GLB karakter yang diperbarui, geometri terdeteksi, nama animasi terbaca.

## Batas pengujian
- `THREE.WebGLRenderer` dan `GLTFLoader` pada browser tes disimulasikan, jadi screenshot hasil tes **bukan representasi WebGL sungguhan**.
- `PointerEvent` dalam tes disuntikkan ke DOM untuk menguji wiring. Tidak ada verifikasi gesture fisik 2/3/4 jari di Safari iOS.
- Test native crouch memverifikasi tidak ada tambahan offset tubuh. Belum memverifikasi kontak kaki, hitbox, reload animation, animasi death, atau penempatan aksesori pada GPU asli.
- Patroli berbasis tujuan periodik tidak menjamin seluruh nav graph, pintu, tangga dan sudut sempit BSP bebas stuck; uji pada keempat map diperlukan.
- Pembaruan UI CT berasal dari gambar PNG pada ZIP yang diberikan pengguna; `arctic` dan `terror` MDL identik SHA-256.
- Mengubah 8 GLB menambah ukuran runtime, perlu pengukuran memori dan waktu loading iPhone 13.

## Bukti lokal
- `qa/tahap12-preview/checks.json` dan `qa/tahap12-preview/controls-simulated.png`
- `qa/tahap11/targeted.json` dan laporan QA lama (regresi)
