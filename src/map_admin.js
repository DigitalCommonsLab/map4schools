
var $ = jQuery = require('jquery');
var _ = require('underscore'); 
var H = require('handlebars');
var utils = require('./utils');
//var L = require('leaflet');
var Selector = require('leaflet-geojson-selector');
//var Selector = require('./lib/leaflet-geojson-selector/src/leaflet-geojson-selector');

require('../node_modules/leaflet-geojson-selector/dist/leaflet-geojson-selector.min.css');

var baseUrl = 'https://unpkg.com/confini-istat@1.0.0/geojson/';
//var baseUrl = 'data/confini-istat/geojson/';

module.exports = {
	
	map: null,

	onInit: function(e){ console.log('onInit',e); },
	onSelect: function(e){ console.log('onSelect',e); },

	selectionLayer: null,

	selection: {
		region: null,
		province: null,
		municipality: null
	},

	//TODO
	/* getMarkerById(id) {
		return L.marker
	},*/

	init: function(el, opts) {

		var self = this;

		self.tmpls = {
			url_region: H.compile(baseUrl + 'regions.json'),
			url_province: H.compile(baseUrl + '{{region.properties.id}}/provinces.json'),
			url_municipality: H.compile(baseUrl + '{{region.properties.id}}/{{province.properties.id}}/muncipalities.json'),
			//TODO FIXME municipalities
			bread_admin: H.compile($('#tmpl_bread_admin').html()),
		};
		
		self.$breadcrumb = $('#breadcrumb');

		self.onInit = opts && opts.onInit,
		self.onSelect = opts && opts.onSelect,
		
		self.map = L.map(el, utils.getMapOpts() )
			.on('popupopen', function(e) {
			    var p = self.map.project(e.popup._latlng);
			    p.y -= e.popup._container.clientHeight/2;
			    p.x -= self.controlSelect._container.clientWidth - e.popup._container.clientWidth/2;
			    self.map.panTo(self.map.unproject(p),{animate: true});
			})
			.addControl(L.control.zoom({ position:'topright' }));

		self.selectionLayer = L.geoJson(null, {
			onEachFeature: function(f,l) {
				l.bindTooltip(f.properties.name);
			}
		}).addTo(self.map);

		$.getJSON(self.getGeoUrl(self.selection), function(json) {

			self.selectionLayer.addData(json);

			self.map.fitBounds(self.selectionLayer.getBounds());

			self.controlSelect = new Selector(self.selectionLayer, {
				zoomToLayer: false,
				//listOnlyVisibleLayers: true
			}).on('selector:change', function(e) {
				L.DomEvent.stop(e);

				if(e.selected) {

					let selectedGeo = L.featureGroup(e.layers).toGeoJSON();

					let selectedProps = selectedGeo.features[0].properties;
				
					self.map.fitBounds(L.geoJson(selectedGeo).getBounds());
					//TODO if only is a municipality level
					
					//is a municipality level
					if(selectedProps.id_prov) {
						
						self.selection = _.extend(self.selection, {
							municipality: selectedGeo.features[0]
						});						
					}
					//is a province level
					else if(selectedProps.id_reg) {

						self.selection = _.extend(self.selection, {
							province: selectedGeo.features[0]
						});
					}
					else {
						
						self.selection = _.extend(self.selection, {
							region: selectedGeo.features[0]
						});						
					}

					$.getJSON(self.getGeoUrl(self.selection), function(json) {
						
						self.selectionLayer.clearLayers().addData(json);

						self.map.fitBounds(self.selectionLayer.getBounds());

						self.controlSelect.reload(self.selectionLayer);

						if(selectedProps.id_prov) {

							self.onSelect.call(self, selectedGeo);
						}
					});

					self.update();
				}

			}).addTo(self.map);

			self.update();
		});

		self.$breadcrumb.on('click','a', function(e) {
			var sel = $(e.target).data();

			console.log(sel);
		});

		return this;
	},

	update: function() {

		var self = this;

		self.$breadcrumb.html( self.tmpls.bread_admin(self.selection) );
	},

	getGeoUrl: function(sel) {

		if(sel.region && sel.province)
			return this.tmpls.url_municipality(sel);
		
		else if(sel.region && !sel.province)
			return this.tmpls.url_province(sel);

		else
			return this.tmpls.url_region(sel);
	}
};
