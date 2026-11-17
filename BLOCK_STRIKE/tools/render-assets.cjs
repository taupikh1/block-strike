const {chromium}=require('playwright'),fs=require('fs');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage();await page.goto('http://localhost:8080/');
 const ids=process.argv.includes('--classes-only')?[]:fs.readdirSync('assets/models/world').map(x=>x.slice(0,-4));
 const basis=JSON.parse(fs.readFileSync('tools/icon-basis.json'));
 const output='assets/ui';fs.mkdirSync(output+'/icons',{recursive:true});fs.mkdirSync(output+'/classes',{recursive:true});
 for(const [kind,id] of [...ids.map(id=>['world',id]),...['gign','gsg9','sas','urban','arctic','guerilla','leet','terror'].map(id=>['class',id])]){
 const data=await page.evaluate(async({kind,id,basis})=>{
  const folder=kind==='class'?(['gign','gsg9','sas','urban'].includes(id)?'ct':'t'):'world';
  const g=await new Promise((ok,no)=>new THREE.GLTFLoader().load('assets/models/'+folder+'/'+id+'.glb',ok,undefined,no));
  if(kind==='class'){
   const id=folder==='ct'?'m4a1':'ak47';const held=await new Promise((ok,no)=>new THREE.GLTFLoader().load('assets/models/held/'+id+'.glb',ok,undefined,no));
   held.scene.traverse(o=>{if(o.isMesh){const bone=g.scene.getObjectByName((o.userData.attachBone||'').replace(/\s/g,'_'));if(bone)bone.add(o.clone())}});
  }
  const r=new THREE.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true});r.setSize(kind==='class'?300:320,kind==='class'?380:150);r.setClearColor(0,0);r.outputEncoding=THREE.sRGBEncoding;
  const scene=new THREE.Scene(),root=new THREE.Group();root.add(g.scene);scene.add(root);
  scene.add(new THREE.HemisphereLight(0xffffff,0x778899,1.5));const light=new THREE.DirectionalLight(0xffffff,1);light.position.set(1,3,5);scene.add(light);
  if(kind==='class'){const mixer=new THREE.AnimationMixer(g.scene);const clip=g.animations.find(c=>c.name==='idle1');if(clip)mixer.clipAction(clip).play();mixer.update(.3);root.rotation.y=Math.PI+.28;g.scene.traverse(o=>{if(o.isSkinnedMesh)o.frustumCulled=false})}
  else{const equipment=['assault','kevlar','backpack','flashbang','smokegrenade','hegrenade','thighpack','c4','shield'];if(equipment.includes(id)){root.rotation.z=-Math.PI/2;root.rotation.x=.12}else{root.applyMatrix4(new THREE.Matrix4().fromArray(basis[id]));const pivot=new THREE.Group();scene.remove(root);scene.add(pivot);pivot.add(root);if(['awp','m249'].includes(id))pivot.rotation.y=Math.PI;if(['p228','scout'].includes(id))pivot.rotation.x=Math.PI;if(id==='p90')pivot.rotation.x=Math.PI/2;if(id==='mac10')pivot.rotation.z=-Math.PI/4;}}
  scene.updateMatrixWorld(true);
  // Animated character bounds evaluated from skinning (Box3 uses bind-pose bounds in r128).
  let bounds=new THREE.Box3();const v=new THREE.Vector3();root.traverse(o=>{if(!o.isMesh)return;for(let i=0;i<o.geometry.attributes.position.count;i++){v.fromBufferAttribute(o.geometry.attributes.position,i);if(o.isSkinnedMesh)o.boneTransform(i,v);v.applyMatrix4(o.matrixWorld);bounds.expandByPoint(v)}});
  const center=bounds.getCenter(new THREE.Vector3()),size=bounds.getSize(new THREE.Vector3()),aspect=kind==='class'?300/380:320/150;
  const h=Math.max(size.y,size.x/aspect)*1.17;const camera=new THREE.OrthographicCamera(-h*aspect/2,h*aspect/2,h/2,-h/2,.01,1000);camera.position.set(center.x,center.y,center.z+100);camera.lookAt(center);r.render(scene,camera);
  const url=r.domElement.toDataURL();r.dispose();root.traverse(o=>{o.geometry?.dispose();[].concat(o.material||[]).forEach(m=>{m.map?.dispose();m.dispose()})});return url;
 },{kind,id,basis});
 const names={hegrenade:'he',flashbang:'flash',smokegrenade:'smoke',assault:'helmet',thighpack:'defuse'};
 fs.writeFileSync(output+'/'+(kind==='class'?'classes/':'icons/')+(names[id]||id)+'.png',Buffer.from(data.split(',')[1],'base64'));
 }
 await browser.close();console.log('Rendered icons and eight class portraits');
})();
