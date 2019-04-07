var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var port = process.env.PORT || 3000;

var url = require('url');
var fs = require('fs');

var availableUsers = [], userCount = 0, awaitingForGame = [], waitingUsers = 0;
var game = [], moves = [];
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

io.on('connection', function(socket){
  socket.on('endGame', function() {
    availableUsers[userCount] = socket.id;
    availableUsers[userCount + 1] = game[socket.id];
    userCount += 2;

    game.splice(socket.id, 1);
    game.splice(game[socket.id], 1);
  })

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

  socket.on('firstGame', function(){
    console.log('first game' + socket.id);
    for (var i = 0; availableUsers[i] != socket.id; i++);
    availableUsers.splice(i,1);
    userCount--;
    awaitingForGame[waitingUsers] = socket.id;
    waitingUsers++;
    if (waitingUsers > 1) {
      game[awaitingForGame[waitingUsers - 1]] = awaitingForGame[0];
      game[awaitingForGame[0]] = awaitingForGame[waitingUsers - 1];

      awaitingForGame.splice(0,1);
      awaitingForGame.splice(waitingUsers - 1, 1);
      waitingUsers -= 2;
      moves[socket.id] = 1;

      io.to(game[socket.id]).emit('firstGame');
      io.to(socket.id).emit('firstGame');
    }
  });

  socket.on('newGame', function(){
    // console.log('new game');
    io.emit('newGame');
  });

  var my_id = socket.id;
  console.log("user_connected", "user with id " + my_id);
  availableUsers[userCount] = socket.id;
  userCount++;
  console.log("user has been added to the list " + availableUsers[userCount - 1]);

  socket.on('disconnect', function() {
    for (var i = 0; availableUsers[i] != socket.id; i++);
    availableUsers.splice(i,1);
    userCount--;
  })

  console.log("Printing users: ");
  for (var i = 0; i < userCount; i++) {
    console.log("User #" + i + ": " + availableUsers[i]);
  }
});

http.listen(3000, function() {
  console.log('listening on *:3000');
});