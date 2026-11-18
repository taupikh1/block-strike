// Original playable core (will be gradually moved into modules)\n
const $=id=>document.getElementById(id), rnd=Math.random, isT=('ontouchstart' in window)||navigator.maxTouchPoints>0;
if(!isT)document.body.classList.add('pc');
const W={
 usp:{n:'USP',dmg:34,rate:.17,mag:12,res:100,rl:2.2,rec:.012,auto:false,sp:.006,len:.34,col:0x41464c,price:500,slot:'pistol',sound:'usp1.wav'},
 glock18:{n:'GLOCK 18',dmg:25,rate:.15,mag:20,res:120,rl:2.2,rec:.014,auto:false,sp:.009,len:.34,col:0x33383d,price:400,slot:'pistol',sound:'glock18-1.wav'},
 p228:{n:'P228',dmg:32,rate:.17,mag:13,res:52,rl:2.2,rec:.014,auto:false,sp:.008,len:.34,col:0x5b6065,price:600,slot:'pistol',sound:'p228-1.wav'},
 deagle:{n:'DESERT EAGLE',dmg:54,rate:.24,mag:7,res:35,rl:2.2,rec:.028,auto:false,sp:.014,len:.38,col:0x77716a,price:650,slot:'pistol',sound:'deagle-1.wav'},
 elite:{n:'DUAL ELITES',dmg:25,rate:.13,mag:30,res:120,rl:3.8,rec:.018,auto:false,sp:.014,len:.38,col:0x8a7656,price:800,slot:'pistol',sound:'elite_fire.wav',team:'T'},
 fiveseven:{n:'FIVE-SEVEN',dmg:27,rate:.15,mag:20,res:100,rl:2.2,rec:.012,auto:false,sp:.007,len:.36,col:0x6d747b,price:750,slot:'pistol',sound:'fiveseven-1.wav',team:'CT'},
 mac10:{n:'MAC-10',dmg:29,rate:.075,mag:30,res:100,rl:2.6,rec:.02,auto:true,sp:.03,len:.48,col:0x34383a,price:1400,slot:'primary',sound:'mac10-1.wav',team:'T'},
 tmp:{n:'TMP',dmg:20,rate:.07,mag:30,res:120,rl:2.1,rec:.012,auto:true,sp:.018,len:.5,col:0x41484d,price:1250,slot:'primary',sound:'tmp-1.wav',team:'CT'},
 mp5:{n:'MP5 NAVY',dmg:26,rate:.075,mag:30,res:120,rl:2.1,rec:.012,auto:true,sp:.014,len:.55,col:0x3a4248,price:1500,slot:'primary',sound:'mp5-1.wav'},
 ump45:{n:'UMP-45',dmg:30,rate:.09,mag:25,res:100,rl:2.3,rec:.016,auto:true,sp:.016,len:.58,col:0x454b4f,price:1700,slot:'primary',sound:'ump45-1.wav'},
 p90:{n:'P90',dmg:21,rate:.067,mag:50,res:100,rl:3.0,rec:.013,auto:true,sp:.018,len:.62,col:0x48515a,price:2350,slot:'primary',sound:'p90-1.wav'},
 galil:{n:'GALIL',dmg:30,rate:.10,mag:35,res:90,rl:2.45,rec:.014,auto:true,sp:.012,len:.78,col:0x4b5140,price:2000,slot:'primary',sound:'galil-1.wav',team:'T'},
 ak47:{n:'AK-47',dmg:36,rate:.10,mag:30,res:90,rl:2.45,rec:.018,auto:true,sp:.014,len:.82,col:0x4b4839,price:2500,slot:'primary',sound:'ak47-1.wav',team:'T'},
 famas:{n:'FAMAS',dmg:30,rate:.09,mag:25,res:90,rl:3.3,rec:.014,auto:true,sp:.012,len:.78,col:0x42483f,price:2250,slot:'primary',sound:'famas-1.wav',team:'CT'},
 m4a1:{n:'M4A1',dmg:33,rate:.09,mag:30,res:90,rl:2.35,rec:.012,auto:true,sp:.009,len:.84,col:0x3c463c,price:3100,slot:'primary',sound:'m4a1-1.wav',team:'CT'},
 aug:{n:'AUG',dmg:32,rate:.09,mag:30,res:90,rl:3.3,rec:.012,auto:true,sp:.009,len:.88,col:0x4d5547,price:3500,slot:'primary',sound:'aug-1.wav',team:'CT'},
 sg552:{n:'SG-552',dmg:33,rate:.09,mag:30,res:90,rl:2.8,rec:.014,auto:true,sp:.011,len:.86,col:0x494e40,price:3500,slot:'primary',sound:'sg552-1.wav',team:'T'},
 scout:{n:'SCOUT',dmg:75,rate:.9,mag:10,res:90,rl:2.0,rec:.045,auto:false,sp:.001,len:1.0,col:0x655d4d,price:2750,slot:'primary',sound:'scout_fire-1.wav'},
 awp:{n:'AWP',dmg:115,rate:1.45,mag:10,res:30,rl:2.5,rec:.06,auto:false,sp:0,len:1.12,col:0x58604d,price:4750,slot:'primary',sound:'awp1.wav'},
 g3sg1:{n:'G3SG1',dmg:80,rate:.25,mag:20,res:90,rl:3.5,rec:.035,auto:true,sp:.012,len:1.0,col:0x4b4c43,price:5000,slot:'primary',sound:'g3sg1-1.wav',team:'T'},
 sg550:{n:'SG-550',dmg:70,rate:.25,mag:30,res:90,rl:3.5,rec:.032,auto:true,sp:.01,len:1.0,col:0x4a5047,price:4200,slot:'primary',sound:'sg550-1.wav',team:'CT'},
 m3:{n:'M3',dmg:24,rate:.9,mag:8,res:32,rl:2.3,rec:.06,auto:false,sp:.075,len:.8,col:0x5b5144,price:1700,slot:'primary',sound:'m3-1.wav'},
 xm1014:{n:'XM1014',dmg:20,rate:.25,mag:7,res:32,rl:2.8,rec:.05,auto:true,sp:.07,len:.82,col:0x514b40,price:3000,slot:'primary',sound:'xm1014-1.wav'},
 m249:{n:'M249',dmg:32,rate:.08,mag:100,res:200,rl:4.8,rec:.022,auto:true,sp:.02,len:1.0,col:0x4c5045,price:5750,slot:'primary',sound:'m249-1.wav'},
 knife:{n:'KNIFE',dmg:60,rate:.5,mag:0,res:0,rl:0,rec:0,auto:false,sp:0,len:.4,col:0xcccccc,price:0,slot:'melee',sound:'knife_slash1.wav'}
};
for(const [id,spec] of Object.entries(Combat12.TABLE))if(W[id])W[id].dmg=spec.damage;
W.shield={n:'TACTICAL SHIELD',dmg:0,rate:.2,mag:0,res:0,rl:2.1,rec:.013,auto:false,sp:.008,len:.65,col:0x56646e,price:2200,slot:'primary',sound:'usp1.wav',team:'CT'};
let inventory=['usp','knife'],wi=0,playerTeam='CT',money=800,armor=0,helmet=false,defuseKit=false,nightVision=false,grenades={he:0,flash:0,smoke:0},selectedGrenade='he',buyTime=15,roundTime=120;
const weaponModels={},weaponModelLoads={},weaponInstances={};
let viewScene,viewCamera;
const CTN=['gsg9','gign','sas','urban'], TN=['arctic','guerilla','leet','terror'], CTC={}, TC={};
let ctState=0, ctWait=null;
let Q=1,SENS=.0045,R,S,cam,sun,vm,flash,running=false,over=false,t0=0,reloading=0,cool=0,kick=0,fh=false,fl=false,jmp=false,jx=0,jy=0,swapT=0,hudT=0,dmgA=0,hitT=0,msgT=0,roundWait=0,round=0,kills=0,bobT=0;
const K={w:0,a:0,s:0,d:0},obs=[],obsM=[],bots=[],tr=[],pt=[],A={};
const P={pos:new THREE.Vector3(0,0,26),vy:0,hp:100,yaw:0,pitch:0,on:true};
let selectedMapId='dust_block',activeMapData=null,aiming=false,baseFov=72;
const ray=new THREE.Raycaster(), V=(x,y,z)=>new THREE.Vector3(x,y,z);
const cur=()=>inventory[wi]||inventory[0]||'knife';
/* AUDIO */
let AC,NB,masterVolume=.8;
function snd(v,d,f){if(!AC)return;const s=AC.createBufferSource();s.buffer=NB;const g=AC.createGain(),fi=AC.createBiquadFilter();g.gain.setValueAtTime(Math.max(.001,v*masterVolume),AC.currentTime);g.gain.exponentialRampToValueAtTime(.001,AC.currentTime+d);fi.type='lowpass';fi.frequency.value=f;s.connect(fi);fi.connect(g);g.connect(AC.destination);s.start()}
const originalAudio={},originalSoundLoading={};let originalSoundsRequested=false,reloadSfxToken=0;
const RELOAD_SOUNDS={
 usp:[['usp_clipout.wav',0],['usp_clipin.wav',520],['usp_sliderelease.wav',1120]],
 glock18:[['clipout1.wav',0],['clipin1.wav',500],['sliderelease1.wav',1080]],
 p228:[['p228_clipout.wav',0],['p228_clipin.wav',500],['p228_sliderelease.wav',1080]],
 deagle:[['de_clipout.wav',0],['de_clipin.wav',540],['de_deploy.wav',1120]],
 elite:[['elite_reloadstart.wav',0],['elite_leftclipin.wav',500],['elite_rightclipin.wav',920],['elite_sliderelease.wav',1320]],
 fiveseven:[['fiveseven_clipout.wav',0],['fiveseven_clipin.wav',520],['fiveseven_sliderelease.wav',1080]],
 mac10:[['mac10_clipout.wav',0],['mac10_clipin.wav',520],['mac10_boltpull.wav',1120]],
 tmp:[['clipout1.wav',0],['clipin1.wav',480],['slideback1.wav',1040]],
 mp5:[['mp5_clipout.wav',0],['mp5_clipin.wav',500],['mp5_slideback.wav',1080]],
 ump45:[['ump45_clipout.wav',0],['ump45_clipin.wav',500],['ump45_boltslap.wav',1080]],
 p90:[['p90_clipout.wav',0],['p90_clipin.wav',520],['p90_cliprelease.wav',1100]],
 galil:[['galil_clipout.wav',0],['galil_clipin.wav',520],['galil_boltpull.wav',1120]],
 ak47:[['ak47_clipout.wav',0],['ak47_clipin.wav',520],['ak47_boltpull.wav',1120]],
 famas:[['famas_clipout.wav',0],['famas_clipin.wav',520],['famas_boltslap.wav',1120]],
 m4a1:[['m4a1_clipout.wav',0],['m4a1_clipin.wav',520],['m4a1_boltpull.wav',1120]],
 aug:[['aug_clipout.wav',0],['aug_clipin.wav',520],['aug_boltslap.wav',1120]],
 sg552:[['sg552_clipout.wav',0],['sg552_clipin.wav',520],['sg552_boltpull.wav',1120]],
 scout:[['scout_clipout.wav',0],['scout_clipin.wav',520],['scout_bolt.wav',1120]],
 awp:[['awp_clipout.wav',0],['awp_clipin.wav',560],['boltpull1.wav',1180]],
 g3sg1:[['g3sg1_clipout.wav',0],['g3sg1_clipin.wav',520],['g3sg1_slide.wav',1120]],
 sg550:[['sg550_clipout.wav',0],['sg550_clipin.wav',520],['sg550_boltpull.wav',1120]],
 m3:[['m3_insertshell.wav',0],['m3_insertshell.wav',620],['m3_pump.wav',1260]],
 xm1014:[['m3_insertshell.wav',0],['m3_insertshell.wav',620],['m3_pump.wav',1260]],
 m249:[['m249_boxout.wav',0],['m249_boxin.wav',650],['m249_coverup.wav',1250],['m249_chain.wav',1650]]
};
function requestOriginalSound(name){if(!AC||originalAudio[name]||originalSoundLoading[name])return;originalSoundLoading[name]=true;fetch('assets/sounds/weapons/'+name).then(r=>r.ok?r.arrayBuffer():null).then(b=>b&&AC.decodeAudioData(b)).then(buf=>{if(buf)originalAudio[name]=buf}).catch(()=>{delete originalSoundLoading[name]})}
function loadOriginalSounds(){if(!AC||originalSoundsRequested)return;originalSoundsRequested=true;const reloadFiles=Object.values(RELOAD_SOUNDS).flat().map(x=>x[0]);const extras=['generic_reload.wav','knife_slash1.wav','knife_stab.wav','knife_hit1.wav','headshot2.wav','pinpull.wav','sg_explode.wav','hegrenade-1.wav','flashbang-1.wav','grenade_hit1.wav','dryfire_pistol.wav','dryfire_rifle.wav','usp_unsil-1.wav','m4a1_unsil-1.wav','usp_silencer_on.wav','usp_silencer_off.wav','m4a1_silencer_on.wav','m4a1_silencer_off.wav','ric_metal-1.wav'];const files=[...new Set([...Object.values(W).map(w=>w.sound).filter(Boolean),...reloadFiles,...extras])];files.forEach(requestOriginalSound)}
const activeVoices=new Set();
function playOriginalSound(name,v=.4,d=.16,f=1800){
 const b=originalAudio[name];if(!b){requestOriginalSound(name);snd(v,d,f);return}
 if(!AC)return;while(activeVoices.size>=16){const old=activeVoices.values().next().value;activeVoices.delete(old);try{old.stop()}catch(e){}}
 const source=AC.createBufferSource(),gain=AC.createGain();source.buffer=b;gain.gain.value=Math.min(1,v*1.4)*masterVolume;source.connect(gain);gain.connect(AC.destination);activeVoices.add(source);
 source.onended=()=>{activeVoices.delete(source);source.disconnect();gain.disconnect()};source.start();
}
function playReloadSequence(k){const seq=RELOAD_SOUNDS[k]||[['generic_reload.wav',0]],token=++reloadSfxToken;const scale=W[k].rl*850/(seq[seq.length-1][1]||1000);seq.forEach(([file,delay],i)=>setTimeout(()=>{if(token===reloadSfxToken)playOriginalSound(file,i===0?0.28:0.24,.12,1000)},delay*scale))}
/* TEXTURES */
function tex(c1,c2,rep){const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');x.fillStyle=c1;x.fillRect(0,0,64,64);x.fillStyle=c2;x.fillRect(0,0,64,3);x.fillRect(0,0,3,64);x.fillRect(61,0,3,64);x.fillRect(0,61,64,3);const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.magFilter=THREE.NearestFilter;if(rep){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rep,rep)}return t}
/* WORLD */
function B(x,z,w,h,d,col,y=0,crate){
 const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshLambertMaterial(crate?{color:col,map:CT}:{color:col}));
 m.position.set(x,y+h/2,z);m.castShadow=m.receiveShadow=true;S.add(m);obsM.push(m);
 obs.push({x1:x-w/2,x2:x+w/2,z1:z-d/2,z2:z+d/2,y1:y,y2:y+h});return m;
}
let CT,builtMapId=null,worldReady=Promise.resolve();
function rebuildWorld(){
 if(playerAvatar){S.remove(playerAvatar);playerAvatar.traverse(o=>{if(o.isSkinnedMesh)o.skeleton.dispose()});playerAvatar=null}tr.length=0;pt.length=0;
 bots.forEach(disposeBot);bots.length=0;const geos=new Set(),mats=new Set(),textures=new Set();
 for(const o of S.children.slice()){if(o===cam)continue;o.shadow?.dispose();o.traverse(m=>{if(m.geometry)geos.add(m.geometry);for(const mat of [].concat(m.material||[])){mats.add(mat);for(const v of Object.values(mat))if(v?.isTexture)textures.add(v)}});S.remove(o)}
 geos.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());obs.length=0;obsM.length=0;build();
}
function build(){
 window.bspCol=null;window.bspSky=null;window.NavGraph?.clear();window.BSPDoors?.clear();LayoutNav.reset();worldReady=Promise.resolve();S.userData.rayMeshes=obsM;
 CT=tex('#ffffff','#b0b0b0');
 S.background=new THREE.Color(0x9fd0ff);S.fog=new THREE.Fog(0x9fd0ff,35,95);
 S.add(new THREE.HemisphereLight(0xffffff,0x998866,.65));
 sun=new THREE.DirectionalLight(0xffffff,.6);sun.position.set(25,50,15);
 sun.shadow.camera.left=sun.shadow.camera.bottom=-42;sun.shadow.camera.right=sun.shadow.camera.top=42;sun.shadow.camera.far=120;sun.shadow.mapSize.set(1024,1024);S.add(sun);
 if(activeMapData&&activeMapData.id!=='dust_block'){
  const gc=activeMapData.groundColor||['#a0a0a0','#888'];
  const size=Math.max(50,(activeMapData.size||50)*2);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(size*2,size*2),new THREE.MeshLambertMaterial({map:tex(gc[0],gc[1],50)}));
  floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;S.add(floor);obsM.push(floor);
  const bspMap=activeMapData.render==='bsp';floor.visible=!bspMap;window.bspCol=null;
  (activeMapData.blocks||[]).forEach(b=>{const m=B(b.x,b.z,b.w,b.h,b.d,b.color||'#888',b.y||0,!!b.crate);if(bspMap)m.material.visible=false});
  if(bspMap){S.fog.near=90;S.fog.far=150}
  if(bspMap){
   obsM.length=0;const dir='assets/maps/bsp/'+activeMapData.id;
   worldReady=Promise.all([loadBspWorld(dir,S),BSP.loadCollision(dir).then(async c=>{
    window.bspCol=c;await BSPDoors.load(dir,S,c,8);
    if(activeMapData.id==='cs_kvartal')await NavGraph.load(dir+'/nav/nav_graph.json',{c:c.T.c,s:c.T.s,scale:c.T.k});
   })]);
  }
  builtMapId=activeMapData.id;
  return;
 }
 builtMapId='dust_block';
 const g=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.MeshLambertMaterial({map:tex('#d9bb80','#cdac70',50)}));
 g.rotation.x=-Math.PI/2;g.receiveShadow=true;S.add(g);obsM.push(g);
 const wl=0x8a7a64,bd=0xb9b3a2,wd=0x9a6a35,bl=0x5b7c99;
 B(0,-30.5,62,6,1,wl);B(0,30.5,62,6,1,wl);B(-30.5,0,1,6,62,wl);B(30.5,0,1,6,62,wl);
 for(const s of[1,-1]){
  B(-20*s,-26*s,12,4,.8,bd);B(-26*s,-20*s,.8,4,12,bd);B(-14*s,-23.5*s,.8,4,5,bd);B(-14*s,-15.5*s,.8,4,3,bd);
  B(-23*s,-14*s,6,4,.8,bd);B(-16*s,-14*s,4,4,.8,bd);B(-21*s,-21*s,2,1.2,2,wd,0,1);
 }
 B(0,0,6,1.2,6,wd,0,1);B(0,0,3,1.1,3,bl,1.2,1);B(4.2,0,1.6,.6,2.5,bl,0,1);B(-4.2,0,1.6,.6,2.5,bl,0,1);
 B(-10,-4,.8,3,10,bd);B(10,4,.8,3,10,bd);
 const cr=[[8,-12],[12,-8],[-8,12],[-12,8],[0,-14],[0,14],[-18,2],[18,-2],[-6,-24],[6,24],[24,-10],[-24,10]];
 cr.forEach((p,i)=>{B(p[0],p[1],1.8,1.2,1.8,i%2?wd:bl,0,1);if(i%3==0)B(p[0],p[1],1.6,1,1.6,i%2?bl:wd,1.2,1)});
 [[-14,2],[14,-2],[0,-20],[0,20]].forEach(p=>B(p[0],p[1],1.2,4,1.2,wl));
}
function collide(p,r){
 for(const o of obs){
  if(p.y>=o.y2-.35||p.y+(p===P.pos&&Phase9.crouching?1.05:1.7)<=o.y1)continue;
  const cx=Math.max(o.x1,Math.min(p.x,o.x2)),cz=Math.max(o.z1,Math.min(p.z,o.z2)),dx=p.x-cx,dz=p.z-cz,d2=dx*dx+dz*dz;
  if(d2<r*r){
   if(d2>1e-6){const d=Math.sqrt(d2);p.x=cx+dx/d*r;p.z=cz+dz/d*r}
   else{const l=p.x-o.x1,rr=o.x2-p.x,f=p.z-o.z1,b=o.z2-p.z,m=Math.min(l,rr,f,b);if(m==l)p.x=o.x1-r;else if(m==rr)p.x=o.x2+r;else if(m==f)p.z=o.z1-r;else p.z=o.z2+r}
  }
 }
}
function ground(p,r){let g=0;for(const o of obs)if(p.x>o.x1-r*.7&&p.x<o.x2+r*.7&&p.z>o.z1-r*.7&&p.z<o.z2+r*.7&&o.y2<=p.y+.35&&o.y2>g)g=o.y2;return g}
/* VIEWMODEL */
function ensureWeaponModel(k){
 if(weaponModels[k])return Promise.resolve(weaponModels[k]);
 if(weaponModelLoads[k])return weaponModelLoads[k];
 return weaponModelLoads[k]=new Promise((resolve,reject)=>new THREE.GLTFLoader().load('assets/models/weapons/'+(k==='shield'?'shield_r':k)+'.glb',g=>{
  weaponModels[k]=g;
  resolve(g);
 },undefined,err=>{delete weaponModelLoads[k];console.warn('Weapon model failed to load:',k,err);reject(err)}));
}
function weaponSequenceNames(state,predicate){return state.clipNames.filter(n=>predicate(n.replace(/__\d+$/,'').toLowerCase()));}
function weaponSequence(state,candidates){
 for(const candidate of candidates){const found=state.clipNames.find(n=>n.replace(/__\d+$/,'').toLowerCase()===candidate);if(found)return found}
 return null;
}
function playWeaponClip(state,name,loop=false){
 if(!state||!name||!state.actions[name])return false;
 const action=state.actions[name];
 if(state.activeAction&&state.activeAction!==action)state.activeAction.fadeOut(.08);
 action.reset();action.enabled=true;action.setEffectiveTimeScale(1);action.setEffectiveWeight(1);
 action.setLoop(loop?THREE.LoopRepeat:THREE.LoopOnce,loop?Infinity:1);action.clampWhenFinished=!loop;action.fadeIn(.08).play();
 state.activeAction=action;state.activeName=name;state.looping=loop;return true;
}
function playWeaponAnimation(kind){
 const state=vm&&vm.userData.weaponAnimation;if(!state)return;
 const k=cur(),unsil=typeof Phase9!=='undefined'&&Phase9.unsilenced(k);
 const suffix=unsil?'_unsil':'';
 const prefer=base=>weaponSequence(state,[base+suffix,base]);
 const idle=prefer('idle')||weaponSequence(state,['idle1','idle3','shield_idle']);
 let chosen=null,queue=[];
 if(kind==='idle')chosen=(k==='shield'&&Phase9.shieldRaised?weaponSequence(state,['shield_idle']):null)||idle;
 else if(kind==='draw')chosen=prefer('draw')||weaponSequence(state,['draw2','deploy'])||idle;
 else if(kind==='reload'){
  chosen=prefer('reload');
  if(!chosen){chosen=weaponSequence(state,['start_reload']);if(chosen){const insert=weaponSequence(state,['insert']);const after=weaponSequence(state,['after_reload']);if(insert)queue.push(insert);if(after)queue.push(after)}}
 }else if((kind==='attack'||kind==='stab')&&k==='knife'){
  const choices=weaponSequenceNames(state,n=>kind==='stab'?['stab','stab_miss'].includes(n):['slash1','slash2','midslash1','midslash2'].includes(n));
  if(choices.length)chosen=choices[state.cycles.attack++%choices.length];
 }else if(kind==='fire'){
  if(k==='shield')chosen=weaponSequence(state,['shoot1']);
  else{
   const last=prefer('shootlast');
   const choices=weaponSequenceNames(state,n=>n.startsWith('shoot')&&!n.includes('empty')&&n!=='shootlast'&&n!=='shootlast_unsil'&&n.includes('_unsil')===!!unsil);
   if(A[k]&&A[k].mag===0&&last)chosen=last;
   else if(choices.length)chosen=choices[state.cycles.fire++%choices.length];
  }
 }
 if(!chosen)chosen=idle;
 state.queue=queue;state.currentKind=kind;
 if(!playWeaponClip(state,chosen,kind==='idle'))return;
 if(kind==='idle')state.currentKind='idle';
}
function mkGun(k){
 if(weaponInstances[k]){flash=weaponInstances[k].userData.flash;if(k==='shield'&&typeof Phase11!=='undefined')Phase11.updateShieldView(weaponInstances[k]);return weaponInstances[k]}
 const g=new THREE.Group(),w=W[k];
 if(weaponModels[k]){
  const gltf=weaponModels[k],model=THREE.SkeletonUtils&&THREE.SkeletonUtils.clone?THREE.SkeletonUtils.clone(gltf.scene):gltf.scene.clone(true);
  model.traverse(o=>{if(o.isMesh)o.frustumCulled=false});g.add(model);
  const mixer=new THREE.AnimationMixer(model),actions={};gltf.animations.forEach(clip=>{actions[clip.name]=mixer.clipAction(clip)});
  const state={mixer,actions,clipNames:gltf.animations.map(c=>c.name),activeAction:null,activeName:'',currentKind:'idle',queue:[],cycles:{fire:0,attack:0}};
  mixer.addEventListener('finished',event=>{
   if(event.action!==state.activeAction)return;
   if(state.queue.length){const next=state.queue.shift();playWeaponClip(state,next,false)}
   else if(state.currentKind!=='idle'){playWeaponAnimation('idle')}
  });
  g.userData.weaponAnimation=state;
  flash=new THREE.Mesh(new THREE.SphereGeometry(.035,6,6),new THREE.MeshBasicMaterial({color:0xffdd55}));flash.position.set(0,.02,-Math.max(.55,w.len+.15));flash.visible=false;g.add(flash);
  g.userData.flash=flash;weaponInstances[k]=g;if(k==='shield'&&typeof Phase11!=='undefined')Phase11.updateShieldView(g);return g;
 }
 ensureWeaponModel(k).then(()=>{if(cur()===k&&viewScene){disposeFallback(vm);viewScene.remove(vm);vm=mkGun(k);viewScene.add(vm);playWeaponAnimation('draw')}}).catch(()=>say('MODEL '+w.n+' GAGAL DIMUAT'));
 const bx=(a,b,c,x,y,z,col)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(a,b,c),new THREE.MeshLambertMaterial({color:col}));m.position.set(x,y,z);g.add(m);return m};
 if(k=='knife'){bx(.03,.09,.42,0,0,-.22,0xdddddd);bx(.05,.06,.14,0,-.02,.05,0x553311)}
 else{bx(.07,.1,w.len,0,0,-w.len/2,w.col);bx(.06,.15,.08,0,-.11,-.02,0x222222);if(k!='pistol')bx(.05,.14,.07,0,-.1,-w.len*.55,0x151515);bx(.035,.035,.12,0,.02,-w.len-.05,0x111111)}
 bx(.1,.1,.14,0,-.06,.02,0xf1c27d);
 flash=bx(.14,.14,.05,0,.02,-w.len-.14,0xffdd55);flash.visible=false;
 return g;
}
function refreshWeaponChips(){
 const box=$('chips');box.innerHTML='';inventory.forEach((k,i)=>{const d=document.createElement('div');d.className='chip'+(i===wi?' on':'');d.textContent=(i+1)+' '+W[k].n;d.addEventListener('pointerdown',e=>{e.stopPropagation();setW(i)});box.appendChild(d)});
}
function setW(i){
 reloadSfxToken++;if(!inventory.length||!viewScene)return;aiming=false;zoomIdx=0;wi=Math.max(0,Math.min(inventory.length-1,i));reloading=0;shotgunReload=null;cool=0;swapT=.25;
 if(vm){disposeFallback(vm);if(vm.userData.weaponAnimation)vm.userData.weaponAnimation.mixer.stopAllAction();viewScene.remove(vm)}
 vm=mkGun(cur());Phase13.applyHand(vm);vm.position.set(0,0,0);vm.rotation.set(0,0,0);viewScene.add(vm);playWeaponAnimation('draw');syncAim();refreshWeaponChips();hud();
}
/* MODEL LOADING (CT) */
function preloadCT(done){
 if(ctState===2||!THREE.GLTFLoader||!THREE.SkeletonUtils){ctState=2;done();return}
 (ctWait=ctWait||[]).push(done);
 if(ctState===1)return;
 ctState=1;
 const L=new THREE.GLTFLoader();const jobs=[...CTN.map(n=>['ct',n]),...TN.map(n=>['t',n])];let left=jobs.length;
 const fin=()=>{if(--left===0){ctState=2;const w=ctWait;ctWait=null;w.forEach(f=>f())}};
 jobs.forEach(([d,n])=>L.load('assets/models/'+d+'/'+n+'.glb?v=3',g=>{(d==='ct'?CTC:TC)[n]=g;fin()},undefined,()=>fin()));
}
/* BOTS */
function mkBot(x,z,i=0,team='T'){
 const names=team==='T'?TN:CTN,models=team==='T'?TC:CTC,tn=names[(round+i)%names.length];
 if(models[tn])return mkModel(team,x,z,models[tn],tn);
 const g=new THREE.Group(),parts=[],b={g,parts,team,hp:100,cd:1+rnd(),t:rnd()*9,los:false,losT:rnd()*.25,strafe:rnd()<.5?-1:1,st:1,stuck:0,dead:0};
 const add=(w,h,d,px,py,pz,c,part,pivot)=>{const ge=new THREE.BoxGeometry(w,h,d);if(pivot)ge.translate(0,-h/2,0);const m=new THREE.Mesh(ge,new THREE.MeshLambertMaterial({color:c}));m.position.set(px,py,pz);m.castShadow=true;m.userData={part,bot:b};g.add(m);parts.push(m);return m};
 b.l=add(.3,.7,.3,-.17,.7,0,0x333b55,'leg',1);b.r=add(.3,.7,.3,.17,.7,0,0x333b55,'leg',1);
 add(.72,.8,.38,0,1.1,0,0xb8402e,'body');add(.46,.46,.46,0,1.78,0,0xf1c27d,'head');
 add(.2,.2,.55,.3,1.3,-.25,0xb8402e,'body');add(.2,.2,.3,-.3,1.3,-.1,0xb8402e,'body');add(.12,.16,.55,.3,1.3,-.6,0x222222,'body');
 g.position.set(x,0,z);b.name=tn||(team+' BOT');S.add(g);bots.push(b);return b;
}
function mkCT(x,z,n,team='CT'){
 const models=team==='CT'?CTC:TC;if(models[n])return mkModel(team,x,z,models[n],n);
 const root=new THREE.Group(),gl=models[n];
 const b={g:root,parts:[],team,hp:100,cd:1+rnd(),t:0,los:false,losT:rnd()*.25,strafe:rnd()<.5?-1:1,st:1,stuck:0,dead:0,mixer:null,acts:{},cur:''};
 if(gl){
  const body=THREE.SkeletonUtils.clone(gl.scene);root.add(body);
  b.mixer=new THREE.AnimationMixer(body);
  gl.animations.forEach(c=>{b.acts[c.name]=b.mixer.clipAction(c)});
  setAnim(b,'idle1');
 }else{
  const m=new THREE.Mesh(new THREE.BoxGeometry(.6,1.8,.4),new THREE.MeshLambertMaterial({color:0x2a5fbf}));
  m.position.y=.9;m.castShadow=true;root.add(m);
 }
 root.position.set(x,0,z);S.add(root);bots.push(b);return b;
}
function attachCharacterGear(b,classId){
 // Original add-on geometry distinguishes silhouettes when a supplied skin is
 // the same MDL as another class. No false claim of a fourth unique MDL.
 const group=new THREE.Group();b.visualMount.add(group);b.gearGroup=group;b.gearMeshes=[];
 const cube=(x,y,z,w,h,d,color)=>{
  const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshLambertMaterial({color}));
  o.position.set(x,y,z);o.castShadow=true;group.add(o);b.gearMeshes.push(o);
 };
 if(classId==='terror'){
  // Phoenix Connexion: backpack and frontal webbing/pouches.
  cube(0,1.12,.28,.47,.65,.22,0x2d322a);
  cube(-.21,1.2,-.25,.15,.37,.13,0x3c392a);
  cube(.21,1.2,-.25,.15,.37,.13,0x3c392a);
  cube(0,1.04,-.29,.27,.20,.12,0x574a32);
 }else if(classId==='arctic'){
  // Arctic Avengers: pale winter shoulder protection and neck scarf.
  cube(-.37,1.43,0,.17,.23,.46,0x8795a0);
  cube(.37,1.43,0,.17,.23,.46,0x8795a0);
  cube(0,1.53,-.16,.51,.17,.16,0xced5d7);
 }else if(classId==='urban'){
  // CT Urban/Seal: compact radio pack, distinct from lighter GSG9 kit.
  cube(0,1.12,.29,.48,.55,.24,0x2d3338);
  cube(.33,1.42,.10,.12,.28,.16,0x434b4d);
 }
 if(!b.gearMeshes.length){b.visualMount.remove(group);b.gearGroup=null}
}
function mkModel(team,x,z,gl,classId=''){
 const root=new THREE.Group();
 const b={g:root,parts:[],team,hp:100,cd:1+rnd(),t:0,los:false,losT:rnd()*.25,strafe:rnd()<.5?-1:1,st:1,stuck:0,dead:0,mixer:null,acts:{},cur:''};
 const body=THREE.SkeletonUtils.clone(gl.scene);
 // The logical collision origin advances at a throttled AI rate. Keep rendered
 // soldier and hitboxes in a visual mount that interpolates between AI ticks.
 const visualMount=new THREE.Group();root.add(visualMount);visualMount.add(body);
 b.visualMount=visualMount;b.body=body;attachCharacterGear(b,classId);
 b.mixer=new THREE.AnimationMixer(body);
 gl.animations.forEach(c=>{b.acts[c.name]=b.mixer.clipAction(c)});
 setAnim(b,'idle1');
 const pm=new THREE.MeshBasicMaterial({transparent:true,opacity:0});
 const proxies=[
  ['chest',.58,.62,.48,0,1.18,0],['stomach',.47,.35,.42,0,.71,0],
  ['head',.3,.3,.3,0,1.62,0],
  ['leg',.21,.62,.3,-.16,.30,0],['leg',.21,.62,.3,.16,.30,0],
  ['arm',.19,.59,.35,-.385,1.14,0],['arm',.19,.59,.35,.385,1.14,0]
 ];
 for(const [part,w,h,d,x,y,z] of proxies){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),pm);
  m.position.set(x,y,z);m.userData={part,bot:b};visualMount.add(m);b.parts.push(m)}
 root.position.set(x,0,z);S.add(root);bots.push(b);return b;
}
function setAnim(b,name,once){
 if(!b.mixer||!b.acts[name]||b.cur===name)return;
 const n=b.acts[name];
 if(once){n.setLoop(THREE.LoopOnce,1);n.clampWhenFinished=true}else n.setLoop(THREE.LoopRepeat,Infinity);
 n.reset().fadeIn(.2).play();
 if(b.acts[b.cur])b.acts[b.cur].fadeOut(.2);
 b.cur=name;
}
const SP=[[-10,-26],[0,-26],[10,-26],[-24,-5],[24,-5],[-18,-10],[18,-14],[8,-20],[-8,-20],[26,0],[-26,2],[12,-2]];
function startRound(){
 Phase13.beforeRound();Phase9.resetRound();Phase10.clearFX();Phase10.roundStart();aiming=false;zoomIdx=0;reloading=0;shotgunReload=null;roundWait=0;reloadSfxToken++;resetInputs();syncAim();
 round++;bots.forEach(disposeBot);bots.length=0;
 const match=Phase10.counts(playerTeam),enemyTeam=playerTeam==='CT'?'T':'CT',allyTeam=playerTeam;
 const spawnData=activeMapData?.spawn||{},ownSpawn=spawnData[playerTeam==='CT'?'ct':'t'],enemySpawn=spawnData[playerTeam==='CT'?'t':'ct'];
 const ownZ=ownSpawn?.[2]??(playerTeam==='CT'?24:-24),enemyZ=enemySpawn?.[2]??(playerTeam==='CT'?-24:24);
 // Every number 2..32 is valid: one human plus N-1 bots, with an odd
 // extra player slot assigned to the human's team.
 for(let i=0;i<match.enemies;i++){
  const x=(enemySpawn?.[0]||0)+((i%5)-2)*1.85,z=enemyZ+Math.floor(i/5)*(enemyTeam==='CT'?-1.8:1.8);
  const b=enemyTeam==='T'?mkBot(x,z,i,'T'):mkCT(x,z,CTN[(round+i)%CTN.length],'CT');
  b.name=(enemyTeam==='T'?TN[(round+i)%TN.length]:CTN[(round+i)%CTN.length]).toUpperCase();Phase10.registerBot(b,i);Phase10.prepareBotRound(b);
 }
 for(let i=0;i<match.allies;i++){
  const x=(ownSpawn?.[0]||0)+((i%5)-2)*1.85,z=ownZ+Math.floor(i/5)*(allyTeam==='CT'?-1.8:1.8);
  const b=allyTeam==='T'?(i===0&&TC[playerClass]?mkModel('T',x,z,TC[playerClass],playerClass):mkBot(x,z,i,'T'))
   :mkCT(x,z,i===0?playerClass:CTN[(round+i)%CTN.length],'CT');
  b.name=(i===0?playerClass:(allyTeam==='T'?TN[(round+i)%TN.length]:CTN[(round+i)%CTN.length])).toUpperCase();Phase10.registerBot(b,i);Phase10.prepareBotRound(b);
 }
 bots.forEach(b=>{if(window.bspCol){b.g.position.y=BSP.snapSpawn(bspCol,b.g.position.x,b.g.position.z);if(b.body)b.body.position.y=-.72;b.parts.forEach(p=>p.position.y-=.72)}});
 bots.forEach(b=>{b.baseBodyY=b.body?.position.y??0;Phase11?.initBotPose(b)});
 const spawn=activeMapData?.spawn?.[playerTeam==='CT'?'ct':'t'];P.pos.set(spawn?.[0]??0,spawn?.[1]??0,spawn?.[2]??(playerTeam==='CT'?26:-26));
 if(window.bspCol)P.pos.y=BSP.snapSpawn(bspCol,P.pos.x,P.pos.z);P.yaw=playerTeam==='CT'?0:Math.PI;
 P.hp=100;buyTime=15;roundTime=120;
 Object.keys(A).forEach(k=>{if(A[k])A[k].res=Math.min(W[k].res*2,A[k].res+Math.ceil(W[k].res*.35))});
 placeMapSpawns();say('ROUND '+round+' · '+Phase10.config.players+' PLAYERS · '+Phase10.config.difficulty.toUpperCase());hud();
}

