"""Validated reader for GoldSrc Studio Model v10 (IDST) weapon viewmodels."""
from __future__ import annotations
import math
import struct
import numpy as np

class MDL:
    HEADER = 244
    def __init__(self, source):
        self.d = source if isinstance(source, (bytes, bytearray, memoryview)) else open(source, 'rb').read()
        self.d = bytes(self.d)
        if len(self.d) < self.HEADER or self.d[:4] != b'IDST':
            raise ValueError('Not a valid GoldSrc MDL: missing IDST header')
        self.version = self.i32(4)
        if self.version != 10:
            raise ValueError(f'Unsupported GoldSrc MDL version {self.version}; expected 10')
        declared = self.i32(72)
        if declared and declared > len(self.d):
            raise ValueError(f'MDL header declares {declared} bytes, file has {len(self.d)}')
        self.nb, self.bi = self.i32(140), self.i32(144)
        self.nseq, self.si = self.i32(164), self.i32(168)
        self.ntex, self.ti = self.i32(180), self.i32(184)
        self.nskinref, self.nskinfamilies, self.skinidx = self.i32(192), self.i32(196), self.i32(200)
        self.nbody, self.bodyidx = self.i32(204), self.i32(208)
        self._range(self.bi, self.nb, 112, 'bone table')
        self._range(self.si, self.nseq, 176, 'sequence table')
        self._range(self.ti, self.ntex, 80, 'texture table')
        self._range(self.bodyidx, self.nbody, 76, 'bodypart table')
        if self.nb < 1 or self.nb > 256: raise ValueError(f'Invalid bone count: {self.nb}')
        self.bones = []
        for i in range(self.nb):
            o = self.bi + i * 112
            name = self.d[o:o+32].split(b'\0')[0].decode('latin1', 'replace') or f'bone_{i}'
            parent = self.i32(o+32)
            val = self.floats(o+64, 6)
            scale = self.floats(o+88, 6)
            if parent >= i or parent < -1: raise ValueError(f'Invalid parent {parent} for bone {name}')
            self.bones.append({'name': name, 'parent': parent, 'val': val, 'scale': scale})
        self.seqs = []
        for i in range(self.nseq):
            o = self.si + i * 176
            name = self.d[o:o+32].split(b'\0')[0].decode('latin1', 'replace').strip() or f'sequence_{i}'
            fps = struct.unpack_from('<f', self.d, o+32)[0]
            nframes = self.i32(o+56)
            nblends = self.i32(o+120)
            animindex = self.i32(o+124)
            group = self.i32(o+164)
            if nframes < 1 or nframes > 10000: raise ValueError(f'Invalid frame count {nframes} in sequence {name}')
            if nblends < 1 or nblends > 16: raise ValueError(f'Invalid blend count {nblends} in sequence {name}')
            if group != 0: raise ValueError(f'Sequence {name} uses external sequence group {group}, unsupported by embedded v_model')
            self._range(animindex, self.nb * 12 * nblends, 1, f'animation data for {name}')
            self.seqs.append({'name': name, 'fps': fps if fps > 0 else 30.0, 'nf': nframes,
                              'nblends': nblends, 'animindex': animindex, 'group': group, 'index': i})
        self.textures = self._read_textures()
        self.skin = self._read_skin()
        self.world = self._bone_world_matrices()

    def _range(self, offset, count, stride, label):
        if offset < 0 or count < 0 or stride < 0 or offset + count * stride > len(self.d):
            raise ValueError(f'Out-of-bounds {label}: offset={offset}, count={count}, stride={stride}, file={len(self.d)}')
    def i32(self, o): self._range(o, 1, 4, 'int32'); return struct.unpack_from('<i', self.d, o)[0]
    def i16(self, o): self._range(o, 1, 2, 'int16'); return struct.unpack_from('<h', self.d, o)[0]
    def u16(self, o): self._range(o, 1, 2, 'uint16'); return struct.unpack_from('<H', self.d, o)[0]
    def floats(self, o, n): self._range(o, 1, n*4, 'float array'); return struct.unpack_from('<'+'f'*n, self.d, o)
    def _read_textures(self):
        out=[]
        for i in range(self.ntex):
            o=self.ti+i*80
            flags,w,h,idx=self.i32(o+64),self.i32(o+68),self.i32(o+72),self.i32(o+76)
            if not (0 < w <= 4096 and 0 < h <= 4096): raise ValueError(f'Invalid texture size {w}x{h} at index {i}')
            self._range(idx, w*h+768, 1, f'texture pixels/palette {i}')
            px=np.frombuffer(self.d,dtype=np.uint8,count=w*h,offset=idx).reshape(h,w)
            pal=np.frombuffer(self.d,dtype=np.uint8,count=768,offset=idx+w*h).reshape(256,3)
            rgba=np.empty((h,w,4),dtype=np.uint8); rgba[:,:,:3]=pal[px]
            rgba[:,:,3]=np.where((px==255) & (flags&0x40),0,255)
            out.append({'flags':flags,'width':w,'height':h,'rgba':rgba})
        return out
    def _read_skin(self):
        if not self.nskinref or not self.nskinfamilies: return tuple(range(self.ntex))
        self._range(self.skinidx,self.nskinref*self.nskinfamilies,2,'skin table')
        return struct.unpack_from('<%dh'%self.nskinref,self.d,self.skinidx)
    def _bone_world_matrices(self):
        out=[]
        for b in self.bones:
            m=np.eye(4);m[:3,:3]=quat_matrix(angles_quat(b['val'][3:]));m[:3,3]=b['val'][:3]
            out.append(out[b['parent']]@m if b['parent']>=0 else m)
        return out
    def frame(self, seq_index, frame_index, blend=0):
        seq=self.seqs[seq_index]
        if not 0 <= frame_index < seq['nf']: raise IndexError('frame index out of range')
        if not 0 <= blend < seq['nblends']: raise IndexError('blend index out of range')
        blend_base=seq['animindex'] + blend*self.nb*12
        result=[]
        for bone_index,bone in enumerate(self.bones):
            base=blend_base+bone_index*12
            self._range(base,1,12,'bone animation record')
            offsets=struct.unpack_from('<6H',self.d,base)
            values=[]
            for channel,rel in enumerate(offsets):
                if rel == 0:
                    sample=0
                else:
                    p=base+rel; remaining=frame_index; sample=None; guard=0
                    while sample is None:
                        self._range(p,1,2,'animation value header')
                        valid,total=self.d[p],self.d[p+1]
                        if total == 0: raise ValueError(f'Zero-length animation run in sequence {seq["name"]}')
                        if total > remaining:
                            if valid:
                                self._range(p+2,valid,2,'animation value samples')
                                ix=min(remaining,valid-1)
                                sample=self.i16(p+2+ix*2)
                            else:
                                sample=0
                        else:
                            remaining-=total
                            p+=(valid+1)*2
                        guard+=1
                        if guard>seq['nf']+64: raise ValueError(f'Animation run overflow in sequence {seq["name"]}')
                values.append(bone['val'][channel] + sample*bone['scale'][channel])
            result.append(values)
        return result

def angles_quat(a):
    sr,cr=math.sin(a[0]/2),math.cos(a[0]/2)
    sp,cp=math.sin(a[1]/2),math.cos(a[1]/2)
    sy,cy=math.sin(a[2]/2),math.cos(a[2]/2)
    return np.array([sr*cp*cy-cr*sp*sy,cr*sp*cy+sr*cp*sy,cr*cp*sy-sr*sp*cy,cr*cp*cy+sr*sp*sy],dtype=np.float64)

def quat_matrix(q):
    x,y,z,w=q
    return np.array([[1-2*(y*y+z*z),2*(x*y-z*w),2*(x*z+y*w)],
                     [2*(x*y+z*w),1-2*(x*x+z*z),2*(y*z-x*w)],
                     [2*(x*z-y*w),2*(y*z+x*w),1-2*(x*x+y*y)]],dtype=np.float64)
