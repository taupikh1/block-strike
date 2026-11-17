// audio.js - shoot, footstep, reload, bomb sounds
let AC, NB;
export function initAudio() {
  try {
    AC = new (window.AudioContext || window.webkitAudioContext)();
    NB = AC.createBuffer(1, AC.sampleRate * 0.1, AC.sampleRate);
  } catch (e) {}
}
export function snd(v, d, f) {
  if (!AC) return;
  const s = AC.createBufferSource();
  s.buffer = NB;
  const g = AC.createGain(), fi = AC.createBiquadFilter();
  g.gain.setValueAtTime(v, AC.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, AC.currentTime + d);
  fi.type = 'lowpass';
  fi.frequency.value = f;
  s.connect(fi); fi.connect(g); g.connect(AC.destination);
  s.start();
}
