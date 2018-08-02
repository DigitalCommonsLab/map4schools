
var $ = jQuery = require('jquery');
var utils = require('./utils');
//var L = require('leaflet');

module.exports = {
  	
  	map: null,

	onInit: function(e){ console.log('onInit',e); },
  	onSelect: function(e){ console.log('onSelect',e); },

  	config: {
  		height: 420,
  		width: 420
  	},

	init: function(el, opts) {

		var self = this;

		self.$el = $('#'+el);
		self.onInit = opts && opts.onInit;
		self.onSelect = opts && opts.onSelect;

console.log(self.config)

		self.$el
		.width(self.config.width)
		.height(self.config.height);

		self.map = L.map(el, utils.getMapOpts() );
		self.map.addControl(L.control.zoom({position:'topright'}));

		self.layerData = L.featureGroup([])
		.bindPopup('POI Info')
    	.on('click', function(e) {
			self.onSelect.call(self, e.target);
		})
    	.addTo(self.map);

		return this;
	},

	update: function(obj) {
		var self = this;

		//self.map.setView()
	}
};