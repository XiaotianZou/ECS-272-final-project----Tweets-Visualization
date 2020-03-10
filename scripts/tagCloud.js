var tagCloudMargin = { top: 5, bottom: 5, left: 5, right: 5 }
var tagCloudHeight = 300
var tagCloudWidth = 300
var tagCloudInnerHeight, tagCloudInnerWidth

var tagCloudSVG = null
var xScaleTagCloud = null

function initTagCloud() {
    tagCloudInnerHeight = tagCloudHeight - tagCloudMargin.top - tagCloudMargin.bottom
    tagCloudInnerWidth = tagCloudWidth - tagCloudMargin.left - tagCloudMargin.right
    d3.select('#tagCloudSVG').selectAll('*').remove()
    tagCloudSVG = d3.select('#tagCloudSVG')
        .attr('width', tagCloudWidth)
        .attr('height', tagCloudHeight)
        .append('g')
        .attr('transform', 'translate(' + tagCloudWidth / 2 + ', ' + tagCloudHeight / 2 + ')')


}

function onChangeTagCloud() {
    tagCloudSVG.selectAll('text').remove()
    var allText = data[hoveredClusterIndex].words.join()
    var wordCount = {}
    var words = allText.split(/[ ,.!?]+/)
    words.forEach(function (d) {
        if (isValidWordTagCloud(d)) {
            if (wordCount[d]) {
                wordCount[d] += 1
            } else {
                wordCount[d] = 1
            }
        }
    })
    wordCount = d3.entries(wordCount)
    // console.log(wordCount)
    xScaleTagCloud = d3.scaleLinear().range([10, 95])
        .domain(d3.extent(wordCount, function (d) { return d.value }))

    var layoutTagCloud = d3.layout.cloud()
        .size([tagCloudInnerWidth, tagCloudInnerHeight])
        .words(wordCount)
        .fontSize(function (d) {
            return xScaleTagCloud(d.value)
        })
        .rotate(0)
        .font('Serif')
        .on('end', drawTagCloud)
        .start()

    d3.layout.cloud().stop()
}

function drawTagCloud(words) {
    tagCloudSVG.selectAll('text')
        .data(words)
        .enter()
        .append('text')
        .style('font-size', function (d) {
            return xScaleTagCloud(d.value) + 'px'
        })
        .style('font-family', 'Serif')
        .attr('text-anchor', 'middle')
        .attr('transform', function (d) {
            // console.log('(' + d.x + ', ' + d.y + ')')
            return 'translate(' + d.x + ', ' + d.y + ')'
        })
        .text(function (d) {
            return d.key
        })
}

// Used to remove invalid words from the tag cloud
function isValidWordTagCloud(string) {
    if (string.length < 1) return false
    if (string.includes('#')) return false
    if (string.includes('@')) return false
    if (string.includes('http://')) return false
    if (string.includes('https://')) return false
    return true
}