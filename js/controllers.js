function WelcomeCtrl($scope,$http) {
	$scope.foo = 'Hello';

	$http.get('data/cardlist-export.json').success(function(data) {
		$scope.cardlist = data;
	});

	
}

function MatchMakerCtrl($scope) {
	
}