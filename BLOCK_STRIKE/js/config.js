// config.js - game settings, weapon prices, map list, skins
export const WEAPONS = {
  pistol: {n:'PISTOL', dmg:28, rate:.26, mag:12, res:60, rl:1.2, rec:.012, auto:false, sp:.004, len:.32, col:0x555a60, price:0},
  smg:    {n:'SMG',    dmg:15, rate:.07, mag:30, res:150, rl:1.7, rec:.009, auto:true,  sp:.022, len:.45, col:0x2e3238, price:1500},
  rifle:  {n:'RIFLE',  dmg:34, rate:.1,  mag:30, res:120, rl:2.1, rec:.011, auto:true,  sp:.009, len:.8,  col:0x3a4a34, price:3100},
  knife:  {n:'PISAU',  dmg:60, rate:.5,  mag:0,  res:0,   rl:0,   rec:0,    auto:false, sp:0,    len:.4,  col:0xcccccc, price:0}
};
export const WEAPON_KEYS = ['pistol','smg','rifle','knife'];

export const CT_MODELS = ['gsg9','gign','sas','urban'];
export const T_MODELS  = ['arctic','guerilla','leet','terror'];

export const MAPS = [
  {id: 'dust_block', name: 'Dust Block', file: 'assets/maps/dust_block.json'},
  {id: 'cs_kvartal', name: 'CS Kvartal', file: 'assets/maps/cs_kvartal.json'},
  {id: 'as_kvartal', name: 'AS Kvartal', file: 'assets/maps/as_kvartal.json'},
  {id: 'es_kvartal', name: 'ES Kvartal', file: 'assets/maps/es_kvartal.json'}
];

export const SETTINGS = {
  sensitivity: 0.0045,
  defaultWeapon: 2, // rifle
  maxHP: 100,
  gravity: 0.012,
  jumpForce: 0.22
};
