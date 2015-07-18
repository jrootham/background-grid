/**
 * triangle.js
 *
 * Created by jrootham on 17/07/15.
 *
 * Copyright © 2014 Jim Rootham
 */
function setColour(previous, current, size, inputs, newColour) {
    newColour.red = current.row * 15;
    newColour.green = current.column * 15;
    newColour.blue = 255;
    newColour.alpha = 1.0;

    let position = inputs.getMousePosition();

    if (position) {
        if (position.equals(current)) {
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
            size: constantSize(10, 5),
            borderWidth: constantBorder(3),
            borderColour: RGBA(200, 200, 200),
            setColour: setColour
        }
    }
]

action(specArray, $('#drawing'), $('#foreground'), 50, Triangle);

