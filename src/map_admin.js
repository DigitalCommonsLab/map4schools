
var $ = jQuery = require('jquery');
var _ = require('underscore'); 
var H = require('handlebars');
var utils = require('./utils');
var Search = require('leaflet-search');
var Select = require('leaflet-geojson-selector');
require('../node_modules/leaflet-search/dist/leaflet-search.min.css');
require('../node_modules/leaflet-geojson-selector/dist/leaflet-geojson-selector.min.css');

var baseUrl = 'https://unpkg.com/confini-istat@1.0.0/geojson/';
//var baseUrl = 'data/confini-istat/geojson/';

//https://www.npmjs.com/package/confini-istat

module.exports = {
	
	map: null,

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

		self.onSelect = opts && opts.onSelect,
		
		self.map = L.map(el, utils.getMapOpts() )
		self.map.addControl(L.control.zoom({ position:'topright'}));

		self.selectionLayer = L.geoJson(null,{
			onEachFeature: function(f,l) {
				l.bindTooltip(f.properties.name);
			}
		}).addTo(self.map);

		self.map.on('popupopen', function(e) {
		    var p = self.map.project(e.popup._latlng);
		    p.y -= e.popup._container.clientHeight/2;
		    p.x -= self.controlSelect._container.clientWidth - e.popup._container.clientWidth/2;
		    self.map.panTo(self.map.unproject(p),{animate: true});
		});

		$.getJSON(self.getGeoUrl(), function(json) {

			self.selectionLayer.addData(json);

			self.map.fitBounds(self.selectionLayer.getBounds());

			self.controlSelect = new L.Control.GeoJSONSelector(self.selectionLayer, {
				zoomToLayer: false,
				//listOnlyVisibleLayers: true
			}).on('change', function(e) {

				if(e.selected) {

					let props = e.layers[0].feature.properties;
				
					self.map.fitBounds(e.layers[0].getBounds());
					//TODO if only is a municipality level
					
					//is a municipality level
					if(props.id_prov) {
						
						self.selection = _.extend(self.selection, {
							municipality: L.featureGroup(e.layers).toGeoJSON().features[0]
						});						
					}
					//is a province level
					else if(props.id_reg) {

						self.selection = _.extend(self.selection, {
							province: L.featureGroup(e.layers).toGeoJSON().features[0]
						});
					}
					else {
						
						self.selection = _.extend(self.selection, {
							region: L.featureGroup(e.layers).toGeoJSON().features[0]
						});						
					}

					$.getJSON(self.getGeoUrl(), function(json) {
						
						self.selectionLayer.clearLayers().addData(json);

						self.map.fitBounds(self.selectionLayer.getBounds());

						self.controlSelect.reload(self.selectionLayer);

						if(props.id_prov) {

							self.onSelect( L.featureGroup(e.layers).toGeoJSON(), self.map);
						}

						self.update();
					});

					
					
				}
				//else
					//TODO return to up level

			}).addTo(self.map);

			//self.map.setMaxBounds( self.selectionLayer.getBounds().pad(0.5) );
		});

		return this;
	},

	update: function() {

		var self = this;

		$('#breadcrumb').html( self.tmpls.bread_admin(self.selection) );
	},

	getGeoUrl: function() {
		var sel = this.selection;

		if(sel.region && sel.province)
			return this.tmpls.url_municipality(sel);
		
		else if(sel.region && !sel.province)
			return this.tmpls.url_province(sel);

		else
			return this.tmpls.url_region(sel);
	},

/*	initSearch: function() {
	
		L.control.search({
			layer: geo,
			propertyName: 'name',
			marker: false,
			initial: false,
			casesensitive: false,
			buildTip: function(text, val) {
				var name = val.layer.feature.properties.name;
				return '<a href="#">'+name+'</a>';
			},
			moveToLocation: function(latlng, title, map) {
				//var zoom = map.getBoundsZoom(latlng.layer.getBounds());
	  			//map.setView(latlng, zoom); // access the zoom
	  			latlng.layer.fire('click')
			}
		}).on('search:locationfound', function(e) {
			e.layer.openTooltip();
		}).addTo(this.map);
	}*/
};
