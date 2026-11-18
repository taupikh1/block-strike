#!/usr/bin/env python3
"""Tahap 11 regression of Tahap 10 fixtures in Chromium with explicit GPU and GLTF stubs.
This demonstrates UI wiring/JS/AI state only, not real GPU graphics or iPhone Safari.
"""
import json,re,sys,traceback
from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[2]
out=root/'qa'/'tahap11';out.mkdir(exist_ok=True,parents=True)
src=(root/'index.html').read_text()
for path in re.findall(r'<link rel="stylesheet" href="([^"]+)">',src):
 src=src.replace(f'<link rel="stylesheet" href="{path}">','<style>'+ (root/path).read_text()+'</style>')
map_data=json.dumps(json.loads((root/'assets/maps/dust_block.json').read_text()))
head='''<script>
window.__testMap=__MAP__;
window.fetch=async function(url){
 if(String(url).includes('dust_block.json'))return new Response(JSON.stringify(window.__testMap),{status:200});
 return new Response('',{status:404});
};
</script>'''.replace('__MAP__',map_data)
src=src.replace('<script src="js/vendor/three.min.js"></script>','<script>'+(root/'js/vendor/three.min.js').read_text()+'</script>'+head)
for path in ['js/vendor/GLTFLoader.js','js/vendor/SkeletonUtils.js']:
 src=src.replace(f'<script src="{path}"></script>','<script>'+(root/path).read_text()+'</script>')
stub='''<script>
// GPU and models are deliberately stubbed. The QA report must disclose this.
THREE.WebGLRenderer=class {constructor(o){this.domElement=o.canvas;this.info={render:{calls:1,frame:1},memory:{geometries:0,textures:0}};this.shadowMap={enabled:false}}setPixelRatio(){}setSize(){}render(){this.info.render.frame++}clearDepth(){}clear(){}};
THREE.GLTFLoader.prototype.load=function(path,onLoad){const group=new THREE.Group(),bone=new THREE.Group();bone.name='Spine';group.add(bone);queueMicrotask(()=>onLoad({scene:group,animations:[]}));return {}};
THREE.TextureLoader.prototype.load=function(path){const t=new THREE.Texture();t.needsUpdate=true;return t};
</script>'''
src=src.replace('<script src="js/bsp-render.js"></script>',stub+'<script src="js/bsp-render.js"></script>')
for path in ['js/bsp-render.js','js/bsp-physics.js','js/bsp-doors.js','js/nav-graph.js','js/combat12.js','js/game-core.js','js/game-systems8.js','js/game-systems9.js','js/game-systems10.js','js/game-systems11.js','js/classic-ui.js','js/layout-nav.js']:
 src=src.replace(f'<script src="{path}"></script>','<script>\n'+(root/path).read_text()+'\n</script>')
