var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var port = process.env.PORT || 80;

var url = require('url');
var fs = require('fs');

var searchingUsers = [], userCount = 0, searchingUsersCount = 0, taken = 0;
var game = [], moves = [], allUsers = [], nicks = [], xo = [];
var nicksInOrder = [], chellenges = [];


//loading needed files onto server=============================
app.get('/', function(req, res) {
  	res.sendFile(__dirname + '/public/tic-tac-toe.html');
});

app.get('/public/vue.js', function(req, res) {
  	res.sendFile(__dirname + '/public/vue.js');
});
  
app.get('/public/css/main.css', function(req, res) {
    res.sendFile(__dirname + '/public/css/main.css');
});

app.get('/public/css/nickMenu.css', function(req, res) {
 	res.sendFile(__dirname + '/public/css/nickMenu.css');
});

app.get('/public/css/leftMenu.css', function(req, res) {
  	res.sendFile(__dirname + '/public/css/leftMenu.css');
});

app.get('/public/css/gameField.css', function(req, res) {
  	res.sendFile(__dirname + '/public/css/gameField.css');
});

app.get('/public/css/playersMenu.css', function(req, res) {
	res.sendFile(__dirname + '/public/css/playersMenu.css');
});

app.get('/public/img/white_o.jpg', function(req, res) {
  	res.sendFile(__dirname + '/public/img/white_o.jpg');
});

app.get('/public/img/white_x.jpg', function(req, res) {
  	res.sendFile(__dirname + '/public/img/white_x.jpg');
});

app.get('/public/img/c13.jpg', function(req, res) {
  	res.sendFile(__dirname + '/public/img/c13.jpg');
});
//=============================================================

