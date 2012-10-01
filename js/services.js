function Wildfire($http,$q) {
	// Firebase variable prefix convention:
	// ------------------------------------
	// * `var`: Javascript variable
	// * `rl`: relative link
	// * `fb`: Firebase object
	// * `ss`: Firebase snapshot
	// * `ob`: Javascript object literal

	var rootlink = 'http://gamma.firebase.com/therealest/';
	var fbRoot = new Firebase(rootlink);
	var scope;

	// First function called when setting an ng-model variable from Firebase
	function withScope($scope) {
		return new AngFromFire($scope);
	}

	// General object for connecting the Angular model to a Firebase asynchronous call
	function AngFromFire(scope,varTarget,fbSource) {
		function setVar(variable) {
			return new AngFromFire(scope,variable);
		}

		var from = {
			fb : function(fbNewSource) {
				return new AngFromFire(scope,varTarget,fbNewSource);
			},
			rl : function(rlNewSource) {
				var fbNewSource = fbFROMrl(rlNewSource);
				return new AngFromFire(scope,varTarget,fbNewSource);
			}
		}

		function once() {
			fbSource.once('value',function(ss) {
				scope.$apply(function() {
					scope[varTarget] = obFROMss(ss);
				});
			});
		}

		function always() {
			fbSource.on('value',function(ss) {
				scope.$apply(function() {
					scope[varTarget] = obFROMss(ss);
				});
			});
		}

		function report() {
			var varTargetReport = 'varTarget: ' + varTarget;
			var fbSourceReport = 'rlSource: ' + rlFROMfb(fbSource);
			var report = varTargetReport + '; ' + fbSourceReport;
			console.log(scope);
			console.log(report);
		}
		
		return {
			setVar:setVar,
			from:from,
			once:once,
			always:always,

			varTarget:varTarget,
			fbSource:fbSource,
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
		withScope:withScope
	}
}