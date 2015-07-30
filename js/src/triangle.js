/**
 * triangle.js
 *
 * Created by jrootham on 17/07/15.
 *
 * Copyright © 2014 Jim Rootham
 */
var radius = parseInt($('input[name="size"]:checked').val());
$('input[type=radio][name=size]').change(
    function() {
        radius = parseInt(this.value);
    });


function setColour(previous, current, size, inputs, newColour) {
    newColour.red = current.row * 5;
    newColour.green = current.column * 5;
    newColour.blue = 255;
    newColour.alpha = 1.0;

    let position = inputs.getMousePosition();

    if (position) {
        let range = position.distance(current);

        if (range < radius) {
            newColour.red = 255;
            newColour.green = 0;
            newColour.blue = 0;
        }
    }
}

var specArray = [
    {
        condition: always,
        spec: {
            size: constantSize(20, 20),
            borderWidth: constantBorder(3),
            borderColour: RGBA(200, 200, 200),
            setColour: setColour
        }
    }
]

let parameters = {vanish:true, interchange:false};

action(specArray, $('#drawing'), $('#foreground'), 50, parameters, Triangle);

