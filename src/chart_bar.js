
var $ = jQuery = require('jquery');
var _ = require('underscore'); 

// var d3 = require('d3');
var c3 = require('c3');
require('../node_modules/c3/c3.min.css');

var utils = require('./utils');

module.exports = {
  	
  	chart: null,

	init: function(el, opts) {
		this.el =  el;

		this.labels = opts && opts.labels || ['data0','data1'];

		this.chart = c3.generate({
			bindto: this.el,
			size: {
				width: 300,
				height: 200
			},
			data: _.defaults((opts && opts.data) || {}, {
				columns: [
					[this.labels[0], 120, 200, 100, 100, 150],
					[this.labels[1], 130, 100, 140, 200, 110]
				],
				//groups: [this.labels],
				type: 'bar'
			}),
			bar: {
				width: {
					ratio: 0.5 // this makes bar width 50% of length between ticks
				}
				// or
				//width: 100 // this makes bar width 100px
			},
			axis: {
				x: {
					tick: {
						format: function (x) { return (x+1)+' anno' }
					}
				}
			}
		});
		return this;
	},

	formatData: function(data) {
		var ret = {
			columns: [
				[this.labels[0]].concat(data[0]),
				[this.labels[1]].concat(data[1])
			],
			//groups: [this.labels]
		};
		return ret;
	},

	update: function(data) {
		if(!_.isArray(data))
			return false;

		if(data.length)
			this.chart.load( this.formatData(data) );
		else
			this.chart.unload();
		
	}
}