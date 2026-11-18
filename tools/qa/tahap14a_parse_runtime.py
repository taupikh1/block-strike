"""Parse actual GLB assets inside Chromium (real GLTFLoader, no GPU/WebGL)."""
import json,base64,sys
from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[2]
vendor=['three.min.js','GLTFLoader.js','SkeletonUtils.js']
html='<html><body>'+''.join('<script>'+ (root/'js/vendor'/f).read_text()+'</script>' for f in vendor)+'</body></html>'
files=['ct/gign.glb','t/terror.glb','held/usp.glb','held/glock18.glb','held/ak47.glb','held/elite.glb','held/shield.glb']
result={'checks':[],'errors':[]}
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 page=browser.new_page()
 page.on('pageerror',lambda e:result['errors'].append(str(e)))
 page.goto('about:blank');page.set_content(html,wait_until='load')
 for f in files:
  data=base64.b64encode((root/'assets/models'/f).read_bytes()).decode('ascii')
  try:
   stats=page.evaluate('''async ({file,b64})=>{
     const bytes=Uint8Array.from(atob(b64),c=>c.charCodeAt(0));
     const glb=await new Promise((resolve,reject)=>new THREE.GLTFLoader().parse(bytes.buffer,'',resolve,reject));
     const model=glb.scene;model.updateMatrixWorld(true);
     const meshes=[];model.traverse(o=>{if(o.isMesh){o.geometry.computeBoundingBox();
       const box=o.geometry.boundingBox;meshes.push({verts:o.geometry.attributes.position.count,materials:[].concat(o.material).map(m=>m.name||''),hasTexture:[].concat(o.material).some(m=>!!m.map)});
     }});
     const armature=model.getObjectByName('Armature');
     return {file,meshes:meshes.length,vertices:meshes.reduce((s,m)=>s+m.verts,0),textures:meshes.filter(x=>x.hasTexture).length,
       rootScale:armature?.scale.toArray()||null,hand:!!(model.getObjectByName('Bip01_R_Hand')||model.getObjectByName('Bip01 R Hand')),
       bones:meshes.filter(x=>x.verts<=0).length};
   }''',{'file':f,'b64':data})
   good=stats['meshes']>0 and stats['vertices']>0 and (stats['textures']>0 or f=='held/shield.glb') and (stats['hand'] if f.startswith(('ct/','t/')) else True)
   print(('PASS' if good else 'FAIL'),'GLTFLoader parsing',f,stats,flush=True)
   result['checks'].append({'name':f,'pass':bool(good),'stats':stats})
  except Exception as e:
   print('FAIL glTF parse',f,str(e)[:500],flush=True)
   result['checks'].append({'name':f,'pass':False,'error':str(e)})
 browser.close()
out=root/'qa/tahap14a';out.mkdir(exist_ok=True,parents=True)
(out/'gltf-loader-results.json').write_text(json.dumps(result,indent=2))
print('RESULT',sum(c['pass'] for c in result['checks']),'/',len(result['checks']),'PAGE ERRORS',result['errors'][:3],flush=True)
sys.exit(0 if all(c['pass'] for c in result['checks']) and not result['errors'] else 1)
