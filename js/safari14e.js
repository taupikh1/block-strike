/* Tahap 14E: suppress native touch gestures on gameplay ONLY.
   Overlay buttons, inputs and scroll containers keep their normal behavior. */
const Phase14E=(()=>{
 'use strict';
 const SELECTOR='#pad,#c,#fire,#ads,#jump,#swap,#rel,#crouchBtn,#walkBtn,#grenadeBtn,#grenadeTypeBtn,#pickupBtn,#nvgBtn';
 const menuSelector='input,select,textarea,[contenteditable],.screen,.overlay,#radioOverlay,#scoreboard,#controlEditor,#teamOverlay,#weaponOverlay,#pickupPrompt';
 function isGameplayTarget(target){
  if(!document.body.classList.contains('playing'))return false;
  if(!(target instanceof Element))return false;
  if(target.closest(menuSelector))return false;
  return !!target.closest(SELECTOR);
 }
 function install(doc){
  // Safari fires gesture events for pinch on some versions despite touch-action.
  for(const evt of ['gesturestart','gesturechange','gestureend'])doc.addEventListener(evt,e=>{
   if(doc.body.classList.contains('playing')&&!e.target?.closest?.(menuSelector))e.preventDefault();
  },{passive:false});
  for(const evt of ['contextmenu','selectstart','dragstart','dblclick'])doc.addEventListener(evt,e=>{
   if(isGameplayTarget(e.target))e.preventDefault();
  });
  // Prevent native long-press selection and double-tap zoom on the gameplay surface.
  // Do NOT prevent default in scrollable radio/buy/settings/scoreboard overlays.
  for(const evt of ['touchstart','touchmove','touchend'])doc.addEventListener(evt,e=>{
   if(isGameplayTarget(e.target))e.preventDefault();
  },{passive:false});
 }
 return Object.freeze({install,isGameplayTarget});
})();
