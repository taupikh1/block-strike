const{chromium,webkit}=require('playwright'),fs=require('fs');const out=(process.env.QA_OUTPUT || 'qa/generated'),report=[];
(async()=>{
 fs.mkdirSync(out,{recursive:true});
for(const [name,type,options] of [['chromium',chromium,{executablePath:'/usr/bin/chromium',args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']}],['webkit',webkit,{headless:true}]]){
 const browser=await type.launch(options),page=await browser.newPage({viewport:{width:844,height:390},hasTouch:true,isMobile:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto((process.env.GAME_URL || 'http://localhost:8080/'));await page.screenshot({path:out+'/final-'+name+'-main.png'});await page.click('#go');await page.screenshot({path:out+'/final-'+name+'-maps.png'});
 await page.click('[data-map="cs_kvartal"]');await page.click('#continueMap');await page.click('[data-team="CT"]');await page.click('[data-class="gign"]');await page.click('#startMatch');await page.waitForFunction(()=>running);
 const maps=[];
 for(const id of ['cs_kvartal','as_kvartal','es_kvartal','dust_block']){
  if(id!=='cs_kvartal')await page.evaluate(id=>{selectedMapId=id;return beginMatch()},id);await page.waitForFunction(()=>running);await page.waitForTimeout(600);
  const info=await page.evaluate(()=>{bots.forEach(b=>b.cd=999);return {id:activeMapData.id,spawn:P.pos.toArray(),graph:!!NavGraph.graph(),bsp:!!window.bspCol,playerClass:playerAvatar.name}});maps.push(info);
  if(name==='chromium'&&id==='es_kvartal'){
   info.route=await page.evaluate(()=>{const bot=bots.find(b=>b.team!==playerTeam);const start=bot.g.position.clone();for(let t=0;t<3600;t++)botUpdate(bot,1/60);return {start:start.toArray(),end:bot.g.position.toArray(),moved:start.distanceTo(bot.g.position),distanceToPlayer:bot.g.position.distanceTo(P.pos)}});
  }
  const frame=await page.evaluate(()=>{running=false;bots.forEach(b=>{setAnim(b,'idle1');b.mixer?.update(.4)});playWeaponAnimation('idle');vm.userData.weaponAnimation.mixer.update(.4);return R.info.render.frame});
  await page.waitForFunction(frame=>R.info.render.frame>frame+4,frame);await page.screenshot({path:out+'/final-'+name+'-'+id+'.png'});
  if(name==='chromium'&&id==='cs_kvartal'){
   const url=await page.evaluate(()=>{R.render(S,cam);return R.domElement.toDataURL()});fs.writeFileSync(out+'/battlefield.png',Buffer.from(url.split(',')[1],'base64'));
  }
 }
 const guards=await page.evaluate(()=>{running=true;buyTime=15;money=16000;P.pos.set(0,0,26);grenades.he=1;const before=money;const cap=!purchase('he');const owned=!purchase('usp');P.pos.z=0;const zone=!purchase('deagle');P.pos.z=26;const voices=activeVoices.size<=16;return {cap,owned,zone,unchanged:money===before,voices}});
 await page.addStyleTag({content:':root{--safe-l:47px;--safe-r:47px;--safe-b:21px}'});
 const safe=await page.evaluate(()=>[...document.querySelectorAll('.btn')].filter(e=>getComputedStyle(e).display!=='none').every(e=>{const r=e.getBoundingClientRect();return r.x>=47&&r.right<=innerWidth-47&&r.bottom<=innerHeight-21}));
 await page.waitForFunction(()=>swapT<=0);await page.locator('#fire').tap();await page.waitForTimeout(100);const fire=await page.evaluate(()=>A.usp.mag<12);
 const diagnostics=await page.evaluate(()=>{const gl=R.getContext(),ext=gl.getExtension('WEBGL_debug_renderer_info');return {renderer:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER),memory:R.info.memory,drawCalls:R.info.render.calls,heap:performance.memory?.usedJSHeapSize,audio:AC.state}});
 report.push({name,maps,guards,safe,fire,errors,diagnostics});await browser.close();console.log(name,{guards,safe,fire,errors});
}
fs.writeFileSync(out+'/final-smoke.json',JSON.stringify(report,null,2));
if(!report.every(r=>r.safe&&r.fire&&!r.errors.length&&Object.values(r.guards).every(Boolean)&&r.maps.length===4&&r.maps.every(m=>m.spawn.every(Number.isFinite))))throw new Error('Final smoke failed: inspect final-smoke.json');
})().catch(e=>{console.error(e);process.exitCode=1});
