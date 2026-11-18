# QA: CS 1.6 Google Drive checkpoint

## Results
- ZIP 01 and ZIP 02: both valid; 19 HTTP 404 entries in `file-gagal.txt` are Linux server-side `.so` modules, not used in Three.js.
- VGUI: 56 original TGA cards converted to PNG; all decode; browser PNG bytes decode successful.
- SFX: 29 original PCM WAV clips are readable. They are connected to footsteps, jumps, damage, armor purchases and night vision; gameplay remains functional if a sound fails to load.
- New-specific QA: **15/15 pass**.
- Chromium DOM/input 14E/14F: **34/34 pass**.
- Shield inventory 14C: **33/33 pass**.
- Grenade 14D: **44/44 pass**.
- Tahap 13 integration: **34/34 pass**.
- Asset validator: passed (31 GLBs, 165 weapon WAVs, 34 earlier UI icons).

## Limitations
- WebGL GPU rendering and Safari iPhone 13 physical testing not available.
- Browser policies blocked local file and localhost navigation, so actual on-site asset fetching and full GPU gameplay weren't proven. New PNG was rendered using a data URI of the real converted file.
- Public redistribution rights for CS 1.6 source media are not verified.
- Not an engine port or full integration of all supplied archive files. Maps deliberately excluded.

## Reference
See `QA_CS16_GDRIVE.json` and `CS16_GDRIVE_INTEGRATION.md` for source mappings.
