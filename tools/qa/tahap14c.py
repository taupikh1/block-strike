#!/usr/bin/env python3
"""Tahap 14C shield inventory functional integration.
Chromium DOM + Three logic; GLTF assets / GPU renderer simulated (NOT visual GPU QA).
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json, re, sys
root=Path(__file__).resolve().parents[2]
out=root/'qa/tahap14c';out.mkdir(parents=True,exist_ok=True)
html=(root/'index.html').read_text()
for path in re.findall(r'<link rel="stylesheet" href="([^"]+)">',html):
    html=html.replace(f'<link rel="stylesheet" href="{path}">','<style>'+(root/path).read_text()+'</style>')
map_data=json.dumps(json.loads((root/'assets/maps/dust_block.json').read_text()))
mock='<script>window.__testMap=__MAP__;window.fetch=async function(url){if(String(url).includes("dust_block.json"))return new Response(JSON.stringify(window.__testMap),{status:200});return new Response("",{status:404})};</script>'.replace('__MAP__',map_data)
html=html.replace('<script src="js/vendor/three.min.js"></script>','<script>'+(root/'js/vendor/three.min.js').read_text()+'</script>'+mock)
for path in ['js/vendor/GLTFLoader.js','js/vendor/SkeletonUtils.js']:
    html=html.replace(f'<script src="{path}"></script>','<script>'+(root/path).read_text()+'</script>')
mock='''<script>THREE.WebGLRenderer=class{constructor(o){this.domElement=o.canvas;this.info={render:{calls:1,frame:1},memory:{geometries:0,textures:0}};this.shadowMap={enabled:false}}setPixelRatio(){}setSize(){}render(){}clearDepth(){}clear(){}};
THREE.GLTFLoader.prototype.load=function(path,onLoad){const g=new THREE.Group(),bone=new THREE.Group();bone.name='Bip01_R_Hand';g.add(bone);queueMicrotask(()=>onLoad({scene:g,animations:[]}));return {}};
THREE.TextureLoader.prototype.load=function(){return new THREE.Texture()};</script>'''
html=html.replace('<script src="js/bsp-render.js"></script>',mock+'<script src="js/bsp-render.js"></script>')
for path in re.findall(r'<script src="([^"]+)"></script>',html):
    html=html.replace(f'<script src="{path}"></script>','<script>\n'+(root/path).read_text()+'\n</script>')
assert '<script src=' not in html
checks=[];errors=[]
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-web-security'])
    page=browser.new_page(viewport={'width':844,'height':390},device_scale_factor=2,is_mobile=True,has_touch=True)
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto('about:blank');page.set_content(html,wait_until='load');page.wait_for_timeout(200)
    def ck(name,expr):
        try:
            val=page.evaluate(expr);ok=bool(val)
            checks.append({'name':name,'pass':ok,'value':str(val)[:160]});print(('PASS' if ok else 'FAIL'),name,repr(val)[:120],flush=True)
        except Exception as e:
            checks.append({'name':name,'pass':False,'error':str(e)});print('ERROR',name,str(e)[:230],flush=True)
    ck('Rules module loaded',"typeof Phase14C==='object'&&typeof Phase14C.guardPurchase==='function'")
    ck('Shield always yields only shield+knife choices',"JSON.stringify(Phase14C.allowedIndices(['deagle','shield','knife'],W))==='[1,2]'")
    ck('Pistol selection redirected to shield',"Phase14C.selectIndex(['deagle','shield','knife'],0,W)===1")
    ck('Number keys use two shield loadout choices',"Phase14C.keyIndex(['usp','shield','knife'],1,W)===1&&Phase14C.keyIndex(['usp','shield','knife'],2,W)===2&&Phase14C.keyIndex(['usp','shield','knife'],3,W)===-1")
    ck('Wheel skips duplicate pistol model',"Phase14C.cycleIndex(['usp','shield','knife'],1,1,W)===2&&Phase14C.cycleIndex(['usp','shield','knife'],2,1,W)===1")
    ck('Shield bans rifles until dropped',"Phase14C.guardPurchase('ak47',['usp','shield','knife'],W,'CT')==='DROP SHIELD FIRST'&&Phase14C.guardPickup('awp',['usp','shield','knife'],W,'CT')==='DROP SHIELD FIRST'")
    ck('Shield bans Dual Elites',"Phase14C.guardPurchase('elite',['usp','shield','knife'],W,'CT').includes('DUAL')&&Phase14C.guardPickup('shield',['elite','knife'],W,'CT').includes('DUAL')")
    ck('Shield cannot be picked up by T',"Phase14C.guardPickup('shield',['glock18','knife'],W,'T')==='CT ONLY'")
    ck('Repeated shield pickup is rejected',"Phase14C.guardPickup('shield',['usp','shield','knife'],W,'CT')==='SHIELD ALREADY OWNED'")
    ck('Five single pistols compatible',"['usp','glock18','p228','deagle','fiveseven'].every(id=>!Phase14C.guardPurchase(id,['usp','shield','knife'],W,'CT'))")
    page.locator('#go').click()
    page.locator('#continueMatchConfig').click()
    page.locator('[data-team="CT"]').click()
    page.locator('#startMatch').click()
    page.wait_for_timeout(800)
    ck('Match started CT with starter pistol',"running&&playerTeam==='CT'&&inventory.includes('usp')&&inventory.includes('knife')")
    ck('Buy zone valid near spawn',"inBuyZone()&&buyTime>0")
    ck('Buying shield enables combined view',"(()=>{money=16000;const ok=purchase('shield');return ok&&inventory.includes('shield')&&cur()==='shield'&&$('chips').children.length===2&&$('chips').textContent.includes('USP + SHIELD')})()")
    page.screenshot(path=str(out/'shield-inventory-simulated.png'))
    ck('Direct selection of pistol remains shield',"(setW(inventory.indexOf('usp')),cur()==='shield')")
    ck('Knife selection keeps shield in inventory',"(setW(inventory.indexOf('knife')),cur()==='knife'&&inventory.includes('shield'))")
    ck('Switching back returns pistol+shield',"(setW(inventory.indexOf('usp')),cur()==='shield'&&Phase9.shieldPistol()==='usp')")
    ck('Digit 2 selects knife, Digit 1 selects shield',"(()=>{document.dispatchEvent(new KeyboardEvent('keydown',{code:'Digit2',bubbles:true}));const knife=cur()==='knife';document.dispatchEvent(new KeyboardEvent('keydown',{code:'Digit1',bubbles:true}));return knife&&cur()==='shield'})()")
    page.evaluate("setW(inventory.indexOf('shield'))")
    page.locator('#swap').tap(force=True)
    ck('Mobile swap cycles shield to knife only',"cur()==='knife'&&inventory.includes('shield')")
    ck('Buy menu rejects rifle without spending money',"(()=>{const before=money;return !purchase('m4a1')&&money===before&&inventory.includes('shield')&&!inventory.includes('m4a1')})()")
    ck('Buy menu rejects Dual Elites with shield',"(()=>{const before=money;return !purchase('elite')&&money===before&&inventory.includes('shield')})()")
    ck('Buy menu rejects primary ammo with shield',"(()=>{const before=money;return !purchase('primaryAmmo')&&money===before})()")
    ck('Pistol upgrade retains shield and selects correct model',"(()=>{const before=money;const ok=purchase('deagle');return ok&&money===before-W.deagle.price&&inventory.includes('shield')&&inventory.includes('deagle')&&!inventory.includes('usp')&&cur()==='shield'&&Phase9.shieldPistol()==='deagle'})()")
    ck('Shield pistol has valid ammo after buy',"(A.deagle.mag===W.deagle.mag&&A.deagle.res===W.deagle.res&&cur()==='shield')")
    page.screenshot(path=str(out/'shield-deagle-simulated.png'))
    ck('Pick up pistol while shield held retains shield',"(()=>{const item=Phase9.dropBotWeapon({weaponId:'p228',g:{position:P.pos.clone()},ammo:8});const got=Phase9.pickupNearest();return !!item&&got&&inventory.includes('shield')&&inventory.includes('p228')&&!inventory.includes('deagle')&&cur()==='shield'&&Phase9.shieldPistol()==='p228'})()")
    ck('Can re-purchase Desert Eagle with shield still equipped',"purchase('deagle')&&cur()==='shield'&&Phase9.shieldPistol()==='deagle'")
    ck('Weapon menu shows pistol+shield and knife only',"(()=>{Phase13.openWeaponSelector();const names=[...document.querySelectorAll('#weaponItems .weapon-choice[data-weapon]')].map(x=>x.dataset.weapon);const correct=names.length===2&&names.includes('shield')&&names.includes('knife')&&$('weaponItems').textContent.includes('DEAGLE')===false&&$('weaponItems').textContent.includes('DESERT EAGLE + SHIELD');Phase13.closeWeaponSelector();return !!correct})()")
    ck('Shield mode can be raised/lowered',"(()=>{setW(inventory.indexOf('shield'));const old=Phase9.shieldRaised;Phase9.secondaryAction();const after=Phase9.shieldRaised;Phase9.secondaryAction();return after!==old&&Phase9.shieldRaised===old})()")
    ck('Shield drop preserves pistol and knife',"(()=>{setW(inventory.indexOf('shield'));const before=Phase9.getDebugState().dropped;const ok=Phase9.dropPlayerWeapon();return ok&&!inventory.includes('shield')&&inventory.includes('deagle')&&inventory.includes('knife')&&cur()==='deagle'&&!Phase9.shieldRaised&&Phase9.getDebugState().dropped===before+1})()")
    ck('Rifle purchase unlocked after explicit shield drop',"(()=>{money=16000;return purchase('m4a1')&&inventory.includes('m4a1')&&!inventory.includes('shield')})()")
    ck('Shield drop from bot creates pickable world item',"(()=>{const before=Phase9.getDebugState().dropped;const mock={weaponId:'shield',g:{position:P.pos.clone()},ammo:0};const d=Phase9.dropBotWeapon(mock);return !!d&&Phase9.getDebugState().dropped===before+1})()")
    ck('Picking up dropped shield swaps out primary rifle',"(()=>{const prev=inventory.includes('m4a1');const ok=Phase9.pickupNearest();return prev&&ok&&inventory.includes('shield')&&!inventory.includes('m4a1')&&inventory.includes('deagle')&&cur()==='shield'})()")
    ck('Shield still blocks ordinary rifle purchases after re-equip',"Phase14C.guardPurchase('m249',['deagle','shield','knife'],W,'CT')==='DROP SHIELD FIRST'")
    ck('Shield and knife always present as exactly 2 switch slots',"Phase14C.allowedIndices(['deagle','shield','knife'],W).length===2")
    report={'environment':'Chromium emulated 844x390, real Three math/DOM; WebGL renderer and GLTF asset loading stubbed','total':len(checks),'pass':sum(c['pass'] for c in checks),'failed':[c for c in checks if not c['pass']],'pageErrors':errors}
    (out/'results.json').write_text(json.dumps(report,indent=2,ensure_ascii=False))
    print('RESULT',report['pass'],'/',report['total'],'PAGE ERRORS',errors[:4],flush=True)
    browser.close()
    sys.exit(0 if not report['failed'] and not errors else 1)
