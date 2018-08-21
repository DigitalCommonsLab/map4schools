/*

	http://www.digital-geography.com/openrouteservice-api-a-leaflet-example-for-isochrones/
	https://openrouteservice.org/dev/#/home?tab=1
 */

var $ = jQuery = require('jquery');
var _ = require('underscore'); 

var d3 = require('d3');
var geoutils = require('geojson-utils');
var turf_diff = require('turf-difference');

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
		profile: 'foot-walking',
		interval: 600,
		range: 3600,
		//colors: ['green','orange','yellow']
		colors: d3.schemeGreens[9].reverse()
	},

	scale: d3.scaleQuantile(),
	//scale: d3.scaleLinear(),
	//scale: d3.scaleQuantize(),
	
  	scaleValue: function(val) {

  		var dom = _.range(this.config.interval, this.config.interval+this.config.range, this.config.interval),
  			ran = this.config.colors,
  			scale = this.scale.domain(dom).range(ran),
  			newval = scale(val);
		return newval;
  	},

  	getLegend: function() {

  		var dom = _.range(this.config.interval, this.config.interval+this.config.range, this.config.interval),
  			ran = this.config.colors,
  			scale = this.scale.domain(dom).range(ran);

  		return {
  			title: 'Minuti a piedi',
  			list: _.map(dom, function(val) {
	  			return {
	  				value: Math.floor(val / 60),//seconds to minutes
	  				color: scale(val)
	  			}
	  		})
  		}
  	},

	search: function(loc, cb) {

		var self = this;

		//DOCS
		//https://openrouteservice.org/documentation/#/reference/isochrones/isochrones/isochrones-service
		var urlTmpl ='https://api.openrouteservice.org/isochrones?'+
				'&range_type=time&units=&location_type=start&intersections=false'+
				'&profile={profile}'+
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

				//console.log('values', _.map(geojson.features, function(f){return f.properties.value;}) )

				for(var i in geojson.features) {					
					geojson.features[i].properties.color = self.scaleValue(geojson.features[i].properties.value);
				}

				//TODO split shapes
				
				var diffs=[];
				for (i=0; i<(geojson.features.length-1); i++){
					
					
					var fdiff = turf_diff(geojson.features[i+1], geojson.features[i]);

					console.log('fdiff',geojson.features[i+1], geojson.features[i]);

					diffs.push(fdiff);
				}
				diffs.push(geojson.features[0]);
				geojson.features = diffs;


				console.log('geojson diff',geojson);

				cb(geojson);
			}

		}, false);


		return this;
	}
}
