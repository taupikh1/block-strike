# Third-party asset notes

BLOCK STRIKE is a fan-made browser game. The user-supplied `default-weapon-models.zip` contains Counter-Strike / GoldSrc first-person weapon models (`.mdl`) and weapon sound files (`.wav`). The source download page describes the pack as the original CS 1.6 weapon models and sounds.

## Source attribution

- Download page: https://cs16planet.ru/modeli-oruzhiya-cs-16/26189-standartnye-modeli-oruzhija-dlja-cs-16.html
- Site rules: https://cs16planet.ru/rules/
- Required source credit based on the site's published general rule: **CS16planet.ru — “Стандартные модели оружия и звуки для CS 1.6”**, with a direct, active link to the download page above.

The published site rules state that copying and using materials from the site is permitted only with author attribution and a direct, active source link. This project records that attribution and source link here.

## Rights limitation

The source archive itself contains no license, licence, readme, copyright, or notice file. The download page describes the files as original Counter-Strike 1.6 models and sounds, but it does not provide a specific license for the underlying model/audio works or expressly explain whether users may convert, repackage, redistribute, or publicly host those third-party assets. The site's attribution rule is not treated here as definitive proof that every underlying rights holder has granted those permissions.

- The converted GLB models and copied WAV files are included in this local project build at the user's request.
- Converting an MDL file to GLB does not change ownership or grant additional rights.
- Before publishing the models or WAV files through GitHub Pages or another public host, obtain confirmation that the source/rights holders permit conversion and redistribution, or replace the assets with appropriately licensed alternatives.
- The project's own HTML, CSS, and JavaScript are separate from the rights to the third-party game assets.


## Tahap 8 — paket input dan konversi

| Sumber | Penggunaan / format | Status hak yang diketahui |
|---|---|---|
| ZIP game Tahap 7 dari pengguna | Karakter CT/T GLB; map BSP yang telah diekspor; tekstur, skybox, props; kode baseline | Atribusi lama dipertahankan. Tidak ditemukan grant baru untuk redistribusi publik semua aset |
| default-weapon-models.zip | 31 v_ MDL → animated GLB, 31 p_ MDL → bone-local GLB, 34 w_ MDL → GLB/ikon PNG; 165 WAV | Kredit CS16planet.ru di atas tetap berlaku; underlying asset rights tidak otomatis diberikan oleh konversi |
| hud-armory-xtreme-cs16forge.zip | SPR → atlas PNG; shield pada HUD memakai 640hud7 | cs16forge.txt disertakan utuh di root; lihat batas publikasi berikut |
| CSGO_GUI1.6_Fixed.zip | TGA/RES/config diperiksa; konversi PNG dan warna GUI yang sudah ada pada Tahap 7 dipertahankan | Tidak ditemukan lisensi distribusi lengkap pada paket. RES tidak dieksekusi oleh browser |
| Three.js 0.128.0 | three.min.js, GLTFLoader.js, SkeletonUtils.js dibundel lokal | MIT, copyright dan lisensi lengkap di js/vendor/LICENSE |
| Ikon ammo/nightvision/cross | SVG dibuat untuk build ini | Bagian kode/grafik tambahan proyek; tidak mengambil artwork manusia dari GUI |

### HUD / CS16Forge

Sumber: https://cs16forge.com/hud/full/hud-armory-xtreme/

Berkas sumber menyatakan: “Free for personal use, your own game server and game builds.” Berkas itu juga meminta notice dipertahankan dalam root build, meminta berbagi tautan sumber daripada mengunggah ulang arsip, dan menyatakan “Any other republishing requires our written permission.” Ketentuan ini dicatat sebagai bukti yang ada, bukan dianggap sebagai izin tanpa batas untuk publikasi web seluruh karya asal. Hak karya asli tetap pada penulisnya. Notice dan hash sumber ada di `cs16forge.txt`; terms: https://cs16forge.com/terms/ .

### Map dan karakter

Map KVARTAL mencantumkan penulis **Smith** pada `assets/maps/cs16-kvartal/*_KVARTAL.txt`; file tersebut dipertahankan. Nama mode pada resource asal tidak berarti objective hostage/VIP/escape sudah tersedia di browser. Karakter dan senjata berasal dari ekosistem Counter-Strike/GoldSrc; build ini bukan produk resmi Valve.

### Turunan visual

Ikon senjata dibuat dengan render ortografik model world asli, tanpa karakter. Preview class dibuat dari model karakter dan held weapon yang sama dengan runtime. Background menu merupakan render peta game lokal. Konversi tidak mengubah kepemilikan atau memberi lisensi baru. Paket akhir disediakan sebagai hasil kerja lokal atas file pengguna; izin publikasi pihak ketiga tetap perlu dipastikan sebelum redistribusi publik.

Alpha 45 tekstur foliage map hasil ekspor Tahap 7 diperbaiki (palette key hitam menjadi transparan); warna RGB, geometri, dan graf navigasi tidak diubah oleh langkah ini. Daftar dan skrip konversinya disertakan di `tools/foliage-alpha.json` dan `tools/fix_prop_alpha.py`.


## Tahap 10: empat arsip disediakan pengguna

- `bot_chatter_remixed.rar`: sumber klip bot radio/chatter WAV, 491 nama entry. Dipilih 42 klip relevan, dikonversi ke `assets/phase10/audio/bot/*.mp3`. Sebagian entry RAR tidak dapat didekompresi bersih dengan libarchive; gunakan hanya hasil ffprobe valid.
- `radio_remixed.rar`: 44 WAV radio CS, dikonversi ke `assets/phase10/audio/radio/*.mp3`.
- `muzzle_flash_pack.7z`: file GoldSrc `muzzleflash1.spr`, `muzzleflash2.spr`, `muzzleflash3.spr`; first frame dikonversi menjadi PNG transparan `assets/phase10/fx/muzzleflash*.png`.
- `hd_blood_packed_by_ralex_08.7z`: file GoldSrc decals WAD3 dua varian; sebagian blood/bigblood dikonversi menjadi PNG RGBA.

**Hak penggunaan dan redistribusi paket mod pihak ketiga belum diverifikasi.** Keempat arsip aslinya tidak disertakan di rilis untuk menghindari menggandakan sumber mentah. Hasil konversinya tetap mungkin tunduk pada hak cipta paket asli. Nilai penerbitan publik perlu ditinjau oleh pemilik proyek.


### Tahap 11 character reskin
`assets/models/t/arctic.glb` dan `assets/ui/classes/arctic.png` merupakan **reskin warna dari aset karakter pengguna yang telah tersedia pada Tahap 10**, bukan model geometri orisinal baru. Hak model/tekstur sumber mengikuti hak pemilik aslinya. Tidak ada model baru yang diunduh untuk Tahap 11.
