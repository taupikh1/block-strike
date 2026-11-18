# BLOCK STRIKE — Tahap 14B: Tactical Shield + Pistol Viewmodel

Baseline: Tahap 14A. **Cakupan hanya 14B; 14C–14G tidak dikerjakan.**

## Perubahan

- Mengganti mekanisme tampilan shield+pistol lama, yang mencampur model `p_` pihak ketiga dengan rig `v_shield_r`, dengan susunan dua rig first-person beranimasi yang terpisah: **native shield+hanya tangan dari `shield_r.glb`**, ditambah **hanya geometri pistol** dari model `v_` pistol yang sesuai.
- Menyembunyikan dua primitive pistol Five-SeveN yang menyatu dalam rig shield sehingga tidak ada pistol bawaan yang bertumpuk dengan pistol aktif.
- Model pistol aktif asli dapat dipilih dari USP, Glock18, P228, Desert Eagle, Five-SeveN. Memastikan primitive tangan model pistol tambahan tidak digambar dua kali.
- Memosisikan rig shield lebih jauh ke belakang dan ke sisi kanan agar geometri perisai tidak memotong near-plane kamera (penyebab yang teridentifikasi untuk shield tampak memenuhi layar). Model pistol tetap pada framing first-person senjata aslinya.
- Memutar animasi pistol original (idle/draw/fire/reload) dalam mixer terpisah dan tetap memutar animasi shield asli (up/down/idle/shoot/reload).
- Menyembunyikan pistol saat shield diangkat, menampilkannya kembali saat diturunkan; reset state saat pergantian ronde supaya status shield tidak tersangkut.
- Memperbaiki pemuatan model asinkron agar preferensi tangan kiri/kanan tidak hilang saat viewmodel baru selesai dimuat.
- Menghilangkan jalur attachment `p_*.glb` lama yang bermasalah, dengan delegasi kompatibilitas dari `Phase11.updateShieldView` ke komponen baru.
- Menggunakan seluruh model GLB asli tanpa menambah model pistol/shield placeholder maupun library eksternal.

## Tetap belum termasuk

- Aturan slot inventory/switch/drop/pickup shield (14C).
- Perombakan grenade (14D), Safari touch (14E), hold-to-attack (14F).
- Pengujian rendering GPU sungguhan / iPhone fisik: belum terverifikasi dalam lingkungan ini. Sinkronisasi tangan pada semua frame reload/pistol perlu verifikasi visual.
