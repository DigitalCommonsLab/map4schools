
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

		this.labels = opts && opts.labels || ['data0','data1','data2'];

		this.chart = c3.generate({
			bindto: this.el,
			size: {
				width: 300,
				height: 200
			},
			data: _.defaults((opts && opts.data) || {}, {
				columns: [
					/*[this.labels[0], 120, 200, 100, 100, 150],
					[this.labels[1], 130, 110, 140, 200, 130],
					[this.labels[2], 100, 100, 120, 180, 100]*/
				],
				//groups: [this.labels],
				type: 'line'
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
						format: function (x) { return (x+1)+' classe' }
					}
				}
			}
		});
		return this;
	},

	formatData: function(data) {

		this.labels = _.uniq(_.map(data, function(v) { return v[0] })).sort();
		
		console.log('formatData', data)
		
		var ret = {
			columns: data,
			//groups: [this.labels]
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
		
		//this.chart.resize();
		this.chart.flush();
	}
}