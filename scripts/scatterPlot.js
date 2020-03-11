var scatterPlotMargin = {top: 20, left: 20, right: 20, bottom: 20}
var scatterPlotWidth = 450
var scatterPlotHeight = 400
var scatterPlotInnerWidth, scatterPlotInnerHeight
var emotionColors = ['#EF6664', '#FAA461', '#9887BB', '#31AE6D', '#FFD777', '#679FD3', '#25A6D1', '#A5CC68']

var scatterPlotSVG = null

var xScaleScatterPlot, yScaleScatterPlot, sizeScaleScatterPlot

function initScatterPlot() {
    scatterPlotInnerHeight = scatterPlotHeight - scatterPlotMargin.top - scatterPlotMargin.bottom
    scatterPlotInnerWidth = scatterPlotWidth - scatterPlotMargin.left - scatterPlotMargin.right

    d3.select('#scatterPlotSVG').selectAll('*').remove()
    scatterPlotSVG = d3.select('#scatterPlotSVG')
        .attr('width', scatterPlotWidth)
        .attr('height', scatterPlotHeight)
        .append('g')
        .attr('transform', 'translate(' + scatterPlotMargin.left + ', ' + scatterPlotMargin.top + ')')
    xScaleScatterPlot = d3.scaleLinear().range([0, scatterPlotInnerWidth]).domain([0, 10])
    yScaleScatterPlot = d3.scaleLinear().range([scatterPlotInnerHeight, 0]).domain([0, 10])
    sizeScaleScatterPlot = d3.scaleLinear().range([0, 5]).domain([0, 5])
    xAxisScatterPlot = d3.axisBottom()
        .scale(xScaleScatterPlot)
    yAxisScatterPlot = d3.axisRight()
        .scale(yScaleScatterPlot)
}

function onChangeScatterPlot() {
    // var triggerWords = []
    // console.log(data[selectedClusterIndex]['trigger'])
    // for(var i = 0; i < data[selectedClusterIndex]['trigger'].length; i++) {
    //     for(var j = 0; j < data[selectedClusterIndex]['trigger'][i].length; j++) {
    //         triggerWords.push(data[selectedClusterIndex]['trigger'][i][j])
    //     }
    // }
    // console.log(triggerWords)
    // var temp = {}
    // for(var i = 0; i < triggerWords.length; i++) {
    //     temp[triggerWords[i][0]] = triggerWords[i]
    // }
    // triggerWords = []
    // for(var key in temp) {
    //     triggerWords.push(temp[key])
    // }
    // console.log(temp)
    // console.log(triggerWords)
    scatterPlotSVG.selectAll('*').remove()
    scatterPlotSVG.selectAll('circle')
        .data(data[selectedClusterIndex]['trigger'])
        .enter()
        .append('circle')
        .attr('cx', function(d) {
            return xScaleScatterPlot(d[2])
        })
        .attr('cy', function(d) {
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