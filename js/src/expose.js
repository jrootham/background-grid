/**
 * expose.js
 *
 * Created by jrootham on 23/06/15.
 *
 * Copyright © 2014 Jim Rootham
 */
function big(parentWidth, parentHeight) {
    return parentWidth > 1000 && parentHeight > 1000;
}

function medium(parentWidth, parentHeight) {
    return parentWidth > 500 && parentHeight > 500;
}


var radius = parseInt($("input[name=size]:checked").val());

$('input[type=radio][name=size]').change(
    function() {
        radius = parseInt(this.value);
    });

function setColour(ctx, inputs) {
    let position = inputs.getMousePosition();
    if (position != undefined && !isNaN(position.row) && !isNaN(position.column)) {
        let radial = ctx.createRadialGradient(position.row, position.column, 0, position.row, position.column, radius);
        radial.addColorStop(0,rgba(RGBA(255, 255, 255, 0.0)));
        radial.addColorStop(.99,rgba(RGBA(255, 255, 255, 0.0)));
        radial.addColorStop(1,rgba(RGBA(255, 255, 255, 1.0)));

        return radial;
    }
    else {
        return undefined
    }
}

var specArray = [
    {
        condition: big,
        spec: {
            size: constantElementSize(10, 10),
            borderWidth: constantBorder(0),
            borderColour: RGBA(128, 128, 128),
            setColour: setColour
        }
    },
    {
        condition: medium,
        spec: {
            size: constantElementSize(10, 10),
            borderWidth: constantBorder(0),
            borderColour: RGBA(128, 128, 128),
            setColour: setColour,
            clip:5
        }
    },
    {
        condition: always,
        spec: {
            size: constantElementSize(10, 10),
            borderWidth: constantBorder(0),
            borderColour: RGBA(128, 128, 128),
            setColour: setColour,
            clip:5
        }
    }
]

action(specArray, $('#drawing'), $('#foreground'), 30, Gradient);
