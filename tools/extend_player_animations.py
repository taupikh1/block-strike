#!/usr/bin/env python3
"""Extend existing GLB player skeletons with selected embedded GoldSrc MDL animations.

Use only with matching GoldSrc-model-derived GLBs of the same rig; validates bone names.
This tool does not redistribute external source ZIPs.
"""
import sys,struct,json,zipfile,os
from pathlib import Path
import numpy as np
sys.path.insert(0,str(Path(__file__).parent/'mdl2glb'))
from mdl_reader import MDL, angles_quat

ROOT=Path(__file__).parents[1]
ARCHIVES=[
 ('ct',Path(sys.argv[1]) if len(sys.argv)>1 else Path('delta_force_ct_players_pack.zip'),{
  'urban':'delta_force_ct_players_pack/cstrike/models/player/urban/URBAN.mdl',
  'gign':'delta_force_ct_players_pack/cstrike/models/player/gign/gign.mdl',
  'sas':'delta_force_ct_players_pack/cstrike/models/player/sas/sas.mdl',
  'gsg9':'delta_force_ct_players_pack/cstrike/models/player/gsg9/gsg9.mdl'}),
 ('t',Path(sys.argv[2]) if len(sys.argv)>2 else Path('phoenix_connexion_team_cs_16.zip'),{
  'arctic':'arctic.mdl','guerilla':'guerilla.mdl','leet':'leet.mdl','terror':'terror.mdl'})]
EXTRA=['walk','crouch_idle','crouchrun','jump',
  'ref_shoot_rifle','crouch_shoot_rifle','ref_reload_rifle','crouch_reload_rifle',
  'ref_shoot_onehanded','crouch_shoot_onehanded','ref_reload_onehanded','crouch_reload_onehanded']

def pad4(x,chr=b'\0'):
 return x+chr*((-len(x))%4)

def convert(glb_path,mdl_bytes):
 m=MDL(mdl_bytes)
 d=glb_path.read_bytes()
 assert d[:4]==b'glTF' and struct.unpack_from('<I',d,4)[0]==2
 jslen=struct.unpack_from('<I',d,12)[0];j=json.loads(d[20:20+jslen])
 bh=20+jslen;blen=struct.unpack_from('<I',d,bh)[0];assert d[bh+4:bh+8]==b'BIN\0'
 b=bytearray(d[bh+8:bh+8+blen]);assert len(b)==blen
 src={node['name']:i for i,node in enumerate(j['nodes']) if 'name' in node}
 for bone in m.bones:
  assert bone['name'] in src,(glb_path.name,bone['name'])
 def addarr(a,typ):
  a=np.ascontiguousarray(a,dtype='<f4');raw=a.tobytes();off=len(b);assert off%4==0
  b.extend(pad4(raw));j['bufferViews'].append({'buffer':0,'byteOffset':off,'byteLength':len(raw)})
  acc={'bufferView':len(j['bufferViews'])-1,'componentType':5126,'count':len(a),'type':typ}
  if typ=='SCALAR': acc['min']=[float(a.min())];acc['max']=[float(a.max())]
  j['accessors'].append(acc);return len(j['accessors'])-1
 names=[s['name'] for s in m.seqs]
 done={a['name'] for a in j['animations']}
 for name in EXTRA:
  if name not in names or name in done:continue
  si=names.index(name);seq=m.seqs[si];nf=seq['nf'];fps=seq['fps']
  frames=[m.frame(si,i,blend=0) for i in range(nf)]
  inp=addarr(np.arange(nf,dtype='<f4')/fps,'SCALAR')
  channels=[];samplers=[]
  for bone_id,bone in enumerate(m.bones):
   trans=np.array([f[bone_id][:3] for f in frames],dtype='<f4')
   rot=np.array([angles_quat(f[bone_id][3:]) for f in frames],dtype='<f4')
   for k in range(1,nf):
    if rot[k]@rot[k-1]<0:rot[k]=-rot[k]
   node_id=src[bone['name']]
   for target,data,typ in [('translation',trans,'VEC3'),('rotation',rot,'VEC4')]:
    acc=addarr(data,typ)
    samplers.append({'input':inp,'output':acc,'interpolation':'LINEAR'})
    channels.append({'sampler':len(samplers)-1,'target':{'node':node_id,'path':target}})
  j['animations'].append({'name':name,'channels':channels,'samplers':samplers})
 j['buffers'][0]['byteLength']=len(b)
 data=pad4(json.dumps(j,ensure_ascii=False,separators=(',',':')).encode(),b' ')
 output=struct.pack('<III',0x46546c67,2,12+8+len(data)+8+len(b))+struct.pack('<I4s',len(data),b'JSON')+data+struct.pack('<I4s',len(b),b'BIN\0')+b
 glb_path.write_bytes(output)
 return len(j['animations']),len(output)

if __name__=='__main__':
 if len(sys.argv)!=3:sys.exit('Usage: python tools/extend_player_animations.py /path/to/delta_force_ct_players_pack.zip /path/to/phoenix_connexion_team_cs_16.zip')
 for group,zippath,names in ARCHIVES:
  with zipfile.ZipFile(zippath) as z:
   for name,mdl in names.items():
    path=ROOT/'assets/models'/group/(name+'.glb')
    c,size=convert(path,z.read(mdl))
    print(f'{group}/{name}: {c} animation clips, {size} bytes',flush=True)
