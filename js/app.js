angular.module('chrysanthemum', []).
	config(['$routeProvider', function($routeProvider) {
		$routeProvider.
			when('/welcome', {templateUrl: 'partials/welcome.html',	 controller: WelcomeCtrl}).
			when('/match_maker', {templateUrl: '../partials/match_maker.html',	 controller: MatchMakerCtrl}).
			// when('/plants/:setSlug', {templateUrl: '../partials/plant_sheets.html', controller: PlantSheetsCtrl}).
			otherwise({redirectTo: '/welcome'});
	}]);