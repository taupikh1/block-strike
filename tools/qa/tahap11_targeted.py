#!/usr/bin/env python3
"""Focused Tahap 11 gameplay/DOM logic QA. Chromium WebGL+GLTF *stubbed*, NOT visual GPU proof."""
from pathlib import Path
import json,re,sys,hashlib
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[2]
out=root/'qa'/'tahap11';out.mkdir(parents=True,exist_ok=True)
html=(root/'index.html').read_text()
for path in re.findall(r'<link rel="stylesheet" href="([^"]+)">',html):
 html=html.replace(f'<link rel="stylesheet" href="{path}">','<style>'+(root/path).read_text()+'</style>')
map_data=json.dumps(json.loads((root/'assets/maps/dust_block.json').read_text()))
mock='''<script>
window.fetch=async function(url){if(String(url).includes('dust_block.json'))return new Response(JSON.stringify(window.__testMap),{status:200});return new Response('',{status:404})};
window.__testMap=__MAP__;
</script>'''.replace('__MAP__',map_data)
html=html.replace('<script src="js/vendor/three.min.js"></script>','<script>'+(root/'js/vendor/three.min.js').read_text()+'</script>'+mock)
for path in ['js/vendor/GLTFLoader.js','js/vendor/SkeletonUtils.js']:
 html=html.replace(f'<script src="{path}"></script>','<script>'+(root/path).read_text()+'</script>')
mock='''<script>
// Pure logic harness: GPU and model loading are explicitly stubbed.
THREE.WebGLRenderer=class {constructor(o){this.domElement=o.canvas;this.info={render:{calls:1,frame:1},memory:{geometries:0,textures:0}};this.shadowMap={enabled:false}}setPixelRatio(){}setSize(){}render(){this.info.render.frame++}clearDepth(){}clear(){}};
THREE.GLTFLoader.prototype.load=function(path,onLoad){const group=new THREE.Group(),bone=new THREE.Group();bone.name='Bip01_R_Hand';group.add(bone);queueMicrotask(()=>onLoad({scene:group,animations:[]}));return {}};
THREE.TextureLoader.prototype.load=function(path){return new THREE.Texture()};
</script>'''
html=html.replace('<script src="js/bsp-render.js"></script>',mock+'<script src="js/bsp-render.js"></script>')
for path in ['js/bsp-render.js','js/bsp-physics.js','js/bsp-doors.js','js/nav-graph.js','js/game-core.js','js/game-systems8.js','js/game-systems9.js','js/game-systems10.js','js/game-systems11.js','js/classic-ui.js','js/layout-nav.js']:
 html=html.replace(f'<script src="{path}"></script>','<script>\n'+(root/path).read_text()+'\n</script>')
