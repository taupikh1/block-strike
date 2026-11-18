# BLOCK STRIKE — Tahap 14A (Weapon & Character Model Cleanup)

Basis: Tahap 13. Ruang lingkup: **14A saja**, tidak termasuk 14B–14G.

## Perubahan

- Menghapus kotak aksesori buatan `attachCharacterGear()` yang mengambang pada karakter Phoenix, Arctic dan Urban. Pertahankan model/tekstur karakter asli yang sudah membedakan kelas.
- Memperbaiki konverter `tools/mdl2glb/convert_held.py`: segitiga p_ MDL yang menghubungkan beberapa tulang tidak lagi dibuang. Setiap segitiga dibawa utuh ke bone Hand target, dan koordinat dikonversi menjadi bone-local mengikuti bind pose GoldSrc.
- Membuat ulang 31 GLB `assets/models/held/*.glb` dari model `p_*.mdl` yang diberikan pengguna, tanpa menambah model placeholder.
- Menambahkan validasi batas ukuran world-space pada `equipBot` sebelum sebuah senjata dipasang ke tulang tangan bot. Skala mengikuti root armature karakter, bukan scaling ganda.
- Memperbarui label versi menjadi Tahap 14A serta menambahkan tes aset dan pemuatan GLTF nyata.

## Tidak termasuk / belum selesai

- Tampilan gabungan first-person Tactical Shield + pistol serta pemilihan slot shield (14B/14C).
- Perubahan sistem grenade, input iOS, hold-to-fire (14D–14F).
- Rendering 3D pada GPU asli / Safari fisik belum teruji; pembuktian hilangnya bidang putih di layar pengguna masih memerlukan gameplay nyata.
