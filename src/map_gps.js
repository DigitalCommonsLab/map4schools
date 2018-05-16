
var $ = jQuery = require('jquery');
var utils = require('./utils');
var Gps = require('leaflet-gps');
require('../node_modules/leaflet-gps/dist/leaflet-gps.min.css');

module.exports = {
  	
  	map: null,

	init: function(el) {

		var self = this;
		
		this.map = L.map(el, utils.getMapOpts() );

		var gpsControl = new L.Control.Gps({
			position: 'topleft'
		});

		gpsControl.addTo(this.map);

		return this;
	}
}