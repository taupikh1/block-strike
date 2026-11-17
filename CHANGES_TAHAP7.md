> Catatan historis sebelum Tahap 8. Status terkini: README.md dan QA_REPORT.md.

# Block Strike — Tahap 7 Navigasi Bot (CT↔T + Stuck Fix)

## Ringkasan
- `window.NAV_BOTS = true`
- Graf `cs_kvartal` di-patch: full CT ↔ T connectivity
- Deteksi + recovery macet bot diperbaiki

## Perubahan utama

### 1. Navigasi
- `nav_graph.json` sekarang punya:
  - Tepi vertikal lift_1 (bottom ↔ mid ↔ high)
  - Rantai 6 node intermediate dari frontier CT (x≈896) ke area lift low
- Backup asli: `nav_graph_original_backup.json`

### 2. Stuck detection & recovery (`js/nav-graph.js`)
Sinyal macet ganda:
- Jarak ke waypoint tidak berkurang
- Displacement aktual hampir nol (moveAcc)

Recovery:
- Skip waypoint setelah ~0.7s macet
- Side-step (gerak menyamping) selama 0.55s
- Setelah 3× stuck → force repath penuh
- Radius advance waypoint sedikit longgar (0.55 / 2.2)

### 3. Perilaku
- Bot T → CT: pakai A* (sudah terbukti)
- Bot CT → T: sekarang ada jalur lewat rantai + lift
- Saat LOS: tetap combat AI lama (strafe + tembak)

## Cara uji
1. Buka `index.html` di browser (atau serve folder)
2. Pilih map **cs_kvartal**
3. Perhatikan bot bergerak, tidak diam lama
4. CT bot seharusnya bisa menuju area T

## File kunci yang diubah
- index.html
- js/nav-graph.js
- assets/maps/bsp/cs_kvartal/nav/nav_graph.json
