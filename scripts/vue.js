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
        // alert(squareClasses[0] + squareClasses[1] + squareClasses[2] + squareClasses[3]+ squareClasses[4] + squareClasses[5] + squareClasses[6] + squareClasses[7] + "8" + squareClasses[8])
        
        for (var i = 0; i < 9; i += 3){
            if ((squareClasses[i] == "xSquare" && squareClasses[i+1] == "xSquare" && squareClasses[i+2] == "xSquare") || (squareClasses[i] == "oSquare" && squareClasses[i+1] == "oSquare" && squareClasses[i+2] == "oSquare")) {
                if (squareClasses[i] == "xSquare") setTimeout(function(){ alert("Krzyżyk wygrał!\nOdśwież by zagrać ponownie."); }, 20);
                else if (squareClasses[i] == "oSquare") setTimeout(function(){ alert("Kółko wygrało!\nOdśwież by zagrać ponownie."); }, 20);
            }
        }
        for (var i = 0; i < 3; i++) {
            if ((squareClasses[i] == "xSquare" && squareClasses[i+3] == "xSquare" && squareClasses[i+6] == "xSquare") || (squareClasses[i] == "oSquare" && squareClasses[i+3] == "oSquare" && squareClasses[i+6] == "oSquare")) {
                if (squareClasses[i] == "xSquare") setTimeout(function(){ alert("Krzyżyk wygrał!\nOdśwież by zagrać ponownie."); }, 20);
                else if (squareClasses[i] == "oSquare") setTimeout(function(){ alert("Kółko wygrało!\nOdśwież by zagrać ponownie."); }, 20);
            }
        }
        if ((squareClasses[0] == "xSquare" && squareClasses[4] == "xSquare" && squareClasses[8] == "xSquare") || (squareClasses[0] == "oSquare" && squareClasses[4] == "oSquare" && squareClasses[8] == "oSquare")) {
            if (squareClasses[0] == "xSquare") setTimeout(function(){ alert("Krzyżyk wygrał!\nOdśwież by zagrać ponownie."); }, 20);
            else if (squareClasses[0] == "oSquare") setTimeout(function(){ alert("Kółko wygrało!\nOdśwież by zagrać ponownie."); }, 20);
        }
        else if ((squareClasses[2] == "xSquare" && squareClasses[4] == "xSquare" && squareClasses[6] == "xSquare") || (squareClasses[2] == "oSquare" && squareClasses[4] == "oSquare" && squareClasses[6] == "oSquare")) {
            if (squareClasses[2] == "xSquare") setTimeout(function(){ alert("Krzyżyk wygrał!\nOdśwież by zagrać ponownie."); }, 20);
            else if (squareClasses[2] == "oSquare") setTimeout(function(){ alert("Kółko wygrało!\nOdśwież by zagrać ponownie."); }, 20);
        }

        //dwa przekreslenia na raz
    }
}