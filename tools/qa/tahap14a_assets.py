#!/usr/bin/env python3
"""Tahap 14A asset/attachment invariants. No GPU rendering claims."""
import json,struct,sys
from pathlib import Path
import numpy as np
ROOT=Path(__file__).resolve().parents[2];sys.path.insert(0,str(ROOT/'tools/mdl2glb'))
from mdl_reader import MDL
from convert_weapon_archive import parse_geometry
source=Path(sys.argv[1]) if len(sys.argv)>1 else ROOT/'../../source_models'
checks=[]
def ck(name,value,detail=''):
 checks.append({'name':name,'pass':bool(value),'detail':str(detail)[:120]});print(('PASS' if value else 'FAIL'),name,detail if not value else '')
def glb(path):
 b=path.read_bytes();assert b[:4]==b'glTF';n=struct.unpack_from('<I',b,12)[0];return json.loads(b[20:20+n]),b[28+n:]
characters=list((ROOT/'assets/models/ct').glob('*.glb'))+list((ROOT/'assets/models/t').glob('*.glb'))
ck('Eight character models are present',len(characters)==8)
for char in characters:
 j,_=glb(char)
 names={n.get('name') for n in j['nodes']}
 ck(char.name+': right-hand bone on player skeleton', 'Bip01 R Hand' in names)
 src=j['nodes'][0];sc=src.get('scale',[1,1,1]);ck(char.name+': player rig scale correct',.02<max(sc)<.04)
assets=sorted((ROOT/'assets/models/held').glob('*.glb'))
ck('31 hand-held models available',len(assets)==31)
for f in assets:
 j,b=glb(f);m=MDL(source/('p_'+f.stem+'.mdl'));expected=sum(len(p['I']) for p in parse_geometry(m)[0]);count=0;mx=0;nonfinite=False;materials=True;attach=True;mins=[];maxs=[]
 for n in j['nodes']:
  attach=attach and ('Hand' in n.get('extras',{}).get('attachBone',''))
  pr=j['meshes'][n['mesh']]['primitives'][0];materials=materials and 0<=pr['material']<len(j['materials']);idx=pr['attributes']['POSITION'];a=j['accessors'][idx];v=j['bufferViews'][a['bufferView']];arr=np.frombuffer(b,dtype='<f4',count=a['count']*3,offset=v.get('byteOffset',0)).reshape(-1,3)
  nonfinite=nonfinite or not np.all(np.isfinite(arr));count+=len(arr)//3
  if len(arr):mins.append(arr.min(axis=0));maxs.append(arr.max(axis=0));mx=max(mx,float(np.ptp(arr,axis=0).max())*.028)
 if mins:
  worldExtent=float((np.max(maxs,axis=0)-np.min(mins,axis=0)).max()*.028)
 else:worldExtent=0
 ck(f.name+' full triangle coverage',count==expected,f'{count}/{expected}')
 ck(f.name+' valid materials and hand bones',materials and attach)
 ck(f.name+' scaled weapon bounds sane',not nonfinite and 0.05<=worldExtent<=1.7,f'{worldExtent:.3f}m')
script=(ROOT/'js/game-core.js').read_text()
ck('No primitive character-gear cubes created', 'function attachCharacterGear' in script and 'b.gearMeshes=[];b.gearGroup=null;' in script)
ck('Equipped held models reject invalid scale',"rejected invalid held model scale" in (ROOT/'js/game-systems8.js').read_text())
report={'status':'PASS' if all(c['pass'] for c in checks) else 'FAIL', 'passed':sum(c['pass'] for c in checks),'total':len(checks),'checks':checks,'note':'Static+geometric checks; no WebGL frame rendering tested.'}
out=ROOT/'qa/tahap14a';out.mkdir(exist_ok=True,parents=True);(out/'assets_results.json').write_text(json.dumps(report,indent=2))
print('RESULT',report['passed'],'/',report['total'])
sys.exit(0 if report['status']=='PASS' else 1)
