/* Optional GoldSrc-style effects imported from user-supplied CS16.Weba ZIPs.
   Audio-only enhancement, never required for game boot or a successful transaction. */
const CS16SFX=(()=>{
 'use strict';
 const supported=new Set([
  'player/pl_step1.wav','player/pl_step2.wav','player/pl_step3.wav','player/pl_step4.wav',
  'player/pl_tile1.wav','player/pl_tile2.wav','player/pl_tile3.wav','player/pl_tile4.wav',
  'player/pl_metal1.wav','player/pl_metal2.wav','player/pl_dirt1.wav','player/pl_dirt2.wav',
  'player/pl_jump1.wav','player/pl_jump2.wav','player/pl_fallpain1.wav',
  'player/pl_pain2.wav','player/pl_pain4.wav','player/bhit_flesh-1.wav',
  'player/bhit_flesh-2.wav','player/bhit_helmet-1.wav','player/bhit_kevlar-1.wav',
  'player/headshot1.wav','player/die1.wav','player/die2.wav',
  'items/kevlar.wav','items/tr_kevlar.wav','items/equip_nvg.wav',
  'items/nvg_on.wav','items/nvg_off.wav'
 ]);
 const extra=new Set(["events/enemy_died.wav", "events/friend_died.wav", "events/task_complete.wav", "events/tutor_msg.wav", "hostage/hos1.wav", "hostage/hos2.wav", "hostage/hos3.wav", "hostage/hos4.wav", "hostage/hos5.wav", "misc/cow.wav", "misc/killChicken.wav", "misc/plane_drone.wav", "misc/sheep.wav", "misc/talk.wav", "plats/vehicle1.wav", "plats/vehicle2.wav", "plats/vehicle3.wav", "plats/vehicle4.wav", "plats/vehicle6.wav", "plats/vehicle7.wav", "plats/vehicle_brake1.wav", "plats/vehicle_ignition.wav", "plats/vehicle_start1.wav", "player/bhit_flesh-3.wav", "player/breathe1.wav", "player/breathe2.wav", "player/death6.wav", "player/die3.wav", "player/headshot2.wav", "player/headshot3.wav", "player/pl_die1.wav", "player/pl_dirt3.wav", "player/pl_dirt4.wav", "player/pl_duct1.wav", "player/pl_duct2.wav", "player/pl_duct3.wav", "player/pl_duct4.wav", "player/pl_fallpain2.wav", "player/pl_fallpain3.wav", "player/pl_grate1.wav", "player/pl_grate2.wav", "player/pl_grate3.wav", "player/pl_grate4.wav", "player/pl_ladder1.wav", "player/pl_ladder2.wav", "player/pl_ladder3.wav", "player/pl_ladder4.wav", "player/pl_metal3.wav", "player/pl_metal4.wav", "player/pl_pain5.wav", "player/pl_pain6.wav", "player/pl_pain7.wav", "player/pl_shell1.wav", "player/pl_shot1.wav", "player/pl_slosh1.wav", "player/pl_slosh2.wav", "player/pl_slosh3.wav", "player/pl_slosh4.wav", "player/pl_snow1.wav", "player/pl_snow2.wav", "player/pl_snow3.wav", "player/pl_snow4.wav", "player/pl_snow5.wav", "player/pl_snow6.wav", "player/pl_swim1.wav", "player/pl_swim2.wav", "player/pl_swim3.wav", "player/pl_swim4.wav", "player/pl_tile5.wav", "player/pl_wade1.wav", "player/pl_wade2.wav", "player/pl_wade3.wav", "player/pl_wade4.wav", "player/sprayer.wav", "radio/blow.wav", "radio/bombdef.wav", "radio/bombpl.wav", "radio/circleback.wav", "radio/clear.wav", "radio/com_followcom.wav", "radio/com_getinpos.wav", "radio/com_go.wav", "radio/com_reportin.wav", "radio/ct_affirm.wav", "radio/ct_backup.wav", "radio/ct_coverme.wav", "radio/ct_enemys.wav", "radio/ct_fireinhole.wav", "radio/ct_imhit.wav", "radio/ct_inpos.wav", "radio/ct_point.wav", "radio/ct_reportingin.wav", "radio/ctwin.wav", "radio/elim.wav", "radio/enemydown.wav", "radio/fallback.wav", "radio/fireassis.wav", "radio/flankthem.wav", "radio/followme.wav", "radio/getout.wav", "radio/go.wav", "radio/hitassist.wav", "radio/hosdown.wav", "radio/letsgo.wav", "radio/locknload.wav", "radio/matedown.wav", "radio/meetme.wav", "radio/moveout.wav", "radio/negative.wav", "radio/position.wav", "radio/regroup.wav", "radio/rescued.wav", "radio/roger.wav", "radio/rounddraw.wav", "radio/sticktog.wav", "radio/stormfront.wav", "radio/takepoint.wav", "radio/terwin.wav", "radio/vip.wav"]);
 let ctx=null,accum=0,seq=0,stepSeq=0,unlocked=false;
 const cache=new Map();
 function audio(){if(!ctx){const AudioCtor=window.AudioContext||window.webkitAudioContext;if(!AudioCtor)return null;try{ctx=new AudioCtor()}catch(_){return null}}return ctx}
 function unlock(){const a=audio();if(a?.state==='suspended')a.resume().catch(()=>{});unlocked=true}
 // Called during input gestures; do not create a WebAudio context on every frame.
 document.addEventListener('pointerdown',unlock,{passive:true});
 document.addEventListener('keydown',unlock,{passive:true});
 function load(file){if(!supported.has(file)&&!extra.has(file))return Promise.resolve(null);
  if(!cache.has(file))cache.set(file,fetch(extra.has(file)?'assets/cs16-extra-sounds/'+file:'assets/cs16-sfx/sound/'+file)
   .then(r=>{if(!r.ok)throw Error('CS16 audio HTTP '+r.status);return r.arrayBuffer()})
   .then(bytes=>audio()?.decodeAudioData(bytes)||null)
   .catch(()=>null));return cache.get(file)}
 function play(file,gain=0.33){if((!supported.has(file)&&!extra.has(file))||!unlocked||document.hidden)return false;
  const a=audio();if(!a)return false;
  load(file).then(buffer=>{if(!buffer||!ctx||ctx.state!=='running')return;
   const setting=document.getElementById('volume'),volume=setting?Math.max(0,Math.min(1,Number(setting.value)||0)):0.8;
   if(volume<=0)return;const source=ctx.createBufferSource(),v=ctx.createGain();v.gain.value=Math.min(1,gain*volume);
   source.buffer=buffer;source.connect(v);v.connect(ctx.destination);
   source.onended=()=>{source.disconnect();v.disconnect()};source.start();
  });return true}
 function step(dt,move,onGround,silent,crouching,surface='generic'){
  if(!onGround||move<0.1||silent){accum=0;return false}
  accum+=Math.min(Math.max(0,dt),0.08)*Math.min(move,1)*(crouching?0.65:1);
  const delay=crouching?0.57:0.38;if(accum<delay)return false;accum-=delay;
  // Original de_dust/other maps might contain various surfaces; a neutral step is safer
  // than claiming to detect a surface type when the physics layer doesn't expose one.
  const base=surface==='dirt'?'pl_dirt':surface==='metal'?'pl_metal':surface==='tile'?'pl_tile':'pl_step';
  return play('player/'+base+(++stepSeq%4+1)+'.wav',crouching?0.12:0.2)
 }
 function jump(){return play('player/pl_jump'+(++seq%2+1)+'.wav',0.18)}
 function hurt({armorUsed=0,hpDamage=0},health,hitgroup){
  if(hpDamage<=0)return false;
  if(health<=0)return play('player/die'+(++seq%3+1)+'.wav',0.33);
  if(hitgroup==='head')return play('player/headshot'+(++seq%3+1)+'.wav',0.3);
  if(armorUsed>0)return play('player/bhit_kevlar-1.wav',0.23);
  return play('player/bhit_flesh-'+(++seq%3+1)+'.wav',0.26)
 }
 function purchase(id){if(id==='nightvision')return play('items/equip_nvg.wav',0.3);
  if(id==='kevlar'||id==='helmet')return play('items/kevlar.wav',0.32);return false}
 function nightVision(on){return play('items/nvg_'+(on?'on':'off')+'.wav',0.23)}
 return Object.freeze({step,jump,hurt,purchase,nightVision,play,has:file=>supported.has(file)||extra.has(file)});
})();
window.CS16SFX=CS16SFX;
