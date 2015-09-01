/**
 * trackTriangles.js
 *
 * Created by jrootham on 14/08/15.
 *
 * Copyright © 2014 Jim Rootham
 */

if (!Array.prototype.find) {
    Array.prototype.find = function(predicate) {
        if (this == null) {
            throw new TypeError('Array.prototype.find called on null or undefined');
        }
        if (typeof predicate !== 'function') {
            throw new TypeError('predicate must be a function');
        }
        var list = Object(this);
        var length = list.length >>> 0;
        var thisArg = arguments[1];
        var value;

        for (var i = 0; i < length; i++) {
            value = list[i];
            if (predicate.call(thisArg, value, i, list)) {
                return value;
            }
        }
        return undefined;
    };
}

// Production steps of ECMA-262, Edition 5, 15.4.4.19
// Reference: http://es5.github.io/#x15.4.4.19
if (!Array.prototype.map) {

    Array.prototype.map = function(callback, thisArg) {

        var T, A, k;

        if (this == null) {
            throw new TypeError(' this is null or not defined');
        }

        // 1. Let O be the result of calling ToObject passing the |this|
        //    value as the argument.
        var O = Object(this);

        // 2. Let lenValue be the result of calling the Get internal
        //    method of O with the argument "length".
        // 3. Let len be ToUint32(lenValue).
        var len = O.length >>> 0;

        // 4. If IsCallable(callback) is false, throw a TypeError exception.
        // See: http://es5.github.com/#x9.11
        if (typeof callback !== 'function') {
            throw new TypeError(callback + ' is not a function');
        }

        // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
        if (arguments.length > 1) {
            T = thisArg;
        }

        // 6. Let A be a new array created as if by the expression new Array(len)
        //    where Array is the standard built-in constructor with that name and
        //    len is the value of len.
        A = new Array(len);

        // 7. Let k be 0
        k = 0;

        // 8. Repeat, while k < len
        while (k < len) {

            var kValue, mappedValue;

            // a. Let Pk be ToString(k).
            //   This is implicit for LHS operands of the in operator
            // b. Let kPresent be the result of calling the HasProperty internal
            //    method of O with argument Pk.
            //   This step can be combined with c
            // c. If kPresent is true, then
            if (k in O) {

                // i. Let kValue be the result of calling the Get internal
                //    method of O with argument Pk.
                kValue = O[k];

                // ii. Let mappedValue be the result of calling the Call internal
                //     method of callback with T as the this value and argument
                //     list containing kValue, k, and O.
                mappedValue = callback.call(T, kValue, k, O);

                // iii. Call the DefineOwnProperty internal method of A with arguments
                // Pk, Property Descriptor
                // { Value: mappedValue,
                //   Writable: true,
                //   Enumerable: true,
                //   Configurable: true },
                // and false.

                // In browsers that support Object.defineProperty, use the following:
                // Object.defineProperty(A, k, {
                //   value: mappedValue,
                //   writable: true,
                //   enumerable: true,
                //   configurable: true
                // });

                // For best browser support, use the following:
                A[k] = mappedValue;
            }
            // d. Increase k by 1.
            k++;
        }

        // 9. return A
        return A;
    };
}

const MAX_X = 1440;
const MAX_Y = 1020;
const RATIO = MAX_X / MAX_Y;

const EPSILON = 0.000001;
const INTERVAL = 20;

let canvas = document.getElementById("drawing");

let crossFadeTime = parseFloat($("input[name=crossFadeTime]:checked").val());
let crossFadeDelta = (INTERVAL / 1000)  / crossFadeTime;

$('input[type=radio][name=crossFadeTime]').change(
    function() {
        crossFadeTime = parseFloat(this.value);
        crossFadeDelta = (INTERVAL / 1000)  / crossFadeTime;
    });

let blank = "true" === $("input[name=blank]:checked").val();

$('input[type=radio][name=blank]').change(
    function() {
        blank = "true" === this.value;
        triangleList = make();
    });


let twoDOutside = "true" === $("input[name=twoDOutside]:checked").val();

$('input[type=radio][name=twoDOutside]').change(
    function() {
        twoDOutside = "true" === this.value;
        triangleList = make();
    });

let twoD = document.getElementById("two_d");
let threeD = document.getElementById("three_d");

class Edge {
    constructor(pointA, pointB) {

        // Make sure we draw diagonal lines in the same order

        if (pointA.x < pointB.x) {
            this.point0 = pointA;
            this.point1 = pointB;
        }
        else {
            this.point0 = pointB;
            this.point1 = pointA;
        }
    }

