function WelcomeCtrl($scope,wildfire) {
	wildfire.setScope($scope);
	wildfire.setVar('test').from.rl('room').once();
}

function MatchMakerCtrl($scope) {
	
}