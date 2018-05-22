
var $ = jQuery = require('jquery');
var utils = require('./utils');
var Draw = require('leaflet-draw');

require('../node_modules/leaflet-draw/dist/leaflet.draw.css');

module.exports = {
  	
  	map: null,

  	onSelect: function(e){ console.log('onSelect',e); },
  	
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

	init: function(el, opts) {

		var self = this;

		self.onSelect = opts && opts.onSelect,

		self.map = L.map(el, utils.getMapOpts() );
		self.map.addControl(L.control.zoom({position:'topright'}));

		self.selectionLayer = L.featureGroup().addTo(self.map);

		self.config.draw.edit.featureGroup = self.selectionLayer;

		var drawControl = new L.Control.Draw(self.config.draw);

		drawControl.addTo(self.map);

		//DRAW EVENTS
		self.map.on('draw:created', function (e) {
                var type = e.layerType,
                    layer = e.layer;

                //crea un polygono dal cerchio
                if (type === 'circle') {

                    var origin = layer.getLatLng(); //center of drawn circle
                    var radius = layer.getRadius(); //radius of drawn circle
                    var projection = L.CRS.EPSG4326;
                    var polys = utils.createGeodesicPolygon(origin, radius, 100, 0, projection);
                    //these are the points that make up the circle
                    var coords = [];
                    for (var i = 0; i < polys.length; i++) {
                        var geometry = [
                            //parseFloat(polys[i].lat.toFixed(3)),
                            //parseFloat(polys[i].lng.toFixed(3))
                            polys[i].lat,
                            polys[i].lng
                        ];
                        coords.push(geometry);
                    }

                    self.filterPolygon = L.polygon(coords);
                }
                else {
                    self.filterPolygon = layer;
                }

                self.selectionLayer
                    .clearLayers()
                    .addLayer(self.filterPolygon)
                    .setStyle(self.config.draw.draw.polygon.shapeOptions);

                self.onSelect( self.selectionLayer.toGeoJSON(), self.map);
            })
            .on('draw:deleted', function (e) {
                
                self.selectionLayer.clearLayers();

                /*delete self.filterPolygon;*/
            });

		return this;
	}
};
