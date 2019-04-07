var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

// var http = require('http');
var url = require('url');
var fs = require('fs');
// var path = __dirname.substring(0, __dirname.length - 6);

// io.of('/api/chat/connect');

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

io.on('connection', function(socket) {
  console.log('a user connected');
});

io.on('connection', function(socket){
  socket.on('move', function(msg){
    console.log('move: ' + msg);
    io.emit('move', msg);
  });

  socket.on('firstGame', function(){
    console.log('first game');
    io.emit('firstGame');
  });

  socket.on('newGame', function(){
    console.log('new game');
    io.emit('newGame');
  });
});

http.listen(3000, function() {
  console.log('listening on *:3000');
});

// http://localhost:3000/socket.io/?EIO=3&transport=polling&t=1554339108057-204

// http.createServer(function (req, res) {
//   var q = url.parse(req.url, true);
//   var filename = ".." + q.pathname;
//   console.log(filename);
//   fs.readFile(filename, function(err, data) {
//     if (err) {
//       res.writeHead(404, {'Content-Type': 'text/html'});
//       return res.end("404 Not Found");
//     }  
//     if (filename.indexOf(".css") > -1) {
//       res.writeHead(200, {'Content-Type': 'text/css'});
//     } 
//     else res.writeHead(200, {'Content-Type': 'text/html'});
//     res.write(data);
//     return res.end();
//   });
// }).listen(8080);