// nav-graph.js — graf navigasi bot untuk map BSP (cs_kvartal). Klasik (bukan module).
// Node disimpan dalam satuan game (x, y tinggi, z) setelah konversi dari Hammer dengan transform map.
(function () {
  const NG = {};
  let G = null;          // { pos: [[x,y,z]...], adj: [[...]...], spawns }
  let grid = null;       // bucket spasial untuk pencarian node terdekat
  const BUCKET = 128;

  // konversi Hammer -> game, sama dengan BSP.toGame di bsp-physics.js
  function toGame(T, h) {
    const xp = T.c * h[0] - T.s * h[1], yp = T.s * h[0] + T.c * h[1];
    return [xp * T.k, h[2] * T.k, yp * T.k];
  }

  NG.clear = function(){G=null;grid=null};
  NG.load = function (url, transform) {
    return fetch(url).then(r => r.json()).then(g => {
      const T = { c: transform.c, s: transform.s, k: transform.scale };
      G = { pos: g.nodes.map(h => toGame(T, h)), adj: g.adj, spawns: (g.spawns || []).map(sp => ({ team: sp.team, node: sp.node, pos: toGame(T, sp.pos) })) };
      grid = new Map();
      G.pos.forEach((p, i) => {
        const k = Math.floor(p[0] / BUCKET) + ',' + Math.floor(p[2] / BUCKET);
        if (!grid.has(k)) grid.set(k, []);
        grid.get(k).push(i);
      });
      return G;
    });
  };

  // node terdekat ke posisi game p (cari di bucket sekitar dulu, lalu perluas)
  NG.nearest = function (p, maxDist = 400) {
    if (!G) return -1;
    const bx = Math.floor(p[0] / BUCKET), bz = Math.floor(p[2] / BUCKET);
    let best = -1, bd = maxDist * maxDist;
    for (let r = 0; r <= Math.ceil(maxDist / BUCKET); r++) {
      for (let i = bx - r; i <= bx + r; i++) for (let j = bz - r; j <= bz + r; j++) {
        if (Math.max(Math.abs(i - bx), Math.abs(j - bz)) !== r) continue;
        const list = grid.get(i + ',' + j); if (!list) continue;
        for (const id of list) {
          const q = G.pos[id];
          const dx = q[0] - p[0], dy = q[1] - p[1], dz = q[2] - p[2];
          const d = dx * dx + dy * dy * 0.25 + dz * dz;   // tinggi sedikit lebih longgar
          if (d < bd) { bd = d; best = id; }
        }
      }
      if (best >= 0 && bd <= (r * BUCKET) * (r * BUCKET)) break;
    }
    return best;
  };

  // A* dengan heap biner. Mengembalikan array id node dari start ke goal, atau null.
  NG.path = function (start, goal) {
    if (!G || start < 0 || goal < 0) return null;
    if (start === goal) return [start];
    const P = G.pos, A = G.adj;
    const h = (i) => { const a = P[i], b = P[goal]; return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]); };
    const gScore = new Map([[start, 0]]), came = new Map();
    const open = [[h(start), start]], closed = new Set();
    const push = (x) => { open.push(x); let i = open.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (open[p][0] <= open[i][0]) break; [open[p], open[i]] = [open[i], open[p]]; i = p; } };
    const pop = () => { const top = open[0], last = open.pop(); if (open.length) { open[0] = last; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < open.length && open[l][0] < open[m][0]) m = l; if (r < open.length && open[r][0] < open[m][0]) m = r; if (m === i) break; [open[m], open[i]] = [open[i], open[m]]; i = m; } } return top; };
    let expansions = 0;
    while (open.length) {
      const [, cur] = pop();
      if (cur === goal) {
        const out = [cur]; let c = cur; while (came.has(c)) { c = came.get(c); out.push(c); }
        return out.reverse();
      }
      if (closed.has(cur)) continue;
      closed.add(cur);
      if (++expansions > 400000) return null;   // batas aman
      const gc = gScore.get(cur);
      for (const nb of A[cur] || []) {
        if (closed.has(nb)) continue;
        const a = P[cur], b = P[nb];
        const ng = gc + Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
        if (ng < (gScore.has(nb) ? gScore.get(nb) : Infinity)) {
          gScore.set(nb, ng); came.set(nb, cur); push([ng + h(nb), nb]);
        }
      }
    }
    return null;
  };


  // gerak satu bot: ikuti jalur A* + collision BSP
  // Tahap 7 stuck-fix: deteksi ganda (jarak + displacement), side-step, force repath
  NG.botStep = function (b, target, sp, dt) {
    const col = window.bspCol, p = b.g.position;
    if (!col || !window.BSP || !G) return false;
    const nb = b.nav || (b.nav = {
      path: null, idx: 0, age: 9,
      st: { pos: [p.x, p.y, p.z], vy: 0, on: false },
      stuckCount: 0, noProg: 0, sideT: 0, sideDir: 1,
      lastPos: [p.x, p.z], moveAcc: 0
    });
    nb.age += dt;

    // replan periodik / setelah force
    if (!nb.path || nb.age > 1.5) {
      const from = NG.nearest([p.x, p.y, p.z]);
      const to = NG.nearest([target.x, target.y, target.z]);
      nb.path = NG.path(from, to);
      nb.idx = 0;
      nb.age = 0;
      nb.stuckCount = 0;
      nb.noProg = 0;
      nb.sideT = 0;
    }

    let wp = [target.x, target.y, target.z];
    if (nb.path && nb.path.length) {
      while (nb.idx < nb.path.length) {
        const q = G.pos[nb.path[nb.idx]];
        const horiz = Math.hypot(q[0] - p.x, q[2] - p.z);
        const vert = Math.abs(q[1] - p.y);
        if (horiz < 0.55 && vert < 2.2) nb.idx++;
        else break;
      }
      if (nb.idx < nb.path.length) wp = G.pos[nb.path[nb.idx]];
    }

    // --- deteksi macet (dua sinyal) ---
    const curD = Math.hypot(wp[0] - p.x, wp[2] - p.z);
    const moved = Math.hypot(p.x - (nb.lastPos[0] || p.x), p.z - (nb.lastPos[1] || p.z));
    nb.lastPos = [p.x, p.z];
    nb.moveAcc = (nb.moveAcc || 0) * 0.85 + moved;

    if (nb.wpRef !== nb.idx) {
      nb.wpRef = nb.idx;
      nb.bestD = curD;
      nb.noProg = 0;
    } else if (curD < (nb.bestD || curD) - 0.04) {
      nb.bestD = curD;
      nb.noProg = 0;
    } else {
      nb.noProg = (nb.noProg || 0) + dt;
    }

    // sinyal 2: hampir tidak bergerak
    if (nb.moveAcc < sp * dt * 0.25) nb.noProg += dt * 0.55;

    // recovery
    if (nb.noProg > 0.7 && nb.path) {
      nb.idx++;
      nb.noProg = 0;
      nb.stuckCount = (nb.stuckCount || 0) + 1;
      nb.sideT = 0.55;
      nb.sideDir = (nb.sideDir || 1) * -1;
      if (nb.stuckCount >= 3) {
        nb.age = 9;
        nb.stuckCount = 0;
      }
    }

    if (curD > 8) nb.age = 9;

    const dx = wp[0] - p.x, dz = wp[2] - p.z, d = Math.hypot(dx, dz) || 1;
    let wishX = dx / d * sp;
    let wishZ = dz / d * sp;

    // side-step saat recovery
    if (nb.sideT > 0) {
      nb.sideT -= dt;
      const sx = -dz / d * sp * 0.85 * (nb.sideDir || 1);
      const sz =  dx / d * sp * 0.85 * (nb.sideDir || 1);
      wishX = wishX * 0.35 + sx;
      wishZ = wishZ * 0.35 + sz;
    }

    const heightDiff = wp[1] - p.y;
    const jump = nb.st.on && heightDiff > 0.32;

    nb.st.pos = [p.x, p.y, p.z];
    BSP.movePlayer(col, col.T, nb.st, [wishX, wishZ], dt, jump);
    p.set(nb.st.pos[0], nb.st.pos[1], nb.st.pos[2]);

    b.navStuck = (nb.noProg > 0.25) || (nb.sideT > 0);
    return true;
  };

  NG.pos = (i) => G.pos[i];
  NG.graph = () => G;
  window.NavGraph = NG;
})();