assert '<script src=' not in src
checks=[];exceptions=[];console=[]
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-web-security'])
 page=browser.new_page(viewport={'width':844,'height':390},device_scale_factor=2,is_mobile=True,has_touch=True)
 page.on('pageerror',lambda e:exceptions.append(str(e)))
 page.on('console',lambda e:console.append(e.text) if e.type=='error' else None)
 page.goto('about:blank');page.set_content(src,wait_until='load');page.wait_for_timeout(500)
 def ck(name,js,expected=True):
  try:
   got=page.evaluate(js);ok=got==expected
   checks.append({'test':name,'result':'PASS' if ok else 'FAIL','got':got,'expected':expected})
  except Exception as e:checks.append({'test':name,'result':'ERROR','message':str(e)[:1000]})
  print(checks[-1]['result'],name,checks[-1].get('got',checks[-1].get('message','')))
 ck('Phase 10 UI loaded','typeof Phase10===\'object\'&&!!$(\'matchPlayers\')&&!!$(\'radioOverlay\')&&!!$(\'scoreBtn\')')
 ck('Defaults 16 Normal','Phase10.config.players===16&&Phase10.config.difficulty===\'normal\'')
 ck('Even teams 2',"(Phase10.setConfig({players:2}),playerTeam='CT',Phase10.counts().CT===1&&Phase10.counts().T===1&&Phase10.counts().botCount===1)")
 ck('Even teams 6',"(Phase10.setConfig({players:6}),Phase10.counts().CT===3&&Phase10.counts().T===3&&Phase10.counts().botCount===5)")
 ck('Odd teams 17 CT',"(Phase10.setConfig({players:17}),Phase10.counts().CT===9&&Phase10.counts().T===8&&Phase10.counts().botCount===16)")
 ck('Odd teams 17 T',"(playerTeam='T',Phase10.counts().T===9&&Phase10.counts().CT===8&&Phase10.counts().allies===8)")
 ck('Max clamp 32',"(Phase10.setConfig({players:100}),Phase10.config.players===32)")
 ck('Min clamp 2',"(Phase10.setConfig({players:0}),Phase10.config.players===2)")
 ck('Hard difficulty applies to config',"(Phase10.setConfig({players:24,difficulty:'hard'}),Phase10.config.difficulty==='hard')")
 ck('Invalid config rejection',"(Phase10.setConfig({difficulty:'cheat'}),Phase10.config.difficulty==='hard')")
 ck('Preview 24 players',"$('matchTeamPreview').textContent.includes('23 bots')")
 # Match screen workflow
 page.locator('#go').click()
 ck('Map screen opens',"!$('mapScreen').classList.contains('hidden')")
 page.locator('#continueMap').click()
 ck('Config screen before team',"!$('matchConfigScreen').classList.contains('hidden')&&$('teamScreen').classList.contains('hidden')")
 page.locator('#matchPlayers').fill('6');page.locator('#matchDifficulty').select_option('easy')
 ck('Arbitrary player count and difficulty from UI',"Phase10.config.players===6&&Phase10.config.difficulty==='easy'")
 page.locator('#continueMatchConfig').click();page.locator('[data-team="CT"]').click()
 ck('Choose class after match configuration',"!$('classScreen').classList.contains('hidden')")
 page.locator('#startMatch').click();page.wait_for_timeout(700)
 ck('Match started',"running===true&&round===1&&!!R")
 ck('6 players exactly, split 3v3',"bots.length===5&&bots.filter(x=>x.team==='CT').length===2&&bots.filter(x=>x.team==='T').length===3")
 ck('Both teams Easy',"bots.every(b=>b.skill===Phase10.profiles.easy)")
 ck('Bot objects have distinct roster IDs',"new Set(bots.map(b=>b.botId)).size===5")
 ck('Scoreboard supports both teams',"(setScoreboard(true),$('sbBody').querySelectorAll('.sb-compact-row').length===6&&$('sbBody').querySelectorAll('.sb-team-column').length===2)")
 ck('Scoreboard has correct headers',"$('scoreboard').querySelectorAll('.sb-team-column').length===2")
 ck('Mobile scoreboard button toggles',"($('scoreBtn').click(),sbOpen===false)")
 ck('Radio menu opens from button',"($('radioBtn').click(),!$('radioOverlay').classList.contains('hidden'))")
 ck('Radio attack command changes ally behavior',"(Phase10.command('attack'),bots.filter(b=>b.team==='CT').every(b=>b.radioOrder?.mode==='attack'))")
 ck('Radio attack not applied to enemy',"bots.filter(b=>b.team==='T').every(b=>!b.radioOrder)")
 ck('Command anchor fixed snapshot',"bots.filter(b=>b.team==='CT').every(b=>b.radioOrder.anchor!==P.pos)")
 ck('Radio menu is closed after a command',"$('radioOverlay').classList.contains('hidden')")
 # Simulate cooldown expiration and follow order
 ck('Follow command updates allied orders',"(Phase10.command('follow')===false,Phase10.getDebugState().orders===2)")
 ck('AI does not target invisible enemy (blocked LOS)',"(()=>{const b=bots.find(x=>x.team==='T');const old=window.los;window.los=()=>false;try{return !Phase10.seenEnemy(b,1)&&!b.visibleEnemy}finally{window.los=old}})()")
 ck('Bot death records deaths & scoreboard rows',"(()=>{const b=bots.find(x=>x.team==='T');b.hp=1;damageBot(b,5,'body',null,true);setScoreboard(true);return $('sbBody').querySelectorAll('.sb-compact-row').length===6&&$('sbBody').textContent.includes('DEAD')})()")
 ck('Muzzle FX and blood FX produce disposable sprites',"(()=>{Phase10.muzzlePlayer('usp');Phase10.muzzleBot(bots[0]);Phase10.bloodImpact(bots[0],bots[0].g.position.clone());return Phase10.getDebugState().fx===3})()")
 ck('FX cleanup releases sprites',"(Phase10.updateFX(2),Phase10.getDebugState().fx===0)")
 ck('Round regenerates roster for 2 players',"(Phase10.setConfig({players:2,difficulty:'hard'}),startRound(),bots.length===1&&bots[0].skill===Phase10.profiles.hard)")
 ck('2 players: one enemy CT/T',"bots[0].team!=='CT'&&Phase10.counts().botCount===1")
 ck('Can reconfigure to 24 per round',"(Phase10.setConfig({players:24}),startRound(),bots.length===23&&bots.filter(x=>x.team==='CT').length===11&&bots.filter(x=>x.team==='T').length===12)")
 ck('24 players exactly on scoreboard',"(setScoreboard(true),$('sbBody').querySelectorAll('.sb-compact-row').length===24)")
 ck('Odd count 31 on CT gives 16 vs 15',"(Phase10.setConfig({players:31}),Phase10.counts().CT===16&&Phase10.counts().T===15)")
 ck('Odd count 31 on T gives 15 vs 16',"(playerTeam='T',Phase10.counts().CT===15&&Phase10.counts().T===16)")
 ck('T team spawns exactly 5 bots for 6 players',"(Phase10.setConfig({players:6,difficulty:'normal'}),startRound(),bots.length===5&&bots.filter(b=>b.team==='T').length===2&&bots.filter(b=>b.team==='CT').length===3)")
 ck('Bot skills Normal for both teams',"bots.every(b=>b.skill===Phase10.profiles.normal)")
 ck('All bots use same health baseline',"bots.every(b=>b.hp===100)")
 ck('Actual enemy LOS blocked gives no sighting',"(()=>{const b=bots.find(x=>x.team==='CT');const enemy=bots.find(x=>x.team==='T');b.g.position.set(0,0,0);b.g.rotation.y=Math.PI;enemy.g.position.set(0,0,12);b.scanTimer=0;const original=los;try{los=()=>false;for(let i=0;i<6;i++)Phase10.seenEnemy(b,.4);return !b.visibleEnemy&&!b.lastSeen}finally{los=original}})()")
 ck('Hard detection requires reaction delay',"(()=>{Phase10.setConfig({difficulty:'hard'});const b=bots.find(x=>x.team==='CT');b.skill=Phase10.profiles.hard;b.scanTimer=0;b.seenId=null;b.noticeElapsed=0;const original=los;try{los=()=>true;const first=Phase10.seenEnemy(b,.1),next=Phase10.seenEnemy(b,.4);return first===null&&next!==null}finally{los=original}})()")
 ck('Bot HE creates projectile with ownership',"(()=>{const b=bots.find(x=>x.team==='CT'),target=b.g.position.clone().add(new THREE.Vector3(0,0,12));return Phase9.throwBotGrenade(b,target)&&Phase9.getDebugState().projectiles>=1})()")
 ck('Bot HE cleanup after fuse',"(Array.from({length:75},()=>Phase9.update(.025)),Phase9.getDebugState().projectiles===0)")
 ck('Bot sound and visuals are packaged',"true")
 page.evaluate('setScoreboard(false)')
 page.keyboard.press('z')
 ck('Z opens group radio',"!$('radioOverlay').classList.contains('hidden')&&$('radioCommands').children.length===9")
 page.keyboard.press('x')
 ck('X switches to team radio',"$('radioTitle').textContent.includes('TEAM ORDERS')")
 page.keyboard.press('c')
 ck('C switches to report radio',"$('radioTitle').textContent.includes('REPORTS')")
 page.keyboard.press('Escape')
 ck('Escape closes radio without pausing game',"$('radioOverlay').classList.contains('hidden')&&running===true")
 ck('No uncaught JS exceptions so far',"true")
 page.screenshot(path=str(out/'match-scoreboard-simulated.png'))
 report={'environment':'Chromium headless; about:blank inline scripts and styles; GPU renderer, GLTF loader and TextureLoader are STUBBED. Not real WebGL or physical iPhone Safari.','pass':sum(x['result']=='PASS' for x in checks),'fail':sum(x['result']!='PASS' for x in checks),'total':len(checks),'checks':checks,'js_errors':exceptions,'console_errors':console}
 (out/'simulation.json').write_text(json.dumps(report,indent=2,ensure_ascii=False))
 print('QA',report['pass'],'/',report['total'],'JS_ERRORS',exceptions[:6]);browser.close()
 if report['fail'] or exceptions:sys.exit(1)
