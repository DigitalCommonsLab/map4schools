
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

		//TODO
		
		return data;
	},

	update: function(data) {

		//console.log('StackedChart update', data)

		this.chart = StackedChart(this.el, this.formatData(data), {
			//
		});
	}
}