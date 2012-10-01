function Wildfire($http,$q) {
	// FIREBASE VARIABLE PREFIX CONVENTION:
	// rl: relative link
	// fb: Firebase object
	// ss: snapshot
	// ob: Javascript object literal

	// Conversion examples:
	// fb* = fbFROMrl(rl*);
	// fb* = ss*.ref();
	// rl* = fb*.toString();
	// ss* = fb*.once('value',function(ss*){ return ss*});
	// ob* = ss*.val();
	// ob* = fb*.once('value',function(ss*){ return ss*.val()});
	// ob* = fbFROMrl(rl*).once('value',function(ss*){ return ss*.val()});

	// Maybe create some helper functions like ssFROMfb?

	// var foo;
	var fbRoot = new Firebase('http://gamma.firebase.com/therealest');

	function getValue(scope,rl) {
		var deferred = $q.defer();
		var ob;

		var fb = fbFROMrl(rl);
		fb.once('value', function(snapshot) {
			ob = snapshot.val();
			console.log(ob);

			scope.$apply(function() {
				deferred.resolve(ob);
			});
		});

		return deferred.promise;
	}



	// $http.get('data/cardlist-export.json').success(function(data) {
	// 	foo = data.spring_showers.displaycontent.name;
	// 	console.log(foo);
	// });
	// console.log(foo);


	// Firebase conversion helper functions
	function fbFROMrl(rl) {
		return fbRoot.child(rl);
	}

	return {
		// foo:foo
		getValue:getValue
	}
}