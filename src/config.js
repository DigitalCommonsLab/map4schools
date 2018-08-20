
var $ = jQuery = require('jquery');
var H = require('handlebars');

module.exports = {
	accounts: {
		openrouteservice: {
			name: "osm4school",
			key: "5b3ce3597851110001cf624869d1edf4bd89437f987c28985184f5df"
		}
	},
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
	genderLabels: [
		'maschi',
		'femmine'
	],
	ageLabels: [
		'16 anni',
		'11 anni',
		'13 anni',
		'7 anni',
		'8 anni',
		'> di 18 anni',
		'18 anni',
		'9 anni',
		'10 anni',
		'15 anni',
		'6 anni',
		'> di 10 anni',
		'12 anni',
		'17 anni',
		'14 anni',
		'< di 11 anni',
		'< di 14 anni',
		'< di 6 anni',
		'> di 13 anni',
	],	
	tmpls: {
		details: H.compile($('#tmpl_details').html()),
		sel_level: H.compile($('#tmpl_sel_level').html()),
		map_popup: H.compile($('#tmpl_popup').html())
	}
}