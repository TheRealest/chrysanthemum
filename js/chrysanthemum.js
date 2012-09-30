/////////////////////////////////////////////////
////    BUILDING THE GAME                    ////
/////////////////////////////////////////////////

// Reference info
var rootlink = 'https://gamma.firebase.com/therealest/';
var chrysanthemum = new Firebase(rootlink + 'chrysanthemum');
var users = chrysanthemum.child('users');
var cardlist, actionlist, timerlist, plantlistsnapshot, plantlist, setlist;
chrysanthemum.once('value',function(snapshot) {
	cardlist = snapshot.val().cardlist;
	actionlist = snapshot.val().actionlist;
	timerlist = snapshot.val().timerlist;
	plantlistsnapshot = snapshot.child('plantlist');
	plantlist = snapshot.val().plantlist;
	setlist = snapshot.val().setlist;

	pregame();
});

var username;
var currentuser;

var deck;
var hand;
var discard;
var gamestate;
var queue;
var queue_empty;
var queue_size;
var draw_timer;
var interval_stack;
var timeout_stack;
var global_time;

var grow_cycle;
var points;
var plant;
var game_over;

var opponent;
var opponent_name;
var opponent_plant;
var opponent_grow_cycle;
var opponent_points;
var opponent_queue;
var opponent_gamestate;

function build_user(name) {
	username = name;
	currentuser = users.child(username);

	deck = currentuser.child('deck');
	hand = currentuser.child('hand');
	discard = currentuser.child('discard');
	currentuser.child('gamestate').set('notready');
	currentuser.child('gamestate').on('value', function(snapshot) {
		gamestate = snapshot.val();
	})
	queue = currentuser.child('queue');
	queue_empty = new Array();
	queue_size = 0;
	draw_timer = currentuser.child('draw_timer');
	interval_stack = new Array();
	timeout_stack = new Array();
	global_time = new Date();

	grow_cycle = currentuser.child('grow_cycle');
	points = currentuser.child('points');
	plant = currentuser.child('plant');
	plant.set($('.selected-plant').attr('id'));
	game_over = false;

	currentuser.setPriority(time());
}

// Card manipulation functions
function deck_priority() {
	var priority_range = 1000;
	return Math.floor(priority_range*Math.random());
}
function is_deck_empty() {
	var empty;
	deck.once('value',function(snapshot){
		if (snapshot.val() == null) {
			empty = true;
		} else {
			empty = false;
		}
	});
	return empty;
}
function gain_card(cardtype) {
	return discard.push({cardtype: cardtype});
}
function buy_card(cardtype) {
	var cost = cardlist[cardtype].displaycontent.cost;
	if (grow_cycle >= cost) {
		grow_cycle.transaction(function(current_value){return current_value-cost;});
		gain_card(cardtype);
	} else {
		post_alert('Insufficient funds');
	}
}
function discard_card(snapshot) {
	gain_card(snapshot.val().cardtype);
	snapshot.ref().remove();
}
function draw_card() {
	var drawn_cardtype;
	if (is_deck_empty()) {shuffle_discard_into_deck();}
	deck.transaction(function(deckval) {
		for (card in deckval) {
			drawn_cardtype = deckval[card].cardtype;
			delete deckval[card];
			hand.push({cardtype: drawn_cardtype});
			break;
		}
		return deckval;
	});	
}
function draw_n_cards(n) {
	for (var i = 0; i < n; i++) {
		draw_card();
	};
}
function shuffle_discard_into_deck() {
	discard.once('value', function(discard_snapshot) {
		discard_snapshot.forEach(function(card_snapshot) {
			var discardtype = card_snapshot.val().cardtype;
			deck.push({cardtype: discardtype}).setPriority(deck_priority());
			card_snapshot.ref().remove();
		})
	})
}
function play_card(snapshot) {
	if (queue_count() < queue_size) {
		if (!game_over) {
			discard_card(snapshot);
			var cardtype = snapshot.val().cardtype;
			var card = cardlist[cardtype];
			var duration = card.duration;
			var timertype = card.timer.timertype;
			var timerarg1 = card.timer.timerarg1;
			var timerarg2 = card.timer.timerarg2;
			add_timer_to_queue(timertype,duration,timerarg1,timerarg2);
			var actiontype = card.action.actiontype;
			var actionarg1 = card.action.actionarg1;
			var actionarg2 = card.action.actionarg2;
			var interval = card.action.interval;
			var timing = {duration: duration, interval: interval};
			add_action_to_stack(actiontype,timing,actionarg1,actionarg2);
		} else {
			post_alert("Can't play cards after the game is over.");
		}
	} else {
		post_alert("Queue is full.")
	}
}
function add_timer_to_queue(timertype,duration,arg1,arg2) {
	var timer = timerlist[timertype];
	var starttime = time();
	var ref;
	if (typeof arg1 != 'undefined') {
		if (typeof arg2 != 'undefined') {
			ref = queue.push({timertype: timertype, starttime: starttime, duration: duration, timerarg1: arg1, timerarg2: arg2});
		} else {
			ref = queue.push({timertype: timertype, starttime: starttime, duration: duration, timerarg1: arg1});
		}
	} else {
		ref = queue.push({timertype: timertype, starttime: starttime, duration: duration});
	}
	setTimeout(function(){ref.remove();},duration*1000);
}
function queue_count() {
	var count = 0;
	queue.once('value', function(queue_snapshot){
		queue_snapshot.forEach(function(timer_snapshot){
			count++;
		});
	});
	return count;
}
function add_action_to_stack(actiontype,timing,arg1,arg2) {
	var action = actionlist[actiontype];
	var code = action.action;
	code = code.replace('%arg1%',arg1);
	code = code.replace('%arg2%',arg2);

	var timeout_ref, interval_ref;
	if (action.execution == 'delay') {
		timeout_ref = setTimeout(function(){eval(code);},timing.duration*1000);
		timeout_stack.push(timeout_ref);
		setTimeout(function(){timeout_stack.splice(timeout_stack.indexOf(timeout_ref),1)},timing.duration*1000);
	} else if (action.execution == 'continuous') {
		interval_ref = setInterval(function(){eval(code);},timing.interval*1000);
		timeout_ref = setTimeout(function(){clearInterval(interval_ref); interval_stack.splice(interval_stack.indexOf(interval_ref),1);},timing.duration*1000);
		interval_stack.push(interval_ref);
		timeout_stack.push(timeout_ref);
		setTimeout(function(){timeout_stack.splice(timeout_stack.indexOf(timeout_ref),1)},duration*1000);
	}
}
function build_starting_deck() {
	deck.set('');
	hand.set('');
	discard.set('');
	deck.push({cardtype: 'clear_skies'});
	deck.push({cardtype: 'clear_skies'});
	deck.push({cardtype: 'cloudy_skies'});
	deck.push({cardtype: 'cloudy_skies'});
	deck.push({cardtype: 'cloudy_skies'});
	deck.push({cardtype: 'bad_weather'});
	// deck.push({cardtype: 'tidy_up'});
}

