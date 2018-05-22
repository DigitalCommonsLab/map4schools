
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

require('../node_modules/bootstrap/dist/css/bootstrap.min.css');
require('../main.css');

var utils = require('./utils');
var overpass = require('./overpass');

var mapAdmin = require('./map_admin');
var mapArea = require('./map_area');
var mapGps = require('./map_gps');

var table = require('./table');

var chartRadar = require('./chart_radar');
//var chartBarsVert = require('./chart_bar_vert');
//var chartBarsOriz = require('./chart_bar_oriz');

$(function() {

	var tmpls = {
		sel_level: H.compile($('#tmpl_sel_level').html()),
		map_popup: H.compile($('#tmpl_popup').html())
	};

	function loadSelection(geoArea, map) {

		var self = this;
		
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

	//init maps
	var maps = {
		admin: mapAdmin.init('map_admin', { onSelect: loadSelection }),
		area: mapArea.init('map_area', { onSelect: loadSelection }),
		gps: mapGps.init('map_gps', { onSelect: loadSelection })
	};

	window.maps = maps;

	table.init('#table_selection', {
		onSelect: function(e) {			

			maps.admin.map.layerData.eachLayer(function(layer) {
				
				if(layer.feature.id==e.id) {
					layer.openPopup();
				}
			});

			$('#charts h2 b').text(': '+e.name)

			$('#charts').show();
		}
	});

	$('#tabs_maps a').on('shown.bs.tab', function(event) {
		_.each(maps, function(m) {
			m.map.invalidateSize(false);
		});
	});
});