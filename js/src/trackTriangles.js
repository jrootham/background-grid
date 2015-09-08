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

const EPSILON = 0.000001;
const INTERVAL = 20;

const MAX_X = 1440;
const MAX_Y = 1020;
const RATIO = MAX_X / MAX_Y;
const DASH_COLOUR = "x0FA9D8";
const DASH_DASH = 5;
const DASH_EMPTY = 5;

const PAGE_VERTICAL = 7;
const PAGE_HORIZONTAL = 7;
const PAGE_FONT = "bolder 2vw Helvetica";

const TEXT_DELAY_TIME = 1.0;
const TEXT_DELAY_TICKS = TEXT_DELAY_TIME / INTERVAL;

const TEXT_FONT = "bolder 2vw Helvetica";
const TEXT_HEIGHT = 32;
const BLACK_TEXT_X = 320;
const BLACK_TEXT_Y = 50;

const GREY_COLOUR = 180;
const GREY_TEXT_COLOUR = 255;
const GREY_TEXT_X = 320;
const GREY_TEXT_Y = 620;

$("#spirals").hide();

$("#spirals").click(event => {
    $("#spirals").hide();
    $("#boxes").show();
    boxContainer = makeBoxes();
    action = drawBoxes;
    reset();
});

$("#boxes").click(event => {
    $("#spirals").show();
    $("#boxes").hide();
    boxContainer = makeSpirals();
    action = drawSpirals;
    reset();
});


let canvas = document.getElementById("drawing");

let crossFadeTime = parseFloat($("input[name=crossFadeTime]:checked").val());
let crossFadeDelta = (INTERVAL / 1000)  / crossFadeTime;
$("#debug1").html(`Time ${crossFadeTime} delta ${crossFadeDelta}`);

let twoD = document.getElementById("two_d");
let threeD = document.getElementById("three_d");

let lower = current => Math.max(0, current - crossFadeDelta);

let raise = current => Math.min(1.0, current + crossFadeDelta);

let makeSpirals = () => {
    canvas.width = $("#background").width();
    canvas.height = $("#background").height();

    return new BoxContainer(canvas.width / MAX_X, specList);
}

let makeBoxes = () => {
    canvas.width = $("#background").width();
    canvas.height = $("#background").height();

    return new PlainBoxContainer(canvas.width / MAX_X, specList);
}

let drawSpirals = context => {
    boxContainer.changeState(inputs.mousePosition, tick++);
    boxContainer.draw(context);
}

let drawBoxes = context => {
    boxContainer.changeState(inputs.mousePosition);
    boxContainer.draw(context);
}

class PlainBoxContainer {
    constructor(scale, specList) {
        this.twoD = twoD;
        this.threeD = threeD;

        this.scale = scale;

        this.boxList = [
            new PlainBox(this, specList[0]),
            new PlainBox(this, specList[1]),
            new PlainBox(this, specList[2]),
            new PlainBox(this, specList[3]),
            new PlainBox(this, specList[4]),
            new PlainBox(this, specList[5]),
            new PlainBox(this, specList[6]),
            new PlainBox(this, specList[7])
        ];
    }
}

class BoxContainer {
    constructor (scale, specList) {
        this.scale = scale;
        this.state = 0;
        this.stateList = [
            this.drawEmpty,
            this.second,
            this.third,
            this.fourth,
            this.fifth,
            this.sixth
        ];

        this.pageVertical = PAGE_VERTICAL * scale;
        this.pageHorizontal = PAGE_HORIZONTAL * scale;
        this.blackTextX = BLACK_TEXT_X * scale;
        this.blackTextY = BLACK_TEXT_Y * scale;
        this.textHeight = TEXT_HEIGHT * scale;
        this.greyTextX = GREY_TEXT_X * scale;
        this.greyTextY = GREY_TEXT_Y * scale;

        this.blackShow = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        this.greyShow = [0, 0, 0, 0, 0, 0, 0, 0];
        this.blackTextShow = 0;

        this.boxList = [
            new BoxWithText(this, specList[0], "A1"),
            new BoxDownOutside(this, specList[1], "A2"),
            new BoxUpInside(this, specList[2], "A3"),
            new BoxDownInside(this, specList[3], "A4"),
            new BoxUpOutside(this, specList[4], "A5"),
            new BoxDownOutside(this, specList[5], "A6"),
            new BoxUpInside(this, specList[6], "A7"),
            new BoxDownInside(this, specList[7], ""),
            new CentreBox(this, specList[8])
        ]
    }

