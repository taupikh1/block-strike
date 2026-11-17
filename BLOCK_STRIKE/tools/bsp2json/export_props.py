"""Tahap 4b: props (model .mdl statis) untuk map BSP.
- Memakai parser dari tools/mdl2glb (mdl_reader + parse_geometry) untuk model IDST v10.
- Geometri setiap model dikeluarkan per grup tekstur (Float32), pada koordinat lokal model (sumbu GoldSrc).
- Instance (origin, yaw) dihitung ke koordinat game; rotasi Y dalam radian = -(yaw + rotasi map).
"""
import sys, os, json, math, struct
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bsp_full as B
import export_render as R
from mdl_reader import MDL
import convert_weapon_archive as CW

SCALE = R.SCALE

def parse_ents_with_angles(bsp):
    return R.parse_ents(bsp)

def export_props(bsp_path, mdl_root, out_dir):
    bsp = B.load(bsp_path)
    ents = parse_ents_with_angles(bsp)
    th, ct, t = R.spawn_rotation(ents)
    c, s = math.cos(th), math.sin(th)
    os.makedirs(os.path.join(out_dir, 'props', 'tex'), exist_ok=True)

    inst = []
    names = set()
    for e in ents:
        m = e.get('model', '')
        if not m.lower().endswith('.mdl') or 'origin' not in e:
            continue
        ox, oy, oz = map(float, e['origin'].split())
        yaw = float(e.get('angles', '0 0 0').split()[1]) if 'angles' in e else 0.0
        gx = (ox * c - oy * s) * SCALE; gz = (ox * s + oy * c) * SCALE; gy = oz * SCALE
        rot_y = -(math.radians(yaw) + th)
        key = m.replace('\\', '/').lower()
        names.add(key)
        inst.append({'model': key, 'x': round(gx, 3), 'y': round(gy, 3), 'z': round(gz, 3), 'rotY': round(rot_y, 5)})

    # index file names case-insensitively (zip contents keep original case)
    index = {}
    for root, _, files in os.walk(mdl_root):
        for f in files:
            full = os.path.join(root, f)
            index[os.path.relpath(full, mdl_root).replace('\\', '/').lower()] = full
    manifest = {'models': {}, 'instances': inst, 'failed': []}
    blob = bytearray()
    for key in sorted(names):
        path = index.get(key)
        if not path:
            manifest['failed'].append((key, 'file missing')); continue
        try:
            mdl = MDL(path)
            prims, _ = CW.parse_geometry(mdl)
        except Exception as ex:
            manifest['failed'].append((key, str(ex)[:80])); continue
        groups = []
        for pi, p in enumerate(prims):
            I = p['I']; P = p['P'].astype(np.float32); UV = p['UV'].astype(np.float32)
            pos = P[I.reshape(-1)] * SCALE           # model local, game scale; sumbu di-swap di JS
            uv = UV[I.reshape(-1)]
            tex = mdl.textures[p['tex']]
            rgba = tex['rgba'].copy()
            if tex['flags'] & 0x40:
                # GoldSrc memakai biru murni sebagai warna transparan; indeks 255 tidak selalu dipakai
                key_blue = (rgba[..., 2] > 200) & (rgba[..., 0] < 60) & (rgba[..., 1] < 60)
                rgba[key_blue, 3] = 0
            tex = dict(tex); tex['rgba'] = rgba
            tname = f"{safe(key)}_{pi}.png"
            tpath = os.path.join(out_dir, 'props', 'tex', tname)
            if not os.path.exists(tpath):
                Image.fromarray(tex['rgba'], 'RGBA').save(tpath)
            entry = {'tex': f'tex/{tname}', 'vertices': int(pos.shape[0]), 'alpha': bool(tex['flags'] & 0x40)}
            entry['posOffset'] = len(blob); blob += np.ascontiguousarray(pos, dtype='<f4').tobytes()
            entry['uvOffset'] = len(blob); blob += np.ascontiguousarray(uv, dtype='<f4').tobytes()
            groups.append(entry)
        manifest['models'][key] = {'groups': groups}
    open(os.path.join(out_dir, 'props', 'props.bin'), 'wb').write(bytes(blob))
    json.dump(manifest, open(os.path.join(out_dir, 'props', 'props.json'), 'w'), indent=1)
    return manifest

def safe(n):
    return ''.join(ch if ch.isalnum() else '_' for ch in n)[:60]

if __name__ == '__main__':
    bsp_path, mdl_root, out = sys.argv[1:4]
    m = export_props(bsp_path, mdl_root, out)
    print(os.path.basename(out), 'models', len(m['models']), 'instances', len(m['instances']), 'failed', len(m['failed']))
    for f in m['failed'][:8]: print('  fail', f)
