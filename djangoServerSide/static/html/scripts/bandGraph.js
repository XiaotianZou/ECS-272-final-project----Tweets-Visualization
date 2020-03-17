var bandGraphMargin = { top: 3, left: 30, right: 30, bottom: 30 }
var bandGraphWidth = 1000
var bandGraphHeight = 300
var bandGraphInnerHeight, bandGraphInnerWidth

var bandGraphSVG = null
var bandGraphSVGLayer1 = null
var bandGraphSVGLayer2 = null

var valenceBandWidth = 0.3

var xScaleBandGraph, countScaleBandGraph, valenceScaleBandGraph, colorScaleBandGraph
var dominanceScaleBandGraph

var hoveredClusterIndex = -1
var selectedClusterIndex = -1
var hoveredEmotionBubbleIndex = -1
var selectedClusterTrigger = null

var tweetCountByDate
var emotionCategoryByCluster
var tweetCountLayers

var areaStream
var mouseLeaveHandlerStream, mouseOverHandlerStream, mouseMoveHandlerStream

var areaBand, valenceLayers
var mouseLeaveHandlerBand, mouseOverHandlerBand

var emotionBubbleRadius1 = 6
var emotionBubbleRadius2 = 30

function initBandGraph() {
    bandGraphInnerHeight = bandGraphHeight - bandGraphMargin.top - bandGraphMargin.bottom
    bandGraphInnerWidth = bandGraphWidth - bandGraphMargin.left - bandGraphMargin.right

    bandGraphSVG = d3.select('#bandGraphSVG')
        .attr('width', bandGraphWidth)
        .attr('height', bandGraphHeight)
    bandGraphSVG.selectAll('*').remove()
    // Layer 1: Interactions
    bandGraphSVGLayer1 = bandGraphSVG.append('g')
        .attr('transform', 'translate(' + bandGraphMargin.left + ',' + bandGraphMargin.top + ')')
    // Layer 2: Stream
    bandGraphSVGLayer2 = bandGraphSVG.append('g')
        .attr('transform', 'translate(' + bandGraphMargin.left + ',' + bandGraphMargin.top + ')')
    // Layer 3: Band
    bandGraphSVGLayer3 = bandGraphSVG.append('g')
        .attr('transform', 'translate(' + bandGraphMargin.left + ',' + bandGraphMargin.top + ')')

    xScaleBandGraph = d3.scaleTime().range([0, bandGraphInnerWidth])
    countScaleBandGraph = d3.scaleLinear().range([bandGraphInnerHeight, 0])
    valenceScaleBandGraph = d3.scaleLinear().range([bandGraphInnerHeight, 0]).domain([0, 1])
    colorScaleBandGraph = d3.scaleOrdinal().range(emotionColors.slice().reverse())
    dominanceScaleBandGraph = d3.scaleLinear().range([-Math.PI / 4, Math.PI / 4])

    hoveredClusterIndex = -1
    selectedClusterIndex = -1
    hoveredEmotionBubbleIndex = -1
}

