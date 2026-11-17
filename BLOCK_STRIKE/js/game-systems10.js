/* BLOCK STRIKE TAHAP 10: match configuration, orders, team AI, radio audio,
 * scoreboard roster, and lightweight GoldSrc visual effects.
 * Loaded after game-systems9; no backend or CDN required.
 */
const Phase10=(()=>{
 'use strict';
 const SETTINGS_KEY='block-strike-match-tahap10-v1';
 const PROFILES={
  easy:{label:'Easy',reaction:.95,aim:.63,range:.80,speed:.91,vision:35,scan:.40,hearing:8},
  normal:{label:'Normal',reaction:.50,aim:1,range:1,speed:1,vision:44,scan:.29,hearing:13},
  hard:{label:'Hard',reaction:.23,aim:1.21,range:1.12,speed:1.08,vision:50,scan:.23,hearing:19}
 };
 let config={players:16,difficulty:'normal'},roster=[],statCache=new Map(),playerDeaths=0,roundWinner=null;
 let matchStart=0,grenadeBudget={CT:0,T:0},radioMode=null,radioOpen=false,radioLast=-100,botVoiceLast=-100,radioSeq=0;
 const voiceCache=new Map(),textureCache=new Map(),effects=[];
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 const now=()=>performance.now()/1000;
 const safeNum=n=>Number.isFinite(+n)?Math.floor(+n):16;
 function setConfig(patch,persist=true){
  const players=clamp(safeNum(patch.players??config.players),2,32);
  const difficulty=Object.hasOwn(PROFILES,patch.difficulty)?patch.difficulty:config.difficulty;
  config={players,difficulty};
  const count=$('matchPlayers'),diff=$('matchDifficulty');if(count)count.value=String(players);if(diff)diff.value=difficulty;
  if(persist){try{localStorage.setItem(SETTINGS_KEY,JSON.stringify(config))}catch(e){}}
  preview();return config;
 }
 function counts(team=playerTeam){
  const friends=Math.ceil(config.players/2),foes=config.players-friends;
  return team==='CT'?{CT:friends,T:foes,allies:friends-1,enemies:foes,botCount:config.players-1}:{CT:foes,T:friends,allies:friends-1,enemies:foes,botCount:config.players-1};
 }
 function preview(){
  const c=counts(playerTeam);if($('matchTeamPreview'))$('matchTeamPreview').textContent=`CT ${c.CT} · T ${c.T} · ${c.botCount} bots · ${PROFILES[config.difficulty].label}`;
  if($('matchPerformanceHint'))$('matchPerformanceHint').textContent=config.players>24?'Eksperimental: 25–32 karakter, FPS bergantung perangkat dan peta.':config.players>16?'Pertandingan besar: AI dan grafis memakai pembaruan bertingkat.':'Jumlah termasuk 1 pemain manusia; sisanya bot.';
 }
 function initMatchSettings(){
  try{const saved=JSON.parse(localStorage.getItem(SETTINGS_KEY)||'null');if(saved&&typeof saved==='object')setConfig(saved,false)}catch(e){}
  setConfig(config,false);
  $('matchPlayers')?.addEventListener('input',e=>{if(e.target.value==='')return;setConfig({players:e.target.value})});
  $('matchPlayers')?.addEventListener('change',e=>setConfig({players:e.target.value}));
  $('matchDifficulty')?.addEventListener('change',e=>setConfig({difficulty:e.target.value}));
  document.querySelectorAll('[data-players]').forEach(button=>button.addEventListener('click',()=>setConfig({players:+button.dataset.players})));
  document.querySelectorAll('[data-team]').forEach(button=>button.addEventListener('click',()=>queueMicrotask(preview)));
 }
 function resetMatch(){statCache.clear();roster=[];playerDeaths=0;matchStart=now();roundWinner=null;closeRadio();}
 function roundStart(){roster=[];roundWinner=null;grenadeBudget={CT:0,T:0};radioSeq++;closeRadio()}
 function registerBot(b,sideIndex){
  const id=`${b.team}-${sideIndex}`,prev=statCache.get(id)||{kills:0,deaths:0};
  b.botId=id;b.teamIndex=sideIndex;
  b.name=`${b.team} ${String(sideIndex+1).padStart(2,'0')} · ${(b.name||'BOT').toUpperCase()}`;
  b.skill=PROFILES[config.difficulty];
  b.accuracy=clamp((b.accuracy||.42)*b.skill.aim,.10,.72);
  b.effectiveRange=(b.effectiveRange||42)*b.skill.range;
  b.cd=Math.max(b.cd||0,b.skill.reaction*.6);
  b.aiAccum=(sideIndex%4)*.012;b.scanTimer=(sideIndex%6)*.045;
  b.noticeElapsed=0;b.seenId=null;b.visibleEnemy=null;b.memory=null;b.radioOrder=null;b.grenadeUsed=false;
  const rec={id,team:b.team,name:b.name,bot:b,kills:prev.kills,deaths:prev.deaths,alive:true};
  statCache.set(id,prev);roster.push(rec);return b;
 }
 function onBotDeath(b,killer){
  const rec=roster.find(r=>r.bot===b);if(rec&&rec.alive){rec.alive=false;rec.deaths++;statCache.set(rec.id,{kills:rec.kills,deaths:rec.deaths})}
  if(killer&&killer!==b&&killer.botId){const k=roster.find(r=>r.bot===killer);if(k){k.kills++;statCache.set(k.id,{kills:k.kills,deaths:k.deaths})}}
  if(killer&&killer!==b&&Math.random()<.22)botTalk(killer,'enemy_down')
  if(sbOpen)renderScoreboard();
 }
 function onPlayerDeath(){playerDeaths++;if(sbOpen)renderScoreboard()}
 function renderBoard(){
  const head=$('sbHead'),body=$('sbBody');if(!head||!body)return;
  const all=[{team:playerTeam,name:'★ YOU',kills:kills,deaths:playerDeaths,alive:P.hp>0,hp:Math.max(0,Math.ceil(P.hp)),me:true,bot:null},...roster.map(r=>({...r,hp:r.alive?Math.max(0,Math.ceil(r.bot.hp)):0}))];
  const ct=all.filter(r=>r.team==='CT'),t=all.filter(r=>r.team==='T');
  const alive=team=>team.filter(r=>r.alive).length;
  head.textContent=`BLOCK STRIKE · ROUND ${round} · CT ${alive(ct)}/${ct.length} · T ${alive(t)}/${t.length}`;
  body.replaceChildren();
  for(const [team,rows] of [['CT',ct],['T',t]]){
   const title=document.createElement('div');title.className='sb-team-label '+(team==='CT'?'sb-ct':'sb-t');title.textContent=(team==='CT'?'COUNTER-TERRORISTS':'TERRORISTS')+` · ${alive(rows)} ALIVE / ${rows.length}`;body.appendChild(title);
   rows.sort((a,b)=>Number(b.alive)-Number(a.alive)||b.kills-a.kills||(a.bot?.teamIndex??-1)-(b.bot?.teamIndex??-1));
   for(const r of rows){const row=document.createElement('div');row.className='sb-row '+(team==='CT'?'ct':'t')+(r.alive?'':' dead')+(r.me?' me':'');
    for(const str of [r.name,String(r.kills),String(r.deaths),r.alive?'ALIVE':'DEAD',r.alive?String(r.hp):'0',r.me?'LOCAL':'BOT']){const cell=document.createElement('span');cell.textContent=str;row.appendChild(cell)}body.appendChild(row)}
  }
 }
 function botVec(b,raw){return new THREE.Vector3(raw.x,raw.y,raw.z)}
 function frontOf(b,target){
  const p=b.g.position;const dx=target.x-p.x,dz=target.z-p.z,dist=Math.hypot(dx,dz)||1;
  if(dist<8)return true;
  const facing=new THREE.Vector3(-Math.sin(b.g.rotation.y),0,-Math.cos(b.g.rotation.y));
  return facing.dot(new THREE.Vector3(dx/dist,0,dz/dist))>-.3;
 }
 function selectVisible(b){
  const others=[];
  if(b.team!==playerTeam&&!over&&P.hp>0)others.push({id:'human',pos:P.pos,isP:true,bot:null});
  for(const other of bots){if(other===b||other.dead||other.team===b.team)continue;others.push({id:other.botId||other,bot:other,pos:other.g.position,isP:false})}
  // Limit expensive ray casts: closest six candidates within vision and FOV.
  const pos=b.g.position,vision=b.skill?.vision||44;
  const candidates=others.map(target=>({...target,dist:Math.hypot(target.pos.x-pos.x,target.pos.z-pos.z)}))
   .filter(t=>t.dist<vision&&frontOf(b,t.pos)).sort((a,c)=>a.dist-c.dist).slice(0,6);
  for(const target of candidates){
   if(Phase9.blocksSight(b.g.position,target.pos))continue;
   if(los(b,target.pos))return target;
  }
  return null;
 }
 function seenEnemy(b,dt){
  b.scanTimer=(b.scanTimer||0)-dt;
  if(b.scanTimer<=0){
   const target=selectVisible(b);
   b.scanTimer=(b.skill?.scan||.29)+((b.teamIndex||0)%5)*.011;
   if(target){
    if(b.seenId!==target.id){b.seenId=target.id;b.noticeElapsed=0}
    else b.noticeElapsed+=Math.max(dt,b.scanTimer);
    b.lastSeen={pos:target.pos.clone(),t:now()};
    b.visibleEnemy=b.noticeElapsed>=(b.skill?.reaction||.5)?target:null;
    if(b.visibleEnemy&&!b.spottedNotified){botTalk(b,'target_spotted');b.spottedNotified=true}
   }else{b.visibleEnemy=null;b.seenId=null;b.noticeElapsed=0;b.spottedNotified=false}
  }
  const enemy=b.visibleEnemy;
  if(enemy&&(enemy.isP?P.hp<=0||over:enemy.bot?.dead))return null;
  if(enemy){const pos=enemy.isP?P.pos:enemy.bot.g.position;return {...enemy,pos,dist:Math.hypot(pos.x-b.g.position.x,pos.z-b.g.position.z)}}
  return null;
 }
 function isTargetFresh(b){return b.lastSeen&&(now()-b.lastSeen.t)<(config.difficulty==='hard'?3.7:2.3)}
 function goal(b){
  const ord=b.radioOrder;const p=b.g.position;
  if(ord&&now()>ord.expiresAt)b.radioOrder=null;
  const current=b.radioOrder;
  if(current){
   if(current.mode==='hold')return {pos:current.anchor,mode:'hold',radius:1.2};
   if(current.mode==='attack')return {pos:current.anchor,mode:'attack',radius:4};
   if(current.mode==='backup')return {pos:P.pos,mode:'backup',radius:3.7};
   if(current.mode==='regroup')return {pos:P.pos,mode:'regroup',radius:3.3};
   if(current.mode==='follow'||current.mode==='cover')return {pos:P.pos,mode:current.mode,radius:current.mode==='follow'?5:7};
  }
  if(isTargetFresh(b))return {pos:b.lastSeen.pos,mode:'search',radius:1.4};
  if(b.team===playerTeam)return {pos:P.pos,mode:'follow',radius:7};
  const spawn=activeMapData?.spawn?.[playerTeam==='CT'?'ct':'t'];
  const enemySpawn=spawn?new THREE.Vector3(...spawn):new THREE.Vector3(0,0,playerTeam==='CT'?23:-23);
  // Enemy bots know an objective location, never the hidden live player coordinates.
  const offset=(b.teamIndex||0)%5-2;
  enemySpawn.x+=offset*1.5;enemySpawn.z+=((b.teamIndex||0)%3-1)*1.1;
  return {pos:enemySpawn,mode:'patrol',radius:5.5};
 }
 function maybeBotGrenade(b,tg,dt){
  if(!b||b.dead||b.grenadeUsed||!tg||!running)return false;
  const diff=config.difficulty,likelihood=diff==='hard'?.16:diff==='normal'?.028:.002;
  if(Math.random()>likelihood*dt)return false;
  if(tg.dist<8||tg.dist>19)return false;
  const maxPerTeam=diff==='hard'?Math.max(1,Math.ceil(config.players/12)):1;
  if(grenadeBudget[b.team]>=maxPerTeam)return false;
  if(bots.some(other=>other!==b&&!other.dead&&other.team===b.team&&other.g.position.distanceTo(tg.pos)<6))return false;
  const success=Phase9.throwBotGrenade(b,tg.pos);
  if(success){b.grenadeUsed=true;grenadeBudget[b.team]++;botTalk(b,'attacking',true)}
  return success;
 }
 function command(name){
  if(!running||inputBlocked())return false;
  const t=now();if(t-radioLast<1.05)return false;
  const spec=RADIO_COMMANDS[name];if(!spec)return false;
  radioLast=t;closeRadio();
  const dir=cam?.getWorldDirection(new THREE.Vector3())||new THREE.Vector3(0,0,-1);
  let anchor=P.pos.clone().addScaledVector(dir,23);
  if(name==='attack'){
   // Advance toward a fixed location in the player's view, not the live enemy.
   const lim=worldLim()-1;anchor.x=clamp(anchor.x,-lim,lim);anchor.z=clamp(anchor.z,-lim,lim);
  }
  let changed=0,best=null,closest=Infinity;
  for(const b of bots){if(b.dead||b.team!==playerTeam)continue;
   const dist=b.g.position.distanceTo(P.pos);
   b.radioOrder={mode:name,anchor:name==='hold'?b.g.position.clone():anchor.clone(),expiresAt:t+(name==='attack'?36:55)};
   b.nav=null;b.scanTimer=Math.min(b.scanTimer||0,.03);
   changed++;if(dist<closest){closest=dist;best=b}
  }
  radioPlay('radio',spec.sound,.64);
  const label=`RADIO · ${spec.label}${changed?' · '+changed+' BOT':' · NO ALLIES'}`;
  showRadioText(label);
  if(best){const token=++radioSeq;
   setTimeout(()=>{if(token!==radioSeq||!running||best.dead)return;botTalk(best,name==='backup'?'be_right_there':name==='attack'?'attacking':'roger_that',true)},850+Math.random()*400)
  }
  return changed>0;
 }
 const RADIO_COMMANDS={
  cover:{label:'Cover Me!',sound:'ct_coverme'},follow:{label:'Follow Me!',sound:'followme'},hold:{label:'Hold This Position!',sound:'com_getinpos'},
  attack:{label:'Storm the Front!',sound:'stormfront'},backup:{label:'Need Backup!',sound:'ct_backup'},regroup:{label:'Regroup Team!',sound:'regroup'},
  report:{label:'Report In!',sound:'com_reportin'},enemy:{label:'Enemy Spotted!',sound:'ct_enemys'},roger:{label:'Roger That',sound:'roger'}
 };
 const RADIO_CATEGORIES={z:[['cover','Cover Me'],['follow','Follow Me'],['hold','Hold Position']],x:[['attack','Attack!'],['backup','Need Backup'],['regroup','Regroup']],c:[['report','Report In'],['enemy','Enemy Spotted'],['roger','Roger']]};
 function showRadioText(message){const el=$('radioStatus');if(!el)return;el.textContent=message;el.classList.remove('hidden');const token=++showRadioText.token;setTimeout(()=>{if(token===showRadioText.token)el.classList.add('hidden')},2800)}
 showRadioText.token=0;
 function radioPlay(channel,stem,volume=.5){
  if(!AC||!stem)return;
  const key=channel+'/'+stem;let task=voiceCache.get(key);
  if(!task){task=fetch('assets/phase10/audio/'+key+'.mp3').then(r=>{if(!r.ok)throw Error('radio asset '+r.status);return r.arrayBuffer()}).then(bytes=>AC.decodeAudioData(bytes)).catch(e=>{voiceCache.delete(key);console.warn(e.message);return null});voiceCache.set(key,task)}
  task.then(buffer=>{if(!buffer||!AC||(!running&&!over))return;
   const s=AC.createBufferSource(),g=AC.createGain();s.buffer=buffer;g.gain.value=clamp(volume*masterVolume,0,.9);s.connect(g);g.connect(AC.destination);s.onended=()=>{s.disconnect();g.disconnect()};
   try{s.start()}catch(e){}});
 }
 function botTalk(b,key,urgent=false){
  if(!b||!running||!AC)return false;
  const t=now();if(!urgent&&(t-botVoiceLast<3.4||t-(b.voiceAt||-100)<7))return false;
  if(urgent&&t-botVoiceLast<.8)return false;
  botVoiceLast=t;b.voiceAt=t;
  radioPlay('bot',key,.37);
  if(urgent||Math.random()<.65)showRadioText((b.name||'BOT')+': '+key.replaceAll('_',' ').toUpperCase());
  return true;
 }
 function roundEnd(winner){
  if(roundWinner||!['CT','T'].includes(winner))return;
  roundWinner=winner;
  radioPlay('radio',winner==='CT'?'ctwin':'terwin',.72);
  showRadioText(winner==='CT'?'COUNTER-TERRORISTS WIN':'TERRORISTS WIN');
 }
 function closeRadio(){radioOpen=false;radioMode=null;$('radioOverlay')?.classList.add('hidden')}
 function openRadio(mode='z'){
  if(!running||inputBlocked())return;
  if(radioOpen&&radioMode===mode){closeRadio();return}
  radioOpen=true;radioMode=mode;const box=$('radioCommands');if(!box)return;
  box.replaceChildren();
  for(const [i,[name,label]] of RADIO_CATEGORIES[mode].entries()){
   const button=document.createElement('button');button.className='radio-option';button.textContent=`${i+1}   ${label}`;
   button.addEventListener('click',e=>{e.stopPropagation();if(name==='report'||name==='enemy'||name==='roger'){radioPlay('radio',RADIO_COMMANDS[name].sound,.5);showRadioText('RADIO · '+RADIO_COMMANDS[name].label);closeRadio();return}command(name)});box.appendChild(button)
  }
  $('radioTitle').textContent='RADIO '+mode.toUpperCase()+' · '+({z:'GROUP ORDERS',x:'TEAM ORDERS',c:'REPORTS'}[mode]);
  $('radioOverlay').classList.remove('hidden');
 }
 function setupRadio(){
  for(const mode of ['z','x','c'])$('radioTab'+mode.toUpperCase())?.addEventListener('click',()=>openRadio(mode));
  $('radioBtn')?.addEventListener('click',e=>{e.stopPropagation();openRadio(radioOpen?'x':'z')});
  $('radioClose')?.addEventListener('click',closeRadio);
  $('radioOverlay')?.addEventListener('pointerdown',e=>e.stopPropagation());
  addEventListener('keydown',e=>{
   if(radioOpen){
    if(e.code==='Escape'){e.preventDefault();e.stopImmediatePropagation();closeRadio();return}
    if(/^Digit[1-3]$/.test(e.code)){e.preventDefault();e.stopImmediatePropagation();const name=RADIO_CATEGORIES[radioMode][+e.code[5]-1]?.[0];if(!name)return;if(['report','enemy','roger'].includes(name)){radioPlay('radio',RADIO_COMMANDS[name].sound);showRadioText('RADIO · '+RADIO_COMMANDS[name].label);closeRadio()}else command(name);return}
    if(e.code.startsWith('Key')&&['KeyZ','KeyX','KeyC'].includes(e.code)){e.preventDefault();e.stopImmediatePropagation();openRadio(e.code.slice(3).toLowerCase());return}
   }
   if(!running||inputBlocked())return;
   const modes={KeyZ:'z',KeyX:'x',KeyC:'c'};
   if(modes[e.code]){e.preventDefault();e.stopImmediatePropagation();openRadio(modes[e.code])}
  },true);
  $('scoreBtn')?.addEventListener('click',e=>{e.stopPropagation();if(running)setScoreboard(!sbOpen)});
  $('scoreboard')?.addEventListener('click',()=>{if(isT)setScoreboard(false)});
 }
 function loadTexture(name){
  if(!textureCache.has(name)){textureCache.set(name,new THREE.TextureLoader().load('assets/phase10/fx/'+name+'.png'));}
  return textureCache.get(name);
 }
 function addEffect(sprite,lifetime){effects.push({sprite,lifetime,age:0});}
 function muzzlePlayer(k){
  if(!vm||!viewScene||!R||!k||k==='knife')return;
  const tex=loadTexture('muzzleflash1');
  const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));
  const pos=flash?.position||new THREE.Vector3(.05,.04,-.75);
  sprite.position.copy(pos);sprite.position.z-=.035;sprite.scale.set(.24,.24,1);
  vm.add(sprite);addEffect(sprite,.075);limitEffects(36);
 }
 function muzzleBot(b){
  if(!b?.g||!S)return;
  const tex=loadTexture('muzzleflash2');
  const m=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));
  const forward=new THREE.Vector3(-Math.sin(b.g.rotation.y),0,-Math.cos(b.g.rotation.y));
  m.position.copy(b.g.position).add(new THREE.Vector3(0,1.18,0)).addScaledVector(forward,.6);
  m.scale.set(.38,.38,1);S.add(m);addEffect(m,.11);limitEffects(36);
 }
 function bloodImpact(b,point){
  if(!S||!point)return;
  const ids=['blood_v1_blood1','blood_v1_blood2','blood_v2_blood3'];
  const tex=loadTexture(ids[(Math.random()*ids.length)|0]);
  const m=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthWrite:false,color:0xffffff}));
  m.position.copy(point);m.position.y+=.1;m.scale.set(.7,.65,1);S.add(m);addEffect(m,.75);limitEffects(36);
 }
 function limitEffects(max){while(effects.length>max){const e=effects.shift();e.sprite.parent?.remove(e.sprite);e.sprite.material.dispose()}}
 function updateFX(dt){for(let i=effects.length-1;i>=0;i--){const e=effects[i];e.age+=dt;
  if(e.age>=e.lifetime){e.sprite.parent?.remove(e.sprite);e.sprite.material.dispose();effects.splice(i,1)}
  else e.sprite.material.opacity=clamp((e.lifetime-e.age)/Math.min(e.lifetime,.28),0,1);
 }}
 function clearFX(){for(const e of effects){e.sprite.parent?.remove(e.sprite);e.sprite.material.dispose()}effects.length=0}
 function init(){initMatchSettings();setupRadio()}
 init();
 return {get config(){return config},get profiles(){return PROFILES},counts,setConfig,preview,resetMatch,roundStart,registerBot,onBotDeath,onPlayerDeath,
  renderBoard,seenEnemy,goal,command,maybeBotGrenade,botTalk,roundEnd,closeRadio,muzzlePlayer,muzzleBot,bloodImpact,updateFX,clearFX,getDebugState:()=>({players:config.players,difficulty:config.difficulty,roster:roster.length,orders:roster.filter(r=>r.bot.radioOrder).length,radioOpen,fx:effects.length})};
})();
