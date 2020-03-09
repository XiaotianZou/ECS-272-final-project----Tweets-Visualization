// var rawTweetsCellHeight = 35
var rawTweetsCellWidth = 450

var rawTweetsTable = null

function initRawTweets() {
    rawTweetsTable = d3.select('#rawTweetsTable')
}

function onChangeRawTweets() {
    var mouseOverHandlerRawTweets = function (d, i) {
        var tweetTime = data[selectedClusterIndex].time[i]
        bandGraphSVGLayer2.append('circle')
            .attr('cx', xScaleBandGraph(tweetTime))
            .attr('cy', bandGraphInnerHeight - 8)
            .attr('r', 8)
            .style('fill', 'orange')
    }
    rawTweetsTable.selectAll('*').remove()
    rawTweetsTable.selectAll('*')
        .data(data[selectedClusterIndex].words)
        .enter()
        .append('tr')
        .append('td')
        .attr('width', rawTweetsCellWidth)
        .style('border-bottom', '1px solid blue')
        .style('border-top', '1px solid blue')
        .on('mouseover', mouseOverHandlerRawTweets)
        .html(function(d, i) {
            return d + '<br/><i>[' + data[selectedClusterIndex].time[i] + ']</i>'
        })
        
}