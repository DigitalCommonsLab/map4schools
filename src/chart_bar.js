
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

		this.chart = c3.generate({
			bindto: this.el,
			size: {
				width: 300,
				height: 200
			},
			data: _.defaults((opts && opts.data) || {}, {
				columns: [],
				groups: [],
				type: 'bar'
			}),
			bar: {
				width: {
					ratio: 0.5 // this makes bar width 50% of length between ticks
				}
				// or
				//width: 100 // this makes bar width 100px
			},
/*			axis: {
				x: {
					tick: {
						format: function (x) { return (x+1)+' anno' }
					}
				}
			}*/
		});
		return this;
	},

	formatData: function(data) {
		var ret = {
			columns: data,
			groups:[]
		};
		return ret;
	},

	update: function(data) {
		if(!_.isArray(data))
			return false;

		this.chart.unload();

		if(data.length)
			this.chart.load( this.formatData(data) );
		else
			this.chart.unload();
		
	}
}