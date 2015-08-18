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

let canvas = document.getElementById("drawing");
canvas.width = $("#background").width();
canvas.height = $("#background").height();

let scale = canvas.width / FULL_WIDTH;

let fadeTime = parseInt($("input[name=fadeTime]:checked").val());

$('input[type=radio][name=fadeTime]').change(
    function() {
        fadeTime = parseInt(this.value);
        transparencyDelta = (INTERVAL / 1000)  / fadeTime;
        transparency = 1.0;
    });

let transparencyDelta = (INTERVAL / 1000)  / fadeTime;

var triangles = [
    [{x:0, y:0},{x:0, y:720},{x:508, y:0}],
    [{x:0, y:720},{x:508, y:720},{x:508, y:0}],
    [{x:508, y:0},{x:1016, y:0},{x:1016, y:360}],
    [{x:508, y:0},{x:508, y:360},{x:1016, y:360}],
    [{x:1016, y:360},{x:1016, y:720},{x:762, y:720}],
    [{x:762, y:360},{x:1016, y:360},{x:762, y:720}],
    [{x:508, y:540},{x:508, y:720},{x:762, y:720}],
    [{x:508, y:540},{x:762, y:540},{x:762, y:720}],
    [{x:508, y:360},{x:635, y:360},{x:508, y:540}],
    [{x:508, y:540},{x:635, y:360},{x:635, y:540}],
    [{x:635, y:360},{x:762, y:360},{x:762, y:450}],
    [{x:635, y:360},{x:762, y:450},{x:635, y:450}],
    [{x:762, y:450},{x:762, y:540},{x:698.5, y:540}],
    [{x:698.5, y:450},{x:762, y:450},{x:698.5, y:540}],
    [{x:635, y:495},{x:698.5, y:540},{x:635, y:540}],
    [{x:635, y:495},{x:698.5, y:495},{x:698.5, y:540}]
];

let bound = (scale, point, box) => {
    box.left = box.left > scale * point.x ? scale * point.x : box.left;
    box.right = box.right < scale * point.x ? scale * point.x : box.right;
    box.top = box.top > scale * point.y ? scale * point.y : box.top;
    box.bottom = box.bottom < scale * point.y ? scale * point.y : box.bottom;

    return box;
};

let boundingBox = (scale, triangle) => {
    let box = {
        left: scale * triangle[0].x,
        right: scale * triangle[0].x,
        top: scale * triangle[0].y,
        bottom: scale * triangle[0].y
    }

    bound(scale, triangle[1], box);
    bound(scale, triangle[2], box);

    return box;
};

let inBox = (position, box) => {
    return position.x >= box.left
        && position.x <= box.right
        && position.y >= box.top
        && position.y <= box.bottom;
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
            transparency = 1.0;
        });
    }

    saveMouse(event) {
        let location = this.foreground.offset();
        let x = event.pageX - location.left;
        let y = event.pageY - location.top;

        return {x: x, y: y};
    }
}

let findTriangle = (scale, position, triangles) => {
    let found = triangles.find(function(triangle) {
        let result = false;
        let box = boundingBox(scale, triangle);
        if (inBox(position, box) && testTriangle(scale, box, triangle, position)) {
            result = triangle;
        }

        return result;
    })

    return found;
}

let scaleTriangle = (scale, triangle) => {
    return triangle.map(function(point) {
        return {x: scale * point.x, y: scale * point.y};
    })
}

let testTriangle = (scale, box, triangle, point) => {
    let scaledTriangle = scaleTriangle(scale, triangle);
    if (hasTopLeft(scaledTriangle, box)) {
        if (hasBottomLeft(scaledTriangle, box)) {
            if (hasTopRight(scaledTriangle, box)) {
                return inTopLeft(point, box);
            }
            else {
                return inBottomLeft(point, box);
            }
        }
        else {
            return inTopRight(point, box);
        }
    }
    else {
        return inBottomRight(point, box);
    }
}

