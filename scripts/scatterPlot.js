var scatterPlotMargin = {top: 20, left: 20, right: 20, bottom: 20}
var scatterPlotWidth = 450
var scatterPlotHeight = 400
var scatterPlotInnerWidth, scatterPlotInnerHeight
var emotionColors = ['#EF6664', '#FAA461', '#9887BB', '#31AE6D', '#FFD777', '#679FD3', '#25A6D1', '#A5CC68']

var scatterPlotSVG
var scatterPlotSVGDefaultLayer = null
var scatterPlotSVGPieLayer = null

var xScaleScatterPlot, yScaleScatterPlot, sizeScaleScatterPlot

function initScatterPlot() {
    scatterPlotInnerHeight = scatterPlotHeight - scatterPlotMargin.top - scatterPlotMargin.bottom
    scatterPlotInnerWidth = scatterPlotWidth - scatterPlotMargin.left - scatterPlotMargin.right

    d3.select('#scatterPlotSVG').selectAll('*').remove()
    scatterPlotSVG = d3.select('#scatterPlotSVG')
        .attr('width', scatterPlotWidth)
        .attr('height', scatterPlotHeight)
    scatterPlotSVGDefaultLayer = scatterPlotSVG.append('g')
        .attr('transform', 'translate(' + scatterPlotMargin.left + ', ' + scatterPlotMargin.top + ')')
    xScaleScatterPlot = d3.scaleLinear().range([0, scatterPlotInnerWidth]).domain([0, 10])
    yScaleScatterPlot = d3.scaleLinear().range([scatterPlotInnerHeight, 0]).domain([0, 10])
    sizeScaleScatterPlot = d3.scaleLinear().range([0, 5]).domain([0, 5])
    colorScaleScatterPlot = d3.scaleOrdinal().range(emotionColors)
    xAxisScatterPlot = d3.axisBottom()
        .scale(xScaleScatterPlot)
    yAxisScatterPlot = d3.axisRight()
        .scale(yScaleScatterPlot)
}

function onChangeScatterPlot() {
    d3.select('#scatterPlotSVG').selectAll('*').remove()
    scatterPlotSVG = d3.select('#scatterPlotSVG')
        .attr('width', scatterPlotWidth)
        .attr('height', scatterPlotHeight)
    scatterPlotSVGDefaultLayer = scatterPlotSVG.append('g')
        .attr('transform', 'translate(' + scatterPlotMargin.left + ', ' + scatterPlotMargin.top + ')')
    // scatterPlotSVG.selectAll('circle')
    //     .data(data[selectedClusterIndex]['trigger'])
    //     .enter()
    //     .append('circle')
    //     .attr('cx', function(d) {
    //         return xScaleScatterPlot(d[2])
    //     })
    //     .attr('cy', function(d) {
    //         return yScaleScatterPlot(d[1])
    //     })
    //     .attr('r', function(d) {
    //         return sizeScaleScatterPlot(d[3])
    //     })
    // console.log(data[selectedClusterIndex]['trigger'])
    for(var i = 0; i < data[selectedClusterIndex]['trigger'].length; i++) {
        colorScaleScatterPlot.domain(data[selectedClusterIndex]['trigger'][i][4])
        scatterPlotSVGPieLayer = scatterPlotSVG.append('g')
            .attr('transform', 'translate(' + (scatterPlotMargin.left + xScaleScatterPlot(data[selectedClusterIndex]['trigger'][i][2])) + ', ' + (scatterPlotMargin.top + yScaleScatterPlot(data[selectedClusterIndex]['trigger'][i][1])) + ')')
        var pie = d3.pie()
            // .value(data[selectedClusterIndex]['trigger'][i][4])
            // .sort(null)
        // console.log(pie(data[selectedClusterIndex]['trigger'][i][4]))
        var arc = d3.arc()
            .innerRadius(0)
            .outerRadius(sizeScaleScatterPlot(data[selectedClusterIndex]['trigger'][i][3]))
        var path = scatterPlotSVGPieLayer.selectAll('path')
            .data(pie(data[selectedClusterIndex]['trigger'][i][4]))
            .enter()
            .append('path')
            .attr('fill', function (d, i) {
                return colorScaleScatterPlot(i)
            })
            .attr('d', arc)
            // .attr('stroke', 'black')
            // .attr('stroke-width', '1px')
    }
    scatterPlotSVGDefaultLayer.append('g')
        .call(xAxisScatterPlot)
        .attr('transform', 'translate(0, ' + scatterPlotInnerHeight / 2 + ')')
    scatterPlotSVGDefaultLayer.append('g')
        .call(yAxisScatterPlot)
        .attr('transform', 'translate(' + scatterPlotInnerWidth / 2 + ', 0)')
}