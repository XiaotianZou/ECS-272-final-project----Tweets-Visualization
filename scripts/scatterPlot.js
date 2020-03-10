var scatterPlotMargin = {top: 20, left: 20, right: 20, bottom: 20}
var scatterPlotWidth = 450
var scatterPlotHeight = 400
var scatterPlotInnerWidth, scatterPlotInnerHeight

var scatterPlotSVG = null

var xScaleScatterPlot, yScaleScatterPlot, sizeScaleScatterPlot

function initScatterPlot() {
    scatterPlotInnerHeight = scatterPlotHeight - scatterPlotMargin.top - scatterPlotMargin.bottom
    scatterPlotInnerWidth = scatterPlotWidth - scatterPlotMargin.left - scatterPlotMargin.right

    scatterPlotSVG = d3.select('#scatterPlotSVG')
        .attr('width', scatterPlotWidth)
        .attr('height', scatterPlotHeight)
        .append('g')
        .attr('transform', 'translate(' + scatterPlotMargin.left + ', ' + scatterPlotMargin.top + ')')
    xScaleScatterPlot = d3.scaleLinear().range([0, scatterPlotInnerWidth]).domain([0, 1])
    yScaleScatterPlot = d3.scaleLinear().range([scatterPlotInnerHeight, 0]).domain([0, 1])
    sizeScaleScatterPlot = d3.scaleLinear().range([0, 1]).domain([0, 1])
    xAxisScatterPlot = d3.axisBottom()
        .scale(xScaleScatterPlot)
    yAxisScatterPlot = d3.axisRight()
        .scale(yScaleScatterPlot)
}

function onChangeScatterPlot() {
    var triggerWords = []
    for(var i = 0; i < data[selectedClusterIndex]['trigger'].length; i++) {
        // console.log(data[selectedClusterIndex]['trigger'][i])
        triggerWords.push(data[selectedClusterIndex]['trigger'][i])
    }
    // console.log(triggerWords)
    var temp = {}
    for(var i = 0; i < triggerWords.length; i++) {
        temp[triggerWords[i][0]] = triggerWords[i]
    }
    triggerWords = []
    for(var key in temp) {
        triggerWords.push(temp[key])
    }
    // console.log(temp)
    console.log(triggerWords)
    scatterPlotSVG.selectAll('*').remove()
    scatterPlotSVG.select('circle')
        .data(triggerWords)
        .append('circle')
        .attr('x', function(d) {
            return xScaleScatterPlot(d[2])
        })
        .attr('y', function(d) {
            return yScaleScatterPlot(d[1])
        })
        .attr('r', function(d) {
            return sizeScaleScatterPlot(d[3])
        })
    scatterPlotSVG.append('g')
        .call(xAxisScatterPlot)
        .attr('transform', 'translate(0, ' + scatterPlotInnerHeight / 2 + ')')
    scatterPlotSVG.append('g')
        .call(yAxisScatterPlot)
        .attr('transform', 'translate(' + scatterPlotInnerWidth / 2 + ', 0)')
}