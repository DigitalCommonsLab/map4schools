
var $ = jQuery = require('jquery');
var _ = require('underscore'); 
var S = require('underscore.string');
_.mixin({str: S});
window._ = _;
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

	function loadSelection(geoArea) {

		var self = this,
			map = self.map;

		if(!self.layerData) {
			self.layerData = L.geoJSON([], {
				pointToLayer: function(f, ll) {
					return L.circleMarker(ll, {
						radius: 5,
						weight: 2,
						color: '#c00',
						fillColor:'#f00',
						fillOpacity:0.8,
						opacity:0.8
					})
				},
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

			self.layerData.clearLayers().addData(geoRes);

			table.update(geoRes);
		});
	}

	//init maps
	var maps = {
		admin: mapAdmin.init('map_admin', { onSelect: loadSelection }),
		area: mapArea.init('map_area', { onSelect: loadSelection }),
		gps: mapGps.init('map_gps', { onSelect: loadSelection })
	};

	var activeMap = maps.admin;

	//for debug
	window.map = activeMap;

	chartRadar.init('#chart_radar');

	table.init('#table_selection', {
		onSelect: function(row) {

			activeMap.layerData.eachLayer(function(layer) {
				
				if(layer.feature.id==row.id) {
					layer.openPopup();
				}
			});

			$('#charts h2 b').text(': '+row.name)

			$('#charts').show();

			chartRadar.update(row);
		}
	});

	$('#tabs_maps a').on('shown.bs.tab', function(e) {

		var mapId = $(e.target).attr('href').split('_')[1],
			map = maps[ mapId ];


		activeMap = map;

		console.log('activeMap',activeMap.map.getContainer())

		activeMap.map.invalidateSize(false);
		
	});
});