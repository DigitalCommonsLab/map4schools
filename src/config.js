
var $ = jQuery = require('jquery');
var H = require('handlebars');

module.exports = {
	radarLabels: [
		"Risultati scolastici",
		"Risultati nelle prove standardizzate nazionali",
		"Competenze chiave europee",
		"Risultati a distanza",
		"Curricolo, progettazione e valutazione",
		"Ambiente di apprendimento",
		"Inclusione e differenziazione",
		"Continuita' e orientamento",
		"Orientamento strategico e organizzazione della scuola",
		"Sviluppo e valorizzazione delle risorse umane",
		"Integrazione con il territorio e rapporti con le famiglie"
	],
	tmpls: {
		sel_level: H.compile($('#tmpl_sel_level').html()),
		map_popup: H.compile($('#tmpl_popup').html())
	}
}