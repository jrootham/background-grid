/**
 * trackTriangles.js
 *
 * Created by jrootham on 14/08/15.
 *
 * Copyright © 2014 Jim Rootham
 */

const EPSILON = 0.000001;
const INTERVAL = 20;

const MAX_X = 1440;
const MAX_Y = 1020;
const RATIO = MAX_X / MAX_Y;
//
const DASH_COLOUR = "#a6eaff";
const DASH_DASH = 5;
const DASH_EMPTY = 5;

const PAGE_VERTICAL = 8;
const PAGE_HORIZONTAL = 8;
const PAGE_FONT = "3em HelveticaNeue-Light";
const PAGE_FONT_COLOUR = 110;

const TEXT_FONT = "2em HelveticaNeue-Bold";
const TEXT_HEIGHT = 36;
const BLACK_TEXT_X = 10;
const BLACK_TEXT_Y = 100;

const CROSS_FADE_TIME = 1.0;
const CROSS_FADE_DELTA = (INTERVAL / 1000)  / CROSS_FADE_TIME;

let LINE_WEIGHT = 0.5;

let intervalId = undefined;

let twoD = document.getElementById("two_d");
let threeD = document.getElementById("three_d");

let lower = current => Math.max(0, current - CROSS_FADE_DELTA);

let raise = current => Math.min(1.0, current + CROSS_FADE_DELTA);

let boxContainer = undefined;

let start = action => {
    if (intervalId) {
        clearInterval(intervalId);
    }

    intervalId = setInterval (() => {
        let context = canvas.getContext("2d");
        canvas.width = $("#background").width();
        canvas.height = $("#background").height();

        context.clearRect(0, 0, canvas.width, canvas.height);

        context.save();
        let scale = canvas.width / MAX_X;
        context.scale(scale, scale);
        action(context);
        context.restore();
    }, INTERVAL);
}


let doSpirals = () => {
    $("#spirals").hide();
    $("#boxes").show();
    boxContainer = makeSpirals();
    start(drawSpirals);
}

let doBoxes = () => {
    $("#spirals").show();
    $("#boxes").hide();
    boxContainer = makeBoxes();
    start(drawBoxes);
}

$("#spirals").click(event => {
    doSpirals();
});

$("#boxes").click(event => {
    doBoxes();
});

let canvas = document.getElementById("drawing");

let makeSpirals = () => {
    return new BoxContainer(specList);
}

let makeBoxes = () => {
    return new PlainBoxContainer(specList);
}

let drawSpirals = context => {
    boxContainer.changeState(inputs.mousePosition);
    boxContainer.draw(context);
}

let drawBoxes = context => {
    boxContainer.changeState(inputs.mousePosition);
    boxContainer.draw(context);
}

class PlainBoxContainer {
    constructor(specList) {
        this.twoD = twoD;
        this.threeD = threeD;

        this.boxList = [
            new BoxBox(this, specList[0]),
            new BoxBox(this, specList[1]),
            new BoxBox(this, specList[2]),
            new BoxBox(this, specList[3]),
            new BoxBox(this, specList[4]),
            new BoxBox(this, specList[5]),
            new BoxBox(this, specList[6]),
            new BoxBox(this, specList[7]),
            new NullBox(this, specList[8])
        ];
    }

    changeState(mousePosition) {
        this.boxList.forEach(box => {
            box.here = false;
        });

        if (mousePosition) {
            this.boxList.forEach(box => {
                if (box.inBox(mousePosition)) {
                    box.here = true;
                }
            });
        }
    }

    draw(context) {
        context.drawImage(parent.twoD, 0, 0, MAX_X, MAX_Y);

        if (this.boxList.every(box => ! box.here))
        {
            this.boxList.forEach(box => box.show2D = 1.0);
        }

        this.boxList.forEach(box => box.draw(context));
    }
}

class PlainBox {
    constructor(parent, spec) {
        this.parent = parent;

        this.topLeftX = spec.topLeft.x;
        this.topLeftY = spec.topLeft.y;
        this.deltaX = spec.delta.x;
        this.deltaY = spec.delta.y;
    }

    inBox(point) {
        return point.x >= this.topLeftX
            && point.x <= this.topLeftX + this.deltaX
            && point.y >= this.topLeftY
            && point.y <= this.topLeftY + this.deltaY;
    }
}

class NullBox extends PlainBox {
    constructor(parent, spec) {
        super(parent, spec);

        this.here = false;
    }

    draw(context) {}
}

class BoxBox extends NullBox {
    constructor(parent, spec) {
        super(parent, spec);

        this.show2D = 1.0;
    }

    setClip(context) {
        context.beginPath();
        context.moveTo(this.topLeftX, this.topLeftY);
        context.lineTo(this.topLeftX + this.deltaX, this.topLeftY);
        context.lineTo(this.topLeftX + this.deltaX, this.topLeftY + this.deltaY);
        context.lineTo(this.topLeftX, this.topLeftY + this.deltaY);
        context.closePath();
        context.clip();
    }

    draw(context) {
        if (this.show2D >= 1) {
            if (this.here) {
                this.show2D = lower(this.show2D);
            }
        }
        else {
            this.show2D = lower(this.show2D);
        }

        context.save();
        this.setClip(context);
        context.clearRect(0, 0, MAX_X, MAX_Y);

        context.save();
        context.globalAlpha = this.show2D;
        context.drawImage(parent.twoD, 0, 0, MAX_X, MAX_Y);
        context.restore();

        context.save();
        context.globalAlpha = 1.0 - this.show2D;
        context.drawImage(parent.threeD, 0, 0, MAX_X, MAX_Y);
        context.restore();

        context.restore();
    }
}

