# BLOCK STRIKE — QA Tahap 12 Final

**Verdict: CONDITIONAL / TESTED IN SIMULATION.** Implementation is complete for the defined Tahap 12 workstreams but is NOT equivalent to a verified production-quality CS 1.6 engine. The real GPU renderer and physical iPhone 13 Safari have not been verified.

## Evidence from executed commands

| Command | Result | Scope |
|---|---:|---|
| `node tools/qa/tahap12_combat.cjs` | **27/27 PASS** | Pure deterministic weapon stats, per-hit area multipliers, helmet/armor, range, knife, silencer and pellets |
| `python tools/qa/tahap12_final.py` | **46/46 PASS** | Browser logic & DOM integration with WebGL/GLTF loaders stubbed: scope reload, player/bot armor, economy, each grenade lifecycle, shotgun pellets, FAMAS and knife, prior control features |
| `python tools/qa/tahap12_preview.py` | **24/24 PASS** | Prior sprint, drag-to-aim, bot patrol, model animation clip names, mobile control editor |
| `python tools/qa/tahap11_targeted.py` | **39/39 PASS** | Tahap 11 bot economy, radio, scoreboard, shield and class visuals |
| `python tools/qa/tahap11_from10.py` | **51/51 PASS** | Tahap 10 gameplay/radio/match configuration regression |
| `python tools/qa/tahap11_from9.py` | **37/37 PASS** | Tahap 9 regression; seven old grenade checks updated to wait for the release phase rather than demanding instant projectiles |
| `python tools/qa/validate_tahap10.py` | **59 PASS / 0 FAIL** | Static asset and content checks |
| `python tools/qa/validate_assets.py` | **PASS** | 31 animated weapon GLBs; 165 WAV; 34 weapon icons |
| `node --check js/*.js` | **PASS** | All main JavaScript syntax |
| index local `src`/`href` validation | **PASS** | Entry HTML references exist |

**224 functional assertions passed across six scripts**, some overlapping old regression behavior; this number is not an FPS, WebGL or end-to-end completion guarantee. Full per-run summaries in `qa/tahap12-final/regression-results.json` and detailed `checks.json`, `combat.json`.

## Browser limits / attempted real-WebGL check
- Tests use Chromium headless with real DOM and input events but a simulated Three.js WebGLRenderer and GLTFLoader.
- An attempted local HTTP run (`http://127.0.0.1:18731/`) was rejected by the browser sandbox with **`net::ERR_BLOCKED_BY_ADMINISTRATOR`**, so there is **no real GPU rendering pass** to claim.
- Screenshots in QA folders are simulated HUD/layout screenshots, not proof that 3D grenade particles/model animation rendered correctly.
- No test on Safari iPhone 13 physical hardware, iOS A2HS or an extended 32-player session.

## Residual issues / residual risk
1. True BSP wall penetration, material-dependent penetration and exact CS 1.6 hitboxes are NOT IMPLEMENTED, although damage/range/pellet armor calculations are markedly improved.
2. FAMAS burst 3 pellets are spawned in one firing action, not scheduled at native staggered intervals.
3. Smoke transparency, positional scaling, throw animation and model/world collisions still require real-browser visual QA.
4. Original GoldSrc HUD/weapon audio/model assets require separate licensing and redistribution review for publicly shared ZIPs.
5. Bot AI and navigation in all BSP maps, and 24–32 total player performance, need live playthroughs.

## Release decision
The release ZIP is provided as **Tahap 12 Final (conditional QA)**. Install it and perform a live WebGL and iPhone smoke test before declaring the experience stable. Do not reuse old cached site assets from GitHub Pages for QA; refresh with a current build.
