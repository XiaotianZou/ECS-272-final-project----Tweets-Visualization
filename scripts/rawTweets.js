var rawTweetsCellWidth = 450

var rawTweetsTable = null

function initRawTweets() {
    rawTweetsTable = d3.select('#rawTweetsTable')
}

function onChangeRawTweets() {
    var mouseOverHandlerRawTweets = function (d, i) {
        bandGraphSVGLayer2.selectAll('.rawTweetsHovering').remove()
        var tweetTime = data[selectedClusterIndex].time[i]
        bandGraphSVGLayer2.append('circle')
            .attr('class', 'rawTweetsHovering')
            .attr('cx', xScaleBandGraph(tweetTime))
            .attr('cy', bandGraphInnerHeight - 8)
            .attr('r', 6)
            .style('fill', 'orange')
            .attr('stroke', 'black')
        rawTweetsTable.selectAll('td')
            .style('background-color', 'transparent')
        d3.select(this)
            .style('background-color', 'orange')
        var split = d.split(/([ ,.!?]+)/g)
        for (var j = 0; j < selectedClusterTrigger.length; j++) {
            if (split.includes(selectedClusterTrigger[j])) {
                d3.select('#scatterPlotPie' + j)
                    .selectAll('path')
                    .style('opacity', 1.0)
                    .attr('stroke', 'black')
                d3.select('#scatterPlotPie' + j)
                    .append('text')
                    .attr('class', 'scatterPlotText')
                    .attr('x', sizeScaleScatterPlot(data[selectedClusterIndex]['trigger'][j][3]) + 2)
                    .attr('y', 2)
                    .text(data[selectedClusterIndex]['trigger'][j][0])
                    .attr('font-family', 'serif')
                    .attr('font-size', '12px')
            } else {
                d3.select('#scatterPlotPie' + j)
                    .selectAll('path')
                    .style('opacity', 0.6)
            }
        }
    }
    var mouseLeaveHandlerRawTweets = function (d, i) {
        bandGraphSVGLayer2.selectAll('.rawTweetsHovering').remove()
        rawTweetsTable.selectAll('td')
            .style('background-color', 'transparent')
        scatterPlotSVG.selectAll('path')
            .style('opacity', 1.0)
            .attr('stroke', 'transparent')
        scatterPlotSVGDefaultLayer.selectAll('path')
            .style('opacity', 1.0)
            .attr('stroke', 'black')
        scatterPlotSVG.selectAll('.scatterPlotText').remove()
    }
    rawTweetsTable.selectAll('*').remove()
    rawTweetsTable.selectAll('*')
        .data(data[selectedClusterIndex].words)
        .enter()
        .append('tr')
        .append('td')
        .attr('id', function (d, i) {
            return 'rawTweetsTableTd' + i
        })
        .attr('width', rawTweetsCellWidth)
        .style('border-bottom', '1px solid blue')
        .style('border-top', '1px solid blue')
        .on('mouseover', mouseOverHandlerRawTweets)
        .on('mouseleave', mouseLeaveHandlerRawTweets)
        .html(function (d, i) {
            var res = ''
            var split = d.split(/([ ,.!?]+)/g)
            for (var j = 0; j < split.length; j++) {
                if (selectedClusterTrigger.includes(split[j])) {
                    res = res + '<b>' + split[j] + '</b>'
                } else {
                    res = res + split[j]
                }
            }
            return res + '<br/><i>[' + data[selectedClusterIndex].time[i] + ']</i>'
        })

}