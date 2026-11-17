#!/usr/bin/env python3
"""Repair known masked foliage exports from Tahap 7 (exact black palette key).

Run from BLOCK_STRIKE: python tools/fix_prop_alpha.py
Only these inspected textures are changed; opaque tree trunks stay opaque.
The original MDL map sources were not included, so this is an explicit export repair.
"""
from pathlib import Path
from PIL import Image
import numpy as np
import json

root = Path(__file__).resolve().parents[1] / 'assets/maps/bsp'
names = json.loads(Path(__file__).with_name('foliage-alpha.json').read_text())
for name in names:
    path = root / name
    rgba = np.array(Image.open(path).convert('RGBA'))
    mask = np.all(rgba[..., :3] == 0, axis=-1)
    changed = int(np.count_nonzero(mask & (rgba[..., 3] != 0)))
    if changed:
        rgba[mask, 3] = 0
        Image.fromarray(rgba).save(path)
    print(path.relative_to(root), 'repaired alpha pixels:', changed)
