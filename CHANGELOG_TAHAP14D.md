# BLOCK STRIKE — Changelog Tahap 14D

**Baseline:** Tahap 14C. **Scope:** HE / Flashbang / Smoke grenade only. Tahap 14E, 14F, 14G **tidak dikerjakan**.

## Grenade input and animation
- Original grenade viewmodel GLB clips `deploy`, `pullpin`, and `throw` are now sequenced. Projectile releases partway through the throw animation, not at initial button press.
- Wait for the grenade model to be ready before beginning animation. If loading fails, a timed fallback still allows throwing; throwing while another grenade is being prepared is blocked.
- Grenade inventory decreases only on projectile release. Death before release cancels without consuming a grenade.
- Normal weapon stays hidden while grenade viewmodel is active, overriding the previous per-frame `syncAim()` visibility conflict.
- Grenade selector cycles only through owned types when one is available; HUD selects an available type after a stock is exhausted.

## Projectile physics
- Shared deterministic helper `js/grenade14d.js` now owns grenade velocity, bounce/friction, HE falloff, flash exposure, and smoke opacity mathematics.
- Fixed-step physics with collision raycasts and Dust Block ground/box height reduces tunneling; reduced bounce jitter on settling.
- HE / flash use timed fuses; smoke activation waits for settling up to a timeout.
- Original GoldSrc `w_`-derived world models remain attached to thrown projectiles; original pin, bounce, explosion WAV sounds are used.

## HE, Flashbang, Smoke
- HE: radial falloff, obstruction test, source-team friendly-fire rules, shared damage/armor routine, brief explosion flash and transient sparks.
- Flash: applies temporary screen whiteout based on distance/facing/cover, with recovery, and disrupts bot perception and fire delay.
- Smoke: 32 layered soft-alpha particles from one generated small canvas texture, growing cloud, fading toward expiry; used by bot sight checks.
- Smoke activation uses `sg_explode.wav`; cleanup disposes temporary visual objects after detonation/round reset.

## Assets / distribution
The user's `default-weapon-models(4).zip` provides the source v_/p_/w_ models and original weapon WAV sounds. The converted GLB and copied WAV files were **already included** in the Tahap 14C baseline. They are reused rather than duplicated. No new third-party mod ZIP was added.

## Known limitations
- Grenade effects are Three.js visual adaptations, not bit-for-bit faithful GoldSrc particle/sprite simulation.
- Smoke uses layered alpha sprites, not true volumetric fluid simulation. More nuanced spatial audio/particle behavior requires actual GPU testing.
- Bot HE throw uses the available firing gesture, not a separate fully-authored grenade skeletal animation.
- Renderer and iPhone 13 Safari physical QA remain not verified in this environment. See `QA_TAHAP14D.md`.
