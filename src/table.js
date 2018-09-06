
var $ = jQuery = require('jquery');
var _ = require('underscore'); 
var utils = require('./utils');

window.$ = $;
window.jQuery = jQuery;

require('bootstrap-table');
//https://github.com/wenzhixin/bootstrap-table
require('../node_modules/bootstrap-table/dist/bootstrap-table.min.css');


require('../node_modules/bootstrap-table/src/extensions/filter-control/bootstrap-table-filter-control');
require('../node_modules/bootstrap-table/src/extensions/filter-control/bootstrap-table-filter-control.css');

module.exports = {
  	
  	table: null,

  	onSelect: function(e){ console.log('onClickRow',e); },

	init: function(el, opts) {

		var self = this;

		this.table = $(el);

		this.onSelect = opts && opts.onSelect;

		this.table.bootstrapTable({
			
			onClickRow: this.onSelect,
			//radio:true,
			pagination:true,
			//showColumns: true,
			clickToSelect:true,
			
			pageSize: 5,
			pageList: [5],
			//showToggle:true,//cardView: true,
			data: [],
		    columns: [
		    	{
			        field: 'level',
			        title: 'Grado Istruzione',
			        filterControl: 'select'
			    },
				/*{
		    		field: 'id',
		    		title: 'Codice MIUR',
		    		formatter: function(id, row, index, field) {
						return '<a href="http://cercalatuascuola.istruzione.it/cercalatuascuola/istituti/'+id+'/cedus" target="_blank">'+id+'</a>';
					}
		    	},*/		    
			    {
			        field: 'name',
			        title: 'Nome'
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