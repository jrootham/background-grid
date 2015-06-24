# background-grid
Draw an interactive grid on the background of a web page.

### Structure
##### Background
To use this as a background the div containing the canvas object has the lowest z-order.
The transparent div the mouse events are attached to has the highest z-order. These divs must be int the same place and have the same size.

##### Cover
To use this as a cover that becomes transparent and shows the contents when being moused over or clicked on, the contents has the lowest z-order, the transparent div the mouse events are attached to has the highest z-order, and the the background that is to become partially transparent has a z-order between them. Remember to make the background of both the div and the canvas transparent.

### Spec Object

The spec object is a javascript object that is an array of objects of the following form.

    {
        condition: ,
        spec: {
            size: constantSize(10, 20),
            borderWidth: constantBorder(1),
            borderColour: new RGBA(128, 128, 128),
            setColour: setColour
        }
    }

### Convenience Functions

