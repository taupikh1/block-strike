"""Parse three shipped grenade GLBs and play original animations in real Three AnimationMixer. Rendering not tested."""
import base64,json,sys
from pathlib import Path
from playwright.sync_api import sync_playwright
r=Path(__file__).resolve().parents[2]
assets={k:base64.b64encode((r/f'assets/models/weapons/{k}.glb').read_bytes()).decode() for k in ['hegrenade','flashbang','smokegrenade']}
html='<html><head>'+''.join('<script>'+(r/'js/vendor'/f).read_text()+'</script>' for f in ['three.min.js','GLTFLoader.js','SkeletonUtils.js'])+'</head></html>'
checks=[];errors=[]
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 page=b.new_page(viewport={'width':844,'height':390});page.on('pageerror',lambda e: errors.append(str(e)));page.set_content(html)
 checks=page.evaluate('''async files=>{
 const out=[];
 for(const [name,encoded] of Object.entries(files)){
  const bin=Uint8Array.from(atob(encoded),c=>c.charCodeAt(0));
  const loaded=await new Promise((resolve,reject)=>new THREE.GLTFLoader().parse(bin.buffer,'',resolve,reject));
  const expected=['deploy','idle','pullpin','throw'];
  out.push({name:name+' has 4 original clips',pass:expected.every(k=>loaded.animations.some(a=>a.name===k))});
  out.push({name:name+' clip durations valid',pass:expected.every(k=>loaded.animations.find(a=>a.name===k)?.duration>.08)});
  const cloned=THREE.SkeletonUtils.clone(loaded.scene);const mixer=new THREE.AnimationMixer(cloned);
  for(const k of ['deploy','pullpin','throw']){
    const clip=loaded.animations.find(c=>c.name===k);
    const action=mixer.clipAction(clip).reset().setLoop(THREE.LoopOnce,1);action.clampWhenFinished=true;action.play();
    mixer.update(Math.min(.15,clip.duration*.6));
    out.push({name:name+' real '+k+' anim runs',pass:action.isRunning()&&Number.isFinite(action.time)});
    action.stop();
  }
  let count=0;cloned.traverse(o=>{if(o.isSkinnedMesh||o.isMesh)count++});
  out.push({name:name+' contains geometry',pass:count>0});
 }
 return out;
}''',assets)
 b.close()
report={'passed':sum(x['pass'] for x in checks),'total':len(checks),'checks':checks,'pageErrors':errors,'environment':'Actual GLTFLoader + Three AnimationMixer in Chromium; no WebGL render'}
out=r/'qa/tahap14d';out.mkdir(exist_ok=True,parents=True);(out/'native-grenade-models.json').write_text(json.dumps(report,indent=2))
for x in checks: print('PASS' if x['pass'] else 'FAIL',x['name'])
print('RESULT',report['passed'],'/',report['total'],'ERRORS',errors[:3])
sys.exit(1 if report['passed']!=report['total'] or errors else 0)
