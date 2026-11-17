const {webkit:chromium}=require('playwright'),fs=require('fs'),assert=require('assert');
const dir=(process.env.QA_OUTPUT || 'qa/generated-webkit');fs.mkdirSync(dir,{recursive:true});
const result={date:new Date().toISOString(),browser:'WebKit Linux',checks:[],errors:[],httpErrors:[]};
const check=(name,pass,details)=>{result.checks.push({name,status:pass?'PASS':'FAIL',details});if(!pass)console.log('FAIL',name,details)};
(async()=>{
 const browser=await chromium.launch({headless:true});
 for(const size of [[844,390]]){
  const label=size.join('x'),mobile=size[0]<1000;
  const context=await browser.newContext({viewport:{width:size[0],height:size[1]},hasTouch:mobile,isMobile:mobile,deviceScaleFactor:1});
  const p=await context.newPage();p.on('pageerror',e=>result.errors.push({label,error:e.message}));p.on('response',r=>{if(r.status()>=400)result.httpErrors.push({label,url:r.url(),status:r.status()})});
  await p.goto((process.env.GAME_URL || 'http://localhost:8080/'));await p.waitForTimeout(300);
  await p.screenshot({path:dir+'/'+label+'-main.png'});
  const click=async s=>{if(!mobile&&['#buybtn','#pauseBtn'].includes(s)){await p.evaluate(()=>{if(document.pointerLockElement)document.exitPointerLock()});await p.waitForTimeout(100)}return mobile?p.locator(s).tap():p.locator(s).click()};
  await click('#settingsBtn');await p.selectOption('#q','0');await click('[data-close="settingsScreen"]');
  await click('#creditsBtn');await click('[data-close="creditsScreen"]');
  await click('#go');await click('#continueMap');await click('[data-team="CT"]');await click('[data-class="sas"]');
  await p.screenshot({path:dir+'/'+label+'-class.png'});await click('#startMatch');
  await p.waitForFunction(()=>running&&vm?.userData.weaponAnimation);const bootFrame=await p.evaluate(()=>R.info.render.frame);await p.waitForFunction(f=>R.info.render.frame>f+4,bootFrame);await p.waitForTimeout(1200);
  check(label+' boot / selected class',await p.evaluate(()=>cur()==='usp'&&playerClass==='sas'&&playerAvatar.name==='PLAYER_sas'));
  // Isolate UI transactions from combat during interaction tests; map/nav tested separately.
  await p.evaluate(()=>{bots.forEach(b=>{b.cd=999});buyTime=15;money=16000;P.hp=100;hud()});
  await p.screenshot({path:dir+'/'+label+'-usp.png'});
  await click('#buybtn');await click('[data-tab="rifles"]');
  const before=await p.evaluate(()=>({yaw:P.yaw,mag:A[cur()].mag}));
  await p.locator('#buyItems').evaluate(e=>e.scrollTop=e.scrollHeight);
  await p.locator('[data-item="sg550"]').scrollIntoViewIfNeeded();
  check(label+' last rifle reachable',await p.locator('[data-item="sg550"]').isVisible());
  check(label+' overlay blocks aim/fire',await p.evaluate(before=>P.yaw===before.yaw&&A[cur()].mag===before.mag,before));
  await p.screenshot({path:dir+'/'+label+'-buy.png'});
  await p.locator('[data-item="awp"]').scrollIntoViewIfNeeded();await click('[data-item="awp"]');
  check(label+' purchase updates cash/inventory',await p.evaluate(()=>money===11250&&inventory.includes('awp')));
  await click('#closeBuy2');await p.waitForFunction(()=>vm?.userData.weaponAnimation&&!!weaponModels.awp);await p.waitForTimeout(1000);
  if(mobile)await click('#ads');else await p.keyboard.press('v');await p.waitForFunction(()=>cam.fov<26);
  check(label+' AWP scope + hidden viewmodel',await p.evaluate(()=>aiming&&cam.fov<26&&!vm.visible&&!$('scopeOverlay').classList.contains('hidden')));
  const center=await p.locator('.scope-ring').evaluate(el=>{const b=el.getBoundingClientRect();return [b.x+b.width/2,b.y+b.height/2]});check(label+' reticle centered',Math.abs(center[0]-size[0]/2)<1&&Math.abs(center[1]-size[1]/2)<1,center);
  await p.screenshot({path:dir+'/'+label+'-awp-scope.png'});
  if(mobile)await click('#ads');else await p.keyboard.press('v');await p.waitForFunction(()=>cam.fov<12);check(label+' second AWP zoom',await p.evaluate(()=>zoomIdx===1&&cam.fov<12));
  if(mobile)await click('#swap');else await p.keyboard.press('1');await p.waitForTimeout(500);check(label+' scope reset on switch',await p.evaluate(()=>!aiming&&cam.fov===72&&vm.visible&&$('scopeOverlay').classList.contains('hidden')));
  await p.evaluate(()=>{buyTime=15;money=16000;P.pos.set(0,0,26)});await click('#buybtn');await click('[data-tab="rifles"]');await p.locator('[data-item="aug"]').scrollIntoViewIfNeeded();await click('[data-item="aug"]');await click('#closeBuy2');await p.waitForTimeout(1300);
  if(mobile)await click('#ads');else await p.keyboard.press('v');await p.waitForFunction(()=>cam.fov<44&&swapT<=0);
  check(label+' AUG zoom preserves crosshair/viewmodel',await p.evaluate(()=>aiming&&cam.fov<44&&vm.visible&&!$('cross').classList.contains('hidden')&&$('scopeOverlay').classList.contains('hidden')));
  await p.screenshot({path:dir+'/'+label+'-aug.png'});
  if(mobile)await click('#fire');else{await p.evaluate(()=>{if(document.pointerLockElement)document.exitPointerLock()});await p.mouse.click(size[0]/2,size[1]/2)}
  await p.waitForTimeout(300);check(label+' firing consumes ammunition',await p.evaluate(()=>A.aug.mag<30));
  if(mobile)await click('#rel');else await p.keyboard.press('r');await p.waitForFunction(()=>reloading===0,{timeout:30000});check(label+' reload completes',await p.evaluate(()=>A.aug.mag===30&&reloading===0));
  await p.evaluate(()=>startRound());check(label+' round reset',await p.evaluate(()=>!aiming&&$('scopeOverlay').classList.contains('hidden')&&bots.length===6));
  await click('#pauseBtn');await click('#resumeBtn');check(label+' resume',await p.evaluate(()=>running));
  const bounds=await p.evaluate(()=>[...document.querySelectorAll('.btn')].filter(e=>getComputedStyle(e).display!=='none').map(e=>{const r=e.getBoundingClientRect();return {id:e.id,x:r.x,y:r.y,w:r.width,h:r.height}}));
  check(label+' touch controls inside viewport',bounds.every(b=>b.x>=0&&b.y>=0&&b.x+b.w<=size[0]&&b.y+b.h<=size[1]),bounds);
  if(mobile){const overlaps=[];for(let i=0;i<bounds.length;i++)for(let j=i+1;j<bounds.length;j++){let a=bounds[i],b=bounds[j];if(a.x<b.x+b.w&&b.x<a.x+a.w&&a.y<b.y+b.h&&b.y<a.y+a.h)overlaps.push([a.id,b.id])}check(label+' touch controls do not overlap',!overlaps.length,overlaps)}
  check(label+' no document scroll',await p.evaluate(()=>document.documentElement.scrollWidth===innerWidth&&document.documentElement.scrollHeight===innerHeight));
  await context.close();console.log('Finished',label);
 }
 await browser.close();
 check('No uncaught JavaScript errors',!result.errors.length,result.errors);check('No HTTP errors',!result.httpErrors.length,result.httpErrors);
 fs.writeFileSync(dir+'/regression.json',JSON.stringify(result,null,2));console.log('Results',result.checks.length,'failures',result.checks.filter(c=>c.status==='FAIL').length);
})().catch(e=>{result.fatal=String(e.stack);fs.writeFileSync(dir+'/regression.json',JSON.stringify(result,null,2));console.error(e);process.exitCode=1});
