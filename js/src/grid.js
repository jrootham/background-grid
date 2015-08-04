/**
 * grid.js
 *
 * Created by jrootham on 13/06/15.
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

function clip(number) {
    return Math.min(255, Math.max( 0, Math.floor(number)));
}


function RGBA(red = 255, green = 255, blue = 255, alpha = 1.0)
{
    return {
        red: red,
        green: green,
        blue: blue,
        alpha: alpha
    }
}

function RgbaAssign(to, from) {
    to.red = from.red;
    to.green = from.green;
    to.blue = from.blue;
    to.alpha = from.alpha;
}

function rgba(colour) {
    return `rgba(${clip(colour.red)}, ${clip(colour.green)}, ${clip(colour.blue)}, ${colour.alpha})`;
}

function RgbaEquals(me, other) {
    return other
        && me.red === other.red
        && me.green === other.green
        && me.blue === other.blue
        && me.alpha === other.alpha;
}

class Index {
    constructor(row, column) {
        this.row = row;
        this.column = column;
    }

    distance(other) {
        let dx = this.column - other.column;
        let dy = this.row - other.row;

        return Math.sqrt(dx * dx + dy * dy);
    }

    assign(other) {
        this.row = other.row;
        this.column = other.column;
    }

    scale(factor) {
        return new Index(this.row * factor, this.column * factor);
    }

    delta(increment) {
        return new Index(this.row + increment, this.column + increment);
    }

    clip(limit) {
        return new Index(this.clipNumber(this.row, limit), this.clipNumber(this.column, limit));
    }

    clipNumber(value, limit) {
        let result = value;
        if (value > 0) {
            result = Math.min(value, limit);
        }
        else {
            result = Math.max(value, -limit);
        }

        return result;
    }

    add(other) {
        return new Index(this.row + other.row, this.column + other.column);
    }

    subtract(other) {
        return new Index(this.row - other.row, this.column - other.column);
    }

    max(n) {
        return new Index(Math.max(n, this.row), Math.max(n, this.column));
    }

    min(n) {
        return new Index(Math.min(n, this.row), Math.min(n, this.column));
    }

    multiply(other) {
        return new Index(this.row * other.row, this.column * other.column);
    }

    divide(other) {
        return new Index(this.row / other.row, this.column / other.column);
    }

    floor() {
        return new Index(Math.floor(this.row), Math.floor(this.column));
    }

    ceiling() {
        return new Index(Math.ceil(this.row), Math.ceil(this.column));
    }

    round() {
        return new Index(Math.round(this.row), Math.round(this.column));
    }

    equals(other) {
        return this.row === other.row && this.column === other.column;
    }
}

class Inputs {
    constructor(foreground, background, parameters) {
        this.parameters = parameters;
        this.foreground = foreground;
        this.background = background;
        this.change(background);

        this.mouseActualPosition = undefined;
        this.mousePosition = undefined;
        this.downPosition = undefined;
        this.mouseDown = false;
        this.mouseUp = false;
        this.downTime = 0;
        this.upTime = 0;
        this.time = 0;

        this.foreground.mousemove(event => {
            this.mousePosition = this.saveMouse(this.background, event);
        });

        this.foreground.mouseleave(event => {
            if (this.parameters.vanish) {
                this.mousePosition = undefined;
            }
            else {
                this.mouseActualPosition = undefined;
            }
            this.downPosition = undefined;
            this.mouseDown = false;
            this.mouseUp = false;
        });

        this.foreground.mousedown(event => {
            this.downTime = 0;
            this.upTime = 0;
            this.mouseDown = true;
            this.mouseUp = false;
            this.downPosition = this.saveMouse(this.background, event);
        });

        this.foreground.mouseup(event => {
            this.mouseDown = false;
            this.mouseUp = true;
        });
    }

    change(grid) {
        this.elementWidth = grid.elementWidth;
        this.elementHeight = grid.elementHeight;
        this.offset = grid.offset;
    }

    clock() {
        this.time++;

        if (this.mouseDown) {
            this.downTime++;
        }

        if (this.mouseUp) {
            this.upTime++;
        }
    }

    saveMouse(background, event) {
        let location = this.foreground.offset();
        let x = event.pageX - location.left;
        let y = event.pageY - location.top;

        if (this.parameters.interchange) {
            return background.mapMouse(y, x);
        }
        else {
            return background.mapMouse(x, y);
        }
    }

    getMousePosition() {
        return this.mousePosition;
    }

    getDownPosition() {
        return this.downPosition;
    }

    isMouseDown(){
        return this.mouseDown;
    }

    isMouseUp() {
        return this.mouseUp;
    }

    getTimeSinceDown() {
        return this.downTime;
    }

    getTimeSinceUp() {
        return this.upTime;
    }

    getTime() {
        return this.time;
    }
}

function gradientMapMouse(x, y) {
    let result;

    if (this.prior === undefined || isNaN(this.prior.row) || isNaN(this.prior.column)) {
        result = new Index(y, x);
    }
    else {
        result = new Index(
            clipMouse(y, this.prior.row, this.spec.clip),
            clipMouse(x, this.prior.column, this.spec.clip));
    }

    this.prior = result;
    return result;
}


let clipMouse = (now, prior, clip) =>{
    if (clip != undefined) {
        if (now < prior) {
            return prior - Math.min(prior - now, clip);
        }
        else {
            return prior + Math.min(now - prior, clip)
        }
    }
    else {
        return now;
    }
}


class Background {
    constructor(spec, canvas, foreground) {
        this.spec = spec;
        this.borderColour = spec.borderColour;
        this.borderWidth = spec.borderWidth(canvas.width(), canvas.height());
        this.size = spec.size(canvas.width(), canvas.height(), this.borderWidth);

        this.colourArray = this.makeColourArray();

        this.ctx = canvas[0].getContext("2d");

        this.width = canvas.width();
        this.height = canvas.height();

        this.ctx.canvas.width = this.width;
        this.ctx.canvas.height = this.height;

        this.ctx.strokeStyle = rgba(spec.borderColour);
        this.ctx.lineWidth = this.borderWidth;
        this.offset = this.borderWidth / 2;
        this.makeElementSizes();
    }

    changed(spec, canvas) {
        let newBorder = spec.borderWidth(canvas.width(), canvas.height());
        let newSize = spec.size(canvas.width(), canvas.height(), newBorder);

        return (
            !this.size.equals(newSize) ||
            this.borderWidth != newBorder ||
            !this.borderColour.equals(spec.borderColour));
    }

    mapMouse(x, y) {
        return new Index(
            Math.floor(Math.max(y - this.offset, 0) / this.elementHeight),
            Math.floor(Math.max(x - this.offset, 0) / this.elementWidth)
        )
    }
}

class Gradient extends Background {
    constructor(spec, canvas, foreground) {
        super(spec, canvas, foreground);
        this.prior = undefined;
        this.canvasSize = new Index(this.width, this.height);
    }

    makeElementSizes() {
        this.elementWidth = 1;
        this.elementHeight = 1;
    }

    makeColourArray() {
        let cell = [RGBA(255, 255, 255, 0.0)];
        let colourArray = [cell];

        return colourArray;
    }

    show(inputs) {
        let newColour = RGBA(255, 255, 255, 1.0);

        let here = new Index(0, 0);
        let oldColour = this.colourArray[0][0];

        let newGradient = this.spec.setColour(this.ctx, this.canvasSize, this.current, this.target, inputs);

        if (newGradient != undefined) {
            this.ctx.fillStyle = newGradient;
        }
        else {
            this.ctx.fillStyle = rgba(newColour);
        }

        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.fillRect(0, 0, this.width, this.height);

        if (this.borderWidth > 0) {
            this.ctx.strokeRect(0, 0, this.width, this.height);
        }
    }

}

class Grid extends Background {
    constructor(spec, canvas, foreground) {
        super(spec, canvas, foreground);
    }

    makeElementSizes() {
        this.elementWidth = (this.width - this.borderWidth) / this.size.column;
        this.elementHeight = (this.height - this.borderWidth) / this.size.row;
    }

    makeColourArray() {
        let colourArray = [];
        for (let row = 0 ; row < this.size.row ; row++) {
            colourArray[row] = [];

            for (let column = 0; column < this.size.column; column++) {
                colourArray[row][column] = RGBA(255, 255, 255, 0.0);
                ;
            }
        }

        return colourArray;
    }

    show(inputs) {
        let newColour = RGBA(255, 255, 255, 1.0);

        for (var row = 0 ; row < this.colourArray.length ; row++) {
            for (var column = 0 ; column < this.colourArray[row].length ; column++) {
                let here = new Index(row, column);
                let oldColour = this.colourArray[row][column];

                this.spec.setColour(oldColour, here, this.size, inputs, newColour);
                if (!RgbaEquals(newColour, oldColour)) {
                    RgbaAssign(this.colourArray[row][column], newColour);
                    this.draw(column, row, newColour);
                }
            }
        }
    }

    draw(column, row, newColour) {
        this.ctx.fillStyle = rgba(newColour);
        let rect = this.makeRectangle(this.ctx,
            Math.floor(this.offset + column * this.elementWidth),
            Math.floor(this.offset + row * this.elementHeight),
            Math.floor(this.offset + (column + 1) * this.elementWidth),
            Math.floor(this.offset + (row + 1) * this.elementHeight));

        this.ctx.clearRect(rect.x, rect.y, rect.w, rect.h);
        this.ctx.fill();
        if (this.borderWidth > 0) {
            this.ctx.stroke();
        }
    }


    // makeRectangle both returns and has side effects

    makeRectangle(ctx, startX, startY, endX, endY) {
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(startX, endY);
        ctx.lineTo(endX, endY);
        ctx.lineTo(endX, startY);
        ctx.closePath();

        return {
            x : startX,
            y : startY,
            w : endX - startX,
            h : endY - startY
        }
    }
}

class Triangle extends Background {
    constructor(spec, canvas, foreground) {
        super(spec, canvas, foreground);
    }

    makeElementSizes() {
        this.elementHeight = (this.height - this.borderWidth) / this.size.row;
        this.elementWidth = (this.width - this.borderWidth) / this.size.column;
    }

    makeColourArray() {
        let colourArray = [];
        for (let row = 0 ; row < this.size.row ; row++) {
            colourArray[row] = [];

            for (let column = 0; column < 2 * this.size.column ; column++) {
                colourArray[row][column] = RGBA(255, 255, 255, 0.0);
            }
        }

        return colourArray;
    }

    show(inputs) {
        let newColour = RGBA(255, 255, 255, 1.0);

        for (var row = 0 ; row < this.colourArray.length ; row++) {
            for (var column = 0 ; column < this.size.column * 2 ; column++) {
                let here = new Index(row, column);
                let oldColour = this.colourArray[row][column];

                this.spec.setColour(oldColour, here, this.size, inputs, newColour);
                if (!RgbaEquals(newColour, oldColour)) {
                    RgbaAssign(this.colourArray[row][column], newColour);
                    this.draw(column, row, newColour);
                }
            }
        }
    }

    draw(column, row, newColour) {
        this.ctx.fillStyle = rgba(newColour);

        let position = (column - column % 2) / 2;

        let left = Math.floor(this.offset + (position * this.elementWidth));
        let right = Math.floor(this.offset + (position + 1) * this.elementWidth);
        let top = Math.floor(this.offset + row * this.elementHeight);
        let bottom = Math.floor(this.offset + (row + 1) * this.elementHeight);

        if (column % 2 === 0) {
            let triangle = this.makeTriangle(this.ctx, left, top, right, bottom);
        }
        else {
            let triangle = this.makeTriangle(this.ctx, right, bottom, left, top);
        }

//        this.ctx.clearRect(rect.x, rect.y, rect.w, rect.h);
        this.ctx.fill();
        if (this.borderWidth > 0) {
            this.ctx.stroke();
        }
    }


    // makeTriangle both returns and has side effects

    makeTriangle(ctx, startX, startY, endX, endY) {
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(startX, endY);
        ctx.lineTo(endX, startY);
        ctx.closePath();

        return {
            x : startX,
            y : startY,
            w : endX - startX,
            h : endY - startY
        }
    }

    mapMouse(x, y) {
        let row = Math.floor(Math.max(y - this.offset, 0) / this.elementHeight);
        let position = Math.floor(Math.max(x - this.offset, 0) / this.elementWidth);
        let dy = y - row * this.elementHeight;
        let dx = x - position * this.elementWidth;

        let point = (-this.elementHeight / this.elementWidth) * dx + this.elementHeight;
        let column = position * 2 + (dy > point ? 1 : 0);
        return new Index(row, column);
    }

}

function action(specArray, canvas, foreground, interval, parameters, shape = Grid) {
    let spec = getSpec(specArray, canvas);
    let background = new shape(spec, canvas, foreground);
    let inputs = new Inputs(foreground, background, parameters);
    background.show(inputs);

    $(window).resize(event => {
        spec= getSpec(specArray, canvas);
        background = new shape(spec, canvas, foreground);
        inputs.change(background);
    });

    setInterval(function() {
        background.show(inputs);
        inputs.clock();
    }, interval);
}

function getSpec(specArray, canvas) {
    var found = specArray.find(function (search) {
        return search.condition(canvas.width(), canvas.height())
    });

    return found.spec;
}

/*
 *      Convenience functions
 */

var always = (parentWidth, parentHeight) => true;

var constantSize = (rows, columns) => {
    return (parentWidth, parentHeight, border) => new Index(rows, columns);
}

var constantElementSize = (elementWidth, elementHeight) => {
    return (parentWidth, parentHeight, border) => {
        let columns = Math.floor((parentWidth - 2 *  border) / (elementWidth + border));
        let rows = Math.floor((parentHeight - border) / (elementHeight + border));
        return new Index(rows, columns);
    }
}

var constantBorder = (size) => {
    return (parentWidth, parentHeight) => size;
}

var widthPercentageBorder = (percent) => {
    return (parentWidth, parentHeight) => parentWidth * (percent / 100);
}

var heightPercentageBorder = (percent) => {
    return (parentWidth, parentHeight) => parentHeight * (percent / 100);
}