// Data manipulation functions
function adjust_grow_cycle(amount) {
	grow_cycle.transaction(function(current_time){return current_time+amount;});
}
function adjust_points(amount) {
	points.transaction(function(current_points){return current_points+amount;});
}
function card_count(pile) {
	var count = 0;
	if (pile == 'deck') {
		deck.once('value', function(deck_snapshot){
			deck_snapshot.forEach(function(card_snapshot){
				count++;
			});
		});
	} else if (pile == 'discard') {
		discard.once('value', function(discard_snapshot){
			discard_snapshot.forEach(function(card_snapshot){
				count++;
			});
		});
	}
	return count;
}
function post_alert(text) {
	// add alert area
}
function lowest_empty_queue() {
	for (var i = 0; i < queue_size; i++) {
		if (queue_empty[i]) {return i+1;}
	};
	return null;
}

// Display functions
function simple_card_name(snapshot,target_tag) {
	var display = '<div id="%id%" class="cardname">%name%</div>';
	display = display.replace('%id%',snapshot.name());
	display = display.replace('%name%',cardlist[snapshot.val().cardtype].displaycontent.name);
	$('#'+target_tag).append(display);
}
function display_card(snapshot,target_tag) {
	var cardtype = snapshot.val().cardtype;
	var card = cardlist[cardtype];
	var displaycontent = card.displaycontent;
	var display = '<div id="%id%" class="card" style="%style%"><span class="cardname">%name%</span><br /><span class="text">%text%</span><br /> <br /><span class="bottom"><span class="timer">%timer%</span> <span class="cost">%cost%</span> <span class="duration">%duration%</span></span></div>';
	display = display.replace('%id%',snapshot.name());
	display = display.replace('%style%',displaycontent.style + ' float: left;');
	display = display.replace('%name%',displaycontent.name);
	display = display.replace('%text%',displaycontent.text);
	display = display.replace('%timer%',generate_timer_text(card.timer));
	display = display.replace('%cost%',format_seconds(displaycontent.cost));
	display = display.replace('%duration%',card.duration);
	$('#'+target_tag).append(display);
}
function format_seconds(seconds) {
	var secondsrem = seconds % 60;
	var minutes = 0;
	while (seconds != secondsrem) {
		seconds -= 60;
		minutes++;
	}
	if (seconds < 10) {seconds = '0' + seconds;}
	return minutes + ':' + seconds;
}
function generate_timer_text(timerval) {
	var timer_ex = timerlist[timerval.timertype];
	var text;
	if (typeof timerval.timerarg1 != 'undefined') {
		if (typeof timerval.timerarg2 != 'undefined') {
			text = timer_ex.text +' ('+timerval.timerarg1+')'+' ('+timerval.timerarg2+')';
		} else {
			text = timer_ex.text +' ('+timerval.timerarg1+')';
		}
	} else {
		text = timer_ex.text;
	}
	return text;
}
function display_timer(snapshot,target_tag) {
	var timer = snapshot.val();
	var timer_ex = timerlist[timer.timertype];
	var display = '<div id="%id%" class="timer"><span class="timer_label">%text%:</span><br /><section class="outer-bar"><section class="inner-bar" style="%bar_style%"></section></section></div>';
	display = display.replace('%id%',snapshot.name());
	var text = generate_timer_text(timer);
	display = display.replace('%text%',text);
	var delay = time() - timer.starttime;
	var animationcode = 'animation: ' + timer_ex.animation_type + ' ' + timer.duration + 's linear -' + delay + 'ms;';
	var bar_style = timer_ex.bar_style + ' -moz-' + animationcode + ' -webkit-' + animationcode;
	display = display.replace('%bar_style%',bar_style);

	$('#'+target_tag).append(display);
}
function time() {
	return new Date().getTime();
}
function display_market() {
	var fl;
	var marketlist = {blossom: '', growth: '', spring_showers: '', careful_study: '', research: '', garden_plot: '', pesticide: '', };
	for (cardtype in marketlist) {
		if (fl == ' float: left;') {fl = ' float: right;';} else {fl = ' float: left;';}
		var card = cardlist[cardtype];
		var displaycontent = card.displaycontent;
		var display = '<div id="%cardtype%" class="card" style="%style%"><span class="cardname">%name%</span><br /><span class="text">%text%</span><br /> <br /><span class="bottom"><span class="timer">%timer%</span> <span class="cost">%cost%</span> <span class="duration">%duration%</span></span></div>';
		display = display.replace('%cardtype%',cardtype);
		display = display.replace('%style%',displaycontent.style + fl);
		display = display.replace('%name%',displaycontent.name);
		display = display.replace('%text%',displaycontent.text);
		display = display.replace('%timer%',generate_timer_text(card.timer));
		display = display.replace('%cost%',format_seconds(displaycontent.cost));
		display = display.replace('%duration%',card.duration);
		$('#market-zone').append(display);
		$('#'+cardtype).click(function(){buy_card(this.id);});
	}
}


