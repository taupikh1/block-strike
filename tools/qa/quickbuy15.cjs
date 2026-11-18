'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const html=fs.readFileSync(require('node:path').join(__dirname,'../../index.html'),'utf8');
assert.match(html,/id="autoBuyBtn"/);
assert.match(html,/id="rebuyBtn"/);
assert.match(html,/js\/quickbuy15\.js/);
const script=fs.readFileSync(require('node:path').join(__dirname,'../../js/quickbuy15.js'),'utf8');
let checks=3;
function setup(team='CT',cash=8000){
 let money=cash,inventory=[team==='CT'?'usp':'glock18','knife'],armor=0,helmet=false;
 let grenades={he:0,flash:0,smoke:0},buyTime=15, inZone=true,running=true;
 const weapon={m4a1:{slot:'primary',price:3100,team:'CT'},aug:{slot:'primary',price:3500,team:'CT'},famas:{slot:'primary',price:2250,team:'CT'},ak47:{slot:'primary',price:2500,team:'T'},sg552:{slot:'primary',price:3500,team:'T'},galil:{slot:'primary',price:2000,team:'T'},mp5:{slot:'primary',price:1500},he:{price:300},flash:{price:200},smoke:{price:300},helmet:{price:1000},kevlar:{price:650},primaryAmmo:{price:60},secondaryAmmo:{price:40},usp:{slot:'pistol',price:500},glock18:{slot:'pistol',price:400},knife:{slot:'melee',price:0}};
 const calls=[], handlers={},elems={};
 const doc={getElementById(id){return elems[id]??(elems[id]={textContent:'',classList:{contains:()=>id==='menu'?false:true},addEventListener(type,fn){handlers[id+':'+type]=fn;}})} };
 const store={};
 const env={window:{addEventListener(type,fn){handlers['window:'+type]=fn;}},document:doc,localStorage:{getItem:k=>store[k]||null,setItem:(k,v)=>store[k]=v},W:weapon,playerTeam:team,console,
   getItem:id=>weapon[id]?{id,price:weapon[id].price}:null,
   buyReason:item=>{
     const w=weapon[item.id];if(!running||buyTime<=0||!inZone)return 'CLOSED';if(!w)return 'INVALID';
     if(w.team&&w.team!==team)return 'WRONG TEAM';
     if(w.slot==='primary'&&inventory.includes(item.id))return 'OWNED';
     if(item.id==='helmet'&&helmet)return 'OWNED';
     if(item.id==='kevlar'&&armor>=100)return 'OWNED';
     if(['he','flash','smoke'].includes(item.id)&&grenades[item.id]>=(item.id==='flash'?2:1))return 'FULL';
     if(money<item.price)return 'NO CASH';return '';},
   purchase(id){
     if(env.buyReason({id}))return false;
     const w=weapon[id];money-=w.price;calls.push(id);
     if(w.slot==='primary')inventory=[...inventory.filter(v=>weapon[v]?.slot!=='primary'),id];
     if(id==='helmet'){armor=100;helmet=true;}if(id==='kevlar')armor=100;
     if(id in grenades)grenades[id]++;
     return true;
   },
   say(){},hud(){},inBuyZone(){return inZone;},get running(){return running;},get buyTime(){return buyTime;},get money(){return money;},get armor(){return armor;},get helmet(){return helmet;},get grenades(){return grenades;},get inventory(){return inventory;}
 };
 env.window.window=env.window;env.window.document=doc;
 vm.createContext(env);vm.runInContext(script,env);
 return {env,calls,handlers,getMoney:()=>money,setBuyTime:v=>buyTime=v,setInZone:v=>inZone=v,getGrenades:()=>grenades};
}
let s=setup('CT',8500),r=s.env.window.BSQuickBuy.execute('auto');
assert.equal(r.ok,true);checks++;assert.ok(s.calls.includes('m4a1'));checks++;
assert.ok(s.calls.includes('helmet'));checks++;
assert.ok(s.calls.includes('he'));checks++;
assert.ok(s.calls.includes('smoke'));checks++;
assert.ok(s.getMoney()>=0);checks++;
assert.equal(s.env.window.BSQuickBuy.getLast('CT').length,r.ids.length);checks++;
const previous=s.calls.length;
s.setBuyTime(0);r=s.env.window.BSQuickBuy.execute('rebuy');
assert.equal(r.ok,false);checks++;assert.equal(s.calls.length,previous);checks++;
s=setup('T',7500);r=s.env.window.BSQuickBuy.execute('auto');
assert.ok(r.ids.includes('ak47'));checks++;
assert.ok(!r.ids.includes('m4a1'));checks++;
s=setup('CT',20);r=s.env.window.BSQuickBuy.execute('auto');
assert.equal(r.ok,false);checks++;assert.equal(s.getMoney(),20);checks++;
s=setup('CT',8500);s.env.purchase('mp5');
assert.ok(s.env.window.BSQuickBuy.getLast('CT').includes('mp5'));checks++;
s.setBuyTime(0);s.handlers['window:keydown']({code:'F3',repeat:false,target:{closest:()=>null},preventDefault(){this.prevented=true;}});
assert.equal(s.calls.length,1);checks++;
console.log(`QuickBuy tests: ${checks}/${checks} PASS`);
