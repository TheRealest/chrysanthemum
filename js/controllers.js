function WelcomeCtrl($scope,wildfire) {
	wildfire.fuse().withScope($scope).rl('test').md('test').install();

}

function MatchMakerCtrl($scope) {
	
}