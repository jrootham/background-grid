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

var velocity = parseInt($("input[name=velocity]:checked").val());

$('input[type=radio][name=velocity]').change(
    function() {
        velocity = parseInt(this.value);
    });

function setColour(ctx, size, current, target, inputs) {
    let position = makePosition(inputs, parameters, size, current, target);

    let radial = ctx.createRadialGradient(
        position.row, position.column, 0,
        position.row, position.column, radius);
    radial.addColorStop(0, rgba(RGBA(255, 255, 255, start)));
    radial.addColorStop(.99, rgba(RGBA(255, 255, 255, inner)));
    radial.addColorStop(1, rgba(RGBA(255, 255, 255, outer)));

    return radial;
}

class Polynomial{
    constructor() {
        this.firstTarget = 0;
        this.firstSlope = 0;
        this.secondTarget = 0;
        this.secondSlope = 0;
        this.maxT = 0;
        this.t = 0;
        this.poly = [0, 0, 0 ,0];
    }

    set(newTarget, maxT) {
        this.t = 0;
        this.maxT = maxT;
        this.firstTarget = this.secondTarget;
        this.firstSlope = this.secondSlope;
        this.secondTarget = newTarget;
        let delta = this.secondTarget-this.firstTarget;
        this.secondSlope = Math.sign(delta) * (Math.sqrt(Math.sqrt(Math.abs(delta))));

        this.solve(maxT);
    }

    solve(t) {
        console.log("former", this.poly);
        console.log(this.firstTarget, this.firstSlope, this.secondTarget, this.secondSlope);

        let d = this.firstTarget;
        let c = this.firstSlope;

        let t2 = t * t;
        let t3 = t2 * t;

        let ds = this.secondSlope - this.firstSlope;

        let k = this.secondTarget - (ds / 3 + c * t + d);
        let b = k / (3 * t * t - 2 * t);

        let a = (this.secondTarget - (b * t2 + c * t + d)) / t3;

        this.t = 0;

        this.poly[0] = a;
        this.poly[1] = b;
        this.poly[2] = c;
        this.poly[3] = d;
        console.log("latter", this.poly, this.step(0));
    }

    derivative() {
        let t = this.t;
        let t2 = t * t;
        return 3 * this.poly[0] * t2 + 2 * this.poly[1] * t + this.poly[2];
    }

    step(delta = 1) {
        let t1 = this.t;
        let t2 = t1 * t1;
        let t3 = t1 * t2;
        this.t+= delta;
        return this.poly[0] * t3 + this.poly[1] * t2
            + this.poly[2] * t1 + this.poly[3];
    }

    done() {
        let result = this.t >= this.maxT;
        return result;
    }
}

var polynomialX = new Polynomial();
var polynomialY = new Polynomial();

var makePosition = (inputs, parameters, size, current, target) => {
    if (polynomialX.done()) {
        let newXTarget = Math.round(Math.random() * size.row);
        let newYTarget = Math.round(Math.random() * size.column);

        let maxT = Math.round(Math.max(newXTarget/velocity, newYTarget/velocity));
        polynomialX.set(newXTarget, maxT);
        polynomialY.set(newYTarget, maxT);
    }

    let derivativeX = Math.abs(polynomialX.derivative());
    let derivativeY = Math.abs(polynomialY.derivative());
    let delta = Math.max(derivativeX, derivativeY);
    let step = 1 / Math.max(.1, delta);
    step = 1;
    return new Index(polynomialX.step(step), polynomialY.step(step));
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
    velocity: velocity
};

action(specArray, $('#drawing'), $('#foreground'), 30, parameters, Gradient);
