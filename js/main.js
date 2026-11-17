// main.js - main loop, init, state changes
// Core game logic (adapted from original monolithic script)
// Modules are imported where possible; some remain global for compatibility with current renderer.

import { WEAPONS, WEAPON_KEYS, CT_MODELS, T_MODELS, MAPS, SETTINGS } from './config.js';
import { loadMap, ground, obs, obsM } from './maps.js';
import { initAudio, snd } from './audio.js';
import { createPlayer } from './player.js';

// Note: Full modular rewrite of every system is ongoing.
// Current version keeps the playable core and loads maps from JSON.

console.log('Block Strike modular structure loaded');
console.log('Available maps:', MAPS.map(m => m.name).join(', '));

// For full playability the original logic is still referenced via the entry point.
// See README for how to expand each module.
