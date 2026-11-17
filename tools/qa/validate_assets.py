import json,struct,wave,re,sys
from pathlib import Path
import numpy as np
from PIL import Image
root=Path(__file__).resolve().parents[2];sys.path.insert(0,str(root/'tools/mdl2glb'))
from mdl_reader import quat_matrix
report={'models':[],'sounds':0,'icons':0,'missing':[]}
for path in sorted((root/'assets/models/weapons').glob('*.glb')):
 d=path.read_bytes();magic,version,total=struct.unpack_from('<III',d);assert magic==0x46546c67 and version==2 and total==len(d)
 size=struct.unpack_from('<I',d,12)[0];j=json.loads(d[20:20+size]);binary=d[28+size:]
 def arr(n):
  a=j['accessors'][n];v=j['bufferViews'][a['bufferView']];count={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4,'MAT4':16}[a['type']]
  return np.frombuffer(binary,dtype={5126:'<f4',5125:'<u4',5123:'<u2'}[a['componentType']],offset=v.get('byteOffset',0)+a.get('byteOffset',0),count=a['count']*count).reshape(a['count'],count)
 for n,a in enumerate(j['accessors']):assert np.isfinite(arr(n)).all(),(path,a)
 skin=j['skins'][0];nb=len(skin['joints']);world={};parents={c:i for i,n in enumerate(j['nodes']) for c in n.get('children',[])}
 for ix in skin['joints']:
  n=j['nodes'][ix];m=np.eye(4);m[:3,:3]=quat_matrix(n.get('rotation',[0,0,0,1]));m[:3,3]=n.get('translation',[0,0,0]);parent=parents.get(ix,0);world[ix]=world[parent]@m if parent in world else m
 ibm=arr(skin['inverseBindMatrices']).reshape(nb,4,4).transpose(0,2,1)
 binderr=max(np.abs(world[ix]@ibm[i]-np.eye(4)).max() for i,ix in enumerate(skin['joints']));assert binderr<.0001,(path,binderr)
 for mesh in j['meshes']:
  for p in mesh['primitives']:
   a=p['attributes'];assert np.allclose(arr(a['WEIGHTS_0']).sum(1),1);assert arr(a['JOINTS_0']).max()<nb
   assert arr(p['indices']).max()<j['accessors'][a['POSITION']]['count']
 for a in j['animations']:
  for s in a['samplers']:assert np.all(np.diff(arr(s['input'])[:,0])>=0)
 report['models'].append({'name':path.stem,'bones':nb,'clips':len(j['animations']),'bind_error':float(binderr)})
for path in (root/'assets/sounds/weapons').glob('*.wav'):
 with wave.open(str(path)) as f:assert f.getnframes()>0
 report['sounds']+=1
for path in (root/'assets/ui/icons').glob('*.png'):
 with Image.open(path) as im:assert im.mode=='RGBA' and im.getchannel('A').getextrema()==(0,255)
 report['icons']+=1
for p in [root/'index.html',*list((root/'css').glob('*.css'))]:
 for url in re.findall(r'(?:src|href)=[\'"]([^\'"]+)|url\([\'"]?([^\'"\)]+)',p.read_text()):
  u=next(x for x in url if x);u=u.split('?')[0]
  if u.startswith(('http:','https:','#','data:')):continue
  if not (p.parent/u).exists():report['missing'].append(str(p.relative_to(root))+':'+u)
for f in set(re.findall(r"[\w-]+\.wav",(root/'js/game-core.js').read_text())):
 if not (root/'assets/sounds/weapons'/f).exists():report['missing'].append(f)
assert not report['missing'],report['missing']
(root/'qa/assets.json').write_text(json.dumps(report,indent=2))
print('PASS',len(report['models']),'animated GLBs;',report['sounds'],'WAVs;',report['icons'],'transparent icons; local paths valid')
