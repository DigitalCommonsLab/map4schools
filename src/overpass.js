
//https://github.com/Keplerjs/Kepler/blob/master/packages/osm/server/Osm.js
//

var $ = jQuery = require('jquery');
var _ = require('underscore'); 
var utils = require('./utils');
var osmtogeo = require('osmtogeojson');

module.exports = {
  	
  	results: [],

	search: function(geo, cb) {

		//TODO
		//

		var tmplUrl = 'http://overpass-api.de/api/interpreter?data=[out:json];node({bbox})[{filter}];out;',
			params = {
				filter: 'amenity=school',
				bbox: this.polyToBbox(geo)
			},
			url = L.Util.template(tmplUrl, params);

		console.log(url)

		$.getJSON(url, function(json) {
			
			var geojson = osmtogeo(json);

			console.log(geojson);

			//TODO remove layers outside polygon

			cb(geojson);

		});

		return this;
	}, 

	polyToBbox: function(geo) {

		var tmpl = '{lat1},{lon1},{lat2},{lon2}',
			prec = 6,
			bb = L.geoJSON(geo).getBounds(),
			sw = bb.getSouthWest(),
			ne = bb.getNorthEast(),
			bbox = [
				[ parseFloat(sw.lat.toFixed(prec)), parseFloat(sw.lng.toFixed(prec)) ],
				[ parseFloat(ne.lat.toFixed(prec)), parseFloat(ne.lng.toFixed(prec)) ]
			],
			bboxStr = L.Util.template(tmpl, {
				lat1: bbox[0][0], lon1: bbox[0][1],
				lat2: bbox[1][0], lon2: bbox[1][1]
			});	
		
		return bboxStr;
	}
}