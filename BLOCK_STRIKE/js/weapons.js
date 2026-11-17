// weapons.js - shoot, reload, recoil, spread, switch weapon
export function createWeaponState(weapons, keys) {
  return {
    index: 2,
    reloading: 0,
    cool: 0,
    kick: 0,
    current: () => keys[this.index]
  };
}
