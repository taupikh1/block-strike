/* Phase 14D grenade mechanics. Pure, deterministic helpers reused by both teams.
 * World units: approximately 40 GoldSrc units per metre in BLOCK STRIKE.
 * A mechanic approximation, not a copy of proprietary GoldSrc source code.
 */
const Grenade14D=(()=>{
 'use strict';
 const TYPES=Object.freeze({
  he:Object.freeze({fuse:1.9,blastRadius:7.5,maxDamage:105,bounce:.42}),
  flash:Object.freeze({fuse:1.9,flashRadius:18,bounce:.45}),
  smoke:Object.freeze({fuse:2.1,maxWait:5.2,radius:4.15,duration:17.5,bounce:.36})
 });
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 function throwVelocity(direction,{strength=1,playerVertical=0}={}){
  const mag=Math.hypot(direction.x,direction.y,direction.z)||1;
  const x=direction.x/mag,y=direction.y/mag,z=direction.z/mag;
  const speed=15*clamp(strength,.25,1.4);
  return {x:x*speed,y:y*speed+4.4+clamp(playerVertical,-3,3)*.3,z:z*speed};
 }
 function heDamage(distance,blocked=false){if(blocked)return 0;const t=clamp(1-distance/TYPES.he.blastRadius,0,1);return TYPES.he.maxDamage*t*t;}
 function flashExposure(distance,facingDot,occluded=false){if(occluded)return {strength:0,duration:0};
  const proximity=clamp(1-distance/TYPES.flash.flashRadius,0,1);
  const front=clamp((facingDot+.24)/1.24,0,1);
  const strength=clamp(proximity*(.12+.88*front),0,1);
  return {strength,duration:strength*(2.6+1.6*front)};
 }
 function smokeOpacity(age,duration=TYPES.smoke.duration){
  return clamp(age/2.2,0,1)*clamp((duration-age)/3.5,0,1);
 }
 function segmentSmokeOpacity(a,b,center,radius,age,duration=TYPES.smoke.duration){
  if(radius<.25)return 0;
  const dx=b.x-a.x,dy=b.y-a.y,dz=b.z-a.z;
  const ll=dx*dx+dy*dy+dz*dz||1;
  const t=clamp(((center.x-a.x)*dx+(center.y-a.y)*dy+(center.z-a.z)*dz)/ll,0,1);
  const d=Math.hypot(a.x+dx*t-center.x,a.y+dy*t-center.y,a.z+dz*t-center.z);
  const penetration=clamp((radius-d)/Math.max(radius*.45,.01),0,1);
  return penetration*smokeOpacity(age,duration);
 }
 function bounce(velocity,normal,material='hard'){
  let n=normal;const len=Math.hypot(n.x,n.y,n.z)||1;
  n={x:n.x/len,y:n.y/len,z:n.z/len};
  const dot=velocity.x*n.x+velocity.y*n.y+velocity.z*n.z;
  const elasticity=material==='ground'?.32:.43;
  const impact=Math.min(0,dot);
  const v={x:velocity.x-(1+elasticity)*impact*n.x,y:velocity.y-(1+elasticity)*impact*n.y,z:velocity.z-(1+elasticity)*impact*n.z};
  const friction=material==='ground'?.71:.84;
  if(n.y>.6){v.x*=friction;v.z*=friction;if(Math.abs(v.y)<1.1)v.y=0}
  else {v.x*=.89;v.y*=.89;v.z*=.89}
  return v;
 }
 return Object.freeze({TYPES,clamp,throwVelocity,heDamage,flashExposure,smokeOpacity,segmentSmokeOpacity,bounce});
})();
if(typeof module!=='undefined'&&module.exports)module.exports=Grenade14D;