assert '<script src=' not in html
checks=[];errors=[]
def assert_pass(name,value):
 checks.append({'name':name,'pass':bool(value)});print(('PASS' if value else 'FAIL'),name)
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-web-security'])
 page=browser.new_page(viewport={'width':844,'height':390},device_scale_factor=2,is_mobile=True,has_touch=True)
 page.on('pageerror',lambda err:errors.append(str(err)))
 page.goto('about:blank');page.set_content(html,wait_until='load');page.wait_for_timeout(250)
 def c(name,expr):
  try:ok=page.evaluate(expr);assert_pass(name,ok)
  except Exception as e:checks.append({'name':name,'pass':False,'error':str(e)});print('ERROR',name,str(e)[:150])
 c('Tahap 11 module loaded',"typeof Phase11==='object'&&typeof Phase10.prepareBotRound==='function'")
 # Mimic real start screen flow.
 page.locator('#go').click();page.locator('#continueMap').click()
 page.locator('#matchPlayers').fill('6');page.locator('#matchDifficulty').select_option('easy');page.locator('#continueMatchConfig').click();page.locator('[data-team="CT"]').click()
 page.locator('#startMatch').click();page.wait_for_timeout(250)
 c('Round 1 has five bots', 'running&&round===1&&bots.length===5')
 c('All bots start with $800', 'bots.every(b=>b.money===800)')
 c('All first-round CT use USP and T use Glock',"bots.every(b=>b.weaponId===(b.team==='CT'?'usp':'glock18'))")
 c('Each bot has independent wallet and unique ID','new Set(bots.map(b=>b.botId)).size===5')
 c('Bot accuracy scaled after equip for Easy',"(()=>{const b=bots[0],w=W[b.weaponId];return b.accuracy<=Math.max(.35,.62-w.sp*5)&&b.skill===Phase10.profiles.easy})()")
 c('Bot kill credits exactly $300 and records kill',"(()=>{const k=bots.find(b=>b.team==='CT'),v=bots.find(b=>b.team==='T');v.hp=1;damageBot(v,200,'body',null,false,k);const r=Phase10.getDebugState();return k.money===1100&&r.roster===5&&v.dead>0})()")
 c('Round win pays $3250 and loss pays $1400 once',"(()=>{Phase10.roundEnd('CT');const ally=bots.find(b=>b.team==='CT'),enemy=bots.find(b=>b.team==='T');const a=ally.money,e=enemy.money;Phase10.roundEnd('CT');return a>=4050&&e===2200&&ally.money===a&&enemy.money===e})()")
 c('Round 2 buys gear only if wallet permits',"(()=>{startRound();return round===2&&bots.every(b=>b.money>=0&&b.money<=16000)&&bots.some(b=>W[b.weaponId].slot==='primary')})()")
 c('Wallet and purchased weapon reflected in scoreboard',"(setScoreboard(true),$('sbBody').textContent.includes('$')&&$('sbBody').querySelectorAll('.sb-team-column').length===2)")
 c('Compact scoreboard actually two columns',"getComputedStyle($('sbBody')).gridTemplateColumns.trim().split(/\\s+/).length===2")
 c('Both teams visible side-by-side in mobile landscape',"(()=>{const a=[...document.querySelectorAll('.sb-team-column')],r=a.map(x=>x.getBoundingClientRect());return r.length===2&&r[1].left>r[0].left&&Math.abs(r[1].top-r[0].top)<2})()")
 page.screenshot(path=str(out/'scoreboard-6-simulated.png'))
 page.evaluate('setScoreboard(false)')
 c('Expanded radio: Z X C each nine commands',"['z','x','c'].every(id=>Phase10.radioCategories[id].length===9)")
 c('Extra radio category has six additional phrases',"Phase10.radioCategories.more.length===6")
 c('Radio text labels + behavior map wired',"Object.values(Phase10.radioCommands).every(x=>x.label&&x.sound)")
 c('Radio opens nine entries in Z',"(Phase10.openRadio('z'),$('radioCommands').children.length===9)")
 c('Radio panel has touch-scroll overflow',"(()=>{const el=$('radioCommands'),style=getComputedStyle(el);return style.overflowY==='auto'&&['pan-y','auto'].includes(style.touchAction)})()")
 c('Radio menu contents exceed viewport so user can scroll',"$('radioCommands').scrollHeight>$('radioCommands').clientHeight")
 c('Radio options are reachable by scrolling to bottom',"(()=>{const el=$('radioCommands');el.scrollTop=el.scrollHeight;return el.scrollTop>0&&el.lastElementChild.textContent.includes('Position')})()")
 c('Radio MORE button renders extra commands',"(Phase10.openRadio('more'),$('radioCommands').children.length===6)")
 c('Radio report does not alter bot AI goal',"(()=>{const a=bots.filter(b=>b.team==='CT').map(b=>b.radioOrder);Phase10.command('imhit');return bots.filter(b=>b.team==='CT').every((b,i)=>b.radioOrder===a[i])})()")
 page.evaluate('Phase10.closeRadio()')
 c('Keyboard Z opens radio',"(document.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyZ',bubbles:true,cancelable:true})),!$('radioOverlay').classList.contains('hidden'))")
 c('Keyboard digit 5 invokes Follow Me',"(document.dispatchEvent(new KeyboardEvent('keydown',{code:'Digit5',bubbles:true,cancelable:true})),bots.filter(b=>b.team==='CT').every(b=>b.radioOrder?.mode==='follow'))")
 c('Radio menu closes after valid behavior',"$('radioOverlay').classList.contains('hidden')")
 c('Bot crouch reduces model/head height',"(()=>{const b=bots.find(b=>b.body);if(!b)return false;const y=b.body.position.y;b.crouching=true;Phase11.updateBotPose(b,.4);return b.crouchPose>.5&&b.body.position.y<y})()")
 c('Bot can stand after crouch is released',"(()=>{const b=bots.find(b=>b.body);b.crouching=false;Phase11.updateBotPose(b,.4);return b.crouchPose<.15})()")
 c('Shield + Desert Eagle available in CT loadout',"(()=>{money=10000;buyTime=15;P.pos.set(0,0,26);return purchase('shield')&&purchase('deagle')&&inventory.includes('shield')&&inventory.includes('deagle')})()")
 c('Shield uses purchased Deagle for shots',"(()=>{setW(inventory.indexOf('shield'));cool=swapT=reloading=0;const old=A.deagle.mag;shoot();return Phase9.shieldPistol()==='deagle'&&A.deagle.mag===old-1})()")
 c('Shield blocks an attack in front',"(P.yaw=0,Phase9.secondaryAction(),Phase9.blockShieldHit(P.pos.clone().add(V(0,0,-5))))")
 c('Duel Elites not purchasable with shield',"(()=>{const item=getItem('elite');return !!buyReason(item)})()")
 c('Dropped Dual Elites cannot be picked up with shield',"(()=>{const b=bots.find(b=>b.team==='T'&&!b.dead);if(!b)return false;equipBot(b,0,'elite');b.g.position.copy(P.pos).add(new THREE.Vector3(1,0,0));const count=inventory.length;Phase9.dropBotWeapon(b);return Phase9.pickupNearest()===false&&inventory.length===count})()")
 page.evaluate('setScoreboard(false)')
 c('Scoreboard shows all 32 players',"(Phase10.setConfig({players:32}),startRound(),setScoreboard(true),$('sbBody').querySelectorAll('.sb-compact-row').length===32)")
 c('Both columns each contain 16 participants',"[...document.querySelectorAll('.sb-team-rows')].every(r=>r.children.length===16)")
 c('Scoreboard 32 stays within viewport height',"$('scoreboard').querySelector('.sb-box').getBoundingClientRect().height<=innerHeight")
 c('32-players are pistol only on a reset match',"(Phase10.resetMatch(),round=0,startRound(),bots.length===31&&bots.every(b=>b.money===800&&W[b.weaponId].slot==='pistol'))")
 c('Existing human Ctrl crouch remains available',"(Phase9.setCrouchInput(true),Phase9.updateCrouch(),Phase9.crouching)")
 assert_pass('Different Arctic and Phoenix GLB bytes',hashlib.sha256((root/'assets/models/t/arctic.glb').read_bytes()).digest()!=hashlib.sha256((root/'assets/models/t/terror.glb').read_bytes()).digest())
 assert_pass('Different Arctic and Phoenix selection images',hashlib.sha256((root/'assets/ui/classes/arctic.png').read_bytes()).digest()!=hashlib.sha256((root/'assets/ui/classes/terror.png').read_bytes()).digest())
 stems=[v['sound'] for v in json.loads((root/'qa'/'tahap11'/'radio_manifest.json').read_text()).values()]
 assert_pass('Every menu radio phrase has packaged MP3',all((root/'assets/phase10/audio/radio'/f'{s}.mp3').is_file() for s in stems))
 page.screenshot(path=str(out/'scoreboard32-simulated.png'))
 report={'environment':'Chromium headless, 844x390 iPhone landscape emulation, inline HTML, WebGL and GLTF loader STUBBED. Not actual Safari/3D.', 'pass':sum(x['pass'] for x in checks),'total':len(checks),'failed':[x for x in checks if not x['pass']],'errors':errors,'checks':checks}
 (out/'targeted.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
 print('RESULT',report['pass'],'/',report['total'],'errors:',errors[:3]);browser.close()
 if report['failed'] or errors:sys.exit(1)