    second(context) {
        this.drawBlack(context, this.blackShow);
    }

    third(context) {
        this.drawAllBlack(context);
    }

    fourth(context) {
        this.drawAllBlack(context);
        this.drawBlackText(context);
    }

    fifth(context) {
        this.drawGrey(context, this.greyShow);
        this.drawGreyText(context, this.greyShow[7])
        this.drawAllBlack(context);
        this.drawBlackText(context);
    }

    sixth(context) {
        this.drawGreyText(context, this.greyShow)
        this.drawGrey(context, this.greyShow);
        this.drawBlackText(context)
    }

    drawBlack(context, blackShow)
    {
        if (blackShow[0] <= 0) {
            blackShow[0] = raise(blackShow[0]);
        }

        this.boxList.forEach((box, index) => {
            box.drawBlack(context, blackShow[index]);

            if (blackShow[index] > 0) {
                blackShow[index] = raise(blackShow[index]);
            }
            if (index < blackShow.length - 1) {
                if (blackShow[index] >= 1.0) {
                    blackShow[index + 1] = raise(blackShow[index + 1]);
                }
            }
        })
    }

    drawAllBlack(context) {
        this.boxList.forEach(box => {
            box.drawBlack(context, 1);
        });
    }

    drawGrey(context, greyShow)
    {
        if (greyShow[0] <= 0) {
            greyShow[0] = raise(greyShow[0]);
        }

        let list = this.boxList.slice(0, this.boxList.length - 1).reverse();

        list.forEach((box, index) => {
            box.drawGrey(context, greyShow[index]);

            if (greyShow[index] > 0) {
                greyShow[index] = raise(greyShow[index]);
            }
            if (index < greyShow.length - 1) {
                if (greyShow[index] >= 1.0) {
                    greyShow[index + 1] = raise(greyShow[index + 1]);
                }
            }
        })
    }

    drawAllGrey(context) {
        this.boxList.forEach(box => {
            box.drawGrey(context, 1);
        });
    }

    drawGreyText(context, textShow)
    {
        this.boxList[0].drawGreyText(context, textShow);
    }

    drawBlackText(context, blackShow)
    {
        this.blackTextShow = raise(this.blackTextShow);
        this.boxList[0].drawBlackText(context, this.blackTextShow);
    }

    changeState(mousePosition, tick) {
        switch (this.state) {
            case 0:                    // Showing empty
                if (mousePosition != undefined) {
                    let found = this.boxList.find(box => {
                        return box.inOutside(mousePosition)
                    });

                    if (found) {
                        $("#debug2").html("found in outside " + found.topLeftX + " " + found.topLeftY);
                        this.state++;
                    }
                }
                break;

            case 1:                    // Draswing black spiral
                if (this.blackShow.every(show => show >= 1)) {
                    this.startTick = tick;
                    this.state++;
                }
                break;

            case 2:                    // Waiting
                if (tick - this.startTick > TEXT_DELAY_TICKS) {
                    this.state++;
                }
                break;

            case 3:                    // Drawing black text
                if (mousePosition != undefined) {
                    let found = this.boxList.find(box => {
                        return box.inInside(mousePosition)
                    });

                    if (found) {
                        $("#debug2").html("found in inside " + found.topLeftX + " " + found.topLeftY);
                        this.state++;
                    }
                }
                break;

            case 4:                    // Drawing grey spiral
                break;

        }
    }

