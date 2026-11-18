/* Classic menus; purchases are checked at the transaction boundary. */
const BUY={pistols:['usp','glock18','p228','deagle','elite','fiveseven'],shotguns:['m3','xm1014'],smgs:['mac10','tmp','mp5','ump45','p90'],rifles:['galil','ak47','famas','m4a1','aug','sg552','scout','awp','g3sg1','sg550'],machineguns:['m249'],
 primaryAmmo:[{id:'primaryAmmo',name:'PRIMARY AMMO',price:60,desc:'Isi cadangan senjata utama'}],secondaryAmmo:[{id:'secondaryAmmo',name:'SECONDARY AMMO',price:40,desc:'Isi cadangan pistol'}],equipment:[
 {id:'kevlar',name:'KEVLAR VEST',price:650,desc:'Armor 100'}, {id:'helmet',name:'VEST + HELMET',price:1000,desc:'Armor 100 + helmet'},
 {id:'flash',name:'FLASHBANG',price:200,desc:'Maksimum 2'}, {id:'he',name:'HE GRENADE',price:300,desc:'Maksimum 1'}, {id:'smoke',name:'SMOKE GRENADE',price:300,desc:'Maksimum 1'},
 {id:'shield',name:'TACTICAL SHIELD',price:2200,desc:'CT only · uses primary slot'}, {id:'defuse',name:'DEFUSE KIT',price:200,desc:'Tidak digunakan pada mode eliminasi'}, {id:'nightvision',name:'NIGHT VISION',price:1250,desc:'Penglihatan untuk area gelap'}]};
