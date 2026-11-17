#!/usr/bin/env python3
"""Convert GoldSrc v10 first-person weapon MDLs to skinned, animated glTF 2.0 GLB."""
from __future__ import annotations
import argparse, io, json, math, struct, zipfile
from pathlib import Path
import numpy as np
from PIL import Image
from mdl_reader import MDL, angles_quat, quat_matrix

SCALE=0.025
ARM_Q=np.array([-0.5,0.5,0.5,0.5],dtype=np.float64)
VIEW_ROT=np.array([[0.,0.,1.],[0.,1.,0.],[-1.,0.,0.]],dtype=np.float64)
# GoldSrc view space: +X forward, +Y screen right, +Z up.
# Keep a proper rotation and reflect local Y once for the right-handed view.
ROOT_ROT=np.array([[0.,-1.,0.],[0.,0.,1.],[-1.,0.,0.]],dtype=np.float64)

def matrix_quat(m):
    # Stable rotation-matrix to xyzw quaternion conversion.
    tr=float(np.trace(m))
    if tr>0:
        s=math.sqrt(tr+1.0)*2; q=[(m[2,1]-m[1,2])/s,(m[0,2]-m[2,0])/s,(m[1,0]-m[0,1])/s,.25*s]
    elif m[0,0]>m[1,1] and m[0,0]>m[2,2]:
        s=math.sqrt(1+m[0,0]-m[1,1]-m[2,2])*2; q=[.25*s,(m[0,1]+m[1,0])/s,(m[0,2]+m[2,0])/s,(m[2,1]-m[1,2])/s]
    elif m[1,1]>m[2,2]:
        s=math.sqrt(1+m[1,1]-m[0,0]-m[2,2])*2; q=[(m[0,1]+m[1,0])/s,.25*s,(m[1,2]+m[2,1])/s,(m[0,2]-m[2,0])/s]
    else:
        s=math.sqrt(1+m[2,2]-m[0,0]-m[1,1])*2; q=[(m[0,2]+m[2,0])/s,(m[1,2]+m[2,1])/s,.25*s,(m[1,0]-m[0,1])/s]
    q=np.asarray(q,dtype=np.float64); return q/np.linalg.norm(q)