    drawEmpty(context) {
        this.boxList.forEach(function(box) {
            box.drawEmpty(context);
        })
    }

    draw(context) {
        this.stateList[this.state].call(this, context);
    }
}

class PlainBox {
    constructor(parent, spec) {
        this.parent = parent;

        this.topLeftX = parent.scale * spec.topLeft.x;
        this.topLeftY = parent.scale * spec.topLeft.y;
        this.deltaX = parent.scale * spec.delta.x;
        this.deltaY = parent.scale * spec.delta.y;
    }

    inBox(point) {
        $("#debug1").html("inBox " + point.x + " " + point.y);
        return point.x >= this.topLeftX
            && point.x <= this.topLeftX + this.deltaX
            && point.y >= this.topLeftY
            && point.y <= this.topLeftY + this.deltaY;
    }

}

class Box extends PlainBox {
    constructor(parent, spec) {
        super(parent, spec);
    }

    drawBlack(context, intensity) {
        this.fillBlack(context, intensity);
        if (intensity < 1) {
            this.drawEmpty(context);
        }
        else {
            this.drawFinal(context);
        }
    }

    drawGrey(context, intensity) {
        this.fill(context, this.inside(), GREY_COLOUR, intensity);
        this.drawFinal(context);
    }

    drawFinal(context) {
        context.strokeStyle = "black";
        context.strokeRect(this.topLeftX, this.topLeftY, this.deltaX, this.deltaY);
    }
}

class CentreBox extends Box {
    constructor(parent, spec) {
        super(parent, spec);
    }

    fillBlack(context, intensity) {
        this.fill (context, 0, intensity);
    }

    fill(context, colour, intensity) {
        context.save();
        context.fillStyle = `rgba(${colour}, ${colour}, ${colour}, ${intensity})`;
        context.fillRect(this.topLeftX, this.topLeftY, this.deltaX, this.deltaY);
        context.restore();
    }

    drawEmpty(context) {
    }

    drawFinal(context) {
    }

    inOutside(point) {
        return false;
    }

    inInside(point) {
        return false;
    }
}

class BaseBox extends Box {
    constructor(parent, spec, pageSize) {
        super(parent, spec);
        this.pageSize = pageSize;
    }

    diagonalDraw(context, fromX, fromY, toX, toY) {
        context.save();
        context.strokeStyle = DASH_COLOUR;
        context.setLineDash([DASH_DASH, DASH_EMPTY]);
        context.beginPath();
        context.moveTo(fromX, fromY);
        context.lineTo(toX, toY);
        context.stroke();
        context.restore();
    }

    drawEmpty(context) {
        this.drawFinal(context);
        this.diagonal(context);
    }

    inBottom(point) {
        let result = false;
        if (this.inBox(point)) {
            result = ! this.inTop(point);
        }

        return result;
    }

    inInside(point) {
        let result = false;
        if (this.inBox(point)) {
            result = ! this.inOutside(point);
        }

        return result;
    }

    fillBlack(context, intensity) {
        this.fill (context, this.outside(), 0, intensity);

        context.save();
        context.fillStyle = `rgba(255, 255, 255, ${intensity})`;
        context.font = PAGE_FONT;
        context.textAlign = this.pageAlign;
        context.textBaseline = this.pageBaseline;
        context.fillText(this.pageSize, this.pageX, this.pageY);
        context.restore();
    }

    fill(context, triangle, colour, intensity) {
        context.save();
        context.fillStyle = `rgba(${colour}, ${colour}, ${colour}, ${intensity})`;
        context.beginPath();
        context.moveTo(triangle[0].x, triangle[0].y);
        context.lineTo(triangle[1].x, triangle[1].y);
        context.lineTo(triangle[2].x, triangle[2].y);
        context.closePath();
        context.fill();
        context.restore();
    }
}

