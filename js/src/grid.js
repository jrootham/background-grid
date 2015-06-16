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

function numbers(count) {
    var list = [];
    for (var i = 0; i <= count; i++) {
        list.push(i);
    }

    return list;
}

function tohex(number) {
    var result = Math.min(255, Math.max( 0, Math.floor(number))).toString(16);

    if (number < 16) {
        result = '0' + result;
    }

    return result;
}

function hexColour(colour) {
    return '#' + tohex(colour.red) + tohex(colour.green) + tohex(colour.blue);
}

class RGB {
    constructor(red, green, blue)
    {
        this.red = red;
        this.green = green;
        this.blue = blue;
    }

    equals(other) {
        return other && this.red === other.red && this.green === other.green && this.blue === other.blue;
    }
}

class Grid {
    constructor(spec, canvas) {
        this.rowCount = spec.rowCount;
        this.columnCount = spec.columnCount;
        this.borderWidth = spec.borderWidth;
        this.borderColour = spec.borderColour;

        let colourArray = [];
        for (let row = 0 ; row < spec.rowCount ; row++) {
            colourArray[row] = [];

            for (let column = 0; column < spec.columnCount; column++) {
                colourArray[row][column] = undefined;
            }
        }

        this.colourArray = colourArray;

        this.ctx = canvas[0].getContext("2d");

        this.width = canvas.width();
        this.height = canvas.height();

        this.ctx.canvas.width = this.width;
        this.ctx.canvas.height = this.height;

        this.ctx.strokeStyle = hexColour(spec.borderColour);
        this.ctx.lineWidth = spec.borderWidth;
        this.offset = spec.borderWidth / 2;

        this.elementWidth = (this.width - spec.borderWidth) / spec.columnCount;
        this.elementHeight = (this.height - spec.borderWidth) / spec.rowCount;
    }

    show(spec, state) {
        let mouseLocation = undefined;

        if (state.mousePosition) {
            mouseLocation = {
                column: Math.floor(Math.max(state.mousePosition.x - this.offset, 0) / this.elementWidth),
                row: Math.floor(Math.max(state.mousePosition.y - this.offset, 0) / this.elementHeight)
            }
        }

        for (var row = 0 ; row < spec.rowCount ; row++) {
            for (var column = 0 ; column < spec.columnCount ; column++) {
                let oldColour = this.colourArray[row][column];

                let newColour = setColour(oldColour, row, spec.rowCount, column, spec.columnCount,
                    state, mouseLocation);

                if (!newColour.equals(this.colourArray[row][column])) {
                    this.colourArray[row][column] = newColour;

                    this.ctx.fillStyle = hexColour(newColour);
                    makeRectangle(this.ctx,
                        Math.floor(this.offset + column * this.elementWidth),
                        Math.floor(this.offset + row * this.elementHeight),
                        Math.floor(this.offset + (column + 1) * this.elementWidth),
                        Math.floor(this.offset + (row + 1) * this.elementHeight));

                    this.ctx.fill();
                    if (spec.borderWidth > 0) {
                        this.ctx.stroke();
                    }
                }

            }

        }
    }

    changed(spec) {
        return (
            this.rowCount != spec.rowCount ||
            this.columnCount != spec.columnCount ||
            this.borderWidth != spec.borderWidth ||
            !this.borderColour.equals(spec.borderColour));
    }
}


function makeRectangle(ctx, startX, startY, endX, endY) {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(startX, endY);
    ctx.lineTo(endX, endY);
    ctx.lineTo(endX, startY);
    ctx.closePath();
}

function action(specArray, canvas, foreground) {
    let state = {
        mousePosition: undefined,
        mouseDown: false,
        mouseUp: false,
        downTime: 0,
        upTime: 0,
        time:0
    };

    let spec = getSpec(specArray, canvas);
    let grid = new Grid(spec, canvas);
    grid.show(spec, state);

    foreground.mousemove(function(event) {
        var location = canvas.offset();
        var target = {x:event.pageX - location.left, y:event.pageY - location.top};
        state.mousePosition = target;
    });

    foreground.mouseleave(function(event) {
        state.mousePosition = undefined;
        state.mouseDown = false;
        state.mouseUp = false;
    });

    foreground.mousedown(function(event) {
        state.mouseDown = true;
        state.mouseUp = false;
    });

    foreground.mouseup(function(event) {
        state.mouseDown = false;
        state.mouseUp = true;
    });

    setInterval(function() {
        let spec = getSpec(specArray, canvas);

        if (grid.changed(spec)) {
            grid = new Grid(spec, canvas);
        }

        grid.show(spec, state)

        state.time++;

        if (state.mouseDown) {
            state.downtime++;
        }

        if (state.mouseUp) {
            state.upTime++;
        }
    }, 50);
}

function getSpec(specArray, canvas) {
    var found = specArray.find(function (search) {
        return search.condition(canvas.width(), canvas.height())
    });

    return found.spec;
}