def parse_geometry(m):
    d=m.d;u=m.i32;sh=m.i16
    nbody,bodyidx=m.nbody,m.bodyidx
    primitives=[]; transformed_points=[]
    for body_i in range(nbody):
        bo=bodyidx+body_i*76
        nmodels,modelidx=u(bo+64),u(bo+72)
        for model_i in range(min(1,nmodels)): # bodygroup 0, not every alternative at once
            mo=modelidx+model_i*112
            nmesh,meshi,nv,vinfo,vert,nn,ninfo,norm=(u(mo+72),u(mo+76),u(mo+80),u(mo+84),u(mo+88),u(mo+92),u(mo+96),u(mo+100))
            if nv<=0 or nv>200000: continue
            m._range(vinfo,nv,1,'vertex bone indices');m._range(vert,nv,12,'vertex positions')
            if nn: m._range(ninfo,nn,1,'normal bone indices');m._range(norm,nn,12,'normals')
            for mesh_i in range(nmesh):
                me=meshi+mesh_i*20
                tri_count,triidx,skinref=u(me),u(me+4),u(me+8)
                if tri_count<=0: continue
                if skinref<0 or skinref>=len(m.skin): raise ValueError('Mesh skin reference out of range')
                tex=m.skin[skinref]
                if tex<0 or tex>=len(m.textures): raise ValueError(f'Mesh references missing texture {tex}')
                texture=m.textures[tex]
                P=[];N=[];UV=[];J=[];I=[];p=triidx;commands=0
                while True:
                    m._range(p,1,2,'triangle command')
                    count=sh(p);p+=2
                    if count==0: break
                    fan=count<0;count=abs(count)
                    if count<3 or count>4096: raise ValueError(f'Invalid triangle command vertex count {count}')
                    m._range(p,count,8,'triangle command vertices')
                    verts=[]
                    for _ in range(count):
                        vi,ni,s,t=struct.unpack_from('<4h',d,p);p+=8
                        if vi<0 or vi>=nv: raise ValueError(f'Vertex index {vi} out of range')
                        bone=d[vinfo+vi]
                        if bone>=m.nb: raise ValueError(f'Vertex references missing bone {bone}')
                        if nn:
                            if ni<0 or ni>=nn: raise ValueError(f'Normal index {ni} out of range')
                            normal_bone=d[ninfo+ni]
                            if normal_bone>=m.nb: raise ValueError(f'Normal references missing bone {normal_bone}')
                            normal=np.array(struct.unpack_from('<3f',d,norm+ni*12),dtype=np.float64)
                            normal=m.world[normal_bone][:3,:3]@normal
                        else: normal=np.array([0.,0.,1.])
                        position=np.array(struct.unpack_from('<3f',d,vert+vi*12),dtype=np.float64)
                        # GoldSrc vertices are stored in their assigned bone-local space.
                        # Move them to the shared bind-pose mesh space before applying inverse bind matrices.
                        position=m.world[bone][:3,:3]@position+m.world[bone][:3,3]
                        P.append(position);N.append(normal);UV.append((s/texture['width'],t/texture['height']));J.append(bone)
                        transformed_points.append((ROOT_ROT@position)*SCALE)
                        verts.append(len(P)-1)
                    for q in range(2,count):
                        if fan: tri=(verts[0],verts[q-1],verts[q])
                        elif q%2==0: tri=(verts[q-2],verts[q-1],verts[q])
                        else: tri=(verts[q-1],verts[q-2],verts[q])
                        I.append(tri[::-1])
                    commands+=1
                    if commands>100000: raise ValueError('Triangle command list appears corrupt')
                if I:
                    primitives.append({'P':np.asarray(P,dtype='<f4'),'N':np.asarray(N,dtype='<f4'),
                        'UV':np.asarray(UV,dtype='<f4'),'J':np.asarray(J,dtype=np.uint16),
                        'I':np.asarray(I,dtype='<u4'),'tex':tex})
    if not primitives: raise ValueError('No renderable triangle primitives found')
    pts=np.asarray(transformed_points,dtype=np.float64)
    return primitives,(0.,0.,0.)