let activeBuyTab='',playerClass='gign',playerAvatar;
function getItem(id){if(id==='helmet')return {id,name:'VEST + HELMET',price:Combat12.armorPrice(id,armor,helmet),desc:armor>0&&!helmet?'HELMET UPGRADE':'Armor 100 + helmet'};if(W[id])return {id,name:W[id].n,price:W[id].price,desc:id==='shield'?'CT · Perisai + pistol':' '+W[id].mag+' rounds · '+(W[id].team||'ALL TEAMS')};return Object.values(BUY).flat().find(x=>typeof x==='object'&&x.id===id)}
function buyReason(item){
 const id=item.id,w=W[id];if(!running||buyTime<=0||!inBuyZone())return 'BUY ZONE CLOSED';
 const shieldRule=Phase14C.guardPurchase(id,inventory,W,playerTeam);if(shieldRule)return shieldRule;
 if(w?.team&&w.team!==playerTeam)return w.team+' ONLY';
 if(w&&inventory.includes(id))return 'OWNED';
 if((id==='elite'&&inventory.includes('shield'))||(id==='shield'&&inventory.includes('elite')))return 'DUAL ELITES NOT COMPATIBLE WITH SHIELD';
 if(id==='defuse')return 'ELIMINATION MODE';
 if(id==='kevlar'&&armor>=100||id==='helmet'&&armor>=100&&helmet||id==='nightvision'&&nightVision)return 'OWNED';
 if(['he','flash','smoke'].includes(id)&&grenades[id]>=(id==='flash'?2:1))return 'FULL';
 if(id.endsWith('Ammo')){const k=inventory.find(k=>W[k].slot===(id==='primaryAmmo'?'primary':'pistol'));if(!k)return 'NO WEAPON';if(A[k].res>=W[k].res)return 'FULL'}
 if(money<item.price)return 'NOT ENOUGH MONEY';return '';
}
function openBuyMenu(){
 if(!running)return;Phase10.closeRadio();if(buyTime<=0||!inBuyZone()){say('BUY ZONE CLOSED');return}
 resetInputs();aiming=false;syncAim();$('buyMenu').classList.remove('hidden');renderBuyTab('');if(document.pointerLockElement)document.exitPointerLock();$('closeBuy').focus();
}
function closeBuyMenu(){resetInputs();$('buyMenu').classList.add('hidden');if(running&&!isT)requestLock()}
function renderBuyTab(tab){
 activeBuyTab=tab;const box=$('buyItems');box.replaceChildren();
 document.querySelectorAll('#buyTabs [data-tab]').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
 $('buyCategory').textContent=tab?document.querySelector('#buyTabs [data-tab="'+tab+'"]').textContent.replace(/^\d\s*/,''):'SELECT A CATEGORY';
 if(!tab){box.innerHTML='<div class="armory-intro"><img src="assets/ui/cs16/ak47.png" alt="AK-47"><strong>PREPARE TO FIGHT</strong><p>Pilih kategori, lalu senjata atau perlengkapan. Pembelian hanya tersedia di buy zone.</p><small>1–8 CATEGORY · 9 CANCEL · ESC CLOSE</small></div>'}
 (BUY[tab]||[]).forEach(entry=>{
  const item=getItem(typeof entry==='string'?entry:entry.id),reason=buyReason(item),b=document.createElement('button');
  b.className='buy-item';b.dataset.item=item.id;b.disabled=!!reason;
  const icon=item.id==='nightvision'?'nightvision.svg':item.id.endsWith('Ammo')?'ammo.svg':item.id==='defuse'?'defuse.png':item.id+'.png';
  const cs16Icon=CS16VGUI.icon(item.id);
  b.innerHTML='<img class="buy-icon" src="'+(cs16Icon||'assets/ui/icons/'+icon)+'" alt="'+item.name+'"><div><strong>'+item.name+'</strong><span>'+item.desc+'</span><small>'+(reason||'BUY')+'</small></div><b>$'+item.price+'</b>';
  b.onclick=()=>purchase(item.id);box.appendChild(b);
 });
 $('buyCash').textContent='$'+money;$('buyContext').textContent=playerTeam+' · BUY '+Math.ceil(buyTime);$('buyHint').textContent=tab?'Pilih item untuk membeli':'Pilih kategori di sebelah kiri';
 box.scrollTop=0;
}
function purchase(id){
 const item=getItem(id);if(!item)return false;const reason=buyReason(item);if(reason){$('buyHint').textContent=reason;return false}
 if(W[id]){const slot=W[id].slot;inventory=inventory.filter(k=>W[k].slot!==slot);inventory.splice(slot==='pistol'?0:Math.min(1,inventory.length),0,id);A[id]={mag:W[id].mag,res:W[id].res};setW(inventory.indexOf(id));}
 else if(id==='kevlar')armor=100;
 else if(id==='helmet'){armor=100;helmet=true}
 else if(['flash','he','smoke'].includes(id))grenades[id]++;
 else if(id==='nightvision'){nightVision=true;Phase9.updateHud()}
 else if(id.endsWith('Ammo')){const k=inventory.find(k=>W[k].slot===(id==='primaryAmmo'?'primary':'pistol'));A[k].res=W[k].res}
 money-=item.price;CS16SFX.purchase(item.id);Phase9.updateHud();const scroll=$('buyItems').scrollTop;renderBuyTab(activeBuyTab);$('buyItems').scrollTop=scroll;$('buyHint').textContent='PURCHASED · '+item.name;hud();return true;
}
document.querySelectorAll('#buyTabs [data-tab]').forEach(b=>b.onclick=()=>renderBuyTab(b.dataset.tab));
$('closeBuy').onclick=$('closeBuy2').onclick=$('buyCancel').onclick=closeBuyMenu;
$('buyBack').onclick=()=>renderBuyTab('');$('buybtn').onclick=openBuyMenu;
for(const type of ['pointerdown','pointermove','pointerup','wheel'])$('buyMenu').addEventListener(type,e=>e.stopPropagation());
$('buyMenu').addEventListener('keydown',e=>{
 if(e.code==='Escape'){e.stopPropagation();closeBuyMenu()}
 if(e.code==='Tab'){const focus=[...$('buyMenu').querySelectorAll('button:not(:disabled)')];let n=focus.indexOf(document.activeElement)+(e.shiftKey?-1:1);e.preventDefault();focus[(n+focus.length)%focus.length].focus()}
});
addEventListener('keydown',e=>{if($('buyMenu').classList.contains('hidden'))return;if(/^Digit[1-8]$/.test(e.code)){e.preventDefault();renderBuyTab(Object.keys(BUY)[+e.code[5]-1])}if(e.code==='Digit9')closeBuyMenu()});
const CLASS_NAMES={gign:'GIGN',gsg9:'GSG-9',sas:'SAS',urban:'SEAL TEAM 6',arctic:'ARCTIC AVENGERS',guerilla:'GUERILLA WARFARE',leet:'ELITE CREW',terror:'PHOENIX CONNEXION'};
function showClasses(){
 $('teamScreen').classList.add('hidden');$('classScreen').classList.remove('hidden');$('classTitle').textContent=playerTeam==='CT'?'CT Forces / Choose a class':'Terrorists / Choose a class';
 const names=playerTeam==='CT'?CTN:TN;if(!names.includes(playerClass))playerClass=names[0];
 $('classOptions').replaceChildren();names.forEach((id,i)=>{const b=document.createElement('button');b.dataset.class=id;b.className='class-card'+(playerClass===id?' selected':'');b.innerHTML='<img src="assets/ui/cs16/'+id+'.png" alt="'+CLASS_NAMES[id]+'"><strong>'+(i+1)+' &nbsp; '+CLASS_NAMES[id]+'</strong>';b.onclick=()=>{playerClass=id;document.querySelectorAll('.class-card').forEach(c=>c.classList.toggle('selected',c.dataset.class===id))};$('classOptions').appendChild(b)});
}
function createPlayerClass(){
 if(playerAvatar){S.remove(playerAvatar);playerAvatar.traverse(o=>{if(o.isSkinnedMesh)o.skeleton.dispose()})}
 const gl=(playerTeam==='CT'?CTC:TC)[playerClass];if(!gl)return;
 playerAvatar=THREE.SkeletonUtils.clone(gl.scene);playerAvatar.name='PLAYER_'+playerClass;playerAvatar.visible=false;playerAvatar.position.copy(P.pos);S.add(playerAvatar);
}
$('classBack').onclick=()=>{$('classScreen').classList.add('hidden');$('teamScreen').classList.remove('hidden')};
$('startMatch').onclick=beginMatch;
$('loadBack').onclick=()=>{
 ['loadingScreen','mapScreen','matchConfigScreen','teamScreen','classScreen'].forEach(id=>$(id).classList.add('hidden'));
 over=true;pauseToMenu();$('resumeBtn').classList.add('hidden');
};
$('settingsBtn').onclick=()=>$('settingsScreen').classList.remove('hidden');
$('creditsBtn').onclick=()=>$('creditsScreen').classList.remove('hidden');
$('selectMapBtn').onclick=$('go').onclick;
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>$(b.dataset.close).classList.add('hidden'));
$('pauseBtn').onclick=()=>{pauseToMenu();$('resumeBtn').classList.toggle('hidden',over)};
$('resumeBtn').onclick=()=>{if(!R||over)return;$('menu').classList.add('hidden');document.body.classList.add('playing');running=true;t0=performance.now();resetInputs()};
$('volume').oninput=e=>masterVolume=+e.target.value;
const classicModelsField=$('classicModels');
if(classicModelsField){
 try{classicModelsField.value=localStorage.getItem('block-strike-classic-characters')==='off'?'off':'on'}catch(e){classicModelsField.value='on'}
 classicModelsField.addEventListener('change',()=>{try{localStorage.setItem('block-strike-classic-characters',classicModelsField.value)}catch(e){}});
}
