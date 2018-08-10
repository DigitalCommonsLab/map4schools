
//https://github.com/Keplerjs/Kepler/blob/master/packages/osm/server/Osm.js
//

var $ = jQuery = require('jquery');
var _ = require('underscore'); 
var utils = require('./utils');
var geoutils = require('geojson-utils');

module.exports = {
  	
  	results: [],

	search: function(geoArea, cb) {

		var self = this;

		var tmplUrl = 'https://api-test.smartcommunitylab.it/t/sco.cartella/isfol/1.0.0/searchSchool?{bbox}',
			tmplBbox = 'sud={sud}&nord={nord}&est={est}&ovest={ovest}',
			bbox = utils.polyToBbox(geoArea),
            bboxStr = utils.tmpl(tmplBbox, {
                sud:  bbox[0][0], ovest: bbox[0][1],
                nord: bbox[1][0], est:   bbox[1][1]
            }),
			params = {
				bbox: bboxStr
			},
			url = utils.tmpl(tmplUrl, params);

		utils.getData(url, function(json) {
			
			if(!json['Entries'])
					return null;

			var res = [],
				ee = json['Entries']['Entry'],
				res = _.isArray(ee) ? ee : [ee];

			res = _.map(res, function(v) {
				return {
					type: 'Feature',
					properties: self.mapProperties(v),
					geometry: {
						type: 'Point',
						coordinates: [ v.LONGITUDINE, v.LATITUDINE ]
					}
				};
			});

			var geojson = {
				type: 'FeatureCollection',
				features: _.filter(res, function(f) {
					return geoutils.pointInPolygon(f.geometry, geoArea.features[0].geometry);
				})
			};


			cb(geojson);

		//false == cache false
		}, false);

		return this;
	},

	mapProperties: function(o) {
		return {
			id: o.CODICESCUOLA,
			name: o.DENOMINAZIONESCUOLA,
            level: o.DESCRIZIONETIPOLOGIAGRADOISTRUZIONESCUOLA,
            address: o.INDIRIZZOSCUOLA,
            email: o.INDIRIZZOEMAILSCUOLA,
            website: o.SITOWEBSCUOLA
		};
	}
}