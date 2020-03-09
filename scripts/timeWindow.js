// setup canvas and shapes
var canvasPos = {x: 0, y: 0, width: 600, height: 100};

// structure: stage -- layer -- (group) -- shape
// Set up the canvas and shapes， S1 is the stage

// s1 size should be the same as the whole visulization
var s1 = new Konva.Stage({container: 'container1', width: canvasPos.width, height: canvasPos.height+200});
var layer1 = new Konva.Layer({draggable: false});
s1.add(layer1)

// draw a background rect to catch events
var r1 = new Konva.Rect({ x: 0, y: 0, width: canvasPos.width, height: canvasPos.height, fill: 'gold' })
layer1.add(r1)

// draw a rectangle to be used as the rubber area
var r2 = new Konva.Rect({ x: 0, y: 0, width: 0, height: 0, fill: 'red', opacity: 0.2, 
dash: [2, 2],
dragBoundFunc: function(pos) {
    var newX = pos.x > r1.x() ? pos.x : r1.x();
    newX = newX < r1.x() + r1.width() - r2.width() ? newX : r1.x() + r1.width() - r2.width();

    return {
      x: newX,
      y: this.absolutePosition().y
    };
}})

r2.listening(false); // stop r2 catching our mouse events.
layer1.add(r2)


s1.draw() // First draw of canvas.
var posStart;
var posNow;
var mode = '';
function startDrag(posIn) {
    posStart = { x: posIn.x, y: posIn.y };
    posNow = { x: posIn.x, y: posIn.y };
}

function clearTimeWindow() {
    r2.width(0);
    r2.height(0);
}

function updateTimeWindowLeft(posIn) {

    r2.x()
}

function updateDrag(posIn) {
    // update rubber rect position
    var xNow;
    xNow = (posIn.x < r1.x) ? r1.x : posIn.x;
    xNow = (posIn.x > r1.x + r1.width) ? (r1.x + r1.width) : posIn.x;
    posNow = { x: xNow, y: posIn.y };
    var posRect = reverse(posStart, posNow);
    r2.x(posRect.x1);
    r2.y(canvasPos.y);
    r2.width(posRect.x2 - posRect.x1);
    r2.height(canvasPos.height);
    r2.visible(true);
    r2.draggable(true);

    s1.draw(); // redraw any changes.
}

// start the rubber drawing on mouse down.

r1.on('mousedown', function (e) {
    clearTimeWindow();

    mode = 'drawing';
    startDrag({ x: e.evt.layerX, y: e.evt.layerY })

    s1.on('mousemove', function (e) {
        if (mode === 'drawing') {
            updateDrag({ x: e.evt.layerX, y: e.evt.layerY })
        }
    })
})

// update the rubber rect on mouse move - note use of 'mode' var to avoid drawing after mouse released.


// here we create the new rect using the location and dimensions of the drawing rect.
s1.on('mouseup', function (e) {
    mode = '';
    r1.onmousemove = null
    r2.visible(true);
    r2.listening(true);
    s1.draw();
})

r1.on('mouseover', function(e) {
    
})


r2.on('mouseout', function() {
    document.body.style.cursor = 'default';
    r1.listening(true);
});

r2.on('mousemove', function(e){
    if (Math.abs(e.evt.layerX - r2.x()) < 3 || Math.abs(e.evt.layerX - r2.x() - r2.width()) < 3){
        document.body.style.cursor = 'ew-resize';

    }else if (e.evt.layerX > r2.x() || e.evt.layerX < r2.x() + r2.width()){
        document.body.style.cursor = 'move';
    }
    r1.listening(false);
})

r2.on('mousedown', function(e) {
    if(Math.abs(e.evt.layerX - r2.x()) < 3){
        s1.on('mousemove', function(e){
            console.log('something')
        })

        
    }else if (Math.abs(e.evt.layerX - r2.x() - r2.width()) < 3){
        // right edge
    }
})


// reverse co-ords if user drags left / up
function reverse(r1, r2) {
    var r1x = r1.x, r1y = r1.y, r2x = r2.x, r2y = r2.y, d;
    if (r1x > r2x) {
        d = Math.abs(r1x - r2x);
        r1x = r2x; r2x = r1x + d;
    }
    if (r1y > r2y) {
        d = Math.abs(r1y - r2y);
        r1y = r2y; r2y = r1y + d;
    }
    return ({ x1: r1x, y1: r1y, x2: r2x, y2: r2y }); // return the corrected rect.     
}


// following: line chart
// var margin = { top: 50, right: 50, bottom: 50, left: 50 }
//     , width = window.innerWidth - margin.left - margin.right // Use the window's width 
//     , height = window.innerHeight - margin.top - margin.bottom; // Use the window's height

//     // The number of datapoints
// var n = 21;

// // 5. X scale will use the index of our data
// var xScale = d3.scaleLinear()
//     .domain([0, n - 1]) // input
//     .range([0, width]); // output

// // 6. Y scale will use the randomly generate number 
// var yScale = d3.scaleLinear()
//     .domain([0, 1]) // input 
//     .range([height, 0]); // output 

// // 7. d3's line generator
// var line = d3.line()
//     .x(function (d, i) { return xScale(i); }) // set the x values for the line generator
//     .y(function (d) { return yScale(d.y); }) // set the y values for the line generator 
//     .curve(d3.curveMonotoneX) // apply smoothing to the line

// // 8. An array of objects of length N. Each object has key -> value pair, the key being "y" and the value is a random number
// var dataset = d3.range(n).map(function (d) { return { "y": d3.randomUniform(1)() } })

// // 1. Add the SVG to the page and employ #2
// var svg = d3.select("body").append("svg")
//     .attr("width", width + margin.left + margin.right)
//     .attr("height", height + margin.top + margin.bottom)
//     .append("g")
//     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// // 3. Call the x axis in a group tag
// svg.append("g")
//     .attr("class", "x axis")
//     .attr("transform", "translate(0," + height + ")")
//     .call(d3.axisBottom(xScale)); // Create an axis component with d3.axisBottom

// // 4. Call the y axis in a group tag
// svg.append("g")
//     .attr("class", "y axis")
//     .call(d3.axisLeft(yScale)); // Create an axis component with d3.axisLeft

// // 9. Append the path, bind the data, and call the line generator 
// svg.append("path")
//     .datum(dataset) // 10. Binds data to the line 
//     .attr("class", "line") // Assign a class for styling 
//     .attr("d", line); // 11. Calls the line generator 

// // 12. Appends a circle for each datapoint 
// svg.selectAll(".dot")
//     .data(dataset)
//     .enter().append("circle") // Uses the enter().append() method
//     .attr("class", "dot") // Assign a class for styling
//     .attr("cx", function (d, i) { return xScale(i) })
//     .attr("cy", function (d) { return yScale(d.y) })
//     .attr("r", 5)
//     .on("mouseover", function (a, b, c) {
//         console.log(a)
//     })
//     .on("mouseout", function () { })