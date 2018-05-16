
var $ = jQuery = require('jquery');
var utils = require('./utils');
var Search = require('leaflet-search');
var Select = require('leaflet-geojson-selector');
require('../node_modules/leaflet-search/dist/leaflet-search.min.css');
require('../node_modules/leaflet-geojson-selector/dist/leaflet-geojson-selector.min.css');

module.exports = {
  	
  	map: null,

	init: function(el) {

		var self = this;
		
		this.map = L.map(el, utils.getMapOpts() );

		$.getJSON('data/italy-regions.json', function(json) {

				var geoLayer = L.geoJson(json).addTo(self.map);

				var geoSelect = new L.Control.GeoJSONSelector(geoLayer, {
					zoomToLayer: true,
					listOnlyVisibleLayers: true
				}).on('change', function(e) {
					
					var sel = e.layers[0].feature.properties;

					$('#geo_selection').text( JSON.stringify(sel) )

				}).addTo(self.map);

				self.map.setMaxBounds( geoLayer.getBounds().pad(0.5) );

				self.map.fitBounds(geoLayer.getBounds());

				self.map.on('click', function(e) {
					self.map.fitBounds(geoLayer.getBounds())
				});
		});

		return this;
	},

	initSearch: function() {
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
		}).addTo(this.map);*/

	/*
		this.map.on('click', function(e) {
			geo.eachLayer(function(l) {
				l.setStyle({
					weight: 6,
					opacity:0.8,
				});
			});
		});*/
	}
};