class BoxUp extends BaseBox{
    constructor(parent, spec, pageSize) {
        super(parent, spec, pageSize);
    }

    diagonal(context) {
        this.diagonalDraw(context,
            this.topLeftX, this.topLeftY + this.deltaY,
            this.topLeftX + this.deltaX, this.topLeftY);
    }

    inTop(point) {
        let result = false;
        if (this.inBox(point))
        {
            let dx = point.x - this.topLeftX;
            let dy = point.y - this.topLeftY;
            let target = this.deltaY - dx * (this.deltaY / this.deltaX)

            $("#debug1").html("UP dx " + dx + " dy " + dy + " target " + target);

            result = dy <= target;
        }

        return result;
    }

}

class BoxDown extends BaseBox{
    constructor(parent, spec, pageSize) {
        super(parent, spec, pageSize);
    }

    diagonal(context) {
        this.diagonalDraw(context,
            this.topLeftX, this.topLeftY,
            this.topLeftX + this.deltaX, this.topLeftY + this.deltaY);
    }

    inTop(point) {
        let result = false;
        if (this.inBox(point))
        {
            let dx = point.x - this.topLeftX;
            let dy = point.y - this.topLeftY;
            let dydx = dy / dx;;
            let ratio = this.deltaY / this.deltaX;

            $("#debug1").html("Down dx " + dx + " dy " + dy + " dydx " + dydx + " ratio " + ratio);
            result = dydx <= ratio;
        }

        return result;
    }
}

class BoxUpInside extends BoxUp{
    constructor(parent, spec, pageSize) {
        super(parent, spec, pageSize);
        this.pageX = this.topLeftX + this.deltaX - parent.pageHorizontal;
        this.pageY = this.topLeftY + this.deltaY - parent.pageVertical;
        this.pageAlign = "end";
        this.pageBaseline = "bottom"
    }

    inInside(point) {
        return this.inTop(point);
    }

    inOutside(point) {
        return this.inBottom(point);
    }

    outside() {
        return [
            {x: this.topLeftX + this.deltaX, y: this.topLeftY},
            {x: this.topLeftX, y: this.topLeftY + this.deltaY},
            {x: this.topLeftX + this.deltaX, y: this.topLeftY + this.deltaY},
        ]
    }

    inside() {
        return [
            {x: this.topLeftX, y: this.topLeftY},
            {x: this.topLeftX, y: this.topLeftY + this.deltaY},
            {x: this.topLeftX + this.deltaX, y: this.topLeftY},
        ]
    }


}

class BoxDownInside extends BoxDown{
    constructor(parent, spec, pageSize) {
        super(parent, spec, pageSize);
        this.pageX = this.topLeftX + parent.pageHorizontal;
        this.pageY = this.topLeftY + this.deltaY - parent.pageVertical;
        this.pageAlign = "start";
        this.pageBaseline = "bottom";
    }

    inInside(point) {
        return this.inTop(point);
    }

    inOutside(point) {
        return this.inBottom(point);
    }

    inside() {
        return [
            {x: this.topLeftX, y: this.topLeftY},
            {x: this.topLeftX + this.deltaX, y: this.topLeftY + this.deltaY},
            {x: this.topLeftX + this.deltaX, y: this.topLeftY},
        ]
    }

    outside() {
        return [
            {x: this.topLeftX, y: this.topLeftY},
            {x: this.topLeftX, y: this.topLeftY + this.deltaY},
            {x: this.topLeftX + this.deltaX, y: this.topLeftY + this.deltaY},
        ]
    }

}

class BoxUpOutside extends BoxUp{
    constructor(parent, spec, pageSize) {
        super(parent, spec, pageSize);
        this.pageX = this.topLeftX + parent.pageHorizontal;
        this.pageY = this.topLeftY + parent.pageVertical;
        this.pageAlign = "start";
        this.pageBaseline = "top"
    }

    inInside(point) {
        return this.inBottom(point);
    }

