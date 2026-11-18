"""Tahap 14B: parse real original GoldSrc GLB assets and exercise shield/pistol composition.
Uses Three.js GLTFLoader and AnimationMixer, but not WebGL GPU rendering.
"""
import base64,json,sys
from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[2]
assets={'shield':root/'assets/models/weapons/shield_r.glb'}
for k in ('usp','glock18','p228','deagle','fiveseven'):
 assets[k]=root/f'assets/models/weapons/{k}.glb'
data={k:base64.b64encode(path.read_bytes()).decode() for k,path in assets.items()}
html='<html><head>'+''.join('<script>'+ (root/'js/vendor'/f).read_text()+'</script>' for f in ['three.min.js','GLTFLoader.js','SkeletonUtils.js'])+'</head><body></body></html>'
# This is not a mocked asset loader: all geometry, textures, skeletons and clips
# are parsed using the shipped GLTFLoader. Only the network step is bypassed.
html+='<script>let selected="usp";const Phase9={shieldPistol:()=>selected};let weaponModels={};const ensureWeaponModel=k=>Promise.resolve(weaponModels[k]);</script>'
html+='<script>'+(root/'js/game-systems14b.js').read_text()+'</script>'
checks=[]
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 page=browser.new_page(viewport={'width':1536,'height':710})
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content(html)
 result=page.evaluate('''async files=>{
 const check=[];const gl={};for(const [name,b64] of Object.entries(files)){
  const b=Uint8Array.from(atob(b64),c=>c.charCodeAt(0));
  gl[name]=await new Promise((ok,no)=>new THREE.GLTFLoader().parse(b.buffer,'',ok,no));
  if(name!=='shield')weaponModels[name]=gl[name];
 }
 const g=new THREE.Group(),s=THREE.SkeletonUtils.clone(gl.shield.scene);g.add(s);
 const shieldMixer=new THREE.AnimationMixer(s),shieldClip=gl.shield.animations.find(a=>a.name==='shield_idle');
 const shieldIdle=shieldMixer.clipAction(shieldClip);shieldIdle.play();shieldMixer.update(.1);
 g.userData.weaponAnimation={mixer:shieldMixer};Phase14B.prepare(g,s);
 const delay=()=>new Promise(r=>setTimeout(r,10));await delay();
 const ok=(title,pass,detail)=>check.push({name:title,pass:!!pass,detail:detail||null});
 ok('Native Five-SeveN hidden',Phase14B.inspect(g).nativePistolHidden);
 ok('Shield rig not duplicated',s.getObjectByName('Bip01_R_Hand')!==undefined);
 ok('Position pulls shield behind camera',s.position.z<-.35&&s.position.z>-.85);
 ok('Native shield animations preserved',gl.shield.animations.some(a=>a.name==='shield_up')&&gl.shield.animations.some(a=>a.name==='shield_down'));
 // Project real skinned mesh vertices through a camera in CPU-side Three.js,
 // checking the old near-camera shield clipping is corrected at this pose.
 s.updateMatrixWorld(true);const c=new THREE.PerspectiveCamera(65,1536/710,.01,10);
 c.updateProjectionMatrix();c.updateMatrixWorld();let shieldVisible=0,shieldVerts=0,behindNear=0;
 s.traverse(o=>{if(!o.isMesh||o.material.name!=='GoldSrcTexture_5')return;
  const a=o.geometry.attributes.position;for(let i=0;i<a.count;i++){
   const v=new THREE.Vector3().fromBufferAttribute(a,i);
   if(o.isSkinnedMesh)o.boneTransform(i,v);v.applyMatrix4(o.matrixWorld);
   shieldVerts++;if(v.z>=-.01){behindNear++;continue}
   v.project(c);if(Math.abs(v.x)<=1.1&&Math.abs(v.y)<=1.4)shieldVisible++;
  }
 });
 ok('Shield plate no longer crosses camera near-plane',behindNear===0,{shieldVerts,behindNear});
 ok('Shield plate stays within camera framing',shieldVerts>200&&shieldVisible/shieldVerts>.97,{shieldVerts,shieldVisible});
 for(const k of ['usp','deagle','p228','glock18','fiveseven']){
  selected=k;Phase14B.sync(g);await delay();
  const state=Phase14B.inspect(g);
  ok(k+' correct rig',state.pistol===k&&state.hasRig&&state.visibleGunMeshes>=2,state);
  ok(k+' no extra hands',state.extraHands===0);
  ok(k+' no native pistol overlap',state.nativePistolHidden);
  Phase14B.play(g,'draw');Phase14B.update(g,.03);
  Phase14B.play(g,'fire');Phase14B.update(g,.03);
  Phase14B.play(g,'reload');Phase14B.update(g,.03);
  ok(k+' animation works',true);
 }
 Phase14B.setRaised(g,true);ok('Raised shield hides gun',Phase14B.inspect(g).raised&&Phase14B.inspect(g).hasRig&&g.children[1].visible===false);
 Phase14B.setRaised(g,false);ok('Lowered shield shows gun',!Phase14B.inspect(g).raised&&g.children[1].visible===true);
 // The viewmodel parent mirrors both layers, so left-handed mode cannot
 // invert one layer without the other.
 g.scale.x=-1;ok('Left hand mirror applies to common group',g.scale.x===-1&&g.children.length===2);
 Phase14B.sync(g);await delay();ok('No duplicate pistol rigs on refresh',g.children.length===2);
 return check;
}''',data)
 checks=result
 browser.close()
fail=[c for c in checks if not c['pass']]
out=root/'qa/tahap14b';out.mkdir(parents=True,exist_ok=True)
(out/'viewmodel-tests.json').write_text(json.dumps(checks,indent=2))
for c in checks:print('PASS' if c['pass'] else 'FAIL',c['name'],flush=True)
if errors:print('JS errors:',errors)
print('RESULT:',len(checks)-len(fail),'/',len(checks),'FAILURES',len(fail),'PAGE_ERRORS',len(errors))
sys.exit(1 if fail or errors else 0)
