var counter = 0;
var visited = [0,0,0,0,0,0,0,0,0];

function move(i) {
    if (visited[i-1] == 0) {
        visited[i-1] = 1;

        var squareClass = ("empty" + i);
        if (counter % 2 == 0) {
            document.getElementById(squareClass).className = "xSquare";
            var buttonClass = document.getElementById(squareClass).className;
            counter++;
        }
        else if (counter % 2 == 1) {
            document.getElementById(squareClass).className = "oSquare";
            var buttonClass = document.getElementById(squareClass).className;
            counter++;
        }
    
        var squareClasses = [];
        for (var i = 1; i <= 9; i++) {
            squareClass = ("empty" + i);
            squareClasses[i - 1] = [document.getElementById(squareClass).className];
        }
        
        var won = 0;
        for (var i = 0; i < 9 && !won; i += 3){
            if ((squareClasses[i] == "xSquare" && squareClasses[i+1] == "xSquare" && squareClasses[i+2] == "xSquare") || (squareClasses[i] == "oSquare" && squareClasses[i+1] == "oSquare" && squareClasses[i+2] == "oSquare")) {
                if (squareClasses[i] == "xSquare") xWon();
                else if (squareClasses[i] == "oSquare") oWon();
                won = 1;
            }
        }
        for (var i = 0; i < 3 && !won; i++) {
            if ((squareClasses[i] == "xSquare" && squareClasses[i+3] == "xSquare" && squareClasses[i+6] == "xSquare") || (squareClasses[i] == "oSquare" && squareClasses[i+3] == "oSquare" && squareClasses[i+6] == "oSquare")) {
                if (squareClasses[i] == "xSquare") xWon();
                else if (squareClasses[i] == "oSquare") oWon();
                won = 1;
            }
        }
        if ((!won && squareClasses[0] == "xSquare" && squareClasses[4] == "xSquare" && squareClasses[8] == "xSquare") || (squareClasses[0] == "oSquare" && squareClasses[4] == "oSquare" && squareClasses[8] == "oSquare")) {
            if (squareClasses[0] == "xSquare") xWon();
            else if (squareClasses[0] == "oSquare") oWon();
            won = 1;
        }
        else if ((!won && squareClasses[2] == "xSquare" && squareClasses[4] == "xSquare" && squareClasses[6] == "xSquare") || (squareClasses[2] == "oSquare" && squareClasses[4] == "oSquare" && squareClasses[6] == "oSquare")) {
            if (squareClasses[2] == "xSquare") xWon();
            else if (squareClasses[2] == "oSquare") oWon();
            won = 1;
        }

        if(counter == 9 && !won) draw();
    }

}

function newGame() {
    for (var i = 1; i <= 9; i++){
        var squareClass = ("empty" + i);
        document.getElementById(squareClass).className = "emptySquare";
        var buttonClass = document.getElementById(squareClass).className;
        visited[i-1] = 0;
    }
    counter = 0;

    document.getElementById("draw").className = "hidden";
    var buttonClass = document.getElementById(squareClass).className;

    document.getElementById("xWon").className = "hidden";
    var buttonClass = document.getElementById(squareClass).className;

    document.getElementById("oWon").className = "hidden";
    var buttonClass = document.getElementById(squareClass).className;
}

function draw() {
    document.getElementById("draw").className = "message";
    var buttonClass = document.getElementById(squareClass).className;
}

function xWon() {
    for (var i = 0; i < 9; i++) {
        visited[i] = 1;
    }

    document.getElementById("xWon").className = "message";
    var buttonClass = document.getElementById(squareClass).className;
}

function oWon() {
    for (var i = 0; i < 9; i++) {
        visited[i] = 1;
    }
    
    document.getElementById("oWon").className = "message";
    var buttonClass = document.getElementById(squareClass).className;
}