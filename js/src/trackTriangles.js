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

const FULL_WIDTH = 1016;
const EPSILON = 0.000001;
const INTERVAL = 20;

let fadeTime = parseInt($("input[name=fadeTime]:checked").val());

$('input[type=radio][name=fadeTime]').change(
    function() {
        fadeTime = parseInt(this.value);
        transparencyDelta = (INTERVAL / 1000)  / fadeTime;
        transparency = 1.0;
    });

let transparencyDelta = (INTERVAL / 1000)  / fadeTime;

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
    constructor(scale, triangle) {
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

        this.transparency = 1.0;

        this.edgeList = new Array();
        this.edgeList.push(new Edge(this.triangle[0], this.triangle[1]));
        this.edgeList.push(new Edge(this.triangle[0], this.triangle[2]));
        this.edgeList.push(new Edge(this.triangle[1], this.triangle[2]));
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

    makePath (context) {
        context.beginPath();
        context.moveTo(this.triangle[0].x, this.triangle[0].y);
        context.lineTo(this.triangle[1].x, this.triangle[1].y);
        context.lineTo(this.triangle[2].x, this.triangle[2].y);
        context.closePath();
    }

    draw(context, point) {
        if (this.testPoint(point)) {
            this.transparency = Math.max(0, this.transparency - transparencyDelta);
        }
        else {
            this.transparency = Math.min(1.0, this.transparency + transparencyDelta);
        }

        this.makePath(context);
        context.fillStyle = `rgba(255, 255, 255, ${this.transparency})`;
        context.fill();

        this.edgeList.forEach(edge => {
            edge.draw(context);
        });
    }
}

let makeTriangles = scale =>{
    let triangleList = [
        new  Triangle(scale, [{x:635, y:495},{x:698.5, y:495},{x:698.5, y:540}]),
        new  Triangle(scale, [{x:635, y:495},{x:698.5, y:540},{x:635, y:540}]),
        new  Triangle(scale, [{x:698.5, y:450},{x:762, y:450},{x:698.5, y:540}]),
        new  Triangle(scale, [{x:762, y:450},{x:762, y:540},{x:698.5, y:540}]),
        new  Triangle(scale, [{x:635, y:360},{x:762, y:450},{x:635, y:450}]),
        new  Triangle(scale, [{x:635, y:360},{x:762, y:360},{x:762, y:450}]),
        new  Triangle(scale, [{x:508, y:540},{x:635, y:360},{x:635, y:540}]),
        new  Triangle(scale, [{x:508, y:360},{x:635, y:360},{x:508, y:540}]),
        new  Triangle(scale, [{x:508, y:540},{x:762, y:540},{x:762, y:720}]),
        new  Triangle(scale, [{x:508, y:540},{x:508, y:720},{x:762, y:720}]),
        new  Triangle(scale, [{x:762, y:360},{x:1016, y:360},{x:762, y:720}]),
        new  Triangle(scale, [{x:1016, y:360},{x:1016, y:720},{x:762, y:720}]),
        new  Triangle(scale, [{x:508, y:0},{x:508, y:360},{x:1016, y:360}]),
        new  Triangle(scale, [{x:508, y:0},{x:1016, y:0},{x:1016, y:360}]),
        new  Triangle(scale, [{x:0, y:720},{x:508, y:720},{x:508, y:0}]),
        new  Triangle(scale, [{x:0, y:0},{x:0, y:720},{x:508, y:0}])
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

let canvas = document.getElementById("drawing");
canvas.width = $("#background").width();
canvas.height = $("#background").height();

let triangleList = makeTriangles(canvas.width / FULL_WIDTH);

$(window).resize(event => {
    canvas.width = $("#background").width();
    canvas.height = $("#background").height();
    triangleList = makeTriangles(canvas.width / FULL_WIDTH);
});

setInterval (() => {
    let context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);

    triangleList.forEach((triangle) => {
        triangle.draw(context, inputs.mousePosition);
    });
}, INTERVAL);
