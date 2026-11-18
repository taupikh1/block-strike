#!/usr/bin/env python3
"""Tahap12 Final simulated integration checks. WebGL/GLTF stubbed, NOT GPU QA."""
from pathlib import Path
import json,re,sys,hashlib,struct
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[2]
out=root/'qa'/'tahap12-final';out.mkdir(parents=True,exist_ok=True)
html=(root/'index.html').read_text()
for path in re.findall(r'<link rel="stylesheet" href="([^"]+)">',html):
 html=html.replace(f'<link rel="stylesheet" href="{path}">','<style>'+(root/path).read_text()+'</style>')
map_data=json.dumps(json.loads((root/'assets/maps/dust_block.json').read_text()))
mock='''<script>window.__testMap=__MAP__;window.fetch=async function(url){if(String(url).includes('dust_block.json'))return new Response(JSON.stringify(window.__testMap),{status:200});return new Response('',{status:404})};</script>'''.replace('__MAP__',map_data)
html=html.replace('<script src="js/vendor/three.min.js"></script>','<script>'+(root/'js/vendor/three.min.js').read_text()+'</script>'+mock)
for path in ['js/vendor/GLTFLoader.js','js/vendor/SkeletonUtils.js']:
 html=html.replace(f'<script src="{path}"></script>','<script>'+(root/path).read_text()+'</script>')
mock='''<script>THREE.WebGLRenderer=class{constructor(o){this.domElement=o.canvas;this.info={render:{calls:1,frame:1},memory:{geometries:0,textures:0}};this.shadowMap={enabled:false}}setPixelRatio(){}setSize(){}render(){this.info.render.frame++}clearDepth(){}clear(){}};THREE.GLTFLoader.prototype.load=function(path,onLoad){const g=new THREE.Group(),bone=new THREE.Group();bone.name='Bip01_R_Hand';g.add(bone);queueMicrotask(()=>onLoad({scene:g,animations:[]}));return {}};THREE.TextureLoader.prototype.load=function(path){return new THREE.Texture()};</script>'''
html=html.replace('<script src="js/bsp-render.js"></script>',mock+'<script src="js/bsp-render.js"></script>')
for path in ['js/bsp-render.js','js/bsp-physics.js','js/bsp-doors.js','js/nav-graph.js','js/combat12.js','js/game-core.js','js/game-systems8.js','js/game-systems9.js','js/game-systems10.js','js/game-systems11.js','js/classic-ui.js','js/layout-nav.js']:
 html=html.replace(f'<script src="{path}"></script>','<script>\n'+(root/path).read_text()+'\n</script>')
