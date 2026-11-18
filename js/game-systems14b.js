/* Tahap 14B: first-person shield + pistol presentation only.
 * The GoldSrc v_shield_r model already contains a Five-SeveN mesh.  The old
 * Phase11 attachment used third-person p_ meshes on first-person bones and
 * left the baked-in Five-SeveN in place, producing overlapping geometry.
 * Keep shield/hands and their native animations in the shield rig, but render
 * only the pistol primitives from each original v_ pistol model in a separate
 * animation rig.  Never duplicate a full pair of hands or alter inventory.
 */
const Phase14B=(()=>{
 'use strict';
 const PISTOLS=new Set(['usp','glock18','p228','deagle','fiveseven']);
 const parts=new WeakMap();
 const pistolMeshNumber=o=>{
  const m=/^GoldSrcViewmodel(?:_(\d+))?$/.exec(o.name);
  return m?(m[1]?Number(m[1]):0):-1;
 };
 function prepare(group,shieldModel){
  if(!group||!group.userData.weaponAnimation)return;
  const state=parts.get(group);
  if(!state){
   // GoldSrc shield extends through the camera at its original origin. Pull
   // ONLY the shield rig backward so the shield plate never crosses near-plane.
   shieldModel.position.set(.24,-.12,-.48);
   const nativePistol=[];
   shieldModel.traverse(o=>{
    if(o.isMesh&&(pistolMeshNumber(o)===0||pistolMeshNumber(o)===1)){
     nativePistol.push(o);o.visible=false;
    }
   });
   parts.set(group,{shieldModel,nativePistol,pistol:null,token:0,rig:null,mixer:null,actions:null,active:null,kind:'idle',raised:false});
  }
  sync(group);
 }
 function sync(group){
  const state=parts.get(group);
  if(!state)return;
  const selected=typeof Phase9!=='undefined'?Phase9.shieldPistol():'usp';
  const pistol=PISTOLS.has(selected)?selected:'usp';
  if(state.pistol===pistol&&(state.rig||state.pending))return;
  const token=++state.token;
  if(state.rig){group.remove(state.rig);state.mixer?.stopAllAction();state.mixer?.uncacheRoot(state.rig);state.rig=null}
  state.mixer=null;state.actions=null;state.active=null;state.pistol=pistol;state.pending=true;
  // The shield mesh contains the baked-in Five-SeveN, so always hide those two
  // material primitives, even when Five-SeveN is selected.  Exactly one gun
  // mesh will be visible in the separate pistol rig.
  state.nativePistol.forEach(o=>o.visible=false);
  ensureWeaponModel(pistol).then(gltf=>{
   if(state.token!==token||state.pistol!==pistol)return;
   const rig=THREE.SkeletonUtils?.clone?THREE.SkeletonUtils.clone(gltf.scene):gltf.scene.clone(true);
   let gunMeshes=0;
   rig.traverse(o=>{
    if(!o.isMesh)return;
    // First six material primitives are the left/right hands and gloves in
    // all five supported original pistol GLBs. The remainder is the pistol.
    const index=pistolMeshNumber(o);
    o.visible=index>=6;
    if(o.visible)gunMeshes++;
    o.frustumCulled=false;
   });
   if(!gunMeshes){state.pending=false;state.nativePistol.forEach(o=>o.visible=true);console.warn('14B: no pistol-only primitives',pistol);return}
   // Keep the independent pistol animation close to the native shield hand
   // without moving the shield plate back across the camera near-plane.
   rig.position.set(-.04,-.03,-.08);
   group.add(rig);
   state.rig=rig;
   state.actions={};state.mixer=new THREE.AnimationMixer(rig);
   for(const clip of gltf.animations)state.actions[clip.name]=state.mixer.clipAction(clip);
   state.mixer.addEventListener('finished',event=>{
    if(event.action===state.active&&state.kind!=='idle')play(group,'idle');
   });
   rig.visible=!state.raised;
   state.pending=false;
   play(group,'idle');
  }).catch(e=>{
   if(state.token===token){state.pending=false;state.nativePistol.forEach(o=>o.visible=true);console.warn('14B pistol rig failed:',pistol,e)}
  });
 }
 function play(group,kind){
  const state=parts.get(group);if(!state)return false;
  state.kind=kind;
  const actions=state.actions;if(!actions)return false;
  const names=Object.keys(actions);
  const candidates=kind==='fire'?['shoot1','shoot','shoot2']:
   kind==='reload'?['reload','reload_unsil']:
   kind==='draw'?['draw','draw2']:['idle','idle1','idle2','idle3'];
  const name=candidates.find(n=>actions[n])||names.find(n=>n.startsWith(kind==='fire'?'shoot':'idle'));
  if(!name)return false;
  const action=actions[name];if(state.active&&state.active!==action)state.active.fadeOut(.07);
  action.reset();action.enabled=true;action.setEffectiveWeight(1);action.setEffectiveTimeScale(1);
  action.setLoop(kind==='idle'?THREE.LoopRepeat:THREE.LoopOnce,kind==='idle'?Infinity:1);
  action.clampWhenFinished=kind!=='idle';action.fadeIn(.07).play();state.active=action;
  return true;
 }
 function setRaised(group,raised){
  const state=parts.get(group);if(!state)return;
  state.raised=!!raised;if(state.rig)state.rig.visible=!state.raised;
 }
 function update(group,dt){const state=parts.get(group);state?.mixer?.update(dt)}
 function inspect(group){const s=parts.get(group);return s?{
  pistol:s.pistol,hasRig:!!s.rig,raised:s.raised,nativePistolHidden:s.nativePistol.every(o=>!o.visible),
  visibleGunMeshes:s.rig?(function(){let count=0;s.rig.traverse(o=>{if(o.isMesh&&o.visible)count++});return count})():0,
  extraHands:s.rig?(function(){let count=0;s.rig.traverse(o=>{if(o.isMesh&&pistolMeshNumber(o)>=0&&pistolMeshNumber(o)<6&&o.visible)count++});return count})():0
 }:null}
 return {prepare,sync,play,setRaised,update,inspect};
})();
