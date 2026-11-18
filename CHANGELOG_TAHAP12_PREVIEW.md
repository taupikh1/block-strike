# BLOCK STRIKE — Tahap 12 Preview: Bot & Mobile Controls

Baseline: BLOCK STRIKE Tahap 11. **Ini preview terbatas, bukan Tahap 12 selesai.**

## Perubahan yang diterapkan
- Kontrol sprint: Shift tahan pada desktop, tombol ikon sprint toggle pada mobile; kecepatan +30% selama bergerak, dibatalkan jika crouch, ADS, reload, shield aktif, atau sedang di udara. FOV dan animasi senjata ikut bergeser ringan.
- Tombol fire kini memakai ikon peluru SVG dan mendukung **hold to fire + drag to aim** secara simultan. Pointer capture mempertahankan kontrol ketika jari bergeser keluar tombol. SENS mengikuti settings game.
- Tombol sprint terintegrasi pada editor layout 2/3/4 jari dan disimpan dengan layout kontrol yang sama. Input dibersihkan pada blur, pause, dan pergantian layar.
- Enemy patrol: bot tidak lagi berhenti selamanya setelah mencapai satu titik dekat spawn musuh. Tujuan berpindah secara periodik; tidak mengetahui koordinat player secara magis.
- Gerakan bot: visual model dan hitbox mengikuti interpolasi antara update AI yang jarang, bukan meloncat setiap AI tick. Mempertahankan collision root sebagai sumber logika.
- 8 GLB karakter kini menyertakan **16 clip animasi** per model: 4 clip lama + walk, crouch_idle, crouchrun, jump, variasi shoot dan reload untuk rifle dan pistol.
- Animasi bot menggunakan crouch asli saat tersedia. Penurunan ekstra badan `-0,28` dibatalkan untuk clip native, agar tidak menekan kaki masuk ke lantai. Offset collider BSP `-0,72` TIDAK dihapus karena berkaitan dengan center hull 36 unit GoldSrc × skala 0,02.
- Karakter CT mendapat empat gambar pilihan yang berbeda dari `delta_force_ct_players_pack.zip`. Untuk T, sumber `arctic.mdl` dan `terror.mdl` **identik**, jadi perbedaan siluet menggunakan perlengkapan tambahan sederhana dan reskin Tahap 11, bukan mengklaim model MDL baru yang unik.
- AI dapat menggunakan animasi tembak/reload khusus untuk senjata satu tangan atau rifle bila tersedia. Animasi bukan bukti balistik sudah setara CS 1.6.

## Batasan yang belum selesai
1. Damage semua senjata, headshot, armor penetration, helmet, dan shotgun pellets (roadmap Tahap 12).
2. Animasi dan fisika HE/Flash/Smoke yang lengkap (roadmap Tahap 12).
3. Zoom otomatis kembali normal ketika reload (roadmap Tahap 12).
4. Smoothing dan alignment visual bot pada setiap peta BSP serta efek kematian belum diuji dengan GPU asli.
5. Aset `arctic.mdl` / `terror.mdl` di ZIP pengguna identik; accessory geometry tambahan membuat siluet berbeda tetapi bukan dua sumber model unik.
6. Safari iPhone 13 fisik, multitouch, animasi skeletal, dan performa 24–32 bot masih harus diuji pada perangkat.
7. Izin redistribusi aset pihak ketiga harus diperiksa sebelum unggah publik.

## File penting
- `index.html`, `css/tahap12-hotfix.css`
- `js/game-core.js`, `js/game-systems8.js`, `js/game-systems9.js`, `js/game-systems10.js`, `js/game-systems11.js`
- `assets/models/ct/*.glb`, `assets/models/t/*.glb`
- `assets/ui/classes/{gsg9,gign,sas,urban}.png`
- `tools/extend_player_animations.py`, `tools/qa/tahap12_preview.py`
