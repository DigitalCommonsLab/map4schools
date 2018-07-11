
var $ = jQuery = require('jquery');
var _ = require('underscore'); 
var S = require('underscore.string');
_.mixin({str: S});
window.$ = $;
var H = require('handlebars');
//var csv = require('jquery-csv');
var popper = require('popper.js');
var bt = require('bootstrap');

var L = require('leaflet');
require('../node_modules/leaflet/dist/leaflet.css');

//var dissolve = require('geojson-dissolve');

require('../node_modules/bootstrap/dist/css/bootstrap.min.css');

var chartRadar = require('../src/chart_radar');


$(function() {

	var chart = chartRadar.init('#chart_radar', {
		labels: [
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
			"Integrazione con il territorio e rapporti con le famiglie",
		]
	});

	chart.update([
			_.map(_.range(1,11), function(i) {
				return {
					value: _.shuffle(_.range(3.2,4.8,0.4))[0]
				};
			}),
			_.map([
				//TODO USING type attribute or split in more Radar charts
				{type: 'esiti' },
				{type: 'esiti' },
				{type: 'esiti' },
				{type: 'esiti' },
				{type: 'processi' },
				{type: 'processi' },
				{type: 'processi' },
				{type: 'processi' },
				{type: 'processi' },
				{type: 'processi' },
				{type: 'processi' },
			], function(o) {
				//ADD RANDOM VALUES
				o.value = _.shuffle(_.range(1,7,0.2))[0];	
				return o;
			})
		]);

});