/*

	http://www.digital-geography.com/openrouteservice-api-a-leaflet-example-for-isochrones/

 */

var $ = jQuery = require('jquery');
var _ = require('underscore'); 
var utils = require('./utils');
var geoutils = require('geojson-utils');

module.exports = {
  	
  	results: [],

	buildQuery: function(loc, filters) {
		
		return filters;
	},

	search: function(loc, cb, filters) {

		var self = this;

		var query = self.buildQuery(loc, filters);

//		var url = 'https://overpass-api.de/api/interpreter?data='+query;
		
		var key = config.accounts.openrouteservice.key,
			url = 'https://api.openrouteservice.org/isochrones?locations=-1.1428,52.955&profile=driving-car&range_type=time&interval=300&range=1800&units=&location_type=start&intersections=false&api_key='+key;

		utils.getData(url, function(geojson) {
			

			cb(geojson);

		});

		return this;
	}
}