function los(b,tp){
 const o=V(b.g.position.x,b.g.position.y+(window.bspCol ? .56 : 1.5)-(b.crouching?(window.bspCol?.18:.36):0),b.g.position.z),t=V(tp.x,tp.y+(window.bspCol ? .56 : 1.5),tp.z),d=t.clone().sub(o),L=d.length();
 ray.set(o,d.normalize());ray.far=L;return ray.intersectObjects(obsM).length==0;
}
function tgtFor(b){
 const p=b.g.position;let best=null,bd=Infinity;
 if(b.team!==playerTeam){best={pos:P.pos,isP:true};bd=Math.hypot(P.pos.x-p.x,P.pos.z-p.z)}
 bots.forEach(x=>{if(x!==b&&!x.dead&&x.team!==b.team){const d=Math.hypot(x.g.position.x-p.x,x.g.position.z-p.z);if(d<bd){bd=d;best={pos:x.g.position,bot:x}}}});
 if(!best)return null;best.dist=bd;return best;
}
function botUpdate(b,dt){
 const p=b.g.position;
 if(b.mixer)b.mixer.update(dt);
 if(b.visualMount){
  const f=Math.min(1,Math.max(0,dt)*15);
  b.visualMount.position.x+=(0-b.visualMount.position.x)*f;
  b.visualMount.position.z+=(0-b.visualMount.position.z)*f;
  b.visualMount.rotation.y+=(0-b.visualMount.rotation.y)*f;
 }
 if(!b.dead)Phase11.updateBotPose(b,dt);
 if(b.dead){b.dead+=dt;if(b.mixer)setAnim(b,'death1',true);else b.g.rotation.x=Math.min(1.5,b.dead*5)*-1;
  if(b.dead>2.5){disposeBot(b);bots.splice(bots.indexOf(b),1)}return}
 if(b.blinded>0){b.blinded=Math.max(0,b.blinded-dt);b.los=false;b.cd=Math.max(b.cd,.3);return}
 // Scale bot thinking/movement frequency for 24-32 player matches; animation stays smooth.
 b.aiAccum=(b.aiAccum||0)+dt;const interval=Phase10.config.players>24?.085:Phase10.config.players>16?.06:.034;
 if(b.aiAccum<interval)return;const step=Math.min(.16,b.aiAccum);b.aiAccum=0;
 const tg=Phase10.seenEnemy(b,step),order=Phase10.goal(b),hasEnemy=!!tg;
 b.los=hasEnemy;
 const target=hasEnemy?tg.pos:order.pos,dx=target.x-p.x,dz=target.z-p.z,dist=Math.hypot(dx,dz)||1;
 const ux=dx/dist,uz=dz/dist,baseSpeed=(b.skill?.speed||1)*(2.65+Math.min(round,10)*.065);
 let mx=0,mz=0,sp=baseSpeed;
 Phase11.decideBotCrouch(b,hasEnemy,order,step);if(b.crouching)sp*=.59;
 b.st-=step;if(b.st<0){b.st=1+rnd()*2;b.strafe=rnd()<.5?-1:1}
 const ox=p.x,oz=p.z,oldYaw=b.g.rotation.y;
 if(hasEnemy){
  const stationary=b.radioOrder?.mode==='hold';
  if(!stationary){
   if(dist>14){mx=ux;mz=uz}else if(dist<6.5){mx=-ux*.35;mz=-uz*.35}
   mx+=-uz*b.strafe*.35;mz+=ux*b.strafe*.35;
   if(b.team===playerTeam&&b.radioOrder?.mode==='cover'&&p.distanceTo(P.pos)>11){
    const home=P.pos.clone().sub(p).normalize();mx=home.x;mz=home.z;
   }
  }
  b.cd-=step;if(b.cd<=0&&tg.dist<(b.effectiveRange||42))botShot(b,tg);
  // Tactics scale on both sides: Hard bots may use a carefully limited HE
  // when their teammates are not clustered around the blast point.
  if(Phase10.maybeBotGrenade(b,tg,step))b.cd=Math.max(b.cd,.8);
 }else if(dist>order.radius){mx=ux;mz=uz}
 const moveLen=Math.hypot(mx,mz);if(moveLen>1){mx/=moveLen;mz/=moveLen}
 const destination=new THREE.Vector3(target.x,target.y,target.z);
 // A* is used toward known objectives or recently sighted positions only.
 const needsMove=moveLen>.05;
 if(needsMove&&activeMapData?.id==='es_kvartal'&&!hasEnemy){LayoutNav.step(b,destination,sp,step)}
 else if(needsMove&&window.NAV_BOTS&&window.bspCol&&window.NavGraph&&NavGraph.graph()&&!hasEnemy){NavGraph.botStep(b,destination,sp,step)}
 else if(window.bspCol){const st={pos:p.toArray(),vy:b.vy||0,on:!!b.onGround};BSP.movePlayer(bspCol,bspCol.T,st,[mx*sp,mz*sp],step,false,!!b.crouching);p.fromArray(st.pos);b.vy=st.vy;b.onGround=st.on}
 else{p.x+=mx*sp*step;p.z+=mz*sp*step;collide(p,.4)}
 const moved=Math.hypot(p.x-ox,p.z-oz);
 if(needsMove&&moved<sp*step*.15)b.stuck=(b.stuck||0)+step;else b.stuck=0;
 if(needsMove&&b.stuck>1.5){b.nav=null;b.strafe*=-1;b.stuck=0}
 if(hasEnemy||needsMove)b.g.rotation.y=Math.atan2(-ux,-uz);
 if(b.visualMount){
  // Preserve the preceding world pose and gently interpolate visual motion.
  const dx=p.x-ox,dz=p.z-oz,y=b.g.rotation.y;
  b.visualMount.position.x=Math.max(-.6,Math.min(.6,b.visualMount.position.x-Math.cos(y)*dx+Math.sin(y)*dz));
  b.visualMount.position.z=Math.max(-.6,Math.min(.6,b.visualMount.position.z-Math.sin(y)*dx-Math.cos(y)*dz));
  let turn=oldYaw-y;turn=Math.atan2(Math.sin(turn),Math.cos(turn));
  b.visualMount.rotation.y=Math.max(-.5,Math.min(.5,b.visualMount.rotation.y+turn));
 }
 b.t+=moved*5;if(b.l){b.l.rotation.x=Math.sin(b.t)*.7;b.r.rotation.x=-Math.sin(b.t)*.7}
 if(b.mixer&&(b.animHoldUntil||0)<performance.now()/1000)
  setAnim(b,b.crouching?(moved>sp*step*.18?'crouchrun':'crouch_idle'):(moved>sp*step*.18?'run':'idle1'));
}

