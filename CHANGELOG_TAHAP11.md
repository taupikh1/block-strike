# CHANGELOG — BLOCK STRIKE Tahap 11

Tanggal: 18 November 2026. Baseline: hasil Tahap 10 dari 5 ZIP.

## 11A — Radio lengkap dan scroll
- Kategori Z/X/C sekarang masing-masing 9 opsi. Ada tab MORE dengan 6 tambahan: **33 pilihan**, semua memiliki audio MP3 yang tersedia dari 44 klip radio Tahap 10.
- Perintah taktis dibedakan dari laporan suara: Follow/Cover/Hold/Attack/Retreat/Backup/Regroup mengubah order bot, sedangkan pesan konfirmasi/laporan hanya berkomunikasi. Report In meminta respons situasional dari bot terdekat.
- Scroll touch/roda mouse untuk daftar, dukungan keyboard 1-9, pemilihan tab tidak menutup panel, dan kontrol saat menu dibuka dicegah bentrok.

## 11B — Scoreboard ringkas
- Panel dibagi CT kiri dan T kanan, daftar scroll terpisah, baris dan teks rapat, tombol tutup mobile.
- Kills, deaths, HP, dan uang setiap bot berasal dari state sebenarnya; pemain manusia ditandai ★. Tabel diuji dengan 6 serta 32 peserta pada emulasi viewport mobile.

## 11C — Bot crouch
- Bot kini memakai crouch bertujuan sesuai AI, kesulitan, tembakan, dan perintah hold; mengurangi kecepatan dan memakai hull yang lebih rendah pada BSP.
- Skeleton yang hanya memiliki idle/run/fire/death diberi pose pinggul/lutut prosedural, penurunan tinggi model dan hit proxy, dan asal tembakan saat crouch diturunkan.
- Crouch pemain sendiri dari Tahap 9 dipertahankan; bukan implementasi baru.

## 11D — Model karakter
- Menghilangkan duplikat tepat antara `arctic.glb` dan `terror.glb`: membuat **reskin Arctic berpalet salju** dari tekstur model terdahulu, termasuk gambar pilihan kelas.
- Kedua karakter masih berbagi geometri/skeleton yang sama, tetapi tekstur dan kartu pilihan sekarang berbeda. Tidak mengklaim model baru sepenuhnya.
- Model CT lain tidak ditemukan identik secara byte pada audit.

## 11E — Ekonomi bot dan pistol awal
- Seluruh bot ronde pertama memulai dengan USP (CT) atau Glock18 (T), dan dompet awal $800 per bot, tanpa rifle gratis.
- Bot menerima $300 per kill lawan, hadiah ronde $3250 untuk tim menang / $1400 untuk tim kalah, masing-masing satu kali per ronde, saldo maksimum $16000.
- Dompet, kills, deaths bertahan antarronde untuk bot pada slot tim yang sama. Pada ronde berikutnya bot membeli senjata sesuai saldo dan tim; sisa uang tidak boleh negatif.
- Armor bot yang dibeli memengaruhi damage, bukan sekadar pengeluaran uang; akurasi/range tetap mengikuti difficulty setelah pergantian loadout.

## 11F — Shield dan pistol lain
- Tactical shield tetap di primary slot CT, dapat menggunakan USP, Glock18, P228, Desert Eagle, dan Five-Seven sesuai senjata yang benar-benar tersedia di inventory.
- Penggunaan Dual Elites bersama shield ditolak pada pembelian atau pickup; shield yang diangkat tetap mencegah firing hingga diturunkan.
- Viewmodel shield memperbarui attachment pistol dari model `p_` yang tersedia pada tulang tangan, dan menyembunyikan geometri pistol bawaan yang tidak cocok. Pemasangan visual perlu tes GPU sungguhan.

## QA
- **Tahap 11 khusus:** 39/39 PASS dalam Chromium headless dengan renderer/model loader simulasi.
- **Regresi Tahap 10:** 51/51 PASS dengan harness tersesuaikan.
- **Regresi Tahap 9:** 37/37 PASS dengan skenario drop primary eksplisit.
- Validator Tahap 10: 58 PASS; validator aset lama: 31 GLB senjata, 165 WAV, 34 ikon PASS; semua JS `node --check` PASS.
- **Batasan:** tanpa verifikasi real WebGL/GPU/Safari fisik; bukan bukti animasi rig benar saat dimainkan. QA status CONDITIONAL. Baca QA_TAHAP11.md.
