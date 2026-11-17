// player.js - movement, jump, crouch, camera, HP, armor
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

export function createPlayer() {
  return {
    pos: new THREE.Vector3(0, 0, 26),
    vy: 0,
    hp: 100,
    armor: 0,
    yaw: 0,
    pitch: 0,
    onGround: true
  };
}
