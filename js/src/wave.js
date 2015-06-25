/**
 * wave.js
 *
 * Created by jrootham on 16/06/15.
 *
 * Copyright © 2014 Jim Rootham
 */

function setColour(previous, current, size, inputs) {
    let maxRange = parseInt($('input[name="max_size"]:checked').val());
    let scale = parseInt($('input[name="scale"]:checked').val());
    let rowFactor = parseFloat($('input[name="row_factor"]:checked').val());
    let columnFactor = parseFloat($('input[name="column_factor"]:checked').val());

    let range = current.distance(size.multiply(new Index(rowFactor, columnFactor)));
    let factor = (maxRange - range) / maxRange;

    return new RGBA(
        0,
        128,
        255 * factor *  ((1 + - Math.cos((range - inputs.getTime()) / scale)) / 2)
    );
}

var specArray = [
    {
        condition: always,
        spec: {
            size: constantSize(20, 40),
            borderWidth: constantBorder(0),
            borderColour: new RGBA(128, 128, 128),
            setColour: setColour
        }
    }
]

action(specArray, $('#drawing'), $('#foreground'));