    draw(context) {
        let dx = this.point0.x - this.point1.x;
        let dy = this.point0.y - this.point1.y;

        context.save();
        if (dx === 0 || dy === 0) {
            context.strokeStyle = "black";
        }
        else {
            context.strokeStyle = "blue";
            context.setLineDash([5, 5]);
        }

        context.beginPath();
        context.moveTo(this.point0.x, this.point0.y);
        context.lineTo(this.point1.x, this.point1.y);
        context.stroke();

        context.restore();
    }
}

class Triangle {
    constructor(scale, outside, triangle, startBlank, twoDOutside) {
        this.newPoint = true;
        this.fromShow = 0.0;
        this.toShow = 1.0;

        if (startBlank) {
            this.fromShow = 0.0;
            this.toShow = 0.0;
            this.fromImage = twoD;
            this.toImage = threeD;
        }
        else {
            if (twoDOutside === outside) {
                this.fromImage = twoD;
                this.toImage = threeD;
            }
            else {
                this.fromImage = threeD;
                this.toImage = twoD;
            }
        }

        this.outside = outside;

        this.triangle  = triangle.map(function(point) {
            return {x: scale * point.x, y: scale * point.y};
        });

        this.box = this.boundingBox();

        this.hasTopLeft = this.triangle.find(point => {
            return Math.abs(point.x - this.box.left) < EPSILON
                && Math.abs(point.y - this.box.top) < EPSILON;
        });

        this.hasBottomLeft = this.triangle.find(point => {
            return Math.abs(point.x - this.box.left) < EPSILON
                && Math.abs(point.y - this.box.bottom) < EPSILON;
        });

        this.hasTopRight = this.triangle.find(point => {
            return Math.abs(point.x - this.box.right) < EPSILON
                && Math.abs(point.y - this.box.top) < EPSILON;
        });

        this.edgeList = [
            new Edge(this.triangle[0], this.triangle[1]),
            new Edge(this.triangle[0], this.triangle[2]),
            new Edge(this.triangle[1], this.triangle[2])
        ];
    }

    bound (point, box) {
        box.left = box.left > point.x ? point.x : box.left;
        box.right = box.right < point.x ? point.x : box.right;
        box.top = box.top > point.y ? point.y : box.top;
        box.bottom = box.bottom < point.y ? point.y : box.bottom;

        return box;
    }

    boundingBox(){
        let box = {
            left:  this.triangle[0].x,
            right: this.triangle[0].x,
            top: this.triangle[0].y,
            bottom: this.triangle[0].y
        }

        this.bound(this.triangle[1], box);
        this.bound(this.triangle[2], box);

        return box;
    }

    inBox(point) {
        return point.x >= this.box.left
            && point.x <= this.box.right
            && point.y >= this.box.top
            && point.y <= this.box.bottom;
    }

    testPoint(point) {
        if (point && this.inBox(point)) {
            if (this.hasTopLeft) {
                if (this.hasBottomLeft) {
                    if (this.hasTopRight) {
                        return this.inTopLeft(point);
                    }
                    else {
                        return this.inBottomLeft(point);
                    }
                }
                else {
                    return this.inTopRight(point);
                }
            }
            else {
                return this.inBottomRight(point);
            }
        }
        else {
            return false;
        }
    }

    inTopLeft(point) {
        let xRatio = (this.box.right - point.x) / (this.box.right - this.box.left);
        let yRatio = (point.y - this.box.top) / (this.box.bottom - this.box.top);

        let result = xRatio >= yRatio;
        return result;
    }

    inTopRight(point) {
        let xRatio = (point.x - this.box.left) / (this.box.right - this.box.left);
        let yRatio = (point.y - this.box.top) / (this.box.bottom - this.box.top);

        let result =  xRatio >= yRatio;
        return result;
    }

    inBottomLeft(point) {
        let xRatio = (this.box.right - point.x) / (this.box.right - this.box.left);
        let yRatio = (this.box.bottom - point.y) / (this.box.bottom - this.box.top);

        let result =  xRatio >= yRatio;

        return result;
    }

    inBottomRight(point) {
        let xRatio = (this.box.right - point.x) / (this.box.right - this.box.left);
        let yRatio = (point.y - this.box.top) / (this.box.bottom - this.box.top);

        let result =  xRatio <= yRatio;

        return result;
    }

    makeClip (context) {
        context.beginPath();
        context.moveTo(this.triangle[0].x, this.triangle[0].y);
        context.lineTo(this.triangle[1].x, this.triangle[1].y);
        context.lineTo(this.triangle[2].x, this.triangle[2].y);
        context.closePath();
        context.clip();
    }

    lower(current) {
        return Math.max(0, current - crossFadeDelta);
    }

    raise (current) {
        return Math.min(1.0, current + crossFadeDelta);
    }

