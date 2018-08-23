
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
						color: '#f00',
						fillColor:'#fff',
						fillOpacity:1,
						opacity:1
					});
				},
				onEachFeature: function(feature, layer) {
					layer.bindPopup( config.tmpls.map_popup(feature.properties) )
				}
			}).addTo(map);
		}

		self.layerData.clearLayers();

		//overpass.search(geoArea, function(geoRes) {
		cartella.searchSchool(geoArea, function(geoRes) {
			
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
		vert: chartVert.init('#chart_vert', {labels: config.genderLabels }),
		oriz: chartOriz.init('#chart_oriz', {labels: config.ageLabels }),
	};

	table.init('#table_selection', {
		onSelect: function(row) {

			//console.log('onSelect',row)

			if(mapActive.layerData) {
				mapActive.layerData.eachLayer(function(layer) {
					if(layer.feature.id==row.id) {
						layer.openPopup();
					}
				});
			}

			$('#charts').show();
			//.find('.title').text(': '+row.name);

			$('#card_details').html(config.tmpls.details(row));

			//charts.radar.update( utils.randomRadar() );
			//
			maps.poi.update( row );

			//TODO mostrare altro tipo di grafico per provincia uguale trento

			cartella.getDataSchool(row, 'gender', function(data) {
				charts.vert.update(data);
			});

			cartella.getDataSchool(row, 'age', function(data) {
				charts.oriz.update(data);
			});			
		}
	});

	$('#tabs_maps a').on('shown.bs.tab', function(e) {

		var mapId = $(e.target).attr('href').split('_')[1],
			map = maps[ mapId ];

		mapActive = map;

		mapActive.map.invalidateSize(false);
	});


//DEBUG
if(location.hash=='#debug') {

	window.utils = utils;

	$('#card_details').hide();

	$('#charts').css({
		display: 'block',
		zIndex: 2000,
		position: 'fixed',
		top: 10,
		right: 10,
		bottom: 10,
		width: 1000,
		height: 'auto',
		overflowY: 'auto',
		background: '#eee',
		boxShadow:'0 0 16px #666'
	}).show();

	$.getJSON('./data/debug/searchSchool_bologna.json', function(geoSchools) {
		
		geoSchools.features = _.filter(geoSchools.features, function(f) {
			return  f.properties.level!=='SCUOLA INFANZIA NON STATALE' &&
					f.properties.level!=='SCUOLA INFANZIA' &&
					f.properties.level!=='ISTITUTO COMPRENSIVO';
		});

		var school = geoSchools.features[2].properties;

		table.update(geoSchools);

/*		
		cartella.getDataSchool(school, 'gender', function(data) {
			charts.vert.update(data);
		});

		cartella.getDataSchool(school, 'age', function(data) {
			charts.oriz.update(data);
		});
*/		
	});

}//DEBUG

});
