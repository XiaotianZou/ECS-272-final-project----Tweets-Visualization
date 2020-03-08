var bandGraphMargin = {top: 10, left: 30, right: 30, bottom: 30}
var bandGraphWidth = 800
var bandGraphHeight = 300
var bandGraphInnerHeight, bandGraphInnerWidth

var bandGraphSVG = null

var xScaleBandGraph, countScaleBandGraph, valanceScaleBandGraph

function initBandGraph() {
    bandGraphInnerHeight = bandGraphHeight - bandGraphMargin.top - bandGraphMargin.bottom
    bandGraphInnerWidth = bandGraphWidth - bandGraphMargin.left - bandGraphMargin.right

    bandGraphSVG = d3.select('#bandGraphSVG')
        .attr('width', bandGraphWidth)
        .attr('height', bandGraphHeight)
        .append('g')
        .attr('transform', 'translate(' + bandGraphMargin.left + ',' + bandGraphMargin.top + ')')

    xScaleBandGraph = d3.scaleTime().range([0, bandGraphInnerWidth])
    countScaleBandGraph = d3.scaleLinear().range([bandGraphInnerHeight, 0])
}

initBandGraph()

function onChangeBandGraph() {
    bandGraphSVG.selectAll('*')
        .remove()
    
    // console.log(allTweets)
    var tweetCountByDate = d3.nest().key(function(d) {
        var time = d['time']
        return time.getFullYear() + '-' + (time.getMonth() + 1) + '-' + time.getDate()
    }).rollup(function(leaves) {
        return leaves.length
    }).entries(allTweets)

    tweetCountByDate.sort(function(a, b) {
        return (Date.parse(a['key']) > Date.parse(b['key']))?1:-1
    })
    // console.log(tweetCountByDate)
    xScaleBandGraph.domain(d3.extent(tweetCountByDate, function(d) {return Date.parse(d['key'])}))
    countScaleBandGraph.domain([0, 2 * d3.max(tweetCountByDate, function(d) {return d['value']})])

    var xAxisBandGraph = d3.axisBottom()
        .scale(xScaleBandGraph)
    var countAxisBandGraph = d3.axisRight()
        .scale(countScaleBandGraph)
    
    var stack = d3.stack().keys(['value'])
    var layers = stack(tweetCountByDate)
    // console.log(layers)
    var area = d3.area()
        .x(function(d) {return xScaleBandGraph(Date.parse(d.data['key']))})
        .y0(function(d) {return countScaleBandGraph(d[0])})
        .y1(function(d) {return countScaleBandGraph(d[1])})

    bandGraphSVG.selectAll('path').remove()
    bandGraphSVG.selectAll('path')
        .data(layers)
        .enter()
        .append('path')
        .style('fill', '#B5CCE1')// R 181 G 204 B 225
        .attr('d', area)
    
    bandGraphSVG.append('g')
        .call(xAxisBandGraph)
        .attr('transform', 'translate(0, ' + bandGraphInnerHeight +')')
    bandGraphSVG.append('g')
        .call(countAxisBandGraph)
        .attr('transform', 'translate(' + bandGraphInnerWidth + ', 0)')
}