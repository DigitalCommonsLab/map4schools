
var $ = jQuery = require('jquery');
var _ = require('underscore'); 
var S = require('underscore.string');
_.mixin({str: S});
var L = require('leaflet');

var config = require('./config');

module.exports = {
    
    tmpl: L.Util.template,

    hashParams: function() {
        //https://stackoverflow.com/questions/8486099/how-do-i-parse-a-url-query-parameters-in-javascript
        var query = location.hash.substr(1);
        var result = {};
        query.split("&").forEach(function(part) {
            var item = part.split("=");
            result[item[0]] = decodeURIComponent(item[1]);
        });
        return result;
    },
    
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

    polyToBbox: function(geo, prec) {
        prec = prec || 8;

        var bb = L.geoJSON(geo).getBounds(),
            sw = bb.getSouthWest(),
            ne = bb.getNorthEast(),
            bbox = [
                [ parseFloat(sw.lat.toFixed(prec)), parseFloat(sw.lng.toFixed(prec)) ],
                [ parseFloat(ne.lat.toFixed(prec)), parseFloat(ne.lng.toFixed(prec)) ]
            ];

        return bbox;
    },

    bufferLoc: function(loc, dist, corners, prec) {
        
        prec = prec || 8;
        dist = dist || 300;
        corners = corners || false;

        var b = this.meters2rad(dist),
            lat1 = parseFloat((loc[0]-b).toFixed(prec)),
            lon1 = parseFloat((loc[1]-b).toFixed(prec)),
            lat2 = parseFloat((loc[0]+b).toFixed(prec)),
            lon2 = parseFloat((loc[1]+b).toFixed(prec));

        return corners ? [[lat1, lon1], [lat2, lon2]] : [lat1, lon1, lat2, lon2];
    },
    
    deg2rad: function(deg) {
        return deg * (Math.PI/180);
    },
 
    meters2rad: function(m) {
        return (m/1000)/111.12;
    },

    randomLoc: function(bbox) {
        var world = [[-90, -180], [90, 180]];
        bbox = bbox || world;
        var sw = bbox[0],
            ne = bbox[1],
            lngs = ne[1] - sw[1],
            lats = ne[0] - sw[0];
        return [
            sw[0] + lats * Math.random(),
            sw[1] + lngs * Math.random()
        ];
    },

	getMapOpts: function(opts) {

		return _.defaults(opts || {}, {
			zoom: 13,
            maxZoom:16,
            minZoom:5,
            scrollWheelZoom: false,
			center: L.latLng([46.07,11.13]),
			zoomControl: false,
			layers: L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
			})
		});
	},

    getHostname: function(url) {
        var hostname;
        //find & remove protocol (http, ftp, etc.) and get hostname

        if (url.indexOf("//") > -1) {
            hostname = url.split('/')[2];
        }
        else {
            hostname = url.split('/')[0];
        }

        //find & remove port number
        hostname = hostname.split(':')[0];
        //find & remove "?"
        hostname = hostname.split('?')[0];

        return hostname;
    },

    getDomain: function(url) {
        
        var domain = this.getHostname(url),
            splitArr = domain.split('.'),
            arrLen = splitArr.length;

        //extracting the root domain here
        //if there is a subdomain 
        if (arrLen > 2) {
            domain = splitArr[arrLen - 2] + '.' + splitArr[arrLen - 1];
            //check to see if it's using a Country Code Top Level Domain (ccTLD) (i.e. ".me.uk")
            if (splitArr[arrLen - 2].length == 2 && splitArr[arrLen - 1].length == 2) {
                //this is using a ccTLD
                domain = splitArr[arrLen - 3] + '.' + domain;
            }
        }
        return domain;
    },

    getData: function(url, cb, cache) {

        cb = cb || _.noop;

        cache = typeof cache === 'undefined' ? true : cache;

        var self = this,
            ret = false;

        var sendAuth = !!url.match(new RegExp(config.auth.matchPath));

        if(cache===false) {
            ret = $.ajax({
                url: url,
                dataType: 'json',
                //async: false,
                beforeSend: function (xhr, req) {

                    if(sendAuth) {
                        var token = config.getToken();
                        if(token) {
                            xhr.setRequestHeader('Authorization', 'Bearer '+token);
                        }
                    }
                },
                success: function(json) {
                    
                    if(_.isObject(json) && _.isObject(json['Entries']))
                    {
                        var ee = json['Entries']['Entry'];
                        json = _.isArray(ee) ? ee : [ee];
                    }
                    else
                        json = json;
                    
                    if(_.isObject(json) || _.isArray(json) )
                        cb(json);
                    else
                        console.warn('no results',url);
                }
            });
        }
        else if(cache && !localStorage[url]) {
            ret = $.ajax({
                url: url,
                dataType: 'json',
                //async: false,
                beforeSend: function (xhr, req) {
                    
                    if(sendAuth) {
                        var token = config.getToken();
                        if(token) {
                            xhr.setRequestHeader('Authorization', 'Bearer '+token);
                        }
                    }
                },
                success: function(json) {

                    if(_.isObject(json) && json['Entries'])
                    {           
                        var ee = json['Entries']['Entry'];
                        json = _.isArray(ee) ? ee : [ee];
                    }

                    try {
                        localStorage.setItem(url, JSON.stringify(json));
                    }
                    catch (e) {
                        localStorage.clear();
                        localStorage.setItem(url, JSON.stringify(json));
                    }

                    cb(json);
                }
            });
        }
        else
        {
            cb( JSON.parse(localStorage.getItem(url)) )
        }

        return ret;
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

    arrayTranspose: function(a) {
        //https://stackoverflow.com/questions/4492678/swap-rows-with-columns-transposition-of-a-matrix-in-javascript/13241545

        // Calculate the width and height of the Array
        var w = a.length || 0;
        var h = a[0] instanceof Array ? a[0].length : 0;

        // In case it is a zero matrix, no transpose routine needed.
        if(h === 0 || w === 0) { return []; }

        /**
        * @var {Number} i Counter
        * @var {Number} j Counter
        * @var {Array} t Transposed data is stored in this array.
        */
        var i, j, t = [];

        // Loop through every item in the outer array (height)
        for(i=0; i<h; i++) {

            // Insert a new row (array)
            t[i] = [];

            // Loop through every item per item in outer array (width)
            for(j=0; j<w; j++) {

              // Save transposed data.
              t[i][j] = a[j][i];
            }
        }

        return t;
    },
    /*
        random data generators
     */
    randomRadar: function(num) {
        num = num || 11;

        return [
            _.map(_.range(1,num), function(i) {
                return {
                    value: _.shuffle(_.range(3.2,4.8,0.4))[0]
                };
            }),
            _.map(_.range(1,num), function(o) {
                return {
                    value: _.shuffle(_.range(1,7,0.2))[0]
                };
            })
        ];
    },

    randomStack: function(rows,cols) {
        var rows = rows || 2,
            cols = cols || 5,
            val = 100;

        return _.map(_.range(rows), function(i) {
            return _.map(_.range(cols), function(x) {
                return _.random(1,val);
            });
        });
    },

    randomPoi: function(loc, num) {
        
        num = num || 5;

        var bbox = loc ? this.bufferLoc(loc, 500, true) : null;

        var markers = _.map(_.range(num), function() {
            return L.marker( this.randomLoc(bbox) );
        });

        return markers;
    },

    randomString(len) {
        len = len || 6;
        return Math.random().toString(36).substr(2, len);
    },

    randomDetails: function(obj) {
        return _.defaults(obj, {
            name: this.randomString(),
            level: this.randomString(),
            address: this.randomString(),
            phone: this.randomString(),
            website: this.randomString(),
        });
    }

};