function botShot(b,tg){
 if(!b.weaponId||b.dead||!tg||!los(b,tg.pos)||Phase9.blocksSight(b.g.position,tg.pos))return;
 const w=W[b.weaponId];if(b.ammo<=0){b.ammo=w.mag;b.cd=w.rl;
  const anim=(w.slot==='pistol'?'ref_reload_onehanded':'ref_reload_rifle');
  if(b.mixer&&b.acts[anim]){setAnim(b,b.crouching?'crouch_'+anim.slice(4):anim,true);b.animHoldUntil=performance.now()/1000+Math.min(w.rl,2.5)}
  return}

 b.ammo--;b.burst=(b.burst||0)+1;
 const burstSize=w.auto?3:1;b.cd=b.burst<burstSize?w.rate:Math.max(w.rate,.85+rnd()*.45);if(b.burst>=burstSize)b.burst=0;
 const d=tg.dist,o=V(b.g.position.x,b.g.position.y+1.35-(b.crouching?.34:0),b.g.position.z);
 const moving=Math.hypot(jx,jy)>.3||K.w||K.s;
 const acc=Math.max(.08,Math.min(.65,b.accuracy-d/b.effectiveRange*.35))*(moving?.8:1);
 const hit=rnd()<acc,tp=tg.pos;
 const roll=rnd(),headChance=Math.min(.14,.06*(b.skill?.aim||1));
 const hitgroup=roll<headChance?'head':roll<.24?'stomach':roll>.91?'leg':'chest';
 const hitHeight=hitgroup==='head'?1.58:hitgroup==='leg'?.45:hitgroup==='stomach'?.88:1.2;
 const t=V(tp.x+(rnd()-.5)*(hit?0:2),tp.y+hitHeight+(rnd()-.5)*.3,tp.z+(rnd()-.5)*(hit?0:2));
 tracer(o,t,b.team==='CT'?0x66aaff:0xffcc55);
 playOriginalSound(w.sound,Math.max(.025,.23/(1+d*.08)),.15,1400);
 const firingAnim=(w.slot==='pistol'?'ref_shoot_onehanded':'ref_shoot_rifle');
 if(b.mixer&&(b.animHoldUntil||0)<performance.now()/1000){
  const animation=b.crouching?'crouch_'+firingAnim.slice(4):firingAnim;
  if(b.acts[animation]){setAnim(b,animation,true);b.animHoldUntil=performance.now()/1000+.22}
 }
 Phase10.muzzleBot(b);b.lastShot={sound:w.sound,damage:b.damage,at:performance.now(),cooldown:b.cd};
 if(hit){
  const raw=Combat12.baseDamage(b.weaponId,{silenced:b.weaponId==='usp'||b.weaponId==='m4a1'});
  if(tg.isP)hurt(raw,b.g.position,'bullet',b,hitgroup,b.weaponId,d);
  else damageBot(tg.bot,raw,hitgroup,null,false,b,b.weaponId,d);
 }
}
function hurt(d,source=null,kind='bullet',killer=null,hitgroup='chest',weaponId='',distance=0){
 if(over||P.hp<=0)return;
 if(kind==='bullet'&&source&&Phase9.blockShieldHit(source)){Phase9.shieldImpact();return}
 const result=Combat12.resolve({weaponId,raw:d,hitgroup,range:distance,armor,helmet,kind,
  silenced:weaponId==='usp'||weaponId==='m4a1'?!Phase9.unsilenced(weaponId):false});
 armor=Math.max(0,armor-result.armorUsed);P.hp-=result.hpDamage;dmgA=.7;hud();
 if(P.hp<=0){P.hp=0;Phase10.onPlayerDeath(killer);Phase13.onDeath();resetInputs();reloadSfxToken++;if(document.pointerLockElement)document.exitPointerLock();}
}
/* FX */
function tracer(a,b,col){const l=new THREE.Line(new THREE.BufferGeometry().setFromPoints([a,b]),new THREE.LineBasicMaterial({color:col,transparent:true,opacity:.9}));S.add(l);tr.push({l,t:.07})}
const PG=new THREE.BoxGeometry(.12,.12,.12);
function burst(p,col,n){for(let i=0;i<n;i++){const m=new THREE.Mesh(PG,new THREE.MeshBasicMaterial({color:col}));m.position.copy(p);S.add(m);pt.push({m,v:V((rnd()-.5)*4,rnd()*3,(rnd()-.5)*4),t:.5})}}
function say(t){$('msg').textContent=t;$('msg').style.opacity=1;msgT=1.8}
/* SHOOT */
function shoot(knifeAction='slash'){
 const display=cur(),k=display==='shield'?Phase9.shieldPistol():display,w=W[k],st=A[k];if(reloading||cool>0||swapT>0||(display==='shield'&&Phase9.shieldRaised))return;
 cool=w.rate;
 if(k==='knife'){
  const stab=knifeAction==='stab';cool=stab?1.0:.48;kick=1.5;playWeaponAnimation(stab?'stab':'attack');
  playOriginalSound(stab?'knife_stab.wav':'knife_slash1.wav',.38,.12,3000);
  ray.set(cam.position,cam.getWorldDirection(V()));ray.far=stab?2.0:2.6;
  const h=ray.intersectObjects(targets())[0];
  if(h&&h.object.userData.bot){const bot=h.object.userData.bot;
   const facing=V(-Math.sin(bot.g.rotation.y),0,-Math.cos(bot.g.rotation.y));
   const toAttacker=cam.position.clone().sub(bot.g.position).setY(0).normalize();
   const backstab=facing.dot(toAttacker)<-.5;
   damageBot(bot,Combat12.baseDamage('knife',{knifeStab:stab,backstab}),'chest',h.point,true,null,'knife',0,'melee');
  }
  return;
 }
 if(st.mag<=0){playOriginalSound(k==='usp'||k==='glock18'||k==='p228'||k==='deagle'||k==='elite'||k==='fiveseven'?'dryfire_pistol.wav':'dryfire_rifle.wav',.22,.08,2200);reload();return}
 const shotCount=k==='famas'&&Phase9.famasBurst?Math.min(3,st.mag):1;
 st.mag-=shotCount;playWeaponAnimation('fire');kick=Math.min(kick+1,3);
 if(shotCount>1)cool=Math.max(cool,.32);
 P.pitch+=w.rec*(.7+rnd()*.6);P.yaw+=(rnd()-.5)*w.rec*.6;
 const mv=Math.hypot(jx,jy)>.3||K.w||K.a||K.s||K.d||!P.on,sp=w.sp*(mv?2.2:1)*(Phase9.crouching?.72:1)+kick*.002;
 const dir=cam.getWorldDirection(V());dir.x+=(rnd()-.5)*sp*2;dir.y+=(rnd()-.5)*sp*2;dir.z+=(rnd()-.5)*sp*2;dir.normalize();
 ray.set(cam.position,dir);ray.far=150;
 const h=ray.intersectObjects(targets())[0],end=h?h.point:cam.position.clone().add(dir.clone().multiplyScalar(80));
 flash.visible=true;Phase10.muzzlePlayer(k);const firedFlash=flash;setTimeout(()=>firedFlash.visible=false,45);
 tracer(cam.position.clone().add(cam.getWorldDirection(V()).multiplyScalar(.6)),end,0xfff0a0);
 playOriginalSound(Phase9.firingSound(k),.5,k==='awp'?.25:.15,k==='usp'||k==='glock18'?2500:1800);
 // Shotguns resolve multiple independent pellet rays, each stopped by the closest world/character hit.
 const pellets=k==='famas'&&Phase9.famasBurst?shotCount:(Combat12.TABLE[k]?.pellets||1);
 for(let n=0;n<pellets;n++){
  const shotDir=n===0?dir:cam.getWorldDirection(V());
  if(n>0){const scatter=w.sp*2.4;shotDir.x+=(rnd()-.5)*scatter;shotDir.y+=(rnd()-.5)*scatter;shotDir.z+=(rnd()-.5)*scatter;shotDir.normalize()}
  ray.set(cam.position,shotDir);ray.far=150;
  const hit=n===0?h:ray.intersectObjects(targets())[0];
  if(hit){if(hit.object.userData.bot)damageBot(hit.object.userData.bot,
   Combat12.baseDamage(k,{silenced:(k==='usp'||k==='m4a1')&&!Phase9.unsilenced(k),burst:k==='famas'&&Phase9.famasBurst}),
   hit.object.userData.part,hit.point,true,null,k,hit.distance);
   else if(n===0)burst(hit.point,0xe0c090,3)}
 }
 if(st.mag<=0)setTimeout(()=>{if(cur()==k&&A[k].mag<=0)reload()},250);
 hud();
}
const targets=()=>{const a=obsM.slice();bots.forEach(b=>{if(!b.dead&&b.team!==playerTeam)a.push(...b.parts)});return a};
function damageBot(b,d,part,pt,byPlayer=true,attacker=null,weaponId='',distance=0,kind='bullet'){
 if(!b||b.dead)return;
 const head=part==='head';
 const result=Combat12.resolve({weaponId,raw:d,hitgroup:part,range:distance,
  armor:b.armor||0,helmet:!!b.helmet,kind,
  silenced:(weaponId==='usp'||weaponId==='m4a1')&&!Phase9.unsilenced(weaponId)});
 b.armor=Math.max(0,(b.armor||0)-result.armorUsed);b.hp-=result.hpDamage;
 if(byPlayer){hitT=.15;$('cross').classList.add('hit')}
 if(pt){burst(pt,0x8d1215,Math.min(4,head?4:3));Phase13.bloodHit(b,pt,head)}
 if(byPlayer&&head)playOriginalSound('headshot2.wav',.42,.1,1600);else if(byPlayer&&cur()==='knife')playOriginalSound('knife_hit1.wav',.32,.1,1200);else snd(.2,.08,600);
 if(b.hp<=0&&!b.dead){
  b.dead=.001;Phase9.dropBotWeapon(b);Phase10.onBotDeath(b,attacker);
  if(byPlayer){kills++;money=Math.min(16000,money+300);say(head?'HEADSHOT!':'KILL');killFeed(b,head)}
  const enemyTeam=playerTeam==='CT'?'T':'CT';if(b.team===enemyTeam&&bots.filter(x=>x.team===enemyTeam).every(x=>x.dead)){Phase10.roundEnd(playerTeam);roundWait=3}
  hud();
 }
}
function reload(){if(inputBlocked())return;const k=cur()==='shield'?Phase9.shieldPistol():cur(),st=A[k],w=W[k];if(k==='knife'||reloading||st.mag>=w.mag||st.res<=0)return;
 // Retract scope before starting reload. Do not restore it when reload completes.
 if(aiming&&Combat12.scoped.has(k)){aiming=false;zoomIdx=0;syncAim();
  if(cam){cam.fov=baseFov;cam.updateProjectionMatrix()}}
 reloading=w.rl;if(k==='m3'||k==='xm1014'){shotgunReload={};shotgunPhase('start')}else{playWeaponAnimation('reload');const state=vm?.userData.weaponAnimation;if(state?.activeAction)state.activeAction.setDuration(w.rl);playReloadSequence(k)}hud()}

