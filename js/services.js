function Wildfire($http,$q) {
	// Firebase variable prefix convention:
	// ------------------------------------
	// * `rl`: relative link
	// * `fb`: Firebase object
	// * `ss`: Firebase snapshot
	// * `ob`: Javascript object literal

	var fbRoot = new Firebase('http://gamma.firebase.com/therealest');

	function getValue(scope,rl) {
		// Create a deferred object with `$q`
		var deferred = $q.defer();
		var ob;

		// Turn the relative link passed to the function into a Firebase object
		var fb = fbFROMrl(rl);
		fb.once('value', function(ss) {
			// Get the data stored at this Firebase location
			ob = obFROMss(ss);

			// We need to wrap the deferred resolution in an `$apply` call so that the view properly updates when the asynchronous call is completed

			// We pass the scope of the controller to the Wildfire function so that the controller can remain ignorant to promises, deferreds, and `$q`
			scope.$apply(function() {
				// This tells deferred to set its promise equal to `ob` when the asynchronous call for `ob` is completed
				deferred.resolve(ob);
			});
		});

		// Finally we return a promise so that the controller which called this function knows to expect the result when the asynchronous call is complete

		// In the mean time the view will simply be empty
		return deferred.promise;
	}

	function updateValue(variable,rl) {
		fbFROMrl(rl).on('value', function(ss) {
			
		});
	}

	// Firebase conversion helper functions
	function fbFROMrl(rl) {
		return fbRoot.child(rl);
	}
	function obFROMss(ss) {
		return ss.val();
	}

	// Declaring public methods (Revealing Module Pattern)
	return {
		getValue:getValue
	}
}