
var $ = jQuery = require('jquery');
var _ = require('underscore'); 
var S = require('underscore.string');
_.mixin({str: S});
var H = require('handlebars');
//var csv = require('jquery-csv');
var popper = require('popper.js');
var bt = require('bootstrap');

var bttable = require('bootstrap-table');
//https://github.com/wenzhixin/bootstrap-table

var L = require('leaflet');
require('../node_modules/leaflet/dist/leaflet.css');

//var dissolve = require('geojson-dissolve');
//var Panel = require('leaflet-panel-layers');

require('../node_modules/bootstrap/dist/css/bootstrap.min.css');
require('../node_modules/bootstrap-table/dist/bootstrap-table.min.css');
require('../main.css');

var utils = require('./utils');

var mapArea = require('./map_area');
var mapAdmin = require('./map_admin');
var mapGps = require('./map_gps');

$(function() {

	//ADMIN SELECTION
	var maps = {
		admin:  mapAdmin.init('map_admin'),
		area: mapArea.init('map_area'),
		gps: mapGps.init('map_gps')
	};

	var tmpls = {
		bread_admin: H.compile($('#tmpl_bread_admin').html()),
		sel_level: H.compile($('#tmpl_sel_level').html()),
		popup: H.compile($('#tmpl_popup').html())
	};

	$('#tabs_maps a').on('shown.bs.tab', function(event) {
		//TODO var tabid = $(maps.admin.getContainer()).parent('.tab-pane').attr('id');
		//$(event.target).find();
		//simplified
		_.each(maps, function(m) {
			m.map.invalidateSize(false);
		});
	});

	$.getJSON('data/schools_trentino.json', function(json) {
		//TODO move to submit event
		$('#table_results').bootstrapTable({
			pagination:true,
			pageSize: 5,
		    columns: [{
		        field: 'id',
		        title: 'Id'
		    }, {
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
		    ],
		    data: _.map(json.features, function(f) {
		    	var p = f.properties;
		    	return {
			        'id': p.osm_id,
			        'name': p.name,
			        'isced:level': p.isced_leve,
			        'operator': p.operator_r,
			        'website': p.website
		    	};
		    })
		});
	});

});