/* KILL FEED & SCOREBOARD */
function killFeed(victim,head){
 const box=$('killfeed'),d=document.createElement('div');d.className='kf-row';
 d.innerHTML='<span class="kf-k">YOU</span>'+(head?'<span class="kf-hs">HS</span>':'')+'<span class="kf-w">'+W[cur()].n+'</span><span class="kf-v '+(victim.team==='CT'?'ct':'t')+'">'+(victim.name||victim.team+' BOT')+'</span>';
 box.prepend(d);while(box.children.length>4)box.lastChild.remove();setTimeout(()=>d.remove(),5000);
}
let sbOpen=false,crossSpread=4;
function renderScoreboard(){Phase10.renderBoard()}

function setScoreboard(on){sbOpen=on;$('scoreboard').classList.toggle('hidden',!on);$('scoreboard').setAttribute('aria-hidden',String(!on));if(on)renderScoreboard()}
addEventListener('keydown',e=>{if(e.code==='Tab'){e.preventDefault();if(running)setScoreboard(true)}});
addEventListener('keyup',e=>{if(e.code==='Tab')setScoreboard(false)});
addEventListener('blur',()=>setScoreboard(false));
/* HUD */
function hud(){
 const k=cur()==='shield'?Phase9.shieldPistol():cur(),st=A[k],enemyTeam=playerTeam==='CT'?'T':'CT',alive=bots.filter(b=>!b.dead&&b.team===enemyTeam).length;
 $('top').textContent='RONDE '+round+'  |  CT '+(bots.filter(b=>b.team==='CT'&&!b.dead).length+(playerTeam==='CT'&&P.hp>0?1:0))+'  |  T '+(bots.filter(b=>b.team==='T'&&!b.dead).length+(playerTeam==='T'&&P.hp>0?1:0))+'  |  KILL '+kills;
 $('hpt').textContent=Math.ceil(P.hp);$('hpf').style.width=P.hp+'%';$('hpf').style.background=P.hp>50?'#4f4':P.hp>25?'#fc3':'#f44';
 $('ammo').innerHTML=(k==='knife'?'':reloading?'<b class="rl">RELOAD</b>':'<b>'+st.mag+'</b><i>/'+st.res+'</i>')+'<small>'+W[k].n+'</small>';
 if(sbOpen)renderScoreboard();
 $('economy').textContent='$'+money;$('roundclock').textContent=buyTime>0?'BUY '+Math.ceil(buyTime):Math.ceil(roundTime)+'s';$('armor').textContent='ARMOR '+Math.ceil(armor)+(helmet?' · HELMET':'');$('gear').textContent='HE '+grenades.he+' · FLASH '+grenades.flash+' · SMOKE '+grenades.smoke;Phase9.updateHud();
}
function radar(){
 const c=$('radar').getContext('2d');c.clearRect(0,0,96,96);c.fillStyle='rgba(0,0,0,.45)';c.beginPath();c.arc(48,48,47,0,7);c.fill();c.fillStyle='#4f4';c.beginPath();c.moveTo(48,41);c.lineTo(44,52);c.lineTo(52,52);c.fill();
 const s=Math.sin(P.yaw),co=Math.cos(P.yaw);
 bots.forEach(b=>{if(b.dead)return;const dx=b.g.position.x-P.pos.x,dz=b.g.position.z-P.pos.z,f=-dx*s-dz*co,r=dx*co-dz*s,k=48/32;
  const x=48+r*k,y=48-f*k;if(Math.hypot(x-48,y-48)<46){c.fillStyle=b.team===playerTeam?'#5af':'#f33';c.beginPath();c.arc(x,y,3,0,7);c.fill()}});
}
/* OPTICAL SIGHTS */
const ZOOM_LEVELS={aug:[42],sg552:[42],scout:[36,15],awp:[24,10],g3sg1:[38],sg550:[38]};
let zoomIdx=0;
function scopeLevels(k){return ZOOM_LEVELS[k]?ZOOM_LEVELS[k].length:0}
function scopeZoom(k){const z=ZOOM_LEVELS[k];return z?z[Math.min(zoomIdx,z.length-1)]:0}
function toggleAim(force){
 if(inputBlocked()||!scopeLevels(cur())){aiming=false;zoomIdx=0;return}
 if(typeof force==='boolean'){aiming=force;zoomIdx=0;return}
 if(!aiming){aiming=true;zoomIdx=0}
 else if(zoomIdx<scopeLevels(cur())-1)zoomIdx++;
 else{aiming=false;zoomIdx=0}
}
function zoomStep(dir){
 if(!aiming){return}
 if(dir>0&&zoomIdx<scopeLevels(cur())-1)zoomIdx++;
 else if(dir<0&&zoomIdx>0)zoomIdx--;
 else if(dir<0){aiming=false;zoomIdx=0}
}
addEventListener('wheel',e=>{
 if(!running||!$('buyMenu').classList.contains('hidden')||!inventory.length||Phase13.isSpectating())return;
 const dir=e.deltaY>0?1:-1;
 if(aiming&&scopeLevels(cur())){zoomStep(-dir);return}
 setW((wi+dir+inventory.length)%inventory.length);
},{passive:true});
$('ads').addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();Phase9.secondaryAction()});
$('ads').addEventListener('contextmenu',e=>e.preventDefault());
addEventListener('contextmenu',e=>e.preventDefault());
addEventListener('pointerdown',e=>{if(e.target===$('pad')&&e.pointerType==='mouse'&&e.button===2)Phase9.secondaryAction()});

