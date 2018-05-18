
var $ = jQuery = require('jquery');
var utils = require('./utils');
var Gps = require('leaflet-gps');
require('../node_modules/leaflet-gps/dist/leaflet-gps.min.css');

module.exports = {
  	
  	map: null,

  	onSelect: function(area, map) {},

	init: function(el) {

		var self = this;
		
		this.map = L.map(el, utils.getMapOpts() );

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

			self.onSelect( L.featureGroup([poly]).toGeoJSON(), self.map);
		})

		gpsControl.addTo(this.map);

		return this;
	}
}