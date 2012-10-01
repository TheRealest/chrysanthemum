function WelcomeCtrl($scope,wildfire) {
	wildfire.withScope($scope).setVar('test').from.rl('room').report();
}

function MatchMakerCtrl($scope) {
	
}