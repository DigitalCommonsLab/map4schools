
//https://github.com/Keplerjs/Kepler/blob/master/packages/osm/server/Osm.js
//

var $ = jQuery = require('jquery');
var _ = require('underscore'); 
var utils = require('./utils');
var geoutils = require('geojson-utils');


var urls = {
	baseUrlPro: window.baseUrlPro || 'https://api-test.smartcommunitylab.it/t/sco.cartella/',
	//baseUrlDev: window.baseUrlDev || "./data/debug/"
};

module.exports = {
  	
  	results: [],

	_getProperties: function(o) {
		return {
			id: o.CODICESCUOLA,
			name: o.DENOMINAZIONESCUOLA,
            level: o.DESCRIZIONETIPOLOGIAGRADOISTRUZIONESCUOLA,
            address: o.INDIRIZZOSCUOLA,
            email: o.INDIRIZZOEMAILSCUOLA,
            website: o.SITOWEBSCUOLA,
            raw: o
		};
	},

	searchSchool: function(geoArea, cb) {

		var self = this;

		var tmplUrl = urls.baseUrlPro+'isfol/1.0.0/searchSchool?{bbox}',
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

			json = _.map(json, function(v) {
				return {
					type: 'Feature',
					properties: self._getProperties(v),
					geometry: {
						type: 'Point',
						coordinates: [ v.LONGITUDINE, v.LATITUDINE ]
					}
				};
			});

			var geojson = {
				type: 'FeatureCollection',
				features: _.filter(json, function(f) {
					return geoutils.pointInPolygon(f.geometry, geoArea.features[0].geometry);
				})
			};

			cb(geojson);

		}, false);

		return this;
	},

	getDataSchool: function(obj, name, cb) {
		
		var self = this;

		if(name==='age') {

			utils.getData(urls.baseUrlPro+'isfol/1.0.0/getAgeData/'+obj.id, function(json) {

				//TODO
				
				cb(json);

			}, false);

		}
		else if(name==='gender') {

			utils.getData(urls.baseUrlPro+'isfol/1.0.0/getGenderData/'+obj.id, function(json) {
				
				if(_.isArray(json) && json.length>0)
				{

				/*console.clear()
				console.log('getGenderData',json);*/

				json = _.map(json, function(o) {
					return _.omit(o,'codicescuola','ordinescuola','classi');
				});

				var gyears = _.groupBy(json,'annoscolastico'),
					years = _.map(_.keys(gyears),parseFloat),
					ymax = _.max(years);

				json = _.filter(json, function(v) {
					return v.annoscolastico === ymax;
				});

				json = _.groupBy(json,'annocorsoclasse');

				json = _.map(json, function(years, year) {
					return {
						'alunnimaschi': _.reduce(_.pluck(years,'alunnimaschi'), function(s,v) { return s+v; }),
						'alunnifemmine': _.reduce(_.pluck(years,'alunnifemmine'), function(s,v) { return s+v; })
					}
				});
				
				json = _.map(json, function(v,k) {
					return [
						v.alunnimaschi,
						v.alunnifemmine
					]
				});

				json = utils.arrayTranspose(json);

				cb(json)
			}
			else
				cb([]);

			}, false);
		}

		cb(null);
	}
}