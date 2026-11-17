// economy.js - money, kill reward, loss bonus
export function killReward(weaponType) {
  return 300;
}
export function lossBonus(roundLosses) {
  return Math.min(1400 + roundLosses * 500, 3400);
}
