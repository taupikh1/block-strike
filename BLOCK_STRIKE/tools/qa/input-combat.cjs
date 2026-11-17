const{chromium}=require('playwright'),fs=require('fs');
(async()=>{
 fs.mkdirSync(process.env.QA_OUTPUT || 'qa/generated',{recursive:true});
 const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const c=await b.newContext({viewport:{width:844,height:390},hasTouch:true,isMobile:true});const p=await c.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto((process.env.GAME_URL || 'http://localhost:8080/'));await p.click('#go');await p.click('#continueMap');await p.click('[data-team="CT"]');await p.click('#startMatch');await p.waitForFunction(()=>running);await p.evaluate(()=>bots.forEach(b=>b.cd=999));
 const cdp=await c.newCDPSession(p),touch=(type,points)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:points});const before=await p.evaluate(()=>P.pos.toArray());
 await touch('touchStart',[{x:110,y:250}]);await touch('touchMove',[{x:160,y:250}]);await p.waitForFunction(start=>P.pos.distanceTo(V(...start))>.2,before);await touch('touchEnd',[]);
 const movement=await p.evaluate(start=>({distance:P.pos.distanceTo(V(...start)),released:jx===0&&jy===0&&jid===null}),before);
 const aimBefore=await p.evaluate(()=>({yaw:P.yaw,pitch:P.pitch,ammo:A[cur()].mag}));await touch('touchStart',[{x:460,y:150}]);await touch('touchMove',[{x:505,y:175}]);await touch('touchEnd',[]);
 const look=await p.evaluate(s=>({moved:P.yaw!==s.yaw&&P.pitch!==s.pitch,noFire:A[cur()].mag===s.ammo,released:lid===null}),aimBefore);
 const combat=await p.evaluate(()=>{
  running=false;P.pos.set(0,0,26);P.hp=10000;armor=0;const bot=bots[0];bot.team='T';bot.dead=0;bot.g.position.set(0,0,16);bot.weaponId='ak47';bot.ammo=30;bot.damage=W.ak47.dmg*.38;bot.accuracy=.6;bot.effectiveRange=70;
  const wall=new THREE.Mesh(new THREE.BoxGeometry(5,4,1),new THREE.MeshBasicMaterial());wall.position.set(0,2,21);S.add(wall);obsM.push(wall);S.updateMatrixWorld(true);const hp=P.hp;
  for(let i=0;i<20;i++)botShot(bot,{pos:P.pos,isP:true,dist:10});const blocked=bot.ammo===30&&P.hp===hp&&!los(bot,P.pos);obsM.splice(obsM.indexOf(wall),1);S.remove(wall);wall.geometry.dispose();wall.material.dispose();
  const cadence=[];for(const id of ['ak47','m4a1','awp']){
   const w=W[id];bot.g.position.set(-2,0,24);Object.assign(bot,{weaponId:id,ammo:w.mag,damage:w.dmg*.38,fireRate:w.rate,accuracy:.6,effectiveRange:70,cd:0,burst:0,los:true,losT:99});S.updateMatrixWorld(true);let last=bot.ammo;const shots=[];
   for(let i=0;i<360;i++){botUpdate(bot,1/120);if(bot.ammo<last)shots.push(i/120);last=bot.ammo}
   cadence.push({id,rate:w.rate,shots,minInterval:shots.length>1?Math.min(...shots.slice(1).map((t,i)=>t-shots[i])):null,pass:shots.length>=2&&shots.every((t,i)=>i===0||t-shots[i-1]+.0001>=w.rate-1/120)});
  }return {blocked,cadence};
 });const report={movement,look,combat,errors};report.pass=movement.distance>.2&&movement.released&&Object.values(look).every(Boolean)&&combat.blocked&&combat.cadence.every(r=>r.pass)&&!errors.length;
 fs.writeFileSync((process.env.QA_OUTPUT || 'qa/generated')+'/input-combat.json',JSON.stringify(report,null,2));await b.close();console.log(report);if(!report.pass)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
