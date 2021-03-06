function Wildfire($http,$q) {
	// Firebase variable prefix convention:
	// ------------------------------------
	// * `md`: Angular model variable
	// * `rl`: relative link
	// * `fb`: Firebase object
	// * `ss`: Firebase snapshot
	// * `ob`: Javascript object literal

	var rootlink = 'https://gamma.firebase.com/therealest/chrysanthemum';
	var fbRoot = new Firebase(rootlink);

	// Initiators of Angular/Firebase connections
	function updateAngular(scope,mdTarget,fbSource) {
		return new AngFromFire(scope,mdTarget,fbSource);
	}

	function updateFirebase(scope,fbTarget,mdSource) {
		return new FireFromAng(scope,fbTarget,mdSource);
	}

	function fuse(scope,fb,md) {
		return new FireAngFuse(scope,fb,md);
	}

	// General object for connecting the Angular model to a Firebase asynchronous call
	function AngFromFire(scope,mdTarget,fbSource) {
		function withScope($scope) {
			return new AngFromFire($scope,mdTarget,fbSource);
		}

		function setMd(md) {
			return new AngFromFire(scope,md,fbSource);
		}

		var from = {
			fb : function(fbNewSource) {
				return new AngFromFire(scope,mdTarget,fbNewSource);
			},
			rl : function(rlNewSource) {
				var fbNewSource = fbFROMrl(rlNewSource);
				return new AngFromFire(scope,mdTarget,fbNewSource);
			}
		}

		function once() {
			fbSource.once('value',function(ss) {
				scope.safeApply(function() {
					scope[mdTarget] = obFROMss(ss);
				});
			});
		}

		function always() {
			fbSource.on('value',function(ss) {
				scope.safeApply(function() {
					scope[mdTarget] = obFROMss(ss);
				});
			});
		}

		function report() {
			var mdTargetReport = 'mdTarget: ' + mdTarget;
			var fbSourceReport = 'rlSource: ' + rlFROMfb(fbSource);
			var scopeReport;
			if (scope == undefined) {
				scopeReport = 'scope: undefined';
			} else {
				scopeReport = 'scope: set';
			}
			var report = scopeReport + '; ' + mdTargetReport + '; ' + fbSourceReport;
			console.log(report);
		}
		
		return {
			withScope:withScope,
			setMd:setMd,
			from:from,
			once:once,
			always:always,
			report:report
		}
	}

	// General object for pushing Angular view->model changes to a Firebase location
	function FireFromAng(scope,fbTarget,mdSource) {
		function withScope($scope) {
			return new FireFromAng($scope,fbTarget,mdSource);
		}

		function setRl(rl) {
			return new FireFromAng(scope,fbFROMrl(rl),mdSource);
		}

		function setFirebase(fb) {
			return new FireFromAng(scope,fb,mdSource);
		}

		var from = {
			md : function(mdNewSource) {
				return new FireFromAng(scope,fbTarget,mdNewSource);
			}
		}

		function once() {
			fbTarget.set(scope[mdSource]);
		}

		function always() {
			scope.$watch(mdSource,function(update,old) {
				if (update !== undefined) {
					fbTarget.set(update);
				}
			},true);
		}

		function report() {
			var fbTargetReport = 'rlTarget: ' + rlFROMfb(fbTarget);
			var mdSourceReport = 'mdSource: ' + mdSource;
			var scopeReport;
			if (scope == undefined) {
				scopeReport = 'scope: undefined';
			} else {
				scopeReport = 'scope: set';
			}
			var report = scopeReport + '; ' + fbTargetReport + '; ' + mdSourceReport;
			console.log(report);
		}
		
		return {
			withScope:withScope,
			setRl:setRl,
			setFirebase:setFirebase,
			from:from,
			once:once,
			always:always,
			report:report
		}
	}

	// Object for doing both AngFromFire and FireFromAng on the same fb/md pair
	function FireAngFuse(scope,fbRef,mdRef) {
		function withScope($scope) {
			return new FireAngFuse($scope,fbRef,mdRef);
		}

		function fb(fbRefNew) {
			return new FireAngFuse(scope,fbRefNew,mdRef);
		}

		function rl(rlRefNew) {
			return new FireAngFuse(scope,fbFROMrl(rlRefNew),mdRef);
		}

		function md(mdRefNew) {
			return new FireAngFuse(scope,fbRef,mdRefNew);
		}

		function install() {
			updateAngular(scope,mdRef,fbRef).always();
			updateFirebase(scope,fbRef,mdRef).always();
		}

		function report() {
			var fbRefReport = 'rl: ' + rlFROMfb(fbRef);
			var mdRefReport = 'mdRef: ' + mdRef;
			var scopeReport;
			if (scope == undefined) {
				scopeReport = 'scope: undefined';
			} else {
				scopeReport = 'scope: set';
			}
			var report = scopeReport + '; ' + fbRefReport + '; ' + mdRefReport;
			console.log(report);
		}

		return {
			withScope:withScope,
			fb:fb,
			rl:rl,
			md:md,
			install:install,
			report:report
		}
	}

	// Firebase conversion helper functions
	function fbFROMrl(rl) {
		return fbRoot.child(rl);
	}
	function rlFROMfb(fb) {
		var fullLink = fb.toString();
		fullLink = fullLink.replace(rootlink,'');
		return fullLink;
	}
	function obFROMss(ss) {
		return ss.val();
	}

	// Declaring public methods (Revealing Module Pattern)
	return {
		updateAngular:updateAngular,
		updateFirebase:updateFirebase,
		fuse:fuse,
		fbFROMrl:fbFROMrl,
		obFROMss:obFROMss
	}
}

function Autumn(wildfire) {
	var fbGames = wildfire.fbFROMrl('games');
	var currentGameID;

	wildfire.fbFROMrl('chat').push('fish');

	function newGame(info) {
		currentGameID = fbGames.push(info).name();
		//join game after creation
	}

	function deleteGame(gameID) {
		gameID = gameID || currentGameID;
		//check permissions
		fbGames.child(gameID).remove(function() {
			currentGameID = null;
		});
	}

	function startGame(gameID) {
		gameID = gameID || currentGameID;
		var game = fbGames.child(gameID);
		var readyAll = false;
		game.child('players').once('value',function(ssPlayers) {
			ssPlayers.forEach(function(ssPlayer) {
				var ready = ssPlayer.val().ready;
				readyAll = ready || readyAll;
			});
		});
		ready && game.child('started').set(true);
		return ready;
		//make players listen for game started?
	}

	function notifyReady() {
		//fbGames.child(currentGameID).child('players').child(spring.me).child('ready').set(true);
	}

	function notifyUnready() {
		//fbGames.child(currentGameID).child('players').child(spring.me).child('ready').remove();
	}

	function kickPlayer() {

	}

	function blockPlayer() {

	}

	function invitePlayer() {

	}

	function retrieveGameInfo(gameID) {
		gameID = gameID || currentGameID;
		var obGame;
		fbGames.child(gameID).once('value',function(ss) {
			obGame = ss.val();
		});
		return obGame;
	}

	function fuseGameList(scope) {
		wildfire.fuse().withScope(scope).fb(fbGames).md('gamelist').install();
	}

	return {
		newGame:newGame,
		deleteGame:deleteGame,
		startGame:startGame,
		notifyReady:notifyReady,
		notifyUnready:notifyUnready,
		kickPlayer:kickPlayer,
		blockPlayer:blockPlayer,
		invitePlayer:invitePlayer,
		retrieveGameInfo:retrieveGameInfo,

		fuseGameList:fuseGameList
	}
}