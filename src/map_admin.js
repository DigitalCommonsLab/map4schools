
var $ = jQuery = require('jquery');
var _ = require('underscore'); 
var H = require('handlebars');
var utils = require('./utils');
var Search = require('leaflet-search');
var Select = require('leaflet-geojson-selector');
require('../node_modules/leaflet-search/dist/leaflet-search.min.css');
require('../node_modules/leaflet-geojson-selector/dist/leaflet-geojson-selector.min.css');

//var baseUrl = 'https://unpkg.com/confini-istat@1.0.0/geojson/';
var baseUrl = 'data/confini-istat/geojson/';

var urls = {
	region: baseUrl+'regions.json',
	province: baseUrl+'{region}/provinces.json',
	municipality: baseUrl+'{region}/{province}/muncipalities.json',
	//TODO FIXME municipalities
};

//https://www.npmjs.com/package/confini-istat

module.exports = {
	
	map: null,

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

	onSelect: function(area, map) {},

	init: function(el) {

		var self = this;
		
		self.map = L.map(el, utils.getMapOpts() );

		$.getJSON(urls.region, function(json) {

			var geoLayer = L.geoJson(json).addTo(self.map);

			var geoSelect = new L.Control.GeoJSONSelector(geoLayer, {
				zoomToLayer: true,
				//listOnlyVisibleLayers: true
			}).on('change', function(e) {

				if(e.selected) {
				
					//TODO if only is a municipality level
					self.onSelect( L.featureGroup(e.layers).toGeoJSON(), self.map);
					//console.log('map admin onSelect')

					self.selection = {
						region: e.layers[0].feature.properties.id,
						regions: json
					};
					
					var url = L.Util.template(urls.province, {region: self.selection.region });
					
					//console.log('GEJSON',url);

					$.getJSON(url, function(json) {
						console.log(json)
						geoLayer.clearLayers().addData(json);
						geoSelect.reload(geoLayer);
					});

					self.update();
				}

			}).addTo(self.map);

			self.map.setMaxBounds( geoLayer.getBounds().pad(0.5) );

			self.map.fitBounds(geoLayer.getBounds());

			self.map.on('click', function(e) {
				self.map.fitBounds(geoLayer.getBounds())
			});
		});

		this.tmpl_bread_admin = H.compile($('#tmpl_bread_admin').html());

		return this;
	},

	update: function() {
		
		$('#geo_selection').text( JSON.stringify(this.selection) );

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
