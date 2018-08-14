
var $ = jQuery = require('jquery');
var _ = require('underscore'); 
var utils = require('./utils');

var bttable = require('bootstrap-table');
//https://github.com/wenzhixin/bootstrap-table
require('../node_modules/bootstrap-table/dist/bootstrap-table.min.css');

module.exports = {
  	
  	table: null,

  	onSelect: function(e){ console.log('onClickRow',e); },

	init: function(el, opts) {

		var self = this;

		this.table = $(el);

		this.table.bootstrapTable({
			
			onClickRow: opts && opts.onSelect,
			//radio:true,
			pagination:true,
			pageSize: 5,
			pageList: [5],
			//cardView: true,
			data: [],
		    columns: [
		    	{
		    		field: 'id',
		    		title: 'Codice'
		    	},
			    {
			        field: 'name',
			        title: 'Nome'
			    }, {
			        field: 'level',
			        title: 'Grado'
			    }
		    ]
		});
	},

	update: function(geo) {
		var json = _.map(geo.features, function(f) {
			f.properties.loc = f.geometry.coordinates.slice().reverse();
			return f.properties;
		});

		this.table.bootstrapTable('load', json);
	}
}