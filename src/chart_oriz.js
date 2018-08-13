
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
		this.el = el;

		this.labels = opts && opts.labels || ['data0','data1','data2'];

		this.chart = c3.generate({
			bindto: this.el,
			size: {
				width: 300,
				height: 200
			},
		    data: _.defaults((opts && opts.data) || {}, {
		        columns: [
		            [this.labels[0], 30, 200, 100, 400, 150, 250],
		            [this.labels[1], 130, 100, 140, 200, 150, 50],
		            [this.labels[2], 100, 30, 10, 220, 10, 20]
		        ],
		        groups: [this.labels],
		        type: 'bar',
		    }),
		    //horizontal
		    axis: {
		    	rotated: true
		    },
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
				[this.labels[0]].concat(data[0]),
				[this.labels[1]].concat(data[1]),
				[this.labels[2]].concat(data[2])
			],
	        groups: [this.labels],
		};
	},

	update: function(data) {
		if(!_.isArray(data))
			return false;

		this.chart.load( this.formatData(data) );
	}
}