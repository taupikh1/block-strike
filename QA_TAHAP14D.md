# QA — BLOCK STRIKE Tahap 14D

**Verdict: CONDITIONAL — LOGIC/ASSET VERIFIED; VISUAL GPU NOT VERIFIED**

Baseline: `BLOCK STRIKE Tahap 14C` (Dust Block only). Scope: grenade system; no shield, input Safari or hold-fire changes.

## Tests executed and evidence

| Test command | Result | Evidence |
|---|---|---|
| `python tools/qa/tahap14d.py` | **44/44 PASS**, no JavaScript page error | `qa/tahap14d/results.json` |
| `python tools/qa/tahap14d_real_models.py` | **18/18 PASS**, real GLTFLoader and AnimationMixer | `qa/tahap14d/native-grenade-models.json` |
| `python tools/qa/tahap14c.py` | **33/33 PASS** | `qa/tahap14c/results.json` |
| `python tools/qa/tahap14b_viewmodel.py` | **30/30 PASS** | `qa/tahap14b/viewmodel-tests.json` |
| `python tools/qa/tahap13.py` | **34/34 PASS** | `qa/tahap13/results.json` |
| `node tools/qa/tahap12_combat.cjs` | **27/27 PASS** | deterministic combat fixture |
| `python tools/qa/tahap14a_assets.py <path to extracted original p_ models>` | **113/113 PASS** | `qa/tahap14a/assets_results.json` |
| `python tools/qa/validate_assets.py` | PASS | 31 animated GLB weapon models, 165 WAV and 34 icons |
| `node --check` on all local `js/*.js` | PASS | static JavaScript syntax |
| `python tools/qa/tahap13_real_webgl.py` | **BLOCKED** | `Error creating WebGL context` |

## Tested behaviors
- Player's HE, Flash and Smoke retain stock during pin preparation, show sequential deploy/pin/throw states, emit exactly one projectile after the release phase, and then decrement stock.
- Repeat taps while the same grenade is being prepared do not duplicate throw or decrement stock again.
- Timed grenade detonation removes projectiles, while smoke remains active then expires and frees particles/materials.
- Round reset clears pending throws, projectiles, smoke, and transient explosion visuals.
- Death during pin preparation cancels the grenade throw without consuming stock.
- Real converted GLB assets contain and successfully run all four GoldSrc animation clips. Three.js GLTFLoader is **not stubbed** for the 18 asset/animation checks.
- Deterministic math checks verify grenade throw vector, bounce response, HE radius/falloff, flash direction/cover, smoke line occlusion and smoke fade.
- Previous shield inventory, shield viewmodel, Tahap 13 and combat regressions remain passing.

## Not verified
- **Real WebGL rendering** of smoke, explosion animation, and camera whiteout (browser security restriction blocks WebGL context).
- **Safari on physical iPhone 13**, actual multitouch while grenade thrown, sustained FPS, and GPU memory behavior.
- Fully authentic CS 1.6 visuals/physics. The game approximates older effects using the Three.js WebGL engine; the user's model/audio archive does not contain complete original gameplay FX logic.
- Third-person bot hand-held grenade animation is an approximate firing action. Exact animation requires a dedicated converted animation binding.

Existing `tools/qa/tahap12_final.py` is a legacy inline fixture hardcoding an older script list and expecting the former instant-release throw timeline. It does not load the new `js/grenade14d.js` dependency and cannot be used without revising those obsolete assumptions. Tahap 14D uses dedicated updated tests rather than counting this legacy fixture as a PASS.

**Release verdict:** Suitable as a QA build to install and inspect on a physical device. Do not mark visual Safari gameplay PASS until tested there.
