
//https://github.com/Keplerjs/Kepler/blob/master/packages/osm/server/Osm.js
//

var $ = jQuery = require('jquery');
var _ = require('underscore'); 
var utils = require('./utils');
var osmtogeo = require('osmtogeojson');
var geoutils = require('geojson-utils');

module.exports = {
  	
  	results: [],

  	getData: function(url, cb) {

		if(!localStorage[url]) {
	  		$.getJSON(url, function(json) {
	  			
	  			try {
  					localStorage.setItem(url, JSON.stringify(json));
				}
				catch (e) {
  					localStorage.clear();
  					localStorage.setItem(url, JSON.stringify(json));
  				}

	  			cb(json);
	  		});
	  	}
	  	else
	  	{
	  		cb(JSON.parse(localStorage[url]))
	  	}
  	},

	search: function(geoArea, cb) {

		//TODO
		//

		var tmplUrl = 'https://overpass-api.de/api/interpreter?data=[out:json];node({bbox})[{filter}];out;',
			params = {
				filter: 'amenity=school',
				bbox: this.polyToBbox(geoArea)
			},
			url = L.Util.template(tmplUrl, params);

		//$.getJSON(url, function(json) {
		this.getData(url, function(json) {
			
			var geojson = osmtogeo(json);

			geojson.features = _.filter(geojson.features, function(f) {
				return geoutils.pointInPolygon(f.geometry, geoArea.features[0].geometry);
			});

			//DEBUGGING
			geojson.features = _.map(geojson.features, function(f) {
				f.properties['isced:level'] = ""+_.random(0,6);
				f.properties.name = f.properties.name || 'Scuola '+f.properties.id.split('/')[1];
				return f;
			});

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