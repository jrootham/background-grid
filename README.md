# background-grid
Draw an interactive grid on the background of a web page.

### Structure
    <div id="parent>
        <div id="background">
            <canvas id="drawing"></canvas>
        </div>
        <div id="foreground">
        </div>
        <div id="contents>
        </div>
    </div>
    
##### Background
To use this as a background the div containing the canvas object has the lowest z-order.
The transparent div the mouse events are attached to has the highest z-order. These divs must be int the same place and have the same size.

##### Cover
To use this as a cover that becomes transparent and shows the contents when being moused over or clicked on, the contents has the lowest z-order, the transparent div the mouse events are attached to has the highest z-order, and the the background that is to become partially transparent has a z-order between them. Remember to make the background of both the div and the canvas transparent.

### Javascript
#### action function
    action(specArray, $("#drawing"), $("#foreground), interval)

argument|meaning
--------|-------
specArray|The specification object (see below)
$("#drawing")|jQuery reference to the canvas element
$("#foreground)|jQuery reference to the foreground element
interval|redraw interval in microseconds

#### Spec Object

The spec object is a javascript object that is an array of objects of the following form.

    {
        condition: conditionFn,
        spec: {
            size: sizeFn,
            borderWidth: borderWidthFn,
            borderColour: RGBA(red,blue,green)
            setColour: setColourFn
        }
    }

    conditionFn(parentWidth, parentHeight) 
argument|meaning
-------|-------
parentWidth|width (in pixels) of the parent div
parentHeight|height (in pixels) of the parent div

The spec associated with the first conditionFn to return true will be used to display the background.

    sizeFn(parentWidth, parentHeight, border)
argument|meaning
-------|-------
parentWidth|width (in pixels) of the parent div
parentHeight|height (in pixels) of the parent div
border|width of the border

Returns an Index object specifying the number of rows and columns in the grid.

    borderWidthFn(parentWidth, parentHeight) 
argument|meaning
-------|-------
parentWidth|width (in pixels) of the parent div
parentHeight|height (in pixels) of the parent div

Returns the width of the border in pixels.

borderColour is the colour of the border (see RGBA below for the meaning)

    setColourFn(previous, current, size, inputs)
    
argument|meaning
-------|-------
previous|RGBA object, the previous colour of this grid element
current|Index object, the row and column of this grid element
size|Index object, the size of the grid
inputs|Inputs object, the current inputs

### Objects

    rgba = RGBA(red,blue,green)
argument|meaning|reference
-------|-------|--
red|0-255 red component|rgba.red
green|0-255 green component|rgba.green
blue|0-blue red component|rgba.blue
alpha|0.0-1.0 transparency factor (default 1.0, opaque)|rgba.alpha



Index

a|b
-------|-------
foo|bar
### Convenience Functions

