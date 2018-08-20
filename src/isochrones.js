/*

	http://www.digital-geography.com/openrouteservice-api-a-leaflet-example-for-isochrones/
	https://openrouteservice.org/dev/#/home?tab=1
 */

var $ = jQuery = require('jquery');
var _ = require('underscore'); 
var utils = require('./utils');
//var geoutils = require('geojson-utils');
var config = require('./config'); 

module.exports = {
  	
/*  	results: [],

	buildQuery: function(loc, filters) {
		
		return filters;
	},
*/
	search: function(loc, cb) {

		var self = this;

		//var query = self.buildQuery(loc, filters);

		var url = utils.tmpl('https://api.openrouteservice.org/isochrones?'+
				'locations={lng},{lat}&profile=driving-car&range_type=time&interval={interval}&range={range}&units=&location_type=start&intersections=false&api_key={api_key}',{
				lat: loc[0],
				lng: loc[1],
				api_key: config.accounts.openrouteservice.key,
				interval: 60,
				range: 300,
			});

console.log('iso',url)

		utils.getData(url, function(geojson) {
			
			if(!_.isObject(geojson) || _.isObject(geojson.error))
				console.warn('Isochrones error', geojson.error.message);
			else
				cb(geojson);

		}, false);

		return this;
	}
}