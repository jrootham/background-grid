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

var orbit = parseInt($("input[name=orbit]:checked").val());

$('input[type=radio][name=orbit]').change(
    function() {
        orbit = parseInt(this.value);
    });

var velocity = parseFloat($("input[name=velocity]:checked").val());

$('input[type=radio][name=velocity]').change(
    function() {
        velocity = parseFloat(this.value);
    });

var random = parseInt($("input[name=random]:checked").val());

$('input[type=radio][name=random]').change(
    function() {
        random = parseInt(this.value);
    });

var bounce = parseFloat($("input[name=bounce]:checked").val());

$('input[type=radio][name=bounce]').change(
    function() {
        bounce = parseFloat(this.value);
    });

function setColour(ctx, size, proper, inputs) {
    let location = makePosition(inputs, parameters);
    let mid = size.scale(.5);
    proper.row += (Math.random() * parameters.random * 2) - parameters.random;
    proper.row += (Math.random() * parameters.random * 2) - parameters.random;
    let position = proper.add(location.add(mid));

    console.log(location, mid, position);

    let radial = ctx.createRadialGradient(
        position.row, position.column, 0,
        position.row, position.column, radius);
    radial.addColorStop(0, rgba(RGBA(255, 255, 255, start)));
    radial.addColorStop(.99, rgba(RGBA(255, 255, 255, inner)));
    radial.addColorStop(1, rgba(RGBA(255, 255, 255, outer)));

    return radial;
}

var makePosition = (inputs, parameters) => {
    let rads = inputs.time * parameters.velocity;
    let x = parameters.orbit * Math.cos(rads);
    let y = parameters.orbit * Math.sin(rads);

    return new Index(x, y);
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
    orbit: orbit,
    velocity: velocity,
    random: random,
    bounce: bounce
};

action(specArray, $('#drawing'), $('#foreground'), 30, parameters, Gradient);
