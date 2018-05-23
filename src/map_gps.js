
var $ = jQuery = require('jquery');
var utils = require('./utils');
var Gps = require('leaflet-gps');
//var Search = require('leaflet-search');
//require('../node_modules/leaflet-search/dist/leaflet-search.min.css');
require('../node_modules/leaflet-gps/dist/leaflet-gps.min.css');

module.exports = {
  	
  	map: null,

	onInit: function(e){ console.log('onInit',e); },
  	onSelect: function(e){ console.log('onSelect',e); },

	init: function(el, opts) {

		var self = this;

		self.onInit = opts && opts.onInit,
		self.onSelect = opts && opts.onSelect,

		self.map = L.map(el, utils.getMapOpts() );
		self.map.addControl(L.control.zoom({position:'topright'}));

		var gpsControl = new L.Control.Gps({
			position: 'topleft',
			maxZoom: 14,
			autoCenter:true
		})
		.on('gps:located', function(e) {
			//	e.marker.bindPopup(e.latlng.toString()).openPopup()
			//console.log(e.latlng);
			
			var bb = self.map.getBounds().pad(-0.8),
				poly = utils.createPolygonFromBounds(bb);

			self.onSelect.call(self, L.featureGroup([poly]).toGeoJSON() );
		})

		gpsControl.addTo(self.map);

		return self;
	}
/*	,initSearch: function() {
	
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
		}).addTo(this.map);
	}*/
}