//all the functions (proper server)============================
io.on('connection', function(socket){
	console.log("New user connected");

	io.to(socket.id).emit('connectionResize');

	//when user enters nick------------------------------
	socket.on('enteredNick', function(nick) {
		//checking if the nick is already taken
		for (var i = 0; i < userCount; i++) {
			if (nicks[allUsers[i]] == nick) taken = 1;
		}

		//checking if the nick doesn't have unallowed characters
		for (var i = 0; i < nick.length; i++) {
			var tmp = nick.charCodeAt(i);
			if (tmp < 65 || (tmp > 90 && tmp < 97) || tmp > 122) taken = 2;
			if (tmp >= 48 && tmp <= 57) taken = 0;
		}

		if (nick.length < 3) { //if the nick is too short throw error
			taken = 0;
			io.to(socket.id).emit('nick', nick, 1);
		}
		else if (taken == 2) { //if the nick has unallowed characters throw error
			taken = 0;
			io.to(socket.id).emit('nick', nick, 2);
		}
		else if (taken == 1) { //if the nick was taken throw error
			taken = 0;
			io.to(socket.id).emit('nick', nick, 0);
		}
		else if (taken == 0) { //if the nick is good add the player
			allUsers[userCount] = socket.id;
			nicks[socket.id] = nick;
			console.log("New player == ID: " + allUsers[userCount] + " Nick: " + nicks[allUsers[userCount]]);
			userCount++;
			
			io.to(socket.id).emit('newPlayer', nick);
			
			
			for (var i = 0; i < userCount; i++) nicksInOrder[i] = nicks[allUsers[i]];
			for (var i = 0; i < userCount; i++) io.to(allUsers[i]).emit('renderActivePlayers', nicksInOrder, userCount);
		}

	});
	//---------------------------------------------------
	
	//when player wishes to start a quick game
	socket.on('quickPlay', function(){ 
		//add player to searching users
		for (var i = 0; i < userCount && allUsers[i] != socket.id; i++);
		searchingUsers[searchingUsersCount] = socket.id;
		searchingUsersCount++;

		io.to(socket.id).emit('searching');
		
		console.log("Searching Quick Play for " + socket.id + " " + nicks[socket.id]);

		//if there are more than one player searching start the game between them
		if (searchingUsersCount > 1) {
			//pair them
			game[searchingUsers[searchingUsersCount - 1]] = searchingUsers[0];
			game[searchingUsers[0]] = searchingUsers[searchingUsersCount - 1];

			//delete from searching users
			searchingUsers.splice(searchingUsersCount - 1, 1);
			searchingUsers.splice(0,1);
			searchingUsersCount -= 2;

			//randomizing who is x and who is o
			xo[socket.id] = Math.floor(Math.random() * 2);
			xo[game[socket.id]] = 1 - xo[socket.id];
			moves[socket.id] = xo[socket.id];
			moves[game[socket.id]] = xo[game[socket.id]];

			console.log("Found Game between: '" + nicks[socket.id] + "' and '" + nicks[game[socket.id]] + "'");
			console.log(nicks[socket.id] + " is " + moves[socket.id] + " and " + nicks[game[socket.id]] + " is " + moves[game[socket.id]]);

			io.to(socket.id).emit('newGame', nicks[game[socket.id]]);
			io.to(game[socket.id]).emit('newGame', nicks[socket.id]);

			io.to(socket.id).emit('moveInfo', nicks[game[socket.id]], xo[socket.id]);
			io.to(game[socket.id]).emit('moveInfo', nicks[socket.id], xo[game[socket.id]]);
		}
	});
	//-----------------------------------

	//when player makes a move
	socket.on('move', function(move){
		if (moves[socket.id] == 1) {
			io.to(socket.id).emit('move', move, xo[socket.id]);
			io.to(game[socket.id]).emit('move', move, xo[game[socket.id]]);
			// places[move] = 0;
			console.log(nicks[socket.id] + " moves: " + move);
			console.log(nicks[game[socket.id]] + "'s move")

			io.to(socket.id).emit('moveInfo', nicks[game[socket.id]], 0);
			io.to(game[socket.id]).emit('moveInfo', nicks[socket.id], 1);

			moves[socket.id] = 0;
			moves[game[socket.id]] = 1;
  		}
	});

	socket.on('checkMove', function(move) {
		if (moves[socket.id] == 1) {
			io.to(socket.id).emit('checkMove', move, xo[socket.id]);
		}
	});
	//-------------------------
	
  	//when two players and their game normally
  	socket.on('endGame', function() { 
		moves.splice(game[socket.id], 1);
		moves.splice(socket.id, 1);

		xo.splice(game[socket.id], 1);
		xo.splice(socket.id, 1);
		  
		game.splice(game[socket.id], 1);
		game.splice(socket.id, 1);
	})
	//----------------------------------------
	


  	//when player wishes to cancel current game session
  	socket.on('cancel', function(){
		console.log(nicks[socket.id] + ' wishes to cancel');
		
		io.to(socket.id).emit('reset');
		io.to(game[socket.id]).emit('opponentLeft');

		game.splice(game[socket.id], 1);
		game.splice(socket.id, 1);
  	});
	//-------------------------------------------------
	  
	//when player wishes to cancel searching
	socket.on('cancelSearch', function() {
		for (var i = 0; i < searchingUsersCount && searchingUsers[i] != socket.id; i++);
		if (searchingUsersCount > 0 && searchingUsers[i] == socket.id) {
			searchingUsers.splice(i,1);
			searchingUsersCount--;
			console.log("User " + socket.id + "succesfully deleted from searchingUsers");
			io.to(socket.id).emit('cancelSearch');
		}
	});
	//--------------------------------------

  	//removing from data disconnected user
  	socket.on('disconnect', function() {
		for (var i = 0; i < userCount && allUsers[i] != socket.id; i++);
		if (userCount > 0 && allUsers[i] == socket.id) {
			nicks.splice(allUsers[i],1);
			allUsers.splice(i,1);
			userCount--;
			console.log("User " + socket.id + " succesfully deleted from allUsers");

			for (var i = 0; i < userCount; i++) nicksInOrder[i] = nicks[allUsers[i]];
			for (var i = 0; i < userCount; i++) {
				io.to(allUsers[i]).emit('renderActivePlayers', nicksInOrder, userCount);
			}
		} 
		else console.log("User disconnected, couldn't delete from allUsers");
	  
		for (var i = 0; i < searchingUsersCount && searchingUsers[i] != socket.id; i++);
		if (searchingUsersCount > 0 && searchingUsers[i] == socket.id) {
			searchingUsers.splice(i,1);
			searchingUsersCount--;
			console.log("User " + socket.id + "succesfully deleted from searchingUsers");
		}

		if (game[game[socket.id]] == socket.id) {
			io.to(game[socket.id]).emit('opponentLeft');

			console.log("Users have been deleted from playing");
		}

		if (chellenges[chellenges[socket.id]] == socket.id) {
			io.to(chellenges[socket.id]).emit('chellengerDisconnected');

			chellenges.splice(chellenges[socket.id], 1);
			chellenges.splice(socket.id, 1);
		}
	});

	//after typing nick it chooses the opponent
	socket.on('chooseOpponent', function(nick) {
		var found = 'notFound';
		var opponentIndex;

		if (nick == nicks[socket.id]) {
			found = 'choseHimself';
		}
		else {
			for (var i = 0; i < userCount && found == 'notFound'; i++) {
				if (nicks[allUsers[i]] == nick) {
					opponentIndex = i;
					if (game[game[allUsers[i]]] == allUsers[i]) {
						found = 'opponentInGame'
					}
					else {
						for (var j = 0; j < searchingUsersCount; j++) {
							if (searchingUsers[j] == socket.id) {
								found = 'opponentIsSearching'
							}
						}

						if (found == 'notFound') found = 'waitingForAnswer';
					}
				}
			}
	
		}

		if (found == 'opponentInGame') { //if chellenged player is already in game
			io.to(socket.id).emit('chellengedOpponentIsInGame', nick);
		}
		else if (found == 'waitingForAnswer' || found == 'opponentIsSearching') {
			chellenges[socket.id] = allUsers[opponentIndex];
			chellenges[allUsers[opponentIndex]] = socket.id;

			if (found == 'opponentIsSearching') {
				for (var j = 0; j < searchingUsersCount && searchingUsers[j] != allUsers[opponentIndex]; i++);
				searchingUsers.splice(j,1);
				searchingUsersCount--;
			}

			io.to(allUsers[opponentIndex]).emit('chellengeForYou', nicks[socket.id], found);
			io.to(socket.id).emit('waitingForAnswer', nicks[allUsers[opponentIndex]]);
		}
		else if (found == 'choseHimself') {
			io.to(socket.id).emit('chellengedYourself');
		}
		else if (found == 'notFound') {
			io.to(socket.id).emit('chellengedPlayerDoesNotExist', nick)
		}
	});
	
	socket.on('chellengeCancelled', function() {
		io.to(chellenges[socket.id]).emit('chellengeCancelled');

		chellenges.splice(chellenges[socket.id], 1);
		chellenges.splice(socket.id, 1);
	});

	socket.on('chellengeDenied', function() {
		io.to(chellenges[socket.id]).emit('chellengeDenied');

		chellenges.splice(chellenges[socket.id], 1);
		chellenges.splice(socket.id, 1);
	});

	socket.on('chellengeAccepted', function() {
		io.to(chellenges[socket.id]).emit('chellengeAccepted');

		//pair them
		game[socket.id] = chellenges[socket.id];
		game[chellenges[socket.id]] = socket.id;

		//delete from searching users
		chellenges.splice(chellenges[socket.id], 1);
		chellenges.splice(socket.id, 1);

		//randomizing who is x and who is o
		xo[socket.id] = Math.floor(Math.random() * 2);
		xo[game[socket.id]] = 1 - xo[socket.id];
		moves[socket.id] = xo[socket.id];
		moves[game[socket.id]] = xo[game[socket.id]];

		console.log("Found Game between: '" + nicks[socket.id] + "' and '" + nicks[game[socket.id]] + "'");
		console.log(nicks[socket.id] + " is " + moves[socket.id] + " and " + nicks[game[socket.id]] + " is " + moves[game[socket.id]]);

		io.to(socket.id).emit('newGame', nicks[game[socket.id]]);
		io.to(game[socket.id]).emit('newGame', nicks[socket.id]);

		io.to(socket.id).emit('moveInfo', nicks[game[socket.id]], xo[socket.id]);
		io.to(game[socket.id]).emit('moveInfo', nicks[socket.id], xo[game[socket.id]]);
	});
});
//=================================================================================

http.listen(port, function() {
  	console.log('listening on *:80');
});