
var $ = require('jquery');
var _ = require('underscore');
var s = require('underscore.string');
var csv = require('jquery-csv');
var popper = require('popper.js');
var bt = require('bootstrap');
var L = require('leaflet');
var Search = require('leaflet-search');
var Select = require('leaflet-geojson-selector');
var Gps = require('leaflet-gps');
//var dissolve = require('geojson-dissolve');
//var Panel = require('leaflet-panel-layers');
var Draw = require('leaflet-draw');

_.mixin({str: s});

require('./node_modules/bootstrap/dist/css/bootstrap.min.css'),
require('./node_modules/leaflet/dist/leaflet.css'),
require('./node_modules/leaflet-search/dist/leaflet-search.min.css');
require('./node_modules/leaflet-geojson-selector/dist/leaflet-geojson-selector.min.css');
require('./node_modules/leaflet-draw/dist/leaflet.draw.css');
require('./node_modules/leaflet-gps/dist/leaflet-gps.min.css');

function randomColor(str) {
	var letters = '0123456789ABCDEF';
	var color = '#';
	for (var i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
}

$(function() {

	function getMapOpts() {
		return {
			zoom: 15,
			center: new L.latLng([46.07,11.13]),
			zoomControl: false,
			layers: L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
			})
		}
	}

	//ADMIN SELECTION
	var maps = {
		admin: new L.Map('map_admin', getMapOpts()),
		area: new L.Map('map_area', getMapOpts()),
		gps: new L.Map('map_gps', getMapOpts()),
	};

	

	$('#tabs_maps a').on('shown.bs.tab', function(event) {
		//TODO var tabid = $(maps.admin.getContainer()).parent('.tab-pane').attr('id');
	    //$(event.target).find();
	    //simplified
	    _.each(maps, function(m) {
	    	m.invalidateSize(false);
	    });
	});

	$.getJSON('data/italy-regions.json', function(json) {

			geoLayer = L.geoJson(json).addTo(maps.admin);

			var geoSelect = new L.Control.GeoJSONSelector(geoLayer, {
				zoomToLayer: true,
				listOnlyVisibleLayers: true
			}).on('change', function(e) {
				
				console.log( e.layers[0].feature.properties.name );

			}).addTo(maps.admin);

			maps.admin.setMaxBounds( geoLayer.getBounds().pad(0.5) );

			maps.admin.fitBounds(geoLayer.getBounds());

			maps.admin.on('click', function(e) {
				maps.admin.fitBounds(geoLayer.getBounds())
			});
	});

	//AREA SELECTION
	var drawLayer = L.featureGroup(),
		drawOpts = {
	        position: 'topleft',
	        draw: {
	            marker: false,
	            polyline: false,
	            polygon: {
	                allowIntersection: false,
	                drawError: {
	                    color: '#399BCC',
	                    timeout: 1000
	                },
	                shapeOptions: {
	                    color: '#3FAAA9',
	                    fillColor: '#3FAAA9',
	                    fillOpacity: 0.1
	                },
	                showArea: true
	            },
	            circlemarker: false,
	            circle: {
	                shapeOptions: {
	                    color: '#3FAAA9',
	                    fillColor: '#3FAAA9',
	                    fillOpacity: 0.1
	                }
	            }
	        },
	        edit: {
	            featureGroup: drawLayer,
	            edit: false
	        }
	    };

	var drawControl = new L.Control.Draw(drawOpts);
	drawControl.addTo(maps.area);

	/*
		L.control.search({
			layer: geo,
			propertyName: 'name',
			marker: false,
			initial: false,
			casesensitive: false,
			buildTip: function(text, val) {
				var name = val.layer.feature.properties.name;
				return '<a href="#">'+name+'</a>';
			},
			moveToLocation: function(latlng, title, map) {
				//var zoom = map.getBoundsZoom(latlng.layer.getBounds());
	  			//map.setView(latlng, zoom); // access the zoom
	  			latlng.layer.fire('click')
			}
		}).on('search:locationfound', function(e) {
			e.layer.openTooltip();
		}).addTo(map);*/

	/*
		map.on('click', function(e) {
			geo.eachLayer(function(l) {
				l.setStyle({
					weight: 6,
					opacity:0.8,
				});
			});
		});*/

	//GPS SELECTION
	var gpsControl = new L.Control.Gps({
		position: 'topleft'
	});
	gpsControl.addTo(maps.gps);

});