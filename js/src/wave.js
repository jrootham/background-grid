/**
 * wave.js
 *
 * Created by jrootham on 16/06/15.
 *
 * Copyright © 2014 Jim Rootham
 */

var maxRange = parseInt($("input[name=max_size]:checked").val());

$('input[type=radio][name=max_size]').change(
    function() {
        maxRange = parseInt(this.value);
    });

var scale = parseInt($("input[name=scale]:checked").val());

$('input[type=radio][name=scale]').change(
    function() {
        scale = parseInt(this.value);
    });

var speed = parseInt($("input[name=speed]:checked").val());

$('input[type=radio][name=speed]').change(
    function() {
        speed = parseInt(this.value);
    });

var rowFactor = parseFloat($("input[name=row_factor]:checked").val());

$('input[type=radio][name=row_factor]').change(
    function() {
        rowFactor = parseFloat(this.value);
    });

var columnFactor = parseFloat($("input[name=column_factor]:checked").val());

$('input[type=radio][name=column_factor]').change(
    function() {
        columnFactor = parseFloat(this.value);
    });

function setColour(previous, current, size, inputs) {
    let range = current.distance(size.multiply(new Index(rowFactor, columnFactor)));
    let factor = (maxRange - range) / maxRange;

    return RGBA(
        0,
        128,
        255 * factor *  ((1 + - Math.cos((range - (inputs.getTime() / speed)) / scale)) / 2)
    );
}

var specArray = [
    {
        condition: always,
        spec: {
            size: constantElementSize(20, 20) ,
            borderWidth: constantBorder(0),
            borderColour: RGBA(128, 128, 128),
            setColour: setColour
        }
    }
]

action(specArray, $('#drawing'), $('#foreground'), 30);
