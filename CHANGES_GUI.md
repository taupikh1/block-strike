> Catatan historis sebelum Tahap 8. Status terkini: README.md dan QA_REPORT.md.

# Tambahan GUI

- assets/gui: 310 PNG hasil konversi dari CSGO GUI 1.6.
- css/gui-theme.css: variabel warna dari ClientScheme.
- Belum ada perubahan layout HUD atau menu.

## Integrasi tahap 2
- Buy menu: ikon senjata dan equipment dari assets/gui (29 ikon) ditampilkan di tiap item.
- css/gui-theme.css dimuat di index.html; judul buy menu memakai warna tema.
- Belum diuji di browser/iPhone.

## HUD CS 1.6 (tahap 3)
- HP, armor, uang, ammo, timer, crosshair dinamis, kill feed, scoreboard (Tab), radar lingkaran.
- Belum diuji di browser/iPhone.

## Map Kvartal (tahap 4)
- as/cs/es_kvartal.json dikonversi dari BSP asli (tools/bsp2json). Collision pakai hull pemain, grid 96 unit Hammer.
- Batas dunia dan zona beli mengikuti map (bukan lagi 29.4 tetap).
- Belum diuji di browser/iPhone.

## Tahap 2 (render BSP)
- cs_kvartal dan as_kvartal dirender dari geometri BSP asli dengan tekstur (assets/maps/bsp). Collision masih pakai blok konversi.
- Blok konversi disembunyikan secara visual di map BSP tapi tetap dipakai untuk tabrakan dan tembakan.
- Langit (sky) belum dirender, tampil hitam.
- Map bisa diganti setelah init (sebelumnya harus reload halaman).
- Belum diuji di Safari iPhone.

## Tahap 4a (langit)
- Skybox dari gfx/env (hav untuk cs_kvartal, vostok untuk as_kvartal) dipasang sebagai kotak 280 unit yang mengikuti kamera.
- Kotak diputar sesuai rotasi map. Orientasi sisi sudah dicek lewat render software untuk cs_kvartal; belum dicek di browser.
- Kabut untuk map BSP dilebarkan (90 sampai 150) supaya geometri jauh tidak hilang.
- Props (model .mdl) belum dikerjakan; itu tahap 4b.

## Tahap 4b (props)
- Props dari entity model (.mdl) dikonversi (65 model unik untuk cs_kvartal, 61 untuk as_kvartal). Semua model ditemukan (pencarian nama tidak sensitif huruf besar).
- Transparansi: warna biru murni pada tekstur bermasker diperlakukan sebagai transparan.
- Props belum punya collision dan belum digabung (draw call sekitar 1000), itu untuk tahap 5 dan 9.
- Belum diuji di Safari iPhone.
