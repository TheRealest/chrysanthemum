function LoginCtrl($scope,wildfire) {
	wildfire.fuse().withScope($scope).rl('test').md('test').install();
	wildfire.fuse().withScope($scope).rl('apartment').md('apartment').install();
}

function GamesCtrl($scope,matchMaker) {
	$scope.alphanumRegexp = /^[A-z0-9 ]*$/;
	$scope.privacyOptions = {
		public : {
			label : 'Public'
		},
		private : {
			label : 'Private'
		}
	};


	
	$scope.resetNewGame = function() {
		$scope.newGame = {
			// name : 'name',
			// privacy : 'public'
		}
	}

	$scope.submitNewGame = function(valid) {
		if (valid) {
			matchMaker.newGame($scope.newGame);
			$scope.newGameSubmitted = true;
		}
		
	}

	$scope.resetNewGame();
}