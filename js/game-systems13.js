/* BLOCK STRIKE Tahap 13: classic walk, spectator, flashlight, loadout UI,
   team changes, blood decals and persistent presentation settings. */
const Phase13=(()=>{
 'use strict';
 let spectating=false,observed=null,spectatorView=null,spectatorKey='',queuedTeam=null,deadThisRound=false;
 let flashlight=null,flashTarget=null,lightEnabled=false,hand='right',returningToGame=false;
 const bloodDecals=[],bloodBursts=[];
 const moveSpeeds={knife:7.0,awp:4.0,scout:6.1,m249:4.65,shield:5.0,g3sg1:4.9,sg550:5.25,aug:5.35,sg552:5.4,ak47:5.55,m4a1:5.55};
 function moveSpeed(k){return moveSpeeds[k]||6.1}
 function isSpectating(){return spectating}
 function visibleOverlay(){return ['weaponOverlay','teamOverlay','settingsScreen'].some(id=>!$(id).classList.contains('hidden'))}
 function blocked(){return !running||spectating||visibleOverlay()||over}
 function applyHand(model){if(model)model.scale.x=hand==='left'?-Math.abs(model.scale.x||1):Math.abs(model.scale.x||1)}
 function setHand(next){hand=next==='left'?'left':'right';$('weaponHand').value=hand;applyHand(vm);applyHand(spectatorView);try{localStorage.setItem('bs13-weapon-hand',hand)}catch(e){}}
 function bindLight(camera){if(!camera)return;
  const light=new THREE.SpotLight(0xfff1cb,2.4,58,Math.PI/7,.45,1.15);
  light.visible=false;light.castShadow=false;light.position.set(0,-.07,.15);
  const target=new THREE.Object3D();target.position.set(0,-.08,-14);camera.add(light,target);light.target=target;
  flashlight=light;flashTarget=target;
 }
 function toggleFlashlight(){if(blocked())return false;lightEnabled=!lightEnabled;
  if(flashlight)flashlight.visible=lightEnabled;
  $('flashBtn').classList.toggle('active',lightEnabled);say(lightEnabled?'FLASHLIGHT ON':'FLASHLIGHT OFF');return true}
 function renderWeaponSelector(){const host=$('weaponItems');host.replaceChildren();
  const cats=[['PRIMARY',inventory.filter(k=>W[k]?.slot==='primary')],['SECONDARY',inventory.filter(k=>W[k]?.slot==='pistol')],['KNIFE',inventory.filter(k=>k==='knife')],['EQUIPMENT',inventory.filter(k=>k==='shield')]];
  for(const [label,weapons] of cats){if(!weapons.length)continue;
   const title=document.createElement('b');title.textContent=label;host.appendChild(title);
   for(const k of weapons){const button=document.createElement('button');button.className='weapon-choice';button.type='button';button.dataset.weapon=k;
    const img=document.createElement('img');img.src='assets/ui/icons/'+k+'.png';img.alt='';img.onerror=()=>{img.hidden=true};button.append(img);
    const text=document.createElement('span');text.textContent=W[k].n;button.append(text);
    if(k===cur())button.classList.add('active');button.addEventListener('click',()=>{const i=inventory.indexOf(k);if(i>=0)setW(i);closeWeaponSelector()});host.appendChild(button)
   }
  }
  const g=document.createElement('b');g.textContent='GRENADES';host.append(g);
  for(const type of ['he','flash','smoke']){const b=document.createElement('button');b.className='weapon-choice';b.disabled=!grenades[type];b.textContent=`${type.toUpperCase()} · ${grenades[type]}`;b.onclick=()=>{selectedGrenade=type;Phase9.updateHud();closeWeaponSelector()};host.append(b)}
 }
 function closeWeaponSelector(){$('weaponOverlay').classList.add('hidden')}
 function openWeaponSelector(){if(!running||spectating)return;Phase10.closeRadio();renderWeaponSelector();$('weaponOverlay').classList.remove('hidden')}
 function closeTeamMenu(){$('teamOverlay').classList.add('hidden')}
 function openTeamMenu(){if(!running)return;Phase10.closeRadio();$('teamOverlay').classList.remove('hidden');$('teamQueued').textContent=queuedTeam?'Queued: '+queuedTeam:''}
 function queueTeam(team){if(team!=='CT'&&team!=='T')return false;queuedTeam=team===playerTeam?null:team;closeTeamMenu();say(queuedTeam?`SWITCH TO ${queuedTeam} NEXT ROUND`:'TEAM SWITCH CANCELLED');return true}
 function resetSpecView(){if(observed?.g)observed.g.visible=true;observed=null;
  if(spectatorView){viewScene?.remove(spectatorView);spectatorView=null}spectatorKey='';}
 function resetMatch(){spectating=false;deadThisRound=false;queuedTeam=null;resetSpecView();$('spectatorHud').classList.add('hidden');document.body.classList.remove('spectating');
  lightEnabled=false;if(flashlight)flashlight.visible=false;$('flashBtn').classList.remove('active');clearBlood()}
 function beforeRound(){const changed=!!queuedTeam&&queuedTeam!==playerTeam;
  if(changed){playerTeam=queuedTeam;playerClass=(playerTeam==='CT'?'gign':'arctic');Phase10.resetMatch();money=800}
  if(deadThisRound||changed){armor=0;helmet=false;defuseKit=false;nightVision=false;grenades={he:0,flash:0,smoke:0};
   inventory=[playerTeam==='CT'?'usp':'glock18','knife'];wi=0;
   for(const key of inventory)A[key]={mag:W[key].mag,res:W[key].res};
   setW(0);Phase9.resetMatch();}
  queuedTeam=null;spectating=false;deadThisRound=false;resetSpecView();$('spectatorHud').classList.add('hidden');document.body.classList.remove('spectating');
  if(vm)vm.visible=true;
  if(flashlight)flashlight.visible=lightEnabled;
  clearBlood();if(typeof Phase10!=='undefined')Phase10.preview();
 }
 function aliveBots(){return bots.filter(b=>!b.dead&&b.hp>0)}
 function pickBot(direction=1){const all=aliveBots();if(!all.length){resetSpecView();$('specName').textContent='ROUND ENDED';$('specInfo').textContent='Waiting for next round';return null}
  const preferred=all.filter(b=>b.team===playerTeam);const list=preferred.length&&direction===0?preferred:all;
  const index=list.indexOf(observed);const next=list[(index+direction+list.length)%list.length]||list[0];
  if(next!==observed){resetSpecView();observed=next;observed.g.visible=false;loadSpectatorWeapon(next)}
  $('specName').textContent=next.name||next.team+' BOT';$('specInfo').textContent=`${next.team} · HP ${Math.ceil(next.hp)} · ${W[next.weaponId]?.n||'KNIFE'}`;return next
 }
 function loadSpectatorWeapon(bot){const id=bot.weaponId||'knife';const expected=spectatorKey=id+'@'+(bot.botId||bot.name);
  ensureWeaponModel(id).then(g=>{if(!spectating||!observed||spectatorKey!==expected||!viewScene)return;
   if(spectatorView)viewScene.remove(spectatorView);
   const orig=weaponModels[id]?.scene||g;const model=THREE.SkeletonUtils?.clone?THREE.SkeletonUtils.clone(orig):orig.clone(true);
   spectatorView=new THREE.Group();spectatorView.add(model);applyHand(spectatorView);viewScene.add(spectatorView)
  }).catch(()=>{});
 }
 function onDeath(){if(spectating)return;
  deadThisRound=true;spectating=true;aiming=false;zoomIdx=0;syncAim();
  if(vm)vm.visible=false;if(flashlight)flashlight.visible=false;
  document.body.classList.add('spectating');$('spectatorHud').classList.remove('hidden');pickBot(0);say('ELIMINATED · SPECTATOR MODE');
 }
 function updateSpectator(dt){if(!spectating)return;
  if(!observed||observed.dead||observed.hp<=0||!observed.g.parent){pickBot(1)}
  const b=observed;if(!b)return;
  cam.position.copy(b.g.position).add(new THREE.Vector3(0,b.crouching?1.14:1.57,0));
  let yaw=b.g.rotation.y,pitch=0;
  if(b.visibleEnemy?.pos){const p=b.visibleEnemy.pos,dx=p.x-cam.position.x,dz=p.z-cam.position.z;
   yaw=Math.atan2(-dx,-dz);pitch=Math.atan2(cam.position.y-(p.y+1.1),Math.hypot(dx,dz))}
  cam.rotation.set(pitch,yaw,0,'YXZ');if(cam.fov!==baseFov){cam.fov=baseFov;cam.updateProjectionMatrix()}
  if(window.bspSky)window.bspSky.position.copy(cam.position);
  const key=(b.weaponId||'knife')+'@'+(b.botId||b.name);
  if(spectatorKey!==key){resetSpecView();observed=b;observed.g.visible=false;loadSpectatorWeapon(b)}
  $('specInfo').textContent=`${b.team} · HP ${Math.max(0,Math.ceil(b.hp))} · ${W[b.weaponId]?.n||'KNIFE'}`;
 }
 function checkRoundEnd(){if(!running||roundWait>0||round<1)return;
  const aliveCT=bots.some(b=>!b.dead&&b.team==='CT')||(playerTeam==='CT'&&P.hp>0);
  const aliveT=bots.some(b=>!b.dead&&b.team==='T')||(playerTeam==='T'&&P.hp>0);
  if(!aliveCT||!aliveT){const winner=aliveCT?'CT':aliveT?'T':null;
   if(winner)Phase10.roundEnd(winner);roundWait=3;
  }
 }
 function openSettings(){if(!running||spectating)return;
  returningToGame=true;running=false;resetInputs();$('settingsScreen').classList.remove('hidden');if(document.pointerLockElement)document.exitPointerLock()}
 function closeSettings(){if(!returningToGame)return;returningToGame=false;
  if(!over){running=true;t0=performance.now();resetInputs()}}
 const bloodTexCache=new Map();function bloodTexture(id){if(!bloodTexCache.has(id)){const tex=new THREE.TextureLoader().load('assets/phase10/fx/'+id+'.png');bloodTexCache.set(id,tex)}return bloodTexCache.get(id)}
 function bloodHit(bot,hit,head=false){if(!S||!hit)return;
  const pos=hit.clone();const toward=pos.clone().sub(cam.position).normalize();
  const img=head?'blood_v1_bigblood1':'blood_v1_bigblood2';
  // Spray clusters follow bullet impact; bounded lifetime and bounded count.
  for(let n=0;n<(head?5:3);n++){
   const tex=bloodTexture(n%2?'blood_v1_blood1':'blood_v1_blood3');
   const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthWrite:false,opacity:.92,color:0xffffff}));
   sprite.position.copy(pos).add(new THREE.Vector3((Math.random()-.5)*.4,(Math.random()-.5)*.5,(Math.random()-.5)*.4));
   const scale=.2+Math.random()*.28;sprite.scale.set(scale,scale,1);S.add(sprite);
   bloodBursts.push({obj:sprite,age:0,life:.28+Math.random()*.35});
  }
  const rayBlood=new THREE.Raycaster(pos.clone().addScaledVector(toward,.03),toward,.01,3.5);
  const surface=rayBlood.intersectObjects(obsM,false)[0];
  if(surface){const geo=new THREE.PlaneGeometry(head?1.2:.8,head?1.2:.8);
   const mat=new THREE.MeshBasicMaterial({map:bloodTexture(img),transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,side:THREE.DoubleSide,opacity:.92});
   const decal=new THREE.Mesh(geo,mat);const normal=(surface.face?.normal||new THREE.Vector3(0,0,1)).clone().transformDirection(surface.object.matrixWorld);
   decal.position.copy(surface.point).addScaledVector(normal,.018);decal.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),normal);decal.rotateZ(Math.random()*6.28);S.add(decal);bloodDecals.push(decal);
   while(bloodDecals.length>20){const old=bloodDecals.shift();S.remove(old);old.geometry.dispose();old.material.dispose()}
  }
  while(bloodBursts.length>26){const o=bloodBursts.shift();S.remove(o.obj);o.obj.material.dispose()}
 }
 function updateBlood(dt){for(let i=bloodBursts.length-1;i>=0;i--){const b=bloodBursts[i];b.age+=dt;b.obj.material.opacity=Math.max(0,.92*(1-b.age/b.life));if(b.age>=b.life){S.remove(b.obj);b.obj.material.dispose();bloodBursts.splice(i,1)}}}
 function clearBlood(){for(const d of bloodDecals){S?.remove(d);d.material.dispose();d.geometry.dispose()}bloodDecals.length=0;
  for(const p of bloodBursts){S?.remove(p.obj);p.obj.material.dispose()}bloodBursts.length=0}
 function setup(){try{hand=localStorage.getItem('bs13-weapon-hand')==='left'?'left':'right'}catch(e){}$('weaponHand').value=hand;
  try{const settings=JSON.parse(localStorage.getItem('bs13-preferences')||'null');if(settings){
    if(['0','1','2'].includes(String(settings.q)))$('q').value=String(settings.q);
    if([.003,.0045,.007].includes(Number(settings.sens)))$('sn').value=String(settings.sens);
    if(Number.isFinite(settings.volume)){$('volume').value=String(Math.max(0,Math.min(1,settings.volume)));masterVolume=+$('volume').value;}
  }}catch(e){}
  const persist=()=>{try{localStorage.setItem('bs13-preferences',JSON.stringify({q:$('q').value,sens:$('sn').value,volume:+$('volume').value}))}catch(e){}};
  for(const [id,event] of [['q','change'],['sn','change'],['volume','input']])$(id).addEventListener(event,persist);

  $('weaponHand').addEventListener('change',e=>setHand(e.target.value));
  $('flashBtn').addEventListener('click',e=>{e.stopPropagation();toggleFlashlight()});
  $('dropBtn').addEventListener('click',e=>{e.stopPropagation();Phase9.dropPlayerWeapon()});
  $('teamBtn').addEventListener('click',e=>{e.stopPropagation();openTeamMenu()});
  $('settingsGameBtn').addEventListener('click',e=>{e.stopPropagation();openSettings()});
  $('weaponBtn').addEventListener('click',e=>{e.stopPropagation();openWeaponSelector()});
  $('weaponClose').onclick=closeWeaponSelector;$('teamClose').onclick=closeTeamMenu;
  for(const b of document.querySelectorAll('[data-switch-team]'))b.addEventListener('click',()=>queueTeam(b.dataset.switchTeam));
  $('specNext').addEventListener('click',()=>pickBot(1));$('specPrev').addEventListener('click',()=>pickBot(-1));
  for(const el of [$('weaponOverlay'),$('teamOverlay'),$('spectatorHud')])for(const event of ['pointerdown','pointermove','pointerup','wheel'])el.addEventListener(event,e=>e.stopPropagation());
  $('settingsScreen').querySelector('[data-close]').addEventListener('click',closeSettings);
  addEventListener('keydown',e=>{
   if(e.code==='KeyF'&&running&&!e.repeat)toggleFlashlight();
   if(e.code==='KeyQ'&&running&&!e.repeat)Phase9.dropPlayerWeapon();
   if(e.code==='KeyM'&&running&&!e.repeat)openTeamMenu();
   if(spectating&&e.code==='ArrowRight')pickBot(1);
   if(spectating&&e.code==='ArrowLeft')pickBot(-1);
   if(e.code==='Escape'){closeWeaponSelector();closeTeamMenu()}
  });
 }
 setup();
 return {moveSpeed,isSpectating,visibleOverlay,applyHand,setHand,bindLight,toggleFlashlight,
  resetMatch,beforeRound,onDeath,updateSpectator,checkRoundEnd,openSettings,closeSettings,
  openWeaponSelector,closeWeaponSelector,openTeamMenu,queueTeam,dropPlayerWeapon:()=>Phase9.dropPlayerWeapon(),bloodHit,updateBlood,clearBlood,
  getDebugState:()=>({spectating,observed:observed?.botId||null,queuedTeam,lightEnabled,hand,bloodDecals:bloodDecals.length,bloodBursts:bloodBursts.length})};
})();
