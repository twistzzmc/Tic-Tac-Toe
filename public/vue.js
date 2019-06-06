var counter = 0, startTime, endTime, flow = 0, menu = 1, cancel = 0;
var visited = [1,1,1,1,1,1,1,1,1];
var intervalID = window.setInterval(timerCheck, 1000);

var socket = io();

//listening to the server-------
socket.on('reset', function() { 
    reset(1);
});

socket.on('move', function(msg, xo) {
    move(msg, xo);
});

socket.on('newGame', function(opponent) {
    newGame(opponent);
});

socket.on('opponentLeft', function() {
    reset(0);
});

socket.on('searching', function() {
    searching();
});

socket.on('cancelSearch', function() {
    cancelSearch();
});

socket.on('checkMove', function(i) {
    checkMove(i);
});

socket.on('connectionResize', function() {
    document.getElementById("playingField").style.height = document.getElementById("playingField").clientWidth + "px";
});

socket.on('nick', function(nick, status) {
    badNick(nick, status);
});

socket.on('newPlayer', function(nick) {
    newPlayer(nick);
});

socket.on('moveInfo', function(nick, xo) {
    if (xo == 1) document.getElementById('whoIsMoving').innerHTML = 'You are moving';
    else document.getElementById('whoIsMoving').innerHTML = nick + ' is moving';
});

socket.on('renderActivePlayers', function(nicks, userCount) {
    console.log(nicks);
    document.getElementById('playersList').innerHTML = '';

    for (var i = 0; i < userCount; i++) {
        var playerBox = document.createElement("div");
        var playerStatus = document.createElement("div");
        var shiny = document.createElement("div");
        var player = document.createElement("div");
        var playerNick = document.createElement("p");

        playerStatus.appendChild(shiny);
        player.appendChild(playerNick);
        playerBox.appendChild(playerStatus);
        playerBox.appendChild(player);

        document.getElementById('playersList').appendChild(playerBox);

        playerStatus.classList = 'playerStatus';
        player.classList = 'player';
        playerBox.classList = 'playerBox';
        shiny.classList = 'shiny';
        playerNick.classList = 'playerNick';
        playerNick.innerHTML = nicks[i];
    }
});

socket.on('failedToChooseOpponent', function(found, nick) {
    document.getElementById('quickPlay').classList = 'hidden';
    document.getElementById('opponentNick').classList = 'hidden';
    document.getElementById('chooseOpponent').classList = 'hidden';

    
    if (found == 'notFound') {
        document.getElementById('failedOpponentSearch').classList = 'searchOpponent';
        document.getElementById('failedOpponentSearchText').innerHTML = nick + ' is not online';
    }
    else if (found == 'choseHimself') {
        document.getElementById('failedOpponentSearch').classList = 'searchOpponent';
        document.getElementById('failedOpponentSearchText').innerHTML = 'Its you!'
    }
    else if (found == 'waitingForAnswer') {
        document.getElementById('awaitingAnswer').classList = 'searchOpponent';
        document.getElementById('awaitingAnswerText').innerHTML = 'Awaiting answer from ' + nick;
    }
});

socket.on('chellengeForYou', function(nick) {
    console.log('You are chellenged ' + nick);
    
    document.getElementById('quickPlay').classList = 'hidden';
    document.getElementById('opponentNick').classList = 'hidden';
    document.getElementById('chooseOpponent').classList = 'hidden';

    document.getElementById('upcomingChellenge').classList = 'searchOpponent';
    document.getElementById('upcomingChellengeText').innerHTML = nick + ' has chellenged you!';
});

socket.on('chellengeDenied', function(nick) { 
    returnLeftMenu();

    document.getElementById('awaitingAnswer').classList = 'hidden';
});

socket.on('waitingForAnswer', function(nick) {
    document.getElementById('quickPlay').classList = 'hidden';
    document.getElementById('opponentNick').classList = 'hidden';
    document.getElementById('chooseOpponent').classList = 'hidden';

    document.getElementById('awaitingAnswer').classList = 'searchOpponent';
    document.getElementById('awaitingAnswerText').innerHTML = 'Waiting for anwer from ' + nick;
});

socket.on('chellengeCancelled', function() {
    returnLeftMenu();

    document.getElementById('upcomingChellenge').classList = 'hidden';
});
//-------------------------------

//emitting to the server if the user clicks on something that concerns other users--
Array.from(document.getElementsByClassName("emptySquare")).forEach(function(element) {
    element.addEventListener("click", function(event) {
        console.log(event.target.dataset.index)
        // move(event.target.dataset.index);

        socket.emit('checkMove', event.target.dataset.index);
    });
})

document.getElementById('cancelButton').addEventListener("click", function(event) {
    socket.emit('cancel');
});

document.getElementById('cancelSearch').addEventListener("click", function(event) {
    socket.emit('cancelSearch');
});

document.getElementById("quickPlayText").addEventListener("click", function(event) {
    socket.emit('quickPlay');
});

