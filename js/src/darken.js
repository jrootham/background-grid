/**
 * darken.js
 *
 * Created by jrootham on 16/06/15.
 *
 * Copyright © 2014 Jim Rootham
 */

var darkTick = parseInt($('input[name="dark"]:checked').val());
$('input[type=radio][name=dark]').change(
    function() {
        darkTick = parseInt(this.value);
    });

var lightTick = parseInt($('input[name="light"]:checked').val());
$('input[type=radio][name=light]').change(
    function() {
        lightTick = parseInt(this.value);
    });

function setColour(previous, current, size, inputs, newColour) {
    newColour.red = 255;
    newColour.green = 255;
    newColour.blue = 255;
    newColour.alpha = 1.0;


    let mousePosition = inputs.getMousePosition();
    if (previous.alpha != 0.0) {
        if (mousePosition && mousePosition.row === current.row && mousePosition.column === current.column) {
            newColour.red = Math.max(0, previous.red - darkTick);
            newColour.green = Math.max(0, previous.green - darkTick);
            newColour.blue = Math.max(0, previous.blue - darkTick);

            console.log(previous, newColour);
        } else {
            newColour.red = Math.min(255, previous.red + lightTick);
            newColour.green = Math.min(255, previous.green + lightTick);
            newColour.blue = Math.min(255, previous.blue + lightTick);
        }
    }
}

var specArray = [
    {
        condition: always,
        spec: {
            size: constantSize(5, 5),
            borderWidth: constantBorder(0),
            borderColour: RGBA(128, 128, 128),
            setColour: setColour
        }
    }
]

action(specArray, $('#drawing'), $('#foreground'), 50);
