
var $ = jQuery = require('jquery');
var _ = require('underscore'); 
var d3 = require('d3');
var utils = require('./utils');

var RadarChart = require('./lib/radarChart');

module.exports = {
  	
  	chart: null,

  	//onSelect: function(e){ console.log('onClickRow',e); }

	init: function(el, opts) {
		this.el =  el;
		return this;
	},

	formatData: function(data) {

		function val() {
			return _.random(1,7,0.2);
		}

		var axes = [];

		var axesMean = _.map(_.range(1,11), function(i) {
			return {name: "Media Nazionale", type: 'processi', id:i, axis: "", value: _.shuffle(_.range(3.2,4.8,0.4))[0] };
		});

		var axesData = _.map([
				{name: data.name, type: 'esiti', id:21, axis: "Risultati scolastici"},
				{name: data.name, type: 'esiti', id:22, axis: "Risultati nelle prove standardizzate nazionali"},
				{name: data.name, type: 'esiti', id:23, axis: "Competenze chiave europee"},
				{name: data.name, type: 'esiti', id:24, axis: "Risultati a distanza"},
				{name: data.name, type: 'processi', id:31, axis: "Curricolo, progettazione e valutazione"},
				{name: data.name, type: 'processi', id:32, axis: "Ambiente di apprendimento"},
				{name: data.name, type: 'processi', id:33, axis: "Inclusione e differenziazione"},
				{name: data.name, type: 'processi', id:34, axis: "Continuita' e orientamento"},
				{name: data.name, type: 'processi', id:35, axis: "Orientamento strategico e organizzazione della scuola"},
				{name: data.name, type: 'processi', id:36, axis: "Sviluppo e valorizzazione delle risorse umane"},
				{name: data.name, type: 'processi', id:37, axis: "Integrazione con il territorio e rapporti con le famiglie"},
			], function(o) {
				o.value = _.shuffle(_.range(1,7,0.2))[0];
				return o;
			});

		axes.push(axesData);

		axes.push(axesMean);

		return axes;
	},

	update: function(data) {

		//console.log('RadarChart update', data)

		var margin = {top: 100, right: 100, bottom: 100, left: 100},
			width = Math.min(500, window.innerWidth - 10) - margin.left - margin.right,
			height = Math.min(width, window.innerHeight - margin.top - margin.bottom - 20);

		var color = d3.scale.ordinal().range(["red","green","blue"]);

		this.chart = RadarChart(this.el, this.formatData(data), {
			w: width,
			h: height,
			margin: margin,
			maxValue: 0.5,
			levels: 5,
			roundStrokes: true,
			color: color
		});
	}
}