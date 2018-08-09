
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

var utils = require('./utils');
var overpass = require('./overpass');
var cartella = require('./cartella');

var mapAdmin = require('./map_admin');
var mapArea = require('./map_area');
var mapGps = require('./map_gps');
var mapPoi = require('./map_poi');

var table = require('./table');

var chartRadar = require('./chart_radar');
var chartVert = require('./chart_vert');
var chartOriz = require('./chart_oriz');

var config = require('./config'); 

$(function() {

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

					layer.bindPopup( config.tmpls.map_popup(p) )
				}
			}).addTo(map);
		}

		self.layerData.clearLayers();		

		overpass.search(geoArea, function(geoRes) {

			//DEBUGGING
			geoRes.features = _.map(geoRes.features, function(f) {
				f.properties['isced:level'] = ""+_.random(0,6);
				f.properties.name = f.properties.name || 'Scuola '+f.properties.id.split('/')[1];
				return f;
			});
			
			self.layerData.addData(geoRes);

			table.update(geoRes);

			$('#table').find('.title').html(geoRes.features.length+" risultati &bull; "+ (geoArea.properties && geoArea.properties.title));
		});
	}

	//init maps
	var maps = {
		admin: mapAdmin.init('map_admin', { onSelect: loadSelection }),
		area: mapArea.init('map_area', { onSelect: loadSelection }),
		gps: mapGps.init('map_gps', { onSelect: loadSelection }),
		poi: mapPoi.init('map_poi'),
	};
window.maps = maps;
	var mapActive = maps.admin;

	var charts = {
		radar: chartRadar.init('#chart_radar', {labels: config.radarLabels }),
		vert: chartVert.init('#chart_vert'),
		oriz: chartOriz.init('#chart_oriz'),
	};

	table.init('#table_selection', {
		onSelect: function(row) {

			mapActive.layerData.eachLayer(function(layer) {
				if(layer.feature.id==row.id) {
					layer.openPopup();
				}
			});

			$('#charts').show().find('.title').text(': '+row.name)

			charts.radar.update( utils.randomRadar() );
			charts.vert.update( utils.randomStack() );
			charts.oriz.update( utils.randomStack(5,3) );

			maps.poi.update( row );
		}
	});

	$('#tabs_maps a').on('shown.bs.tab', function(e) {

		var mapId = $(e.target).attr('href').split('_')[1],
			map = maps[ mapId ];

		mapActive = map;

		mapActive.map.invalidateSize(false);
	});


	//DEBUG CHARTS
/*	$('#charts').css({
		display: 'block',
		position: 'fixed',
		zIndex: 2000,
		bottom: 16,
		right: 16,
		width: 1000,
		height: 800,
		overflowY: 'auto',
		background: '#eee',
		boxShadow:'0 0 16px #666'
	}).show();*/

	charts.radar.update( utils.randomRadar() );
	charts.vert.update( utils.randomStack() );
	charts.oriz.update( utils.randomStack(5,3) );
	
	console.log(maps.poi)
});
