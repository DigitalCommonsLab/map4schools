
var $ = jQuery = require('jquery');
var _ = require('underscore'); 
var S = require('underscore.string');
_.mixin({str: S});

module.exports = {
  
    humanDist: function(d, sign) {
        sign = sign || false;
        var len='',unit='',s='';
        d= parseInt(d);
        if(d < 2000){
            d = d.toFixed(0);
            unit = 'm';
        }else{
            d = (d/1000).toFixed(1);
            unit = 'km';
        }
        if(sign)
            s = d>0 ? '+' : '';
        return s + d +unit;
    },

	randomColor: function(str) {
		var letters = '0123456789ABCDEF';
		var color = '#';
		for (var i = 0; i < 6; i++) {
			color += letters[Math.floor(Math.random() * 16)];
		}
		return color;
	},

	getMapOpts: function() {
		return {
			zoom: 13,
			center: new L.latLng([46.07,11.13]),
			zoomControl: false,
			layers: L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
			})
		}
	},

    getData: function(url, cb) {

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
            cb(JSON.parse(localStorage[url]))
        }
    },

	createPolygonFromBounds: function(latLngBounds) {
		var center = latLngBounds.getCenter()
		latlngs = [];
		latlngs.push(latLngBounds.getSouthWest());//bottom left
		latlngs.push(latLngBounds.getSouthEast());//bottom right
		latlngs.push(latLngBounds.getNorthEast());//top right
		latlngs.push(latLngBounds.getNorthWest());//top left
		return L.polygon(latlngs);
	},

    createGeodesicPolygon: function (origin, radius, sides, rotation, projection) {

        var latlon = origin; //leaflet equivalent
        var angle;
        var new_lonlat, geom_point;
        var points = [];

        for (var i = 0; i < sides; i++) {
            angle = (i * 360 / sides) + rotation;
            new_lonlat = this.destinationVincenty(latlon, angle, radius);
            geom_point = L.latLng(new_lonlat.lng, new_lonlat.lat);

            points.push(geom_point);
        }

        return points;
    },

    destinationVincenty: function (lonlat, brng, dist) {
        //rewritten to work with leaflet
        var VincentyConstants = {
                a: 6378137,
                b: 6356752.3142,
                f: 1 / 298.257223563
            },
            a = VincentyConstants.a,
            b = VincentyConstants.b,
            f = VincentyConstants.f,
            lon1 = lonlat.lng,
            lat1 = lonlat.lat,
            s = dist,
            pi = Math.PI,
            alpha1 = brng * pi / 180,
            sinAlpha1 = Math.sin(alpha1),
            cosAlpha1 = Math.cos(alpha1),
            tanU1 = (1 - f) * Math.tan(lat1 * pi / 180),
            cosU1 = 1 / Math.sqrt((1 + tanU1 * tanU1)), sinU1 = tanU1 * cosU1,
            sigma1 = Math.atan2(tanU1, cosAlpha1),
            sinAlpha = cosU1 * sinAlpha1,
            cosSqAlpha = 1 - sinAlpha * sinAlpha,
            uSq = cosSqAlpha * (a * a - b * b) / (b * b),
            A = 1 + uSq / 16384 * (4096 + uSq * (-768 + uSq * (320 - 175 * uSq))),
            B = uSq / 1024 * (256 + uSq * (-128 + uSq * (74 - 47 * uSq))),
            sigma = s / (b * A), sigmaP = 2 * Math.PI;

        while (Math.abs(sigma - sigmaP) > 1e-12) {
            var cos2SigmaM = Math.cos(2 * sigma1 + sigma),
                sinSigma = Math.sin(sigma),
                cosSigma = Math.cos(sigma),
                deltaSigma = B * sinSigma * (cos2SigmaM + B / 4 * (cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM) -
                    B / 6 * cos2SigmaM * (-3 + 4 * sinSigma * sinSigma) * (-3 + 4 * cos2SigmaM * cos2SigmaM)));
            sigmaP = sigma;
            sigma = s / (b * A) + deltaSigma;
        }
        
        var tmp = sinU1 * sinSigma - cosU1 * cosSigma * cosAlpha1,
            lat2 = Math.atan2(sinU1 * cosSigma + cosU1 * sinSigma * cosAlpha1,
                (1 - f) * Math.sqrt(sinAlpha * sinAlpha + tmp * tmp)),
            lambda = Math.atan2(sinSigma * sinAlpha1, cosU1 * cosSigma - sinU1 * sinSigma * cosAlpha1),
            C = f / 16 * cosSqAlpha * (4 + f * (4 - 3 * cosSqAlpha)),
            lam = lambda - (1 - C) * f * sinAlpha *
                (sigma + C * sinSigma * (cos2SigmaM + C * cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM))),
            revAz = Math.atan2(sinAlpha, -tmp),
            lamFunc = lon1 + (lam * 180 / pi),
            lat2a = lat2 * 180 / pi;

        return L.latLng(lamFunc, lat2a);
    },
	/*
		utile in caso di backend PostGis per inviare la shape di selezione
	 */
   	toWKT: function (layer) {

        var lng, lat, coords = [];

        if (layer instanceof L.Polygon || layer instanceof L.Polyline) {
            var latlngs = layer.getLatLngs();

            for (var i = 0; i < latlngs.length; i++) {
                coords.push(latlngs[i].lng + " " + latlngs[i].lat);
                if (i === 0) {
                    lng = latlngs[i].lng;
                    lat = latlngs[i].lat;
                }
            }

            if (layer instanceof L.Polygon) {
                return "POLYGON((" + coords.join(",") + "," + lng + " " + lat + "))";

            } else if (layer instanceof L.Polyline) {
                return "LINESTRING(" + coords.join(",") + ")";
            }
        }
        else if (layer instanceof L.Marker) {
            return "POINT(" + layer.getLatLng().lng + " " + layer.getLatLng().lat + ")";
        }
    },

};