addEventListener('keydown',e=>{if(e.code==='KeyV')Phase9.secondaryAction()});
/* UPDATE */
function update(dt){
 if(!$('buyMenu').classList.contains('hidden'))return;
 buyTime=Math.max(0,buyTime-dt);roundTime=Math.max(0,roundTime-dt);
 if(!Phase13.isSpectating()){
 let mx=(K.d-K.a)+jx,mz=(K.w-K.s)-jy;const l=Math.hypot(mx,mz);if(l>1){mx/=l;mz/=l}
 Phase9.updateCrouch();const sp=Phase13.moveSpeed(cur())*(Phase9.crouching?.56:1)*(isWalking()?.52:1),s=Math.sin(P.yaw),c=Math.cos(P.yaw);
 if(window.bspCol){if(window.BSPDoors)BSPDoors.update(dt,BSP.toHammer(bspCol.T,[P.pos.x,P.pos.y,P.pos.z]),bots.filter(b=>!b.dead).map(b=>BSP.toHammer(bspCol.T,b.g.position.toArray())));const st={pos:[P.pos.x,P.pos.y,P.pos.z],vy:P.vy,on:P.on};BSP.movePlayer(bspCol,bspCol.T,st,[(-s*mz+c*mx)*sp,(-c*mz-s*mx)*sp],dt,jmp&&!Phase9.crouching,Phase9.crouching);P.pos.set(st.pos[0],st.pos[1],st.pos[2]);P.vy=st.vy;P.on=st.on}
 else{
 P.pos.x+=(-s*mz+c*mx)*sp*dt;P.pos.z+=(-c*mz-s*mx)*sp*dt;
 collide(P.pos,.4);const lim=worldLim();P.pos.x=Math.max(-lim,Math.min(lim,P.pos.x));P.pos.z=Math.max(-lim,Math.min(lim,P.pos.z));
 const g=ground(P.pos,.4);if(jmp&&P.on&&!Phase9.crouching){P.vy=7.6;P.on=false}
 P.vy-=22*dt;P.pos.y+=P.vy*dt;if(P.pos.y<=g){P.pos.y=g;P.vy=0;P.on=true}else P.on=false;
 }
 P.pitch=Math.max(-1.45,Math.min(1.45,P.pitch));
 bobT+=l*sp*dt*1.6*(P.on?1:0);
 cam.position.set(P.pos.x,P.pos.y+(window.bspCol?.56:1.6)-Phase9.crouchBlend*(window.bspCol?.25:.63)+Math.sin(bobT)*.03*l,P.pos.z);if(window.bspSky)window.bspSky.position.set(cam.position.x,cam.position.y,cam.position.z);cam.rotation.set(P.pitch,P.yaw,0,'YXZ');
 const targetFov=aiming&&scopeZoom(cur())?scopeZoom(cur()):baseFov;if(Math.abs(cam.fov-targetFov)>.1){cam.fov+=(targetFov-cam.fov)*Math.min(1,dt*12);cam.updateProjectionMatrix()}
 syncAim();
 cool-=dt;swapT-=dt;kick=Math.max(0,kick-dt*8);
 {const moving=Math.hypot(jx,jy)>.3||K.w||K.a||K.s||K.d;const target=(aiming&&scopeZoom(cur()))?0:4+(moving?5:0)+Math.min(kick,3)*2+(cool>0?1.5:0);crossSpread+=(target-crossSpread)*Math.min(1,dt*10);document.documentElement.style.setProperty('--spread',crossSpread.toFixed(1)+'px')}
 updateReload(dt);
 if((fh||fl)&&(W[cur()].auto||!firedLatch)){shoot();firedLatch=true}
 if(!(fh||fl))firedLatch=false;
 if(vm&&vm.userData.weaponAnimation)vm.userData.weaponAnimation.mixer.update(dt);
 vm.position.set(Math.sin(bobT*.5)*.005*l,Math.abs(Math.sin(bobT))*.006*l,0);
 vm.rotation.set(0,0,0);
 }
 Phase9.update(dt);Phase10.updateFX(dt);Phase13.updateBlood(dt);bots.slice().forEach(b=>botUpdate(b,dt));
 Phase13.updateSpectator(dt);
 for(let i=tr.length-1;i>=0;i--){const t=tr[i];t.t-=dt;if(t.t<=0){S.remove(t.l);t.l.geometry.dispose();t.l.material.dispose();tr.splice(i,1)}}
 for(let i=pt.length-1;i>=0;i--){const p=pt[i];p.t-=dt;p.v.y-=12*dt;p.m.position.addScaledVector(p.v,dt);if(p.t<=0){S.remove(p.m);p.m.material.dispose();pt.splice(i,1)}}
 Phase13.checkRoundEnd();
 if(roundWait>0){roundWait-=dt;if(roundWait<=0){money=Math.min(16000,money+3250);startRound()}}
 if(roundTime<=0&&roundWait<=0){money=Math.min(16000,money+1400);Phase10.roundEnd(playerTeam==='CT'?'T':'CT');roundWait=2}
 if(dmgA>0){dmgA-=dt;$('dmg').style.opacity=Math.max(0,dmgA)}
 if(hitT>0){hitT-=dt;if(hitT<=0)$('cross').classList.remove('hit')}
 if(msgT>0){msgT-=dt;if(msgT<=0)$('msg').style.opacity=0}
 hudT-=dt;if(hudT<=0){hudT=.15;radar();hud()}
}
let firedLatch=false;
// Tahap 13: Shift walk (CS 1.6), no sprint speed bonus.
let walkHeld=false,mobileWalk=false,fireAimPointer=null,fireAimLast=null;
function isWalking(){
 return walkHeld||mobileWalk;
}

