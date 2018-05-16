
var $ = jQuery = require('jquery');
var _ = require('underscore'); 
var utils = require('./utils');

//var radar = require('...');
//https://github.com/wenzhixin/bootstrap-table
//require('../node_modules/... .min.css');

module.exports = {
  	
  	chart: null,

	init: function(el) {

		var self = this;

		this.chart = $(el);

	}
};