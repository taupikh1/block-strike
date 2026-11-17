// state.js - game status
export const GameState = {
  MENU: 'menu',
  BUY: 'buy',
  ROUND: 'round',
  ENDED: 'ended'
};

export let currentState = GameState.MENU;
export let running = false;
export let over = false;
export let round = 0;
export let kills = 0;
export let money = 800;

export function setState(s) {
  currentState = s;
}
