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
	$('link.theme:not(#main-theme)').attr('disabled',''); //using regular stylesheet until Themer service is created
}
function LoginCtrl($scope,wildfire) {
	$scope.usernameRegexp = /^\w+$/;
	$scope.keywords = ['mind','strategy','deck','garden','harmony','roots','plant'];

	$(document).foundationTooltips();

	$scope.blinkIcon = function() {
		var icon = $('#login-title .icon');
		icon.delay(2500).animate({color: '#543'},500).delay(100).animate({color: '#2a2'},500).delay(1400);
		icon.queue(function(next) {$scope.blinkIcon(); next();});
	}

	$scope.changeKeyword = function(i) {
		var subtitle = $('#login-title .subtitle');
		var keywordWrapper = $('#login-title .subtitle-rotator');
		var keyword = $('#login-title .subtitle-rotator span');
		keyword.animate({color: '#eee'},500);
		keyword.queue(function(next) {keyword.text($scope.keywords[i]); subtitle.fadeToggle(0).fadeToggle(0); next();});
		keyword.animate({color: '#2a2'},500).delay(4000);
		var nextIndex = Math.floor(Math.random()*$scope.keywords.length);
		if (nextIndex == i) nextIndex = Math.floor(Math.random()*$scope.keywords.length);
		keyword.queue(function(next) {$scope.changeKeyword(nextIndex); next();});
	}

	// $scope.blinkIcon = function() {
	// 	var icon = $('#login-title .icon');
	// 	icon.delay(2500).animate({color: '#dda'},500).delay(100).animate({color: '#3ea'},500).delay(1400);
	// 	icon.queue(function(next) {$scope.blinkIcon(); next();});
	// }

	// $scope.changeKeyword = function(i) {
	// 	var subtitle = $('#login-title .subtitle');
	// 	var keywordWrapper = $('#login-title .subtitle-rotator');
	// 	var keyword = $('#login-title .subtitle-rotator span');
	// 	keyword.animate({color: '#124'},500);
	// 	keyword.queue(function(next) {keyword.text($scope.keywords[i]); subtitle.fadeToggle(0).fadeToggle(0); next();});
	// 	keyword.animate({color: '#3ea'},500).delay(4000);
	// 	var nextIndex = Math.floor(Math.random()*$scope.keywords.length);
	// 	if (nextIndex == i) nextIndex = Math.floor(Math.random()*$scope.keywords.length);
	// 	keyword.queue(function(next) {$scope.changeKeyword(nextIndex); next();});
	// }

	$scope.activateLogin = function() {
		if (!$scope.loginActivated) {
			var icon = $('#login-title .icon');
			icon.stop(true,true); //stop the current action, and...
			icon.queue('fx',[]); //empty queue
			icon.animate({color: '#2a2'},500);
			var loginBox = $('#icon-fieldset');
			loginBox.animate({top: '+=190px'},1000);
			loginBox.delay(200);
			loginBox.animate({left: '-=465px'},1500);
			loginBox.delay(100);
			loginBox.queue(function(next) {
				var fieldset = $('#login-title #icon-fieldset #login-box');
				fieldset.fadeIn(2500);
				$('#login-title #icon-fieldset #login-icon fieldset').animate({borderColor: '#ccc'},2500);
				next();
			});
			$scope.loginActivated = true;
			icon.css({cursor: 'auto'});
		}
	}

	// $('#login-title #icon-fieldset #login-box').css({opacity: 0});
	$('#login-title #icon-fieldset #login-box').hide();
	$('#login-title #icon-fieldset #login-icon fieldset').css({borderColor: 'transparent'});
	$scope.changeKeyword(0);
	$scope.blinkIcon();
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