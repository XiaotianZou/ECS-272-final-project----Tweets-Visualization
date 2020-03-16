var scatterPlotMargin = { top: 20, left: 20, right: 20, bottom: 20 }
var scatterPlotWidth = 300
var scatterPlotHeight = 300
var scatterPlotInnerWidth, scatterPlotInnerHeight
var emotionColors = ['#EF6664', '#FAA461', '#9887BB', '#31AE6D', '#FFD777', '#679FD3', '#25A6D1', '#A5CC68']
var emotionCategories = ['anger', 'anticipation', 'disgust', 'fear', 'joy', 'sadness', 'surprise', 'trust']

var scatterPlotSVG
var scatterPlotSVGDefaultLayer = null
var scatterPlotSVGPieLayers = []

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
    xScaleScatterPlot = d3.scaleLinear().range([0, scatterPlotInnerWidth]).domain([0, 1])
    yScaleScatterPlot = d3.scaleLinear().range([scatterPlotInnerHeight, 0]).domain([0, 1])
    sizeScaleScatterPlot = d3.scaleLinear().range([1, 10]).domain([0, 1])
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
    for (var i = 0; i < data[selectedClusterIndex]['trigger'].length; i++) {
        colorScaleScatterPlot.domain(data[selectedClusterIndex]['trigger'][i][4])
        var scatterPlotSVGPieLayer = scatterPlotSVG.append('g')
            .attr('transform', 'translate(' + (scatterPlotMargin.left + xScaleScatterPlot(data[selectedClusterIndex]['trigger'][i][2])) + ', ' + (scatterPlotMargin.top + yScaleScatterPlot(data[selectedClusterIndex]['trigger'][i][1])) + ')')
            .attr('data-index', i)
            .attr('id', 'scatterPlotPie' + i)
        var pie = d3.pie()
        var arc = d3.arc()
            .innerRadius(0)
            .outerRadius(sizeScaleScatterPlot(data[selectedClusterIndex]['trigger'][i][3]))
        var mouseOverHandlerScatterPlot = function (d, j) {
            var i = this.parentNode.getAttribute('data-index')
            scatterPlotSVG.selectAll('path')
                .style('opacity', 0.6)
                .attr('stroke', 'transparent')
            scatterPlotSVGDefaultLayer.selectAll('path')
                .style('opacity', 1.0)
                .attr('stroke', 'black')
            d3.select(this.parentNode)
                .selectAll('path')
                .style('opacity', 1.0)
                .attr('stroke', 'black')
                .attr('stroke-width', '1px')
            d3.select(this.parentNode)
                .append('text')
                .attr('class', 'scatterPlotText')
                .attr('x', sizeScaleScatterPlot(data[selectedClusterIndex]['trigger'][i][3]) + 2)
                .attr('y', 2)
                .text(data[selectedClusterIndex]['trigger'][i][0])
                .attr('font-family', 'serif')
                .attr('font-size', '12px')
            for (var j = 0; j < data[selectedClusterIndex]['words'].length; j++) {
                var split = data[selectedClusterIndex]['words'][j].split(/([ ,.!?]+)/g)
                if (split.includes(selectedClusterTrigger[i])) {
                    d3.select('#rawTweetsTableTd' + j)
                        .style('background-color', 'orange')
                } else {
                    d3.select('#rawTweetsTableTd' + j)
                        .style('background-color', 'transparent')
                }
            }
        }
        var mouseLeaveHandlerScatterPlot = function (d, j) {
            scatterPlotSVG.selectAll('path')
                .style('opacity', 1.0)
                .attr('stroke', 'transparent')
            scatterPlotSVGDefaultLayer.selectAll('path')
                .style('opacity', 1.0)
                .attr('stroke', 'black')
            scatterPlotSVG.selectAll('.scatterPlotText').remove()
            rawTweetsTable.selectAll('td')
                .style('background-color', 'transparent')
        }
        var path = scatterPlotSVGPieLayer.selectAll('path')
            .data(pie(data[selectedClusterIndex]['trigger'][i][4]))
            .enter()
            .append('path')
            .attr('fill', function (d, j) {
                return colorScaleScatterPlot(j)
            })
            .attr('d', arc)
            .on('mouseover', mouseOverHandlerScatterPlot)
            .on('mouseleave', mouseLeaveHandlerScatterPlot)
    }
    scatterPlotSVGDefaultLayer.append('g')
        .call(xAxisScatterPlot)
        .attr('transform', 'translate(0, ' + scatterPlotInnerHeight / 2 + ')')
    scatterPlotSVGDefaultLayer.append('text')
        .attr('x', scatterPlotInnerWidth - 35)
        .attr('y', scatterPlotInnerHeight / 2 - 2)
        .style('font-size', '10px')
        .text('Arousal')
    scatterPlotSVGDefaultLayer.append('g')
        .call(yAxisScatterPlot)
        .attr('transform', 'translate(' + scatterPlotInnerWidth / 2 + ', 0)')
    scatterPlotSVGDefaultLayer.append('text')
        .attr('x', scatterPlotInnerWidth / 2 - 38)
        .attr('y', 6)
        .style('font-size', '10px')
        .text('Valence')
}