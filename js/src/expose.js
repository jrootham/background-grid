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

var start = parseFloat($("input[name=start]:checked").val());

$('input[type=radio][name=start]').change(
    function() {
        start = parseFloat(this.value);
    });

var inner = parseFloat($("input[name=inner]:checked").val());

$('input[type=radio][name=inner]').change(
    function() {
        inner = parseFloat(this.value);
    });

var outer = parseFloat($("input[name=outer]:checked").val());

$('input[type=radio][name=outer]').change(
    function() {
        outer = parseFloat(this.value);
    });

var interchange = $("input[name=interchange]:checked").val();

$('input[type=checkbox][name=interchange]:checked').change(
    function() {
        interchange = this.value;
    });

var vanish = $("input[name=vanish]:checked").val();

$('input[type=checkbox][name=vanish]:checked').change(
    function() {
        vanish = this.value;
    });

function setColour(ctx, inputs) {
    let position = inputs.getMousePosition();''
    if (position != undefined && !isNaN(position.row) && !isNaN(position.column)) {
        let radial = ctx.createRadialGradient(
            position.column, position.row, 0,
            position.column, position.row, radius);
        radial.addColorStop(0, rgba(RGBA(255, 255, 255, start)));
        radial.addColorStop(.99, rgba(RGBA(255, 255, 255, inner)));
        radial.addColorStop(1, rgba(RGBA(255, 255, 255, outer)));

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
            borderWidth: constantBorder(3),
            borderColour: RGBA(128, 128, 128),
            setColour: setColour
        }
    },
    {
        condition: medium,
        spec: {
            size: constantElementSize(10, 10),
            borderWidth: constantBorder(3),
            borderColour: RGBA(128, 128, 128),
            setColour: setColour
        }
    },
    {
        condition: always,
        spec: {
            size: constantElementSize(10, 10),
            borderWidth: constantBorder(3),
            borderColour: RGBA(128, 128, 128),
            setColour: setColour
        }
    }
]

var parameters = {
    vanish: vanish != undefined,
    interchange: interchange != undefined
};

action(specArray, $('#drawing'), $('#foreground'), 30, parameters, Gradient);
