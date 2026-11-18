/* Tahap 8: shared weapon presentation, bot loadouts and input lifecycle. */
const heldModels={},heldLoads={};
const BOT_POOLS={CT:['m4a1','aug','mp5','usp','awp','famas','p90'],T:['ak47','galil','mac10','glock18','scout','elite','mp5']};
function loadHeld(id){
 if(heldModels[id])return Promise.resolve(heldModels[id]);
 return heldLoads[id]||(heldLoads[id]=new Promise((ok,no)=>new THREE.GLTFLoader().load('assets/models/held/'+id+'.glb',g=>{heldModels[id]=g;ok(g)},undefined,no)));
}
function equipBot(b,i,preferredId=null){
 // No random rifles on the pistol round. Changing loadout must detach the
 // previous model and invalidate pending asynchronous GLTF loads.
 const id=preferredId||BOT_POOLS[b.team][i%BOT_POOLS[b.team].length],w=W[id];
 if(!w||!b)return;
 const token=b.weaponLoadToken=(b.weaponLoadToken||0)+1;
 if(b.weaponModel?.length){for(const mesh of b.weaponModel)mesh.parent?.remove(mesh)}
 b.weaponModel=[];
 Object.assign(b,{weaponId:id,damage:w.dmg,fireRate:w.rate,
  effectiveRange:(w.slot==='pistol'?32:Math.max(38,70-w.sp*800))*(b.skill?.range||1),
  accuracy:Math.min(.72,Math.max(.10,Math.max(.35,.62-w.sp*5)*(b.skill?.aim||1))),sound:w.sound,ammo:w.mag,reserve:w.res,burst:0});
 loadHeld(id).then(g=>{
  if(!b.g.parent||b.dead||!b.body||b.weaponLoadToken!==token)return;
  g.scene.traverse(o=>{if(!o.isMesh)return;
   const boneName=(o.userData.attachBone||'').replace(/\s/g,'_');
   const bone=b.body.getObjectByName(boneName)||b.body.getObjectByName(o.userData.attachBone||'');if(!bone){console.warn('Missing weapon attachment bone',boneName);return}
   const mesh=o.clone();mesh.frustumCulled=false;bone.add(mesh);b.weaponModel.push(mesh);
  });
 }).catch(e=>console.warn('Held model failed',id,e));
}
function disposeBot(b){
 for(const mesh of b.gearMeshes||[]){mesh.geometry.dispose();mesh.material.dispose()}
 if(b.mixer){b.mixer.stopAllAction();b.mixer.uncacheRoot(b.body)}
 b.parts.forEach(p=>{p.geometry.dispose();p.material.dispose()});
 b.g.traverse(o=>{if(o.isSkinnedMesh)o.skeleton.dispose()});S.remove(b.g);
}
function resetInputs(){
 fh=fl=jmp=firedLatch=false;walkHeld=mobileWalk=false;fireAimPointer=fireAimLast=null;$('walkBtn')?.classList.remove('active');jx=jy=0;Object.keys(K).forEach(k=>K[k]=0);
 jid=lid=null;jb.style.display=jk.style.display='none';if(typeof Phase9!=='undefined')Phase9.releaseControls();
}
function requestLock(){try{const p=$('pad').requestPointerLock?.();p?.catch?.(()=>{})}catch(e){}}
function inputBlocked(){return !running||!$('buyMenu').classList.contains('hidden')||!$('menu').classList.contains('hidden')||(typeof Phase13!=='undefined'&&(Phase13.isSpectating()||Phase13.visibleOverlay()))}
function syncAim(){
 const sniper=aiming&&['awp','scout','g3sg1','sg550'].includes(cur());
 $('scopeOverlay').classList.toggle('hidden',!sniper);$('scopeOverlay').classList.toggle('active',sniper);
 $('scopeOverlay').setAttribute('aria-hidden',String(!sniper));
 $('cross').classList.toggle('hidden',sniper);$('ads').classList.toggle('active',aiming);
 document.body.classList.toggle('has-scope',!!scopeLevels(cur()));if(vm)vm.visible=!sniper;
 if(!aiming&&cam){cam.fov=baseFov;cam.updateProjectionMatrix()}
}
let shotgunReload=null;
function clipDuration(name,fallback){const a=vm?.userData.weaponAnimation?.actions[name];return a?a.getClip().duration:fallback}
function shotgunPhase(phase){
 const names={start:'start_reload',insert:'insert',end:'after_reload'};
 const state=vm?.userData.weaponAnimation;
 let name=names[phase];if(phase==='insert'&&!state?.actions[name])name='reload';
 const duration=clipDuration(name,phase==='insert'?.55:.3);
 shotgunReload.phase=phase;shotgunReload.time=Math.max(.1,duration);
 if(state){state.queue=[];state.currentKind='idle';playWeaponClip(state,name,false)}
 if(phase==='insert')playOriginalSound('m3_insertshell.wav',.25);
}
function updateReload(dt){
 if(shotgunReload){
  shotgunReload.time-=dt;
  if(shotgunReload.time<=0){const key=cur()==='shield'?Phase9.shieldPistol():cur(),st=A[key];
   if(shotgunReload.phase==='insert'){st.mag++;st.res--;hud()}
   if(shotgunReload.phase==='end'){shotgunReload=null;reloading=0;playWeaponAnimation('idle');hud();return}
   shotgunPhase(st.mag<W[cur()==='shield'?Phase9.shieldPistol():cur()].mag&&st.res>0?'insert':'end');
  }
  reloading=.1;return;
 }
 if(reloading>0){reloading-=dt;if(reloading<=0){reloading=0;const key=cur()==='shield'?Phase9.shieldPistol():cur(),st=A[key],n=Math.min(W[key].mag-st.mag,st.res);st.mag+=n;st.res-=n;hud()}}
}
function pauseToMenu(){Phase10.closeRadio();activeVoices.forEach(s=>{try{s.stop()}catch(e){}});running=false;reloadSfxToken++;resetInputs();aiming=false;syncAim();$('buyMenu').classList.add('hidden');$('menu').classList.remove('hidden');document.body.classList.remove('playing');if(document.pointerLockElement)document.exitPointerLock()}
addEventListener('blur',resetInputs);
document.addEventListener('visibilitychange',()=>{if(document.hidden)resetInputs()});
document.addEventListener('pointerlockchange',()=>{if(!document.pointerLockElement)resetInputs()});

