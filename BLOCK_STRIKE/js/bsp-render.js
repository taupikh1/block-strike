// bsp-render.js - memuat geometri BSP hasil ekspor (manifest.json, geo.bin, tex/*.png, lm/*.png).
// Dimuat sebagai script biasa setelah three.js dan sebelum game-core.js.
// Tahap 3: lightmap dipasang lewat MeshBasicMaterial (map * lightMap * lightMapIntensity).
// Skybox tahap 4: 6 sisi GoldSrc (ft, bk, lf, rt, up, dn) pada kotak yang diputar sesuai map.
// Mengikuti kamera lewat window.bspSky.position (diatur dari game-core.js).
function loadBspSky(dir, man, scene, loadTexture) {
  const f = {};
  ['ft','bk','lf','rt','up','dn'].forEach(k => { f[k] = loadTexture(dir + '/' + man.sky.dir + '/' + k + '.png'); });
  // urutan material BoxGeometry: +X, -X, +Y, -Y, +Z, -Z
  // +X hammer = ft, +Y hammer = lf (dipetakan ke +Z three), up = +Y game
  const mats = [f.ft, f.bk, f.up, f.dn, f.lf, f.rt].map(t => new THREE.MeshBasicMaterial({
    map: t, side: THREE.BackSide, depthWrite: false, fog: false }));
  const box = new THREE.Mesh(new THREE.BoxGeometry(280, 280, 280), mats);
  box.renderOrder = -1;
  const grp = new THREE.Group();
  grp.add(box);
  grp.rotation.y = -(man.rotation || 0);   // sama dengan rotasi transform geometri
  scene.add(grp);
  window.bspSky = grp;
}

// Props (model .mdl statis) tahap 4b. Setiap model dimuat sekali lalu di-clone per instance.
// Sumbu lokal di-swap (vx, vz, vy) seperti pada tools/bsp2json/export_props.py.
function loadBspProps(dir, scene, loadTexture) {
  return Promise.all([
    fetch(dir + '/props/props.json').then(r => r.json()),
    fetch(dir + '/props/props.bin').then(r => r.arrayBuffer())
  ]).then(([pj, buf]) => {
    const protos = {};
    Object.keys(pj.models).forEach(key => {
      const g = new THREE.Group();
      pj.models[key].groups.forEach(gr => {
        const n = gr.vertices;
        const raw = new Float32Array(buf, gr.posOffset, n * 3).slice();
        for (let i = 0; i < n * 3; i += 3) { const y = raw[i + 1]; raw[i + 1] = raw[i + 2]; raw[i + 2] = y; }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(raw, 3));
        geo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(buf, gr.uvOffset, n * 2).slice(), 2));
        geo.computeVertexNormals();
        const tex = loadTexture(dir + '/props/' + gr.tex);
        tex.flipY = false;
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.magFilter = THREE.NearestFilter;
        tex.minFilter = gr.alpha ? THREE.NearestFilter : THREE.LinearMipMapLinearFilter;
        tex.generateMipmaps = !gr.alpha; // Avoid blue palette-key bleed on masked foliage.
        const mat = new THREE.MeshLambertMaterial({ map: tex, side: THREE.DoubleSide, alphaTest: gr.alpha ? 0.5 : 0 });
        g.add(new THREE.Mesh(geo, mat));
      });
      protos[key] = g;
    });
    pj.instances.forEach(inst => {
      const proto = protos[inst.model];
      if (!proto) return;
      const o = proto.clone(true);
      o.position.set(inst.x, inst.y, inst.z);
      o.rotation.y = inst.rotY;
      scene.add(o);o.traverse(m=>{if(m.isMesh)scene.userData.rayMeshes?.push(m)});
    });
  });
}

window.loadBspWorld = function (dir, scene) {
  const loader = new THREE.TextureLoader(), pending = [], errors = [];
  const loadTexture = url => {
    let texture;
    pending.push(new Promise(resolve => {
      texture = loader.load(url, resolve, undefined, () => { errors.push(url); resolve(); });
    }));
    return texture;
  };
  return fetch(dir + '/manifest.json').then(r => {
    if (!r.ok) throw new Error('manifest ' + dir);
    return r.json();
  }).then(man => {
    return fetch(dir + '/geo.bin').then(r => r.arrayBuffer()).then(buf => {
      const lmCache = {};
      const intensity = man.lightmapIntensity || 1;
      const texOpts = (t, nearest) => {
        t.flipY = false;                       // baris 0 atlas/tekstur = v 0 (sesuai ekspor)
        t.wrapS = t.wrapT = THREE.RepeatWrapping;
        t.magFilter = nearest ? THREE.NearestFilter : THREE.LinearFilter;
        t.minFilter = THREE.LinearMipMapLinearFilter;
        return t;
      };
      man.groups.forEach(g => {
        const n = g.vertices;
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(buf, g.posOffset, n * 3), 3));
        geo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(buf, g.uvOffset, n * 2), 2));
        const tex = texOpts(loadTexture(dir + '/' + g.tex), true);
        const opts = { map: tex, side: THREE.DoubleSide, alphaTest: g.alpha ? 0.5 : 0 };
        if (g.lightmap && g.uv2Offset !== undefined) {
          geo.setAttribute('uv2', new THREE.BufferAttribute(new Float32Array(buf, g.uv2Offset, n * 2), 2));
          if (!lmCache[g.lightmap]) lmCache[g.lightmap] = texOpts(loadTexture(dir + '/' + g.lightmap), false);
          opts.lightMap = lmCache[g.lightmap];
          opts.lightMapIntensity = intensity;
        }
        const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial(opts));
        scene.add(mesh);scene.userData.rayMeshes?.push(mesh);
      });
      if (man.sky) loadBspSky(dir, man, scene, loadTexture);
      return loadBspProps(dir, scene, loadTexture).then(() => Promise.all(pending)).then(() => {
        if (errors.length) throw new Error('Tekstur map gagal dimuat: ' + errors[0]);
      });
    });
  });
};
