const {chromium}=require('playwright'),fs=require('fs');
(async()=>{
 fs.mkdirSync(process.env.QA_OUTPUT || 'qa/generated',{recursive:true});
 const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const p=await b.newPage({viewport:{width:844,height:390},hasTouch:true,isMobile:true});
 const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.route('**/cs_kvartal/sky/ft.png',route=>route.fulfill({status:404,body:'deliberate QA fixture'}));
 await p.goto((process.env.GAME_URL || 'http://localhost:8080/'));await p.click('#go');await p.click('[data-map="cs_kvartal"]');await p.click('#continueMap');await p.click('[data-team="CT"]');await p.click('#startMatch');await p.waitForSelector('#loadBack:not(.hidden)');
 const failed=await p.evaluate(()=>({message:$('loadStatus').textContent,blocked:!running,back:!$('loadBack').classList.contains('hidden')}));
 await p.screenshot({path:(process.env.QA_OUTPUT || 'qa/generated')+'/loading-error.png'});
 await p.unroute('**/cs_kvartal/sky/ft.png');await p.click('#loadBack');await p.click('#go');await p.click('#continueMap');await p.click('[data-team="CT"]');await p.click('#startMatch');await p.waitForFunction(()=>running);
 const recovered=await p.evaluate(()=>{const textures=new Set();S.traverse(o=>{for(const m of [].concat(o.material||[]))for(const k of ['map','lightMap'])if(m[k])textures.add(m[k])});return {running,textureCount:textures.size,ready:[...textures].every(t=>t.image&&((t.image.complete&&t.image.naturalWidth>0)||t.image.width>0))}});
 const report={failed,recovered,errors,pass:failed.blocked&&failed.back&&failed.message.includes('Tekstur map gagal dimuat')&&recovered.running&&recovered.ready&&!errors.length};
 fs.writeFileSync((process.env.QA_OUTPUT || 'qa/generated')+'/loading.json',JSON.stringify(report,null,2));await b.close();console.log(report);if(!report.pass)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
