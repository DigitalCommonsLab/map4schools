
var $ = jQuery = require('jquery');
var utils = require('./utils');
//var L = require('leaflet');
var Gps = require('leaflet-gps');
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

		var gpsControl = new Gps({
			position: 'topleft',
			maxZoom: 14,
			autoCenter: true
		})
		.on('gps:located', function(e) {
			//	e.marker.bindPopup(e.latlng.toString()).openPopup()
			//console.log(e.latlng);
			
			var bb = self.map.getBounds().pad(-0.8),
				poly = utils.createPolygonFromBounds(bb);

			self.onSelect.call(self, L.featureGroup([poly]).toGeoJSON() );
		})

		gpsControl.addTo(self.map);

		return this;
	}
};