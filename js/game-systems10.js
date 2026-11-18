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
 const CS16_RADIO_WAV=new Set(["blow", "bombdef", "bombpl", "circleback", "clear", "com_followcom", "com_getinpos", "com_go", "com_reportin", "ct_affirm", "ct_backup", "ct_coverme", "ct_enemys", "ct_fireinhole", "ct_imhit", "ct_inpos", "ct_point", "ct_reportingin", "ctwin", "elim", "enemydown", "fallback", "fireassis", "flankthem", "followme", "getout", "go", "hitassist", "hosdown", "letsgo", "locknload", "matedown", "meetme", "moveout", "negative", "position", "regroup", "rescued", "roger", "rounddraw", "sticktog", "stormfront", "takepoint", "terwin", "vip"]);

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
  const id=`${b.team}-${sideIndex}`,prev=statCache.get(id)||{kills:0,deaths:0,money:800};
  b.botId=id;b.teamIndex=sideIndex;
  b.name=`${b.team} ${String(sideIndex+1).padStart(2,'0')} · ${(window.CS16BotData?.nameFor(b.team,sideIndex)||b.name||'BOT').toUpperCase()}`;
  b.skill=PROFILES[config.difficulty];
  b.accuracy=clamp((b.accuracy||.42)*b.skill.aim,.10,.72);
  b.effectiveRange=(b.effectiveRange||42)*b.skill.range;
  b.cd=Math.max(b.cd||0,b.skill.reaction*.6);
  b.aiAccum=(sideIndex%4)*.012;b.scanTimer=(sideIndex%6)*.045;
  b.money=clamp(prev.money??800,0,16000);b.armor=prev.armor??0;b.helmet=prev.helmet??false;
  b.noticeElapsed=0;b.seenId=null;b.visibleEnemy=null;b.memory=null;b.radioOrder=null;b.grenadeUsed=false;
  const rec={id,team:b.team,name:b.name,bot:b,kills:prev.kills,deaths:prev.deaths,money:b.money,alive:true};
  statCache.set(id,prev);roster.push(rec);return b;
 }
 // Each side keeps individual money across rounds; $800 is the first-round balance.
 function creditBot(b,amount,reason=''){
  if(!b||!b.botId||amount<=0)return 0;
  const value=Math.floor(amount);b.money=clamp((b.money??800)+value,0,16000);
  const rec=roster.find(r=>r.bot===b),stored=statCache.get(b.botId)||{kills:0,deaths:0};
  stored.money=b.money;statCache.set(b.botId,stored);
  if(rec)rec.money=b.money;
  return b.money;
 }
 function prepareBotRound(b){
  if(!b)return;
  const pistol=b.team==='CT'?'usp':'glock18';
  // Round one always starts with the free pistol (never a randomly assigned rifle).
  let chosen=pistol;
  if(round>1){
   const team=b.team,limit=clamp((b.money??800)-Math.min(650,(b.money??800)*.17),0,16000);
   const options=team==='CT'?['m4a1','famas','mp5','aug','ump45','p90','scout','awp','m249']
    :['ak47','galil','mac10','mp5','ump45','p90','scout','awp','m249'];
   const affordable=options.filter(id=>W[id]&&W[id].price<=limit);
   if(affordable.length){
    const preferred=affordable.filter(id=>['ak47','m4a1','famas','galil','mp5','aug'].includes(id));
    const pool=preferred.length?preferred:affordable;
    chosen=pool[(b.teamIndex+round*3)%pool.length];
    b.money-=W[chosen].price;
   }else if(b.money>=W.deagle.price+300&&((b.teamIndex+round)%3===0)){
    chosen='deagle';b.money-=W.deagle.price;
   }
   // Save armor across rounds and only purchase missing protection.
   if(!b.helmet&&b.armor>30&&b.money>=350){b.helmet=true;b.money-=350;}
   if(b.armor<60){
    if(!b.helmet&&b.money>=1000){b.armor=100;b.helmet=true;b.money-=1000;}
    else if(b.money>=650){b.armor=100;b.money-=650;}
   }
  }else {b.armor=0;b.helmet=false;}
  const stored=statCache.get(b.botId);if(stored){stored.money=b.money;stored.armor=b.armor;stored.helmet=b.helmet;}
  const rec=roster.find(r=>r.bot===b);if(rec)rec.money=b.money;
  equipBot(b,b.teamIndex,chosen);
 }
 function onBotDeath(b,killer){
  const rec=roster.find(r=>r.bot===b);
  if(rec&&rec.alive){rec.alive=false;rec.deaths++;const st=statCache.get(rec.id)||{};Object.assign(st,{kills:rec.kills,deaths:rec.deaths,money:b.money,armor:b.armor,helmet:b.helmet});statCache.set(rec.id,st)}
  if(killer&&killer!==b&&killer.botId&&killer.team!==b.team){
   const k=roster.find(r=>r.bot===killer);if(k){k.kills++;const st=statCache.get(k.id)||{};st.kills=k.kills;statCache.set(k.id,st);creditBot(killer,300,'KILL')}
  }
  if(killer&&killer!==b&&Math.random()<.22)botTalk(killer,'enemy_down');
  if(sbOpen)renderScoreboard();
 }
 function onPlayerDeath(killer){
  playerDeaths++;
  if(killer?.botId&&killer.team!==playerTeam){
   const rec=roster.find(r=>r.bot===killer);if(rec){rec.kills++;const st=statCache.get(rec.id)||{};st.kills=rec.kills;statCache.set(rec.id,st);creditBot(killer,300,'KILL HUMAN')}
  }
  if(sbOpen)renderScoreboard();
 }
 function renderBoard(){
  const head=$('sbHead'),body=$('sbBody');if(!head||!body)return;
  const all=[{team:playerTeam,name:'★ YOU',kills:kills,deaths:playerDeaths,money,alive:P.hp>0,hp:Math.max(0,Math.ceil(P.hp)),me:true,bot:null},
   ...roster.map(r=>({...r,money:r.bot.money??800,hp:r.alive?Math.max(0,Math.ceil(r.bot.hp)):0}))];
  const ct=all.filter(r=>r.team==='CT'),t=all.filter(r=>r.team==='T');
  const alive=team=>team.filter(r=>r.alive).length;
  head.textContent=`BLOCK STRIKE · ROUND ${round} · CT ${alive(ct)}/${ct.length} · T ${alive(t)}/${t.length}`;
  body.replaceChildren();
  for(const [team,rows] of [['CT',ct],['T',t]]){
   const panel=document.createElement('section');panel.className='sb-team-column '+(team==='CT'?'sb-ct':'sb-t');
   panel.setAttribute('aria-label',team==='CT'?'Counter-Terrorists':'Terrorists');
   const title=document.createElement('div');title.className='sb-team-label';
   title.textContent=(team==='CT'?'COUNTER-TERRORISTS':'TERRORISTS')+` · ${alive(rows)}/${rows.length}`;
   const cols=document.createElement('div');cols.className='sb-mini-head';
   for(const label of ['PLAYER','K','D','$','HP']){const cell=document.createElement('span');cell.textContent=label;cols.appendChild(cell)}
   const list=document.createElement('div');list.className='sb-team-rows';
   rows.sort((a,b)=>Number(b.alive)-Number(a.alive)||b.kills-a.kills||(a.bot?.teamIndex??-1)-(b.bot?.teamIndex??-1));
   for(const r of rows){const row=document.createElement('div');row.className='sb-compact-row '+(r.alive?'':'dead')+(r.me?' me':'');
    for(const str of [r.name,String(r.kills),String(r.deaths),'$'+(r.money??800),r.alive?String(r.hp):'DEAD']){
     const cell=document.createElement('span');cell.textContent=str;cell.title=str;row.appendChild(cell)}list.appendChild(row)}
   panel.append(title,cols,list);body.appendChild(panel);
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
   if(current.mode==='retreat')return {pos:current.anchor,mode:'retreat',radius:4};
   if(current.mode==='follow'||current.mode==='cover')return {pos:P.pos,mode:current.mode,radius:current.mode==='follow'?5:7};
  }
  if(isTargetFresh(b))return {pos:b.lastSeen.pos,mode:'search',radius:1.4};
  if(b.team===playerTeam)return {pos:P.pos,mode:'follow',radius:7};
  const spawn=activeMapData?.spawn?.[playerTeam==='CT'?'ct':'t'];
  const enemySpawn=spawn?new THREE.Vector3(...spawn):new THREE.Vector3(0,0,playerTeam==='CT'?23:-23);
  // Enemy bots roam successive visible map points instead of freezing forever
  // when they arrive at the human team's starting area. This never uses the
  // player's live location or grants wall vision.
  const offset=(b.teamIndex||0)%5-2;
  enemySpawn.x+=offset*1.5;enemySpawn.z+=((b.teamIndex||0)%3-1)*1.1;
  const time=now(),reached=b.patrolGoal&&p.distanceTo(b.patrolGoal)<2.6;
  if(!b.patrolGoal||reached||time>=(b.patrolDeadline||0)){
   b.patrolIndex=(b.patrolIndex||0)+1;
   const angle=(b.teamIndex||0)*2.4+b.patrolIndex*2.36;
   const radius=4+((b.patrolIndex+(b.teamIndex||0))%3)*3;
   const candidate=enemySpawn.clone().add(new THREE.Vector3(Math.cos(angle)*radius,0,Math.sin(angle)*radius));
   if(window.bspCol){
    candidate.y=BSP.snapSpawn(bspCol,candidate.x,candidate.z);
    if(!BSP.canStand(bspCol,candidate))candidate.copy(enemySpawn);
   }
   b.patrolGoal=candidate;b.patrolDeadline=time+7+(b.teamIndex%4);
  }
  return {pos:b.patrolGoal,mode:'patrol',radius:2.2};
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
  if(!spec.behavior){
   closeRadio();radioPlay('radio',spec.sound,.55);showRadioText('RADIO · '+spec.label);
   if(name==='report'){
    // "Report in" requests a situational response, but reveals no hidden enemy.
    const ally=bots.filter(b=>!b.dead&&b.team===playerTeam).sort((a,b)=>a.g.position.distanceTo(P.pos)-b.g.position.distanceTo(P.pos))[0];
    if(ally)botTalk(ally,ally.visibleEnemy?'target_spotted':'sector_clear',true);
   }
   return true;
  }
  radioLast=t;closeRadio();
  const dir=cam?.getWorldDirection(new THREE.Vector3())||new THREE.Vector3(0,0,-1);
  let anchor=P.pos.clone().addScaledVector(dir,23);
  if(spec.behavior==='attack'){
   // Advance toward a fixed location in the player's view, not the live enemy.
   const lim=worldLim()-1;anchor.x=clamp(anchor.x,-lim,lim);anchor.z=clamp(anchor.z,-lim,lim);
  }
  if(spec.behavior==='retreat'){const spawn=activeMapData?.spawn?.[playerTeam==='CT'?'ct':'t'];if(spawn)anchor=new THREE.Vector3(...spawn);else anchor=P.pos.clone().addScaledVector(dir,-15)}
  let changed=0,best=null,closest=Infinity;
  for(const b of bots){if(b.dead||b.team!==playerTeam)continue;
   const dist=b.g.position.distanceTo(P.pos);
   b.radioOrder={mode:spec.behavior,anchor:spec.behavior==='hold'?b.g.position.clone():anchor.clone(),expiresAt:t+(spec.behavior==='attack'?36:55)};
   b.nav=null;b.scanTimer=Math.min(b.scanTimer||0,.03);
   changed++;if(dist<closest){closest=dist;best=b}
  }
  radioPlay('radio',spec.sound,.64);
  const label=`RADIO · ${spec.label}${changed?' · '+changed+' BOT':' · NO ALLIES'}`;
  showRadioText(label);
  if(best){const token=++radioSeq;
   setTimeout(()=>{if(token!==radioSeq||!running||best.dead)return;botTalk(best,spec.behavior==='backup'?'be_right_there':spec.behavior==='attack'?'attacking':'roger_that',true)},850+Math.random()*400)
  }
  return changed>0;
 }
 // These commands are backed by audio files in assets/phase10/audio/radio.
 // State-changing commands have a behavior; announcements are voice-only.
 const RADIO_COMMANDS={
  cover:{label:'Cover Me!',sound:'ct_coverme',behavior:'cover'},
  takepoint:{label:'You Take the Point!',sound:'takepoint',behavior:'attack'},
  hold:{label:'Hold This Position!',sound:'com_getinpos',behavior:'hold'},
  regroup:{label:'Regroup Team!',sound:'regroup',behavior:'regroup'},
  follow:{label:'Follow Me!',sound:'followme',behavior:'follow'},
  takingfire:{label:'Taking Fire, Need Assistance!',sound:'fireassis',behavior:'backup'},
  go:{label:'Go Go Go!',sound:'go',behavior:'attack'},
  fallback:{label:'Team Fall Back!',sound:'fallback',behavior:'retreat'},
  stick:{label:'Stick Together!',sound:'sticktog',behavior:'follow'},
  getinpos:{label:'Get in Position!',sound:'com_getinpos',behavior:'hold'},
  attack:{label:'Storm the Front!',sound:'stormfront',behavior:'attack'},
  report:{label:'Report In!',sound:'com_reportin'},
  roger:{label:'Roger That!',sound:'roger'},
  enemy:{label:'Enemy Spotted!',sound:'ct_enemys'},
  backup:{label:'Need Backup!',sound:'ct_backup',behavior:'backup'},
  sectorclear:{label:'Sector Clear!',sound:'clear'},
  inpos:{label:"I'm in Position!",sound:'ct_inpos'},
  reporting:{label:'Reporting In!',sound:'ct_reportingin'},
  negative:{label:'Negative!',sound:'negative'},
  enemydown:{label:'Enemy Down!',sound:'enemydown'},
  moveout:{label:'Move Out!',sound:'moveout',behavior:'attack'},
  letsgo:{label:"Let's Go!",sound:'letsgo',behavior:'attack'},
  circleback:{label:'Circle Back!',sound:'circleback',behavior:'retreat'},
  meetme:{label:'Meet Me!',sound:'meetme',behavior:'regroup'},
  followcom:{label:'Follow Commander!',sound:'com_followcom',behavior:'follow'},
  fireinhole:{label:'Fire in the Hole!',sound:'ct_fireinhole'},
  imhit:{label:"I'm Hit!",sound:'ct_imhit'},
  locknload:{label:'Lock and Load!',sound:'locknload'},
  matedown:{label:'Teammate Down!',sound:'matedown'},
  getout:{label:'Get Out!',sound:'getout',behavior:'retreat'},
  position:{label:'Take Position!',sound:'position',behavior:'hold'},
  ctpoint:{label:'Take the Point!',sound:'ct_point',behavior:'attack'},
  ctaffirm:{label:'Affirmative!',sound:'ct_affirm'}
 };
 const RADIO_CATEGORIES={
  z:['cover','takepoint','hold','regroup','follow','takingfire','meetme','followcom','position'],
  x:['go','fallback','stick','getinpos','attack','report','moveout','letsgo','circleback'],
  c:['roger','enemy','backup','sectorclear','inpos','reporting','negative','enemydown','fireinhole'],
  more:['imhit','locknload','matedown','getout','ctpoint','ctaffirm']
 };
 function selectRadio(index){const name=RADIO_CATEGORIES[radioMode]?.[index];if(name)command(name);return !!name}
 function showRadioText(message){const el=$('radioStatus');if(!el)return;el.textContent=message;el.classList.remove('hidden');const token=++showRadioText.token;setTimeout(()=>{if(token===showRadioText.token)el.classList.add('hidden')},2800)}
 showRadioText.token=0;
 function radioPlay(channel,stem,volume=.5){
  if(!AC||!stem)return;
  const key=channel+'/'+stem;let task=voiceCache.get(key);
  if(!task){task=fetch(channel==='radio'&&CS16_RADIO_WAV.has(stem)?'assets/cs16-extra-sounds/radio/'+stem+'.wav':'assets/phase10/audio/'+key+'.mp3').then(r=>{if(!r.ok)throw Error('radio asset '+r.status);return r.arrayBuffer()}).then(bytes=>AC.decodeAudioData(bytes)).catch(e=>{voiceCache.delete(key);console.warn(e.message);return null});voiceCache.set(key,task)}
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
  for(const rec of roster){creditBot(rec.bot,rec.team===winner?3250:1400,'ROUND PAYOUT')}
  if(sbOpen)renderScoreboard();
  radioPlay('radio',winner==='CT'?'ctwin':'terwin',.72);
  showRadioText(winner==='CT'?'COUNTER-TERRORISTS WIN':'TERRORISTS WIN');
 }
 function closeRadio(){radioOpen=false;radioMode=null;$('radioOverlay')?.classList.add('hidden')}
 function openRadio(mode='z'){
  if(!running||inputBlocked())return;
  if(!RADIO_CATEGORIES[mode])mode='z';
  radioOpen=true;radioMode=mode;const box=$('radioCommands');if(!box)return;
  box.replaceChildren();
  for(const [i,name] of RADIO_CATEGORIES[mode].entries()){
   const spec=RADIO_COMMANDS[name];if(!spec)continue;
   const button=document.createElement('button');button.className='radio-option';
   button.textContent=`${(i+1)%10}   ${spec.label}`;
   button.addEventListener('click',e=>{e.stopPropagation();selectRadio(i)});box.appendChild(button);
  }
  $('radioTitle').textContent='RADIO '+mode.toUpperCase()+' · '+({z:'GROUP ORDERS',x:'TEAM ORDERS',c:'REPORTS',more:'EXTRA VOICES'}[mode]);
  for(const [key,btn] of [['z','radioTabZ'],['x','radioTabX'],['c','radioTabC'],['more','radioTabMore']]){
   $(btn)?.classList.toggle('selected',key===mode);
  }
  box.scrollTop=0;
  $('radioOverlay').classList.remove('hidden');
 }
 function setupRadio(){
  for(const mode of ['z','x','c','more'])$('radioTab'+(mode==='more'?'More':mode.toUpperCase()))?.addEventListener('click',()=>openRadio(mode));
  $('radioBtn')?.addEventListener('click',e=>{e.stopPropagation();radioOpen?closeRadio():openRadio('z')});
  $('radioClose')?.addEventListener('click',closeRadio);
  $('radioOverlay')?.addEventListener('pointerdown',e=>e.stopPropagation());
  $('radioOverlay')?.addEventListener('wheel',e=>e.stopPropagation(),{passive:true});
  addEventListener('keydown',e=>{
   if(radioOpen){
    if(e.code==='Escape'){e.preventDefault();e.stopImmediatePropagation();closeRadio();return}
    const match=/^(Digit|Numpad)([0-9])$/.exec(e.code);
    if(match){e.preventDefault();e.stopImmediatePropagation();selectRadio(match[2]==='0'?9:Number(match[2])-1);return}
    if(['KeyZ','KeyX','KeyC'].includes(e.code)){e.preventDefault();e.stopImmediatePropagation();openRadio(e.code.slice(3).toLowerCase());return}
    // While the radio is open, block combat shortcuts to avoid accidental buys/firing.
    if(['Space','KeyB','KeyO','KeyR','KeyG','KeyE'].includes(e.code)){e.preventDefault();e.stopImmediatePropagation();return}
   }
   if(!running||inputBlocked())return;
   const modes={KeyZ:'z',KeyX:'x',KeyC:'c'};
   if(modes[e.code]){e.preventDefault();e.stopImmediatePropagation();openRadio(modes[e.code])}
  },true);
  $('scoreBtn')?.addEventListener('click',e=>{e.stopPropagation();if(running)setScoreboard(!sbOpen)});
  $('scoreboard')?.addEventListener('click',e=>{if(isT&&e.target===$('scoreboard'))setScoreboard(false)});
  $('scoreClose')?.addEventListener('click',()=>setScoreboard(false));
 }
 function loadTexture(name){
  if(!textureCache.has(name)){textureCache.set(name,new THREE.TextureLoader().load((name.startsWith('muzzleflash')?'assets/cs16-sprites/':'assets/phase10/fx/')+name+'.png'));}
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
  m.position.copy(b.g.position).add(new THREE.Vector3(0,1.18-(b.crouching?.34:0),0)).addScaledVector(forward,.6);
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
 return {get config(){return config},get profiles(){return PROFILES},counts,setConfig,preview,resetMatch,roundStart,registerBot,prepareBotRound,creditBot,onBotDeath,onPlayerDeath,
  renderBoard,seenEnemy,goal,command,radioCommands:RADIO_COMMANDS,radioCategories:RADIO_CATEGORIES,selectRadio,openRadio,maybeBotGrenade,botTalk,roundEnd,closeRadio,muzzlePlayer,muzzleBot,bloodImpact,updateFX,clearFX,getDebugState:()=>({players:config.players,difficulty:config.difficulty,roster:roster.length,orders:roster.filter(r=>r.bot.radioOrder).length,radioOpen,fx:effects.length})};
})();