/////////////////////////////////////////////////
////    RUNNING THE GAME                     ////
/////////////////////////////////////////////////

function pregame() {
	$('#start-game').click(function() {
		currentuser.child('gamestate').set('starting');
		$('#pregame-screen').addClass('hidden');
		$('#starting-screen').removeClass('hidden');
		var countdown = setInterval(function(){
			$('#starting-screen').text(parseInt($('#starting-screen').text())-1);
		},1000);
		setTimeout(function(){
			clearInterval(countdown);
			$('#starting-screen').addClass('hidden');
			$('#game-zone').removeClass('hidden');
		},3000);
		game();
	});
	$('#current-user-username').keyup(function() {
		$(this).removeClass('unedited');
	});
	$('#current-user-username').keypress(function(e) {
		if (e.keyCode == 13) {
			$('#current-user-username').attr('contenteditable','false');
			$('#current-user-username').removeClass('unsubmitted');
			build_user($('#current-user-username').text());
			currentuser.child('plant').on('value', function(snapshot) {
				$('#current-user-plant').text(plantlist[snapshot.val()].commonname);
			});
			$('#current-user-username').blur();
		}
	});
	users.startAt(time()).on('child_added', function(snapshot) {
		var name = snapshot.name();
		if (name != username) {
			opponent_username = name;
			$('#opponent-username').text(opponent_username);
			users.child(snapshot.name()).child('plant').on('value', function(snapshot) {
				opponent_plant = snapshot.val();
				$('#opponent-plant').text(plantlist[opponent_plant].commonname);
			});
			opponent_gamestate = users.child(snapshot.name()).child('gamestate');
			opponent_gamestate.on('value', function(snapshot)  {
				if (snapshot.val() == 'starting' && gamestate != 'starting') {$('#start-game').click();}
			});
		}
	});

	jQuery.each(setlist, function(set, info) {
		var display = '<div id="%set%" class="tab">%setname%</div>';
		display = display.replace('%set%',set);
		display = display.replace('%setname%',info.displayname);
		$('#tabs').append(display);
	});
	$('.tab:last').addClass('last-tab');
	$('.tab:first').addClass('selected-tab');
	
	$('.tab').click(function() {
		$('.tab').removeClass('selected-tab');
		$(this).addClass('selected-tab');
		$('#plant-panels > div').removeClass('selected-set');
		$('#plant-panels #'+$(this).attr('id')).addClass('selected-set');
	})

	jQuery.each(setlist, function(set, info) {
		var display = '<div id="%set%">';

		for (var i = 1; i <=4; i++) {
			var plantname = info['plant'+i];
			var plant = plantlist[plantname];
			var plantdisplay = '<div id="%plantname%" class="plant-panel">' +
				'<div id="header">' +
				'<span class="common-name">%commonname%</span><br />' +
				'<span class="scientific-name">%scientificname%</span> ' +
				'</div> ' +
				'<div id="image"><img src="images/sets/%set%/%plantname%/picture.jpg"></div> ' +
				'<div id="flavor-text"><img src="images/sets/%set%/%plantname%/icon.png" class="icon">%flavortext%</div> ' +
				'<div id="grow-cycle"> ' +
				'<span class="label">Grow Cycle:</span> ' +
				'<span class="value"><img src="images/game/cycle-2-black.png">%growcycle%</span> ' +
				'</div> ' +
				'<div id="queue-size"> ' +
				'<span class="label">Queue Size:</span> ' +
				'<span class="value">%queuesize%</span> ' +
				'</div> ' +
				'<div id="%plantname%-plant-cards" class="plant-cards"></div> ' +
				'</div> '
			plantdisplay = plantdisplay.replace(/%plantname%/g,plantname);
			plantdisplay = plantdisplay.replace('%commonname%',plant.commonname);
			plantdisplay = plantdisplay.replace('%scientificname%',plant.scientificname);
			plantdisplay = plantdisplay.replace('%flavortext%',plant.flavortext);
			plantdisplay = plantdisplay.replace('%growcycle%',format_seconds(plant.startinggrowcycle));
			plantdisplay = plantdisplay.replace('%queuesize%',plant.startingqueuesize);
			display += plantdisplay;
		};
		display = display.replace(/%set%/g,set);
		$('#plant-panels').append(display);
	});
	plantlistsnapshot.forEach(function(plantsnapshot) {
		plantsnapshot.child('startingcards').forEach(function(cardsnapshot) {
			display_card(cardsnapshot,plantsnapshot.name()+'-plant-cards');
		});
	});
	$('#plant-panels > div:first').addClass('selected-set');
	$('.plant-panel:first').addClass('selected-plant');
	$('.plant-panel').click(function() {
		$('.plant-panel').removeClass('selected-plant');
		$(this).addClass('selected-plant');
		if (currentuser) {currentuser.child('plant').set($(this).attr('id'));}
	});

}

