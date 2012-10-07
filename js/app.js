angular.module('chrysanthemum.services', []).
	service('wildfire',Wildfire).
	service('autumn',Autumn);

angular.module('chrysanthemum.directives', []);

angular.module('chrysanthemum.filters', []);

angular.module('chrysanthemum', ['chrysanthemum.services','chrysanthemum.directives','chrysanthemum.filters']).
	config(['$routeProvider', function($routeProvider) {
		$routeProvider.
			when('/login', {templateUrl: 'partials/login.html',	 controller: LoginCtrl}).
			when('/print', {templateUrl: 'partials/print.html',	 controller: LoginCtrl}).
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