    inOutside(point) {
        return this.inTop(point);
    }

    inside() {
        return [
            {x: this.topLeftX + this.deltaX, y: this.topLeftY},
            {x: this.topLeftX, y: this.topLeftY + this.deltaY},
            {x: this.topLeftX + this.deltaX, y: this.topLeftY + this.deltaY},
        ]
    }

    outside() {
        return [
            {x: this.topLeftX, y: this.topLeftY},
            {x: this.topLeftX, y: this.topLeftY + this.deltaY},
            {x: this.topLeftX + this.deltaX, y: this.topLeftY},
        ]
    }
}

class BoxDownOutside extends BoxDown{
    constructor(parent, spec, pageSize) {
        super(parent, spec, pageSize);
        this.pageX = this.topLeftX + this.deltaX - parent.pageHorizontal;
        this.pageY = this.topLeftY + parent.pageVertical;
        this.pageAlign = "end";
        this.pageBaseline = "top"
    }

    inInside(point) {
        return this.inBottom(point);
    }

    inOutside(point) {
        return this.inTop(point);
    }

    inside() {
        return [
            {x: this.topLeftX, y: this.topLeftY},
            {x: this.topLeftX, y: this.topLeftY + this.deltaY},
            {x: this.topLeftX + this.deltaX, y: this.topLeftY + this.deltaY},
        ]
    }

    outside() {
        return [
            {x: this.topLeftX, y: this.topLeftY},
            {x: this.topLeftX + this.deltaX, y: this.topLeftY + this.deltaY},
            {x: this.topLeftX + this.deltaX, y: this.topLeftY},
        ]
    }
}

class BoxWithText extends BoxUpOutside {
    constructor(parent, spec, pageSize) {
        super(parent, spec, pageSize);
    }

    drawBlackText(context, blackShow) {
        let text = [
            "Semantics",
            "Syntactics",
            "Pragmatics",
            "Discipline",
            "Appropriateness",
            "Ambiguity",
        ];

        this.drawText(context, this.parent.blackTextX, this.parent.blackTextY, 255, text, blackShow);
    }

    drawGreyText(context, greyShow) {
        let text = [
            "Design is One",
            "Visual Power",
            "Intellectual Elegance",
            "Timelessness",
            "Responsibility",
            "Equity",
        ];

        this.drawText(context, this.parent.greyTextX, this.parent.greyTextY, GREY_TEXT_COLOUR, text, greyShow);
    }


    drawText(context, x, y, colour, text, intensity) {
        context.save();
        context.fillStyle = `rgba(${colour}, ${colour}, ${colour}, ${intensity})`;
        context.font = TEXT_FONT;

        text.forEach(line => {
            context.fillText(line, x, y);
            y += this.parent.textHeight;
        });

        context.restore();
    }

}

let specList = [
    {topLeft:{x:0, y:0}, delta:{x:720, y:1020}},
    {topLeft:{x:720, y:0}, delta:{x:720, y:510}},
    {topLeft:{x:1080, y:510}, delta:{x:360, y:510}},
    {topLeft:{x:720, y:765}, delta:{x:360, y:255}},
    {topLeft:{x:720, y:510}, delta:{x:180, y:255}},
    {topLeft:{x:900, y:510}, delta:{x:180, y:127.5}},
    {topLeft:{x:990, y:637.5}, delta:{x:90, y:127.5}},
    {topLeft:{x:900, y:701.25}, delta:{x:90, y:63.75}},
    {topLeft:{x:900, y:637.5}, delta:{x:90, y:63.75}},
];

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

let boxContainer = makeSpirals();
let action = drawSpirals;

$(window).resize(event => {
    boxContainer = makeSpirals();
});

let tick = 0;

let reset = () => {
    setInterval (() => {
        let context = canvas.getContext("2d");
        context.clearRect(0, 0, canvas.width, canvas.height);
        action(context);
    }, INTERVAL);
}

reset();
