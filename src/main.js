
var pkg = require('../package.json'); 

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
var chartLine = require('./chart_line');
var chartBar = require('./chart_bar');

var config = require('./config'); 
var profile = require('./profile');

window.config = config;
window.utils = utils;
window.profile = profile;

$(function() {

	$('#version').text('v'+pkg.version);


	config.init(null, function(opts) {

		profile.init('#profile');

	});

	function loadSelection(geoArea) {

		var self = this,
			map = self.map;

		if(!self.layerData) {
			self.layerData = L.geoJSON([], {
				pointToLayer: function(f, ll) {
					return L.circleMarker(ll, {
						radius: 6,
						weight: 2,
						color: '#f00',
						fillColor:'#fff',
						fillOpacity:1,
						opacity:1
					});
				},
				onEachFeature: function(f, layer) {
					layer.bindTooltip( config.tmpls.map_popup(f.properties), {direction:'top'} )
				}
			}).addTo(map);
		}

		self.layerData.clearLayers();

		//overpass.search(geoArea, function(geoRes) {
		cartella.searchSchool(geoArea, function(geoRes) {
			
			self.layerData.addData(geoRes);

			table.update(geoRes);
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
		radar: chartRadar.init('#chart_radar', {labels: _.values(config.radarLabels) }),
		vert: chartVert.init('#chart_vert', {labels: config.genderLabels }),
		oriz: chartOriz.init('#chart_oriz', {labels: config.ageLabels }),
		line: chartLine.init('#chart_line'),
		bar: chartBar.init('#chart_bar', {labels: config.examLabels }),
	};

	table.init('#table_selection', {
		onSelect: function(row) {

			if(mapActive.layerData) {
				mapActive.layerData.eachLayer(function(l) {
					l.closeTooltip();
					if(row.id===l.feature.properties.id) {
						mapActive.map.setView(l.getLatLng(), 14);
						l.openTooltip();
					}
				});
			}

			$('#charts').show();

			$('#card_details').html(config.tmpls.details(row));

			maps.poi.update( row );

			if(row.raw.PROVINCIA==='TRENTO') {

				$('#charts_radar').hide();
				$('#charts_age_gender').hide();
				$('#charts_registers').show();

				cartella
				.getDataSchool(row, 'registers', function(data) {
					charts.line.update(data);
				})
				.getDataSchool(row, 'exams', function(data) {
					charts.bar.update(data);
				});
			}
			else
			{
				$('#charts_radar').show();
				$('#charts_age_gender').show();
				$('#charts_registers').hide();
				
				cartella
				.getDataSchool(row, 'gender', function(data) {
					charts.vert.update(data);
				})
				.getDataSchool(row, 'age', function(data) {
					charts.oriz.update(data);
				})
				.getDataSchool(row, 'evaluations', function(data) {
					charts.radar.update(data);
				});
			}
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

	//var testUrl = './data/debug/searchSchool_bologna.json';
	var testUrl = './data/debug/searchSchool_trento.json';
/*
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
	}).show();*/

	utils.getData(testUrl, function(geoSchools) {
		
		geoSchools.features = _.filter(geoSchools.features, function(f) {
			return  f.properties.level!=='SCUOLA INFANZIA NON STATALE' &&
					f.properties.level!=='SCUOLA INFANZIA' &&
					f.properties.level!=='ISTITUTO COMPRENSIVO';
		});

		var testSchool = geoSchools.features[2].properties;

		table.update(geoSchools);

		table.onSelect(testSchool);
/*		
		cartella.getDataSchool(testSchool, 'gender', function(data) {
			charts.vert.update(data);
		});

		cartella.getDataSchool(testSchool, 'age', function(data) {
			charts.oriz.update(data);
		});
*/		
	});

}//DEBUG

});
