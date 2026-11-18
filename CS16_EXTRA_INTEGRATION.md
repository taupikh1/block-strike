# BLOCK STRIKE - CS 1.6 Source Asset Expansion

Date: 18 November 2026
Baseline: BLOCK_STRIKE_CS16_GDRIVE checkpoint (Tahap 14 Final + Auto Buy/Rebuy + first VGUI/SFX import)

## New live functionality
- Original CS 1.6 character skins for 8 playable CT/T classes, skinned and with the 16 existing gameplay animation names. **Settings > Character models** chooses `CS 1.6 Classic` or `Previous Skins`. Falls back to previous skin on load failure. Selection takes effect on next match.
- GoldSrc first-person muzzle flashes are now sourced from the original `.spr` images, converted to PNG. HE/Flash/Smoke gameplay logic, inventory, shield and mobile controls unchanged.
- Original smoke sprite art enhances the fallback soft smoke texture when its PNG decodes. A soft procedural fallback remains for bad asset loads.
- Classic 800x600 Counter-Strike menu graphic reconstructed from 12 supplied TGA image tiles, with a readability overlay and mobile-safe scaling.
- Full original radio command `.wav` set: prefer 45 original WAVs for radio announcements, fall back to the previously working MP3 for missing bot voice clips.
- Original CS audio enhanced with 119 **new** WAV files (194 other WAVs were already in BLOCK STRIKE), including 4 Dirt footsteps, flesh impacts/headshots and death variants, menu/events and radio. Dust Block now uses the original dirt footstep variations. Sound volume follows current settings.
- POD Bot fictional nickname list: 45 character handles adapted from the supplied botnames.txt; existing AI rules and team assignments unchanged.
- All 71 valid GoldSrc `.spr` textures decoded to standalone PNG, with multi-frame sprite atlases and JSON manifest. Those not relevant to the current game mode remain packaged but are not executed or all automatically shown.
- 17 resource/background TGA and 4 scope TGA converted to PNG. Resource UI `.res` layouts and weapon HUD definitions preserved as inert reference data, not executed as programs.

## Previously completed and preserved
- 56 CS 1.6 VGUI purchase/class images; 29 player/gear sound clips; weapon GLBs, world/held weapon GLBs; 14A–14G fixes; Auto Buy/Rebuy; 33 shield and 44 grenade regression checks.
- An audit found **96 original weapon MDLs were byte-identical** to the previous default-weapon-models ZIP. The converted and QA-patched versions were kept rather than replaced.

## Explicit exclusions / non-ports
- **No additional maps**: no BSP, WAD, map skyboxes, map radar images, map bot waypoint/overview, or map-specific assets added.
- **No cheats** and no executable GoldSrc binary modules/plugins (DLL, SO, DYLIB, AMXX). `file-gagal.txt` lists 19 unavailable server-only SO files; these are irrelevant to browser gameplay.
- Map props, hostess/hostage or VIP objective-mode models, engine-only NPC code, and map-only ambience were not installed as live objects; the current gameplay is team elimination. `.res`, `.scr`, `.sma` and GoldSrc executable code are not natively runnable by Three.js.
- No background music added.

## QA verdict: CONDITIONAL
- Source assets: all 71 sprites decoded, 119 new WAV files validated, 21 additional UI images decoded, eight GLB models parsed through real Chromium GLTFLoader. New import checks **20/20** passed.
- Tahap14A model audit **113/113**; Tahap14E/F input regression **34/34**; Tahap14D grenade **44/44**; Tahap14C shield inventory **33/33**; Tahap13 integration **34/34**; combat **27/27**.
- All JS passes Node syntax checks. Original weapon validators: 31 animated GLBs, 165 original weapon WAVs, all 34 icons valid.
- Test harness cannot confirm actual Three.js WebGL GPU frames or physical iPhone 13 Safari layouts. Especially check character geometry, appearance, animations and button placement before considering the release final.
- **Source asset licensing and public redistribution rights are unverified.** This is a private test build; do not publish original Valve / third-party files publicly without permission.

## Installation
- Full release: extract every `PAKET_N_DARI_M.zip` to the same directory, merge the single `BLOCK_STRIKE/` folder, then serve its contents from the site root.
- Patch: apply all patch parts *over the previous CS16_GDRIVE checkpoint*, preserving original directory structure. A bare Tahap 14 Final without the previous Auto Buy + GDrive integration needs the full release, not this patch.
- Mobile Safari: reload A2HS app after deploying; ensure no stale cached old CSS/GLB remains.
