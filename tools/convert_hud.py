"""Convert supplied GoldSrc SPR v2 single-frame HUD atlases to PNG.
Usage: python tools/convert_hud.py SOURCE_SPR_DIR assets/ui/hud
Requires Pillow. Group frames intentionally rejected rather than misread.
"""
import struct,sys
from pathlib import Path
from PIL import Image
src,out=map(Path,sys.argv[1:]);out.mkdir(parents=True,exist_ok=True)
for p in src.glob('*.spr'):
 d=p.read_bytes();magic,version,typ,fmt,r,w,h,n,beam,sync=struct.unpack_from('<4siiifiiifi',d)
 assert magic==b'IDSP' and version==2
 colors=struct.unpack_from('<H',d,40)[0];pos=42;pal=d[pos:pos+colors*3];pos+=colors*3
 for i in range(n):
  group=struct.unpack_from('<i',d,pos)[0];pos+=4
  if group:raise ValueError('Grouped frame unsupported: '+str(p))
  x,y,fw,fh=struct.unpack_from('<iiii',d,pos);pos+=16
  px=d[pos:pos+fw*fh];pos+=fw*fh;rgba=[]
  for c in px:
   rgb=tuple(pal[c*3:c*3+3]);alpha=max(rgb) if fmt==1 else c if fmt==2 else 0 if fmt==3 and c==255 else 255
   rgba.append((*rgb,alpha))
  im=Image.new('RGBA',(fw,fh));im.putdata(rgba);im.save(out/(p.stem+'_'+str(i)+'.png'))
