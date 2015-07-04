# background-grid
Draw an interactive grid on the background of a web page.

### Structure
##### Background
To use this as a background the div containing the canvas object has the lowest z-order.
The transparent div the mouse events are attached to has the highest z-order. These divs must be int the same place and have the same size.

##### Cover
To use this as a cover that becomes transparent and shows the contents when being moused over or clicked on, the contents has the lowest z-order, the transparent div the mouse events are attached to has the highest z-order, and the the background that is to become partially transparent has a z-order between them. Remember to make the background of both the div and the canvas transparent.

### Javascript
#### action function
    action(specArray, canvas, foreground, interval)

argument|meaning
--------|-------
specArray|The specification object (see below)
canvas|jQuery reference to the canvas object
foreground|jQuery reference to the foreground object
interval|redraw interval in microseconds

#### Spec Object

The spec object is a javascript object that is an array of objects of the following form.

    {
        condition: conditionFn,
        spec: {
            size: sizeFn,
            borderWidth: borderWidthFn,
            borderColour: borderColour,
            setColour: setColourFn
        }
    }


### Convenience Functions

