from pathlib import Path
from playwright.sync_api import sync_playwright
import json,re,sys
root=Path(__file__).resolve().parents[2]
html=(root/'index.html').read_text()
for path in re.findall(r'<link rel="stylesheet" href="([^"]+)">',html):html=html.replace(f'<link rel="stylesheet" href="{path}">','<style>'+(root/path).read_text()+'</style>')
mock='<script>window.fetch=async function(url){return String(url).includes("dust_block.json")?new Response('+json.dumps(json.dumps(json.loads((root/'assets/maps/dust_block.json').read_text())))+',{status:200}):new Response("",{status:404})}</script>'
html=html.replace('<script src="js/vendor/three.min.js"></script>','<script>'+(root/'js/vendor/three.min.js').read_text()+'</script>'+mock)
for path in ['js/vendor/GLTFLoader.js','js/vendor/SkeletonUtils.js']:html=html.replace(f'<script src="{path}"></script>','<script>'+(root/path).read_text()+'</script>')
mock='''<script>THREE.GLTFLoader.prototype.load=function(path,onLoad){const g=new THREE.Group(),bone=new THREE.Group();bone.name='Bip01_R_Hand';g.add(bone);queueMicrotask(()=>onLoad({scene:g,animations:[]}));return {}};THREE.TextureLoader.prototype.load=function(path){return new THREE.Texture()};</script>'''
html=html.replace('<script src="js/bsp-render.js"></script>',mock+'<script src="js/bsp-render.js"></script>')
for path in re.findall(r'<script src="([^"]+)"></script>',html):html=html.replace(f'<script src="{path}"></script>','<script>\n'+(root/path).read_text()+'\n</script>')
errors=[]
with sync_playwright() as p:
 args=['--no-sandbox','--disable-web-security','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader','--disable-gpu-sandbox']
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=args)
 page=browser.new_page(viewport={'width':844,'height':390},is_mobile=True,has_touch=True)
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto('about:blank');page.set_content(html,wait_until='load');page.wait_for_timeout(500)
 try:
  page.locator('#go').click();page.locator('#matchPlayers').fill('6');page.locator('#continueMatchConfig').click();page.locator('[data-team="CT"]').click();page.locator('#startMatch').click();page.wait_for_timeout(900)
  print('status',page.evaluate('({running,round,bots:bots.length,renderer:!!R,webgl:R?.getContext?.()?.constructor?.name,loading:document.getElementById("loadStatus").textContent,menu:document.getElementById("loadingScreen").className})'))
  print('pageErrors',errors[:3]);page.screenshot(path=str(root/'qa/tahap13/webgl-attempt.png'))
 except Exception as e:print('TEST ERROR',str(e)[:500]);print('pageErrors',errors[:3])
 browser.close()
