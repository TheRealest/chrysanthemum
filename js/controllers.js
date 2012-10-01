function WelcomeCtrl($scope,wildfire) {
	// $scope.foo = wildfire.foo;
	// console.log(wildfire.foo);

	$scope.test = wildfire.getValue($scope,'test');

}

function MatchMakerCtrl($scope) {
	
}