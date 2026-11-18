#!/usr/bin/env python3
"""Phase 14D; Chromium DOM + real Three logic, mock GPU renderer and GLTFLoader.
No claim of physical Safari or WebGL render verification.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json,re,struct,hashlib,sys,subprocess
root=Path(__file__).resolve().parents[2]
out=root/'qa/tahap14d';out.mkdir(parents=True,exist_ok=True)
checks=[];errors=[]
def ck(name,good,details=None):
 good=bool(good);checks.append({'name':name,'pass':good,'details':str(details)[:150] if details is not None else ''});print(('PASS' if good else 'FAIL'),name,details or '',flush=True)
# Run isolated deterministic mechanics without requiring the browser.
node=subprocess.run(['node','-e', '''const assert=require('node:assert/strict');let g=require('./js/grenade14d.js');
assert.equal(Object.keys(g.TYPES).length,3);
assert.equal(g.heDamage(0),105);assert.equal(g.heDamage(8),0);assert.equal(g.heDamage(3.75),26.25);assert.equal(g.heDamage(2,true),0);
assert(g.flashExposure(2,1).strength>g.flashExposure(2,-1).strength);
assert.equal(g.flashExposure(1,1,true).duration,0);
assert(g.segmentSmokeOpacity({x:-3,y:0,z:0},{x:3,y:0,z:0},{x:0,y:0,z:0},4,3)>0.95);
assert.equal(g.segmentSmokeOpacity({x:-3,y:6,z:0},{x:3,y:6,z:0},{x:0,y:0,z:0},4,3),0);
assert.equal(g.smokeOpacity(0),0);assert.equal(g.smokeOpacity(20),0);
let v=g.throwVelocity({x:0,y:0,z:-1});assert(v.z<-14&&v.y>4);
let b=g.bounce({x:5,y:-10,z:0},{x:0,y:1,z:0},'ground');assert(b.y>0&&b.y<10&&b.x<5);
console.log('PURE HELPERS PASS');'''],cwd=root,capture_output=True,text=True)
ck('Deterministic throw, HE, flash, smoke and bounce helpers',node.returncode==0,node.stdout+node.stderr)
# Verify user's original GoldSrc v_ weapon animation and all 3 models/sounds in the runtime.
for k,name in [('he','hegrenade'),('flash','flashbang'),('smoke','smokegrenade')]:
 p=root/f'assets/models/weapons/{name}.glb'
 raw=p.read_bytes();size=struct.unpack_from('<I',raw,12)[0];data=json.loads(raw[20:20+size]);names={a.get('name') for a in data.get('animations',[])}
 ck(k+' original grenade draw/pin/throw clips',{'deploy','idle','pullpin','throw'}.issubset(names),names)
 ck(k+' world mesh exists',(root/f'assets/models/world/{name}.glb').is_file())
 ck(k+' held mesh exists',(root/f'assets/models/held/{name}.glb').is_file())
for name in ['pinpull.wav','grenade_hit1.wav','grenade_hit2.wav','grenade_hit3.wav','hegrenade-1.wav','flashbang-1.wav','sg_explode.wav']:
 ck(name+' original audio exists',(root/f'assets/sounds/weapons/{name}').is_file())
html=(root/'index.html').read_text()
for path in re.findall(r'<link rel="stylesheet" href="([^"]+)">',html):
 html=html.replace(f'<link rel="stylesheet" href="{path}">','<style>'+(root/path).read_text()+'</style>')
mock='<script>window.__testMap=__MAP__;window.fetch=async function(url){if(String(url).includes("dust_block.json"))return new Response(JSON.stringify(window.__testMap),{status:200});return new Response("",{status:404})};</script>'.replace('__MAP__',json.dumps(json.loads((root/'assets/maps/dust_block.json').read_text())))
html=html.replace('<script src="js/vendor/three.min.js"></script>','<script>'+(root/'js/vendor/three.min.js').read_text()+'</script>'+mock)
for path in ['js/vendor/GLTFLoader.js','js/vendor/SkeletonUtils.js']:
 html=html.replace(f'<script src="{path}"></script>','<script>'+(root/path).read_text()+'</script>')
mock='''<script>THREE.WebGLRenderer=class{constructor(o){this.domElement=o.canvas;this.info={render:{calls:1,frame:1},memory:{geometries:0,textures:0}};this.shadowMap={enabled:false}}setPixelRatio(){}setSize(){}render(){}clearDepth(){}clear(){}};
THREE.GLTFLoader.prototype.load=function(path,onLoad){const g=new THREE.Group(),bone=new THREE.Group();bone.name='Bip01_R_Hand';g.add(bone);queueMicrotask(()=>onLoad({scene:g,animations:[new THREE.AnimationClip('deploy',.2,[]),new THREE.AnimationClip('pullpin',.4,[]),new THREE.AnimationClip('throw',.6,[])]}));return {}};
THREE.TextureLoader.prototype.load=function(){return new THREE.Texture()};</script>'''
html=html.replace('<script src="js/bsp-render.js"></script>',mock+'<script src="js/bsp-render.js"></script>')
for path in re.findall(r'<script src="([^"]+)"></script>',html):
 html=html.replace(f'<script src="{path}"></script>','<script>\n'+(root/path).read_text()+'\n</script>')
assert '<script src=' not in html
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-web-security'])
 page=browser.new_page(viewport={'width':844,'height':390},device_scale_factor=2,is_mobile=True,has_touch=True)
 page.on('pageerror',lambda err:errors.append(str(err)))
 page.goto('about:blank');page.set_content(html,wait_until='load');page.wait_for_timeout(150)
 def js(name,expr):
  try:
   r=page.evaluate(expr);ck(name,r)
  except Exception as e:ck(name,False,str(e)[:160])
 js('Phase14D helper loaded before phase9',"typeof Grenade14D==='object'&&Grenade14D.TYPES.smoke.radius>4")
 page.locator('#go').click();page.locator('#continueMatchConfig').click();page.locator('[data-team="CT"]').click();page.locator('#startMatch').click();page.wait_for_timeout(600)
 js('CT game boots with previous features intact','running&&bots.length>0&&typeof Phase14C.pistol==="function"')
 # Override combat only in the test harness to prevent AI from killing the player during animation tests.
 page.evaluate("bots.forEach(b=>b.cd=9999);P.hp=100;money=16000;buyTime=15")
 for grenade in ['he','flash','smoke']:
  page.evaluate("Phase9.resetRound()")
  js(grenade+' initiating never consumes grenade',f"(()=>{{grenades.{grenade}=1;selectedGrenade='{grenade}';const ok=Phase9.throwGrenade();const a=Phase9.getDebugState();return ok&&a.projectiles===0&&grenades.{grenade}===1&&a.pendingThrow==='loading'}})()")
  page.wait_for_timeout(20)
  js(grenade+' progresses through pin and throw states',f"(()=>{{let seen=new Set();for(let i=0;i<30;i++){{seen.add(Phase9.getDebugState().pendingThrow);Phase9.update(.04)}}return seen.has('pin')&&seen.has('throw')}})()")
  js(grenade+' spawns exactly one world projectile',f"Phase9.getDebugState().grenadeTypes.filter(x=>x==='{grenade}').length===1&&grenades.{grenade}===0")
  js(grenade+' does not allow duplicate throw during animation',"Phase9.throwGrenade()===false")
  js(grenade+' projectile has expected physics state',"Phase9.getDebugState().grenadeBounces.every(x=>x>=0)")
  js(grenade+' detonates and removes projectile',"(()=>{for(let i=0;i<300;i++)Phase9.update(.02);return Phase9.getDebugState().projectiles===0})()")
  if grenade=='smoke':
   js('Smoke persists as particles after deployment',"Phase9.getDebugState().smoke===1&&Phase9.getDebugState().smokeRadii[0]>2")
   js('Smoke eventually fades and releases objects',"(()=>{for(let i=0;i<1100;i++)Phase9.update(.02);return Phase9.getDebugState().smoke===0})()")
  if grenade=='flash':
   js('Flash produces white overlay or blind bot response',"Phase9.getDebugState().flashStrength>0||bots.some(b=>b.blinded>0)")
 page.evaluate("Phase9.resetRound();bots.forEach(b=>b.blinded=0)")
 js('Death during pin-pull cancels grenade without spending stock',"(()=>{Phase9.resetRound();P.hp=100;grenades.he=1;selectedGrenade='he';Phase9.throwGrenade();P.hp=0;Phase9.update(.15);const ok=Phase9.getDebugState().pendingThrow===null&&grenades.he===1;P.hp=100;return ok})()")
 js('Reset clears all grenade resources',"(()=>{grenades.he=1;selectedGrenade='he';Phase9.throwGrenade();Phase9.resetRound();const s=Phase9.getDebugState();return s.projectiles===0&&s.smoke===0&&s.pendingThrow===null})()")
 js('HUD still works after grenade tests',"!!$('gear')&&!!$('grenadeBtn')&&!!$('flashEffect')")
 page.screenshot(path=str(out/'grenade-hud-simulated.png'))
 browser.close()
ck('No uncaught JS errors',not errors,errors)
report={'environment':'Chromium mobile viewport 844x390, real Three math and DOM; WebGL and GLTFLoader stubbed; not real GPU or physical Safari','pass':sum(x['pass'] for x in checks),'total':len(checks),'checks':checks,'pageErrors':errors}
(out/'results.json').write_text(json.dumps(report,indent=2,ensure_ascii=False))
print('RESULT',report['pass'],'/',report['total'])
sys.exit(0 if report['pass']==report['total'] else 1)
