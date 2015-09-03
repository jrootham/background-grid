/**
 * grayFollow.js
 *
 * Created by jrootham on 03/09/15.
 *
 * Copyright © 2014 Jim Rootham
 */
function big(parentWidth, parentHeight) {
    return parentWidth > 1000 && parentHeight > 1000;
}

function medium(parentWidth, parentHeight) {
    return parentWidth > 500 && parentHeight > 500;
}

var radius = parseInt($('input[name="size"]:checked').val());
$('input[type=radio][name=size]').change(
    function() {
        radius = parseInt(this.value);
    });


const BG_FIRST = 10;
const BG_LAST = 150;
const BG_DIFF = BG_LAST - BG_FIRST;
const CURSOR_FIRST = 100;
const CURSOR_LAST = 255;
const CURSOR_DIFF = CURSOR_LAST - CURSOR_FIRST;

function makeBGColour(size, row, column) {
    return makeColour(size, row, column, BG_FIRST, BG_DIFF);
}

function makeCursorColour(size, row, column) {
    return makeColour(size, row, column, CURSOR_FIRST, CURSOR_DIFF);
}

function makeColour(size, row, column, first, diff) {
    return Math.round(first + diff * ((row / size.row + column / size.column) / 2));
}

function setColour(previous, current, size, inputs, newColour) {
    let elementColour = makeBGColour(size, current.row, current.column);

    let position = inputs.getMousePosition();

    if (position) {
        let range = position.distance(current);

        if (range < radius) {
            let cursorColour = makeCursorColour(size, position.row, position.column);
            if (range === 0.0) {
                elementColour = cursorColour;
            }
            else {
                let ratio = range / radius;
                let dx = current.row - position.row;
                let dy = current.column - position.column;

                let bgColour = makeBGColour(size, position.row + dy / ratio, position.column + dx / ratio);
                elementColour = cursorColour - (cursorColour - bgColour) * ratio;
                elementColour = Math.floor(elementColour);
            }
        }
    }
    
    newColour.red = elementColour;
    newColour.green = elementColour;
    newColour.blue = elementColour;
    newColour.alpha = 1.0;
}

var specArray = [
    {
        condition: big,
        spec: {
            size: constantSize(40, 80),
            borderWidth: constantBorder(1),
            borderColour: RGBA(128, 128, 128),
            setColour: setColour
        }
    },
    {
        condition: medium,
        spec: {
            size: constantSize(20, 40),
            borderWidth: constantBorder(1),
            borderColour: RGBA(128, 128, 128),
            setColour: setColour
        }
    },
    {
        condition: always,
        spec: {
            size: constantSize(10, 20),
            borderWidth: constantBorder(1),
            borderColour: RGBA(128, 128, 128),
            setColour: setColour
        }
    }
]

let parameters = {vanish:true, interchange:false};

action(specArray, $('#drawing'), $('#foreground'), 30, parameters);
