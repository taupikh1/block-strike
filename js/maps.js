// maps.js - load and build maps from JSON
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

export let obs = [];
export let obsM = [];

export function clearMap(scene) {
  obs = [];
  for (const m of obsM) {
    scene.remove(m);
    if (m.geometry) m.geometry.dispose();
    if (m.material) {
      if (Array.isArray(m.material)) m.material.forEach(mat => mat.dispose());
      else m.material.dispose();
    }
  }
  obsM = [];
}

function tex(c1, c2, rep) {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const x = c.getContext('2d');
  x.fillStyle = c1;
  x.fillRect(0, 0, 64, 64);
  x.fillStyle = c2;
  x.fillRect(0, 0, 64, 3);
  x.fillRect(0, 0, 3, 64);
  x.fillRect(61, 0, 3, 64);
  x.fillRect(0, 61, 64, 3);
  const t = new THREE.CanvasTexture(c);
  t.magFilter = THREE.NearestFilter;
  if (rep) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(rep, rep);
  }
  return t;
}

function B(scene, x, z, w, h, d, col, y = 0, crate = false) {
  const CT = crate ? tex('#c4a574', '#a8885a') : null;
  const m = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshLambertMaterial(crate ? { color: col, map: CT } : { color: col })
  );
  m.position.set(x, y + h / 2, z);
  m.castShadow = m.receiveShadow = true;
  scene.add(m);
  obsM.push(m);
  obs.push({ x1: x - w / 2, x2: x + w / 2, z1: z - d / 2, z2: z + d / 2, y2: y + h });
}

export async function loadMap(scene, mapPath) {
  clearMap(scene);
  const res = await fetch(mapPath);
  const data = await res.json();

  // Ground
  const gc = data.groundColor || ['#d9bb80', '#cdac70'];
  const g = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 200),
    new THREE.MeshLambertMaterial({ map: tex(gc[0], gc[1], 50) })
  );
  g.rotation.x = -Math.PI / 2;
  g.receiveShadow = true;
  scene.add(g);
  obsM.push(g);

  // Blocks from JSON
  if (data.blocks) {
    for (const b of data.blocks) {
      B(scene, b.x, b.z, b.w, b.h, b.d, b.color || '#888', b.y || 0, b.crate || false);
    }
  }

  // Fallback extra detail for dust_block style if no detailed blocks
  if (data.id === 'dust_block' && (!data.blocks || data.blocks.length < 10)) {
    const wl = 0x8a8a8a, bd = 0x6a6a6a, wd = 0xc4a574, bl = 0x555555;
    const s = 1;
    // extra buildings / walls from original
    B(scene, -20 * s, -26 * s, 12, 4, 0.8, bd);
    B(scene, -26 * s, -20 * s, 0.8, 4, 12, bd);
    B(scene, -14 * s, -23.5 * s, 0.8, 4, 5, bd);
    B(scene, -14 * s, -15.5 * s, 0.8, 4, 3, bd);
    B(scene, -23 * s, -14 * s, 6, 4, 0.8, bd);
    B(scene, -16 * s, -14 * s, 4, 4, 0.8, bd);
    B(scene, -21 * s, -21 * s, 2, 1.2, 2, wd, 0, true);
    B(scene, 0, 0, 6, 1.2, 6, wd, 0, true);
    B(scene, 0, 0, 3, 1.1, 3, bl, 1.2, true);
    B(scene, 4.2, 0, 1.6, 0.6, 2.5, bl, 0, true);
    B(scene, -4.2, 0, 1.6, 0.6, 2.5, bl, 0, true);
    B(scene, -10, -4, 0.8, 3, 10, bd);
    B(scene, 10, 4, 0.8, 3, 10, bd);
    // crates
    const cr = [[-8, -8], [8, 8], [-12, 10], [12, -10], [0, 12], [0, -12], [-18, 0], [18, 0]];
    cr.forEach((p, i) => {
      B(scene, p[0], p[1], 1.8, 1.2, 1.8, i % 2 ? wd : bl, 0, true);
      if (i % 3 === 0) B(scene, p[0], p[1], 1.6, 1, 1.6, i % 2 ? bl : wd, 1.2, true);
    });
    [[-14, 2], [14, -2], [0, -20], [0, 20]].forEach(p => B(scene, p[0], p[1], 1.2, 4, 1.2, wl));
  }

  return data;
}

export function ground(p, r) {
  let g = 0;
  for (const o of obs) {
    if (p.x > o.x1 - r * 0.7 && p.x < o.x2 + r * 0.7 && p.z > o.z1 - r * 0.7 && p.z < o.z2 + r * 0.7 && o.y2 <= p.y + 0.35 && o.y2 > g)
      g = o.y2;
  }
  return g;
}
