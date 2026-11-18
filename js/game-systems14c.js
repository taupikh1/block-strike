/* BLOCK STRIKE Tahap 14C: Tactical Shield inventory/selection rules.
 * Shield occupies primary slot but is wielded WITH the current single pistol.
 * Knife/grenades remain usable; a new primary requires explicitly dropping shield.
 */
const Phase14C=(()=>{
 'use strict';
 const allowedPistols=new Set(['usp','glock18','p228','deagle','fiveseven']);
 const hasShield=items=>items.includes('shield');
 const pistol=items=>items.find(id=>allowedPistols.has(id))||null;
 const allowedIndices=(items,defs)=>items.map((id,i)=>({id,i})).filter(({id})=>
   !hasShield(items)||id==='shield'||id==='knife').map(({i})=>i);
 function selectIndex(items,index,defs){
  if(!items.length)return 0;
  const requested=Math.max(0,Math.min(items.length-1,Number.isFinite(index)?index:0));
  if(!hasShield(items))return requested;
  if(defs[items[requested]]?.slot==='pistol')return items.indexOf('shield');
  return items[requested]==='knife'?requested:items.indexOf('shield');
 }
 function cycleIndex(items,current,step,defs){
  const choices=allowedIndices(items,defs);if(!choices.length)return 0;
  const normalized=selectIndex(items,current,defs),position=choices.indexOf(normalized);
  const start=position>=0?position:0;
  return choices[(start+(step>0?1:-1)+choices.length)%choices.length];
 }
 function keyIndex(items,oneBased,defs){
  if(!hasShield(items))return oneBased-1;
  const choices=allowedIndices(items,defs);
  return choices[oneBased-1]??-1;
 }
 function guardPurchase(id,items,defs,team){
  if(hasShield(items)){
   if(id==='elite')return 'DUAL ELITES NOT COMPATIBLE WITH SHIELD';
   if(defs[id]?.slot==='primary'&&id!=='shield')return 'DROP SHIELD FIRST';
   if(id==='primaryAmmo')return 'SHIELD HAS NO PRIMARY AMMO';
  }
  if(id==='shield'){
   if(team!=='CT')return 'CT ONLY';
   if(items.includes('elite'))return 'DUAL ELITES NOT COMPATIBLE WITH SHIELD';
  }
  return '';
 }
 function guardPickup(id,items,defs,team){
  if(!defs[id]||id==='knife')return 'INVALID WEAPON';
  if(id==='shield'&&hasShield(items))return 'SHIELD ALREADY OWNED';
  if(id==='shield'&&team!=='CT')return 'CT ONLY';
  if(id==='elite'&&hasShield(items)||id==='shield'&&items.includes('elite'))return 'DUAL ELITES NOT COMPATIBLE WITH SHIELD';
  if(hasShield(items)&&defs[id]?.slot==='primary'&&id!=='shield')return 'DROP SHIELD FIRST';
  return '';
 }
 return {allowedPistols,hasShield,pistol,allowedIndices,selectIndex,cycleIndex,keyIndex,guardPurchase,guardPickup};
})();
