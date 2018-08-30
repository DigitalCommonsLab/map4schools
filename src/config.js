
var $ = jQuery = require('jquery');
var H = require('handlebars');
var L = require('leaflet');

L.Icon.Default.imagePath = location.origin+location.pathname+'images/';

module.exports = {
	accounts: {
		openrouteservice: {
			name: "osm4school",
			key: "5b3ce3597851110001cf624869d1edf4bd89437f987c28985184f5df"
		}
	},
	radarLabels: {
		"21": "Risultati scolastici",
		"22": "Risultati nelle prove standardizzate nazionali",
		"23": "Competenze chiave europee",
		"24": "Risultati a distanza",
		"31": "Curricolo, progettazione e valutazione",
		"32": "Ambiente di apprendimento",
		"33": "Inclusione e differenziazione",
		"34": "Continuita' e orientamento",
		"35": "Orientamento strategico e organizzazione della scuola",
		"36": "Sviluppo e valorizzazione delle risorse umane",
		"37": "Integrazione con il territorio e rapporti con le famiglie ",
	},
	genderLabels: [
		'maschi',
		'femmine'
	],
	ageLabels: [
		'< di 6 anni',
		'6 anni',
		'7 anni',
		'8 anni',
		'9 anni',
		'10 anni',
		'> di 10 anni',
		'< di 11 anni',
		'11 anni',
		'12 anni',
		'13 anni',
		'> di 13 anni',
		'< di 14 anni',
		'14 anni',
		'15 anni',
		'16 anni',
		'17 anni',
		'18 anni',
		'> di 18 anni',		
	],
	examLabels: [
		"60",
		"fra 61 e 70",
		"fra 71 e 80",
		"fra 81 e 90",
		"fra 91 e 99",
		"100",
		"100 e lode",
    ],
	tmpls: {
		details: H.compile($('#tmpl_details').html()),
		sel_level: H.compile($('#tmpl_sel_level').html()),
		map_popup: H.compile($('#tmpl_popup').html())
	}
}