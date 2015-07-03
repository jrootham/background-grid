/**
 * splash.js
 *
 * Created by jrootham on 02/07/15.
 *
 * Copyright © 2014 Jim Rootham
 */
var downSpeed = parseInt($("input[name=down_speed]:checked").val());

$('input[type=radio][name=down_speed]').change(
    function() {
        downSpeed = parseInt(this.value);
    });

var upSpeed = parseInt($("input[name=up_speed]:checked").val());

$('input[type=radio][name=up_speed]').change(
    function() {
        upSpeed = parseInt(this.value);
    });

var waveSize = parseFloat($("input[name=wave_size]:checked").val());

$('input[type=radio][name=wave_size]').change(
    function() {
        waveSize = parseFloat(this.value);
    });

function setColour(previous, current, size, inputs) {
    let red = 0;
    let blue = 255;

    let downPosition = inputs.getDownPosition();

    if (downPosition) {
        let distance = current.distance(downPosition);
        let radius = -100;

        if (inputs.isMouseDown()) {
            radius = inputs.getTimeSinceDown() / downSpeed;
        }
        if (inputs.isMouseUp()) {
            radius = inputs.getTimeSinceDown() / downSpeed - inputs.getTimeSinceUp() / upSpeed;
        }

        let factor = (-(Math.abs(distance - radius) - waveSize)) / waveSize;

        blue = 255 * (1 - factor);
        red = 255 * factor;
    }

    return new RGBA(red, 0 , blue);
}

var specArray = [
    {
        condition: always,
        spec: {
            size: constantElementSize(10, 10),
            borderWidth: constantBorder(0),
            borderColour: new RGBA(128, 128, 128),
            setColour: setColour
        }
    }
]

action(specArray, $('#drawing'), $('#foreground'), 20);
