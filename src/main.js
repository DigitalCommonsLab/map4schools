
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
var table = require('./table');
var overpass = require('./overpass');

$(function() {

	//ADMIN SELECTION
	window.maps = {
		admin:  mapAdmin.init('map_admin'),
		area: mapArea.init('map_area'),
		gps: mapGps.init('map_gps')
	};

	table.init('#table_selection');

	var tmpls = {
		bread_admin: H.compile($('#tmpl_bread_admin').html()),
		sel_level: H.compile($('#tmpl_sel_level').html()),
		map_popup: H.compile($('#tmpl_popup').html())
	};

	$('#tabs_maps a').on('shown.bs.tab', function(event) {
		//TODO var tabid = $(maps.admin.getContainer()).parent('.tab-pane').attr('id');
		//$(event.target).find();
		//simplified
		_.each(maps, function(m) {
			m.map.invalidateSize(false);
		});
	});

	function loadSelection(geoArea, map) {

		console.log('loadSelection', map);
		
		if(!map.layerData) {
			map.layerData = L.geoJSON([], {
				onEachFeature: function(feature, layer) {
					var p = feature.properties;

					_.extend(p, {
						url_view: "http://osm.org/"+p.id,
						url_edit: "https://www.openstreetmap.org/edit?"+p.id.replace('/','=')+"&amp;editor=id"
					});

					layer.bindPopup( tmpls.map_popup(p) )
				}
			}).addTo(map);
		}

		//load geojson from area
		overpass.search(geoArea, function(geoRes) {

			map.layerData.clearLayers().addData(geoRes);

			table.update(geoRes);
		});
	}

	maps.admin.onSelect = loadSelection;
	maps.area.onSelect = loadSelection;
	maps.gps.onSelect = loadSelection;

	/*
	maps.admin.onSelect = function(geo) {
		console.log('select admin',geo)
	};
	maps.area.onSelect = function(geo) {
		console.log('select area',geo)
	};
	maps.gps.onSelect = function(geo) {
		console.log('select gps',geo)
	};
	*/

});