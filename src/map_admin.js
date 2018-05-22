
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

	selectionLayer: null,

	selection: {
		region: null,
		regions: null,

		province: null,
		provinces: null,

		municipality: null,
		municipalities: null
	},

/*	getMarkerById(id) {
		return L.marker
	},*/

	getGeoUrl: function() {
		var sel = this.selection,
			tmpl = '',
			tmpls = {
				region: 'regions.json',
				province: '{region}/provinces.json',
				municipality: '{region}/{province}/muncipalities.json',
				//TODO FIXME municipalities
			};

		if(sel.region && sel.province)
			tmpl = tmpls.municipality;
		
		else if(sel.region && !sel.province)
			tmpl = tmpls.province;

		else
			tmpl = tmpls.region;

		return baseUrl + L.Util.template(tmpl, sel);
	},

	onSelect: function(area, map) {},

	init: function(el) {

		var self = this;
		
		self.map = L.map(el, utils.getMapOpts() )
		self.map.addControl(L.control.zoom({position:'topright'}));

		self.selectionLayer = L.geoJson().addTo(self.map);

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
							municipality: props.id,
							municipalities: e.layers
						});						
					}
					//is a province level
					else if(props.id_reg) {

						self.selection = _.extend(self.selection, {
							province: props.id,
							provinces: e.layers
						});
					}
					else {
						
						self.selection = _.extend(self.selection, {
							region: props.id,
							regions: e.layers
						});						
					}

					$.getJSON(self.getGeoUrl(), function(json) {

						console.log('GEOJSON',self.selection, json.features[0].properties);
						
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

		this.tmpl_bread_admin = H.compile($('#tmpl_bread_admin').html());

		return this;
	},

	update: function() {

		var self = this;
		
		//$('#geo_selection').text( JSON.stringify(this.selection) );

		var breadData = _.extend({}, this.selection, {
			region_label: this.regions && _.filter(this.regions.features, function(f){ return f.properties.id == this.selection.region })[0].properties.name,
			province_label: this.provinces && _.filter(this.provinces.features, function(f){ return f.properties.id == this.selection.province })[0].properties.name,
			municipality_label: this.municipalities &&_.filter(this.municipalities.features, function(f){ return f.properties.id == this.selection.municipality })[0].properties.name
		});

		//console.log('breadData', breadData);

		$('#breadcrumb').html( this.tmpl_bread_admin(breadData) );
	}

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