function loop(t){
 requestAnimationFrame(loop);const dt=Math.min(.05,(t-t0)/1000);t0=t;
 if(running)update(dt);
 if(R){R.autoClear=true;R.render(S,cam);if(vm){R.autoClear=false;R.clearDepth();R.render(viewScene,viewCamera)}}
}
/* SETUP */
function applyQ(){
 R.setPixelRatio(Math.min(devicePixelRatio||1,[1,1.5,2][Q]));R.setSize(innerWidth,innerHeight);
 R.shadowMap.enabled=Q==2;sun.castShadow=Q==2;S.traverse(o=>{if(o.material)o.material.needsUpdate=true});
}
function init(){
 R=new THREE.WebGLRenderer({canvas:$('c'),antialias:Q>0,powerPreference:'high-performance'});R.outputEncoding=THREE.sRGBEncoding;
 S=new THREE.Scene();cam=new THREE.PerspectiveCamera(72,innerWidth/innerHeight,.05,150);S.add(cam);Phase13.bindLight(cam);
 viewScene=new THREE.Scene();viewCamera=new THREE.PerspectiveCamera(65,innerWidth/innerHeight,.01,10);
 viewScene.add(new THREE.HemisphereLight(0xffffff,0x887766,1.3));const vl=new THREE.DirectionalLight(0xffffff,.7);vl.position.set(-1,2,3);viewScene.add(vl);
 build();applyQ();
 addEventListener('resize',()=>{cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix();viewCamera.aspect=cam.aspect;viewCamera.updateProjectionMatrix();R.setSize(innerWidth,innerHeight)});
 refreshWeaponChips();
}
function newGame(){
 over=false;dmgA=hitT=0;$('dmg').style.opacity=0;$('cross').classList.remove('hit');$('killfeed').replaceChildren();setScoreboard(false);aiming=false;zoomIdx=0;cam.fov=baseFov;cam.updateProjectionMatrix();kills=0;round=0;Phase10.resetMatch();money=800;armor=0;helmet=false;defuseKit=false;nightVision=false;Phase9.resetMatch();document.body.classList.remove('night-vision');grenades={he:0,flash:0,smoke:0};P.pos.set(0,0,26);P.vy=0;P.hp=100;P.yaw=0;P.pitch=0;Phase13.resetMatch();
 Object.keys(W).forEach(k=>A[k]={mag:W[k].mag,res:W[k].res});
 inventory=[playerTeam==='CT'?'usp':'glock18','knife'];wi=0;setW(0);startRound();
}
$('q').onchange=e=>{Q=+e.target.value;if(R)applyQ()};
$('sn').onchange=e=>SENS=+e.target.value;
async function beginMatch(){
 if(matchLoading)return;matchLoading=true;running=false;resetInputs();
 Q=+$('q').value;SENS=+$('sn').value;
 if(!AC){try{AC=new(window.AudioContext||window.webkitAudioContext)();NB=AC.createBuffer(1,AC.sampleRate*.3,AC.sampleRate);const d=NB.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=rnd()*2-1}catch(e){}}
 if(AC?.state==='suspended')AC.resume();loadOriginalSounds();
 $('loadBack').classList.add('hidden');$('loadingScreen').classList.remove('hidden');$('loadStatus').textContent='Memuat peta, model dan suara…';
 try{
  const r=await fetch('assets/maps/'+selectedMapId+'.json');if(!r.ok)throw new Error('Map tidak ditemukan');activeMapData=await r.json();
  await Promise.all([new Promise(ok=>preloadCT(ok)),ensureWeaponModel(playerTeam==='CT'?'usp':'glock18'),ensureWeaponModel('knife'),...['hegrenade','flashbang','smokegrenade'].map(id=>ensureWeaponModel(id).catch(()=>null)),...BOT_POOLS.CT.concat(BOT_POOLS.T).map(loadHeld)]);
  if(!R)init();else{rebuildWorld();applyQ()}await worldReady;
  newGame();createPlayerClass();$('teamScreen').classList.add('hidden');$('matchConfigScreen').classList.add('hidden');$('classScreen').classList.add('hidden');$('menu').classList.add('hidden');$('loadingScreen').classList.add('hidden');document.body.classList.add('playing');running=true;t0=performance.now();
 }catch(e){console.error(e);$('loadStatus').textContent='Gagal memuat: '+e.message;$('loadBack').classList.remove('hidden')}
 finally{matchLoading=false}
}
let matchLoading=false;
$('go').onclick=()=>{$('menu').classList.add('hidden');selectedMapId='dust_block';$('matchConfigScreen').classList.remove('hidden')};
$('backMap').onclick=()=>{$('mapScreen').classList.add('hidden');$('menu').classList.remove('hidden')};
$('continueMap').onclick=()=>{$('mapScreen').classList.add('hidden');$('matchConfigScreen').classList.remove('hidden')};
$('backMatchConfig').onclick=()=>{$('matchConfigScreen').classList.add('hidden');$('menu').classList.remove('hidden')};
$('continueMatchConfig').onclick=()=>{$('matchConfigScreen').classList.add('hidden');$('teamScreen').classList.remove('hidden')};
$('backMenu').onclick=()=>{$('teamScreen').classList.add('hidden');$('matchConfigScreen').classList.remove('hidden')};
document.querySelectorAll('[data-map]').forEach(b=>b.addEventListener('click',()=>{selectedMapId=b.dataset.map;document.querySelectorAll('[data-map]').forEach(x=>{x.classList.toggle('selected',x===b);x.querySelector('i').textContent=x===b?'SELECTED':'SELECT MAP'});}));
document.querySelectorAll('[data-team]').forEach(b=>b.addEventListener('click',()=>{playerTeam=b.dataset.team;showClasses()}));
function worldLim(){return activeMapData&&activeMapData.id!=='dust_block'?Math.max(4,(activeMapData.size||30)-1):29.4}
function inBuyZone(){if(window.bspCol&&bspCol.buyzones&&bspCol.buyzones.length)return BSP.inBuyzone(bspCol,[P.pos.x,P.pos.y,P.pos.z]);
 if(activeMapData&&activeMapData.id!=='dust_block'&&activeMapData.spawn){const sp=activeMapData.spawn[playerTeam==='CT'?'ct':'t'];if(sp){return Math.hypot(P.pos.x-sp[0],P.pos.z-sp[2])<16}}
 return playerTeam==='CT'?P.pos.z>19&&Math.abs(P.pos.x)<22:P.pos.z< -19&&Math.abs(P.pos.x)<22}
