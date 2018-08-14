
//https://github.com/Keplerjs/Kepler/blob/master/packages/osm/server/Osm.js
//

var $ = jQuery = require('jquery');
var _ = require('underscore'); 
var utils = require('./utils');
var osmtogeo = require('osmtogeojson');
var geoutils = require('geojson-utils');

module.exports = {
  	
  	results: [],

  	/*

[out:json];(

node(around:600,-33.444,-70.6383)[amenity=drinking_water];
node(around:600,-33.444,-70.6383)[amenity=fountain];
node(around:600,-33.444,-70.6383)[amenity=bar];
node(around:600,-33.444,-70.6383)[amenity=cafe];node(around:600,-33.444,-70.6383)[amenity=restaurant];node(around:600,-33.444,-70.6383)[shop=supermarket];node(around:600,-33.444,-70.6383)[amenity=marketplace];node(around:600,-33.444,-70.6383)[amenity=hospital];node(around:600,-33.444,-70.6383)[tourism=hotel];node(around:600,-33.444,-70.6383)[amenity=parking];node(around:600,-33.444,-70.6383)[tourism=picnic_site];node(around:600,-33.444,-70.6383)[tourism=camp_site];node(around:600,-33.444,-70.6383)[highway=bus_stop];);(._;>;);out 30;

  	 */

	buildQuery: function(bbox, filters) {
		
		var bboxStr = utils.tmpl('{lat1},{lon1},{lat2},{lon2}', {
            lat1: bbox[0][0].toFixed(2), lon1: bbox[0][1].toFixed(2),
            lat2: bbox[1][0].toFixed(2), lon2: bbox[1][1].toFixed(2)
        });

        var ff = _.map(filters, function(filter) {
			return filter && utils.tmpl("node({bbox})[{filter}];", {
				filter: filter,
				bbox: bboxStr
			});
		});

		console.log(ff)

		return "[out:json];("+ ff.join('') +");(._;>;);out;";
	},

	search: function(geoArea, cb, filters) {

		var self = this;

		filters = filters || ['amenity=school'];

		var bbox = utils.polyToBbox(geoArea); 

		var query = self.buildQuery(bbox, filters);

		var url = 'https://overpass-api.de/api/interpreter?data='+query;

		console.log(url)

		utils.getData(url, function(json) {
			
			var geojson = osmtogeo(json);

			geojson.features = _.filter(geojson.features, function(f) {
				return geoutils.pointInPolygon(f.geometry, geoArea.features[0].geometry);
			});

			cb(geojson);

		});

		return this;
	}
}