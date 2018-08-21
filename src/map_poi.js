/*

https://github.com/DigitalCommonsLab/osm4schools/issues/20


 */
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
  		height: 420,
  		width: 420,
  		overpassTags: [
			"amenity=bar",
			"highway=restaurant",
			"amenity=parking"
		]
  	},

	init: function(el, opts) {

		var self = this;

		self.$el = $('#'+el);
		self.onInit = opts && opts.onInit;
		self.onUpdate = opts && opts.onUpdate;

		self.$el
		.width(self.config.width)
		.height(self.config.height);


		self.tmplLegend = H.compile($('#tmpl_poi_legend').html());

		$('#poi_legend').html( self.tmplLegend(iso.getLegend()) )

		//window.iso = iso;

		self.map = L.map(el, utils.getMapOpts({
			scrollWheelZoom: false
		}) );

		self.map.addControl(L.control.zoom({position:'topright'}));
		self.marker = L.marker([0,0]).addTo(self.map).bindTooltip('',{direction:'top', offset: L.point(0,-10)});

		self._overpassKeys = _.uniq(_.map(self.config.overpassTags, function(t) {
			return t.split('=')[0];
		}));

		self.layerIso = L.geoJSON([], {
			style: function(f) {
				return {
					weight: 1,
					color:'#fff',
					fillColor: f.properties.color,
					fillOpacity: 0.8,
					opacity:1
				};
			},
			/*onEachFeature: function(feature, layer) {
				layer.on('click', function(e) {
					e.target.setStyle({fillColor:'blue'});
				})
			}*/
		}).addTo(self.map);

		self.layerPoi = L.geoJSON([], {
			pointToLayer: function(f, ll) {
				return L.circleMarker(ll, {
					radius: 6,
					weight: 3,
					opacity: 1,
					fillColor: 'white',
					fillOpacity: 1
				})
			},
			onEachFeature: function(feature, layer) {
				
				var keys = _.map(feature.properties, function(v,k) {
					if(_.contains(self._overpassKeys, k))
						return v.replace('_',' ');
				});
/*
				if(!feature.properties.time) {
					self.layerIso.eachLayer(function(l) {
						console.log('each',l)
						//if(geoutils.pointInPolygon(feature.geometry, l.to);)
						//	feature.properties.time = 
					})
				}*/

				feature.properties.label = _.compact(keys).join(', ');
				if(feature.properties.name)
					layer.bindTooltip( config.tmpls.map_popup(feature.properties) )

			}
		}).addTo(self.map);		

		return this;
	},

	update: function(obj) {
		var self = this;

		self.map.invalidateSize();

		self.marker.setLatLng(obj.loc).setTooltipContent(obj.address).openTooltip();

		self.layerIso.clearLayers();
		iso.search(obj.loc, function(geoIso) {

			self.layerIso.addData(geoIso);

			var bbox = utils.bufferLoc(obj.loc, 200);

			if(geoIso.bbox)
				bbox = L.latLngBounds(L.latLng(geoIso.bbox[1],geoIso.bbox[0]), L.latLng(geoIso.bbox[3],geoIso.bbox[2]) );

			self.map.fitBounds(bbox.pad(-0.9));

			var rect = L.rectangle( bbox ),
				geobbox = L.featureGroup([rect]).toGeoJSON();

			var geoSearch = {
				type: 'FeatureCollection',
				features: [ _.last(geoIso.features) ]
			};

			self.layerPoi.clearLayers();
			overpass.search(geoSearch, function(geoPoi) {
				
				self.layerPoi.addData(geoPoi);

			}, self.config.overpassTags);

		});
	}
};