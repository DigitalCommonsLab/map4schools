
var $ = jQuery = require('jquery');
var _ = require('underscore'); 
var S = require('underscore.string');
_.mixin({str: S});
var H = require('handlebars');
//var csv = require('jquery-csv');
var popper = require('popper.js');
var bt = require('bootstrap');

var L = require('leaflet');
require('../node_modules/leaflet/dist/leaflet.css');

//var dissolve = require('geojson-dissolve');
//var Panel = require('leaflet-panel-layers');

require('../node_modules/bootstrap/dist/css/bootstrap.min.css');
require('../main.css');

var utils = require('./utils');

var mapArea = require('./map_area');
var mapAdmin = require('./map_admin');
var mapGps = require('./map_gps');
var results = require('./results');
var overpass = require('./overpass');

$(function() {

	//ADMIN SELECTION
	window.maps = {
		admin:  mapAdmin.init('map_admin'),
		area: mapArea.init('map_area'),
		gps: mapGps.init('map_gps')
	};

	results.init('#table_results');

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

	function loadResults(geoArea, layerData) {
		
		overpass.search(geoArea, function(geoRes) {

console.log('loadResults',layerData)
			layerData.clearLayers().addData(geoRes);

			results.update(geoRes);

		});
	}

	maps.admin.onSelect = loadResults;
	maps.area.onSelect = loadResults;
	maps.gps.onSelect = loadResults;

/*	maps.admin.onSelect = function(geo) {
		console.log('select admin',geo)

	};

	maps.area.onSelect = function(geo) {
		console.log('select area',geo)
	};

	maps.gps.onSelect = function(geo) {
		console.log('select gps',geo)
	};*/

/*	$.getJSON('./data/schools_trentino.json', function(geo) {

		results.update(geo);

	});*/

});