class BoxContainer {
    constructor(specList) {
        this.state = 0;
        this.stateList = [
            this.drawEmpty,
            this.second,
            this.third,
        ];

        this.blackTextX = BLACK_TEXT_X;
        this.blackTextY = BLACK_TEXT_Y;
        this.textHeight = TEXT_HEIGHT;

        this.blackShow = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        this.blackTextShow = 0;

        this.boxList = [
            new BoxTop(this, specList[0], "A1"),
            new BoxTopRight(this, specList[1], "A2"),
            new BoxRight(this, specList[2], "A3"),
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
        this.drawBlackText(context);
    }

    changeState(mousePosition) {
        switch (this.state) {
            case 0:                    // Showing empty
                if (mousePosition != undefined) {
                    let found = this.boxList.find(box => {
                        return box.inOutside(mousePosition)
                    });

                    if (found) {
                        this.state++;
                    }
                }
                break;

            case 1:                    // Draswing black spiral
                if (this.blackShow.every(show => show >= 1)) {
                    this.state++;
                }
                break;

            case 2:                    // Drawing black text
        }
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

    drawBlackText(context, blackShow)
    {
        this.blackTextShow = raise(this.blackTextShow);
        this.boxList[0].drawBlackText(context, this.blackTextShow);
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

    drawFinal(context) {
        context.save();
        context.strokeStyle = "black";
        context.lineWidth = LINE_WEIGHT;

        context.beginPath();
        context.moveTo(this.topLeftX, this.topLeftY);
        context.lineTo(this.topLeftX, this.topLeftY + this.deltaY);
        context.lineTo(this.topLeftX + this.deltaX, this.topLeftY + this.deltaY);
        context.stroke();

        context.restore();
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
        this.drawFinal(context);
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
        context.setLineDash([DASH_DASH, DASH_EMPTY]);
        context.strokeStyle = DASH_COLOUR;
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
        context.fillStyle = `rgba(${PAGE_FONT_COLOUR}, ${PAGE_FONT_COLOUR}, ${PAGE_FONT_COLOUR}, ${intensity})`;
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

            result = dydx <= ratio;
        }

        return result;
    }
}

class BoxUpInside extends BoxUp{
    constructor(parent, spec, pageSize) {
        super(parent, spec, pageSize);
        this.pageX = this.topLeftX + this.deltaX - PAGE_HORIZONTAL;
        this.pageY = this.topLeftY + this.deltaY - PAGE_VERTICAL;
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
        this.pageX = this.topLeftX + PAGE_HORIZONTAL;
        this.pageY = this.topLeftY + this.deltaY - PAGE_VERTICAL;
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
        this.pageX = this.topLeftX + PAGE_HORIZONTAL;
        this.pageY = this.topLeftY + PAGE_VERTICAL;
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
        this.pageX = this.topLeftX + this.deltaX - PAGE_HORIZONTAL;
        this.pageY = this.topLeftY + PAGE_VERTICAL;
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
            "The Vignelli Canon",
            "",
            "Semantics",
            "Syntactics",
            "Pragmatics",
            "Discipline",
            "Appropriateness",
            "Ambiguity",
            "Design is One",
            "Visual Power",
            "Intellectual Elegance",
            "Timelessness",
            "Responsibility",
            "Equity",
            "Grid",
            "Space",
            "Type",
            "Scale",
            "Layout",
            "Sequence",
            "Texture",
            "Color"
        ];

        this.drawText(context, BLACK_TEXT_X, BLACK_TEXT_Y, 255, text, blackShow);
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

class BoxTop extends BoxWithText {
    constructor(parent, spec, pageSize) {
        super(parent, spec, pageSize);
    }

    drawFinal(context) {
        context.save();
        context.strokeStyle = "black";
        context.lineWidth = LINE_WEIGHT;

        context.beginPath();
        context.moveTo(this.topLeftX + this.deltaX, this.topLeftY);
        context.lineTo(this.topLeftX, this.topLeftY);
        context.lineTo(this.topLeftX, this.topLeftY + this.deltaY);
        context.lineTo(this.topLeftX + this.deltaX, this.topLeftY + this.deltaY);
        context.stroke();

        context.restore();
    }

}

class BoxTopRight extends BoxDownOutside {
    constructor(parent, spec, pageSize) {
        super(parent, spec, pageSize);
    }

    drawFinal(context) {
        context.save();
        context.strokeStyle = "black";
        context.lineWidth = LINE_WEIGHT;

        context.beginPath();
        context.moveTo(this.topLeftX + this.deltaX, this.topLeftY);
        context.lineTo(this.topLeftX, this.topLeftY);
        context.lineTo(this.topLeftX, this.topLeftY + this.deltaY);
        context.lineTo(this.topLeftX + this.deltaX, this.topLeftY + this.deltaY);
        context.closePath();
        context.stroke();

        context.restore();
    }

}

class BoxRight extends BoxUpInside {
    constructor(parent, spec, pageSize) {
        super(parent, spec, pageSize);
    }

    drawFinal(context) {
        context.save();
        context.strokeStyle = "black";
        context.lineWidth = LINE_WEIGHT;

        context.beginPath();
        context.moveTo(this.topLeftX, this.topLeftY);
        context.lineTo(this.topLeftX, this.topLeftY + this.deltaY);
        context.lineTo(this.topLeftX + this.deltaX, this.topLeftY + this.deltaY);
        context.lineTo(this.topLeftX + this.deltaX, this.topLeftY);
        context.stroke();

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
        this.scale = foreground.width() / MAX_X;

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
        let x = (event.pageX - location.left) / this.scale;
        let y = (event.pageY - location.top) / this.scale;

        return {x: x, y: y};
    }
}

let inputs = new Inputs($("#foreground"));

$(window).resize(event => {
    doSpirals();
});

doSpirals();

