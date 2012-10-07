function ThemeCtrl($scope) {
	$scope.currentTheme = 'day-theme';

	$scope.changeTheme = function(theme) {
		var $targetStyle = $('link#'+theme);

		$('.theme-button').removeClass('selected-theme');
		console.log(theme);
		$('#'+theme+'-button').addClass('selected-theme');
		$targetStyle.removeAttr('disabled');
		$('link.theme:not(#'+theme+')').attr('disabled','');
		$scope.currentTheme = theme;
	}
	$('link.theme:not(#day-theme)').attr('disabled','');
}
function LoginCtrl($scope,wildfire) {
	$scope.usernameRegexp = /^\w+$/;
	$scope.keywords = ['mind','strategy','deck','garden','harmony','roots','plant'];

	// $(document).tooltips();

	// $scope.blinkIcon = function() {
	// 	var icon = $('#login-title .icon');
	// 	icon.delay(2500).animate({color: '#543'},500).delay(100).animate({color: '#2a2'},500).delay(1400);
	// 	icon.queue(function(next) {$scope.blinkIcon(); next();});
	// }

	// $scope.changeKeyword = function(i) {
	// 	var subtitle = $('#login-title .subtitle');
	// 	var keywordWrapper = $('#login-title .subtitle-rotator');
	// 	var keyword = $('#login-title .subtitle-rotator span');
	// 	keyword.animate({color: '#eee'},500);
	// 	keyword.queue(function(next) {keyword.text($scope.keywords[i]); subtitle.fadeToggle(0).fadeToggle(0); next();});
	// 	keyword.animate({color: '#2a2'},500).delay(4000);
	// 	var nextIndex = Math.floor(Math.random()*$scope.keywords.length);
	// 	if (nextIndex == i) nextIndex = Math.floor(Math.random()*$scope.keywords.length);
	// 	keyword.queue(function(next) {$scope.changeKeyword(nextIndex); next();});
	// }

	$scope.blinkIcon = function() {
		var icon = $('#login-title .icon');
		icon.delay(2500).animate({color: '#dda'},500).delay(100).animate({color: '#3ea'},500).delay(1400);
		icon.queue(function(next) {$scope.blinkIcon(); next();});
	}

	$scope.changeKeyword = function(i) {
		var subtitle = $('#login-title .subtitle');
		var keywordWrapper = $('#login-title .subtitle-rotator');
		var keyword = $('#login-title .subtitle-rotator span');
		keyword.animate({color: '#124'},500);
		keyword.queue(function(next) {keyword.text($scope.keywords[i]); subtitle.fadeToggle(0).fadeToggle(0); next();});
		keyword.animate({color: '#3ea'},500).delay(4000);
		var nextIndex = Math.floor(Math.random()*$scope.keywords.length);
		if (nextIndex == i) nextIndex = Math.floor(Math.random()*$scope.keywords.length);
		keyword.queue(function(next) {$scope.changeKeyword(nextIndex); next();});
	}

	$scope.activateLogin = function() {
		var icon = $('#login-title .icon');
		icon.stop(true,true); //stop the current action, and...
		icon.queue('fx',[]); //empty queue
		icon.css('color','#2a2');
		icon.animate({top: '+=200px'},1000);
		icon.delay(200);
		icon.animate({left: '-=505px'},1500);
		icon.delay(100);
		icon.queue(function(next) {
			var position = icon.offset();
			var fieldset = $('#login-title #icon-fieldset')
			fieldset.css('top',position.top-149-1);   //calculated transformation
			fieldset.css('left',position.left-367+148); //for moving fieldset to old logo position
			fieldset.fadeIn(2500);
			next();
		});
		icon.delay(2000);
		icon.animate({opacity: '0'},0);
	}

	console.log(3);
	$('#login-title #icon-fieldset').hide();
	$scope.changeKeyword(0);
	$scope.blinkIcon();
	// $scope.activateLogin();
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