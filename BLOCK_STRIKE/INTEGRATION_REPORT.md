> Catatan historis sebelum Tahap 8. Status terkini: README.md dan QA_REPORT.md.

# BLOCK STRIKE weapon animation integration report

## Scope completed

- Rebuilt all 31 first-person viewmodels found in the user-supplied GoldSrc v10 MDL archive. The 25 models used by the current weapon catalog are wired into gameplay; six auxiliary viewmodels are retained for future integration.
- Exported each model with its embedded textures, bone hierarchy, per-vertex bone assignments, skin weights, inverse bind matrices, and every embedded animation sequence.
- Connected the viewmodel animation mixer to weapon switching, firing, reloading, and knife attacks in the Three.js runtime.
- Preserved the existing weapon firing/reload sound integration and the supplied WAV assets.
- Replaced the incomplete legacy converter entry point with a working wrapper around the animated converter.

## Animated weapon assets

| Weapon | Bones | Source sequences |
|---|---:|---:|
| AK-47 | 42 | 6 |
| AUG | 42 | 6 |
| AWP | 42 | 6 |
| Desert Eagle | 43 | 6 |
| Dual Elites | 48 | 16 |
| FAMAS | 52 | 6 |
| Five-SeveN | 42 | 6 |
| G3SG1 | 43 | 5 |
| Galil | 52 | 6 |
| Glock 18 | 41 | 13 |
| Knife | 39 | 8 |
| M249 | 50 | 5 |
| M3 | 43 | 7 |
| M4A1 | 44 | 14 |
| MAC-10 | 46 | 6 |
| MP5 | 43 | 6 |
| P228 | 43 | 7 |
| P90 | 41 | 6 |
| Scout | 42 | 5 |
| SG-550 | 42 | 5 |
| SG-552 | 43 | 6 |
| TMP | 41 | 6 |
| UMP-45 | 43 | 6 |
| USP | 45 | 16 |
| XM1014 | 42 | 7 |

The source models include weapon-specific sequence names such as `idle`, `draw`, `shoot1`, `reload`, `start_reload`, `insert`, `after_reload`, `pullpin`, and knife slash/stab sequences. Duplicate source labels are preserved with a numeric suffix in the GLB animation name.

## Additional converted viewmodels

| Auxiliary model | Bones | Source sequences | Current runtime use |
|---|---:|---:|---|
| C4 | 37 | 4 | Converted, not yet selectable |
| Flashbang | 37 | 4 | Converted, grenade logic currently uses effect-only throw |
| HE grenade | 37 | 4 | Converted, grenade logic currently uses effect-only throw |
| Smoke grenade | 37 | 4 | Converted, grenade logic currently uses effect-only throw |
| Shield (right-hand) | 58 | 9 | Converted, not yet selectable |
| Alternate knife (right-hand) | 6 | 8 | Converted, not yet selectable |

## Runtime behavior

- Weapon switch: plays the source draw/deploy sequence, then returns to the source idle sequence.
- Fire: plays a source shoot sequence; weapons with multiple shoot sequences cycle through them. Last-shot clips are preferred when present.
- Reload: plays the source reload sequence. Shotguns without a monolithic reload clip chain `start_reload`, `insert`, and `after_reload` when available.
- Knife: cycles through available slash/stab clips.
- If a GLB fails to load, the existing procedural placeholder remains as a fallback.

The game still retains its existing camera recoil and movement bob as supplementary feedback. Those are not substitutes for the source skeleton animation.

## Verification performed

- All 31 source MDLs parsed and converted successfully (25 catalog weapons plus six auxiliary viewmodels), preserving 219 source animation sequences in total; 185 sequences contain frame-to-frame bone motion.
- All 31 GLB files passed binary header/length checks and JSON/BIN chunk parsing.
- All 31 GLBs contain one skin, valid joint references, skinned mesh attributes, and all source animation clips.
- All 31 GLBs loaded with `trimesh` and exposed renderable geometry. Skinned vertex joint indices/weights and animation channel frame counts were checked. The 25 catalog IDs match the game weapon table exactly.
- All game JavaScript files passed `node --check`. The Python converter modules passed `py_compile`.
- All 165 WAV files opened successfully with Python’s WAV reader; all 102 literal WAV filenames referenced by the runtime exist in the asset folder. All JavaScript files passed `node --check`, and converter scripts passed Python compilation.

## Not verified / limitations

- Full interactive gameplay was not yet verified in Safari on iPhone. Static GLB structure and code checks do not prove visual alignment or animation quality on the target device.
- Animation sequence mapping is based on sequence names. GoldSrc sequences not present in a particular MDL cannot be played; silencer variants and some alternate sequences are retained in the GLB but are not all exposed as separate gameplay actions.
- The source page and its published site rules are now credited in `ASSET_NOTICES.md`; the rules require attribution and a direct, active source link. However, the archive contains no asset license and the page does not clearly grant conversion and public redistribution rights for the underlying third-party model/audio works. Do not publish the included models or WAV files publicly until the source/rights holders confirm permission.
