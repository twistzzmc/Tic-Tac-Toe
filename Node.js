var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var port = process.env.PORT || 80;

var url = require('url');
var fs = require('fs');

var searchingUsers = [], userCount = 0, awaitingForGame = [], searchingUsersCount = 0, taken = 0;
var game = [], moves = [], allUsers = [], nicks = [], xo = [], places = [1,1,1,1,1,1,1,1,1];

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

	//when user enters nick------------------------------
	socket.on('enteredNick', function(nick) {
		for (var i = 0; i < userCount; i++) {
			if (nicks[socket.id] == nick) taken = 1;
		}
		if (taken == 1) {
			taken = 0;
			io.to(socket.id).emit('nickTaken', nick);
			console.log("nick '" + nick + "' taken")
		}
		else {
			allUsers[userCount] = socket.id;
			nicks[socket.id] = nick;
			console.log("New player == ID: " + allUsers[userCount] + " Nick: " + nicks[allUsers[userCount]]);
			userCount++;
			
			io.to(socket.id).emit('newPlayer', nick);
		}
	});
	//---------------------------------------------------
	
	//when player wishes to start a quick game
	socket.on('quickPlay', function(){ 
		for (var i = 0; i < userCount && allUsers[i] != socket.id; i++);
		searchingUsers[searchingUsersCount] = socket.id;
		searchingUsersCount++;

		io.to(socket.id).emit('searching');
		
		console.log("Searching Quick Play for " + socket.id + " " + nicks[socket.id]);

		if (searchingUsersCount > 1) {
			game[searchingUsers[searchingUsersCount - 1]] = searchingUsers[0];
			game[searchingUsers[0]] = searchingUsers[searchingUsersCount - 1];

			searchingUsers.splice(searchingUsersCount - 1, 1);
			searchingUsers.splice(0,1);
			searchingUsersCount -= 2;

			xo[socket.id] = 1;
			xo[game[socket.id]] = 0;
			moves[socket.id] = 1;

			console.log("Found Game between: " + nicks[socket.id] + " and " + nicks[game[socket.id]]);

			io.to(socket.id).emit('newGame');
			io.to(game[socket.id]).emit('newGame');
		}
	});
	//-----------------------------------

	//when player makes a move
	socket.on('move', function(move){
		if (moves[socket.id] == 1 && places[move] == 1) {
			places[move] = 0;
			console.log(nicks[socket.id] + " moves: " + move);
			console.log(nicks[game[socket.id]] + "'s move")
			moves[socket.id] = 0;
			moves[game[socket.id]] = 1;
			io.to(socket.id).emit('move', move, xo[socket.id]);
			io.to(game[socket.id]).emit('move', move, xo[game[socket.id]]);
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
	});
});
//=================================================================================

http.listen(port, function() {
  	console.log('listening on *:80');
});