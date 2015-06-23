/**
 * darken.js
 *
 * Created by jrootham on 16/06/15.
 *
 * Copyright © 2014 Jim Rootham
 */
function always(parentWidth, parentHeight) {
    return true;
}

function setColour(previous, rowIndex, rowCount, columnIndex, columnCount, state, mouseLocation) {
    let newColour = new RGBA(255, 255, 255);

    if (previous) {
        if (mouseLocation && mouseLocation.row === rowIndex && mouseLocation.column === columnIndex) {
            newColour = new RGBA(
                Math.max(0, previous.red - 1),
                Math.max(0, previous.green - 1),
                Math.max(0, previous.blue - 1));
        } else {
            newColour = new RGBA(
                Math.min(255, previous.red + 1),
                Math.min(255, previous.green + 1),
                Math.min(255, previous.blue + 1));
        }
    }

    return newColour;
}

var specArray = [
    {
        condition: always,
        spec: {
            rowCount: 5,
            columnCount: 5,
            borderWidth: 0,
            borderColour: new RGBA(128, 128, 128),
            setColour: setColour
        }
    }
]

action(specArray, $('#drawing'), $('#foreground'));
