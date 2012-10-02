function WelcomeCtrl($scope,wildfire) {
	wildfire.fuse().withScope($scope).rl('test').md('test').install();
	wildfire.fuse().withScope($scope).rl('apartment').md('apartment').install();
}

function MatchMakerCtrl($scope) {
	
}