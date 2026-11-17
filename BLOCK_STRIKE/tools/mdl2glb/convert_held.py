#!/usr/bin/env python3
"""Export p_ models as bone-local attachments and w_ models for icon rendering.

Usage: python convert_held.py SOURCE_MODELS OUTPUT_MODELS
The existing reader retains the original textures and single-bone vertex weights.
"""
import json, struct, sys
from pathlib import Path
import numpy as np
from mdl_reader import MDL
from convert_weapon_archive import build_glb

def export(src, dst, held):
    m=MDL(src);build_glb(m,dst)
    d=dst.read_bytes();n=struct.unpack_from('<I',d,12)[0]
    j=json.loads(d[20:20+n]);binary=bytearray(d[28+n:])
    def array(ix):
        a=j['accessors'][ix];v=j['bufferViews'][a['bufferView']]
        return np.frombuffer(binary,dtype={5126:'<f4',5125:'<u4',5123:'<u2'}[a['componentType']],count=a['count']*{'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4}[a['type']],offset=v.get('byteOffset',0)).copy().reshape(a['count'],-1)
    def add(data,typ,component=5126):
        data=np.asarray(data,dtype={5126:'<f4',5125:'<u4'}[component]);off=len(binary)
        binary.extend(data.tobytes());binary.extend(b'\0'*(-len(binary)%4))
        j['bufferViews'].append({'buffer':0,'byteOffset':off,'byteLength':data.nbytes})
        a={'bufferView':len(j['bufferViews'])-1,'componentType':component,'count':len(data),'type':typ}
        if typ=='VEC3':a.update(min=data.min(0).tolist(),max=data.max(0).tolist())
        j['accessors'].append(a);return len(j['accessors'])-1
    meshes=[];nodes=[]
    for p in j['meshes'][0]['primitives']:
        a=p['attributes'];pos=array(a['POSITION']);norm=array(a['NORMAL']);uv=array(a['TEXCOORD_0']);bone=array(a['JOINTS_0'])[:,0];tris=array(p['indices']).reshape(-1,3)
        for bi in (np.unique(bone) if held else [-1]):
            selected=tris[np.all(bone[tris]==bi,axis=1)] if held else tris
            if not len(selected):continue
            ix=selected.reshape(-1);ps=pos[ix];ns=norm[ix]
            if held:
                # Weapon-specific Line bones do not exist on player rigs.
                # Rebase their geometry to the nearest shared Hand ancestor.
                attach=int(bi)
                while m.bones[attach]['parent']>=0 and 'Hand' not in m.bones[attach]['name']:
                    attach=m.bones[attach]['parent']
                inv=np.linalg.inv(m.world[attach]);ps=ps@inv[:3,:3].T+inv[:3,3];ns=ns@inv[:3,:3].T
            attrs={'POSITION':add(ps,'VEC3'),'NORMAL':add(ns,'VEC3'),'TEXCOORD_0':add(uv[ix],'VEC2')}
            meshes.append({'primitives':[{'attributes':attrs,'material':p['material'],'mode':4}]})
            nodes.append({'name':'attachment_'+str(len(nodes)),'mesh':len(meshes)-1,'extras':{'attachBone':m.bones[attach]['name'] if held else ''}})
    j['meshes']=meshes;j['nodes']=nodes;j['scenes']=[{'nodes':list(range(len(nodes)))}];j.pop('skins');j.pop('animations')
    j['buffers'][0]['byteLength']=len(binary)
    js=json.dumps(j,separators=(',',':')).encode();js+=b' '*(-len(js)%4)
    dst.write_bytes(struct.pack('<III',0x46546c67,2,28+len(js)+len(binary))+struct.pack('<I4s',len(js),b'JSON')+js+struct.pack('<I4s',len(binary),b'BIN\0')+binary)
    return len(meshes)

if __name__=='__main__':
    src=Path(sys.argv[1]);out=Path(sys.argv[2])
    for prefix,folder,held in [('p_','held',True),('w_','world',False)]:
        (out/folder).mkdir(parents=True,exist_ok=True)
        for f in sorted(src.glob(prefix+'*.mdl')):
            count=export(f,out/folder/(f.stem[2:]+'.glb'),held)
            print(folder,f.stem,count)
