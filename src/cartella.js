
//https://github.com/Keplerjs/Kepler/blob/master/packages/osm/server/Osm.js
//

var $ = jQuery = require('jquery');
var _ = require('underscore'); 
var utils = require('./utils');
var geoutils = require('geojson-utils');

var config = require('./config');

module.exports = {

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

//TODO apply to the results
	_filterData: function(geoSchools) {
		geoSchools.features = _.filter(geoSchools.features, function(f) {
			return  f.properties.level!=='SCUOLA INFANZIA NON STATALE' &&
					f.properties.level!=='SCUOLA INFANZIA' &&
					f.properties.level!=='ISTITUTO COMPRENSIVO';
		});
		return geoSchools;
	},

	searchSchool: function(geoArea, cb) {

		var self = this;

		var tmplUrl = config.urls.baseUrlPro+'isfol/1.0.0/searchSchool?{bbox}',
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

			if(json.length) {

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
			}

		}, false);

		return this;
	},

	getDataSchool: function(obj, name, cb) {
		
		var self = this;

		if(name==='gender') {

			utils.getData(config.urls.baseUrlPro+'isfol/1.0.0/getGenderData/'+obj.id, function(json) {
				
				if(_.isArray(json) && json.length>0) {

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
		else if(name==='age') {

			utils.getData(config.urls.baseUrlPro+'isfol/1.0.0/getAgeData/'+obj.id, function(json) {

				//console.clear();
				//console.log('getAgeData',obj.name, obj.level, json);

				if(_.isArray(json) && json.length>0)
				{
					json = _.map(json, function(o) {
						return _.omit(o,'codicescuola');
					});

					var gyears = _.groupBy(json,'annoscolastico'),
						years = _.map(_.keys(gyears),parseFloat),
						ymax = _.max(years);
					json = _.filter(json, function(v) {
						return v.annoscolastico === ymax;
					});

					var fasciaetaGroup = _.groupBy(json,'fasciaeta');

					var anni = _.uniq(_.map(json, function(v) { return v.annocorso })).sort();

					//_.reduce(_.pluck(etas,'alunni'), function(s,v) { return s+v; }),
					//console.log('tutti anni',anni);

					json = _.map(fasciaetaGroup, function(etas, eta) {

					//console.log('fasciaetaGroup', etas);

						return {
							'eta': eta,
							'alunni': _.map(anni, function(anno) {
								var alunni = 0;

								_.each(fasciaetaGroup, function(vv,e) {
									_.each(vv, function(v) {
										
										if(e===eta && v.annocorso===anno)
											alunni += v.alunni;
										//console.log('alunni',eta,v)
									});
								});

								return alunni;
							})
						}
					});
					
					//console.log('somme anni',json);

					json = _.map(json, function(v,k) {						
						return [v.eta].concat(v.alunni)
						//return [v.eta, v.alunni]
						//return [v.eta, v.alunni]
					});

					//console.log('getAgeData3',json);

					//json = utils.arrayTranspose(json);

					cb(json);
				}
				else
					cb([]);

			}, false);
		}
		else if(name==='registers') {

			utils.getData(config.urls.baseUrlPro+'isfol/1.0.0/getTrentinoRegistrationStats/'+obj.id, function(json) {
				
				if(_.isArray(json) && json.length>0) {

					//WORK AROUND for API
					/*json = _.map(json, function(o) {
						o.annoDiCorso = _.random(1, o.annoDiCorso);
						return o;
					});*/
					//console.clear();
					//console.log('getTrentinoRegistrationStats',obj.id, json);

					//PATCH FOR API
					json = _.map(json, function(v) {
						v.annoScolastico = parseFloat(v.annoScolastico.replace('/',''));
						return v;
					});
					//https://dev.smartcommunitylab.it/jira/projects/CED/issues/CED-34?filter=myopenissues
					
					var anni = _.uniq(_.pluck(json,'annoDiCorso')).sort();

					//console.log('anni', anni);

					json = _.groupBy(json,'annoScolastico');

					json = _.map(json, function(years, year) {

						return {
							'annoScolastico': year,
							'numeroAlunni': _.map(anni, function(anno) {
								var alunni = 0;

								_.each(json, function(vv,y) {
									_.each(vv, function(v) {
										if(y===year && v.annoDiCorso===anno)
											alunni += v.numeroAlunni;
									});
								});

								return alunni;
							})
						}
					});

					//console.log('prechart',_.pluck(json,'numeroAlunni'))

					json = _.map(json, function(v,k) {
						return [v.annoScolastico].concat(v.numeroAlunni);
					});

					//console.log('registers',anni,json);

					cb(json);
				}
				else
					cb([]);

			}, false);
		}
		else if(name==='evaluations') {

			//TODO
			//
			//https://dev.smartcommunitylab.it/jira/browse/CED-42

			var istituteId = obj.raw.CODICEISTITUTORIFERIMENTO;

			utils.getData(config.urls.baseUrlPro+'isfol/1.0.0/getEvaluations/'+istituteId, function(json) {

				if(_.isArray(json) && json.length>0) {

					json = _.sortBy(json,'CODICECRITERIO');

					json = [
						_.map(json, function(o) {
							return {
								value: o.PUNTEGGIOSCUOLA
							}
						}),
						_.map(json, function(o) {	//media nazionale
							return {
								value: o.MEDIANAZIONALE
							};
						})
					];

					cb(json)
				}
				else
					cb([]);

			}, false);
		}
		else if(name==='exams') {

			utils.getData(config.urls.baseUrlPro+'isfol/1.0.0/getExams/'+obj.id, function(json) {

				if(_.isArray(json) && json.length>0) {

					json = json[0];
					//PATCH API

					var labels = [];
					_.each(json, function(v,k) {
						if(k.startsWith('intervallo_')) {
							json[k] = ""+v;
							labels.push(json[k]);
						}
						return v;
					});

					var vals = [];
					_.each(json, function(v,k) {
						if(k.startsWith('percentuale_'))
							vals.push(v)
					});

					json = _.map(labels, function(l,i) {
						return [l, parseFloat(vals[i])];
					});

					//json = utils.arrayTranspose(json);

					//console.log('exams columns',json);


					cb(json)
				}
				else
					cb([]);

			}, false);
		}

		return this;
	}
}