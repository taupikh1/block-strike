/* Tahap 14F: hold-fire policy. Does not bypass shoot() cadence or ammo. */
const Attack14F=(()=>{
 'use strict';
 function repeatable(id,spec){return !!(spec&&(id==='knife'||spec.slot==='pistol'||spec.auto));}
 function mode(id,secondary){return id==='knife'&&secondary?'stab':'slash';}
 return Object.freeze({repeatable,mode});
})();
if(typeof module!=='undefined'&&module.exports)module.exports=Attack14F;
