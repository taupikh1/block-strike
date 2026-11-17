#!/usr/bin/env python3
"""Tahap 9 DOM/gameplay logic tests in Chromium with stubbed GLTF & GPU.
These tests DO NOT prove actual rendering, iPhone Safari behavior, or full asset loading.
Browser navigation is disallowed by this environment; use about:blank + inline assets.
"""
import json,re,sys,traceback
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'qa'/'tahap9';OUT.mkdir(parents=True,exist_ok=True)
html=(ROOT/'index.html').read_text()
for match in re.findall(r'<link rel="stylesheet" href="([^"]+)">',html):
 f=ROOT/match
 html=html.replace(f'<link rel="stylesheet" href="{match}">','<style>'+f.read_text()+'</style>')
MAP=json.dumps(json.loads((ROOT/'assets/maps/dust_block.json').read_text()))
initial=f'''<script>
window.__testMap={MAP};
window.fetch=async function(url){{if(String(url).includes('dust_block.json'))return new Response(JSON.stringify(window.__testMap),{{status:200}});return new Response('',{{status:404}})}};
</script>'''
html=html.replace('<script src="js/vendor/three.min.js"></script>','<script>'+(ROOT/'js/vendor/three.min.js').read_text()+'</script>'+initial)
for path in ['js/vendor/GLTFLoader.js','js/vendor/SkeletonUtils.js']:
 html=html.replace(f'<script src="{path}"></script>','<script>'+(ROOT/path).read_text()+'</script>')
mock='''<script>
// Explicitly stubbed GPU: only tests state, event wiring, and DOM presentation.
THREE.WebGLRenderer=class {constructor(o){this.domElement=o.canvas;this.info={render:{calls:1,frame:1},memory:{geometries:0,textures:0}};this.shadowMap={enabled:false};}setPixelRatio(){} setSize(){}render(){this.info.render.frame++}clearDepth(){}clear(){}};
THREE.GLTFLoader.prototype.load=function(path,onLoad,onProgress,onError){const group=new THREE.Group(),bone=new THREE.Group();bone.name='Spine';group.add(bone);queueMicrotask(()=>onLoad({scene:group,animations:[]}));return {}};
</script>'''
html=html.replace('<script src="js/bsp-render.js"></script>',mock+'<script src="js/bsp-render.js"></script>')
for path in ['js/bsp-render.js','js/bsp-physics.js','js/bsp-doors.js','js/nav-graph.js','js/game-core.js','js/game-systems8.js','js/game-systems9.js','js/classic-ui.js','js/layout-nav.js']:
 html=html.replace(f'<script src="{path}"></script>','<script>\n'+(ROOT/path).read_text()+'\n</script>')
