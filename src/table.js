
var $ = jQuery = require('jquery');
var _ = require('underscore'); 
var utils = require('./utils');

var bttable = require('bootstrap-table');
//https://github.com/wenzhixin/bootstrap-table
require('../node_modules/bootstrap-table/dist/bootstrap-table.min.css');

module.exports = {
  	
  	table: null,

	init: function(el, opts) {

		var self = this;

//TODO move to submit event
		this.table = $(el);

		this.table.bootstrapTable({
			
			onClickRow: opts.onClickRow || function(e){ console.log('onClickRow',e); },
			//radio:true,
			pagination:true,
			pageSize: 5,
			pageList: [5],
			//cardView: true,
			data: [],
		    columns: [
			    {
			        field: 'name',
			        title: 'Nome'
			    }, {
			        field: 'isced:level',
			        title: 'Livello'
			    }, {
			        field: 'website',
			        title: 'Sito Web'
			    },
/*			    {
			        field: 'operator',
			        title: 'Operatore'
			    },
		    	{
			        field: 'id',
			        title: 'Id'
			    }*/			    
		    ]
		});
	},

	update: function(geo) {
		var json = _.map(geo.features, function(f) {
			var p = f.properties;
			return {
				'id': p.osm_id || p.id,
				'name': p.name,
				'isced:level': p['isced:level'],
				'operator': p.operator,
				'website': p.website
			};
		});
		this.table.bootstrapTable('load', json);
	}
}