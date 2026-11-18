#!/usr/bin/env python3
"""Tahap 14E/F input integration: genuine Chromium DOM pointer events; GPU stubbed."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json,re,sys,traceback
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'qa/tahap14efg';OUT.mkdir(parents=True,exist_ok=True)
checks=[];errors=[]
def ck(name,condition,detail=''):
    pass_=bool(condition);checks.append(dict(name=name,passed=pass_,detail=str(detail)[:250]));print(('PASS' if pass_ else 'FAIL'),name,detail,flush=True)
html=(ROOT/'index.html').read_text()
for path in re.findall(r'<link rel="stylesheet" href="([^"]+)">',html):
    html=html.replace(f'<link rel="stylesheet" href="{path}">','<style>\n'+(ROOT/path).read_text()+'\n</style>')
mock_fetch='<script>window.__testMap=__MAP__;window.fetch=async function(url){if(String(url).includes("dust_block.json"))return new Response(JSON.stringify(window.__testMap),{status:200});return new Response("",{status:404})};</script>'
mock_fetch=mock_fetch.replace('__MAP__',json.dumps(json.loads((ROOT/'assets/maps/dust_block.json').read_text())))
html=html.replace('<script src="js/vendor/three.min.js"></script>','<script>\n'+(ROOT/'js/vendor/three.min.js').read_text()+'\n</script>'+mock_fetch)
for path in ['js/vendor/GLTFLoader.js','js/vendor/SkeletonUtils.js']:
    html=html.replace(f'<script src="{path}"></script>','<script>\n'+(ROOT/path).read_text()+'\n</script>')
mock='''<script>THREE.WebGLRenderer=class{constructor(o){this.domElement=o.canvas;this.info={render:{calls:1,frame:1},memory:{geometries:0,textures:0}};this.shadowMap={enabled:false}}setPixelRatio(){}setSize(){}render(){}clearDepth(){}clear(){}};
THREE.GLTFLoader.prototype.load=function(path,onLoad){const g=new THREE.Group(),bone=new THREE.Group();bone.name='Bip01_R_Hand';g.add(bone);queueMicrotask(()=>onLoad({scene:g,animations:[new THREE.AnimationClip('idle',.3,[]),new THREE.AnimationClip('fire',.25,[]),new THREE.AnimationClip('stab',.35,[]),new THREE.AnimationClip('slash1',.35,[])]}));return {}};
THREE.TextureLoader.prototype.load=function(){return new THREE.Texture()};</script>'''
html=html.replace('<script src="js/bsp-render.js"></script>',mock+'<script src="js/bsp-render.js"></script>')
for path in re.findall(r'<script src="([^"]+)"></script>',html):
    html=html.replace(f'<script src="{path}"></script>','<script>\n'+(ROOT/path).read_text()+'\n</script>')
assert '<script src=' not in html
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-web-security'])
    page=browser.new_page(viewport={'width':844,'height':390},is_mobile=True,has_touch=True,device_scale_factor=2)
    page.on('pageerror',lambda error:errors.append(str(error)))
    page.goto('about:blank');page.set_content(html,wait_until='load');page.wait_for_timeout(100)
    def js(name,expression):
        try:
            result=page.evaluate(expression);ck(name,result)
            return result
        except Exception as ex:
            ck(name,False,str(ex));return False
    def pe(target,kind,pointer=3,ptype='touch',button=0,x=700,y=230):
        return page.evaluate('''({target,kind,pointer,ptype,button,x,y})=>{
           let el=document.querySelector(target);let ev=new PointerEvent(kind,{bubbles:true,cancelable:true,pointerId:pointer,pointerType:ptype,button,clientX:x,clientY:y});
           el.dispatchEvent(ev);return ev.defaultPrevented;
        }''',{'target':target,'kind':kind,'pointer':pointer,'ptype':ptype,'button':button,'x':x,'y':y})
    js('New 14E gesture policy exists',"typeof Phase14E==='object'&&typeof Phase14E.install==='function'")
    js('New 14F hold-fire policy exists',"typeof Attack14F==='object'&&Attack14F.repeatable('knife',W.knife)&&Attack14F.repeatable('deagle',W.deagle)&&!Attack14F.repeatable('awp',W.awp)")
    page.locator('#go').click();page.locator('#continueMatchConfig').click();page.locator('[data-team="CT"]').click();page.locator('#startMatch').click();page.wait_for_timeout(700)
    js('Match boots with controls 14EFG',"running&&bots.length>0&&!inputBlocked()")
    page.evaluate("bots.forEach(b=>b.cd=99999);P.hp=100;money=16000;buyTime=15")
    # Native browser gestures on game only, allowed in text input and overlay.
    js('Gameplay canvas gesture suppression',"(()=>{let e=new Event('dblclick',{bubbles:true,cancelable:true});$('pad').dispatchEvent(e);return e.defaultPrevented})()")
    js('Gameplay long-press context suppression',"(()=>{let e=new Event('contextmenu',{bubbles:true,cancelable:true});$('fire').dispatchEvent(e);return e.defaultPrevented})()")
    js('Menu context selection is not suppressed',"(()=>{let e=new Event('contextmenu',{bubbles:true,cancelable:true});$('matchPlayers').dispatchEvent(e);return !e.defaultPrevented})()")
    js('Settings input remains selectable',"getComputedStyle($('matchPlayers')).userSelect!=='none'")
    js('Radio list is scrollable',"getComputedStyle($('radioCommands')).touchAction==='pan-y'")
    js('Buy menu is scrollable',"getComputedStyle($('buyItems')).touchAction==='pan-y'")
    js('Gameplay touch disables native action',"(()=>{let e=new Event('touchstart',{bubbles:true,cancelable:true});$('pad').dispatchEvent(e);return e.defaultPrevented})()")
    js('Overlay touch keeps scrolling',"(()=>{let e=new Event('touchstart',{bubbles:true,cancelable:true});$('radioCommands').dispatchEvent(e);return !e.defaultPrevented})()")
    # Chromium touchscreen dispatches actual synthesized taps; native double-tap must not zoom.
    fire_box=page.locator('#fire').bounding_box()
    if fire_box:
        fx=fire_box['x']+fire_box['width']/2;fy=fire_box['y']+fire_box['height']/2
        page.touchscreen.tap(fx,fy);page.touchscreen.tap(fx,fy);page.wait_for_timeout(200)
        js('Native mobile double-tap does not zoom page',"Math.abs((window.visualViewport?.scale||1)-1)<.02")
    # Instrument actual accepted shots using cooldown zero at dispatch.
    page.evaluate('''window.__acceptedShots=[];const prev=shoot;
       shoot=function(mode){const allowed=running&&!inputBlocked()&&cool<=0&&reloading<=0&&swapT<=0;
         const id=cur();const before=id==='shield'?A[Phase9.shieldPistol()].mag:A[id].mag;
         const result=prev(mode);
         if(allowed&&id==='knife')window.__acceptedShots.push({weapon:id,mode});
         else if(allowed&&id!=='knife'&&((id==='shield'?A[Phase9.shieldPistol()]:A[id]).mag<before))window.__acceptedShots.push({weapon:id,mode});
         return result;};''')
    # Player is spawned with USP; ensure cooldown and swap are done.
    page.evaluate("cool=0;swapT=0;reloading=0;A.usp.mag=12;A.usp.res=100;window.__acceptedShots=[]")
    ck('Primary bullet icon pointer accepted',pe('#fire','pointerdown',101))
    page.wait_for_timeout(810)
    js('Held pistol fires multiple timed shots',"__acceptedShots.filter(x=>x.weapon==='usp').length>=3&&A.usp.mag<=9")
    js('Pistol fire respects fire rate',"__acceptedShots.filter(x=>x.weapon==='usp').length<=7")
    pe('#fire','pointerup',102)
    js('Unrelated finger cannot release pistol fire',"fh===true")
    pe('#fire','pointermove',101,x=715,y=235)
    js('Drag while firing moves camera',"fireAimLast?.x===715&&Number.isFinite(P.yaw)")
    pe('#fire','pointerup',101)
    page.wait_for_timeout(100)
    js('Fire released on owner pointerup',"fh===false&&fireAimPointer===null")
    n=page.evaluate('A.usp.mag');page.wait_for_timeout(400)
    ck('Pistol stops firing after release',page.evaluate('A.usp.mag')==n)
    # Knife primary hold
    page.evaluate("setW(inventory.indexOf('knife'));cool=0;swapT=0;window.__acceptedShots=[]")
    pe('#fire','pointerdown',104);page.wait_for_timeout(1300)
    js('Knife primary held repeats slash',"__acceptedShots.filter(x=>x.weapon==='knife'&&x.mode==='slash').length>=2")
    pe('#fire','pointercancel',104)
    js('Cancelled primary hold clears state',"!fh")
    # Knife alternate hold, separate release
    page.evaluate("cool=0;swapT=0;window.__acceptedShots=[]")
    pe('#ads','pointerdown',105);page.wait_for_timeout(2300)
    js('Knife alternate held repeats stab',"__acceptedShots.filter(x=>x.weapon==='knife'&&x.mode==='stab').length>=2")
    pe('#ads','pointermove',105,x=718,y=240)
    js('Knife alternate drag-to-aim remains valid',"adsAimLast?.x===718&&Number.isFinite(P.yaw)")
    pe('#ads','pointercancel',999)
    js('Unrelated finger cannot release stab',"secondaryHeld===true")
    pe('#ads','pointerup',105)
    js('Knife stab stops after release',"secondaryHeld===false&&adsPointer===null")
    # Holding both thumbs must not let a second finger cancel the primary thumb.
    page.evaluate("cool=0;swapT=0;window.__acceptedShots=[]")
    pe('#fire','pointerdown',151);pe('#ads','pointerdown',152)
    page.wait_for_timeout(600)
    js('Simultaneous primary and alt input safely prioritizes knife stab',"fh&&secondaryHeld&&__acceptedShots.some(x=>x.mode==='stab')")
    pe('#ads','pointerup',152)
    js('Releasing alternate thumb preserves primary hold',"fh&&!secondaryHeld")
    pe('#fire','pointerup',151)
    js('Releasing both thumbs clears attack',"!fh&&!secondaryHeld")
    # Right mouse hold knife
    page.evaluate("cool=0;swapT=0;window.__acceptedShots=[]")
    pe('#pad','pointerdown',107,'mouse',2);page.wait_for_timeout(1200)
    js('PC right click hold knife stabs repeatedly',"__acceptedShots.filter(x=>x.weapon==='knife'&&x.mode==='stab').length>=2")
    pe('#pad','pointerup',107,'mouse',2)
    js('PC right release clears hold',"!secondaryHeld&&!mouseSecondaryHeld")
    # Rifle/scope alt action should toggle ONCE, not cycle through zoom due to holding.
    page.evaluate("inventory.unshift('awp');A.awp={mag:10,res:30};setW(0);cool=0;swapT=0;aiming=false;zoomIdx=0")
    pe('#ads','pointerdown',108);page.wait_for_timeout(850)
    js('Scope action only toggles once when held',"aiming===true&&zoomIdx===0&&secondaryHeld===false")
    pe('#ads','pointerup',108)
    # Out-of-game reset on blur
    page.evaluate("setW(inventory.indexOf('knife'));swapT=0;cool=0")
    pe('#fire','pointerdown',109);page.evaluate("window.dispatchEvent(new Event('blur'))")
    js('Window blur resets primary and secondary input',"!fh&&!fl&&!secondaryHeld")
    pe('#fire','pointerup',109)
    # HUD remains intact and no context menu on action buttons
    js('Shield inventory & weapon HUD still intact',"typeof Phase14C==='object'&&$('fire')&&$('ads')&&$('ammo')")
    page.screenshot(path=str(OUT/'controls-simulated.png'))
    ck('No uncaught page JavaScript errors',len(errors)==0,errors)
    browser.close()
report={'environment':'Chromium mobile DOM with PointerEvents, real Three math, stubbed WebGL and GLTF model loader; not physical iPhone Safari','pass':sum(x['passed'] for x in checks),'total':len(checks),'checks':checks,'pageErrors':errors}
(OUT/'results.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
print('RESULT',report['pass'],'/',report['total']);sys.exit(0 if report['pass']==report['total'] else 1)
