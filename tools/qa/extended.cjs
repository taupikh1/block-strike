const{chromium}=require('playwright'),fs=require('fs');
const dir=(process.env.QA_OUTPUT || 'qa/generated');fs.mkdirSync(dir+'/weapons',{recursive:true});const report={checks:[],errors:[],httpErrors:[]};
const check=(name,pass,details)=>{report.checks.push({name,status:pass?'PASS':'FAIL',details});console.log(pass?'PASS':'FAIL',name)};
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const p=await browser.newPage({viewport:{width:844,height:390},hasTouch:true,isMobile:true});
 p.on('pageerror',e=>report.errors.push(e.message));p.on('response',r=>{if(r.status()>=400)report.httpErrors.push([r.status(),r.url()])});
 await p.goto((process.env.GAME_URL || 'http://localhost:8080/'));await p.click('#go');await p.click('#continueMap');await p.click('[data-team="T"]');await p.click('[data-class="leet"]');await p.click('#startMatch');await p.waitForFunction(()=>running);await p.waitForTimeout(1200);
 check('T starts with Glock / Leet',await p.evaluate(()=>cur()==='glock18'&&playerClass==='leet'&&playerAvatar.name==='PLAYER_leet'));
 await p.screenshot({path:dir+'/glock-t-start.png'});
 // Deterministic fixtures supply money and pause enemies; transactions remain real DOM clicks.
 const purchases=[];
 for(const team of ['CT','T']){
  await p.evaluate(team=>{playerTeam=team;buyTime=15;money=16000;P.pos.set(0,0,team==='CT'?26:-26);bots.forEach(b=>b.cd=999)},team);
  await p.locator('#buybtn').tap();
  for(const tab of ['pistols','shotguns','smgs','rifles','machineguns','equipment']){
   await p.locator('[data-tab="'+tab+'"]').scrollIntoViewIfNeeded();await p.locator('[data-tab="'+tab+'"]').tap();
   const items=await p.locator('[data-item]').evaluateAll(es=>es.map(e=>e.dataset.item));
   for(const id of items){
    await p.evaluate(()=>{money=16000;renderBuyTab(activeBuyTab)});
    const el=p.locator('[data-item="'+id+'"]');if(await el.isDisabled())continue;
    await el.scrollIntoViewIfNeeded();await el.tap();
    purchases.push({team,id,...await p.evaluate(id=>({cash:money,ok:money===16000-getItem(id).price&&(W[id]?inventory.includes(id):true)}),id)});
   }
  }
  for(const id of ['primaryAmmo','secondaryAmmo']){
   await p.evaluate(id=>{const k=inventory.find(k=>W[k].slot===(id==='primaryAmmo'?'primary':'pistol'));A[k].res=0;money=16000},id);
   await p.locator('[data-tab="'+id+'"]').scrollIntoViewIfNeeded();await p.locator('[data-tab="'+id+'"]').tap();await p.locator('[data-item="'+id+'"]').tap();
   check(team+' '+id,await p.evaluate(id=>{const k=inventory.find(k=>W[k].slot===(id==='primaryAmmo'?'primary':'pistol'));return A[k].res===W[k].res&&money===16000-getItem(id).price},id));
  }
  check(team+' transaction guards',await p.evaluate(()=>{const old=money;const bad=purchase(playerTeam==='CT'?'ak47':'m4a1');buyTime=0;const expired=purchase('deagle');buyTime=15;return !bad&&!expired&&old===money}));
  await p.locator('#closeBuy2').tap();
 }
 check('All enabled items purchased through DOM',purchases.every(x=>x.ok),purchases);
 await p.evaluate(async()=>{await Promise.all(Object.keys(W).map(ensureWeaponModel));running=false;nightVision=false;document.body.classList.remove('night-vision');dmgA=0;$('dmg').style.opacity=0;$('msg').style.opacity=0;P.yaw=0;P.pitch=0;cam.position.set(0,1.6,26);cam.rotation.set(0,0,0);inventory=Object.keys(W);});
 const ids=await p.evaluate(()=>Object.keys(W)),models=[];
 for(const id of ids){
  const stats=await p.evaluate(id=>{
   inventory=[id,...(id==='knife'?[]:['knife'])];setW(0);playWeaponAnimation('idle');vm.userData.weaponAnimation.mixer.update(.3);viewScene.updateMatrixWorld(true);viewCamera.updateMatrixWorld(true);
   let total=0,inside=0;const v=V();vm.traverse(o=>{if(!o.isSkinnedMesh)return;for(let i=0;i<o.geometry.attributes.position.count;i+=3){v.fromBufferAttribute(o.geometry.attributes.position,i);o.boneTransform(i,v);v.applyMatrix4(o.matrixWorld).project(viewCamera);total++;if(Math.abs(v.x)<1&&Math.abs(v.y)<1&&Math.abs(v.z)<1)inside++}});
   return {id,total,inside,ratio:inside/total,skinned:!!vm.userData.weaponAnimation};
  },id);models.push(stats);await p.screenshot({path:dir+'/weapons/'+id+'.png'});
 }
 check('25 original viewmodels visible in gameplay',models.every(x=>x.ratio>.02&&x.skinned),models);
 const memory=await p.evaluate(()=>{inventory=Object.keys(W);const render=()=>{R.render(S,cam);R.clearDepth();R.render(viewScene,viewCamera)};for(let i=0;i<inventory.length;i++){setW(i);render()}const first={...R.info.memory};for(let c=0;c<3;c++)for(let i=0;i<inventory.length;i++){setW(i);vm.userData.weaponAnimation.mixer.update(.1);render()}return {first,last:{...R.info.memory},instances:Object.keys(weaponInstances).length}});
 check('75 switches after warmup: stable GPU allocations',memory.last.geometries===memory.first.geometries&&memory.last.textures===memory.first.textures,memory);
 const animations=await p.evaluate(()=>{const out=[];for(let i=0;i<inventory.length;i++){setW(i);playWeaponAnimation(cur()==='knife'?'attack':'fire');for(let t=0;t<150;t++)vm.userData.weaponAnimation.mixer.update(.016);out.push({id:cur(),kind:vm.userData.weaponAnimation.currentKind});}return out});
 check('Fire / knife clips return to idle',animations.every(x=>x.kind==='idle'),animations);
 for(const id of ['m3','xm1014']){
  const data=await p.evaluate(id=>{running=true;setW(inventory.indexOf(id));swapT=0;A[id]={mag:1,res:10};reload();let max=0,previous=1;for(let i=0;i<1000&&reloading;i++){vm.userData.weaponAnimation.mixer.update(.016);updateReload(.016);max=Math.max(max,A[id].mag-previous);previous=A[id].mag}running=false;return {mag:A[id].mag,res:A[id].res,max,done:!reloading}},id);
  check(id+' staged shell reload',data.mag===(id==='m3'?8:7)&&data.max===1&&data.done,data);
 }
 // Scope variants, including return to normal crosshair on a non-optic weapon.
 check('Scout/SG552/G3SG1/SG550 aim modes',await p.evaluate(()=>{running=true;for(const id of ['scout','sg552','g3sg1','sg550']){setW(inventory.indexOf(id));toggleAim();syncAim();const sniper=id!=='sg552';if(!aiming||vm.visible===sniper||$('cross').classList.contains('hidden')!==sniper)return false}setW(inventory.indexOf('usp'));toggleAim();syncAim();running=false;return !aiming&&!$('cross').classList.contains('hidden')}));
 // Combat fixtures place three different weapons on a clear line of sight.
 const audio=await p.evaluate(async()=>{
  const out=[];running=true;P.pos.set(0,0,26);P.hp=10000;armor=0;
  for(const [i,id] of ['ak47','m4a1','awp'].entries()){
   const b=bots[i],w=W[id];b.g.position.set(-2+i*2,0,24);b.team='T';Object.assign(b,{dead:0,weaponId:id,ammo:w.mag,damage:w.dmg*.38,accuracy:.6,effectiveRange:70});
   const hp=P.hp;for(let n=0;n<40;n++)botShot(b,{isP:true,pos:P.pos,dist:3});
   out.push({id,sound:b.lastShot?.sound,damage:b.lastShot?.damage,cooldown:b.lastShot?.cooldown,hit:hp>P.hp,decoded:!!originalAudio[w.sound],audioState:AC?.state});
  }running=false;return out;
 });check('Three bot weapons: sound selection / decoded playback / damage',audio.every(x=>x.hit&&x.decoded&&x.audioState==='running'&&x.sound&&x.damage>0),audio);
 const maps=[];
 for(const id of ['cs_kvartal','as_kvartal','es_kvartal','dust_block']){
  await p.evaluate(id=>{selectedMapId=id;playerTeam='CT';playerClass='gign';return beginMatch()},id);await p.waitForTimeout(1500);
  const initial=await p.evaluate(()=>({p:P.pos.toArray(),bots:bots.map(b=>b.g.position.toArray())}));
  const data=await p.evaluate(()=>{bots.forEach(b=>b.cd=999);for(let n=0;n<600;n++)bots.slice().forEach(b=>botUpdate(b,1/60));return {p:P.pos.toArray(),bots:bots.map(b=>({pos:b.g.position.toArray(),path:b.nav?.path?.length,weapon:b.weaponId,held:b.weaponModel?.length})),nav:NavGraph.graph()?.pos.length||0,col:!!window.bspCol,doors:BSPDoors.list().length,geometries:R.info.memory.geometries}});
  data.id=id;data.initial=initial;maps.push(data);
  check(id+' boot / finite spawn / clean nav state',await p.evaluate(id=>running&&P.pos.toArray().every(Number.isFinite)&&(id==='cs_kvartal'?!!NavGraph.graph():!NavGraph.graph())&&(id==='cs_kvartal'||id==='as_kvartal'?!!window.bspCol:!window.bspCol),id));
  check(id+' bot movement over 10 simulated seconds',data.bots.some((b,i)=>Math.hypot(b.pos[0]-initial.bots[i][0],b.pos[2]-initial.bots[i][2])>1),data);
  if(id==='cs_kvartal'){
   const image=await p.evaluate(()=>{S.updateMatrixWorld(true);R.render(S,cam);return R.domElement.toDataURL('image/png')});fs.writeFileSync(dir+'/battlefield.png',Buffer.from(image.split(',')[1],'base64'));
   await p.evaluate(()=>{const graph=NavGraph.graph();const ct=graph.spawns.find(x=>x.team==='CT'),t=graph.spawns.find(x=>x.team==='T');window.__navCheck={ct,t,keys:Object.keys(NavGraph)}});
   console.log('Nav metadata',await p.evaluate(()=>window.__navCheck));
  }
  await p.evaluate(()=>{running=false;dmgA=0;$('dmg').style.opacity=0;playWeaponAnimation('idle');vm.userData.weaponAnimation.mixer.update(.3)});await p.screenshot({path:dir+'/map-'+id+'.png'});
 }
 report.maps=maps;check('No JS errors',!report.errors.length,report.errors);check('No HTTP errors',!report.httpErrors.length,report.httpErrors);
 await browser.close();fs.writeFileSync(dir+'/extended.json',JSON.stringify(report,null,2));
})().catch(e=>{report.fatal=e.stack;fs.writeFileSync(dir+'/extended.json',JSON.stringify(report,null,2));console.error(e);process.exitCode=1});