document.getElementById('enterNickButton').addEventListener("click", function(event) {
        socket.emit('enteredNick', document.getElementById('nick').value);
});

document.getElementById('nick').addEventListener("keypress", function(event) {
    if (event.key == 'Enter') {
        socket.emit('enteredNick', document.getElementById('nick').value);
    }
});

document.getElementById('opponentNickInput').addEventListener('keypress', function(event) {
    if (event.key == 'Enter') {
        socket.emit('chooseOpponent', document.getElementById('opponentNickInput').value);
    }
});

document.getElementById('chooseOpponentButton').addEventListener('click', function(event) {
    socket.emit('chooseOpponent', document.getElementById('opponentNickInput').value);
});

document.getElementById('openPlayersMenuButton').addEventListener('click', function() {
    if (document.getElementById('playersList').className == 'hidden')document.getElementById('playersList').className = 'playersList';
    else document.getElementById('playersList').className = 'hidden';
});

document.getElementById('failedOpponentSearchButton').addEventListener('click', function() {
    returnLeftMenu();

    document.getElementById('failedOpponentSearch').classList = 'hidden';
});

document.getElementById('upcomingChellengeButtonAccept').addEventListener('click', function() {
    returnLeftMenu();

    document.getElementById('upcomingChellenge').classList = 'hidden';

    socket.emit('chellengeAccepted');
});

document.getElementById('upcomingChellengeButtonDenied').addEventListener('click', function() {
    returnLeftMenu();

    document.getElementById('upcomingChellenge').classList = 'hidden';

    socket.emit('chellengeDenied');
});

document.getElementById('awaitingAnswerButton').addEventListener('click', function() {
    returnLeftMenu();
    document.getElementById('awaitingAnswer').classList = 'hidden';

    socket.emit('chellengeCancelled');
}); 
//-------------------------------------------------------------------------------------


//hide menu option, scaling the playing field with on resizing-----------------------
document.getElementById("hideMenu").addEventListener("click", function(event) {
    if (menu == 1) {
        document.getElementById("menu").classList = "menuHidden";
        document.getElementById("game").classList = "gameFullscreen";
        menu = 0;
    }
    else {
        document.getElementById("menu").classList = "menu";
        document.getElementById("game").classList = "game";
        menu = 1;
    }
    
    console.log(menu + "hiding")
});

window.addEventListener('resize', evt => {
        document.getElementById("playingField").style.height = document.getElementById("playingField").clientWidth + "px";
});
//--------------------------------------------------------------------------------------


//====================================functions===========================================================

function newPlayer(nick) {
    document.getElementById('nickMenu').classList = 'hidden';
    document.getElementById('header').classList = 'header';
    document.getElementById('newGameMenu').classList = 'newGameMenu';
    document.getElementById("seconds").innerText = "seconds";
}

function badNick(nick, status) {
    document.getElementsByName('nick')[0].value="";
    if (status == 0) {
        console.log("Nick '" + nick + "' is taken");
        document.getElementsByName('nick')[0].placeholder="Nick taken";
    }
    else if (status == 1) {
        console.log("Nick '" + nick + "' is too short");
        document.getElementsByName('nick')[0].placeholder="Too short";
    }
    else if (status == 2) {
        console.log("Nick '" + nick + "' has illegal characters");
        document.getElementsByName('nick')[0].placeholder="Illegal char";
    }
}

//when player puts x or o
function checkMove(i) {
    if (visited[i-1] == 0) socket.emit('move', i);
}

function move(i, xo) {
    if (visited[i-1] == 0) { //checking if the move is according to rules
        visited[i-1] = 1;

        var squareClass = ("empty" + i); //chenging the clicked window to x or o according to the order
        if (counter % 2 == 0) {
            document.getElementById(squareClass).classList.add("xSquare");
            counter++;
        }
        else if (counter % 2 == 1) {
            document.getElementById(squareClass).classList.add("oSquare");
            counter++;
        }
    
        var squareClasses = []; //making array of the play windows to know what class they are (x, o, empty)
        for (var i = 1; i <= 9; i++) {
            squareClass = ("empty" + i);
            if (document.getElementById(squareClass).classList.length == 2) squareClasses[i - 1] = [document.getElementById(squareClass).classList[1]];
            else squareClasses[i - 1] = [document.getElementById(squareClass).classList[0]];
        }
        
        //checing the win conditions---------------------------------------------------------
        var won = 0; 
        for (var i = 0; i < 9 && !won; i += 3){
            if ((squareClasses[i] == "xSquare" && squareClasses[i+1] == "xSquare" && squareClasses[i+2] == "xSquare") || (squareClasses[i] == "oSquare" && squareClasses[i+1] == "oSquare" && squareClasses[i+2] == "oSquare")) {
                if (squareClasses[i] == "xSquare") endGame(1, xo);
                else if (squareClasses[i] == "oSquare") endGame(2, xo);
                won = 1;
            }
        }
        for (var i = 0; i < 3 && !won; i++) {
            if ((squareClasses[i] == "xSquare" && squareClasses[i+3] == "xSquare" && squareClasses[i+6] == "xSquare") || (squareClasses[i] == "oSquare" && squareClasses[i+3] == "oSquare" && squareClasses[i+6] == "oSquare")) {
                if (squareClasses[i] == "xSquare") endGame(1, xo);
                else if (squareClasses[i] == "oSquare") endGame(2, xo);
                won = 1;
            }
        }
        if ((!won && squareClasses[0] == "xSquare" && squareClasses[4] == "xSquare" && squareClasses[8] == "xSquare") || (squareClasses[0] == "oSquare" && squareClasses[4] == "oSquare" && squareClasses[8] == "oSquare")) {
            if (squareClasses[0] == "xSquare") endGame(1, xo);
            else if (squareClasses[0] == "oSquare") endGame(2, xo);
            won = 1;
        }
        else if ((!won && squareClasses[2] == "xSquare" && squareClasses[4] == "xSquare" && squareClasses[6] == "xSquare") || (squareClasses[2] == "oSquare" && squareClasses[4] == "oSquare" && squareClasses[6] == "oSquare")) {
            if (squareClasses[2] == "xSquare") endGame(1, xo);
            else if (squareClasses[2] == "oSquare") endGame(2, xo);
            won = 1;
        }

        if(counter == 9 && !won) endGame(0, xo);
        //-------------------------------------------------------------------------------------
    }

}

