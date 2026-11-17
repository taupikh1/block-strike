# Animated GoldSrc viewmodels

This folder contains 31 converted first-person viewmodels (`.glb`) loaded on demand by the game as `assets/models/weapons/<id>.glb`.

- 25 models match the current weapon catalog and are connected to the weapon switch, fire, reload, and knife attack actions.
- 6 auxiliary models (`c4`, `flashbang`, `hegrenade`, `smokegrenade`, `shield_r`, and `knife_r`) are converted and retained for future gameplay integration; the current game does not yet expose all of those as selectable viewmodels.
- Each GLB preserves the embedded textures, bone hierarchy, per-vertex skin weights, inverse bind matrices, and all embedded GoldSrc animation sequences.
- If a GLB fails to load, the game uses its procedural placeholder.

The converter and usage instructions are in `tools/mdl2glb/`. Third-party redistribution rights are documented separately in `ASSET_NOTICES.md`.