assert '<script src=' not in html
checks=[];errors=[]
def ck(name,actual):
 checks.append({'name':name,'pass':bool(actual)});print(('PASS' if actual else 'FAIL'),name,flush=True)
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-web-security'])
 page=browser.new_page(viewport={'width':844,'height':390},device_scale_factor=2,is_mobile=True,has_touch=True)
 page.on('pageerror',lambda error:errors.append(str(error)))
 page.goto('about:blank');page.set_content(html,wait_until='load');page.wait_for_timeout(300)
 def js(name,expr):
  try:ck(name,page.evaluate(expr))
  except Exception as e:ck(name,False);print('ERROR',name,str(e)[:300])
 js('New touch sprint icon exists',"!!$('sprintBtn')&&$('sprintBtn').querySelector('svg')!==null")
 js('Fire control uses bullet icon',"$('fire').querySelector('svg path[fill]')!==null")
 js('Sprint control supported in customization',"document.querySelectorAll('[data-preset]').length===3&&typeof Phase9.setup==='undefined'&&getComputedStyle($('sprintBtn')).touchAction==='none'")
 page.locator('#go').click();page.locator('#continueMap').click();page.locator('#matchPlayers').fill('6');page.locator('#continueMatchConfig').click();page.locator('[data-team="CT"]').click();page.locator('#startMatch').click();page.wait_for_timeout(350)
 js('Game starts',"running&&bots.length===5")
 js('Shift enables sprint only while moving',"(()=>{P.on=true;K.w=1;document.dispatchEvent(new KeyboardEvent('keydown',{code:'ShiftLeft',bubbles:true}));return isSprinting()})()")
 js('Shift release disables sprint',"(document.dispatchEvent(new KeyboardEvent('keyup',{code:'ShiftLeft',bubbles:true})),!isSprinting())")
 js('Crouch blocks sprint',"(()=>{sprintHeld=true;Phase9.setCrouchInput(true);Phase9.updateCrouch();const ok=!isSprinting();Phase9.setCrouchInput(false);Phase9.updateCrouch();sprintHeld=false;return ok})()")
 js('Mobile sprint toggle',"(()=>{K.w=1;P.on=true;$('sprintBtn').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,cancelable:true,pointerId:17,pointerType:'touch'}));const ok=isSprinting()&&$('sprintBtn').classList.contains('active');$('sprintBtn').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,cancelable:true,pointerId:18,pointerType:'touch'}));return ok&&!isSprinting()})()")
 js('Touch fire hold and aim drag',"""(()=>{const b=$('fire');b.setPointerCapture=()=>{};P.yaw=0;P.pitch=0;cool=swapT=reloading=0;const before=A.usp.mag;
 b.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,cancelable:true,pointerType:'touch',pointerId:91,clientX:600,clientY:175,buttons:1}));
 const firing=fh&&A.usp.mag<before;
 b.dispatchEvent(new PointerEvent('pointermove',{bubbles:true,cancelable:true,pointerType:'touch',pointerId:91,clientX:640,clientY:185,buttons:1}));
 const rotated=P.yaw<-.01&&P.pitch<-.01;
 b.dispatchEvent(new PointerEvent('pointerup',{bubbles:true,cancelable:true,pointerType:'touch',pointerId:91,clientX:640,clientY:185,buttons:0}));
 return firing&&rotated&&!fh&&fireAimPointer===null;
})()""")
 js('Enemy bot patrols next point after arrival',"""(()=>{const b=bots.find(x=>x.team!==playerTeam);b.lastSeen=null;b.radioOrder=null;b.patrolGoal=null;
 const one=Phase10.goal(b);b.g.position.copy(one.pos);const two=Phase10.goal(b);
 return one.mode==='patrol'&&two.mode==='patrol'&&one.pos.distanceTo(two.pos)>2;
})()""")
 js('Old bot crouch fallback still works',"""(()=>{const b=bots.find(x=>x.body);if(!b)return false;b.crouching=true;Phase11.updateBotPose(b,.4);const ok=b.crouchPose>.5;b.crouching=false;Phase11.updateBotPose(b,.4);return ok&&b.crouchPose<.15})()""")
 js('Native bot crouch does not sink model below base height',"""(()=>{const b=bots.find(x=>x.body);if(!b)return false;b.acts={crouch_idle:{},crouchrun:{}};b.crouching=true;b.crouchPose=0;Phase11.updateBotPose(b,.5);return Math.abs(b.body.position.y-b.baseBodyY)<1e-5})()""")
 js('Bot visual interpolation mount is present',"bots.filter(b=>!!b.body).every(b=>b.visualMount&&b.visualMount.parent===b.g)")
 js('Gameplay remains running after input tests','running&&!over')

 js('Combat12 module available',"typeof Combat12==='object'&&Object.keys(Combat12.TABLE).length===25")
 js('Bot shots no longer use 38% damage multiplier',"(()=>{const b=bots[0];equipBot(b,0,'ak47');return b.damage===W.ak47.dmg&&b.damage===36})()")
 js('Kevlar without helmet does not prevent headshot',"(()=>{P.hp=100;armor=100;helmet=false;hurt(8,null,'bullet',null,'head','ak47',0);return Math.abs(P.hp-68)<.001&&armor===100})()")
 js('Kevlar+helmet reduces headshot and wears armor',"(()=>{P.hp=100;armor=100;helmet=true;hurt(8,null,'bullet',null,'head','ak47',0);return P.hp>68&&P.hp<100&&armor<100})()")
 js('Bot headshot obeys helmet state',"(()=>{const b=bots.find(x=>!x.dead);if(!b)return false;b.hp=100;b.armor=100;b.helmet=false;damageBot(b,8,'head',null,false,null,'ak47',0);const noHelm=b.hp;b.hp=100;b.armor=100;b.helmet=true;damageBot(b,8,'head',null,false,null,'ak47',0);return Math.abs(noHelm-68)<.001&&b.hp>noHelm&&b.armor<100})()")
 js('Vest-to-helmet upgrade priced at $350',"(()=>{money=10000;buyTime=15;playerTeam='CT';P.pos.set(0,0,26);armor=100;helmet=false;const price=getItem('helmet').price;const old=money;return price===350&&purchase('helmet')&&helmet&&money===old-350})()")
 js('No purchase of helmet twice',"(()=>{const old=money;return buyReason(getItem('helmet'))==='OWNED'&&money===old})()")
 js('Six zoom weapons exit scope before reload',"(()=>{for(const id of ['awp','scout','aug','sg552','sg550','g3sg1']){inventory=[id,'knife'];setW(0);A[id].mag=2;A[id].res=20;aiming=true;zoomIdx=1;syncAim();cam.fov=22;cam.updateProjectionMatrix();reload();if(aiming||zoomIdx!==0||reloading<=0||cam.fov!==baseFov||!$('scopeOverlay').classList.contains('hidden'))return false;}return true})()")
 js('Reload with full magazine does not alter aim',"(()=>{inventory=['awp','knife'];setW(0);A.awp.mag=W.awp.mag;reloading=0;aiming=true;zoomIdx=0;syncAim();reload();return aiming&&reloading===0})()")
 js('Shotgun fires nine independent ray tests',"(()=>{inventory=['m3','knife'];setW(0);A.m3.mag=8;A.m3.res=20;cool=swapT=reloading=0;const old=ray.intersectObjects;let c=0;ray.intersectObjects=function(...args){c++;return old.apply(this,args)};try{shoot()}finally{ray.intersectObjects=old};return c===9&&A.m3.mag===7})()")
 js('XM1014 fires six independent ray tests',"(()=>{inventory=['xm1014','knife'];setW(0);A.xm1014.mag=7;A.xm1014.res=20;cool=swapT=reloading=0;const old=ray.intersectObjects;let c=0;ray.intersectObjects=function(...args){c++;return old.apply(this,args)};try{shoot()}finally{ray.intersectObjects=old};return c===6&&A.xm1014.mag===6})()")
 js('FAMAS secondary toggles burst and uses three bullets',"(()=>{inventory=['famas','knife'];setW(0);A.famas.mag=25;cool=swapT=reloading=0;const initial=Phase9.famasBurst;Phase9.secondaryAction();if(Phase9.famasBurst===initial)return false;shoot();const ok=A.famas.mag===22;Phase9.secondaryAction();return ok&&Phase9.famasBurst===initial})()")
 js('Knife secondary stab executes an attack',"(()=>{inventory=['knife'];setW(0);cool=swapT=reloading=0;Phase9.secondaryAction();return cool>=.95})()")
 for t in ['he','flash','smoke']:
  js(t+' grenade requires pin/throw animation before projectile',"""(()=>{Phase9.resetRound();grenades.__T__=1;selectedGrenade='__T__';const initiated=Phase9.throwGrenade();const before=Phase9.getDebugState();if(!initiated||before.projectiles!==0||before.pendingThrow!=='deploy'||grenades.__T__!==1)return false;Phase9.update(.22);if(Phase9.getDebugState().pendingThrow!=='pin')return false;Phase9.update(.51);const after=Phase9.getDebugState();return after.projectiles===1&&after.pendingThrow===null&&grenades.__T__===0})()""".replace('__T__',t))
  js(t+' grenade detonates and clears projectile',"(Array.from({length:330},()=>Phase9.update(.02)),Phase9.getDebugState().projectiles===0)")
  if t=='smoke':
   js('Smoke cloud remains after grenade activation','Phase9.getDebugState().smoke===1')
   js('Smoke particles expire without lingering resources',"(Array.from({length:820},()=>Phase9.update(.02)),Phase9.getDebugState().smoke===0)")
 js('Round reset clears projectile, smoke and pending throw',"(()=>{grenades.he=1;selectedGrenade='he';Phase9.throwGrenade();Phase9.resetRound();const s=Phase9.getDebugState();return s.pendingThrow===null&&s.projectiles===0&&s.smoke===0})()")

 page.screenshot(path=str(out/'controls-simulated.png'))
 browser.close()
for d in ['ct','t']:
 for file in (root/'assets/models'/d).glob('*.glb'):
  raw=file.read_bytes();size=struct.unpack_from('<I',raw,12)[0];j=json.loads(raw[20:20+size]);names={x['name'] for x in j['animations']}
  ck('Model '+d+'/'+file.stem+' has native locomotion and crouch',{'walk','run','crouch_idle','crouchrun','jump','ref_reload_rifle','ref_shoot_onehanded'}.issubset(names))
ck('CT thumbnails distinct',len({hashlib.sha256((root/'assets/ui/classes'/f'{n}.png').read_bytes()).hexdigest() for n in ['gsg9','gign','sas','urban']})==4)
ck('No JS page errors',not errors)
(out/'checks.json').write_text(json.dumps({'checks':checks,'pageErrors':errors,'pass':sum(i['pass'] for i in checks),'total':len(checks)},indent=2))
print('RESULT',sum(i['pass'] for i in checks),'/',len(checks),'JS errors:',errors)
if not all(i['pass'] for i in checks):sys.exit(1)
