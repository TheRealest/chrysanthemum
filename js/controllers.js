function WelcomeCtrl($scope,wildfire) {
	$scope.test = 'tree';
	$scope.test = wildfire.getValue($scope,'test');

}

function MatchMakerCtrl($scope) {
	
}