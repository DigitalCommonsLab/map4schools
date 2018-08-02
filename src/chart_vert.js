
var $ = jQuery = require('jquery');
var _ = require('underscore'); 

// var d3 = require('d3');
var c3 = require('c3');
require('../node_modules/c3/c3.min.css');

var utils = require('./utils');

//var StackedChart = require('./lib/stackedChart');

module.exports = {
  	
  	chart: null,

  	//onSelect: function(e){ console.log('onClickRow',e); }

	init: function(el, opts) {
		this.el =  el;

		this.chart = c3.generate({
			bindto: this.el,
			size: {
				width: 300,
				height: 300
			},
		    data: _.defaults((opts && opts.data) || {}, {
		        columns: [
		            ['data0', 30, 200, 100, 400, 150, 250],
		            ['data1', 130, 100, 140, 200, 150, 50]
		        ],
		        groups: [['data0','data1']],
		        type: 'bar'
		    }),
		    bar: {
		        width: {
		            ratio: 0.5 // this makes bar width 50% of length between ticks
		        }
		        // or
		        //width: 100 // this makes bar width 100px
		    }
		});
		return this;
	},

	formatData: function(data) {

		return {
			columns: [
				_.union(['data0'], data[0]),
				_.union(['data1'], data[1])
	        ],
	        groups: [['data0','data1']],
		};
	},

	update: function(data) {

		//console.log('StackedChart update', data)

		//this.chart = StackedChart(this.el, this.formatData(data) );
		
		this.chart.load( this.formatData(data) );
	}
}