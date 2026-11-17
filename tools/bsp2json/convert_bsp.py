"""Convert a GoldSrc BSP (v30) into the Block Strike JSON map format.

Method: sample the player collision hull (hull 1) on a coarse 3D grid, keep solid cells,
turn vertical solid runs into boxes and merge boxes into larger rectangles.
Coordinates: Hammer X,Y -> game X,Z (rotated so CT side is +Z); Hammer Z -> game Y.
"""
import sys, json, math
sys.path.insert(0, '/home/claude/maps')
from bspread import read, entities, planes, clipnodes2, models

CONTENTS_SOLID = -2

def make_solid_test(lumps):
    pl = planes(lumps)
    cn = clipnodes2(lumps)
    head = models(lumps)[0]['head'][1]
    def solid(x, y, z):
        n = head
        while n >= 0:
            pn, c0, c1 = cn[n]
            nx, ny, nz, dist = pl[pn]
            d = nx * x + ny * y + nz * z - dist
            n = c0 if d >= 0 else c1
        return n == CONTENTS_SOLID
    return solid

def build(path, out_json, map_id, name, cell=96.0, ystep=48.0, scale=1/50.0):
    ver, lumps = read(path)
    m0 = models(lumps)[0]
    ents = entities(lumps)
    solid = make_solid_test(lumps)
    mn, mx = m0['mins'], m0['maxs']

    # ---- spawns and rotation ----
    def pts(cls, zmax=None):
        out = []
        for e in ents:
            if e.get('classname') == cls and 'origin' in e:
                x, y, z = map(float, e['origin'].split())
                if zmax is None or z <= zmax:
                    out.append((x, y, z))
        return out
    ground = pts('info_player_start', 120) + pts('info_player_deathmatch', 120)
    if len(ground) < 2:
        ground = pts('info_player_start') + pts('info_player_deathmatch')
    # farthest pair of spawns in the plane -> the two team ends of the map
    best = None
    for a in ground:
        for b in ground:
            d = (a[0]-b[0])**2 + (a[1]-b[1])**2
            if best is None or d > best[0]:
                best = (d, a, b)
    _, ctp, tp = best
    ang = math.atan2(tp[1] - ctp[1], tp[0] - ctp[0])
    th = (-math.pi / 2) - ang          # CT->T now points to game -Z
    c, s = math.cos(th), math.sin(th)
    def rot(x, y):
        return (x * c - y * s, x * s + y * c)

    # ---- sample grid in rotated game space ----
    corners = [rot(x, y) for x in (mn[0], mx[0]) for y in (mn[1], mx[1])]
    gx0 = min(p[0] for p in corners); gx1 = max(p[0] for p in corners)
    gy0 = min(p[1] for p in corners); gy1 = max(p[1] for p in corners)
    # The sample grid is in Hammer units; rotate sample points back to Hammer.
    # Use the axis-aligned Hammer box, sampled in Hammer space, then rotate the output.
    nx = int((mx[0] - mn[0]) // cell) + 1
    ny = int((mx[1] - mn[1]) // cell) + 1
    zlo = max(mn[2], -64.0); zhi = min(mx[2], 1100.0)
    nz = int((zhi - zlo) // ystep) + 1
    print('grid', nx, ny, nz, 'queries', nx * ny * nz)

    # occupancy in Hammer grid
    occ = {}
    for i in range(nx):
        x = mn[0] + (i + .5) * cell
        for j in range(ny):
            y = mn[1] + (j + .5) * cell
            col = [solid(x, y, zlo + (k + .5) * ystep) for k in range(nz)]
            if any(col):
                occ[(i, j)] = col
    print('solid columns', len(occ))

    # convert vertical runs to boxes in Hammer units, then rotate
    boxes = []  # (x0,x1,y0,y1 in hammer xy, z0,z1)
    for (i, j), col in occ.items():
        k = 0
        while k < nz:
            if col[k]:
                k2 = k
                while k2 + 1 < nz and col[k2 + 1]:
                    k2 += 1
                boxes.append((i, j, zlo + k * ystep, zlo + (k2 + 1) * ystep))
                k = k2 + 1
            else:
                k += 1

    # group by (z0,z1), greedy 2D rectangle merge on the Hammer grid
    from collections import defaultdict
    groups = defaultdict(set)
    for i, j, z0, z1 in boxes:
        groups[(round(z0, 1), round(z1, 1))].add((i, j))
    rects = []
    for (z0, z1), cells in groups.items():
        cells = set(cells)
        while cells:
            i, j = min(cells, key=lambda p: (p[1], p[0]))
            w = 1
            while (i + w, j) in cells: w += 1
            h = 1
            while all((i + a, j + h) in cells for a in range(w)): h += 1
            for a in range(w):
                for b in range(h): cells.discard((i + a, j + b))
            rects.append((i, j, w, h, z0, z1))

    # ---- to game units ----
    blocks = []
    for i, j, w, h, z0, z1 in rects:
        x0 = mn[0] + i * cell; y0 = mn[1] + j * cell
        x1 = x0 + w * cell; y1 = y0 + h * cell
        # rotate the rectangle corners, take the bounding box in game space
        pts4 = [rot(x, y) for x in (x0, x1) for y in (y0, y1)]
        gxa = min(p[0] for p in pts4) * scale; gxb = max(p[0] for p in pts4) * scale
        gza = min(p[1] for p in pts4) * scale; gzb = max(p[1] for p in pts4) * scale
        gy0 = z0 * scale; gy1 = z1 * scale
        if gy1 <= 0.0 and gy0 < 0.0:
            gy0 = gy0  # below floor: keep so ground detection works
        blocks.append({'x': round((gxa + gxb) / 2, 2), 'z': round((gza + gzb) / 2, 2),
                       'w': round(gxb - gxa, 2), 'h': round(gy1 - gy0, 2), 'd': round(gzb - gza, 2),
                       'y': round(gy0, 2), 'color': '#7a7468'})

    # spawns in game space
    def gpos(p):
        gx, gz = rot(p[0], p[1])
        return [round(gx * scale, 2), round((p[2] - 0) * scale, 2), round(gz * scale, 2)]
    spawn = {'ct': gpos(ctp), 't': gpos(tp)}
    spawn['ct'][1] = 0.0; spawn['t'][1] = 0.0
    size = int(math.ceil(max(max(abs(b['x']) + b['w'] / 2, abs(b['z']) + b['d'] / 2) for b in blocks))) + 2 if blocks else 60
    data = {'name': name, 'id': map_id, 'spawn': spawn, 'size': size,
            'groundColor': ['#a0a0a0', '#888'], 'blocks': blocks,
            'notes': 'Dikonversi otomatis dari BSP asli (hull collision, grid kasar). Lihat tools/bsp2json.'}
    json.dump(data, open(out_json, 'w'), separators=(',', ':'))
    print(name, 'blocks', len(blocks), 'size', size, 'spawn', spawn)
    return data

if __name__ == '__main__':
    src, out, mid, nm = sys.argv[1:5]
    build(src, out, mid, nm)
