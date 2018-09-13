
var $ = jQuery = require('jquery');
var H = require('handlebars');
var L = require('leaflet');

L.Icon.Default.imagePath = location.origin+location.pathname+'images/';

var urls = {
		baseUrlPro: window.baseUrlPro || "https://api-test.smartcommunitylab.it/t/sco.cartella/",
		baseUrlDev: window.baseUrlDev || "./data/debug/",
		aacBaseUrl: window.aacBaseUrl || "https://am-dev.smartcommunitylab.it/aac/eauth/authorize?",
		aacRedirect: window.aacRedirect || location.href
	},
	cfg = {
		aacClientId: window.aacClientId || '69b61f8f-0562-45fb-ba15-b0a61d4456f0',
		//aacClientSecret: window.clientSecret || null
	};

urls.aacUrl = H.compile(urls.aacBaseUrl + 'response_type=token'+
	'&client_id='+cfg.aacClientId+
	'&redirect_uri='+urls.aacRedirect);


if(!window.DEBUG_MODE)	//API defined here: https://docs.google.com/spreadsheets/d/1vXnu9ZW9QXw9igx5vdslzfkfhgp_ojAslS4NV-MhRng/edit#gid=0
{
	_.extend(urls, {
		getProfileStudent: H.compile(urls.baseUrlPro+'cs-stats/1.0/api/statistics/profile/student'),
		getProfileSkills: H.compile(urls.baseUrlPro+'asl-stats/1.0/api/statistics/skills/student'),
		//ISFOL API
		getIsfolLevels: H.compile(urls.baseUrlPro+'isfol/1.0.0/istatLevel{{level}}{{#if parentId}}/{{parentId}}{{else}}{{/if}}'),
		getJobsByLevel: H.compile(urls.baseUrlPro+'isfol/1.0.0/jobsByLevel5/{{idLevel5}}'),
		getSkillsByJob: H.compile(urls.baseUrlPro+'isfol/1.0.0/skillsByJob/{{idJob}}'),
		getAllSkillsLabels: H.compile(urls.baseUrlPro+'isfol/1.0.0/allSkillsLabels'),
		getSkillsThresholds: H.compile(urls.baseUrlPro+'isfol/1.0.0/getStatsThresholds'),
		getJobsByName: H.compile(urls.baseUrlPro+'isfol/1.0.0/jobsByName?param={{name}}'),
		getJobsBySkills: function(o) {
			//remove 'a' from end of codes
			var pars = $.param(o).replace(/[a]/g,'');
			return urls.baseUrlPro+'isfol/1.0.0/jobsBySkills' + '?' + pars;
		}
	});
}
else	//DEBUG API via json files in
{
	_.extend(urls, {
		getProfileStudent: H.compile(urls.baseUrlDev+'statistics_profile_student.json'),
		getProfileSkills: H.compile(urls.baseUrlDev+'statistics_skills_student.json'),
		//ISFOL API
		getIsfolLevels: H.compile(urls.baseUrlDev+'istatLevel{{level}}_{{parentId}}.json'),
		getJobsByLevel: H.compile(urls.baseUrlDev+'jobsByLevel5_{{idLevel5}}.json'),
		getSkillsByJob: H.compile(urls.baseUrlDev+'skillsByJob_{{idJob}}.json'),
		getAllSkillsLabels: H.compile(urls.baseUrlDev+'allSkillsLabels.json'),
		getSkillsThresholds: H.compile(urls.baseUrlPro+'getStatsThresholds.json'),
		getJobsByName: H.compile(urls.baseUrlDev+'jobsByName.json'),
		getJobsBySkills: function(o) {
			var pars = '';
			for(var p in o) {
				pars += "_"+p+o[p];
			}
			return urls.baseUrlDev+'jobsBySkills' + '_' + pars + '.json';
		}
	});
};

module.exports = {


	urls: urls,

	init: function(opts, cb) {

		var self = this;

		cb = cb || _.noop;

		self.token = null;
		
		self.getToken(function(t) {
			
			cb({urls: self.urls});

		});
	},
	accounts: {
		openrouteservice: {
			name: "osm4school",
			key: "5b3ce3597851110001cf624869d1edf4bd89437f987c28985184f5df"
		}
	},
	radarLabels: {
		"21": "Risultati scolastici",
		"22": "Risultati nelle prove standardizzate nazionali",
		"23": "Competenze chiave europee",
		"24": "Risultati a distanza",
		"31": "Curricolo, progettazione e valutazione",
		"32": "Ambiente di apprendimento",
		"33": "Inclusione e differenziazione",
		"34": "Continuita' e orientamento",
		"35": "Orientamento strategico e organizzazione della scuola",
		"36": "Sviluppo e valorizzazione delle risorse umane",
		"37": "Integrazione con il territorio e rapporti con le famiglie ",
	},
	genderLabels: [
		'maschi',
		'femmine'
	],
	ageLabels: [
		'< di 6 anni',
		'6 anni',
		'7 anni',
		'8 anni',
		'9 anni',
		'10 anni',
		'> di 10 anni',
		'< di 11 anni',
		'11 anni',
		'12 anni',
		'13 anni',
		'> di 13 anni',
		'< di 14 anni',
		'14 anni',
		'15 anni',
		'16 anni',
		'17 anni',
		'18 anni',
		'> di 18 anni',		
	],
	examLabels: [
		"60",
		"fra 61 e 70",
		"fra 71 e 80",
		"fra 81 e 90",
		"fra 91 e 99",
		"100",
		"100 e lode",
    ],
	tmpls: {
		details: H.compile($('#tmpl_details').html()),
		sel_level: H.compile($('#tmpl_sel_level').html()),
		map_popup: H.compile($('#tmpl_popup').html())
	},

    hashParams: function(key) {
        //https://stackoverflow.com/questions/8486099/how-do-i-parse-a-url-query-parameters-in-javascript
        var query = location.hash.substr(1);
        var result = {};
        query.split("&").forEach(function(part) {
            var item = part.split("=");
            result[ item[0] ] = decodeURIComponent( item[1] );
        });
        return key ? result[key] : result;
    },

	getToken: function(cb) {

		cb = cb || _.noop;

		var self = this;

		var passedToken = self.hashParams('access_token');

		if (!passedToken) {

			self.token = sessionStorage.access_token;

			if (!self.token || self.token == 'null' || self.token == 'undefined') {
				window.location = self.urls.aacUrl();   
			}
			else 
				cb(self.token);

		} else {
			sessionStorage.access_token = passedToken;
			window.location.hash = '';
			window.location.reload();
		}

		return self.token;
	}
}