var bandGraphMargin = { top: 10, left: 30, right: 30, bottom: 30 }
var bandGraphWidth = 800
var bandGraphHeight = 300
var bandGraphInnerHeight, bandGraphInnerWidth

var bandGraphSVG = null
var bandGraphSVGLayer1 = null
var bandGraphSVGLayer2 = null

var xScaleBandGraph, countScaleBandGraph, valanceScaleBandGraph

var hoveredClusterIndex = -1

// var mouseOnStream = false
// var mouseOnHoveredStream = false

function initBandGraph() {
    bandGraphInnerHeight = bandGraphHeight - bandGraphMargin.top - bandGraphMargin.bottom
    bandGraphInnerWidth = bandGraphWidth - bandGraphMargin.left - bandGraphMargin.right

    bandGraphSVG = d3.select('#bandGraphSVG')
        .attr('width', bandGraphWidth)
        .attr('height', bandGraphHeight)
    bandGraphSVG.selectAll('*').remove()
    bandGraphSVGLayer1 = bandGraphSVG.append('g')
        .attr('transform', 'translate(' + bandGraphMargin.left + ',' + bandGraphMargin.top + ')')
    bandGraphSVGLayer2 = bandGraphSVG.append('g')
        .attr('transform', 'translate(' + bandGraphMargin.left + ',' + bandGraphMargin.top + ')')

    xScaleBandGraph = d3.scaleTime().range([0, bandGraphInnerWidth])
    countScaleBandGraph = d3.scaleLinear().range([bandGraphInnerHeight, 0])

    hoveredClusterIndex = -1
}


function onChangeBandGraph() {
    bandGraphSVGLayer2.selectAll('*')
        .remove()

    // console.log(allTweets)
    var tweetCountByDate = d3.nest().key(function (d) {
        var time = d['time']
        return time.getFullYear() + '-' + (time.getMonth() + 1) + '-' + time.getDate()
    }).rollup(function (leaves) {
        return leaves.length
    }).entries(allTweets)

    tweetCountByDate.sort(function (a, b) {
        return (Date.parse(a['key']) > Date.parse(b['key'])) ? 1 : -1
    })
    var t = new Date(tweetCountByDate[tweetCountByDate.length - 1].key)
    t.setDate(t.getDate() + 1)
    tweetCountByDate.push({ key: t, value: 0 })

    // console.log(tweetCountByDate)
    xScaleBandGraph.domain(d3.extent(tweetCountByDate, function (d) { return Date.parse(d['key']) }))
    countScaleBandGraph.domain([0, 2 * d3.max(tweetCountByDate, function (d) { return d['value'] })])

    var xAxisBandGraph = d3.axisBottom()
        .scale(xScaleBandGraph)
    var countAxisBandGraph = d3.axisRight()
        .scale(countScaleBandGraph)

    var stack = d3.stack().keys(['value'])
    var layers = stack(tweetCountByDate)
    // console.log(layers)
    var area = d3.area()
        .x(function (d) { return xScaleBandGraph(Date.parse(d.data['key'])) })
        .y0(function (d) { return countScaleBandGraph(d[0]) })
        .y1(function (d) { return countScaleBandGraph(d[1]) })

    var mouseLeaveHandlerStream = function () {
        hoveredClusterIndex = -1
        bandGraphSVGLayer1.selectAll('.streamSelection').remove()
    }

    var mouseMoveHandlerStream = function () {
        mouseOnStream = true
        var mouseX = d3.mouse(this)[0]
        var invertedX = xScaleBandGraph.invert(mouseX)
        var j
        for (j = data.length - 1; j >= 0; j--) {
            if (data[j].earlyTime <= invertedX) break
        }
        if (hoveredClusterIndex != j) {
            hoveredClusterIndex = j
            bandGraphSVGLayer1.selectAll('.streamSelection').remove()
            if (j == -1) return
            onChangeTagCloud()
            bandGraphSVGLayer1.append('clipPath')
                .attr('id', 'streamSelectionClipPath')
                .attr('class', 'streamSelection')
                .append('rect')
                .attr('id', 'streamSelectionRect')
                .attr('y', 0)
                .attr('height', bandGraphInnerHeight)
                .attr('width', (j == data.length - 1) ? (bandGraphInnerWidth - xScaleBandGraph(data[j]['earlyTime'])) : (xScaleBandGraph(data[j + 1]['earlyTime']) - xScaleBandGraph(data[j]['earlyTime'])))
                .attr('x', xScaleBandGraph(data[j]['earlyTime']))

            bandGraphSVGLayer1.selectAll('#streamSelection')
                .data(layers)
                .enter()
                .append('path')
                .attr('class', 'streamSelection')
                .attr('id', 'streamSelectionStream')
                .style('fill', '#6293BA')
                .attr('d', area)
                .style('-webkit-clip-path', 'url(#streamSelectionClipPath)')
                .style('clip-path', 'url(#streamSelectionClipPath)')
        }
    }

    bandGraphSVGLayer2.selectAll('path').remove()
    bandGraphSVGLayer2.selectAll('path')
        .data(layers)
        .enter()
        .append('path')
        .style('fill', '#6293BA')
        .style('opacity', 0.5)
        .attr('d', area)
        .on('mousemove', mouseMoveHandlerStream)
        .on('mouseenter', mouseMoveHandlerStream)
        .on('mouseleave', mouseLeaveHandlerStream)

    bandGraphSVGLayer2.append('g')
        .call(xAxisBandGraph)
        .attr('transform', 'translate(0, ' + bandGraphInnerHeight + ')')
    bandGraphSVGLayer2.append('g')
        .call(countAxisBandGraph)
        .attr('transform', 'translate(' + bandGraphInnerWidth + ', 0)')
}