/* BLOCK STRIKE: original implementation of CS-style Auto Buy / Rebuy.
 * Uses the game's normal transaction path. No GoldSrc scripts or binaries are embedded.
 */
(function installQuickBuy(){
 'use strict';
 const KEY='block-strike-quickbuy-v1';
 const TEAM_WEAPONS={
   CT:['m4a1','aug','famas','mp5','ump45','tmp','p90','scout','m3'],
   T:['ak47','sg552','galil','mp5','ump45','mac10','p90','scout','m3']
 };
 const last={CT:[],T:[]};
 try {const saved=JSON.parse(localStorage.getItem(KEY)||'{}');for(const team of ['CT','T'])if(Array.isArray(saved[team]))last[team]=saved[team].filter(x=>typeof x==='string').slice(0,24);}catch(e){}
 let bulk=false;
 function store(){try{localStorage.setItem(KEY,JSON.stringify(last))}catch(e){}}
 function remember(id,team){
   if(bulk||!last[team])return;
   const list=last[team];
   if(W[id]?.slot==='primary')for(let i=list.length-1;i>=0;i--)if(W[list[i]]?.slot==='primary'||list[i]==='shield')list.splice(i,1);
   if(W[id]?.slot==='pistol')for(let i=list.length-1;i>=0;i--)if(W[list[i]]?.slot==='pistol')list.splice(i,1);
   if(id==='helmet'||id==='kevlar')for(let i=list.length-1;i>=0;i--)if(['helmet','kevlar'].includes(list[i]))list.splice(i,1);
   if(id!=='flash')for(let i=list.length-1;i>=0;i--)if(list[i]===id)list.splice(i,1);
   if(id==='flash'&&list.filter(x=>x==='flash').length>=2)return;
   list.push(id);if(list.length>24)list.splice(0,list.length-24);store();
 }
 function canPurchase(id){
   const item=getItem(id);
   return Boolean(item)&&!buyReason(item);
 }
 function execute(mode){
   if(typeof running==='undefined'||!running){return {ok:false,reason:'NO ACTIVE MATCH',ids:[]};}
   if(typeof buyTime==='undefined'||buyTime<=0||!inBuyZone()){
     if(typeof say==='function')say('BUY ZONE CLOSED');
     return {ok:false,reason:'BUY ZONE CLOSED',ids:[]};
   }
   const team=playerTeam;
   const selected=[];
   function buyOne(id){
     if(!canPurchase(id))return false;
     if(!purchase(id))return false;
     selected.push(id);return true;
   }
   bulk=true;
   try {
     if(mode==='rebuy'){
       for(const id of last[team]||[])buyOne(id);
     } else {
       const hasPrimary=inventory.some(id=>W[id]?.slot==='primary'||id==='shield');
       if(!hasPrimary){for(const id of TEAM_WEAPONS[team]||[]){if(buyOne(id))break;}}
       if(!helmet) {if(!buyOne('helmet')&&armor<100)buyOne('kevlar');}
       if(grenades.he<1)buyOne('he');
       if(grenades.flash<2)buyOne('flash');
       if(grenades.smoke<1)buyOne('smoke');
       buyOne('primaryAmmo');buyOne('secondaryAmmo');
     }
   }finally{bulk=false;}
   if(mode==='auto'&&selected.length){last[team]=selected.slice(0,24);store();}
   const message=selected.length?((mode==='auto'?'AUTO BUY':'REBUY')+' · '+selected.length+' ITEMS'):'NO AFFORDABLE ITEMS';
   const hint=document.getElementById('buyHint');if(hint)hint.textContent=message;
   if(typeof say==='function')say(message);
   if(typeof hud==='function')hud();
   return {ok:selected.length>0,reason:message,ids:selected};
 }
 function bind(){
   for(const [id,mode] of [['autoBuyBtn','auto'],['rebuyBtn','rebuy']]){
     const button=document.getElementById(id);if(button)button.addEventListener('click',e=>{e.stopPropagation();execute(mode);});
   }
   window.addEventListener('keydown',e=>{
     const mode=e.code==='F3'?'auto':e.code==='F4'?'rebuy':null;
     if(!mode)return;
     const target=e.target;
     if(target?.closest?.('input,textarea,select,[contenteditable="true"]'))return;
     e.preventDefault();if(e.repeat)return;
     if(document.getElementById('menu')&&!document.getElementById('menu').classList.contains('hidden'))return;
     execute(mode);
   });
 }
 // Preserve the existing buy function and its buy-zone, team, money, and stock checks.
 const originalPurchase=purchase;
 purchase=function(id){const ok=originalPurchase(id);if(ok)remember(id,playerTeam);return ok;};
 bind();
 window.BSQuickBuy={execute,remember,canPurchase,getLast:team=>(last[team]||[]).slice(),TEAM_WEAPONS};
})();
