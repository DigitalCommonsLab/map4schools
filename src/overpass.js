
//https://github.com/Keplerjs/Kepler/blob/master/packages/osm/server/Osm.js
//

var $ = jQuery = require('jquery');
var _ = require('underscore'); 
var utils = require('./utils');
var osmtogeo = require('osmtogeojson');
var geoutils = require('geojson-utils');

module.exports = {
  	
  	results: [],

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

		return "[out:json];("+ ff.join('') +");(._;>;);out;";
	},

	search: function(geoArea, cb, filters) {

		var self = this;

		filters = filters || ['amenity=school'];

		var bbox = utils.polyToBbox(geoArea); 

		var query = self.buildQuery(bbox, filters);

		var url = 'https://overpass-api.de/api/interpreter?data='+query;

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