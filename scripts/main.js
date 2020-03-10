var data = null
var allTweets = null

function getData() {
    init()
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            data = JSON.parse(this.responseText).data

            data.forEach(function (d) {
                for (var j = 0; j < d['time'].length; j++) {
                    d['time'][j] = new Date(d['time'][j])
                }
                d['earlyTime'] = d3.min(d['time'])
            })
            // console.log(data)
            data.sort(function (a, b) {
                return (a['earlyTime'] > b['earlyTime']) ? 1 : -1
            })
            allTweets = []
            data.forEach(function (d) {
                for (var j = 0; j < d['time'].length; j++) {
                    var o = {}
                    o['text'] = d['words'][j]
                    // var time = new Date(d['time'][j])
                    o['time'] = d['time'][j]
                    allTweets.push(o)
                }
            })

            onChangeBandGraph()
        }
    }
    xhttp.open('GET', 'http://127.0.0.1:8000/getinfo', true)
    // xhttp.setRequestHeader('Content-Type', 'application/json')
    xhttp.send()
}

function init() {
    initBandGraph()
    initTagCloud()
    initRawTweets()
    initScatterPlot()
}