function disposeFallback(g){if(g&&!g.userData.weaponAnimation)g.traverse(o=>{o.geometry?.dispose();[].concat(o.material||[]).forEach(m=>m.dispose())})}

function placeMapSpawns(){
 if(activeMapData?.id==='es_kvartal'){LayoutNav.snap(P.pos);bots.forEach(b=>LayoutNav.snap(b.g.position));return}
 if(!window.bspCol)return;
 const graph=window.NavGraph?.graph();
 const list=team=>{
  if(graph){const sp=graph.spawns.filter(s=>s.team===team).map(s=>V(...s.pos));if(sp.length)return sp}
  const anchor=activeMapData?.spawn?.[team==='CT'?'ct':'t']||[0,0,0];
  return bspCol.spawns.map(h=>V(...BSP.toGame(bspCol.T,h))).sort((a,b)=>Math.hypot(a.x-anchor[0],a.z-anchor[2])-Math.hypot(b.x-anchor[0],b.z-anchor[2]));
 };
 const ct=list('CT'),t=list('T'),counts={CT:playerTeam==='CT'?1:0,T:playerTeam==='T'?1:0},used={CT:[],T:[]};
 const own=playerTeam==='CT'?ct:t;
 if(own.length){P.pos.copy(own[0]);used[playerTeam].push(P.pos.clone())}
 // GoldSrc BSP maps may provide fewer native spawn entities than the requested
 // 2..32 players. Stagger surplus slots with headroom and separation checks,
 // rather than blindly stacking several bots at exactly the same coordinate.
 function spawnFor(team){
  const base=team==='CT'?ct:t;if(!base.length)return null;
  const index=counts[team]++,seen=used[team],point=base[index%base.length];
  if(index<base.length&&!seen.some(v=>v.distanceTo(point)<1.1)){
   seen.push(point.clone());return point.clone()
  }
  for(let attempt=0;attempt<35;attempt++){
   const j=index*7+attempt,rad=1.35+(Math.floor(j/8)%6)*.75,angle=j*2.39996323;
   const candidate=point.clone().add(V(Math.cos(angle)*rad,0,Math.sin(angle)*rad));
   candidate.y=BSP.snapSpawn(bspCol,candidate.x,candidate.z);
   if(Math.abs(candidate.y-point.y)>2.5)continue;
   if(!BSP.canStand(bspCol,candidate))continue;
   if(seen.some(v=>Math.hypot(v.x-candidate.x,v.z-candidate.z)<1.1&&Math.abs(v.y-candidate.y)<1.5))continue;
   seen.push(candidate.clone());return candidate;
  }
  console.warn('Tahap10: no distinct BSP spawn near',team,index);
  seen.push(point.clone());return point.clone();
 }
 bots.forEach(b=>{const pos=spawnFor(b.team);if(pos)b.g.position.copy(pos);b.nav=null});
}
