/* Names and short chat samples adapted from the supplied bot configuration text, no server plugins. */
const CS16BotData=Object.freeze({
 names:Object.freeze(["Fragnatic", "DaTa", "Botman", "V0id", "Android", "M0rbid Desire", "Ping of Death", "Killing Frenzy", "Campers Death", "Count Floyd", "Polymorph", "Headshot Deluxe", "Trust Noone", "Borg Queen", "Make me Laugh", "Psyke", "Eliza", "Die Humans", "Alloc", "killaruna", "Electrica", "Ivan", "Laserdance", "S.E.S.", "L33t B0t", "U're Dead", "Violently Happy", "Make my Day", "Fuzzy Logic", "Pissed Off", "Neuromancer", "Neural Noise", "Dr. No", "Kugelfang", "Murder Inc.", "Bloodlust", "Pseudolukian", "Zap!", "Rambotnic", "Hemp Invader", "Dredd", "Botsie Collins", "BotsBlitz", "Funky Byte", "Berzerk Bot"]),
 nameFor(team,index){return this.names[(index+(team==='T'?29:0))%this.names.length]},
});
window.CS16BotData=CS16BotData;
