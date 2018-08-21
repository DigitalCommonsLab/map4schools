/*

	http://www.digital-geography.com/openrouteservice-api-a-leaflet-example-for-isochrones/
	https://openrouteservice.org/dev/#/home?tab=1
 */

var $ = jQuery = require('jquery');
var _ = require('underscore'); 

var d3 = require('d3');

var utils = require('./utils');
//var geoutils = require('geojson-utils');
var config = require('./config'); 

module.exports = {

/*  	results: [],

	buildQuery: function(loc, filters) {
		
		return filters;
	},
*/
	config: {
		api_key: config.accounts.openrouteservice.key,
		interval: 60,
		range: 300,
	},
	
  	scaleValues: function(val) {

  		var dom = _.range(this.config.interval, this.config.interval+this.config.range, this.config.interval),
  			ran = ['white','blue'],
  			scale = d3.scaleLinear().domain(dom).range(ran),
  			newval = scale(val);

		return newval;
  	},

	search: function(loc, cb) {

		var self = this;

		//var query = self.buildQuery(loc, filters);
		var urlTmpl ='https://api.openrouteservice.org/isochrones?'+
				'profile=driving-car&range_type=time&units=&location_type=start&intersections=false'+
				'&api_key={api_key}'+
				'&locations={lng},{lat}'+
				'&interval={interval}'+
				'&range={range}',
			params = _.extend(self.config, {
				lat: loc[0],
				lng: loc[1]
			}),
			url = utils.tmpl(urlTmpl, params );

		utils.getData(url, function(geojson) {
			
			if(!_.isObject(geojson) || _.isObject(geojson.error)) {
				console.warn('Isochrones error', geojson.error.message);
			}
			else {

				for(var i in geojson.features) {					
					geojson.features[i].properties.color = self.scaleValues(geojson.features[i].properties.value);
				}

				cb(geojson);
			}

		}, true);

		return this;
	}
}