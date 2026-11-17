# Weapon and combat audio

This folder contains the 165 WAV files from the user-supplied CS 1.6 weapon archive. The game preloads the firing sounds for its weapon catalog and the reload clips used by `RELOAD_SOUNDS` in `js/game-core.js`. Other supplied WAV files remain available for later grenade, bomb-objective, and world-audio work.

Audio loading uses relative paths and falls back to synthesized effects if a file is missing or cannot be decoded.
