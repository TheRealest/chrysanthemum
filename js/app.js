angular.module('chrysanthemum.service', []).
	service('wildfire',Wildfire).
	service('autumn',Autumn);ß

angular.module('chrysanthemum.directive', []);

angular.module('chrysanthemum.filter', []);

angular.module('chrysanthemum', ['chrysanthemum.service','chrysanthemum.directive','chrysanthemum.filter']).
	config(['$routeProvider', function($routeProvider) {
		$routeProvider.
			when('/login', {templateUrl: 'partials/login.html',	 controller: oginCtrl}).
			when('/games', {templateUrl: 'partials/games.html',	 controller: GamesCtrl}).
			// when('/plants/:setSlug', {templateUrl: '../partials/plant_sheets.html', controller: PlantSheetsCtrl}).
			otherwise({redirectTo: '/login'});
	}]).
	run(function($rootScope) {
		$rootScope.safeApply = function(fn) {
			var phase = this.$root.$$phase;
			if(phase == '$apply' || phase == '$digest') {
				fn();
			} else {
				this.$apply(fn);
			}
		};
		$rootScope.log = function(string) {
			console.log(string);
		}
	});