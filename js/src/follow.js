/**
 * follow.js
 *
 * Created by jrootham on 12/06/15.
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


function setColour(previous, current, size, inputs) {

    var red = 100;
    if (current.row <= size.row / 2 && current.column <= size.column / 2)
    {
        red = 0;
    }

    let position = inputs.getMousePosition();

    if (position) {
        let range = position.distance(current);

        if (range < radius) {
            red = 255 * (radius - range) / radius;
        }
    }

    return RGBA(
        red,
        Math.floor(255 * current.row / size.row),
        Math.floor(255 * current.column / size.column)
    );
}

var specArray = [
    {
        condition: big,
        spec: {
            size: constantSize(40, 80),
            borderWidth: constantBorder(5),
            borderColour: RGBA(128, 128, 128),
            setColour: setColour
        }
    },
    {
        condition: medium,
        spec: {
            size: constantSize(20, 40),
            borderWidth: constantBorder(3),
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

action(specArray, $('#drawing'), $('#foreground'), 30);
