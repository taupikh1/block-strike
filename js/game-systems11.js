/* BLOCK STRIKE Tahap 11: bot crouch pose and tactical posture.
 * No source character GLB contains a crouch clip. This applies a small
 * non-destructive procedural hip/knee pose to the existing skeleton while the
 * bot's movement hull and sight hit proxies reflect its lower stance.
 */
const Phase11=(()=>{
 'use strict';
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 function initBotPose(b){
  if(!b)return;
  b.crouching=false;b.crouchPose=0;b.crouchTarget=false;
  b.crouchDecisionAt=0;b.baseBodyY=b.body?.position.y??0;
  if(!b.body)return;
  b.crouchBones=[
   ['Bip01 L Thigh',-.46],['Bip01 R Thigh',-.46],
   ['Bip01 L Calf',.90],['Bip01 R Calf',.90],
   ['Bip01 Pelvis',.11],['Bip01 Spine',-.13]
  ].map(([name,offset])=>({bone:b.body.getObjectByName(name)||b.body.getObjectByName(name.replace(/\s/g,'_')),offset,prevPost:null,prevMod:null})).filter(x=>x.bone);
  b.crouchHitBase=b.parts.map(p=>p.position.y);
 }
 function decideBotCrouch(b,hasEnemy,order,dt){
  if(!b||b.dead)return;
  const time=performance.now()/1000;
  if(time>=b.crouchDecisionAt){
   const diff=Phase10.config.difficulty;
   const holds=order?.mode==='hold';
   const chance=diff==='hard'?.56:diff==='normal'?.37:.18;
   b.crouchTarget=!!(holds||hasEnemy&&Math.random()<chance);
   b.crouchDecisionAt=time+(hasEnemy?1.6:2.6)+Math.random()*1.4;
  }
  if(!b.crouchTarget&&b.crouching&&window.bspCol){
   // Never stand up into the ceiling: same headroom check as the human.
   if(!BSP.canStand(bspCol,b.g.position))b.crouchTarget=true;
  }
  b.crouching=b.crouchTarget;
 }
 function updateBotPose(b,dt){
  if(!b||b.dead)return;
  const blend=b.crouchPose=clamp((b.crouchPose||0)+(Number(!!b.crouching)-(b.crouchPose||0))*Math.min(1,dt*10),0,1);
  if(!b.body)return;
  if(b.gearGroup)b.gearGroup.position.y=-blend*.23;
  // Native crouch clips bend knees while preserving the feet on the floor.
  // Previous procedural path lowered the whole mesh as well, causing clipping.
  const nativeCrouch=!!(b.acts?.crouch_idle&&b.acts?.crouchrun);
  b.body.position.y=(b.baseBodyY??0)-(nativeCrouch?0:blend*.28);
  if(b.crouchHitBase){b.parts.forEach((p,i)=>{p.position.y=b.crouchHitBase[i]-blend*(p.userData.part==='head'?.37:.23)})}
  if(nativeCrouch)return;
  for(const entry of b.crouchBones||[]){
   const bone=entry.bone;
   // Mixer may overwrite tracked joints. For untracked joints, undo the last
   // procedural delta before applying the next pose, avoiding accumulation.
   if(entry.prevPost&&entry.prevMod&&bone.quaternion.angleTo(entry.prevPost)<.0001){
    bone.quaternion.multiply(entry.prevMod.clone().invert());
   }
   const mod=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),entry.offset*blend);
   bone.quaternion.multiply(mod);entry.prevPost=bone.quaternion.clone();entry.prevMod=mod;
  }
 }
 // Kept for callers from older batches. The native Five-SeveN replacement
 // now lives in 14B; never attach third-person p_ geometry to first-person bones.
 function updateShieldView(group){
  if(typeof Phase14B!=='undefined')Phase14B.sync(group);
 }
 return {initBotPose,decideBotCrouch,updateBotPose,updateShieldView};
})();
