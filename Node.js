var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var port = process.env.PORT || 80;

var url = require('url');
var fs = require('fs');

var availableUsers = [], userCount = 0, awaitingForGame = [], waitingUsers = 0;
var game = [], moves = [];

//loading needed files onto server=============================
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/public/tic-tac-toe.html');
});

app.get('/public/vue.js', function(req, res) {
  res.sendFile(__dirname + '/public/vue.js');
  });
  
app.get('/public/tic-tac-toeStyles.css', function(req, res) {
    res.sendFile(__dirname + '/public/tic-tac-toeStyles.css');
});

app.get('/public/img/white_o.jpg', function(req, res) {
  res.sendFile(__dirname + '/public/img/white_o.jpg');
});

app.get('/public/img/white_x.jpg', function(req, res) {
  res.sendFile(__dirname + '/public/img/white_x.jpg');
});
//=============================================================

//all the functions (proper server)============================
io.on('connection', function(socket){
  //when two players and their game normally
  socket.on('endGame', function() { 
    availableUsers[userCount] = socket.id;
    availableUsers[userCount + 1] = game[socket.id];
    userCount += 2;

    game.splice(socket.id, 1);
    game.splice(game[socket.id], 1);
  })
  //----------------------------------------

  //when player makes a move
  socket.on('move', function(msg){ 
    console.log('move: ' + msg);
    // io.emit('move', msg);

    if (moves[socket.id] == 1) {
      moves[socket.id] = 0;
      moves[game[socket.id]] = 1;
      io.to(socket.id).emit('move', msg);
      io.to(game[socket.id]).emit('move', msg);
    }
  });
  //-------------------------

  //when player wishes to start a game
  socket.on('firstGame', function(){ 
    console.log('first game' + socket.id);
    for (var i = 0; availableUsers[i] != socket.id; i++);
    availableUsers.splice(i,1);
    userCount--;
    awaitingForGame[waitingUsers] = socket.id;
    waitingUsers++;
    for (var i = 0; i < waitingUsers; i++) {
      console.log("\nAwaiting for play:\n" + awaitingForGame[i]);
    }
    if (waitingUsers > 1) {
      game[awaitingForGame[waitingUsers - 1]] = awaitingForGame[0];
      game[awaitingForGame[0]] = awaitingForGame[waitingUsers - 1];

      awaitingForGame.splice(0,1);
      awaitingForGame.splice(waitingUsers - 1, 1);
      waitingUsers -= 2;
      moves[socket.id] = 1;

      console.log("The game is beetwen: " + socket.id + " and " + game[socket.id]);

      io.to(game[socket.id]).emit('firstGame');
      io.to(socket.id).emit('firstGame');
    }
  });
  //-----------------------------------

  //when player wishes to cancel current game session
  socket.on('newGame', function(){
    console.log('new game');
    
    availableUsers[userCount] = socket.id;
    availableUsers[userCount + 1] = game[socket.id];
    userCount += 2;

    io.to(socket.id).emit('reset');
    io.to(game[socket.id]).emit('reset');
    
    game.splice(game[socket.id],1);
    game.splice(socket.id,1);
  });
  //-------------------------------------------------

  //adding newly connected person to data--------------------
  var my_id = socket.id;
  console.log("user_connected", "user with id " + my_id);
  availableUsers[userCount] = socket.id;
  userCount++;
  console.log("user has been added to the list " + availableUsers[userCount - 1]);
  //---------------------------------------------------------

  //removing from data disconnected user
  socket.on('disconnect', function() {
    for (var i = 0; availableUsers[i] != socket.id && i < userCount; i++);
    if (availableUsers[i] == socket.id) {
      availableUsers.splice(i,1);
      userCount--;
    }
    else {
      for (var i = 0; awaitingForGame[i] != socket.id && i < userCount; i++);
      awaitingForGame.splice(i,1);
      waitingUsers--;
    }
    console.log("user disconnected " + socket.id);
  });
  //-------------------------------------

  console.log("Printing users: ");
  for (var i = 0; i < userCount; i++) {
    console.log("User #" + i + ": " + availableUsers[i]);
  }
});

http.listen(port, function() {
  console.log('listening on *:80');
});