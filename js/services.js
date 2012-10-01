function Wildfire($http,$q) {
	// Firebase variable prefix convention:
	// ------------------------------------
	// * `rl`: relative link
	// * `fb`: Firebase object
	// * `ss`: Firebase snapshot
	// * `ob`: Javascript object literal

	var fbRoot = new Firebase('http://gamma.firebase.com/therealest');



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