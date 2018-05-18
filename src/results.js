
var $ = jQuery = require('jquery');
var _ = require('underscore'); 
var utils = require('./utils');

var bttable = require('bootstrap-table');
//https://github.com/wenzhixin/bootstrap-table
require('../node_modules/bootstrap-table/dist/bootstrap-table.min.css');

module.exports = {
  	
  	table: null,

	init: function(el) {

		var self = this;

//TODO move to submit event
		this.table = $(el);

		this.table.bootstrapTable({
			pagination:true,
			pageSize: 5,
			pageList: [5],
			data: [],
		    columns: [
/*		    	{
			        field: 'id',
			        title: 'Id'
			    },*/
			    {
			        field: 'name',
			        title: 'Name'
			    }, {
			        field: 'isced:level',
			        title: 'Level'
			    }, {
			        field: 'website',
			        title: 'Website'
			    }, {
			        field: 'operator',
			        title: 'Operator'
			    }
		    ]
		}).on('onClickRow', function(e) {
			console.log(e)
		});
	},

	update: function(geo) {
		var json = _.map(geo.features, function(f) {
			var p = f.properties;
			return {
				//'id': p.osm_id || p.id,
				'name': p.name,
				'isced:level': p.isced_leve,
				'operator': p.operator_r,
				'website': p.website
			};
		});
		this.table.bootstrapTable('load', json);
	}
}