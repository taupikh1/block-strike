> Catatan historis sebelum Tahap 8. Status terkini: README.md dan QA_REPORT.md.

# BLOCK STRIKE — Buy Menu, Viewmodel, ADS & Map Selection Fix

## Changes
- Buy menu: fixed-height flex layout; item grid is the only vertically scrolling region; iOS momentum scrolling and explicit touch-action enabled.
- First-person weapon viewmodel: corrected GLB transform. The imported GoldSrc model was positioned at positive camera-space Z (`+0.45`), putting most of the model against/behind the camera near plane. It is now scaled and positioned in front of the camera; mesh frustum culling is disabled for viewmodel meshes.
- Optical sights: added aim support for AUG and SG-552 (42° FOV), Scout (36°), AWP (24°), G3SG1 and SG550 (38°). Desktop: hold right mouse button. Touch: tap BIDIK to toggle.
- Map selection: added a map selection step before team selection and load the selected JSON map before creating the world. Player spawn uses each map's CT/T spawn coordinates.

## Maps found
- `dust_block.json` — default hand-built arena remains the default.
- `cs_kvartal.json` — six JSON blocks.
- `as_kvartal.json` — six JSON blocks.
- `es_kvartal.json` — six JSON blocks.

The `assets/maps/cs16-kvartal` folder also contains text resource/overview files and BMP overview images, but no `.bsp` map geometry was present in the supplied project archive. The three Kvartal JSON files explicitly describe themselves as placeholders, not full BSP conversions. They are selectable as simplified layouts; they are not claimed to be faithful full CS 1.6 maps.

## Verification performed
- `node --check js/game-core.js`: PASS.
- All four map JSON files parsed; each has an id, blocks array, and CT/T spawn: PASS.
- AUG, SG-552, Scout, AWP, G3SG1 and SG550 GLBs checked for glTF header, skin and animation data: PASS.
- ZIP integrity checked after packaging: see delivery result.
- Headless Chromium visual/gameplay smoke test: NOT VERIFIED. Chromium did not complete in this environment, so no claim of Safari/iPhone gameplay verification is made.
