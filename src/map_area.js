
var $ = jQuery = require('jquery');
var utils = require('./utils');
var Draw = require('leaflet-draw');
require('../node_modules/leaflet-draw/dist/leaflet.draw.css');

module.exports = {
  	
  	map: null,
  	
  	selectionLayer: null,

  	config: {
  		draw: {
		    position: 'topleft',
		    draw: {
		        marker: false,
		        polyline: false,
		        polygon: {
		            allowIntersection: false,
		            drawError: {
		                color: '#399BCC',
		                timeout: 1000
		            },
		            shapeOptions: {
		                color: '#3FAAA9',
		                fillColor: '#3FAAA9',
		                fillOpacity: 0.1
		            },
		            showArea: true
		        },
		        circlemarker: false,
		        circle: {
		            shapeOptions: {
		                color: '#3FAAA9',
		                fillColor: '#3FAAA9',
		                fillOpacity: 0.1
		            }
		        }
		    },
		    edit: {
		        featureGroup: null,
		        edit: false
		    }
		}
  	},

	init: function(el) {
		
		this.selectionLayer = L.featureGroup();

		this.config.draw.edit.featureGroup = this.selectionLayer;

		this.map = L.map(el, utils.getMapOpts() );

		var drawControl = new L.Control.Draw(this.config.draw);

		drawControl.addTo(this.map);

		return this;
	}
};
