
//https://github.com/Keplerjs/Kepler/blob/master/packages/osm/server/Osm.js
//

var $ = jQuery = require('jquery');
var _ = require('underscore'); 
var utils = require('./utils');
var osmtogeo = require('osmtogeojson');
var geoutils = require('geojson-utils');

module.exports = {
  	
  	results: [],

	search: function(geoArea, cb, filters) {

		filters = filters || ['amenity=school'];

		var tmplUrl = 'https://overpass-api.de/api/interpreter?data=[out:json];node({bbox})[{filter}];out;',
			tmplBbox = '{lat1},{lon1},{lat2},{lon2}',
			bbox = utils.polyToBbox(geoArea),
            bboxStr = utils.tmpl(tmplBbox, {
                lat1: bbox[0][0], lon1: bbox[0][1],
                lat2: bbox[1][0], lon2: bbox[1][1]
            }),
			params = {
				//TODO support multiple filters
				filter: filters[0],
				bbox: bboxStr
			},
			url = utils.tmpl(tmplUrl, params);

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