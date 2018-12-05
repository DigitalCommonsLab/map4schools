
var $ = jQuery = require('jquery');
var H = require('handlebars');
var geoutils = require('geojson-utils');

var utils = require('./utils');
var overpass = require('./overpass');
var config = require('./config'); 

var iso = require('./isochrones');

module.exports = {
  	
  	map: null,

	onInit: function(e){ console.log('onInit',e); },
	onUpdate: function(e){ console.log('onUpdate',e); },

  	config: {
  		width: 500,
  		height: 500,
  		overpassTags: [
  			{tag:"amenity=bar",color:'orange',label:"Bar"},
  			{tag:"amenity=parking",color:'DodgerBlue',label:"Parcheggi"},
			{tag:"amenity=post_office",color:'brown',label:"Uffici Postali"},
			{tag:"amenity=school",color:'red',label:"Altre Scuole"},
		]
  	},

	init: function(el, opts) {

		var self = this;

		self.$el = $('#'+el);
		self.onInit = opts && opts.onInit;
		self.onUpdate = opts && opts.onUpdate;

		self.$el.width(self.config.width).height(self.config.height);

        L.Icon.Default.imagePath = location.href.split('/').slice(0,-1).join('/')+'/images/';

		self.map = L.map(el, utils.getMapOpts());

		self.map.addControl(L.control.zoom({position:'topright'}));
		self.marker = L.marker([0,0]).addTo(self.map).bindTooltip('',{direction:'top', offset: L.point(0,-10)});

		self._overpassKeys = _.uniq(_.map(self.config.overpassTags, function(t) {
			return t.tag.split('=')[0];
		}));
	
		self.legendPoi = new L.Control({position:'bottomleft'});
		self.legendPoi.onAdd = function(map) {
			var div = L.DomUtil.create('div','legend');
			var ll = _.map(self.config.overpassTags, function(v,k) {
				return '<b style="color:'+v.color+'">&#11044;</b> <span>'+v.label+'</span>';
			});
			div.innerHTML = ll.join("<br />\n");
			return div;
		};
		self.legendPoi.addTo(self.map);
		
		self.legendIso = new L.Control({position:'bottomleft'});
		self.legendIso.onAdd = function(map) {
			var div = L.DomUtil.create('div','legend');
			var ll = _.map(iso.getLegend().list, function(v,k) {
				var t = v.value+' minuti';
				return '<b style="color:'+v.color+'">&#11035;</b> <span>'+t+'</span>';
			});
			div.innerHTML = ll.join("<br />\n");
			return div;
		};
		self.legendIso.addTo(self.map);
		
		self.layerPoi = L.geoJSON([], {
			pointToLayer: function(f, ll) {
				
				var color = 'white';
				
				_.each(self.config.overpassTags, function(v,k) {
					var tag = v.tag.split('=')[1];
					if(tag===f.properties.amenity) 
						color = v.color;
				});

				return L.circleMarker(ll, {
					radius: 5,
					weight: 1,
					opacity: 1,
					color:'white',
					fillOpacity: 0.8,
					fillColor: color
				})
			},
			onEachFeature: function(feature, layer) {

				layer.on('mouseover', function(e) {

					var f = e.target.feature;

					var keys = _.map(f.properties, function(v,k) {
						if(_.contains(self._overpassKeys, k))
							return v.replace('_',' ');
					});

					if(!f.properties.time) {
						self.layerIso.eachLayer(function(l) {
							if(geoutils.pointInPolygon(f.geometry, l.feature.geometry)) {
								f.properties.time = Math.floor(l.feature.properties.value / 60); 
							}
						});
					}

					f.properties.label = _.compact(keys).join(', ');

					layer.bindTooltip( config.tmpls.map_popup(f.properties) ).openTooltip();
				});

			},
			attribution:'<a href="http://overpass-api.de/">OverpassApi</a>',
		}).on('add', function(e) {
			self.map.addControl(self.legendPoi);
			e.target.bringToFront();
		}).on('remove', function(e) {
			self.map.removeControl(self.legendPoi);
		})
		.addTo(self.map);	

		self.layerIso = L.geoJSON([], {
			style: function(f) {
				return {
					weight: 1,
					color: '#fff',
					fillColor: f.properties.color,
					fillOpacity: 0.6,
					opacity:0.8
				};
			},
/*			onEachFeature: function(f, layer) {
				layer.on('click', function(e) {
					self.layerIso.eachLayer(function(l){
						self.layerIso.resetStyle(l);
					});	
					e.target.setStyle({
						fillColor:'orange'
					});
				})
			}*/
			attribution:'<a href="https://openrouteservice.org">OpenRouteService</a>',
		}).on('add', function(e) {
			self.map.addControl(self.legendIso);
			e.target.bringToBack();
		}).on('remove', function(e) {
			self.map.removeControl(self.legendIso);
		}).addTo(self.map);

		L.control.layers(null, {
			'Luoghi di interesse': self.layerPoi,
			'Isochrone': self.layerIso
		}, {
			position:'bottomright',
			collapsed:false
		}).addTo(self.map);	

		return this;
	},

	update: function(obj) {
		var self = this;

		self.map.invalidateSize();

		self.marker.setLatLng(obj.loc).setTooltipContent(obj.address).openTooltip();

		self.layerIso.clearLayers();
		iso.search(obj.loc, function(geoIso) {

			var geoIsoBig = geoIso.features.pop();

			self.layerIso.addData(geoIso);

			var bbox = utils.bufferLoc(obj.loc, 200);

			if(geoIso.bbox) {
				bbox = L.latLngBounds(L.latLng(geoIso.bbox[1],geoIso.bbox[0]), L.latLng(geoIso.bbox[3],geoIso.bbox[2]) );
			}

			self.map.fitBounds(bbox.pad(-0.9));

			var rect = L.rectangle( bbox ),
				geobbox = L.featureGroup([rect]).toGeoJSON();

			var geoSearch = {
				type: 'FeatureCollection',
				features: [ geoIsoBig ]
			};

			self.layerPoi.clearLayers();
			overpass.search(geoSearch, function(geoPoi) {
				
				self.layerPoi.addData(geoPoi);

			}, _.pluck(self.config.overpassTags,'tag'));

		});
	}
};