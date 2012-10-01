function WelcomeCtrl($scope,wildfire) {
	wildfire.fuse().withScope($scope).rl('test').mod('test').install();

}

function MatchMakerCtrl($scope) {
	
}