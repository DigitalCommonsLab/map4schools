
var $ = jQuery = require('jquery');
var _ = require('underscore'); 
var H = require('handlebars');
var utils = require('./utils');
//var L = require('leaflet');
var Selector = require('leaflet-geojson-selector');

require('../node_modules/leaflet-geojson-selector/dist/leaflet-geojson-selector.min.css');

var baseUrl = 'https://unpkg.com/confini-istat@1.1.0/geojson/';
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

	config: {
		selector: {
			zoomToLayer: true,
			//listOnlyVisibleLayers: true
			style: {
				color:'#00f',
				fillColor:'#08f',
				fillOpacity: 0.2,
				opacity: 0.6,
				weight: 1
			},
			activeStyle: {
				color:'#00f',
				fillColor:'#fc0',
				fillOpacity: 0.4,
				opacity: 0.6,
				weight: 1
			},
			selectStyle: {
				color:'#00f',
				fillColor:'#f80',
				fillOpacity: 0.4,
				opacity: 0.6,
				weight: 1
			}		
		}
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
			url_municipality: H.compile(baseUrl + '{{region.properties.id}}/{{province.properties.id}}/municipalities.json'),
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
				l.bindTooltip(f.properties.name, {sticky: true, direction:'top'});
			}
		}).addTo(self.map);

		self.loadGeojson(function(json) {

			self.selectionLayer.addData(json);

			self.map.fitBounds(self.selectionLayer.getBounds());

			self.controlSelect = new Selector(self.selectionLayer, self.config.selector)
				.on('selector:change', function(e) {
					L.DomEvent.stop(e);
					
					if(e.selected) {
						self.update( L.featureGroup(e.layers).toGeoJSON() );
					}

			}).addTo(self.map);
		});

		self.$breadcrumb.on('click','a', function(e) {
			var sel = $(e.target).data();

			if(sel.municipality){
				//self.update( L.geoJson([self.selection.municipality]).toGeoJSON() )
			}
			
			else if(sel.province) {
				self.selection.municipality = null;
				self.update( L.geoJson([self.selection.province]).toGeoJSON() )
			}
			
			else if(sel.region){
				self.selection.municipality = null;
				self.selection.province = null;
				self.update( L.geoJson([self.selection.region]).toGeoJSON() )
			}
			
		});

		return this;
	},

	update: function(selectedGeo) {

		var self = this;

		let selectedProps = selectedGeo.features[0].properties;

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

		self.map.fitBounds(L.geoJson(selectedGeo).getBounds());
		//TODO if only is a municipality level
		self.selectionLayer.clearLayers();
		self.loadGeojson(function(json) {
			
			self.selectionLayer.addData(json);

			//self.map.fitBounds(self.selectionLayer.getBounds());
//console.log(selectedProps)
			//if(!selectedProps.id_prov)
			self.controlSelect.reload(self.selectionLayer);

			//municipality level
			if(selectedProps.id_reg || selectedProps.id_prov) {
				self.onSelect.call(self, selectedGeo);
			}
		});

		self.$breadcrumb.html( self.tmpls.bread_admin(self.selection) );
	},

	getGeoUrl: function(sel) {

		if(sel.region && sel.province)
			return this.tmpls.url_municipality(sel);
		
		else if(sel.region && !sel.province)
			return this.tmpls.url_province(sel);

		else
			return this.tmpls.url_region(sel);
	},

  	loadGeojson: function(cb) {
  		
  		var url = this.getGeoUrl(this.selection);

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
	  		cb(JSON.parse( localStorage[url]) )
	  	}
  	}	
};