    draw(context, point) {
        if (this.testPoint(point)) {
            if (this.newPoint) {
                this.newPoint = false;
                this.fromShow = 1.0;
                this.toShow = 0.0;
                [this.fromImage, this.toImage] = [this.toImage, this.fromImage];
            }
        }
        else {
            this.newPoint = true;
        }

        if (this.fromShow > 0.0 || this.toShow > 0.0) {
            this.fromShow = this.lower(this.fromShow);
            this.toShow = this.raise(this.toShow);
        }

        context.save();

        this.makeClip(context);
        context.save();

        context.globalAlpha = this.fromShow;
        context.drawImage(this.fromImage, 0, 0, canvas.width, canvas.width / RATIO);
        context.restore();

        context.globalAlpha = this.toShow;
        context.drawImage(this.toImage, 0, 0, canvas.width, canvas.width / RATIO);

        context.restore();

        this.edgeList.forEach(edge => {
            edge.draw(context);
        });
    }
}

let makeTriangles = scale =>{
    let triangleList = [
        new  Triangle(
            scale,
            true,
            [{x:985, y:765},{x:890, y:765},{x:890, y:698.75}],
            blank,
            twoDOutside
        ),
        new  Triangle(
            scale,
            false,
            [{x:985, y:765},{x:985, y:698.75},{x:890, y:698.75}],
            blank,
            twoDOutside
        ),
        new  Triangle(
            scale,
            true,
            [{x:1080, y:632.5},{x:985, y:632.5},{x:985, y:765}],
            blank,
            twoDOutside
        ),
        new  Triangle(
            scale,
            false,
            [{x:1080, y:632.5},{x:1080, y:765},{x:985, y:765}],
            blank,
            twoDOutside
        ),
        new  Triangle(
            scale,
            true,
            [{x:890, y:510},{x:1080, y:510},{x:1080, y:632.5}],
            blank,
            twoDOutside
        ),
        new  Triangle(
            scale,
            false,
            [{x:890, y:510},{x:890, y:632.5},{x:1080, y:632.5}],
            blank,
            twoDOutside
        ),
        new  Triangle(
            scale,
            true,
            [{x:720, y:765},{x:720, y:510},{x:890, y:510}],
            blank,
            twoDOutside
        ),
        new  Triangle(
            scale,
            false,
            [{x:720, y:765},{x:890, y:765},{x:890, y:510}],
            blank,
            twoDOutside
        ),
        new  Triangle(
            scale,
            true,
            [{x:1080, y:1020},{x:1080, y:765},{x:720, y:765}],
            blank,
            twoDOutside
        ),
        new  Triangle(
            scale,
            false,
            [{x:1080, y:1020},{x:720, y:1020},{x:720, y:765}],
            blank,
            twoDOutside
        ),
        new  Triangle(
            scale,
            true,
            [{x:1440, y:1020},{x:1080, y:1020},{x:1080, y:510}],
            blank,
            twoDOutside
        ),
        new  Triangle(
            scale,
            false,
            [{x:1440, y:510},{x:1440, y:1020},{x:1080, y:510}],
            blank,
            twoDOutside
        ),
        new  Triangle(
            scale,
            true,
            [{x:1440, y:510},{x:720, y:510},{x:720, y:0}],
            blank,
            twoDOutside
        ),
        new  Triangle(
            scale,
            false,
            [{x:720, y:0},{x:1440, y:0},{x:1440, y:510}],
            blank,
            twoDOutside
        ),
        new  Triangle(
            scale,
            true,
            [{x:0, y:1020},{x:720, y:1020},{x:720, y:0}],
            blank,
            twoDOutside
        ),
        new  Triangle(
            scale,
            false,
            [{x:0, y:0},{x:0, y:1020},{x:720, y:0}],
            blank,
            twoDOutside
        )
    ];

    return triangleList;
}

class Inputs {
    constructor(foreground) {
        this.foreground = foreground;
        this.mousePosition = undefined;

        this.foreground.mousemove((event) =>{
            this.mousePosition = this.saveMouse(event);
        });

        this.foreground.mouseleave(event => {
            this.mousePosition = undefined;
        });
    }

    saveMouse(event) {
        let location = this.foreground.offset();
        let x = event.pageX - location.left;
        let y = event.pageY - location.top;

        return {x: x, y: y};
    }
}

let fore = $("#foreground");
let inputs = new Inputs(fore);

let make = () => {
    canvas.width = $("#background").width();
    canvas.height = $("#background").height();

    return makeTriangles(canvas.width / MAX_X);
}

let triangleList = make();

$(window).resize(event => {
    triangleList = make();
});

setInterval (() => {
    let context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);

    triangleList.forEach((triangle) => {
        triangle.draw(context, inputs.mousePosition);
    });
}, INTERVAL);