function throwGrenade(){return Phase9.throwGrenade()}
$('grenadeBtn').addEventListener('click',throwGrenade);
/* INPUT */
const hold=(id,on,off)=>{const e=$(id);e.addEventListener('pointerdown',ev=>{ev.preventDefault();ev.stopPropagation();if(inputBlocked())return;e.setPointerCapture(ev.pointerId);on()});['pointerup','pointercancel'].forEach(t=>e.addEventListener(t,()=>off&&off()))};
hold('fire',()=>{fh=true;shoot();firedLatch=true},()=>{fh=false;fireAimPointer=null;fireAimLast=null});
// Holding the bullet icon both fires and steers the camera, as in mobile FPS.
// Pointer capture in hold() lets the same finger drag outside the circle.
const fireBtn=$('fire');
fireBtn.addEventListener('pointerdown',e=>{if(inputBlocked()||e.pointerType==='mouse')return;
 fireAimPointer=e.pointerId;fireAimLast={x:e.clientX,y:e.clientY};
});
fireBtn.addEventListener('pointermove',e=>{if(e.pointerId!==fireAimPointer||!fireAimLast||inputBlocked())return;
 e.preventDefault();const dx=e.clientX-fireAimLast.x,dy=e.clientY-fireAimLast.y;
 // Avoid sudden camera jumps on lost/late pointer events.
 P.yaw-=Math.max(-80,Math.min(80,dx))*SENS;
 P.pitch=Math.max(-1.45,Math.min(1.45,P.pitch-Math.max(-80,Math.min(80,dy))*SENS));
 fireAimLast={x:e.clientX,y:e.clientY};
});
for(const evt of ['pointerup','pointercancel','lostpointercapture'])fireBtn.addEventListener(evt,e=>{
 if(e.pointerId===fireAimPointer){fireAimPointer=null;fireAimLast=null;fh=false}
});
$('walkBtn').addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();
 if(inputBlocked())return;mobileWalk=!mobileWalk;$('walkBtn').classList.toggle('active',mobileWalk);
});
hold('jump' ,()=>jmp=true,()=>jmp=false);hold('rel',reload);hold('swap',()=>setW((wi+1)%inventory.length));
const pad=$('pad'),jb=$('jb'),jk=$('jk');let jid=null,jo,lid=null,lp;
pad.addEventListener('pointerdown',e=>{
 if(inputBlocked())return;
 if(e.pointerType=='mouse'){if(e.button!==0)return;fl=true;shoot();firedLatch=true;if(!document.pointerLockElement)requestLock();return}
 pad.setPointerCapture(e.pointerId);
 if(e.clientX<innerWidth*.42&&jid===null){jid=e.pointerId;jo={x:e.clientX,y:e.clientY};jb.style.display=jk.style.display='block';jb.style.left=jo.x-55+'px';jb.style.top=jo.y-55+'px';jk.style.left=jo.x-25+'px';jk.style.top=jo.y-25+'px'}
 else if(lid===null){lid=e.pointerId;lp={x:e.clientX,y:e.clientY}}
});
pad.addEventListener('pointermove',e=>{
 if(e.pointerId===jid){let dx=e.clientX-jo.x,dy=e.clientY-jo.y;const l=Math.hypot(dx,dy),m=55;if(l>m){dx*=m/l;dy*=m/l}jx=dx/m;jy=dy/m;jk.style.left=jo.x+dx-25+'px';jk.style.top=jo.y+dy-25+'px'}
 else if(e.pointerId===lid){P.yaw-=(e.clientX-lp.x)*SENS;P.pitch-=(e.clientY-lp.y)*SENS;lp={x:e.clientX,y:e.clientY}}
});
const up=e=>{if(e.pointerType=='mouse')fl=false;if(e.pointerId===jid){jid=null;jx=jy=0;jb.style.display=jk.style.display='none'}if(e.pointerId===lid)lid=null};
pad.addEventListener('pointerup',up);pad.addEventListener('pointercancel',up);
document.addEventListener('mousemove',e=>{if(document.pointerLockElement&&!inputBlocked()){P.yaw-=e.movementX*SENS*.5;P.pitch-=e.movementY*SENS*.5}});
const kmap={KeyW:'w',KeyA:'a',KeyS:'s',KeyD:'d',ArrowUp:'w',ArrowLeft:'a',ArrowDown:'s',ArrowRight:'d'};
addEventListener('keydown',e=>{if(e.code==='Escape'){if(Phase13.visibleOverlay()||Phase13.isSpectating())return;if(!$('buyMenu').classList.contains('hidden'))closeBuyMenu();else if(running){pauseToMenu();$('resumeBtn').classList.toggle('hidden',over)}return}if(inputBlocked())return;if(kmap[e.code])K[kmap[e.code]]=1;if(e.code==='Space')jmp=true;if(e.code==='ShiftLeft'||e.code==='ShiftRight')walkHeld=true;if(e.code==='KeyR')reload();if(e.code==='KeyB')openBuyMenu();if(e.code==='KeyG')throwGrenade();if(e.code==='KeyN')Phase9.toggleNightVision();if(e.code==='KeyE')Phase9.pickupNearest();if(e.code==='ControlLeft'||e.code==='ControlRight')Phase9.setCrouchInput(true);if(e.code==='KeyO'){openBuyMenu();renderBuyTab('equipment')}if(/^Digit[1-5]$/.test(e.code))setW(+e.code[5]-1)});
addEventListener('keyup',e=>{if(kmap[e.code])K[kmap[e.code]]=0;if(e.code==='Space')jmp=false;if(e.code==='ShiftLeft'||e.code==='ShiftRight')walkHeld=false;if(e.code==='ControlLeft'||e.code==='ControlRight')Phase9.setCrouchInput(false)});
document.addEventListener('contextmenu',e=>e.preventDefault());
document.addEventListener('visibilitychange',()=>{if(document.hidden){fh=fl=false;jx=jy=0}});
requestAnimationFrame(loop);
