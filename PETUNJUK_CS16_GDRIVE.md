# BLOCK STRIKE: CS 1.6 Google Drive source integration (checkpoint)

**Baseline:** BLOCK STRIKE Tahap 14 Final plus CS16 Auto Buy/Rebuy.

**What was integrated:** 56 VGUI texture cards converted to PNG for Buy Menu, weapon picker, team and class selection; 29 user-supplied PCM WAV sound effects for movement, player damage, armor, and night vision. Auto Buy/Rebuy from baseline preserved. Existing CS-like weapon models, animations, weapon audio, HUD and radio stay intact.

**Two ZIPs audited:** `cs16_files-01.zip` (98,907,239 bytes) and `cs16_files-02.zip` (94,723,791 bytes), both pass CRC. `file-gagal.txt` lists 19 failed Linux server .so files, not needed by this web game.

**Not integrated:** BSP maps (per user), server plugin DLL/.so, cheats, raw `.res`/`.spr` UI definitions or raw `.mdl` files (Three.js requires implementation/conversion); most original audio duplicates sounds already present. This checkpoint does not claim complete 1:1 CS 1.6 parity.

**QA:** 15/15 custom asset/Chromium PNG decode, 34/34 input 14EFG, 33/33 shield 14C, 44/44 grenades 14D, 34/34 stage13; `validate_assets.py` passes. These tests use simulated renderer. Real Safari iPhone 13 and GPU WebGL were NOT verified. Local `file://` browser loading is blocked, so the new PNG was decoded in Chromium from its actual bytes via a data URI.

**Install patch:** Apply after Tahap 14 Final plus Auto Buy/Rebuy. Unzip `BLOCK_STRIKE_CS16_GDRIVE_PATCH_FROM_QUICKBUY.zip` into the folder containing your existing `BLOCK_STRIKE/`, overwriting files. Do not apply directly on a clean Tahap 14 Final without Auto Buy/Rebuy unless you first apply that earlier patch.

**Install full:** Extract every `BLOCK_STRIKE_CS16_GDRIVE_PAKET_N_DARI_M.zip` into the same directory (MERGE; don't delete other package content). Then publish the contents of `BLOCK_STRIKE/` at the GitHub Pages repository root if you have rights to distribute assets.

**Copyright:** The source assets are from CS 1.6 media supplied by the user. Valve or other rights holders may control their redistribution. This is a locally prepared integration; permission to rehost publicly has not been verified. This is NOT a standalone CS 1.6 distribution.
