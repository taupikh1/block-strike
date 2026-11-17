import sys,struct,json,math,copy,os
sys.path.insert(0,'/home/claude/w')
import numpy as np
from mdl import MDL,angq
import sim
ARM_Q=[-0.5,0.5,0.5,0.5];ARM_S=0.025
def pad4(b,c=b'\0'):return b+c*((-len(b))%4)
def rebuild(glb_in,mdl_path,glb_out,off=0.0):
    d=open(glb_in,'rb').read();l=struct.unpack('<I',d[12:16])[0]
    j=json.loads(d[20:20+l]);bin_=bytearray(d[20+l+8:])
    m=MDL(mdl_path);nb=m.nb
    oldN=j['nodes'];sk=j['skins'][0]
    oldnames=[oldN[n]['name'] for n in sk['joints']]
    mnames=[b['name'] for b in m.bones]
    assert sorted(oldnames)==sorted(mnames),(len(oldnames),nb)
    # putar mesh (baked) agar cocok dengan ruang skeleton kanonik: p'=(-z,y,x)
    pa=j['meshes'][0]['primitives'][0]['attributes']
    for key in ('POSITION','NORMAL'):
        a=j['accessors'][pa[key]];bv=j['bufferViews'][a['bufferView']]
        assert 'byteStride' not in bv
        o=bv.get('byteOffset',0)+a.get('byteOffset',0)
        arr=np.frombuffer(bytes(bin_[o:o+a['count']*12]),dtype='<f4').reshape(-1,3)
        new=np.stack([-arr[:,2],arr[:,1],arr[:,0]],1).astype('<f4')
        bin_[o:o+a['count']*12]=new.tobytes()
        if 'min' in a:a['min']=[float(x) for x in new.min(0)];a['max']=[float(x) for x in new.max(0)]
    # nodes: 0 Armature, 1..nb bones, nb+1 model
    nodes=[{'name':'Armature','translation':[0,off,0],'rotation':ARM_Q,'scale':[ARM_S]*3,'children':[1]}]
    for i,b in enumerate(m.bones):
        n={'name':b['name'],'translation':[float(x) for x in b['val'][:3]],'rotation':[float(x) for x in angq(b['val'][3:])]}
        nodes.append(n)
    for i,b in enumerate(m.bones):
        if b['parent']>=0:nodes[b['parent']+1].setdefault('children',[]).append(i+1)
    # root bones other than first? attach any extra roots to Armature
    for i,b in enumerate(m.bones):
        if b['parent']<0 and i!=0:nodes[0]['children'].append(i+1)
    nodes.append({'name':'model','mesh':oldN[[n for n in range(len(oldN)) if 'mesh' in oldN[n]][0]]['mesh'],'skin':0})
    # rest world (three space)
    RA=np.eye(4);RA[:3,:3]=sim.qm(ARM_Q)*ARM_S
    Wg=[]
    for i,b in enumerate(m.bones):
        M=np.eye(4);M[:3,:3]=sim.qm(angq(b['val'][3:]));M[:3,3]=b['val'][:3]
        Wg.append((Wg[b['parent']]@M) if b['parent']>=0 else M)
    Wt=[RA@w for w in Wg]
    joints=[mnames.index(nm)+1 for nm in oldnames]
    ibm=np.array([np.linalg.inv(Wt[mnames.index(nm)]) for nm in oldnames],dtype='<f4')
    ibm_cm=ibm.transpose(0,2,1).copy()   # column-major
    # buffers
    def addview(arr):
        off=len(bin_);raw=arr.tobytes();bin_.extend(raw);bin_.extend(b'\0'*((-len(raw))%4))
        j['bufferViews'].append({'buffer':0,'byteOffset':off,'byteLength':len(raw)});return len(j['bufferViews'])-1
    def addacc(arr,typ,ct=5126,minmax=False):
        bv=addview(arr);a={'bufferView':bv,'componentType':ct,'count':len(arr),'type':typ}
        if minmax:a['min']=[float(arr.min())];a['max']=[float(arr.max())]
        j['accessors'].append(a);return len(j['accessors'])-1
    j['skins']=[{'joints':joints,'inverseBindMatrices':addacc(ibm_cm.reshape(len(ibm),16),'MAT4')}]
    # animations
    want=[('idle1','idle1'),('run','run'),('ref_shoot_mp5','ref_shoot_mp5'),('death1','death1')]
    snames=[s['name'] for s in m.seqs];anims=[]
    for nm,src in want:
        si=snames.index(src);sq=m.seqs[si];nbl=sq['nblends']
        sqc=dict(sq);blend=nbl//2 if nbl>1 else 0
        sqc['animindex']=sq['animindex']+blend*nb*12
        m.seqs[si]=sqc
        fr=[m.frame(si,f) for f in range(sq['nf'])];m.seqs[si]=sq
        t=np.arange(sq['nf'],dtype='<f4')/sq['fps']
        tin=addacc(t,'SCALAR',minmax=True)
        chans=[];samps=[]
        for b in range(nb):
            Q=np.array([angq(fr[f][b][3:]) for f in range(sq['nf'])],dtype='<f4')
            for f in range(1,len(Q)):
                if Q[f]@Q[f-1]<0:Q[f]=-Q[f]
            T=np.array([fr[f][b][:3] for f in range(sq['nf'])],dtype='<f4')
            samps.append({'input':tin,'output':addacc(T,'VEC3'),'interpolation':'LINEAR'})
            chans.append({'sampler':len(samps)-1,'target':{'node':b+1,'path':'translation'}})
            samps.append({'input':tin,'output':addacc(Q,'VEC4'),'interpolation':'LINEAR'})
            chans.append({'sampler':len(samps)-1,'target':{'node':b+1,'path':'rotation'}})
        anims.append({'name':nm,'channels':chans,'samplers':samps})
    j['animations']=anims;j['nodes']=nodes
    j['scenes']=[{'nodes':[0,nb+1]}];j['scene']=0
    j['buffers']=[{'byteLength':len(bin_)}]
    js=pad4(json.dumps(j,separators=(',',':')).encode(),b' ')
    out=struct.pack('<III',0x46546C67,2,12+8+len(js)+8+len(bin_))+struct.pack('<I4s',len(js),b'JSON')+js+struct.pack('<I4s',len(bin_),b'BIN\0')+bytes(bin_)
    open(glb_out,'wb').write(out)
if __name__=='__main__':
    base='/home/claude/w/block-strike/assets/models/';os.makedirs('/home/claude/w/out/ct',exist_ok=True);os.makedirs('/home/claude/w/out/t',exist_ok=True)
    CT='/home/claude/w/dfp/delta_force_ct_players_pack/cstrike/models/player/%s/%s.mdl'
    jobs=[('ct',n,CT%(n,n) if n!='urban' else CT%(n,'URBAN')) for n in ['gsg9','gign','sas','urban']]+[('t',n,f'/home/claude/w/phx/{n}.mdl') for n in ['arctic','guerilla','leet','terror']]
    for d,n,mp in jobs:
        o=f'/home/claude/w/out/{d}/{n}.glb'
        rebuild(base+f'{d}/{n}.glb',mp,o,0.0)
        _,v=sim.skin(o,0,0);off=-float(v[:,1].min())
        rebuild(base+f'{d}/{n}.glb',mp,o,off);print(d,n,'offset',round(off,3))
    print('ok')
