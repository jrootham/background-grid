/**
 * wave.js
 *
 * Created by jrootham on 16/06/15.
 *
 * Copyright © 2014 Jim Rootham
 */
function always(parentWidth, parentHeight) {
    return true;
}

function big(parentWidth, parentHeight) {
    return parentWidth > 1000 && parentHeight > 1000;
}

function medium(parentWidth, parentHeight) {
    return parentWidth > 500 && parentHeight > 500;
}

function setColour(previous, rowIndex, rowCount, columnIndex, columnCount, state, mouseLocation) {
    const MAX_RANGE = 200;
    const SCALE = 10;
    let range = distance({column:0, row:0}, rowIndex, columnIndex);
    let factor = (MAX_RANGE - range) / MAX_RANGE;

    return new RGB(
        0,
        128,
        255 * factor *  ((1 + - Math.cos((range - state.time) / SCALE)) / 2)
    );
}

var specArray = [
    {
        condition: always,
        spec: {
            rowCount: 40,
            columnCount: 80,
            borderWidth: 0,
            borderColour: new RGB(128, 128, 128),
            setColour: setColour
        }
    }
]

action(specArray, $('#drawing'), $('#foreground'));
