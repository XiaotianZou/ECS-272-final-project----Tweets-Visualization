var bandGraphMargin = {top: 10, left: 30, right: 30, bottom: 30}
var bandGraphWidth = 800
var bandGraphHeight = 300
var bandGraphInnerHeight, bandGraphInnerWidth

var bandGraphSVG = null

function initBandGraph() {
    bandGraphInnerHeight = bandGraphHeight - bandGraphMargin.top - bandGraphMargin.bottom
    bandGraphInnerWidth = bandGraphWidth - bandGraphMargin.left - bandGraphMargin.right

    bandGraphSVG = d3.select('#bandGraphSVG')
        .attr('width', bandGraphWidth)
        .attr('height', bandGraphHeight)
        .append('g')
        .attr('transform', 'translate（' + bandGraphMargin.left + ',' + bandGraphMargin.top + ')')
}

function onChangeBandGraph() {
    bandGraphSVG.selectAll('*')
        .remove()
    
    var allTweets = null
    
}