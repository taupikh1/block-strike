#!/usr/bin/env python3
"""Static asset, source mapping and syntax QA for Tahap 10, no runtime GPU assertions."""
import json,subprocess,sys,re,hashlib
from pathlib import Path
from PIL import Image
root=Path(__file__).resolve().parents[2]; assets=root/'assets/phase10'
errors=[];checks=[]
def check(name,ok,info=None):
 checks.append({'name':name,'pass':bool(ok),'detail':info})
 if not ok:errors.append(name+' '+str(info))
index=json.loads((assets/'ASSET_INDEX.json').read_text())
radios=sorted((assets/'audio/radio').glob('*.mp3'));bots=sorted((assets/'audio/bot').glob('*.mp3'))
check('Radio MP3 count',len(radios)>=40,len(radios));check('Bot chatter MP3 count',len(bots)>=30,len(bots))
fx=list((assets/'fx').glob('*.png'));check('Converted sprites and blood decals',len(fx)>=15,len(fx))
for f in radios+bots:
 proc=subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','default=noprint_wrappers=1:nokey=1',str(f)],capture_output=True,text=True)
 try:dur=float(proc.stdout.strip());ok=(proc.returncode==0 and dur>.02)
 except ValueError:dur=0;ok=False
 if not ok:errors.append(f'Bad audio {f.name} duration {dur} {proc.stderr[:100]}')
check('All MP3 decode in ffprobe',not any(e.startswith('Bad audio') for e in errors),f'{len(radios)+len(bots)} files')
for p in fx:
 try:
  im=Image.open(p);im.verify();ok=True
 except Exception as e:ok=False;errors.append(str(e))
check('All PNG have valid headers',not any('PNG' in e for e in errors),len(fx))
for stem in ['ct_coverme','followme','com_getinpos','stormfront','ct_backup','regroup','com_reportin','ct_enemys','roger','ctwin','terwin']:
 check('Radio command sound '+stem,(assets/'audio/radio'/f'{stem}.mp3').is_file())
for stem in ['be_right_there','attacking','roger_that','target_spotted','enemy_down']:
 check('Bot voice '+stem,(assets/'audio/bot'/f'{stem}.mp3').is_file())
for stem in ['muzzleflash1','muzzleflash2','blood_v1_blood1','blood_v1_blood2','blood_v2_blood3']:
 check('FX texture '+stem,(assets/'fx'/f'{stem}.png').is_file())
for f in sorted((root/'js').glob('*.js')):
 if f.name.endswith('.min.js'):continue
 res=subprocess.run(['node','--check',str(f)],capture_output=True,text=True)
 check('JS syntax '+f.name,res.returncode==0,res.stderr[:300] if res.returncode else None)
for f in [root/'index.html',root/'css/tahap10.css',root/'js/game-systems10.js']:
 check('Core file present '+f.name,f.is_file())
check('Main HTML references Phase10', 'js/game-systems10.js' in (root/'index.html').read_text())
report={'assets':index,'checks':checks,'passed':sum(c['pass'] for c in checks),'failed':len(errors),'errors':errors}
out=root/'qa/tahap10';out.mkdir(exist_ok=True,parents=True)
(out/'assets_validation.json').write_text(json.dumps(report,indent=2,ensure_ascii=False))
print('STATIC QA',report['passed'],'PASS',report['failed'],'FAIL')
if errors:
 for error in errors:print('FAIL',error)
 sys.exit(1)