//counting time of the game
function start() {
    startTime = new Date();
    flow = 1;
}

function end() {
    endTime = new Date();
    var timeDiff = endTime - startTime; //in ms
    timeDiff /= 1000; //strip the ms

    return timeDiff;
}
//--------------------------

//when a player decides he want to play (hits play button)
function newGame(opponent) {

    console.log("new game");
    for (var i = 1; i <= 9; i++){
        var squareClass = ("empty" + i);
        document.getElementById(squareClass).classList = "emptySquare";
        visited[i-1] = 0;
    }
    counter = 0;

    document.getElementById('newGameMenu').classList = 'hidden';
    document.getElementById('message').classList = 'hidden'
    document.getElementById('cancelSearch').classList = 'hidden';
    document.getElementById('cancelMenu').classList = 'cancel';
    document.getElementById('opponentNickInfo').innerHTML = 'Your opponent ' + opponent;
    

    start();
}
//--------------------------------------------------------------

//function for when the game ends one way or another------------
function draw() {
    document.getElementById('message').classList = 'message';
    document.getElementById("messageText").innerHTML = "draw";
}

function youWon() {
    for (var i = 0; i < 9; i++) {
        visited[i] = 1;
    }

    document.getElementById('message').classList = 'message';
    document.getElementById("messageText").innerHTML = "You won";
}

function youLost() {
    for (var i = 0; i < 9; i++) {
        visited[i] = 1;
    }

    document.getElementById('message').classList = 'message';
    document.getElementById("messageText").innerHTML = "You lost";
}

function timer() {
    var timeDiff = end();
    timeDiff = Math.round(timeDiff);

    document.getElementById("timerText").innerText = timeDiff;
}

function timerCheck() {
    console.log(flow);
    if (flow == 1) timer();
}

function endGame(won, xo) { //main function when game ends properly
    flow = 0;
    timer(); //stoping timer so it show the game time
    if (won == 0) draw(); //if the game ends in a draw
    else if (won == 1 && xo == 1 || (won == 2 && xo == 0)) youWon(); // if you win
    else if ((won == 1 && xo == 0) || (won == 2 && xo == 1)) youLost(); // if you lose
    else alert("error");

    document.getElementById('cancel').classList = 'hidden';
    document.getElementById('newGameMenu').classList = 'newGameMenu';

    socket.emit('endGame');
}

function reset(i) { // when someone decides to cancel the game
    console.log("reset");
    flow = 0;
    timer();

    document.getElementById('message').classList = 'message';
    document.getElementById('newGameMenu').classList = 'newGameMenu';

    document.getElementById('cancelMenu').classList = 'hidden';

    if (i == 1) document.getElementById("messageText").innerHTML = "You left";
    else if (i == 0) document.getElementById("messageText").innerHTML = "Opponent left";

    for (var i = 0; i < 9; i++) {
        visited[i] = 1;
    }

    socket.emit('endGame');
}

function cancelSearch() {
    console.log("canceling search");

    document.getElementById('newGameMenu').classList = 'newGameMenu';
    document.getElementById('message').classList = 'hidden';
    document.getElementById('cancelSearch').classList = 'hidden';
}

function searching() {
    document.getElementById('newGameMenu').classList = 'hidden';
    document.getElementById('cancelSearch').classList = 'cancel';
    document.getElementById('message').classList = 'message';
    document.getElementById('messageText').innerHTML = "Searching";
}

function returnLeftMenu() {
    document.getElementById('quickPlay').classList = 'quickPlay';
    document.getElementById('opponentNick').classList = 'opponentNick';
    document.getElementById('chooseOpponent').classList = 'chooseOpponent';
}
//-----------------------------------------------------------------------