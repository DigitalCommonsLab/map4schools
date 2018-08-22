
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
		    data: (opts && opts.data) || {
		        columns: [],
		        //groups: [],
		        type: 'bar',
		    },
		    //horizontal
		    axis: {
		    	//rotated: true,
				x: {
					tick: {
						format: function (x) { return (x+1)+' classe' }
					}
				}
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
		
		//this.labels = data.labels || this.labels;

		//var groups = _.map(data, function(v) { return v[0] });
		
		data = [
			[110,0,0],
			[121,0,0],
			[120,124,3],
			[0,120,93],
			[0,10,15]
		];
		var lbs = [
			'< di 11 anni',
			'11 anni',
			'12 anni',
			'13 anni',
			'> 13 anni'
		];
		var ret = {
			columns: [
				[lbs[0]].concat(data[0]),
				[lbs[1]].concat(data[1]),
				[lbs[2]].concat(data[2]),
				[lbs[3]].concat(data[3]),
				[lbs[4]].concat(data[4])
			],
			groups: [lbs],
			type: 'bar',
			/*axis: {
			    //rotated: true,
			    x: {
			        tick: {
			            format: function(x) { return 'classe ' + (x+1) + '^' }
			        }
			    }
			}*/
		};
		console.log(ret)
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