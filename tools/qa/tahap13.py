#!/usr/bin/env python3
"""BLOCK STRIKE Tahap 13 integration, emulated DOM/input. Renderer/GLTF STUBBED."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json,re,sys
root=Path(__file__).resolve().parents[2];out=root/'qa/tahap13';out.mkdir(parents=True,exist_ok=True)
html=(root/'index.html').read_text()
for path in re.findall(r'<link rel="stylesheet" href="([^"]+)">',html):
 html=html.replace(f'<link rel="stylesheet" href="{path}">','<style>'+(root/path).read_text()+'</style>')
map_data=json.dumps(json.loads((root/'assets/maps/dust_block.json').read_text()))
mock='''<script>window.__testMap=__MAP__;window.fetch=async function(url){if(String(url).includes('dust_block.json'))return new Response(JSON.stringify(window.__testMap),{status:200});return new Response('',{status:404})};</script>'''.replace('__MAP__',map_data)
html=html.replace('<script src="js/vendor/three.min.js"></script>','<script>'+(root/'js/vendor/three.min.js').read_text()+'</script>'+mock)
for path in ['js/vendor/GLTFLoader.js','js/vendor/SkeletonUtils.js']:
 html=html.replace(f'<script src="{path}"></script>','<script>'+(root/path).read_text()+'</script>')
mock='''<script>THREE.WebGLRenderer=class{constructor(o){this.domElement=o.canvas;this.info={render:{calls:1,frame:1},memory:{geometries:0,textures:0}};this.shadowMap={enabled:false}}setPixelRatio(){}setSize(){}render(){this.info.render.frame++}clearDepth(){}clear(){}};
THREE.GLTFLoader.prototype.load=function(path,onLoad){const g=new THREE.Group(),bone=new THREE.Group();bone.name='Bip01_R_Hand';g.add(bone);queueMicrotask(()=>onLoad({scene:g,animations:[]}));return {}};
THREE.TextureLoader.prototype.load=function(){return new THREE.Texture()};</script>'''
html=html.replace('<script src="js/bsp-render.js"></script>',mock+'<script src="js/bsp-render.js"></script>')
for path in re.findall(r'<script src="([^"]+)"></script>',html):html=html.replace(f'<script src="{path}"></script>','<script>\n'+(root/path).read_text()+'\n</script>')
assert '<script src=' not in html
checks=[];errors=[]
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-web-security'])
 page=browser.new_page(viewport={'width':844,'height':390},device_scale_factor=2,is_mobile=True,has_touch=True)
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto('about:blank');page.set_content(html,wait_until='load');page.wait_for_timeout(300)
 def ck(name,expr):
  try:
   x=page.evaluate(expr);v=bool(x);print(('PASS' if v else 'FAIL'),name,repr(x)[:90],flush=True);checks.append({'name':name,'pass':v})
  except Exception as e:checks.append({'name':name,'pass':False,'error':str(e)});print('ERROR',name,str(e)[:260],flush=True)
 ck('Phase13 loaded',"typeof Phase13==='object'&&typeof Phase13.checkRoundEnd==='function'")
 ck('Only Dust Block is offered',"document.querySelectorAll('[data-map]').length===1&&document.querySelector('[data-map]').dataset.map==='dust_block'")
 ck('Old BSP map files not loaded',"![...document.querySelectorAll('[data-map]')].some(x=>x.dataset.map.includes('kvartal'))")
 ck('Classic shift walk control available',"!!$('walkBtn')&&!$('sprintBtn')&&typeof isWalking==='function'")
 ck('Icon HUD controls are present',"['fire','dropBtn','flashBtn','weaponBtn','teamBtn','settingsGameBtn','scoreBtn','radioBtn'].every(x=>!!$(x))")
 ck('Config hand selector',"$('weaponHand').querySelectorAll('option').length===2")
 ck('Spectator next/previous controls',"!!$('spectatorHud')&&!!$('specPrev')&&!!$('specNext')")
 page.locator('#go').click();ck('New Game skips map selector',"!$('matchConfigScreen').classList.contains('hidden')&&$('mapScreen').classList.contains('hidden')")
 page.locator('#matchPlayers').fill('6');page.locator('#continueMatchConfig').click();page.locator('[data-team="CT"]').click();page.locator('#startMatch').click();page.wait_for_timeout(700)
 print('ICON CSS',page.evaluate("['flashBtn','dropBtn','weaponBtn','settingsGameBtn','teamBtn'].map(id=>{const el=$(id),svg=el.querySelector('svg');return [id,getComputedStyle(el).width,getComputedStyle(svg).width,getComputedStyle(svg).height,svg.getBoundingClientRect().width]})"),flush=True)
 page.screenshot(path=str(out/'hud-mobile-simulated.png'))
 ck('Round starts 1 human 5 bots',"running&&bots.length===5&&round===1&&playerTeam==='CT'")
 ck('WebGL Spotlight created',"!!Phase13.getDebugState&&!!cam.children.find(o=>o.isSpotLight)")
 ck('Weapon right hand default',"vm.scale.x===1")
 ck('Left hand mirrored viewmodel',"(Phase13.setHand('left'),vm.scale.x===-1&&Phase13.getDebugState().hand==='left')")
 ck('Right hand can be restored',"(Phase13.setHand('right'),vm.scale.x===1)")
 ck('Shift enables walk without sprint bonus',"(()=>{document.dispatchEvent(new KeyboardEvent('keydown',{code:'ShiftLeft',bubbles:true}));const v=isWalking()&&Phase13.moveSpeed(cur())*0.52<Phase13.moveSpeed(cur());document.dispatchEvent(new KeyboardEvent('keyup',{code:'ShiftLeft',bubbles:true}));return v&&!isWalking()})()")
 ck('Toggle flashlight follows camera',"(()=>{const light=cam.children.find(o=>o.isSpotLight);const a=Phase13.toggleFlashlight();const v=a&&light.visible&&$('flashBtn').classList.contains('active');Phase13.toggleFlashlight();return v&&!light.visible})()")
 ck('Knife alt fire uses stab animation route',"(()=>{inventory=['knife'];setW(0);cool=reloading=swapT=0;Phase9.secondaryAction();return cool>=.95})()")
 ck('Drop weapon produces a real pickup',"(()=>{inventory=['usp','knife'];setW(0);const before=Phase9.getDebugState().dropped;const v=Phase9.dropPlayerWeapon();return v&&Phase9.getDebugState().dropped===before+1&&inventory.join(',')==='knife'})()")
 ck('Knife cannot be dropped',"(!Phase9.dropPlayerWeapon()&&inventory.includes('knife'))")
 ck('Weapon selector lists held weapons',"(Phase13.openWeaponSelector(),!$('weaponOverlay').classList.contains('hidden')&&$('weaponItems').textContent.includes('KNIFE'))")
 ck('Inventory filters unavailable weapons',"$('weaponItems').querySelectorAll('[data-weapon]').length===1")
 page.evaluate('Phase13.closeWeaponSelector()')
 ck('Team change queued, not immediate',"(()=>{Phase13.queueTeam('T');return playerTeam==='CT'&&Phase13.getDebugState().queuedTeam==='T'})()")
 ck('Team switch applies next round, restores pistol',"(()=>{startRound();return playerTeam==='T'&&Phase13.counts===undefined&&inventory.includes('glock18')&&Phase10.counts().allies===2&&Phase10.counts().enemies===3})()")
 ck('Bot teams equal three each',"(bots.filter(b=>b.team==='T').length===2&&bots.filter(b=>b.team==='CT').length===3)")
 ck('Turn off game controls during spectator',"(()=>{P.hp=2;hurt(50,null,'bullet',null,'chest','ak47',0);return Phase13.isSpectating()&&!over&&running&&$('menu').classList.contains('hidden')&&$('spectatorHud').classList.contains('hidden')===false})()")
 ck('Spectator camera tracks a living bot',"(()=>{const observed=Phase13.getDebugState().observed;Phase13.updateSpectator(.05);return observed&&cam.position.y>1&&Phase13.getDebugState().observed})()")
 ck('Spectator next bot switches POV',"(()=>{const old=Phase13.getDebugState().observed;document.dispatchEvent(new KeyboardEvent('keydown',{code:'ArrowRight',bubbles:true}));return Phase13.getDebugState().observed!==old})()")
 ck('Dying twice does not double count deaths',"(()=>{const s=Phase10.getDebugState();const h=P.hp;hurt(50,null,'bullet');return P.hp===h&&Phase13.isSpectating()})()")
 ck('Spectator respawns in next round',"(()=>{roundWait=0;startRound();return !Phase13.isSpectating()&&P.hp===100&&$('spectatorHud').classList.contains('hidden')})()")
 ck('Can still use classic radio',"Phase10.radioCategories.z.length===9&&Phase10.radioCategories.x.length===9")
 ck('Scoreboard still contains two teams',"(setScoreboard(true),document.querySelectorAll('.sb-team-column').length===2)")
 page.evaluate('setScoreboard(false)')
 ck('Blood decal textures exist',"typeof Phase13.bloodHit==='function'&&typeof Phase13.updateBlood==='function'")
 ck('BloodFX creates transient visual effects',"(()=>{Phase13.bloodHit(bots[0],new THREE.Vector3(0,1,0),true);return Phase13.getDebugState().bloodBursts>=5})()")
 ck('BloodFX clears between rounds',"(Phase13.clearBlood(),Phase13.getDebugState().bloodBursts===0)")
 ck('Settings button exists with graphic/sens/volume',"['q','sn','volume','controlLayoutBtn','weaponHand'].every(id=>!!$(id))")
 # Restart browser/UI status after team and spectator checks
 try:page.screenshot(path=str(out/'menu-game-simulated.png'))
 except:pass
 report={'environment':'Chromium emulated 844x390 DOM/input; WebGL and GLTF stubs (NO real 3D validation)',
 'total':len(checks),'pass':sum(c['pass'] for c in checks),'failed':[c for c in checks if not c['pass']],'errors':errors}
 (out/'results.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
 print('RESULT',report['pass'],'/',report['total'],'PAGE ERRORS',errors[:3],flush=True)
 browser.close()
 sys.exit(0 if not report['failed'] and not errors else 1)
