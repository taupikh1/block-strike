// bsp-physics.js — gabungan bsp-collision + bsp-player untuk pemakaian klasik (bukan module)
(function () {
// bsp-collision.js — trace GoldSrc clipnode hull (Hammer units, Z up)
const CONTENTS_EMPTY = -1, CONTENTS_SOLID = -2;
const EPS = 0.03125;

function loadClipData(planesBuf, nodesBuf) {
  const pf = new Float32Array(planesBuf);            // nx,ny,nz,dist per plane
  const nv = new DataView(nodesBuf), n = nodesBuf.byteLength / 8;
  const pn = new Int32Array(n), c0 = new Int16Array(n), c1 = new Int16Array(n);
  for (let i = 0; i < n; i++) {
    pn[i] = nv.getInt32(i * 8, true);
    c0[i] = nv.getInt16(i * 8 + 4, true);
    c1[i] = nv.getInt16(i * 8 + 6, true);
  }
  return { pf, pn, c0, c1 };
}

// Trace segment p1->p2 through hull rooted at `head`. Returns {frac, hit, normal, startsolid}.
function traceHull(clip, head, p1, p2) {
  const { pf, pn, c0, c1 } = clip;
  const out = { frac: 1, hit: false, normal: null, startsolid: false };
  const dx = p2[0] - p1[0], dy = p2[1] - p1[1], dz = p2[2] - p1[2];
  function rec(node, f1, f2, a, b) {
    if (node < 0) {
      if (node === CONTENTS_SOLID) {
        out.hit = true; out.frac = f1;
        if (f1 === 0) out.startsolid = true;
        return true;
      }
      return false;
    }
    const k = pn[node] * 4;
    const nx = pf[k], ny = pf[k + 1], nz = pf[k + 2], d = pf[k + 3];
    const t1 = nx * a[0] + ny * a[1] + nz * a[2] - d;
    const t2 = nx * b[0] + ny * b[1] + nz * b[2] - d;
    if (t1 >= 0 && t2 >= 0) return rec(c0[node], f1, f2, a, b);
    if (t1 < 0 && t2 < 0) return rec(c1[node], f1, f2, a, b);
    const side = t1 < 0 ? 1 : 0;
    let frac = t1 < 0 ? (t1 + EPS) / (t1 - t2) : (t1 - EPS) / (t1 - t2);
    frac = Math.min(1, Math.max(0, frac));
    const midf = f1 + (f2 - f1) * frac;
    const m = [a[0] + (b[0] - a[0]) * frac, a[1] + (b[1] - a[1]) * frac, a[2] + (b[2] - a[2]) * frac];
    const first = side ? c1[node] : c0[node], second = side ? c0[node] : c1[node];
    const sg = side ? -1 : 1; // normal faces the side the trace came from
    if (rec(first, f1, midf, a, m)) {
      if (out.normal === null) out.normal = [sg * nx, sg * ny, sg * nz];
      return true;
    }
    if (rec(second, midf, f2, m, b)) {
      if (out.normal === null) out.normal = [sg * nx, sg * ny, sg * nz];
      return true;
    }
    return false;
  }
  rec(head, 0, 1, p1, p2);
  if (out.hit) out.frac = Math.max(0, out.frac);
  return out;
}

// Move a point by delta with up to 4 slides. Returns new position + flags.
function slideMove(clip, head, pos, delta) {
  let p = [pos[0], pos[1], pos[2]], d = [delta[0], delta[1], delta[2]];
  let onGround = false, startsolid = false;
  for (let i = 0; i < 4; i++) {
    const end = [p[0] + d[0], p[1] + d[1], p[2] + d[2]];
    const t = traceHull(clip, head, p, end);
    if (t.startsolid) startsolid = true;
    if (!t.hit) { p = end; break; }
    p = [p[0] + d[0] * t.frac, p[1] + d[1] * t.frac, p[2] + d[2] * t.frac];
    const n = t.normal; if (!n) break;
    if (n[2] > 0.7) onGround = true;
    const rem = 1 - t.frac;
    const dot = (d[0] * n[0] + d[1] * n[1] + d[2] * n[2]);
    d = [(d[0] - dot * n[0]) * rem, (d[1] - dot * n[1]) * rem, (d[2] - dot * n[2]) * rem];
    if (Math.hypot(d[0], d[1], d[2]) < 1e-4) break;
  }
  return { pos: p, onGround, startsolid };
}

// bsp-player.js — gerak pemain di atas clipnode BSP (satuan Hammer di dalam, satuan game di luar).
// Gravitasi, lompat, step height, slide di dinding/sudut. Dipakai untuk map BSP saja.

const STEP = 18;       // step height CS (Hammer units)
const GRAV = 1100;     // setara 22 game units/s^2 di game-core.js
const JUMP = 380;      // setara 7.6 game units/s di game-core.js

function makeTransform(meta) {
  return { c: meta.transform.c, s: meta.transform.s, k: meta.transform.scale };
}

function toHammer(T, g) {
  const xp = g[0] / T.k, yp = g[2] / T.k;
  return [T.c * xp + T.s * yp, -T.s * xp + T.c * yp, g[1] / T.k];
}
function toGame(T, h) {
  const xp = T.c * h[0] - T.s * h[1], yp = T.s * h[0] + T.c * h[1];
  return [xp * T.k, h[2] * T.k, yp * T.k];
}
// kecepatan horizontal (game -> hammer): transformasi linear tanpa translasi
function velToHammer(T, v) {
  const xp = v[0] / T.k, yp = v[1] / T.k;
  return [T.c * xp + T.s * yp, -T.s * xp + T.c * yp];
}

// Gerak horizontal dengan naik tangga. d = [dx, dy, 0] (Hammer)
function stepSlide(col, pos, d) {
  const a = slideAll(col, pos, d);
  const want = Math.hypot(d[0], d[1]);
  if (want < 1e-6) return a.pos;
  const got = Math.hypot(a.pos[0] - pos[0], a.pos[1] - pos[1]);
  if (got >= want * 0.98) return a.pos;          // tidak terhalang
  const up = slideAll(col, pos, [0, 0, STEP]).pos;
  const b = slideAll(col, up, d).pos;
  const down = slideAll(col, b, [0, 0, -STEP]);
  const gb = Math.hypot(down.pos[0] - pos[0], down.pos[1] - pos[1]);
  return gb > got + 1e-3 ? down.pos : a.pos;      // ambil yang lebih jauh
}

// Keluarkan origin dari solid (mis. spawn terlalu dekat lantai)
function unstick(col, pos) {
  let p = pos;
  for (let i = 0; i < 64 && traceAll(col, p, p).startsolid; i++) p = [p[0], p[1], p[2] + 1];
  return p;
}

// st: { pos:[gx,gy,gz], vy (game/s), on }, wish: [vx, vz] (game/s, bidang XZ game)
function movePlayer(col, T, st, wish, dt, jump) {
  let h = unstick(col, toHammer(T, st.pos));
  let vz = st.vy / T.k;
  if (jump && st.on) { vz = JUMP; st.on = false; }

  const wv = velToHammer(T, wish);
  h = stepSlide(col, h, [wv[0] * dt, wv[1] * dt, 0]);

  vz -= GRAV * dt;
  const v = slideAll(col, h, [0, 0, vz * dt]);
  h = v.pos;
  if (v.onGround && vz <= 0) { vz = 0; st.on = true; } else { st.on = false; }

  st.pos = toGame(T, h);
  st.vy = vz * T.k;
  return st;
}

// ---- tahap 6: func_breakable (collision statis) dan func_buyzone ----
// col.breakables: [{origin, mins, maxs, hull1}] (Hammer). Setiap breakable diuji dengan hull-nya sendiri.
function traceAll(col, p1, p2) {
  let best = traceHull(col.clip, col.head, p1, p2);
  if (!col.breakables) return best;
  const lo = [Math.min(p1[0], p2[0]) - 40, Math.min(p1[1], p2[1]) - 40, Math.min(p1[2], p2[2]) - 40];
  const hi = [Math.max(p1[0], p2[0]) + 40, Math.max(p1[1], p2[1]) + 40, Math.max(p1[2], p2[2]) + 40];
  for (const b of col.breakables) {
    const o = b.origin;
    if (b.mins[0] + o[0] > hi[0] || b.maxs[0] + o[0] < lo[0]) continue;
    if (b.mins[1] + o[1] > hi[1] || b.maxs[1] + o[1] < lo[1]) continue;
    if (b.mins[2] + o[2] > hi[2] || b.maxs[2] + o[2] < lo[2]) continue;
    const a = [p1[0] - o[0], p1[1] - o[1], p1[2] - o[2]], c = [p2[0] - o[0], p2[1] - o[1], p2[2] - o[2]];
    const r = traceHull(col.clip, b.hull1, a, c);
    if (r.startsolid) best.startsolid = true;
    if (r.hit && (!best.hit || r.frac < best.frac)) { best = { ...r, hit: true }; }
  }
  return best;
}

function slideAll(col, pos, delta) {
  let p = [pos[0], pos[1], pos[2]], d = [delta[0], delta[1], delta[2]];
  let onGround = false, startsolid = false;
  for (let i = 0; i < 4; i++) {
    const end = [p[0] + d[0], p[1] + d[1], p[2] + d[2]];
    const t = traceAll(col, p, end);
    if (t.startsolid) startsolid = true;
    if (!t.hit) { p = end; break; }
    p = [p[0] + d[0] * t.frac, p[1] + d[1] * t.frac, p[2] + d[2] * t.frac];
    const n = t.normal; if (!n) break;
    if (n[2] > 0.7) onGround = true;
    const rem = 1 - t.frac;
    const dot = d[0] * n[0] + d[1] * n[1] + d[2] * n[2];
    d = [(d[0] - dot * n[0]) * rem, (d[1] - dot * n[1]) * rem, (d[2] - dot * n[2]) * rem];
    if (Math.hypot(d[0], d[1], d[2]) < 1e-4) break;
  }
  return { pos: p, onGround, startsolid };
}

function inBuyzone(col, g) {
  const h = toHammer(col.T, g);
  for (const z of col.buyzones || []) {
    const o = z.origin;
    if (h[0] >= z.mins[0] + o[0] && h[0] <= z.maxs[0] + o[0] &&
        h[1] >= z.mins[1] + o[1] && h[1] <= z.maxs[1] + o[1] &&
        h[2] >= z.mins[2] + o[2] && h[2] <= z.maxs[2] + o[2]) return true;
  }
  return false;
}

// ---- spawn: mulai dari z spawn Hammer yang paling dekat (bukan dari atas, agar tidak mendarat di atap) ----
function snapSpawn(col, gx, gz) {
  const hx = toHammer(col.T, [gx, 0, gz]);
  let best = null, bd = 1e18;
  for (const s of col.spawns || []) {
    const d = Math.hypot(s[0] - hx[0], s[1] - hx[1]);
    if (d < bd) { bd = d; best = s; }
  }
  let z = best ? best[2] : hx[2];
  for (let i = 0; i < 60 && traceAll(col, [hx[0], hx[1], z], [hx[0], hx[1], z]).startsolid; i++) z += 2;
  const r = slideAll(col, [hx[0], hx[1], z], [0, 0, -300]);
  return toGame(col.T, r.pos)[1];
}


// ---- klien untuk game-core.js ----
function loadCollision(dir) {
  return Promise.all([
    fetch(dir + '/collision/clip.json').then(r => r.json()),
    fetch(dir + '/collision/clip_planes.bin').then(r => r.arrayBuffer()),
    fetch(dir + '/collision/clip_nodes.bin').then(r => r.arrayBuffer()),
    fetch(dir + '/collision/entities.json').then(r => r.json())
  ]).then(([meta, pb, nb, ent]) => {
    const n = nb.byteLength / 8, dv = new DataView(nb);
    const clip = { pf: new Float32Array(pb), pn: new Int32Array(n), c0: new Int16Array(n), c1: new Int16Array(n) };
    for (let i = 0; i < n; i++) {
      clip.pn[i] = dv.getInt32(i * 8, true);
      clip.c0[i] = dv.getInt16(i * 8 + 4, true);
      clip.c1[i] = dv.getInt16(i * 8 + 6, true);
    }
    return { clip, T: makeTransform(meta), head: 0, breakables: ent.breakables, buyzones: ent.buyzones, spawns: ent.spawns };
  });
}
function snapFloor(col, gx, gz) {
  const hx = toHammer(col.T, [gx, 0, gz]);
  const top = [hx[0], hx[1], 1000], bot = [hx[0], hx[1], -1200];
  const r = slideAll(col, top, [0, 0, bot[2] - top[2]]);
  return toGame(col.T, r.pos)[1];
}
window.BSP = { movePlayer, loadCollision, snapFloor, snapSpawn, inBuyzone, toHammer, toGame, makeTransform, STEP, GRAV, JUMP };

})();
