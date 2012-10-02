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

	matchMaker.fuseGameList($scope);
	
	$scope.resetNewGame = function() {
		$scope.newGame = {};
	}

	$scope.submitNewGame = function(valid) {
		if (valid) {
			matchMaker.newGame($scope.newGame);
			$scope.newGameSubmitted = true;
		}	
	}

	$scope.iconClass = function(privacy) {
		if (privacy == 'public') {
			return 'foundicon-unlock privacyicon';
		} else if (privacy == 'private') {
			return 'foundicon-lock privacyicon';
		}
	}

	$scope.gamePanelLegend = function() {
		if ($scope.newGameSubmitted) {
			return 'Current Game';
		} else {
			return 'Create New Game';
		}
	}

	$scope.resetNewGame();
}