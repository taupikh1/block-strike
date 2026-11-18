/* BLOCK STRIKE Tahap 12 Final — deterministic combat rules.
 * Inspired by the documented weapon constants / armor hit groups of ReGameDLL_CS.
 * Browser-world scale: ~40 GoldSrc units per game unit. A portable approximation,
 * not a claim of byte-for-byte GoldSrc hitbox or wall-penetration equivalence.
 * No dependency on rendering, DOM, or input: tested in Node directly.
 */
const Combat12=(()=>{
 'use strict';
 const specs={
  usp:[34,.79,1],glock18:[20,.75,1.05],p228:[32,.8,1.25],deagle:[54,.81,1.5],
  elite:[36,.75,1.05],fiveseven:[20,.885,1.5],
  mac10:[29,.82,.95],tmp:[20,.85,1],mp5:[26,.84,1],ump45:[30,.82,1],p90:[21,.885,1.5],
  galil:[30,.98,1],ak47:[36,.98,1.55],famas:[30,.96,1.4],m4a1:[32,.97,1.4],
  aug:[32,.96,1.4],sg552:[33,.955,1.4],scout:[75,.98,1.7],awp:[115,.99,1.95],
  g3sg1:[80,.98,1.65],sg550:[70,.98,1.45],m3:[20,.7,1],xm1014:[20,.7,1],m249:[32,.97,1.5],
  knife:[15,1,1.7]
 };
 const TABLE=Object.freeze(Object.fromEntries(Object.entries(specs).map(([k,v])=>[k,Object.freeze({damage:v[0],rangeModifier:v[1],armorFactor:v[2],pellets:k==='m3'?9:k==='xm1014'?6:1})])));
 const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
 function baseDamage(id,{silenced=false,burst=false,knifeStab=false,backstab=false}={}){
  if(id==='knife')return (knifeStab?65:15)*(backstab?3:1);
  if(id==='usp')return silenced?30:34;
  if(id==='m4a1')return silenced?33:32;
  if(id==='famas')return burst?34:30;
  return TABLE[id]?.damage??0;
 }
 function rangeDamage(id,raw,worldDistance,{silenced=false}={}){
  const s=TABLE[id];if(!s||!Number.isFinite(worldDistance))return raw;
  const modifier=id==='m4a1'&&silenced?.95:s.rangeModifier;
  // Original weapon range modifiers are applied per 500 GoldSrc units.
  return raw*Math.pow(modifier,clamp(worldDistance,0,200)*40/500);
 }
 const HIT={head:4,chest:1,body:1,stomach:1.25,arm:1,leg:.75,generic:1};
 function armorAffects(hitgroup,helmet,kind='bullet'){
  if(kind==='explosion')return true;
  if(hitgroup==='head')return !!helmet;
  return !['leg','knife_unarmored'].includes(hitgroup);
 }
 function reduceArmor(damage,armor,hitgroup,helmet,weaponId,kind='bullet'){
  const points=Math.max(0,armor||0);
  if(!points||!armorAffects(hitgroup,helmet,kind))return {hpDamage:damage,armorUsed:0};
  const ratio=clamp(.5*(TABLE[weaponId]?.armorFactor||1),.1,.99);
  const absorb=(damage-damage*ratio)*.5; // armor bonus from CS damage model
  if(absorb>points)return {hpDamage:damage-points/.5,armorUsed:points};
  return {hpDamage:damage*ratio,armorUsed:absorb};
 }
 function resolve({weaponId,raw,hitgroup='chest',range=0,armor=0,helmet=false,kind='bullet',silenced=false,burst=false,knifeStab=false,backstab=false}={}){
  const base=raw??baseDamage(weaponId,{silenced,burst,knifeStab,backstab});
  const group=Object.prototype.hasOwnProperty.call(HIT,hitgroup)?hitgroup:'chest';
  const hit=kind==='bullet'?(HIT[group]||1):1;
  const damage=kind==='bullet'?rangeDamage(weaponId,base,range,{silenced})*hit:base;
  const reduction=reduceArmor(damage,armor,group,helmet,weaponId,kind);
  return {...reduction,baseDamage:base,rawDamage:damage,hitgroup:group};
 }
 function armorPrice(id,points,helmet){
  if(id==='kevlar')return 650;
  if(id==='helmet')return points>0&&!helmet?350:1000;
  return 0;
 }
 const scoped=new Set(['awp','scout','aug','sg552','sg550','g3sg1']);
 return Object.freeze({TABLE,baseDamage,rangeDamage,reduceArmor,resolve,armorPrice,scoped});
})();
if(typeof module!=='undefined'&&module.exports)module.exports=Combat12;
