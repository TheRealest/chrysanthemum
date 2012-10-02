function LoginCtrl($scope,wildfire) {
	wildfire.fuse().withScope($scope).rl('test').md('test').install();
	wildfire.fuse().withScope($scope).rl('apartment').md('apartment').install();
}

function GamesCtrl($scope,matchMaker) {
	$scope.alphanumRegexp = /^[A-z0-9 ]*$/;
	
	$scope.resetNewGame = function() {
		$scope.newGame = {
			// name : 'name',
			// privacy : 'public'
		}
	}

	$scope.submitNewGame = function() {
		console.log($scope.newGame);
		matchMaker.newGame($scope.newGame);
		$scope.resetNewGame();
	}

	$scope.resetNewGame();
}