function game() {
	game_over = true;
	display_market();
	build_starting_deck();
	// hand.push({cardtype: 'research'});
	// hand.push({cardtype: 'preparation'});
	// discard.push({cardtype: 'spring_showers'});
	// discard.push({cardtype: 'blossom'});
	// discard.push({cardtype: 'pesticide'});
	// draw_n_cards(5);

	var grow_cycle_interval;

	var initial_queue_size;
	plant.once('value', function(snapshot) {
		$('#plant').text(plantlist[snapshot.val()].commonname);
		grow_cycle.set(plantlist[snapshot.val()].startinggrowcycle);
		initial_queue_size = plantlist[snapshot.val()].startingqueuesize;
	});

	points.set(0);

	var draw_delay = 10;
	var initial_hand = 5;
	currentuser.child('queue_size').set(initial_queue_size);
	for (var i = 0; i < initial_queue_size; i++) {
		queue_empty[i] = true;
	};

	deck.on('value', function(snapshot) {
		var deck_label = 'DECK<br />(' + card_count('deck') + ')';
		$('#deck').html(deck_label);
		$('#deck').addClass('flash');
		setTimeout(function(){$('#deck').removeClass('flash');},450);
	});
	discard.on('value', function(snapshot) {
		var discard_label = 'DISCARD<br />(' + card_count('discard') + ')';
		$('#discard').html(discard_label);
		$('#discard').addClass('flash');
		setTimeout(function(){$('#discard').removeClass('flash');},450);
	});

	hand.on('child_added', function(snapshot) {
		display_card(snapshot,'hand');
		$('#'+snapshot.name()).click(function(){play_card(snapshot)});
	});
	hand.on('child_removed', function(snapshot) {
		$('#' + snapshot.name()).remove();
	});

	queue.set('');
	queue.on('child_added', function(snapshot) {
		display_timer(snapshot,'queue'+lowest_empty_queue());
		queue_empty[lowest_empty_queue()-1] = false;
	});
	queue.on('child_removed', function(snapshot) {
		var i = '';
		i = $('#' + snapshot.name()).parent('.queue').attr('id');
		i = i.replace('queue','');
		queue_empty[parseInt(i)-1] = true;
		$('#' + snapshot.name()).remove();
	});
	currentuser.child('queue_size').on('value', function(snapshot) {
		if (snapshot.val() > queue_size) {
			for (var i = queue_size+1; i <= snapshot.val(); i++) {
				$('#current-user-zone').append('<div id="queue' + i + '" class="queue"></div>');
				queue_empty[i-1] = true;
			};
		} else if (snapshot.val() < queue_size) {
			for (var i = queue_size; i > snapshot.val(); i--) {
				$('#current-user-zone #queue' + i).remove();
				queue_empty[i-1] = false;
			};
		}
		queue_size = snapshot.val();
	});

	draw_timer.set('');
	draw_timer.on('child_added', function(snapshot) {
		if (!game_over) {
			display_timer(snapshot,'draw_timer');
			var newtext = $('#'+snapshot.name()+' .timer_label').text().replace('Draw (1):','Draw Timer');
			$('#'+snapshot.name()+' .timer_label').html(newtext);
		}
	});
	draw_timer.on('child_removed', function(snapshot) {
		$('#' + snapshot.name()).remove();
	});
	draw_timer.push({timertype: 'draw_n', timerarg1: '1', starttime: time(), duration: draw_delay});
	draw_timer_interval = setInterval(function(){
		draw_card();
		draw_timer.set('');
		draw_timer.push({timertype: 'draw_n', timerarg1: '1', starttime: time(), duration: draw_delay});
		if (game_over) {clearInterval(draw_timer_interval);}
	},draw_delay*1000);
	draw_n_cards(5);

	grow_cycle.on('value', function(snapshot) {
		var value = snapshot.val();
		if (value < 30 && !$('#current-user-status #grow-cycle #value').hasClass('colored')) {$('#current-user-status #grow-cycle #value').addClass('colored')}
		if (value >= 30 && $('#current-user-status #grow-cycle #value').hasClass('colored')) {$('#current-user-status #grow-cycle #value').removeClass('colored')}
		if (value <= 0) {clearInterval(grow_cycle_interval); $('#current-user-status #grow-cycle #value').addClass('strike'); game_over = true;}
		if (game_over) {value = 0;}
		$('#current-user-status #grow-cycle #value').html(format_seconds(value));
	});
	points.on('value', function(snapshot) {
		$('#current-user-status #points #value').html(snapshot.val());
		$('#current-user-status #points #value').addClass('colored');
		setTimeout(function(){$('#current-user-status #points #value').removeClass('colored');},200);
	});
	$('#current-user-status #username').text(username);

	opponent = users.child(opponent_username);
	opponent_grow_cycle = opponent.child('grow_cycle');
	opponent_points = opponent.child('points');
	opponent_queue = opponent.child('queue');
	opponent_grow_cycle.on('value', function(snapshot) {
		var value = snapshot.val();
		if (value < 30 && !$('#opponent-status #grow-cycle #value').hasClass('colored')) {$('#opponent-status #grow-cycle #value').addClass('colored')}
		if (value >= 30 && $('#opponent-status #grow-cycle #value').hasClass('colored')) {$('#opponent-status #grow-cycle #value').removeClass('colored')}
		if (value <= 0) {clearInterval(grow_cycle_interval); $('#opponent-status #grow-cycle #value').addClass('strike'); game_over = true;}
		if (game_over) {value = 0;}
		$('#opponent-status #grow-cycle #value').html(format_seconds(value));
	});
	opponent_points.on('value', function(snapshot) {
		$('#opponent-status #points #value').html(snapshot.val());
		$('#opponent-status #points #value').addClass('colored');
		setTimeout(function(){$('#opponent-status #points #value').removeClass('colored');},200);
	});
	$('#opponent-status #username').text(opponent_username);

	setTimeout(function(){start_game();},3000);
}
function start_game() {
	console.log('called start_game()');
	game_over = false;
	grow_cycle_interval = setInterval(function(){
		grow_cycle.transaction(function(value){return value-1;})
	},1000);
}