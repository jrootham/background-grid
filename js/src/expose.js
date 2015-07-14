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

function setColour(previous, current, size, inputs, newColour) {
    let position = inputs.getMousePosition();

    let transparent = 1.0;

    if (position) {
        let range = position.distance(current);

        if (range < radius) {
            transparent = 1.0 - (radius - range) / radius;
        }
    }

    newColour.alpha = transparent;
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
            setColour: setColour
        }
    },
    {
        condition: always,
        spec: {
            size: constantElementSize(10, 10),
            borderWidth: constantBorder(0),
            borderColour: RGBA(128, 128, 128),
            setColour: setColour
        }
    }
]

action(specArray, $('#drawing'), $('#foreground'), 30);
