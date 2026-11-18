/* Exact filenames of the VGUI cards converted from the supplied CS 1.6 archive. */
const CS16VGUI=Object.freeze({
 icon(id){
  const aliases={usp:'usp45',deagle:'deserteagle',elite:'elites',flash:'flashbang',he:'hegrenade',smoke:'smokegrenade',helmet:'kevlar_helmet',defuse:'defuser'};
  const known=new Set(['usp45','deserteagle','elites','flashbang','hegrenade','smokegrenade','kevlar_helmet','defuser','ak47','arctic','aug','awp','famas','fiveseven','g3sg1','galil','glock18','m249','m3','m4a1','mac10','mp5','nightvision','p228','p90','sas','scout','sg550','sg552','shield','tmp','ump45','urban','xm1014','kevlar','gign','gsg9','guerilla','leet','terror']);
  const stem=aliases[id]||id;return known.has(stem)?'assets/ui/cs16/'+stem+'.png':null
 }
});
