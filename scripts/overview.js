var overviewMargin = {top: 3, left: 30, right: 30, bottom: 20}
var overviewWidth = 800
var overviewHeight = 70
var overviewInnerHeight, overviewInnerWidth

var overviewSVG

var xScaleOverview, countScaleOverview, valenceScaleOverview

var avgValenceByCluster
const arrayAverage = arr => arr.reduce((a, b) => a + b, 0) / arr.length

function initOverview() {
    overviewInnerHeight = overviewHeight - overviewMargin.top - overviewMargin.bottom
    overviewInnerWidth = overviewWidth - overviewMargin.left - overviewMargin.right
    
    d3.select('#overviewSVG').selectAll('*').remove()
    overviewSVG = d3.select('#overviewSVG')
        .attr('width', overviewWidth)
        .attr('height', overviewHeight)
    overviewSVG.selectAll('*').remove()
    overviewSVG = overviewSVG.append('g')
        .attr('transform', 'translate(' + overviewMargin.left + ', ' + overviewMargin.top + ')')
    
    xScaleOverview = d3.scaleTime().range([0, overviewInnerWidth])
    countScaleOverview = d3.scaleLinear().range([overviewInnerHeight, 0])
    valenceScaleOverview = d3.scaleLinear().range([overviewInnerHeight, 0]).domain([0, 1])
}

function onChangeOverview() {
    xScaleOverview.domain(d3.extent(tweetCountByDate, function (d) { return Date.parse(d['key']) }))
    countScaleOverview.domain([0, d3.max(tweetCountByDate, function (d) { return d['value'] })])
    var xAxisOverview = d3.axisBottom()
        .scale(xScaleOverview)
    var area = d3.area()
        .x(function (d) { return xScaleOverview(Date.parse(d.data['key'])) })
        .y0(function (d) { return countScaleOverview(d[0]) })
        .y1(function (d) { return countScaleOverview(d[1]) })
    overviewSVG.selectAll('.overviewStream')
        .data(tweetCountLayers)
        .enter()
        .append('path')
        .style('fill', '#6293BA')
        .attr('d', area)
        .attr('class', '.overviewStream')
    avgValenceByCluster = []
    data.forEach(function (d) {
        var o = {}
        o['earlyTime'] = d['earlyTime']
        o['valence'] = arrayAverage(d['valence'])
        avgValenceByCluster.push(o)
    })
    console.log(avgValenceByCluster)
    var line = d3.line()
        .x(function(d, i) {return xScaleOverview(Date.parse(d['earlyTime']))})
        .y(function(d) {return valenceScaleOverview(d['valence'])})
        .curve(d3.curveMonotoneX)
    overviewSVG.append('path')
        .datum(avgValenceByCluster)
        .attr('class', '.overviewLine')
        .attr('d', line)
        .style('fill', 'transparent')
        .attr('stroke', 'black')
    overviewSVG.selectAll('.overviewDot')
        .data(avgValenceByCluster)
        .enter()
        .append('circle')
        .attr('class', '.overviewDot')
        .attr('cx', function(d) {
            return xScaleOverview(Date.parse(d['earlyTime']))
        })
        .attr('cy', function(d) {
            return valenceScaleOverview(d['valence'])
        })
        .attr('r', 2)
        .style('fill', 'white')
        .attr('stroke', 'black')
    overviewSVG.append('g')
        .call(xAxisOverview)
        .attr('transform', 'translate(0, ' + overviewInnerHeight + ')')
}
