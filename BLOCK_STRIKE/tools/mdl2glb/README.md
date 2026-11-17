# GoldSrc weapon viewmodel conversion

`convert_weapon_archive.py` converts embedded-texture GoldSrc Studio Model v10 (`IDST`) first-person `v_*.mdl` files into skinned, animated glTF 2.0 GLB assets for Three.js.

## Requirements

- Python 3.10+
- `numpy`
- `Pillow`

## Usage

```bash
python tools/mdl2glb/convert_weapon_archive.py /path/to/default-weapon-models.zip assets/models/weapons
```

The converter preserves the embedded indexed textures, original per-vertex bone assignments, bind pose, bone hierarchy, and every embedded sequence in the viewmodel. Sequence names are retained; duplicate labels receive a `__2`, `__3`, etc. suffix. The first skin family and blend 0 are used. The supplied first-person weapon models were inspected and use one embedded blend and sequence group 0.

The GLB files are self-contained and do not need the original `.mdl` files at runtime. The original third-party asset rights remain separate from technical conversion; check the source license before redistribution or public hosting.

## Tahap 8 camera and held models

The root maps GoldSrc forward X to camera -Z, right -Y to camera +X, and up Z to camera +Y. The root scale applies 0.025 units and exactly one handedness reflection. No bind-bounds centering is applied: source viewmodel offsets remain authored. Only bodygroup model 0 is emitted, avoiding overlapping alternative meshes. The runtime uses a separate 65-degree viewmodel camera and keeps this root transform neutral.

For attachments and icon sources, extract the source weapon ZIP first, then run:

```sh
python tools/mdl2glb/convert_held.py /path/to/cstrike/models assets/models
```

This produces `held/` from `p_*.mdl` and `world/` from `w_*.mdl`. Held geometry is rebased to its nearest shared Hand ancestor; weapon-specific Line bones are not assumed to exist in the player rig. `extras.attachBone` identifies the runtime attachment. Dual Elites retain both hands. World assets are used by `node tools/render-assets.cjs` to create transparent icons; this developer step needs Playwright and a local HTTP server on port 8080.
