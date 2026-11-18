/* BLOCK STRIKE Tahap 9: real grenade physics/effects, crouch, weapon pickup,
 * shield, suppressors, night vision and adjustable touch controls.
 * Loaded after game-core and game-systems8 and before classic-ui.
 */
const Phase9=(()=>{
 'use strict';
 const silenced={usp:true,m4a1:true};
 const dropped=[],projectiles=[],smokeClouds=[],worldLoads={};
 const SIGHT_RADIUS=3.5;
 const STORAGE='block-strike-tahap9-controls-v1';
 const controls=['fire','ads','jump','rel','swap','buybtn','grenadeBtn','grenadeTypeBtn','crouchBtn','walkBtn','pickupBtn','nvgBtn','radioBtn','scoreBtn','dropBtn','flashBtn','teamBtn','settingsGameBtn','weaponBtn'];
 const icons={
  fire:'<path d="m16.9 2.1 4.9 4.9L9.4 19.4l-4.9-4.9Z" fill="currentColor" stroke="none"/><path d="m3.8 15.1 5.5 5.5-2.1 2.1-5.5-5.5Z" fill="currentColor" stroke="none"/>', 
  ads:'<circle cx="12" cy="12" r="8"/><path d="M12 4v16M4 12h16"/>',
  jump:'<path d="m6 18 6-12 6 12M7 14h10"/>',
  rel:'<path d="M20 11a8 8 0 1 0-2 7"/><path d="m20 4 0 7-7 0"/>',
  swap:'<path d="M4 7h16l-4-4m4 4-4 4M20 17H4l4-4m-4 4 4 4"/>',
  buybtn:'<path d="M4 9h16l-2 11H6L4 9ZM8 9V6a4 4 0 0 1 8 0v3"/>',
  grenadeBtn:'<circle cx="12" cy="14" r="7"/><path d="M12 7V4H9V2h6v2h-2m3 3 3-3"/>',
  grenadeTypeBtn:'<circle cx="10" cy="10" r="5"/><circle cx="17" cy="16" r="4"/><path d="M7 3h6M18 10h3"/>',
  walkBtn:'<circle cx="15" cy="4" r="2"/><path d="m12 9 4 2-2 4 4 3M12 9 7 12l-4 4m8-4 1 6M3 20h17"/>',
  crouchBtn:'<circle cx="16" cy="5" r="2"/><path d="m12 9 4 2-2 4-5-2-4 3m8-2 5 5h4M3 20h9"/>',
  pickupBtn:'<path d="M5 16V9a2 2 0 0 1 4 0v3-7a2 2 0 0 1 4 0v7-5a2 2 0 0 1 4 0v5-3a2 2 0 0 1 4 0v5c0 5-3 8-8 8H9c-2 0-4-1-6-5z"/>',
  nvgBtn:'<path d="M3 10h7v9H3zm11 0h7v9h-7zM10 13h4M5 10V7l3-2m11 5V7l-3-2"/>',
  radioBtn:'<path d="M5 16v-4a7 7 0 0 1 14 0v4M7 20h10M8 11h8M12 4V1"/>',
  scoreBtn:'<path d="M4 19V10M10 19V6M16 19V12M21 19V3"/>',
  dropBtn:'<path d="M4 7h16M10 4h4M6 7l1 14h10l1-14M10 11v6M14 11v6"/>',
  flashBtn:'<path d="M8 3h8v6l-2 3v8H10v-8L8 9zM8 6h8M5 10 2 8m17 2 3-2"/>',
  teamBtn:'<path d="m4 7 4-4v3h11M20 17l-4 4v-3H5M4 17h10M20 7H10"/>',
  settingsGameBtn:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M19 5l-2 2M7 17l-2 2"/>',
  weaponBtn:'<path d="M3 7h12l2 3h4v3H10v4H7v-4H3z"/>',
  pauseBtn:'<path d="M7 4v16M17 4v16"/>'
 };
 let crouchRequested=false,mobileCrouch=false,crouching=false,crouchBlend=0;
 let nightVisionActive=false,shieldRaised=false,activeFlash=0,flashStart=0;
 let pickupCandidate=null,dismissedDrop=null,editor=false,crouchMode='toggle',selectedControl='fire',dragging=null,config={};
 let grenadeView=null,grenadeViewToken=0,pendingThrow=null,smokeTexture=null,famasBurst=false;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 function sound(name,vol=.35){playOriginalSound(name,vol,.2,1350)}
 function blocked(){return inputBlocked()||over}
 function unsilenced(k){return Object.prototype.hasOwnProperty.call(silenced,k)&&!silenced[k]}
 function firingSound(k){if(k==='usp')return silenced.usp?'usp1.wav':'usp_unsil-1.wav';if(k==='m4a1')return silenced.m4a1?'m4a1-1.wav':'m4a1_unsil-1.wav';return W[k].sound}
 function shieldPistol(){return inventory.find(x=>W[x]?.slot==='pistol')||'usp'}
 function secondaryAction(){
  if(blocked()||reloading>0)return false;
  const k=cur();
  // A right click with a knife is the slower, stronger stab attack.
  if(k==='knife'){shoot('stab');return true}
  if(k==='famas'){famasBurst=!famasBurst;say(famasBurst?'BURST FIRE':'FULL AUTO');return true}
  if(k==='shield'){
   shieldRaised=!shieldRaised;
   const a=vm?.userData.weaponAnimation;
   if(a){a.currentKind='shield';playWeaponClip(a,shieldRaised?'shield_up':'shield_down',false)}
   sound('grenade_hit1.wav',.14);updateHud();return true;
  }
  if(k==='usp'||k==='m4a1'){
   if(secondaryAction.lock&&performance.now()<secondaryAction.lock)return false;
   const attach=!silenced[k],a=vm?.userData.weaponAnimation;
   silenced[k]=attach;
   const name=attach?'add_silencer':'detach_silencer';
   if(a){a.currentKind='silencer';a.queue=[];playWeaponClip(a,name,false)}
   const duration=a?.actions?.[name]?.getClip()?.duration||1;
   secondaryAction.lock=performance.now()+duration*1000;
   sound(k+'_silencer_'+(attach?'on':'off')+'.wav',.35);
   say(attach?'SILENCER ON':'SILENCER OFF');updateHud();return true;
  }
  if(scopeLevels(k)){toggleAim();syncAim();return true}
  return false;
 }
 function toggleNightVision(){
  if(blocked())return false;
  if(!nightVision){say('BUY NIGHT VISION FIRST');return false}
  nightVisionActive=!nightVisionActive;
  document.body.classList.toggle('night-vision',nightVisionActive);
  snd(.08,.1,1500);say(nightVisionActive?'NIGHT VISION ON':'NIGHT VISION OFF');updateHud();return true;
 }
 function updateHud(){
  const action=$('ads'),k=cur(),supported=scopeLevels(k)>0||k==='usp'||k==='m4a1'||k==='shield'||k==='knife'||k==='famas';
  document.body.classList.toggle('has-action',supported);
  if(action){const on=k==='shield'?shieldRaised:k==='usp'||k==='m4a1'?silenced[k]:aiming;action.classList.toggle('active',!!on);
    const label=k==='usp'||k==='m4a1'?'PEREDAM':k==='shield'?'TAMENG':k==='knife'?'STAB':k==='famas'?'BURST':'BIDIK';action.setAttribute('aria-label',label)}
  const nv=$('nvgBtn');if(nv){nv.classList.toggle('active',nightVisionActive);nv.classList.toggle('unavailable',!nightVision);nv.title=nightVision?'Night vision (N)':'Beli night vision dahulu'}
  const cr=$('crouchBtn');if(cr)cr.classList.toggle('active',crouching);
  const gd=$('grenadeTypeBtn');if(gd){gd.dataset.grenade=selectedGrenade;gd.title='Pilih '+selectedGrenade.toUpperCase()+' (tap untuk ganti)'}
  const mode=$('modeStatus');if(mode){let bits=[];if(nightVisionActive)bits.push('NVG ON');if(k==='shield')bits.push(shieldRaised?'SHIELD UP':'SHIELD DOWN');if(k==='usp'||k==='m4a1')bits.push(silenced[k]?'SILENCER ON':'SILENCER OFF');if(crouching)bits.push('CROUCH');if(typeof isWalking==='function'&&isWalking())bits.push('WALK');mode.textContent=bits.join(' · ')}
 }
 function setCrouchInput(on){crouchRequested=!!on}
 function updateCrouch(){
  const desired=crouchRequested||mobileCrouch;
  // Only release the lower hull when there is enough headroom for standing.
  const ceiling=window.bspCol?!BSP.canStand(bspCol,P.pos):obs.some(o=>{
   const cx=Math.max(o.x1,Math.min(P.pos.x,o.x2)),cz=Math.max(o.z1,Math.min(P.pos.z,o.z2));
   return Math.hypot(P.pos.x-cx,P.pos.z-cz)<.38&&P.pos.y+1.7>o.y1&&P.pos.y+1.05<o.y2
  });
  crouching=desired||crouching&&ceiling;
  crouchBlend+=(Number(crouching)-crouchBlend)*.25;
 }
 function releaseControls(){crouchRequested=false;mobileCrouch=false}
 function blockShieldHit(source){
  if(cur()!=='shield'||!shieldRaised||!source)return false;
  const dx=source.x-P.pos.x,dz=source.z-P.pos.z,dist=Math.hypot(dx,dz)||1;
  return (dx*(-Math.sin(P.yaw))+dz*(-Math.cos(P.yaw)))/dist>.48;
 }
 function shieldImpact(){sound('ric_metal-1.wav',.22);const m=$('modeStatus');if(m){m.classList.add('shield-impact');setTimeout(()=>m.classList.remove('shield-impact'),150)}}
 function orientGoldSrcWorld(model){
  // The Tahap-8 w_ GLBs contain raw GoldSrc coordinates without the root
  // transform used for v_ models. Convert model units and Z-up to Y-up here.
  const zup=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),-Math.PI/2);
  const forward=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),Math.PI/2);
  model.quaternion.copy(forward.multiply(zup));model.scale.setScalar(.025);
 }
 function loadWorldModel(k){
  if(!worldLoads[k])worldLoads[k]=new Promise((resolve,reject)=>new THREE.GLTFLoader().load('assets/models/world/'+k+'.glb',g=>resolve(g.scene),undefined,reject)).catch(e=>{console.warn('Dropped model',k,e);return null});
  return worldLoads[k];
 }
 function floorY(x,z,fallback){
  if(window.bspCol){const h=BSP.snapSpawn(bspCol,x,z);if(Number.isFinite(h)&&Math.abs(h-fallback)<4)return h}
  return Math.max(0,fallback);
 }
 function makeDrop(k,pos,ammo,reserve){
  if(!W[k]||k==='knife'||dropped.length>=40)return null;
  const holder=new THREE.Group();holder.position.copy(pos);holder.position.y=floorY(pos.x,pos.z,pos.y)+.22;
  holder.rotation.y=Math.random()*Math.PI*2;S.add(holder);
  const marker=new THREE.Mesh(new THREE.BoxGeometry(.34,.13,.7),new THREE.MeshStandardMaterial({color:0xa8b2ac,metalness:.15,roughness:.7}));holder.add(marker);
  const drop={id:k,mesh:holder,marker,mag:ammo??W[k].mag,res:reserve??Math.floor(W[k].res*.5),alive:true,age:0};dropped.push(drop);
  loadWorldModel(k).then(scene=>{if(!scene||!drop.alive)return;const gl=THREE.SkeletonUtils?.clone?THREE.SkeletonUtils.clone(scene):scene.clone(true);orientGoldSrcWorld(gl);holder.add(gl);marker.visible=false});
  return drop;
 }
 function dropBotWeapon(b){if(!b||!b.weaponId||b.weaponId==='knife')return null;return makeDrop(b.weaponId,b.g.position.clone(),Math.max(0,b.ammo||0),Math.floor(W[b.weaponId].res*.45))}
 function dropPlayerWeapon(){
  if(blocked())return false;
  const k=cur();if(k==='knife'||!W[k]||!inventory.includes(k)){say('KNIFE CANNOT BE DROPPED');return false}
  const dropped=makeDrop(k,P.pos.clone().add(new THREE.Vector3(-Math.sin(P.yaw)*1.3,0,-Math.cos(P.yaw)*1.3)),A[k]?.mag||0,A[k]?.res||0);
  if(!dropped)return false;
  inventory=inventory.filter(id=>id!==k);if(!inventory.length)inventory=['knife'];wi=0;setW(wi);say('DROPPED '+W[k].n);return true;
 }
 function removeDrop(d){if(!d||!d.alive)return;d.alive=false;S?.remove(d.mesh);dropped.splice(dropped.indexOf(d),1);d.marker.geometry.dispose();d.marker.material.dispose();if(pickupCandidate===d){pickupCandidate=null;$('pickupPrompt').classList.add('hidden')}}
 function nearestDrop(){
  let closest=null,best=2.4;
  for(const d of dropped){const dist=Math.hypot(P.pos.x-d.mesh.position.x,P.pos.z-d.mesh.position.z);if(dist<best&&Math.abs(P.pos.y-d.mesh.position.y)<2.6&&sightClear(cam.position,d.mesh.position.clone().add(new THREE.Vector3(0,.25,0)))){best=dist;closest=d}}
  return closest;
 }
 function syncPickup(){
  const visibleDrop=nearestDrop(),d=visibleDrop===dismissedDrop?null:visibleDrop;if(visibleDrop!==dismissedDrop)dismissedDrop=null;if(d!==pickupCandidate){pickupCandidate=d;
   const panel=$('pickupPrompt');panel.classList.toggle('hidden',!d);
   if(d){$('pickupName').textContent=W[d.id].n+' · Ambil senjata?';$('pickupDesc').textContent='Slot '+(W[d.id].slot==='pistol'?'pistol':'utama')+' · otomatis tukar senjata lama'}
  }
  $('pickupBtn').classList.toggle('unavailable',!d);
 }
 function pickupNearest(){
  if(blocked())return false;
  const d=nearestDrop();if(!d)return false;
  if((d.id==='elite'&&inventory.includes('shield'))||(d.id==='shield'&&inventory.includes('elite'))){say('DUAL ELITES CANNOT BE USED WITH SHIELD');return false}
  const slot=W[d.id].slot,old=inventory.find(k=>W[k].slot===slot);
  if(old){const state=A[old];makeDrop(old,P.pos.clone().add(new THREE.Vector3(.45,0,.35)),state?.mag,state?.res);inventory=inventory.filter(k=>k!==old)}
  inventory.splice(slot==='pistol'?0:Math.min(1,inventory.length),0,d.id);
  A[d.id]={mag:d.mag,res:d.res};removeDrop(d);setW(inventory.indexOf(d.id));say('PICKED UP '+W[d.id].n);syncPickup();return true;
 }
 function closePickup(){dismissedDrop=pickupCandidate;pickupCandidate=null;$('pickupPrompt').classList.add('hidden')}
 function segmentSphere(start,end,center,radius){
  const ab=end.clone().sub(start),den=ab.lengthSq()||1;
  const t=clamp(center.clone().sub(start).dot(ab)/den,0,1);
  return start.clone().addScaledVector(ab,t).distanceTo(center)<radius;
 }
 function blocksSight(start,end){
  if(!smokeClouds.length)return false;
  const a=start.clone();a.y+=.8;const b=end.clone();b.y+=.8;
  return smokeClouds.some(c=>c.age>1.1&&segmentSphere(a,b,c.mesh.position,c.radius*.76));
 }
 function worldSegment(a,b){
  const diff=b.clone().sub(a),length=diff.length();if(length<1e-5)return {hit:false};
  const worldTargets=obsM.filter(m=>m.visible!==false);
  const rayc=new THREE.Raycaster(a,diff.multiplyScalar(1/length),0,length);
  const hits=rayc.intersectObjects(worldTargets,true);
  if(hits.length)return {hit:true,frac:hits[0].distance/length,normal:hits[0].face?.normal?.clone().transformDirection(hits[0].object.matrixWorld)||new THREE.Vector3(0,1,0)};
  // Fallback for BSP collision not represented by a render mesh.
  if(window.bspCol&&!worldTargets.length)return BSP.traceSegment(bspCol,a,b);
  return {hit:false};
 }
 function sightClear(a,b){const test=worldSegment(a,b);return !test.hit||test.frac>.95}
 function thrownModel(type,container){
  const names={he:'hegrenade',flash:'flashbang',smoke:'smokegrenade'};
  loadWorldModel(names[type]).then(scene=>{if(!scene||!container.userData.active)return;
   const clone=THREE.SkeletonUtils?.clone?THREE.SkeletonUtils.clone(scene):scene.clone(true);orientGoldSrcWorld(clone);container.add(clone);
   const fallback=container.userData.fallback;if(fallback)fallback.visible=false;
  });
 }

 function playGrenadeClip(name){
  const g=grenadeView;if(!g)return;
  const clip=g.clips.find(c=>c.name===name);if(!clip)return;
  if(g.action){g.action.fadeOut(.06)}
  const action=g.mixer.clipAction(clip);action.reset();action.setLoop(THREE.LoopOnce,1);
  action.clampWhenFinished=true;action.fadeIn(.06).play();g.action=action;
 }
 function showGrenadeView(type){
  const name={he:'hegrenade',flash:'flashbang',smoke:'smokegrenade'}[type];
  if(!name||!viewScene||!vm)return;
  clearGrenadeView();const token=++grenadeViewToken;
  vm.visible=false;
  ensureWeaponModel(name).then(g=>{
   if(token!==grenadeViewToken||!running)return;
   const model=THREE.SkeletonUtils?.clone?THREE.SkeletonUtils.clone(g.scene):g.scene.clone(true);
   const group=new THREE.Group();group.add(model);viewScene.add(group);
   grenadeView={group,mixer:new THREE.AnimationMixer(model),clips:g.animations,age:0,token,action:null};
   playGrenadeClip('deploy');
  }).catch(e=>console.warn('Grenade viewmodel unavailable',name,e));
 }
 function clearGrenadeView(){
  grenadeViewToken++;
  if(grenadeView){viewScene?.remove(grenadeView.group);grenadeView.mixer.stopAllAction();grenadeView=null}
  if(vm&&!aiming)vm.visible=true;
 }
 function releaseGrenade(type){
  if(!running||!pendingThrow||pendingThrow.type!==type)return false;
  const direction=cam.getWorldDirection(new THREE.Vector3());
  const origin=cam.position.clone().addScaledVector(direction,.62);
  const holder=new THREE.Group();holder.position.copy(origin);holder.userData.active=true;
  const fallback=new THREE.Mesh(new THREE.CylinderGeometry(.1,.1,.3,8),new THREE.MeshStandardMaterial({color:type==='he'?0x4d6548:type==='flash'?0xc6cbbd:0x73878a}));
  holder.userData.fallback=fallback;holder.add(fallback);S.add(holder);thrownModel(type,holder);
  projectiles.push({type,mesh:holder,v:direction.multiplyScalar(15).add(new THREE.Vector3(0,4.4,0)),age:0,bounces:0,
   fuse:type==='smoke'?2.7:1.85,owner:'player',settled:false});
  grenades[type]--;selectedGrenade=type;pendingThrow=null;
  playGrenadeClip('throw');say(type.toUpperCase()+' THROWN');hud();return true;
 }
 function throwGrenade(){
  if(blocked()||pendingThrow||reloading>0)return false;
  const type=grenades[selectedGrenade]>0?selectedGrenade:['he','flash','smoke'].find(x=>grenades[x]>0);
  if(!type){say('NO GRENADES');return false}
  aiming=false;zoomIdx=0;syncAim();showGrenadeView(type);
  pendingThrow={type,age:0,stage:'deploy'};return true;
 }
 function throwBotGrenade(b,target){
  if(!running||!b||b.dead||!target||!S)return false;
  const origin=b.g.position.clone().add(new THREE.Vector3(0,1.15,0));
  const delta=target.clone().sub(origin),ground=new THREE.Vector3(delta.x,0,delta.z);
  const d=ground.length();if(d<6||d>22)return false;
  const h=Math.max(.3,d/17.5),vel=ground.normalize().multiplyScalar(17.5);
  vel.y=Math.max(3,Math.min(12,(delta.y+9.5*h*h)/h));
  const group=new THREE.Group();group.position.copy(origin);group.userData.active=true;
  const fallback=new THREE.Mesh(new THREE.CylinderGeometry(.09,.09,.28,8),new THREE.MeshStandardMaterial({color:0x526247}));
  group.userData.fallback=fallback;group.add(fallback);S.add(group);thrownModel('he',group);
  if(b.mixer&&b.acts.ref_shoot_rifle){setAnim(b,'ref_shoot_rifle',true);b.animHoldUntil=performance.now()/1000+.5}
  projectiles.push({type:'he',owner:b,mesh:group,v:vel,age:0,bounces:0,fuse:1.85});
  return true;
 }
 function removeProjectile(p){p.mesh.userData.active=false;S.remove(p.mesh);const i=projectiles.indexOf(p);if(i>=0)projectiles.splice(i,1);
  p.mesh.userData.fallback.geometry.dispose();p.mesh.userData.fallback.material.dispose();}
 function effectHE(pos,owner='player'){
  sound('hegrenade-1.wav',.7);burst(pos,0xff9a31,28);
  const team=owner==='player'?playerTeam:owner?.team||playerTeam;
  for(const b of bots){if(b.dead)continue;
   if(b.team===team&&!window.GAME_FRIENDLY_FIRE)continue;
   const center=b.g.position.clone().add(new THREE.Vector3(0,.8,0)),dist=center.distanceTo(pos);
   if(dist<8&&sightClear(pos,center)){
    const dmg=Math.max(0,105*(1-dist/8));
    if(dmg>1)damageBot(b,dmg,'chest',center,owner==='player',owner==='player'?null:owner,'hegrenade',0,'explosion');
   }
  }
  const pd=cam.position.distanceTo(pos);
  // The player can hurt themselves; friendly bot grenades do not hurt their leader
  // when friendly fire is disabled.
  if((owner==='player'||team!==playerTeam||window.GAME_FRIENDLY_FIRE)&&pd<8&&sightClear(pos,cam.position))
   hurt(Math.max(0,105*(1-pd/8)),pos,'explosion',null,'chest','hegrenade');
 }

 function effectFlash(pos){
  sound('flashbang-1.wav',.65);burst(pos,0xf8fff0,14);
  for(const b of bots){if(b.dead)continue;
   const eye=b.g.position.clone().add(new THREE.Vector3(0,1.1,0));const dist=eye.distanceTo(pos);
   if(dist>17||!sightClear(pos,eye))continue;
   const facing=new THREE.Vector3(-Math.sin(b.g.rotation.y),0,-Math.cos(b.g.rotation.y));
   const to=pos.clone().sub(eye).normalize();const angular=clamp((facing.dot(to)+.25)/1.25,.1,1);
   b.blinded=Math.max(b.blinded||0,(2.6*(1-dist/17)*angular));
  }
  const eye=cam.position,dist=eye.distanceTo(pos);
  if(dist<19&&sightClear(pos,eye)){
   const dir=pos.clone().sub(eye).normalize(),facing=cam.getWorldDirection(new THREE.Vector3());
   const angular=clamp((facing.dot(dir)+.35)/1.35,.08,1);
   activeFlash=Math.max(activeFlash,clamp((1-dist/19)*angular,0,1));flashStart=3.4;
  }
 }
 function getSmokeTexture(){
  if(smokeTexture)return smokeTexture;
  try{
   if(!THREE.CanvasTexture||!THREE.SpriteMaterial)return null;
   const c=document.createElement('canvas');c.width=c.height=96;const ctx=c.getContext('2d');if(!ctx)return null;
   const rad=ctx.createRadialGradient(48,48,5,48,48,47);
   rad.addColorStop(0,'rgba(225,231,226,0.75)');rad.addColorStop(.5,'rgba(177,192,180,0.48)');rad.addColorStop(1,'rgba(151,166,155,0)');
   ctx.fillStyle=rad;ctx.fillRect(0,0,96,96);smokeTexture=new THREE.CanvasTexture(c);return smokeTexture;
  }catch(e){return null}
 }
 function effectSmoke(pos){
  // Proper smoke detonation sound from the supplied GoldSrc WAV collection.
  sound('sg_explode.wav',.5);
  const obj=new THREE.Group();obj.position.copy(pos);S.add(obj);
  const texture=getSmokeTexture(),geom=texture?null:new THREE.SphereGeometry(1,8,6),particles=[];
  for(let i=0;i<16;i++){
   const mat=texture?new THREE.SpriteMaterial({map:texture,color:0xadb5ac,transparent:true,opacity:0,depthWrite:false}):
    new THREE.MeshBasicMaterial({color:0xa0aaa1,transparent:true,opacity:0,depthWrite:false});
   const m=texture?new THREE.Sprite(mat):new THREE.Mesh(geom,mat);
   const phase=i*2.39996323,radius=Math.sqrt((i+.5)/16);
   m.userData.smoke={dx:Math.cos(phase)*radius,dz:Math.sin(phase)*radius,dy:.35+((i*7)%11)/12};
   m.position.set(m.userData.smoke.dx*.5,m.userData.smoke.dy*.55,m.userData.smoke.dz*.5);
   obj.add(m);particles.push(m)
  }
  smokeClouds.push({mesh:obj,geom,particles,radius:0,age:0,duration:15});say('SMOKE DEPLOYED');
 }
 function explode(p){
  const type=p.type,point=p.mesh.position.clone();removeProjectile(p);
  if(type==='he')effectHE(point,p.owner||'player');else if(type==='flash')effectFlash(point);else effectSmoke(point);
 }
 function updateProjectile(p,dt){
  // Substeps stop fast grenades tunneling through narrow crates at low FPS.
  const steps=Math.max(1,Math.ceil(dt/.016)),step=dt/steps;
  for(let i=0;i<steps;i++){
   p.age+=step;const old=p.mesh.position.clone();p.v.y-=19*step;
   const next=old.clone().addScaledVector(p.v,step);
   const hit=worldSegment(old,next);
   if(hit.hit){
    p.mesh.position.copy(old.clone().lerp(next,Math.max(0,(hit.frac||0)-.01)));
    const n=(hit.normal||new THREE.Vector3(0,1,0)).normalize();
    const impact=p.v.dot(n);if(impact<0)p.v.addScaledVector(n,-1.55*impact);
    p.v.multiplyScalar(.65);p.bounces++;
    if(n.y>.65){p.v.x*=.77;p.v.z*=.77;if(Math.abs(p.v.y)<1.3)p.v.y=0}
    if(p.bounces<6)sound('grenade_hit1.wav',.075);
   }else p.mesh.position.copy(next);
   if(!window.bspCol&&p.mesh.position.y<.14){p.mesh.position.y=.14;p.v.y=Math.abs(p.v.y)*.27;p.v.x*=.7;p.v.z*=.7;p.bounces++}
   if(p.mesh.position.y<.2&&p.age>.8){p.v.x*=.982;p.v.z*=.982}
  }
  p.mesh.rotation.x+=dt*6;p.mesh.rotation.z+=dt*5;
  if(p.age>=p.fuse&&(p.type!=='smoke'||p.v.length()<2.5||p.age>=5.5))explode(p);
 }
 function update(dt){
  if(pendingThrow){pendingThrow.age+=dt;
   if(pendingThrow.stage==='deploy'&&pendingThrow.age>=.18){pendingThrow.stage='pin';playGrenadeClip('pullpin');sound('pinpull.wav',.25)}
   if(pendingThrow.age>=.72)releaseGrenade(pendingThrow.type);
  }
  if(grenadeView){grenadeView.mixer.update(dt);grenadeView.age+=dt;
   if(!pendingThrow&&grenadeView.age>1.4)clearGrenadeView()}
  for(const p of projectiles.slice())updateProjectile(p,dt);
  for(const c of smokeClouds.slice()){
   c.age+=dt;c.radius=Math.min(SIGHT_RADIUS,c.age*1.3);
   const fade=clamp((c.duration-c.age)/3,0,1)*clamp(c.age/1.8,0,1);
   for(let i=0;i<c.particles.length;i++){
    const m=c.particles[i],p=m.userData.smoke,spread=c.radius*(.85+.18*p.dy);
    m.position.set(p.dx*spread,p.dy*.6+c.radius*(.25+p.dy*.23),p.dz*spread);
    const size=c.radius*(1.3+p.dy*.36);m.scale.set(size,size,size);
    m.material.opacity=fade*(c.geom?.12:.42);
   }
   if(c.age>=c.duration){S.remove(c.mesh);c.particles.forEach(m=>m.material.dispose());c.geom?.dispose();smokeClouds.splice(smokeClouds.indexOf(c),1)}
  }
  if(flashStart>0){flashStart=Math.max(0,flashStart-dt);
   const fade=clamp(flashStart/3.4,0,1);$('flashEffect').style.opacity=String(clamp(activeFlash*fade*fade,0,.96));if(flashStart<=0)activeFlash=0}
  syncPickup();
 }
 function resetRound(){
  pendingThrow=null;clearGrenadeView();for(const d of dropped.slice())removeDrop(d);
  for(const p of projectiles.slice())removeProjectile(p);
  for(const c of smokeClouds.slice()){S?.remove(c.mesh);c.particles.forEach(m=>m.material.dispose());c.geom?.dispose()}
  smokeClouds.length=0;shieldRaised=false;crouchRequested=mobileCrouch=crouching=false;crouchBlend=0;
  activeFlash=flashStart=0;$('flashEffect').style.opacity=0;closePickup();dismissedDrop=null;
 }
 function resetMatch(){resetRound();nightVisionActive=false;silenced.usp=true;silenced.m4a1=true;document.body.classList.remove('night-vision')}
 function cancelEdit(){editor=false;document.body.classList.remove('layout-edit');$('controlEditor').classList.add('hidden')}
 function saveControls(){try{localStorage.setItem(STORAGE,JSON.stringify(config))}catch(e){console.warn('Control layout not saved',e)}cancelEdit()}
 function clearStyle(btn){for(const v of ['left','top','right','bottom','transform','width','height','opacity'])btn.style.removeProperty(v)}
 function applyControls(){
  for(const id of controls){const b=$(id);if(!b)continue;const p=config[id];clearStyle(b);
   if(p){b.style.left=p.x+'%';b.style.top=p.y+'%';b.style.right='auto';b.style.bottom='auto';b.style.transform='translate(-50%,-50%)';
    b.style.setProperty('width',p.size+'px','important');b.style.setProperty('height',p.size+'px','important');b.style.opacity=p.opacity}
  }
 }
 function ensureLayout(){
  if(Object.keys(config).length)return;
  const rect=document.documentElement.getBoundingClientRect();
  for(const id of controls){const b=$(id);if(!b)continue;const r=b.getBoundingClientRect();
   config[id]={x:clamp(((r.left+r.width/2)/rect.width)*100,3,97),y:clamp(((r.top+r.height/2)/rect.height)*100,7,96),size:Math.round(r.width)||52,opacity:.82}}
 }
 function presets(type){
  const layouts={
   two:{fire:[90,70],ads:[78,76],jump:[88,91],rel:[78,55],swap:[93,47],buybtn:[65,92],grenadeBtn:[63,68],grenadeTypeBtn:[62,51],crouchBtn:[77,91],walkBtn:[24,24],pickupBtn:[64,35],nvgBtn:[51,92],radioBtn:[92,27],scoreBtn:[84,27],dropBtn:[36,9],flashBtn:[55,9],settingsGameBtn:[45,9],weaponBtn:[25,9],teamBtn:[7,91]},
   three:{fire:[88,24],ads:[77,69],jump:[89,90],rel:[90,69],swap:[91,47],buybtn:[70,91],grenadeBtn:[65,73],grenadeTypeBtn:[65,54],crouchBtn:[77,90],walkBtn:[20,68],pickupBtn:[64,33],nvgBtn:[53,91],radioBtn:[83,26],scoreBtn:[76,26],dropBtn:[36,9],flashBtn:[55,9],settingsGameBtn:[45,9],weaponBtn:[25,9],teamBtn:[7,91]},
   four:{fire:[13,24],ads:[77,65],jump:[90,85],rel:[90,66],swap:[90,47],buybtn:[68,92],grenadeBtn:[63,72],grenadeTypeBtn:[63,52],crouchBtn:[77,88],walkBtn:[18,55],pickupBtn:[64,33],nvgBtn:[53,91],radioBtn:[83,26],scoreBtn:[76,26],dropBtn:[36,9],flashBtn:[55,9],settingsGameBtn:[45,9],weaponBtn:[25,9],teamBtn:[7,91]}
  };
  const current=layouts[type];if(!current)return;
  for(const id of controls){if(!current[id])continue;config[id]={x:current[id][0],y:current[id][1],size:id==='fire'?66:50,opacity:.78}}
  applyControls();
 }
 function openEditor(){
  editor=true;document.body.classList.add('layout-edit');$('controlEditor').classList.remove('hidden');
  ensureLayout();selectControl(selectedControl);applyControls();
 }
 function selectControl(id){
  selectedControl=id;$('layoutCurrent').textContent=id.replace('Btn','').toUpperCase();
  $('layoutSize').value=config[id]?.size||52;$('layoutOpacity').value=config[id]?.opacity||.82;
  controls.forEach(key=>$(key)?.classList.toggle('layout-selected',key===id));
 }
 function initControlEditor(){
  $('controlLayoutBtn').addEventListener('click',openEditor);
  $('layoutSave').addEventListener('click',saveControls);
  $('layoutCancel').addEventListener('click',()=>{try{config=JSON.parse(localStorage.getItem(STORAGE)||'{}')}catch(e){config={}}applyControls();cancelEdit()});
  $('layoutReset').addEventListener('click',()=>{config={};applyControls();ensureLayout();selectControl(selectedControl)});
  document.querySelectorAll('[data-preset]').forEach(b=>b.addEventListener('click',()=>{presets(b.dataset.preset);selectControl(selectedControl)}));
  $('layoutSize').addEventListener('input',e=>{ensureLayout();config[selectedControl].size=+e.target.value;applyControls()});
  $('layoutOpacity').addEventListener('input',e=>{ensureLayout();config[selectedControl].opacity=+e.target.value;applyControls()});
  for(const id of controls){const b=$(id);if(!b)continue;
   b.addEventListener('pointerdown',e=>{
    if(!editor)return;e.preventDefault();e.stopImmediatePropagation();b.setPointerCapture(e.pointerId);
    dragging={id,pointer:e.pointerId};selectControl(id);
   },true);
   b.addEventListener('pointermove',e=>{
    if(!editor||dragging?.id!==id||dragging.pointer!==e.pointerId)return;
    e.preventDefault();e.stopImmediatePropagation();const w=innerWidth,h=innerHeight;
    config[id].x=clamp(e.clientX/w*100,4,96);config[id].y=clamp(e.clientY/h*100,9,95);applyControls();
   },true);
   for(const kind of ['pointerup','pointercancel'])b.addEventListener(kind,e=>{if(!editor)return;e.preventDefault();e.stopImmediatePropagation();if(dragging?.id===id)dragging=null},true);
   b.addEventListener('click',e=>{if(editor){e.preventDefault();e.stopImmediatePropagation()}},true);
  }
 }
 function setupIcons(){
  const names={fire:'Tembak',ads:'Bidik / fungsi senjata',jump:'Lompat',rel:'Reload',swap:'Ganti senjata',buybtn:'Beli',grenadeBtn:'Lempar grenade',grenadeTypeBtn:'Pilih grenade',crouchBtn:'Jongkok',walkBtn:'Walk',pickupBtn:'Ambil senjata',nvgBtn:'Night vision',radioBtn:'Perintah radio',scoreBtn:'Scoreboard',dropBtn:'Drop weapon',flashBtn:'Flashlight',teamBtn:'Change team',settingsGameBtn:'Settings',weaponBtn:'Weapon selector'};
  for(const id of controls){const b=$(id);if(!b)continue;b.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+icons[id]+'</svg>';
   b.setAttribute('role','button');b.setAttribute('tabindex','0');b.setAttribute('aria-label',names[id]);b.title=names[id];
  }
  const pb=$('pauseBtn');if(pb)pb.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">'+icons.pauseBtn+'</svg>';
 }
 function setup(){
  setupIcons();initControlEditor();
  try{const saved=JSON.parse(localStorage.getItem(STORAGE)||'{}');if(saved&&typeof saved==='object')config=saved}catch(e){config={}}
  applyControls();
  const crouchButton=$('crouchBtn');
  try{crouchMode=localStorage.getItem('block-strike-crouch-mode')||'toggle'}catch(e){}
  $('crouchMode').value=crouchMode;
  $('crouchMode').addEventListener('change',e=>{crouchMode=e.target.value;mobileCrouch=false;try{localStorage.setItem('block-strike-crouch-mode',crouchMode)}catch(err){}});
  crouchButton.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();if(blocked())return;mobileCrouch=crouchMode==='hold'?true:!mobileCrouch;updateCrouch();updateHud()});
  for(const type of ['pointerup','pointercancel'])crouchButton.addEventListener(type,e=>{if(crouchMode==='hold'){e.preventDefault();e.stopPropagation();mobileCrouch=false;updateCrouch()}});
  
  $('nvgBtn').addEventListener('click',e=>{e.preventDefault();e.stopPropagation();toggleNightVision()});
  $('grenadeTypeBtn').addEventListener('click',e=>{e.preventDefault();e.stopPropagation();if(blocked())return;const types=['he','flash','smoke'];selectedGrenade=types[(types.indexOf(selectedGrenade)+1)%3];say('SELECT '+selectedGrenade.toUpperCase());updateHud()});
  $('pickupBtn').addEventListener('click',e=>{e.preventDefault();e.stopPropagation();pickupNearest()});
  $('pickupAccept').addEventListener('click',pickupNearest);$('pickupCancel').addEventListener('click',()=>closePickup());
  updateHud();
 }
 setup();
 return {get famasBurst(){return famasBurst},get crouching(){return crouching},get crouchBlend(){return crouchBlend},get shieldRaised(){return shieldRaised},
  unsilenced,firingSound,shieldPistol,secondaryAction,toggleNightVision,updateHud,
  setCrouchInput,updateCrouch,releaseControls,blockShieldHit,shieldImpact,
  dropBotWeapon,dropPlayerWeapon,pickupNearest,blocksSight,throwGrenade,throwBotGrenade,resetRound,resetMatch,update,
  getDebugState:()=>({projectiles:projectiles.length,smoke:smokeClouds.length,pendingThrow:pendingThrow?.stage||null,dropped:dropped.length,nightVisionActive,shieldRaised,crouching})};
})();
