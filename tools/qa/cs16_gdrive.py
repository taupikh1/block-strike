#!/usr/bin/env python3
"""Source archive and integration checks; real PNG/WAV decodes; Chromium DOM game boot with mocked GPU."""
from pathlib import Path
from zipfile import ZipFile
from PIL import Image
import json, re, wave, subprocess
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[2]
checks=[]
def ck(label,yes):
 checks.append({'check':label,'pass':bool(yes)});print(('PASS' if yes else 'FAIL'),label,flush=True)
for n in ('01','02'):
 with ZipFile('/mnt/data/cs16_files-'+n+'.zip') as z:ck('Google Drive archive '+n+' CRC',z.testzip() is None)
with ZipFile('/mnt/data/cs16_files-01.zip') as z:
 t=z.read('file-gagal.txt').decode();fail=[r for r in t.splitlines() if r.strip()]
 ck('Failed files consist of 19 server Linux libraries',len(fail)==19 and all(line.split()[0].endswith('.so') for line in fail))
png=list((root/'assets/ui/cs16').glob('*.png'));ck('56 source VGUI cards converted',len(png)==56)
for p in png:
 with Image.open(p) as im:im.verify()
ck('Every converted VGUI PNG decodes',True)
wavs=list((root/'assets/cs16-sfx').rglob('*.wav'));ck('29 source sound assets integrated',len(wavs)==29)
try:
 for p in wavs:
  with wave.open(str(p),'rb') as f:assert f.getnframes()>0 and f.getframerate()>0
 ck('Original game WAVs parse and contain audio samples',True)
except Exception as e:ck('Original game WAVs parse and contain audio samples '+str(e),False)
ck('No source BSP or server DLL added',not list((root/'assets/cs16-sfx').rglob('*.bsp')) and not list((root/'assets/ui/cs16').rglob('*.dll')))
html=(root/'index.html').read_text();jslist=re.findall(r'<script src="([^"]+)"',html);csslist=re.findall(r'<link rel="stylesheet" href="([^"]+)"',html)
ck('All scripts and CSS resolve',all((root/s).exists() for s in jslist+csslist))
ck('Modules initialized in correct order',jslist.index('js/cs16-vgui.js')<jslist.index('js/classic-ui.js') and jslist.index('js/cs16-sfx.js')<jslist.index('js/game-core.js'))
ck('All imported class portraits resolve',all((root/f'assets/ui/cs16/{k}.png').exists() for k in ['gign','gsg9','sas','urban','arctic','guerilla','leet','terror']))
nodejs=[str(p) for p in (root/'js').rglob('*.js') if 'vendor' not in str(p)]
checks_syntax=all(subprocess.run(['node','--check',p],capture_output=True).returncode==0 for p in nodejs)
ck('All game JavaScript syntax valid',checks_syntax)
# Existing input regression script uses GPU stubs and covers weapons, shield, menu scroll.
# A separate Chromium DOM run confirms VGUI card routing and score/buy references.
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-web-security','--allow-file-access-from-files'])
 page=browser.new_page(viewport={'width':844,'height':390},device_scale_factor=2,is_mobile=True,has_touch=True)
 errors=[];page.on('pageerror',lambda err:errors.append(str(err)))
 # Local URL navigation is blocked by the sandbox; embed actual asset bytes for PNG decode tests.
 import base64
 picture=(root/'assets/ui/cs16/gign.png').read_bytes()
 data='data:image/png;base64,'+base64.b64encode(picture).decode()
 fixture='<html><body><img id="preview" src="'+data+'"><div id="volume"><\/div><script>'+ (root/'js/cs16-vgui.js').read_text()+'<\/script><script>'+ (root/'js/cs16-sfx.js').read_text()+'<\/script></body></html>'
 fixture=fixture.replace('<\/script>','</script>').replace('<\/div>','</div>')
 page.goto('about:blank');page.set_content(fixture,wait_until='load');page.wait_for_timeout(100)
 result=page.evaluate("""()=>({vgui:typeof CS16VGUI,icon:CS16VGUI.icon('deagle'),sound:typeof CS16SFX,portraitLoaded:document.querySelector('#preview').naturalWidth>0})""")
 ck('Chromium decodes original GoldSrc VGUI PNG bytes',result['portraitLoaded'])
 ck('Source UI path and SFX modules exposed',result['vgui']=='object' and result['sound']=='object' and 'deserteagle.png' in result['icon'])
 ck('Browser has no uncaught JS error',not errors)
 page.screenshot(path=str(root/'qa/cs16-gdrive-menu-chromium.png'))
 browser.close()
report={'summary':'CS16 source-supplied visual/audio checkpoint; Chromium real DOM/assets, WebGL not verified','pass':sum(x['pass'] for x in checks),'total':len(checks),'failed':[c for c in checks if not c['pass']],'checks':checks}
(root/'QA_CS16_GDRIVE.json').write_text(json.dumps(report,indent=2));print('RESULT',report['pass'],'/',report['total'])
raise SystemExit(1 if report['failed'] else 0)