def build_glb(m, out_path):
    primitives,root_translation=parse_geometry(m);nb=m.nb
    j={'asset':{'version':'2.0','generator':'BLOCK STRIKE GoldSrc v10 animated MDL converter'},
       'scene':0,'scenes':[{'nodes':[0]}],'nodes':[],'meshes':[{'name':'GoldSrcViewmodel','primitives':[]}],
       'materials':[],'textures':[],'images':[],'samplers':[{'magFilter':9729,'minFilter':9987,'wrapS':10497,'wrapT':10497}],
       'buffers':[],'bufferViews':[],'accessors':[],'skins':[],'animations':[]}
    binary=bytearray()
    def add_view(raw,target=None):
        raw=bytes(raw);off=len(binary);binary.extend(raw);binary.extend(b'\0'*((-len(binary))%4))
        v={'buffer':0,'byteOffset':off,'byteLength':len(raw)}
        if target is not None:v['target']=target
        j['bufferViews'].append(v);return len(j['bufferViews'])-1
    def add_accessor(arr,typ,component=5126,target=None,mins=False):
        arr=np.ascontiguousarray(arr)
        v=add_view(arr.tobytes(),target)
        a={'bufferView':v,'componentType':component,'count':len(arr),'type':typ}
        if mins:
            a['min']=[float(x) for x in arr.min(axis=0).reshape(-1)]
            a['max']=[float(x) for x in arr.max(axis=0).reshape(-1)]
        j['accessors'].append(a);return len(j['accessors'])-1
    # Embedded indexed textures and materials.
    material_by_texture={}
    for tex in range(len(m.textures)):
        t=m.textures[tex];flags=t['flags']
        if flags&0x2: continue
        png=io.BytesIO();Image.fromarray(t['rgba']).save(png,format='PNG',optimize=True)
        image_view=add_view(png.getvalue());j['images'].append({'bufferView':image_view,'mimeType':'image/png'})
        j['textures'].append({'sampler':0,'source':len(j['images'])-1})
        mat={'name':f'GoldSrcTexture_{tex}','pbrMetallicRoughness':{'baseColorTexture':{'index':len(j['textures'])-1},'metallicFactor':0.0,'roughnessFactor':0.92},'doubleSided':True}
        if flags&0x40:mat['alphaMode']='MASK';mat['alphaCutoff']=0.5
        j['materials'].append(mat);material_by_texture[tex]=len(j['materials'])-1
    chrome_mat=None
    for p in primitives:
        if m.textures[p['tex']]['flags']&0x2:
            if chrome_mat is None:
                j['materials'].append({'name':'GoldSrcChrome','pbrMetallicRoughness':{'baseColorFactor':[.42,.44,.46,1.0],'metallicFactor':.55,'roughnessFactor':.42},'doubleSided':True})
                chrome_mat=len(j['materials'])-1
            mat_index=chrome_mat
        else: mat_index=material_by_texture[p['tex']]
        joints=np.zeros((len(p['J']),4),dtype='<u2');joints[:,0]=p['J']
        weights=np.zeros((len(p['J']),4),dtype='<f4');weights[:,0]=1.0
        attrs={'POSITION':add_accessor(p['P'],'VEC3',target=34962,mins=True),
               'NORMAL':add_accessor(p['N'],'VEC3',target=34962),
               'TEXCOORD_0':add_accessor(p['UV'],'VEC2',target=34962),
               'JOINTS_0':add_accessor(joints,'VEC4',component=5123,target=34962),
               'WEIGHTS_0':add_accessor(weights,'VEC4',target=34962)}
        indices=add_accessor(p['I'].reshape(-1).astype('<u4'),'SCALAR',component=5125,target=34963)
        j['meshes'][0]['primitives'].append({'attributes':attrs,'indices':indices,'material':mat_index,'mode':4})
    # Common conversion transform is applied once to the whole armature and mesh.
    root={'name':'GoldSrcArmature','translation':[float(x) for x in root_translation],
          'rotation':[float(x) for x in matrix_quat(ROOT_ROT)],'scale':[SCALE,-SCALE,SCALE],
          'children':[i+1 for i,b in enumerate(m.bones) if b['parent']<0]+[nb+1]}
    nodes=[root]
    for b in m.bones:
        nodes.append({'name':b['name'],'translation':[float(x) for x in b['val'][:3]],'rotation':[float(x) for x in angles_quat(b['val'][3:])]})
    for i,b in enumerate(m.bones):
        if b['parent']>=0:nodes[b['parent']+1].setdefault('children',[]).append(i+1)
    nodes.append({'name':'GoldSrcViewmodelMesh','mesh':0,'skin':0})
    j['nodes']=nodes
    ibm=np.asarray([np.linalg.inv(w) for w in m.world],dtype=np.float32)
    ibm=ibm.transpose(0,2,1).reshape(nb,16)
    ibm_acc=add_accessor(ibm,'MAT4')
    roots=[i+1 for i,b in enumerate(m.bones) if b['parent']<0]
    skin={'name':'GoldSrcSkin','joints':list(range(1,nb+1)),'inverseBindMatrices':ibm_acc}
    if roots:skin['skeleton']=roots[0]
    j['skins']=[skin]
    # Export every sequence, preserving unique names when source labels repeat.
    used_names={}
    for seq in m.seqs:
        base=seq['name'];used_names[base]=used_names.get(base,0)+1
        clip_name=base if used_names[base]==1 else f'{base}__{used_names[base]}'
        frames=[m.frame(seq['index'],f,0) for f in range(seq['nf'])]
        times=(np.arange(seq['nf'],dtype=np.float32)/float(seq['fps'])).astype('<f4')
        time_acc=add_accessor(times,'SCALAR',mins=True)
        channels=[];samplers=[]
        for bone_i in range(nb):
            translations=np.asarray([frame[bone_i][:3] for frame in frames],dtype='<f4')
            rotations=np.asarray([angles_quat(frame[bone_i][3:]) for frame in frames],dtype='<f4')
            for fi in range(1,len(rotations)):
                if float(np.dot(rotations[fi],rotations[fi-1]))<0:rotations[fi]*=-1
            # Keep complete per-bone tracks so every source sequence can be reconstructed.
            out_idx=bone_i+1
            samplers.append({'input':time_acc,'output':add_accessor(translations,'VEC3'),'interpolation':'LINEAR'})
            channels.append({'sampler':len(samplers)-1,'target':{'node':out_idx,'path':'translation'}})
            samplers.append({'input':time_acc,'output':add_accessor(rotations,'VEC4'),'interpolation':'LINEAR'})
            channels.append({'sampler':len(samplers)-1,'target':{'node':out_idx,'path':'rotation'}})
        j['animations'].append({'name':clip_name,'channels':channels,'samplers':samplers,
                                'extras':{'goldsrcSequence':base,'fps':float(seq['fps']),'frames':int(seq['nf'])}})
    j['buffers']=[{'byteLength':len(binary)}]
    js=json.dumps(j,separators=(',',':'),ensure_ascii=False).encode('utf-8');js+=b' '*((-len(js))%4)
    binary.extend(b'\0'*((-len(binary))%4))
    total=12+8+len(js)+8+len(binary)
    with open(out_path,'wb') as f:
        f.write(struct.pack('<III',0x46546c67,2,total))
        f.write(struct.pack('<I4s',len(js),b'JSON'));f.write(js)
        f.write(struct.pack('<I4s',len(binary),b'BIN\0'));f.write(binary)
    return {'bones':nb,'sequences':len(m.seqs),'primitives':len(primitives),'animations':[a['name'] for a in j['animations']]}

