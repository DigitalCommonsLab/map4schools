
module.exports = {
  
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
			zoom: 15,
			center: new L.latLng([46.07,11.13]),
			zoomControl: false,
			layers: L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
			})
		}
	}
};
