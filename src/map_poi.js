/*

https://github.com/DigitalCommonsLab/osm4schools/issues/20


 */
var $ = jQuery = require('jquery');
var utils = require('./utils');
//var L = require('leaflet');
var overpass = require('./overpass');

var config = require('./config'); 


module.exports = {
  	
  	map: null,

	onInit: function(e){ console.log('onInit',e); },
	onUpdate: function(e){ console.log('onUpdate',e); },

  	config: {
  		height: 420,
  		width: 420,
  		overpassTags: [
			"amenity=bar",
			"highway=bus_stop",
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

		self.map = L.map(el, utils.getMapOpts({
			scrollWheelZoom: false
		}) );

		self.map.addControl(L.control.zoom({position:'topright'}));
		self.marker = L.marker([0,0]).addTo(self.map).bindTooltip('',{direction:'top', offset: L.point(0,-10)});

		self._overpassKeys = _.uniq(_.map(self.config.overpassTags, function(t) {
			return t.split('=')[0];
		}));

		self.layerData = L.geoJSON([], {
			pointToLayer: function(f, ll) {
				return L.circleMarker(ll, {
					radius: 6,
					weight: 2.5,
					color: '#3c79a7',
					fillColor:'#fff',
					fillOpacity:1,
					opacity:1
				})
			},
			onEachFeature: function(feature, layer) {
				
				var keys = _.map(feature.properties, function(v,k) {
					if(_.contains(self._overpassKeys, k))
						return v.replace('_',' ');
				});

				feature.properties.label = _.compact(keys).join(', ');

				layer.bindTooltip( config.tmpls.map_popup(feature.properties) )
			}
		}).addTo(self.map);

		return this;
	},

	update: function(obj) {
		var self = this;

		self.map.invalidateSize();

		self.marker.setLatLng(obj.loc).setTooltipContent(obj.address).openTooltip();
		
		self.map.setView(obj.loc, 15,{ animate: false });

		var rect = L.rectangle( self.map.getBounds() ),
			geoArea = L.featureGroup([rect]).toGeoJSON()

		self.layerData.clearLayers();

		overpass.search(geoArea, function(geoRes) {

			self.layerData.addData(geoRes);
			
		}, self.config.overpassTags);

	}
};