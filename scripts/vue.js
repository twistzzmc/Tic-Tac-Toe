var counter = 0;

function changeButtonToX() {
    if (counter % 2 == 0) {
        document.getElementById("emptyButton").className = "xButton";
        var buttonClass = document.getElementById("emptyButton1").className;
    }
    else if (counter % 2 == 1) {
        document.getElementById("emptyButton").className = "oButton";
        var buttonClass = document.getElementById("emptyButton").className;
    }
}