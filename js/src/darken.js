/**
 * darken.js
 *
 * Created by jrootham on 16/06/15.
 *
 * Copyright © 2014 Jim Rootham
 */

function setColour(previous, current, size, inputs) {
    let newColour = new RGBA(255, 255, 255);

    let darkTick = parseInt($('input[name="dark"]:checked').val());
    let lightTick = parseInt($('input[name="light"]:checked').val());

    let mousePosition = inputs.getMousePosition();
    if (previous) {
        if (mousePosition && mousePosition.row === current.row && mousePosition.column === current.column) {
            newColour = new RGBA(
                Math.max(0, previous.red - darkTick),
                Math.max(0, previous.green - darkTick),
                Math.max(0, previous.blue - darkTick));
        } else {
            newColour = new RGBA(
                Math.min(255, previous.red + lightTick),
                Math.min(255, previous.green + lightTick),
                Math.min(255, previous.blue + lightTick));
        }
    }

    return newColour;
}

var specArray = [
    {
        condition: always,
        spec: {
            size: constantSize(5, 5),
            borderWidth: constantBorder(0),
            borderColour: new RGBA(128, 128, 128),
            setColour: setColour
        }
    }
]

action(specArray, $('#drawing'), $('#foreground'));
