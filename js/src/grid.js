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


class RGBA {
    constructor(red, green, blue, alpha = 1.0)
    {
        this.red = red;
        this.green = green;
        this.blue = blue;
        this.alpha = alpha;
    }

    rgba() {
        return `rgba(${clip(this.red)}, ${clip(this.green)}, ${clip(this.blue)}, ${this.alpha})`;
    }
    equals(other) {
        return other
            && this.red === other.red
            && this.green === other.green
            && this.blue === other.blue
            && this.alpha === other.alpha;
    }
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
    constructor(foreground, grid) {
        this.foreground = foreground;
        this.change(grid);

        this.mousePosition = undefined;
        this.downPosition = undefined;
        this.mouseDown = false;
        this.mouseUp = false;
        this.downTime = 0;
        this.upTime = 0;
        this.time = 0;

        this.foreground.mousemove(event => {
            this.mousePosition = this.saveMouse(event);
        });

        this.foreground.mouseleave(event => {
            this.mousePosition = undefined;
            this.downPosition = undefined;
            this.mouseDown = false;
            this.mouseUp = false;
        });

        this.foreground.mousedown(event => {
            this.downTime = 0;
            this.upTime = 0;
            this.mouseDown = true;
            this.mouseUp = false;
            this.downPosition = this.saveMouse(event);
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
            this.downtime++;
        }

        if (this.mouseUp) {
            this.upTime++;
        }
    }

    saveMouse(event) {
        let location = this.foreground.offset();
        let x = event.pageX - location.left;
        let y = event.pageY - location.top;
        return new Index(
            Math.floor(Math.max(y - this.offset, 0) / this.elementHeight),
            Math.floor(Math.max(x - this.offset, 0) / this.elementWidth)
        )
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

class Grid {
    constructor(spec, canvas, foreground) {
        this.spec = spec;
        this.borderColour = spec.borderColour;
        this.borderWidth = spec.borderWidth(canvas.width(), canvas.height());
        this.size = spec.size(canvas.width(), canvas.height(), this.borderWidth);

        let colourArray = [];
        for (let row = 0 ; row < this.size.row ; row++) {
            colourArray[row] = [];

            for (let column = 0; column < this.size.column; column++) {
                colourArray[row][column] = undefined;
            }
        }

        this.colourArray = colourArray;

        this.ctx = canvas[0].getContext("2d");

        this.width = canvas.width();
        this.height = canvas.height();

        this.ctx.canvas.width = this.width;
        this.ctx.canvas.height = this.height;

        this.ctx.strokeStyle = spec.borderColour.rgba();
        this.ctx.lineWidth = this.borderWidth;
        this.offset = this.borderWidth / 2;

        this.elementWidth = (this.width - this.borderWidth) / this.size.column;
        this.elementHeight = (this.height - this.borderWidth) / this.size.row;
    }

    show(inputs) {
        for (var row = 0 ; row < this.size.row ; row++) {
            for (var column = 0 ; column < this.size.column ; column++) {
                let here = new Index(row, column);
                let oldColour = this.colourArray[row][column];

                let newColour = setColour(oldColour, here, this.size, inputs);

                if (!newColour.equals(oldColour)) {
                    this.colourArray[row][column] = newColour;

                    this.ctx.fillStyle = newColour.rgba();
                    this.makeRectangle(this.ctx,
                        Math.floor(this.offset + column * this.elementWidth),
                        Math.floor(this.offset + row * this.elementHeight),
                        Math.floor(this.offset + (column + 1) * this.elementWidth),
                        Math.floor(this.offset + (row + 1) * this.elementHeight));

                    this.ctx.fill();
                    if (this.borderWidth > 0) {
                        this.ctx.stroke();
                    }
                }

            }
        }
    }

    makeRectangle(ctx, startX, startY, endX, endY) {
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(startX, endY);
        ctx.lineTo(endX, endY);
        ctx.lineTo(endX, startY);
        ctx.closePath();
    }

    changed(spec, canvas) {
        let newBorder = spec.borderWidth(canvas.width(), canvas.height());
        let newSize = spec.size(canvas.width(), canvas.height(), newBorder);

        return (
            !this.size.equals(newSize) ||
            this.borderWidth != spec.borderWidth ||
            !this.borderColour.equals(spec.borderColour));
    }
}


function action(specArray, canvas, foreground) {
    let spec = getSpec(specArray, canvas);
    let grid = new Grid(spec, canvas, foreground);
    let inputs = new Inputs(foreground, grid);
    grid.show(inputs);


    setInterval(function() {
        let spec = getSpec(specArray, canvas);

        if (grid.changed(spec, canvas)) {
            grid = new Grid(spec, canvas, foreground);
            inputs.change(grid);
        }

        grid.show(inputs);

        inputs.clock();
    }, 50);
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
