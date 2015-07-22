/**
 * gradient.js
 *
 * Created by jrootham on 18/07/15.
 *
 * Copyright © 2014 Jim Rootham
 */

var size = parseInt($('input[name="size"]:checked').val());
$('input[type=radio][name=size]').change(
    function() {
        size = parseInt(this.value);
        draw();
    });

let x = 0;
let y = 0;

let ctx = $("#drawing")[0].getContext("2d");

let linear = ctx.createLinearGradient(0, 0, 400, 400);
linear.addColorStop(0,"green");
linear.addColorStop(.5,"white");
linear.addColorStop(1,"blue");

let radial = ctx.createRadialGradient(200, 200, 0, 200, 200, 300);
// let radial = ctx.createRadialGradient(100, 100, 0, 300, 300, 300);
// let radial = ctx.createRadialGradient(50, 50, 0, 300, 300, 400);
// let radial = ctx.createRadialGradient(50, 50, 0, 300, 300, 100);
radial.addColorStop(0,"green");
radial.addColorStop(.25,"white");
radial.addColorStop(.5,"red");
radial.addColorStop(.75,"white");
radial.addColorStop(1,"blue");

$("#thing").mousemove(
    event => {
        let location = $("#thing").offset();
        x = Math.min(350, Math.max(50, event.pageX - location.left)) - 50;
        y = Math.min(350, Math.max(50, event.pageY - location.top)) - 50;
        draw();
    }
)

function draw() {
    ctx.clearRect(0, 0, 400, 400);
    if (size === 400) {
        x = 0;
        y = 0;
    }
    else {

    }
    ctx.fillStyle = radial;
//    ctx.fillStyle = linear;
//    ctx.fillStyle = "rgba(0, 0, 255, 1.0)";
    ctx.fillRect(x, y, size, size);
}

draw();
