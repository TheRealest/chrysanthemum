function LoginCtrl($scope,wildfire) {
	wildfire.fuse().withScope($scope).rl('test').md('test').install();
	wildfire.fuse().withScope($scope).rl('apartment').md('apartment').install();
}

function GamesCtrl($scope,autumn) {
	$scope.alphanumRegexp = /^[\w ]+$/;
	$scope.privacyOptions = {
		public : {
			label : 'Public'
		},
		private : {
			label : 'Private'
		}
	};

	$scope.views = {
		gamelist : {
			icon : 'foundicon-flag',
			title : 'Game List'
		},
		chat : {
			icon : 'icon-comments-alt',
			title : ''
		},
		leaderboard : {
			icon : 'icon-trophy',
			title : 'Leaderboard'
		},
		online : {
			icon : 'foundicon-globe',
			title : 'Online Players'
		},
		friends : {
			icon : 'foundicon-address-book',
			title : 'Friends'
		},
		settings : {
			icon : 'icon-cogs',
			title : 'Settings'
		}
	};
	$scope.buttons = [
		['gamelist', {
			icon : $scope.views.gamelist.icon,
		}],
		['chat', {
			icon : 'icon-comments-alt'
		}],
		['leaderboard', {
			icon : 'icon-trophy',
		}],
		['online', {
			icon : 'foundicon-globe'
		}],
		['friends', {
			icon : 'foundicon-address-book'
		}],
		['settings', {
			icon : 'icon-cogs'
		}]
	];
	$scope.currentView = 'gamelist';

	$scope.setCurrentView = function(view) {
		$scope.currentView = view;
	}
	$scope.isCurrentView = function(view) {
		return ($scope.currentView == view);
	}

	autumn.fuseGameList($scope);
	
	$scope.resetNewGame = function() {
		$scope.newGame = {};
	}

	$scope.submitNewGame = function(valid) {
		if (valid) {
			autumn.newGame($scope.newGame);
			$scope.newGameSubmitted = true;
		}	
	}

	$scope.iconClass = function(privacy) {
		if (privacy == 'public') {
			return 'icon-unlock privacyicon';
		} else if (privacy == 'private') {
			return 'icon-lock privacyicon';
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