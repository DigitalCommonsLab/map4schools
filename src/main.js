
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

var table = require('./table');

var chartRadar = require('./chart_radar');
var chartVert = require('./chart_vert');
//var chartOriz = require('./chart_oriz');


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

			$('#table h2 b').html(geoRes.features.length+" risultati &bull; "+ (geoArea.properties && geoArea.properties.title));
		});
	
	}

	//init maps
	var maps = {
		admin: mapAdmin.init('map_admin', { onSelect: loadSelection }),
		area: mapArea.init('map_area', { onSelect: loadSelection }),
		gps: mapGps.init('map_gps', { onSelect: loadSelection })
	};

	var mapActive = maps.admin;

	var RadarLabels = [
			"Risultati scolastici",
			"Risultati nelle prove standardizzate nazionali",
			"Competenze chiave europee",
			"Risultati a distanza",
			"Curricolo, progettazione e valutazione",
			"Ambiente di apprendimento",
			"Inclusione e differenziazione",
			"Continuita' e orientamento",
			"Orientamento strategico e organizzazione della scuola",
			"Sviluppo e valorizzazione delle risorse umane",
			"Integrazione con il territorio e rapporti con le famiglie",
		];

	function RandomRadar(num) {
		num = num || 11;
		return [
			_.map(_.range(1,num), function(i) {
				return {
					value: _.shuffle(_.range(3.2,4.8,0.4))[0]
				};
			}),
			_.map([
				//TODO USING type attribute or split in more Radar charts
				{type: 'esiti' },
				{type: 'esiti' },
				{type: 'esiti' },
				{type: 'esiti' },
				{type: 'processi' },
				{type: 'processi' },
				{type: 'processi' },
				{type: 'processi' },
				{type: 'processi' },
				{type: 'processi' },
				{type: 'processi' },
			], function(o) {
				//ADD RANDOM VALUES
				o.value = _.shuffle(_.range(1,7,0.2))[0];	
				return o;
			})
		];
	}

	function RandomStack() {
		var rows = 3,
			cols = 5,
			val = 100;

		return _.map(_.range(1,rows), function(i) {
			return _.map(_.range(1,cols), function(x) {
				return { x: x, y: _.random(1,val) };
			});
		});
	}

	var charts = {
		radar: chartRadar.init('#chart_radar', {labels: RadarLabels }),
		vert: chartVert.init('#chart_vert')
	};

	table.init('#table_selection', {
		onSelect: function(row) {

			console.log('table selction',row)

			mapActive.layerData.eachLayer(function(layer) {
				
				if(layer.feature.id==row.id) {
					layer.openPopup();
				}
			});

			$('#charts h2 b').text(': '+row.name)

			$('#charts').show();

			charts.radar.update( RandomRadar() );

			charts.vert.update( RandomStack() );
		}
	});

	$('#tabs_maps a').on('shown.bs.tab', function(e) {

		var mapId = $(e.target).attr('href').split('_')[1],
			map = maps[ mapId ];

		mapActive = map;

		mapActive.map.invalidateSize(false);
	});


/*	$('#charts').css({
		display: 'block',
		position:'absolute',
		zIndex:2000,
		top:0,
		left:0,
		width:800,
		height:400,
		background: '#ccc',
		boxShadow:'0 0 10px #333'
	})*/
});
