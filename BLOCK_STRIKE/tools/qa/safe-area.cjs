const{chromium,webkit}=require('playwright'),fs=require('fs');
(async()=>{
 fs.mkdirSync(process.env.QA_OUTPUT || 'qa/generated',{recursive:true});
 const report=[];
 for(const[name,type,options]of [['chromium',chromium,{executablePath:'/usr/bin/chromium',args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']}],['webkit',webkit,{headless:true}]]){
  const browser=await type.launch(options);
  for(const [width,height]of [[844,390],[740,360]]){
   const p=await browser.newPage({viewport:{width,height},hasTouch:true,isMobile:true});const errors=[];p.on('pageerror',e=>errors.push(e.message));
   await p.goto((process.env.GAME_URL || 'http://localhost:8080/'));await p.addStyleTag({content:':root{--safe-l:47px;--safe-r:47px;--safe-b:21px}'});
   const bounds=selector=>p.locator(selector).evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return {id:e.id||e.className,x:r.x,right:r.right,y:r.y,bottom:r.bottom,ok:r.x>=47-.01&&r.right<=innerWidth-47+.01&&r.y>=0&&r.bottom<=innerHeight-21+.01}}));
   await p.locator('#go').tap();const map=await bounds('#mapScreen .map-options,#mapScreen .map-actions,#mapScreen .team-title');
   await p.locator('#continueMap').tap();await p.locator('[data-team="CT"]').tap();const classes=await bounds('#classOptions,#classScreen .map-actions');await p.locator('#startMatch').tap();await p.waitForFunction(()=>running);
   await p.evaluate(()=>{bots.forEach(b=>b.cd=999);money=16000;buyTime=15});await p.locator('#buybtn').tap();await p.locator('[data-tab="rifles"]').tap();const buy=await bounds('.buy-window');
   await p.locator('[data-item="sg550"]').scrollIntoViewIfNeeded();await p.locator('[data-item="sg550"]').tap();const purchase=await p.evaluate(()=>inventory.includes('sg550')&&money===11800);
   await p.screenshot({path:(process.env.QA_OUTPUT || 'qa/generated')+'/safe-'+name+'-'+width+'x'+height+'-buy.png'});await p.locator('#closeBuy2').tap();const resumed=await p.evaluate(()=>running&&$('buyMenu').classList.contains('hidden'));
   const item={name,width,height,map,classes,buy,purchase,resumed,errors};item.pass=[...map,...classes,...buy].every(x=>x.ok)&&purchase&&resumed&&!errors.length;report.push(item);console.log(name,width,item.pass);await p.close();
  }await browser.close();
 }
 fs.writeFileSync((process.env.QA_OUTPUT || 'qa/generated')+'/safe-area.json',JSON.stringify(report,null,2));if(report.some(r=>!r.pass))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
