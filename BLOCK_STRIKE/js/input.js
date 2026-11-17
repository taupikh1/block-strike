// input.js - joystick, touch buttons, keyboard, mouse
export const keys = { w: 0, a: 0, s: 0, d: 0 };
export let fireHeld = false, jumpHeld = false, jx = 0, jy = 0;

export function setupInput(callbacks) {
  const { onFire, onJump, onReload, onSwap, onLook, isRunning } = callbacks;
  // Keyboard
  const kmap = { KeyW: 'w', KeyA: 'a', KeyS: 's', KeyD: 'd', ArrowUp: 'w', ArrowLeft: 'a', ArrowDown: 's', ArrowRight: 'd' };
  addEventListener('keydown', e => {
    if (kmap[e.code]) keys[kmap[e.code]] = 1;
    if (e.code === 'Space') jumpHeld = true;
    if (e.code === 'KeyR' && onReload) onReload();
    if (/^Digit[1-4]$/.test(e.code) && onSwap) onSwap(+e.code[5] - 1);
  });
  addEventListener('keyup', e => {
    if (kmap[e.code]) keys[kmap[e.code]] = 0;
    if (e.code === 'Space') jumpHeld = false;
  });
  // TODO: full touch / pointer logic can be expanded here
}
