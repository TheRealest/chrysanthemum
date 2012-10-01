function Wildfire($http,$q) {
	// Firebase variable prefix convention:
	// ------------------------------------
	// * `mod`: Angular model variable
	// * `rl`: relative link
	// * `fb`: Firebase object
	// * `ss`: Firebase snapshot
	// * `ob`: Javascript object literal

	var rootlink = 'http://gamma.firebase.com/therealest/';
	var fbRoot = new Firebase(rootlink);

	// Initiators of Angular/Firebase connections
	function updateAngular(scope,modTarget,fbSource) {
		return new AngFromFire(scope,modTarget,fbSource);
	}

	function updateFirebase(scope,fbTarget,modSource) {
		return new FireFromAng(scope,fbTarget,modSource);
	}

	function fuse(scope,fb,mod) {
		return new FireAngFuse(scope,fb,mod);
	}

	// General object for connecting the Angular model to a Firebase asynchronous call
	function AngFromFire(scope,modTarget,fbSource) {
		function withScope($scope) {
			return new AngFromFire($scope,modTarget,fbSource);
		}

		function setMod(model) {
			return new AngFromFire(scope,model,fbSource);
		}

		var from = {
			fb : function(fbNewSource) {
				return new AngFromFire(scope,modTarget,fbNewSource);
			},
			rl : function(rlNewSource) {
				var fbNewSource = fbFROMrl(rlNewSource);
				return new AngFromFire(scope,modTarget,fbNewSource);
			}
		}

		function once() {
			fbSource.once('value',function(ss) {
				scope.$apply(function() {
					scope[modTarget] = obFROMss(ss);
				});
			});
		}

		function always() {
			fbSource.on('value',function(ss) {
				scope.$apply(function() {
					scope[modTarget] = obFROMss(ss);
				});
			});
		}

		function report() {
			var modTargetReport = 'modTarget: ' + modTarget;
			var fbSourceReport = 'rlSource: ' + rlFROMfb(fbSource);
			var scopeReport;
			if (scope == undefined) {
				scopeReport = 'scope: undefined';
			} else {
				scopeReport = 'scope: set';
			}
			var report = scopeReport + '; ' + modTargetReport + '; ' + fbSourceReport;
			console.log(report);
		}
		
		return {
			withScope:withScope,
			setMod:setMod,
			from:from,
			once:once,
			always:always,
			report:report
		}
	}

	// General object for pushing Angular view->model changes to a Firebase location
	function FireFromAng(scope,fbTarget,modSource) {
		function withScope($scope) {
			return new FireFromAng($scope,fbTarget,modSource);
		}

		function setRl(rl) {
			return new FireFromAng(scope,fbFROMrl(rl),modSource);
		}

		function setFirebase(fb) {
			return new FireFromAng(scope,fb,modSource);
		}

		var from = {
			mod : function(modNewSource) {
				return new FireFromAng(scope,fbTarget,modNewSource);
			}
		}

		function once() {
			fbTarget.set(scope[modSource]);
		}

		function always() {
			scope.$watch(modSource,function(update,old) {
				if (update !== undefined) {
					fbTarget.set(update);
				}
			});
		}

		function report() {
			var fbTargetReport = 'rlTarget: ' + rlFROMfb(fbTarget);
			var modSourceReport = 'modSource: ' + modSource;
			var scopeReport;
			if (scope == undefined) {
				scopeReport = 'scope: undefined';
			} else {
				scopeReport = 'scope: set';
			}
			var report = scopeReport + '; ' + fbTargetReport + '; ' + modSourceReport;
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

	// Object for doing both AngFromFire and FireFromAng on the same fb/mod pair
	function FireAngFuse(scope,fbRef,modRef) {
		function withScope($scope) {
			return new FireAngFuse($scope,fbRef,modRef);
		}

		function fb(fbRefNew) {
			return new FireAngFuse(scope,fbRefNew,modRef);
		}

		function rl(rlRefNew) {
			return new FireAngFuse(scope,fbFROMrl(rlRefNew),modRef);
		}

		function mod(modRefNew) {
			return new FireAngFuse(scope,fbRef,modRefNew);
		}

		function install() {
			updateAngular(scope,modRef,fbRef).always();
			updateFirebase(scope,fbRef,modRef).always();
		}

		function report() {
			var fbRefReport = 'rl: ' + rlFROMfb(fbRef);
			var modRefReport = 'modRef: ' + modRef;
			var scopeReport;
			if (scope == undefined) {
				scopeReport = 'scope: undefined';
			} else {
				scopeReport = 'scope: set';
			}
			var report = scopeReport + '; ' + fbRefReport + '; ' + modRefReport;
			console.log(report);
		}

		return {
			withScope:withScope,
			fb:fb,
			rl:rl,
			mod:mod,
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
		fuse:fuse
	}
}