function onChangeBandGraph() {
    // Prepare Data for Stream
    tweetCountByDate = d3.nest().key(function (d) {
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

    var stackStream = d3.stack().keys(['value'])
    tweetCountLayers = stackStream(tweetCountByDate)
    // console.log(layers)
    areaStream = d3.area()
        .x(function (d) { return xScaleBandGraph(Date.parse(d.data['key'])) })
        .y0(function (d) { return countScaleBandGraph(d[0]) })
        .y1(function (d) { return countScaleBandGraph(d[1]) })
        .curve(d3.curveMonotoneX)

    mouseLeaveHandlerStream = function () {
        hoveredClusterIndex = -1
        bandGraphSVGLayer1.selectAll('.streamHovering').remove()
        tagCloudDIV.style('display', 'none')
        tagCloudSVG.selectAll('text').remove()
    }

    mouseMoveHandlerStream = function () {
        var mouseX = d3.mouse(this)[0]
        var invertedX = xScaleBandGraph.invert(mouseX)
        var j
        for (j = data.length - 1; j >= 0; j--) {
            if (data[j].earlyTime <= invertedX) break
        }
        if (hoveredClusterIndex != j) {
            hoveredClusterIndex = j
            bandGraphSVGLayer1.selectAll('.streamHovering').remove()
            if (j == -1) return
            bandGraphSVGLayer1.append('clipPath')
                .attr('id', 'streamHoveringClipPath')
                .attr('class', 'streamHovering')
                .append('rect')
                .attr('id', 'streamHoveringRect')
                .attr('y', 0)
                .attr('height', bandGraphInnerHeight)
                .attr('width', (j == data.length - 1) ? (bandGraphInnerWidth - xScaleBandGraph(data[j]['earlyTime'])) : (xScaleBandGraph(data[j + 1]['earlyTime']) - xScaleBandGraph(data[j]['earlyTime'])))
                .attr('x', xScaleBandGraph(data[j]['earlyTime']))

            bandGraphSVGLayer1.selectAll('#streamHovering')
                .data(tweetCountLayers)
                .enter()
                .append('path')
                .attr('class', 'streamHovering')
                .attr('id', 'streamHoveringStream')
                .style('fill', '#6293BA')
                .attr('d', areaStream)
                .style('-webkit-clip-path', 'url(#streamHoveringClipPath)')
                .style('clip-path', 'url(#streamHoveringClipPath)')
            bandGraphSVGLayer1.append('line')
                .attr('class', 'streamHovering')
                .attr('x1', xScaleBandGraph(data[j]['earlyTime']))
                .attr('x2', xScaleBandGraph(data[j]['earlyTime']))
                .attr('y1', 0)
                .attr('y2', bandGraphInnerHeight)
                .attr('stroke', 'red')
                .attr('stroke-width', 1)
            bandGraphSVGLayer1.append('text')
                .attr('class', 'streamHovering')
                .attr('x', xScaleBandGraph(data[j]['earlyTime']))
                .attr('y', bandGraphInnerHeight - 3)
                .text(data[j]['earlyTime'].getFullYear() + '.' + (data[j]['earlyTime'].getMonth() + 1) + '.' + data[j]['earlyTime'].getDate())
                .attr('font-family', 'serif')
                .attr('font-size', '12px')
            // Update tag cloud content
            onChangeTagCloud()

            tagCloudDIV.style('left', (d3.event.pageX + 20) + 'px')
                .style('top', (d3.event.pageY + 20) + 'px')
                .style('display', 'block')
        }
    }

    mouseClickHandlerStream = function () {
        var mouseX = d3.mouse(this)[0]
        var invertedX = xScaleBandGraph.invert(mouseX)
        var j
        for (j = data.length - 1; j >= 0; j--) {
            if (data[j].earlyTime <= invertedX) break
        }
        if (j == -1) return
        if (j != selectedClusterIndex) {
            selectedClusterIndex = j
            d3.selectAll('.streamSelection').remove()
            bandGraphSVGLayer1.append('line')
                .attr('class', 'streamSelection')
                .attr('x1', xScaleBandGraph(data[j]['earlyTime']))
                .attr('x2', xScaleBandGraph(data[j]['earlyTime']))
                .attr('y1', 0)
                .attr('y2', bandGraphInnerHeight)
                .attr('stroke', 'red')
                .attr('stroke-width', 2)
            overviewSVGLayer1.append('line')
                .attr('class', 'streamSelection')
                .attr('x1', xScaleOverview(data[j]['earlyTime']))
                .attr('x2', xScaleOverview(data[j]['earlyTime']))
                .attr('y1', 0)
                .attr('y2', overviewInnerHeight)
                .attr('stroke', 'red')
                .attr('stroke-width', 2)
            selectedClusterTrigger = []
            data[selectedClusterIndex]['trigger'].forEach(function (d) {
                selectedClusterTrigger.push(d[0])
            })
            onChangeRawTweets()
            onChangeScatterPlot()
        }
    }

    // Prepare Data for Band
    emotionCategoryByCluster = []
    data.forEach(function (d, i) {
        var category = d['category']
        var sum = arraySum(category)
        if (sum != 0) {
            var o = {}
            o['index'] = i
            o['earlyTime'] = d['earlyTime']
            var valence = 0, dominance = 0
            for (var j = 0; j < d['category'].length; j++) {
                valence += d['category'][j] / sum * d['valence'][j]
                dominance += d['category'][j] / sum * d['dominance'][j]
            }
            o['valence'] = valence
            o['dominance'] = dominance
            o['anger'] = d['category'][0] * valenceBandWidth / sum
            o['anticipation'] = d['category'][1] * valenceBandWidth / sum
            o['disgust'] = d['category'][2] * valenceBandWidth / sum
            o['fear'] = d['category'][3] * valenceBandWidth / sum
            o['joy'] = d['category'][4] * valenceBandWidth / sum
            o['sadness'] = d['category'][5] * valenceBandWidth / sum
            o['surprise'] = d['category'][6] * valenceBandWidth / sum
            o['trust'] = d['category'][7] * valenceBandWidth / sum
            emotionCategoryByCluster.push(o)
        }
    })
    // console.log(emotionCategoryByCluster)
    var stackBand = d3.stack()
        .offset(function (series, order) {
            if (!((n = series.length) > 1)) return;
            var s0
            var s1 = series[order[0]]
            var m = s1.length

            var offset = []
            for (var i = 0; i < m; i++) {
                offset[i] = s1[i]['data']['valence'] - valenceBandWidth / 2
            }
            for (var i = 0; i < m; i++) {
                s1[i][0] += offset[i]
                s1[i][1] += offset[i]
            }
            for (var i = 1; i < n; i++) {
                s0 = s1, s1 = series[order[i]];
                for (var j = 0; j < m; ++j) {
                    s1[j][0] = s0[j][1]
                    s1[j][1] += s1[j][0]
                }
            }
        })
        .keys(emotionCategories.slice().reverse())

    valenceLayers = stackBand(emotionCategoryByCluster)
    areaBand = d3.area()
        .x(function (d) { return xScaleBandGraph(Date.parse(d.data['earlyTime'])) })
        .y0(function (d) { return valenceScaleBandGraph(d[0]) })
        .y1(function (d) { return valenceScaleBandGraph(d[1]) })
        .curve(d3.curveMonotoneX)

    mouseOverHandlerBand = function (d, i) {
        bandGraphSVGLayer3.selectAll('path')
            .style('opacity', 0.25)
        if ($('#' + emotionCategories.slice().reverse()[i] + 'CheckBox').prop('checked')) {
            d3.select(this)
                .style('opacity', 0.8)
        } else {
            d3.select(this)
                .style('opacity', 0.4)
        }
    }

    mouseLeaveHandlerBand = function (d, i) {
        for (var j = 0; j < emotionCategories.length; j++) {
            if ($('#' + emotionCategories[j] + 'CheckBox').prop('checked')) {
                d3.select('#' + emotionCategories[j] + 'SubBand')
                    .style('opacity', 0.8)
            } else {
                d3.select('#' + emotionCategories[j] + 'SubBand')
                    .style('opacity', 0.4)
            }
        }
    }

    xScaleBandGraph.domain(d3.extent(tweetCountByDate, function (d) { return Date.parse(d['key']) }))
    countScaleBandGraph.domain([0, 2 * d3.max(tweetCountByDate, function (d) { return d['value'] })])
    drawBandGraph()
}

function drawBandGraph() {
    // console.log(tweetCountByDate)
    bandGraphSVGLayer1.selectAll('*')
        .remove()
    bandGraphSVGLayer2.selectAll('*')
        .remove()
    bandGraphSVGLayer3.selectAll('*')
        .remove()
    var xAxisBandGraph = d3.axisBottom()
        .scale(xScaleBandGraph)
    var countAxisBandGraph = d3.axisRight()
        .scale(countScaleBandGraph)
    var valenceAxisBandGraph = d3.axisLeft()
        .scale(valenceScaleBandGraph)

    bandGraphSVGLayer2.selectAll('path').remove()
    bandGraphSVGLayer2.selectAll('path')
        .data(tweetCountLayers)
        .enter()
        .append('path')
        .style('fill', '#6293BA')
        .style('opacity', 0.5)
        .attr('d', areaStream)
        .on('mousemove', mouseMoveHandlerStream)
        .on('click', mouseClickHandlerStream)
        .on('mouseleave', mouseLeaveHandlerStream)

    bandGraphSVGLayer2.append('g')
        .call(xAxisBandGraph)
        .attr('transform', 'translate(0, ' + bandGraphInnerHeight + ')')
    bandGraphSVGLayer2.append('g')
        .call(countAxisBandGraph)
        .attr('transform', 'translate(' + bandGraphInnerWidth + ', 0)')
    bandGraphSVGLayer2.append('text')
        .attr('x', bandGraphInnerWidth - 35)
        .attr('y', 8)
        .style('font-size', '10px')
        .text('Tweets')

    // Draw the red line if there is cluster selected
    if (selectedClusterIndex != -1) {
        bandGraphSVGLayer1.append('line')
            .attr('class', 'streamSelection')
            .attr('x1', xScaleBandGraph(data[selectedClusterIndex]['earlyTime']))
            .attr('x2', xScaleBandGraph(data[selectedClusterIndex]['earlyTime']))
            .attr('y1', 0)
            .attr('y2', bandGraphInnerHeight)
            .attr('stroke', 'red')
            .attr('stroke-width', 2)
    }

    bandGraphSVGLayer3.selectAll('path')
        .data(valenceLayers)
        .enter()
        .append('path')
        .style('fill', function (d) {
            return colorScaleBandGraph(d.key)
        })
        .attr('id', function (d, i) {
            return emotionCategories.slice().reverse()[i] + 'SubBand'
        })
        .style('opacity', function (d, i) {
            if ($('#' + emotionCategories.slice().reverse()[i] + 'CheckBox').prop('checked')) {
                return 0.8
            } else {
                return 0.4
            }
        })
        .attr('d', areaBand)
        .on('mouseover', mouseOverHandlerBand)
        .on('mouseleave', mouseLeaveHandlerBand)

    var mouseOverHandlerEmotionBubble = function () {
        hoveredEmotionBubbleIndex = this.parentNode.getAttribute('data-index')
        var emotionBubbleLayer = d3.select('#emotionBubbleLayer' + hoveredEmotionBubbleIndex)
        // console.log(emotionBubbleLayer)
        onChangeEmotionTooltip()
        emotionTooltipDIV.style('left', (d3.event.pageX + 20) + 'px')
            .style('top', (d3.event.pageY + 20) + 'px')
            .style('display', 'block')
        emotionBubbleHoveringLayer = bandGraphSVGLayer3.append('g')
            .attr('transform', document.getElementById('emotionBubbleLayer' + hoveredEmotionBubbleIndex).getAttribute('transform'))
            .attr('class', 'emotionBubbleHovering')
        var root = {}
        root['name'] = 'Categories'
        var children = []
        var sum = arraySum(data[hoveredEmotionBubbleIndex]['category'])
        for (var i = 0; i < data[hoveredEmotionBubbleIndex]['category'].length; i++) {
            if (data[hoveredEmotionBubbleIndex]['category'][i] == 0) continue
            var o = {}
            o['name'] = emotionCategories[i]
            o['size'] = data[hoveredEmotionBubbleIndex]['category'][i] / sum
            o['dominance'] = data[hoveredEmotionBubbleIndex]['dominance'][i]
            children.push(o)
        }
        root['children'] = children
        var pack = d3.pack()
            .size([emotionBubbleRadius2 * 2, emotionBubbleRadius2 * 2])
            .padding(1)
        root = d3.hierarchy(root)
            .sum(function (d) {
                return d.size
            })
            .sort(function (a, b) {
                return b.value - a.value
            })
        var nodes = pack(root).descendants()
        var k = emotionBubbleRadius2 * 2 / (root.r * 2)
        emotionBubbleHoveringLayer.selectAll('circle')
            .data(nodes)
            .enter()
            .append('circle')
            .attr('transform', function (d) {
                return 'translate(' + (d.x - root.x) * k + ', ' + (d.y - root.y) * k + ')'
            })
            .attr('r', function (d) {
                return d.r * k
            })
            .style('fill', function (d) {
                if (d.parent == null) return 'white'
                return emotionColors[emotionCategories.indexOf(d['data']['name'])]
            })
            .attr('stroke', 'black')
            .style('opacity', function (d) {
                if (d.parent == null) return 0.4
                else return 1
            })
        emotionBubbleHoveringLayer.selectAll('line')
            .data(nodes.slice(1, nodes.length))
            .enter()
            .append('line')
            .attr('transform', function (d) {
                return 'translate(' + (d.x - root.x) * k + ', ' + (d.y - root.y) * k + ')'
            })
            .attr('x1', function (d) {
                return -(d.r * k) * Math.cos(dominanceScaleBandGraph(d['data']['dominance']))
            })
            .attr('y1', function (d) {
                return (d.r * k) * Math.sin(dominanceScaleBandGraph(d['data']['dominance']))
            })
            .attr('x2', function (d) {
                return (d.r * k) * Math.cos(dominanceScaleBandGraph(d['data']['dominance']))
            })
            .attr('y2', function (d) {
                return -(d.r * k) * Math.sin(dominanceScaleBandGraph(d['data']['dominance']))
            })
            .attr('stroke', 'white')
            .attr('stroke-width', '1px')
            .style('marker-end', 'url(#arrow)')
        emotionBubbleHoveringLayer
            // .append('circle')
            // .attr('cx', 0)
            // .attr('cy', 0)
            // .attr('r', emotionBubbleRadius2)
            // .style('fill', 'white')
            // .style('opacity', 0.2)
            // .attr('stroke', 'black')
            .on('mouseleave', function () {
                d3.selectAll('.emotionBubbleHovering')
                    .remove()
                emotionTooltipDIV.style('display', 'none')
                hoveredEmotionBubbleIndex = -1
            })
            .on('click', function () {
                selectedClusterIndex = hoveredEmotionBubbleIndex
                d3.selectAll('.streamSelection').remove()
                bandGraphSVGLayer1.append('line')
                    .attr('class', 'streamSelection')
                    .attr('x1', xScaleBandGraph(data[selectedClusterIndex]['earlyTime']))
                    .attr('x2', xScaleBandGraph(data[selectedClusterIndex]['earlyTime']))
                    .attr('y1', 0)
                    .attr('y2', bandGraphInnerHeight)
                    .attr('stroke', 'red')
                    .attr('stroke-width', 2)
                overviewSVGLayer1.append('line')
                    .attr('class', 'streamSelection')
                    .attr('x1', xScaleOverview(data[selectedClusterIndex]['earlyTime']))
                    .attr('x2', xScaleOverview(data[selectedClusterIndex]['earlyTime']))
                    .attr('y1', 0)
                    .attr('y2', overviewInnerHeight)
                    .attr('stroke', 'red')
                    .attr('stroke-width', 2)
                selectedClusterTrigger = []
                data[selectedClusterIndex]['trigger'].forEach(function (d) {
                    selectedClusterTrigger.push(d[0])
                })
                onChangeRawTweets()
                onChangeScatterPlot()
            })
        bandGraphSVGLayer1.append('line')
            .attr('class', 'emotionBubbleHovering')
            .attr('x1', xScaleBandGraph(data[hoveredEmotionBubbleIndex]['earlyTime']))
            .attr('x2', xScaleBandGraph(data[hoveredEmotionBubbleIndex]['earlyTime']))
            .attr('y1', 0)
            .attr('y2', bandGraphInnerHeight)
            .attr('stroke', 'red')
            .attr('stroke-width', 1)
    }

    for (var i = 0; i < emotionCategoryByCluster.length; i++) {
        var dominance = emotionCategoryByCluster[i]['dominance']
        var emotionBubbleLayer = bandGraphSVGLayer3.append('g')
            .attr('transform', 'translate(' + xScaleBandGraph(emotionCategoryByCluster[i]['earlyTime']) + ', ' + valenceScaleBandGraph(emotionCategoryByCluster[i]['valence']) + ')')
            .attr('id', 'emotionBubbleLayer' + emotionCategoryByCluster[i]['index'])
            .attr('data-index', emotionCategoryByCluster[i]['index'])
        emotionBubbleLayer.append('circle')
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('r', emotionBubbleRadius1)
            .style('fill', '#A4AA99')
            .attr('stroke', 'black')
            .on('mouseover', mouseOverHandlerEmotionBubble)

        emotionBubbleLayer.append('line')
            .attr('x1', -Math.cos(dominanceScaleBandGraph(dominance)) * (emotionBubbleRadius1 - 1))
            .attr('y1', Math.sin(dominanceScaleBandGraph(dominance)) * (emotionBubbleRadius1 - 1))
            .attr('x2', Math.cos(dominanceScaleBandGraph(dominance)) * (emotionBubbleRadius1 - 1))
            .attr('y2', -Math.sin(dominanceScaleBandGraph(dominance)) * (emotionBubbleRadius1 - 1))
            .attr('stroke', 'white')
            .attr('stroke-width', '1px')
            .style('marker-end', 'url(#arrow)')
    }

    bandGraphSVGLayer2.append('g')
        .call(valenceAxisBandGraph)
    bandGraphSVGLayer2.append('text')
        .attr('x', 5)
        .attr('y', 8)
        .style('font-size', '10px')
        .text('Valence')
}
