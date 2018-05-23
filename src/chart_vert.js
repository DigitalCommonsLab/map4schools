
var $ = jQuery = require('jquery');
var _ = require('underscore'); 
var d3 = require('d3');
var utils = require('./utils');

var StackedChart = require('./lib/stackedChart');

module.exports = {
  	
  	chart: null,

  	//onSelect: function(e){ console.log('onClickRow',e); }

	init: function(el, opts) {
		this.el =  el;
		return this;
	},

	formatData: function(data) {

		function val() {
			return _.random(1,100);
		}
		//_.shuffle(_.range(3.2,4.8,0.4))[0]
		//
		var data = _.map(_.range(1,5), function(i) {
			return [{x: 1, y: val()},{x: 2, y: val()},{x: 3, y: val()},{x: 4, y: val()},{x: 5, y: val()}];
		});

		return data;
	},

	update: function(data) {

		//console.log('StackedChart update', data)

		/*this.chart = StackedChart(this.el, this.formatData(data), {
		});*/
	}
}