var selectedColors = [];

function changeColor(color) {
    var canvas = document.getElementById("canvas");
    var context = canvas.getContext("2d");

    // Check if the color is already selected
    var index = selectedColors.indexOf(color);
    if (index !== -1) {

        // If clicked again, increase the color's presence and adjust others proportionally
        //selectedColors.splice(index, 1);
        selectedColors.unshift(color);
        selectedColors.sort();
    } else {
        // Add the color to the beginning of the arrayhttps://jsfiddle.net/clarype/tLm5gphj/#run
        selectedColors.unshift(color);
        selectedColors.sort();
    }

    // Clear the canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw rectangles with selected colors proportionally
    var rectWidth = canvas.width / selectedColors.length;
    var totalClicks = selectedColors.length;

    selectedColors.forEach(function (c, index) {
        //var rectHeight = (canvas.height / totalClicks) * (index + 1);
        var rectHeight = (canvas.height) * (index + 1);
        context.fillStyle = c;
        context.fillRect(index * rectWidth, 0, rectWidth, rectHeight);
    });
    console.log(calculateProportions(selectedColors))
    console.log(selectedColors)
    $("#num").empty()
    $("#num").append(JSON.stringify(calculateProportions(selectedColors)))
}
function resetColors() {
    selectedColors = [];
    var canvas = document.getElementById("canvas");
    var context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    $("#num").empty()
}




function calculateProportions(array) {
                        var frequency = {};

                        array.forEach(function(value) {
                                frequency[value] = ((frequency[value] || 0) + 1 / array.length);
                        });
                        // Multiply each value by 100
                        for (let key in frequency) {
                            if (frequency.hasOwnProperty(key)) {
                                frequency[key] *= 100;
                                frequency[key] = String(Math.round(frequency[key])) + "%"
                            }
                        }

    return frequency
}

function updateCanvas() {
    var canvas = document.getElementById("canvas");
    var context = canvas.getContext("2d");

    // Clear the canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw rectangles with selected colors proportionally
    var totalClicks = selectedColors.length;
    var rectWidth = canvas.width / totalClicks;

    selectedColors.forEach(function (color, index) {
        //var rectHeight = (canvas.height / totalClicks) * (index + 1);
        var rectHeight = (canvas.height) * (index + 1);
        console.log(color)
        context.fillStyle = color;
        context.fillRect(index * rectWidth, 0, rectWidth, rectHeight);
    });
    $("#num").empty()
    $("#num").append(JSON.stringify(calculateProportions(selectedColors)))
}

function popColor(colorToRemove) {
    var index = selectedColors.indexOf(colorToRemove);

    if (index !== -1) {
        selectedColors.splice(index, 1);
        console.log(colorToRemove + " removed. Updated array: " + selectedColors);
        updateCanvas();
    } else {
        console.log(colorToRemove + " not found in the array.");
    }
}
