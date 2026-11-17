// bsp-doors.js — func_door: geometri bergerak + collision bergerak + logika buka/tutup (klasik, dipakai game-core.js).
(function () {
  const S = 0.02;                  // skala Hammer -> game (sama dengan manifest)
  const TOUCH = 24;                // jarak sentuh (Hammer units) untuk memicu pintu
  const doors = [];
  let col = null, mapDir = null, intensity = 1;

  function texOpts(t, nearest) {
    t.flipY = false; t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.magFilter = nearest ? THREE.NearestFilter : THREE.LinearFilter;
    t.minFilter = THREE.LinearMipMapLinearFilter; return t;
  }
  // muat geometri pintu dan kumpulkan entry collision
  function load(dir, scene, collision, manifestIntensity) {
    mapDir = dir; col = collision; intensity = manifestIntensity || 1;
    doors.length = 0;
    return Promise.all([
      fetch(dir + '/doors.json').then(r => r.json()),
      fetch(dir + '/doors_geo.bin').then(r => r.arrayBuffer())
    ]).then(([meta, buf]) => {
      intensity = meta.lightmapIntensity || intensity;
      const loader = new THREE.TextureLoader(), lmCache = {}, texCache = {};
      for (const d of meta.doors) {
        const grp = new THREE.Group(); scene.add(grp);
        for (const g of d.groups) {
          const n = g.vertices;
          const geo = new THREE.BufferGeometry();
          geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(buf, g.posOffset, n * 3), 3));
          geo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(buf, g.uvOffset, n * 2), 2));
          const opts = { side: THREE.DoubleSide, alphaTest: g.alpha ? 0.5 : 0 };
          if (g.tex) {
            if (!texCache[g.tex]) texCache[g.tex] = texOpts(loader.load(dir + '/' + g.tex), true);
            opts.map = texCache[g.tex];
          }
          if (g.uv2Offset !== undefined && g.lightmap) {
            geo.setAttribute('uv2', new THREE.BufferAttribute(new Float32Array(buf, g.uv2Offset, n * 2), 2));
            if (!lmCache[g.lightmap]) lmCache[g.lightmap] = texOpts(loader.load(dir + '/' + g.lightmap), false);
            opts.lightMap = lmCache[g.lightmap]; opts.lightMapIntensity = intensity;
          }
          const mesh=new THREE.Mesh(geo,new THREE.MeshBasicMaterial(opts));grp.add(mesh);scene.userData.rayMeshes?.push(mesh);
        }
        const entry = { origin: [0, 0, 0], mins: d.mins, maxs: d.maxs, hull1: d.hull1 };
        if (col && col.breakables) col.breakables.push(entry);
        doors.push({ d, grp, entry, p: 0, state: 'closed', timer: 0, touchable: !d.targetname });
      }
      return doors.length;
    });
  }
  function insideTouch(dr, h) {
    const o = dr.entry.origin, mn = dr.d.mins, mx = dr.d.maxs;
    for (let i = 0; i < 3; i++) {
      if (h[i] < mn[i] + o[i] - TOUCH || h[i] > mx[i] + o[i] + TOUCH) return false;
    }
    return true;
  }
  // dt dalam detik; ph = posisi pemain dalam Hammer units
  function update(dt, ph, other=[]) {
    for (const dr of doors) {
      const d = dr.d;
      const touching = dr.touchable && (insideTouch(dr, ph)||other.some(h=>insideTouch(dr,h)));
      if (dr.state === 'closed' && touching) dr.state = 'opening';
      if (dr.state === 'opening') {
        dr.p += d.speed * dt;
        if (dr.p >= d.distance) { dr.p = d.distance; dr.state = 'open'; dr.timer = d.wait; }
      } else if (dr.state === 'open') {
        if (d.wait >= 0) {
          if (touching) dr.timer = d.wait;
          else { dr.timer -= dt; if (dr.timer <= 0) dr.state = 'closing'; }
        }
      } else if (dr.state === 'closing') {
        if (touching) dr.state = 'opening';
        else {
          dr.p -= d.speed * dt;
          if (dr.p <= 0) { dr.p = 0; dr.state = 'closed'; }
        }
      }
      // terapkan posisi: mesh (game units) dan collision (Hammer units)
      const mv = d.movedir_g, s = dr.p * S;
      dr.grp.position.set(mv[0] * s, mv[1] * s, mv[2] * s);
      const mh = d.movedir_h;
      dr.entry.origin = [mh[0] * dr.p, mh[1] * dr.p, mh[2] * dr.p];
    }
  }
  window.BSPDoors = { load, update, clear:()=>{doors.length=0;col=null}, list: () => doors };
})();