let hasTopLeft = (triangle, box) => {
    return triangle.find(function(point) {
        return Math.abs(point.x - box.left) < EPSILON
            && Math.abs(point.y - box.top) < EPSILON;
    })
}

let hasBottomLeft = (triangle, box) => {
    return triangle.find(function(point) {
        return Math.abs(point.x - box.left) < EPSILON
            && Math.abs(point.y - box.bottom) < EPSILON;
    })
}

let hasTopRight = (triangle, box) => {
     return triangle.find(function(point) {
        return Math.abs(point.x - box.right) < EPSILON
            && Math.abs(point.y - box.top) < EPSILON;
    })
}

let inTopLeft = (point, box) => {
    let xRatio = (box.right - point.x) / (box.right - box.left);
    let yRatio = (point.y - box.top) / (box.bottom - box.top);

    let result = xRatio >= yRatio;
    return result;
}

let inTopRight = (point, box) => {
    let xRatio = (point.x - box.left) / (box.right - box.left);
    let yRatio = (point.y - box.top) / (box.bottom - box.top);

    let result =  xRatio >= yRatio;
    return result;
}

let inBottomLeft = (point, box) => {
    let xRatio = (box.right - point.x) / (box.right - box.left);
    let yRatio = (box.bottom - point.y) / (box.bottom - box.top);

    let result =  xRatio >= yRatio;

    return result;
}

let inBottomRight = (point, box) => {
    let xRatio = (box.right - point.x) / (box.right - box.left);
    let yRatio = (point.y - box.top) / (box.bottom - box.top);

    let result =  xRatio <= yRatio;

    return result;
}

let makePath = (context, scale, triangle) => {
    context.beginPath();
    context.moveTo(triangle[0].x * scale, triangle[0].y * scale);
    context.lineTo(triangle[1].x * scale, triangle[1].y * scale);
    context.lineTo(triangle[2].x * scale, triangle[2].y * scale);
    context.closePath();
}

let drawTriangle = (context, scale, triangle) => {
    drawEdge(context, scale, triangle[0], triangle[1]);
    drawEdge(context, scale, triangle[0], triangle[2]);
    drawEdge(context, scale, triangle[1], triangle[2]);
}

let drawEdge = (context, scale, point0, point1) => {
    let dx = point0.x - point1.x;
    let dy = point0.y - point1.y;

    context.save();
    if (dx === 0 || dy === 0) {
        context.strokeStyle = "black";
    }
    else {
        context.strokeStyle = "blue";
        context.setLineDash([5, 5]);
    }

    context.beginPath();
    context.moveTo(point0.x * scale, point0.y * scale);
    context.lineTo(point1.x * scale, point1.y * scale);
    context.stroke();

    context.restore();
}

let fore = $("#foreground");
let inputs = new Inputs(fore);
$(window).resize(event => {
    canvas.width = $("#background").width();
    canvas.height = $("#background").height();
    scale = canvas.width / FULL_WIDTH;
});

let previous = undefined;
let transparency = 1.0;

setInterval (() => {
    let context = canvas.getContext("2d");
    context.fillStyle = "rgba(255, 255, 255, 1.0)";
    context.fillRect(0, 0, canvas.width, canvas.height);
    triangles.forEach((triangle) => {
            drawTriangle(context,scale, triangle);
        }
    );

    let position = inputs.mousePosition;
    if (position) {
        let triangle = findTriangle(scale, position, triangles);
        if (triangle) {
            if (triangle === previous) {
                transparency = Math.max(0, transparency - transparencyDelta);
            }
            else {
                transparency = 1.0;
                previous = triangle;
            }

            context.fillStyle = `rgba(255, 255, 255, ${transparency})`;
            makePath(context, scale, triangle);
            context.save();
            context.clip();
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.restore();
        }
    }
}, INTERVAL);
