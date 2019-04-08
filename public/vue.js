var counter = 0, startTime, endTime, flow = 0, menu = 1, cancel = 0;
var visited = [1,1,1,1,1,1,1,1,1];
var intervalID = window.setInterval(timerCheck, 1000);

var socket = io();

//listening to the server-------
socket.on('reset', function() { 
    reset();
});

socket.on('move', function(msg){
    move(msg);
});

socket.on('firstGame', function(){
    firstGame();
});

socket.on('newGame', function(){
    newGame();
});
//-------------------------------

//emitting to the server if the user clicks on something that concerns other users--
Array.from(document.getElementsByClassName("emptySquare")).forEach(function(element) {
    element.addEventListener("click", function(event) {
        console.log(event.target.dataset.index)
        // move(event.target.dataset.index);

        socket.emit('move', event.target.dataset.index);
    });
})

document.getElementById("firstGameText").addEventListener("click", function(event) {
    socket.emit('firstGame');
});

document.getElementById("newGameText").addEventListener("click", function(event) {
    socket.emit('newGame');
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

//when player puts x or o
function move(i) {
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
                if (squareClasses[i] == "xSquare") endGame(1);
                else if (squareClasses[i] == "oSquare") endGame(2);
                won = 1;
            }
        }
        for (var i = 0; i < 3 && !won; i++) {
            if ((squareClasses[i] == "xSquare" && squareClasses[i+3] == "xSquare" && squareClasses[i+6] == "xSquare") || (squareClasses[i] == "oSquare" && squareClasses[i+3] == "oSquare" && squareClasses[i+6] == "oSquare")) {
                if (squareClasses[i] == "xSquare") endGame(1);
                else if (squareClasses[i] == "oSquare") endGame(2);
                won = 1;
            }
        }
        if ((!won && squareClasses[0] == "xSquare" && squareClasses[4] == "xSquare" && squareClasses[8] == "xSquare") || (squareClasses[0] == "oSquare" && squareClasses[4] == "oSquare" && squareClasses[8] == "oSquare")) {
            if (squareClasses[0] == "xSquare") endGame(1);
            else if (squareClasses[0] == "oSquare") endGame(2);
            won = 1;
        }
        else if ((!won && squareClasses[2] == "xSquare" && squareClasses[4] == "xSquare" && squareClasses[6] == "xSquare") || (squareClasses[2] == "oSquare" && squareClasses[4] == "oSquare" && squareClasses[6] == "oSquare")) {
            if (squareClasses[2] == "xSquare") endGame(1);
            else if (squareClasses[2] == "oSquare") endGame(2);
            won = 1;
        }

        if(counter == 9 && !won) endGame(0);
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
function firstGame() {
    document.getElementById("newGame").classList = "newGame";
    document.getElementById("firstGame").classList = "hidden";
    document.getElementById("seconds").innerText = "seconds";
    document.getElementById("newGameText").innerText = "Cancel";

    newGame();
}

function newGame() {
    for (var i = 1; i <= 9; i++){
        var squareClass = ("empty" + i);
        document.getElementById(squareClass).classList = "emptySquare";
        visited[i-1] = 0;
    }
    counter = 0;

    document.getElementById("draw").classList = "hidden";
    document.getElementById("xWon").classList = "hidden";
    document.getElementById("oWon").classList = "hidden";

    start();
}
//--------------------------------------------------------------

//function for when the game ends one way or another------------
function draw() {
    document.getElementById("draw").classList = "message";
}

function xWon() {
    for (var i = 0; i < 9; i++) {
        visited[i] = 1;
    }

    document.getElementById("xWon").classList = "message";
}

function oWon() {
    for (var i = 0; i < 9; i++) {
        visited[i] = 1;
    }
    
    document.getElementById("oWon").classList = "message";
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

function endGame(won) { //main function when game ends properly
    flow = 0;
    timer(); //stoping timer so it show the game time
    if (won == 0) draw(); //if the game ends in a draw
    else if (won == 1) xWon(); // if x wins
    else if (won == 2) oWon(); // if o wins

    socket.emit('endGame');
}

function reset() { // when someone decides to cancel the game
    flow = 0;
    timer();

    console.log("reset");
    document.getElementById("newGame").classList = "hidden";
    document.getElementById("firstGame").classList = "firstGame";
}
//-----------------------------------------------------------------------