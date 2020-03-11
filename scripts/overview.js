var overviewMargin = {top: 3, left: 30, right: 30, bottom: 3}
var overviewWidth = 800
var overviewHeight = 50
var overviewInnerHeight, overviewInnerWidth

var overviewSVG

var xScaleOverview, countScaleOverview

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
}

function onChangeOverview() {
    xScaleOverview.domain(d3.extent(tweetCountByDate, function (d) { return Date.parse(d['key']) }))
    countScaleOverview.domain([0, d3.max(tweetCountByDate, function (d) { return d['value'] })])
    var area = d3.area()
        .x(function (d) { return xScaleOverview(Date.parse(d.data['key'])) })
        .y0(function (d) { return countScaleOverview(d[0]) })
        .y1(function (d) { return countScaleOverview(d[1]) })
    overviewSVG.selectAll('path')
        .data(tweetCountLayers)
        .enter()
        .append('path')
        .style('fill', '#6293BA')
        .attr('d', area)
}
