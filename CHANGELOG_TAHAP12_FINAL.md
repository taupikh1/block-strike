# BLOCK STRIKE — Tahap 12 Final

Baseline: Tahap 12 Preview (bot animation, sprint and drag-to-aim), built on Tahap 11. No maps added or removed.

## 12A — Weapon Damage & Ballistics
- Added `js/combat12.js`: single deterministic bullet-damage and armor model shared by player and bots. Removed bot damage multiplier `0.38`.
- Updated weapon base damage to the applicable CS 1.6 / ReGameDLL-derived parameters, including Dual Elites 36, Five-SeveN 20, Glock 20, M4A1 32 un-suppressed / 33 suppressed, USP 34 un-suppressed / 30 suppressed, and FAMAS 30 auto / 34 burst.
- Distance damage falloff uses range modifiers converted from GoldSrc units to this game's world scale (approximation).
- Head, chest, stomach, arms and legs have distinct target proxies; head damage ×4, stomach ×1.25, legs ×0.75. Bot probabilistic impacts now choose head/stomach/chest/legs.
- M3 uses nine pellets and XM1014 uses six independently ray-traced pellets; each pellet can hit independently.
- Knife: basic slash, right-click/touch-secondary stab and rear-attack bonus. FAMAS secondary action toggles 3-shot burst.

## 12B — Armor and Helmet
- Kevlar protects torso and arms, but does not protect head without a helmet; legs remain unarmored. Armor consumption and damage depend on weapon penetration factor.
- Human/bot damage use the same armor formula; damage is not multiplied by difficulty.
- Vest + helmet price $1,000, or $350 when upgrading an existing vest. Repeated purchases are blocked.
- Bot gear AI now purchases vest and helmet based on funds, persists equipment across rounds, and avoids repurchasing healthy armor unnecessarily.

## 12C — Grenade Overhaul
- Player throws use staged deploy → pullpin → throw: projectile released when the throw stage begins, not when the button is first pressed.
- HE/Flash/Smoke use separate physics and gameplay effects. Collision uses short substeps, bounce damping, and ground drag.
- HE damage goes through the same health/armor system; Flash affects player/bot sight with distance, direction and occlusion; Smoke uses its original `sg_explode.wav`, growing soft particles and bot line-of-sight occlusion.
- Projectiles, smoke particles, visuals and pending throws are removed on round reset.
- Existing converted `v_`, `p_`, `w_` grenade assets retained and grenade viewmodels preloaded when possible.

## 12D — Scope & Reload
- For AWP, Scout, AUG, SG552, G3SG1, and SG550, a valid reload instantly exits scope/zoom and restores normal FOV before starting the reload sequence.
- Reloading does not auto-rescope. Full magazine / empty reserve does not trigger a reload.

## 12E — QA & Packaging
- Added standalone deterministic combat checks and scripted Chromium simulated integration checks.
- Updated legacy grenade timing regression checks to reflect the new animation-first throw behavior.
- Kept old assets, four maps, phone controls, scoreboards, radio commands, and 2–32-player match setup.
- Bundled full game and incremental patch, with release part ZIPs capped below 24,900,000 bytes.

## Known limitations
- **Not byte-for-byte Counter-Strike 1.6.** BSP wall penetration, fully authentic weapon recoil and firing cadences, and real GoldSrc ballistics are not yet replicated.
- FAMAS burst uses three projectiles in one fire action rather than three spaced audio/animation frames.
- Grenade throw animation timing is approximated from the supplied assets; gameplay and visuals on real GPU were not verified.
- Physical iPhone Safari, long play sessions, and real 24–32-player performance remain untested.
- Existing third-party asset notices/redistribution restrictions remain applicable.