def main():
    ap=argparse.ArgumentParser(description=__doc__)
    ap.add_argument('archive',help='ZIP containing cstrike/models/v_*.mdl')
    ap.add_argument('output_dir',help='destination directory for animated GLB files')
    ap.add_argument('--models',default='all',help='comma-separated model IDs or all')
    args=ap.parse_args();out=Path(args.output_dir);out.mkdir(parents=True,exist_ok=True)
    wanted=None if args.models=='all' else {x.strip().lower() for x in args.models.split(',') if x.strip()}
    success=[];failed=[]
    with zipfile.ZipFile(args.archive) as z:
        names=sorted(n for n in z.namelist() if '/models/v_' in n.lower() and n.lower().endswith('.mdl'))
        for name in names:
            model=Path(name).stem[2:].lower()
            if wanted is not None and model not in wanted:continue
            try:
                mdl=MDL(z.read(name));dst=out/(model+'.glb');meta=build_glb(mdl,dst)
                success.append((model,dst.stat().st_size,meta))
            except Exception as exc:
                failed.append((model,f'{type(exc).__name__}: {exc}'))
    print(f'CONVERTED {len(success)}')
    for model,size,meta in success:print(f'OK {model} {size} bytes bones={meta["bones"]} animations={meta["sequences"]} primitives={meta["primitives"]}')
    print(f'FAILED {len(failed)}')
    for model,error in failed:print(f'ERR {model}: {error}')
    if failed:raise SystemExit(1)
if __name__=='__main__':main()