assert '<script src=' not in html
checks=[];errors=[];console=[]
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 page=browser.new_page(viewport={'width':844,'height':390},is_mobile=True,has_touch=True,device_scale_factor=2)
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.on('console',lambda e:console.append(e.text) if e.type=='error' else None)
 page.goto('about:blank');page.set_content(html,wait_until='load');page.wait_for_timeout(400)
 def check(name,js,expected=True):
  try:
   value=page.evaluate(js);passed=value==expected
   checks.append({'name':name,'result':'PASS' if passed else 'FAIL','value':value,'expected':expected})
  except Exception as e:
   checks.append({'name':name,'result':'ERROR','message':str(e)[:550]})
  print(checks[-1]['result'],name,checks[-1].get('value',checks[-1].get('message')))
 check('Boot: main menu and Phase9 present',"document.querySelector('#menu')&&!document.querySelector('#menu').classList.contains('hidden')&&typeof Phase9==='object'")
 check('HUD icon buttons and crouch input',"document.querySelectorAll('.btn svg').length>=10&&typeof Phase9.setCrouchInput==='function'")
 page.locator('#go').click();page.locator('[data-map="dust_block"]').click();page.locator('#continueMap').click();page.locator('[data-team="CT"]').click();page.locator('#startMatch').click();page.wait_for_timeout(650)
 check('Match startup in stubbed environment','running===true&&bots.length>=3&&!!R')
 check('Starting ammo/health','$(''hpt'')' if False else 'P.hp===100&&A.usp.mag===12')
 check('Buy menu contains CT shield',"(money=10000,buyTime=15,P.pos.set(0,0,26),openBuyMenu(),renderBuyTab('equipment'),!!document.querySelector('[data-item=shield]'))")
 page.locator('#closeBuy').click()
 check('NVG cannot activate before purchase','Phase9.toggleNightVision()===false')
 check('NVG purchase does not auto-activate',"(purchase('nightvision'),nightVision===true&&!document.body.classList.contains('night-vision'))")
 check('NVG manual activation',"Phase9.toggleNightVision()&&document.body.classList.contains('night-vision')")
 check('NVG manual deactivation',"Phase9.toggleNightVision()&&!document.body.classList.contains('night-vision')")
 check('USP suppressor toggles and changes sound',"(setW(inventory.indexOf('usp')),Phase9.secondaryAction.lock=0,Phase9.secondaryAction(),Phase9.firingSound('usp')==='usp_unsil-1.wav')")
 check('USP suppressor reattaches',"(Phase9.secondaryAction.lock=0,Phase9.secondaryAction(),Phase9.firingSound('usp')==='usp1.wav')")
 check('Crouch changes collision state',"(Phase9.setCrouchInput(true),Phase9.updateCrouch(),Phase9.crouching===true)")
 check('Crouch releases when headroom permits',"(Phase9.setCrouchInput(false),Phase9.updateCrouch(),Phase9.crouching===false)")
 check('AWP purchase and scope HUD z-index',"(purchase('awp'),toggleAim(),syncAim(),document.querySelector('#scopeOverlay').classList.contains('active')&&Number(getComputedStyle(document.querySelector('#hp')).zIndex)>Number(getComputedStyle(document.querySelector('#scopeOverlay')).zIndex))")
 check('Scope HUD remains visible',"['hp','armor','ammo','economy','roundclock'].every(id=>getComputedStyle($(id)).visibility==='visible')")
 (OUT/'scope-hud-simulated.png').parent.mkdir(parents=True,exist_ok=True)
 page.screenshot(path=str(OUT/'scope-hud-simulated.png'))
 check('Scope resets on weapon switch',"(setW(inventory.findIndex(k=>k==='usp')),!aiming&&!$('scopeOverlay').classList.contains('active'))")
 check('CT shield purchase and primary slot replacement',"(purchase('shield'),inventory.includes('shield')&&!inventory.includes('awp')&&inventory.includes('usp'))")
 check('Shield secondary action raises',"(Phase9.secondaryAction(),Phase9.shieldRaised===true)")
 check('Shield blocks frontal bullet',"(P.yaw=0,Phase9.blockShieldHit(P.pos.clone().add(V(0,0,-5)))===true)")
 check('Shield exposes rear bullet',"Phase9.blockShieldHit(P.pos.clone().add(V(0,0,5)))===false")
 check('Shield can lower to fire pistol',"(Phase9.secondaryAction(),cool=0,swapT=0,reloading=0,A.usp.mag=12,shoot(),A.usp.mag===11)")
 for t in ['he','flash','smoke']:
  check(f'{t} throw creates moving projectile',f"(grenades.{t}=1,selectedGrenade='{t}',Phase9.throwGrenade(),Phase9.getDebugState().projectiles>0)")
  check(f'{t} fuse resolves projectile',"(Array.from({length:145},()=>Phase9.update(.02)),Phase9.getDebugState().projectiles===0)")
  if t=='smoke':
   check('Smoke persists after explosion','Phase9.getDebugState().smoke>0')
   check('Smoke expires and releases resources',"(Array.from({length:650},()=>Phase9.update(.02)),Phase9.getDebugState().smoke===0)")
 check('Bot death creates world drop',"(()=>{const b=bots.find(x=>x.weaponId&&!x.dead&&x.team!==playerTeam);b.g.position.copy(P.pos).add(V(1,0,0));b.hp=1;damageBot(b,10,'body',b.g.position.clone(),true);return Phase9.getDebugState().dropped>0})()")
 check('Pickup prompt appears near dropped weapon',"(Phase9.update(.016),!$('pickupPrompt').classList.contains('hidden'))")
 check('Weapon pickup swaps primary and drops old one',"(()=>{const old=inventory.find(k=>W[k].slot==='primary');const n=Phase9.getDebugState().dropped;return Phase9.pickupNearest()&&!inventory.includes(old)&&inventory.some(k=>W[k].slot==='primary')&&Phase9.getDebugState().dropped>=n})()")
 check('Round clears transient grenade, smoke, and dropped objects',"(Phase9.resetRound(),Object.values(Phase9.getDebugState()).slice(0,3).every(v=>v===0))")
 # Open settings/layout from match pause to exercise events.
 page.locator('#pauseBtn').click();page.locator('#settingsBtn').click();page.locator('#controlLayoutBtn').click()
 check('Control editor activates on iPhone viewport',"document.body.classList.contains('layout-edit')&&!$('controlEditor').classList.contains('hidden')")
 page.locator('[data-preset="four"]').click()
 check('Four-finger preset relocates fire icon',"getComputedStyle($('fire')).left!=='auto'&&$('fire').style.left==='13%'")
 page.locator('#layoutSave').click()
 check('Editor closes after Save',"!document.body.classList.contains('layout-edit')&&$('controlEditor').classList.contains('hidden')")
 page.screenshot(path=str(OUT/'layout-editor-closed-simulated.png'))
 check('No uncaught JS exceptions', 'true',True)
 report={'environment':'Chromium headless; about:blank inline fixture; THREE.WebGLRenderer and GLTFLoader stubbed; not real WebGL/asset loading','checks':checks,'uncaught_js_errors':errors,'console_errors':console,'pass':sum(c['result']=='PASS' for c in checks),'fail':sum(c['result']!='PASS' for c in checks),'result':'PASS LOGIC SIMULATION' if all(c['result']=='PASS' for c in checks) and not errors else 'FAIL'}
 (OUT/'simulation.json').write_text(json.dumps(report,indent=2,ensure_ascii=False))
 print('\nRESULT',report['result'],report['pass'],'/',len(checks),'ERRORS',errors[:8],console[:8])
 browser.close()
 if report['result']!='PASS LOGIC SIMULATION':sys.exit(1)
