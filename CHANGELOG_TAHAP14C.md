# BLOCK STRIKE — Tahap 14C (18 November 2026)

**Baseline:** Tahap 14B. **Cakupan:** hanya 14C (Shield Inventory & Weapon Switching). Batch 14D–14G belum dikerjakan.

## Perubahan

- Aturan shield terpusat di `js/game-systems14c.js`: shield sebagai primary, dapat digabung dengan pistol satu tangan, knife, dan grenade yang tetap tersedia dari kontrolnya.
- Weapon switch desktop (mouse wheel dan hotkey angka), tombol GANTI mobile, chips dan Weapon Selector hanya menampilkan `PISTOL + SHIELD` atau `KNIFE` selama shield dimiliki. Tidak ada mode pistol telanjang yang diam-diam menghilangkan shield.
- Pembelian Desert Eagle, USP, Glock18, P228, atau Five-SeveN memperbarui pistol yang tampil dengan shield; mencegah Dual Elites.
- Pembelian primary lain, primary ammo, dan pickup rifle dilarang selama shield masih dimiliki, dengan pesan yang jelas. Pemain dapat melepaskan shield secara eksplisit lalu membeli senjata primary lain.
- Shield dapat dijatuhkan tanpa menghapus pistol/knife. Mengambil shield dari dunia pada CT dapat mengganti primary yang dipegang; T tidak dapat mengambil shield, dan shield kedua tidak diambil ulang.
- Pickup pistol saat memiliki shield mengganti pistol lama dan tetap menjaga shield. Pickup yang membutuhkan world drop lama dibuat atomik: bila pembuatan world drop gagal, inventory tidak diubah.
- Melepas shield mereset status raised untuk menghindari status shield tersangkut jika shield diperoleh kembali.
- Tetap menggunakan viewmodel dan animasi Tahap 14B; tidak mengubah aset, engine, model, damage, grenade, atau HUD Safari.

## QA

- 33/33 tes khusus 14C Chromium simulasi lulus, nol page error.
- 30/30 tes viewmodel Tahap 14B lulus.
- 34/34 tes regresi Tahap 13 lulus.
- 27/27 tes perhitungan combat Tahap 12 lulus; validator aset juga lulus.
- GPU WebGL fisik/Safari iPhone 13 **belum diuji**. Tes WebGL via Chromium SwiftShader gagal membuat konteks.

Rincian: `QA_TAHAP14C.md`.
